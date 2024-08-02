import {
  ApiTypes,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  SubmittableModuleExtrinsics,
} from '@polkadot/api/types';
import { AccountId, Call, Extrinsic } from '@polkadot/types/interfaces';
import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import { PolymeshPrimitivesSecondaryKeyPermissions } from '@polkadot/types/lookup';
import type { Option, u64 } from '@polkadot/types-codec';
import type { AnyNumber } from '@polkadot/types-codec/types';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, JoinCreatorParams, MultiSig, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU64,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  stringToAccountId,
} from '~/utils/conversion';
import { assembleBatchTransactions, optionize } from '~/utils/internal';

export type Params = { multiSig: MultiSig } & JoinCreatorParams;

interface AugmentedSubmittables<ApiType extends ApiTypes> {
  multisig: {
    /**
     * Adds a multisig as the primary key.
     *
     * # Arguments
     * * `multisig` - multisig address
     * * `optionalCddAuthId` - optional authentication ID
     **/
    makeMultisigPrimary: AugmentedSubmittable<
      (
        multisig: AccountId32 | string | Uint8Array,
        optionalCddAuthId: Option<u64> | null | Uint8Array | u64 | AnyNumber
      ) => SubmittableExtrinsic<ApiType>,
      [AccountId32, Option<u64>]
    >;

    /**
     * Adds a multisig as a secondary key of current DID if the current DID is the creator of the multisig.
     *
     * # Arguments
     * * `multisig` - multisig address
     **/
    makeMultisigSecondary: AugmentedSubmittable<
      (multisig: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
      [AccountId32]
    >;
  };
}

export type MakeMultisigPrimaryExtrinsicParams = [
  multisig: AccountId32 | string | Uint8Array,
  optionalCddAuthId: Option<u64> | null | Uint8Array | u64 | AnyNumber
];

export type MakeMultisigSecondaryExtrinsicParams = [multisig: AccountId32 | string | Uint8Array];

export interface LocalSubmittableExtrinsics<ApiType extends ApiTypes>
  extends AugmentedSubmittables<ApiType> {
  (extrinsic: Call | Extrinsic | Uint8Array | string): SubmittableExtrinsic<ApiType>;
  [key: string]: SubmittableModuleExtrinsics<ApiType>;
}

/**
 * @hidden
 */
export async function prepareJoinCreator(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  | TransactionSpec<void, MakeMultisigPrimaryExtrinsicParams>
  | TransactionSpec<void, MakeMultisigSecondaryExtrinsicParams>
  | BatchTransactionSpec<void, unknown[][]>
> {
  const {
    context,
    context: { polymeshApi },
  } = this;
  const { multiSig, asPrimary } = args;
  const tx = polymeshApi.tx as unknown as LocalSubmittableExtrinsics<ApiTypes>;

  const [signingIdentity, creator] = await Promise.all([
    context.getSigningIdentity(),
    multiSig.getCreator(),
  ]);

  if (!creator.isEqual(signingIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'A MultiSig can only be join its creator. Instead `accountManagement.inviteAccount` can be used, and the resulting auth accepted',
      data: { creatorDid: creator.did, signingDid: signingIdentity.did },
    });
  }

  const rawMultiSigId = stringToAccountId(multiSig.address, context);

  if (asPrimary) {
    const rawCddAuthIdOpt = optionize(bigNumberToU64)(args.cddAuthId, context);
    return {
      transaction: tx.multiSig.makeMultisigPrimary,
      args: [rawMultiSigId, rawCddAuthIdOpt],
      resolver: undefined,
    };
  }

  const { permissions } = args;

  if (!permissions) {
    return {
      transaction: tx.multiSig.makeMultisigSecondary,
      args: [rawMultiSigId],
      resolver: undefined,
    };
  }

  const parsedPermissions = permissionsLikeToPermissions(permissions, context);
  const rawPermissions = permissionsToMeshPermissions(parsedPermissions, context);

  const makeSecondaryArgs: [AccountId] = [rawMultiSigId];
  const permissionsArgs: [AccountId, PolymeshPrimitivesSecondaryKeyPermissions] = [
    rawMultiSigId,
    rawPermissions,
  ];

  const makeTx = {
    transaction: tx.multiSig.makeMultisigSecondary,
    argsArray: [makeSecondaryArgs],
  };

  const permissionTx = {
    transaction: tx.identity.setSecondaryKeyPermissions,
    argsArray: [permissionsArgs],
  };

  const transactions = assembleBatchTransactions([makeTx, permissionTx] as const);

  return {
    transactions,
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  args: Params
): ProcedureAuthorization {
  const { asPrimary } = args;
  const {
    context: { isV6 },
  } = this;

  if (!isV6) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: asPrimary
        ? 'This method is deprecated. Use `identities.rotatePrimaryKey` instead.'
        : 'This method is deprecated. MultiSig automatically is attached as secondary key to the creators identity.',
    });
  }

  const transactions = [];
  if (asPrimary) {
    transactions.push(TxTags.multiSig.MakeMultisigPrimary);
  } else {
    transactions.push(TxTags.multiSig.MakeMultisigSecondary);
    if (args.permissions) {
      transactions.push(TxTags.identity.SetPermissionToSigner);
    }
  }

  return {
    permissions: {
      transactions,
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const joinCreator = (): Procedure<Params, void> =>
  new Procedure(prepareJoinCreator, getAuthorization);
