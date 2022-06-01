import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Network } from '~/api/client/Network';
import { Context, TransactionQueue } from '~/internal';
import {
  eventByIndexedArgs,
  eventsByIndexedArgs,
  heartbeat,
  transactionByHash,
} from '~/middleware/queries';
import { CallIdEnum, EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AccountBalance, TxTags } from '~/types';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Network Class', () => {
  let context: Mocked<Context>;
  let network: Network;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    network = new Network(context);
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getLatestBlock', () => {
    it('should return the latest block number', async () => {
      const blockNumber = new BigNumber(100);

      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, latestBlock: blockNumber },
      });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const result = await network.getLatestBlock();

      expect(result).toEqual(blockNumber);
    });
  });

  describe('method: getVersion', () => {
    it('should return the network version', async () => {
      const networkVersion = '1.0.0';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true, networkVersion } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const result = await network.getVersion();

      expect(result).toEqual(networkVersion);
    });
  });

  describe('method: getSs58Format', () => {
    it("should return the chain's SS58 format", () => {
      const ss58Format = new BigNumber(42);

      dsMockUtils.configureMocks({ contextOptions: { ss58Format } });

      const result = network.getSs58Format();

      expect(result).toEqual(ss58Format);
    });
  });

  describe('method: getNetworkProperties', () => {
    it('should return current network information', async () => {
      const name = 'someName';
      const version = new BigNumber(1);
      const fakeResult = {
        name,
        version,
      };

      dsMockUtils.setRuntimeVersion({ specVersion: dsMockUtils.createMockU32(version) });
      dsMockUtils.createRpcStub('system', 'chain').resolves(dsMockUtils.createMockText(name));

      const result = await network.getNetworkProperties();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getProtocolFees', () => {
    it('should return the fees associated to the supplied transaction', async () => {
      dsMockUtils.configureMocks({ contextOptions: { transactionFee: new BigNumber(500) } });

      const fee = await network.getProtocolFees({ tag: TxTags.asset.CreateAsset });

      expect(fee).toEqual(new BigNumber(500));
    });
  });

  describe('method: getTreasuryAccount', () => {
    it('should return the treasury Account', async () => {
      const treasuryAddress = '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR';

      expect(network.getTreasuryAccount().address).toEqual(treasuryAddress);
    });
  });

  describe('method: getTreasuryBalance', () => {
    let fakeBalance: AccountBalance;

    beforeAll(() => {
      fakeBalance = {
        free: new BigNumber(500000),
        locked: new BigNumber(0),
        total: new BigNumber(500000),
      };
      entityMockUtils.configureMocks({ accountOptions: { getBalance: fakeBalance } });
    });

    it('should return the POLYX balance of the treasury Account', async () => {
      const result = await network.getTreasuryBalance();
      expect(result).toEqual(fakeBalance.free);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';

      entityMockUtils.configureMocks({
        accountOptions: {
          getBalance: sinon.stub().callsFake(async cbFunc => {
            cbFunc(fakeBalance);
            return unsubCallback;
          }),
        },
      });

      const callback = sinon.stub();
      const result = await network.getTreasuryBalance(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeBalance.free);
    });
  });

  describe('method: transferPolyx', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        to: 'someAccount',
        amount: new BigNumber(50),
      };

      const expectedQueue = '' as unknown as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await network.transferPolyx(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getEventByIndexedArgs', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
    };

    it('should return a single event', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      dsMockUtils.createApolloQueryStub(
        eventByIndexedArgs({
          ...variables,
          eventArg0: undefined,
          eventArg1: undefined,
          eventArg2: undefined,
        }),
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          eventByIndexedArgs: {
            block_id: blockNumber.toNumber(),
            block: { datetime: blockDate },
            event_idx: eventIdx,
          },
          /* eslint-enable @typescript-eslint/naming-convention */
        }
      );

      const result = await network.getEventByIndexedArgs(variables);
      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        eventByIndexedArgs({
          ...variables,
          eventArg0: 'someDid',
          eventArg1: undefined,
          eventArg2: undefined,
        }),
        {}
      );
      const result = await network.getEventByIndexedArgs({ ...variables, eventArg0: 'someDid' });
      expect(result).toBeNull();
    });
  });

  describe('method: getEventsByIndexedArgs', () => {
    const variables = {
      moduleId: ModuleIdEnum.Asset,
      eventId: EventIdEnum.AssetCreated,
    };

    it('should return a list of events', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const fakeResult = [{ blockNumber, blockDate, eventIndex: eventIdx }];

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryStub(
        eventsByIndexedArgs({
          ...variables,
          eventArg0: undefined,
          eventArg1: undefined,
          eventArg2: undefined,
          count: 1,
          skip: 0,
        }),
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          eventsByIndexedArgs: [
            {
              block_id: blockNumber.toNumber(),
              block: { datetime: blockDate },
              event_idx: eventIdx.toNumber(),
            },
          ],
          /* eslint-enable @typescript-eslint/naming-convention */
        }
      );

      const result = await network.getEventsByIndexedArgs({
        ...variables,
        start: new BigNumber(0),
        size: new BigNumber(1),
      });
      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
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
      const result = await network.getEventsByIndexedArgs({
        ...variables,
        eventArg0: 'someDid',
      });
      expect(result).toBeNull();
    });
  });

  describe('method: getTransactionByHash', () => {
    const variable = { txHash: 'someHash' };

    it('should return a transaction', async () => {
      const blockNumber = new BigNumber(1);
      const blockHash = 'someHash';
      const extrinsicIdx = new BigNumber(2);
      const address = 'someAddress';
      const specVersionId = new BigNumber(2006);

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloQueryStub(transactionByHash({ transactionHash: variable.txHash }), {
        /* eslint-disable @typescript-eslint/naming-convention */
        transactionByHash: {
          module_id: ModuleIdEnum.Asset,
          call_id: CallIdEnum.RegisterTicker,
          extrinsic_idx: extrinsicIdx.toNumber(),
          spec_version_id: specVersionId.toNumber(),
          params: [],
          block_id: blockNumber.toNumber(),
          address,
          success: 0,
          block: {
            hash: blockHash,
          },
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      let result = await network.getTransactionByHash(variable);
      expect(result).toEqual({
        blockNumber,
        blockHash,
        extrinsicIdx: extrinsicIdx,
        address,
        nonce: null,
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
      });

      dsMockUtils.createApolloQueryStub(transactionByHash({ transactionHash: variable.txHash }), {
        /* eslint-disable @typescript-eslint/naming-convention */
        transactionByHash: {
          module_id: ModuleIdEnum.Asset,
          call_id: CallIdEnum.RegisterTicker,
          extrinsic_idx: extrinsicIdx,
          spec_version_id: specVersionId,
          params: [],
          nonce: 12345,
          block_id: blockNumber.toNumber(),
          address: null,
          success: 0,
          block: {
            hash: blockHash,
          },
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      result = await network.getTransactionByHash(variable);
      expect(result).toEqual({
        blockNumber,
        blockHash,
        extrinsicIdx: extrinsicIdx,
        address: null,
        nonce: new BigNumber(12345),
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
      });
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloQueryStub(
        transactionByHash({
          transactionHash: variable.txHash,
        }),
        {}
      );
      const result = await network.getTransactionByHash(variable);
      expect(result).toBeNull();
    });
  });
});
