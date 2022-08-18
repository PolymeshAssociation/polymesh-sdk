import BigNumber from 'bignumber.js';
import { MovePortfolioItem, PortfolioId as MeshPortfolioId } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareMoveFunds } from '~/api/procedures/moveFunds';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, PortfolioId, PortfolioMovement, RoleType, TxTags } from '~/types';
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
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if both portfolios do not have the same owner', () => {
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

  it('should throw an error if both portfolios are the same', () => {
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

  it('should throw an error if some of the amount Asset to move exceeds its balance', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const did = 'someDid';
    const asset1 = entityMockUtils.getAssetInstance({ ticker: 'TICKER001' });
    const asset2 = entityMockUtils.getAssetInstance({ ticker: 'TICKER002' });
    const items: PortfolioMovement[] = [
      {
        asset: asset1.ticker,
        amount: new BigNumber(100),
      },
      {
        asset: asset2,
        amount: new BigNumber(20),
      },
    ];

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getAssetBalances: [
          { asset: asset1, free: new BigNumber(50) },
          { asset: asset2, free: new BigNumber(10) },
        ] as unknown as PortfolioBalance[],
      },
    });

    const from = entityMockUtils.getNumberedPortfolioInstance({ id: fromId, did });
    const to = entityMockUtils.getNumberedPortfolioInstance({ id: toId, did });

    portfolioLikeToPortfolioIdStub.withArgs(from).returns({ did, number: fromId });
    portfolioLikeToPortfolioIdStub.withArgs(to).returns({ did, number: toId });

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

  it('should add a move portfolio funds transaction to the queue', async () => {
    const fromId = new BigNumber(1);
    const toId = new BigNumber(2);
    const did = 'someDid';
    const asset = entityMockUtils.getAssetInstance({ ticker: 'TICKER001' });
    const items = [
      {
        asset: asset.ticker,
        amount: new BigNumber(100),
      },
    ];

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        did,
        getAssetBalances: [{ asset, total: new BigNumber(150) }] as unknown as PortfolioBalance[],
      },
      defaultPortfolioOptions: {
        did,
        getAssetBalances: [{ asset, total: new BigNumber(150) }] as unknown as PortfolioBalance[],
      },
    });

    const from = entityMockUtils.getNumberedPortfolioInstance({ id: fromId, did });
    const to = entityMockUtils.getNumberedPortfolioInstance({ id: toId, did });

    let fromPortfolioId: { did: string; number?: BigNumber } = { did, number: fromId };
    let toPortfolioId: { did: string; number?: BigNumber } = { did, number: toId };

    portfolioLikeToPortfolioIdStub.withArgs(from).returns(fromPortfolioId);
    portfolioLikeToPortfolioIdStub.withArgs(to).returns(toPortfolioId);
    portfolioLikeToPortfolioIdStub
      .withArgs(sinon.match({ owner: sinon.match({ did }), id: toId }))
      .returns(toPortfolioId);

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
      ticker: dsMockUtils.createMockTicker(items[0].asset),
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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawFromMeshPortfolioId, rawToMeshPortfolioId, [rawMovePortfolioItem]],
    });

    toPortfolioId = { did };

    portfolioLikeToPortfolioIdStub
      .withArgs(sinon.match({ owner: sinon.match({ did }), id: undefined }))
      .returns(toPortfolioId);

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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawFromMeshPortfolioId, rawToMeshPortfolioId, [rawMovePortfolioItem]],
    });

    const defaultFrom = entityMockUtils.getDefaultPortfolioInstance({ did });

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

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawFromMeshPortfolioId, rawToMeshPortfolioId, [rawMovePortfolioItem]],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const fromId = new BigNumber(1);
      const toId = new BigNumber(10);
      const did = 'someDid';
      let from: DefaultPortfolio | NumberedPortfolio = entityMockUtils.getNumberedPortfolioInstance(
        { did, id: fromId }
      );
      const to = entityMockUtils.getNumberedPortfolioInstance({ did, id: toId });

      let args = {
        from,
      } as unknown as Params;

      let portfolioId: PortfolioId = { did, number: fromId };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did }), id: fromId }),
            expect.objectContaining({ owner: expect.objectContaining({ did }) }),
          ],
          assets: [],
        },
      });

      from = entityMockUtils.getDefaultPortfolioInstance({ did });

      args = {
        from,
        to: toId,
      } as unknown as Params;

      portfolioId = { did };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did }) }),
            expect.objectContaining({ owner: expect.objectContaining({ did }), id: toId }),
          ],
          assets: [],
        },
      });

      args = {
        from,
        to,
      } as unknown as Params;

      portfolioId = { did };

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.MovePortfolioFunds],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did }) }),
            expect.objectContaining({ owner: expect.objectContaining({ did }), id: toId }),
          ],
          assets: [],
        },
      });
    });
  });
});
