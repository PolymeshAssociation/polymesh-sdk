import { Bytes, Option, StorageKey } from '@polkadot/types';
import { BlockNumber, Hash } from '@polkadot/types/interfaces/runtime';
import {
  PalletAssetSecurityToken,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { groupBy, map } from 'lodash';

import { Metadata } from '~/api/entities/Asset/Metadata';
import {
  AuthorizationRequest,
  Context,
  controllerTransfer,
  Entity,
  Identity,
  modifyAsset,
  PolymeshError,
  redeemTokens,
  setVenueFiltering,
  toggleFreezeTransfers,
  transferAssetOwnership,
} from '~/internal';
import { eventByIndexedArgs, tickerExternalAgentHistory } from '~/middleware/queries';
import {
  assetQuery,
  assetTransactionQuery,
  tickerExternalAgentHistoryQuery,
} from '~/middleware/queriesV2';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Query as QueryV2 } from '~/middleware/typesV2';
import {
  ControllerTransferParams,
  ErrorCode,
  EventIdentifier,
  HistoricAgentOperation,
  HistoricAssetTransaction,
  ModifyAssetParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RedeemTokensParams,
  ResultSet,
  SecurityIdentifier,
  SetVenueFilteringParams,
  SubCallback,
  TransferAssetOwnershipParams,
  UnsubCallback,
} from '~/types';
import { Ensured, EnsuredV2, Modify } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  assetIdentifierToSecurityIdentifier,
  assetTypeToKnownOrId,
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  bytesToString,
  hashToString,
  identityIdToString,
  middlewareEventToEventIdentifier,
  middlewareV2EventDetailsToEventIdentifier,
  middlewareV2PortfolioToPortfolio,
  stringToTicker,
  tickerToDid,
} from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, optionize, padString } from '~/utils/internal';

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
export class Asset extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

  /**
   * Identity ID of the Asset (used for Claims)
   */
  public did: string;

  /**
   * ticker of the Asset
   */
  public ticker: string;

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
   * Retrieve the Asset's data
   *
   * @note can be subscribed to
   */
  public details(): Promise<AssetDetails>;
  public details(callback: SubCallback<AssetDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<AssetDetails>
  ): Promise<AssetDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { asset, externalAgents },
        },
        isV5,
      },
      ticker,
      context,
    } = this;

    const assembleResult = async (
      optToken: Option<PalletAssetSecurityToken>,
      agentGroups: [
        StorageKey<[PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]>,
        Option<PolymeshPrimitivesAgentAgentGroup>
      ][],
      assetName: Option<Bytes>
    ): Promise<AssetDetails> => {
      const fullAgents: Identity[] = [];

      if (!isV5 && optToken.isNone) {
        throw new PolymeshError({
          message: 'Asset detail information not found',
          code: ErrorCode.DataUnavailable,
        });
      }

      const {
        totalSupply,
        divisible,
        ownerDid,
        assetType: rawAssetType,
      } = isV5 ? (optToken as unknown as PalletAssetSecurityToken) : optToken.unwrap();

      agentGroups.forEach(([storageKey, agentGroup]) => {
        const rawAgentGroup = agentGroup.unwrap();
        if (rawAgentGroup.isFull) {
          fullAgents.push(new Identity({ did: identityIdToString(storageKey.args[1]) }, context));
        }
      });

      const owner = new Identity({ did: identityIdToString(ownerDid) }, context);
      const type = assetTypeToKnownOrId(rawAssetType);

      let assetType: string;
      if (typeof type === 'string') {
        assetType = type;
      } else {
        const customType = await asset.customTypes(bigNumberToU32(type, context));
        assetType = bytesToString(customType);
      }

      return {
        assetType,
        isDivisible: boolToBoolean(divisible),
        name: bytesToString(assetName.unwrapOrDefault()),
        owner,
        totalSupply: balanceToBigNumber(totalSupply),
        fullAgents,
      };
    };

    const rawTicker = stringToTicker(ticker, context);

    const groupOfAgentPromise = externalAgents.groupOfAgent.entries(rawTicker);
    const namePromise = asset.assetNames(rawTicker);

    if (callback) {
      const groupEntries = await groupOfAgentPromise;
      const assetName = await namePromise;

      return asset.tokens(rawTicker, async securityToken => {
        const result = await assembleResult(securityToken, groupEntries, assetName);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(result);
      });
    }

    const [token, groups, name] = await Promise.all([
      asset.tokens(rawTicker),
      groupOfAgentPromise,
      namePromise,
    ]);
    return assembleResult(token, groups, name);
  }

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
   * Retrieve the Asset's identifiers list
   *
   * @note can be subscribed to
   */
  public getIdentifiers(): Promise<SecurityIdentifier[]>;
  public getIdentifiers(callback?: SubCallback<SecurityIdentifier[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async getIdentifiers(
    callback?: SubCallback<SecurityIdentifier[]>
  ): Promise<SecurityIdentifier[] | UnsubCallback> {
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

    if (callback) {
      return asset.identifiers(rawTicker, identifiers => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(identifiers.map(assetIdentifierToSecurityIdentifier));
      });
    }

    const assetIdentifiers = await asset.identifiers(rawTicker);

    return assetIdentifiers.map(assetIdentifierToSecurityIdentifier);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const { ticker, context } = this;

    if (context.isMiddlewareV2Enabled()) {
      return this.createdAtV2();
    }

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Asset,
        eventId: EventIdEnum.AssetCreated,
        eventArg1: padString(ticker, MAX_TICKER_LENGTH),
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAtV2(): Promise<EventIdentifier | null> {
    const { ticker, context } = this;

    const {
      data: {
        assets: {
          nodes: [asset],
        },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'assets'>>(
      assetQuery({
        ticker,
      })
    );

    return optionize(middlewareV2EventDetailsToEventIdentifier)(
      asset?.createdBlock,
      asset?.eventIdx
    );
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
   * Check whether transfers are frozen for the Asset
   *
   * @note can be subscribed to
   */
  public isFrozen(): Promise<boolean>;
  public isFrozen(callback: SubCallback<boolean>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async isFrozen(callback?: SubCallback<boolean>): Promise<boolean | UnsubCallback> {
    const {
      ticker,
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
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(boolToBoolean(frozen));
      });
    }

    const result = await asset.frozen(rawTicker);

    return boolToBoolean(result);
  }

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
   * @note uses the middleware
   */
  public async getOperationHistory(): Promise<HistoricAgentOperation[]> {
    const {
      context: {
        polymeshApi: {
          query: { system },
        },
      },
      context,
      ticker,
    } = this;

    if (context.isMiddlewareV2Enabled()) {
      return this.getOperationHistoryV2();
    }

    const {
      data: { tickerExternalAgentHistory: tickerExternalAgentHistoryResult },
    } = await context.queryMiddleware<Ensured<Query, 'tickerExternalAgentHistory'>>(
      tickerExternalAgentHistory({
        ticker,
      })
    );

    const multiParams: BlockNumber[] = [];
    const results: Modify<
      HistoricAgentOperation,
      {
        history: Omit<EventIdentifier, 'blockHash'>[];
      }
    >[] = [];

    tickerExternalAgentHistoryResult.forEach(({ did, history }) => {
      const historyResult: Omit<EventIdentifier, 'blockHash'>[] = [];
      history.forEach(({ block_id: blockId, datetime, event_idx: eventIndex }) => {
        const blockNumber = new BigNumber(blockId);
        multiParams.push(bigNumberToU32(blockNumber, context));
        historyResult.push({
          blockNumber,
          blockDate: new Date(datetime),
          eventIndex: new BigNumber(eventIndex),
        });
      });
      results.push({
        identity: new Identity({ did }, context),
        history: historyResult,
      });
    });

    let hashes: Hash[] = [];

    if (multiParams.length) {
      hashes = await system.blockHash.multi(multiParams);
    }

    const finalResults: HistoricAgentOperation[] = [];

    results.forEach(({ identity, history }) => {
      const historyWithHashes: EventIdentifier[] = [];

      history.forEach(event => {
        /*
         * Since we filled the params array in the order in which the events appeared and this is being done
         *   synchronously, the order and amount of results should be the same and the array should never be empty
         *   until all the data is in place
         */
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const blockHash = hashToString(hashes.shift()!);
        historyWithHashes.push({
          ...event,
          blockHash,
        });
      });

      finalResults.push({
        identity,
        history: historyWithHashes,
      });
    });

    return finalResults;
  }

  /**
   * Retrieve this Asset's Operation History
   *
   * @note Operations are grouped by the agent Identity who performed them
   *
   * @note uses the middlewareV2
   */
  public async getOperationHistoryV2(): Promise<HistoricAgentOperation[]> {
    const { context, ticker: assetId } = this;

    const {
      data: {
        tickerExternalAgentHistories: { nodes },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'tickerExternalAgentHistories'>>(
      tickerExternalAgentHistoryQuery({
        assetId,
      })
    );

    const groupedData = groupBy(nodes, 'identityId');

    return map(groupedData, (history, did) => ({
      identity: new Identity({ did }, context),
      history: history.map(({ createdBlock, eventIdx }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        middlewareV2EventDetailsToEventIdentifier(createdBlock!, eventIdx)
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'assetTransactions'>>(
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
        from: optionize(middlewareV2PortfolioToPortfolio)(fromPortfolio, context),
        to: optionize(middlewareV2PortfolioToPortfolio)(toPortfolio, context),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        extrinsicIndex: new BigNumber(extrinsicIdx!),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...middlewareV2EventDetailsToEventIdentifier(createdBlock!, eventIdx),
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
