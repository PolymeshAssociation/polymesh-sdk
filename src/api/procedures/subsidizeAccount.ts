import { createAuthorizationResolver } from '~/api/procedures/utils';
import {
  Account,
  AuthorizationRequest,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  AuthorizationType,
  ErrorCode,
  SubsidizeAccountParams,
  TxTags,
} from '~/types';
import { bigNumberToBalance, signerToString, stringToAccountId } from '~/utils/conversion';

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

  const identity = await context.getSigningIdentity();

  const authorizationRequests = await identity.authorizations.getSent();

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const { target, data } = authorizationRequest;

    return (
      signerToString(target) === beneficiaryAddress &&
      !authorizationRequest.isExpired() &&
      data.type === AuthorizationType.AddRelayerPayingKey &&
      data.value.allowance.isEqualTo(allowance)
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

  const rawAllowance = bigNumberToBalance(allowance, context);

  const authRequest: AddRelayerPayingKeyAuthorizationData = {
    type: AuthorizationType.AddRelayerPayingKey,
    value: {
      beneficiary: account,
      subsidizer: context.getSigningAccount(),
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
      assets: [],
      portfolios: [],
    },
  });
