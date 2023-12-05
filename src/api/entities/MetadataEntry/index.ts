import { Bytes, Option } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';

import { BaseAsset, clearMetadata, Context, Entity, setMetadata } from '~/internal';
import { NoArgsProcedureMethod, ProcedureMethod, SetMetadataParams } from '~/types';
import {
  bigNumberToU64,
  bytesToString,
  meshMetadataSpecToMetadataSpec,
  meshMetadataValueToMetadataValue,
  metadataToMeshMetadataKey,
  stringToTicker,
} from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

import { MetadataDetails, MetadataType, MetadataValue } from './types';

export interface UniqueIdentifiers {
  ticker: string;
  type: MetadataType;
  id: BigNumber;
}

export interface HumanReadable {
  id: string;
  ticker: string;
  type: MetadataType;
}

/**
 * Represents an Asset MetadataEntry in the Polymesh blockchain
 */
export class MetadataEntry extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * Asset for which this is the metadata
   */
  public asset: BaseAsset;

  /**
   * Type of metadata represented by this instance
   */
  public type: MetadataType;

  /**
   * identifier number of the MetadataEntry
   */
  public id: BigNumber;

  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker, type } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string' && type in MetadataType;
  }

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker, type, id } = identifiers;

    this.asset = new BaseAsset({ ticker }, context);
    this.type = type;
    this.id = id;

    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setMetadata, { ...args, metadataEntry: this }] },
      context
    );
    this.clear = createProcedureMethod(
      { getProcedureAndArgs: () => [clearMetadata, { metadataEntry: this }], voidArgs: true },
      context
    );
  }

  /**
   * Assign new value for the MetadataEntry along with its details or optionally only set the details (expiry + lock status) of any Metadata value
   *
   * @note - Value or the details can only be set if the MetadataEntry is not locked
   */
  public set: ProcedureMethod<SetMetadataParams, MetadataEntry>;

  /**
   * Removes the asset metadata value
   *
   * @throws
   *   - if the Metadata doesn't exists
   *   - if the Metadata value is locked
   */
  public clear: NoArgsProcedureMethod<void>;

  /**
   * Retrieve name and specs for this MetadataEntry
   */
  public async details(): Promise<MetadataDetails> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: {
              assetMetadataLocalKeyToName,
              assetMetadataLocalSpecs,
              assetMetadataGlobalKeyToName,
              assetMetadataGlobalSpecs,
            },
          },
        },
      },
      id,
      asset: { ticker },
      type,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const rawTicker = stringToTicker(ticker, context);

    let rawName, rawSpecs;
    if (type === MetadataType.Local) {
      [rawName, rawSpecs] = await Promise.all([
        assetMetadataLocalKeyToName(rawTicker, rawId),
        assetMetadataLocalSpecs(rawTicker, rawId),
      ]);
    } else {
      [rawName, rawSpecs] = await Promise.all([
        assetMetadataGlobalKeyToName(rawId),
        assetMetadataGlobalSpecs(rawId),
      ]);
    }

    return {
      name: bytesToString(rawName.unwrap()),
      specs: meshMetadataSpecToMetadataSpec(rawSpecs),
    };
  }

  /**
   * Retrieve the value and details (expiry + lock status) for this MetadataEntry
   *
   * @note - This returns `null` if no value is yet specified for this MetadataEntry
   */
  public async value(): Promise<MetadataValue | null> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetMetadataValues, assetMetadataValueDetails },
          },
        },
      },
      id,
      type,
      asset: { ticker },
      context,
    } = this;

    const rawMetadataKey = metadataToMeshMetadataKey(type, id, context);
    const rawTicker = stringToTicker(ticker, context);

    const [rawValue, rawValueDetails] = await Promise.all([
      assetMetadataValues(rawTicker, rawMetadataKey),
      assetMetadataValueDetails(rawTicker, rawMetadataKey),
    ]);

    return meshMetadataValueToMetadataValue(rawValue, rawValueDetails);
  }

  /**
   * Determine whether this MetadataEntry exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetMetadataGlobalKeyToName, assetMetadataLocalKeyToName },
          },
        },
      },
      id,
      type,
      asset: { ticker },
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);

    let rawName: Option<Bytes>;

    if (type === MetadataType.Global) {
      rawName = await assetMetadataGlobalKeyToName(rawId);
    } else {
      const rawTicker = stringToTicker(ticker, context);
      rawName = await assetMetadataLocalKeyToName(rawTicker, rawId);
    }

    return rawName.isSome;
  }

  /**
   * Return the MetadataEntry's ID, Asset ticker and Metadata type
   */
  public toHuman(): HumanReadable {
    const { asset, id, type } = this;

    return toHumanReadable({
      ticker: asset,
      id,
      type,
    });
  }
}
