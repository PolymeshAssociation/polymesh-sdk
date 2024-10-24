import { Bytes, Option } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';

import {
  BaseAsset,
  clearMetadata,
  Context,
  Entity,
  PolymeshError,
  removeLocalMetadata,
  setMetadata,
} from '~/internal';
import { ErrorCode, NoArgsProcedureMethod, ProcedureMethod, SetMetadataParams } from '~/types';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  bytesToString,
  meshMetadataSpecToMetadataSpec,
  meshMetadataValueToMetadataValue,
  metadataToMeshMetadataKey,
} from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

import { MetadataDetails, MetadataLockStatus, MetadataType, MetadataValue } from './types';

export interface UniqueIdentifiers {
  type: MetadataType;
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  assetId: string;
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
    const { id, assetId, type } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string' && type in MetadataType;
  }

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { type, id, assetId } = identifiers;

    this.asset = new BaseAsset({ assetId }, context);
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
    this.remove = createProcedureMethod(
      { getProcedureAndArgs: () => [removeLocalMetadata, { metadataEntry: this }], voidArgs: true },
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
   * Removes a local Asset Metadata key along with its value
   *
   * @note A global Metadata key cannot be deleted
   *
   * @throws
   *   - if the Metadata type is global
   *   - if the Metadata doesn't exists
   *   - if the Metadata value is locked
   *   - if the Metadata is a mandatory key for any NFT Collection
   */
  public remove: NoArgsProcedureMethod<void>;

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
      asset,
      type,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const rawAssetId = assetToMeshAssetId(asset, context);

    let rawName, rawSpecs;
    if (type === MetadataType.Local) {
      [rawName, rawSpecs] = await Promise.all([
        assetMetadataLocalKeyToName(rawAssetId, rawId),
        assetMetadataLocalSpecs(rawAssetId, rawId),
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
      asset,
      context,
    } = this;

    const rawMetadataKey = metadataToMeshMetadataKey(type, id, context);
    const rawAssetId = assetToMeshAssetId(asset, context);

    const [rawValue, rawValueDetails] = await Promise.all([
      assetMetadataValues(rawAssetId, rawMetadataKey),
      assetMetadataValueDetails(rawAssetId, rawMetadataKey),
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
      asset,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);

    let rawName: Option<Bytes>;

    if (type === MetadataType.Global) {
      rawName = await assetMetadataGlobalKeyToName(rawId);
    } else {
      const rawAssetId = assetToMeshAssetId(asset, context);
      rawName = await assetMetadataLocalKeyToName(rawAssetId, rawId);
    }

    return rawName.isSome;
  }

  /**
   * Check if the MetadataEntry can be modified.
   * A MetadataEntry is modifiable if it exists and is not locked
   */
  public async isModifiable(): Promise<{ canModify: boolean; reason?: PolymeshError }> {
    const {
      id,
      type,
      asset: { id: assetId },
    } = this;

    const [exists, metadataValue] = await Promise.all([this.exists(), this.value()]);

    if (!exists) {
      return {
        canModify: false,
        reason: new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'Metadata does not exists for the Asset',
          data: {
            assetId,
            type,
            id,
          },
        }),
      };
    }

    if (metadataValue) {
      const { lockStatus } = metadataValue;

      if (lockStatus === MetadataLockStatus.Locked) {
        return {
          canModify: false,
          reason: new PolymeshError({
            code: ErrorCode.UnmetPrerequisite,
            message: 'Metadata is locked and cannot be modified',
          }),
        };
      }

      if (lockStatus === MetadataLockStatus.LockedUntil) {
        const { lockedUntil } = metadataValue;

        if (new Date() < lockedUntil) {
          return {
            canModify: false,
            reason: new PolymeshError({
              code: ErrorCode.UnmetPrerequisite,
              message: 'Metadata is currently locked',
              data: {
                lockedUntil,
              },
            }),
          };
        }
      }
    }

    return {
      canModify: true,
    };
  }

  /**
   * Return the MetadataEntry's ID, Asset ticker and Metadata type
   */
  public toHuman(): HumanReadable {
    const { asset, id, type } = this;

    return toHumanReadable({
      assetId: asset,
      id,
      type,
    });
  }
}
