import { ConfidentialAssets } from '~/api/client/ConfidentialAssets';
import { ConfidentialAsset, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);

describe('ConfidentialAssets Class', () => {
  let context: Mocked<Context>;
  let confidentialAssets: ConfidentialAssets;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAssets = new ConfidentialAssets(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: getConfidentialAsset', () => {
    const id = '76702175-d8cb-e3a5-5a19-734433351e25';

    it('should return a specific Confidential Asset if exists', async () => {
      entityMockUtils.configureMocks({
        confidentialAssetOptions: { exists: true },
      });
      const confidentialAsset = await confidentialAssets.getConfidentialAsset({ id });

      expect(confidentialAsset).toBeInstanceOf(ConfidentialAsset);
    });

    it('should throw if the Confidential Asset does not exist', async () => {
      entityMockUtils.configureMocks({
        confidentialAssetOptions: { exists: false },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential Asset does not exists',
        data: { id },
      });

      return expect(confidentialAssets.getConfidentialAsset({ id })).rejects.toThrowError(
        expectedError
      );
    });
  });
});
