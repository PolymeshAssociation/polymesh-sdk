import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';

describe('BaseAsset class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: exists', () => {
    it('should return whether the BaseAsset exists', async () => {
      const ticker = 'TICKER';
      const context = dsMockUtils.getContextInstance();
      const asset = new BaseAsset({ ticker }, context);

      dsMockUtils.createQueryMock('asset', 'tokens', {
        size: new BigNumber(10),
      });

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      let result = await asset.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(2)),
      });

      result = await asset.exists();

      expect(result).toBe(false);

      dsMockUtils.createQueryMock('asset', 'tokens', {
        size: new BigNumber(0),
      });

      dsMockUtils.createQueryMock('nft', 'collectionTicker', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(0)),
      });

      result = await asset.exists();

      expect(result).toBe(false);
    });
  });
});
