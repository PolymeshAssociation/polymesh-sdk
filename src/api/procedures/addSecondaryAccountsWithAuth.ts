import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { Account, AddSecondaryAccountsParams, ErrorCode, Identity, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { dateToMoment, secondaryAccountWithAuthToSecondaryKeyWithAuth } from '~/utils/conversion';
import { asAccount } from '~/utils/internal';

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
  actingAccount: Account;
}

/**
 * @hidden
 */
export async function prepareAddSecondaryKeysWithAuth(
  this: Procedure<AddSecondaryAccountsParams, Identity, Storage>,
  args: AddSecondaryAccountsParams
): Promise<
  TransactionSpec<Identity, ExtrinsicParams<'identity', 'addSecondaryKeysWithAuthorization'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { identity },
  } = this;

  const { accounts, expiresAt } = args;

  if (expiresAt <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be in the future',
    });
  }

  const identities = await Promise.all(
    accounts.map(({ secondaryAccount: { account } }) => asAccount(account, context).getIdentity())
  );

  if (identities.some(identityValue => identityValue !== null)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One or more accounts are already linked to some Identity',
    });
  }

  const rawExpiry = dateToMoment(expiresAt, context);

  return {
    transaction: tx.identity.addSecondaryKeysWithAuthorization,
    feeMultiplier: new BigNumber(accounts.length),
    args: [secondaryAccountWithAuthToSecondaryKeyWithAuth(accounts, context), rawExpiry],
    resolver: identity,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<AddSecondaryAccountsParams, Identity, Storage>
): Promise<ProcedureAuthorization> {
  const {
    storage: { identity, actingAccount },
  } = this;

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!actingAccount.isEqual(primaryAccount)) {
    return {
      signerPermissions: 'Secondary accounts can only be added by primary key of an Identity',
    };
  }

  return {
    permissions: {
      // TODO: on chain just checks if is signed by primary key -> so we should check in prepareAddSecondaryKeysWithAuth if signer is the target primary key
      transactions: [TxTags.identity.AddSecondaryKeysWithAuthorization],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<AddSecondaryAccountsParams, Identity, Storage>
): Promise<Storage> {
  const { context } = this;

  const [identity, actingAccount] = await Promise.all([
    context.getSigningIdentity(),
    context.getActingAccount(),
  ]);

  return {
    identity,
    actingAccount,
  };
}

/**
 * @hidden
 */
export const addSecondaryAccounts = (): Procedure<AddSecondaryAccountsParams, Identity, Storage> =>
  new Procedure(prepareAddSecondaryKeysWithAuth, getAuthorization, prepareStorage);
