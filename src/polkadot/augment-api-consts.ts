// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { Bytes, u32, u64 } from '@polkadot/types/primitive';
import { Gas } from '@polkadot/types/interfaces/contracts';
import { Balance, BalanceOf, BlockNumber, Moment } from '@polkadot/types/interfaces/runtime';
import { SessionIndex } from '@polkadot/types/interfaces/session';
import { EraIndex } from '@polkadot/types/interfaces/staking';

declare module '@polkadot/metadata/Decorated/consts/types' {
  export interface Constants {
    babe: {
      /**
       * The number of **slots** that an epoch takes. We couple sessions to
       * epochs, i.e. we start a new session once the new epoch begins.
       **/
      epochDuration: AugmentedConst<u64>;
      /**
       * The expected average block time at which BABE should be creating
       * blocks. Since BABE is probabilistic it is not trivial to figure out
       * what the expected average block time should be based on the slot
       * duration and the security parameter `c` (where `1 - c` represents
       * the probability of a slot being empty).
       **/
      expectedBlockTime: AugmentedConst<Moment>;
    };
    balances: {
      /**
       * This is no longer needed but kept for compatibility reasons
       * The minimum amount required to keep an account open.
       **/
      existentialDeposit: AugmentedConst<Balance>;
    };
    bridge: {
      maxTimelockedTxsPerBlock: AugmentedConst<u32>;
    };
    contracts: {
      /**
       * The maximum amount of gas that could be expended per block. A reasonable
       * default value is 10_000_000.
       **/
      blockGasLimit: AugmentedConst<Gas>;
      /**
       * The base fee charged for calling into a contract. A reasonable default
       * value is 135.
       **/
      callBaseFee: AugmentedConst<Gas>;
      /**
       * The fee required to instantiate a contract instance. A reasonable default value
       * is 21.
       **/
      contractFee: AugmentedConst<BalanceOf>;
      /**
       * The base fee charged for instantiating a contract. A reasonable default value
       * is 175.
       **/
      instantiateBaseFee: AugmentedConst<Gas>;
      /**
       * The maximum nesting level of a call/instantiate stack. A reasonable default
       * value is 100.
       **/
      maxDepth: AugmentedConst<u32>;
      /**
       * The maximum size of a storage value in bytes. A reasonable default is 16 KiB.
       **/
      maxValueSize: AugmentedConst<u32>;
      /**
       * Price of a byte of storage per one block interval. Should be greater than 0.
       **/
      rentByteFee: AugmentedConst<BalanceOf>;
      /**
       * The amount of funds a contract should deposit in order to offset
       * the cost of one byte.
       *
       * Let's suppose the deposit is 1,000 BU (balance units)/byte and the rent is 1 BU/byte/day,
       * then a contract with 1,000,000 BU that uses 1,000 bytes of storage would pay no rent.
       * But if the balance reduced to 500,000 BU and the storage stayed the same at 1,000,
       * then it would pay 500 BU/day.
       **/
      rentDepositOffset: AugmentedConst<BalanceOf>;
      /**
       * Number of block delay an extrinsic claim surcharge has.
       *
       * When claim surcharge is called by an extrinsic the rent is checked
       * for current_block - delay
       **/
      signedClaimHandicap: AugmentedConst<BlockNumber>;
      /**
       * Size of a contract at the time of instantiation. This is a simple way to ensure that
       * empty contracts eventually gets deleted.
       **/
      storageSizeOffset: AugmentedConst<u32>;
      /**
       * Reward that is received by the party whose touch has led
       * to removal of a contract.
       **/
      surchargeReward: AugmentedConst<BalanceOf>;
      /**
       * The minimum amount required to generate a tombstone.
       **/
      tombstoneDeposit: AugmentedConst<BalanceOf>;
      /**
       * The fee to be paid for making a transaction; the base.
       **/
      transactionBaseFee: AugmentedConst<BalanceOf>;
      /**
       * The fee to be paid for making a transaction; the per-byte portion.
       **/
      transactionByteFee: AugmentedConst<BalanceOf>;
    };
    finalityTracker: {
      /**
       * The delay after which point things become suspicious. Default is 1000.
       **/
      reportLatency: AugmentedConst<BlockNumber>;
      /**
       * The number of recent samples to keep from this chain. Default is 101.
       **/
      windowSize: AugmentedConst<BlockNumber>;
    };
    session: {
      /**
       * Used as first key for `NextKeys` and `KeyOwner` to put all the data into the same branch
       * of the trie.
       **/
      dedupKeyPrefix: AugmentedConst<Bytes>;
    };
    staking: {
      /**
       * Number of eras that staked funds must remain bonded for.
       **/
      bondingDuration: AugmentedConst<EraIndex>;
      /**
       * Number of sessions per era.
       **/
      sessionsPerEra: AugmentedConst<SessionIndex>;
    };
    timestamp: {
      /**
       * The minimum period between blocks. Beware that this is different to the *expected* period
       * that the block production apparatus provides. Your chosen consensus system will generally
       * work with this to determine a sensible block time. e.g. For Aura, it will be double this
       * period on default settings.
       **/
      minimumPeriod: AugmentedConst<Moment>;
    };
    transactionPayment: {
      /**
       * The fee to be paid for making a transaction; the base.
       **/
      transactionBaseFee: AugmentedConst<BalanceOf>;
      /**
       * The fee to be paid for making a transaction; the per-byte portion.
       **/
      transactionByteFee: AugmentedConst<BalanceOf>;
    };
  }
}
