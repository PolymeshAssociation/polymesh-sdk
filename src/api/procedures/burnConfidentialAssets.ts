import BigNumber from 'bignumber.js';

import { ConfidentialAsset, PolymeshError, Procedure } from '~/internal';
import { BurnConfidentialAssetParams, ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU128,
  confidentialBurnProofToRaw,
  serializeConfidentialAssetId,
} from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

export type Params = BurnConfidentialAssetParams & {
  confidentialAsset: ConfidentialAsset;
};

/**
 * @hidden
 */
export async function prepareBurnConfidentialAsset(
  this: Procedure<Params, ConfidentialAsset>,
  args: Params
): Promise<TransactionSpec<ConfidentialAsset, ExtrinsicParams<'confidentialAsset', 'burn'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { confidentialAsset },
      },
    },
    context,
  } = this;
  const { confidentialAsset: asset, amount, confidentialAccount: account, proof } = args;

  const { id: assetId } = asset;

  const sourceAccount = asConfidentialAccount(account, context);

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
    sourceAccount.getIdentity(),
  ]);

  if (!accountIdentity || accountIdentity.did !== signingDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Signing Identity cannot burn confidential Assets in the specified account',
    });
  }

  const supplyAfterBurn = totalSupply.minus(amount);

  if (supplyAfterBurn.isLessThan(0)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: `This burn operation will cause the total supply of "${assetId}" to be negative`,
      data: {
        currentSupply: totalSupply,
      },
    });
  }

  const rawProof = confidentialBurnProofToRaw(proof, context);

  return {
    transaction: confidentialAsset.burn,
    args: [
      serializeConfidentialAssetId(assetId),
      bigNumberToU128(amount, context),
      sourceAccount.publicKey,
      rawProof,
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
      transactions: [TxTags.confidentialAsset.Burn],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const burnConfidentialAssets = (): Procedure<Params, ConfidentialAsset> =>
  new Procedure(prepareBurnConfidentialAsset, getAuthorization);
