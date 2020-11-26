import BigNumber from 'bignumber.js';

import { Context } from '~/base';
import { Middleware } from '~/Middleware';
import { eventByIndexedArgs, eventsByIndexedArgs, transactionByHash } from '~/middleware/queries';
import { CallIdEnum, EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('Middleware Class', () => {
  let context: Mocked<Context>;
  let middleware: Middleware;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    middleware = new Middleware(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  describe('method: getEventByIndexedArgs', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
    };

    test('should return a single event', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createApolloQueryStub(
        eventByIndexedArgs({
          ...variables,
          eventArg0: undefined,
          eventArg1: undefined,
          eventArg2: undefined,
        }),
        {
          /* eslint-disable @typescript-eslint/camelcase */
          eventByIndexedArgs: {
            block_id: blockNumber.toNumber(),
            block: { datetime: blockDate },
            event_idx: eventIdx,
          },
          /* eslint-enable @typescript-eslint/camelcase */
        }
      );

      const result = await middleware.getEventByIndexedArgs(variables);
      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        eventByIndexedArgs({
          ...variables,
          eventArg0: 'someDid',
          eventArg1: undefined,
          eventArg2: undefined,
        }),
        {}
      );
      const result = await middleware.getEventByIndexedArgs({ ...variables, eventArg0: 'someDid' });
      expect(result).toBeNull();
    });
  });

  describe('method: getEventsByIndexedArgs', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
    };

    test('should return a list of events', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const fakeResult = [{ blockNumber, blockDate, eventIndex: eventIdx }];

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createApolloQueryStub(
        eventsByIndexedArgs({
          ...variables,
          eventArg0: undefined,
          eventArg1: undefined,
          eventArg2: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          /* eslint-disable @typescript-eslint/camelcase */
          eventsByIndexedArgs: [
            {
              block_id: blockNumber.toNumber(),
              block: { datetime: blockDate },
              event_idx: eventIdx,
            },
          ],
          /* eslint-enable @typescript-eslint/camelcase */
        }
      );

      const result = await middleware.getEventsByIndexedArgs(variables);
      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        eventsByIndexedArgs({
          ...variables,
          eventArg0: 'someDid',
          eventArg1: undefined,
          eventArg2: undefined,
          count: undefined,
          skip: undefined,
        }),
        {}
      );
      const result = await middleware.getEventsByIndexedArgs({
        ...variables,
        eventArg0: 'someDid',
      });
      expect(result).toBeNull();
    });
  });

  describe('method: getTransactionByHash', () => {
    const variable = { txHash: 'someHash' };

    test('should return a transaction', async () => {
      const blockNumber = new BigNumber(1);
      const extrinsicIdx = 2;
      const address = 'someAddress';
      const specVersionId = 2006;

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });

      dsMockUtils.createApolloQueryStub(transactionByHash({ transactionHash: variable.txHash }), {
        /* eslint-disable @typescript-eslint/camelcase */
        transactionByHash: {
          module_id: ModuleIdEnum.Asset,
          call_id: CallIdEnum.RegisterTicker,
          extrinsic_idx: extrinsicIdx,
          spec_version_id: specVersionId,
          params: [],
          block_id: blockNumber.toNumber(),
          address,
          success: 0,
        },
        /* eslint-enable @typescript-eslint/camelcase */
      });

      let result = await middleware.getTransactionByHash(variable);
      expect(result).toEqual({
        blockNumber,
        extrinsicIdx: extrinsicIdx,
        address,
        nonce: undefined,
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
      });

      dsMockUtils.createApolloQueryStub(transactionByHash({ transactionHash: variable.txHash }), {
        /* eslint-disable @typescript-eslint/camelcase */
        transactionByHash: {
          module_id: ModuleIdEnum.Asset,
          call_id: CallIdEnum.RegisterTicker,
          extrinsic_idx: extrinsicIdx,
          spec_version_id: specVersionId,
          params: [],
          block_id: blockNumber.toNumber(),
          address: null,
          success: 0,
        },
        /* eslint-enable @typescript-eslint/camelcase */
      });

      result = await middleware.getTransactionByHash(variable);
      expect(result).toEqual({
        blockNumber,
        extrinsicIdx: extrinsicIdx,
        address: null,
        nonce: undefined,
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
      });
    });

    test('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        transactionByHash({
          transactionHash: variable.txHash,
        }),
        {}
      );
      const result = await middleware.getTransactionByHash(variable);
      expect(result).toBeNull();
    });
  });
});
