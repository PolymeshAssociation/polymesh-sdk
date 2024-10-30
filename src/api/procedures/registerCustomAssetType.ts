import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RegisterCustomAssetTypeParams, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToBytes, u32ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export const createRegisterCustomAssetTypeResolver =
  () =>
  (receipt: ISubmittableResult): BigNumber => {
    const [{ data }] = filterEventRecords(receipt, 'asset', 'CustomAssetTypeRegistered');

    return u32ToBigNumber(data[1]);
  };

/**
 * @hidden
 */
export async function prepareRegisterCustomAssetType(
  this: Procedure<RegisterCustomAssetTypeParams, BigNumber>,
  args: RegisterCustomAssetTypeParams
): Promise<TransactionSpec<BigNumber, ExtrinsicParams<'asset', 'registerCustomAssetType'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
        query: {
          asset: { customTypesInverse },
        },
        consts: {
          base: { maxLen },
        },
      },
    },
    context,
  } = this;
  const { name } = args;

  const customAssetTypeMaxLength = u32ToBigNumber(maxLen);

  if (customAssetTypeMaxLength.lt(name.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Custom Asset type name length exceeded',
      data: {
        maxLength: customAssetTypeMaxLength,
      },
    });
  }

  const rawName = stringToBytes(name, context);
  const rawCustomAssetTypeId = await customTypesInverse(rawName);

  if (rawCustomAssetTypeId.isSome) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `The Custom Asset Type with "${name}" already exists`,
      data: {
        customAssetTypeId: u32ToBigNumber(rawCustomAssetTypeId.unwrap()),
      },
    });
  }

  return {
    transaction: asset.registerCustomAssetType,
    args: [rawName],
    resolver: createRegisterCustomAssetTypeResolver(),
  };
}

/**
 * @hidden
 */
export const registerCustomAssetType = (): Procedure<RegisterCustomAssetTypeParams, BigNumber> =>
  new Procedure(prepareRegisterCustomAssetType, {
    roles: [],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.asset.RegisterCustomAssetType],
    },
  });
