import {
  ApiDecoration,
  AugmentedEvent,
  AugmentedQueries,
  AugmentedQuery,
  AugmentedQueryDoubleMap,
  DropLast,
  ObsInnerType,
} from '@polkadot/api/types';
import { BTreeSet, Bytes, Option, StorageKey, u32 } from '@polkadot/types';
import { EventRecord, RewardDestination } from '@polkadot/types/interfaces';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import {
  PalletAssetAssetDetails,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesStatisticsStatClaim,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import type { Callback, Codec, Observable } from '@polkadot/types/types';
import { AnyFunction, AnyTuple, IEvent, ISubmittableResult } from '@polkadot/types/types';
import { stringUpperFirst } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import stringify from 'json-stable-stringify';
import { differenceWith, flatMap, isEqual, mapValues, noop, padEnd, uniq } from 'lodash';
import { coerce, lt, major, satisfies } from 'semver';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  Account,
  BaseAsset,
  Checkpoint,
  CheckpointSchedule,
  ChildIdentity,
  Context,
  FungibleAsset,
  Identity,
  MultiSig,
  Nft,
  NftCollection,
  PolymeshError,
} from '~/internal';
import { latestSqVersionQuery } from '~/middleware/queries/common';
import {
  Asset as MiddlewareAsset,
  Claim as MiddlewareClaim,
  ClaimTypeEnum,
  Query,
} from '~/middleware/types';
import { MiddlewareScope } from '~/middleware/typesV1';
import {
  Asset,
  AttestPrimaryKeyRotationAuthorizationData,
  Authorization,
  AuthorizationRequest,
  AuthorizationType,
  CaCheckpointType,
  Claim,
  ClaimType,
  Condition,
  ConditionType,
  CountryCode,
  DefaultPortfolio,
  ErrorCode,
  GenericAuthorizationData,
  GenericPolymeshTransaction,
  InputCaCheckpoint,
  InputCondition,
  ModuleName,
  NextKey,
  NoArgsProcedureMethod,
  NumberedPortfolio,
  OptionalArgsProcedureMethod,
  PaginationOptions,
  PermissionedAccount,
  ProcedureAuthorizationStatus,
  ProcedureMethod,
  ProcedureOpts,
  RemoveAssetStatParams,
  Scope,
  StatType,
  SubCallback,
  TransferRestriction,
  TransferRestrictionType,
  TxTag,
  UnsubCallback,
} from '~/types';
import {
  Events,
  Falsyable,
  MapTxWithArgs,
  MiddlewarePermissions,
  MiddlewareV6Extrinsic,
  PolymeshTx,
  Queries,
  StatClaimIssuer,
  TxWithArgs,
} from '~/types/internal';
import {
  Ensured,
  HumanReadableType,
  ProcedureFunc,
  QueryFunction,
  UnionOfProcedureFuncs,
} from '~/types/utils';
import {
  CONFIDENTIAL_ASSETS_SUPPORTED_CALL,
  MAX_TICKER_LENGTH,
  MINIMUM_SQ_VERSION,
  PRIVATE_SUPPORTED_SPEC_SEMVER,
  PRIVATE_SUPPORTED_SPEC_VERSION_RANGE,
  STATE_RUNTIME_VERSION_CALL,
  SUPPORTED_SPEC_SEMVER,
  SUPPORTED_SPEC_VERSION_RANGE,
} from '~/utils/constants';
import {
  assetIdToString,
  bigNumberToU32,
  claimIssuerToMeshClaimIssuer,
  identitiesToBtreeSet,
  identityIdToString,
  meshClaimTypeToClaimType,
  meshPermissionsToPermissionsV2,
  meshStatToStatType,
  middlewareScopeToScope,
  permillToBigNumber,
  signerToString,
  stakingRewardDestinationToRaw,
  statisticsOpTypeToStatType,
  statsClaimToStatClaimInputType,
  stringToAccountId,
  stringToAssetId,
  stringToBytes,
  stringToTicker,
  tickerToString,
  transferRestrictionTypeToStatOpType,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import { hexToUuid, isHexUuid, isUuid, uuidToHex } from '~/utils/strings';
import {
  isEntity,
  isMultiClaimCondition,
  isScopedClaim,
  isSingleClaimCondition,
} from '~/utils/typeguards';

export * from '~/generated/utils';

/**
 * @hidden
 * Promisified version of a timeout
 *
 * @param amount - time to wait
 */
export async function delay(amount: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, amount);
  });
}

/**
 * @hidden
 * Convert an entity type and its unique Identifiers to a base64 string
 */
export function serialize<UniqueIdentifiers>(
  entityType: string,
  uniqueIdentifiers: UniqueIdentifiers
): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * @hidden
 * Convert a uuid string to an Identifier object
 */
export function unserialize<UniqueIdentifiers>(id: string): UniqueIdentifiers {
  const unserialized = Buffer.from(id, 'base64').toString('utf8');

  const matched = unserialized.match(/^.*?:(.*)/);

  const errorMsg = 'Wrong ID format';

  if (!matched) {
    throw new Error(errorMsg);
  }

  const [, jsonString] = matched;

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(errorMsg);
  }
}

/**
 * @hidden
 * Extract the DID from an Identity, or return the DID of the signing Identity if no Identity is passed
 */
export async function getDid(
  value: string | Identity | undefined,
  context: Context
): Promise<string> {
  let did;
  if (value) {
    did = signerToString(value);
  } else {
    ({ did } = await context.getSigningIdentity());
  }

  return did;
}

/**
 * @hidden
 * Given a DID return the corresponding Identity, given an Identity return the Identity
 */
export function asIdentity(value: string | Identity, context: Context): Identity {
  return typeof value === 'string' ? new Identity({ did: value }, context) : value;
}

/**
 * @hidden
 * Given a DID return the corresponding ChildIdentity, given an ChildIdentity return the ChildIdentity
 */
export function asChildIdentity(value: string | ChildIdentity, context: Context): ChildIdentity {
  return typeof value === 'string' ? new ChildIdentity({ did: value }, context) : value;
}

/**
 * @hidden
 * Given an address return the corresponding Account, given an Account return the Account
 */
export function asAccount(value: string | Account, context: Context): Account {
  return typeof value === 'string' ? new Account({ address: value }, context) : value;
}

/**
 * @hidden
 * DID | Identity -> DID
 */
export function asDid(value: string | Identity): string {
  return typeof value === 'string' ? value : value.did;
}

/**
 * @hidden
 * Given an Identity, return the Identity, given a DID returns the corresponding Identity, if value is falsy, then return currentIdentity
 */
export async function getIdentity(
  value: string | Identity | undefined,
  context: Context
): Promise<Identity> {
  if (!value) {
    return context.getSigningIdentity();
  } else {
    return asIdentity(value, context);
  }
}

/**
 * @hidden
 */
export function createClaim(
  claimType: string,
  jurisdiction: Falsyable<string>,
  middlewareScope: Falsyable<MiddlewareScope>,
  cddId: Falsyable<string>,
  customClaimTypeId: Falsyable<BigNumber>
): Claim {
  const type = claimType as ClaimType;
  const scope = (middlewareScope ? middlewareScopeToScope(middlewareScope) : {}) as Scope;

  switch (type) {
    case ClaimType.Jurisdiction: {
      return {
        type,
        // this assertion is necessary because CountryCode is not in the middleware types
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        code: stringUpperFirst(jurisdiction!.toLowerCase()) as CountryCode,
        scope,
      };
    }
    case ClaimType.CustomerDueDiligence: {
      return {
        type,
        id: cddId as string,
      };
    }
    case ClaimType.Custom: {
      if (!customClaimTypeId) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Custom claim type ID is required',
        });
      }

      return {
        type,
        customClaimTypeId,
        scope,
      };
    }
  }

  return { type, scope };
}

