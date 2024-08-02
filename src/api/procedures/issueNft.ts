import { ISubmittableResult } from '@polkadot/types/types';

import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import { Context, NftCollection, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, IssueNftParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  meshNftToNftId,
  nftInputToNftMetadataVec,
  portfolioToPortfolioKind,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export type Params = IssueNftParams & {
  collection: NftCollection;
};

/**
 * @hidden
 */
export const issueNftResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Nft => {
    const [{ data }] = filterEventRecords(receipt, 'nft', 'NFTPortfolioUpdated');

    const { assetId, ids } = meshNftToNftId(data[1], context);

    return new Nft({ id: ids[0], assetId }, context);
  };

/**
 * @hidden
 */
export async function prepareIssueNft(
  this: Procedure<Params, Nft>,
  args: Params
): Promise<TransactionSpec<Nft, ExtrinsicParams<'nft', 'issueNft'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { portfolioId, metadata, collection } = args;
  const rawMetadataValues = nftInputToNftMetadataVec(metadata, context);

  const neededMetadata = await collection.collectionKeys();

  // for each input, find and remove a value from needed
  args.metadata.forEach(value => {
    const matchedIndex = neededMetadata.findIndex(
      requiredValue => value.type === requiredValue.type && value.id.eq(requiredValue.id)
    );

    if (matchedIndex < 0) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A metadata value was given that is not required for this collection',
        data: { assetId: collection.id, type: value.type, id: value.id },
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

  const signingIdentity = await context.getSigningIdentity();

  const portfolio = portfolioId
    ? await signingIdentity.portfolios.getPortfolio({ portfolioId })
    : await signingIdentity.portfolios.getPortfolio();

  const rawAssetId = assetToMeshAssetId(collection, context);
  const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

  return {
    transaction: tx.nft.issueNft,
    args: [rawAssetId, rawMetadataValues, rawPortfolio],
    resolver: issueNftResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Nft>,
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
export const issueNft = (): Procedure<Params, Nft> =>
  new Procedure(prepareIssueNft, getAuthorization);
