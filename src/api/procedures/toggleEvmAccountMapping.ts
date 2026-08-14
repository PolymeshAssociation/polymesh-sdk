import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { evmAddressFromSs58, isEthDerivedAddress } from '~/utils/eth';

export interface ToggleEvmAccountMappingParams {
  map: boolean;
}

/**
 * @hidden
 */
export async function prepareToggleEvmAccountMapping(
  this: Procedure<ToggleEvmAccountMappingParams, void>,
  args: ToggleEvmAccountMappingParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'revive', 'mapAccount'>>
  | TransactionSpec<void, ExtrinsicParams<'revive', 'unmapAccount'>>
> {
  const { context } = this;
  const { map } = args;

  const {
    polymeshApi: {
      tx: { revive: reviveTx },
      query: { revive: reviveQuery },
    },
  } = context;

  const signingAddress = context.getSigningAddress();

  /*
   * The chain resolves an Ethereum-derived Account by stripping its `0xEE` padding, so there is
   *   nothing to map. `revive.mapAccount` rejects an `Address20` origin outright
   */
  if (isEthDerivedAddress(signingAddress, context.ss58Format)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'An Ethereum-derived Account cannot be mapped. The chain already resolves its Ethereum address by stripping the padding from the Account',
      data: { signingAddress },
    });
  }

  const evmAddress = evmAddressFromSs58(signingAddress, context.ss58Format);

  const rawOriginalAccount = await reviveQuery.originalAccount(evmAddress);

  if (map) {
    if (rawOriginalAccount.isSome) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'The signing Account is already mapped to its Ethereum address',
        data: { signingAddress, evmAddress },
      });
    }

    return { transaction: reviveTx.mapAccount, resolver: undefined };
  }

  if (rawOriginalAccount.isNone) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The signing Account is not mapped to its Ethereum address',
      data: { signingAddress, evmAddress },
    });
  }

  return { transaction: reviveTx.unmapAccount, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleEvmAccountMappingParams, void>
): ProcedureAuthorization {
  return {
    permissions: {
      // `revive.{map,unmap}_account` are gated by `ensure_signed` only — confirmed against the
      // runtime — so they never consult `ExtrinsicPermissions`. Declaring the tags would make the
      // pre-flight check stricter than the chain and reject secondary keys the chain accepts.
      transactions: [],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleEvmAccountMapping = (): Procedure<ToggleEvmAccountMappingParams, void> =>
  new Procedure(prepareToggleEvmAccountMapping, getAuthorization);
