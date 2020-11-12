import BigNumber from 'bignumber.js';
import { MovePortfolioItem, PortfolioId as MeshPortfolioId } from 'polymesh-types/types';
import sinon from 'sinon';

import { DefaultPortfolio, NumberedPortfolio, SecurityToken } from '~/api/entities';
import { Params, prepareMoveFunds } from '~/api/procedures/moveFunds';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, PortfolioMovement } from '~/types';
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
  let portfolioMovementToMovePortfolioItemStub: sinon.SinonStub<
    [PortfolioMovement, Context],
    MovePortfolioItem
  >;
  let portfolioLikeToPortfolioIdStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToMeshPortfolioIdStub = sinon.stub(utilsModule, 'portfolioIdToMeshPortfolioId');
    portfolioMovementToMovePortfolioItemStub = sinon.stub(
      utilsModule,
      'portfolioMovementToMovePortfolioItem'
    );
    portfolioLikeToPortfolioIdStub = sinon.stub(utilsModule, 'portfolioLikeToPortfolioId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
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

  test('should throw an error if both portfolios do not have the same owner', async () => {
    const fromId = new BigNumber(1);
    const fromDid = 'someDid';
    const toId = new BigNumber(2);
    const toDid = 'otherDid';
    const fromPortfolio = new NumberedPortfolio({ id: fromId, did: fromDid }, mockContext);
    const toPortfolio = entityMockUtils.getNumberedPortfolioInstance({
      id: toId,
      did: toDid,
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    portfolioLikeToPortfolioIdStub
      .withArgs(fromPortfolio, mockContext)
      .resolves({ did: fromDid, number: toId });
    portfolioLikeToPortfolioIdStub
      .withArgs(toPortfolio, mockContext)
      .resolves({ did: fromDid, number: toId });

    return expect(
      prepareMoveFunds.call(proc, {
        from: fromPortfolio,
        to: toPortfolio,
        items: [],
      })
    ).rejects.toThrow('Both portfolios should have the same owner');
  });

  test('should throw an error if current identity is not the owner of the origin portfolio', async () => {
    const id = new BigNumber(1);
    const did = 'otherDid';
    const samePortfolio = entityMockUtils.getNumberedPortfolioInstance({
      id,
      did,
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const fakePortfolioId = { did, number: id };

    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio, mockContext).resolves(fakePortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio, mockContext).resolves(fakePortfolioId);

    return expect(
      prepareMoveFunds.call(proc, {
        from: samePortfolio,
        to: samePortfolio,
        items: [],
      })
    ).rejects.toThrow('The current identity should be the owner of the origin portfolio');
  });

  test('should throw an error if both portfolios are the same', async () => {
    const id = new BigNumber(1);
    const did = 'someDid';
    const samePortfolio = new NumberedPortfolio({ id, did }, mockContext);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const fakePortfolioId = { did, number: id };

    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio, mockContext).resolves(fakePortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio, mockContext).resolves(fakePortfolioId);

    return expect(
      prepareMoveFunds.call(proc, {
        from: samePortfolio,
        to: samePortfolio,
        items: [],
      })
    ).rejects.toThrow('Origin and destination should be different Portfolios');
  });

  test('should throw an error if the Identity is not the owner of both Portfolios', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const did = 'someDid';
    const from = new NumberedPortfolio({ id: fromId, did }, mockContext);
    const to = new NumberedPortfolio({ id: toId, did }, mockContext);

    portfolioLikeToPortfolioIdStub.withArgs(from, mockContext).resolves({ did, number: fromId });
    portfolioLikeToPortfolioIdStub.withArgs(to, mockContext).resolves({ did, number: toId });

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: false,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareMoveFunds.call(proc, {
        from,
        to,
        items: [],
      })
    ).rejects.toThrow('You must be the owner of both Portfolios');
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
    const items: PortfolioMovement[] = [
      {
        token: securityToken01.ticker,
        amount: new BigNumber(100),
      },
      {
        token: securityToken02,
        amount: new BigNumber(20),
      },
    ];

    portfolioLikeToPortfolioIdStub
      .withArgs(from, mockContext)
      .resolves({ did: fromDid, number: fromId });
    portfolioLikeToPortfolioIdStub.withArgs(to, mockContext).resolves({ did: toDid, number: toId });

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        tokenBalances: [
          { token: securityToken01, total: new BigNumber(50), locked: new BigNumber(0) },
          { token: securityToken02, total: new BigNumber(10), locked: new BigNumber(0) },
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

    expect(error.message).toBe(
      "Some of the amounts being transferred exceed the Portfolio's balance"
    );
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

    let fromPortfolioId: { did: string; number?: BigNumber } = { did, number: fromId };
    let toPortfolioId: { did: string; number?: BigNumber } = { did, number: toId };

    portfolioLikeToPortfolioIdStub.withArgs(from, mockContext).resolves(fromPortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(to, mockContext).resolves(toPortfolioId);

    let rawFromMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(fromId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(fromPortfolioId, mockContext)
      .returns(rawFromMeshPortfolioId);

    let rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(toId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(toPortfolioId, mockContext)
      .returns(rawToMeshPortfolioId);

    const rawMovePortfolioItem = dsMockUtils.createMockMovePortfolioItem({
      ticker: dsMockUtils.createMockTicker(items[0].token),
      amount: dsMockUtils.createMockBalance(items[0].amount.toNumber()),
    });
    portfolioMovementToMovePortfolioItemStub
      .withArgs(items[0], mockContext)
      .returns(rawMovePortfolioItem);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('portfolio', 'movePortfolioFunds');

    await prepareMoveFunds.call(proc, {
      from,
      to: toId,
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

    toPortfolioId = { did };

    portfolioLikeToPortfolioIdStub.withArgs(defaultTo, mockContext).resolves(toPortfolioId);

    rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(toPortfolioId, mockContext)
      .returns(rawToMeshPortfolioId);

    await prepareMoveFunds.call(proc, {
      from,
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

    fromPortfolioId = { did };
    toPortfolioId = { did, number: toId };

    portfolioLikeToPortfolioIdStub.withArgs(defaultFrom, mockContext).resolves(fromPortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(to, mockContext).resolves(toPortfolioId);

    rawFromMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(fromPortfolioId, mockContext)
      .returns(rawFromMeshPortfolioId);

    rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(toId.toNumber()),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(toPortfolioId, mockContext)
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
