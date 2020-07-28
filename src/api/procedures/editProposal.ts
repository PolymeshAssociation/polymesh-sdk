import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role } from '~/types';
import { accountKeyToString, stringToText, u32ToBigNumber } from '~/utils';

export type EditProposalParams =
  | {
      description?: string;
      discussionUrl: string;
    }
  | {
      description: string;
      discussionUrl?: string;
    };

export type Params = { pipId: number } & EditProposalParams;

/**
 * @hidden
 */
export async function prepareEditProposal(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { pips },
        rpc,
      },
    },
    context,
  } = this;
  const { pipId, description, discussionUrl } = args;

  if (description === undefined && discussionUrl === undefined) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Nothing to modify',
    });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [pip, metadata, header] = await Promise.all([
    pips.proposals(pipId),
    pips.proposalMetadata(pipId),
    (rpc as any).chain.getHeader(),
  ]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const { state } = pip.unwrap();
  const { proposer, cool_off_until: coolOff } = metadata.unwrap();
  const { number: blockId } = header;

  if (accountKeyToString(proposer) !== context.getAccounts()[0].address) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only the owner of the proposal can edit it',
    });
  }

  if (!state.isPending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in pending state',
    });
  }

  if (u32ToBigNumber(blockId).gt(u32ToBigNumber(coolOff))) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal is mutable only during its cool off period',
    });
  }

  this.addTransaction(
    tx.pips.amendProposal,
    {},
    pipId,
    discussionUrl ? stringToText(discussionUrl, context) : null,
    description ? stringToText(description, context) : null
  );
}

/**
 * @hidden
 */
export function getRequiredRoles(): Role[] {
  return [];
}

export const editProposal = new Procedure(prepareEditProposal, getRequiredRoles);
