import { Bytes, Option, StorageKey } from '@polkadot/types';
import {
  PalletAssetSecurityToken,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Context, Entity, Identity, PolymeshError } from '~/internal';
import { AssetDetails, ErrorCode, SecurityIdentifier, SubCallback, UnsubCallback } from '~/types';
import { tickerToDid } from '~/utils';
import {
  assetIdentifierToSecurityIdentifier,
  assetTypeToKnownOrId,
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  bytesToString,
  identityIdToString,
  stringToTicker,
} from '~/utils/conversion';

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the Asset
   */
  ticker: string;
}

/**
 * Class used to manage functionality common to all assets
 */
export abstract class BaseAsset extends Entity<UniqueIdentifiers, string> {
  /**
   * Identity ID of the Asset (used for Claims)
   */
  public did: string;

  /**
   * ticker of the Asset
   */
  public ticker: string;

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

    this.ticker = ticker;
    this.did = tickerToDid(ticker);
  }

  /**
   * Retrieve the Asset's identifiers list
   *
   * @note can be subscribed to
   */
  public getIdentifiers(): Promise<SecurityIdentifier[]>;
  public getIdentifiers(callback?: SubCallback<SecurityIdentifier[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getIdentifiers(
    callback?: SubCallback<SecurityIdentifier[]>
  ): Promise<SecurityIdentifier[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    if (callback) {
      return asset.identifiers(rawTicker, identifiers => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(identifiers.map(assetIdentifierToSecurityIdentifier));
      });
    }

    const assetIdentifiers = await asset.identifiers(rawTicker);

    return assetIdentifiers.map(assetIdentifierToSecurityIdentifier);
  }

  /**
   * Check whether transfers are frozen for the Asset
   *
   * @note can be subscribed to
   */
  public isFrozen(): Promise<boolean>;
  public isFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async isFrozen(callback?: SubCallback<boolean>): Promise<boolean | UnsubCallback> {
    const {
      ticker,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    if (callback) {
      return asset.frozen(rawTicker, frozen => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(boolToBoolean(frozen));
      });
    }

    const result = await asset.frozen(rawTicker);

    return boolToBoolean(result);
  }

  /**
   * Retrieve the Asset's data
   *
   * @note can be subscribed to
   */
  public details(): Promise<AssetDetails>;
  public details(callback: SubCallback<AssetDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<AssetDetails>
  ): Promise<AssetDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset, externalAgents },
        },
      },
      ticker,
      context,
    } = this;

    const assembleResult = async (
      optToken: Option<PalletAssetSecurityToken>,
      agentGroups: [
        StorageKey<[PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]>,
        Option<PolymeshPrimitivesAgentAgentGroup>
      ][],
      assetName: Option<Bytes>
    ): Promise<AssetDetails> => {
      const fullAgents: Identity[] = [];

      if (optToken.isNone) {
        throw new PolymeshError({
          message: 'Asset detail information not found',
          code: ErrorCode.DataUnavailable,
        });
      }

      const { totalSupply, divisible, ownerDid, assetType: rawAssetType } = optToken.unwrap();

      agentGroups.forEach(([storageKey, agentGroup]) => {
        const rawAgentGroup = agentGroup.unwrap();
        if (rawAgentGroup.isFull) {
          fullAgents.push(new Identity({ did: identityIdToString(storageKey.args[1]) }, context));
        }
      });

      const owner = new Identity({ did: identityIdToString(ownerDid) }, context);
      const { value, type } = assetTypeToKnownOrId(rawAssetType);

      let assetType: string;
      if (value instanceof BigNumber) {
        const customType = await asset.customTypes(bigNumberToU32(value, context));
        assetType = bytesToString(customType);
      } else {
        assetType = value;
      }

      return {
        assetType,
        nonFungible: type === 'NonFungible',
        isDivisible: boolToBoolean(divisible),
        name: bytesToString(assetName.unwrap()),
        owner,
        totalSupply: balanceToBigNumber(totalSupply),
        fullAgents,
      };
    };

    const rawTicker = stringToTicker(ticker, context);

    const groupOfAgentPromise = externalAgents.groupOfAgent.entries(rawTicker);
    const namePromise = asset.assetNames(rawTicker);

    if (callback) {
      const groupEntries = await groupOfAgentPromise;
      const assetName = await namePromise;

      return asset.tokens(rawTicker, async securityToken => {
        const result = await assembleResult(securityToken, groupEntries, assetName);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(result);
      });
    }

    const [token, groups, name] = await Promise.all([
      asset.tokens(rawTicker),
      groupOfAgentPromise,
      namePromise,
    ]);
    return assembleResult(token, groups, name);
  }
}
