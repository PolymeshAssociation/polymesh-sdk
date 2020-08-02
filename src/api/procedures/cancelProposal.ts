import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import { accountKeyToString, u32ToBigNumber } from '~/utils';

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
      polymeshApi: {
        tx,
        query: { pips },
        rpc,
      },
    },
  } = this;
  const { pipId } = args;

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
      message: 'The proposal can be canceled only during its cool off period',
    });
  }

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

  return accountKeyToString(proposer) === this.context.getCurrentPair().address;
}

export const cancelProposal = new Procedure(prepareCancelProposal, isAuthorized);
