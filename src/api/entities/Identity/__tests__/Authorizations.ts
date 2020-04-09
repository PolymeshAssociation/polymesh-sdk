import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest } from '~/api/entities';
import { Namespace } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { Authorizations } from '../Authorizations';

describe('Authorizations class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
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

      const did = 'someDid';

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'myTicker' },
          targetDid: did,
          issuerDid: 'alice',
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
      ];

      const authEntries = authParams.map(({ authId, expiry, issuerDid, data }) =>
        tuple(
          [did, authId],
          polkadotMockUtils.createMockAuthorization({
            auth_id: polkadotMockUtils.createMockU64(authId.toNumber()),
            expiry: polkadotMockUtils.createMockOption(
              expiry ? polkadotMockUtils.createMockMoment(expiry.getTime()) : expiry
            ),
            authorization_data: polkadotMockUtils.createMockAuthorizationData({
              TransferTokenOwnership: polkadotMockUtils.createMockTicker(data.value),
            }),
            authorized_by: polkadotMockUtils.createMockSignatory({
              Identity: polkadotMockUtils.createMockIdentityId(issuerDid),
            }),
          })
        )
      );

      /* eslint-enable @typescript-eslint/camelcase */
      polkadotMockUtils.createQueryStub('identity', 'authorizations', {
        entries: authEntries,
      });

      const context = polkadotMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        .map(params => new AuthorizationRequest(params, context));

      const result = await authsNamespace.getReceived();

      expect(result).toEqual(expectedAuthorizations);
    });
  });

  describe('method: getSent', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve all pending authorizations sent by the identity and filter out expired ones', async () => {
      sinon.stub(utilsModule, 'signerToSignatory');

      const did = 'someDid';

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(1),
          expiry: null,
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'myTicker' },
          targetDid: 'alice',
          issuerDid: did,
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: 'bob',
          issuerDid: did,
        },
        {
          authId: new BigNumber(3),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: 'charlie',
          issuerDid: did,
        },
      ];

      const authorizations = authParams.map(({ authId, expiry, data }) => ({
        auth_id: polkadotMockUtils.createMockU64(authId.toNumber()),
        expiry: polkadotMockUtils.createMockOption(
          expiry ? polkadotMockUtils.createMockMoment(expiry.getTime()) : expiry
        ),
        authorization_data: polkadotMockUtils.createMockAuthorizationData({
          TransferTokenOwnership: polkadotMockUtils.createMockTicker(data.value),
        }),
        authorized_by: polkadotMockUtils.createMockSignatory({
          Identity: polkadotMockUtils.createMockIdentityId(did),
        }),
      }));
      /* eslint-enable @typescript-eslint/camelcase */

      const authorizationsGivenEntries = authorizations.map(
        ({ authorized_by: issuer, auth_id: authId }, index) =>
          tuple(
            [issuer, authId],
            polkadotMockUtils.createMockSignatory({
              Identity: polkadotMockUtils.createMockIdentityId(authParams[index].targetDid),
            })
          )
      );

      polkadotMockUtils.createQueryStub('identity', 'authorizationsGiven', {
        entries: authorizationsGivenEntries,
      });

      const authsMultiArgs = authorizationsGivenEntries.map(([keys, signatory]) =>
        tuple(signatory, keys[1])
      );

      const authorizationsStub = polkadotMockUtils.createQueryStub('identity', 'authorizations');
      authorizationsStub.multi.withArgs(authsMultiArgs).resolves(authorizations);

      const context = polkadotMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new Authorizations(identity, context);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        .map(params => new AuthorizationRequest(params, context));

      const result = await authsNamespace.getSent();

      expect(result).toEqual(expectedAuthorizations);
    });
  });
});
