import { Account } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationType, ErrorCode } from '~/types';
import { SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToString,
  signerValueToSignatory,
} from '~/utils';

export interface InviteAccountParams {
  targetAccount: string | Account;
  expiry?: Date;
}

/**
 * @hidden
 */
export async function prepareInviteAccount(
  this: Procedure<InviteAccountParams, void>,
  args: InviteAccountParams
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
      },
    },
    context,
  } = this;

  const { targetAccount, expiry } = args;

  const address = signerToString(targetAccount);

  const currentIdentity = await context.getCurrentIdentity();

  const [authorizationRequests, secondaryKeys] = await Promise.all([
    currentIdentity.authorizations.getSent(),
    context.getSecondaryKeys(),
  ]);

  const isPresent = !!secondaryKeys.find(({ signer }) => signerToString(signer) === address);

  if (isPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account is already a secondary key for this Identity',
    });
  }

  const hasPendingAuth = !!authorizationRequests.data.find(authorizationRequest => {
    const {
      target,
      data: { type },
    } = authorizationRequest;
    return (
      signerToString(target) === address &&
      !authorizationRequest.isExpired() &&
      type === AuthorizationType.JoinIdentity
    );
  });

  if (hasPendingAuth) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The target Account already has a pending invitation to join this Identity',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Account, value: address },
    context
  );

  const rawAuthorizationData = authorizationToAuthorizationData(
    { type: AuthorizationType.JoinIdentity, value: [] },
    context
  );
  const rawExpiry = expiry ? dateToMoment(expiry, context) : null;

  this.addTransaction(identity.addAuthorization, {}, rawSignatory, rawAuthorizationData, rawExpiry);
}

/**
 * @hidden
 */
export const inviteAccount = new Procedure(prepareInviteAccount);
