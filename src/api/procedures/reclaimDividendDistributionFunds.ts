import { DividendDistribution, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
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
): Promise<TransactionSpec<void, ExtrinsicParams<'capitalDistribution', 'reclaim'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    distribution: { id: localId, asset, expiryDate },
    distribution,
  } = args;

  if (expiryDate && expiryDate >= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Distribution must be expired',
      data: {
        expiryDate,
      },
    });
  }

  const { fundsReclaimed } = await distribution.details();

  if (fundsReclaimed) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Distribution funds have already been reclaimed',
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId }, context);

  return {
    transaction: tx.capitalDistribution.reclaim,
    args: [rawCaId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void>,
  { distribution: { origin, asset } }: Params
): Promise<ProcedureAuthorization> {
  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId: portfolioToPortfolioId(origin) }],
    permissions: {
      transactions: [TxTags.capitalDistribution.Reclaim],
      assets: [asset],
      portfolios: [origin],
    },
  };
}

/**
 * @hidden
 */
export const reclaimDividendDistributionFunds = (): Procedure<Params, void> =>
  new Procedure(prepareReclaimDividendDistributionFunds, getAuthorization);
