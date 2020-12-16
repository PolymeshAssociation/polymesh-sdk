// import BigNumber from 'bignumber.js';

import { Context, Instruction, PolymeshError } from '~/internal';
import { ErrorCode, InstructionStatus, InstructionType, SecondaryKey } from '~/types';
import { SignerValue } from '~/types/internal';
import { signerToSignerValue } from '~/utils/conversion';

// import { Proposal } from '~/internal';
// import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
// import { Context, PolymeshError } from '~/internal';
// import { ErrorCode } from '~/types';

// /**
//  * @hidden
//  */
// export async function assertProposalUnlocked(pipId: BigNumber, context: Context): Promise<void> {
//   const proposal = new Proposal({ pipId }, context);

//   const [details, stage] = await Promise.all([proposal.getDetails(), proposal.getStage()]);

//   const { lastState } = details;

//   if (lastState !== ProposalState.Pending) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must be in pending state',
//     });
//   }

//   if (stage !== ProposalStage.CoolOff) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must be in its cool-off period',
//     });
//   }
// }

/**
 * @hidden
 */
export async function assertInstructionValid(
  instruction: Instruction,
  context: Context
): Promise<void> {
  const details = await instruction.details();
  const { status, validFrom } = await instruction.details();

  if (status !== InstructionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instruction must be in pending state',
    });
  }

  if (validFrom) {
    const now = new Date();

    if (now < validFrom) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The instruction has not reached its validity period',
        data: {
          validFrom,
        },
      });
    }
  }

  if (details.type === InstructionType.SettleOnBlock) {
    const latestBlock = await context.getLatestBlock();
    const { endBlock } = details;

    if (latestBlock >= endBlock) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The instruction cannot be modified; it has already reached its end block',
        data: {
          currentBlock: latestBlock,
          endBlock,
        },
      });
    }
  }
}

/**
 * @hidden
 */
export function assertSecondaryKeys(
  signerValues: SignerValue[],
  secondaryKeys: SecondaryKey[]
): void {
  const notInTheList: string[] = [];
  signerValues.forEach(({ value: itemValue }) => {
    const isPresent = secondaryKeys
      .map(({ signer }) => signerToSignerValue(signer))
      .find(({ value }) => value === itemValue);
    if (!isPresent) {
      notInTheList.push(itemValue);
    }
  });

  if (notInTheList.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'One of the Signers is not a Secondary Key for the Identity',
      data: {
        missing: notInTheList,
      },
    });
  }
}
