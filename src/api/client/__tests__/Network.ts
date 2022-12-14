import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Network } from '~/api/client/Network';
import { Context, PolymeshTransaction } from '~/internal';
import {
  CallIdEnum as MiddlewareV2CallId,
  EventIdEnum as MiddlewareV2EventId,
  ModuleIdEnum as MiddlewareV2ModuleId,
} from '~/middleware/enumsV2';
import {
  eventByIndexedArgs,
  eventsByIndexedArgs,
  heartbeat,
  transactionByHash,
} from '~/middleware/queries';
import { eventsByArgs, extrinsicByHash } from '~/middleware/queriesV2';
import { CallIdEnum, EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AccountBalance, EventIdentifier, ExtrinsicDataWithFees, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
  let stringToBlockHashSpy: jest.SpyInstance;
  let balanceToBigNumberSpy: jest.SpyInstance;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    network = new Network(context);
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToBlockHashSpy = jest.spyOn(utilsConversionModule, 'stringToBlockHash');
    balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');
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
      dsMockUtils.createApolloQueryMock(heartbeat(), true);

      const result = await network.getLatestBlock();

      expect(result).toEqual(blockNumber);
    });
  });

  describe('method: getVersion', () => {
    it('should return the network version', async () => {
      const networkVersion = '1.0.0';

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true, networkVersion } });
      dsMockUtils.createApolloQueryMock(heartbeat(), true);

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
      dsMockUtils
        .createRpcMock('system', 'chain')
        .mockResolvedValue(dsMockUtils.createMockText(name));

      const result = await network.getNetworkProperties();
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getProtocolFees', () => {
    it('should return the fees associated to the supplied transaction', async () => {
      const mockResult = [
        {
          tag: TxTags.asset.CreateAsset,
          fees: new BigNumber(500),
        },
      ];
      dsMockUtils.configureMocks({
        contextOptions: {
          transactionFees: mockResult,
        },
      });
      const result = await network.getProtocolFees({ tags: [TxTags.asset.CreateAsset] });

      expect(result).toEqual(mockResult);
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
          getBalance: jest.fn().mockImplementation(async cbFunc => {
            cbFunc(fakeBalance);
            return unsubCallback;
          }),
        },
      });

      const callback = jest.fn();
      const result = await network.getTreasuryBalance(callback);
      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(fakeBalance.free);
    });
  });

  describe('method: transferPolyx', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        to: 'someAccount',
        amount: new BigNumber(50),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await network.transferPolyx(args);

      expect(tx).toBe(expectedTransaction);
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

      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, middlewareV2Enabled: false },
      });
      dsMockUtils.createApolloQueryMock(
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
      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, middlewareV2Enabled: false },
      });
      dsMockUtils.createApolloQueryMock(
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

    it('should call v2 query if middlewareV2 is enabled', async () => {
      const fakeResult = 'fakeResult' as unknown as EventIdentifier;
      jest.spyOn(network, 'getEventByIndexedArgsV2').mockResolvedValue(fakeResult);

      const result = await network.getEventByIndexedArgs(variables);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getEventByIndexedArgsV2', () => {
    const variables = {
      moduleId: MiddlewareV2ModuleId.Asset,
      eventId: MiddlewareV2EventId.AssetCreated,
    };

    it('should return a single event', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'blockHash';
      const fakeResult = { blockNumber, blockDate, blockHash, eventIndex: eventIdx };

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });
      dsMockUtils.createApolloV2QueryMock(
        eventsByArgs(
          {
            ...variables,
            eventArg0: undefined,
            eventArg1: undefined,
            eventArg2: undefined,
          },
          new BigNumber(1)
        ),
        {
          events: {
            nodes: [
              {
                block: {
                  blockId: blockNumber.toNumber(),
                  datetime: blockDate,
                  hash: blockHash,
                },
                eventIdx: eventIdx.toNumber(),
              },
            ],
          },
        }
      );

      const result = await network.getEventByIndexedArgsV2(variables);
      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloV2QueryMock(
        eventsByArgs(
          {
            ...variables,
            eventArg0: 'someDid',
            eventArg1: undefined,
            eventArg2: undefined,
          },
          new BigNumber(1)
        ),
        {
          events: {
            nodes: [],
          },
        }
      );
      const result = await network.getEventByIndexedArgsV2({ ...variables, eventArg0: 'someDid' });
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

      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, middlewareV2Enabled: false },
      });

      dsMockUtils.createApolloQueryMock(
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
      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, middlewareV2Enabled: false },
      });

      dsMockUtils.createApolloQueryMock(
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

    it('should call v2 query if middlewareV2 is enabled', async () => {
      const fakeResult = 'fakeResult' as unknown as EventIdentifier[];
      jest.spyOn(network, 'getEventsByIndexedArgsV2').mockResolvedValue(fakeResult);

      const result = await network.getEventsByIndexedArgs(variables);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getEventsByIndexedArgsV2', () => {
    const variables = {
      moduleId: MiddlewareV2ModuleId.Asset,
      eventId: MiddlewareV2EventId.AssetCreated,
    };

    it('should return a list of events', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'blockHash';
      const start = new BigNumber(0);
      const size = new BigNumber(1);
      const fakeResult = [{ blockNumber, blockHash, blockDate, eventIndex: eventIdx }];

      dsMockUtils.configureMocks({ contextOptions: { withSigningManager: true } });

      dsMockUtils.createApolloV2QueryMock(
        eventsByArgs(
          {
            ...variables,
            eventArg0: undefined,
            eventArg1: undefined,
            eventArg2: undefined,
          },
          size,
          start
        ),
        {
          events: {
            nodes: [
              {
                block: {
                  blockId: blockNumber.toNumber(),
                  datetime: blockDate,
                  hash: blockHash,
                },
                eventIdx: eventIdx.toNumber(),
              },
            ],
          },
        }
      );

      const result = await network.getEventsByIndexedArgsV2({
        ...variables,
        start,
        size,
      });
      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloV2QueryMock(
        eventsByArgs({
          ...variables,
          eventArg0: 'someDid',
          eventArg1: undefined,
          eventArg2: undefined,
        }),
        {
          events: { nodes: [] },
        }
      );
      const result = await network.getEventsByIndexedArgsV2({
        ...variables,
        eventArg0: 'someDid',
      });
      expect(result).toBeNull();
    });
  });

  describe('method: getTransactionByHash', () => {
    const variable = { txHash: 'someHash' };
    let getBlockMock: jest.Mock;
    let queryInfoMock: jest.Mock;

    beforeEach(() => {
      getBlockMock = dsMockUtils.createRpcMock('chain', 'getBlock');
      queryInfoMock = dsMockUtils.createRpcMock('payment', 'queryInfo');
    });

    it('should return a transaction', async () => {
      const blockNumber = new BigNumber(1);
      const blockHash = 'blockHash';
      const extrinsicIdx = new BigNumber(0);
      const address = 'someAddress';
      const specVersionId = new BigNumber(2006);
      const gasFees = new BigNumber(10);
      const protocolFees = new BigNumber(1000);

      dsMockUtils.configureMocks({
        contextOptions: {
          withSigningManager: true,
          middlewareV2Enabled: false,
          transactionFees: [
            {
              tag: TxTags.asset.RegisterTicker,
              fees: protocolFees,
            },
          ],
        },
      });

      dsMockUtils.createApolloQueryMock(transactionByHash({ transactionHash: variable.txHash }), {
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

      const rawBlockHash = dsMockUtils.createMockBlockHash(blockHash);

      when(stringToBlockHashSpy).calledWith(blockHash, context).mockReturnValue(rawBlockHash);

      when(getBlockMock)
        .calledWith(rawBlockHash)
        .mockResolvedValue(
          dsMockUtils.createMockSignedBlock({
            block: {
              header: undefined,
              extrinsics: [
                {
                  toHex: jest.fn().mockImplementation(() => 'hex'),
                },
              ],
            },
          })
        );

      const rawGasFees = dsMockUtils.createMockBalance(gasFees);

      when(balanceToBigNumberSpy).calledWith(rawGasFees).mockReturnValue(gasFees);

      when(queryInfoMock)
        .calledWith('hex', rawBlockHash)
        .mockResolvedValue(
          dsMockUtils.createMockRuntimeDispatchInfo({
            partialFee: rawGasFees,
          })
        );

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
        fee: {
          gas: gasFees,
          protocol: protocolFees,
          total: gasFees.plus(protocolFees),
        },
      });

      dsMockUtils.createApolloQueryMock(transactionByHash({ transactionHash: variable.txHash }), {
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
        fee: {
          gas: gasFees,
          protocol: protocolFees,
          total: gasFees.plus(protocolFees),
        },
      });
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.configureMocks({
        contextOptions: { withSigningManager: true, middlewareV2Enabled: false },
      });
      dsMockUtils.createApolloQueryMock(
        transactionByHash({
          transactionHash: variable.txHash,
        }),
        {}
      );
      const result = await network.getTransactionByHash(variable);
      expect(result).toBeNull();
    });

    it('should call v2 query if middlewareV2 is enabled', async () => {
      const fakeResult = 'fakeResult' as unknown as ExtrinsicDataWithFees;
      jest.spyOn(network, 'getTransactionByHashV2').mockResolvedValue(fakeResult);

      const result = await network.getTransactionByHash(variable);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: getTransactionByHashV2', () => {
    const variable = { txHash: 'someHash' };
    let getBlockMock: jest.Mock;
    let queryInfoMock: jest.Mock;

    beforeEach(() => {
      getBlockMock = dsMockUtils.createRpcMock('chain', 'getBlock');
      queryInfoMock = dsMockUtils.createRpcMock('payment', 'queryInfo');
    });

    it('should return a transaction', async () => {
      const blockNumber = new BigNumber(1);
      const blockHash = 'blockHash';
      const extrinsicIdx = new BigNumber(0);
      const address = 'someAddress';
      const specVersionId = new BigNumber(2006);
      const gasFees = new BigNumber(10);
      const protocolFees = new BigNumber(1000);

      dsMockUtils.configureMocks({
        contextOptions: {
          withSigningManager: true,
          transactionFees: [
            {
              tag: TxTags.asset.RegisterTicker,
              fees: protocolFees,
            },
          ],
        },
      });

      dsMockUtils.createApolloV2QueryMock(extrinsicByHash({ extrinsicHash: variable.txHash }), {
        extrinsics: {
          nodes: [
            {
              moduleId: MiddlewareV2ModuleId.Asset,
              callId: MiddlewareV2CallId.RegisterTicker,
              extrinsicIdx: extrinsicIdx.toNumber(),
              specVersionId: specVersionId.toNumber(),
              paramsTxt: '[]',
              address,
              success: 0,
              block: {
                blockId: blockNumber.toNumber(),
                hash: blockHash,
              },
            },
          ],
        },
      });

      const rawBlockHash = dsMockUtils.createMockBlockHash(blockHash);

      when(stringToBlockHashSpy).calledWith(blockHash, context).mockReturnValue(rawBlockHash);

      when(getBlockMock)
        .calledWith(rawBlockHash)
        .mockResolvedValue(
          dsMockUtils.createMockSignedBlock({
            block: {
              header: undefined,
              extrinsics: [
                {
                  toHex: jest.fn().mockImplementation(() => 'hex'),
                },
              ],
            },
          })
        );

      const rawGasFees = dsMockUtils.createMockBalance(gasFees);

      when(balanceToBigNumberSpy).calledWith(rawGasFees).mockReturnValue(gasFees);

      when(queryInfoMock)
        .calledWith('hex', rawBlockHash)
        .mockResolvedValue(
          dsMockUtils.createMockRuntimeDispatchInfo({
            partialFee: rawGasFees,
          })
        );

      let result = await network.getTransactionByHashV2(variable);
      expect(result).toEqual({
        blockNumber,
        blockHash,
        extrinsicIdx,
        address,
        nonce: null,
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
        fee: {
          gas: gasFees,
          protocol: protocolFees,
          total: gasFees.plus(protocolFees),
        },
      });

      dsMockUtils.createApolloV2QueryMock(extrinsicByHash({ extrinsicHash: variable.txHash }), {
        extrinsics: {
          nodes: [
            {
              moduleId: MiddlewareV2ModuleId.Asset,
              callId: MiddlewareV2CallId.RegisterTicker,
              extrinsicIdx: extrinsicIdx,
              specVersionId: specVersionId,
              paramsTxt: '[]',
              nonce: 12345,
              address: null,
              success: 0,
              block: {
                blockId: blockNumber.toNumber(),
                hash: blockHash,
              },
            },
          ],
        },
      });

      result = await network.getTransactionByHashV2(variable);
      expect(result).toEqual({
        blockNumber,
        blockHash,
        extrinsicIdx,
        address: null,
        nonce: new BigNumber(12345),
        txTag: 'asset.registerTicker',
        params: [],
        success: false,
        specVersionId,
        extrinsicHash: undefined,
        fee: {
          gas: gasFees,
          protocol: protocolFees,
          total: gasFees.plus(protocolFees),
        },
      });
    });

    it('should return null if the query result is empty', async () => {
      dsMockUtils.createApolloV2QueryMock(
        extrinsicByHash({
          extrinsicHash: variable.txHash,
        }),
        { extrinsics: { nodes: [] } }
      );
      const result = await network.getTransactionByHashV2(variable);
      expect(result).toBeNull();
    });
  });
});
