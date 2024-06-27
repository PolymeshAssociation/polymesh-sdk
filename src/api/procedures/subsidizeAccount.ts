import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, PolymeshError, Procedure } from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  AuthorizationType,
  ErrorCode,
  SubsidizeAccountParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { bigNumberToBalance, signerToString, stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareSubsidizeAccount(
  this: Procedure<SubsidizeAccountParams, AuthorizationRequest>,
  args: SubsidizeAccountParams
): Promise<TransactionSpec<AuthorizationRequest, ExtrinsicParams<'relayer', 'setPayingKey'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { beneficiary, allowance } = args;

  const account = asAccount(beneficiary, context);

  const { address: beneficiaryAddress } = account;

  const [identity, subsidizer] = await Promise.all([
    context.getSigningIdentity(),
    context.getActingAccount(),
  ]);

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
      subsidizer,
      allowance,
    },
  };

  return {
    transaction: tx.relayer.setPayingKey,
    resolver: createAuthorizationResolver(authRequest, identity, account, null, context),
    args: [rawBeneficiary, rawAllowance],
  };
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
