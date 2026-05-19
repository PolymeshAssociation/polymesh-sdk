import { ISubmittableResult } from '@polkadot/types/types';

import { ChildIdentity, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { Account, CreateChildIdentitiesParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  childKeysWithAuthToCreateChildIdentitiesWithAuth,
  dateToMoment,
  identityIdToString,
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
  (receipt: ISubmittableResult): ChildIdentity[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childDids = filterEventRecords(receipt, 'identity' as any, 'ChildDidCreated');

    return childDids.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ data }) => new ChildIdentity({ did: identityIdToString(data[1] as any) }, context) // NOSONAR
    );
  };

/**
 * @hidden
 */
export async function prepareCreateChildIdentities(
  this: Procedure<CreateChildIdentitiesParams, ChildIdentity[], Storage>, // NOSONAR
  args: CreateChildIdentitiesParams
): Promise<
  TransactionSpec<
    ChildIdentity[], // NOSONAR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExtrinsicParams<'identity', any>
  >
> {
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
      message: 'Child identities are no longer supported in chain v8',
    });
  }

  const { childKeyAuths, expiresAt } = args;

  if (expiresAt <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be in the future',
    });
  }

  const childIdentity = new ChildIdentity({ did: signingDid }, context);

  const [parentDid, ...identities] = await Promise.all([
    childIdentity.getParentDid(),
    ...childKeyAuths.map(({ key }) => asAccount(key, context).getIdentity()),
  ]);

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

  if (identities.some(identityValue => identityValue !== null)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One or more accounts are already linked to some Identity',
    });
  }

  const rawExpiry = dateToMoment(expiresAt, context);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: (tx.identity as any).createChildIdentities,
    args: [childKeysWithAuthToCreateChildIdentitiesWithAuth(childKeyAuths, context), rawExpiry],
    resolver: createChildIdentityResolver(context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<CreateChildIdentitiesParams, ChildIdentity[], Storage> // NOSONAR
): Promise<ProcedureAuthorization> {
  const {
    storage: { identity, actingAccount },
  } = this;

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!areSameAccounts(actingAccount, primaryAccount)) {
    return {
      signerPermissions: "Child Identities can only be created by an Identity's primary Account",
    };
  }

  return {
    permissions: {
      transactions: [TxTags.identity.CreateChildIdentities],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<CreateChildIdentitiesParams, ChildIdentity[], Storage> // NOSONAR
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
export const createChildIdentities = (): Procedure<
  CreateChildIdentitiesParams,
  ChildIdentity[], // NOSONAR
  Storage
> => new Procedure(prepareCreateChildIdentities, getAuthorization, prepareStorage);
