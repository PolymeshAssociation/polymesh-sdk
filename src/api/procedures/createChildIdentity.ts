import { ISubmittableResult } from '@polkadot/types/types';

import { ChildIdentity, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { Account, CreateChildIdentityParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  boolToBoolean,
  identityIdToString,
  stringToAccountId,
  stringToIdentityId,
} from '~/utils/conversion';
import { areSameAccounts, asAccount, filterEventRecords } from '~/utils/internal';

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
export const createChildIdentityResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ChildIdentity => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [record] = filterEventRecords(receipt, 'identity' as any, 'ChildDidCreated');

    const { data } = record!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const did = identityIdToString(data[1] as any);

    return new ChildIdentity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateChildIdentity(
  this: Procedure<CreateChildIdentityParams, ChildIdentity, Storage>,
  args: CreateChildIdentityParams
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<TransactionSpec<ChildIdentity, ExtrinsicParams<'identity', any>>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
    storage: {
      identity: { did: signingDid },
    },
  } = this;

  if (!context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'Child identities are no longer supported in v8',
    });
  }

  const { secondaryKey } = args;

  const childAccount = asAccount(secondaryKey, context);

  const rawIdentity = stringToIdentityId(signingDid, context);
  const rawChildAccount = stringToAccountId(childAccount.address, context);

  const childIdentity = new ChildIdentity({ did: signingDid }, context);

  const [isSecondaryKey, multiSig, parentDid] = await Promise.all([
    query.identity.didKeys(rawIdentity, rawChildAccount),
    childAccount.getMultiSig(),
    childIdentity.getParentDid(),
  ]);

  if (!boolToBoolean(isSecondaryKey)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The `secondaryKey` provided is not a secondary key of the signing Identity',
    });
  }

  if (multiSig) {
    const { total } = await multiSig.getBalance();

    if (total.gt(0)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: "The `secondaryKey` can't be unlinked from the signing Identity",
      });
    }
  }

  if (parentDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The signing Identity is already a child Identity and cannot create further child identities',
      data: {
        parentDid,
      },
    });
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: (tx.identity as any).createChildIdentity,
    args: [rawChildAccount],
    resolver: createChildIdentityResolver(context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<CreateChildIdentityParams, ChildIdentity, Storage>
): Promise<ProcedureAuthorization> {
  const {
    storage: { identity, actingAccount },
  } = this;

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!areSameAccounts(actingAccount, primaryAccount)) {
    return {
      signerPermissions: "A child Identity can only be created by an Identity's primary Account",
    };
  }

  return {
    permissions: {
      transactions: [TxTags.identity.CreateChildIdentity],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<CreateChildIdentityParams, ChildIdentity, Storage>
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
export const createChildIdentity = (): Procedure<
  CreateChildIdentityParams,
  ChildIdentity,
  Storage
> => new Procedure(prepareCreateChildIdentity, getAuthorization, prepareStorage);
