import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { ConfidentialLegParty } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/ConfidentialAsset'
  )
);

jest.mock(
  '~/api/entities/ConfidentialVenue',
  require('~/testUtils/mocks/entities').mockConfidentialVenueModule(
    '~/api/entities/ConfidentialVenue'
  )
);

describe('Identity class', () => {
  let context: MockContext;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let u64ToBigNumberSpy: jest.SpyInstance<BigNumber, [u64]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance({
      middlewareEnabled: true,
    });
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
    expect(Identity.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign did to instance', () => {
      const did = 'abc';
      const identity = new Identity({ did }, context);

      expect(identity.did).toBe(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(Identity.isUniqueIdentifiers({ did: 'someDid' })).toBe(true);
      expect(Identity.isUniqueIdentifiers({})).toBe(false);
      expect(Identity.isUniqueIdentifiers({ did: 3 })).toBe(false);
    });
  });

  describe('method: getInvolvedConfidentialTransactions', () => {
    const transactionId = new BigNumber(1);
    const legId = new BigNumber(2);

    it('should return the transactions with the identity affirmation status', async () => {
      dsMockUtils.createQueryMock('confidentialAsset', 'userAffirmations', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockIdentityId('someDid'),
              [
                dsMockUtils.createMockConfidentialTransactionId(transactionId),
                dsMockUtils.createMockConfidentialTransactionLegId(legId),
                dsMockUtils.createMockConfidentialLegParty('Sender'),
              ],
            ],
            dsMockUtils.createMockOption(dsMockUtils.createMockBool(false))
          ),
        ],
      });

      const identity = new Identity({ did: 'someDid' }, context);

      const result = await identity.getInvolvedConfidentialTransactions();

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            affirmed: false,
            legId: new BigNumber(2),
            role: ConfidentialLegParty.Sender,
            transaction: expect.objectContaining({ id: transactionId }),
          }),
        ]),
        next: null,
      });
    });
  });

  describe('method: getConfidentialVenues', () => {
    let did: string;
    let confidentialVenueId: BigNumber;

    let rawDid: PolymeshPrimitivesIdentityId;
    let rawConfidentialVenueId: u64;

    beforeAll(() => {
      did = 'someDid';
      confidentialVenueId = new BigNumber(5);

      rawDid = dsMockUtils.createMockIdentityId(did);
      rawConfidentialVenueId = dsMockUtils.createMockU64(confidentialVenueId);
    });

    beforeEach(() => {
      when(stringToIdentityIdSpy).calledWith(did, context).mockReturnValue(rawDid);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a list of Confidential Venues', async () => {
      when(u64ToBigNumberSpy)
        .calledWith(rawConfidentialVenueId)
        .mockReturnValue(confidentialVenueId);

      const mock = dsMockUtils.createQueryMock('confidentialAsset', 'identityVenues');
      const mockStorageKey = { args: [rawDid, rawConfidentialVenueId] };

      mock.keys = jest.fn().mockResolvedValue([mockStorageKey]);

      const identity = new Identity({ did }, context);

      const result = await identity.getConfidentialVenues();
      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: confidentialVenueId })])
      );
    });
  });
});
