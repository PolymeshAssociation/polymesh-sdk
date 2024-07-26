import {
  ConfidentialAssetsElgamalCipherText,
  PalletConfidentialAssetConfidentialAccount,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import { U8aFixed } from '@polkadot/types-codec';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { filterEventRecords } from '@polymeshassociation/polymesh-sdk/utils/internal';
import { BigNumber } from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAsset, Context, PolymeshError } from '~/internal';
import {
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialProcedureAuthorization,
  IncomingConfidentialAssetBalance,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { bigNumberToU16, meshConfidentialAssetToAssetId } from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

/**
 * @hidden
 */
export const meshAccountDepositEventDataToIncomingAssetBalance = (
  data: [
    PalletConfidentialAssetConfidentialAccount,
    U8aFixed,
    ConfidentialAssetsElgamalCipherText,
    ConfidentialAssetsElgamalCipherText
  ],
  context: Context
): IncomingConfidentialAssetBalance => {
  const [, rawAssetId, rawAmount, rawBalance] = data;
  const id = meshConfidentialAssetToAssetId(rawAssetId);
  return {
    asset: new ConfidentialAsset({ id }, context),
    amount: rawAmount.toString(),
    balance: rawBalance.toString(),
  };
};

/**
 * @hidden
 */
export const createIncomingAssetBalancesResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): IncomingConfidentialAssetBalance[] => {
    const accountDeposits = filterEventRecords(receipt, 'confidentialAsset', 'AccountDeposit');
    return accountDeposits.map(({ data }) =>
      meshAccountDepositEventDataToIncomingAssetBalance(data, context)
    );
  };

/**
 * @hidden
 */
export async function prepareApplyIncomingConfidentialAssetBalances(
  this: ConfidentialProcedure<
    ApplyIncomingConfidentialAssetBalancesParams,
    IncomingConfidentialAssetBalance[]
  >,
  args: ApplyIncomingConfidentialAssetBalancesParams
): Promise<
  TransactionSpec<
    IncomingConfidentialAssetBalance[],
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

  const account = asConfidentialAccount(args.confidentialAccount, context);

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

  let { maxUpdates } = args;

  if (!maxUpdates) {
    maxUpdates = new BigNumber(incomingBalances.length);
  }

  const rawMaxUpdates = bigNumberToU16(maxUpdates, context);

  return {
    transaction: confidentialAsset.applyIncomingBalances,
    args: [account.publicKey, rawMaxUpdates],
    resolver: createIncomingAssetBalancesResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<
    ApplyIncomingConfidentialAssetBalancesParams,
    IncomingConfidentialAssetBalance[]
  >
): ConfidentialProcedureAuthorization {
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
export const applyIncomingConfidentialAssetBalances = (): ConfidentialProcedure<
  ApplyIncomingConfidentialAssetBalancesParams,
  IncomingConfidentialAssetBalance[]
> => new ConfidentialProcedure(prepareApplyIncomingConfidentialAssetBalances, getAuthorization);
