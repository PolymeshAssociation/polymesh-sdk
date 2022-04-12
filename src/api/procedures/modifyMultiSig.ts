import { MultiSig } from '~/api/entities/MultiSig';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Signer, TxTags } from '~/types';
import { signerToSignatory, signerToString, stringToAccountId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface ModifyMultiSigParams {
  multiSig: MultiSig;
  signers: Signer[];
}

/**
 * @hidden
 */
function calculateSignerDelta(current: Signer[], target: Signer[]): [Signer[], Signer[]] {
  const currentSet = new Set(current.map(signerToString));
  const targetSet = new Set(target.map(signerToString));

  const newSigners = new Set([...target].filter(s => !currentSet.has(signerToString(s))));
  const removedSigners = new Set([...current].filter(s => !targetSet.has(signerToString(s))));

  return [Array.from(newSigners), Array.from(removedSigners)];
}

/**
 * @hidden
 */
export async function prepareModifyMultiSig(
  this: Procedure<ModifyMultiSigParams, void>,
  args: ModifyMultiSigParams
): Promise<void> {
  // adds or removes signers and can change number of signatures required.
  // Should also provide a "as owner flag" to allow for a user to "override" other signatures
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { signers, multiSig: multi } = args;

  // ensure calling account is creator, other actions require a proposal from the multisig
  const signingIdentity = await context.getSigningIdentity();
  const creator = await multi.getCreator();
  if (!creator.isEqual(signingIdentity)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A MultiSig can only be modified by its creator',
    });
  }

  const rawAddress = stringToAccountId(multi.address, context);
  const { signers: currentSigners, signaturesRequired } = await multi.details();

  if (signaturesRequired.gt(signers.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of signatures required should not exceed the number of signers',
    });
  }

  const [addedSigners, removedSigners] = calculateSignerDelta(currentSigners, signers);

  if (addedSigners.length === 0 && removedSigners.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The given signers are equal to the current signers',
    });
  }

  if (addedSigners) {
    const rawAddedSigners = addedSigners.map(s => signerToSignatory(s, context));
    console.log('adding signers', rawAddedSigners);
    this.addTransaction({
      transaction: tx.multiSig.addMultisigSignersViaCreator,
      args: [rawAddress, rawAddedSigners],
    });
  }

  if (removedSigners) {
    const rawRemovedSigners = removedSigners.map(s => signerToSignatory(s, context));
    console.log('removing signers', rawRemovedSigners);
    this.addTransaction({
      transaction: tx.multiSig.removeMultisigSignersViaCreator,
      args: [rawAddress, rawRemovedSigners],
    });
  }
}

/**
 * @hidden
 */
export const modifyMultiSigAccount = (): Procedure<ModifyMultiSigParams, void> =>
  new Procedure(prepareModifyMultiSig, {
    permissions: {
      transactions: [
        TxTags.multiSig.AddMultisigSignersViaCreator,
        TxTags.multiSig.RemoveMultisigSignersViaCreator,
      ],
    },
  });
