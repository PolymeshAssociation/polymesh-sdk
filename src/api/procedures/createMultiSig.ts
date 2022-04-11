import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Context, MultiSig, PolymeshError, PostTransactionValue, Procedure } from '~/internal';
import { ErrorCode, Signer, TxTags } from '~/types';
import { accountIdToString, bigNumberToU64, signerToSignatory } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export interface CreateMultiSigParams {
  signers: Signer[];
  signaturesRequired: BigNumber;
}

export const createMultiSigResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): MultiSig => {
    const [{ data }] = filterEventRecords(receipt, 'multiSig', 'MultiSigCreated');
    const multiAccount = data[1];
    const address = accountIdToString(multiAccount);
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
  const { signers, signaturesRequired } = args;

  if (signaturesRequired.gt(signers.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of signatures required should not exceed the number of signers',
    });
  }

  const rawSignaturesRequired = bigNumberToU64(signaturesRequired, context);
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
