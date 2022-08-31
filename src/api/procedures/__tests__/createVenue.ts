import { Bytes } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { VenueType as MeshVenueType } from 'polymesh-types/types';
import sinon from 'sinon';

import { createCreateVenueResolver, prepareCreateVenue } from '~/api/procedures/createVenue';
import { Context, PostTransactionValue, Venue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CreateVenueParams, VenueType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createVenue procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToBytes: sinon.SinonStub<[string, Context], Bytes>;
  let venueTypeToMeshVenueTypeStub: sinon.SinonStub<[VenueType, Context], MeshVenueType>;
  let addTransactionStub: sinon.SinonStub;
  let createVenueTransaction: PolymeshTx<unknown[]>;
  let venue: PostTransactionValue<Venue>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToBytes = sinon.stub(utilsConversionModule, 'stringToBytes');
    venueTypeToMeshVenueTypeStub = sinon.stub(utilsConversionModule, 'venueTypeToMeshVenueType');
    venue = 'venue' as unknown as PostTransactionValue<Venue>;
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([venue]);
    createVenueTransaction = dsMockUtils.createTxStub('settlement', 'createVenue');
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

  it('should add a createVenue transaction to the queue', async () => {
    const description = 'description';
    const type = VenueType.Distribution;
    const args = {
      description,
      type,
    };
    const rawDetails = dsMockUtils.createMockBytes(description);
    const rawType = dsMockUtils.createMockVenueType(type);

    const proc = procedureMockUtils.getInstance<CreateVenueParams, Venue>(mockContext);

    stringToBytes.withArgs(description, mockContext).returns(rawDetails);
    venueTypeToMeshVenueTypeStub.withArgs(type, mockContext).returns(rawType);

    const result = await prepareCreateVenue.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: createVenueTransaction,
        resolvers: sinon.match.array,
        args: [rawDetails, [], rawType],
      })
    );
    expect(result).toBe(venue);
  });
});

describe('createCreateVenueResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
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
    filterEventRecordsStub.returns([dsMockUtils.createMockIEvent(['did', rawId])]);
  });

  afterEach(() => {
    filterEventRecordsStub.reset();
  });

  it('should return the new Venue', () => {
    const fakeContext = {} as Context;

    const result = createCreateVenueResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
