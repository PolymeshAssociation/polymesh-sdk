import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/api/entities/Asset/Base';
import { AuthorizationRequest, Context, transferAssetOwnership } from '~/internal';
import { assetQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  AssetDetails,
  EventIdentifier,
  ProcedureMethod,
  SubCallback,
  TransferAssetOwnershipParams,
  UniqueIdentifiers,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  middlewareEventDetailsToEventIdentifier,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

const sumNftIssuance = (
  numberOfNfts: [StorageKey<[PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]>, u64][]
): BigNumber => {
  let numberIssued = new BigNumber(0);
  numberOfNfts.forEach(([, holderEntry]) => {
    const holderAmount = u64ToBigNumber(holderEntry);
    numberIssued = numberIssued.plus(holderAmount);
  });

  return numberIssued;
};

/**
 * Class used to manage Nft functionality
 */
export class NftCollection extends BaseAsset {
  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.transferOwnership = createProcedureMethod(
      { getProcedureAndArgs: args => [transferAssetOwnership, { ticker, ...args }] },
      context
    );
  }

  /**
   * Transfer ownership of the NftCollection to another Identity. This generates an authorization request that must be accepted
   *   by the recipient
   *
   * @note this will create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public transferOwnership: ProcedureMethod<TransferAssetOwnershipParams, AuthorizationRequest>;

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { ticker, context } = this;

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assets'>>(
      assetQuery({
        ticker,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(asset?.createdBlock, asset?.eventIdx);
  }

  /**
   * Retrieve the NftCollection's data
   *
   * @note can be subscribed to
   */
  public override details(): Promise<AssetDetails>;
  public override details(callback: SubCallback<AssetDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public override async details(
    callback?: SubCallback<AssetDetails>
  ): Promise<AssetDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: { query },
      },
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const rawNumberNftsPromise = query.nft.numberOfNFTs.entries(rawTicker);

    if (callback) {
      const rawNumberNfts = await rawNumberNftsPromise;
      const numberIssued = sumNftIssuance(rawNumberNfts);

      // currently `asset.tokens` does not track Nft `totalSupply', we wrap the callback to provide it
      const wrappedCallback = async (commonDetails: AssetDetails): Promise<void> => {
        const nftDetails = { ...commonDetails, totalSupply: numberIssued };

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        callback(nftDetails);
      };

      return super.details(wrappedCallback);
    }

    const [rawNumberNfts, commonDetails] = await Promise.all([
      rawNumberNftsPromise,
      super.details(),
    ]);
    const numberIssued = sumNftIssuance(rawNumberNfts);

    return { ...commonDetails, totalSupply: numberIssued };
  }

  /**
   * Retrieve the amount of unique investors that hold this Nft
   */
  public async investorCount(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      ticker,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const holderEntries = await query.nft.numberOfNFTs.entries(rawTicker);

    const assetBalances = holderEntries.filter(([, balance]) => !balance.isZero());

    return new BigNumber(assetBalances.length);
  }

  /**
   * Determine whether this NftCollection exists on chain
   */
  public override async exists(): Promise<boolean> {
    const { ticker, context } = this;

    const rawTokenId = await context.polymeshApi.query.nft.collectionTicker(
      stringToTicker(ticker, context)
    );

    return !rawTokenId.isZero();
  }
}
