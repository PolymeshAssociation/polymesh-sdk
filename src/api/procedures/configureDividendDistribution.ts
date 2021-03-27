import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  DefaultPortfolio,
  DividendDistribution,
  initiateCorporateAction,
  InitiateCorporateActionParams,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { CorporateActionKind, ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  dateToMoment,
  distributionToDividendDistributionParams,
  meshCorporateActionToCorporateActionParams,
  numberToBalance,
  numberToU64,
  portfolioToPortfolioId,
  stringToTicker,
  tickerToString,
  u32ToBigNumber,
} from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

/**
 * @hidden
 */
export const createDividendDistributionResolver = (context: Context) => async (
  receipt: ISubmittableResult
): Promise<DividendDistribution> => {
  const { data } = findEventRecord(receipt, 'capitalDistribution', 'Created');
  const [, { ticker, local_id: localId }, distribution] = data;

  const corporateAction = await context.polymeshApi.query.corporateAction.corporateActions(
    ticker,
    localId
  );

  return new DividendDistribution(
    {
      ticker: tickerToString(ticker),
      id: u32ToBigNumber(localId),
      ...meshCorporateActionToCorporateActionParams(corporateAction.unwrap(), context),
      ...distributionToDividendDistributionParams(distribution, context),
    },
    context
  );
};

export type ConfigureDividendDistributionParams = Omit<
  InitiateCorporateActionParams,
  'kind' | 'checkpoint'
> & {
  checkpoint: Checkpoint | Date | CheckpointSchedule;
  originPortfolio?: NumberedPortfolio;
  currency: string;
  perShare: BigNumber;
  maxAmount: BigNumber;
  paymentDate: Date;
  expiryDate: null | Date;
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
      polymeshApi: { tx },
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
    expiryDate,
    checkpoint,
    ...corporateActionArgs
  } = args;

  if (currency === ticker) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Cannot distribute Dividends using the Security Token as currency',
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

  if (!(checkpoint instanceof Checkpoint)) {
    let checkpointDate;

    if (checkpoint instanceof Date) {
      checkpointDate = checkpoint;
    } else {
      ({ nextCheckpointDate: checkpointDate } = await checkpoint.details());
    }

    if (checkpointDate >= paymentDate) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Payment date must be after the Checkpoint date',
      });
    }
  }

  const [{ total, locked }] = await portfolio.getTokenBalances({ tokens: [currency] });
  const freeBalance = total.minus(locked);

  if (freeBalance.lt(maxAmount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Origin Portfolio free balance is not enough to cover the distribution amount',
      data: {
        freeBalance,
      },
    });
  }

  const caId = await this.addProcedure(initiateCorporateAction, {
    ticker,
    kind: CorporateActionKind.UnpredictableBenefit,
    checkpoint,
    ...corporateActionArgs,
  });

  const rawPortfolioNumber = originPortfolio && numberToU64(originPortfolio.id, context);
  const rawCurrency = stringToTicker(currency, context);
  const rawPerShare = numberToBalance(perShare, context);
  const rawAmount = numberToBalance(maxAmount, context);
  const rawPaymentAt = dateToMoment(paymentDate, context);
  const rawExpiresAt = expiryDate && dateToMoment(expiryDate, context);

  const [dividendDistribution] = this.addTransaction(
    tx.capitalDistribution.distribute,
    {
      resolvers: [createDividendDistributionResolver(context)],
    },
    caId,
    rawPortfolioNumber,
    rawCurrency,
    rawPerShare,
    rawAmount,
    rawPaymentAt,
    rawExpiresAt
  );

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
  } = this;

  return {
    identityRoles: [
      { type: RoleType.TokenCaa, ticker },
      { type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(portfolio) },
    ],
    signerPermissions: {
      transactions: [TxTags.capitalDistribution.Distribute],
      tokens: [],
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

  const { did } = await context.getCurrentIdentity();

  return {
    portfolio: originPortfolio || new DefaultPortfolio({ did }, context),
  };
}

/**
 * @hidden
 */
export const configureDividendDistribution = new Procedure(
  prepareConfigureDividendDistribution,
  getAuthorization,
  prepareStorage
);