/**
 * @hidden
 */
type EventData<Event> = Event extends AugmentedEvent<'promise', infer Data> ? Data : never;

/**
 * @hidden
 * Find every occurrence of a specific event inside a receipt
 *
 * @param skipError - optional. If true, no error will be thrown if the event is not found,
 *   and the function will return an empty array
 */
export function filterEventRecords<
  ModuleName extends keyof Events,
  EventName extends keyof Events[ModuleName]
>(
  receipt: ISubmittableResult,
  mod: ModuleName,
  eventName: EventName,
  skipError?: true
): IEvent<EventData<Events[ModuleName][EventName]>>[] {
  const eventRecords = receipt.filterRecords(mod, eventName as string);
  if (!eventRecords.length && !skipError) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Event "${mod}.${String(
        eventName
      )}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymesh team`,
    });
  }

  return eventRecords.map(
    eventRecord => eventRecord.event as unknown as IEvent<EventData<Events[ModuleName][EventName]>>
  );
}

/**
 * Return a clone of a transaction receipt with the passed events
 */
function cloneReceipt(receipt: ISubmittableResult, events: EventRecord[]): ISubmittableResult {
  const { filterRecords, findRecord, toHuman } = receipt;

  const clone: ISubmittableResult = {
    ...receipt,
    events,
  };

  clone.filterRecords = filterRecords;
  clone.findRecord = findRecord;
  clone.toHuman = toHuman;

  return clone;
}

/**
 * @hidden
 *
 *   Segment a batch transaction receipt's events into arrays, each representing a specific extrinsic's
 *   associated events. This is useful for scenarios where we need to isolate and process events
 *   for individual extrinsics in a batch.
 *
 *   In a batch transaction receipt, events corresponding to multiple extrinsics are listed sequentially.
 *   This function identifies boundaries between these event sequences, typically demarcated by
 *   events like 'utility.ItemCompleted', to segment events into individual arrays.
 *
 *   A key use case is when we want to slice or filter events for a subset of the extrinsics. By
 *   segmenting events this way, it becomes simpler to apply operations or analyses to events
 *   corresponding to specific extrinsics in the batch.
 *
 * @param events - array of events from a batch transaction receipt
 *
 * @returns an array of arrays, where each inner array contains events specific to an extrinsic in the batch.
 *
 * @note this function does not mutate the input events
 */
export function segmentEventsByTransaction(events: EventRecord[]): EventRecord[][] {
  const segments: EventRecord[][] = [];
  let currentSegment: EventRecord[] = [];

  events.forEach(eventRecord => {
    if (eventRecord.event.method === 'ItemCompleted' && eventRecord.event.section === 'utility') {
      if (currentSegment.length) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    } else {
      currentSegment.push(eventRecord);
    }
  });

  // If there are events left after processing, add them to a new segment
  if (currentSegment.length) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * @hidden
 *
 * Return a clone of a batch transaction receipt that only contains events for a subset of the
 *   extrinsics in the batch. This is useful when a batch has several extrinsics that emit
 *   the same events and we want `filterEventRecords` to only search among the events emitted by
 *   some of them.
 *
 * A good example of this is when merging similar batches together. If we wish to preserve the return
 *   value of each batch, this is a good way of ensuring that the resolver function of a batch has
 *   access to the events that correspond only to the extrinsics in said batch
 *
 * @param from - index of the first transaction in the subset
 * @param to - end index of the subset (not included)
 *
 * @note this function does not mutate the original receipt
 */
export function sliceBatchReceipt(
  receipt: ISubmittableResult,
  from: number,
  to: number
): ISubmittableResult {
  // checking if the batch was completed (will throw an error if not)
  filterEventRecords(receipt, 'utility', 'BatchCompleted');

  const { events } = receipt;

  const segmentedEvents = segmentEventsByTransaction(events);

  if (from < 0 || to > segmentedEvents.length) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: 'Transaction index range out of bounds. Please report this to the Polymesh team',
      data: {
        to,
        from,
      },
    });
  }

  const slicedEvents = segmentedEvents.slice(from, to).flat();

  return cloneReceipt(receipt, slicedEvents);
}

/**
 * Return a clone of the last receipt in the passes array, containing the accumulated events
 *   of all receipts
 */
export function mergeReceipts(
  receipts: ISubmittableResult[],
  context: Context
): ISubmittableResult {
  const eventsPerTransaction: u32[] = [];
  const allEvents: EventRecord[] = [];

  receipts.forEach(({ events }) => {
    eventsPerTransaction.push(bigNumberToU32(new BigNumber(events.length), context));
    allEvents.push(...events);
  });

  const lastReceipt = receipts[receipts.length - 1];

  /*
   * Here we simulate a `BatchCompleted` event with the amount of events of
   * each transaction. That way, if some psychopath user decides to merge a bunch of transactions
   * into a batch and then split it again, we won't lose track of which events correspond to which
   * transaction
   *
   * NOTE: this is a bit fragile since we might want to use more functionalities of the event object in the future,
   * but attempting to instantiate a real polkadot `GenericEvent` would be way more messy. It might come to that
   * in the future though. It's also worth considering that this is an extreme edge case, since (hopefully) no one
   * in their right mind would create a batch only to split it back up again
   */
  return cloneReceipt(lastReceipt, [
    ...allEvents,
    {
      event: {
        section: 'utility',
        method: 'BatchCompleted',
        data: [eventsPerTransaction],
      },
    } as unknown as EventRecord,
  ]);
}

/**
 * @hidden
 */
export function padString(value: string, length: number): string {
  return padEnd(value, length, '\0');
}

/**
 * @hidden
 */
export function removePadding(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/\u0000/g, '');
}

/**
 * @hidden
 *
 * Return whether the string is fully printable ASCII
 */
export function isPrintableAscii(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(value);
}

/**
 * @hidden
 *
 * Return whether the string contains alphanumeric values or _ - . /
 */
export function isAllowedCharacters(value: string): boolean {
  return /^[0-9a-zA-Z_\-./]*$/.test(value);
}

/**
 * @hidden
 *
 * Makes an entries request to the chain. If pagination options are supplied,
 *  the request will be paginated. Otherwise, all entries will be requested at once
 */
export async function requestPaginated<F extends AnyFunction, T extends AnyTuple>(
  query: AugmentedQuery<'promise', F, T> | AugmentedQueryDoubleMap<'promise', F, T>,
  opts: {
    paginationOpts?: PaginationOptions;
    arg?: Parameters<F>[0];
  }
): Promise<{
  entries: [StorageKey<T>, ObsInnerType<ReturnType<F>>][];
  lastKey: NextKey;
}> {
  const { arg, paginationOpts } = opts;
  let entries: [StorageKey<T>, ObsInnerType<ReturnType<F>>][];
  let lastKey: NextKey = null;

  const args = arg ? [arg] : [];

  if (paginationOpts) {
    const { size: pageSize, start: startKey } = paginationOpts;
    entries = await query.entriesPaged({
      args,
      pageSize: pageSize.toNumber(),
      startKey,
    });

    if (pageSize.eq(entries.length)) {
      lastKey = entries[entries.length - 1][0].toHex();
    }
  } else {
    /*
     * NOTE @monitz87: this assertion is required because types
     *   are inconsistent in the polkadot repo
     */
    entries = await query.entries(...(args as DropLast<Parameters<F>>));
  }

  return {
    entries,
    lastKey,
  };
}

/**
 * @hidden
 *
 * Gets Polymesh API instance at a particular block
 */
export async function getApiAtBlock(
  context: Context,
  blockHash: string | BlockHash
): Promise<ApiDecoration<'promise'>> {
  const { polymeshApi } = context;

  const isArchiveNode = await context.isCurrentNodeArchive();

  if (!isArchiveNode) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Cannot query previous blocks in a non-archive node',
    });
  }

  return polymeshApi.at(blockHash);
}

type QueryMultiParam<T extends AugmentedQuery<'promise', AnyFunction>[]> = {
  [index in keyof T]: T[index] extends AugmentedQuery<'promise', infer Fun>
    ? Fun extends (firstArg: infer First, ...restArg: infer Rest) => ReturnType<Fun>
      ? Rest extends never[]
        ? [T[index], First]
        : [T[index], Parameters<Fun>]
      : never
    : never;
};

type QueryMultiReturnType<T extends AugmentedQuery<'promise', AnyFunction>[]> = {
  [index in keyof T]: T[index] extends AugmentedQuery<'promise', infer Fun>
    ? ReturnType<Fun> extends Observable<infer R>
      ? R
      : never
    : never;
};

/**
 * @hidden
 *
 * Makes an multi request to the chain
 */
export async function requestMulti<T extends AugmentedQuery<'promise', AnyFunction>[]>(
  context: Context,
  queries: QueryMultiParam<T>
): Promise<QueryMultiReturnType<T>>;
export async function requestMulti<T extends AugmentedQuery<'promise', AnyFunction>[]>(
  context: Context,
  queries: QueryMultiParam<T>,
  callback: Callback<QueryMultiReturnType<T>>
): Promise<UnsubCallback>;
// eslint-disable-next-line require-jsdoc
export async function requestMulti<T extends AugmentedQuery<'promise', AnyFunction>[]>(
  context: Context,
  queries: QueryMultiParam<T>,
  callback?: Callback<QueryMultiReturnType<T>>
): Promise<QueryMultiReturnType<T> | UnsubCallback> {
  const {
    polymeshApi: { queryMulti },
  } = context;

  if (callback) {
    return queryMulti(queries, callback as unknown as Callback<Codec[]>);
  }
  return queryMulti(queries) as unknown as QueryMultiReturnType<T>;
}

/**
 * @hidden
 *
 * Makes a request to the chain. If a block hash is supplied,
 *   the request will be made at that block. Otherwise, the most recent block will be queried
 */
export async function requestAtBlock<
  ModuleName extends keyof AugmentedQueries<'promise'>,
  QueryName extends keyof AugmentedQueries<'promise'>[ModuleName]
>(
  moduleName: ModuleName,
  queryName: QueryName,
  opts: {
    blockHash?: string | BlockHash;
    args: Parameters<QueryFunction<ModuleName, QueryName>>;
  },
  context: Context
): Promise<ObsInnerType<ReturnType<QueryFunction<ModuleName, QueryName>>>> {
  const { blockHash, args } = opts;

  let query: Queries;
  if (blockHash) {
    ({ query } = await getApiAtBlock(context, blockHash));
  } else {
    ({ query } = context.polymeshApi);
  }

  const queryMethod = query[moduleName][queryName] as unknown as QueryFunction<
    typeof moduleName,
    typeof queryName
  >;
  return queryMethod(...args);
}

/**
 * @hidden
 *
 * Calculates next page number for paginated GraphQL ResultSet.
 * Returns null if there is no next page.
 *
 * @param size - page size requested
 * @param start - start index requested
 * @param totalCount - total amount of elements returned by query
 *
 * @hidden
 *
 */
export function calculateNextKey(totalCount: BigNumber, size: number, start?: BigNumber): NextKey {
  const next = (start ?? new BigNumber(0)).plus(size);
  return totalCount.gt(next) ? next : null;
}

/**
 * Create a method that prepares a procedure
 */
export function createProcedureMethod<
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: () => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    voidArgs: true;
  },
  context: Context
): NoArgsProcedureMethod<ProcedureReturnValue, ProcedureReturnValue>;
export function createProcedureMethod<
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: () => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    voidArgs: true;
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue>;
export function createProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs?: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    optionalArgs: true;
  },
  context: Context
): OptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ProcedureReturnValue>;
export function createProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    optionalArgs: true;
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): OptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>;
export function createProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs extends {},
  ProcedureArgs,
  ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
  },
  context: Context
): ProcedureMethod<MethodArgs, ProcedureReturnValue, ProcedureReturnValue>;
export function createProcedureMethod<
  // eslint-disable-next-line @typescript-eslint/ban-types
  MethodArgs extends {},
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    transformer: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): ProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>;
// eslint-disable-next-line require-jsdoc
export function createProcedureMethod<
  MethodArgs,
  ProcedureArgs,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue,
  Storage = Record<string, unknown>
>(
  args: {
    getProcedureAndArgs: (
      methodArgs?: MethodArgs
    ) => [
      (
        | UnionOfProcedureFuncs<ProcedureArgs, ProcedureReturnValue, Storage>
        | ProcedureFunc<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    transformer?: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
    voidArgs?: true;
    optionalArgs?: true;
  },
  context: Context
):
  | ProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>
  | OptionalArgsProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>
  | NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue> {
  const { getProcedureAndArgs, transformer, voidArgs, optionalArgs } = args;

  if (voidArgs) {
    const voidMethod = (
      opts: ProcedureOpts = {}
    ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
      const [proc, procArgs] = getProcedureAndArgs();
      return proc().prepare({ args: procArgs, transformer }, context, opts);
    };

    voidMethod.checkAuthorization = async (
      opts: ProcedureOpts = {}
    ): Promise<ProcedureAuthorizationStatus> => {
      const [proc, procArgs] = getProcedureAndArgs();

      return proc().checkAuthorization(procArgs, context, opts);
    };

    return voidMethod;
  }

  if (optionalArgs) {
    const methodWithOptionalArgs = (
      methodArgs?: MethodArgs,
      opts: ProcedureOpts = {}
    ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
      const [proc, procArgs] = getProcedureAndArgs(methodArgs);
      return proc().prepare({ args: procArgs, transformer }, context, opts);
    };

    methodWithOptionalArgs.checkAuthorization = async (
      methodArgs?: MethodArgs,
      opts: ProcedureOpts = {}
    ): Promise<ProcedureAuthorizationStatus> => {
      const [proc, procArgs] = getProcedureAndArgs(methodArgs);

      return proc().checkAuthorization(procArgs, context, opts);
    };

    return methodWithOptionalArgs;
  }

  const method = (
    methodArgs: MethodArgs,
    opts: ProcedureOpts = {}
  ): Promise<GenericPolymeshTransaction<ProcedureReturnValue, ReturnValue>> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);
    return proc().prepare({ args: procArgs, transformer }, context, opts);
  };

  method.checkAuthorization = async (
    methodArgs: MethodArgs,
    opts: ProcedureOpts = {}
  ): Promise<ProcedureAuthorizationStatus> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);

    return proc().checkAuthorization(procArgs, context, opts);
  };

  return method;
}

/**
 * @hidden
 */
export function assertIsInteger(value: BigNumber): void {
  if (!value.isInteger()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number must be an integer',
    });
  }
}

/**
 * @hidden
 */
export function assertIsPositive(value: BigNumber): void {
  if (value.isNegative()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number must be positive',
    });
  }
}

/**
 * @hidden
 */
export function assertAddressValid(address: string, ss58Format: BigNumber): void {
  let encodedAddress: string;
  try {
    encodedAddress = encodeAddress(decodeAddress(address), ss58Format.toNumber());
  } catch (err) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied address is not a valid SS58 address',
      data: { address, expectedFormat: ss58Format.toString() },
    });
  }

  if (address !== encodedAddress) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The supplied address is not encoded with the chain's SS58 format",
      data: {
        ss58Format: ss58Format.toString(),
      },
    });
  }
}

/**
 * @hidden
 *
 * Validates a ticker value
 */
export function assertTickerValid(ticker: string): void {
  if (!ticker.length || ticker.length > MAX_TICKER_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker length must be between 1 and ${MAX_TICKER_LENGTH} characters`,
    });
  }

  if (!isPrintableAscii(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only printable ASCII is allowed as ticker name',
    });
  }

  if (ticker !== ticker.toUpperCase()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Ticker cannot contain lower case letters',
    });
  }
}

