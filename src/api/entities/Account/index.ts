import { hexAddPrefix, hexStripPrefix, stringToHex, u8aToHex } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import { values } from 'lodash';

import {
  getMissingAssetPermissions,
  getMissingPortfolioPermissions,
  getMissingTransactionPermissions,
} from '~/api/entities/Account/helpers';
import {
  AccountIdentityRelation,
  AccountKeyType,
  AccountTypeInfo,
  HistoricPolyxTransaction,
} from '~/api/entities/Account/types';
import { Subsidies } from '~/api/entities/Subsidies';
import {
  Authorizations,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  MultiSig,
  MultiSigProposal,
  Nft,
  NftCollection,
  PolymeshError,
  Staking,
} from '~/internal';
import { extrinsicsByArgs } from '~/middleware/queries/extrinsics';
import { ExtrinsicsOrderBy, Query } from '~/middleware/types';
import {
  AccountBalance,
  AccountCollection,
  AssetHolderBalance,
  CheckPermissionsResult,
  ErrorCode,
  ExtrinsicData,
  MultiSigTx,
  NftOwnerStatus,
  Permissions,
  PermissionType,
  PortfolioBalance,
  PortfolioCollection,
  ResultSet,
  SignerType,
  SimplePermissions,
  SubCallback,
  TxTag,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import { hexToUuid } from '~/utils';
import { ASSET_ID_PREFIX } from '~/utils/constants';
import {
  accountIdToString,
  addressToKey,
  assetIdToString,
  balanceToBigNumber,
  extrinsicIdentifierToTxTag,
  meshNftOwnerStatusToNftOwnerStatus,
  stringToAccountId,
  stringToHash,
  txTagToExtrinsicIdentifier,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  areSameAccounts,
  asAssetId,
  asFungibleAsset,
  assertAddressValid,
  calculateNextKey,
  getIdentityFromKeyRecord,
  getSecondaryAccountPermissions,
  requestMulti,
} from '~/utils/internal';

/**
 * @hidden
 */
export interface UniqueIdentifiers {
  address: string;
}

/**
 * Represents an Account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)
 */
export class Account extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { address } = identifier as UniqueIdentifiers;

    return typeof address === 'string';
  }

  /**
   * Polymesh-specific address of the Account. Serves as an identifier
   */
  public address: string;

  /**
   * A hex representation of the cryptographic public key of the Account. This is consistent across
   * Substrate chains, while the address depends on the chain as well.
   */
  public key: string;

  // Namespaces
  public authorizations: Authorizations<Account>;
  public subsidies: Subsidies;
  public staking: Staking;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { address } = identifiers;

    assertAddressValid(address, context.ss58Format);

    this.address = address;
    this.key = addressToKey(address, context);
    this.authorizations = new Authorizations(this, context);
    this.subsidies = new Subsidies(this, context);
    this.staking = new Staking(this, context);
  }

  /**
   * Get the free/locked POLYX balance of the Account
   *
   * @returns Promise that resolves to the Account's POLYX balance information
   */
  public getBalance(): Promise<AccountBalance>;

  /**
   * Get the free/locked POLYX balance of the Account (with subscription support)
   *
   * @param callback - Callback function that receives balance updates
   *
   * @returns Promise that resolves to an unsubscribe function
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public getBalance(callback: SubCallback<AccountBalance>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getBalance(
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const { context, address } = this;

    if (callback) {
      context.assertSupportsSubscription();
      return context.accountBalance(address, callback);
    }

    return context.accountBalance(address);
  }

  /**
   * Retrieve the Identity associated to this Account (null if there is none)
   */
  public async getIdentity(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
      address,
    } = this;

    const optKeyRecord = await identity.keyRecords(stringToAccountId(address, context));

    if (optKeyRecord.isNone) {
      return null;
    }

    const keyRecord = optKeyRecord.unwrap();

    return getIdentityFromKeyRecord(keyRecord, context);
  }

  /**
   * Retrieve a list of transactions signed by this Account. Can be filtered using parameters
   *
   * @note if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account.
   * Also, for ordering by block_id, one should pass `ExtrinsicsOrderBy.BlockIdAsc` or `ExtrinsicsOrderBy.BlockIdDesc`
   * in order of their choice (since block ID is a string field in middleware v2)
   *
   * @param filters.tag - tag associated with the transaction
   * @param filters.success - whether the transaction was successful or not
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note uses the middleware v2
   */
  public async getTransactionHistory(
    filters: {
      blockNumber?: BigNumber;
      blockHash?: string;
      tag?: TxTag;
      success?: boolean;
      size?: BigNumber;
      start?: BigNumber;
      orderBy?: ExtrinsicsOrderBy;
    } = {}
  ): Promise<ResultSet<ExtrinsicData>> {
    const { tag, success, size, start, orderBy = ExtrinsicsOrderBy.IdAsc, blockHash } = filters;

    const { context, address } = this;

    let moduleId;
    let callId;
    if (tag) {
      ({ moduleId, callId } = txTagToExtrinsicIdentifier(tag));
    }

    let successFilter;
    if (success !== undefined) {
      successFilter = success ? 1 : 0;
    }

    let { blockNumber } = filters;

    if (!blockNumber && blockHash) {
      const {
        block: {
          header: { number },
        },
      } = await context.polymeshApi.rpc.chain.getBlock(stringToHash(blockHash, context));

      blockNumber = u32ToBigNumber(number.unwrap());
    }

    const {
      data: {
        extrinsics: { nodes: transactionList, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'extrinsics'>>(
      extrinsicsByArgs(
        context.isSqIdPadded,
        {
          blockId: blockNumber?.toString(),
          address,
          moduleId,
          callId,
          success: successFilter,
        },
        size,
        start,
        orderBy
      )
    );

    const count = new BigNumber(totalCount);

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const data = transactionList.map(
      ({
        blockId,
        extrinsicIdx,
        address: signerAddress,
        nonce,
        moduleId: extrinsicModuleId,
        callId: extrinsicCallId,
        paramsTxt,
        success: txSuccess,
        specVersionId,
        extrinsicHash,
        block,
      }) => {
        const { hash, datetime } = block!;
        return {
          blockNumber: new BigNumber(blockId),
          blockHash: hash,
          blockDate: new Date(`${datetime}Z`),
          extrinsicIdx: new BigNumber(extrinsicIdx),
          address: signerAddress!,
          nonce: nonce ? new BigNumber(nonce) : null,
          txTag: extrinsicIdentifierToTxTag({
            moduleId: extrinsicModuleId,
            callId: extrinsicCallId,
          }),
          params: JSON.parse(paramsTxt),
          success: !!txSuccess,
          specVersionId: new BigNumber(specVersionId),
          extrinsicHash: extrinsicHash!,
        };
      }
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Check whether this Account is frozen. If frozen, it cannot perform any Identity related action until the primary Account of the Identity unfreezes all secondary Accounts
   *
   * @note returns false if the Account isn't associated to any Identity
   */
  public async isFrozen(): Promise<boolean> {
    const identity = await this.getIdentity();

    if (identity === null) {
      return false;
    }

    const { account } = await identity.getPrimaryAccount();

    if (areSameAccounts(this, account)) {
      return false;
    }

    return identity.areSecondaryAccountsFrozen();
  }

  /**
   * Retrieve the Permissions this Account has as a Permissioned Account for its corresponding Identity
   *
   * @throws if there is no Identity associated with the Account
   */
  public async getPermissions(): Promise<Permissions> {
    const { address, context } = this;

    const identity = await this.getIdentity();

    if (identity === null) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'There is no Identity associated with this Account',
        data: { address },
      });
    }

    const [
      {
        account: { address: primaryAccountAddress },
      },
      [permissionedAccount],
    ] = await Promise.all([
      identity.getPrimaryAccount(),
      getSecondaryAccountPermissions({ accounts: [this], identity }, context),
    ]);

    if (address === primaryAccountAddress) {
      return {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
    }

    if (!permissionedAccount) {
      // this is true for multisig accounts
      return {
        assets: null,
        transactions: {
          type: PermissionType.Include,
          values: [MultiSigTx.CreateProposal, MultiSigTx.Approve, MultiSigTx.Reject],
        },
        transactionGroups: [],
        portfolios: null,
      };
    }

    return permissionedAccount.permissions;
  }

  /**
   * Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity
   *
   * @returns which permissions the Account is missing (if any) and the final result
   */
  public async checkPermissions(
    permissions: SimplePermissions
  ): Promise<CheckPermissionsResult<SignerType.Account>> {
    const { assets, transactions, portfolios } = permissions;

    const {
      assets: currentAssets,
      transactions: currentTransactions,
      portfolios: currentPortfolios,
    } = await this.getPermissions();

    const missingPermissions: SimplePermissions = {};

    const missingAssetPermissions = getMissingAssetPermissions(assets, currentAssets);

    const hasAssets = missingAssetPermissions === undefined;
    if (!hasAssets) {
      missingPermissions.assets = missingAssetPermissions;
    }

    const missingTransactionPermissions = getMissingTransactionPermissions(
      transactions,
      currentTransactions
    );

    const hasTransactions = missingTransactionPermissions === undefined;
    if (!hasTransactions) {
      missingPermissions.transactions = missingTransactionPermissions;
    }

    const missingPortfolioPermissions = getMissingPortfolioPermissions(
      portfolios,
      currentPortfolios
    );

    const hasPortfolios = missingPortfolioPermissions === undefined;
    if (!hasPortfolios) {
      missingPermissions.portfolios = missingPortfolioPermissions;
    }

    const result = hasAssets && hasTransactions && hasPortfolios;

    if (result) {
      return { result };
    }

    return {
      result,
      missingPermissions,
    };
  }

  /**
   * Fetch the MultiSig this Account is part of. If this Account is not a signer on any MultiSig, return null
   */
  public async getMultiSig(): Promise<MultiSig | null> {
    const {
      context: {
        polymeshApi: {
          query: { identity },
        },
      },
      context,
      address,
    } = this;

    const rawAddress = stringToAccountId(address, context);

    const rawOptKeyRecord = await identity.keyRecords(rawAddress);
    if (rawOptKeyRecord.isNone) {
      return null;
    }
    const rawKeyRecord = rawOptKeyRecord.unwrap();
    if (!rawKeyRecord.isMultiSigSignerKey) {
      return null;
    }

    return new MultiSig({ address: accountIdToString(rawKeyRecord.asMultiSigSignerKey) }, context);
  }

  /**
   * Determine whether this Account exists on chain
   */
  public exists(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Return the Account's address
   */
  public toHuman(): string {
    return this.address;
  }

  /**
   * Retrieve the current nonce for this Account
   */
  public async getCurrentNonce(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: {
          call: {
            accountNonceApi: { accountNonce },
          },
        },
      },
      address,
      context,
    } = this;

    const index = await accountNonce(stringToAccountId(address, context));

    return u32ToBigNumber(index);
  }

  /**
   * Retrieve the type of Account, and its relation to an Identity, if applicable
   */
  public async getTypeInfo(): Promise<AccountTypeInfo> {
    const {
      context: {
        polymeshApi: {
          query: { identity, multiSig, contracts },
        },
      },
      context,
      address,
    } = this;

    const accountId = stringToAccountId(address, context);
    const [optKeyRecord, multiSignsRequired, smartContract] = await requestMulti<
      [
        typeof identity.keyRecords,
        typeof multiSig.multiSigSignsRequired,
        typeof contracts.contractInfoOf
      ]
    >(context, [
      [identity.keyRecords, accountId],
      [multiSig.multiSigSignsRequired, accountId],
      [contracts.contractInfoOf, accountId],
    ]);

    let keyType: AccountKeyType = AccountKeyType.Normal;
    if (!multiSignsRequired.isZero()) {
      keyType = AccountKeyType.MultiSig;
    } else if (smartContract.isSome) {
      keyType = AccountKeyType.SmartContract;
    }

    if (optKeyRecord.isNone) {
      return {
        keyType,
        relation: AccountIdentityRelation.Unassigned,
      };
    }

    const keyRecord = optKeyRecord.unwrap();

    let relation: AccountIdentityRelation;
    if (keyRecord.isPrimaryKey) {
      relation = AccountIdentityRelation.Primary;
    } else if (keyRecord.isSecondaryKey) {
      relation = AccountIdentityRelation.Secondary;
    } else {
      relation = AccountIdentityRelation.MultiSigSigner;
    }

    return {
      keyType,
      relation,
    };
  }

  /**
   * Returns POLYX transactions associated with this account
   *
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note uses the middleware
   */
  public getPolyxTransactions(filters: {
    size?: BigNumber;
    start?: BigNumber;
  }): Promise<ResultSet<HistoricPolyxTransaction>> {
    const { context } = this;

    return context.getPolyxTransactions({
      accounts: [this],
      ...filters,
    });
  }

  /**
   * Returns pending MultiSig proposals for this Account
   *
   * @note uses the middleware
   * @throws if the Account is not a signer on any MultiSig
   */
  public async getPendingProposals(): Promise<MultiSigProposal[]> {
    const multiSig = await this.getMultiSig();

    if (!multiSig) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'This Account is not a signer on any MultiSig',
      });
    }

    return multiSig.getProposals();
  }

  /**
   * Returns all off chain receipts used by this Account
   */
  public async getOffChainReceipts(): Promise<BigNumber[]> {
    const {
      context: {
        polymeshApi: {
          query: {
            settlement: { receiptsUsed },
          },
        },
      },
      address,
      context,
    } = this;

    const rawReceiptEntries = await receiptsUsed.entries(stringToAccountId(address, context));

    return rawReceiptEntries.map(
      ([
        {
          args: [, rawReceiptUid],
        },
      ]) => u64ToBigNumber(rawReceiptUid)
    );
  }

  /**
   * Returns next assetID that will be generated for this Identity
   */
  public async getNextAssetId(): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: {
            asset: { assetNonce },
          },
          genesisHash,
        },
      },
      context,
      address,
    } = this;

    const rawAccountId = stringToAccountId(address, context);
    const rawNonce = await assetNonce(rawAccountId);

    const prefix = stringToHex(ASSET_ID_PREFIX);

    const assetComponents = [
      prefix,
      genesisHash.toHex(),
      rawAccountId.toHex(),
      rawNonce.toHex(true),
    ];

    const data = hexAddPrefix(assetComponents.map(e => hexStripPrefix(e)).join(''));

    const rawBytes = blake2AsU8a(data, 128);

    const rawBytesSix = rawBytes[6]!;
    const rawBytesEight = rawBytes[8]!;

    // Need to override 6bits to make it a valid v8 UUID.
    rawBytes[6] = (rawBytesSix & 0x0f) | 0x80;

    // Set the RFC4122 variant (bits 10xx) in the 8th byte
    rawBytes[8] = (rawBytesEight & 0x3f) | 0x80;

    return hexToUuid(u8aToHex(rawBytes));
  }

  /**
   * Retrieve the balances of all fungible assets in this Account
   *
   * @param args.assets - array of FungibleAssets (or tickers) for which to fetch balances (optional, all balances are retrieved if not passed)
   */
  public async getAssetBalances(args?: {
    assets: (string | FungibleAsset)[];
  }): Promise<AssetHolderBalance[]> {
    const {
      address,
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      context,
    } = this;

    const rawAccountId = stringToAccountId(address, context);
    const [totalBalanceEntries, lockedBalanceEntries] = await Promise.all([
      asset.assetBalance.entries(rawAccountId),
      asset.lockedBalance.entries(rawAccountId),
    ]);

    const assetBalances: Record<string, AssetHolderBalance> = {};

    totalBalanceEntries.forEach(([key, balance]) => {
      const assetId = assetIdToString(key.args[1]);
      const total = balanceToBigNumber(balance);

      assetBalances[assetId] = {
        asset: new FungibleAsset({ assetId }, context),
        total,
        locked: new BigNumber(0),
        free: total,
      };
    });

    lockedBalanceEntries.forEach(([key, balance]) => {
      const assetId = assetIdToString(key.args[1]);
      const locked = balanceToBigNumber(balance);

      if (!locked.isZero()) {
        const tickerBalance = assetBalances[assetId]!;

        tickerBalance.locked = locked;
        tickerBalance.free = assetBalances[assetId]!.total.minus(locked);
      }
    });

    if (args?.assets.length) {
      const filteredBalances: PortfolioBalance[] = [];
      for (const asset of args.assets) {
        const argAsset = await asFungibleAsset(asset, context);
        const portfolioBalance = {
          total: new BigNumber(0),
          locked: new BigNumber(0),
          free: new BigNumber(0),
          asset: argAsset,
        };

        filteredBalances.push(assetBalances[argAsset.id] ?? portfolioBalance);
      }

      return filteredBalances;
    }

    return values(assetBalances);
  }

  /**
   * Retrieve the NFTs held in this Account
   *
   *  @param args.collections - array of NftCollection (or tickers) for which to fetch holdings (optional, all holdings are retrieved if not passed)
   */
  public async getCollections(args?: {
    collections: (string | NftCollection)[];
  }): Promise<AccountCollection[]> {
    const {
      context: {
        polymeshApi: {
          query: { nft },
        },
      },
      address,
      context,
    } = this;

    const rawAccountId = stringToAccountId(address, context);
    const collectionEntries = await nft.nftHolder.entries(rawAccountId);

    let queriedCollections: string[] | undefined;

    if (args?.collections) {
      queriedCollections = await Promise.all(
        args.collections.map(asset => asAssetId(asset, context))
      );
    }

    const seenAssetIds = new Set<string>();

    const processCollectionEntry = (
      collectionRecord: Record<string, Nft[]>,
      entry: (typeof collectionEntries)[0],
      status: NftOwnerStatus
    ): Record<string, Nft[]> => {
      const [
        {
          args: [, [rawAssetId, rawNftId]],
        },
        rawStatus,
      ] = entry;

      const ownerStatus = meshNftOwnerStatusToNftOwnerStatus(rawStatus);
      const assetId = assetIdToString(rawAssetId);
      const heldId = u64ToBigNumber(rawNftId);

      if (queriedCollections && !queriedCollections.includes(assetId)) {
        return collectionRecord;
      }

      if (ownerStatus !== status) {
        return collectionRecord;
      }

      // if the user provided a filter arg, then ignore any asset not specified
      if (!queriedCollections || queriedCollections.includes(assetId)) {
        seenAssetIds.add(assetId);
        const nft = new Nft({ id: heldId, assetId }, context);

        if (!collectionRecord[assetId]) {
          collectionRecord[assetId] = [nft];
        } else {
          collectionRecord[assetId]!.push(nft);
        }
      }

      return collectionRecord;
    };

    const heldCollections: Record<string, Nft[]> = collectionEntries.reduce(
      (collection, entry) => processCollectionEntry(collection, entry, NftOwnerStatus.Owner),
      {}
    );

    const lockedCollections: Record<string, Nft[]> = collectionEntries.reduce(
      (collection, entry) => processCollectionEntry(collection, entry, NftOwnerStatus.OwnerLocked),
      {}
    );

    const collections: PortfolioCollection[] = [];
    seenAssetIds.forEach(assetId => {
      const held = heldCollections[assetId]!;
      const locked = lockedCollections[assetId] || [];
      // calculate free NFTs by filtering held NFTs by locked NFT IDs
      const lockedIds = new Set(locked.map(({ id }) => id.toString()));
      const free = held.filter(({ id }) => !lockedIds.has(id.toString()));
      const total = new BigNumber(held.length);

      collections.push({
        collection: new NftCollection({ assetId }, context),
        free,
        locked,
        total,
      });
    });

    return collections;
  }
}
