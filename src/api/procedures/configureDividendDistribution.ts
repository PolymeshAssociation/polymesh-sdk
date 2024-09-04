import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { assertDistributionDatesValid } from '~/api/procedures/utils';
import {
  BaseAsset,
  Checkpoint,
  Context,
  DefaultPortfolio,
  DividendDistribution,
  FungibleAsset,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  ConfigureDividendDistributionParams,
  CorporateActionKind,
  ErrorCode,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  bigNumberToU64,
  corporateActionParamsToMeshCorporateActionArgs,
  dateToMoment,
  distributionToDividendDistributionParams,
  meshAssetToAssetId,
  meshCorporateActionToCorporateActionParams,
  portfolioToPortfolioId,
  u32ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, getCheckpointValue, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export const createDividendDistributionResolver =
  (context: Context) =>
  async (receipt: ISubmittableResult): Promise<DividendDistribution> => {
    const [{ data }] = filterEventRecords(receipt, 'capitalDistribution', 'Created');
    const [, caId, distribution] = data;
    const { localId } = caId;

    /* istanbul ignore next: this will be removed after dual version support for v6-v7 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assetId = context.isV6 ? (caId as any).ticker : caId.assetId; // NOSONAR

    const { corporateAction } = context.polymeshApi.query;

    const [corpAction, details] = await Promise.all([
      corporateAction.corporateActions(assetId, localId),
      corporateAction.details(caId),
    ]);

    return new DividendDistribution(
      {
        assetId: meshAssetToAssetId(assetId, context),
        id: u32ToBigNumber(localId),
        ...meshCorporateActionToCorporateActionParams(corpAction.unwrap(), details, context),
        ...distributionToDividendDistributionParams(distribution, context),
      },
      context
    );
  };

/**
 * @hidden
 */
export type Params = ConfigureDividendDistributionParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export interface Storage {
  portfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export async function prepareConfigureDividendDistribution(
  this: Procedure<Params, DividendDistribution, Storage>,
  args: Params
): Promise<
  TransactionSpec<
    DividendDistribution,
    ExtrinsicParams<'corporateAction', 'initiateCorporateActionAndDistribute'>
  >
> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
    storage: { portfolio },
  } = this;
  const {
    asset,
    originPortfolio = null,
    currency,
    perShare,
    maxAmount,
    paymentDate,
    expiryDate = null,
    checkpoint,
    targets = null,
    description,
    declarationDate = new Date(),
    defaultTaxWithholding = null,
    taxWithholdings = null,
  } = args;

  if (currency === asset.id) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot distribute Dividends using the Asset as currency',
    });
  }

  if (paymentDate <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Payment date must be in the future',
    });
  }

  if (expiryDate && expiryDate < paymentDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be after payment date',
    });
  }

  if (declarationDate > new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Declaration date must be in the past',
    });
  }

  const rawMaxDetailsLength = await query.corporateAction.maxDetailsLength();
  const maxDetailsLength = u32ToBigNumber(rawMaxDetailsLength);

  if (maxDetailsLength.lt(description.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Description too long',
      data: {
        maxLength: maxDetailsLength.toNumber(),
      },
    });
  }

  const checkpointValue = await getCheckpointValue(checkpoint, asset, context);

  if (!(checkpointValue instanceof Checkpoint)) {
    await assertDistributionDatesValid(checkpointValue, paymentDate, expiryDate);
  }

  if (portfolio instanceof NumberedPortfolio) {
    const exists = await portfolio.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The origin Portfolio doesn't exist",
      });
    }
  }

  const [{ free }] = await portfolio.getAssetBalances({ assets: [currency] });

  if (free.lt(maxAmount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: "The origin Portfolio's free balance is not enough to cover the Distribution amount",
      data: {
        free,
      },
    });
  }

  const rawPortfolioNumber =
    originPortfolio &&
    optionize(bigNumberToU64)(
      originPortfolio instanceof BigNumber ? originPortfolio : originPortfolio.id,
      context
    );
  const rawCurrency = assetToMeshAssetId(new BaseAsset({ assetId: currency }, context), context);

  const rawPerShare = bigNumberToBalance(perShare, context);
  const rawAmount = bigNumberToBalance(maxAmount, context);
  const rawPaymentAt = dateToMoment(paymentDate, context);
  const rawExpiresAt = optionize(dateToMoment)(expiryDate, context);

  return {
    transaction: tx.corporateAction.initiateCorporateActionAndDistribute,
    resolver: createDividendDistributionResolver(context),
    args: [
      corporateActionParamsToMeshCorporateActionArgs(
        {
          asset,
          kind: CorporateActionKind.UnpredictableBenefit,
          declarationDate,
          checkpoint: checkpointValue,
          description,
          targets,
          defaultTaxWithholding,
          taxWithholdings,
        },
        context
      ),
      rawPortfolioNumber,
      rawCurrency,
      rawPerShare,
      rawAmount,
      rawPaymentAt,
      rawExpiresAt,
    ],
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, DividendDistribution, Storage>,
  { asset }: Params
): ProcedureAuthorization {
  const {
    storage: { portfolio },
  } = this;

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(portfolio) }],
    permissions: {
      transactions: [TxTags.capitalDistribution.Distribute],
      assets: [asset],
      portfolios: [portfolio],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, DividendDistribution, Storage>,
  { originPortfolio }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  let portfolio = originPortfolio || new DefaultPortfolio({ did }, context);

  if (portfolio instanceof BigNumber) {
    portfolio = new NumberedPortfolio({ id: portfolio, did }, context);
  }

  return {
    portfolio,
  };
}

/**
 * @hidden
 */
export const configureDividendDistribution = (): Procedure<Params, DividendDistribution, Storage> =>
  new Procedure(prepareConfigureDividendDistribution, getAuthorization, prepareStorage);
