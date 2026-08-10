import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Identity, MultiSig } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToAccountId } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = { multiSig: MultiSig };

export interface Storage {
  currentPayer: Identity | null;
  isMultiSigSigner: boolean;
  signingIdentity: Identity;
}

/**
 * @hidden
 */
export function prepareRemoveMultiSigPayer(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'removePayer'>>
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'removePayerViaPayer'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { currentPayer, signingIdentity, isMultiSigSigner },
    context,
  } = this;

  const { multiSig } = args;

  if (!currentPayer) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The multiSig does not have a payer set',
      data: { multiSig: multiSig.address },
    });
  }

  const signingAccount = context.getSigningAccount();

  if (isMultiSigSigner) {
    return Promise.resolve({
      transaction: tx.multiSig.removePayer,
      args: undefined,
      resolver: undefined,
    });
  } else if (currentPayer.isEqual(signingIdentity)) {
    const rawMultiSigAddress = stringToAccountId(multiSig.address, context);

    return Promise.resolve({
      transaction: tx.multiSig.removePayerViaPayer,
      args: [rawMultiSigAddress],
      resolver: undefined,
    });
  } else {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The signing account is not part of the MultiSig nor the payer's identity",
      data: { multiSig: multiSig.address, signingAccount: signingAccount.address },
    });
  }
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<Storage> {
  const { context } = this;
  const { multiSig } = args;

  const [currentPayer, { signers }, signingIdentity, signingAccount] = await Promise.all([
    multiSig.getPayer(),
    multiSig.details(),
    context.getSigningIdentity(),
    context.getSigningAccount(),
  ]);

  const isMultiSigSigner = signers.some(signer => signer.isEqual(signingAccount));

  return {
    currentPayer,
    signingIdentity,
    isMultiSigSigner,
  };
}

/**
 * @hidden
 */
export const removeMultiSigPayer = (): Procedure<Params, void, Storage> =>
  new Procedure(
    prepareRemoveMultiSigPayer,
    {
      permissions: {
        // `multiSig.remove_payer` is gated by `ensure_signed` (with the MultiSig account as the
        // origin) and `multiSig.remove_payer_via_payer` by `ensure_ms_payer`; neither consults
        // `ExtrinsicPermissions`, so no permission grant can satisfy these tags and declaring them
        // would only make pre-flight stricter than the chain.
        transactions: [],
      },
    },
    prepareStorage
  );
