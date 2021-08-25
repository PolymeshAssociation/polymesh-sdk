import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { KnownPermissionGroup } from '~/api/entities/KnownPermissionGroup';
import { Agent, Context, Identity } from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { PermissionGroupType } from '~/types';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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

  describe('method: addedAt', () => {
    test('should return the event identifier object of the agent added', async () => {
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = 1;
      const variables = {
        moduleId: ModuleIdEnum.Externalagents,
        eventId: EventIdEnum.AgentAdded,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const fakeResult = { blockNumber, blockDate, eventIndex: eventIdx };
      const agent = new Agent({ did, ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {
        /* eslint-disable @typescript-eslint/naming-convention */
        eventByIndexedArgs: {
          block_id: blockNumber.toNumber(),
          block: { datetime: blockDate },
          event_idx: eventIdx,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      const result = await agent.addedAt();

      expect(result).toEqual(fakeResult);
    });

    test('should return null if the query result is empty', async () => {
      const variables = {
        moduleId: ModuleIdEnum.Externalagents,
        eventId: EventIdEnum.AgentAdded,
        eventArg1: utilsInternalModule.padString(ticker, MAX_TICKER_LENGTH),
      };
      const agent = new Agent({ did, ticker }, context);

      dsMockUtils.createApolloQueryStub(eventByIndexedArgs(variables), {});
      const result = await agent.addedAt();
      expect(result).toBeNull();
    });
  });
});
