import { Bytes, Option, u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  BaseAsset,
  Context,
  MetadataEntry,
  Namespace,
  PolymeshError,
  registerMetadata,
} from '~/internal';
import {
  ErrorCode,
  MetadataType,
  MetadataWithValue,
  ProcedureMethod,
  RegisterMetadataParams,
} from '~/types';
import {
  bigNumberToU64,
  bytesToString,
  meshMetadataKeyToMetadataKey,
  meshMetadataSpecToMetadataSpec,
  meshMetadataValueToMetadataValue,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Metadata related functionality
 */
export class Metadata extends Namespace<BaseAsset> {
  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.register = createProcedureMethod(
      { getProcedureAndArgs: args => [registerMetadata, { ticker, ...args }] },
      context
    );
  }

  /**
   * Register a metadata for this Asset and optionally set its value.
   * The metadata value can be set by passing `value` parameter and specifying other optional `details` about the value
   *
   * @note This registers a metadata of type `Local`
   */
  public register: ProcedureMethod<RegisterMetadataParams, MetadataEntry>;

  /**
   * Retrieve all (global + local) the MetadataEntry for this Asset
   *
   * @note this returns all available metadata entries for this Asset, with or without any value being associated with the metadata
   */
  public async get(): Promise<MetadataEntry[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetMetadataLocalKeyToName, assetMetadataGlobalKeyToName },
          },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const [rawGlobalKeys, rawLocalKeys] = await Promise.all([
      assetMetadataGlobalKeyToName.entries(),
      assetMetadataLocalKeyToName.entries(rawTicker),
    ]);

    const assembleResult = (rawId: u64, type: MetadataType): MetadataEntry =>
      new MetadataEntry({ ticker, type, id: u64ToBigNumber(rawId) }, context);

    return [
      ...rawGlobalKeys.map(
        ([
          {
            args: [rawId],
          },
        ]) => assembleResult(rawId, MetadataType.Global)
      ),
      ...rawLocalKeys.map(
        ([
          {
            args: [, rawId],
          },
        ]) => assembleResult(rawId, MetadataType.Local)
      ),
    ];
  }

  /**
   * Retrieve a single MetadataEntry by its ID and type
   *
   * @throws if there is no MetadataEntry with the passed ID and specified type
   */
  public async getOne(args: { type: MetadataType; id: BigNumber }): Promise<MetadataEntry> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetMetadataLocalKeyToName, assetMetadataGlobalKeyToName },
          },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const { id, type } = args;

    const rawId = bigNumberToU64(id, context);

    let rawName: Option<Bytes>;

    if (type === MetadataType.Global) {
      rawName = await assetMetadataGlobalKeyToName(rawId);
    } else {
      const rawTicker = stringToTicker(ticker, context);
      rawName = await assetMetadataLocalKeyToName(rawTicker, rawId);
    }

    if (rawName.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no ${type.toLowerCase()} Asset Metadata with id "${id.toString()}"`,
      });
    }

    return new MetadataEntry({ ticker, type, id }, context);
  }

  /**
   * Gets the next local metadata ID for the Asset
   *
   * @hidden
   */
  public async getNextLocalId(): Promise<BigNumber> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: {
            asset: { currentAssetMetadataLocalKey },
          },
        },
      },
    } = this;

    const rawId = await currentAssetMetadataLocalKey(ticker);

    if (rawId.isSome) {
      return u64ToBigNumber(rawId.unwrap()).plus(1);
    }

    return new BigNumber(1);
  }

  /**
   * Retrieve all (local + global) the MetadataEntry details whose value is set for this Asset
   */
  public async getDetails(): Promise<MetadataWithValue[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: {
              assetMetadataValues,
              assetMetadataValueDetails,
              assetMetadataLocalKeyToName,
              assetMetadataGlobalKeyToName,
              assetMetadataGlobalSpecs,
              assetMetadataLocalSpecs,
            },
          },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const [rawValueEntries] = await Promise.all([assetMetadataValues.entries(rawTicker)]);

    const namePromises: Promise<Option<Bytes>>[] = [];
    const specPromises: Promise<Option<PolymeshPrimitivesAssetMetadataAssetMetadataSpec>>[] = [];
    const valueDetailsPromises: Promise<
      Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
    >[] = [];

    rawValueEntries.forEach(
      ([
        {
          args: [, rawMetadataKey],
        },
      ]) => {
        valueDetailsPromises.push(assetMetadataValueDetails(rawTicker, rawMetadataKey));

        if (rawMetadataKey.isLocal) {
          namePromises.push(assetMetadataLocalKeyToName(rawTicker, rawMetadataKey.asLocal));
          specPromises.push(assetMetadataLocalSpecs(rawTicker, rawMetadataKey.asLocal));
        } else {
          namePromises.push(assetMetadataGlobalKeyToName(rawMetadataKey.asGlobal));
          specPromises.push(assetMetadataGlobalSpecs(rawMetadataKey.asGlobal));
        }
      }
    );

    const nameValues = await Promise.all(namePromises);
    const specValues = await Promise.all(specPromises);
    const valueDetails = await Promise.all(valueDetailsPromises);

    return rawValueEntries.map((rawValueEntry, index) => {
      const [
        {
          args: [, rawMetadataKey],
        },
        rawValue,
      ] = rawValueEntry;

      return {
        metadataEntry: new MetadataEntry(
          {
            ...meshMetadataKeyToMetadataKey(rawMetadataKey, ticker),
            ticker,
          },
          context
        ),
        name: bytesToString(nameValues[index].unwrap()),
        specs: meshMetadataSpecToMetadataSpec(specValues[index]),
        ...meshMetadataValueToMetadataValue(rawValue, valueDetails[index])!,
      };
    });
  }
}
