import { TxTag, TxTags } from 'polymesh-types/types';

import { PolymeshError } from '~/base/PolymeshError';
import { Account, AuthorizationRequest, Procedure } from '~/internal';
import { ErrorCode, Role } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  numberToU64,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
} from '~/utils/conversion';
import { getDid } from '~/utils/internal';

/**
 * @hidden
 */
export type ConsumeAddMultisigSignerAuthorizationParams = {
  authRequest: AuthorizationRequest;
  accept: boolean;
};

/**
 * @hidden
 */
export async function prepareConsumeAddMultisigSignerAuthorization(
  this: Procedure<ConsumeAddMultisigSignerAuthorizationParams>,
  args: ConsumeAddMultisigSignerAuthorizationParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { multiSig, identity },
      },
    },
    context,
  } = this;
  const { authRequest, accept } = args;

  const { target, authId, expiry } = authRequest;

  if (authRequest.isExpired()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Authorization Request has expired',
      data: {
        expiry,
      },
    });
  }

  let transaction;

  const rawAuthId = numberToU64(authId, context);

  if (!accept) {
    this.addTransaction(
      identity.removeAuthorization,
      {},
      signerValueToSignatory(signerToSignerValue(target), context),
      rawAuthId,
      booleanToBool(false, context)
    );

    return;
  }

  if (target instanceof Account) {
    transaction = multiSig.acceptMultisigSignerAsKey;
  } else {
    transaction = multiSig.acceptMultisigSignerAsIdentity;
  }

  this.addTransaction(transaction, {}, rawAuthId);
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ConsumeAddMultisigSignerAuthorizationParams>,
  { authRequest, accept }: ConsumeAddMultisigSignerAuthorizationParams
): Promise<ProcedureAuthorization> {
  const { target, issuer } = authRequest;
  const { context } = this;

  let condition;
  let did: string | undefined;
  const fetchDid = async (): Promise<string> => getDid(did, context);

  let transactions: TxTag[];

  let roles: Role[] | boolean;

  if (target instanceof Account) {
    const { address } = context.getCurrentAccount();
    condition = address === target.address;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsKey];
  } else {
    did = await fetchDid();
    condition = did === target.did;
    transactions = [TxTags.multiSig.AcceptMultisigSignerAsIdentity];
  }

  if (!accept) {
    transactions = [TxTags.identity.RemoveAuthorization];
    try {
      did = await fetchDid();
    } catch (err) {
      // do nothing
    }
    condition = condition || did === issuer.did;
  }

  if (bypassSignerPermissions) {
    return {
      roles,
    };
  }

  return {
    roles,
    permissions: { transactions, tokens: [], portfolios: [] },
  };
}

/**
 * @hidden
 */
export const consumeAddMultisigSignerAuthorization = (): Procedure<ConsumeAddMultisigSignerAuthorizationParams> =>
  new Procedure(prepareConsumeAddMultisigSignerAuthorization, getAuthorization);
