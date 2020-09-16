import BigNumber from 'bignumber.js';
import { CanTransferResult } from 'polymesh-types/types';

import { Identity, Namespace, SecurityToken } from '~/api/entities';
import { toggleFreezeTransfers, transferToken, TransferTokenParams } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { SubCallback, TransferStatus, UnsubCallback } from '~/types';
import {
  boolToBoolean,
  canTransferResultToTransferStatus,
  numberToBalance,
  stringToAccountId,
  stringToIdentityId,
  stringToTicker,
  valueToDid,
} from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

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
   *
   * @note can be subscribed to
   */
  public areFrozen(): Promise<boolean>;
  public areFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async areFrozen(callback?: SubCallback<boolean>): Promise<boolean | UnsubCallback> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    if (callback) {
      return asset.frozen(rawTicker, frozen => {
        callback(boolToBoolean(frozen));
      });
    }

    const result = await asset.frozen(rawTicker);

    return boolToBoolean(result);
  }

  /**
   * Check whether it is possible to transfer a certain amount of this asset between two Identities
   *
   * @param args.from - sender Identity (optional, defaults to the current Identity)
   * @param args.to - receiver Identity
   * @param args.amount - amount of tokens to transfer
   */
  public async canTransfer(args: {
    from?: string | Identity;
    to: string | Identity;
    amount: BigNumber;
  }): Promise<TransferStatus> {
    const { from = await this.context.getCurrentIdentity(), to, amount } = args;
    return this._canTransfer({ from, to, amount });
  }

  /**
   * Check whether it is possible to mint a certain amount of this asset
   *
   * @param args.to - receiver Identity
   * @param args.amount - amount of tokens to mint
   */
  public canMint(args: { to: string | Identity; amount: BigNumber }): Promise<TransferStatus> {
    return this._canTransfer({ ...args, from: null });
  }

  /**
   * @hidden
   */
  private async _canTransfer(args: {
    from?: null | string | Identity;
    to: string | Identity;
    amount: BigNumber;
  }): Promise<TransferStatus> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { rpc },
      },
      context,
    } = this;

    const { from, to, amount } = args;

    let fromDid = null;
    if (from) {
      fromDid = stringToIdentityId(valueToDid(from), context);
    }
    const toDid = valueToDid(to);

    /*
     * The RPC requires a sender account ID (although it's not being used at the moment). We use the current account
     * or a dummy account (Alice's in testnet) if the SDK was instanced without one
     */
    const senderAddress = context.currentPair?.address || DUMMY_ACCOUNT_ID;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: CanTransferResult = await (rpc as any).asset.canTransfer(
      stringToAccountId(senderAddress, context),
      stringToTicker(ticker, context),
      fromDid,
      stringToIdentityId(toDid, context),
      numberToBalance(amount, context)
    );

    return canTransferResultToTransferStatus(res);
  }

  /**
   * Transfer an amount of the token to another Identity.
   */
  public async transfer(args: TransferTokenParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return transferToken.prepare({ ticker, ...args }, context);
  }
}
