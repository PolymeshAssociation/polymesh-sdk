import { bool } from '@polkadot/types';
import { PolymeshPrimitivesSecondaryKeySignatory } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Namespace } from '~/internal';
import { AuthorizationType as MeshAuthorizationType } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType, Identity, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { Authorizations } from '../Authorizations';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/AuthorizationRequest',
  require('~/testUtils/mocks/entities').mockAuthorizationRequestModule(
    '~/api/entities/AuthorizationRequest'
  )
);

describe('Authorizations class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Authorizations.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getReceived', () => {
    let signerValueToSignatorySpy: jest.SpyInstance<
      PolymeshPrimitivesSecondaryKeySignatory,
      [SignerValue, Context]
    >;
    let booleanToBoolSpy: jest.SpyInstance<bool, [boolean, Context]>;
    let authorizationTypeToMeshAuthorizationTypeSpy: jest.SpyInstance<
      MeshAuthorizationType,
      [AuthorizationType, Context]
    >;

    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeAll(() => {
      signerValueToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerValueToSignatory');
      booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
      authorizationTypeToMeshAuthorizationTypeSpy = jest.spyOn(
        utilsConversionModule,
        'authorizationTypeToMeshAuthorizationType'
      );
    });

    it('should retrieve all pending authorizations received by the Identity and filter out expired ones', async () => {
      const did = 'someDid';
      const filter = AuthorizationType.RotatePrimaryKey;
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);
      const rawSignatory = dsMockUtils.createMockSignatory();
      const rawAuthorizationType = dsMockUtils.createMockAuthorizationType(filter);

      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          target: identity,
          issuer: entityMockUtils.getIdentityInstance({ did: 'alice' }),
        } as const,
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: identity,
          issuer: entityMockUtils.getIdentityInstance({ did: 'bob' }),
        } as const,
      ];

      when(signerValueToSignatorySpy).mockReturnValue(rawSignatory);
      when(booleanToBoolSpy)
        .calledWith(true, context)
        .mockReturnValue(dsMockUtils.createMockBool(true));
      when(booleanToBoolSpy)
        .calledWith(false, context)
        .mockReturnValue(dsMockUtils.createMockBool(false));
      when(authorizationTypeToMeshAuthorizationTypeSpy)
        .calledWith(filter, context)
        .mockReturnValue(rawAuthorizationType);

      const fakeRpcAuthorizations = authParams.map(({ authId, expiry, issuer, data }) =>
        dsMockUtils.createMockAuthorization({
          authId: dsMockUtils.createMockU64(authId),
          expiry: dsMockUtils.createMockOption(
            expiry ? dsMockUtils.createMockMoment(new BigNumber(expiry.getTime())) : expiry
          ),
          authorizationData: dsMockUtils.createMockAuthorizationData({
            TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
          }),
          authorizedBy: dsMockUtils.createMockIdentityId(issuer.did),
        })
      );

      dsMockUtils
        .createRpcMock('identity', 'getFilteredAuthorizations')
        .mockResolvedValue(fakeRpcAuthorizations);

      const expectedAuthorizations = authParams.map(({ authId, target, issuer, expiry, data }) =>
        entityMockUtils.getAuthorizationRequestInstance({
          authId,
          issuer,
          target,
          expiry,
          data,
        })
      );

      let result = await authsNamespace.getReceived();

      expect(JSON.stringify(result)).toBe(JSON.stringify(expectedAuthorizations));

      result = await authsNamespace.getReceived({
        type: AuthorizationType.RotatePrimaryKey,
        includeExpired: false,
      });

      expect(JSON.stringify(result)).toBe(JSON.stringify(expectedAuthorizations));
    });
  });

  describe('method: getOne', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'signerValueToSignatory').mockImplementation();
      jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockImplementation();
    });

    it('should return the requested Authorization Request', async () => {
      const did = 'someDid';
      const issuerDid = 'alice';
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);
      const id = new BigNumber(1);

      const authId = new BigNumber(1);
      const data = { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' } as const;

      dsMockUtils.createQueryMock('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAuthorization({
            authId: dsMockUtils.createMockU64(authId),
            authorizationData: dsMockUtils.createMockAuthorizationData({
              TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
            }),
            expiry: dsMockUtils.createMockOption(),
            authorizedBy: dsMockUtils.createMockIdentityId(issuerDid),
          })
        ),
      });

      const result = await authsNamespace.getOne({ id });

      expect(result.authId).toEqual(authId);
      expect(result.expiry).toBeNull();
      expect(result.data).toEqual(data);
      expect((result.target as Identity).did).toEqual(did);
      expect(result.issuer.did).toEqual(issuerDid);
    });

    it('should throw an error if the Authorization Request does not exist', async () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(authsNamespace.getOne({ id })).rejects.toThrow(
        'The Authorization Request does not exist'
      );
    });
  });
});
