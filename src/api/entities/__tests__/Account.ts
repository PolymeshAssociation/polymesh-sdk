import sinon from 'sinon';

import { Account, Entity } from '~/api/entities';
import { Context } from '~/base';
import { heartbeat, transactions } from '~/middleware/queries';
import { CallIdEnum, ExtrinsicResult, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TxTags } from '~/types';
import * as utilsModule from '~/utils';

describe('Account class', () => {
  let context: Context;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend Entity', () => {
    expect(Account.prototype instanceof Entity).toBe(true);
  });

  describe('method: getTransactionHistory', () => {
    test('should return a list of transactions', async () => {
      const address = 'someAddress';
      const key = 'someKey';
      const tag = TxTags.identity.CddRegisterDid;
      const moduleId = ModuleIdEnum.Identity;
      const callId = CallIdEnum.CddRegisterDid;

      sinon
        .stub(utilsModule, 'addressToKey')
        .withArgs(address)
        .returns(key);

      sinon
        .stub(utilsModule, 'txTagToExtrinsicIdentifier')
        .withArgs(tag)
        .returns({
          moduleId,
          callId,
        });

      /* eslint-disable @typescript-eslint/camelcase */
      const transactionsQueryResponse: ExtrinsicResult = {
        totalCount: 20,
        items: [
          {
            block_id: 1,
            address: address,
            success: 0,
          },
          {
            block_id: 2,
            success: 1,
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.configureMocks({ contextOptions: { withSeed: true } });
      dsMockUtils.createApolloQueryStub(heartbeat(), true);

      const account = new Account({ address }, context);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: key,
          module_id: moduleId,
          call_id: callId,
          success: undefined,
          count: 2,
          skip: 1,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      let result = await account.getTransactionHistory({
        tag,
        size: 2,
        start: 1,
      });

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[1].blockId).toEqual(2);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[1].address).toBeNull();
      expect(result.data[0].success).toBeFalsy();
      expect(result.data[1].success).toBeTruthy();
      expect(result.count).toEqual(20);
      expect(result.next).toEqual(3);

      dsMockUtils.createApolloQueryStub(
        transactions({
          block_id: undefined,
          address: key,
          module_id: undefined,
          call_id: undefined,
          success: undefined,
          count: undefined,
          skip: undefined,
          orderBy: undefined,
        }),
        {
          transactions: transactionsQueryResponse,
        }
      );

      result = await account.getTransactionHistory();

      expect(result.data[0].blockId).toEqual(1);
      expect(result.data[0].address).toEqual(address);
      expect(result.data[0].success).toBeFalsy();
      expect(result.count).toEqual(20);
      expect(result.next).toBeNull();
    });
  });
});
