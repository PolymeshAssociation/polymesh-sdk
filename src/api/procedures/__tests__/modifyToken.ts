import { AssetName, FundingRoundName, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { getRequiredRoles, Params, prepareModifyToken } from '~/api/procedures/modifyToken';
import { Context, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyToken procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let stringToAssetNameStub: sinon.SinonStub<[string, Context], AssetName>;
  let stringToFundingRoundNameStub: sinon.SinonStub<[string, Context], FundingRoundName>;
  let ticker: string;
  let rawTicker: Ticker;
  let fundingRound: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToAssetNameStub = sinon.stub(utilsConversionModule, 'stringToAssetName');
    stringToFundingRoundNameStub = sinon.stub(utilsConversionModule, 'stringToFundingRoundName');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    fundingRound = 'Series A';
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareModifyToken.call(proc, ({} as unknown) as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  test('should throw an error if makeDivisible is set to true and the security token is already divisible', () => {
    entityMockUtils.getSecurityTokenDetailsStub({
      isDivisible: true,
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: true,
      })
    ).rejects.toThrow('The Security Token is already divisible');
  });

  test('should throw an error if makeDivisible is set to false', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: (false as unknown) as true,
      })
    ).rejects.toThrow('You cannot make the token indivisible');
  });

  test('should throw an error if newName is the same name currently in the Security Token', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        name: 'TOKEN_NAME',
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  test('should throw an error if newFundingRound is the same funding round name currently in the Security Token', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        fundingRound,
      })
    ).rejects.toThrow('New funding round name is the same as current funding round');
  });

  test('should add a make divisible transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'makeDivisible');

    const result = await prepareModifyToken.call(proc, {
      ticker,
      makeDivisible: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, sinon.match({}), rawTicker);
    expect(result.ticker).toBe(ticker);
  });

  test('should add a rename token transaction to the queue', async () => {
    const newName = 'NEW_NAME';
    const rawAssetName = dsMockUtils.createMockAssetName(newName);
    stringToAssetNameStub.withArgs(newName, mockContext).returns(rawAssetName);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'renameAsset');

    const result = await prepareModifyToken.call(proc, {
      ticker,
      name: newName,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawAssetName);
    expect(result.ticker).toBe(ticker);
  });

  test('should add a set funding round transaction to the queue', async () => {
    const newFundingRound = 'Series B';
    const rawFundingRound = dsMockUtils.createMockFundingRoundName(newFundingRound);
    stringToFundingRoundNameStub.withArgs(newFundingRound, mockContext).returns(rawFundingRound);

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const transaction = dsMockUtils.createTxStub('asset', 'setFundingRound');

    const result = await prepareModifyToken.call(proc, {
      ticker,
      fundingRound: newFundingRound,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, rawFundingRound);
    expect(result.ticker).toBe(ticker);
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
