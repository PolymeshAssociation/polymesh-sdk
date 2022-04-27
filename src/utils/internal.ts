import {
  AugmentedEvent,
  AugmentedQuery,
  AugmentedQueryDoubleMap,
  DropLast,
  ObsInnerType,
} from '@polkadot/api/types';
import { StorageKey } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { AnyFunction, AnyTuple, IEvent, ISubmittableResult } from '@polkadot/types/types';
import { stringUpperFirst } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import stringify from 'json-stable-stringify';
import { differenceWith, flatMap, isEqual, mapValues, noop, padEnd, uniq } from 'lodash';
import { IdentityId, ModuleName, PortfolioName, TxTag } from 'polymesh-types/types';
import { satisfies } from 'semver';
import { IMessageEvent, w3cwebsocket as W3CWebSocket } from 'websocket';

import {
  Asset,
  Checkpoint,
  CheckpointSchedule,
  Context,
  Identity,
  PolymeshError,
  PostTransactionValue,
  TransactionQueue,
} from '~/internal';
import { Scope as MiddlewareScope } from '~/middleware/types';
import {
  CaCheckpointType,
  CalendarPeriod,
  CalendarUnit,
  Claim,
  ClaimType,
  Condition,
  ConditionType,
  CountryCode,
  ErrorCode,
  InputCaCheckpoint,
  InputCondition,
  NextKey,
  NoArgsProcedureMethod,
  PaginationOptions,
  ProcedureAuthorizationStatus,
  ProcedureMethod,
  ProcedureOpts,
  Scope,
} from '~/types';
import {
  Events,
  Falsyable,
  MapMaybePostTransactionValue,
  MapTxWithArgs,
  MaybePostTransactionValue,
  PolymeshTx,
  TxWithArgs,
} from '~/types/internal';
import { HumanReadableType, ProcedureFunc, UnionOfProcedureFuncs } from '~/types/utils';
import {
  DEFAULT_GQL_PAGE_SIZE,
  MAX_TICKER_LENGTH,
  SUPPORTED_VERSION_RANGE,
  SYSTEM_VERSION_RPC_CALL,
} from '~/utils/constants';
import { middlewareScopeToScope, signerToString, u64ToBigNumber } from '~/utils/conversion';
import { isEntity, isMultiClaimCondition, isSingleClaimCondition } from '~/utils/typeguards';

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
  scopeId: Falsyable<string>
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
    case ClaimType.NoData: {
      return {
        type,
      };
    }
    case ClaimType.CustomerDueDiligence: {
      return {
        type,
        id: cddId as string,
      };
    }
    case ClaimType.InvestorUniqueness: {
      return {
        type,
        scope,
        scopeId: scopeId as string,
        cddId: cddId as string,
      };
    }
    case ClaimType.InvestorUniquenessV2: {
      return {
        type,
        cddId: cddId as string,
      };
    }
  }

  return { type, scope };
}

/**
 * @hidden
 *
 * Unwrap a Post Transaction Value
 */
export function unwrapValue<T>(value: MaybePostTransactionValue<T>): T {
  if (value instanceof PostTransactionValue) {
    return value.value;
  }

  return value;
}

/**
 * @hidden
 *
 * Unwrap all Post Transaction Values present in a tuple
 */
export function unwrapValues<T extends unknown[]>(values: MapMaybePostTransactionValue<T>): T {
  return values.map(unwrapValue) as T;
}

/**
 * @hidden
 */
type EventData<Event> = Event extends AugmentedEvent<'promise', infer Data> ? Data : never;

/**
 * @hidden
 * Find every occurrence of a specific event inside a receipt
 *
 * @throws If the event is not found
 */
export function filterEventRecords<
  ModuleName extends keyof Events,
  EventName extends keyof Events[ModuleName]
>(
  receipt: ISubmittableResult,
  mod: ModuleName,
  eventName: EventName
): IEvent<EventData<Events[ModuleName][EventName]>>[] {
  const eventRecords = receipt.filterRecords(mod, eventName as string);
  if (!eventRecords.length) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Event "${mod}.${eventName}" wasn't fired even though the corresponding transaction was completed. Please report this to the Polymath team`,
    });
  }

  return eventRecords.map(
    eventRecord => eventRecord.event as unknown as IEvent<EventData<Events[ModuleName][EventName]>>
  );
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
 * Makes a request to the chain. If a block hash is supplied,
 *   the request will be made at that block. Otherwise, the most recent block will be queried
 */
