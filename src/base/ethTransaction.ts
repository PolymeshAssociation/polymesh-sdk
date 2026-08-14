import { SubmittableExtrinsic } from '@polkadot/api/types';
import { GenericExtrinsic } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { keccakAsHex } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';

import { EthSigner, EthTransactionRequest } from '~/base/types';
import { extrinsicHashMatcher, ExtrinsicMatcher } from '~/base/utils';
import { Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';
import { PollingSubmission, SubscriptionSubmission } from '~/types/internal';
import { u64ToBigNumber } from '~/utils/conversion';
import { ethAddressFromSs58, parseEthTransactError } from '~/utils/eth';

/**
 * @hidden
 *
 * Which of the two submission strategies an {@link EthSigner} supports. The SDK reads
 *   `capabilities` to make this decision; it never probes the provider itself
 *
 * - `sdkBroadcast` (`signTransaction`): the signer returns raw signed bytes, and the SDK submits
 *   and tracks the transaction the same way it would a native one. The SDK owns the nonce
 * - `walletBroadcast` (`sendTransaction`): the wallet signs AND broadcasts, so the wallet owns the
 *   nonce and the SDK correlates the result by scanning blocks for the matching
 *   `revive.ethTransact` extrinsic
 */
export type EthSubmissionMode = 'sdkBroadcast' | 'walletBroadcast';

/**
 * @hidden
 */
export function getEthSubmissionMode(ethSigner: EthSigner): EthSubmissionMode {
  if (ethSigner.capabilities.signTransaction) {
    return 'sdkBroadcast';
  }

  if (ethSigner.capabilities.sendTransaction) {
    return 'walletBroadcast';
  }

  throw new PolymeshError({
    code: ErrorCode.General,
    message:
      'The attached Ethereum signer does not support signing or sending transactions. Please report this to the Polymesh team',
  });
}

/**
 * @hidden
 *
 * `0x`-prefixed, minimal (no leading zeros) hex "quantity" encoding, as used throughout the
 *   Ethereum JSON-RPC spec for `gas`, `gasPrice`, `chainId`, `nonce`, etc
 */
function toQuantityHex(value: BigNumber): HexString {
  return `0x${value.integerValue(BigNumber.ROUND_FLOOR).toString(16)}` as HexString;
}

/**
 * @hidden
 */
export interface BuildEthTransactionRequestParams {
  context: Context;
  /** ss58 address of the Ethereum-derived Account signing the transaction */
  signingAddress: string;
  /** the composed transaction (or MultiSig-wrapped proposal), whose SCALE-encoded call becomes the `data` field */
  composedTx: SubmittableExtrinsic<'promise', ISubmittableResult>;
  ethSigner: EthSigner;
  /**
   * explicit nonce (`ProcedureOpts.nonce`). Only accepted when the SDK broadcasts; passing it
   *   when the wallet broadcasts is a `ValidationError`, since the wallet owns the nonce there
   */
  nonce?: BigNumber;
  /**
   * multiplier applied to the dry run's `ethGas` to build the `gas` field passed to the signer,
   *   so headroom can be added for calls whose weight depends on state read at execution time.
   *   Defaults to `1`, i.e. no headroom
   */
  gasMultiplier?: BigNumber;
}

/**
 * @hidden
 */
export interface EthTransactionBuildResult {
  request: EthTransactionRequest;
  /**
   * the dry run's raw `ethGas`, i.e. before `gasMultiplier` is applied. This is what fee
   *   derivation is based on, since the multiplier is headroom for the wallet rather than part
   *   of the fee estimate
   */
  rawEthGas: BigNumber;
  gasPrice: BigNumber;
}

/**
 * @hidden
 */
export interface EthDryRunResult {
  from: HexString;
  to: HexString;
  calldata: HexString;
  /** the dry run's raw `ethGas`, before any headroom multiplier is applied */
  rawEthGas: BigNumber;
  gasPrice: BigNumber;
  chainId: BigNumber;
}

/**
 * @hidden
 *
 * Perform the mandatory dry run pre-flight for a Polymesh call carried through the
 *   `revive` pallet's sentinel address. This is the SDK's only pre-flight signal, and doing it
 *   over the Substrate connection means a structured error arrives before the wallet is ever
 *   consulted
 *
 * Split out from {@link buildEthTransactionRequest} so that fee estimation
 *   ({@link base/PolymeshTransactionBase!PolymeshTransactionBase.getTotalFees | getTotalFees}) can
 *   use it without requiring an {@link EthSigner} to be attached
 *
 * @throws the parsed dry run error (via {@link utils/eth!parseEthTransactError}) if the dry run itself fails
 */
export async function dryRunEthTransaction(
  context: Context,
  signingAddress: string,
  composedTx: SubmittableExtrinsic<'promise', ISubmittableResult>
): Promise<EthDryRunResult> {
  const {
    polymeshApi: { call },
  } = context;

  const from = ethAddressFromSs58(signingAddress, context.ss58Format);
  const [to, gasPriceRaw] = await Promise.all([
    context.getEthRuntimePalletsAddress(),
    call.reviveApi.gasPrice(),
  ]);
  const chainId = context.getEthChainId();
  const calldata = composedTx.method.toHex() as HexString;
  const gasPrice = new BigNumber(gasPriceRaw.toString());

  const dryRun = await call.reviveApi.ethTransactWithConfig(
    {
      from,
      to,
      input: { data: calldata },
      value: 0,
    },
    {}
  );

  if (dryRun.isErr) {
    throw parseEthTransactError(dryRun.asErr, context);
  }

  const { ethGas: rawEthGasCodec } = dryRun.asOk;
  const rawEthGas = new BigNumber(rawEthGasCodec.toString());

  return { from: from as HexString, to: to as HexString, calldata, rawEthGas, gasPrice, chainId };
}

/**
 * @hidden
 *
 * Build the {@link EthTransactionRequest} that carries a Polymesh runtime call through the
 *   `revive` pallet's sentinel address, performing the mandatory dry run pre-flight along the
 *   way
 *
 * @throws
 * - the parsed dry run error (via {@link utils/eth!parseEthTransactError}) if the dry run itself fails
 * - `ValidationError` if `nonce` is passed while the signer can only broadcast, and so owns the
 *   nonce itself
 */
export async function buildEthTransactionRequest(
  params: BuildEthTransactionRequestParams
): Promise<EthTransactionBuildResult> {
  const {
    context,
    signingAddress,
    composedTx,
    ethSigner,
    nonce: nonceOverride,
    gasMultiplier = new BigNumber(1),
  } = params;

  const mode = getEthSubmissionMode(ethSigner);

  if (mode === 'walletBroadcast' && nonceOverride) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The nonce cannot be set explicitly when the Ethereum signer broadcasts the transaction itself. The wallet is responsible for nonce management in this mode',
    });
  }

  const { from, to, calldata, rawEthGas, gasPrice, chainId } = await dryRunEthTransaction(
    context,
    signingAddress,
    composedTx
  );

  const gasToUse = BigNumber.max(
    rawEthGas.multipliedBy(gasMultiplier).integerValue(BigNumber.ROUND_CEIL),
    rawEthGas
  );

  let nonce: HexString | undefined;
  if (mode === 'sdkBroadcast') {
    if (nonceOverride) {
      nonce = toQuantityHex(nonceOverride);
    } else {
      const {
        polymeshApi: { call },
      } = context;
      const onChainNonce = await call.reviveApi.nonce(from);
      nonce = toQuantityHex(new BigNumber(onChainNonce.toString()));
    }
  }

  const { eip1559 } = ethSigner.capabilities;

  const request: EthTransactionRequest = {
    from,
    to,
    data: calldata,
    value: '0x0',
    gas: toQuantityHex(gasToUse),
    chainId: toQuantityHex(chainId),
    ...(nonce ? { nonce } : {}),
    ...(eip1559
      ? {
          type: 2 as const,
          maxFeePerGas: toQuantityHex(gasPrice),
          maxPriorityFeePerGas: toQuantityHex(new BigNumber(0)),
        }
      : {
          type: 0 as const,
          gasPrice: toQuantityHex(gasPrice),
        }),
  };

  return { request, rawEthGas, gasPrice };
}

