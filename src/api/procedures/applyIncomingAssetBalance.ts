import { PolymeshError, Procedure } from '~/internal';
import { ApplyIncomingBalanceParams, ConfidentialAccount, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { serializeConfidentialAssetId } from '~/utils/conversion';
import { asConfidentialAccount, asConfidentialAsset } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareApplyIncomingBalance(
  this: Procedure<ApplyIncomingBalanceParams, ConfidentialAccount>,
  args: ApplyIncomingBalanceParams
): Promise<
  TransactionSpec<ConfidentialAccount, ExtrinsicParams<'confidentialAsset', 'applyIncomingBalance'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  const { asset: assetInput, account: accountInput } = args;

  const account = asConfidentialAccount(accountInput, context);
  const asset = asConfidentialAsset(assetInput, context);

  const [{ did: signingDid }, accountIdentity, _incomingBalance] = await Promise.all([
    context.getSigningIdentity(),
    account.getIdentity(),
    account.getIncomingBalance({ asset }),
  ]);

  if (!accountIdentity || accountIdentity.did !== signingDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The Signing Identity cannot apply incoming balance for the confidential Asset in the specified account',
    });
  }

  return {
    transaction: confidentialAsset.applyIncomingBalance,
    args: [account.publicKey, serializeConfidentialAssetId(asset.id)],
    resolver: account,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ApplyIncomingBalanceParams, ConfidentialAccount>
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.confidentialAsset.ApplyIncomingBalance],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const applyIncomingAssetBalance = (): Procedure<
  ApplyIncomingBalanceParams,
  ConfidentialAccount
> => new Procedure(prepareApplyIncomingBalance, getAuthorization);
