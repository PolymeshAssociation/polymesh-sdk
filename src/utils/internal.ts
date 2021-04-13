import {
  AugmentedEvent,
  AugmentedQuery,
  AugmentedQueryDoubleMap,
  ObsInnerType,
} from '@polkadot/api/types';
import { StorageKey } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { AnyFunction, AnyTuple, IEvent, ISubmittableResult } from '@polkadot/types/types';
import { stringUpperFirst } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import stringify from 'json-stable-stringify';
import { chunk, groupBy, map, padEnd } from 'lodash';
import { TxTag } from 'polymesh-types/types';

import { Procedure } from '~/base/Procedure';
import {
  Context,
  Identity,
  PolymeshError,
  PostTransactionValue,
  SecurityToken,
  TransactionQueue,
} from '~/internal';
import { Scope as MiddlewareScope } from '~/middleware/types';
import {
  CalendarPeriod,
  CalendarUnit,
  Claim,
  ClaimType,
  CommonKeyring,
  CountryCode,
  ErrorCode,
  NextKey,
  PaginationOptions,
  ProcedureAuthorizationStatus,
  Scope,
  UiKeyring,
} from '~/types';
import {
  Events,
  Falsyable,
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  ProcedureMethod,
} from '~/types/internal';
import { UnionOfProcedures } from '~/types/utils';
import {
  DEFAULT_GQL_PAGE_SIZE,
  DEFAULT_MAX_BATCH_ELEMENTS,
  MAX_BATCH_ELEMENTS,
} from '~/utils/constants';
import { middlewareScopeToScope, signerToString } from '~/utils/conversion';

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
export function serialize<UniqueIdentifiers extends object>(
  entityType: string,
  uniqueIdentifiers: UniqueIdentifiers
): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * @hidden
 * Convert a uuid string to an Identifier object
 */
export function unserialize<UniqueIdentifiers extends object>(id: string): UniqueIdentifiers {
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
 * Extract the DID from an Identity, or return the Current DID if no Identity is passed
 */
export async function getDid(
  value: string | Identity | undefined,
  context: Context
): Promise<string> {
  let did;
  if (value) {
    did = signerToString(value);
  } else {
    ({ did } = await context.getCurrentIdentity());
  }

  return did;
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
  }

  return { type, scope };
}

/**
 * @hidden
 *
 * Unwrap a Post Transaction Value
 */
export function unwrapValue<T extends unknown>(value: MaybePostTransactionValue<T>): T {
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

// TODO @monitz87: use event enum instead of string when it exists
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
      code: ErrorCode.FatalError,
      message: `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`,
    });
  }

  return eventRecords.map(
    eventRecord =>
      (eventRecord.event as unknown) as IEvent<EventData<Events[ModuleName][EventName]>>
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
  return new RegExp('^[\\\x00-\\\x7F]*$').test(value);
}

/**
 * @hidden
 *
 * Makes an entries request to the chain. If pagination options are supplied,
 * the request will be paginated. Otherwise, all entries will be requested at once
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

  if (paginationOpts) {
    const { size: pageSize, start: startKey } = paginationOpts;
    entries = await query.entriesPaged({
      arg,
      pageSize,
      startKey,
    });

    if (entries.length === pageSize) {
      lastKey = entries[entries.length - 1][0].toHex();
    }
  } else {
    entries = await query.entries(arg);
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
 * the request will be made at that block. Otherwise, the most recent block will be queried
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
 * Separates an array into smaller batches
 *
 * @param args - elements to separate
 * @param tag - transaction for which the elements are arguments. This serves to determine the size of the batches. A null value
 *   means that the minimum batch size will be used
 * @param groupByFn - optional function that takes an element and returns a value by which to group the elements.
 *   If supplied, all elements of the same group will be contained in the same batch
 */
export function batchArguments<Args>(
  args: Args[],
  tag: TxTag | null,
  groupByFn?: (obj: Args) => string
): Args[][] {
  const batchLimit = (tag && MAX_BATCH_ELEMENTS[tag]) ?? DEFAULT_MAX_BATCH_ELEMENTS;

  if (!groupByFn) {
    return chunk(args, batchLimit);
  }

  const groups = map(groupBy(args, groupByFn), group => group).sort(
    ({ length: first }, { length: second }) => first - second
  );

  const batches: Args[][] = [];

  groups.forEach(group => {
    if (group.length > batchLimit) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Batch size exceeds limit',
        data: {
          batch: group,
          limit: batchLimit,
        },
      });
    }
    let batchIndex = batches.findIndex(batch => batch.length + group.length <= batchLimit);

    if (batchIndex === -1) {
      batchIndex = batches.length;
      batches[batchIndex] = [];
    }

    batches[batchIndex] = [...batches[batchIndex], ...group];
  });

  return batches;
}

