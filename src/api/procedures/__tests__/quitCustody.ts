import BigNumber from 'bignumber.js';
import { PortfolioId as MeshPortfolioId, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareQuitCustody,
  prepareStorage,
  Storage,
} from '~/api/procedures/quitCustody';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import { PortfolioId } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('quitCustody procedure', () => {
  const id = new BigNumber(1);
  const did = 'someDid';

  let mockContext: Mocked<Context>;
  let portfolioIdToMeshPortfolioIdStub: sinon.SinonStub<[PortfolioId, Context], MeshPortfolioId>;
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

  test('should throw an error if the current Identity is the Portfolio owner', async () => {
    const portfolio = new NumberedPortfolio({ id, did }, mockContext);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId: { did, number: id },
    });

    let error;

    try {
      await prepareQuitCustody.call(proc, {
        portfolio,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The Portfolio owner cannot quit custody');
  });

  test('should add a quit portfolio custody transaction to the queue', async () => {
    const portfolio = entityMockUtils.getNumberedPortfolioInstance({
      id,
      did,
      isOwnedBy: false,
    });

    const rawMeshPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind({
        User: dsMockUtils.createMockU64(id),
      }),
    });

    const portfolioId: { did: string; number?: BigNumber } = { did, number: id };

    portfolioIdToMeshPortfolioIdStub.withArgs(portfolioId, mockContext).returns(rawMeshPortfolioId);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });

    const transaction = dsMockUtils.createTxStub('portfolio', 'quitPortfolioCustody');

    await prepareQuitCustody.call(proc, {
      portfolio,
    });

    const addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, { transaction, args: [rawMeshPortfolioId] });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      let portfolioId: PortfolioId = { did, number: id };

      let proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        portfolioId,
      });
      let boundFunc = getAuthorization.bind(proc);

      let portfolio: DefaultPortfolio | NumberedPortfolio = new NumberedPortfolio(
        { id, did },
        mockContext
      );

      let args = {
        portfolio,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.QuitPortfolioCustody],
          portfolios: [portfolio],
          assets: [],
        },
      });

      portfolioId = { did };

      proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        portfolioId,
      });
      boundFunc = getAuthorization.bind(proc);

      portfolio = new DefaultPortfolio(portfolioId, mockContext);

      args = {
        portfolio,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.QuitPortfolioCustody],
          portfolios: [portfolio],
          assets: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    test('should return the portfolio id', async () => {
      const portfolio = new NumberedPortfolio({ id, did }, mockContext);

      const portfolioId: { did: string; number?: BigNumber } = { did, number: id };

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      portfolioLikeToPortfolioIdStub.withArgs(portfolio).returns(portfolioId);

      const result = await boundFunc({ portfolio });

      expect(result).toEqual({
        portfolioId,
      });
    });
  });
});
