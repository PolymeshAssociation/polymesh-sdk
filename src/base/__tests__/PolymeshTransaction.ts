import { Signer as PolkadotSigner } from '@polkadot/types/types';
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
    signingAddress: 'signingAddress',
    isCritical: false,
    signer: 'signer' as PolkadotSigner,
    fee: new BigNumber(100),
  };

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('get: args', () => {
    it('should return unwrapped args', () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('A_TICKER');

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
        },
        context
      );

      expect(tx.args).toEqual(args);
      expect(tx.args).toEqual(args); // this second call is to cover the case where the internal value is already set
    });
  });

  describe('method: supportsSubsidy', () => {
    it('should return whether the transaction supports subsidy', () => {
      context.supportsSubsidy.onFirstCall().returns(false);

      const transaction = dsMockUtils.createTxStub('identity', 'leaveIdentityAsKey');

      const tx = new PolymeshTransaction<[]>(
        {
          ...txSpec,
          transaction,
        },
        context
      );

      expect(tx.supportsSubsidy()).toBe(false);
    });
  });
});