/**
 * @hidden
 */
export async function getTickerForAsset(id: string, context: Context): Promise<string | undefined> {
  const {
    polymeshApi: {
      query: { asset },
    },
  } = context;
  let ticker;
  const rawAssetId = stringToAssetId(id, context);
  const rawTicker = await asset.assetIdTicker(rawAssetId);
  if (rawTicker.isSome) {
    ticker = tickerToString(rawTicker.unwrap());
  }
  return ticker;
}

/**
 * @hidden
 */
export async function getAssetIdForTicker(ticker: string, context: Context): Promise<string> {
  const {
    polymeshApi: {
      query: { asset },
    },
  } = context;
  assertTickerValid(ticker);
  const rawTicker = stringToTicker(ticker, context);
  const rawAssetId = await asset.tickerAssetId(rawTicker);
  if (rawAssetId.isNone) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: `There is no Asset with ticker: "${ticker}"`,
    });
  }
  return assetIdToString(rawAssetId.unwrap());
}

/**
 * @hidden
 */
export async function getAssetIdAndTicker(
  assetId: string,
  context: Context
): Promise<{
  ticker?: string;
  assetId: string;
}> {
  return {
    assetId,
    ticker: await getTickerForAsset(assetId, context),
  };
}

/**
 * @hidden
 */
