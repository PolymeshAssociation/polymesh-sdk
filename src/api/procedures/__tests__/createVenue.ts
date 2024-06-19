import { Bytes } from '@polkadot/types';
import { PolymeshPrimitivesSettlementVenueType } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { createCreateVenueResolver, prepareCreateVenue } from '~/api/procedures/createVenue';
import { Context, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateVenueParams, VenueType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('createVenue procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToBytes: jest.SpyInstance<Bytes, [string, Context]>;
  let venueTypeToMeshVenueTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesSettlementVenueType,
    [VenueType, Context]
  >;
  let createVenueTransaction: PolymeshTx<unknown[]>;
  let description: string;
  let type: VenueType;
  let args: CreateVenueParams;

  let rawDetails: Bytes;
  let rawType: PolymeshPrimitivesSettlementVenueType;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();

    stringToBytes = jest.spyOn(utilsConversionModule, 'stringToBytes');
    venueTypeToMeshVenueTypeSpy = jest.spyOn(utilsConversionModule, 'venueTypeToMeshVenueType');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    description = 'description';
    type = VenueType.Distribution;

    createVenueTransaction = dsMockUtils.createTxMock('settlement', 'createVenue');

    const rawMaxVenueSigners = dsMockUtils.createMockU32(new BigNumber(2));
    dsMockUtils.setConstMock('settlement', 'maxNumberOfVenueSigners', {
      returnValue: rawMaxVenueSigners,
    });

    rawDetails = dsMockUtils.createMockBytes(description);
    rawType = dsMockUtils.createMockVenueType(type);

    args = { description, type };
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

  it('should throw an error if maximum venue signers gets exceeded', () => {
    const signers = ['newSigner', 'newSigner2', 'newSigner3'];

    const proc = procedureMockUtils.getInstance<CreateVenueParams, Venue>(mockContext);

    return expect(
      prepareCreateVenue.call(proc, {
        ...args,
        signers,
      })
    ).rejects.toThrow('Maximum number of venue signers exceeded');
  });

  it('should return a createVenue transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<CreateVenueParams, Venue>(mockContext);

    when(stringToBytes).calledWith(description, mockContext).mockReturnValue(rawDetails);
    when(venueTypeToMeshVenueTypeSpy).calledWith(type, mockContext).mockReturnValue(rawType);

    let result = await prepareCreateVenue.call(proc, args);

    expect(result).toEqual({
      transaction: createVenueTransaction,
      args: [rawDetails, [], rawType],
      resolver: expect.any(Function),
    });

    const rawSigner = dsMockUtils.createMockAccountId('newSigner');

    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawSigner);

    result = await prepareCreateVenue.call(proc, { ...args, signers: ['newSigner'] });

    expect(result).toEqual({
      transaction: createVenueTransaction,
      args: [rawDetails, [rawSigner], rawType],
      resolver: expect.any(Function),
    });
  });
});

describe('createCreateVenueResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const id = new BigNumber(10);
  const rawId = dsMockUtils.createMockU64(id);

  beforeAll(() => {
    entityMockUtils.initMocks({
      venueOptions: {
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

  it('should return the new Venue', () => {
    const fakeContext = {} as Context;

    const result = createCreateVenueResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
