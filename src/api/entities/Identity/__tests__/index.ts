import { StorageKey, u64 } from '@polkadot/types';
import { AccountId, Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesIdentityDidRecord,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesSecondaryKeyKeyRecord,
  PolymeshPrimitivesSecondaryKeyPermissions,
} from '@polkadot/types/lookup';
import { bool } from '@polkadot/types/primitive';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Account,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  PolymeshError,
  PolymeshTransaction,
} from '~/internal';
import { assetHoldersQuery, nftHoldersQuery } from '~/middleware/queries/assets';
import { trustingAssetsQuery } from '~/middleware/queries/claims';
import { instructionPartiesQuery } from '~/middleware/queries/settlements';
import { instructionsByDidQuery } from '~/middleware/queries/settlementsOld';
import { AssetHoldersOrderBy, NftHoldersOrderBy } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import {
  DistributionWithDetails,
  ErrorCode,
  HistoricInstruction,
  IdentityRole,
  PermissionedAccount,
  Permissions,
  PortfolioCustodianRole,
  Role,
  RoleType,
  TickerOwnerRole,
  VenueOwnerRole,
  VenueType,
} from '~/types';
import { tuple } from '~/types/utils';
import { SETTLEMENTS_V2_SQ_VERSION } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftCollectionModule('~/api/entities/Asset/NonFungible')
);

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/Identity/ChildIdentity',
  require('~/testUtils/mocks/entities').mockChildIdentityModule(
    '~/api/entities/Identity/ChildIdentity'
  )
);
jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Identity class', () => {
  let context: MockContext;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let stringToAssetIdSpy: jest.SpyInstance;
  let u64ToBigNumberSpy: jest.SpyInstance<BigNumber, [u64]>;
  let getAccountSpy: jest.SpyInstance<Promise<Account>, [{ address: string }, Context]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    stringToAssetIdSpy = jest.spyOn(utilsConversionModule, 'stringToAssetId');
    u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance({
      middlewareEnabled: true,
    });
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

  it('should extend Entity', () => {
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign did to instance', () => {
      const did = 'abc';
      const identity = new Identity({ did }, context);

      expect(identity.did).toBe(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Identity.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Identity.isUniqueIdentifiers({})).toBe(false);
      expect(Identity.isUniqueIdentifiers({ did: 3 })).toBe(false);
    });
  });

  describe('method: checkRoles', () => {
    beforeAll(() => {
      entityMockUtils.initMocks();
    });

    afterEach(() => {
      entityMockUtils.reset();
    });

    it('should return whether the Identity possesses all roles', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const roles: TickerOwnerRole[] = [
        { type: RoleType.TickerOwner, ticker: 'SOME_TICKER' },
        { type: RoleType.TickerOwner, ticker: 'otherTicker' },
      ];
      const spy = jest.spyOn(identity, 'isEqual').mockReturnValue(true);

      let result = await identity.checkRoles(roles);

      expect(result).toEqual({
        result: true,
      });

      const mock = jest.fn();

      mock
        .mockResolvedValueOnce({
          owner: identity,
        })
        .mockResolvedValue({
          owner: null,
        });

      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: mock,
        },
      });

      result = await identity.checkRoles(roles);

      expect(result).toEqual({
        result: false,
        missingRoles: [{ type: RoleType.TickerOwner, ticker: 'otherTicker' }],
      });

      spy.mockRestore();
    });
  });

  describe('method: hasRole', () => {
    beforeAll(() => {
      entityMockUtils.initMocks();
    });

    afterEach(() => {
      entityMockUtils.reset();
    });

    it('should check whether the Identity has the Ticker Owner role', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const role: TickerOwnerRole = { type: RoleType.TickerOwner, ticker: 'SOME_TICKER' };
      const spy = jest.spyOn(identity, 'isEqual').mockReturnValue(true);

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';
      spy.mockReturnValue(false);

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
      spy.mockRestore();
    });

    it('should check whether the Identity has the CDD Provider role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: Role = { type: RoleType.CddProvider };
      const rawDid = dsMockUtils.createMockIdentityId(did);

      dsMockUtils
        .createQueryMock('cddServiceProviders', 'activeMembers')
        .mockResolvedValue([rawDid]);

      when(identityIdToStringSpy).calledWith(rawDid).mockReturnValue(did);

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    it('should check whether the Identity has the Venue Owner role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: VenueOwnerRole = { type: RoleType.VenueOwner, venueId: new BigNumber(10) };

      entityMockUtils.configureMocks({
        venueOptions: {
          details: {
            owner: new Identity({ did }, context),
            type: VenueType.Sto,
            description: 'aVenue',
          },
        },
      });

      const spy = jest.spyOn(identity, 'isEqual').mockReturnValue(true);
      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      spy.mockReturnValue(false);
      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
      spy.mockRestore();
    });

    it('should check whether the Identity has the Portfolio Custodian role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const portfolioId = {
        did,
        number: new BigNumber(1),
      };
      let role: PortfolioCustodianRole = { type: RoleType.PortfolioCustodian, portfolioId };

      entityMockUtils.configureMocks({
        numberedPortfolioOptions: { isCustodiedBy: true },
        defaultPortfolioOptions: { isCustodiedBy: false },
      });

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      role = { type: RoleType.PortfolioCustodian, portfolioId: { did } };

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    it('should check whether the Identity has the Identity role', async () => {
      const did = 'someDid';
      const identity = new Identity({ did }, context);
      const role: IdentityRole = { type: RoleType.Identity, did };

      let hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(true);

      identity.did = 'otherDid';

      hasRole = await identity.hasRole(role);

      expect(hasRole).toBe(false);
    });

    it('should throw an error if the role is not recognized', () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const type = 'Fake' as RoleType;
      const role = { type, ticker: 'SOME_TICKER' } as TickerOwnerRole;

      const hasRole = identity.hasRole(role);

      return expect(hasRole).rejects.toThrow(`Unrecognized role "${JSON.stringify(role)}"`);
    });
  });

  describe('method: getAssetBalance', () => {
    let assetId: string;
    let did: string;
    let rawAssetId: PolymeshPrimitivesAssetAssetID;
    let rawIdentityId: PolymeshPrimitivesIdentityId;
    let fakeValue: BigNumber;
    let fakeBalance: Balance;
    let mockContext: Context;
    let balanceOfMock: jest.Mock;
    let assetMock: jest.Mock;

    let identity: Identity;

    beforeAll(() => {
      assetId = '0x1234';
      did = 'someDid';
      rawAssetId = dsMockUtils.createMockAssetId(assetId);
      rawIdentityId = dsMockUtils.createMockIdentityId(did);
      fakeValue = new BigNumber(100);
      fakeBalance = dsMockUtils.createMockBalance(fakeValue);
      mockContext = dsMockUtils.getContextInstance();
      balanceOfMock = dsMockUtils.createQueryMock('asset', 'balanceOf');
      assetMock = dsMockUtils.createQueryMock('asset', 'securityTokens');

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);

      identity = new Identity({ did }, mockContext);

      when(jest.spyOn(utilsConversionModule, 'assetToMeshAssetId'))
        .calledWith(expect.objectContaining({ id: assetId }), mockContext)
        .mockReturnValue(rawAssetId);

      when(jest.spyOn(utilsConversionModule, 'balanceToBigNumber'))
        .calledWith(fakeBalance)
        .mockReturnValue(fakeValue);
    });

    beforeEach(() => {
      when(assetMock)
        .calledWith(rawAssetId)
        .mockResolvedValue(
          dsMockUtils.createMockSecurityToken({
            ownerDid: dsMockUtils.createMockIdentityId('tokenOwner'),
            totalSupply: dsMockUtils.createMockBalance(new BigNumber(3000)),
            divisible: dsMockUtils.createMockBool(true),
            assetType: dsMockUtils.createMockAssetType('EquityCommon'),
          })
        );
      jest
        .spyOn(utilsInternalModule, 'asAsset')
        .mockResolvedValue(entityMockUtils.getFungibleAssetInstance({ assetId }));
    });

    it('should return the balance of a given Asset', async () => {
      when(balanceOfMock).calledWith(rawAssetId, rawIdentityId).mockResolvedValue(fakeBalance);

      const result = await identity.getAssetBalance({ assetId });

      expect(result).toEqual(fakeValue);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = jest.fn();

      when(balanceOfMock)
        .calledWith(rawAssetId, rawIdentityId, expect.any(Function))
        .mockImplementation(async (_a, _b, cbFunc) => {
          cbFunc(fakeBalance);
          return unsubCallback;
        });

      const result = await identity.getAssetBalance({ assetId }, callback);

      expect(result).toEqual(unsubCallback);
      expect(callback).toBeCalledWith(fakeValue);
    });

    it("should throw an error if the Asset doesn't exist", () => {
      when(assetMock).calledWith(rawAssetId).mockResolvedValue(dsMockUtils.createMockOption());

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `There is no Asset with asset ID "${assetId}"`,
      });

      return expect(identity.getAssetBalance({ assetId })).rejects.toThrow(expectedError);
    });
  });

  describe('method: hasValidCdd', () => {
    it('should return whether the Identity has valid CDD', async () => {
      const did = 'someDid';
      const statusResponse = true;
      const mockContext = dsMockUtils.getContextInstance();
      const rawIdentityId = dsMockUtils.createMockIdentityId(did);
      const fakeHasValidCdd = dsMockUtils.createMockCddStatus({
        Ok: rawIdentityId,
      });

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);

      when(dsMockUtils.createCallMock('identityApi', 'isIdentityHasValidCdd'))
        .calledWith(rawIdentityId, null)
        .mockResolvedValue(fakeHasValidCdd);

      when(jest.spyOn(utilsConversionModule, 'cddStatusToBoolean'))
        .calledWith(fakeHasValidCdd)
        .mockReturnValue(statusResponse);

      const identity = new Identity({ did }, context);
      const result = await identity.hasValidCdd();

      expect(result).toEqual(statusResponse);
    });
  });

  describe('method: isGcMember', () => {
    it('should return whether the Identity is GC member', async () => {
      const did = 'someDid';
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      when(identityIdToStringSpy).calledWith(rawDid).mockReturnValue(did);

      dsMockUtils
        .createQueryMock('committeeMembership', 'activeMembers')
        .mockResolvedValue([rawDid, dsMockUtils.createMockIdentityId('otherDid')]);

      const result = await identity.isGcMember();

      expect(result).toBeTruthy();
    });
  });

  describe('method: isCddProvider', () => {
    it('should return whether the Identity is a CDD provider', async () => {
      const did = 'someDid';
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      when(identityIdToStringSpy).calledWith(rawDid).mockReturnValue(did);

      dsMockUtils
        .createQueryMock('cddServiceProviders', 'activeMembers')
        .mockResolvedValue([rawDid, dsMockUtils.createMockIdentityId('otherDid')]);

      const result = await identity.isCddProvider();

      expect(result).toBeTruthy();
    });
  });

  describe('method: getPrimaryAccount', () => {
    const did = 'someDid';
    const accountId = '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR';

    let accountIdToStringSpy: jest.SpyInstance<string, [AccountId]>;
    let didRecordsSpy: jest.Mock;
    let rawDidRecord: PolymeshPrimitivesIdentityDidRecord;
    let fakeResult: PermissionedAccount;

    beforeAll(() => {
      accountIdToStringSpy = jest.spyOn(utilsConversionModule, 'accountIdToString');
      accountIdToStringSpy.mockReturnValue(accountId);
      getAccountSpy = jest.spyOn(utilsInternalModule, 'getAccount');
    });

    beforeEach(() => {
      didRecordsSpy = dsMockUtils.createQueryMock('identity', 'didRecords');
      rawDidRecord = dsMockUtils.createMockIdentityDidRecord({
        primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId(accountId)),
      });
      when(getAccountSpy)
        .calledWith({ address: accountId }, context)
        // @ts-expect-error "Account not defined"
        .mockResolvedValue({ address: accountId });

      const account = expect.objectContaining({ address: accountId });

      fakeResult = {
        account,
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
          transactionGroups: [],
        },
      };
    });

    it('should return a PrimaryAccount', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      didRecordsSpy.mockReturnValue(dsMockUtils.createMockOption(rawDidRecord));

      const result = await identity.getPrimaryAccount();
      expect(result).toEqual({
        account: expect.objectContaining({ address: accountId }),
        permissions: {
          assets: null,
          transactions: null,
          portfolios: null,
          transactionGroups: [],
        },
      });
    });

    it('should allow subscription', async () => {
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      const unsubCallback = 'unsubCallBack';

      didRecordsSpy.mockImplementation(async (_, cbFunc) => {
        cbFunc(dsMockUtils.createMockOption(rawDidRecord));
        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await identity.getPrimaryAccount(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toHaveBeenCalledWith({
        ...fakeResult,
        account: expect.objectContaining({ address: accountId }),
      });
    });
  });

  describe('method: getTrustingAssets', () => {
    const did = 'someDid';
    const assetIds = ['0x1234', '0x5678'];

    it('should return a list of Assets', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryMock(trustingAssetsQuery({ issuer: did }), {
        trustedClaimIssuers: {
          nodes: assetIds.map(assetId => ({ assetId })),
        },
      });

      const result = await identity.getTrustingAssets();

      expect(result[0].id).toBe(assetIds[0]);
      expect(result[1].id).toBe(assetIds[1]);
    });
  });

  describe('method: getHeldAssets', () => {
    const did = 'someDid';
    const assetIds = ['0x1234', '0x5678'];

    it('should return a list of Assets', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryMock(assetHoldersQuery({ identityId: did }), {
        assetHolders: { nodes: assetIds.map(assetId => ({ assetId })), totalCount: 2 },
      });

      let result = await identity.getHeldAssets();

      expect(result.data[0].id).toBe(assetIds[0]);
      expect(result.data[1].id).toBe(assetIds[1]);

      dsMockUtils.createApolloQueryMock(
        assetHoldersQuery(
          { identityId: did },
          new BigNumber(1),
          new BigNumber(0),
          AssetHoldersOrderBy.CreatedBlockIdAsc
        ),
        {
          assetHolders: { nodes: assetIds.map(assetId => ({ assetId })), totalCount: 2 },
        }
      );

      result = await identity.getHeldAssets({
        start: new BigNumber(0),
        size: new BigNumber(1),
        order: AssetHoldersOrderBy.CreatedBlockIdAsc,
      });

      expect(result.data[0].id).toBe(assetIds[0]);
      expect(result.data[1].id).toBe(assetIds[1]);
    });
  });

  describe('method: getHeldNfts', () => {
    const did = 'someDid';
    const assetIds = ['0x1234', '0x4321'];

    it('should return a list of HeldNfts', async () => {
      const identity = new Identity({ did }, context);

      dsMockUtils.createApolloQueryMock(nftHoldersQuery({ identityId: did }), {
        nftHolders: {
          nodes: assetIds.map(assetId => ({ assetId, nftIds: [] })),
          totalCount: 2,
        },
      });

      let result = await identity.getHeldNfts();

      expect(result.data[0].collection.id).toBe(assetIds[0]);
      expect(result.data[1].collection.id).toBe(assetIds[1]);

      dsMockUtils.createApolloQueryMock(
        nftHoldersQuery(
          { identityId: did },
          new BigNumber(1),
          new BigNumber(0),
          NftHoldersOrderBy.CreatedBlockIdAsc
        ),
        {
          nftHolders: {
            nodes: assetIds.map(assetId => ({ assetId, nftIds: [1, 3] })),
            totalCount: 2,
          },
        }
      );

      result = await identity.getHeldNfts({
        start: new BigNumber(0),
        size: new BigNumber(1),
        order: NftHoldersOrderBy.CreatedBlockIdAsc,
      });

      expect(result.data[0].collection.id).toBe(assetIds[0]);
      expect(result.data[1].collection.id).toBe(assetIds[1]);
      expect(result.data[0].nfts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: new BigNumber(1) }),
          expect.objectContaining({ id: new BigNumber(3) }),
        ])
      );
    });
  });

  describe('method: getVenues', () => {
    let did: string;
    let venueId: BigNumber;

    let rawDid: PolymeshPrimitivesIdentityId;
    let rawVenueId: u64;

    beforeAll(() => {
      did = 'someDid';
      venueId = new BigNumber(10);

      rawDid = dsMockUtils.createMockIdentityId(did);
      rawVenueId = dsMockUtils.createMockU64(venueId);
    });

    beforeEach(() => {
      when(stringToIdentityIdSpy).calledWith(did, context).mockReturnValue(rawDid);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of Venues', async () => {
      when(u64ToBigNumberSpy).calledWith(rawVenueId).mockReturnValue(venueId);
      const mock = dsMockUtils.createQueryMock('settlement', 'userVenues');
      const mockStorageKey = { args: [rawDid, rawVenueId] };

      mock.keys = jest.fn().mockResolvedValue([mockStorageKey]);

      const identity = new Identity({ did }, context);

      const result = await identity.getVenues();
      expect(result[0].id).toEqual(venueId);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Identity exists', async () => {
      const identity = new Identity({ did: 'someDid' }, context);

      dsMockUtils.createQueryMock('identity', 'didRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockIdentityDidRecord({
            primaryKey: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId('someId')),
          })
        ),
      });

      await expect(identity.exists()).resolves.toBe(true);

      dsMockUtils.createQueryMock('identity', 'didRecords', {
        returnValue: dsMockUtils.createMockOption(),
      });

      await expect(identity.exists()).resolves.toBe(false);

      dsMockUtils.createQueryMock('identity', 'didRecords', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockIdentityDidRecord({
            primaryKey: dsMockUtils.createMockOption(),
          })
        ),
      });

      return expect(identity.exists()).resolves.toBe(false);
    });
  });

  describe('method: getInstructions & getInvolvedInstructions', () => {
    let id1: BigNumber;
    let id2: BigNumber;
    let id3: BigNumber;
    let id4: BigNumber;
    let id5: BigNumber;
    let identity: Identity;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      id1 = new BigNumber(1);
      id2 = new BigNumber(2);
      id3 = new BigNumber(3);
      id4 = new BigNumber(4);
      id5 = new BigNumber(5);

      const did = 'someDid';
      identity = new Identity({ did }, context);

      const defaultPortfolioDid = 'someDid';
      const numberedPortfolioDid = 'someDid';
      const numberedPortfolioId = new BigNumber(1);
      const custodiedPortfolioDid = 'someOtherDid';
      const custodiedPortfolioId = new BigNumber(1);

      const defaultPortfolio = entityMockUtils.getDefaultPortfolioInstance({
        did: defaultPortfolioDid,
        isCustodiedBy: true,
      });

      const numberedPortfolio = entityMockUtils.getNumberedPortfolioInstance({
        did: numberedPortfolioDid,
        id: numberedPortfolioId,
        isCustodiedBy: false,
      });

      const custodiedPortfolio = entityMockUtils.getNumberedPortfolioInstance({
        did: custodiedPortfolioDid,
        id: custodiedPortfolioId,
      });

      identity.portfolios.getPortfolios = jest
        .fn()
        .mockResolvedValue([defaultPortfolio, numberedPortfolio]);

      identity.portfolios.getCustodiedPortfolios = jest
        .fn()
        .mockResolvedValue({ data: [custodiedPortfolio], next: null });

      const portfolioLikeToPortfolioIdSpy = jest.spyOn(
        utilsConversionModule,
        'portfolioLikeToPortfolioId'
      );

      when(portfolioLikeToPortfolioIdSpy)
        .calledWith(defaultPortfolio)
        .mockReturnValue({ did: defaultPortfolioDid, number: undefined });
      when(portfolioLikeToPortfolioIdSpy)
        .calledWith(numberedPortfolio)
        .mockReturnValue({ did: numberedPortfolioDid, number: numberedPortfolioId });

      const rawPortfolio = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      });

      const rawNumberedPortfolio = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(numberedPortfolioDid),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(numberedPortfolioId),
        }),
      });

      const rawCustodiedPortfolio = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(custodiedPortfolioDid),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(custodiedPortfolioId),
        }),
      });

      const portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
        utilsConversionModule,
        'portfolioIdToMeshPortfolioId'
      );

      when(portfolioIdToMeshPortfolioIdSpy)
        .calledWith({ did, number: undefined }, context)
        .mockReturnValue(rawPortfolio);

      when(portfolioIdToMeshPortfolioIdSpy)
        .calledWith({ did: numberedPortfolioDid, number: numberedPortfolioId }, context)
        .mockReturnValue(rawNumberedPortfolio);

      when(portfolioIdToMeshPortfolioIdSpy)
        .calledWith({ did: custodiedPortfolioDid, number: custodiedPortfolioId }, context)
        .mockReturnValue(rawCustodiedPortfolio);

      const userAuthsMock = dsMockUtils.createQueryMock('settlement', 'userAffirmations');

      const rawId1 = dsMockUtils.createMockU64(id1);
      const rawId2 = dsMockUtils.createMockU64(id2);
      const rawId3 = dsMockUtils.createMockU64(id3);
      const rawId4 = dsMockUtils.createMockU64(id4);
      const rawId5 = dsMockUtils.createMockU64(id5);

      const entriesMock = jest.fn();
      when(entriesMock)
        .calledWith(rawPortfolio)
        .mockResolvedValue([
          tuple(
            { args: [rawPortfolio, rawId1] },
            dsMockUtils.createMockAffirmationStatus('Affirmed')
          ),
          tuple(
            { args: [rawPortfolio, rawId2] },
            dsMockUtils.createMockAffirmationStatus('Pending')
          ),
          tuple(
            { args: [rawPortfolio, rawId3] },
            dsMockUtils.createMockAffirmationStatus('Unknown')
          ),
          tuple(
            { args: [rawPortfolio, rawId4] },
            dsMockUtils.createMockAffirmationStatus('Affirmed')
          ),
        ]);

      when(entriesMock)
        .calledWith(rawCustodiedPortfolio)
        .mockResolvedValue([
          tuple(
            { args: [rawCustodiedPortfolio, rawId1] },
            dsMockUtils.createMockAffirmationStatus('Affirmed')
          ),
          tuple(
            { args: [rawCustodiedPortfolio, rawId2] },
            dsMockUtils.createMockAffirmationStatus('Affirmed')
          ),
        ]);

      when(entriesMock)
        .calledWith(rawNumberedPortfolio)
        .mockResolvedValue([
          tuple(
            { args: [rawNumberedPortfolio, rawId5] },
            dsMockUtils.createMockAffirmationStatus('Pending')
          ),
        ]);

      userAuthsMock.entries = entriesMock;

      const instructionStatusesMock = dsMockUtils.createQueryMock(
        'settlement',
        'instructionStatuses',
        {
          multi: [],
        }
      );

      const multiMock = jest.fn();

      const rawInstructionStatuses = [
        dsMockUtils.createMockInstructionStatus('Pending'),
        dsMockUtils.createMockInstructionStatus('Pending'),
        dsMockUtils.createMockInstructionStatus('Unknown'),
        dsMockUtils.createMockInstructionStatus('Failed'),
      ];

      multiMock.mockResolvedValueOnce([
        ...rawInstructionStatuses,
        rawInstructionStatuses[0],
        rawInstructionStatuses[1],
      ]);
      multiMock.mockResolvedValueOnce([
        ...rawInstructionStatuses,
        rawInstructionStatuses[0],
        rawInstructionStatuses[1],
      ]);
      multiMock.mockResolvedValueOnce([
        dsMockUtils.createMockInstruction({
          instructionId: dsMockUtils.createMockU64(id5),
          venueId: dsMockUtils.createMockU64(),
          settlementType: dsMockUtils.createMockSettlementType('SettleOnAffirmation'),
          createdAt: dsMockUtils.createMockOption(),
          tradeDate: dsMockUtils.createMockOption(),
          valueDate: dsMockUtils.createMockOption(),
        }),
      ]);

      instructionStatusesMock.multi = multiMock;
    });

    it('should return all instructions in which the identity is involved, grouped by status', async () => {
      const result = await identity.getInstructions();

      expect(result).toEqual({
        affirmed: [expect.objectContaining({ id: id1 })],
        pending: [expect.objectContaining({ id: id2 })],
        failed: [expect.objectContaining({ id: id4 })],
      });
    });

    it('should return all instructions in which the identity is involved, grouped by role and status', async () => {
      const result = await identity.getInvolvedInstructions();

      expect(result).toEqual({
        owned: {
          affirmed: [],
          pending: [expect.objectContaining({ id: id5 })],
          failed: [],
          partiallyAffirmed: [],
        },
        custodied: {
          affirmed: [expect.objectContaining({ id: id1 })],
          pending: [],
          failed: [expect.objectContaining({ id: id4 })],
          partiallyAffirmed: [expect.objectContaining({ id: id2 })],
        },
      });
    });
  });

  describe('method: areSecondaryAccountsFrozen', () => {
    let frozenMock: jest.Mock;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenMock = dsMockUtils.createQueryMock('identity', 'isDidFrozen');
    });

    it('should return whether secondary key is frozen or not', async () => {
      const identity = new Identity({ did: 'someDid' }, context);

      frozenMock.mockResolvedValue(rawBoolValue);

      const result = await identity.areSecondaryAccountsFrozen();

      expect(result).toBe(boolValue);
    });

    it('should allow subscription', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const unsubCallback = 'unsubCallBack';

      frozenMock.mockImplementation(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = jest.fn();
      const result = await identity.areSecondaryAccountsFrozen(callback);

      expect(result).toBe(unsubCallback);
      expect(callback).toBeCalledWith(boolValue);
    });
  });

  describe('method: getPendingDistributions', () => {
    let assets: FungibleAsset[];
    let distributions: DistributionWithDetails[];
    let expectedDistribution: DistributionWithDetails;

    beforeAll(() => {
      assets = [
        entityMockUtils.getFungibleAssetInstance({ assetId: '0x1111' }),
        entityMockUtils.getFungibleAssetInstance({ assetId: '0x2222' }),
      ];
      const distributionTemplate = {
        expiryDate: null,
        perShare: new BigNumber(1),
        checkpoint: entityMockUtils.getCheckpointInstance({
          balance: new BigNumber(1000),
        }),
        paymentDate: new Date('10/14/1987'),
      };
      const detailsTemplate = {
        remainingFunds: new BigNumber(10000),
        fundsReclaimed: false,
      };
      expectedDistribution = {
        distribution: entityMockUtils.getDividendDistributionInstance(distributionTemplate),
        details: detailsTemplate,
      };
      distributions = [
        expectedDistribution,
        {
          distribution: entityMockUtils.getDividendDistributionInstance({
            ...distributionTemplate,
            expiryDate: new Date('10/14/1987'),
          }),
          details: detailsTemplate,
        },
        {
          distribution: entityMockUtils.getDividendDistributionInstance({
            ...distributionTemplate,
            paymentDate: new Date(new Date().getTime() + 3 * 60 * 1000),
          }),
          details: detailsTemplate,
        },
        {
          distribution: entityMockUtils.getDividendDistributionInstance({
            ...distributionTemplate,
            id: new BigNumber(5),
            assetId: '0x9999',
          }),
          details: detailsTemplate,
        },
      ];
    });

    beforeEach(() => {
      when(context.getDividendDistributionsForAssets)
        .calledWith({ assets })
        .mockResolvedValue(distributions);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all distributions where the Identity can claim funds', async () => {
      const holderPaidMock = dsMockUtils.createQueryMock('capitalDistribution', 'holderPaid');

      const rawCaId = dsMockUtils.createMockCAId({
        assetId: '0x9999',
        localId: new BigNumber(5),
      });
      const rawIdentityId = dsMockUtils.createMockIdentityId('someDid');

      when(jest.spyOn(utilsConversionModule, 'stringToIdentityId'))
        .calledWith('someDid', context)
        .mockReturnValue(rawIdentityId);
      when(jest.spyOn(utilsConversionModule, 'corporateActionIdentifierToCaId'))
        .calledWith(
          { asset: expect.objectContaining({ id: '0x9999' }), localId: new BigNumber(5) },
          context
        )
        .mockReturnValue(rawCaId);

      holderPaidMock.mockResolvedValue(dsMockUtils.createMockBool(false));
      when(holderPaidMock)
        .calledWith([rawCaId, rawIdentityId])
        .mockResolvedValue(dsMockUtils.createMockBool(true));

      const identity = new Identity({ did: 'someDid' }, context);

      const heldAssetsSpy = jest.spyOn(identity, 'getHeldAssets');
      heldAssetsSpy
        .mockResolvedValueOnce({ data: [assets[0]], next: new BigNumber(1) })
        .mockResolvedValue({ data: [assets[1]], next: null });

      const result = await identity.getPendingDistributions();

      expect(result).toEqual([expectedDistribution]);
    });
  });

  describe('method: getSecondaryAccounts', () => {
    const accountId = 'someAccountId';

    let account: Account;
    let fakeResult: PermissionedAccount[];

    let rawPrimaryKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
    let rawSecondaryKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
    let rawMultiSigKeyRecord: PolymeshPrimitivesSecondaryKeyKeyRecord;
    let rawDidRecord: StorageKey;
    let meshPermissionsToPermissionsSpy: jest.SpyInstance<
      Permissions,
      [PolymeshPrimitivesSecondaryKeyPermissions, Context]
    >;
    let getSecondaryAccountPermissionsSpy: jest.SpyInstance;
    let accountIdToStringSpy: jest.SpyInstance<string, [AccountId]>;

    beforeAll(() => {
      account = entityMockUtils.getAccountInstance({ address: accountId });
      meshPermissionsToPermissionsSpy = jest.spyOn(
        utilsConversionModule,
        'meshPermissionsToPermissions'
      );
      getSecondaryAccountPermissionsSpy = jest.spyOn(
        utilsInternalModule,
        'getSecondaryAccountPermissions'
      );
      fakeResult = [
        {
          account,
          permissions: {
            assets: null,
            portfolios: null,
            transactions: null,
            transactionGroups: [],
          },
        },
      ];
      accountIdToStringSpy = jest.spyOn(utilsConversionModule, 'accountIdToString');
      accountIdToStringSpy.mockReturnValue(accountId);
      getAccountSpy = jest.spyOn(utilsInternalModule, 'getAccount');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      rawPrimaryKeyRecord = dsMockUtils.createMockKeyRecord({
        PrimaryKey: dsMockUtils.createMockIdentityId('someDid'),
      });
      rawSecondaryKeyRecord = dsMockUtils.createMockKeyRecord({
        SecondaryKey: [dsMockUtils.createMockIdentityId(), dsMockUtils.createMockPermissions()],
      });
      rawMultiSigKeyRecord = dsMockUtils.createMockKeyRecord({
        MultiSigSignerKey: dsMockUtils.createMockAccountId('someAddress'),
      });
      rawDidRecord = {
        args: [dsMockUtils.createMockIdentityId(), dsMockUtils.createMockAccountId(accountId)],
      } as unknown as StorageKey;
      const entriesMock = jest.fn();
      entriesMock.mockResolvedValue([[rawDidRecord]]);
      dsMockUtils.createQueryMock('identity', 'didKeys', {
        entries: [[rawDidRecord.args, true]],
      });
      when(getAccountSpy).calledWith({ address: accountId }, context).mockResolvedValue(account);

      meshPermissionsToPermissionsSpy.mockReturnValue({
        assets: null,
        portfolios: null,
        transactions: null,
        transactionGroups: [],
      });
    });

    it('should return a list of Accounts', async () => {
      dsMockUtils.createQueryMock('identity', 'keyRecords', {
        multi: [
          dsMockUtils.createMockOption(rawPrimaryKeyRecord),
          dsMockUtils.createMockOption(rawSecondaryKeyRecord),
          dsMockUtils.createMockOption(rawMultiSigKeyRecord),
        ],
      });

      getSecondaryAccountPermissionsSpy.mockReturnValue(fakeResult);
      const identity = new Identity({ did: 'someDid' }, context);

      let result = await identity.getSecondaryAccounts();
      expect(result).toEqual({ data: fakeResult, next: null });

      result = await identity.getSecondaryAccounts({ size: new BigNumber(20) });
      expect(result).toEqual({ data: fakeResult, next: null });
    });

    it('should allow subscription', async () => {
      const identity = new Identity({ did: 'someDid' }, context);
      const unsubCallback = 'unsubCallBack';

      const callback = jest.fn();

      getSecondaryAccountPermissionsSpy.mockResolvedValue([
        {
          account,
          permissions: {
            assets: null,
            portfolios: null,
            transactions: null,
            transactionGroups: [],
          },
        },
      ]);
      getSecondaryAccountPermissionsSpy.mockReturnValue(unsubCallback);

      const result = await identity.getSecondaryAccounts(callback);

      expect(result).toBe(unsubCallback);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const identity = new Identity({ did: 'someDid' }, context);
      expect(identity.toHuman()).toBe('someDid');
    });
  });

  describe('method: getHistoricalInstructions', () => {
    let getLatestSqVersionSpy: jest.SpyInstance;
    beforeEach(() => {
      getLatestSqVersionSpy = jest.spyOn(utilsInternalModule, 'getLatestSqVersion');
    });

    it('should return the list of all instructions where the Identity was involved for older SQ', async () => {
      getLatestSqVersionSpy.mockResolvedValue('15.0.0');
      const identity = new Identity({ did: 'someDid' }, context);
      const oldMiddlewareInstructionToHistoricInstructionSpy = jest.spyOn(
        utilsConversionModule,
        'oldMiddlewareInstructionToHistoricInstruction'
      );

      const legsResponse = {
        totalCount: 5,
        nodes: [{ instruction: 'instruction' }],
      };

      dsMockUtils.createApolloQueryMock(instructionsByDidQuery(identity.did), {
        legs: legsResponse,
      });

      const mockHistoricInstruction = 'mockData' as unknown as HistoricInstruction;

      oldMiddlewareInstructionToHistoricInstructionSpy.mockReturnValue(mockHistoricInstruction);

      const result = await identity.getHistoricalInstructions();

      expect(result).toEqual([mockHistoricInstruction]);
    });

    it('should return the list of all instructions where the Identity was involved', async () => {
      getLatestSqVersionSpy.mockResolvedValue(SETTLEMENTS_V2_SQ_VERSION);
      const identity = new Identity({ did: 'someDid' }, context);
      const middlewareInstructionToHistoricInstructionSpy = jest.spyOn(
        utilsConversionModule,
        'middlewareInstructionToHistoricInstruction'
      );

      const legsResponse = {
        totalCount: 5,
        nodes: [{ instruction: 'instruction' }],
      };

      dsMockUtils.createApolloQueryMock(instructionPartiesQuery(identity.did), {
        instructionParties: legsResponse,
      });

      const mockHistoricInstruction = 'mockData' as unknown as HistoricInstruction;

      middlewareInstructionToHistoricInstructionSpy.mockReturnValue(mockHistoricInstruction);

      const result = await identity.getHistoricalInstructions();

      expect(result).toEqual([mockHistoricInstruction]);
    });
  });

  describe('method: getChildIdentities', () => {
    it('should return the list of all child identities of which the given Identity is a parent', async () => {
      const identity = new Identity({ did: 'someDid' }, context);

      const rawIdentity = dsMockUtils.createMockIdentityId(identity.did);
      when(identityIdToStringSpy).calledWith(rawIdentity).mockReturnValue(identity.did);

      const children = ['someChild', 'someOtherChild'];
      const rawChildren = children.map(child => dsMockUtils.createMockIdentityId(child));

      when(identityIdToStringSpy).calledWith(rawChildren[0]).mockReturnValue(children[0]);
      when(identityIdToStringSpy).calledWith(rawChildren[1]).mockReturnValue(children[1]);

      dsMockUtils.createQueryMock('identity', 'parentDid', {
        entries: rawChildren.map(child =>
          tuple([child], dsMockUtils.createMockOption(rawIdentity))
        ),
      });

      const result = await identity.getChildIdentities();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ did: children[0] }),
          expect.objectContaining({ did: children[1] }),
        ])
      );
    });
  });

  describe('method: unlinkChild', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;

      const identity = new Identity({ did: 'someDid' }, context);

      const args = {
        child: 'someChild',
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const transaction = await identity.unlinkChild(args);

      expect(transaction).toBe(expectedTransaction);
    });
  });

  describe('method: isChild', () => {
    it('should return whether the Identity is a child Identity', async () => {
      entityMockUtils.configureMocks({
        childIdentityOptions: {
          exists: true,
        },
      });
      const identity = new Identity({ did: 'someDid' }, context);
      let result = await identity.isChild();

      expect(result).toBeTruthy();

      entityMockUtils.configureMocks({
        childIdentityOptions: {
          exists: false,
        },
      });

      result = await identity.isChild();

      expect(result).toBeFalsy();
    });
  });

  describe('method: preApprovedAssets', () => {
    it('should the list of pre-approved assets for the identity', async () => {
      const did = 'someDid';
      const assetId = '0x1234';
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      when(identityIdToStringSpy).calledWith(rawDid).mockReturnValue(did);

      dsMockUtils.createQueryMock('asset', 'preApprovedAsset', {
        entries: [tuple([rawDid, rawAssetId], dsMockUtils.createMockBool(true))],
      });

      const result = await identity.preApprovedAssets();

      expect(result).toEqual({
        data: [expect.objectContaining({ id: assetId })],
        next: null,
      });
    });
  });

  describe('method: isAssetPreApproved', () => {
    it('should return whether the asset is pre-approved or not', async () => {
      const did = 'someDid';
      const assetId = '0x1234';
      const asset = entityMockUtils.getBaseAssetInstance({ assetId });
      const rawAssetId = dsMockUtils.createMockAssetId(assetId);
      const rawDid = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      jest.spyOn(utilsInternalModule, 'asBaseAsset').mockResolvedValue(asset);
      when(stringToAssetIdSpy).calledWith(assetId, mockContext).mockReturnValue(rawAssetId);
      when(identityIdToStringSpy).calledWith(rawDid).mockReturnValue(did);

      dsMockUtils
        .createQueryMock('asset', 'preApprovedAsset')
        .mockResolvedValue(dsMockUtils.createMockBool(true));

      const result = await identity.isAssetPreApproved(assetId);

      expect(result).toBeTruthy();
    });
  });

  describe('method: getMultiSigSigners', () => {
    it('should return the MultiSig signers associated with an Identity', async () => {
      dsMockUtils.createQueryMock('multiSig', 'multiSigToIdentity', {
        entries: [
          tuple(
            [dsMockUtils.createMockAccountId('multiSig')],
            dsMockUtils.createMockIdentityId('someDid')
          ),
          tuple(
            [dsMockUtils.createMockAccountId('multiSig2')],
            dsMockUtils.createMockIdentityId('randomDid')
          ),
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'multiSigSigners', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockAccountId('multiSig'),
              dsMockUtils.createMockSignatory({
                Account: dsMockUtils.createMockAccountId('signer'),
              }),
            ],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      const did = 'someDid';
      const mockContext = dsMockUtils.getContextInstance();
      const identity = new Identity({ did }, mockContext);

      dsMockUtils
        .createQueryMock('asset', 'preApprovedAsset')
        .mockResolvedValue(dsMockUtils.createMockBool(true));

      const result = await identity.getMultiSigSigners();

      expect(result).toEqual([
        {
          signerFor: expect.objectContaining({
            address: 'multiSig',
          }),
          signers: [
            expect.objectContaining({
              address: 'signer',
            }),
          ],
        },
      ]);
    });
  });

  describe('method: getOffChainAuthorizationNonce', () => {
    it('should return the off chain authorization nonce for an Identity', async () => {
      const did = 'someDid';
      const rawIdentityId = dsMockUtils.createMockIdentityId(did);
      const mockContext = dsMockUtils.getContextInstance();

      stringToIdentityIdSpy.mockReturnValue(rawIdentityId);

      const nonce = new BigNumber(2);
      const rawNonce = dsMockUtils.createMockU64(nonce);

      dsMockUtils
        .createQueryMock('identity', 'offChainAuthorizationNonce')
        .mockResolvedValue(rawNonce);

      when(u64ToBigNumberSpy).calledWith(rawNonce).mockReturnValue(nonce);

      const identity = new Identity({ did }, mockContext);

      const result = await identity.getOffChainAuthorizationNonce();

      expect(result).toEqual(nonce);
    });
  });
});