export function asUuid(id: string): string {
  if (isHexUuid(id)) {
    return hexToUuid(id);
  }

  return id;
}

/**
 * @hidden
 */
export async function asBaseAsset(asset: string | BaseAsset, context: Context): Promise<BaseAsset> {
  if (asset instanceof BaseAsset) {
    return asset;
  }

  if (isUuid(asset) || isHexUuid(asset)) {
    return new BaseAsset({ assetId: asUuid(asset) }, context);
  }

  assertTickerValid(asset);
  const id = await getAssetIdForTicker(asset, context);
  return new BaseAsset({ assetId: id }, context);
}

/**
 * @hidden
 */
export async function asAssetId(asset: string | BaseAsset, context: Context): Promise<string> {
  if (asset instanceof BaseAsset) {
    return asset.id;
  }

  const base = await asBaseAsset(asUuid(asset), context);

  return base.id;
}

/**
 * @hidden
 *
 * @note alternatively {@link asBaseAsset} returns a generic `BaseAsset`, but is synchronous
 */
export async function asAsset(asset: string | Asset, context: Context): Promise<Asset> {
  let assetId: string;
  if (typeof asset !== 'string') {
    assetId = asset.id;
  } else {
    assetId = asUuid(asset);
  }

  const fungible = new FungibleAsset({ assetId }, context);
  const collection = new NftCollection({ assetId }, context);

  const [isAsset, isCollection] = await Promise.all([fungible.exists(), collection.exists()]);

  if (isCollection) {
    return collection;
  }
  if (isAsset) {
    return fungible;
  }

  throw new PolymeshError({
    code: ErrorCode.DataUnavailable,
    message: `No asset exists with asset ID: "${asset}"`,
  });
}

/**
 * @hidden
 * Transforms asset or ticker into a `FungibleAsset` entity
 */
export async function asFungibleAsset(
  asset: string | BaseAsset,
  context: Context
): Promise<FungibleAsset> {
  if (asset instanceof FungibleAsset) {
    return asset;
  }

  const assetId = await asAssetId(asset, context);

  return new FungibleAsset({ assetId }, context);
}

/**
 * @hidden
 */
export function xor(a: boolean, b: boolean): boolean {
  return a !== b;
}

/**
 * @hidden
 * Transform a conversion util into a version that returns null if the input is falsy
 */
export function optionize<InputType, OutputType, RestType extends unknown[]>(
  converter: (input: InputType, ...rest: RestType) => OutputType
): (val: InputType | null | undefined, ...rest: RestType) => OutputType | null {
  return (value: InputType | null | undefined, ...rest: RestType): OutputType | null => {
    const data = value ?? null;
    return data && converter(data, ...rest);
  };
}

/**
 * @hidden
 * Compare two tags/modules and return true if they are equal, or if one is the other one's module
 */
export function isModuleOrTagMatch(a: TxTag | ModuleName, b: TxTag | ModuleName): boolean {
  const aIsTag = a.includes('.');
  const bIsTag = b.includes('.');

  // a tag b module
  if (aIsTag && !bIsTag) {
    return a.split('.')[0] === b;
  }

  // a module b tag
  if (!aIsTag && bIsTag) {
    return a === b.split('.')[0];
  }

  // both tags or both modules
  return a === b;
}

/**
 * @hidden
 *
 * Recursively convert a value into a human readable (JSON compliant) version:
 *   - Entities are converted via their `.toHuman` method
 *   - Dates are converted to ISO strings
 *   - BigNumbers are converted to numerical strings
 */
export function toHumanReadable<T>(obj: T): HumanReadableType<T> {
  if (isEntity<unknown, HumanReadableType<T>>(obj)) {
    return obj.toHuman();
  }

  if (obj instanceof BigNumber) {
    return obj.toString() as HumanReadableType<T>;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as HumanReadableType<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(toHumanReadable) as HumanReadableType<T>;
  }

  if (obj && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mapValues(obj as any, val => toHumanReadable(val)) as HumanReadableType<T>;
  }

  return obj as HumanReadableType<T>;
}

/**
 * @hidden
 *
 * Return whether the two arrays have same elements.
 * It uses a `comparator` function to check if elements are equal.
 * If no comparator function is provided, it uses `isEqual` function of `lodash`
 */
export function hasSameElements<T>(
  first: T[],
  second: T[],
  comparator: (a: T, b: T) => boolean = isEqual
): boolean {
  return !differenceWith(first, second, comparator).length && first.length === second.length;
}

/**
 * @hidden
 *
 * Perform a deep comparison between two compliance conditions
 */
export function conditionsAreEqual(
  a: Condition | InputCondition,
  b: Condition | InputCondition
): boolean {
  let equalClaims = false;
  const { type: aType, trustedClaimIssuers: aClaimIssuers = [] } = a;
  const { type: bType, trustedClaimIssuers: bClaimIssuers = [] } = b;

  if (isSingleClaimCondition(a) && isSingleClaimCondition(b)) {
    equalClaims = isEqual(a.claim, b.claim);
  } else if (isMultiClaimCondition(a) && isMultiClaimCondition(b)) {
    const { claims: aClaims } = a;
    const { claims: bClaims } = b;

    equalClaims = hasSameElements(aClaims, bClaims);
  } else if (aType === ConditionType.IsIdentity && bType === ConditionType.IsIdentity) {
    equalClaims = signerToString(a.identity) === signerToString(b.identity);
  } else if (aType === ConditionType.IsExternalAgent && bType === ConditionType.IsExternalAgent) {
    equalClaims = true;
  }

  const equalClaimIssuers = hasSameElements(
    aClaimIssuers,
    bClaimIssuers,
    (
      { identity: aIdentity, trustedFor: aTrustedFor },
      { identity: bIdentity, trustedFor: bTrustedFor }
    ) =>
      signerToString(aIdentity) === signerToString(bIdentity) &&
      hasSameElements(aTrustedFor || [], bTrustedFor || [])
  );

  return equalClaims && equalClaimIssuers;
}

