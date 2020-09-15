import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest, Identity } from '~/api/entities';
import { Namespace } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { tuple } from '~/types/utils';
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
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all pending authorizations received by the identity and filter out expired ones', async () => {
      sinon.stub(utilsModule, 'signerValueToSignatory');
      dsMockUtils.createQueryStub('identity', 'authorizations');

      const requestPaginatedStub = sinon.stub(utilsModule, 'requestPaginated');

      const did = 'someDid';

      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);

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
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: identity,
          issuer: new Identity({ did: 'bob' }, context),
        },
      ];

      const authEntries = authParams.map(({ authId, expiry, issuer, data }) =>
        tuple(
          ({ args: [did, authId] } as unknown) as StorageKey,
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
        )
      );

      requestPaginatedStub.resolves({ entries: authEntries, lastKey: null });

      const expectedAuthorizations = authParams
        .slice(0, -1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(params => new AuthorizationRequest(params as any, context));

      const result = await authsNamespace.getReceived();

      expect(result).toEqual({ data: expectedAuthorizations, next: null });
    });
  });
});
