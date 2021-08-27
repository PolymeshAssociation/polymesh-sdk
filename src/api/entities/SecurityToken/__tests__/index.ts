import { bool, u64 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  AssetName,
  FundingRoundName,
  SecurityToken as MeshSecurityToken,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Entity, SecurityToken, TransactionQueue } from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TokenIdentifier, TokenIdentifierType } from '~/types';
import { tuple } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('SecurityToken class', () => {
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(SecurityToken.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const ticker = 'test';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      expect(securityToken.ticker).toBe(ticker);
      expect(securityToken.did).toBe(utilsConversionModule.tickerToDid(ticker));
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
    let name: string;
    let totalSupply: number;
    let isDivisible: boolean;
    let owner: string;
    let assetType: 'EquityCommon';
    let iuDisabled: boolean;
    let did: string;

    let rawToken: MeshSecurityToken;
    let rawName: AssetName;
    let rawIuDisabled: bool;

    let context: Context;
    let securityToken: SecurityToken;

    beforeAll(() => {
      ticker = 'FAKETICKER';
      name = 'tokenName';
      totalSupply = 1000;
      isDivisible = true;
      owner = '0x0wn3r';
      assetType = 'EquityCommon';
      iuDisabled = false;
      did = 'someDid';
    });

    beforeEach(() => {
      rawToken = dsMockUtils.createMockSecurityToken({
        /* eslint-disable @typescript-eslint/naming-convention */
        owner_did: dsMockUtils.createMockIdentityId(owner),
        asset_type: dsMockUtils.createMockAssetType(assetType),
        divisible: dsMockUtils.createMockBool(isDivisible),
        total_supply: dsMockUtils.createMockBalance(totalSupply),
        /* eslint-enable @typescript-eslint/naming-convention */
      });
      rawIuDisabled = dsMockUtils.createMockBool(iuDisabled);
      rawName = dsMockUtils.createMockAssetName(name);
      context = dsMockUtils.getContextInstance();
      securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1Pia'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(owner)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('ExceptMeta'))
          ),
        ],
      });
      dsMockUtils.createQueryStub('asset', 'assetNames', {
        returnValue: rawName,
      });
      dsMockUtils.createQueryStub('asset', 'disableInvestorUniqueness', {
        returnValue: rawIuDisabled,
      });
    });

    test('should return details for a security token', async () => {
      dsMockUtils.createQueryStub('asset', 'tokens', {
        returnValue: rawToken,
      });

      let details = await securityToken.details();

      expect(details.name).toBe(name);
      expect(details.totalSupply).toEqual(
        utilsConversionModule.balanceToBigNumber((totalSupply as unknown) as Balance)
      );
      expect(details.isDivisible).toBe(isDivisible);
      expect(details.owner.did).toBe(owner);
      expect(details.assetType).toBe(assetType);
      expect(details.primaryIssuanceAgents).toEqual([entityMockUtils.getIdentityInstance({ did })]);
      expect(details.fullAgents).toEqual([entityMockUtils.getIdentityInstance({ did: owner })]);
      expect(details.requiresInvestorUniqueness).toBe(true);

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full'))
          ),
        ],
      });

      details = await securityToken.details();
      expect(details.primaryIssuanceAgents).toEqual([]);
      expect(details.fullAgents).toEqual([entityMockUtils.getIdentityInstance({ did })]);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
      (rawToken as any).primary_issuance_agent = dsMockUtils.createMockOption();

      dsMockUtils.createQueryStub('asset', 'tokens').callsFake(async (_, cbFunc) => {
        cbFunc(rawToken);

        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.details(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(
        callback,
        sinon.match({
          assetType,
          isDivisible,
          name,
          owner: sinon.match({ did: owner }),
          totalSupply: new BigNumber(totalSupply).div(Math.pow(10, 6)),
          primaryIssuanceAgents: [entityMockUtils.getIdentityInstance({ did })],
          fullAgents: [entityMockUtils.getIdentityInstance({ did: owner })],
          requiresInvestorUniqueness: true,
        })
      );
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
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
      const makeDivisible = true as const;

      const args = {
        makeDivisible,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...args }, transformer: undefined }, context)
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
      ticker = 'FAKETICKER';
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
    let leiValue: string;
    let isinMock: AssetIdentifier;
    let cusipMock: AssetIdentifier;
    let cinsMock: AssetIdentifier;
    let leiMock: AssetIdentifier;
    let tokenIdentifiers: TokenIdentifier[];

    let context: Context;
    let securityToken: SecurityToken;

    beforeAll(() => {
      ticker = 'TEST';
      isinValue = 'FAKE ISIN';
      cusipValue = 'FAKE CUSIP';
      cinsValue = 'FAKE CINS';
      leiValue = 'FAKE LEI';
      isinMock = dsMockUtils.createMockAssetIdentifier({
        Isin: dsMockUtils.createMockU8aFixed(isinValue),
      });
      cusipMock = dsMockUtils.createMockAssetIdentifier({
        Cusip: dsMockUtils.createMockU8aFixed(cusipValue),
      });
      cinsMock = dsMockUtils.createMockAssetIdentifier({
        Cins: dsMockUtils.createMockU8aFixed(cinsValue),
      });
      leiMock = dsMockUtils.createMockAssetIdentifier({
        Lei: dsMockUtils.createMockU8aFixed(leiValue),
      });
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
        {
          type: TokenIdentifierType.Lei,
          value: leiValue,
        },
      ];
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      securityToken = new SecurityToken({ ticker }, context);
    });

    test('should return the list of token identifiers for a security token', async () => {
      dsMockUtils.createQueryStub('asset', 'identifiers', {
        returnValue: [isinMock, cusipMock, cinsMock, leiMock],
      });

      const result = await securityToken.getIdentifiers();

      expect(result[0].value).toBe(isinValue);
      expect(result[1].value).toBe(cusipValue);
      expect(result[2].value).toBe(cinsValue);
      expect(result[3].value).toBe(leiValue);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      dsMockUtils.createQueryStub('asset', 'identifiers').callsFake(async (_, cbFunc) => {
        cbFunc([isinMock, cusipMock, cinsMock, leiMock]);

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
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/naming-convention */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const result = await securityToken.createdAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const ticker = 'SOMETICKER';
      const variables = {
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await securityToken.createdAt();
      expect(result).toBeNull();
    });
  });

  describe('method: freeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, freeze: true }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.freeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, freeze: false }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.unfreeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: isFrozen', () => {
    let frozenStub: sinon.SinonStub;
    let boolValue: boolean;
    let rawBoolValue: bool;

    beforeAll(() => {
      boolValue = true;
      rawBoolValue = dsMockUtils.createMockBool(boolValue);
    });

    beforeEach(() => {
      frozenStub = dsMockUtils.createQueryStub('asset', 'frozen');
    });

    test('should return whether the security token is frozen or not', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      frozenStub.resolves(rawBoolValue);

      const result = await securityToken.isFrozen();

      expect(result).toBe(boolValue);
    });

    test('should allow subscription', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);
      const unsubCallback = 'unsubCallBack';

      frozenStub.callsFake(async (_, cbFunc) => {
        cbFunc(rawBoolValue);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.isFrozen(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, boolValue);
    });
  });

  describe('method: modifyPrimaryIssuanceAgent', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const target = 'someDid';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, target }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.modifyPrimaryIssuanceAgent({ target });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: removePrimaryIssuanceAgent', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.removePrimaryIssuanceAgent();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: redeem', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const amount = new BigNumber(100);
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { amount, ticker }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.redeem({ amount });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: investorCount', () => {
    let investorCountPerAssetStub: sinon.SinonStub;
    let investorCount: number;
    let rawInvestorCount: u64;

    beforeAll(() => {
      investorCount = 10;
      rawInvestorCount = dsMockUtils.createMockU64(investorCount);
    });

    beforeEach(() => {
      investorCountPerAssetStub = dsMockUtils.createQueryStub(
        'statistics',
        'investorCountPerAsset'
      );
    });

    test('should return the amount of unique investors that hold the Security Token', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      investorCountPerAssetStub.resolves(rawInvestorCount);

      const result = await securityToken.investorCount();

      expect(result).toBe(investorCount);
    });

    test('should allow subscription', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);
      const unsubCallback = 'unsubCallBack';

      investorCountPerAssetStub.callsFake(async (_, cbFunc) => {
        cbFunc(rawInvestorCount);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await securityToken.investorCount(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, investorCount);
    });
  });

  describe('method: controllerTransfer', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const originPortfolio = 'portfolio';
      const amount = new BigNumber(1);
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, originPortfolio, amount }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.controllerTransfer({ originPortfolio, amount });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const context = dsMockUtils.getContextInstance();
      const token = new SecurityToken({ ticker: 'SOME_TICKER' }, context);

      expect(token.toJson()).toBe('SOME_TICKER');
    });
  });
});
