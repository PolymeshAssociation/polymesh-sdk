import BigNumber from 'bignumber.js';
import { groupBy, map } from 'lodash';

import { BaseAsset } from '~/api/entities/Asset/Base';
import { FungibleSettlements } from '~/api/entities/Asset/Base/Settlements';
import { AssetHolders } from '~/api/entities/Asset/Fungible/AssetHolders';
import { Checkpoints } from '~/api/entities/Asset/Fungible/Checkpoints';
import { CorporateActions } from '~/api/entities/Asset/Fungible/CorporateActions';
import { Issuance } from '~/api/entities/Asset/Fungible/Issuance';
import { Offerings } from '~/api/entities/Asset/Fungible/Offerings';
import { TransferRestrictions } from '~/api/entities/Asset/Fungible/TransferRestrictions';
import { AccountLike, UniqueIdentifiers } from '~/api/entities/types';
import {
  Account,
  approveAllowance,
  Context,
  controllerTransfer,
  Identity,
  redeemTokens,
} from '~/internal';
import { assetQuery, assetTransactionQuery } from '~/middleware/queries/assets';
import { tickerExternalAgentHistoryQuery } from '~/middleware/queries/externalAgents';
import { AssetTransactionsOrderBy, Query } from '~/middleware/types';
import {
  ApproveAllowanceParams,
  AssetAllowance,
  ControllerTransferParams,
  EventIdentifier,
  HistoricAgentOperation,
  HistoricAssetTransaction,
  MiddlewarePaginationOptions,
  ProcedureMethod,
  RedeemTokensParams,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import { UNLIMITED_ALLOWANCE } from '~/utils/constants';
import {
  accountIdToString,
  assetIdToString,
  assetToMeshAssetId,
  balanceToBigNumber,
  middlewareEventDetailsToEventIdentifier,
  middlewarePortfolioToPortfolio,
  portfolioIdStringToPortfolio,
  stringToAccountId,
  u128ToBigNumber,
} from '~/utils/conversion';
import { assetIdToPrecompileAddress } from '~/utils/eth';
import {
  asAccount,
  calculateNextKey,
  createProcedureMethod,
  getAssetIdForMiddleware,
  getAssetIdFromMiddleware,
  optionize,
  requestPaginated,
} from '~/utils/internal';

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

    this.approveAllowance = createProcedureMethod(
      { getProcedureAndArgs: args => [approveAllowance, { asset: this, ...args }] },
      context
    );
  }

  /**
   * The address at which this Asset can be called as an ERC-20 token from EVM contracts and
   *   Ethereum tooling, i.e. `0x<Asset ID>00080000`, EIP-55 checksummed
   *
   * @note every fungible Asset is exposed automatically, with nothing to deploy or register. Calls
   *   run the same checks as the equivalent extrinsic, so compliance, transfer restrictions and
   *   freezes still apply
   * @note the ERC-20 precompile is available from Polymesh 8.1. The address is computed, not read
   *   from the chain, so it is returned on an older chain too, where nothing answers at it
   */
  public get evmAddress(): string {
    return assetIdToPrecompileAddress(this.id, 'fungible');
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
      tickerExternalAgentHistoryQuery({
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
   * @param opts.orderBy - how to order the results: one key, or several to decide the rows a
   *   single key leaves tied. The read's own unique key is appended to whatever is passed, so
   *   that paging cannot repeat or skip a row
   *
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(
    opts: MiddlewarePaginationOptions & {
      orderBy?: AssetTransactionsOrderBy | AssetTransactionsOrderBy[];
    }
  ): Promise<ResultSet<HistoricAssetTransaction>> {
    const { context, id } = this;
    const { size, start, orderBy } = opts;

    const middlewareAssetId = await getAssetIdForMiddleware(id, context);

    const {
      data: {
        assetTransactions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetTransactions'>>(
      assetTransactionQuery(
        {
          assetId: middlewareAssetId,
        },
        size,
        start,
        orderBy
      )
    );

    const data: HistoricAssetTransaction[] = [];

    const getAccount = (address: string): Account => new Account({ address }, context);

    for (const {
      asset,
      amount,
      fromPortfolioId,
      fromAccount: fromAddress,
      toPortfolioId,
      toAccount: toAddress,
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
      const fromAccount = optionize(getAccount)(fromAddress);
      const toAccount = optionize(getAccount)(toAddress);

      const assetId = getAssetIdFromMiddleware(asset!.id);

      data.push({
        asset: new FungibleAsset({ assetId }, context),
        amount: new BigNumber(amount).shiftedBy(-6),
        event: eventId,
        from: optionize(middlewarePortfolioToPortfolio)(fromPortfolio, context),
        fromAccount,
        to: optionize(middlewarePortfolioToPortfolio)(toPortfolio, context),
        toAccount,
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
      },
    } = this;
    const rawAssetId = assetToMeshAssetId(this, context);

    const [tokenSize, nftId] = await Promise.all([
      asset.assets.size(rawAssetId),
      nft.collectionAsset(rawAssetId),
    ]);

    return !tokenSize.isZero() && nftId.isZero();
  }

  /**
   * Approve spender account allowance for transferring this Asset
   *
   * @note Replaces any existing allowance for this if an allowance already exists for spender account for this Asset.
   * Setting `amount` to 0 revokes the allowance.
   *
   * On every spend transaction, the spender account's allowance will be decremented by the amount transferred.
   */
  public approveAllowance: ProcedureMethod<ApproveAllowanceParams, void>;

  /**
   * Retrieve every allowance an Account has approved for this Asset — each spender and what it may
   *   transfer
   *
   * @param args.owner - the Account whose approvals to read
   *
   * @note not paginated: allowances are keyed by owner, spender and Asset in that order, so the
   *   Asset can only be filtered after reading. Bounded by how many approvals the owner has made
   *   across all Assets
   */
  public async getAllowances(args: { owner: AccountLike }): Promise<AssetAllowance[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      id: assetId,
    } = this;

    const { address: ownerAddress } = asAccount(args.owner, context);

    const rawOwner = stringToAccountId(ownerAddress, context);

    const { entries } = await requestPaginated(asset.allowances, { arg: rawOwner });

    return entries
      .filter(([{ args: keys }]) => assetIdToString(keys[2]) === assetId)
      .map(([{ args: keys }, rawAmount]) => ({
        asset: this,
        spender: new Account({ address: accountIdToString(keys[1]) }, context),
        amount: balanceToBigNumber(rawAmount),
        unlimited: u128ToBigNumber(rawAmount).eq(UNLIMITED_ALLOWANCE),
      }));
  }

  /**
   * Retrieve the amount of allowance for a spender account as approved by owner
   */
  public async getAllowance(args: {
    owner: AccountLike;
    spender: AccountLike;
  }): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
    } = this;

    const { owner, spender } = args;

    const rawAssetId = assetToMeshAssetId(this, context);

    const { address: ownerAddress } = asAccount(owner, context);
    const { address: spenderAddress } = asAccount(spender, context);

    const rawOwner = stringToAccountId(ownerAddress, context);
    const rawSpender = stringToAccountId(spenderAddress, context);

    const allowance = await asset.allowances(rawOwner, rawSpender, rawAssetId);

    return balanceToBigNumber(allowance);
  }
}
