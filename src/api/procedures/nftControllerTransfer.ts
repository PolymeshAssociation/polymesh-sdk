import {
  assertAssetHolderExists,
  assertControllerTransferDestinationAccepted,
  assertTxSupported,
  ControllerTransferDestination,
  getAssetHolderDid,
  getControllerTransferDestination,
} from '~/api/procedures/utils';
import { Account, NftCollection, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, NftControllerTransferParams, RoleType, TxTags } from '~/types';
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

/**
 * @hidden
 */
export type Storage = ControllerTransferDestination;

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
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'nft', 'controllerTransfer'>>
  | TransactionSpec<void, ExtrinsicParams<'nft', 'controllerTransferTo'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { did, actingAddress, destinationAssetHolder, isDestinationCallers },
    context,
  } = this;
  const { collection, originPortfolio, nfts: givenNfts } = args;
  const nftIds = givenNfts.map(nft => asNftId(nft));

  const [originHolderDid, destinationDid] = await Promise.all([
    getAssetHolderDid(originPortfolio, context),
    getAssetHolderDid(destinationAssetHolder, context),
  ]);

  // the chain refuses any transfer between two holders of the same Identity, a controller
  // transfer included, so seizing from a holder and delivering to another of its own is not possible
  if (originHolderDid && originHolderDid === destinationDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The origin and destination must belong to different Identities',
      data: { did: originHolderDid },
    });
  }

  const destinationAssetHolderId = assetHolderLikeToAssetHolderId(destinationAssetHolder);

  if (!isDestinationCallers) {
    assertTxSupported(TxTags.nft.ControllerTransferTo, '8.1.1', context);

    await assertAssetHolderExists(destinationAssetHolderId, context);
    await assertControllerTransferDestinationAccepted(
      destinationAssetHolder,
      collection,
      { did, address: actingAddress },
      context
    );
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
  const rawSource = assetHolderIdToMeshAssetHolder(
    assetHolderLikeToAssetHolderId(fromAssetHolder),
    context
  );

  if (isDestinationCallers) {
    return {
      transaction: tx.nft.controllerTransfer,
      args: [rawNfts, rawSource, assetHolderToAssetHolderKind(destinationAssetHolder, context)],
      resolver: undefined,
    };
  }

  return {
    transaction: tx.nft.controllerTransferTo,
    args: [rawNfts, rawSource, assetHolderIdToMeshAssetHolder(destinationAssetHolderId, context)],
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
    storage: { destinationAssetHolder, isDestinationCallers },
  } = this;

  // the chain checks only the agent's Asset permission for a transfer to a named destination
  if (!isDestinationCallers) {
    return {
      permissions: {
        assets: [collection],
        transactions: [TxTags.nft.ControllerTransferTo],
        portfolios: [],
      },
    };
  }

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
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { destination }: Params
): Promise<Storage> {
  return getControllerTransferDestination(destination, this.context);
}

/**
 * @hidden
 */
export const nftControllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareNftControllerTransfer, getAuthorization, prepareStorage);
