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
    mortality: { immortal: true },
  };

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.initMocks();
  });

  describe('method: toTransactionSpec', () => {
    const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
    const args = tuple('FOO');
    const resolver = (): number => 1;
    const transformer = (): number => 2;
    const paidForBy = entityMockUtils.getIdentityInstance();
    const multiSig = entityMockUtils.getMultiSigInstance();

    it('should return the tx spec of a transaction', () => {
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

    it('should include multiSig if present', () => {
      const tx = new PolymeshTransaction(
        {
          ...txSpec,
          transaction,
          args,
          resolver,
          transformer,
          feeMultiplier: new BigNumber(10),
          paidForBy,
          multiSig,
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
        multiSig,
      });
    });
  });

  describe('get: args', () => {
    it('should return unwrapped args', () => {
      const transaction = dsMockUtils.createTxMock('asset', 'registerTicker');
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
      context.supportsSubsidy.mockReturnValueOnce(false);

      const transaction = dsMockUtils.createTxMock('identity', 'leaveIdentityAsKey');

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
