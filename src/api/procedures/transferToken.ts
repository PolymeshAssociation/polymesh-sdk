import { BigNumber } from 'bignumber.js';

import { Identity, SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType, TransferStatus } from '~/types';
import { numberToBalance, stringToIdentityId, stringToTicker, valueToDid } from '~/utils';

export interface TransferDataParams {
  to: string | Identity;
  amount: BigNumber;
}

export type Params = TransferDataParams & {
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
        query: { identity },
        tx: { asset },
      },
    },
    context,
  } = this;

  const { ticker, to, amount } = args;

  const did = valueToDid(to);
  const value = numberToBalance(amount, context);
  const currentIdentity = context.getCurrentIdentity();
  const identityId = stringToIdentityId(did, context);
  const securityToken = new SecurityToken({ ticker }, context);

  // TODO: queryMulti
  const [tokenBalance, size] = await Promise.all([
    currentIdentity.getTokenBalance(ticker),
    identity.didRecords.size(identityId),
  ]);

  if (tokenBalance.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient balance',
    });
  }

  if (size.isZero()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The destination account doesn't have an asssociated identity",
    });
  }

  const canTransfer = await securityToken.transfers.canTransfer({ to: did, amount });

  if (canTransfer !== TransferStatus.Success) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `You are not allowed to transfer ${amount.toFormat()} "${ticker}" tokens to "${did}". Possible reason: ${canTransfer}`,
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
