import BigNumber from 'bignumber.js';
import { difference, differenceBy, differenceWith, isEqual, union } from 'lodash';

import { Authorizations, Context, Entity, Identity } from '~/internal';
import { transactions as MiddlewareTransactions } from '~/middleware/queries';
import { Query, TransactionOrderByInput } from '~/middleware/types';
import {
  AccountBalance,
  DefaultPortfolio,
  Ensured,
  ExtrinsicData,
  ModuleName,
  NumberedPortfolio,
  Permissions,
  PermissionType,
  ResultSet,
  SimplePermissions,
  SubCallback,
  TxTag,
  TxTags,
  UnsubCallback,
} from '~/types';
import {
  addressToKey,
  extrinsicIdentifierToTxTag,
  identityIdToString,
  portfolioToPortfolioId,
  signerToString,
  stringToAccountId,
  txTagToExtrinsicIdentifier,
} from '~/utils/conversion';
import { assertFormatValid, calculateNextKey, isModuleOrTagMatch } from '~/utils/internal';

export interface UniqueIdentifiers {
  address: string;
}

/**
 * Represents an account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)
 */
export class Account extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { address } = identifier as UniqueIdentifiers;

    return typeof address === 'string';
  }

  /**
   * Polymesh-specific address of the account. Serves as an identifier
   */
  public address: string;

  /**
   * public key of the account. This is a hex representation of the address that is transversal to any Substrate chain
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

    assertFormatValid(address, context.ss58Format);

    this.address = address;
    this.key = addressToKey(address, context);
    this.authorizations = new Authorizations(this, context);
  }

  /**
   * Get the free/locked POLYX balance of the account
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

    const identityId = await identity.keyToIdentityIds(stringToAccountId(address, context));

    if (identityId.isEmpty) {
      return null;
    }

    const did = identityIdToString(identityId);

    return new Identity({ did }, context);
  }

  /**
   * Retrieve a list of transactions signed by this account. Can be filtered using parameters
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
      tag?: TxTag;
      success?: boolean;
      size?: number;
      start?: number;
      orderBy?: TransactionOrderByInput;
    } = {}
  ): Promise<ResultSet<ExtrinsicData>> {
    const { context, address } = this;

    const { blockNumber, tag, success, size, start, orderBy } = filters;

    let moduleId;
    let callId;
    if (tag) {
      ({ moduleId, callId } = txTagToExtrinsicIdentifier(tag));
    }

    /* eslint-disable @typescript-eslint/naming-convention */
    const result = await context.queryMiddleware<Ensured<Query, 'transactions'>>(
      MiddlewareTransactions({
        block_id: blockNumber ? blockNumber.toNumber() : undefined,
        address: addressToKey(address, context),
        module_id: moduleId,
        call_id: callId,
        success,
        count: size,
        skip: start,
        orderBy,
      })
    );

    const {
      data: {
        transactions: { items: transactionList, totalCount: count },
      },
    } = result;

    const data: ExtrinsicData[] = [];

    transactionList.forEach(
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
      }) => {
        // TODO remove null check once types fixed
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        data.push({
          blockNumber: new BigNumber(block_id),
          extrinsicIdx: extrinsic_idx,
          address: rawAddress ?? null,
          nonce: nonce!,
          txTag: extrinsicIdentifierToTxTag({ moduleId: module_id, callId: call_id }),
          params,
          success: !!txSuccess,
          specVersionId: spec_version_id,
          extrinsicHash: extrinsic_hash!,
        });
        /* eslint-enabled @typescript-eslint/no-non-null-assertion */
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
   * Check whether this Account is frozen. If frozen, it cannot perform any action until the primary key of the Identity unfreezes all secondary keys
   */
  public async isFrozen(): Promise<boolean> {
    const { address } = this;

    const identity = await this.getIdentity();

    if (identity === null) {
      return false;
    }

    const primaryKey = await identity.getPrimaryKey();

    if (address === primaryKey) {
      return false;
    }

    return identity.areSecondaryKeysFrozen();
  }

  /**
   * Retrieve the Permissions this Signer has as a Signing Key for its corresponding Identity
   */
  public async getPermissions(): Promise<Permissions> {
    const { context, address } = this;

    const currentIdentity = await context.getCurrentIdentity();

    const [primaryKey, secondaryKeys] = await Promise.all([
      currentIdentity.getPrimaryKey(),
      currentIdentity.getSecondaryKeys(),
    ]);

    if (address === primaryKey) {
      return {
        tokens: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const key = secondaryKeys.find(({ signer }) => address === signerToString(signer))!;

    return key.permissions;
  }

  /**
   * Check if this Account possesses certain Permissions for its corresponding Identity
   */
  public async hasPermissions(permissions: SimplePermissions): Promise<boolean> {
    const { tokens, transactions, portfolios } = permissions;

    const {
      tokens: currentTokens,
      transactions: currentTransactions,
      portfolios: currentPortfolios,
    } = await this.getPermissions();

    let hasTokens;
    if (currentTokens === null) {
      hasTokens = true;
    } else if (tokens === null) {
      hasTokens = false;
    } else if (tokens) {
      const { type: tokensType, values: tokensValues } = currentTokens;
      if (tokens.length === 0) {
        hasTokens = true;
      } else {
        if (tokensType === PermissionType.Include) {
          hasTokens = !differenceBy(tokens, tokensValues, 'ticker').length;
        } else {
          hasTokens = differenceBy(tokens, tokensValues, 'ticker').length === tokens.length;
        }
      }
    } else {
      hasTokens = true;
    }

    // these transactions are allowed to any account, independent of permissions
    const exemptedTransactions: (TxTag | ModuleName)[] = [
      ...difference(Object.values(TxTags.balances), [
        TxTags.balances.DepositBlockRewardReserveBalance,
        TxTags.balances.BurnAccountBalance,
      ]),
      ModuleName.Staking,
      ModuleName.Sudo,
      ModuleName.Session,
      ModuleName.Authorship,
      ModuleName.Babe,
      ModuleName.FinalityTracker,
      ModuleName.Grandpa,
      ModuleName.ImOnline,
      ModuleName.Indices,
      ModuleName.Scheduler,
      ModuleName.System,
      ModuleName.Timestamp,
    ];

    let hasTransactions;
    if (currentTransactions === null) {
      hasTransactions = true;
    } else if (transactions === null) {
      hasTransactions = false;
    } else if (transactions) {
      const {
        type: transactionsType,
        values: transactionsValues,
        exceptions = [],
      } = currentTransactions;
      if (transactions.length === 0) {
        hasTransactions = true;
      } else {
        if (transactionsType === PermissionType.Include) {
          const includedTransactions = differenceWith(
            union(transactionsValues, exemptedTransactions),
            exceptions,
            isModuleOrTagMatch
          );
          hasTransactions = transactions.every(
            tag => !!includedTransactions.find(included => isModuleOrTagMatch(included, tag))
          );
        } else {
          const excludedTransactions = differenceWith(
            transactionsValues,
            exemptedTransactions,
            exceptions,
            isModuleOrTagMatch
          );
          hasTransactions = !transactions.some(
            tag => !!excludedTransactions.find(excluded => isModuleOrTagMatch(excluded, tag))
          );
        }
      }
    } else {
      hasTransactions = true;
    }

    let hasPortfolios;
    if (currentPortfolios === null) {
      hasPortfolios = true;
    } else if (portfolios === null) {
      hasPortfolios = false;
    } else if (portfolios) {
      const { type: portfoliosType, values: portfoliosValues } = currentPortfolios;

      if (portfolios.length === 0) {
        hasPortfolios = true;
      } else {
        const portfolioComparator = (
          a: DefaultPortfolio | NumberedPortfolio,
          b: DefaultPortfolio | NumberedPortfolio
        ) => {
          const aId = portfolioToPortfolioId(a);
          const bId = portfolioToPortfolioId(b);

          return isEqual(aId, bId);
        };
        if (portfoliosType === PermissionType.Include) {
          hasPortfolios = !differenceWith(portfolios, portfoliosValues, portfolioComparator).length;
        } else {
          hasPortfolios =
            differenceWith(portfolios, portfoliosValues, portfolioComparator).length ===
            portfolios.length;
        }
      }
    } else {
      hasPortfolios = true;
    }

    return hasTokens && hasTransactions && hasPortfolios;
  }

  /**
   * Return the Account's address
   */
  public toJson(): string {
    return this.address;
  }
}
