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
  beneficiaryAccount: string | Account;
  /**
   * Initial POLYX limit for this subsidy
   */
  polyxLimit: BigNumber;
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

  const { beneficiaryAccount, polyxLimit } = args;

  const identity = await context.getCurrentIdentity();

  let account: Account;

  if (beneficiaryAccount instanceof Account) {
    account = beneficiaryAccount;
  } else {
    account = new Account({ address: beneficiaryAccount }, context);
  }

  const [authorizationRequests, beneficiaryIdentity] = await Promise.all([
    identity.authorizations.getSent(),
    account.getIdentity(),
  ]);

  if (!beneficiaryIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have an Identity',
    });
  }

  const { address: beneficiaryAddress } = account;

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(target) === beneficiaryAddress &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.AddRelayerPayingKey
    );
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The Beneficiary Account already has a pending invitation to add this account as a subsidizer',
    });
  }

  const rawBeneficiaryAccount = stringToAccountId(beneficiaryAddress, context);

  const rawPolyxLimit = numberToBalance(polyxLimit, context);

  const authRequest: AddRelayerPayingKeyAuthorizationData = {
    type: AuthorizationType.AddRelayerPayingKey,
    value: {
      beneficiary: account,
      subsidizer: await identity.getPrimaryAccount(),
      allowance: polyxLimit,
    },
  };

  const [auth] = this.addTransaction({
    transaction: tx.relayer.setPayingKey,
    resolvers: [createAuthorizationResolver(authRequest, identity, account, null, context)],
    args: [rawBeneficiaryAccount, rawPolyxLimit],
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
