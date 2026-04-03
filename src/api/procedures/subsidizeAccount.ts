import { createAuthorizationResolver } from '~/api/procedures/utils';
import { AuthorizationRequest, PolymeshError, Procedure } from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  AuthorizationType,
  ErrorCode,
  SubsidizeAccountParams,
} from '~/types';
import { TransactionSpec } from '~/types/internal';
import { bigNumberToBalance, signerToString, stringToAccountId } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

export type Params = SubsidizeAccountParams & {
  isV7Method: boolean;
};

/**
 * @hidden
 */
export async function prepareSubsidizeAccount(
  this: Procedure<Params, AuthorizationRequest>,
  args: Params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<TransactionSpec<any, any>> {
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

  if (args.isV7Method) {
    if (context.isV7) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction: (tx.relayer as any).setPayingKey,
        resolver: createAuthorizationResolver(authRequest, identity, account, null, context),
        args: [rawBeneficiary, rawAllowance],
      };
    }

    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'This method is no longer supported for chain 8.x. Use approveSubsidy instead',
    });
  }

  if (context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'This method is not supported for chain 7.x. Use subsidizeAccount instead',
    });
  }

  // TODO check if a request is already present with same beneficiary in PendingSubsidies
  return {
    transaction: tx.relayer.approveSubsidy,
    args: [rawBeneficiary, rawAllowance],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const subsidizeAccount = (): Procedure<Params, any> =>
  new Procedure(prepareSubsidizeAccount, {
    signerPermissions: true,
  });
