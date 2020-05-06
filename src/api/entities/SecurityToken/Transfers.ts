import { u8 } from '@polkadot/types';
import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { toggleFreezeTransfers } from '~/api/procedures';
import { Namespace, TransactionQueue } from '~/base';
import { TransferStatus } from '~/types';
import {
  boolToBoolean,
  numberToBalance,
  stringToAccountId,
  stringToIdentityId,
  stringToTicker,
  u8ToTransferStatus,
  valueToDid,
} from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Transfer related functionality
 */
export class Transfers extends Namespace<SecurityToken> {
  /**
   * Freezes transfers and minting of the Security Token
   */
  public freeze(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return toggleFreezeTransfers.prepare({ ticker, freeze: true }, context);
  }

  /**
   * Unfreeze transfers and minting of the Security Token
   */
  public unfreeze(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return toggleFreezeTransfers.prepare({ ticker, freeze: false }, context);
  }

  /**
   * Check whether transfers are frozen for the Security Token
   */
  public async areFrozen(): Promise<boolean> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;

    const result = await asset.frozen(ticker);

    return boolToBoolean(result);
  }

  /**
   * Check whether it is possible to transfer a certain amount of this asset between two identities
   */
  public async canTransfer(args: {
    from?: string | Identity;
    to: string | Identity;
    amount: BigNumber;
  }): Promise<TransferStatus> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { rpc, query },
      },
      context,
    } = this;

    const { from = context.getCurrentIdentity(), to, amount } = args;

    const fromDid = valueToDid(from);
    const toDid = valueToDid(to);

    /*
     * The RPC requires a sender account ID (although it's not being used at the moment). We use the current account
     * or a dummy account (Alice's in testnet) if the SDK was instanced without one
     */
    const senderAddress =
      context.currentPair?.address || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

    const hash = await query.system.parentHash();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status: u8 = await (rpc as any).asset.canTransfer(
      stringToAccountId(senderAddress, context),
      stringToTicker(ticker, context),
      stringToIdentityId(fromDid, context),
      stringToIdentityId(toDid, context),
      numberToBalance(amount, context)
    );

    console.log('STATUS', status);

    return u8ToTransferStatus(status);
  }
}
