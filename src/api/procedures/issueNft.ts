import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import { Context, NftCollection, PolymeshError, Procedure } from '~/internal';
import { CollectionKey, ErrorCode, NftMetadataInput, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  assetToMeshAssetId,
  meshNftToNftId,
  nftInputToNftMetadataVec,
  portfolioToPortfolioKind,
} from '~/utils/conversion';
import { checkTxType, filterEventRecords } from '~/utils/internal';

export type Params = {
  metadataList: NftMetadataInput[][];
  portfolioId?: BigNumber | undefined;
  collection: NftCollection;
};

/**
 * @hidden
 */
export const issuedNftsResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Nft[] => {
    const records = filterEventRecords(receipt, 'nft', 'NFTPortfolioUpdated');

    return records.map(({ data }) => {
      const { assetId, ids } = meshNftToNftId(data[1]);
      const id = ids[0]!;

      return new Nft({ id, assetId }, context);
    });
  };

/**
 *
 * @param nftParams
 * @param neededMetadata
 */
function validateNftParams(
  metadata: NftMetadataInput[],
  neededMetadata: CollectionKey[],
  assetId: string
): void {
  // for each input, find and remove a value from needed
  metadata.forEach(value => {
    const matchedIndex = neededMetadata.findIndex(
      requiredValue => value.type === requiredValue.type && value.id.eq(requiredValue.id)
    );

    if (matchedIndex < 0) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A metadata value was given that is not required for this collection',
        data: { assetId, type: value.type, id: value.id },
      });
    }

    neededMetadata.splice(matchedIndex, 1);
  });

  if (neededMetadata.length > 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The collection requires metadata that was not provided',
      data: { missingMetadata: JSON.stringify(neededMetadata) },
    });
  }
}

/**
 * @hidden
 */
export async function prepareIssueNft(
  this: Procedure<Params, Nft[]>,
  args: Params
): Promise<BatchTransactionSpec<Nft[], unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { portfolioId, metadataList: nftParams, collection } = args;

  const rawMetadataValues = nftParams.map(metadata => nftInputToNftMetadataVec(metadata, context));

  const neededMetadata = await collection.collectionKeys();

  nftParams.forEach(metadata => validateNftParams(metadata, [...neededMetadata], collection.id));

  const signingIdentity = await context.getSigningIdentity();

  const portfolio = portfolioId
    ? await signingIdentity.portfolios.getPortfolio({ portfolioId })
    : await signingIdentity.portfolios.getPortfolio();

  const rawAssetId = assetToMeshAssetId(collection, context);
  const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

  const transactions = rawMetadataValues.map(metadata =>
    checkTxType({
      transaction: tx.nft.issueNft,
      args: [rawAssetId, metadata, rawPortfolio],
    })
  );

  return {
    transactions,
    resolver: issuedNftsResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Nft[]>,
  { collection }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.nft.IssueNft],
      assets: [collection],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const issueNft = (): Procedure<Params, Nft[]> =>
  new Procedure(prepareIssueNft, getAuthorization);
