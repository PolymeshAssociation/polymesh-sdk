import { Identity, PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, TxTags, UnlinkChildParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToIdentityId } from '~/utils/conversion';
import { areSameAccounts, asChildIdentity } from '~/utils/internal';

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
export async function prepareUnlinkChildIdentity(
  this: Procedure<UnlinkChildParams, void, Storage>,
  args: UnlinkChildParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<TransactionSpec<void, ExtrinsicParams<'identity', any>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: {
      identity: { did: signingDid },
    },
  } = this;

  if (!context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'Child Identiteis are no longer supported in v8',
    });
  }

  const { child } = args;

  const childIdentity = asChildIdentity(child, context);

  const parentIdentity = await childIdentity.getParentDid();

  if (!parentIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "The `child` doesn't have a parent identity",
    });
  }

  const { did: parentDid } = parentIdentity;
  const { did: childDid } = childIdentity;

  if (![parentDid, childDid].includes(signingDid)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only the parent or the child identity is authorized to unlink a child identity',
    });
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: (tx.identity as any).unlinkChildIdentity,
    args: [stringToIdentityId(childDid, context)],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<UnlinkChildParams, void, Storage>
): Promise<ProcedureAuthorization> {
  const {
    storage: { identity, actingAccount },
  } = this;

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!areSameAccounts(actingAccount, primaryAccount)) {
    return {
      signerPermissions:
        'Child identity can only be unlinked by primary key of either the child Identity or parent Identity',
    };
  }

  return {
    permissions: {
      transactions: [TxTags.identity.UnlinkChildIdentity],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<UnlinkChildParams, void, Storage>
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
export const unlinkChildIdentity = (): Procedure<UnlinkChildParams, void, Storage> =>
  new Procedure(prepareUnlinkChildIdentity, getAuthorization, prepareStorage);
