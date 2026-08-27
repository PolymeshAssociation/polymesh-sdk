import { assertDistributionOpen } from '~/api/procedures/utils';
import { DividendDistribution, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
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
): Promise<TransactionSpec<void, ExtrinsicParams<'capitalDistribution', 'claim'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const {
    distribution,
    distribution: { id: localId, asset, paymentDate, expiryDate },
  } = args;

  assertDistributionOpen(paymentDate, expiryDate);

  // `distribution` was fetched through (and carries) whatever Context it happened to be
  // constructed with, which is *not* necessarily this Procedure's own Context (`context` above,
  // scoped to this call's `signingAccount`). Since `getParticipant` defaults its `identity` by
  // reading the *signing* Identity off whichever Context it's given, calling it with no args here
  // would resolve against `distribution`'s Context instead of this one, silently checking the
  // wrong Identity's participation (and balance) whenever the two differ - e.g. any multi-account
  // consumer, such as the REST API, that fetches entities off a shared Context while overriding
  // `signingAccount` per call. Resolve the signing Identity from this Procedure's Context
  // explicitly and pass it through so the correct Identity is always the one checked.
  const signingIdentity = await context.getSigningIdentity();

  const participant = await distribution.getParticipant({ identity: signingIdentity });

  if (!participant) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Identity is not included in this Distribution',
    });
  }

  const { paid } = participant;

  if (paid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The signing Identity has already claimed dividends',
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId }, context);

  return {
    transaction: tx.capitalDistribution.claim,
    args: [rawCaId],
    resolver: undefined,
  };
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
