import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import { bigNumberToU128 } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAsset, PolymeshError } from '~/internal';
import {
  ConfidentialProcedureAuthorization,
  IssueConfidentialAssetParams,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { serializeConfidentialAssetId } from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

export type Params = IssueConfidentialAssetParams & {
  confidentialAsset: ConfidentialAsset;
};

/**
 * @hidden
 */
export async function prepareConfidentialAssets(
  this: ConfidentialProcedure<Params, ConfidentialAsset>,
  args: Params
): Promise<TransactionSpec<ConfidentialAsset, ExtrinsicParams<'confidentialAsset', 'mint'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  const { confidentialAsset: asset, amount, confidentialAccount: account } = args;

  const { id: assetId } = asset;

  const destinationAccount = asConfidentialAccount(account, context);

  if (amount.lte(new BigNumber(0))) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Amount should be greater than zero',
      data: {
        amount,
      },
    });
  }

  const [{ totalSupply }, { did: signingDid }, accountIdentity] = await Promise.all([
    asset.details(),
    context.getSigningIdentity(),
    destinationAccount.getIdentity(),
  ]);

  if (!accountIdentity || accountIdentity.did !== signingDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot issue confidential Assets in the specified account',
    });
  }

  const supplyAfterMint = amount.plus(totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This issuance operation will cause the total supply of "${assetId}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_BALANCE,
      },
    });
  }

  return {
    transaction: confidentialAsset.mint,
    args: [
      serializeConfidentialAssetId(assetId),
      bigNumberToU128(amount, context),
      destinationAccount.publicKey,
    ],
    resolver: asset,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: ConfidentialProcedure<Params, ConfidentialAsset>,
  args: Params
): ConfidentialProcedureAuthorization {
  const {
    confidentialAsset: { id: assetId },
  } = args;

  return {
    roles: [{ type: RoleType.ConfidentialAssetOwner, assetId }],
    permissions: {
      transactions: [TxTags.confidentialAsset.Mint],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const issueConfidentialAssets = (): ConfidentialProcedure<Params, ConfidentialAsset> =>
  new ConfidentialProcedure(prepareConfidentialAssets, getAuthorization);
