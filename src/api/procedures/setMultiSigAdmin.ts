import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MultiSig, SetMultiSigAdminParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { stringToAccountId, stringToIdentityId } from '~/utils/conversion';
import { asIdentity } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { multiSig: MultiSig } & SetMultiSigAdminParams;

/**
 * @hidden
 */
export async function prepareSetMultiSigAdmin(
  this: Procedure<Params>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'addAdmin'>>
  | TransactionSpec<void, ExtrinsicParams<'multiSig', 'removeAdminViaAdmin'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { admin, multiSig } = args;
  if (admin) {
    const identity = asIdentity(admin, context);
    const [currentAdmin, { signers }] = await Promise.all([
      multiSig.getAdmin(),
      multiSig.details(),
    ]);

    if (currentAdmin && identity.isEqual(currentAdmin)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The identity is already the admin of the MultiSig',
        data: { multiSig: multiSig.address, admin: currentAdmin.did },
      });
    }

    const signingAccount = context.getSigningAccount();

    if (!signers.some(signer => signer.isEqual(signingAccount))) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The signing account is not part of the MultiSig',
        data: { signingAccount: signingAccount.address, multiSig: multiSig.address },
      });
    }

    const rawAdminDid = stringToIdentityId(identity.did, context);

    return {
      transaction: tx.multiSig.addAdmin,
      args: [rawAdminDid],
      resolver: undefined,
    };
  } else {
    const [currentAdmin, signingIdentity] = await Promise.all([
      multiSig.getAdmin(),
      context.getSigningIdentity(),
    ]);

    if (!currentAdmin) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The multiSig does not have an admin set currently',
        data: { multiSig: multiSig.address },
      });
    }

    if (!signingIdentity.isEqual(currentAdmin)) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: "Only the current admin's identity can remove themselves",
        data: {
          multiSig: multiSig.address,
          currentAdmin: currentAdmin.did,
          signingIdentity: signingIdentity.did,
        },
      });
    }

    const rawMultiSigAddress = stringToAccountId(multiSig.address, context);
    return {
      transaction: tx.multiSig.removeAdminViaAdmin,
      args: [rawMultiSigAddress],
      resolver: undefined,
    };
  }
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params>, args: Params): ProcedureAuthorization {
  const transactions = [];
  if (args.admin) {
    transactions.push(TxTags.multiSig.AddAdmin);
  } else {
    transactions.push(TxTags.multiSig.RemoveAdminViaAdmin);
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
export const setMultiSigAdmin = (): Procedure<Params> =>
  new Procedure(prepareSetMultiSigAdmin, getAuthorization);
