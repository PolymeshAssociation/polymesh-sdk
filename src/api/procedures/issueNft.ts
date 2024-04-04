import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Nft } from '~/api/entities/Asset/NonFungible/Nft';
import { Context, NftCollection, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, NftMetadataInput, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  meshNftToNftId,
  nftInputToNftMetadataVec,
  portfolioToPortfolioKind,
  stringToTicker,
} from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

export interface IssueNftParams {
  ticker: string;
  portfolioId?: BigNumber;
  metadata: NftMetadataInput[];
}

export interface Storage {
  collection: NftCollection;
}

/**
 * @hidden
 */
export const issueNftResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Nft => {
    const [{ data }] = filterEventRecords(receipt, 'nft', 'NFTPortfolioUpdated');

    const { ticker, ids } = meshNftToNftId(data[1]);

    return new Nft({ ticker, id: ids[0] }, context);
  };

/**
 * @hidden
 */
export async function prepareIssueNft(
  this: Procedure<IssueNftParams, Nft, Storage>,
  args: IssueNftParams
): Promise<TransactionSpec<Nft, ExtrinsicParams<'nft', 'issueNft'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { collection },
  } = this;
  const { ticker, portfolioId, metadata } = args;
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
        data: { ticker, type: value.type, id: value.id },
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

  const rawTicker = stringToTicker(ticker, context);
  const rawPortfolio = portfolioToPortfolioKind(portfolio, context);

  return {
    transaction: tx.nft.issueNft,
    args: [rawTicker, rawMetadataValues, rawPortfolio],
    resolver: issueNftResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<IssueNftParams, Nft, Storage>
): ProcedureAuthorization {
  const {
    storage: { collection },
  } = this;
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
export function prepareStorage(
  this: Procedure<IssueNftParams, Nft, Storage>,
  { ticker }: IssueNftParams
): Storage {
  const { context } = this;

  return {
    collection: new NftCollection({ ticker }, context),
  };
}

/**
 * @hidden
 */
export const issueNft = (): Procedure<IssueNftParams, Nft, Storage> =>
  new Procedure(prepareIssueNft, getAuthorization, prepareStorage);
