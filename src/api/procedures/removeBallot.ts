import BigNumber from 'bignumber.js';

import { FungibleAsset, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { corporateActionIdentifierToCaId } from '~/utils/conversion';
import { assertBallotNotStarted, getCorporateBallotDetailsOrThrow } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = {
  asset: FungibleAsset;
  id: BigNumber;
};

/**
 * @hidden
 */
export async function prepareRemoveBallot(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateAction', 'removeCa'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { asset, id: localId } = args;

  const ballotDetails = await getCorporateBallotDetailsOrThrow(asset, localId, context);

  assertBallotNotStarted(ballotDetails);

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId }, context);

  return {
    transaction: tx.corporateAction.removeCa,
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
      transactions: [TxTags.corporateAction.RemoveCa],
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