/**
 * @hidden
 *
 * Transforms `InputCACheckpoint` values to `Checkpoint | CheckpointSchedule | Date` for easier processing
 */
export async function getCheckpointValue(
  checkpoint: InputCaCheckpoint,
  asset: string | FungibleAsset,
  context: Context
): Promise<Checkpoint | CheckpointSchedule | Date> {
  if (
    checkpoint instanceof Checkpoint ||
    checkpoint instanceof CheckpointSchedule ||
    checkpoint instanceof Date
  ) {
    return checkpoint;
  }
  const assetEntity = await asFungibleAsset(asset, context);
  const { type, id } = checkpoint;
  if (type === CaCheckpointType.Existing) {
    return assetEntity.checkpoints.getOne({ id });
  } else {
    return (
      await assetEntity.checkpoints.schedules.getOne({
        id,
      })
    ).schedule;
  }
}

/**
 * @hidden
 */
export interface TxAndArgsArray<Args extends Readonly<unknown[]> = Readonly<unknown[]>> {
  transaction: PolymeshTx<Args>;
  argsArray: Args[];
}

type MapTxAndArgsArray<Args extends Readonly<unknown[][]>> = {
  [K in keyof Args]: Args[K] extends unknown[] ? TxAndArgsArray<Args[K]> : never;
};

/**
 * @hidden
 */
function mapArgs<Args extends unknown[] | []>({
  transaction,
  argsArray,
}: TxAndArgsArray<Args>): MapTxWithArgs<Args[]> {
  return argsArray.map(args => ({
    transaction,
    args,
  })) as unknown as MapTxWithArgs<Args[]>;
}

/**
 * Assemble the `transactions` array that is expected in a `BatchTransactionSpec` from a set of parameter arrays with their
 *   respective transaction
 *
 * @note This method ensures type safety for batches with a variable amount of transactions
 */
export function assembleBatchTransactions<ArgsArray extends Readonly<unknown[][]>>(
  txsAndArgs: MapTxAndArgsArray<ArgsArray>
): MapTxWithArgs<unknown[][]> {
  return flatMap(txsAndArgs, mapArgs) as unknown as MapTxWithArgs<unknown[][]>;
}

/**
 * @hidden
 *
 * Returns portfolio numbers for a set of portfolio names
 */
export async function getPortfolioIdsByName(
  rawIdentityId: PolymeshPrimitivesIdentityId,
  rawNames: Bytes[],
  context: Context
): Promise<(BigNumber | null)[]> {
  const {
    polymeshApi: {
      query: { portfolio },
    },
  } = context;

  const rawPortfolioNumbers = await portfolio.nameToNumber.multi(
    rawNames.map<[PolymeshPrimitivesIdentityId, Bytes]>(name => [rawIdentityId, name])
  );

  return rawPortfolioNumbers.map(number => {
    const rawPortfolioId = number.unwrapOr(null);
    return optionize(u64ToBigNumber)(rawPortfolioId);
  });
}

/**
 * @hidden
 *
 * Check if a transaction matches the type of its args. Returns the same value but stripped of the types. This function has no logic, it's strictly
 *   for type safety when returning a `BatchTransactionSpec` with a variable amount of transactions
 */
export function checkTxType<Args extends unknown[]>(tx: TxWithArgs<Args>): TxWithArgs<unknown[]> {
  return tx as unknown as TxWithArgs<unknown[]>;
}

/**
 * @hidden
 *
 * Add an empty handler to a promise to avoid false positive unhandled promise errors. The original promise
 *   is returned, so rejections are still bubbled up and caught properly. This is an ugly hack and should be used
 *   sparingly and only if you KNOW that rejections will be handled properly down the line
 *
 * More info:
 *
 * - https://github.com/facebook/jest/issues/6028#issuecomment-567851031
 * - https://stackoverflow.com/questions/59060508/how-to-handle-an-unhandled-promise-rejection-asynchronously
 * - https://stackoverflow.com/questions/40920179/should-i-refrain-from-handling-promise-rejection-asynchronously/40921505#40921505
 */
export function defusePromise<T>(promise: Promise<T>): Promise<T> {
  promise.catch(noop);

  return promise;
}

/**
 * @hidden
 *
 * Transform an array of Identities into exempted IDs for Transfer Managers.
 *
 * @note even though the signature for `addExemptedEntities` requires `ScopeId`s as parameters,
 *   it accepts and handles `PolymeshPrimitivesIdentityId` parameters as well. Nothing special has to be done typing-wise since they're both aliases
 *   for `U8aFixed`
 *
 * @throws
 *   - if there are duplicated Identities/ScopeIDs
 */
export async function getExemptedIds(
  identities: (string | Identity)[],
  context: Context
): Promise<string[]> {
  const exemptedIds: string[] = [];

  const identityEntities = identities.map(identity => asIdentity(identity, context));

  exemptedIds.push(...identityEntities.map(identity => asDid(identity), context));
  const hasDuplicates = uniq(exemptedIds).length !== exemptedIds.length;

  if (hasDuplicates) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'One or more of the passed exempted Identities are repeated or have the same Scope ID',
    });
  }

  return exemptedIds;
}

const getAllowedMajors = (range: string, supportedSpecSemver: string): string[] => {
  const lowMajor = major(supportedSpecSemver).toString();
  const versions = range.split('||');
  /* istanbul ignore next: should get covered after dual version support is removed */
  if (versions.length === 1) {
    return [lowMajor];
  }
  const higherAllowedSpec = versions[versions.length - 1].trim();
  const higherVersion = coerce(higherAllowedSpec)!.version;
  const highMajor = major(higherVersion).toString();
  return [lowMajor, highMajor];
};

/**
 * @hidden
 *
 * Add a dot to a number every three digits from right to left
 */
function addDotSeparator(value: number): string {
  let result = '';

  value
    .toString()
    .split('')
    .reverse()
    .forEach((char, index) => {
      if ((index + 1) % 3 === 1 && index !== 0) {
        result = `.${result}`;
      }

      result = `${char}${result}`;
    });

  return result;
}

/**
 * @hidden
 */
function assertExpectedSpecVersion(
  data: { result: { specVersion: number } },
  reject: (reason?: unknown) => void,
  isPrivateSupported: boolean
): void {
  const {
    result: { specVersion },
  } = data;

  /*
   * the spec version number comes as a single number (e.g. 5000000). It should be parsed as xxx_yyy_zzz
   * where xxx is the major version, yyy is the minor version, and zzz is the patch version. So for example, 5001023
   * would be version 5.1.23
   */
  const specVersionAsSemver = addDotSeparator(specVersion)
    .split('.')
    // remove leading zeroes, for example 020 becomes 20, 000 becomes 0
    .map((ver: string) => ver.replace(/^0+(?!$)/g, ''))
    .join('.');

  const supportedSemver = isPrivateSupported
    ? PRIVATE_SUPPORTED_SPEC_SEMVER
    : SUPPORTED_SPEC_SEMVER;

  const supportedSpecVersionRange = isPrivateSupported
    ? PRIVATE_SUPPORTED_SPEC_VERSION_RANGE
    : SUPPORTED_SPEC_VERSION_RANGE;

  const neededMajors = getAllowedMajors(supportedSpecVersionRange, supportedSemver);

  if (neededMajors.every(neededMajor => !satisfies(specVersionAsSemver, neededMajor))) {
    const error = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unsupported Polymesh chain spec version. Please upgrade the SDK',
      data: {
        specVersion: specVersionAsSemver,
        supportedVersionRange: supportedSemver,
      },
    });

    reject(error);
  }
}

