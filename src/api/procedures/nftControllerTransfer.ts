import BigNumber from 'bignumber.js';

import { DefaultPortfolio, NftCollection, PolymeshError, Procedure } from '~/internal';
import {
  ErrorCode,
  NftControllerTransferParams,
  NumberedPortfolio,
  RoleType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  nftToMeshNft,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  portfolioToPortfolioId,
  portfolioToPortfolioKind,
  stringToTicker,
} from '~/utils/conversion';
import { asNftId } from '~/utils/internal';

export interface Storage {
  did: string;
  destinationPortfolio: DefaultPortfolio | NumberedPortfolio;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & NftControllerTransferParams;

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
    storage: { did, destinationPortfolio },
    context,
  } = this;
  const { ticker, originPortfolio, nfts: givenNfts } = args;
  const nftIds = givenNfts.map(nft => asNftId(nft));

  const collection = new NftCollection({ ticker }, context);

  const originPortfolioId = portfolioLikeToPortfolioId(originPortfolio);

  if (did === originPortfolioId.did) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Controller transfers to self are not allowed',
    });
  }

  if (did !== destinationPortfolio.owner.did) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "Controller transfer must send to one of the signer's portfolios",
    });
  }

  const fromPortfolio = portfolioIdToPortfolio(originPortfolioId, context);

  const [heldCollection] = await fromPortfolio.getCollections({
    collections: [collection],
  });

  const free = heldCollection?.free ?? [];

  const unavailableNfts = nftIds.filter(nftId => !free.some(freeNft => freeNft.id.eq(nftId)));

  if (unavailableNfts.length) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The origin Portfolio does not have all of the requested NFTs',
      data: { unavailable: unavailableNfts.map(id => id.toString()) },
    });
  }

  const rawNfts = nftToMeshNft(ticker, nftIds, context);

  return {
    transaction: tx.nft.controllerTransfer,
    args: [
      stringToTicker(ticker, context),
      rawNfts,
      portfolioIdToMeshPortfolioId(originPortfolioId, context),
      portfolioToPortfolioKind(destinationPortfolio, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { ticker }: Params
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { destinationPortfolio },
  } = this;

  const asset = new NftCollection({ ticker }, context);

  const portfolioId = portfolioToPortfolioId(destinationPortfolio);

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      assets: [asset],
      transactions: [TxTags.nft.ControllerTransfer],
      portfolios: [destinationPortfolio],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { destinationPortfolio: givenPortfolio }: Params
): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();
  const destinationPortfolioId = givenPortfolio
    ? portfolioLikeToPortfolioId(givenPortfolio)
    : portfolioLikeToPortfolioId({ identity: did, id: new BigNumber(0) });

  const destinationPortfolio = portfolioIdToPortfolio(destinationPortfolioId, context);

  return {
    did,
    destinationPortfolio,
  };
}

/**
 * @hidden
 */
export const nftControllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareNftControllerTransfer, getAuthorization, prepareStorage);
