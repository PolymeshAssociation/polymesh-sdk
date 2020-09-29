import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';

import { Account, Identity } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import {
  identityIdToString,
  numberToBalance,
  signerToString,
  stringToAccountId,
  stringToMemo,
} from '~/utils';

export interface TransferPolyXParams {
  to: string | Account;
  amount: BigNumber;
  memo?: string;
}

/**
 * @hidden
 */
export async function prepareTransferPolyX(
  this: Procedure<TransferPolyXParams>,
  args: TransferPolyXParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        query: { identity },
        tx,
      },
    },
    context,
  } = this;

  const { to, amount, memo } = args;

  let identityId: IdentityId;

  const rawAccountId = stringToAccountId(signerToString(to), context);

  // TODO: queryMulti
  const [{ free: freeBalance }, identityIds] = await Promise.all([
    context.accountBalance(),
    identity.keyToIdentityIds(rawAccountId),
  ]);

  if (amount.isGreaterThan(freeBalance)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Insufficient free balance',
      data: {
        freeBalance,
      },
    });
  }

  try {
    identityId = identityIds.unwrap().asUnique;
  } catch (err) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The destination account doesn't have an asssociated Identity",
    });
  }

  const senderIdentity = await context.getCurrentIdentity();
  const receiverIdentity = new Identity({ did: identityIdToString(identityId) }, context);

  // TODO: queryMulti
  const [senderCdd, receiverCdd] = await Promise.all([
    senderIdentity.hasValidCdd(),
    receiverIdentity.hasValidCdd(),
  ]);

  if (!senderCdd) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The sender Identity has an invalid CDD claim',
    });
  }

  if (!receiverCdd) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The receiver Identity has an invalid CDD claim',
    });
  }

  const rawAmount = numberToBalance(amount, context);

  if (memo) {
    this.addTransaction(
      tx.balances.transferWithMemo,
      {},
      rawAccountId,
      rawAmount,
      stringToMemo(memo, context)
    );
  } else {
    this.addTransaction(tx.balances.transfer, {}, rawAccountId, rawAmount);
  }
}

/**
 * @hidden
 */
export const transferPolyX = new Procedure(prepareTransferPolyX);
