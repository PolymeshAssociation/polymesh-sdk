import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { Authorizations } from '../Authorizations';

describe('Authorizations class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
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
      sinon.stub(utilsModule, 'signerToSignatory');
      dsMockUtils.createQueryStub('identity', 'authorizations');

      const requestPaginatedStub = sinon.stub(utilsModule, 'requestPaginated');

      const did = 'someDid';

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          targetDid: did,
          issuerDid: 'alice',
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
      ];

      const authEntries = authParams.map(({ authId, expiry, issuerDid, data }) =>
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
            authorized_by: dsMockUtils.createMockIdentityId(issuerDid),
          })
        )
      );

      requestPaginatedStub.resolves({ entries: authEntries, lastKey: null });

      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(params => new AuthorizationRequest(params as any, context));

      const result = await authsNamespace.getReceived();

      expect(result).toEqual({ data: expectedAuthorizations, next: null });
    });
  });

  describe('method: getSent', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all pending authorizations sent by the identity and filter out expired ones', async () => {
      sinon.stub(utilsModule, 'signerToSignatory');
      dsMockUtils.createQueryStub('identity', 'authorizationsGiven');

      const requestPaginatedStub = sinon.stub(utilsModule, 'requestPaginated');

      const did = 'someDid';

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' },
          targetDid: 'alice',
          issuerDid: did,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          targetDid: 'bob',
          issuerDid: did,
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferAssetOwnership, value: 'otherTicker' },
          targetDid: 'charlie',
          issuerDid: did,
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
              Identity: dsMockUtils.createMockIdentityId(authParams[index].targetDid),
            })
          )
      );

      requestPaginatedStub.resolves({ entries: authorizationsGivenEntries, lastKey: null });

      const authsMultiArgs = authorizationsGivenEntries.map(([keys, signatory]) =>
        tuple(signatory, keys.args[1])
      );

      const authorizationsStub = dsMockUtils.createQueryStub('identity', 'authorizations');
      authorizationsStub.multi.withArgs(authsMultiArgs).resolves(authorizations);

      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(params => new AuthorizationRequest(params as any, context));

      const result = await authsNamespace.getSent();

      expect(result).toEqual({ data: expectedAuthorizations, next: null });
    });
  });
});
