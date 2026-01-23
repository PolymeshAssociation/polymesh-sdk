import BigNumber from 'bignumber.js';

import {
  ConfidentialAssetAuditors,
  ConfidentialAssetDetails,
} from '~/api/entities/ConfidentialAsset/types';
import { Context, Entity, Identity, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { identityIdToString } from '~/utils/conversion';

export interface UniqueIdentifiers {
  /**
   * The confidential asset ID (u32)
   */
  id: BigNumber;
}

/**
 * Represents a DART Confidential Asset on the Polymesh blockchain.
 *
 * Confidential Assets use zero-knowledge proofs and CurveTrees for privacy-preserving
 * transfers while maintaining regulatory compliance.
 */
export class ConfidentialAsset extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * The confidential asset ID (u32)
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * @hidden
   * Helper to get the confidentialAssets query module
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getConfidentialAssetsQuery(): any {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidentialAssets = (query as any).confidentialAssets;
    if (!confidentialAssets) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential assets module is not available on this chain',
      });
    }

    return confidentialAssets;
  }

  /**
   * Determine whether this Confidential Asset exists on chain
   */
  public async exists(): Promise<boolean> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const assetDetails = await confidentialAssets.dartAssetDetails(id.toNumber());

    return assetDetails.isSome;
  }

  /**
   * Get the details of this Confidential Asset
   *
   * @throws if the Confidential Asset does not exist
   */
  public async details(): Promise<ConfidentialAssetDetails> {
    const { id, context } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();
    const assetId = id.toNumber();

    const [rawDetails, rawName, rawSymbol, rawDecimals] = await Promise.all([
      confidentialAssets.dartAssetDetails(assetId),
      confidentialAssets.confidentialAssetNames(assetId),
      confidentialAssets.confidentialAssetSymbols(assetId),
      confidentialAssets.confidentialAssetDecimals(assetId),
    ]);

    if (rawDetails.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exist',
      });
    }

    const details = rawDetails.unwrap();

    const owner = new Identity({ did: identityIdToString(details.owner) }, context);

    return {
      id,
      name: rawName.isSome ? rawName.unwrap().toString() : '',
      symbol: rawSymbol.isSome ? rawSymbol.unwrap().toString() : '',
      decimals: rawDecimals.isSome ? rawDecimals.unwrap().toNumber() : 0,
      owner,
      data: details.data.toString(),
      totalSupply: new BigNumber(details.totalSupply.toNumber()),
    };
  }

  /**
   * Get the auditors and mediators for this Confidential Asset
   *
   * @throws if the Confidential Asset does not exist
   */
  public async getAuditors(): Promise<ConfidentialAssetAuditors> {
    const { id } = this;

    const confidentialAssets = this.getConfidentialAssetsQuery();

    const rawDetails = await confidentialAssets.dartAssetDetails(id.toNumber());

    if (rawDetails.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Confidential Asset does not exist',
      });
    }

    const details = rawDetails.unwrap();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auditors = [...details.auditors].map((auditor: any) => auditor.toString());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediators = [...details.mediators].map((mediator: any) => mediator.toString());

    return {
      auditors,
      mediators,
    };
  }

  /**
   * Return the Confidential Asset's ID as a string
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
