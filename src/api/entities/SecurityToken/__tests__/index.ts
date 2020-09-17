import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  FundingRoundName,
  IdentifierType,
  SecurityToken as MeshSecurityToken,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Entity, Identity } from '~/api/entities';
import { modifyToken, transferTokenOwnership } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils } from '~/testUtils/mocks';
import { TokenIdentifier, TokenIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';

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
    let ticker: string;
    let totalSupply: number;
    let isDivisible: boolean;
    let owner: string;
    let assetType: 'EquityCommon';
    let treasuryIdentity: string;

    let rawToken: MeshSecurityToken;

    let context: Context;
    let securityToken: SecurityToken;

    beforeAll(() => {
      ticker = 'test';
      totalSupply = 1000;
      isDivisible = true;
      owner = '0x0wn3r';
      assetType = 'EquityCommon';
      treasuryIdentity = '0xtr34sury';
    });

    beforeEach(() => {
      rawToken = dsMockUtils.createMockSecurityToken({
        /* eslint-disable @typescript-eslint/camelcase */
        owner_did: dsMockUtils.createMockIdentityId(owner),
        name: dsMockUtils.createMockAssetName(ticker),
        asset_type: dsMockUtils.createMockAssetType(assetType),
        divisible: dsMockUtils.createMockBool(isDivisible),
        total_supply: dsMockUtils.createMockBalance(totalSupply),
        treasury_did: dsMockUtils.createMockOption(
          dsMockUtils.createMockIdentityId(treasuryIdentity)
        ),
        /* eslint-enable @typescript-eslint/camelcase */
      });
      context = dsMockUtils.getContextInstance();
      securityToken = new SecurityToken({ ticker }, context);
    });
    test('should return details for a security token', async () => {
      dsMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: rawToken,
      });

      const details = await securityToken.details();

      expect(details.name).toBe(ticker);
      expect(details.totalSupply).toEqual(
        utilsModule.balanceToBigNumber((totalSupply as unknown) as Balance)
      );
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
      expect(details.assetType).toBe(assetType);
      expect(details.treasuryIdentity?.did).toBe(treasuryIdentity);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/camelcase
      (rawToken as any).treasury_did = dsMockUtils.createMockOption();

      dsMockUtils.createQueryStub('asset', 'tokens').callsFake(async (_, cbFunc) => {
        cbFunc(rawToken);

        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.details(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, {
        assetType,
        isDivisible,
        name: ticker,
        owner: new Identity({ did: owner }, context),
        totalSupply: new BigNumber(totalSupply).div(Math.pow(10, 6)),
        treasuryIdentity: null,
      });
    });
  });

  describe('method: transferOwnership', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const ticker = 'TEST';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);
      const target = 'someOtherDid';
      const expiry = new Date('10/14/3040');

      const args = {
        target,
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
    let ticker: string;
    let fundingRound: string;
    let rawFundingRound: FundingRoundName;

    let context: Context;
    let securityToken: SecurityToken;

    beforeAll(() => {
      ticker = 'test';
      fundingRound = 'Series A';
    });

    beforeEach(() => {
      rawFundingRound = dsMockUtils.createMockFundingRoundName(fundingRound);
      context = dsMockUtils.getContextInstance();
      securityToken = new SecurityToken({ ticker }, context);
    });

    test('should return the funding round for a security token', async () => {
      dsMockUtils.createQueryStub('asset', 'fundingRound', {
        returnValue: rawFundingRound,
      });

      const result = await securityToken.currentFundingRound();

      expect(result).toBe(fundingRound);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryStub('asset', 'fundingRound').callsFake(async (_, cbFunc) => {
        cbFunc(rawFundingRound);

        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.currentFundingRound(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, fundingRound);
    });
  });

  describe('method: getIdentifiers', () => {
    let ticker: string;
    let isinValue: string;
    let cusipValue: string;
    let cinsValue: string;
    let isinMock: AssetIdentifier;
    let cusipMock: AssetIdentifier;
    let cinsMock: AssetIdentifier;
    let tokenIdentifiers: TokenIdentifier[];

    let rawIdentifiers: [IdentifierType, AssetIdentifier][];

    let context: Context;
    let securityToken: SecurityToken;

    let tokenIdentifierTypeToIdentifierTypeStub: sinon.SinonStub<
      [TokenIdentifierType, Context],
      IdentifierType
    >;

    beforeAll(() => {
      ticker = 'TEST';
      isinValue = 'FAKE ISIN';
      cusipValue = 'FAKE CUSIP';
      cinsValue = 'FAKE CINS';
      isinMock = dsMockUtils.createMockAssetIdentifier(isinValue);
      cusipMock = dsMockUtils.createMockAssetIdentifier(cusipValue);
      cinsMock = dsMockUtils.createMockAssetIdentifier(cinsValue);
      tokenIdentifiers = [
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

      rawIdentifiers = tokenIdentifiers.map(({ type, value }) =>
        tuple(
          dsMockUtils.createMockIdentifierType(type),
          dsMockUtils.createMockAssetIdentifier(value)
        )
      );

      tokenIdentifierTypeToIdentifierTypeStub = sinon.stub(
        utilsModule,
        'tokenIdentifierTypeToIdentifierType'
      );
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      securityToken = new SecurityToken({ ticker }, context);

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[0].type, context)
        .returns(rawIdentifiers[0][0]);

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[1].type, context)
        .returns(rawIdentifiers[1][0]);

      tokenIdentifierTypeToIdentifierTypeStub
        .withArgs(tokenIdentifiers[2].type, context)
        .returns(rawIdentifiers[2][0]);
    });

    test('should return the list of token identifiers for a security token', async () => {
      dsMockUtils.createQueryStub('asset', 'identifiers', {
        multi: [isinMock, cusipMock, cinsMock],
      });

      const result = await securityToken.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
      expect(result[1].value).toBe(cusipValue);
      expect(result[2].value).toBe(cinsValue);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryStub('asset', 'identifiers').multi.callsFake(async (_, cbFunc) => {
        cbFunc([rawIdentifiers[0][1], rawIdentifiers[1][1], rawIdentifiers[2][1]]);

        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.getIdentifiers(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, tokenIdentifiers);
    });
  });

  describe('method: createdAt', () => {
    test('should return the event identifier object of the token creation', async () => {
      const ticker = 'SOMETICKER';
      const blockId = 1234;
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const fakeResult = { blockNumber: blockId, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/camelcase */
        eventByIndexedArgs: {
          block_id: blockId,
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/camelcase */
      });

      const result = await securityToken.createdAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const ticker = 'SOMETICKER';
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await securityToken.createdAt();
      expect(result).toBeNull();
    });
  });
});
