import { hexStripPrefix } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import {
  capitalize,
  difference,
  differenceBy,
  differenceWith,
  intersection,
  intersectionBy,
  intersectionWith,
  isEqual,
  union,
} from 'lodash';

import {
  Asset,
  Authorizations,
  Context,
  Entity,
  Identity,
  MultiSig,
  PolymeshError,
} from '~/internal';
import { transactions as transactionsQuery } from '~/middleware/queries';
import { extrinsicsByArgs } from '~/middleware/queriesV2';
import { Query, TransactionOrderByInput } from '~/middleware/types';
import { ExtrinsicsOrderBy, Query as QueryV2 } from '~/middleware/typesV2';
import {
  AccountBalance,
  CheckPermissionsResult,
  DefaultPortfolio,
  ErrorCode,
  ExtrinsicData,
  ModuleName,
  NumberedPortfolio,
  Permissions,
  PermissionType,
  ResultSet,
  SectionPermissions,
  SignerType,
  SimplePermissions,
  SubCallback,
  SubsidyWithAllowance,
  TransactionPermissions,
  TxTag,
  TxTags,
  UnsubCallback,
} from '~/types';
import { Ensured, EnsuredV2 } from '~/types/utils';
import {
  addressToKey,
  extrinsicIdentifierToTxTag,
  identityIdToString,
  keyToAddress,
  portfolioToPortfolioId,
  stringToAccountId,
  stringToHash,
  txTagToExtrinsicIdentifier,
  txTagToExtrinsicIdentifierV2,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  assertAddressValid,
  calculateNextKey,
  getSecondaryAccountPermissions,
  isModuleOrTagMatch,
} from '~/utils/internal';

/**
 * @hidden
 *
 * Calculate the difference between the required Asset permissions and the current ones
 */
function getMissingAssetPermissions(
  requiredPermissions: Asset[] | null | undefined,
  currentPermissions: SectionPermissions<Asset> | null
): SimplePermissions['assets'] {
  if (currentPermissions === null) {
    return undefined;
  } else if (requiredPermissions === null) {
    return null;
  } else if (requiredPermissions) {
    const { type: permissionType, values: assetValues } = currentPermissions;

    if (requiredPermissions.length) {
      let missingPermissions: Asset[];

      if (permissionType === PermissionType.Include) {
        missingPermissions = differenceBy(requiredPermissions, assetValues, 'ticker');
      } else {
        missingPermissions = intersectionBy(requiredPermissions, assetValues, 'ticker');
      }

      if (missingPermissions.length) {
        return missingPermissions;
      }
    }
  }

  return undefined;
}

/**
 * @hidden
 *
 * Calculate the difference between the required Transaction permissions and the current ones
 */
function getMissingTransactionPermissions(
  requiredPermissions: TxTag[] | null | undefined,
  currentPermissions: TransactionPermissions | null
): SimplePermissions['transactions'] {
  // these transactions are allowed to any Account, independent of permissions
  const exemptedTransactions: (TxTag | ModuleName)[] = [
    TxTags.identity.LeaveIdentityAsKey,
    TxTags.identity.JoinIdentityAsKey,
    TxTags.multiSig.AcceptMultisigSignerAsKey,
    ...difference(Object.values(TxTags.balances), [
      TxTags.balances.DepositBlockRewardReserveBalance,
      TxTags.balances.BurnAccountBalance,
    ]),
    ModuleName.Staking,
    ModuleName.Sudo,
    ModuleName.Session,
    ModuleName.Authorship,
    ModuleName.Babe,
    ModuleName.Grandpa,
    ModuleName.ImOnline,
    ModuleName.Indices,
    ModuleName.Scheduler,
    ModuleName.System,
    ModuleName.Timestamp,
  ];

  if (currentPermissions === null) {
    return undefined;
  }

  if (requiredPermissions === null) {
    return null;
  }

  if (!requiredPermissions?.length) {
    return undefined;
  }

  const {
    type: transactionsType,
    values: transactionsValues,
    exceptions = [],
  } = currentPermissions;

  let missingPermissions: TxTag[];

  const exceptionMatches = intersection(requiredPermissions, exceptions);

  if (transactionsType === PermissionType.Include) {
    const includedTransactions = union(transactionsValues, exemptedTransactions);

    missingPermissions = union(
      differenceWith(requiredPermissions, includedTransactions, isModuleOrTagMatch),
      exceptionMatches
    );
  } else {
    /*
     * if the exclusion is a module, we only remove it from the list if the module itself is present in `exemptedTransactions`.
     *   Otherwise, if, for example, `transactionsValues` contains `ModuleName.Identity`,
     *   since `exemptedTransactions` contains `TxTags.identity.LeaveIdentityAsKey`, we would be
     *   removing the entire Identity module from the result, which doesn't make sense
     */
    const txComparator = (tx: TxTag | ModuleName, exemptedTx: TxTag | ModuleName): boolean => {
      if (!tx.includes('.')) {
        return tx === exemptedTx;
      }

      return isModuleOrTagMatch(tx, exemptedTx);
    };

    const excludedTransactions = differenceWith(
      transactionsValues,
      exemptedTransactions,
      txComparator
    );

    missingPermissions = difference(
      intersectionWith(requiredPermissions, excludedTransactions, isModuleOrTagMatch),
      exceptionMatches
    );
  }

  if (missingPermissions.length) {
    return missingPermissions;
  }

  return undefined;
}