/**
 * @hidden
 *
 * Build an {@link EthTransactionRequest} for detached/custody signing
 * ({@link base/PolymeshTransactionBase!PolymeshTransactionBase.toEthSignablePayload | toEthSignablePayload}),
 *   where there is no {@link EthSigner} attached to consult for routing. The nonce is always
 *   resolved (either the caller's `ProcedureOpts.nonce`, or fetched on-chain), since a detached
 *   signer cannot own the nonce the way a broadcasting wallet does
 */
export async function buildDetachedEthTransactionRequest(
  context: Context,
  signingAddress: string,
  composedTx: SubmittableExtrinsic<'promise', ISubmittableResult>,
  eip1559: boolean,
  nonceOverride?: BigNumber
): Promise<EthTransactionRequest> {
  const { from, to, calldata, rawEthGas, gasPrice, chainId } = await dryRunEthTransaction(
    context,
    signingAddress,
    composedTx
  );

  let nonce: HexString;
  if (nonceOverride) {
    nonce = toQuantityHex(nonceOverride);
  } else {
    const {
      polymeshApi: { call },
    } = context;
    const onChainNonce = await call.reviveApi.nonce(from);
    nonce = toQuantityHex(new BigNumber(onChainNonce.toString()));
  }

  return {
    from,
    to,
    data: calldata,
    value: '0x0',
    gas: toQuantityHex(rawEthGas),
    chainId: toQuantityHex(chainId),
    nonce,
    ...(eip1559
      ? {
          type: 2 as const,
          maxFeePerGas: toQuantityHex(gasPrice),
          maxPriorityFeePerGas: toQuantityHex(new BigNumber(0)),
        }
      : {
          type: 0 as const,
          gasPrice: toQuantityHex(gasPrice),
        }),
  };
}

