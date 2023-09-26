import { Bytes } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { groupBy, map } from 'lodash';

import { BaseAsset } from '~/api/entities/Asset/BaseAsset';
import { Metadata } from '~/api/entities/Asset/Metadata';
import {
  AuthorizationRequest,
  Context,
  controllerTransfer,
  Identity,
  modifyAsset,
  redeemTokens,
  setVenueFiltering,
  toggleFreezeTransfers,
  transferAssetOwnership,
} from '~/internal';
import {
  assetQuery,
  assetTransactionQuery,
  tickerExternalAgentHistoryQuery,
} from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ControllerTransferParams,
  EventIdentifier,
  HistoricAgentOperation,
  HistoricAssetTransaction,
  ModifyAssetParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RedeemTokensParams,
  ResultSet,
  SetVenueFilteringParams,
  SubCallback,
  TransferAssetOwnershipParams,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  balanceToBigNumber,
  bytesToString,
  middlewareEventDetailsToEventIdentifier,
  middlewarePortfolioToPortfolio,
  stringToTicker,
  tickerToDid,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, optionize } from '~/utils/internal';

import { AssetHolders } from './AssetHolders';
import { Checkpoints } from './Checkpoints';
import { Compliance } from './Compliance';
import { CorporateActions } from './CorporateActions';
import { Documents } from './Documents';
import { Issuance } from './Issuance';
import { Offerings } from './Offerings';
import { Permissions } from './Permissions';
import { Settlements } from './Settlements';
import { TransferRestrictions } from './TransferRestrictions';
import { AssetDetails } from './types';

/**
 * Properties that uniquely identify an Asset
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the Asset
   */
  ticker: string;
}

/**
 * Class used to manage all Asset functionality
 */
export class Asset extends BaseAsset {
  // Namespaces
  public documents: Documents;
  public settlements: Settlements;
  public assetHolders: AssetHolders;
  public issuance: Issuance;
  public compliance: Compliance;
  public transferRestrictions: TransferRestrictions;
  public offerings: Offerings;
  public checkpoints: Checkpoints;
  public corporateActions: CorporateActions;
  public permissions: Permissions;
  public metadata: Metadata;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;
    this.did = tickerToDid(ticker);

    this.documents = new Documents(this, context);
    this.settlements = new Settlements(this, context);
    this.assetHolders = new AssetHolders(this, context);
    this.issuance = new Issuance(this, context);
    this.compliance = new Compliance(this, context);
    this.transferRestrictions = new TransferRestrictions(this, context);
    this.offerings = new Offerings(this, context);
    this.checkpoints = new Checkpoints(this, context);
    this.corporateActions = new CorporateActions(this, context);
    this.permissions = new Permissions(this, context);
    this.metadata = new Metadata(this, context);

    this.transferOwnership = createProcedureMethod(
      { getProcedureAndArgs: args => [transferAssetOwnership, { ticker, ...args }] },
      context
    );
    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyAsset, { ticker, ...args }] },
      context
    );
    this.freeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeTransfers, { ticker, freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeTransfers, { ticker, freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.redeem = createProcedureMethod(
      { getProcedureAndArgs: args => [redeemTokens, { ticker, ...args }] },
      context
    );
    this.controllerTransfer = createProcedureMethod(
      { getProcedureAndArgs: args => [controllerTransfer, { ticker, ...args }] },
      context
    );
    this.setVenueFiltering = createProcedureMethod(
      { getProcedureAndArgs: args => [setVenueFiltering, { ticker, ...args }] },
      context
    );
  }

  /**
   * Transfer ownership of the Asset to another Identity. This generates an authorization request that must be accepted
   *   by the recipient
   *
   * @note this will create {@link api/entities/AuthorizationRequest!AuthorizationRequest | Authorization Request} which has to be accepted by the `target` Identity.
   *   An {@link api/entities/Account!Account} or {@link api/entities/Identity!Identity} can fetch its pending Authorization Requests by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link api/entities/common/namespaces/Authorizations!Authorizations.getOne | authorizations.getOne}
   */
  public transferOwnership: ProcedureMethod<TransferAssetOwnershipParams, AuthorizationRequest>;
  /**
   * Modify some properties of the Asset
   *
   * @throws if the passed values result in no changes being made to the Asset
   */
  public modify: ProcedureMethod<ModifyAssetParams, Asset>;

  /**
   * Retrieve the Asset's funding round
   *
   * @note can be subscribed to
   */
  public currentFundingRound(): Promise<string | null>;
  public currentFundingRound(callback: SubCallback<string | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async currentFundingRound(
    callback?: SubCallback<string | null>
  ): Promise<string | null | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = (roundName: Bytes): string | null => bytesToString(roundName) || null;

    if (callback) {
      return asset.fundingRound(rawTicker, round => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(round));
      });
    }

    const fundingRound = await asset.fundingRound(rawTicker);
    return assembleResult(fundingRound);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { ticker, context } = this;

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assets'>>(
      assetQuery({
        ticker,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(asset?.createdBlock, asset?.eventIdx);
  }

  /**
   * Freeze transfers of the Asset
   */
  public freeze: NoArgsProcedureMethod<Asset>;

  /**
   * Unfreeze transfers of the Asset
   */
  public unfreeze: NoArgsProcedureMethod<Asset>;

  /**
   * Redeem (burn) an amount of this Asset's tokens
   *
   * @note tokens are removed from the caller's Default Portfolio
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
      ticker,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const balanceEntries = await balanceOf.entries(rawTicker);

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
    const { context, ticker: assetId } = this;

    const {
      data: {
        tickerExternalAgentHistories: { nodes },
      },
    } = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentHistories'>>(
      tickerExternalAgentHistoryQuery({
        assetId,
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
    const { context, ticker } = this;
    const { size, start } = opts;

    const {
      data: {
        assetTransactions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'assetTransactions'>>(
      assetTransactionQuery(
        {
          assetId: ticker,
        },
        size,
        start
      )
    );

    const data = nodes.map(
      ({
        assetId,
        amount,
        fromPortfolio,
        toPortfolio,
        createdBlock,
        eventId,
        eventIdx,
        extrinsicIdx,
      }) => ({
        asset: new Asset({ ticker: assetId }, context),
        amount: new BigNumber(amount).shiftedBy(-6),
        event: eventId,
        from: optionize(middlewarePortfolioToPortfolio)(fromPortfolio, context),
        to: optionize(middlewarePortfolioToPortfolio)(toPortfolio, context),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicIndex: new BigNumber(extrinsicIdx!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...middlewareEventDetailsToEventIdentifier(createdBlock!, eventIdx),
      })
    );

    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Determine whether this Asset exists on chain
   */
  public async exists(): Promise<boolean> {
    const { ticker, context } = this;

    const tokenSize = await context.polymeshApi.query.asset.tokens.size(
      stringToTicker(ticker, context)
    );

    return !tokenSize.isZero();
  }

  /**
   * Return the Asset's ticker
   */
  public toHuman(): string {
    return this.ticker;
  }

  /**
   * Enable/disable venue filtering for this Asset and/or set allowed/disallowed venues
   */
  public setVenueFiltering: ProcedureMethod<SetVenueFilteringParams, void>;
}
