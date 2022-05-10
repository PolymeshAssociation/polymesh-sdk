import { bool } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { AuthorizationType as MeshAuthorizationType, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Namespace } from '~/internal';
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
    let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
    let booleanToBoolStub: sinon.SinonStub<[boolean, Context], bool>;
    let authorizationTypeToMeshAuthorizationTypeStub: sinon.SinonStub<
      [AuthorizationType, Context],
      MeshAuthorizationType
    >;

    afterAll(() => {
      sinon.restore();
    });

    beforeAll(() => {
      signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
      booleanToBoolStub = sinon.stub(utilsConversionModule, 'booleanToBool');
      authorizationTypeToMeshAuthorizationTypeStub = sinon.stub(
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

      const fakeAuthorizations = authParams.map(({ authId, expiry, issuer, data }) =>
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

      signerValueToSignatoryStub.returns(rawSignatory);
      booleanToBoolStub.withArgs(true, context).returns(dsMockUtils.createMockBool(true));
      booleanToBoolStub.withArgs(false, context).returns(dsMockUtils.createMockBool(false));
      authorizationTypeToMeshAuthorizationTypeStub
        .withArgs(filter, context)
        .returns(rawAuthorizationType);

      dsMockUtils
        .createRpcStub('identity', 'getFilteredAuthorizations')
        .resolves(fakeAuthorizations);

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
      sinon.restore();
    });

    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
      sinon.stub(utilsConversionModule, 'bigNumberToU64');
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

      dsMockUtils.createQueryStub('identity', 'authorizations', {
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

      dsMockUtils.createQueryStub('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(),
      });

      return expect(authsNamespace.getOne({ id })).rejects.toThrow(
        'The Authorization Request does not exist'
      );
    });
  });
});
