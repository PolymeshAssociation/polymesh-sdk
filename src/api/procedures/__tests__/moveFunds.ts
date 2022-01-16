import BigNumber from 'bignumber.js';
import { MovePortfolioItem, PortfolioId as MeshPortfolioId, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareMoveFunds } from '~/api/procedures/moveFunds';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, NumberedPortfolio, SecurityToken } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, PortfolioMovement, RoleType } from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

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
  let assertPortfolioExistsStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToMeshPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioMovementToMovePortfolioItemStub = sinon.stub(
      utilsConversionModule,
      'portfolioMovementToMovePortfolioItem'
    );
    portfolioLikeToPortfolioIdStub = sinon.stub(
      utilsConversionModule,
      'portfolioLikeToPortfolioId'
    );
    assertPortfolioExistsStub = sinon.stub(procedureUtilsModule, 'assertPortfolioExists');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });
    assertPortfolioExistsStub.returns(true);
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

  test('should throw an error if both portfolios do not have the same owner', () => {
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

    portfolioLikeToPortfolioIdStub.withArgs(fromPortfolio).returns({ did: fromDid, number: toId });
    portfolioLikeToPortfolioIdStub.withArgs(toPortfolio).returns({ did: toDid, number: toId });

    return expect(
      prepareMoveFunds.call(proc, {
        from: fromPortfolio,
        to: toPortfolio,
        items: [],
      })
    ).rejects.toThrow('Both portfolios should have the same owner');
  });

  test('should throw an error if both portfolios are the same', () => {
    const id = new BigNumber(1);
    const did = 'someDid';
    const samePortfolio = new NumberedPortfolio({ id, did }, mockContext);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const fakePortfolioId = { did, number: id };

    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio).returns(fakePortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(samePortfolio).returns(fakePortfolioId);

    return expect(
      prepareMoveFunds.call(proc, {
        from: samePortfolio,
        to: samePortfolio,
        items: [],
      })
    ).rejects.toThrow('Origin and destination should be different Portfolios');
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

    portfolioLikeToPortfolioIdStub.withArgs(from).returns({ did: fromDid, number: fromId });
    portfolioLikeToPortfolioIdStub.withArgs(to).returns({ did: toDid, number: toId });

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        tokenBalances: [
          { token: securityToken01, free: new BigNumber(50) },
          { token: securityToken02, free: new BigNumber(10) },
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

    portfolioLikeToPortfolioIdStub.withArgs(from).returns(fromPortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(to).returns(toPortfolioId);

    let rawFromMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(fromId),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(fromPortfolioId, mockContext)
      .returns(rawFromMeshPortfolioId);

    let rawToMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(toId),
      }),
    });
    portfolioIdToMeshPortfolioIdStub
      .withArgs(toPortfolioId, mockContext)
      .returns(rawToMeshPortfolioId);

    const rawMovePortfolioItem = dsMockUtils.createMockMovePortfolioItem({
      ticker: dsMockUtils.createMockTicker(items[0].token),
      amount: dsMockUtils.createMockBalance(items[0].amount),
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

    portfolioLikeToPortfolioIdStub.withArgs(defaultTo).returns(toPortfolioId);

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

    portfolioLikeToPortfolioIdStub.withArgs(defaultFrom).returns(fromPortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(to).returns(toPortfolioId);

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
        User: dsMockUtils.createMockU64(toId),
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

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const fromId = new BigNumber(1);
      const toId = new BigNumber(10);
      const did = 'someDid';
      let from: DefaultPortfolio | NumberedPortfolio = new NumberedPortfolio(
        { id: fromId, did },
        mockContext
      );
      const toPortfolio = new NumberedPortfolio({ did, id: toId }, mockContext);

      let args = {
        from,
      } as Params;

      let portfolioId: PortfolioId = { did, number: fromId };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [from, new DefaultPortfolio({ did }, mockContext)],
          tokens: [],
        },
      });

      from = new DefaultPortfolio({ did }, mockContext);

      args = {
        from,
        to: toId,
      } as Params;

      portfolioId = { did };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [from, toPortfolio],
          tokens: [],
        },
      });

      args = {
        from,
        to: toPortfolio,
      } as Params;

      portfolioId = { did };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [from, toPortfolio],
          tokens: [],
        },
      });
    });
  });
});
