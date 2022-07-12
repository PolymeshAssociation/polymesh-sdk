import BigNumber from 'bignumber.js';
import sinon from 'sinon';

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
  let addBatchTransactionStub: sinon.SinonStub;
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
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();

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

  it('should add an update venue transaction to the queue', async () => {
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

    sinon.stub(utilsConversionModule, 'bigNumberToU64').returns(rawId);
    sinon.stub(utilsConversionModule, 'stringToBytes').returns(rawDetails);
    sinon.stub(utilsConversionModule, 'venueTypeToMeshVenueType').returns(rawType);

    const updateVenueDetailsTransaction = dsMockUtils.createTxStub(
      'settlement',
      'updateVenueDetails'
    );
    const updateVenueTypeTransaction = dsMockUtils.createTxStub('settlement', 'updateVenueType');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareModifyVenue.call(proc, args);

    sinon.assert.calledWith(addBatchTransactionStub.firstCall, {
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
    });

    await prepareModifyVenue.call(proc, {
      venue,
      type,
    });

    sinon.assert.calledWith(addBatchTransactionStub.secondCall, {
      transactions: [
        {
          transaction: updateVenueTypeTransaction,
          args: [rawId, rawType],
        },
      ],
    });

    await prepareModifyVenue.call(proc, {
      venue,
      description,
    });

    sinon.assert.calledWith(addBatchTransactionStub.thirdCall, {
      transactions: [
        {
          transaction: updateVenueDetailsTransaction,
          args: [rawId, rawDetails],
        },
      ],
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
