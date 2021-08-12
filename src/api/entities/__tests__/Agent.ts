import sinon from 'sinon';

import { KnownPermissionGroup } from '~/api/entities/KnownPermissionGroup';
import { Agent, Context, Identity } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('Agent class', () => {
  const did = 'someDid';
  const ticker = 'SOMETICKER';

  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'stringToTicker');
    sinon.stub(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend Identity', () => {
    expect(Agent.prototype instanceof Identity).toBe(true);
  });

  describe('constructor', () => {
    test('should assign ticker and did to instance', () => {
      const agent = new Agent({ did, ticker }, context);

      expect(agent.ticker).toBe(ticker);
      expect(agent.did).toEqual(did);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(Agent.isUniqueIdentifiers({ did: 'someDid', ticker: 'symbol' })).toBe(true);
      expect(Agent.isUniqueIdentifiers({})).toBe(false);
      expect(Agent.isUniqueIdentifiers({ did: 'someDid' })).toBe(false);
      expect(Agent.isUniqueIdentifiers({ did: 1 })).toBe(false);
    });
  });

  describe('method: getPermissionGroup', () => {
    test('should throw an error if the Identity is no longer an Agent', async () => {
      const agent = new Agent({ did, ticker }, context);

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(),
      });

      let error;

      try {
        await agent.getPermissionGroup();
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('This Identity is no longer an Agent for this Security Token');
    });

    test('should return the permission group associated with the Agent', async () => {
      const agent = new Agent({ did, ticker }, context);

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full')),
      });

      const result = await agent.getPermissionGroup();

      expect(result instanceof KnownPermissionGroup).toEqual(true);
      expect((result as KnownPermissionGroup).type).toEqual(PermissionGroupType.Full);
    });
  });
});
