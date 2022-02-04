import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';

import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  Account,
  AuthorizationRequest,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { AddRelayerPayingKeyAuthorizationData, AuthorizationType, ErrorCode } from '~/types';
import { numberToBalance, signerToString, stringToAccountId } from '~/utils/conversion';

export interface SubsidizeAccountParams {
  /**
   * Account to subsidize
   */
  beneficiary: string | Account;
  /**
   * amount of POLYX to be subsidized. This can be increased/decreased later on
   */
  allowance: BigNumber;
}

/**
 * @hidden
 */
export async function prepareSubsidizeAccount(
  this: Procedure<SubsidizeAccountParams, AuthorizationRequest>,
  args: SubsidizeAccountParams
): Promise<PostTransactionValue<AuthorizationRequest>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { beneficiary, allowance } = args;

  let account: Account;

  if (beneficiary instanceof Account) {
    account = beneficiary;
  } else {
    account = new Account({ address: beneficiary }, context);
  }

  const { address: beneficiaryAddress } = account;

  const identity = await context.getCurrentIdentity();

  const authorizationRequests = await identity.authorizations.getSent();

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data: { type },
      data,
    } = authorizationRequest;

    return (
      signerToString(target) === beneficiaryAddress &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.AddRelayerPayingKey &&
      (data as AddRelayerPayingKeyAuthorizationData).value.allowance.isEqualTo(allowance)
    );
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The Beneficiary Account already has a pending invitation to add this account as a subsidizer with the same allowance',
    });
  }

  const rawBeneficiary = stringToAccountId(beneficiaryAddress, context);

  const rawAllowance = numberToBalance(allowance, context);

  const { account: subsidizer } = await identity.getPrimaryAccount();

  const authRequest: AddRelayerPayingKeyAuthorizationData = {
    type: AuthorizationType.AddRelayerPayingKey,
    value: {
      beneficiary: account,
      subsidizer,
      allowance,
    },
  };

  const [auth] = this.addTransaction({
    transaction: tx.relayer.setPayingKey,
    resolvers: [createAuthorizationResolver(authRequest, identity, account, null, context)],
    args: [rawBeneficiary, rawAllowance],
  });

  return auth;
}

/**
 * @hidden
 */
export const subsidizeAccount = (): Procedure<SubsidizeAccountParams, AuthorizationRequest> =>
  new Procedure(prepareSubsidizeAccount, {
    permissions: {
      transactions: [TxTags.relayer.SetPayingKey],
      tokens: [],
      portfolios: [],
    },
  });
