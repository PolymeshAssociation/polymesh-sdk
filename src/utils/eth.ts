import { BN, hexToU8a, isHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { decodeAddress, encodeAddress, ethereumEncode } from '@polkadot/util-crypto';
import { PalletRevivePrimitivesEthTransactError } from '@polymeshassociation/polymesh-types/polkadot/types-lookup';
import BigNumber from 'bignumber.js';

import { Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

/**
 * @hidden
 *
 * The last 12 bytes of an `AccountId32` derived from an Ethereum key. Mirrors revive's
 *   `is_eth_derived`/`to_fallback_account_id`: `AccountId32 = <20-byte H160> ++ [0xEE; 12]`
 */
const ETH_SUFFIX_LENGTH = 12;
const ETH_SUFFIX_BYTE = 0xee;

/**
 * @hidden
 *
 * Length of an `AccountId32`, and the offset at which its Ethereum suffix begins
 */
const ACCOUNT_ID_LENGTH = 32;
const H160_LENGTH = 20;

/**
 * Return whether the given SS58 address was derived from an Ethereum key, i.e. whether the last
 *   12 bytes of the decoded `AccountId32` are `0xEE`
 *
 * @note tolerant of a malformed address: returns `false` rather than throwing, since this runs on
 *   every transaction submission
 */
export function isEthDerivedAddress(address: string, ss58Format: BigNumber): boolean {
  try {
    const decoded = decodeAddress(address, false, ss58Format.toNumber());

    /*
     * SS58 also encodes shorter keys (1, 2, 4, 8 and 33 bytes), so the length must be checked
     *   before the suffix — this guarantees the slice below is exactly `ETH_SUFFIX_LENGTH` long
     */
    if (decoded.length !== ACCOUNT_ID_LENGTH) {
      return false;
    }

    return decoded.subarray(H160_LENGTH).every(byte => byte === ETH_SUFFIX_BYTE);
  } catch (err) {
    return false;
  }
}

/**
 * Convert the SS58 address of an Ethereum-derived Account into its controlling, checksummed
 *   (EIP-55) `0x`-prefixed Ethereum address
 *
 * @throws if the address is not a validly encoded, Ethereum-derived address
 */
export function ethAddressFromSs58(address: string, ss58Format: BigNumber): HexString {
  if (!isEthDerivedAddress(address, ss58Format)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied address is not an Ethereum-derived Account',
      data: { address },
    });
  }

  const decoded = decodeAddress(address, false, ss58Format.toNumber());

  return ethereumEncode(decoded.subarray(0, H160_LENGTH)) as HexString;
}

/**
 * Convert an Ethereum address into the SS58 address of the Account it controls:
 *   `ss58(<h160> ++ [0xEE; 12])`
 *
 * @throws if `h160` is not a 20 byte hex encoded address
 */
export function ss58FromEthAddress(h160: string, ss58Format: BigNumber): string {
  /*
   * `hexToU8a` is lenient — it decodes non-hex input to garbage bytes rather than throwing — so
   *   the input must be validated up front, otherwise malformed input is reported as a length
   *   problem rather than as the hex problem it actually is
   */
  if (!isHex(h160)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied Ethereum address is not valid hex',
      data: { h160 },
    });
  }

  const addressBytes = hexToU8a(h160);

  if (addressBytes.length !== H160_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied Ethereum address must be 20 bytes long',
      data: { h160 },
    });
  }

  const accountId = new Uint8Array(ACCOUNT_ID_LENGTH);
  accountId.set(addressBytes, 0);
  accountId.set(new Uint8Array(ETH_SUFFIX_LENGTH).fill(ETH_SUFFIX_BYTE), H160_LENGTH);

  return encodeAddress(accountId, ss58Format.toNumber());
}

/**
 * @hidden
 *
 * Format of the `Message` variant the chain produces for a failed runtime dispatch on the
 *   `revive.ethTransact` dry-run path:
 *
 * ```text
 * Failed to dispatch call: Module(ModuleError { index: 7, error: [0, 0, 0, 0], message: Some("AlreadyLinked") })
 * ```
 */
const MODULE_ERROR_PATTERN = /Module\(ModuleError \{ index: (\d+), error: \[([\d,\s]+)\]/;

/**
 * @hidden
 *
 * Parse the `Err` variant returned by `reviveApi.ethTransactWithConfig`'s dry run into the same
 *   `PolymeshError` shape a failed native dispatch would produce
 *
 * - `Message` matching the module error pattern is resolved through chain metadata, so the
 *   message is identical to what `handleExtrinsicFailure` would produce for the same error
 * - `Message` not matching the pattern (e.g. gas/balance related failures, "Failed to
 *   instantiate") falls back to `ErrorCode.UnexpectedError`, carrying the raw string. It is never
 *   swallowed
 * - `Data` is EVM revert data. It is unreachable on the sentinel path (the sentinel is not a
 *   contract), so it is mapped to `ErrorCode.UnexpectedError` with the raw hex attached. No ABI
 *   decoding is attempted
 */
export function parseEthTransactError(
  error: PalletRevivePrimitivesEthTransactError,
  context: Context
): PolymeshError {
  if (error.isData) {
    return new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'The Ethereum transaction dry run failed with EVM revert data',
      data: { data: error.asData.toHex() },
    });
  }

  const rawMessage = error.asMessage.toString();

  const match = rawMessage.match(MODULE_ERROR_PATTERN);

  if (match) {
    const [, indexString, errorBytesString] = match as [string, string, string];
    const index = new BN(indexString);
    const errorBytes = Uint8Array.from(
      errorBytesString.split(',').map(byte => parseInt(byte.trim(), 10))
    );

    try {
      const meta = context.polymeshApi.registry.findMetaError({ index, error: errorBytes });

      return new PolymeshError({
        code: ErrorCode.TransactionReverted,
        message: `${meta.section}.${meta.name}: ${meta.docs.join(' ')}`,
      });
    } catch (err) {
      // fall through to the generic branch below if metadata lookup itself fails
    }
  }

  return new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message: rawMessage,
  });
}
