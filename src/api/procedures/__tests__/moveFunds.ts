import BigNumber from 'bignumber.js';
import { MovePortfolioItem, PortfolioId as MeshPortfolioId } from 'polymesh-types/types';
import sinon from 'sinon';

import { DefaultPortfolio, NumberedPortfolio, SecurityToken } from '~/api/entities';
import { Params, prepareMoveFunds } from '~/api/procedures/moveFunds';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, PortfolioItem } from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsModule from '~/utils';

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

describe('moveFunds procedure', () => {
  let mockContext: Mocked<Context>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
  let portfolioItemToMovePortfolioItemStub: sinon.SinonStub<
    [PortfolioItem, Context],
    MovePortfolioItem
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToMeshPortfolioIdStub = sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    portfolioItemToMovePortfolioItemStub = sinon.stub(
      utilsModule,
      'portfolioItemToMovePortfolioItem'
    );
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwned: true,
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

  test('should throw an error if both portfolios are the same', async () => {
    const id = new BigNumber(1);
    const did = 'someDid';
    const samePortfolio = new NumberedPortfolio({ id, did }, mockContext);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareMoveFunds.call(proc, {
        from: samePortfolio,
        to: samePortfolio,
        items: [],
      })
    ).rejects.toThrow('You cannot move tokens to the same portfolio of origin');
  });

  test('should throw an error if the Identity is not the owner of both Portfolios', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const did = 'someDid';
    const from = new NumberedPortfolio({ id: fromId, did }, mockContext);
    const to = new NumberedPortfolio({ id: toId, did }, mockContext);

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwned: false,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareMoveFunds.call(proc, {
        from,
        to,
        items: [],
      })
    ).rejects.toThrow('You are not the owner of these Portfolios');
  });

  test('should throw an error if some of the amount token to move exceed its balance', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const fromDid = 'someDid';
    const toDid = 'otherDid';
    const from = new NumberedPortfolio({ id: fromId, did: fromDid }, mockContext);
    const to = new NumberedPortfolio({ id: toId, did: toDid }, mockContext);
    const securityToken01 = new SecurityToken({ ticker: 'TICKER001' }, mockContext);
    const securityToken02 = new SecurityToken({ ticker: 'TICKER002' }, mockContext);
    const items: PortfolioItem[] = [
      {
        token: securityToken01.ticker,
        amount: new BigNumber(100),
      },
      {
        token: securityToken02,
        amount: new BigNumber(20),
      },
    ];

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        tokenBalances: [
          { token: securityToken01, total: new BigNumber(50) },
          { token: securityToken02, total: new BigNumber(10) },
        ] as PortfolioBalance[],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareMoveFunds.call(proc, {
        from,
        to,
        items,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the token amount exceed the actual balance');
    expect(error.data.balanceExceeded).toMatchObject(items);
  });

  test('should add a move portfolio funds transaction to the queue', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const did = 'someDid';
    const from = new NumberedPortfolio({ id: fromId, did }, mockContext);
    const to = new NumberedPortfolio({ id: toId, did }, mockContext);
    const securityToken = new SecurityToken({ ticker: 'TICKER001' }, mockContext);
    const items = [
      {
        token: securityToken.ticker,
        amount: new BigNumber(100),
      },
    ];

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        did,
        tokenBalances: [{ token: securityToken, total: new BigNumber(150) }] as PortfolioBalance[],
      },
      defaultPortfolioOptions: {
        did,
        tokenBalances: [{ token: securityToken, total: new BigNumber(150) }] as PortfolioBalance[],
      },
    });

    let rawFromMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(fromId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs({ did, number: fromId }, mockContext)
      .returns(rawFromMeshPortfolioId);

    let rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(toId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs({ did, number: toId }, mockContext)
      .returns(rawToMeshPortfolioId);

    const rawMovePortfolioItem = dsMockUtils.createMockMovePortfolioItem({
      ticker: dsMockUtils.createMockTicker(items[0].token),
      amount: dsMockUtils.createMockBalance(items[0].amount.toNumber()),
    });
    portfolioItemToMovePortfolioItemStub
      .withArgs(items[0], mockContext)
      .returns(rawMovePortfolioItem);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('portfolio', 'movePortfolioFunds');

    await prepareMoveFunds.call(proc, {
      from,
      to,
      items,
    });

    let addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawFromMeshPortfolioId,
      rawToMeshPortfolioId,
      [rawMovePortfolioItem]
    );

    const defaultTo = new DefaultPortfolio({ did }, mockContext);

    rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    portfolioIdToMeshPortfolioIdStub.withArgs({ did }, mockContext).returns(rawToMeshPortfolioId);

    await prepareMoveFunds.call(proc, {
      from,
      to: defaultTo,
      items,
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawFromMeshPortfolioId,
      rawToMeshPortfolioId,
      [rawMovePortfolioItem]
    );

    const defaultFrom = new DefaultPortfolio({ did }, mockContext);

    rawFromMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    portfolioIdToMeshPortfolioIdStub.withArgs({ did }, mockContext).returns(rawFromMeshPortfolioId);

    rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(toId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs({ did, number: toId }, mockContext)
      .returns(rawToMeshPortfolioId);

    await prepareMoveFunds.call(proc, {
      from: defaultFrom,
      to,
      items,
    });

    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      {},
      rawFromMeshPortfolioId,
      rawToMeshPortfolioId,
      [rawMovePortfolioItem]
    );
  });
});
