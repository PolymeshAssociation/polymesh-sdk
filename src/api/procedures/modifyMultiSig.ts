import { AccountId } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { Account, ErrorCode, ModifyMultiSigParams, Signer, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { bigNumberToU64, signerToString, stringToAccountId } from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

export interface Storage {
  signersToAdd: Account[];
  signersToRemove: Account[];
  currentSignerCount: number;
  requiredSignatures: BigNumber;
}

/**
 * @hidden
 */
function calculateSignerDelta(
  current: Account[],
  target?: Account[]
): Pick<Storage, 'signersToAdd' | 'signersToRemove'> {
  if (!target) {
    return { signersToAdd: [], signersToRemove: [] };
  }

  const currentSet = new Set(current.map(signerToString));
  const targetSet = new Set(target.map(signerToString));

  const newSigners = new Set([...target].filter(s => !currentSet.has(signerToString(s))));
  const removedSigners = new Set([...current].filter(s => !targetSet.has(signerToString(s))));

  return { signersToAdd: Array.from(newSigners), signersToRemove: Array.from(removedSigners) };
}

/**
 * @hidden
 */
export function assertRequiredSignersExceedsSigners(
  currentSignerCount: number,
  requiredSignatures: BigNumber,
  inputSigners?: Signer[],
  newRequiredSignatures?: BigNumber
): void {
  if (
    (inputSigners && requiredSignatures.gt(inputSigners.length) && !newRequiredSignatures) ||
    (inputSigners && newRequiredSignatures?.gt(inputSigners.length))
  ) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of signers should not be less than the number of required signatures',
    });
  } else if (newRequiredSignatures?.gt(currentSignerCount)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
    });
  }
}

/**
 * @hidden
 */
export function assertNoDataChange(
  requiredSignatures: BigNumber,
  signersToAdd: Signer[],
  signersToRemove: Signer[],
  inputSigners?: Signer[],
  newRequiredSignatures?: BigNumber
): void {
  if (inputSigners && !signersToAdd.length && !signersToRemove.length) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The given signers are equal to the current signers. At least one signer should be added or removed',
    });
  }

  if (newRequiredSignatures && requiredSignatures.eq(newRequiredSignatures)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        'The given required signatures are equal to the current required signatures. The number of required signatures should be different',
    });
  }
}

/**
 * @hidden
 */
export function assertValidRequiredSignatures(newRequiredSignatures?: BigNumber): void {
  if (newRequiredSignatures?.lt(1)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should be at least 1',
    });
  }
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
    },
    storage: { signersToAdd, signersToRemove, requiredSignatures, currentSignerCount },
    context,
  } = this;
  const { signers, multiSig, requiredSignatures: newRequiredSignatures } = args;

  const [signingIdentity, admin] = await Promise.all([
    context.getSigningIdentity(),
    multiSig.getAdmin(),
  ]);

  if (!admin?.isEqual(signingIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its admin',
    });
  }

  const rawAddress = stringToAccountId(multiSig.address, context);

  assertValidRequiredSignatures(newRequiredSignatures);
  assertNoDataChange(
    requiredSignatures,
    signersToAdd,
    signersToRemove,
    signers,
    newRequiredSignatures
  );
  assertRequiredSignersExceedsSigners(
    currentSignerCount,
    requiredSignatures,
    signers,
    newRequiredSignatures
  );

  const transactions = [];

  const toRawSignerTx = (signer: Account): AccountId => stringToAccountId(signer.address, context);

  if (newRequiredSignatures) {
    const rawSignersRequired = bigNumberToU64(newRequiredSignatures, context);

    transactions.push(
      checkTxType({
        transaction: tx.multiSig.changeSigsRequiredViaAdmin,
        args: [rawAddress, rawSignersRequired],
      })
    );
  }

  if (signersToAdd.length > 0) {
    const rawAddedSigners = signersToAdd.map(signer => toRawSignerTx(signer));
    transactions.push(
      checkTxType({
        transaction: tx.multiSig.addMultisigSignersViaAdmin,
        args: [rawAddress, rawAddedSigners],
      })
    );
  }

  if (signersToRemove.length > 0) {
    const rawRemovedSigners = signersToRemove.map(signer => toRawSignerTx(signer));
    transactions.push(
      checkTxType({
        transaction: tx.multiSig.removeMultisigSignersViaAdmin,
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
  this: Procedure<ModifyMultiSigParams, void, Storage>,
  { requiredSignatures: newRequiredSignatures }: Pick<ModifyMultiSigParams, 'requiredSignatures'>
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

  if (newRequiredSignatures) {
    transactions.push(TxTags.multiSig.ChangeSigsRequiredViaCreator);
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
  return {
    ...calculateSignerDelta(currentSigners, signers),
    requiredSignatures,
    currentSignerCount: currentSigners.length,
  };
}

/**
 * @hidden
 */
export const modifyMultiSig = (): Procedure<ModifyMultiSigParams, void, Storage> =>
  new Procedure(prepareModifyMultiSig, getAuthorization, prepareStorage);
