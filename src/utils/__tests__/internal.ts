import { ISubmittableResult } from '@polkadot/types/types';
import { range } from 'lodash';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, PostTransactionValue } from '~/internal';
import { ClaimScopeTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ClaimType, CountryCode } from '~/types';
import { tuple } from '~/types/utils';
import { MAX_BATCH_ELEMENTS } from '~/utils/constants';

import {
  batchArguments,
  calculateNextKey,
  createClaim,
  delay,
  findEventRecord,
  getDid,
  padString,
  removePadding,
  requestAtBlock,
  requestPaginated,
  serialize,
  stringIsClean,
  unserialize,
  unwrapValue,
  unwrapValues,
} from '../internal';

describe('delay', () => {
  jest.useFakeTimers();

  test('should resolve after the supplied timeout', () => {
    const delayPromise = delay(5000);

    jest.advanceTimersByTime(5000);

    return expect(delayPromise).resolves.toBeUndefined();
  });
});

describe('serialize and unserialize', () => {
  const entityType = 'someEntity';

  const pojo1 = {
    foo: 'Foo',
    bar: 'Bar',
  };

  const inversePojo1 = {
    bar: 'Bar',
    foo: 'Foo',
  };

  const pojo2 = {
    baz: 'baz',
  };

  test('serialize returns the same unique id for the same pojo', () => {
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, pojo1));
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, inversePojo1));
  });

  test('serialize returns a different unique id for different pojos', () => {
    expect(serialize(entityType, pojo1)).not.toBe(serialize(entityType, pojo2));
  });

  test('unserialize recovers the serialized object', () => {
    expect(unserialize(serialize(entityType, pojo1))).toEqual(pojo1);
    expect(unserialize(serialize(entityType, inversePojo1))).toEqual(pojo1);
  });

  const errorMsg = 'Wrong ID format';

  test('unserialize throws an error if the argument has an incorrect format', () => {
    expect(() => unserialize('unformatted')).toThrowError(errorMsg);
  });

  test('unserialize throws an error if the serialized string is not valid JSON', () => {
    const fakeSerialized = Buffer.from('someEntity:nonJsonString').toString('base64');
    expect(() => unserialize(fakeSerialized)).toThrowError(errorMsg);
  });
});

describe('getDid', () => {
  let context: Context;
  let did: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    did = 'aDid';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('getDid should extract the DID from an Identity', async () => {
    entityMockUtils.initMocks();
    const result = await getDid(entityMockUtils.getIdentityInstance({ did }), context);

    expect(result).toBe(did);
  });

  test('getDid should return the passed DID', async () => {
    const result = await getDid(did, context);

    expect(result).toBe(did);
  });

  test('getDid should return the current Identity DID if nothing is passed', async () => {
    const result = await getDid(undefined, context);

    expect(result).toBe((await context.getCurrentIdentity()).did);
  });
});

describe('unwrapValue', () => {
  test('should unwrap a Post Transactin Value', async () => {
    const wrapped = new PostTransactionValue(async () => 1);
    await wrapped.run({} as ISubmittableResult);

    const unwrapped = unwrapValue(wrapped);

    expect(unwrapped).toEqual(1);
  });

  test('should return a non Post Transaction Value as is', () => {
    expect(unwrapValue(1)).toBe(1);
  });
});

describe('unwrapValues', () => {
  test('should unwrap all Post Transaction Values in the array', async () => {
    const values = [1, 2, 3, 4, 5];
    const wrapped = values.map(value => new PostTransactionValue(async () => value));
    await Promise.all(wrapped.map(postValue => postValue.run({} as ISubmittableResult)));

    const unwrapped = unwrapValues(wrapped);

    expect(unwrapped).toEqual(values);
  });
});