export async function requestAtBlock<F extends AnyFunction>(
  query: AugmentedQuery<'promise', F> | AugmentedQueryDoubleMap<'promise', F>,
  opts: {
    blockHash?: string | BlockHash;
    args: Parameters<F>;
  },
  context: Context
): Promise<ObsInnerType<ReturnType<F>>> {
  const { blockHash, args } = opts;

  if (blockHash) {
    if (!context.isArchiveNode) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Cannot query previous blocks in a non-archive node',
      });
    }
    return query.at(blockHash, ...args);
  }

  return query(...args);
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
export function calculateNextKey(
  totalCount: BigNumber,
  size?: BigNumber,
  start?: BigNumber
): NextKey {
  const next = (start ?? new BigNumber(0)).plus(size ?? DEFAULT_GQL_PAGE_SIZE);
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
  },
  context: Context
):
  | ProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue>
  | NoArgsProcedureMethod<ProcedureReturnValue, ReturnValue> {
  const { getProcedureAndArgs, transformer, voidArgs } = args;

  if (voidArgs) {
    const voidMethod = (
      opts: ProcedureOpts = {}
    ): Promise<TransactionQueue<ProcedureReturnValue, ReturnValue>> => {
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

  const method = (
    methodArgs: MethodArgs,
    opts: ProcedureOpts = {}
  ): Promise<TransactionQueue<ProcedureReturnValue, ReturnValue>> => {
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
    });
  }

  if (address !== encodedAddress) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The supplied address is not encoded with the chain's SS58 format",
      data: {
        ss58Format,
      },
    });
  }
}

/**
 * @hidden
 */
export function asTicker(asset: string | Asset): string {
  return typeof asset === 'string' ? asset : asset.ticker;
}

/**
 * @hidden
 */
export function asAsset(asset: string | Asset, context: Context): Asset {
  return typeof asset === 'string' ? new Asset({ ticker: asset }, context) : asset;
}

/**
 * @hidden
 */
export function xor(a: boolean, b: boolean): boolean {
  return a !== b;
}

/**
 * @hidden
 */
function secondsInUnit(unit: CalendarUnit): BigNumber {
  const SECOND = new BigNumber(1);
  const MINUTE = SECOND.multipliedBy(60);
  const HOUR = MINUTE.multipliedBy(60);
  const DAY = HOUR.multipliedBy(24);
  const WEEK = DAY.multipliedBy(7);
  const MONTH = DAY.multipliedBy(30);
  const YEAR = DAY.multipliedBy(365);

  switch (unit) {
    case CalendarUnit.Second: {
      return SECOND;
    }
    case CalendarUnit.Minute: {
      return MINUTE;
    }
    case CalendarUnit.Hour: {
      return HOUR;
    }
    case CalendarUnit.Day: {
      return DAY;
    }
    case CalendarUnit.Week: {
      return WEEK;
    }
    case CalendarUnit.Month: {
      return MONTH;
    }
    case CalendarUnit.Year: {
      return YEAR;
    }
  }
}

/**
 * @hidden
 * Calculate the numeric complexity of a calendar period
 */
