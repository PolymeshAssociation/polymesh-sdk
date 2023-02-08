import BigNumber from 'bignumber.js';

import { getAuthorization, Params, prepareModifyVenue } from '~/api/procedures/modifyVenue';
import { Context, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags, VenueType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('modifyVenue procedure', () => {
  let mockContext: Mocked<Context>;
  let venueId: BigNumber;

  let venue: Venue;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    venueId = new BigNumber(1);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();

    venue = entityMockUtils.getVenueInstance({ id: venueId });
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

  it('should throw an error if the supplied description is the same as the current one', () => {
    const description = 'someDetails';

    const args = {
      venue: entityMockUtils.getVenueInstance({
        details: {
          description,
        },
      }),
      description,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyVenue.call(proc, args)).rejects.toThrow(
      'New description is the same as the current one'
    );
  });

  it('should throw an error if the supplied type is the same as the current one', () => {
    const type = VenueType.Exchange;

    const args = {
      venue: entityMockUtils.getVenueInstance({
        details: {
          description: 'someDescription',
          type,
        },
      }),
      type,
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyVenue.call(proc, args)).rejects.toThrow(
      'New type is the same as the current one'
    );
  });

  it('should add an update venue transaction to the batch', async () => {
    const description = 'someDetails';
    const type = VenueType.Exchange;

    const rawDetails = dsMockUtils.createMockBytes(description);
    const rawType = dsMockUtils.createMockVenueType(type);
    const rawId = dsMockUtils.createMockU64(venueId);

    const args = {
      venue,
      description,
      type,
    };

    jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockReturnValue(rawId);
    jest.spyOn(utilsConversionModule, 'stringToBytes').mockReturnValue(rawDetails);
    jest.spyOn(utilsConversionModule, 'venueTypeToMeshVenueType').mockReturnValue(rawType);

    const updateVenueDetailsTransaction = dsMockUtils.createTxMock(
      'settlement',
      'updateVenueDetails'
    );
    const updateVenueTypeTransaction = dsMockUtils.createTxMock('settlement', 'updateVenueType');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareModifyVenue.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: updateVenueDetailsTransaction,
          args: [rawId, rawDetails],
        },
        {
          transaction: updateVenueTypeTransaction,
          args: [rawId, rawType],
        },
      ],
      resolver: undefined,
    });

    result = await prepareModifyVenue.call(proc, {
      venue,
      type,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: updateVenueTypeTransaction,
          args: [rawId, rawType],
        },
      ],
      resolver: undefined,
    });

    result = await prepareModifyVenue.call(proc, {
      venue,
      description,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: updateVenueDetailsTransaction,
          args: [rawId, rawDetails],
        },
      ],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      let args = {
        venue,
        type: VenueType.Distribution,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          portfolios: [],
          transactions: [TxTags.settlement.UpdateVenueType],
          assets: [],
        },
      });

      args = {
        venue,
        description: 'someDescription',
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          portfolios: [],
          transactions: [TxTags.settlement.UpdateVenueDetails],
          assets: [],
        },
      });
    });
  });
});
