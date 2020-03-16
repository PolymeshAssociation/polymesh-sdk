import { Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { ModifyTokenInternalParams, prepareModifyToken } from '~/api/procedures/modifyToken';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
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
    entityMockUtils.initMocks({ identityOptions: { did: 'someOtherDid' } });
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

  test('should throw an error if the user is not set any argument to modify the security token', () => {
    const proc = procedureMockUtils.getInstance<ModifyTokenInternalParams, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, ({} as unknown) as ModifyTokenInternalParams)
    ).rejects.toThrow('You should set at least one argument to perform this action');
  });

  test('should throw an error if the user is not the owner of the token', () => {
    entityMockUtils.getSecurityTokenDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      isDivisible: false,
    });

    const proc = procedureMockUtils.getInstance<ModifyTokenInternalParams, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: true,
      })
    ).rejects.toThrow('You must be the owner of the token to modify any property of it');
  });

  test('should throw an error if makeDivisible is set to true and the security token is already divisible', () => {
    entityMockUtils.initMocks({ identityOptions: { did: 'someDid' } });

    entityMockUtils.getSecurityTokenDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      isDivisible: true,
    });

    const proc = procedureMockUtils.getInstance<ModifyTokenInternalParams, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: true,
      })
    ).rejects.toThrow('The Security Token is already divisible');
  });

  test('should throw an error if makeDivisible is set to false', () => {
    entityMockUtils.initMocks({ identityOptions: { did: 'someDid' } });

    entityMockUtils.getSecurityTokenDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      isDivisible: false,
    });

    const proc = procedureMockUtils.getInstance<ModifyTokenInternalParams, SecurityToken>();
    proc.context = mockContext;

    return expect(
      prepareModifyToken.call(proc, {
        ticker,
        makeDivisible: false,
      })
    ).rejects.toThrow('You can not make the token indivisible');
  });

  test('should add a make divisble transaction to the queue', async () => {
    entityMockUtils.initMocks({ identityOptions: { did: 'someDid' } });

    entityMockUtils.getSecurityTokenDetailsStub().resolves({
      owner: entityMockUtils.getIdentityInstance(),
      isDivisible: false,
    });

    const proc = procedureMockUtils.getInstance<ModifyTokenInternalParams, SecurityToken>();
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
