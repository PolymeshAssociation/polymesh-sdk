import { PolymeshError, Procedure } from '~/internal';
import {
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialAccount,
  ErrorCode,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU16 } from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareApplyIncomingConfidentialAssetBalance(
  this: Procedure<ApplyIncomingConfidentialAssetBalancesParams, ConfidentialAccount>,
  args: ApplyIncomingConfidentialAssetBalancesParams
): Promise<
  TransactionSpec<
    ConfidentialAccount,
    ExtrinsicParams<'confidentialAsset', 'applyIncomingBalances'>
  >
> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  const { maxUpdates, confidentialAccount: accountInput } = args;

  const account = asConfidentialAccount(accountInput, context);
  const rawMaxUpdates = bigNumberToU16(maxUpdates, context);

  const [{ did: signingDid }, accountIdentity, incomingBalances] = await Promise.all([
    context.getSigningIdentity(),
    account.getIdentity(),
    account.getIncomingBalances(),
  ]);

  if (!accountIdentity || accountIdentity.did !== signingDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot apply incoming balances in the specified account',
    });
  }

  if (!incomingBalances.length) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'No incoming balance found for the given confidential Account',
      data: {
        confidentialAccount: account.publicKey,
      },
    });
  }

  return {
    transaction: confidentialAsset.applyIncomingBalances,
    args: [account.publicKey, rawMaxUpdates],
    resolver: account,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ApplyIncomingConfidentialAssetBalancesParams, ConfidentialAccount>
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.confidentialAsset.ApplyIncomingBalances],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const applyIncomingConfidentialAssetBalance = (): Procedure<
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialAccount
> => new Procedure(prepareApplyIncomingConfidentialAssetBalance, getAuthorization);