/**
 * @hidden
 *
 * Derive the network fee for a transaction submitted through the `revive` pallet's sentinel
 *   address:
 *
 * ```
 * feeInBaseUnits = ethGas * gasPrice / nativeToEthRatio
 * ```
 *
 * The result is returned as a **display POLYX value**, i.e. shifted down by the chain's 6
 *   decimals, so that it is directly comparable with everything else in `PayingAccountFees` —
 *   protocol fees and Account balances both arrive that way, via `balanceToBigNumber`. Returning
 *   base units here would make the Ethereum path report fees 10^6 too large, and every fee check
 *   against a balance would fail
 *
 * @note the rounding is applied to whole base units *before* the shift, since a fee cannot be a
 *   fraction of a base unit
 * @note this is a slight, safe overestimate of the fee the chain actually charges — measured at
 *   1.008-1.011x. It does **not** include protocol fees, which are charged separately and must
 *   still be summed in by the caller
 */
export function calculateEthGasFee(
  rawEthGas: BigNumber,
  gasPrice: BigNumber,
  nativeToEthRatio: BigNumber
): BigNumber {
  return rawEthGas
    .multipliedBy(gasPrice)
    .dividedBy(nativeToEthRatio)
    .integerValue(BigNumber.ROUND_CEIL)
    .shiftedBy(-6);
}

/**
 * @hidden
 *
 * Retrieve `consts.revive.nativeToEthRatio` as a `BigNumber`
 */
export function getNativeToEthRatio(context: Context): BigNumber {
  return u64ToBigNumber(context.polymeshApi.consts.revive.nativeToEthRatio);
}

/**
 * @hidden
 *
 * Build the predicate that correlates an Ethereum transaction hash (returned by a broadcasting
 *   wallet's `sendTransaction`) to the Substrate extrinsic that carries it:
 *
 * ```
 * extrinsic.method.section === 'revive' &&
 * extrinsic.method.method === 'ethTransact' &&
 * keccakAsHex(extrinsic.args[0].toU8a(true)) === ethTxHash
 * ```
 *
 * This is deterministic, not a heuristic: the Ethereum transaction hash is `keccak256` of the raw
 *   signed transaction, and those exact bytes are the `payload` argument of the `revive.ethTransact`
 *   extrinsic recorded in the block — byte-identical, including in blocks carrying several
 *   Ethereum extrinsics
 */
export function ethTransactKeccakMatcher(ethTxHash: string): ExtrinsicMatcher {
  const normalizedHash = ethTxHash.toLowerCase();

  return (extrinsic: GenericExtrinsic): boolean => {
    if (extrinsic.method.section !== 'revive' || extrinsic.method.method !== 'ethTransact') {
      return false;
    }

    const [payload] = extrinsic.args;

    if (!payload) {
      return false;
    }

    return keccakAsHex(payload.toU8a(true)).toLowerCase() === normalizedHash;
  };
}

/**
 * @hidden
 *
 * The SDK holds the raw signed bytes and submits them itself via
 *   `api.tx.revive.ethTransact(raw)`. Since this is a *bare* (unsigned) extrinsic — the
 *   signature is embedded in the Ethereum payload itself — it is broadcast with `.send()`
 *   rather than `.signAndSend()`, exactly like the offline-signed path in
 *   `Network.submitTransaction`. From here on, the lifecycle is identical to the native path:
 *   same `ISubmittableResult` status transitions, same `outer.hash` semantics
 */
export function buildSdkBroadcastSubmission(
  context: Context,
  rawSignedTx: HexString
): { subscription: SubscriptionSubmission; polling: PollingSubmission } {
  const outer = context.polymeshApi.tx.revive.ethTransact(rawSignedTx);

  return {
    subscription: {
      subscribe: callback => outer.send(callback),
      getTxHash: () => outer.hash.toString(),
    },
    polling: {
      send: async (): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> => {
        const txHash = await outer.send();

        return { txHash: txHash.toString(), matcher: extrinsicHashMatcher(txHash) };
      },
    },
  };
}

/**
 * @hidden
 *
 * The wallet signs AND broadcasts, returning the Ethereum transaction hash.
 *   The SDK never submits anything itself here, so there is no extrinsic-status subscription
 *   channel to attach to — the only way to locate the result is to scan blocks for the matching
 *   `revive.ethTransact` extrinsic (via {@link ethTransactKeccakMatcher}).
 *
 * The block scan is shared with the native path rather than duplicated: the same
 *   {@link ExtrinsicMatcher} drives both, so there is one implementation and one set of tests
 */
export function buildWalletBroadcastSubmission(
  ethSigner: EthSigner,
  request: EthTransactionRequest
): PollingSubmission {
  return {
    send: async (): Promise<{ txHash: string; matcher: ExtrinsicMatcher }> => {
      if (!ethSigner.sendTransaction) {
        throw new PolymeshError({
          code: ErrorCode.General,
          message:
            'The attached Ethereum signer does not implement sendTransaction. Please report this to the Polymesh team',
        });
      }

      const ethTxHash = await ethSigner.sendTransaction(request);

      return { txHash: ethTxHash, matcher: ethTransactKeccakMatcher(ethTxHash) };
    },
  };
}
