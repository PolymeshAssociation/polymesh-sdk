// NOTE uncomment in Governance v2 upgrade

// import BigNumber from 'bignumber.js';

// import { Procedure } from '~/base';
// import { accountIdToString, numberToPipId } from '~/utils';

// import { assertProposalUnlocked } from './utils';

// /**
//  * @hidden
//  */
// export type Params = { pipId: BigNumber };

// /**
//  * @hidden
//  */
// export async function prepareCancelProposal(
//   this: Procedure<Params, void>,
//   args: Params
// ): Promise<void> {
//   const {
//     context: {
//       polymeshApi: { tx },
//     },
//     context,
//   } = this;
//   const { pipId } = args;

//   await assertProposalUnlocked(pipId, context);

//   this.addTransaction(tx.pips.cancelProposal, {}, numberToPipId(pipId, context));
// }

// /**
//  * @hidden
//  */
// export async function isAuthorized(this: Procedure<Params>, { pipId }: Params): Promise<boolean> {
//   const {
//     context,
//     context: {
//       polymeshApi: {
//         query: { pips },
//       },
//     },
//   } = this;

//   const metadata = await pips.proposalMetadata(numberToPipId(pipId, context));
//   const { proposer } = metadata.unwrap();

//   return accountIdToString(proposer) === this.context.getCurrentPair().address;
// }

// /**
//  * @hidden
//  */
// export const cancelProposal = new Procedure(prepareCancelProposal, isAuthorized);
