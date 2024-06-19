import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareUpdateVenueSigners,
} from '~/api/procedures/updateVenueSigners';
import { Context, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('updateVenueSigners procedure', () => {
  let mockContext: Mocked<Context>;
  let venueId: BigNumber;

  let venue: Venue;

  let maxVenueSigners: BigNumber;

  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    venueId = new BigNumber(1);
    maxVenueSigners = new BigNumber(2);
  });

  beforeEach(() => {
    entityMockUtils.configureMocks();
    mockContext = dsMockUtils.getContextInstance();

    const rawMaxVenueSigners = dsMockUtils.createMockU32(maxVenueSigners);

    dsMockUtils.setConstMock('settlement', 'maxNumberOfVenueSigners', {
      returnValue: rawMaxVenueSigners,
    });

    venue = entityMockUtils.getVenueInstance({
      id: venueId,
      getAllowedSigners: [entityMockUtils.getAccountInstance({ address: 'existingSigner' })],
    });

    args = {
      venue,
      signers: ['newSigner'],
      addSigners: true,
    };
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

  it('should throw an error if one or more supplied signers are already added to the Venue', () => {
    const signers = ['existingSigner', 'newSigner'];

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareUpdateVenueSigners.call(proc, { ...args, signers })).rejects.toThrow(
      'One or more of the supplied signers are already added to the Venue'
    );
  });

  it('should throw an error if maximum venue signers gets exceeded', () => {
    const signers = ['newSigner', 'newSigner2'];

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareUpdateVenueSigners.call(proc, {
        ...args,
        signers,
      })
    ).rejects.toThrow('Maximum number of venue signers exceeded');
  });

  it('should throw an error if one or more supplied signers are not added to the Venue', () => {
    const signers = ['existingSigner', 'nonExistingSigner'];

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareUpdateVenueSigners.call(proc, {
        ...args,
        signers,
        addSigners: false,
      })
    ).rejects.toThrow('One or more of the supplied signers are not added to the Venue');
  });

  it('should return a updateVenueSigners transaction spec', async () => {
    const rawId = dsMockUtils.createMockU64(venueId);
    const rawAddSigners = dsMockUtils.createMockBool(args.addSigners);
    const rawSigner = dsMockUtils.createMockAccountId(args.signers[0] as string);

    jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockReturnValue(rawId);
    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawSigner);
    jest.spyOn(utilsConversionModule, 'booleanToBool').mockReturnValue(rawAddSigners);

    const updateVenueSignersTransaction = dsMockUtils.createTxMock(
      'settlement',
      'updateVenueSigners'
    );

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareUpdateVenueSigners.call(proc, args);

    expect(result).toEqual({
      transaction: updateVenueSignersTransaction,
      args: [rawId, [rawSigner], rawAddSigners],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.VenueOwner, venueId }],
        permissions: {
          portfolios: [],
          transactions: [TxTags.settlement.UpdateVenueSigners],
          assets: [],
        },
      });
    });
  });
});
