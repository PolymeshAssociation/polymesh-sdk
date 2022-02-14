import { assertDistributionOpen } from '~/api/procedures/utils';
import { DividendDistribution, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  distribution: DividendDistribution;
}

/**
 * @hidden
 */
export async function prepareClaimDividends(
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
    distribution,
    distribution: {
      id: localId,
      asset: { ticker },
      paymentDate,
      expiryDate,
    },
  } = args;

  assertDistributionOpen(paymentDate, expiryDate);

  const participant = await distribution.getParticipant();

  if (!participant) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The current signing Identity is not included in this Distribution',
    });
  }

  const { paid } = participant;

  if (paid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The current signing Identity has already claimed dividends',
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  this.addTransaction({
    transaction: tx.capitalDistribution.claim,
    args: [rawCaId],
  });
}

/**
 * @hidden
 */
export const claimDividends = (): Procedure<Params, void> =>
  new Procedure(prepareClaimDividends, {
    permissions: {
      transactions: [TxTags.capitalDistribution.Claim],
      assets: [],
      portfolios: [],
    },
  });
