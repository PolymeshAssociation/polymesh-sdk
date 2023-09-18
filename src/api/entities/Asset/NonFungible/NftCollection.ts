import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/api/entities/Asset/BaseAsset';
import {
  AuthorizationRequest,
  Context,
  controllerTransfer,
  transferAssetOwnership,
} from '~/internal';
import { assetQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ControllerTransferParams,
  EventIdentifier,
  ProcedureMethod,
  TransferAssetOwnershipParams,
} from '~/types';
import { Ensured } from '~/types/utils';
import { middlewareEventDetailsToEventIdentifier, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the NftCollection
   */
  ticker: string;
}

/**
 * Class used to manage Nft functionality
 */
export class NftCollection extends BaseAsset {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

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
    this.controllerTransfer = createProcedureMethod(
      { getProcedureAndArgs: args => [controllerTransfer, { ticker, ...args }] },
      context
    );
  }

  /**
   * Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
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
   * Force a transfer from a given Portfolio to the caller’s default Portfolio
   */
  public controllerTransfer: ProcedureMethod<ControllerTransferParams, void>;

  /**
   * Determine whether this NftCollection exists on chain
   */
  public async exists(): Promise<boolean> {
    const { ticker, context } = this;

    const rawTokenId = await context.polymeshApi.query.nft.collectionTicker(
      stringToTicker(ticker, context)
    );

    return !rawTokenId.isZero();
  }

  /**
   * Return the NftCollection's ticker
   */
  public toHuman(): string {
    return this.ticker;
  }
}
