import { Account } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { AuthorizationType, ErrorCode } from '~/types';
import { SignerType } from '~/types/internal';
import {
  authorizationToAuthorizationData,
  dateToMoment,
  signerToSignerValue,
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

  const signerValue = signerToString(targetAccount);

  const currentIdentity = await context.getCurrentIdentity();

  const [authorizationRequests, secondaryKeys] = await Promise.all([
    currentIdentity.authorizations.getSent(),
    context.getSecondaryKeys(),
  ]);

  const isPresent = secondaryKeys
    .map(({ signer }) => signerToSignerValue(signer))
    .find(({ value }) => value === signerValue);

  if (isPresent) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot add an account that is already present in your secondary keys list',
    });
  }

  const isPending = authorizationRequests.data
    .map(authorizationRequest => {
      return {
        signer: signerToSignerValue(authorizationRequest.target),
        isExpired: authorizationRequest.isExpired(),
      };
    })
    .find(({ signer, isExpired }) => {
      return signer.value === signerValue && !isExpired;
    });

  if (isPending) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The account invited already has a pending authorization to accept',
    });
  }

  const rawSignatory = signerValueToSignatory(
    { type: SignerType.Account, value: signerValue },
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
