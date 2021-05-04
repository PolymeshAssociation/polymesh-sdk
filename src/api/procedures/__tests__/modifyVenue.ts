import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareModifyVenue } from '~/api/procedures/modifyVenue';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, VenueType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('modifyVenue procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let venueId: BigNumber;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    venueId = new BigNumber(1);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the supplied description is the same as the current one', () => {
    const description = 'someDetails';

    const args = {
      venueId,
      description,
    };

    entityMockUtils.configureMocks({
      venueOptions: {
        details: {
          description,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyVenue.call(proc, args)).rejects.toThrow(
      'New description is the same as the current one'
    );
  });

  test('should throw an error if the supplied type is the same as the current one', () => {
    const type = VenueType.Exchange;

    const args = {
      venueId,
      type,
    };

    entityMockUtils.configureMocks({
      venueOptions: {
        details: {
          description: 'someDescription',
          type,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyVenue.call(proc, args)).rejects.toThrow(
      'New type is the same as the current one'
    );
  });

  test('should add an update venue transaction to the queue', async () => {
    const description = 'someDetails';
    const type = VenueType.Exchange;

    const rawDetails = dsMockUtils.createMockVenueDetails(description);
    const rawType = dsMockUtils.createMockVenueType(type);
    const rawId = dsMockUtils.createMockU64(venueId.toNumber());

    const args = {
      venueId,
      description,
      type,
    };

    sinon.stub(utilsConversionModule, 'numberToU64').returns(rawId);
    sinon.stub(utilsConversionModule, 'stringToVenueDetails').returns(rawDetails);
    sinon.stub(utilsConversionModule, 'venueTypeToMeshVenueType').returns(rawType);

    const transaction = dsMockUtils.createTxStub('settlement', 'updateVenue');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareModifyVenue.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawId, rawDetails, rawType);

    await prepareModifyVenue.call(proc, {
      venueId,
      type,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawId, null, rawType);

    await prepareModifyVenue.call(proc, {
      venueId,
      description,
    });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawId, rawDetails, null);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        venueId,
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.VenueOwner, venueId }],
        signerPermissions: {
          portfolios: [],
          transactions: [TxTags.settlement.UpdateVenue],
          tokens: [],
        },
      });
    });
  });
});
