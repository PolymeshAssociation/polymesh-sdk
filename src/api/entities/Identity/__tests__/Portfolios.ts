import { StorageKey, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  Context,
  DefaultPortfolio,
  Identity,
  Namespace,
  NumberedPortfolio,
  PolymeshTransaction,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { Portfolios } from '../Portfolios';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Portfolios class', () => {
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const numberedPortfolioId = new BigNumber(1);
  const rawNumberedPortfolioId = dsMockUtils.createMockU64(numberedPortfolioId);
  let mockContext: Mocked<Context>;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let u64ToBigNumberSpy: jest.SpyInstance<BigNumber, [u64]>;
  let portfolios: Portfolios;
  let identity: Identity;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    identity = new Identity({ did }, mockContext);
    portfolios = new Portfolios(identity, mockContext);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Portfolios.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getPortfolios', () => {
    it('should retrieve all the portfolios for the Identity', async () => {
      dsMockUtils.createQueryMock('portfolio', 'portfolios', {
        entries: [
          tuple(
            [dsMockUtils.createMockIdentityId(did), rawNumberedPortfolioId],
            dsMockUtils.createMockBytes()
          ),
        ],
      });

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);
      u64ToBigNumberSpy.mockReturnValue(numberedPortfolioId);

      const result = await portfolios.getPortfolios();
      expect(result).toHaveLength(2);
      expect(result[0] instanceof DefaultPortfolio).toBe(true);
      expect(result[1] instanceof NumberedPortfolio).toBe(true);
      expect(result[0].owner.did).toEqual(did);
      expect(result[1].id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getCustodiedPortfolios', () => {
    it('should retrieve all the Portfolios custodied by the Identity', async () => {
      dsMockUtils.createQueryMock('portfolio', 'portfoliosInCustody');

      const entries = [
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind('Default'),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
        tuple(
          {
            args: [
              rawIdentityId,
              dsMockUtils.createMockPortfolioId({
                did: rawIdentityId,
                kind: dsMockUtils.createMockPortfolioKind({ User: rawNumberedPortfolioId }),
              }),
            ],
          } as unknown as StorageKey,
          dsMockUtils.createMockBool(true)
        ),
      ];

      jest
        .spyOn(utilsInternalModule, 'requestPaginated')
        .mockResolvedValue({ entries, lastKey: null });

      when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawIdentityId);
      u64ToBigNumberSpy.mockReturnValue(numberedPortfolioId);

      const { data } = await portfolios.getCustodiedPortfolios();
      expect(data).toHaveLength(2);
      expect(data[0] instanceof DefaultPortfolio).toBe(true);
      expect(data[1] instanceof NumberedPortfolio).toBe(true);
      expect(data[0].owner.did).toEqual(did);
      expect((data[1] as NumberedPortfolio).id).toEqual(numberedPortfolioId);
    });
  });

  describe('method: getPortfolio', () => {
    it('should return the default portfolio for the signing Identity', async () => {
      const result = await portfolios.getPortfolio();
      expect(result instanceof DefaultPortfolio).toBe(true);
      expect(result.owner.did).toEqual(did);
    });

    it('should return a numbered portfolio', async () => {
      const portfolioId = new BigNumber(1);

      const result = await portfolios.getPortfolio({ portfolioId });

      expect(result instanceof NumberedPortfolio).toBe(true);
      expect(result.id).toEqual(portfolioId);
    });

    it("should throw an error if a numbered portfolio doesn't exist", () => {
      const portfolioId = new BigNumber(1);

      entityMockUtils.configureMocks({
        numberedPortfolioOptions: {
          exists: false,
        },
      });

      return expect(portfolios.getPortfolio({ portfolioId })).rejects.toThrow(
        "The Portfolio doesn't exist"
      );
    });
  });

  describe('method: delete', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const portfolioId = new BigNumber(5);
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { id: portfolioId, did }, transformer: undefined }, mockContext, {})
        .mockResolvedValue(expectedTransaction);

      let tx = await portfolios.delete({ portfolio: portfolioId });

      expect(tx).toBe(expectedTransaction);

      tx = await portfolios.delete({
        portfolio: new NumberedPortfolio({ id: portfolioId, did }, mockContext),
      });

      expect(tx).toBe(expectedTransaction);
    });
  });
});