describe('findEventRecord', () => {
  const findRecordStub = sinon.stub();
  const mockReceipt = ({
    findRecord: findRecordStub,
  } as unknown) as ISubmittableResult;

  afterEach(() => {
    findRecordStub.reset();
  });

  test('returns the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    findRecordStub.withArgs(mod, eventName).returns(fakeResult);

    const eventRecord = findEventRecord(mockReceipt, mod, eventName);

    expect(eventRecord).toBe(fakeResult);
  });

  test("throws if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    findRecordStub.withArgs(mod, eventName).returns(undefined);

    expect(() => findEventRecord(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`
    );
  });
});

describe('createClaim', () => {
  test('createClaim should create Claim objects from claims data provided by middleware', () => {
    let type = 'Jurisdiction';
    const jurisdiction = 'CL';
    let scope = { type: ClaimScopeTypeEnum.Identity, value: 'someScope' };

    let result = createClaim(type, jurisdiction, scope, null, undefined);
    expect(result).toEqual({
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope,
    });

    type = 'BuyLockup';
    scope = { type: ClaimScopeTypeEnum.Identity, value: 'someScope' };

    result = createClaim(type, null, scope, null, undefined);
    expect(result).toEqual({
      type: ClaimType.BuyLockup,
      scope,
    });

    type = 'NoData';

    result = createClaim(type, null, null, null, undefined);
    expect(result).toEqual({
      type: ClaimType.NoData,
    });

    type = 'CustomerDueDiligence';
    const id = 'someId';

    result = createClaim(type, null, null, id, undefined);
    expect(result).toEqual({
      type: ClaimType.CustomerDueDiligence,
      id,
    });

    type = 'InvestorUniqueness';
    scope = { type: ClaimScopeTypeEnum.Ticker, value: 'someTicker' };

    result = createClaim(type, null, scope, id, undefined);
    expect(result).toEqual({
      type: ClaimType.InvestorUniqueness,
      scope: scope,
      cddId: id,
    });
  });
});

describe('padString', () => {
  test('should pad a string on the right side to cover the supplied length', () => {
    const value = 'someString';
    const fakeResult = `${value}\0\0`;

    const result = padString(value, 12);

    expect(result).toBe(fakeResult);
  });
});

describe('removePadding', () => {
  test('should remove all null character padding from the input', () => {
    const expected = 'someString';

    const result = removePadding(`${expected}\0\0\0`);

    expect(result).toBe(expected);
  });
});

describe('requestPaginated', () => {
  test('should fetch and return entries and the hex value of the last key', async () => {
    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      entries: [
        tuple(['ticker0'], dsMockUtils.createMockU32(0)),
        tuple(['ticker1'], dsMockUtils.createMockU32(1)),
        tuple(['ticker2'], dsMockUtils.createMockU32(2)),
      ],
    });

    let res = await requestPaginated(queryStub, {
      paginationOpts: undefined,
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entries);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 3 },
    });

    expect(typeof res.lastKey).toBe('string');
    sinon.assert.calledOnce(queryStub.entriesPaged);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 4 },
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entriesPaged);
  });
});

describe('requestAtBlock', () => {
  test('should fetch and return the value at a certain block (current if left empty)', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: true,
    });
    const returnValue = dsMockUtils.createMockU32(5);
    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      returnValue,
    });

    const blockHash = 'someBlockHash';
    const ticker = 'ticker';

    let res = await requestAtBlock(
      queryStub,
      {
        blockHash,
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub.at, blockHash, ticker);
    expect(res).toBe(returnValue);

    res = await requestAtBlock(
      queryStub,
      {
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub, ticker);
    expect(res).toBe(returnValue);
  });

  test('should throw an error if the node is not archive', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: false,
    });

    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      returnValue: dsMockUtils.createMockU32(5),
    });

    await expect(
      requestAtBlock(
        queryStub,
        {
          blockHash: 'someBlockHash',
          args: ['ticker'],
        },
        context
      )
    ).rejects.toThrow('Cannot query previous blocks in a non-archive node');
  });
});

describe('batchArguments', () => {
  test('should return chunks of data', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength + 1);

    const batches = batchArguments(elements, tag);

    expect(batches.length).toBe(4);
    expect(batches[0].length).toBe(expectedBatchLength);
    expect(batches[1].length).toBe(expectedBatchLength);
    expect(batches[2].length).toBe(expectedBatchLength);
    expect(batches[3].length).toBe(1);
  });

  test('should use a custom batching function to group elements', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 2 * expectedBatchLength);

    let batches = batchArguments(elements, tag, element => `${element % 2}`); // separate odd from even

    expect(batches.length).toBe(2);
    expect(batches[0]).toEqual(range(0, 2 * expectedBatchLength, 2));
    expect(batches[1]).toEqual(range(1, 2 * expectedBatchLength, 2));

    batches = batchArguments(elements, tag, element => `${element % 5}`); // separate in 5 groups

    expect(batches.length).toBe(3);
    expect(batches[0].length).toBeLessThan(expectedBatchLength);
    expect(batches[1].length).toBeLessThan(expectedBatchLength);
    expect(batches[2].length).toBeLessThan(expectedBatchLength);
  });

  test('should throw an error if a custom batch has a size bigger than the limit', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength);

    expect(() => batchArguments(elements, tag, element => `${element % 2}`)).toThrowError(
      'Batch size exceeds limit'
    );
  });
});

describe('calculateNextKey', () => {
  test('should return NextKey null as there are less elements than the default page size', () => {
    const totalCount = 20;
    const nextKey = calculateNextKey(totalCount);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey null as it is the last page', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 31;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 0;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toEqual(30);
  });

  describe('stringIsClean', () => {
    test('should return false if the string contains charcode 65533', () => {
      expect(stringIsClean(String.fromCharCode(65533))).toBe(false);
    });

    test("should return true if the string doesn't contain any forbidden characters", () => {
      expect(stringIsClean('Clean String')).toBe(true);
    });
  });
});
