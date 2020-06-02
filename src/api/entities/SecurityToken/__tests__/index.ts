import { Balance } from '@polkadot/types/interfaces';
import sinon from 'sinon';

import { modifyToken, transferTokenOwnership } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { eventByIndexedArgs } from '~/harvester/queries';
import { dsMockUtils } from '~/testUtils/mocks';
import { TokenIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { SecurityToken } from '../';

describe('SecurityToken class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      expect(securityToken.ticker).toBe(ticker);
      expect(securityToken.did).toBe(utilsModule.tickerToDid(ticker));
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 'someTicker' })).toBe(true);
      expect(SecurityToken.isUniqueIdentifiers({})).toBe(false);
      expect(SecurityToken.isUniqueIdentifiers({ ticker: 3 })).toBe(false);
    });
  });

  describe('method: details', () => {
    test('should return details for a security token', async () => {
      const ticker = 'test';
      const totalSupply = 1000;
      const isDivisible = true;
      const owner = '0x0wn3r';
      const assetType = 'EquityCommon';

      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: dsMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: dsMockUtils.createMockIdentityId(owner),
          name: dsMockUtils.createMockAssetName(ticker),
          asset_type: dsMockUtils.createMockAssetType(assetType),
          divisible: dsMockUtils.createMockBool(isDivisible),
          link_id: dsMockUtils.createMockU64(3),
          total_supply: dsMockUtils.createMockBalance(totalSupply),
          /* eslint-enable @typescript-eslint/camelcase */
        }),
      });

      const details = await securityToken.details();

      expect(details.name).toBe(ticker);
      expect(details.totalSupply).toEqual(
        utilsModule.balanceToBigNumber((totalSupply as unknown) as Balance)
      );
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
      expect(details.assetType).toBe(assetType);
    });
  });

  describe('method: transferOwnership', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);
      const did = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        did,
        expiry,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(transferTokenOwnership, 'prepare')
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.transferOwnership(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: modify', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);
      const makeDivisible: true = true;

      const args = {
        makeDivisible,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(modifyToken, 'prepare')
        .withArgs({ ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.modify(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: currentFundingRound', () => {
    test('should return the funding round for a security token', async () => {
      const ticker = 'test';
      const fundingRound = 'Series A';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createQueryStub('asset', 'fundingRound', {
        returnValue: dsMockUtils.createMockFundingRoundName(fundingRound),
      });

      const result = await securityToken.currentFundingRound();

      expect(result).toBe(fundingRound);
    });
  });

  describe('method: getIdentifiers', () => {
    test('should return the list of token identifiers for a security token', async () => {
      const ticker = 'TEST';
      const isinValue = 'FAKE ISIN';
      const cusipValue = 'FAKE CUSIP';
      const cinsValue = 'FAKE CINS';
      const isinMock = dsMockUtils.createMockAssetIdentifier(isinValue);
      const cusipMock = dsMockUtils.createMockAssetIdentifier(cusipValue);
      const cinsMock = dsMockUtils.createMockAssetIdentifier(cinsValue);
      const tokenIdentifiers = [
        {
          type: TokenIdentifierType.Isin,
          value: isinValue,
        },
        {
          type: TokenIdentifierType.Cusip,
          value: cusipValue,
        },
        {
          type: TokenIdentifierType.Cins,
          value: cinsValue,
        },
      ];

      const rawIdentifiers = tokenIdentifiers.map(({ type, value }) =>
        tuple(
          dsMockUtils.createMockIdentifierType(type),
          dsMockUtils.createMockAssetIdentifier(value)
        )
      );

      const context = dsMockUtils.getContextInstance();

      const tokenIdentifierTypeToIdentifierTypeStub = sinon.stub(
        utilsModule,
        'tokenIdentifierTypeToIdentifierType'
      );

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[0].type, context)
        .returns(rawIdentifiers[0][0]);

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[1].type, context)
        .returns(rawIdentifiers[1][0]);

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[2].type, context)
        .returns(rawIdentifiers[2][0]);

      dsMockUtils.createQueryStub('asset', 'identifiers', {
        multi: [isinMock, cusipMock, cinsMock],
      });

      const securityToken = new SecurityToken({ ticker }, context);

      const result = await securityToken.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
      expect(result[1].value).toBe(cusipValue);
      expect(result[2].value).toBe(cinsValue);
    });
  });

  describe('method: createdAt', () => {
    test('should return the event identifier object of the token creation', async () => {
      const ticker = 'SOMETICKER';
      const blockId = 1234;
      const eventIdx = 1;
      const variables = {
        moduleId: 'asset',
        eventId: 'AssetCreated',
        eventArg1: utilsModule.padTicker(ticker),
      };
      const fakeResult = { blockNumber: blockId, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        // eslint-disable-next-line @typescript-eslint/camelcase
        eventByIndexedArgs: { block_id: blockId, event_idx: eventIdx },
      });

      const result = await securityToken.createdAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const ticker = 'SOMETICKER';
      const variables = {
        moduleId: 'asset',
        eventId: 'AssetCreated',
        eventArg1: utilsModule.padTicker(ticker),
      };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await securityToken.createdAt();
      expect(result).toBeNull();
    });

    test('should throw if the harvester query fails', async () => {
      const ticker = 'SOMETICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.throwOnHarvesterQuery();

      return expect(securityToken.createdAt()).rejects.toThrow('Error in harvester query: Error');
    });
  });
});
