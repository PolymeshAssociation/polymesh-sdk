import { Balance } from '@polkadot/types/interfaces';
import sinon from 'sinon';

import { modifyToken, transferTokenOwnership } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import { TokenIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { SecurityToken } from '../';

describe('SecurityToken class', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = polkadotMockUtils.getContextInstance();
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

      const context = polkadotMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: polkadotMockUtils.createMockSecurityToken({
          /* eslint-disable @typescript-eslint/camelcase */
          owner_did: polkadotMockUtils.createMockIdentityId(owner),
          name: polkadotMockUtils.createMockTokenName(ticker),
          asset_type: polkadotMockUtils.createMockAssetType(assetType),
          divisible: polkadotMockUtils.createMockBool(isDivisible),
          link_id: polkadotMockUtils.createMockU64(3),
          total_supply: polkadotMockUtils.createMockBalance(totalSupply),
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
      const context = polkadotMockUtils.getContextInstance();
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
      const context = polkadotMockUtils.getContextInstance();
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
      const context = polkadotMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      polkadotMockUtils.createQueryStub('asset', 'fundingRound', {
        returnValue: polkadotMockUtils.createMockFundingRoundName(fundingRound),
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
      const isinMock = polkadotMockUtils.createMockAssetIdentifier(isinValue);
      const cusipMock = polkadotMockUtils.createMockAssetIdentifier(cusipValue);
      const cinsMock = polkadotMockUtils.createMockAssetIdentifier(cinsValue);
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
          polkadotMockUtils.createMockIdentifierType(type),
          polkadotMockUtils.createMockAssetIdentifier(value)
        )
      );

      const context = polkadotMockUtils.getContextInstance();

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

      polkadotMockUtils.createQueryStub('asset', 'identifiers', {
        multi: [isinMock, cusipMock, cinsMock],
      });

      const securityToken = new SecurityToken({ ticker }, context);

      const result = await securityToken.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
      expect(result[1].value).toBe(cusipValue);
      expect(result[2].value).toBe(cinsValue);
    });
  });
});
