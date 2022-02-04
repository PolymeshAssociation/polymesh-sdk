import BigNumber from 'bignumber.js';
import { CanTransferResult, GranularCanTransferResult } from 'polymesh-types/types';

import { assertPortfolioExists } from '~/api/procedures/utils';
import { Asset, Namespace } from '~/internal';
import { PortfolioLike, TransferBreakdown, TransferStatus } from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import {
  canTransferResultToTransferStatus,
  granularCanTransferResultToTransferBreakdown,
  numberToBalance,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToAccountId,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';

/**
 * Handles all Asset Settlements related functionality
 */
export class Settlements extends Namespace<Asset> {
  /**
   * Check whether it is possible to create a settlement Instruction to transfer a certain amount of this Asset's tokens between two Portfolios.
   *
   * @note this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
   *   they would become locked. From that point, further calls to this function would yield failed results because of the funds being locked, even though they haven't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the current Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.amount - amount of tokens to transfer
   *
   * @deprecated in favor of [[canTransfer]]
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
     * or a dummy Account (Alice's in testnet) if the SDK was instanced without one
     */
    const senderAddress = context.currentPair?.address || DUMMY_ACCOUNT_ID;

    const fromPortfolioId = portfolioLikeToPortfolioId(from);
    const toPortfolioId = portfolioLikeToPortfolioId(to);
    const fromPortfolio = portfolioIdToPortfolio(fromPortfolioId, context);
    const toPortfolio = portfolioIdToPortfolio(toPortfolioId, context);

    const [, , fromCustodian, toCustodian] = await Promise.all([
      assertPortfolioExists(fromPortfolioId, context),
      assertPortfolioExists(toPortfolioId, context),
      fromPortfolio.getCustodian(),
      toPortfolio.getCustodian(),
    ]);

    const res: CanTransferResult = await rpc.asset.canTransfer(
      stringToAccountId(senderAddress, context),
      stringToIdentityId(fromCustodian.did, context),
      portfolioIdToMeshPortfolioId(fromPortfolioId, context),
      stringToIdentityId(toCustodian.did, context),
      portfolioIdToMeshPortfolioId(toPortfolioId, context),
      stringToTicker(ticker, context),
      numberToBalance(amount, context, isDivisible)
    );

    return canTransferResultToTransferStatus(res);
  }

  /**
   * Check whether it is possible to create a settlement instruction to transfer a certain amount of this asset between two Portfolios. Returns a breakdown of
   *   the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
   *   failures
   *
   * @note this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
   *   they would become locked. From that point, further calls to this function would yield failed results because of the funds being locked, even though they haven't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the current Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.amount - amount of tokens to transfer
   *
   */
  public async canTransfer(args: {
    from?: PortfolioLike;
    to: PortfolioLike;
    amount: BigNumber;
  }): Promise<TransferBreakdown> {
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

    const fromPortfolioId = portfolioLikeToPortfolioId(from);
    const toPortfolioId = portfolioLikeToPortfolioId(to);
    const fromPortfolio = portfolioIdToPortfolio(fromPortfolioId, context);
    const toPortfolio = portfolioIdToPortfolio(toPortfolioId, context);

    const [, , fromCustodian, toCustodian] = await Promise.all([
      assertPortfolioExists(fromPortfolioId, context),
      assertPortfolioExists(toPortfolioId, context),
      fromPortfolio.getCustodian(),
      toPortfolio.getCustodian(),
    ]);

    const res: GranularCanTransferResult = await rpc.asset.canTransferGranular(
      stringToIdentityId(fromCustodian.did, context),
      portfolioIdToMeshPortfolioId(fromPortfolioId, context),
      stringToIdentityId(toCustodian.did, context),
      portfolioIdToMeshPortfolioId(toPortfolioId, context),
      stringToTicker(ticker, context),
      numberToBalance(amount, context, isDivisible)
    );

    return granularCanTransferResultToTransferBreakdown(res, context);
  }
}
