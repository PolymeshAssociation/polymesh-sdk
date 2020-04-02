import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { AuthorizationRequest } from '~/api/entities/AuthorizationRequest';
import { Namespace } from '~/base';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import { AuthorizationType } from '~/types';
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
    test('should retrieve all pending authorizations received by the identity and filter out expired ones', async () => {
      sinon.stub(utilsModule, 'signerToSignatory');

      const did = 'someDid';

      /* eslint-disable @typescript-eslint/camelcase */
      const authParams = [
        {
          authId: new BigNumber(0),
          expiry: null,
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'myTicker' },
          targetDid: did,
          issuerDid: 'alice',
        },
        {
          authId: new BigNumber(1),
          expiry: new Date('10/14/3040'),
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
        {
          authId: new BigNumber(2),
          expiry: new Date('10/14/1987'), // expired
          data: { type: AuthorizationType.TransferTokenOwnership, value: 'otherTicker' },
          targetDid: did,
          issuerDid: 'bob',
        },
      ];

      const authorizations = authParams.map(({ authId, expiry, issuerDid, data }) => ({
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
      }));

      /* eslint-enable @typescript-eslint/camelcase */
      polkadotMockUtils.createQueryStub('identity', 'authorizations', {
        entries: authorizations,
      });

      const context = polkadotMockUtils.getContextInstance();
      const identity = entityMockUtils.getIdentityInstance();
      const authsNamespace = new Authorizations(identity, context);

      const expectedAuthorizations = authParams
        .slice(0, -1)
        .map(params => new AuthorizationRequest(params, context));

      const result = await authsNamespace.getReceived();

      expect(result).toEqual(expectedAuthorizations);
    });
  });
});
