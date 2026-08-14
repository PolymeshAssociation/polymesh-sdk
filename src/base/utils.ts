import { SubmittableResult } from '@polkadot/api';
import { GenericExtrinsic, getTypeDef, u32 } from '@polkadot/types';
import { DispatchError, Hash, SignedBlock } from '@polkadot/types/interfaces';
import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { ISubmittableResult, RegistryError, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { polymesh } from '@polymeshassociation/polymesh-types/polkadot/definitions';
import { BigNumber } from 'bignumber.js';

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
} from '~/types';
import { ROOT_TYPES } from '~/utils/constants';
import { bigNumberToU32, createRawExtrinsicStatus } from '~/utils/conversion';
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
 */
export const getExtrinsicFailure = (receipt: ISubmittableResult): PolymeshError | undefined => {
  const [extrinsicFailedEvent] = filterEventRecords(receipt, 'system', 'ExtrinsicFailed', true);

  if (extrinsicFailedEvent) {
    return handleExtrinsicFailure(extrinsicFailedEvent.data[0]);
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
 * Build a matcher that recognizes an extrinsic by its hash. This is the native submission path
 */
export const extrinsicHashMatcher = (txHash: Hash): ExtrinsicMatcher => {
  return (extrinsic: GenericExtrinsic): boolean => txHash.eq(extrinsic.hash);
};

/**
 * @hidden
 */
async function getLocationInfoForTx(
  matcher: ExtrinsicMatcher,
  context: Context,
  lastCheckedBlock: BigNumber
): Promise<{
  locationInfo: { block: SignedBlock; txIndex: number } | undefined;
  latestBlockNumber: BigNumber;
}> {
  let locationInfo: { block: SignedBlock; txIndex: number } | undefined;
  const latestBlockNumber = await context.getLatestBlock();
  if (!latestBlockNumber.eq(lastCheckedBlock)) {
    const blocksToCheck: u32[] = [];
    const numberOfCandidateBlocks = latestBlockNumber.minus(lastCheckedBlock).toNumber();

    for (let i = 1; i <= numberOfCandidateBlocks; i++) {
      const blockNumber = lastCheckedBlock.plus(i);
      blocksToCheck.push(bigNumberToU32(blockNumber, context));
    }

    const blockHashesToCheck = await context.polymeshApi.query.system.blockHash.multi(
      blocksToCheck
    );

    const newBlocks = await Promise.all(
      blockHashesToCheck.map(hash => context.polymeshApi.rpc.chain.getBlock(hash))
    );

    for (const newBlock of newBlocks) {
      const txIndex = newBlock.block.extrinsics.findIndex(value => matcher(value));
      if (txIndex >= 0) {
        locationInfo = { txIndex, block: newBlock };
        break;
      }
    }
  }

  return { locationInfo, latestBlockNumber };
}

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
  pollOptions = { delayMs: 3000, maxAttempts: 10 }
): Promise<SubmittableResult> => {
  let lastCheckedBlock = startingBlock;
  let locationInfo: { block: SignedBlock; txIndex: number } | undefined;

  // Finalization is expected to take ~15 seconds
  const { delayMs, maxAttempts } = pollOptions;

  let attemptCounter = 0;
  while (!locationInfo && attemptCounter < maxAttempts) {
    attemptCounter += 1;
    await delay(delayMs);

    const result = await getLocationInfoForTx(matcher, context, lastCheckedBlock);

    if (result.locationInfo) {
      locationInfo = result.locationInfo;
    }

    lastCheckedBlock = result.latestBlockNumber;
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
