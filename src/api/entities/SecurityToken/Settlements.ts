import BigNumber from 'bignumber.js';
import { CanTransferResult } from 'polymesh-types/types';

import { Namespace, SecurityToken } from '~/internal';
import { PortfolioLike, TransferStatus } from '~/types';
import {
  canTransferResultToTransferStatus,
  numberToBalance,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  stringToAccountId,
  stringToTicker,
} from '~/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';

/**
 * Handles all Security Token Settlements related functionality
 */
export class Settlements extends Namespace<SecurityToken> {
  /**
   * Check whether it is possible to create a settlement instruction to transfer a certain amount of this asset between two Portfolios.
   *
   * @note this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
   *   they would become locked. From that point, further calls to this function would yield failed results because of the funds being locked, even though they haven't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the current Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.amount - amount of tokens to transfer
   */
  public async canSettle(args: {
    from?: PortfolioLike;
    to: PortfolioLike;
    amount: BigNumber;
  }): Promise<TransferStatus> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { rpc },
      },
      context,
      parent,
    } = this;

    const { to, amount } = args;
    let { from } = args;
    let isDivisible;

    if (!from) {
      [{ isDivisible }, from] = await Promise.all([parent.details(), context.getCurrentIdentity()]);
    } else {
      ({ isDivisible } = await parent.details());
    }

    /*
     * The RPC requires a sender account ID (although it's not being used at the moment). We use the current account
     * or a dummy account (Alice's in testnet) if the SDK was instanced without one
     */
    const senderAddress = context.currentPair?.address || DUMMY_ACCOUNT_ID;

    const [fromPortfolio, toPortfolio] = await Promise.all([
      portfolioLikeToPortfolioId(from, context),
      portfolioLikeToPortfolioId(to, context),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: CanTransferResult = await (rpc as any).asset.canTransfer(
      stringToAccountId(senderAddress, context),
      null,
      portfolioIdToMeshPortfolioId(fromPortfolio, context),
      null,
      portfolioIdToMeshPortfolioId(toPortfolio, context),
      stringToTicker(ticker, context),
      numberToBalance(amount, context, isDivisible)
    );

    return canTransferResultToTransferStatus(res);
  }
}
