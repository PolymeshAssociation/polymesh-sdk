import { Balance } from '@polkadot/types/interfaces';
import { bool } from '@polkadot/types/primitive';
import BigNumber from 'bignumber.js';
import {
  AssetIdentifier,
  FundingRoundName,
  SecurityToken as MeshSecurityToken,
} from 'polymesh-types/types';
import sinon, { SinonStub } from 'sinon';

import { Params } from '~/api/procedures/toggleFreezeTransfers';
import {
  Context,
  Entity,
  Identity,
  modifyPrimaryIssuanceAgent,
  modifyToken,
  removePrimaryIssuanceAgent,
  SecurityToken,
  toggleFreezeTransfers,
  TransactionQueue,
  transferTokenOwnership,
} from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils } from '~/testUtils/mocks';
import { TokenIdentifier, TokenIdentifierType } from '~/types';
import * as utilsModule from '~/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';

describe('SecurityToken class', () => {
  let prepareToggleFreezeTransfersStub: SinonStub<
    [Params, Context],
    Promise<TransactionQueue<SecurityToken, unknown[][]>>
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    prepareToggleFreezeTransfersStub = sinon.stub(toggleFreezeTransfers, 'prepare');
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
    let primaryIssuanceAgent: string;

    let rawToken: MeshSecurityToken;

    let context: Context;
    let securityToken: SecurityToken;

    beforeAll(() => {
      ticker = 'test';
      totalSupply = 1000;
      isDivisible = true;
      owner = '0x0wn3r';
      assetType = 'EquityCommon';
      primaryIssuanceAgent = '0xtr34sury';
    });

    beforeEach(() => {
      rawToken = dsMockUtils.createMockSecurityToken({
        /* eslint-disable @typescript-eslint/camelcase */
        owner_did: dsMockUtils.createMockIdentityId(owner),
        name: dsMockUtils.createMockAssetName(ticker),
        asset_type: dsMockUtils.createMockAssetType(assetType),
        divisible: dsMockUtils.createMockBool(isDivisible),
        total_supply: dsMockUtils.createMockBalance(totalSupply),
        primary_issuance_agent: dsMockUtils.createMockOption(
          dsMockUtils.createMockIdentityId(primaryIssuanceAgent)
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
      expect(details.primaryIssuanceAgent?.did).toBe(primaryIssuanceAgent);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/camelcase
      (rawToken as any).primary_issuance_agent = dsMockUtils.createMockOption();

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
        primaryIssuanceAgent: null,
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
        eventArg1: utilsModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/camelcase */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
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

  describe('method: freeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const securityToken = new SecurityToken({ ticker }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      prepareToggleFreezeTransfersStub
        .withArgs({ ticker, freeze: true }, context)
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

      prepareToggleFreezeTransfersStub
        .withArgs({ ticker, freeze: false }, context)
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

      sinon
        .stub(modifyPrimaryIssuanceAgent, 'prepare')
        .withArgs({ ticker, target }, context)
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

      sinon
        .stub(removePrimaryIssuanceAgent, 'prepare')
        .withArgs({ ticker }, context)
        .resolves(expectedQueue);

      const queue = await securityToken.removePrimaryIssuanceAgent();

      expect(queue).toBe(expectedQueue);
    });
  });
});
