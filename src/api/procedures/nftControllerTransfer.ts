import { getAssetHolderDid } from '~/api/procedures/utils';
import { Account, DefaultPortfolio, NftCollection, PolymeshError, Procedure } from '~/internal';
import { AssetHolder, ErrorCode, NftControllerTransferParams, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetHolderToAssetHolderKind,
  nftToMeshNft,
  portfolioToPortfolioId,
} from '~/utils/conversion';
import { asNftId } from '~/utils/internal';

export interface Storage {
  did: string;
  destinationAssetHolder: AssetHolder;
}

/**
 * @hidden
 */
export type Params = { collection: NftCollection } & NftControllerTransferParams;

/**
 * @hidden
 */
export async function prepareNftControllerTransfer(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'nft', 'controllerTransfer'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { did, destinationAssetHolder },
    context,
  } = this;
  const { collection, originPortfolio, nfts: givenNfts } = args;
  const nftIds = givenNfts.map(nft => asNftId(nft));

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

  const fromAssetHolder = assetHolderLikeToAssetHolder(originPortfolio, context);

  const [heldCollection] = await fromAssetHolder.getCollections({
    collections: [collection],
  });

  const free = heldCollection?.free ?? [];

  const unavailableNfts = nftIds.filter(nftId => !free.some(freeNft => freeNft.id.eq(nftId)));

  if (unavailableNfts.length) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The origin Portfolio does not have all of the requested NFTs',
      data: { unavailable: unavailableNfts.map(nftId => nftId.toString()) },
    });
  }

  const rawNfts = nftToMeshNft(collection, nftIds, context);

  return {
    transaction: tx.nft.controllerTransfer,
    args: [
      rawNfts,
      await assetHolderIdToMeshAssetHolder(
        assetHolderLikeToAssetHolderId(fromAssetHolder),
        context
      ),
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
  { collection }: Params
): ProcedureAuthorization {
  const {
    storage: { destinationAssetHolder },
  } = this;

  if (destinationAssetHolder instanceof Account) {
    return {
      permissions: {
        assets: [collection],
        transactions: [TxTags.nft.ControllerTransfer],
        portfolios: [],
      },
    };
  }

  const portfolioId = portfolioToPortfolioId(destinationAssetHolder);

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      assets: [collection],
      transactions: [TxTags.nft.ControllerTransfer],
      portfolios: [destinationAssetHolder],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { destinationPortfolio, destination }: Params
): Promise<Storage> {
  const { context } = this;

  let givenAssetHolder = destination;
  if (!destination) {
    givenAssetHolder = destinationPortfolio;
  }

  const { did } = await context.getSigningIdentity();
  const destinationAssetHolder = givenAssetHolder
    ? assetHolderLikeToAssetHolder(givenAssetHolder, context)
    : new DefaultPortfolio({ did }, context);

  return {
    did,
    destinationAssetHolder,
  };
}

/**
 * @hidden
 */
export const nftControllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareNftControllerTransfer, getAuthorization, prepareStorage);