export function periodComplexity(period: CalendarPeriod): BigNumber {
  const secsInYear = secondsInUnit(CalendarUnit.Year);
  const { amount, unit } = period;

  if (amount.isZero()) {
    return new BigNumber(1);
  }

  const secsInUnit = secondsInUnit(unit);

  const complexity = secsInYear.dividedBy(secsInUnit.multipliedBy(amount));
  return BigNumber.maximum(2, complexity.integerValue(BigNumber.ROUND_FLOOR));
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
  asset: string | Asset,
  context: Context
): Promise<Checkpoint | CheckpointSchedule | Date> {
  if (
    checkpoint instanceof Checkpoint ||
    checkpoint instanceof CheckpointSchedule ||
    checkpoint instanceof Date
  ) {
    return checkpoint;
  }
  const assetEntity = asAsset(asset, context);
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

interface TxAndArgsArray<Args extends unknown[] = unknown[]> {
  transaction: PolymeshTx<Args>;
  argsArray: Args[];
}

type MapTxAndArgsArray<Args extends unknown[][]> = {
  [K in keyof Args]: Args[K] extends unknown[] ? TxAndArgsArray<Args[K]> : never;
};

// * TODO @monitz87: delete this function when we eliminate `addBatchTransaction`
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

// * TODO @monitz87: delete this function when we eliminate `addBatchTransaction`
/**
 * Assemble the `transactions` array that has to be passed to `addBatchTransaction` from a set of parameter arrays with their
 *   respective transaction
 */
export function assembleBatchTransactions<ArgsArray extends unknown[][]>(
  txsAndArgs: MapTxAndArgsArray<ArgsArray>
): MapTxWithArgs<unknown[][]> {
  return flatMap(txsAndArgs, mapArgs) as unknown as MapTxWithArgs<unknown[][]>;
}

/**
 * @hidden
 *
 * Returns portfolio number for a given portfolio name
 */
export async function getPortfolioIdByName(
  rawIdentityId: IdentityId,
  rawName: PortfolioName,
  context: Context
): Promise<BigNumber | null> {
  const {
    polymeshApi: {
      query: { portfolio },
    },
  } = context;

  const rawPortfolioNumber = await portfolio.nameToNumber(rawIdentityId, rawName);

  const portfolioId = u64ToBigNumber(rawPortfolioNumber);

  // TODO @prashantasdeveloper remove this logic once nameToNumber returns Option<PortfolioNumber>
  if (portfolioId.eq(1)) {
    /**
     * since nameToNumber returns 1 for non-existing portfolios,
     * we need to check if the name matches against the portfolio number 1
     */
    const rawExistingPortfolioName = await portfolio.portfolios(rawIdentityId, rawPortfolioNumber);
    if (!rawName.eq(rawExistingPortfolioName)) {
      return null;
    }
  }

  return portfolioId;
}

/**
 * @hidden
 *
 * Check if a transaction matches the type of its args. Returns the same value but stripped of the types. This function has no logic, it's strictly
 *   for type safety around `addBatchTransaction`
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
 * Transform an array of Identities into exempted IDs for Transfer Managers. If the asset requires
 *   investor uniqueness, Scope IDs are fetched and returned. Otherwise, we use Identity IDs
 *
 * @note fetches missing scope IDs from the chain
 * @note even though the signature for `addExemptedEntities` requires `ScopeId`s as parameters,
 *   it accepts and handles `IdentityId` parameters as well. Nothing special has to be done typing-wise since they're both aliases
 *   for `U8aFixed`
 *
 * @throws
 *   - if the Asset requires Investor Uniqueness and one or more of the passed Identities don't have Scope IDs
 *   - if there are duplicated Identities/ScopeIDs
 */
export async function getExemptedIds(
  identities: (string | Identity)[],
  context: Context,
  ticker: string
): Promise<string[]> {
  const asset = new Asset({ ticker }, context);
  const { requiresInvestorUniqueness } = await asset.details();

  const didsWithNoScopeId: string[] = [];

  const exemptedIds: string[] = [];

  const identityEntities = identities.map(identity => asIdentity(identity, context));

  if (requiresInvestorUniqueness) {
    const scopeIds = await P.map(identityEntities, async identity =>
      identity.getScopeId({ asset: ticker })
    );

    scopeIds.forEach((scopeId, index) => {
      if (!scopeId) {
        didsWithNoScopeId.push(identityEntities[index].did);
      } else {
        exemptedIds.push(scopeId);
      }
    });

    if (didsWithNoScopeId.length) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: `Identities must have an Investor Uniqueness claim Scope ID in order to be exempted from Transfer Restrictions for Asset "${ticker}"`,
        data: {
          didsWithNoScopeId,
        },
      });
    }
  } else {
    exemptedIds.push(...identityEntities.map(identity => asDid(identity), context));
  }

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

/**
 * @hidden
 *
 * Checks chain version. This function uses a websocket as it's intended to be called during initialization
 * @param nodeUrl - URL for the chain node
 * @returns A promise that resolves if the version is in the expected range, otherwise it will reject
 */
export function assertExpectedChainVersion(nodeUrl: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const client = new W3CWebSocket(nodeUrl);

    client.onopen = (): void => {
      const msg = { ...SYSTEM_VERSION_RPC_CALL, id: 'assertExpectedChainVersion' };
      client.send(JSON.stringify(msg));
    };

    client.onmessage = (msg: IMessageEvent): void => {
      client.close();
      const { result: version } = JSON.parse(msg.data.toString());
      if (!satisfies(version, SUPPORTED_VERSION_RANGE)) {
        const error = new PolymeshError({
          code: ErrorCode.FatalError,
          message: 'Unsupported Polymesh version. Please upgrade the SDK',
          data: {
            polymeshVersion: version,
            supportedVersionRange: SUPPORTED_VERSION_RANGE,
          },
        });
        reject(error);
      } else {
        resolve();
      }
    };

    client.onerror = (error: Error): void => {
      client.close();
      const err = new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Could not connect to the Polymesh node at ${nodeUrl}`,
        data: { error },
      });
      reject(err);
    };
  });
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
