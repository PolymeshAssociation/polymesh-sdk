import { find } from 'lodash';

import { Identity } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, SigningItem } from '~/types';

export interface RemoveSigningKeysParams {
  signingItems: SigningItem[];
}

/**
 * @hidden
 */
export async function prepareRemoveSigningItems(
  this: Procedure<RemoveSigningKeysParams>,
  args: RemoveSigningKeysParams
): Promise<void> {
  const { context } = this;
  const { signingItems } = args;

  const did = context.getCurrentIdentity().did;
  const identity = new Identity({ did }, context);
  const [masterKey, signingKeys] = await Promise.all([
    identity.getMasterKey(),
    // context.getMySigningKeys(),
  ]);

  const foundMasterKey = find(signingItems, ({ signer: { value } }) => value === masterKey);

  if (foundMasterKey) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'You cannot remove a master key',
    });
  }
}

/**
 * @hidden
 */
export async function isAuthorized(this: Procedure<RemoveSigningKeysParams>): Promise<boolean> {
  const { context } = this;

  const did = context.getCurrentIdentity().did;
  const identity = new Identity({ did }, context);
  const masterKey = await identity.getMasterKey();

  return masterKey === context.getCurrentPair().address;
}

export const removeSigningItems = new Procedure(prepareRemoveSigningItems, isAuthorized);
