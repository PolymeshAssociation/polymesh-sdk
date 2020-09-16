import { bool } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { AuthorizationType as MeshAuthorizationType, Signatory } from 'polymesh-types/types';
import sinon from 'sinon';

import { AuthorizationRequest, Identity, Namespace } from '~/api/entities';
import { Context } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { SignerValue } from '~/types/internal';
import * as utilsModule from '~/utils';

import { Authorizations } from '../Authorizations';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
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
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
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
      signerValueToSignatoryStub = sinon.stub(utilsModule, 'signerValueToSignatory');
      booleanToBoolStub = sinon.stub(utilsModule, 'booleanToBool');
      authorizationTypeToMeshAuthorizationTypeStub = sinon.stub(
        utilsModule,
        'authorizationTypeToMeshAuthorizationType'
      );
    });

    test('should retrieve all pending authorizations received by the identity and filter out expired ones', async () => {
      const did = 'someDid';
      const filter = AuthorizationType.NoData;
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);
      const rawSignatory = dsMockUtils.createMockSignatory();
      const rawAuthorizationType = dsMockUtils.createMockAuthorizationType(filter);

      /* eslint-disable @typescript-eslint/camelcase */

      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          target: identity,
          issuer: new Identity({ did: 'alice' }, context),
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: identity,
          issuer: new Identity({ did: 'bob' }, context),
        },
      ];

      const fakeAuthorizations = authParams.map(({ authId, expiry, issuer, data }) =>
        dsMockUtils.createMockAuthorization({
          auth_id: dsMockUtils.createMockU64(authId.toNumber()),
          expiry: dsMockUtils.createMockOption(
            expiry ? dsMockUtils.createMockMoment(expiry.getTime()) : expiry
          ),
          authorization_data: dsMockUtils.createMockAuthorizationData({
            TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
          }),
          authorized_by: dsMockUtils.createMockIdentityId(issuer.did),
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

      const expectedAuthorizations = authParams
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(params => new AuthorizationRequest(params as any, context));

      let result = await authsNamespace.getReceived();

      expect(result).toEqual(expectedAuthorizations);

      result = await authsNamespace.getReceived({
        type: AuthorizationType.NoData,
        includeExpired: false,
      });

      expect(result).toEqual(expectedAuthorizations);
    });
  });
});
