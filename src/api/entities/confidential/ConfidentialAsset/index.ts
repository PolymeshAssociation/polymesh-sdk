import { PalletConfidentialAssetConfidentialAssetDetails } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec';

import { ConfidentialAccount, Context, Entity, Identity, PolymeshError } from '~/internal';
import { ConfidentialAssetDetails, ErrorCode, GroupedAuditors } from '~/types';
import {
  bytesToString,
  identityIdToString,
  serializeConfidentialAssetId,
  tickerToString,
  u128ToBigNumber,
} from '~/utils/conversion';
import { assertCaAssetValid } from '~/utils/internal';

/**
 * Properties that uniquely identify a ConfidentialAsset
 */
export interface UniqueIdentifiers {
  /**
   * ID of the asset
   *
   * @note the value can either be a valid asset ID like `76702175-d8cb-e3a5-5a19-734433351e26` or can be a string representing the asset ID without the `-` like `76702175d8cbe3a55a19734433351e26`
   */
  id: string;
}

/**
 * Represents a ConfidentialAsset in the Polymesh blockchain
 */
export class ConfidentialAsset extends Entity<UniqueIdentifiers, string> {
  /**
   * ID of the Confidential Asset
   */
  public id: string;

  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return typeof id === 'string';
  }

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = assertCaAssetValid(id);
  }

  /**
   * @hidden
   */
  private async getDetailsFromChain(): Promise<
    Option<PalletConfidentialAssetConfidentialAssetDetails>
  > {
    const {
      id,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawAssetId = serializeConfidentialAssetId(id);

    return confidentialAsset.details(rawAssetId);
  }

  /**
   * Retrieve the confidential Asset's details
   */
  public async details(): Promise<ConfidentialAssetDetails | null> {
    const { context } = this;
    const assetDetails = await this.getDetailsFromChain();

    if (assetDetails.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exists',
      });
    }

    const { data, ticker, ownerDid, totalSupply } = assetDetails.unwrap();

    return {
      ticker: ticker.isNone ? undefined : tickerToString(ticker.unwrap()),
      data: bytesToString(data),
      totalSupply: u128ToBigNumber(totalSupply),
      owner: new Identity({ did: identityIdToString(ownerDid) }, context),
    };
  }

  /**
   * Retrieve all the auditors for this confidential Asset grouped by their type
   */
  public async getAuditors(): Promise<GroupedAuditors> {
    const {
      id,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      context,
    } = this;

    const rawAssetId = serializeConfidentialAssetId(id);

    const assetAuditors = await confidentialAsset.assetAuditors(rawAssetId);

    if (assetAuditors.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exists',
      });
    }

    const { auditors, mediators } = assetAuditors.unwrap();

    return {
      auditors: [...auditors].map(
        auditor => new ConfidentialAccount({ publicKey: auditor.toString() }, context)
      ),
      mediators: [...mediators].map(
        mediator => new Identity({ did: identityIdToString(mediator) }, context)
      ),
    };
  }

  /**
   * Determine whether this confidential Asset exists on chain
   */
  public async exists(): Promise<boolean> {
    const details = await this.getDetailsFromChain();
    return details.isSome;
  }

  /**
   * Return the confidential Asset's ID
   */
  public toHuman(): string {
    return this.id;
  }
}
