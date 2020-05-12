import { BigNumber } from 'bignumber.js';

import { Identity, SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType, TransferStatus } from '~/types';
import { numberToBalance, stringToIdentityId, stringToTicker, valueToDid } from '~/utils';

export interface TransferTokenParams {
  to: string | Identity;
  amount: BigNumber;
}

export type Params = TransferTokenParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareTransferToken(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;

  const { ticker, to, amount } = args;

  const did = valueToDid(to);
  const value = numberToBalance(amount, context);
  const identityId = stringToIdentityId(did, context);
  const securityToken = new SecurityToken({ ticker }, context);

  const canTransfer = await securityToken.transfers.canTransfer({ to: did, amount });

  if (canTransfer !== TransferStatus.Success) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `You are not allowed to transfer ${amount.toFormat()} "${ticker}" tokens to "${did}".${
        canTransfer !== TransferStatus.Failure ? ` Possible reason: ${canTransfer}` : ''
      }`,
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  this.addTransaction(asset.transfer, {}, rawTicker, identityId, value);

  return securityToken;
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const transferToken = new Procedure(prepareTransferToken, getRequiredRoles);
