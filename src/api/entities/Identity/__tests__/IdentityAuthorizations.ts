import { StorageKey } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Authorizations, Identity, Namespace } from '~/internal';
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

      /* eslint-disable @typescript-eslint/naming-convention */
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

  describe('method: getOne', () => {
    afterAll(() => {
      sinon.restore();
    });

    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'signerValueToSignatory');
      sinon.stub(utilsConversionModule, 'bigNumberToU64');
    });

    it('should return the requested Authorization Request issued by the parent Identity', async () => {
      const did = 'someDid';
      const targetDid = 'alice';
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });

      const identityAuthorization = new IdentityAuthorizations(identity, context);
      const id = new BigNumber(1);

      const data = { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' } as const;

      dsMockUtils.createQueryStub('identity', 'authorizationsGiven', {
        returnValue: dsMockUtils.createMockSignatory({
          Identity: dsMockUtils.createMockIdentityId(targetDid),
        }),
      });

      /* eslint-disable @typescript-eslint/naming-convention */
      dsMockUtils.createQueryStub('identity', 'authorizations', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockAuthorization({
            authId: dsMockUtils.createMockU64(id),
            authorizationData: dsMockUtils.createMockAuthorizationData({
              TransferAssetOwnership: dsMockUtils.createMockTicker(data.value),
            }),
            expiry: dsMockUtils.createMockOption(),
            authorizedBy: dsMockUtils.createMockIdentityId(did),
          })
        ),
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      const result = await identityAuthorization.getOne({ id });

      expect(result.authId).toEqual(id);
      expect(result.expiry).toBeNull();
      expect(result.data).toEqual(data);
      expect((result.target as Identity).did).toEqual(targetDid);
      expect(result.issuer.did).toEqual(did);
    });

    it('should return the requested Authorization Request targeting the parent Identity', async () => {
      const did = 'someDid';
      const issuerDid = 'alice';
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });

      const identityAuthorization = new IdentityAuthorizations(identity, context);
      const id = new BigNumber(1);

      const data = { type: AuthorizationType.TransferAssetOwnership, value: 'myTicker' } as const;

      dsMockUtils.createQueryStub('identity', 'authorizationsGiven', {
        returnValue: dsMockUtils.createMockSignatory(),
      });

      const authParams = {
        authId: id,
        expiry: null,
        data,
        target: identity,
        issuer: entityMockUtils.getIdentityInstance({ did: issuerDid }),
      };
      const mockAuthRequest = entityMockUtils.getAuthorizationRequestInstance(authParams);

      const spy = jest.spyOn(Authorizations.prototype, 'getOne').mockResolvedValue(mockAuthRequest);

      const result = await identityAuthorization.getOne({ id });

      expect(result).toBe(mockAuthRequest);
      spy.mockRestore();
    });

    it('should throw an error if the Authorization Request does not exist', async () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance({ did });
      const identity = entityMockUtils.getIdentityInstance({ did });
      const authsNamespace = new IdentityAuthorizations(identity, context);
      const id = new BigNumber(1);

      dsMockUtils.createQueryStub('identity', 'authorizationsGiven', {
        returnValue: dsMockUtils.createMockSignatory(),
      });

      const spy = jest
        .spyOn(Authorizations.prototype, 'getOne')
        .mockRejectedValue(new Error('The Authorization Request does not exist'));

      await expect(authsNamespace.getOne({ id })).rejects.toThrow(
        'The Authorization Request does not exist'
      );
      spy.mockRestore();
    });
  });
});
