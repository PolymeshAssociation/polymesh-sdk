import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RemoveCorporateBallotParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';
import { assertBallotNotStarted, getCorporateBallotDetails } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RemoveCorporateBallotParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export async function prepareRemoveBallot(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateBallot', 'removeBallot'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { asset, ballot } = args;

  const ballotId = BigNumber.isBigNumber(ballot) ? ballot : ballot.id;

  const ballotDetails = await getCorporateBallotDetails(asset, ballotId, context);

  if (!ballotDetails) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The CorporateBallot does not exist',
      data: { id: ballotId },
    });
  }

  await assertBallotNotStarted(ballotDetails);

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId: ballotId }, context);

  return {
    transaction: tx.corporateBallot.removeBallot,
    args: [rawCaId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateBallot.RemoveBallot],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeBallot = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveBallot, getAuthorization);
