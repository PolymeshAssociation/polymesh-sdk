import { Identities } from '@polymeshassociation/polymesh-sdk/api/client/Identities';

import { ExtendedIdentities } from '~/api/client/ExtendedIdentities';
import { Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Identities Class', () => {
  let context: Mocked<Context>;
  let identities: ExtendedIdentities;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    identities = new ExtendedIdentities(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('ExtendedIdentities class', () => {
    it('should extend the Identities class', () => {
      expect(identities).toBeInstanceOf(Identities);
    });
  });

  describe('method: getIdentity', () => {
    it('should return an Identity object with the passed did', async () => {
      const params = { did: 'testDid' };

      const identity = new Identity(params, context);
      context.getIdentity.mockResolvedValue(identity);

      const result = await identities.getIdentity(params);

      expect(result.did).toEqual(identity.did);
      expect(result).toBeInstanceOf(Identity);
    });
  });
});
