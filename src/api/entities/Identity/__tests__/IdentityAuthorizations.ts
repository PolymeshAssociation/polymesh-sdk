import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest, Identity } from '~/api/entities';
import { Namespace } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { IdentityAuthorizations } from '../IdentityAuthorizations';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
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
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(IdentityAuthorizations.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getSent', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all pending authorizations sent by the identity and filter out expired ones', async () => {
      sinon.stub(utilsModule, 'signerValueToSignatory');
      dsMockUtils.createQueryStub('identity', 'authorizationsGiven');

      const requestPaginatedStub = sinon.stub(utilsModule, 'requestPaginated');

      const did = 'someDid';

      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new IdentityAuthorizations(identity, context);

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          target: new Identity({ did: 'alice' }, context),
          issuer: identity,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: new Identity({ did: 'bob' }, context),
          issuer: identity,
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          target: new Identity({ did: 'charlie' }, context),
          issuer: identity,
        },
      ];

      const authorizations = authParams.map(({ authId, expiry, data }) => ({
        auth_id: dsMockUtils.createMockU64(authId.toNumber()),
        expiry: dsMockUtils.createMockOption(
          expiry ? dsMockUtils.createMockMoment(expiry.getTime()) : expiry
        ),
        authorization_data: dsMockUtils.createMockAuthorizationData({
          TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
        }),
        authorized_by: dsMockUtils.createMockIdentityId(did),
      }));
      /* eslint-enable @typescript-eslint/camelcase */

      const authorizationsGivenEntries = authorizations.map(
        ({ authorized_by: issuer, auth_id: authId }, index) =>
          tuple(
            ({ args: [issuer, authId] } as unknown) as StorageKey,
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
      authorizationsStub.multi.withArgs(authsMultiArgs).resolves(authorizations);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(params => new AuthorizationRequest(params as any, context));

      const result = await authsNamespace.getSent();

      expect(result).toEqual({ data: expectedAuthorizations, next: null });
    });
  });
});