/**
 * @hidden
 *
 * Get latest SQ version
 */
export async function getLatestSqVersion(context: Context): Promise<string> {
  const {
    data: {
      subqueryVersions: {
        nodes: [sqVersion],
      },
    },
  } = await context.queryMiddleware<Ensured<Query, 'subqueryVersions'>>(latestSqVersionQuery());

  return sqVersion?.version || '1.0.0';
}

/**
 * @hidden
 *
 * Checks SQ version compatibility with the SDK
 */
export async function warnUnexpectedSqVersion(context: Context): Promise<void> {
  const sqVersion = await getLatestSqVersion(context);
  if (lt(sqVersion, MINIMUM_SQ_VERSION)) {
    console.warn(
      `This version of the SDK supports Polymesh SubQuery version ${MINIMUM_SQ_VERSION} or higher. Please upgrade the MiddlewareV2`
    );
  }
}

/**
 * @hidden
 *
 * @returns protocol present in `url`, or `undefined` if one is not found
 */
export function extractProtocol(url: string): string | undefined {
  const matcher = /^(https?|wss?):\/\//;

  return matcher.exec(url)?.[1];
}

/**
 * @hidden
 *
 * Checks chain version. This function uses a websocket/fetch as it's intended to be called during initialization
 * @param nodeUrl - URL for the chain node
 * @returns A promise that resolves if the version is in the expected range, otherwise it will reject
 */
