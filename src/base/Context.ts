import {
  ApolloClient,
  ApolloQueryResult,
  NormalizedCacheObject,
  OperationVariables,
  QueryOptions,
} from '@apollo/client/core';
import { ApiPromise } from '@polkadot/api';
import { UnsubscribePromise } from '@polkadot/api/types';
import { getTypeDef, Option } from '@polkadot/types';
import { AccountInfo, Header } from '@polkadot/types/interfaces';
import {
  PalletCorporateActionsCaId,
  PalletCorporateActionsDistribution,
  PalletRelayerSubsidy,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshPrimitivesIdentityClaim,
} from '@polkadot/types/lookup';
import { CallFunction, Codec, DetectCodec, Signer as PolkadotSigner } from '@polkadot/types/types';
import { SigningManager } from '@polymeshassociation/signing-manager-types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk, clone, flatMap, flatten, flattenDeep } from 'lodash';

import { Account, Asset, DividendDistribution, Identity, PolymeshError, Subsidy } from '~/internal';
import { ClaimTypeEnum } from '~/middleware/enums';
import { claimsQuery, heartbeatQuery, metadataQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  AccountBalance,
  ClaimData,
  ClaimType,
  CorporateActionParams,
  DistributionWithDetails,
  ErrorCode,
  MiddlewareMetadata,
  ModuleName,
  ProtocolFees,
  ResultSet,
  SubCallback,
  SubsidyWithAllowance,
  TransactionArgument,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import { DEFAULT_GQL_PAGE_SIZE, MAX_CONCURRENT_REQUESTS, MAX_PAGE_SIZE } from '~/utils/constants';
import {
  accountIdToString,
  balanceToBigNumber,
  bigNumberToU32,
  boolToBoolean,
  claimTypeToMeshClaimType,
  corporateActionIdentifierToCaId,
  distributionToDividendDistributionParams,
  identityIdToString,
  meshClaimToClaim,
  meshCorporateActionToCorporateActionParams,
  middlewareClaimToClaimData,
  momentToDate,
  posRatioToBigNumber,
  signerToString,
  stringToAccountId,
  stringToHash,
  stringToIdentityId,
  stringToTicker,
  textToString,
  tickerToString,
  txTagToProtocolOp,
  u16ToBigNumber,
  u32ToBigNumber,
} from '~/utils/conversion';
import { assertAddressValid, calculateNextKey, delay, getApiAtBlock } from '~/utils/internal';

import { processType } from './utils';

interface ConstructorParams {
  polymeshApi: ApiPromise;
  middlewareApiV2: ApolloClient<NormalizedCacheObject> | null;
  ss58Format: BigNumber;
  signingManager?: SigningManager;
}

/**
 * @hidden
 *
 * Context in which the SDK is being used
 *
 * - Holds the polkadot API instance
 * - Holds the middleware API instance (if any)
 * - Holds the middleware V2 API instance (if any)
 * - Holds the Signing Manager (if any)
 */
export class Context {
  private isDisconnected = false;

  public polymeshApi: ApiPromise;

  /**
   * Whether the current node is an archive node (contains a full history from genesis onward) or not
   */
  public isArchiveNode = false;

  public ss58Format: BigNumber;

  private _middlewareApi: ApolloClient<NormalizedCacheObject> | null;

  private _polymeshApi: ApiPromise;

  private _signingManager?: SigningManager;

  private signingAddress?: string;

  private nonce?: BigNumber;

  public isV5 = false;

  private unsubChainVersion: UnsubscribePromise;

  /**
   * @hidden
   */
  private constructor(params: ConstructorParams) {
    const { polymeshApi, middlewareApiV2, ss58Format } = params;

    this._middlewareApi = middlewareApiV2;
    this._polymeshApi = polymeshApi;
    this.polymeshApi = polymeshApi;
    this.ss58Format = ss58Format;

    this.unsubChainVersion = polymeshApi.query.system.lastRuntimeUpgrade(upgrade => {
      if (upgrade.isSome) {
        const { specVersion } = upgrade.unwrap();
        this.isV5 = specVersion.toNumber() < 6000000;
      }
    });
  }

  /**
   * @hidden
   *
   * Create the Context instance
   */
  static async create(params: {
    polymeshApi: ApiPromise;
    middlewareApiV2: ApolloClient<NormalizedCacheObject> | null;
    signingManager?: SigningManager;
  }): Promise<Context> {
    const { polymeshApi, middlewareApiV2, signingManager } = params;

    const ss58Format: BigNumber = u16ToBigNumber(polymeshApi.consts.system.ss58Prefix);

    const context = new Context({
      polymeshApi,
      middlewareApiV2,
      signingManager,
      ss58Format,
    });

    const isArchiveNodePromise = context.isCurrentNodeArchive();

    if (signingManager) {
      await context.setSigningManager(signingManager);
    }

    context.isArchiveNode = await isArchiveNodePromise;

    return new Proxy(context, {
      get: (target, prop: keyof Context): Context[keyof Context] => {
        if (target.isDisconnected) {
          throw new PolymeshError({
            code: ErrorCode.FatalError,
            message: 'Client disconnected. Please create a new instance via "Polymesh.connect()"',
          });
        }

        return target[prop];
      },
    });
  }

  /**
   * @hidden
   */
  private async isCurrentNodeArchive(): Promise<boolean> {
    const {
      polymeshApi: {
        query: { system },
      },
      polymeshApi,
    } = this;

    try {
      const blockHash = await system.blockHash(bigNumberToU32(new BigNumber(0), this));

      const apiAt = await polymeshApi.at(blockHash);

      const balance = await apiAt.query.balances.totalIssuance();

      return balanceToBigNumber(balance).gt(new BigNumber(0));
    } catch (e) {
      return false;
    }
  }

  /**
   * @hidden
   *
   * @note the signing Account will be set to the Signing Manager's first Account. If the Signing Manager has
   *   no Accounts yet, the signing Account will be left empty
   */
  public async setSigningManager(signingManager: SigningManager | null): Promise<void> {
    if (signingManager === null) {
      this._signingManager = undefined;
      this.signingAddress = undefined;
      // TODO remove cast when polkadot/api >= v10.7.2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._polymeshApi.setSigner(undefined as any);

      return;
    }

    this._signingManager = signingManager;
    this._polymeshApi.setSigner(signingManager.getExternalSigner());

    signingManager.setSs58Format(this.ss58Format.toNumber());

    // this could be undefined
    const [firstAccount] = await signingManager.getAccounts();
    if (!firstAccount) {
      this.signingAddress = undefined;
    } else {
      return this.setSigningAddress(firstAccount);
    }
  }

  /**
   * @hidden
   */
  private get signingManager(): SigningManager {
    const { _signingManager: manager } = this;

    if (!manager) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'There is no Signing Manager attached to the SDK',
      });
    }

    return manager;
  }

  /**
   * @hidden
   *
   * Retrieve a list of Accounts that can sign transactions
   */
  public async getSigningAccounts(): Promise<Account[]> {
    const { signingManager } = this;

    const accounts = await signingManager.getAccounts();

    return accounts.map(address => new Account({ address }, this));
  }

  /**
   * @hidden
   *
   * Set the signing Account from among the existing ones in the Signing Manager
   *
   * @throws if the passed address isn't valid, or isn't present in the Signing Manager
   */
  public async setSigningAddress(signingAddress: string): Promise<void> {
    const { signingManager } = this;

    const newAddress = signingAddress;

    assertAddressValid(newAddress, this.ss58Format);

    const accounts = await signingManager.getAccounts();

    const newSigningAddress = accounts.find(account => {
      return account === newAddress;
    });

    if (!newSigningAddress) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'The Account is not part of the Signing Manager attached to the SDK',
      });
    }

    this.signingAddress = newSigningAddress;
  }

  /**
   * @hidden
   *
   * Retrieve the Account POLYX balance
   *
   * @note can be subscribed to
   */
  public accountBalance(account?: string | Account): Promise<AccountBalance>;
  public accountBalance(
    account: string | Account | undefined,
    callback: SubCallback<AccountBalance>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async accountBalance(
    account?: string | Account,
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const {
      polymeshApi: {
        query: { system },
      },
    } = this;
    let address: string;

    if (account) {
      address = signerToString(account);
    } else {
      ({ address } = this.getSigningAccount());
    }

    const rawAddress = stringToAccountId(address, this);

    const assembleResult = ({
      data: { free: rawFree, miscFrozen, feeFrozen, reserved: rawReserved },
    }: AccountInfo): AccountBalance => {
      /*
       * The chain's "free" balance is the balance that isn't locked. Here we calculate it so
       * the free balance is what the Account is able to spend
       */
      const reserved = balanceToBigNumber(rawReserved);
      const total = balanceToBigNumber(rawFree).plus(reserved);
      const locked = BigNumber.max(balanceToBigNumber(miscFrozen), balanceToBigNumber(feeFrozen));
      return {
        total,
        locked,
        free: total.minus(locked).minus(reserved),
      };
    };

    if (callback) {
      return system.account(rawAddress, info => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(info));
      });
    }

    const accountInfo = await system.account(rawAddress);

    return assembleResult(accountInfo);
  }

  /**
   * @hidden
   *
   * Retrieve the Account subsidizer relationship. If there is no such relationship, return null
   *
   * @note can be subscribed to
   */
  public accountSubsidy(account?: string | Account): Promise<SubsidyWithAllowance | null>;
  public accountSubsidy(
    account: string | Account | undefined,
    callback: SubCallback<SubsidyWithAllowance | null>
  ): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async accountSubsidy(
    account?: string | Account,
    callback?: SubCallback<SubsidyWithAllowance | null>
  ): Promise<SubsidyWithAllowance | null | UnsubCallback> {
    const {
      polymeshApi: {
        query: { relayer },
      },
    } = this;
    let address: string;

    if (account) {
      address = signerToString(account);
    } else {
      ({ address } = this.getSigningAccount());
    }

    const rawAddress = stringToAccountId(address, this);

    const assembleResult = (
      meshSubsidy: Option<PalletRelayerSubsidy>
    ): SubsidyWithAllowance | null => {
      if (meshSubsidy.isNone) {
        return null;
      }
      const { payingKey, remaining } = meshSubsidy.unwrap();
      const allowance = balanceToBigNumber(remaining);
      const subsidy = new Subsidy(
        { beneficiary: address, subsidizer: accountIdToString(payingKey) },
        this
      );

      return {
        subsidy,
        allowance,
      };
    };

    if (callback) {
      return relayer.subsidies(rawAddress, subsidy => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(subsidy));
      });
    }

    const subsidies = await relayer.subsidies(rawAddress);

    return assembleResult(subsidies);
  }

  /**
   * @hidden
   *
   * Retrieve the signing Account
   *
   * @throws if there is no signing Account associated to the SDK instance
   */
  public getSigningAccount(): Account {
    const address = this.getSigningAddress();

    return new Account({ address }, this);
  }

  /**
   * @hidden
   *
   * Retrieve the signing Identity
   *
   * @throws if there is no Identity associated to the signing Account (or there is no signing Account associated to the SDK instance)
   */
  public async getSigningIdentity(): Promise<Identity> {
    const account = this.getSigningAccount();

    const identity = await account.getIdentity();

    if (identity === null) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The signing Account does not have an associated Identity',
      });
    }

    return identity;
  }

  /**
   * @hidden
   *
   * Retrieve the polkadot.js promise client
   */
  public getPolymeshApi(): ApiPromise {
    return this._polymeshApi;
  }

  /**
   * @hidden
   *
   * Retrieve the signing address
   *
   * @throws if there is no signing Account associated to the SDK instance
   */
  public getSigningAddress(): string {
    const { signingAddress } = this;

    if (!signingAddress) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'There is no signing Account associated with the SDK instance',
      });
    }

    return signingAddress;
  }

  /**
   * @hidden
   *
   * Retrieve the external signer from the Signing Manager
   */
  public getExternalSigner(): PolkadotSigner {
    const { signingManager } = this;

    return signingManager.getExternalSigner();
  }

  /**
   * @hidden
   *
   * Check whether a set of Identities exist
   */
  public async getInvalidDids(identities: (string | Identity)[]): Promise<string[]> {
    const {
      polymeshApi: {
        query: { identity },
      },
    } = this;

    const dids = identities.map(signerToString);
    const rawIdentities = dids.map(did => stringToIdentityId(did, this));
    const records = await identity.didRecords.multi(rawIdentities);

    const invalidDids: string[] = [];

    records.forEach((record, index) => {
      if (record.isNone) {
        invalidDids.push(dids[index]);
      }
    });

    return invalidDids;
  }

  /**
   * @hidden
   *
   * Returns an Identity when given a DID string
   *
   * @throws if the Identity does not exist
   */
  public async getIdentity(identity: Identity | string): Promise<Identity> {
    if (identity instanceof Identity) {
      return identity;
    }
    const id = new Identity({ did: identity }, this);
    const exists = await id.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'The passed DID does not correspond to an on-chain user Identity. It may correspond to an Asset Identity',
      });
    }

    return id;
  }

  /**
   * @hidden
   *
   * Retrieve the protocol fees associated with running specific transactions
   *
   * @param tags - list of transaction tags (e.g. [TxTags.asset.CreateAsset, TxTags.asset.RegisterTicker] or ["asset.createAsset", "asset.registerTicker"])
   * @param blockHash - optional hash of the block to get the protocol fees at that block
   */
  public async getProtocolFees({
    tags,
    blockHash,
  }: {
    tags: TxTag[];
    blockHash?: string;
  }): Promise<ProtocolFees[]> {
    const {
      polymeshApi: {
        query: {
          protocolFee: { baseFees, coefficient },
        },
      },
    } = this;

    const tagsMap = new Map<TxTag, PolymeshCommonUtilitiesProtocolFeeProtocolOp | undefined>();

    tags.forEach(tag => {
      try {
        tagsMap.set(tag, txTagToProtocolOp(tag, this));
      } catch (err) {
        tagsMap.set(tag, undefined);
      }
    });

    let baseFeesQuery;
    if (blockHash) {
      ({
        query: {
          protocolFee: { baseFees: baseFeesQuery },
        },
      } = await getApiAtBlock(this, stringToHash(blockHash, this)));
    } else {
      baseFeesQuery = baseFees;
    }

    const [baseFeesEntries, coefficientValue] = await Promise.all([
      baseFeesQuery.entries(),
      coefficient(),
    ]);

    const assembleResult = (
      rawProtocolOp: PolymeshCommonUtilitiesProtocolFeeProtocolOp | undefined
    ): BigNumber => {
      const baseFeeEntry = baseFeesEntries.find(
        ([
          {
            args: [protocolOp],
          },
        ]) => protocolOp.eq(rawProtocolOp)
      );

      let fee = new BigNumber(0);

      if (baseFeeEntry) {
        const [, balance] = baseFeeEntry;
        fee = balanceToBigNumber(balance).multipliedBy(posRatioToBigNumber(coefficientValue));
      }

      return fee;
    };

    const protocolFees: ProtocolFees[] = [];

    tagsMap.forEach((rawProtocolOp, txTag) => {
      protocolFees.push({
        tag: txTag,
        fees: assembleResult(rawProtocolOp),
      });
    });

    return protocolFees;
  }

  /**
   * @hidden
   *
   * Return whether the passed transaction can be subsidized
   */
  public supportsSubsidy({ tag }: { tag: TxTag }): boolean {
    const moduleName = tag.split('.')[0] as ModuleName;

    return [
      ModuleName.Asset,
      ModuleName.ComplianceManager,
      ModuleName.CorporateAction,
      ModuleName.ExternalAgents,
      ModuleName.Portfolio,
      ModuleName.Settlement,
      ModuleName.Statistics,
      ModuleName.Sto,
      ModuleName.Relayer,
    ].includes(moduleName);
  }

  /**
   * Retrieve the types of arguments that a certain transaction requires to be run
   *
   * @param args.tag - tag associated with the transaction that will be executed if the proposal passes
   */
  public getTransactionArguments({ tag }: { tag: TxTag }): TransactionArgument[] {
    const {
      /*
       * we use the non-proxy polkadot instance since we shouldn't need to
       * have a signer Account for this method
       */
      _polymeshApi: { tx },
    } = this;

    const [section, method] = tag.split('.');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((tx as any)[section][method] as CallFunction).meta.args.map(({ name, type }) => {
      const typeDef = getTypeDef(type.toString());
      const argName = textToString(name);

      return processType(typeDef, argName);
    });
  }

  /**
   * @hidden
   */
  public async getDividendDistributionsForAssets(args: {
    assets: Asset[];
  }): Promise<DistributionWithDetails[]> {
    const {
      polymeshApi: {
        query: { corporateAction: corporateActionQuery, capitalDistribution },
      },
    } = this;
    const { assets } = args;
    const distributionsMultiParams: PalletCorporateActionsCaId[] = [];
    const corporateActionParams: CorporateActionParams[] = [];
    const corporateActionIds: BigNumber[] = [];
    const tickers: string[] = [];

    const assetChunks = chunk(assets, MAX_CONCURRENT_REQUESTS);

    await P.each(assetChunks, async assetChunk => {
      const corporateActions = await Promise.all(
        assetChunk.map(({ ticker }) =>
          corporateActionQuery.corporateActions.entries(stringToTicker(ticker, this))
        )
      );
      const eligibleCas = flatten(corporateActions).filter(([, action]) => {
        const kind = action.unwrap().kind;

        return kind.isUnpredictableBenefit || kind.isPredictableBenefit;
      });

      const corporateActionData = await P.map(
        eligibleCas,
        async ([
          {
            args: [rawTicker, rawId],
          },
          corporateAction,
        ]) => {
          const localId = u32ToBigNumber(rawId);
          const ticker = tickerToString(rawTicker);
          const caId = corporateActionIdentifierToCaId({ ticker, localId }, this);
          const details = await corporateActionQuery.details(caId);
          const action = corporateAction.unwrap();

          return {
            ticker,
            localId,
            caId,
            corporateAction: meshCorporateActionToCorporateActionParams(action, details, this),
          };
        }
      );

      corporateActionData.forEach(({ ticker, localId, caId, corporateAction }) => {
        tickers.push(ticker);
        corporateActionIds.push(localId);
        distributionsMultiParams.push(caId);
        corporateActionParams.push(corporateAction);
      });
    });

    /*
     * Divide the requests to account for practical limits
     */
    const paramChunks = chunk(distributionsMultiParams, MAX_PAGE_SIZE.toNumber());
    const requestChunks = chunk(paramChunks, MAX_CONCURRENT_REQUESTS);
    const distributions = await P.mapSeries(requestChunks, requestChunk =>
      Promise.all(
        requestChunk.map(paramChunk => capitalDistribution.distributions.multi(paramChunk))
      )
    );

    const result: DistributionWithDetails[] = [];

    flattenDeep<Option<PalletCorporateActionsDistribution>>(distributions).forEach(
      (distribution, index) => {
        if (distribution.isNone) {
          return;
        }

        const dist = distribution.unwrap();

        const { reclaimed, remaining } = dist;

        result.push({
          distribution: new DividendDistribution(
            {
              ticker: tickers[index],
              id: corporateActionIds[index],
              ...corporateActionParams[index],
              ...distributionToDividendDistributionParams(dist, this),
            },
            this
          ),
          details: {
            remainingFunds: balanceToBigNumber(remaining),
            fundsReclaimed: boolToBoolean(reclaimed),
          },
        });
      }
    );

    return result;
  }

  /**
   * @hidden
   *
   * @note no claimTypes value means ALL claim types
   */
  public async getIdentityClaimsFromChain(args: {
    targets: (string | Identity)[];
    claimTypes?: ClaimType[];
    trustedClaimIssuers?: (string | Identity)[];
    includeExpired: boolean;
  }): Promise<ClaimData[]> {
    const {
      polymeshApi: {
        query: { identity },
      },
      isV5,
    } = this;

    const {
      targets,
      claimTypes = Object.values(ClaimType),
      trustedClaimIssuers,
      includeExpired,
    } = args;

    const claim1stKeys = flatMap(targets, target =>
      claimTypes.map(claimType => {
        return {
          target: signerToString(target),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          claim_type: claimTypeToMeshClaimType(claimType, this),
        };
      })
    );

    const claimIssuerDids = trustedClaimIssuers?.map(trustedClaimIssuer =>
      signerToString(trustedClaimIssuer)
    );

    const claimData = await P.map(claim1stKeys, async claim1stKey => {
      const entries = await identity.claims.entries(claim1stKey);
      const data: ClaimData[] = [];
      entries.forEach(([key, optClaim]) => {
        const { target } = key.args[0];

        const {
          claimIssuer,
          issuanceDate,
          lastUpdateDate,
          expiry: rawExpiry,
          claim,
        } = isV5 ? (optClaim as unknown as PolymeshPrimitivesIdentityClaim) : optClaim.unwrap();
        const expiry = !rawExpiry.isEmpty ? momentToDate(rawExpiry.unwrap()) : null;
        if ((!includeExpired && (expiry === null || expiry > new Date())) || includeExpired) {
          data.push({
            target: new Identity({ did: identityIdToString(target) }, this),
            issuer: new Identity({ did: identityIdToString(claimIssuer) }, this),
            issuedAt: momentToDate(issuanceDate),
            lastUpdatedAt: momentToDate(lastUpdateDate),
            expiry,
            claim: meshClaimToClaim(claim),
          });
        }
      });
      return data;
    });

    return flatten(claimData).filter(({ issuer }) =>
      claimIssuerDids ? claimIssuerDids.includes(issuer.did) : true
    );
  }

  /**
   * @hidden
   */
  public async getIdentityClaimsFromMiddleware(args: {
    targets?: (string | Identity)[];
    trustedClaimIssuers?: (string | Identity)[];
    claimTypes?: ClaimType[];
    includeExpired?: boolean;
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<ClaimData>> {
    const {
      targets,
      claimTypes,
      trustedClaimIssuers,
      includeExpired,
      size = new BigNumber(DEFAULT_GQL_PAGE_SIZE),
      start = new BigNumber(0),
    } = args;

    const {
      data: {
        claims: { nodes: claimsList, totalCount },
      },
    } = await this.queryMiddleware<Ensured<Query, 'claims'>>(
      claimsQuery(
        {
          dids: targets?.map(target => signerToString(target)),
          trustedClaimIssuers: trustedClaimIssuers?.map(trustedClaimIssuer =>
            signerToString(trustedClaimIssuer)
          ),
          claimTypes: claimTypes?.map(ct => ClaimTypeEnum[ct]),
          includeExpired,
        },
        size,
        start
      )
    );

    const count = new BigNumber(totalCount);

    const data = claimsList.map(claim => middlewareClaimToClaimData(claim, this));

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * @hidden
   *
   * Retrieve a list of claims. Can be filtered using parameters
   *
   * @param opts.targets - Identities (or Identity IDs) for which to fetch claims (targets). Defaults to all targets
   * @param opts.trustedClaimIssuers - Identity IDs of claim issuers. Defaults to all claim issuers
   * @param opts.claimTypes - types of the claims to fetch. Defaults to any type
   * @param opts.includeExpired - whether to include expired claims. Defaults to true
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note uses the middleware V2 (optional)
   */
  public async issuedClaims(
    opts: {
      targets?: (string | Identity)[];
      trustedClaimIssuers?: (string | Identity)[];
      claimTypes?: ClaimType[];
      includeExpired?: boolean;
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<ClaimData>> {
    const { targets, trustedClaimIssuers, claimTypes, includeExpired = true, size, start } = opts;

    const isMiddlewareAvailable = await this.isMiddlewareAvailable();

    if (isMiddlewareAvailable) {
      return this.getIdentityClaimsFromMiddleware({
        targets,
        trustedClaimIssuers,
        claimTypes,
        includeExpired,
        size,
        start,
      });
    }

    if (!targets) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: 'Cannot perform this action without an active middleware V2 connection',
      });
    }

    const identityClaimsFromChain = await this.getIdentityClaimsFromChain({
      targets,
      claimTypes,
      trustedClaimIssuers,
      includeExpired,
    });

    return {
      data: identityClaimsFromChain,
      next: null,
      count: undefined,
    };
  }

  /**
   * Retrieve the middleware client
   *
   * @throws if the middleware V2 is not enabled
   */
  public get middlewareApi(): ApolloClient<NormalizedCacheObject> {
    const { _middlewareApi: api } = this;

    if (!api) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: 'Cannot perform this action without an active middleware v2 connection',
      });
    }
    return api;
  }

  /**
   * @hidden
   *
   * Make a query to the middleware V2 server using the apollo client
   */
  public async queryMiddleware<Result extends Partial<Query>>(
    query: QueryOptions<OperationVariables, Result>
  ): Promise<ApolloQueryResult<Result>> {
    let result: ApolloQueryResult<Result>;
    try {
      result = await this.middlewareApi.query(query);
    } catch (err) {
      const resultMessage = err.networkError?.result?.message;
      const { message: errorMessage } = err;
      const message = resultMessage ?? errorMessage;
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware V2 query: ${message}`,
      });
    }

    return result;
  }

  /**
   * @hidden
   *
   * Return whether the middleware V2 was enabled at startup
   */
  public isMiddlewareEnabled(): boolean {
    return !!this._middlewareApi;
  }

  /**
   * @hidden
   *
   * Return whether the middleware V2 is enabled and online
   */
  public async isMiddlewareAvailable(): Promise<boolean> {
    try {
      await this.middlewareApi.query(heartbeatQuery());
    } catch (err) {
      return false;
    }

    return true;
  }

  /**
   * @hidden
   *
   * Retrieve the number of the latest finalized block
   */
  public async getLatestBlock(): Promise<BigNumber> {
    const { chain } = this.polymeshApi.rpc;

    /*
     * This is faster than calling `getFinalizedHead` and then `getHeader`.
     * We're promisifying a callback subscription to the latest finalized block
     * and unsubscribing as soon as we get the first result
     */
    const gettingHeader = new Promise<Header>((resolve, reject) => {
      const gettingUnsub = chain.subscribeFinalizedHeads(header => {
        gettingUnsub
          .then(unsub => {
            unsub();
            resolve(header);
          })
          .catch(err => reject(err));
      });
    });

    const { number } = await gettingHeader;

    return u32ToBigNumber(number.unwrap());
  }

  /**
   * @hidden
   *
   * Retrieve the network version
   */
  public async getNetworkVersion(): Promise<string> {
    const version = await this.polymeshApi.rpc.system.version();

    return textToString(version);
  }

  /**
   * @hidden
   *
   * Disconnect the Polkadot API, middleware, and render this instance unusable
   *
   * @note after disconnecting, trying to access any property in this object will result
   *   in an error
   */
  public async disconnect(): Promise<void> {
    const { polymeshApi } = this;
    let middlewareApi;

    const unsub = await this.unsubChainVersion;
    unsub();

    if (this.isMiddlewareEnabled()) {
      ({ middlewareApi } = this);
    }

    this.isDisconnected = true;

    if (middlewareApi) {
      middlewareApi.stop();
    }

    await delay(500); // allow pending requests to complete

    return polymeshApi.disconnect();
  }

  /**
   * @hidden
   *
   * Returns a (shallow) clone of this instance. Useful for providing a separate
   *   Context to Procedures with different signing Accounts
   */
  public clone(): Context {
    return clone(this);
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /**
   *  @hidden
   *
   * Creates an instance of a type as registered in the polymeshApi instance
   */
  public createType<T extends Codec = Codec, K extends string = string>(
    type: K,
    params: unknown
  ): DetectCodec<T, K> {
    try {
      return this.polymeshApi.createType(type, params);
    } catch (error) {
      throw new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: `Could not create internal Polymesh type: "${type}". Please report this error to the Polymesh team`,
        data: { type, params, error },
      });
    }
  }

  /**
   * @hidden
   *
   * Set the nonce value
   */
  public setNonce(nonce?: BigNumber): void {
    this.nonce = nonce;
  }

  /**
   * @hidden
   *
   * Retrieve the nonce value
   */
  public getNonce(): BigNumber {
    // nonce: -1 takes pending transactions into consideration.
    // More information can be found at: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
    return new BigNumber(this.nonce || -1);
  }

  /**
   * Retrieve middleware metadata.
   * Returns null if middleware V2 is disabled
   *
   * @note uses the middleware V2
   */
  public async getMiddlewareMetadata(): Promise<MiddlewareMetadata | null> {
    if (!this.isMiddlewareEnabled()) {
      return null;
    }

    const {
      data: {
        _metadata: {
          chain,
          specName,
          genesisHash,
          targetHeight,
          lastProcessedHeight,
          lastProcessedTimestamp,
          indexerHealthy,
        },
      },
    } = await this.queryMiddleware<Ensured<Query, '_metadata'>>(metadataQuery());

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      chain: chain!,
      specName: specName!,
      genesisHash: genesisHash!,
      targetHeight: new BigNumber(targetHeight!),
      lastProcessedHeight: new BigNumber(lastProcessedHeight!),
      lastProcessedTimestamp: new Date(parseInt(lastProcessedTimestamp)),
      indexerHealthy: Boolean(indexerHealthy),
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }
}
