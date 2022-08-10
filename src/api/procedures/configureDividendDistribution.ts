import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { assertDistributionDatesValid } from '~/api/procedures/utils';
import {
  Asset,
  Checkpoint,
  Context,
  DefaultPortfolio,
  DividendDistribution,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import {
  ConfigureDividendDistributionParams,
  CorporateActionKind,
  ErrorCode,
  RoleType,
  TxTags,
} from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  bigNumberToBalance,
  bigNumberToU64,
  corporateActionParamsToMeshCorporateActionArgs,
  dateToMoment,
  distributionToDividendDistributionParams,
  meshCorporateActionToCorporateActionParams,
  portfolioToPortfolioId,
  stringToTicker,
  tickerToString,
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
    const { ticker, localId } = caId;

    const { corporateAction } = context.polymeshApi.query;

    const [corpAction, details] = await Promise.all([
      corporateAction.corporateActions(ticker, localId),
      corporateAction.details(caId),
    ]);

    return new DividendDistribution(
      {
        ticker: tickerToString(ticker),
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
  ticker: string;
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
): Promise<PostTransactionValue<DividendDistribution>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
    storage: { portfolio },
  } = this;
  const {
    ticker,
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

  if (currency === ticker) {
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

  const checkpointValue = await getCheckpointValue(checkpoint, ticker, context);

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
  const rawCurrency = stringToTicker(currency, context);
  const rawPerShare = bigNumberToBalance(perShare, context);
  const rawAmount = bigNumberToBalance(maxAmount, context);
  const rawPaymentAt = dateToMoment(paymentDate, context);
  const rawExpiresAt = optionize(dateToMoment)(expiryDate, context);

  const [dividendDistribution] = this.addTransaction({
    transaction: tx.corporateAction.initiateCorporateActionAndDistribute,
    resolvers: [createDividendDistributionResolver(context)],
    args: [
      corporateActionParamsToMeshCorporateActionArgs(
        {
          ticker,
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
  });

  return dividendDistribution;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, DividendDistribution, Storage>,
  { ticker }: Params
): ProcedureAuthorization {
  const {
    storage: { portfolio },
    context,
  } = this;

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(portfolio) }],
    permissions: {
      transactions: [TxTags.capitalDistribution.Distribute],
      assets: [new Asset({ ticker }, context)],
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
