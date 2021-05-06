// NOTE uncomment in Governance v2 upgrade

// import BigNumber from 'bignumber.js';

// import { Proposal } from '~/internal';
// import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
// import { PolymeshError, Procedure } from '~/internal';
// import { ErrorCode } from '~/types';
// import { booleanToBool, numberToBalance, numberToPipId } from '~/utils';

// export type VoteOnProposalParams = {
//   vote: boolean;
//   bondAmount: BigNumber;
// };

// export type Params = { pipId: BigNumber } & VoteOnProposalParams;

// /**
//  * @hidden
//  */
// export async function prepareVoteOnProposal(
//   this: Procedure<Params, void>,
//   args: Params
// ): Promise<void> {
//   const {
//     context: {
//       polymeshApi: { tx },
//     },
//     context,
//   } = this;
//   const { pipId, vote, bondAmount } = args;

//   const proposal = new Proposal({ pipId }, context);

//   const [details, stage, hasVoted, { free: freeBalance }] = await Promise.all([
//     proposal.getDetails(),
//     proposal.getStage(),
//     proposal.identityHasVoted(),
//     context.accountBalance(),
//   ]);

//   const { lastState } = details;

//   if (lastState !== ProposalState.Pending) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must be in pending state',
//     });
//   }

//   if (stage === ProposalStage.CoolOff) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must not be in its cool-off period',
//     });
//   }

//   if (hasVoted) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The Identity has already voted on this proposal',
//     });
//   }

//   if (bondAmount.isGreaterThan(freeBalance)) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: "The Identity doesn't have enough balance",
//       data: {
//         freeBalance,
//       },
//     });
//   }

//   this.addTransaction(
//     tx.pips.vote,
//     {},
//     numberToPipId(pipId, context),
//     booleanToBool(vote, context),
//     numberToBalance(bondAmount, context)
//   );
// }

// export const voteOnProposal = (): Procedure => new Procedure(prepareVoteOnProposal);
