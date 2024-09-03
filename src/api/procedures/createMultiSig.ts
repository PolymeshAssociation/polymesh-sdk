import { ISubmittableResult } from '@polkadot/types/types';

import { Context, Identity, MultiSig, PolymeshError, Procedure } from '~/internal';
import { Account, CreateMultiSigParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  accountIdToString,
  bigNumberToU64,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  signerToSignatory,
  stringToAccountId,
} from '~/utils/conversion';
import { filterEventRecords, optionize } from '~/utils/internal';

export const createMultiSigResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): MultiSig => {
    const [{ data }] = filterEventRecords(receipt, 'multiSig', 'MultiSigCreated');
    const address = accountIdToString(data[1]);
    return new MultiSig({ address }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateMultiSigAccount(
  this: Procedure<CreateMultiSigParams, MultiSig>,
  args: CreateMultiSigParams
): Promise<TransactionSpec<MultiSig, ExtrinsicParams<'multiSig', 'createMultisig'>>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    context,
  } = this;
  if (isV6) {
    const { signers, requiredSignatures } = args;

    if (requiredSignatures.gt(signers.length)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The number of required signatures should not exceed the number of signers',
      });
    }

    const rawRequiredSignatures = bigNumberToU64(requiredSignatures, context);
    const rawSignatories = signers.map(signer => signerToSignatory(signer, context));

    return {
      transaction: tx.multiSig.createMultisig,
      resolver: createMultiSigResolver(context),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: [rawSignatories, rawRequiredSignatures] as any, // NOSONAR
    };
  } else {
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
        message: 'MultiSig signers must be accounts as of v7',
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

    return {
      transaction: tx.multiSig.createMultisig,
      resolver: createMultiSigResolver(context),
      args: [rawSignatories, rawRequiredSignatures, rawPermissions],
    };
  }
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
