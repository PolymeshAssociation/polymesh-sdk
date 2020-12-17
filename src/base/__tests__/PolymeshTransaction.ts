import BigNumber from 'bignumber.js';

import { Context, PolymeshTransaction } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';

describe('Polymesh Transaction class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  const txSpec = {
    signer: 'signer',
    isCritical: false,
    fee: new BigNumber(100),
    batchSize: null,
    paidByThirdParty: false,
  };

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('get: args', () => {
    test('should return unwrapped args', () => {
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const transaction = new PolymeshTransaction(
        {
          ...txSpec,
          tx,
          args,
        },
        context
      );

      expect(transaction.args).toEqual(args);
      expect(transaction.args).toEqual(args); // this second call is to cover the case where the internal value is already set
    });
  });
});
