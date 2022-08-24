import { ISubmittableResult } from '@polkadot/types/types';

import { Context, MultiSig, PolymeshError, PostTransactionValue, Procedure } from '~/internal';
import { CreateMultiSigParams, ErrorCode, TxTags } from '~/types';
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
): Promise<PostTransactionValue<MultiSig>> {
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

  const rawSignaturesRequired = bigNumberToU64(requiredSignatures, context);
  const rawSignatories = signers.map(signer => signerToSignatory(signer, context));

  const [multiSig] = this.addTransaction({
    transaction: tx.multiSig.createMultisig,
    resolvers: [createMultiSigResolver(context)],
    args: [rawSignatories, rawSignaturesRequired],
  });

  return multiSig;
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
