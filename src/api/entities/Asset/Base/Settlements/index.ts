import { DispatchResult } from '@polkadot/types/interfaces/system';
import BigNumber from 'bignumber.js';

import { toggleTickerPreApproval } from '~/api/procedures/toggleTickerPreApproval';
import { assertPortfolioExists } from '~/api/procedures/utils';
import { BaseAsset, Context, FungibleAsset, Namespace, Nft, PolymeshError } from '~/internal';
import { CanTransferGranularReturn } from '~/polkadot';
import {
  ErrorCode,
  NftCollection,
  NoArgsProcedureMethod,
  PortfolioLike,
  TransferBreakdown,
} from '~/types';
import { isFungibleAsset } from '~/utils';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  granularCanTransferResultToTransferBreakdown,
  nftToMeshNft,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * @hidden
 */
class BaseSettlements<T extends BaseAsset> extends Namespace<T> {
  /**
   * Pre-approves receiving this asset for the signing identity. Receiving this asset in a settlement will not require manual affirmation
   */
  public preApprove: NoArgsProcedureMethod<void>;

  /**
   * Removes pre-approval for this asset
   */
  public removePreApproval: NoArgsProcedureMethod<void>;

  /**
   * @hidden
   */
  constructor(parent: T, context: Context) {
    super(parent, context);

    this.preApprove = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleTickerPreApproval, { asset: parent, preApprove: true }],
        voidArgs: true,
      },
      context
    );

    this.removePreApproval = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleTickerPreApproval, { asset: parent, preApprove: false }],
        voidArgs: true,
      },
      context
    );
  }

  /**
   * Check whether it is possible to create a settlement instruction to transfer a certain amount of this asset between two Portfolios. Returns a breakdown of
   *   the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
   *   failures
   *
   * @note this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
   *   they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though they haven't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the signing Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.amount - amount of fungible tokens to transfer
   * @param args.nfts - the NFTs to transfer
   *
   */
  protected async canTransferBase(
    args:
      | {
          from?: PortfolioLike;
          to: PortfolioLike;
          amount: BigNumber;
        }
      | {
          from?: PortfolioLike;
          to: PortfolioLike;
          nfts: (Nft | BigNumber)[];
        }
  ): Promise<TransferBreakdown> {
    const {
      parent,
      context: {
        polymeshApi: { call },
      },
      context,
    } = this;

    const { assetApi, nftApi } = call;

    const { to } = args;
    const from = args.from ?? (await context.getSigningIdentity());

    let isDivisible = false;
    let amount = new BigNumber(0);
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

    if (isFungibleAsset(parent)) {
      ({ isDivisible } = await parent.details());
    }

    const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromPortfolioId, context);
    const rawToPortfolio = portfolioIdToMeshPortfolioId(toPortfolioId, context);

    let granularResult: CanTransferGranularReturn;
    let nftResult;

    const rawAssetId = assetToMeshAssetId(parent, context);

    if ('amount' in args) {
      amount = args.amount;
      ({ isDivisible } = await parent.details());
      granularResult = await assetApi.canTransferGranular<CanTransferGranularReturn>(
        fromCustodian.did,
        rawFromPortfolio,
        toCustodian.did,
        rawToPortfolio,
        rawAssetId,
        bigNumberToBalance(amount, context, isDivisible)
      );
    } else {
      const rawNfts = nftToMeshNft(parent, args.nfts, context);
      [granularResult, nftResult] = await Promise.all([
        assetApi.canTransferGranular<CanTransferGranularReturn>(
          fromCustodian.did,
          rawFromPortfolio,
          toCustodian.did,
          rawToPortfolio,
          rawAssetId,
          bigNumberToBalance(amount, context, isDivisible)
        ),
        nftApi.validateNftTransfer<DispatchResult>(rawFromPortfolio, rawToPortfolio, rawNfts),
      ]);
    }

    if (!granularResult.isOk) {
      throw new PolymeshError({
        code: ErrorCode.LimitExceeded,
        message:
          'RPC result from "asset.canTransferGranular" was not OK. Execution meter was likely exceeded',
      });
    }

    return granularCanTransferResultToTransferBreakdown(granularResult.asOk, nftResult, context);
  }
}

/**
 * Handles all Asset Settlements related functionality
 */
export class FungibleSettlements extends BaseSettlements<FungibleAsset> {
  /**
   * Check whether it is possible to create a settlement instruction to transfer a certain amount of this asset between two Portfolios. Returns a breakdown of
   *   the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
   *   failures
   *
   * @note this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
   *   they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though they haven't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the signing Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.amount - amount of tokens to transfer
   *
   */
  public async canTransfer(args: {
    from?: PortfolioLike;
    to: PortfolioLike;
    amount: BigNumber;
  }): Promise<TransferBreakdown> {
    return this.canTransferBase(args);
  }
}

/**
 * Handles all Asset Settlements related functionality
 */
export class NonFungibleSettlements extends BaseSettlements<NftCollection> {
  /**
   * Check whether it is possible to create a settlement instruction to transfer an NFT between two Portfolios. Returns a breakdown of
   *   the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
   *   failures
   *
   * @note this takes locked tokens into account. For example, if portfolio A has NFTs 1, 2 and 3 of a collection and this function is called to check if 1 of them can be
   *   transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer that token,
   *   they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though it hasn't been
   *   transferred yet
   *
   * @param args.from - sender Portfolio (optional, defaults to the signing Identity's Default Portfolio)
   * @param args.to - receiver Portfolio
   * @param args.nfts - the NFTs to transfer
   *
   */
  public async canTransfer(args: {
    from?: PortfolioLike;
    to: PortfolioLike;
    nfts: (BigNumber | Nft)[];
  }): Promise<TransferBreakdown> {
    return this.canTransferBase(args);
  }
}
