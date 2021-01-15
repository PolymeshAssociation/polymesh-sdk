import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  AddPercentageTransferRestrictionParams,
  addTransferRestriction,
  Namespace,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { TransferRestrictionType } from '~/types/internal';

import { Percentage } from '../Percentage';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('Percentage class', () => {
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
    expect(Percentage.prototype instanceof Namespace).toBe(true);
  });

  describe('method: addRestriction', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const count = new Percentage(token, context);

      const args: Omit<AddPercentageTransferRestrictionParams, 'type'> = {
        percentage: new BigNumber(49),
        exempted: ['someScopeId'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      sinon
        .stub(addTransferRestriction, 'prepare')
        .withArgs(
          { ticker: token.ticker, ...args, type: TransferRestrictionType.Percentage },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });
});
