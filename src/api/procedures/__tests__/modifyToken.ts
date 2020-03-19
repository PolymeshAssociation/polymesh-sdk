import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { getRoles, Params, prepareModifyToken } from '~/api/procedures/modifyToken';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyToken procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let procedureResult: SecurityToken;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
    procedureResult = entityMockUtils.getSecurityTokenInstance();
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([procedureResult]);
    mockContext = polkadotMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareModifyToken.call(proc, ({} as unknown) as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  test('should throw an error if makeDivisible is set to true and the security token is already divisible', () => {
    entityMockUtils.getSecurityTokenDetailsStub({
      isDivisible: true,
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: true,
      })
    ).rejects.toThrow('The Security Token is already divisible');
  });

  test('should throw an error if makeDivisible is set to false', () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: (false as unknown) as true,
      })
    ).rejects.toThrow('You cannot make the token indivisible');
  });

  test('should add a make divisible transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const transaction = polkadotMockUtils.createTxStub('asset', 'makeDivisible');

    const result = await prepareModifyToken.call(proc, {
      ticker,
      makeDivisible: true,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, sinon.match({}), rawTicker);

    expect(result.ticker).toBe(procedureResult.ticker);
  });
});

describe('getRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
