import { Signer as PolkadotSigner } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { Context, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';

describe('Polymesh Transaction class', () => {
  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  const txSpec = {
    signingAddress: 'signingAddress',
    signer: 'signer' as PolkadotSigner,
    fee: new BigNumber(100),
  };

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.initMocks();
  });

  describe('method: toTransactionSpec', () => {
    it('should return the tx spec of a transaction', () => {
      const transaction = dsMockUtils.createTxStub('asset', 'registerTicker');
      const args = tuple('FOO');
      const resolver = (): number => 1;
      const transformer = (): number => 2;
      const paidForBy = entityMockUtils.getIdentityInstance();

      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver,
          transformer,
          feeMultiplier: new BigNumber(10),
          paidForBy,
        },
        context
      );

      expect(PolymeshTransaction.toTransactionSpec(tx)).toEqual({
        resolver,
        transformer,
        paidForBy,
        transaction,
        args,
        fee: txSpec.fee,
        feeMultiplier: new BigNumber(10),
      });
    });
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
          resolver: undefined,
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

      const tx = new PolymeshTransaction<void, void, []>(
        {
          ...txSpec,
          transaction,
          resolver: undefined,
        },
        context
      );

      expect(tx.supportsSubsidy()).toBe(false);
    });
  });
});
