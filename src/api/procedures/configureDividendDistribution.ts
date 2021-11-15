import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { assertDistributionDatesValid } from '~/api/procedures/utils';
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
  SecurityToken,
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
import { filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export const createDividendDistributionResolver = (context: Context) => async (
  receipt: ISubmittableResult
): Promise<DividendDistribution> => {
  const [{ data }] = filterEventRecords(receipt, 'capitalDistribution', 'Created');
  const [, caId, distribution] = data;
  const { ticker, local_id: localId } = caId;

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

export type ConfigureDividendDistributionParams = Omit<
  InitiateCorporateActionParams,
  'kind' | 'checkpoint'
> & {
  /**
   * checkpoint to be used to calculate Dividends. If a Schedule is passed, the next Checkpoint it creates will be used.
   *   If a Date is passed, a Checkpoint will be created at that date and used
   */
  checkpoint: Checkpoint | Date | CheckpointSchedule;
  /**
   * portfolio from which the Dividends will be distributed. Optional, defaults to the Corporate Actions Agent's Default Portfolio
   */
  originPortfolio?: NumberedPortfolio | BigNumber;
  /**
   * ticker of the currency in which Dividends will be distributed
   */
  currency: string;
  /**
   * amount of `currency` to distribute per each share of the Security Token that a target holds
   */
  perShare: BigNumber;
  /**
   * maximum amount of `currency` to distribute in total
   */
  maxAmount: BigNumber;
  /**
   * date from which Tokenholders can claim their Dividends
   */
  paymentDate: Date;
  /**
   * Optional, defaults to never expiring
   */
  expiryDate?: Date;
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
    expiryDate = null,
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
    await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
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

  const [{ free }] = await portfolio.getTokenBalances({ tokens: [currency] });

  if (free.lt(maxAmount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: "The origin Portfolio's free balance is not enough to cover the Distribution amount",
      data: {
        free,
      },
    });
  }

  const caId = await this.addProcedure(initiateCorporateAction(), {
    ticker,
    kind: CorporateActionKind.UnpredictableBenefit,
    checkpoint,
    ...corporateActionArgs,
  });

  const rawPortfolioNumber =
    originPortfolio &&
    optionize(numberToU64)(
      originPortfolio instanceof BigNumber ? originPortfolio : originPortfolio.id,
      context
    );
  const rawCurrency = stringToTicker(currency, context);
  const rawPerShare = numberToBalance(perShare, context);
  const rawAmount = numberToBalance(maxAmount, context);
  const rawPaymentAt = dateToMoment(paymentDate, context);
  const rawExpiresAt = optionize(dateToMoment)(expiryDate, context);

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
    context,
  } = this;

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(portfolio) }],
    permissions: {
      transactions: [TxTags.capitalDistribution.Distribute],
      tokens: [new SecurityToken({ ticker }, context)],
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