export function assertExpectedChainVersion(nodeUrl: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const protocol = extractProtocol(nodeUrl);

    if (!protocol) {
      const err = new PolymeshError({
        code: ErrorCode.General,
        message: 'nodeUrl must start with protocol. http(s) and ws(s) are supported',
        data: { nodeUrl, protocol },
      });
      reject(err);
      return;
    }

    let confidentialAssetsSupported: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let specResponse: any;

    const checkResponses = (cleanup?: () => void): void => {
      if (specResponse && typeof confidentialAssetsSupported !== 'undefined') {
        assertExpectedSpecVersion(specResponse, reject, confidentialAssetsSupported);

        if (cleanup) {
          cleanup();
        }

        resolve(specResponse.result.specVersion);
      }
    };

    const handleError = (error: Error): void => {
      const err = new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Could not connect to the Polymesh node at ${nodeUrl}`,
        data: { error },
      });
      reject(err);
    };

    if (protocol.startsWith('ws')) {
      const client = new W3CWebSocket(nodeUrl);
      client.onopen = (): void => {
        client.send(JSON.stringify(CONFIDENTIAL_ASSETS_SUPPORTED_CALL));
        client.send(JSON.stringify(STATE_RUNTIME_VERSION_CALL));
      };

      client.onmessage = (msg): void => {
        const data = JSON.parse(msg.data.toString());
        const { id } = data;

        if (id === CONFIDENTIAL_ASSETS_SUPPORTED_CALL.id) {
          confidentialAssetsSupported = !!data.result;
        } else {
          specResponse = data;
        }

        checkResponses(() => client.close());
      };

      client.onerror = (error: Error): void => {
        client.close();
        handleError(error);
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const headers = { 'Content-Type': 'application/json' };
      fetch(nodeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(CONFIDENTIAL_ASSETS_SUPPORTED_CALL),
      })
        .then(response => response.json())
        .then(data => {
          confidentialAssetsSupported = !!data.result;

          checkResponses();
        })
        .catch(error => handleError(error));

      fetch(nodeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(STATE_RUNTIME_VERSION_CALL),
      })
        .then(response => response.json())
        .then(data => {
          specResponse = data;

          checkResponses();
        })
        .catch(error => handleError(error));
    }
  });
}

/**
 * @hidden
 * @returns true is the given stat is able to track the data for the given args
 */
export function compareStatsToInput(
  rawStatType: PolymeshPrimitivesStatisticsStatType,
  args: RemoveAssetStatParams
): boolean {
  let claimIssuer;
  const { type } = args;

  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    claimIssuer = { issuer: args.issuer, claimType: args.claimType };
  }

  if (rawStatType.claimIssuer.isNone && !!claimIssuer) {
    return false;
  }

  if (rawStatType.claimIssuer.isSome) {
    if (!claimIssuer) {
      return false;
    }

    const { issuer, claimType } = claimIssuer;
    const [meshType, meshIssuer] = rawStatType.claimIssuer.unwrap();
    const issuerDid = identityIdToString(meshIssuer);
    const statType = meshClaimTypeToClaimType(meshType);
    if (issuerDid !== issuer.did) {
      return false;
    }

    if (statType !== claimType) {
      return false;
    }
  }

  const stat = meshStatToStatType(rawStatType);

  return stat === type;
}

/**
 * @hidden
 * @returns true if the given StatType is able to track the data for the given transfer condition
 */
export function compareTransferRestrictionToStat(
  transferCondition: PolymeshPrimitivesTransferComplianceTransferCondition,
  type: StatType,
  claimIssuer?: StatClaimIssuer
): boolean {
  if (
    (type === StatType.Count && transferCondition.isMaxInvestorCount) ||
    (type === StatType.Balance && transferCondition.isMaxInvestorOwnership)
  ) {
    return true;
  }

  if (!claimIssuer) {
    return false;
  }

  const {
    issuer: { did: issuerDid },
    claimType,
  } = claimIssuer;

  let rawClaim, issuer;
  if (transferCondition.isClaimCount) {
    [rawClaim, issuer] = transferCondition.asClaimCount;
  } else if (transferCondition.isClaimOwnership) {
    [rawClaim, issuer] = transferCondition.asClaimOwnership;
  }
  if (rawClaim && issuer) {
    const restrictionIssuerDid = identityIdToString(issuer);
    const claim = statsClaimToStatClaimInputType(rawClaim);
    if (restrictionIssuerDid === issuerDid && claim.type === claimType) {
      return true;
    }
  }

  return false;
}

/**
 * @hidden
 */
function getClaimType(statClaim: PolymeshPrimitivesStatisticsStatClaim): ClaimType {
  if (statClaim.isAccredited) {
    return ClaimType.Accredited;
  } else if (statClaim.isAffiliate) {
    return ClaimType.Affiliate;
  } else {
    return ClaimType.Jurisdiction;
  }
}

/**
 * @hidden
 */
function compareOptionalBigNumbers(a: BigNumber | undefined, b: BigNumber | undefined): boolean {
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  return a.eq(b);
}

/**
 * @hidden
 */
export function compareTransferRestrictionToInput(
  rawRestriction: PolymeshPrimitivesTransferComplianceTransferCondition,
  inputRestriction: TransferRestriction
): boolean {
  const { type, value } = inputRestriction;
  if (rawRestriction.isMaxInvestorCount && type === TransferRestrictionType.Count) {
    const currentCount = u64ToBigNumber(rawRestriction.asMaxInvestorCount);
    return currentCount.eq(value);
  } else if (rawRestriction.isMaxInvestorOwnership && type === TransferRestrictionType.Percentage) {
    const currentOwnership = permillToBigNumber(rawRestriction.asMaxInvestorOwnership);
    return currentOwnership.eq(value);
  } else if (rawRestriction.isClaimCount && type === TransferRestrictionType.ClaimCount) {
    const [statClaim, rawIssuerId, rawMin, maybeMax] = rawRestriction.asClaimCount;
    const issuerDid = identityIdToString(rawIssuerId);
    const min = u64ToBigNumber(rawMin);
    const max = maybeMax.isSome ? u64ToBigNumber(maybeMax.unwrap()) : undefined;
    const { min: valueMin, max: valueMax, claim: valueClaim, issuer: valueIssuer } = value;

    return (
      valueMin.eq(min) &&
      compareOptionalBigNumbers(max, valueMax) &&
      valueClaim.type === getClaimType(statClaim) &&
      issuerDid === valueIssuer.did
    );
  } else if (rawRestriction.isClaimOwnership && type === TransferRestrictionType.ClaimPercentage) {
    const { min: valueMin, max: valueMax, claim: valueClaim, issuer: valueIssuer } = value;
    const [statClaim, rawIssuerId, rawMin, rawMax] = rawRestriction.asClaimOwnership;
    const issuerDid = identityIdToString(rawIssuerId);
    const min = permillToBigNumber(rawMin);
    const max = permillToBigNumber(rawMax);

    return (
      valueMin.eq(min) &&
      valueMax.eq(max) &&
      valueClaim.type === getClaimType(statClaim) &&
      issuerDid === valueIssuer.did
    );
  }

  return false;
}

/**
 * @hidden
 * @param args.type TransferRestriction type that was given
 * @param args.claimIssuer optional Issuer and ClaimType for the scope of the Stat
 * @param context
 * @returns encoded StatType needed for the TransferRestriction to be enabled
 */
export function neededStatTypeForRestrictionInput(
  args: { type: TransferRestrictionType; claimIssuer?: StatClaimIssuer },
  context: Context
): PolymeshPrimitivesStatisticsStatType {
  const { type, claimIssuer } = args;

  const rawOp = transferRestrictionTypeToStatOpType(type, context);

  const rawIssuer = claimIssuer ? claimIssuerToMeshClaimIssuer(claimIssuer, context) : undefined;
  return statisticsOpTypeToStatType({ operationType: rawOp, claimIssuer: rawIssuer }, context);
}

/**
 * @hidden
 * @throws if stat is not found in the given set
 */
export function assertStatIsSet(
  currentStats: BTreeSet<PolymeshPrimitivesStatisticsStatType>,
  neededStat: PolymeshPrimitivesStatisticsStatType
): void {
  const needStat = ![...currentStats].find(s => s.eq(neededStat));

  if (needStat) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'The appropriate stat type for this restriction is not set. Try calling enableStat in the namespace first',
    });
  }
}

/**
 * @hidden
 *
 * Fetches Account permissions for the given secondary Accounts
 *
 * @note non secondary Accounts will be skipped, so there maybe less PermissionedAccounts returned than Accounts given
 *
 * @param args.accounts a list of accounts to fetch permissions for
 * @param args.identity optional. If passed, Accounts that are not part of the given Identity will be filtered out
 */
export async function getSecondaryAccountPermissions(
  args: { accounts: Account[]; identity?: Identity },
  context: Context,
  callback: SubCallback<PermissionedAccount[]>
): Promise<UnsubCallback>;

export async function getSecondaryAccountPermissions(
  args: { accounts: (Account | MultiSig)[]; identity?: Identity },
  context: Context
): Promise<PermissionedAccount[]>;
// eslint-disable-next-line require-jsdoc
export async function getSecondaryAccountPermissions(
  args: {
    accounts: (Account | MultiSig)[];
    identity?: Identity;
  },
  context: Context,
  callback?: SubCallback<PermissionedAccount[]>
): Promise<PermissionedAccount[] | UnsubCallback> {
  const {
    polymeshApi: {
      query: { identity: identityQuery },
    },
  } = context;

  const { accounts, identity } = args;

  const assembleResult = async (
    optKeyRecords: Option<PolymeshPrimitivesSecondaryKeyKeyRecord>[]
  ): Promise<PermissionedAccount[]> => {
    const result: PermissionedAccount[] = [];
    let index = 0;
    const getAccountAsSecondaryKey = async (
      record: PolymeshPrimitivesSecondaryKeyKeyRecord,
      account: Account | MultiSig
    ): Promise<void> => {
      const rawIdentityId = record.asSecondaryKey;
      if (!identity || identityIdToString(rawIdentityId) === identity.did) {
        const { permissions, unmatchedPermissions } = await meshPermissionsToPermissionsV2(
          account,
          context
        );

        result.push({
          account,
          permissions,
          unmatchedPermissions,
        });
      }
    };
    for (const optKeyRecord of optKeyRecords) {
      const account = accounts[index];
      if (optKeyRecord.isSome) {
        const record = optKeyRecord.unwrap();

        if (record.isSecondaryKey) {
          await getAccountAsSecondaryKey(record, account);
        }
      }
      index++;
    }
    return result;
  };

  const identityKeys = accounts.map(({ address }) => stringToAccountId(address, context));
  if (callback) {
    return identityQuery.keyRecords.multi(identityKeys, async result => {
      const value = await assembleResult(result);
      await callback(value);
    });
  }
  const rawResults = await identityQuery.keyRecords.multi(identityKeys);

  return assembleResult(rawResults);
}

/**
 * @hidden
 */
export async function getExemptedBtreeSet(
  identities: (string | Identity)[],
  context: Context
): Promise<BTreeSet<PolymeshPrimitivesIdentityId>> {
  const exemptedIds = await getExemptedIds(identities, context);
  const mapped = exemptedIds.map(exemptedId => asIdentity(exemptedId, context));

  return identitiesToBtreeSet(mapped, context);
}

/**
 * @hidden
 */
export async function getIdentityFromKeyRecord(
  keyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord,
  context: Context
): Promise<Identity | null> {
  const {
    polymeshApi: {
      query: { identity },
    },
  } = context;

  if (keyRecord.isPrimaryKey) {
    const did = identityIdToString(keyRecord.asPrimaryKey);
    return new Identity({ did }, context);
  } else if (keyRecord.isSecondaryKey) {
    const did = identityIdToString(keyRecord.asSecondaryKey);
    return new Identity({ did }, context);
  } else {
    const multiSigAddress = keyRecord.asMultiSigSignerKey;
    const optMultiSigKeyRecord = await identity.keyRecords(multiSigAddress);

    if (optMultiSigKeyRecord.isNone) {
      return null;
    }

    const multiSigKeyRecord = optMultiSigKeyRecord.unwrap();
    return getIdentityFromKeyRecord(multiSigKeyRecord, context);
  }
}

/**
 * @hidden
 *
 * helper to construct proper type asset
 *
 * @note `assetDetails` and `tickers` must have the same offset
 */
export function assembleAssetQuery(
  assetDetails: Option<PalletAssetAssetDetails>[],
  assetIds: string[],
  context: Context
): Asset[] {
  return assetDetails.map((rawDetails, index) => {
    const assetId = assetIds[index];
    const detail = rawDetails.unwrap();

    if (detail.assetType.isNonFungible) {
      return new NftCollection({ assetId }, context);
    } else {
      return new FungibleAsset({ assetId }, context);
    }
  });
}

/**
 * @hidden
 */
export function asNftId(nft: Nft | BigNumber): BigNumber {
  if (nft instanceof BigNumber) {
    return nft;
  } else {
    return nft.id;
  }
}

/**
 * @hidden
 */
export function areSameClaims(
  claim: Claim,
  { scope, type, customClaimTypeId }: MiddlewareClaim
): boolean {
  // filter out deprecated claim types
  if (
    type === ClaimTypeEnum.NoData ||
    type === ClaimTypeEnum.NoType ||
    type === ClaimTypeEnum.InvestorUniqueness ||
    type === ClaimTypeEnum.InvestorUniquenessV2
  ) {
    return false;
  }

  if (isScopedClaim(claim) && scope && !isEqual(middlewareScopeToScope(scope), claim.scope)) {
    return false;
  }

  if (
    type === ClaimTypeEnum.Custom &&
    claim.type === ClaimType.Custom &&
    customClaimTypeId &&
    !claim.customClaimTypeId.isEqualTo(customClaimTypeId)
  ) {
    return false;
  }

  return ClaimType[type] === claim.type;
}

/**
 * @hidden
 */
export function assertNoPendingAuthorizationExists(params: {
  authorizationRequests: AuthorizationRequest[];
  message: string;
  authorization: Partial<Authorization>;
  issuer?: Identity;
  target?: string | Identity;
}): void {
  const {
    authorizationRequests,
    message,
    authorization,
    target: targetToCheck,
    issuer: issuerToCheck,
  } = params;

  if (authorizationRequests.length === 0) {
    return;
  }

  const pendingAuthorization = authorizationRequests.find(authorizationRequest => {
    const { issuer, target, data } = authorizationRequest;

    if (authorizationRequest.isExpired()) {
      return false;
    }

    if (targetToCheck && signerToString(target) !== signerToString(targetToCheck)) {
      return false;
    }

    if (issuerToCheck && signerToString(issuer) !== signerToString(issuerToCheck)) {
      return false;
    }

    if (authorization.type && data.type !== authorization.type) {
      return false;
    }

    if (authorization.type === AuthorizationType.PortfolioCustody && authorization.value) {
      const authorizationData = data as { value: NumberedPortfolio | DefaultPortfolio };

      return authorizationData.value.isEqual(authorization.value);
    }

    if (authorization.type === AuthorizationType.AttestPrimaryKeyRotation && authorization.value) {
      const authorizationData = data as AttestPrimaryKeyRotationAuthorizationData;

      return authorizationData.value.isEqual(authorization.value);
    }

    // last checks for authorizations that have string values
    const { value } = authorization as GenericAuthorizationData;
    const { value: authorizationValue } = data as GenericAuthorizationData;

    if (value && value !== authorizationValue) {
      return false;
    }

    return true;
  });

  if (pendingAuthorization) {
    const { issuer, target, data, authId } = pendingAuthorization;
    const { type: authorizationType } = data;
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message,
      data: { target, issuer, authorizationType, authId: authId.toString() },
    });
  }
}

/**
 * @hidden
 */
export async function assertIdentityExists(identity: Identity): Promise<void> {
  const exists = await identity.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The identity does not exists',
      data: { did: identity.did },
    });
  }
}

/**
 * @hidden
 */
export async function getAccount(
  args: { address: string },
  context: Context
): Promise<Account | MultiSig> {
  const {
    polymeshApi: {
      query: { multiSig },
    },
  } = context;
  const { address } = args;

  const rawAddress = stringToAccountId(address, context);
  const rawSigners = await multiSig.multiSigSigners.entries(rawAddress);
  if (rawSigners.length > 0) {
    return new MultiSig(args, context);
  }

  return new Account(args, context);
}

/**
 * @hidden
 *
 * Used for querying middleware which stores asset ID in hex format
 *
 * @return assetId in hex format
 */
export async function getAssetIdForMiddleware(
  assetIdOrTicker: string | BaseAsset,
  context: Context
): Promise<string> {
  /**
   * For cases where ticker is passed in with 7.x chain, we make sure we get assetId mapped with the ticker
   * `asAssetId` creates a `BaseAsset` and returns the ID which is the ticker value for 6.x chain and ID for 7.x chain
   */
  const assetId = await asAssetId(assetIdOrTicker, context);

  return uuidToHex(assetId);
}

/**
 * @hidden
 *
 * used for converting assetId from SQ format to SDK format
 *
 * @returns asset ID as UUID format
 */
export function getAssetIdFromMiddleware(
  assetIdAndTicker: Falsyable<Pick<MiddlewareAsset, 'id' | 'ticker'>>
): string {
  const { id } = assetIdAndTicker!;
  return hexToUuid(id);
}

/**
 * @hidden
 */
export async function prepareStorageForCustomType(
  customType: string | BigNumber,
  knownTypes: string[],
  context: Context,
  method: string
): Promise<Storage['customTypeData']> {
  let customTypeData: Storage['customTypeData'];

  if (customType instanceof BigNumber) {
    const rawId = bigNumberToU32(customType, context);
    const rawValue = await context.polymeshApi.query.asset.customTypes(rawId);

    if (rawValue.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `${method} was given a custom type ID that does not have an corresponding value`,
        data: { customType },
      });
    }

    customTypeData = {
      rawId,
      rawValue,
      isAlreadyCreated: true,
    };
  } else if (!knownTypes.includes(customType)) {
    const rawValue = stringToBytes(customType, context);
    const rawId = await context.polymeshApi.query.asset.customTypesInverse(rawValue);

    if (rawId.isNone) {
      const rawCustomAssetTypeId = await context.polymeshApi.query.asset.customTypeIdSequence();
      const nextCustomAssetTypeId = u32ToBigNumber(rawCustomAssetTypeId).plus(1);

      customTypeData = {
        rawId: bigNumberToU32(nextCustomAssetTypeId, context),
        rawValue,
        isAlreadyCreated: false,
      };
    } else {
      customTypeData = {
        rawId: rawId.unwrap(),
        rawValue,
        isAlreadyCreated: true,
      };
    }
  } else {
    customTypeData = null;
  }

  return customTypeData;
}

/**
 * Determines the middleware permissions follows the legacy format
 */
export function isMiddlewareV6Extrinsic(
  permissions: MiddlewarePermissions
): permissions is MiddlewareV6Extrinsic {
  const keys = Object.keys(permissions);
  const vals = Object.values(permissions);

  // API is the same for "whole permissions" or no permissions
  if (keys.includes('whole') || vals.length === 0) {
    return false;
  }

  const firstVal = vals[0];

  if ('palletName' in firstVal || (firstVal[0] && 'palletName' in firstVal[0])) {
    return true;
  }

  return false;
}

/**
 * @hidden
 *
 * @throws if payee is not associated with an Identity
 *
 * @returns raw payee for staking extrinsics
 */
export async function calculateRawStakingPayee(
  payee: Account,
  stash: Account,
  controller: Account,
  autoStake: boolean,
  context: Context
): Promise<RewardDestination> {
  const payeeId = await payee.getIdentity();

  if (!payeeId) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The payee should have an identity',
      data: { payee: payee.address },
    });
  }

  if (autoStake) {
    if (!payee.isEqual(stash)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'autoStake requires the stash to be the payee',
        data: { stash: stash.address, payee: payee.address },
      });
    }

    return stakingRewardDestinationToRaw({ staked: true }, context);
  } else if (stash.isEqual(payee)) {
    return stakingRewardDestinationToRaw({ stash: true }, context);
  } else if (controller.isEqual(payee)) {
    return stakingRewardDestinationToRaw({ controller: true }, context);
  } else {
    return stakingRewardDestinationToRaw({ account: payee }, context);
  }
}

/**
 * @hidden
 */
export function areSameAccounts(account1: Account, account2: Account): boolean {
  return account1.address === account2.address;
}
