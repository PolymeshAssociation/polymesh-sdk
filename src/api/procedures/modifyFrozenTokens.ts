import BigNumber from 'bignumber.js';

import { assertAssetHolderExists, assertTxSupported } from '~/api/procedures/utils';
import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, FrozenTokensParams, TxTag, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetToMeshAssetId,
  bigNumberToBalance,
} from '~/utils/conversion';
import { getHolderFreezeStatus } from '~/utils/internal';

/**
 * @hidden
 *
 * - `set` makes the frozen amount exactly `amount`
 * - `increase` freezes `amount` more, on top of what is already frozen
 * - `decrease` releases `amount` of what is frozen
 */
export type FrozenTokensOperation = 'set' | 'increase' | 'decrease';

/**
 * @hidden
 */
export type Params = FrozenTokensParams & {
  asset: FungibleAsset;
  operation: FrozenTokensOperation;
};

type FrozenTokensExtrinsic = 'setFrozenTokens' | 'freezePartialTokens' | 'unfreezePartialTokens';

const extrinsics: Record<FrozenTokensOperation, [FrozenTokensExtrinsic, TxTag]> = {
  set: ['setFrozenTokens', TxTags.asset.SetFrozenTokens],
  increase: ['freezePartialTokens', TxTags.asset.FreezePartialTokens],
  decrease: ['unfreezePartialTokens', TxTags.asset.UnfreezePartialTokens],
};

/**
 * @hidden
 *
 * Mirror the chain's checks on the resulting frozen amount. `set` checks nothing against the
 *   balance, since the chain lets an agent freeze more than the holder holds
 */
async function assertFrozenAmountValid(
  args: Params,
  currentlyFrozen: BigNumber,
  procedure: Procedure<Params, void>
): Promise<void> {
  const { asset, holder, amount, operation } = args;
  const { context } = procedure;

  if (operation === 'set') {
    if (amount.eq(currentlyFrozen)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The holder already has this amount frozen',
        data: { frozen: currentlyFrozen },
      });
    }

    return;
  }

  if (amount.lte(0)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The amount must be greater than 0',
    });
  }

  if (operation === 'decrease') {
    if (amount.gt(currentlyFrozen)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The amount to unfreeze exceeds what is frozen',
        data: { frozen: currentlyFrozen },
      });
    }

    return;
  }

  const [balance] = await assetHolderLikeToAssetHolder(holder, context).getAssetBalances({
    assets: [asset],
  });
  const total = balance?.total ?? new BigNumber(0);

  if (currentlyFrozen.plus(amount).gt(total)) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "The frozen amount would exceed the holder's balance",
      data: { balance: total, frozen: currentlyFrozen },
    });
  }
}

/**
 * @hidden
 */
export async function prepareModifyFrozenTokens(
  this: Procedure<Params, void>,
  args: Params
): Promise<
  TransactionSpec<
    void,
    ExtrinsicParams<'asset', 'setFrozenTokens' | 'freezePartialTokens' | 'unfreezePartialTokens'>
  >
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { asset, holder, amount, operation } = args;

  const [extrinsic, tag] = extrinsics[operation];

  assertTxSupported(tag, '8.1.1', context);

  const holderId = assetHolderLikeToAssetHolderId(holder);

  const [{ frozen }] = await Promise.all([
    getHolderFreezeStatus(holder, asset, context),
    assertAssetHolderExists(holderId, context),
  ]);

  await assertFrozenAmountValid(args, frozen, this);

  return {
    transaction: tx.asset[extrinsic],
    args: [
      assetToMeshAssetId(asset, context),
      assetHolderIdToMeshAssetHolder(holderId, context),
      bigNumberToBalance(amount, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset, operation }: Params
): ProcedureAuthorization {
  const [, tag] = extrinsics[operation];

  return {
    permissions: {
      transactions: [tag],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyFrozenTokens = (): Procedure<Params, void> =>
  new Procedure(prepareModifyFrozenTokens, getAuthorization);
