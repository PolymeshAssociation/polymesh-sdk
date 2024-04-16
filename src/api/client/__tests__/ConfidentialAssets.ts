import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { when } from 'jest-when';

import { ConfidentialAssets } from '~/api/client/ConfidentialAssets';
import { ConfidentialAsset, Context, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/ConfidentialAsset'
  )
);
jest.mock(
  '~/base/ConfidentialProcedure',
  require('~/testUtils/mocks/procedure').mockConfidentialProcedureModule(
    '~/base/ConfidentialProcedure'
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

  describe('method: createConfidentialAsset', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = {
        ticker: 'FAKE_TICKER',
        data: 'SOME_DATA',
        auditors: ['someAuditorKey'],
        mediators: ['someMediatorDid'],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await confidentialAssets.createConfidentialAsset(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