/**
 * @hidden
 *
 * Calculates next page number for paginated GraphQL ResultSet.
 * Returns null if there is no next page.
 *
 * @param size - page size requested
 * @param start - start index requestd
 * @param totalCount - total amount of elements returned by query
 *
 * @hidden
 *
 */
export function calculateNextKey(totalCount: number, size?: number, start?: number): NextKey {
  const next = (start ?? 0) + (size ?? DEFAULT_GQL_PAGE_SIZE);
  return totalCount > next ? next : null;
}

/**
 * Create a method that prepares a procedure
 */
export function createProcedureMethod<
  MethodArgs,
  ProcedureArgs extends unknown,
  ProcedureReturnValue,
  Storage = {}
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedures<ProcedureArgs, ProcedureReturnValue, Storage>
        | Procedure<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
  },
  context: Context
): ProcedureMethod<MethodArgs, ProcedureReturnValue, ProcedureReturnValue>;
export function createProcedureMethod<
  MethodArgs,
  ProcedureArgs extends unknown,
  ProcedureReturnValue,
  ReturnValue,
  Storage = {}
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedures<ProcedureArgs, ProcedureReturnValue, Storage>
        | Procedure<ProcedureArgs, ProcedureReturnValue, Storage>
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
  ProcedureArgs extends unknown,
  ProcedureReturnValue,
  ReturnValue = ProcedureReturnValue,
  Storage = {}
>(
  args: {
    getProcedureAndArgs: (
      methodArgs: MethodArgs
    ) => [
      (
        | UnionOfProcedures<ProcedureArgs, ProcedureReturnValue, Storage>
        | Procedure<ProcedureArgs, ProcedureReturnValue, Storage>
      ),
      ProcedureArgs
    ];
    transformer?: (value: ProcedureReturnValue) => ReturnValue | Promise<ReturnValue>;
  },
  context: Context
): ProcedureMethod<MethodArgs, ProcedureReturnValue, ReturnValue> {
  const { getProcedureAndArgs, transformer } = args;

  const method = (
    methodArgs: MethodArgs
  ): Promise<TransactionQueue<ProcedureReturnValue, ReturnValue>> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);

    return (proc as Procedure<ProcedureArgs, ProcedureReturnValue, Storage>).prepare(
      { args: procArgs, transformer },
      context
    );
  };

  method.checkAuthorization = async (
    methodArgs: MethodArgs
  ): Promise<ProcedureAuthorizationStatus> => {
    const [proc, procArgs] = getProcedureAndArgs(methodArgs);

    return proc.checkAuthorization(procArgs, context);
  };

  return method;
}

/**
 * @hidden
 */
export function assertIsInteger(value: number | BigNumber): void {
  const rawValue = new BigNumber(value);
  if (!rawValue.isInteger()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number must be an integer',
    });
  }
}

/**
 * @hidden
 */
export function assertIsPositive(value: number | BigNumber): void {
  const rawValue = new BigNumber(value);
  if (rawValue.isNegative()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number must be positive',
    });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @hidden
 */
function isUiKeyring(keyring: any): keyring is UiKeyring {
  return !!keyring.keyring;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * @hidden
 */
export function getCommonKeyring(keyring: CommonKeyring | UiKeyring): CommonKeyring {
  return isUiKeyring(keyring) ? keyring.keyring : keyring;
}

/**
 * @hidden
 */
export function assertFormatValid(address: string, ss58Format: number): void {
  const encodedAddress = encodeAddress(decodeAddress(address), ss58Format);

  if (address !== encodedAddress) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
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
export function getTicker(token: string | SecurityToken): string {
  return typeof token === 'string' ? token : token.ticker;
}

/**
 * @hidden
 */
function secondsInUnit(unit: CalendarUnit): number {
  const SECOND = 1;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

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
 * Transform a conversion util into a version that returns null if the input is falsy
 */
export function optionize<InputType, OutputType>(
  converter: (input: InputType, context: Context) => OutputType
): (val: InputType | null | undefined, context: Context) => OutputType | null {
  return (value: InputType | null | undefined, context: Context): OutputType | null => {
    value = value ?? null;
    return value && converter(value, context);
  };
}

/**
 * @hidden
 * Transform a conversion util into a version that returns null if the input is falsy
 */
export function periodComplexity(period: CalendarPeriod): number {
  const secsInYear = secondsInUnit(CalendarUnit.Year);
  const { amount, unit } = period;

  if (amount === 0) {
    return 1;
  }

  const secsInUnit = secondsInUnit(unit);

  return Math.max(2, Math.floor(secsInYear / (secsInUnit * amount)));
}
