import { Procedure } from '~/base';
import { accountIdToString } from '~/utils';

import { assertProposalUnlocked } from './utils';

export type Params = { pipId: number };

/**
 * @hidden
 */
export async function prepareCancelProposal(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { pipId } = args;

  await assertProposalUnlocked(pipId, context);

  this.addTransaction(tx.pips.cancelProposal, {}, pipId);
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<Params>, { pipId }: Params): Promise<boolean> {
  const {
    context: {
      polymeshApi: {
        query: { pips },
      },
    },
  } = this;

  const metadata = await pips.proposalMetadata(pipId);
  const { proposer } = metadata.unwrap();

  return accountIdToString(proposer) === this.context.getCurrentPair().address;
}

export const cancelProposal = new Procedure(prepareCancelProposal, isAuthorized);
