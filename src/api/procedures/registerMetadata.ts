import { ISubmittableResult } from '@polkadot/types/types';

import { Asset, Context, MetadataEntry, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, MetadataType, RegisterMetadataParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  metadataSpecToMeshMetadataSpec,
  metadataValueDetailToMeshMetadataValueDetail,
  metadataValueToMeshMetadataValue,
  stringToBytes,
  stringToTicker,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, optionize, requestMulti } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RegisterMetadataParams & {
  ticker: string;
};

/**
 * @hidden
 */
export const createMetadataResolver =
  (ticker: string, context: Context) =>
  (receipt: ISubmittableResult): MetadataEntry => {
    const [{ data }] = filterEventRecords(receipt, 'asset', 'RegisterAssetMetadataLocalType');

    const id = u64ToBigNumber(data[3]);

    return new MetadataEntry({ id, ticker, type: MetadataType.Local }, context);
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
  const { name, ticker, specs } = params;

  const rawTicker = stringToTicker(ticker, context);

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
    [assetMetadataLocalNameToKey, rawTicker, rawName],
  ]);

  if (rawGlobalId.isSome || rawLocalId.isSome) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `Metadata with name "${name}" already exists`,
    });
  }

  const args = [rawTicker, rawName, metadataSpecToMeshMetadataSpec(specs, context)];

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
      resolver: createMetadataResolver(ticker, context),
    };
  }

  return {
    transaction: tx.asset.registerAssetMetadataLocalType,
    args,
    resolver: createMetadataResolver(ticker, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, MetadataEntry>,
  params: Params
): ProcedureAuthorization {
  const { context } = this;

  const { ticker } = params;

  const transactions = [];

  if ('value' in params) {
    transactions.push(TxTags.asset.RegisterAndSetLocalAssetMetadata);
  } else {
    transactions.push(TxTags.asset.RegisterAssetMetadataLocalType);
  }

  return {
    permissions: {
      transactions,
      assets: [new Asset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const registerMetadata = (): Procedure<Params, MetadataEntry> =>
  new Procedure(prepareRegisterMetadata, getAuthorization);
