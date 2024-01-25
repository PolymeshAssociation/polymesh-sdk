import { u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialVenue, Context, Entity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialTransactionStatus, ErrorCode } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialTransaction',
  require('~/testUtils/mocks/entities').mockConfidentialTransactionModule(
    '~/api/entities/confidential/ConfidentialTransaction'
  )
);

describe('ConfidentialVenue class', () => {
  let context: Mocked<Context>;
  let venue: ConfidentialVenue;

  let id: BigNumber;

  let rawId: u64;
  let bigNumberToU64Spy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    id = new BigNumber(5);
    rawId = dsMockUtils.createMockU64(id);

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    venue = new ConfidentialVenue({ id }, context);

    when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawId);
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

  it('should extend Entity', () => {
    expect(ConfidentialVenue.prototype instanceof Entity).toBe(true);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialVenue.isUniqueIdentifiers({ id: new BigNumber(1) })).toBe(true);
      expect(ConfidentialVenue.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialVenue.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('method: getTransactions', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it("should return the Confidential Venue's pending, executed and rejected transactions", async () => {
      const id1 = new BigNumber(1);
      const id2 = new BigNumber(2);
      const id3 = new BigNumber(3);

      const detailsMock = jest.fn();

      detailsMock
        .mockResolvedValueOnce({
          status: ConfidentialTransactionStatus.Pending,
        })
        .mockResolvedValueOnce({
          status: ConfidentialTransactionStatus.Executed,
        })
        .mockResolvedValue({
          status: ConfidentialTransactionStatus.Rejected,
        });

      entityMockUtils.configureMocks({
        confidentialTransactionOptions: {
          details: detailsMock,
        },
      });

      when(jest.spyOn(utilsConversionModule, 'bigNumberToU64'))
        .calledWith(id, context)
        .mockReturnValue(rawId);

      dsMockUtils.createQueryMock('confidentialAsset', 'venueTransactions', {
        entries: [
          [tuple(rawId, dsMockUtils.createMockCompact(dsMockUtils.createMockU64(id1))), []],
          [tuple(rawId, dsMockUtils.createMockCompact(dsMockUtils.createMockU64(id2))), []],
          [tuple(rawId, dsMockUtils.createMockCompact(dsMockUtils.createMockU64(id3))), []],
        ],
      });

      const result = await venue.getTransactions();

      expect(result.pending[0].id).toEqual(id1);
      expect(result.executed[0].id).toEqual(id2);
      expect(result.rejected[0].id).toEqual(id3);
      expect(result.pending).toHaveLength(1);
      expect(result.executed).toHaveLength(1);
      expect(result.rejected).toHaveLength(1);
    });
  });

  describe('method: exists', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return whether if the venue exists or not', async () => {
      const venueCounterMock = dsMockUtils.createQueryMock('confidentialAsset', 'venueCounter');
      venueCounterMock.mockResolvedValueOnce(dsMockUtils.createMockU64(new BigNumber(6)));

      let result = await venue.exists();

      expect(result).toEqual(true);

      venueCounterMock.mockResolvedValueOnce(dsMockUtils.createMockU64(new BigNumber(3)));

      result = await venue.exists();

      expect(result).toEqual(false);

      const fakeVenue = new ConfidentialVenue({ id: new BigNumber(0) }, context);

      result = await fakeVenue.exists();

      expect(result).toEqual(false);
    });
  });

  describe('method: creator', () => {
    let venueCreatorMock: jest.Mock;

    beforeEach(() => {
      venueCreatorMock = dsMockUtils.createQueryMock('confidentialAsset', 'venueCreator');
      venueCreatorMock.mockResolvedValue(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId('someDid'))
      );
    });

    it('should return the creator of ConfidentialVenue', async () => {
      const result = await venue.creator();

      expect(result).toEqual(expect.objectContaining({ did: 'someDid' }));
    });

    it('should throw an error if no creator exists', async () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Venue does not exists',
      });

      venueCreatorMock.mockResolvedValue(dsMockUtils.createMockOption());

      await expect(venue.creator()).rejects.toThrow(expectedError);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const venueEntity = new ConfidentialVenue({ id: new BigNumber(1) }, context);

      expect(venueEntity.toHuman()).toBe('1');
    });
  });
});
