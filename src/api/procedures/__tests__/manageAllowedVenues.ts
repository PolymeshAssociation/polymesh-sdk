import {
  getAuthorization,
  manageAllowedVenues,
  Params,
  prepareManageAllowedVenues,
} from '~/api/procedures/manageAllowedVenues';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';

describe('manageAllowedVenues procedure', () => {
  let mockContext: Mocked<Context>;
  const ticker = 'TICKER';

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
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

  describe('manageAllowedVenues', () => {
    it('the procedure method should be defined', () => {
      expect(manageAllowedVenues).toBeDefined();
    });

    it('calling it should return a new procedure', () => {
      const boundFunc = manageAllowedVenues.bind(mockContext);

      expect(boundFunc).not.toThrow();
      expect(procedureMockUtils.getInstance<Params, void>(mockContext)).toBeDefined();
    });
  });

  describe('prepareManageAllowedVenues', () => {
    it('should return a allow venues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'allowVenues');

      const result = await prepareManageAllowedVenues.call(proc, {
        ticker,
        venues: [1],
        action: 'allow',
      });

      expect(result).toEqual({
        transaction,
        args: [ticker, [1]],
        resolver: undefined,
      });
    });

    it('should return a disallow venues transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const transaction = dsMockUtils.createTxMock('settlement', 'disallowVenues');

      const result = await prepareManageAllowedVenues.call(proc, {
        ticker,
        venues: [1],
        action: 'disallow',
      });

      expect(result).toEqual({
        transaction,
        args: [ticker, [1]],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        venues: [1],
        action: 'allow',
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.settlement.AllowVenues],
          assets: [expect.objectContaining({ ticker })],
        },
      });
    });
  });
});
