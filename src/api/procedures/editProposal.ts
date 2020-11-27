// NOTE uncomment in Governance v2 upgrade

// import BigNumber from 'bignumber.js';

// import { assertProposalUnlocked } from '~/api/procedures/utils';
// import { PolymeshError, Procedure } from '~/internal';
// import { ErrorCode } from '~/types';
// import { accountIdToString, numberToPipId, stringToText } from '~/utils';

// export type EditProposalParams =
//   | {
//       description?: string;
//       discussionUrl: string;
//     }
//   | {
//       description: string;
//       discussionUrl?: string;
//     };

// /**
//  * @hidden
//  */
// export type Params = { pipId: BigNumber } & EditProposalParams;

// /**
//  * @hidden
//  */
// export async function prepareEditProposal(
//   this: Procedure<Params, void>,
//   args: Params
// ): Promise<void> {
//   const {
//     context: {
//       polymeshApi: { tx },
//     },
//     context,
//   } = this;
//   const { pipId, description, discussionUrl } = args;

//   if (description === undefined && discussionUrl === undefined) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'Nothing to modify',
//     });
//   }

//   await assertProposalUnlocked(pipId, context);

//   this.addTransaction(
//     tx.pips.amendProposal,
//     {},
//     numberToPipId(pipId, context),
//     discussionUrl ? stringToText(discussionUrl, context) : null,
//     description ? stringToText(description, context) : null
//   );
// }

// /**
//  * @hidden
//  */
// export async function isAuthorized(this: Procedure<Params>, { pipId }: Params): Promise<boolean> {
//   const {
//     context: {
//       polymeshApi: {
//         query: { pips },
//       },
//     },
//     context,
//   } = this;

//   const metadata = await pips.proposalMetadata(numberToPipId(pipId, context));
//   const { proposer } = metadata.unwrap();

//   return accountIdToString(proposer) === context.getCurrentPair().address;
// }

// /**
//  * @hidden
//  */
// export const editProposal = new Procedure(prepareEditProposal, isAuthorized);
