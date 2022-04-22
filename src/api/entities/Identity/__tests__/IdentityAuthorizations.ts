import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

import { IdentityAuthorizations } from '../IdentityAuthorizations';

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

describe('IdentityAuthorizations class', () => {
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
    expect(IdentityAuthorizations.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getSent', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should retrieve all pending authorizations sent by the Identity', async () => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
      dsMockUtils.createQueryStub('identity', 'authorizationsGiven');

      const requestPaginatedStub = sinon.stub(utilsInternalModule, 'requestPaginated');

      const did = 'someDid';

      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new IdentityAuthorizations(identity, context);

      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          target: entityMockUtils.getIdentityInstance({ did: 'alice' }),
          issuer: identity,
        } as const,
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: entityMockUtils.getIdentityInstance({ did: 'bob' }),
          issuer: identity,
        } as const,
      ];

      const authorizations = authParams.map(({ authId, expiry, data }) =>
        dsMockUtils.createMockAuthorization({
          authId: dsMockUtils.createMockU64(authId),
          expiry: dsMockUtils.createMockOption(
            expiry ? dsMockUtils.createMockMoment(new BigNumber(expiry.getTime())) : expiry
          ),
          authorizationData: dsMockUtils.createMockAuthorizationData({
            TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
          }),
          authorizedBy: dsMockUtils.createMockIdentityId(did),
        })
      );

      const authorizationsGivenEntries = authorizations.map(
        ({ authorizedBy: issuer, authId }, index) =>
          tuple(
            { args: [issuer, authId] } as unknown as StorageKey,
            dsMockUtils.createMockSignatory({
              Identity: dsMockUtils.createMockIdentityId(authParams[index].target.did),
            })
          )
      );

      requestPaginatedStub.resolves({ entries: authorizationsGivenEntries, lastKey: null });

      const authsMultiArgs = authorizationsGivenEntries.map(([keys, signatory]) =>
        tuple(signatory, keys.args[1])
      );

      const authorizationsStub = dsMockUtils.createQueryStub('identity', 'authorizations');
      authorizationsStub.multi
        .withArgs(authsMultiArgs)
        .resolves(authorizations.map(dsMockUtils.createMockOption));

      const expectedAuthorizations = authParams.map(({ authId, target, issuer, expiry, data }) =>
        entityMockUtils.getAuthorizationRequestInstance({
          authId,
          issuer,
          target,
          expiry,
          data,
        })
      );

      const result = await authsNamespace.getSent();

      result.data.forEach(({ issuer, authId, target, expiry, data }, index) => {
        const {
          issuer: expectedIssuer,
          authId: expectedAuthId,
          target: expectedTarget,
          expiry: expectedExpiry,
          data: expectedData,
        } = expectedAuthorizations[index];

        expect(issuer.did).toBe(expectedIssuer.did);
        expect(utilsConversionModule.signerToString(target)).toBe(
          utilsConversionModule.signerToString(expectedTarget)
        );
        expect(authId).toEqual(expectedAuthId);
        expect(expiry).toEqual(expectedExpiry);
        expect(data).toEqual(expectedData);
      });
      expect(result.next).toBeNull();
    });
  });
});
