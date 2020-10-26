import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import { DeletePortfolioParams, prepareDeletePortfolio } from '~/api/procedures/deletePortfolio';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('deletePortfolio procedure', () => {
  const id = new BigNumber(1);
  const did = 'someDid';
  const identityId = dsMockUtils.createMockIdentityId(did);
  const portfolioNumber = dsMockUtils.createMockU64(id.toNumber());
  const zeroBalance = { total: new BigNumber(0) } as PortfolioBalance;
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToIdentityIdStub.withArgs(did, mockContext).returns(identityId);
    numberToU64Stub.withArgs(id, mockContext).returns(portfolioNumber);
    dsMockUtils
      .createQueryStub('portfolio', 'portfolios')
      .returns(dsMockUtils.createMockBytes('someName'));
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwned: true,
        tokenBalances: [zeroBalance, zeroBalance],
      },
    });
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

  test('should throw an error if the portfolio does not exist', async () => {
    dsMockUtils.createQueryStub('portfolio', 'portfolios').returns(dsMockUtils.createMockBytes());

    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    return expect(
      prepareDeletePortfolio.call(proc, {
        id,
        did,
      })
    ).rejects.toThrow("The Portfolio doesn't exist");
  });

  test('should throw an error if the Identity is not the owner of the Portfolio', async () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwned: false,
      },
    });

    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    return expect(
      prepareDeletePortfolio.call(proc, {
        id,
        did,
      })
    ).rejects.toThrow('You are not the owner of this Portfolio');
  });

  test('should throw an error if the portfolio has balance in it', async () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        tokenBalances: [
          { total: new BigNumber(1) },
          { total: new BigNumber(0) },
        ] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    return expect(
      prepareDeletePortfolio.call(proc, {
        id,
        did,
      })
    ).rejects.toThrow('You cannot delete a Portfolio that contains any assets');
  });

  test('should add a delete portfolio transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('portfolio', 'deletePortfolio');

    await prepareDeletePortfolio.call(proc, {
      id,
      did,
    });

    let addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, transaction, {}, portfolioNumber);

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        tokenBalances: [],
      },
    });

    await prepareDeletePortfolio.call(proc, {
      id,
      did,
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, transaction, {}, portfolioNumber);
  });
});
