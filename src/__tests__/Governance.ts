import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Governance } from '~/Governance';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';

describe('Documents class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: getGovernanceCommitteeMembers', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should retrieve a list of all active members identities', async () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance();
      const expectedMembers = [new Identity({ did }, context)];

      dsMockUtils.createQueryStub('committeeMembership', 'activeMembers', {
        returnValue: [dsMockUtils.createMockIdentityId('someDid')],
      });

      const governance = new Governance(context);
      const result = await governance.getGovernanceCommitteeMembers();

      expect(result).toEqual(expectedMembers);
    });
  });
});
