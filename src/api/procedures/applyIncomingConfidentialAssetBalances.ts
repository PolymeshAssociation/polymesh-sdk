import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { BigNumber } from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { PolymeshError } from '~/internal';
import {
  ApplyIncomingConfidentialAssetBalancesParams,
  ConfidentialAccount,
  ConfidentialProcedureAuthorization,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { bigNumberToU16 } from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

/**
 * @hidden
 */
export async function prepareApplyIncomingConfidentialAssetBalances(
  this: ConfidentialProcedure<ApplyIncomingConfidentialAssetBalancesParams, ConfidentialAccount>,
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
    resolver: account,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<ApplyIncomingConfidentialAssetBalancesParams, ConfidentialAccount>
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
  ConfidentialAccount
> => new ConfidentialProcedure(prepareApplyIncomingConfidentialAssetBalances, getAuthorization);
