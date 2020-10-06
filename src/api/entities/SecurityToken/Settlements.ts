import BigNumber from 'bignumber.js';
import { CanTransferResult } from 'polymesh-types/types';

import { Identity, Namespace, SecurityToken } from '~/api/entities';
import { TransferStatus } from '~/types';
import {
  canTransferResultToTransferStatus,
  numberToBalance,
  portfolioIdToMeshPortfolioId,
  signerToString,
  stringToAccountId,
  stringToTicker,
} from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

/**
 * Handles all Security Token Settlements related functionality
 */
export class Settlements extends Namespace<SecurityToken> {
  /**
   * Check whether it is possible to transfer a certain amount of this asset between two Identities
   *
   * @param args.from - sender Identity (optional, defaults to the current Identity)
   * @param args.to - receiver Identity
   * @param args.amount - amount of tokens to transfer
   */
  public async canSettle(args: {
    from?: string | Identity;
    to: string | Identity;
    amount: BigNumber;
  }): Promise<TransferStatus> {
    const {
      parent: { ticker, details },
      context: {
        polymeshApi: { rpc },
      },
      context,
    } = this;

    const { to, amount } = args;
    let { from } = args;
    let isDivisible;

    if (!from) {
      [{ isDivisible }, from] = await Promise.all([details(), this.context.getCurrentIdentity()]);
    } else {
      ({ isDivisible } = await details());
    }

    /*
     * The RPC requires a sender account ID (although it's not being used at the moment). We use the current account
     * or a dummy account (Alice's in testnet) if the SDK was instanced without one
     */
    const senderAddress = context.currentPair?.address || DUMMY_ACCOUNT_ID;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: CanTransferResult = await (rpc as any).asset.canTransfer(
      stringToAccountId(senderAddress, context),
      null,
      portfolioIdToMeshPortfolioId({ did: signerToString(from) }, context),
      null,
      portfolioIdToMeshPortfolioId({ did: signerToString(to) }, context),
      stringToTicker(ticker, context),
      numberToBalance(amount, context, isDivisible)
    );

    return canTransferResultToTransferStatus(res);
  }
}
