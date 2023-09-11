import { ISubmittableResult } from '@polkadot/types/types';

import { ChildIdentity, Context, Identity, PolymeshError, Procedure } from '~/internal';
import { CreateChildIdentityParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  boolToBoolean,
  identityIdToString,
  stringToAccountId,
  stringToIdentityId,
} from '~/utils/conversion';
import { asAccount, filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
}

/**
 * @hidden
 */
export const createChildIdentityResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ChildIdentity => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'ChildDidCreated');
    const did = identityIdToString(data[1]);

    return new ChildIdentity({ did }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateChildIdentity(
  this: Procedure<CreateChildIdentityParams, ChildIdentity, Storage>,
  args: CreateChildIdentityParams
): Promise<TransactionSpec<ChildIdentity, ExtrinsicParams<'identity', 'createChildIdentity'>>> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
    storage: {
      identity: { did: signingDid },
    },
  } = this;

  const { secondaryKey } = args;

  const childAccount = asAccount(secondaryKey, context);

  const rawIdentity = stringToIdentityId(signingDid, context);
  const rawChildAccount = stringToAccountId(childAccount.address, context);
  const isSecondaryKey = await query.identity.didKeys(rawIdentity, rawChildAccount);

  if (!boolToBoolean(isSecondaryKey)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The `secondaryKey` provided is not a secondary key of the signing Identity',
    });
  }

  const multisig = await childAccount.getMultiSig();

  if (multisig) {
    const { total } = await multisig.getBalance();

    if (total.gt(0)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: "The `secondaryKey` can't be unlinked from the signing Identity",
      });
    }
  }

  const childIdentity = new ChildIdentity({ did: signingDid }, context);

  const parentDid = await childIdentity.getParentDid();

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
    transaction: tx.identity.createChildIdentity,
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
    context,
    storage: { identity },
  } = this;

  const signingAccount = context.getSigningAccount();

  const { account: primaryAccount } = await identity.getPrimaryAccount();

  if (!signingAccount.isEqual(primaryAccount)) {
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

  return {
    identity: await context.getSigningIdentity(),
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
