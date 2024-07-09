import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKeyPermissions } from '@polkadot/types/lookup';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, JoinCreatorParams, MultiSig, TxTags } from '~/types';
import {
  BatchTransactionSpec,
  ExtrinsicParams,
  ProcedureAuthorization,
  TransactionSpec,
} from '~/types/internal';
import {
  bigNumberToU64,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  stringToAccountId,
} from '~/utils/conversion';
import { assembleBatchTransactions, optionize } from '~/utils/internal';

export type Params = { multiSig: MultiSig } & JoinCreatorParams;

/**
 * @hidden
 */
export async function prepareJoinCreator(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'makeMultisigPrimary'>>
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'makeMultisigSecondary'>>
  | BatchTransactionSpec<void, unknown[][]>
> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { multiSig, asPrimary } = args;

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
