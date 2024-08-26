import { SubmittableResult } from '@polkadot/api';
import { getTypeDef, u32 } from '@polkadot/types';
import { Hash, SignedBlock } from '@polkadot/types/interfaces';
import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { RegistryError, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { BigNumber } from 'bignumber.js';
import { polymesh } from 'polymesh-types/definitions';

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
import { delay } from '~/utils/internal';

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

/**
 * @hidden
 */
export const handleExtrinsicFailure = (
  error: SpRuntimeDispatchError,
  data?: Record<string, unknown>
): PolymeshError => {
  // get revert message from event
  let message: string;

  if (error.isModule) {
    // known error
    const mod = error.asModule;

    const { section, name, docs }: RegistryError = mod.registry.findMetaError(mod);
    message = `${section}.${name}: ${docs.join(' ')}`;
  } else if (error.isBadOrigin) {
    message = 'Bad origin';
  } else if (error.isCannotLookup) {
    message = 'Could not lookup information required to validate the transaction';
  } else {
    message = 'Unknown error';
  }

  return new PolymeshError({ code: ErrorCode.TransactionReverted, message, data });
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
 * given a transaction hash this will poll the chain until it is included in a finalized block
 *
 * @note this method should only be used when there is no subscription support for efficiency
 *
 * @throws if transaction is not found after a certain amount of time
 *
 * @param txHash The hash of the transaction
 * @param startingBlock The block number from before the transaction was submitted
 * @param context
 * @param pollOptions Controls max time to poll, defaults should be OK (finalization takes ~15 seconds)
 * @returns
 */
export const pollForTransactionFinalization = async (
  txHash: Hash,
  startingBlock: BigNumber,
  context: Context,
  pollOptions = { delayMs: 3000, maxAttempts: 10 }
): Promise<SubmittableResult> => {
  let lastCheckedBlock = startingBlock;
  let locationInfo: { block: SignedBlock; txIndex: number } | undefined;
  let txIndex: number;

  // Finalization is expected to take ~15 seconds
  const { delayMs, maxAttempts } = pollOptions;

  let attemptCounter = 0;
  while (!locationInfo && attemptCounter < maxAttempts) {
    attemptCounter += 1;
    await delay(delayMs);

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
        txIndex = newBlock.block.extrinsics.findIndex(value => txHash.eq(value.hash));
        if (txIndex >= 0) {
          locationInfo = { txIndex, block: newBlock };
          break;
        }
      }

      lastCheckedBlock = latestBlockNumber;
    }
  }

  if (!locationInfo) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'The block containing the transaction was not found',
    });
  }

  const queryAt = await context.polymeshApi.at(locationInfo.block.block.header.hash);
  const allEvents = await queryAt.query.system.events();

  const relatedEvents = allEvents.filter(event => {
    if (event.phase.isApplyExtrinsic) {
      return event.phase.asApplyExtrinsic.eq(locationInfo!.txIndex);
    }

    return false;
  });

  const blockHash = locationInfo.block.block.header.hash;
  const rawStatus = createRawExtrinsicStatus('Finalized', blockHash, context);

  return new SubmittableResult({
    blockNumber: locationInfo.block.block.header.number.unwrap(),
    txIndex: locationInfo.txIndex,
    txHash,
    status: rawStatus,
    events: relatedEvents,
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
