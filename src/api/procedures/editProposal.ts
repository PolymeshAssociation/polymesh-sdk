import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { accountIdToString, stringToText, u32ToBigNumber } from '~/utils';

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
  const { cool_off_until: coolOff } = metadata.unwrap();
  const { number: blockId } = header;

  if (!state.isPending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The proposal must be in pending state',
    });
  }

  if (u32ToBigNumber(blockId).gte(u32ToBigNumber(coolOff))) {
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

export const editProposal = new Procedure(prepareEditProposal, isAuthorized);
