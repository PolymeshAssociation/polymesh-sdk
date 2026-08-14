import { SubmittableResult } from '@polkadot/api';
import { GenericExtrinsic, getTypeDef, u32 } from '@polkadot/types';
import { DispatchError, Hash, Header, SignedBlock } from '@polkadot/types/interfaces';
import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { ISubmittableResult, RegistryError, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { polymesh } from '@polymeshassociation/polymesh-types/polkadot/definitions';
import { BigNumber } from 'bignumber.js';
import { noop } from 'lodash';

import { Context, PolymeshError } from '~/internal';
import {
  ArrayTransactionArgument,
  ComplexTransactionArgument,
  ErrorCode,
  MultiSigTx,
  PlainTransactionArgument,
  SimpleEnumTransactionArgument,
  TransactionArgument,
  TransactionArgumentType,
  TxTag,
  UnsubCallback,
} from '~/types';
import { ROOT_TYPES } from '~/utils/constants';
import { bigNumberToU32, createRawExtrinsicStatus, u32ToBigNumber } from '~/utils/conversion';
import { delay, filterEventRecords } from '~/utils/internal';

const { types } = polymesh;

const getRootType = (
  type: string
):
  | PlainTransactionArgument
  | ArrayTransactionArgument
  | SimpleEnumTransactionArgument
  | ComplexTransactionArgument => {
  const rootType = ROOT_TYPES[type];

  if (rootType) {
    return {
      type: rootType,
    };
  }
  if (type === 'Null') {
    return {
      type: TransactionArgumentType.Null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definition = (types as any)[type];

  if (!definition) {
    return {
      type: TransactionArgumentType.Unknown,
    };
  }

  const typeDef = getTypeDef(JSON.stringify(definition));

  if (typeDef.info === TypeDefInfo.Plain) {
    return getRootType(definition);
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return processType(typeDef, '');
};

export const processType = (rawType: TypeDef, name: string): TransactionArgument => {
  const { type, info, sub } = rawType;

  const arg = {
    name,
    optional: false,
    _rawType: rawType,
  };

  switch (info) {
    case TypeDefInfo.Plain: {
      return {
        ...getRootType(type),
        ...arg,
      };
    }
    case TypeDefInfo.Compact: {
      return {
        ...processType(sub as TypeDef, name),
        ...arg,
      };
    }
    case TypeDefInfo.Option: {
      return {
        ...processType(sub as TypeDef, name),
        ...arg,
        optional: true,
      };
    }
    case TypeDefInfo.Tuple: {
      return {
        type: TransactionArgumentType.Tuple,
        ...arg,
        internal: (sub as TypeDef[]).map((def, index) => processType(def, `${index}`)),
      };
    }
    case TypeDefInfo.Vec: {
      return {
        type: TransactionArgumentType.Array,
        ...arg,
        internal: processType(sub as TypeDef, ''),
      };
    }
    case TypeDefInfo.VecFixed: {
      return {
        type: TransactionArgumentType.Text,
        ...arg,
      };
    }
    case TypeDefInfo.Enum: {
      const subTypes = sub as TypeDef[];

      const isSimple = subTypes.every(({ type: subType }) => subType === 'Null');

      /* istanbul ignore next */
      if (isSimple) {
        return {
          type: TransactionArgumentType.SimpleEnum,
          ...arg,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          internal: subTypes.map(({ name: subName }) => subName!),
        };
      }

      return {
        type: TransactionArgumentType.RichEnum,
        ...arg,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        internal: subTypes.map(def => processType(def, def.name!)),
      };
    }
    case TypeDefInfo.Struct: {
      return {
        type: TransactionArgumentType.Object,
        ...arg,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        internal: (sub as TypeDef[]).map(def => processType(def, def.name!)),
      };
    }
    default: {
      return {
        type: TransactionArgumentType.Unknown,
        ...arg,
      };
    }
  }
};

export const dispatchErrorToMessage = (error: SpRuntimeDispatchError | DispatchError): string => {
  if (error.isModule) {
    // known error
    const mod = error.asModule;

    const { section, name, docs }: RegistryError = mod.registry.findMetaError(mod);

    return `${section}.${name}: ${docs.join(' ')}`;
  }

  if (error.isBadOrigin) {
    return 'Bad origin';
  }

  if (error.isCannotLookup) {
    return 'Could not lookup information required to validate the transaction';
  }

  /*
   * The remaining variants carry no metadata to resolve against, but their own names are
   *   meaningful. `Token(FundsUnavailable)` in particular is a common outcome — the Account
   *   cannot cover the amount it is trying to move
   */
  if (error.isToken) {
    return `Token error: ${error.asToken.type}`;
  }

  if (error.isArithmetic) {
    return `Arithmetic error: ${error.asArithmetic.type}`;
  }

  if (error.isTransactional) {
    return `Transactional error: ${error.asTransactional.type}`;
  }

  /*
   * anything else (`Exhausted`, `Corruption`, `Unavailable`, `RootNotAllowed`, `NoProviders`, …)
   *   is reported by name rather than swallowed, so a new runtime variant degrades to a useful
   *   message instead of an opaque one
   */
  return error.type ? `Dispatch error: ${error.type}` : 'Unknown error';
};

/**
 * @hidden
 */
export const handleExtrinsicFailure = (
  error: SpRuntimeDispatchError,
  data?: Record<string, unknown>
): PolymeshError => {
  // get revert message from event
  const message = dispatchErrorToMessage(error);

  return new PolymeshError({ code: ErrorCode.TransactionReverted, message, ...(data && { data }) });
};

/**
 * @hidden
 *
 * Inspect a transaction receipt for an on-chain failure and return the corresponding error, or
 *   `undefined` if the transaction succeeded
 *
 * Two distinct failure shapes feed into the same {@link handleExtrinsicFailure}:
 *
 * - `system.ExtrinsicFailed`, the native path's failure signal
 * - `revive.EthExtrinsicRevert`, emitted instead on the Ethereum signing path. There, the outer
 *   `revive.ethTransact` extrinsic still emits `system.ExtrinsicSuccess` even when the inner
 *   dispatch failed, so this check must run (and take priority) before the receipt is otherwise
 *   treated as a success
 */
export const getExtrinsicFailure = (receipt: ISubmittableResult): PolymeshError | undefined => {
  const [extrinsicFailedEvent] = filterEventRecords(receipt, 'system', 'ExtrinsicFailed', true);

  if (extrinsicFailedEvent) {
    return handleExtrinsicFailure(extrinsicFailedEvent.data[0]);
  }

  const [ethExtrinsicRevertEvent] = filterEventRecords(
    receipt,
    'revive',
    'EthExtrinsicRevert',
    true
  );

  if (ethExtrinsicRevertEvent) {
    return handleExtrinsicFailure(ethExtrinsicRevertEvent.data[0]);
  }

  return undefined;
};

export const handleTransactionSubmissionError = (err: Error): PolymeshError => {
  let error;
  /* istanbul ignore else */
  if (err.message.indexOf('Cancelled') > -1) {
    // tx rejected by signer
    error = { code: ErrorCode.TransactionRejectedByUser };
  } else {
    // unexpected error
    error = { code: ErrorCode.UnexpectedError, message: err.message };
  }

  return new PolymeshError(error);
};

/**
 * @hidden
 *
 * Predicate used to recognize a submitted transaction within a block's body. The native path
 *   matches on the extrinsic hash, while Ethereum signed transactions match on the keccak hash
 *   of the `revive.ethTransact` payload (since the extrinsic itself is unsigned and its hash is
 *   not known to the wallet that broadcast it)
 */
export type ExtrinsicMatcher = (extrinsic: GenericExtrinsic) => boolean;

/**
 * @hidden
 *
 * A transaction found within a block's body, along with where it was found. The height and hash
 *   come from the scanned range rather than the block header, since they are already known there
 *   and do not depend on the header being fully populated
 */
interface LocatedTransaction {
  block: SignedBlock;
  txIndex: number;
  blockNumber: BigNumber;
  blockHash: string;
}

/**
 * @hidden
 *
 * Build a matcher that recognizes an extrinsic by its hash. This is the native submission path
 */
export const extrinsicHashMatcher = (txHash: Hash): ExtrinsicMatcher => {
  return (extrinsic: GenericExtrinsic): boolean => txHash.eq(extrinsic.hash);
};

/**
 * @hidden
 *
 * Where a transaction was found, reported as soon as it is included in a block — before that
 *   block is finalized
 */
export interface TransactionInclusionInfo {
  blockHash: string;
  blockNumber: BigNumber;
  txIndex: number;
}

/**
 * @hidden
 *
 * Number of the best (not necessarily finalized) block.
 *
 * {@link base/Context!Context.getLatestBlock | Context.getLatestBlock} deliberately reports the
 *   latest *finalized* block, which is the right floor for a result but lags inclusion by the
 *   finalization window
 */
const getBestBlockNumber = async (context: Context): Promise<BigNumber> => {
  const header = await context.polymeshApi.rpc.chain.getHeader();

  return u32ToBigNumber(header.number.unwrap());
};

/**
 * @hidden
 */
async function getLocationInfoForTx(
  matcher: ExtrinsicMatcher,
  context: Context,
  lastCheckedBlock: BigNumber,
  headBlockNumber: BigNumber
): Promise<{
  locationInfo: LocatedTransaction | undefined;
  latestBlockNumber: BigNumber;
}> {
  let locationInfo: LocatedTransaction | undefined;
  let highestCheckedBlock = lastCheckedBlock;

  if (!headBlockNumber.eq(lastCheckedBlock)) {
    const blocksToCheck: u32[] = [];
    const numberOfCandidateBlocks = headBlockNumber.minus(lastCheckedBlock).toNumber();

    for (let i = 1; i <= numberOfCandidateBlocks; i++) {
      const blockNumber = lastCheckedBlock.plus(i);
      blocksToCheck.push(bigNumberToU32(blockNumber, context));
    }

    /*
     * `chain_getBlockHash` is used rather than the `system.blockHash` storage map because that map
     *   only records a block's hash once its *child* has been initialized, so the current best
     *   block reads back from storage as the zero hash. The RPC reads the client's block database
     *   and is correct for the best block
     */
    const blockHashesToCheck = await Promise.all(
      blocksToCheck.map(blockNumber => context.polymeshApi.rpc.chain.getBlockHash(blockNumber))
    );

    /*
     * a hash can still come back empty if the block went away between the two calls. Skip those
     *   rather than resolving them, and do not count them as checked, so the next pass sees them
     */
    const candidates = blockHashesToCheck
      .map((hash, index) => ({ hash, blockNumber: lastCheckedBlock.plus(index + 1) }))
      .filter(({ hash }) => !hash.isEmpty);

    const newBlocks = await Promise.all(
      candidates.map(({ hash }) => context.polymeshApi.rpc.chain.getBlock(hash))
    );

    for (const [index, newBlock] of newBlocks.entries()) {
      const txIndex = newBlock.block.extrinsics.findIndex(value => matcher(value));
      if (txIndex >= 0) {
        /*
         * the height and hash come from the scanned range rather than the block header, since both
         *   are already known here and do not depend on the header being fully populated
         */
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { hash, blockNumber } = candidates[index]!;

        locationInfo = {
          txIndex,
          block: newBlock,
          blockNumber,
          blockHash: hash.toString(),
        };
        break;
      }
    }

    const [lastCandidate] = candidates.slice(-1);

    if (lastCandidate) {
      highestCheckedBlock = lastCandidate.blockNumber;
    }
  }

  return { locationInfo, latestBlockNumber: highestCheckedBlock };
}

/**
 * @hidden
 *
 * given a way of recognizing a transaction, this will poll the chain until it is included in a
 *   finalized block
 *
 * @note this method should only be used when there is no subscription support for efficiency
 *
 * @throws if transaction is not found after a certain amount of time
 *
 * @param matcher Predicate that recognizes the submitted extrinsic in a block's body. Use
 *   {@link base/utils!extrinsicHashMatcher | extrinsicHashMatcher} for the native path
 * @param startingBlock The block number from before the transaction was submitted
 * @param context
 * @param pollOptions Controls max time to poll, defaults should be OK (finalization takes ~15 seconds)
 * @returns
 */
/**
 * @hidden
 *
 * Assemble the `SubmittableResult` for a transaction that has been located in a finalized block,
 *   reading back the events belonging to it
 */
const buildFinalizedResult = async (
  locationInfo: { block: SignedBlock; txIndex: number },
  context: Context
): Promise<SubmittableResult> => {
  const queryAt = await context.polymeshApi.at(locationInfo.block.block.header.hash);
  const allEvents = await queryAt.query.system.events();

  const relatedEvents = allEvents.filter(event => {
    if (event.phase.isApplyExtrinsic) {
      return event.phase.asApplyExtrinsic.eq(locationInfo.txIndex);
    }

    return false;
  });

  const blockHash = locationInfo.block.block.header.hash;
  const rawStatus = createRawExtrinsicStatus('Finalized', blockHash, context);

  /*
   * the hash is read back from the located extrinsic rather than taken from the caller, since
   *   an Ethereum signed transaction is correlated by its payload and the Substrate extrinsic
   *   hash is only known once the extrinsic has been found
   */
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const txHash = locationInfo.block.block.extrinsics[locationInfo.txIndex]!.hash;

  return new SubmittableResult({
    blockNumber: locationInfo.block.block.header.number.unwrap(),
    txIndex: locationInfo.txIndex,
    txHash,
    status: rawStatus,
    events: relatedEvents,
  });
};

export const pollForTransactionFinalization = async (
  matcher: ExtrinsicMatcher,
  startingBlock: BigNumber,
  context: Context,
  pollOptions = { delayMs: 3000, maxAttempts: 10 },
  onInBlock?: (info: TransactionInclusionInfo) => void
): Promise<SubmittableResult> => {
  let lastCheckedBlock = startingBlock;
  let locationInfo: { block: SignedBlock; txIndex: number } | undefined;
  let notifiedInclusion = false;

  // Finalization is expected to take ~15 seconds
  const { delayMs, maxAttempts } = pollOptions;

  let attemptCounter = 0;
  while (!locationInfo && attemptCounter < maxAttempts) {
    attemptCounter += 1;

    /*
     * The scan runs against the *best* head rather than the finalized one, so that inclusion can
     *   be reported as soon as the transaction makes it into a block — roughly a block time,
     *   rather than the ~15 seconds finalization takes. The result is only ever *advisory*: the
     *   value this function returns still comes from a finalized block (see the wait below), so a
     *   best block that is later re-orged away can do no more than fire a progress callback early
     */
    const [finalizedBlockNumber, bestBlockNumber] = await Promise.all([
      context.getLatestBlock(),
      getBestBlockNumber(context),
    ]);

    const result = await getLocationInfoForTx(
      matcher,
      context,
      lastCheckedBlock,
      // never scan behind the finalized head, which is the authoritative floor
      BigNumber.max(bestBlockNumber, finalizedBlockNumber)
    );

    if (result.locationInfo) {
      const includedIn = result.locationInfo.blockNumber;

      if (finalizedBlockNumber.gte(includedIn)) {
        // the containing block is already finalized, so this location is authoritative
        locationInfo = result.locationInfo;
      } else if (onInBlock && !notifiedInclusion) {
        notifiedInclusion = true;

        onInBlock({
          blockHash: result.locationInfo.blockHash,
          blockNumber: includedIn,
          txIndex: result.locationInfo.txIndex,
        });
      }

      /*
       * Found but not yet finalized — do not advance `lastCheckedBlock` past it, so the next pass
       *   re-reads the canonical block at that height. If the chain re-organised, the matcher
       *   simply will not match there again and the search continues
       */
      lastCheckedBlock = includedIn.minus(1);
    } else {
      lastCheckedBlock = result.latestBlockNumber;
    }

    if (!locationInfo) {
      await delay(delayMs);
    }
  }

  if (!locationInfo) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'The block containing the transaction was not found',
    });
  }

  return buildFinalizedResult(locationInfo, context);
};

/**
 * @hidden
 *
 * Locate a submitted transaction by subscribing to the chain's blocks, rather than polling for
 *   them. Preferred whenever the connection supports subscriptions: inclusion is reported the
 *   moment the block arrives instead of on the next poll tick, and it removes a repeating
 *   `getHeader`/`getBlock` cycle per in-flight transaction
 *
 * Two independent scans run off two subscriptions:
 *
 * - **new heads** are advisory. They exist only to report inclusion early, via `onInBlock`. A
 *   block seen here may still be re-organised away, which is harmless because nothing but a
 *   progress callback depends on it
 * - **finalized heads** are authoritative. The resolved result always comes from a finalized
 *   block, so a re-org cannot produce a wrong result — the transaction simply will not be found
 *   at that height on the canonical chain, and the scan continues
 *
 * @throws if the transaction is not found within `maxFinalizedBlocks` finalized blocks
 */
export const subscribeForTransactionFinalization = (
  matcher: ExtrinsicMatcher,
  startingBlock: BigNumber,
  context: Context,
  onInBlock?: (info: TransactionInclusionInfo) => void,
  { maxFinalizedBlocks } = { maxFinalizedBlocks: 10 }
): Promise<SubmittableResult> => {
  const { chain } = context.polymeshApi.rpc;

  return new Promise<SubmittableResult>((resolve, reject) => {
    let lastBestBlock = startingBlock;
    let lastFinalizedBlock = startingBlock;
    let notifiedInclusion = false;
    let settled = false;
    let finalizedBlocksSeen = 0;
    const unsubscribers: Promise<UnsubCallback>[] = [];

    /*
     * subscription callbacks can overlap, since each scan is asynchronous. Serializing them keeps
     *   the cursors consistent and stops the same block being scanned twice
     */
    let scanning: Promise<void> = Promise.resolve();

    /**
     * Tear down both subscriptions
     */
    const cleanup = (): void => {
      unsubscribers.forEach(getting => {
        getting.then(unsub => unsub()).catch(noop);
      });
    };

    /**
     * Settle the promise exactly once, releasing both subscriptions first
     */
    const settle = (action: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      action();
    };

    /**
     * Surface a failure from either scan
     */
    const handleError = (err: Error): void => {
      settle(() => reject(err));
    };

    /**
     * Advisory scan of the best head — reports inclusion early and nothing more
     */
    const scanBest = async (header: Header): Promise<void> => {
      if (settled || !onInBlock || notifiedInclusion) {
        return;
      }

      const headNumber = u32ToBigNumber(header.number.unwrap());
      const { locationInfo, latestBlockNumber } = await getLocationInfoForTx(
        matcher,
        context,
        lastBestBlock,
        headNumber
      );

      if (locationInfo) {
        notifiedInclusion = true;

        onInBlock({
          blockHash: locationInfo.blockHash,
          blockNumber: locationInfo.blockNumber,
          txIndex: locationInfo.txIndex,
        });
      }

      lastBestBlock = locationInfo ? locationInfo.blockNumber : latestBlockNumber;
    };

    /**
     * Authoritative scan of the finalized head — the only thing that can resolve the transaction
     */
    const scanFinalized = async (header: Header): Promise<void> => {
      if (settled) {
        return;
      }

      finalizedBlocksSeen += 1;

      const headNumber = u32ToBigNumber(header.number.unwrap());
      const { locationInfo, latestBlockNumber } = await getLocationInfoForTx(
        matcher,
        context,
        lastFinalizedBlock,
        headNumber
      );

      if (locationInfo) {
        const result = await buildFinalizedResult(locationInfo, context);

        settle(() => resolve(result));

        return;
      }

      lastFinalizedBlock = latestBlockNumber;

      if (finalizedBlocksSeen >= maxFinalizedBlocks) {
        settle(() =>
          reject(
            new PolymeshError({
              code: ErrorCode.UnexpectedError,
              message: 'The block containing the transaction was not found',
            })
          )
        );
      }
    };

    unsubscribers.push(
      chain.subscribeNewHeads(header => {
        scanning = scanning.then(() => scanBest(header)).catch(handleError);
      }),
      chain.subscribeFinalizedHeads(header => {
        scanning = scanning.then(() => scanFinalized(header)).catch(handleError);
      })
    );
  });
};

/**
 * @hidden
 */
const multiSigNoWrapTxs: TxTag[] = [
  MultiSigTx.ApproveAsKey,
  MultiSigTx.RejectAsKey,
  MultiSigTx.Approve,
  MultiSigTx.Reject,
];

/**
 * @hidden
 * @returns `true` if a tag is an exception to the rule "All multiSig signer transactions should be wrapped as proposals"
 */
export const isMultiSigNoWrapTx = (tag: TxTag): boolean => {
  return multiSigNoWrapTxs.includes(tag);
};
