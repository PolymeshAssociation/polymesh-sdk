import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  DeletePortfolioParams,
  getAuthorization,
  prepareDeletePortfolio,
} from '~/api/procedures/deletePortfolio';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PortfolioBalance, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
  const portfolioNumber = dsMockUtils.createMockU64(id);
  const zeroBalance = { total: new BigNumber(0) } as PortfolioBalance;
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToIdentityIdStub.withArgs(did, mockContext).returns(identityId);
    bigNumberToU64Stub.withArgs(id, mockContext).returns(portfolioNumber);
    dsMockUtils
      .createQueryStub('portfolio', 'portfolios')
      .returns(dsMockUtils.createMockBytes('someName'));
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
        getAssetBalances: [zeroBalance, zeroBalance],
      },
    });
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

  it('should throw an error if the Portfolio has balance in it', () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getAssetBalances: [
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
    ).rejects.toThrow('Only empty Portfolios can be deleted');
  });

  it('should throw an error if the Portfolio has balance in it', () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        exists: false,
      },
    });

    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    return expect(
      prepareDeletePortfolio.call(proc, {
        id,
        did,
      })
    ).rejects.toThrow("The Portfolio doesn't exist");
  });

  it('should return a delete portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('portfolio', 'deletePortfolio');

    let result = await prepareDeletePortfolio.call(proc, {
      id,
      did,
    });

    expect(result).toEqual({ transaction, args: [portfolioNumber] });

    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        getAssetBalances: [],
      },
    });

    result = await prepareDeletePortfolio.call(proc, {
      id,
      did,
    });

    expect(result).toEqual({ transaction, args: [portfolioNumber] });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<DeletePortfolioParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        id: new BigNumber(1),
        did: 'someDid',
      };

      const portfolioId = { did: args.did, number: args.id };
      const portfolio = entityMockUtils.getNumberedPortfolioInstance(args);

      sinon
        .stub(utilsConversionModule, 'portfolioLikeToPortfolio')
        .withArgs({ identity: args.did, id: args.id }, mockContext)
        .returns(portfolio);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
        permissions: {
          assets: [],
          portfolios: [portfolio],
          transactions: [TxTags.portfolio.DeletePortfolio],
        },
      });
    });
  });
});
