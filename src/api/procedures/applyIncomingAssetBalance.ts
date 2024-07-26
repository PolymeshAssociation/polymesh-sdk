import { ISubmittableResult } from '@polkadot/types/types';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { filterEventRecords } from '@polymeshassociation/polymesh-sdk/utils/internal';

import { meshAccountDepositEventDataToIncomingAssetBalance } from '~/api/procedures/applyIncomingConfidentialAssetBalances';
import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { Context, PolymeshError } from '~/internal';
import {
  ApplyIncomingBalanceParams,
  ConfidentialProcedureAuthorization,
  IncomingConfidentialAssetBalance,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { serializeConfidentialAssetId } from '~/utils/conversion';
import { asConfidentialAccount, asConfidentialAsset } from '~/utils/internal';

/**
 * @hidden
 */
export const createIncomingAssetBalanceResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): IncomingConfidentialAssetBalance => {
    const [{ data }] = filterEventRecords(receipt, 'confidentialAsset', 'AccountDeposit');
    return meshAccountDepositEventDataToIncomingAssetBalance(data, context);
  };

/**
 * @hidden
 */
export async function prepareApplyIncomingBalance(
  this: ConfidentialProcedure<ApplyIncomingBalanceParams, IncomingConfidentialAssetBalance>,
  args: ApplyIncomingBalanceParams
): Promise<
  TransactionSpec<
    IncomingConfidentialAssetBalance,
    ExtrinsicParams<'confidentialAsset', 'applyIncomingBalance'>
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
  const { confidentialAsset: assetInput, confidentialAccount: accountInput } = args;

  const account = asConfidentialAccount(accountInput, context);
  const asset = asConfidentialAsset(assetInput, context);

  const [{ did: signingDid }, accountIdentity] = await Promise.all([
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
    resolver: createIncomingAssetBalanceResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<ApplyIncomingBalanceParams, IncomingConfidentialAssetBalance>
): ConfidentialProcedureAuthorization {
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
export const applyIncomingAssetBalance = (): ConfidentialProcedure<
  ApplyIncomingBalanceParams,
  IncomingConfidentialAssetBalance
> => new ConfidentialProcedure(prepareApplyIncomingBalance, getAuthorization);
