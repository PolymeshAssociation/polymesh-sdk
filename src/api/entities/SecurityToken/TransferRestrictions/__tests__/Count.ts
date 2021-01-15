import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  AddCountTransferRestrictionParams,
  addTransferRestriction,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TransferRestrictionType } from '~/types/internal';

import { Count } from '../Count';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Count class', () => {
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
    expect(Count.prototype instanceof Namespace).toBe(true);
  });

  describe('method: addRestriction', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const count = new Count(token, context);

      const args: Omit<AddCountTransferRestrictionParams, 'type'> = {
        count: new BigNumber(3),
        exempted: ['someScopeId'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      sinon
        .stub(addTransferRestriction, 'prepare')
        .withArgs({ ticker: token.ticker, ...args, type: TransferRestrictionType.Count }, context)
        .resolves(expectedQueue);

      const queue = await count.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });
});
