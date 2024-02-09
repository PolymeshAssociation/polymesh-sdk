import BigNumber from 'bignumber.js';

import { BaseAsset } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockBTreeSet, MockContext } from '~/testUtils/mocks/dataSources';

describe('BaseAsset class', () => {
  let ticker: string;
  let context: MockContext;
  let mediatorDid: string;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    ticker = 'TICKER';

    mediatorDid = 'someDid';

    dsMockUtils.createQueryMock('asset', 'mandatoryMediators', {
      returnValue: createMockBTreeSet([dsMockUtils.createMockIdentityId(mediatorDid)]),
    });
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
