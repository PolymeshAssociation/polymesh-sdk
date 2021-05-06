import { DividendDistribution, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { corporateActionIdentifierToCaId, portfolioToPortfolioId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  distribution: DividendDistribution;
}

/**
 * @hidden
 */
export async function prepareReclaimDividendDistributionFunds(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    distribution: { id: localId, ticker, expiryDate },
    distribution,
  } = args;

  if (expiryDate && expiryDate >= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution must be expired',
      data: {
        expiryDate,
      },
    });
  }

  const { fundsReclaimed } = await distribution.details();

  if (fundsReclaimed) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Distribution funds have already been reclaimed',
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  this.addTransaction(tx.capitalDistribution.reclaim, {}, rawCaId);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void>,
  { distribution: { origin, ticker } }: Params
): Promise<ProcedureAuthorization> {
  const { context } = this;

  return {
    identityRoles: [
      { type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(origin) },
    ],
    signerPermissions: {
      transactions: [TxTags.capitalDistribution.Reclaim],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [origin],
    },
  };
}

/**
 * @hidden
 */
export const reclaimDividendDistributionFunds = (): Procedure<Params, void> =>
  new Procedure(prepareReclaimDividendDistributionFunds, getAuthorization);
