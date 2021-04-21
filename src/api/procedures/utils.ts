// import BigNumber from 'bignumber.js';

import { Context, Instruction, NumberedPortfolio, PolymeshError } from '~/internal';
import {
  ErrorCode,
  InputTargets,
  InputTaxWithholding,
  InstructionStatus,
  InstructionType,
  SecondaryKey,
} from '~/types';
import { PortfolioId, SignerValue } from '~/types/internal';
import { signerToSignerValue, u64ToBigNumber } from '~/utils/conversion';

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
  const { status } = await instruction.details();

  if (status !== InstructionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instruction must be in pending state',
    });
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
export async function assertPortfolioExists(
  portfolioId: PortfolioId,
  context: Context
): Promise<void> {
  const { did, number } = portfolioId;

  if (number) {
    const numberedPortfolio = new NumberedPortfolio({ did, id: number }, context);
    const exists = await numberedPortfolio.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Portfolio doesn't exist",
        data: {
          did,
          portfolioId: number,
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

/**
 * @hidden
 */
export function assertDistributionOpen(paymentDate: Date, expiryDate: Date | null): void {
  const now = new Date();

  if (paymentDate > now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Distribution's payment date hasn't been reached",
      data: { paymentDate },
    });
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertCaTargetsValid(targets: InputTargets, context: Context): void {
  const { maxTargetIds } = context.polymeshApi.consts.corporateAction;

  const maxTargets = u64ToBigNumber(maxTargetIds);

  if (maxTargets.lt(targets.identities.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many target Identities',
      data: {
        maxTargets,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertCaTaxWithholdingsValid(
  taxWithholdings: InputTaxWithholding[],
  context: Context
): void {
  const { maxDidWhts } = context.polymeshApi.consts.corporateAction;

  const maxWithholdingEntries = u64ToBigNumber(maxDidWhts);

  if (maxWithholdingEntries.lt(taxWithholdings.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many tax withholding emties',
      data: {
        maxWithholdingEntries,
      },
    });
  }
}
