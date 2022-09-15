import { ISubmittableResult } from '@polkadot/types/types';

import { Context, MultiSig, PolymeshError, Procedure } from '~/internal';
import { CreateMultiSigParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { accountIdToString, bigNumberToU64, signerToSignatory } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

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
    },
    context,
  } = this;
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
    args: [rawSignatories, rawRequiredSignatures],
  };
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
