import { Identity, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags, UnlinkChildParams } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToIdentityId } from '~/utils/conversion';
import { asChildIdentity } from '~/utils/internal';

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
}

/**
 * @hidden
 */
export async function prepareUnlinkChildIdentity(
  this: Procedure<UnlinkChildParams, void, Storage>,
  args: UnlinkChildParams
): Promise<TransactionSpec<void, ExtrinsicParams<'identity', 'unlinkChildIdentity'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: {
      identity: { did: signingDid },
    },
  } = this;

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
    transaction: tx.identity.unlinkChildIdentity,
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
    context,
    storage: { identity },
  } = this;

  const signingAccount = context.getSigningAccount();

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!signingAccount.isEqual(primaryAccount)) {
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

  return {
    identity: await context.getSigningIdentity(),
  };
}

/**
 * @hidden
 */
export const unlinkChildIdentity = (): Procedure<UnlinkChildParams, void, Storage> =>
  new Procedure(prepareUnlinkChildIdentity, getAuthorization, prepareStorage);
