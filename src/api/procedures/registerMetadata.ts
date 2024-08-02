import { ISubmittableResult } from '@polkadot/types/types';

import { BaseAsset, Context, MetadataEntry, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MetadataType, RegisterMetadataParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  metadataSpecToMeshMetadataSpec,
  metadataValueDetailToMeshMetadataValueDetail,
  metadataValueToMeshMetadataValue,
  stringToBytes,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, optionize, requestMulti } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RegisterMetadataParams & {
  asset: BaseAsset;
};

/**
 * @hidden
 */
export const createMetadataResolver =
  (assetId: string, context: Context) =>
  (receipt: ISubmittableResult): MetadataEntry => {
    const [{ data }] = filterEventRecords(receipt, 'asset', 'RegisterAssetMetadataLocalType');

    const id = u64ToBigNumber(data[3]);

    return new MetadataEntry({ id, assetId, type: MetadataType.Local }, context);
  };

/**
 * @hidden
 */
export async function prepareRegisterMetadata(
  this: Procedure<Params, MetadataEntry>,
  params: Params
): Promise<
  | TransactionSpec<MetadataEntry, ExtrinsicParams<'assets', 'registerAssetMetadataLocalType'>>
  | TransactionSpec<MetadataEntry, ExtrinsicParams<'assets', 'registerAndSetLocalAssetMetadata'>>
> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: {
          asset: { assetMetadataGlobalNameToKey, assetMetadataLocalNameToKey },
        },
        consts: {
          asset: { assetMetadataNameMaxLength },
        },
      },
    },
    context,
  } = this;
  const { name, asset, specs } = params;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const metadataNameMaxLength = u32ToBigNumber(assetMetadataNameMaxLength);
  if (metadataNameMaxLength.lt(name.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset Metadata name length exceeded',
      data: {
        maxLength: metadataNameMaxLength,
      },
    });
  }

  const rawName = stringToBytes(name, context);

  const [rawGlobalId, rawLocalId] = await requestMulti<
    [typeof assetMetadataGlobalNameToKey, typeof assetMetadataLocalNameToKey]
  >(context, [
    [assetMetadataGlobalNameToKey, rawName],
    [assetMetadataLocalNameToKey, [rawAssetId, rawName]],
  ]);

  if (rawGlobalId.isSome || rawLocalId.isSome) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `Metadata with name "${name}" already exists`,
    });
  }

  const args = [rawAssetId, rawName, metadataSpecToMeshMetadataSpec(specs, context)];

  if ('value' in params) {
    // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-unused-vars
    const { value, details } = params;

    return {
      transaction: tx.asset.registerAndSetLocalAssetMetadata,
      args: [
        ...args,
        metadataValueToMeshMetadataValue(value, context),
        optionize(metadataValueDetailToMeshMetadataValueDetail)(details, context),
      ],
      resolver: createMetadataResolver(asset.id, context),
    };
  }

  return {
    transaction: tx.asset.registerAssetMetadataLocalType,
    args,
    resolver: createMetadataResolver(asset.id, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, MetadataEntry>,
  params: Params
): ProcedureAuthorization {
  const transactions = [];

  if ('value' in params) {
    transactions.push(TxTags.asset.RegisterAndSetLocalAssetMetadata);
  } else {
    transactions.push(TxTags.asset.RegisterAssetMetadataLocalType);
  }

  return {
    permissions: {
      transactions,
      assets: [params.asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const registerMetadata = (): Procedure<Params, MetadataEntry> =>
  new Procedure(prepareRegisterMetadata, getAuthorization);
