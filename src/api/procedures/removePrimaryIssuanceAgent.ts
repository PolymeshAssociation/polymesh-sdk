// TODO @shuffledex

// import { Procedure, SecurityToken } from '~/internal';
// import { RoleType, TxTags } from '~/types';
// import { ProcedureAuthorization } from '~/types/internal';
// import { stringToTicker } from '~/utils/conversion';

// /**
//  * @hidden
//  */
// export type Params = {
//   ticker: string;
// };

// /**
//  * @hidden
//  */
// export async function prepareRemovePrimaryIssuanceAgent(
//   this: Procedure<Params, void>,
//   args: Params
// ): Promise<void> {
//   const {
//     context: {
//       polymeshApi: {
//         tx: { asset },
//       },
//     },
//     context,
//   } = this;

//   const { ticker } = args;

//   const rawTicker = stringToTicker(ticker, context);

//   this.addTransaction(asset.removePrimaryIssuanceAgent, {}, rawTicker);
// }

// /**
//  * @hidden
//  */
// export function getAuthorization(
//   this: Procedure<Params>,
//   { ticker }: Params
// ): ProcedureAuthorization {
//   return {
//     identityRoles: [{ type: RoleType.TokenOwner, ticker }],
//     signerPermissions: {
//       transactions: [TxTags.asset.RemovePrimaryIssuanceAgent],
//       tokens: [new SecurityToken({ ticker }, this.context)],
//       portfolios: [],
//     },
//   };
// }

// /**
//  * @hidden
//  */
// export const removePrimaryIssuanceAgent = (): Procedure<Params, void> =>
//   new Procedure(prepareRemovePrimaryIssuanceAgent, getAuthorization);
