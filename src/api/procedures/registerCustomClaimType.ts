import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RegisterCustomClaimTypeParams, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { u32ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = RegisterCustomClaimTypeParams;

/**
 * @hidden
 */
export const createRegisterCustomClaimTypeResolver =
  () =>
  (receipt: ISubmittableResult): BigNumber => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'CustomClaimTypeAdded');

    return u32ToBigNumber(data[1]);
  };

/**
 * @hidden
 */
export async function prepareRegisterCustomClaimType(
  this: Procedure<RegisterCustomClaimTypeParams, BigNumber>,
  args: RegisterCustomClaimTypeParams
): Promise<TransactionSpec<BigNumber, ExtrinsicParams<'identity', 'registerCustomClaimType'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { identity },
        query: { identity: identityQuery },
        consts: {
          base: { maxLen },
        },
      },
    },
  } = this;
  const { name } = args;

  const claimTypeMaxLength = u32ToBigNumber(maxLen);

  if (claimTypeMaxLength.lt(name.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'CustomClaimType name length exceeded',
      data: {
        maxLength: claimTypeMaxLength,
      },
    });
  }

  const customClaimTypeIdOpt = await identityQuery.customClaimsInverse(name);

  if (customClaimTypeIdOpt.isSome) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `The CustomClaimType with "${name}" already exists`,
    });
  }

  return {
    transaction: identity.registerCustomClaimType,
    args: [name],
    resolver: createRegisterCustomClaimTypeResolver(),
  };
}

/**
 * @hidden
 */
export const registerCustomClaimType = (): Procedure<RegisterCustomClaimTypeParams, BigNumber> =>
  new Procedure(prepareRegisterCustomClaimType, {
    roles: [],
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [TxTags.identity.RegisterCustomClaimType],
    },
  });
