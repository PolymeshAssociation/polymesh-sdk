import BigNumber from 'bignumber.js';
import { groupBy, map } from 'lodash';

import { BaseAsset } from '~/api/entities/Asset/Base';
import { Context, controllerTransfer, Identity, redeemTokens } from '~/internal';
import { assetQuery, assetTransactionQuery } from '~/middleware/queries/assets';
import { tickerExternalAgentHistoryQuery } from '~/middleware/queries/externalAgents';
import { Query } from '~/middleware/types';
import {
  ControllerTransferParams,
  EventIdentifier,
  HistoricAgentOperation,
  HistoricAssetTransaction,
  ProcedureMethod,
  RedeemTokensParams,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetToMeshAssetId,
  balanceToBigNumber,
  middlewareEventDetailsToEventIdentifier,
  middlewarePortfolioToPortfolio,
  portfolioIdStringToPortfolio,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  getAssetIdForMiddleware,
  getAssetIdFromMiddleware,
  optionize,
} from '~/utils/internal';

import { FungibleSettlements } from '../Base/Settlements';
import { UniqueIdentifiers } from '../types';
import { AssetHolders } from './AssetHolders';
import { Checkpoints } from './Checkpoints';
import { CorporateActions } from './CorporateActions';
import { Issuance } from './Issuance';
import { Offerings } from './Offerings';
import { TransferRestrictions } from './TransferRestrictions';

/**
 * Class used to manage all Fungible Asset functionality
 */
export class FungibleAsset extends BaseAsset {
  public settlements: FungibleSettlements;
  public assetHolders: AssetHolders;
  public issuance: Issuance;
  public transferRestrictions: TransferRestrictions;
  public offerings: Offerings;
  public checkpoints: Checkpoints;
  public corporateActions: CorporateActions;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    this.settlements = new FungibleSettlements(this, context);
    this.assetHolders = new AssetHolders(this, context);
    this.issuance = new Issuance(this, context);
    this.transferRestrictions = new TransferRestrictions(this, context);
    this.offerings = new Offerings(this, context);
    this.checkpoints = new Checkpoints(this, context);
    this.corporateActions = new CorporateActions(this, context);

    this.redeem = createProcedureMethod(
      { getProcedureAndArgs: args => [redeemTokens, { asset: this, ...args }] },
      context
    );
    this.controllerTransfer = createProcedureMethod(
      { getProcedureAndArgs: args => [controllerTransfer, { asset: this, ...args }] },
      context
    );
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { id, context } = this;

    const middlewareAssetId = await getAssetIdForMiddleware(id, context);

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assets'>>(
      assetQuery({
        id: middlewareAssetId,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(asset?.createdBlock, asset?.eventIdx);
  }

  /**
   * Redeem (burn) an amount of this Asset's tokens
   */
  public redeem: ProcedureMethod<RedeemTokensParams, void>;

  /**
   * Retrieve the amount of unique investors that hold this Asset
   */
  public async investorCount(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { balanceOf },
          },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(this, context);

    const balanceEntries = await balanceOf.entries(rawAssetId);

    const assetBalances = balanceEntries.filter(
      ([, balance]) => !balanceToBigNumber(balance).isZero()
    );

    return new BigNumber(assetBalances.length);
  }

  /**
   * Force a transfer from a given Portfolio to the caller’s default Portfolio
   */
  public controllerTransfer: ProcedureMethod<ControllerTransferParams, void>;

  /**
   * Retrieve this Asset's Operation History
   *
   * @note Operations are grouped by the agent Identity who performed them
   *
   * @note uses the middlewareV2
   */
  public async getOperationHistory(): Promise<HistoricAgentOperation[]> {
    const { context, id: assetId } = this;

    const middlewareAssetId = await getAssetIdForMiddleware(assetId, context);

    const {
      data: {
        tickerExternalAgentHistories: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentHistories'>>(
      tickerExternalAgentHistoryQuery(context.isSqIdPadded, {
        assetId: middlewareAssetId,
      })
    );

    const groupedData = groupBy(nodes, 'identityId');

    return map(groupedData, (history, did) => ({
      identity: new Identity({ did }, context),
      history: history.map(({ createdBlock, eventIdx }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx)
      ),
    }));
  }

  /**
   * Retrieve this Asset's transaction History
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(opts: {
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<HistoricAssetTransaction>> {
    const { context, id } = this;
    const { size, start } = opts;

    const middlewareAssetId = await getAssetIdForMiddleware(id, context);

    const {
      data: {
        assetTransactions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetTransactions'>>(
      assetTransactionQuery(
        context.isSqIdPadded,
        {
          assetId: middlewareAssetId,
        },
        size,
        start
      )
    );

    const data: HistoricAssetTransaction[] = [];

    for (const {
      asset,
      amount,
      fromPortfolioId,
      toPortfolioId,
      createdBlock,
      eventId,
      eventIdx,
      extrinsicIdx,
      fundingRound,
      instructionId,
      instructionMemo,
    } of nodes) {
      const fromPortfolio = optionize(portfolioIdStringToPortfolio)(fromPortfolioId);
      const toPortfolio = optionize(portfolioIdStringToPortfolio)(toPortfolioId);

      const assetId = getAssetIdFromMiddleware(asset, context);

      data.push({
        asset: new FungibleAsset({ assetId }, context),
        amount: new BigNumber(amount).shiftedBy(-6),
        event: eventId,
        from: optionize(middlewarePortfolioToPortfolio)(fromPortfolio, context),
        to: optionize(middlewarePortfolioToPortfolio)(toPortfolio, context),
        fundingRound,
        instructionId: instructionId ? new BigNumber(instructionId) : undefined,
        instructionMemo,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicIndex: new BigNumber(extrinsicIdx!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx),
      });
    }

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Determine whether this FungibleAsset exists on chain
   */
  public override async exists(): Promise<boolean> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset, nft },
        },
        isV6,
      },
    } = this;
    const rawAssetId = assetToMeshAssetId(this, context);

    let collectionsStorage = nft.collectionAsset;
    let tokensStorage = asset.assets;

    /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
    if (isV6) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionsStorage = (nft as any).collectionTicker; // NOSONAR
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tokensStorage = (asset as any).tokens; // NOSONAR
    }

    const [tokenSize, nftId] = await Promise.all([
      tokensStorage.size(rawAssetId),
      collectionsStorage(rawAssetId),
    ]);

    return !tokenSize.isZero() && nftId.isZero();
  }
}
