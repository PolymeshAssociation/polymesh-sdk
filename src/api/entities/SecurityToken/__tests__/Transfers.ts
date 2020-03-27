import sinon from 'sinon';

import { toggleFreezeTransfers } from '~/api/procedures';
import { Params } from '~/api/procedures/toggleFreezeTransfers';
import { Namespace, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';

import { SecurityToken } from '../';
import { Transfers } from '../Transfers';

describe('Transfers class', () => {
  let prepareStub: sinon.SinonStub<
    [Params, Context],
    Promise<TransactionQueue<SecurityToken, unknown[][]>>
  >;

  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();

    prepareStub = sinon.stub(toggleFreezeTransfers, 'prepare');
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Transfers.prototype instanceof Namespace).toBe(true);
  });

  describe('method: freeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const transfers = new Transfers(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      prepareStub.withArgs({ ticker: token.ticker, freeze: true }, context).resolves(expectedQueue);

      const queue = await transfers.freeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unfreeze', () => {
    test('should prepare the procedure and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const transfers = new Transfers(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      prepareStub
        .withArgs({ ticker: token.ticker, freeze: false }, context)
        .resolves(expectedQueue);

      const queue = await transfers.unfreeze();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: areFrozen', () => {
    test('should return whether the security token is frozen or not', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const transfers = new Transfers(token, context);

      polkadotMockUtils.createQueryStub('asset', 'frozen', {
        returnValue: polkadotMockUtils.createMockBool(true),
      });

      const result = await transfers.areFrozen();

      expect(result).toBe(true);
    });
  });
});
