import { Context, Entity } from '~/internal';
import { SecurityIdentifier, SubCallback, UnsubCallback } from '~/types';
import { tickerToDid } from '~/utils';
import {
  assetIdentifierToSecurityIdentifier,
  boolToBoolean,
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
}
