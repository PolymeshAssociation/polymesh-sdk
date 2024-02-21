import BigNumber from 'bignumber.js';

import { ConfidentialAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, IssueConfidentialAssetParams, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { MAX_BALANCE } from '~/utils/constants';
import { bigNumberToU128, serializeConfidentialAssetId } from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

export type Params = IssueConfidentialAssetParams & {
  confidentialAsset: ConfidentialAsset;
};

/**
 * @hidden
 */
export async function prepareConfidentialAssets(
  this: Procedure<Params, ConfidentialAsset>,
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
  this: Procedure<Params, ConfidentialAsset>,
  args: Params
): ProcedureAuthorization {
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
export const issueConfidentialAssets = (): Procedure<Params, ConfidentialAsset> =>
  new Procedure(prepareConfidentialAssets, getAuthorization);