/**
 * @hidden
 *
 * Calculate the difference between the required Transaction permissions and the current ones
 */
function getMissingPortfolioPermissions(
  requiredPermissions: (DefaultPortfolio | NumberedPortfolio)[] | null | undefined,
  currentPermissions: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null
): SimplePermissions['portfolios'] {
  if (currentPermissions === null) {
    return undefined;
  } else if (requiredPermissions === null) {
    return null;
  } else if (requiredPermissions) {
    const { type: portfoliosType, values: portfoliosValues } = currentPermissions;

    if (requiredPermissions.length) {
      let missingPermissions: (DefaultPortfolio | NumberedPortfolio)[];

      const portfolioComparator = (
        a: DefaultPortfolio | NumberedPortfolio,
        b: DefaultPortfolio | NumberedPortfolio
      ): boolean => {
        const aId = portfolioToPortfolioId(a);
        const bId = portfolioToPortfolioId(b);

        return isEqual(aId, bId);
      };

      if (portfoliosType === PermissionType.Include) {
        missingPermissions = differenceWith(
          requiredPermissions,
          portfoliosValues,
          portfolioComparator
        );
      } else {
        missingPermissions = intersectionWith(
          requiredPermissions,
          portfoliosValues,
          portfolioComparator
        );
      }

      if (missingPermissions.length) {
        return missingPermissions;
      }
    }
  }

  return undefined;
}

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
  }

  /**
   * Get the free/locked POLYX balance of the Account
   *
   * @note can be subscribed to
   */
  public getBalance(): Promise<AccountBalance>;
  public getBalance(callback: SubCallback<AccountBalance>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getBalance(
    callback?: SubCallback<AccountBalance>
  ): Promise<AccountBalance | UnsubCallback> {
    const { context, address } = this;

    if (callback) {
      return context.accountBalance(address, callback);
    }

    return context.accountBalance(address);
  }

  /**
   * Get the subsidized balance of this Account and the subsidizer Account. If
   *   this Account isn't being subsidized, return null
   *
   * @note can be subscribed to
   */
  public getSubsidy(): Promise<SubsidyWithAllowance | null>;
  public getSubsidy(callback: SubCallback<SubsidyWithAllowance | null>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public getSubsidy(
    callback?: SubCallback<SubsidyWithAllowance | null>
  ): Promise<SubsidyWithAllowance | null | UnsubCallback> {
    const { context, address } = this;

    if (callback) {
      return context.accountSubsidy(address, callback);
    }

    return context.accountSubsidy(address);
  }

  /**
   * Retrieve the Identity associated to this Account (null if there is none)
   */
  public async getIdentity(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { identity, multiSig },
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

    let did: string;
    if (keyRecord.isPrimaryKey) {
      did = identityIdToString(keyRecord.asPrimaryKey);
    } else if (keyRecord.isSecondaryKey) {
      did = identityIdToString(keyRecord.asSecondaryKey[0]);
    } else {
      const multiSigAddress = keyRecord.asMultiSigSignerKey;
      const rawMultiSigDid = await multiSig.multiSigToIdentity(multiSigAddress);
      did = identityIdToString(rawMultiSigDid);
    }

    return new Identity({ did }, context);
  }

  /**
   * Retrieve a list of transactions signed by this Account. Can be filtered using parameters
   *
   * @note if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account
   *
   * @param filters.tag - tag associated with the transaction
   * @param filters.success - whether the transaction was successful or not
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note uses the middleware
   */
  public async getTransactionHistory(
    filters: {
      blockNumber?: BigNumber;
      blockHash?: string;
      tag?: TxTag;
      success?: boolean;
      size?: BigNumber;
      start?: BigNumber;
      orderBy?: TransactionOrderByInput;
    } = {}
  ): Promise<ResultSet<ExtrinsicData>> {
    const { context, address } = this;

    if (context.isMiddlewareV2Enabled()) {
      const { orderBy, ...rest } = filters;
      let order: ExtrinsicsOrderBy = ExtrinsicsOrderBy.CreatedAtAsc;
      if (orderBy) {
        order = (capitalize(orderBy.field) + orderBy.order) as ExtrinsicsOrderBy;
      }
      return this.getTransactionHistoryV2({ ...rest, orderBy: order });
    }

    const { tag, success, size, start, orderBy, blockHash } = filters;
    let { blockNumber } = filters;

    if (!blockNumber && blockHash) {
      const {
        block: {
          header: { number },
        },
      } = await context.polymeshApi.rpc.chain.getBlock(stringToHash(blockHash, context));

      blockNumber = u32ToBigNumber(number.unwrap());
    }

    let moduleId;
    let callId;
    if (tag) {
      ({ moduleId, callId } = txTagToExtrinsicIdentifier(tag));
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    const result = await context.queryMiddleware<Ensured<Query, 'transactions'>>(
      transactionsQuery({
        block_id: blockNumber ? blockNumber.toNumber() : undefined,
        address: addressToKey(address, context),
        module_id: moduleId,
        call_id: callId,
        success,
        count: size?.toNumber(),
        skip: start?.toNumber(),
        orderBy,
      })
    );

    const {
      data: {
        transactions: { items: transactionList, totalCount },
      },
    } = result;

    const count = new BigNumber(totalCount);

    const data = transactionList.map(
      ({
        block_id,
        extrinsic_idx,
        address: rawAddress,
        nonce,
        module_id,
        call_id,
        params,
        success: txSuccess,
        spec_version_id,
        extrinsic_hash,
        block,
      }) => {
        // TODO remove null check once types fixed
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        return {
          blockNumber: new BigNumber(block_id),
          blockHash: block!.hash!,
          extrinsicIdx: new BigNumber(extrinsic_idx),
          address: rawAddress ?? null,
          nonce: nonce ? new BigNumber(nonce) : null,
          txTag: extrinsicIdentifierToTxTag({ moduleId: module_id, callId: call_id }),
          params,
          success: !!txSuccess,
          specVersionId: new BigNumber(spec_version_id),
          extrinsicHash: extrinsic_hash!,
        };
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      }
    );
    /* eslint-enable @typescript-eslint/naming-convention */

    const next = calculateNextKey(count, size, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve a list of transactions signed by this Account. Can be filtered using parameters
   *
   * @note if both `blockNumber` and `blockHash` are passed, only `blockNumber` is taken into account
   *
   * @param filters.tag - tag associated with the transaction
   * @param filters.success - whether the transaction was successful or not
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistoryV2(
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
    const { context, address } = this;

    const { tag, success, size, start, orderBy, blockHash } = filters;

    let moduleId;
    let callId;
    if (tag) {
      ({ moduleId, callId } = txTagToExtrinsicIdentifierV2(tag));
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
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'extrinsics'>>(
      extrinsicsByArgs(
        {
          blockId: blockNumber ? blockNumber.toString() : undefined,
          address: hexStripPrefix(addressToKey(address, context)),
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
        address: rawAddress,
        nonce,
        moduleId: extrinsicModuleId,
        callId: extrinsicCallId,
        paramsTxt,
        success: txSuccess,
        specVersionId,
        extrinsicHash,
        block,
      }) => ({
        blockNumber: new BigNumber(blockId),
        blockHash: block!.hash,
        extrinsicIdx: new BigNumber(extrinsicIdx),
        address: rawAddress ? keyToAddress(rawAddress, context) : null,
        nonce: nonce ? new BigNumber(nonce) : null,
        txTag: extrinsicIdentifierToTxTag({
          moduleId: extrinsicModuleId,
          callId: extrinsicCallId,
        }),
        params: JSON.parse(paramsTxt),
        success: !!txSuccess,
        specVersionId: new BigNumber(specVersionId),
        extrinsicHash: extrinsicHash!,
      })
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    const next = calculateNextKey(count, size, start);

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

    if (account.isEqual(this)) {
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

    return permissionedAccount.permissions;
  }

  /**
   * Check if this Account possesses certain Permissions to act on behalf of its corresponding Identity
   *
   * @return which permissions the Account is missing (if any) and the final result
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

    return new MultiSig({ address }, context);
  }

  /**
   * Determine whether this Account exists on chain
   */
  public async exists(): Promise<boolean> {
    return true;
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
          rpc: {
            system: { accountNextIndex },
          },
        },
      },
      address,
      context,
    } = this;

    const index = await accountNextIndex(stringToAccountId(address, context));

    return u32ToBigNumber(index);
  }
}
