import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { AssetPermissions } from '~/api/entities/Identity/AssetPermissions';
import {
  Context,
  Identity,
  KnownPermissionGroup,
  Namespace,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import {
  tickerExternalAgentActionsQuery,
  tickerExternalAgentsQuery,
} from '~/middleware/queries/externalAgents';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, FungibleAsset, PermissionGroupType, PermissionType, TxTags } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('AssetPermissions class', () => {
  const did = 'someDid';
  const assetId = '12341234-1234-8234-8234-123412341234';
  const assetIdHex = '0x12341234123482348234123412341234';
  let asset: Mocked<FungibleAsset>;

  let context: Mocked<Context>;
  let assetPermissions: AssetPermissions;
  let identity: Identity;
  let getAssetIdForMiddlewareSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identity = entityMockUtils.getIdentityInstance({ did });
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    assetPermissions = new AssetPermissions(identity, context);
    getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
    when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetIdHex);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(AssetPermissions.prototype).toBeInstanceOf(Namespace);
  });

  describe('method: getGroup', () => {
    it('should throw an error if the Identity is no longer an Agent', () => {
      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const expectedError = new PolymeshError({
        message: 'This Identity is no longer an Agent for this Asset',
        code: ErrorCode.DataUnavailable,
      });

      return expect(assetPermissions.getGroup({ asset })).rejects.toThrow(expectedError);
    });

    it('should return the permission group associated with the Agent', async () => {
      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full')),
      });

      const result = await assetPermissions.getGroup({ asset });

      expect(result instanceof KnownPermissionGroup).toEqual(true);
      expect((result as KnownPermissionGroup).type).toEqual(PermissionGroupType.Full);
    });
  });

  describe('method: enabledAt', () => {
    it('should return the event identifier object of the agent added', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const blockHash = 'someHash';
      const eventIdx = new BigNumber(1);
      const variables = {
        assetId: assetIdHex,
      };
      const fakeResult = { blockNumber, blockHash, blockDate, eventIndex: eventIdx };

      dsMockUtils.createApolloQueryMock(tickerExternalAgentsQuery(false, variables), {
        tickerExternalAgents: {
          nodes: [
            {
              createdBlock: {
                blockId: blockNumber.toNumber(),
                datetime: blockDate,
                hash: blockHash,
              },
              eventIdx: eventIdx.toNumber(),
            },
          ],
        },
      });

      const result = await assetPermissions.enabledAt({ asset });

      expect(result).toEqual(fakeResult);
    });

    it('should return null if the query result is empty', async () => {
      const variables = {
        assetId: assetIdHex,
      };

      dsMockUtils.createApolloQueryMock(tickerExternalAgentsQuery(false, variables), {
        tickerExternalAgents: { nodes: [] },
      });
      const result = await assetPermissions.enabledAt({ asset });
      expect(result).toBeNull();
    });
  });

  describe('method: setGroup', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const group = {
        transactions: {
          type: PermissionType.Include,
          values: [],
        },
        asset,
      };
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { identity, group }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assetPermissions.setGroup({ group });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: checkPermissions', () => {
    beforeAll(() => {
      entityMockUtils.initMocks();
    });

    afterEach(() => {
      entityMockUtils.reset();
    });

    it('should check whether the Identity has the appropriate permissions for the Asset', async () => {
      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(),
      });

      let result = await assetPermissions.checkPermissions({ asset, transactions: null });

      expect(result).toEqual({
        result: false,
        missingPermissions: null,
        message: 'The Identity is not an Agent for the Asset',
      });
      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full')),
      });

      result = await assetPermissions.checkPermissions({ asset, transactions: null });

      expect(result).toEqual({ result: true });

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('ExceptMeta')),
      });

      result = await assetPermissions.checkPermissions({ asset, transactions: null });

      expect(result).toEqual({ result: false, missingPermissions: null });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.externalAgents.RemoveAgent],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: [TxTags.externalAgents.RemoveAgent],
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.ControllerTransfer],
      });

      expect(result).toEqual({ result: true });

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAgentGroup('PolymeshV1PIA')
        ),
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: [TxTags.asset.CreateAsset],
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.ControllerTransfer, TxTags.sto.Invest],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: [TxTags.sto.Invest],
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.ControllerTransfer, TxTags.sto.FreezeFundraiser],
      });

      expect(result).toEqual({
        result: true,
      });

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAgentGroup('PolymeshV1CAA')
        ),
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: [TxTags.asset.CreateAsset],
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.corporateAction.ChangeRecordDate],
      });

      expect(result).toEqual({
        result: true,
      });

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAgentGroup({ Custom: dsMockUtils.createMockU32(new BigNumber(1)) })
        ),
      });
      dsMockUtils.createQueryMock('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions('Whole')
        ),
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.corporateAction.ChangeRecordDate],
      });

      expect(result).toEqual({
        result: true,
      });

      const mockExtrinsicNames = dsMockUtils.createMockExtrinsicName({
        Except: [dsMockUtils.createMockText('create_asset')],
      });

      const assetTextKey = dsMockUtils.createMockText('asset');
      const exceptPermissions = dsMockUtils.createMockPalletPermissions({
        extrinsics: mockExtrinsicNames,
      });

      const permMap = new Map();
      permMap.set(assetTextKey, exceptPermissions);

      dsMockUtils.createQueryMock('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions({
            These: dsMockUtils.createMockBTreeMap(permMap),
          })
        ),
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: null,
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: null,
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.asset.CreateAsset],
      });

      expect(result).toEqual({
        result: false,
        missingPermissions: [TxTags.asset.CreateAsset],
      });

      const exceptAllAssetPerms = new Map();

      const mockWholeExceptPerms = dsMockUtils.createMockPalletPermissions({
        extrinsics: 'Whole',
      });
      exceptAllAssetPerms.set(assetTextKey, mockWholeExceptPerms);

      dsMockUtils.createQueryMock('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions({
            Except: dsMockUtils.createMockBTreeMap(exceptAllAssetPerms),
          })
        ),
      });

      result = await assetPermissions.checkPermissions({
        asset,
        transactions: [TxTags.identity.AddClaim],
      });

      expect(result).toEqual({
        result: true,
      });
      /* eslint-enable @typescript-eslint/naming-convention */
    });

    it('should throw an error if the transaction array is empty', () => {
      return expect(assetPermissions.checkPermissions({ asset, transactions: [] })).rejects.toThrow(
        'Cannot check Permissions for an empty transaction array'
      );
    });
  });

  describe('method: waive', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        asset,
        identity,
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await assetPermissions.waive(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let rawDid: PolymeshPrimitivesIdentityId;
    let rawAssetId: PolymeshPrimitivesAssetAssetId;
    let stringToIdentityIdSpy: jest.SpyInstance;

    beforeAll(() => {
      stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
      rawDid = dsMockUtils.createMockIdentityId(did);
      rawAssetId = dsMockUtils.createMockAssetId(assetIdHex);
    });

    beforeEach(() => {
      when(stringToIdentityIdSpy).calledWith(did, context).mockReturnValue(rawDid);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of AgentWithGroup', async () => {
      const group = entityMockUtils.getKnownPermissionGroupInstance({
        assetId,
        type: PermissionGroupType.Full,
        getPermissions: {
          transactions: null,
          transactionGroups: [],
        },
      });

      entityMockUtils.configureMocks({
        fungibleAssetOptions: {
          assetId,
        },
      });

      jest.spyOn(assetPermissions, 'getGroup').mockResolvedValue(group);

      dsMockUtils.createQueryMock('externalAgents', 'agentOf', {
        entries: [tuple([rawDid, rawAssetId], {})],
      });

      const result = await assetPermissions.get();
      expect(result.length).toEqual(1);
      expect(result[0].asset.id).toEqual(assetId);
      expect(result[0].group instanceof KnownPermissionGroup).toEqual(true);
    });
  });

  describe('method: getOperationHistory', () => {
    it('should return the Events triggered by Operations the Identity has performed on a specific Asset', async () => {
      const blockId = new BigNumber(1);
      const blockHash = 'someHash';
      const eventIndex = new BigNumber(1);
      const datetime = '2020-10-10';

      dsMockUtils.createApolloQueryMock(
        tickerExternalAgentActionsQuery(
          false,
          {
            assetId: assetIdHex,
            callerId: did,
            palletName: undefined,
            eventId: undefined,
          },
          new BigNumber(1),
          new BigNumber(0)
        ),
        {
          tickerExternalAgentActions: {
            totalCount: 1,
            nodes: [
              {
                createdBlock: {
                  blockId: blockId.toNumber(),
                  datetime,
                  hash: blockHash,
                },
                eventIdx: eventIndex.toNumber(),
              },
            ],
          },
        }
      );

      let result = await assetPermissions.getOperationHistory({
        asset: assetId,
        start: new BigNumber(0),
        size: new BigNumber(1),
      });

      expect(result.next).toEqual(null);
      expect(result.count).toEqual(new BigNumber(1));
      expect(result.data).toEqual([
        {
          blockNumber: blockId,
          blockHash,
          blockDate: new Date(`${datetime}Z`),
          eventIndex,
        },
      ]);

      dsMockUtils.createApolloQueryMock(
        tickerExternalAgentActionsQuery(false, {
          assetId: assetIdHex,
          callerId: did,
          palletName: undefined,
          eventId: undefined,
        }),
        {
          tickerExternalAgentActions: {
            totalCount: 0,
            nodes: [],
          },
        }
      );

      result = await assetPermissions.getOperationHistory({
        asset: assetId,
      });

      expect(result.next).toEqual(null);
      expect(result.count).toEqual(new BigNumber(0));
      expect(result.data).toEqual([]);
    });
  });
});
