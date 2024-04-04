import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

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
import { PortfolioId, RoleType, TxTags } from '~/types';
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
  let portfolioIdToMeshPortfolioIdSpy: jest.SpyInstance<
    PolymeshPrimitivesIdentityIdPortfolioId,
    [PortfolioId, Context]
  >;
  let portfolioLikeToPortfolioIdSpy: jest.SpyInstance;
  let assertPortfolioExistsSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    portfolioIdToMeshPortfolioIdSpy = jest.spyOn(
      utilsConversionModule,
      'portfolioIdToMeshPortfolioId'
    );
    portfolioLikeToPortfolioIdSpy = jest.spyOn(utilsConversionModule, 'portfolioLikeToPortfolioId');
    assertPortfolioExistsSpy = jest.spyOn(procedureUtilsModule, 'assertPortfolioExists');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });
    assertPortfolioExistsSpy.mockReturnValue(true);
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

  it('should throw an error if the signing Identity is the Portfolio owner', async () => {
    const portfolio = new NumberedPortfolio({ id, did }, mockContext);
    const identity = await mockContext.getSigningIdentity();

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
    expect(portfolio.isOwnedBy).toHaveBeenCalledWith({ identity });
  });

  it('should return a quit portfolio custody transaction spec', async () => {
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

    when(portfolioIdToMeshPortfolioIdSpy)
      .calledWith(portfolioId, mockContext)
      .mockReturnValue(rawMeshPortfolioId);

    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      portfolioId,
    });

    const transaction = dsMockUtils.createTxMock('portfolio', 'quitPortfolioCustody');

    const result = await prepareQuitCustody.call(proc, {
      portfolio,
    });

    expect(result).toEqual({ transaction, args: [rawMeshPortfolioId], resolver: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      let portfolioId: PortfolioId = { did, number: id };

      let proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        portfolioId,
      });
      let boundFunc = getAuthorization.bind(proc);

      let portfolio: DefaultPortfolio | NumberedPortfolio =
        entityMockUtils.getNumberedPortfolioInstance({ id, did });

      let args = {
        portfolio,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.QuitPortfolioCustody],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }), id })],
          assets: [],
        },
      });

      portfolioId = { did };

      proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
        portfolioId,
      });
      boundFunc = getAuthorization.bind(proc);

      portfolio = entityMockUtils.getDefaultPortfolioInstance(portfolioId);

      args = {
        portfolio,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          transactions: [TxTags.portfolio.QuitPortfolioCustody],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }) })],
          assets: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it('should return the portfolio id', async () => {
      const portfolio = new NumberedPortfolio({ id, did }, mockContext);

      const portfolioId: { did: string; number?: BigNumber } = { did, number: id };

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      when(portfolioLikeToPortfolioIdSpy).calledWith(portfolio).mockReturnValue(portfolioId);

      const result = await boundFunc({ portfolio });

      expect(result).toEqual({
        portfolioId,
      });
    });
  });
});
