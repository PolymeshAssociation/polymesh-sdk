import { getAssetHolderDid } from '~/api/procedures/utils';
import { DefaultPortfolio, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { AssetHolder, ControllerTransferParams, ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetHolderToAssetHolderKind,
  assetToMeshAssetId,
  bigNumberToBalance,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';

export interface Storage {
  did: string;
  destinationAssetHolder: AssetHolder;
}

/**
 * @hidden
 */
export type Params = { asset: FungibleAsset } & ControllerTransferParams;

/**
 * @hidden
 */
export async function prepareControllerTransfer(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'controllerTransfer'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { did, destinationAssetHolder },
    context,
  } = this;
  const { asset, originPortfolio, amount, destination } = args;

  const originAssetHolderId = assetHolderLikeToAssetHolderId(originPortfolio);

  const originHolderDid = await getAssetHolderDid(originPortfolio, context);

  if (originPortfolio && did === originHolderDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Controller transfers to self are not allowed',
    });
  }

  const destinationDid = await getAssetHolderDid(destinationAssetHolder, context);

  if (did !== destinationDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "Controller transfer must send to one of the signer's portfolios or accounts",
    });
  }

  const fromPortfolio = assetHolderLikeToAssetHolder(originPortfolio, context);

  const [balance] = await fromPortfolio.getAssetBalances({
    assets: [asset],
  });

  const { free } = balance!;

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The origin Portfolio does not have enough free balance for this transfer',
      data: { free },
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  return {
    transaction: tx.asset.controllerTransfer,
    args: [
      rawAssetId,
      bigNumberToBalance(amount, context),
      await assetHolderIdToMeshAssetHolder(originAssetHolderId, context),
      assetHolderToAssetHolderKind(destinationAssetHolder, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): ProcedureAuthorization {
  const {
    context,
    storage: { did },
  } = this;

  const portfolioId = { did };

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      assets: [asset],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { destination }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();
  const destinationAssetHolder = destination
    ? assetHolderLikeToAssetHolder(destination, context)
    : new DefaultPortfolio({ did }, context);

  return {
    did,
    destinationAssetHolder,
  };
}

/**
 * @hidden
 */
export const controllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareControllerTransfer, getAuthorization, prepareStorage);
