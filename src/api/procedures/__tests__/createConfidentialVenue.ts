import { ISubmittableResult } from '@polkadot/types/types';
import { PolymeshTx } from '@polymeshassociation/polymesh-sdk/types/internal';
import * as utilsPublicInternalModule from '@polymeshassociation/polymesh-sdk/utils/internal';
import BigNumber from 'bignumber.js';

import {
  createConfidentialVenueResolver,
  getAuthorization,
  prepareCreateConfidentialVenue,
} from '~/api/procedures/createConfidentialVenue';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialVenue, TxTags } from '~/types';

describe('createConfidentialVenue procedure', () => {
  let mockContext: Mocked<Context>;
  let createVenueTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    createVenueTransaction = dsMockUtils.createTxMock('confidentialAsset', 'createVenue');
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

  it('should return a createVenue transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<void, ConfidentialVenue>(mockContext);

    const result = await prepareCreateConfidentialVenue.call(proc);

    expect(result).toEqual({
      transaction: createVenueTransaction,
      resolver: expect.any(Function),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<void, ConfidentialVenue>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [TxTags.confidentialAsset.CreateVenue],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});

describe('createCreateConfidentialVenueResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsPublicInternalModule, 'filterEventRecords');
  const id = new BigNumber(10);
  const rawId = dsMockUtils.createMockU64(id);

  beforeAll(() => {
    entityMockUtils.initMocks({
      confidentialVenueOptions: {
        id,
      },
    });
  });

  beforeEach(() => {
    filterEventRecordsSpy.mockReturnValue([dsMockUtils.createMockIEvent(['did', rawId])]);
  });

  afterEach(() => {
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Confidential Venue', () => {
    const fakeContext = {} as Context;

    const result = createConfidentialVenueResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
