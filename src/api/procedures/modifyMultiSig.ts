import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, ModifyMultiSigParams, Signer, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { signerToSignatory, signerToString, stringToAccountId } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

export interface Storage {
  signersToAdd: Signer[];
  signersToRemove: Signer[];
  requiredSignatures: BigNumber;
}

/**
 * @hidden
 */
function calculateSignerDelta(
  current: Signer[],
  target: Signer[]
): Pick<Storage, 'signersToAdd' | 'signersToRemove'> {
  const currentSet = new Set(current.map(signerToString));
  const targetSet = new Set(target.map(signerToString));

  const newSigners = new Set([...target].filter(s => !currentSet.has(signerToString(s))));
  const removedSigners = new Set([...current].filter(s => !targetSet.has(signerToString(s))));

  return { signersToAdd: Array.from(newSigners), signersToRemove: Array.from(removedSigners) };
}

/**
 * @hidden
 */
export async function prepareModifyMultiSig(
  this: Procedure<ModifyMultiSigParams, void, Storage>,
  args: ModifyMultiSigParams
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
      isV6,
    },
    storage: { signersToAdd, signersToRemove, requiredSignatures },
    context,
  } = this;
  const { signers, multiSig } = args;

  const [signingIdentity, creator] = await Promise.all([
    context.getSigningIdentity(),
    multiSig.getCreator(),
  ]);

  if (!signersToAdd.length && !signersToRemove.length) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The given signers are equal to the current signers. At least one signer should be added or removed',
    });
  }
  if (!creator.isEqual(signingIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its creator',
    });
  }

  const rawAddress = stringToAccountId(multiSig.address, context);

  if (requiredSignatures.gt(signers.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
    });
  }

  const transactions = [];

  let addSignersTx = tx.multiSig.addMultisigSignersViaAdmin;
  let removeSignersTx = tx.multiSig.removeMultisigSignersViaAdmin;
  type ToSignerFn = ((signer: Account) => AccountId) | ((signer: Signer) => AccountId); // v6 really uses PolymeshPrimitivesSecondaryKeySignatory
  let toRawSignerTx: ToSignerFn = (signer: Account) => stringToAccountId(signer.address, context);

  if (isV6) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addSignersTx = (tx.multiSig as any).addMultisigSignersViaCreator; // NOSONAR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeSignersTx = (tx.multiSig as any).removeMultisigSignersViaCreator; // NOSONAR

    toRawSignerTx = (signer: Signer): AccountId =>
      signerToSignatory(signer, context) as unknown as AccountId;
  }

  if (signersToAdd.length > 0) {
    const rawAddedSigners = signersToAdd.map(signer => toRawSignerTx(signer as Account));
    transactions.push(
      checkTxType({
        transaction: addSignersTx,
        args: [rawAddress, rawAddedSigners],
      })
    );
  }

  if (signersToRemove.length > 0) {
    const rawRemovedSigners = signersToRemove.map(signer => toRawSignerTx(signer as Account));
    transactions.push(
      checkTxType({
        transaction: removeSignersTx,
        args: [rawAddress, rawRemovedSigners],
      })
    );
  }

  return {
    transactions,
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ModifyMultiSigParams, void, Storage>
): ProcedureAuthorization {
  const {
    storage: { signersToAdd, signersToRemove },
  } = this;
  const transactions = [];
  if (signersToAdd.length > 0) {
    transactions.push(TxTags.multiSig.AddMultisigSignersViaCreator);
  }

  if (signersToRemove.length > 0) {
    transactions.push(TxTags.multiSig.RemoveMultisigSignersViaCreator);
  }

  return {
    permissions: {
      transactions,
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<ModifyMultiSigParams, void, Storage>,
  { signers, multiSig }: ModifyMultiSigParams
): Promise<Storage> {
  const { signers: currentSigners, requiredSignatures } = await multiSig.details();
  return { ...calculateSignerDelta(currentSigners, signers), requiredSignatures };
}

/**
 * @hidden
 */
export const modifyMultiSig = (): Procedure<ModifyMultiSigParams, void, Storage> =>
  new Procedure(prepareModifyMultiSig, getAuthorization, prepareStorage);
