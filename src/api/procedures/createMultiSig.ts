import { ISubmittableResult } from '@polkadot/types/types';

import { Context, Identity, MultiSig, PolymeshError, Procedure } from '~/internal';
import { Account, CreateMultiSigParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  accountIdToString,
  bigNumberToU64,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  stringToAccountId,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

export const createMultiSigResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): MultiSig => {
    const [record] = filterEventRecords(receipt, 'multiSig', 'MultiSigCreated');

    const address = accountIdToString(record!.data[1]);
    return new MultiSig({ address }, context);
  };

/**
 * @hidden
 */
export function prepareCreateMultiSigAccount(
  this: Procedure<CreateMultiSigParams, MultiSig>,
  args: CreateMultiSigParams
): Promise<TransactionSpec<MultiSig, ExtrinsicParams<'multiSig', 'createMultisig'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { signers, requiredSignatures, permissions } = args;

  if (requiredSignatures.gt(signers.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
    });
  }

  const identitySigners = signers.filter(signer => signer instanceof Identity);
  if (identitySigners.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'MultiSig signers must be accounts',
      data: { identitySigners },
    });
  }

  const rawRequiredSignatures = bigNumberToU64(requiredSignatures, context);
  const rawSignatories = signers.map(signer =>
    stringToAccountId((signer as Account).address, context)
  );

  const parsedPermissions = permissions
    ? permissionsLikeToPermissions(permissions, context)
    : undefined;
  const rawPermissions = optionize(permissionsToMeshPermissions)(parsedPermissions, context);

  return Promise.resolve({
    transaction: tx.multiSig.createMultisig,
    resolver: createMultiSigResolver(context),
    args: [rawSignatories, rawRequiredSignatures, rawPermissions],
  });
}

/**
 * @hidden
 */
export const createMultiSigAccount = (): Procedure<CreateMultiSigParams, MultiSig> =>
  new Procedure(prepareCreateMultiSigAccount, {
    permissions: {
      transactions: [TxTags.multiSig.CreateMultisig],
    },
  });
