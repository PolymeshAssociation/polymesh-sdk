import { AugmentedQueries } from '@polkadot/api/types';
import { ConfidentialAssetsElgamalCipherText } from '@polkadot/types/lookup';
import type { Option, U8aFixed } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';

import {
  ConfidentialAsset,
  ConfidentialTransaction,
  Context,
  Entity,
  Identity,
  PolymeshError,
} from '~/internal';
import {
  ConfidentialAssetHistoryByConfidentialAccountArgs,
  confidentialAssetsByHolderQuery,
  ConfidentialTransactionsByConfidentialAccountArgs,
  getConfidentialAssetHistoryByConfidentialAccountQuery,
  getConfidentialTransactionsByConfidentialAccountQuery,
} from '~/middleware/queries';
import { Query } from '~/middleware/types';
import {
  ConfidentialAssetBalance,
  ConfidentialAssetHistoryEntry,
  ErrorCode,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  confidentialAccountToMeshPublicKey,
  identityIdToString,
  meshConfidentialAssetToAssetId,
  middlewareEventDetailsToEventIdentifier,
  serializeConfidentialAssetId,
} from '~/utils/conversion';
import { asConfidentialAsset, calculateNextKey, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export interface UniqueIdentifiers {
  publicKey: string;
}

/**
 * Represents an confidential Account in the Polymesh blockchain
 */
export class ConfidentialAccount extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { publicKey } = identifier as UniqueIdentifiers;

    return typeof publicKey === 'string';
  }

  /**
   * Public key of the confidential Account. Serves as an identifier
   */
  public publicKey: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { publicKey } = identifiers;

    this.publicKey = publicKey;
  }

  /**
   * Retrieve the Identity associated to this Account (null if there is none)
   */
  public async getIdentity(): Promise<Identity | null> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      context,
      publicKey,
    } = this;

    const optIdentityId = await confidentialAsset.accountDid(publicKey);

    if (optIdentityId.isNone) {
      return null;
    }

    const did = identityIdToString(optIdentityId.unwrap());

    return new Identity({ did }, context);
  }

  /**
   * @hidden
   *
   * Populates asset balance (current/incoming) for a confidential Account
   */
  private async populateAssetBalances(
    storage: AugmentedQueries<'promise'>['confidentialAsset']['accountBalance' | 'incomingBalance']
  ): Promise<ConfidentialAssetBalance[]> {
    const { context, publicKey } = this;

    const rawEntries = await storage.entries(publicKey);

    const assembleResult = (
      rawAssetId: U8aFixed,
      rawBalance: Option<ConfidentialAssetsElgamalCipherText>
    ): ConfidentialAssetBalance => {
      const assetId = meshConfidentialAssetToAssetId(rawAssetId);
      const encryptedBalance = rawBalance.unwrap();
      return {
        asset: new ConfidentialAsset({ id: assetId }, context),
        balance: encryptedBalance.toString(),
      };
    };

    return rawEntries.map(
      ([
        {
          args: [, rawAssetId],
        },
        rawBalance,
      ]) => assembleResult(rawAssetId, rawBalance)
    );
  }

  /**
   * @hidden
   *
   * Retrieved encrypted balance (current/incoming) for a Confidential Asset
   */
  private async populateAssetBalance(
    storage: AugmentedQueries<'promise'>['confidentialAsset']['accountBalance' | 'incomingBalance'],
    asset: string | ConfidentialAsset
  ): Promise<string> {
    const { context, publicKey } = this;

    const confidentialAsset = asConfidentialAsset(asset, context);

    const rawBalance = await storage(publicKey, serializeConfidentialAssetId(confidentialAsset));

    if (rawBalance.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No balance found for the given asset',
        data: {
          assetId: confidentialAsset.id,
        },
      });
    }

    return rawBalance.unwrap().toString();
  }

  /**
   * Retrieves current balances of all Confidential Assets for this Confidential Account
   */
  public async getBalances(): Promise<ConfidentialAssetBalance[]> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    return this.populateAssetBalances(confidentialAsset.accountBalance);
  }

  /**
   * Retrieves incoming balance for a specific Confidential Asset
   */
  public async getBalance(args: { asset: ConfidentialAsset | string }): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    return this.populateAssetBalance(confidentialAsset.accountBalance, args.asset);
  }

  /**
   * Retrieves all incoming balances for this Confidential Account
   */
  public async getIncomingBalances(): Promise<ConfidentialAssetBalance[]> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    return this.populateAssetBalances(confidentialAsset.incomingBalance);
  }

  /**
   * Retrieves incoming balance for a specific Confidential Asset
   */
  public async getIncomingBalance(args: { asset: ConfidentialAsset | string }): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    return this.populateAssetBalance(confidentialAsset.incomingBalance, args.asset);
  }

  /**
   * Determine whether this Account exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawPublicKey = confidentialAccountToMeshPublicKey(this, this.context);

    const didRecord = await confidentialAsset.accountDid(rawPublicKey);
    return didRecord.isSome;
  }

  /**
   * Return the Account's address
   */
  public toHuman(): string {
    return this.publicKey;
  }

  /**
   * Retrieve the ConfidentialAssets associated to this Account
   *
   * @note uses the middlewareV2
   * @param filters.size - page size
   * @param filters.start - page offset
   */
  public async getHeldAssets(
    filters: {
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<ConfidentialAsset>> {
    const { context, publicKey } = this;
    const { size, start } = filters;

    const {
      data: {
        confidentialAssetHolders: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'confidentialAssetHolders'>>(
      confidentialAssetsByHolderQuery(publicKey, size, start)
    );

    const data = nodes.map(({ assetId: id }) => new ConfidentialAsset({ id }, context));
    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Retrieve the ConfidentialTransactions associated to this Account
   *
   * @note uses the middlewareV2
   * @param filters.direction - the direction of the transaction (Incoming/Outgoing/All)
   * @param filters.status - the transaction status (Created/Executed/Rejected)
   * @param filters.size - page size
   * @param filters.start - page offset
   */
  public async getTransactions(
    filters: Omit<ConfidentialTransactionsByConfidentialAccountArgs, 'accountId'> & {
      size?: BigNumber;
      start?: BigNumber;
    }
  ): Promise<ResultSet<ConfidentialTransaction>> {
    const { context, publicKey } = this;
    const { size, start, status, direction } = filters;

    const {
      data: {
        confidentialTransactions: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'confidentialTransactions'>>(
      getConfidentialTransactionsByConfidentialAccountQuery(
        { accountId: publicKey, status, direction },
        size,
        start
      )
    );

    const data = nodes.map(
      ({ id }) => new ConfidentialTransaction({ id: new BigNumber(id) }, context)
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
   * Retrieve the ConfidentialTransactionHistory associated to this Account
   *
   * @note uses the middlewareV2
   * @param filters.eventId - the type of transaction (AccountDepositIncoming/AccountDeposit/AccountWithdraw)
   * @param filters.assetId - the assetId for which the transactions were made
   * @param filters.size - page size
   * @param filters.start - page offset
   */
  public async getTransactionHistory(
    filters?: Omit<ConfidentialAssetHistoryByConfidentialAccountArgs, 'accountId'> & {
      size?: BigNumber;
      start?: BigNumber;
    }
  ): Promise<ResultSet<ConfidentialAssetHistoryEntry>> {
    const { context, publicKey } = this;
    const { size, start, ...rest } = filters ?? {};

    const {
      data: {
        confidentialAssetHistories: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'confidentialAssetHistories'>>(
      getConfidentialAssetHistoryByConfidentialAccountQuery(
        { accountId: publicKey, ...rest },
        size,
        start
      )
    );

    const data: ConfidentialAssetHistoryEntry[] = nodes.map(
      ({ id, assetId, amount, eventId, createdBlock, eventIdx }) => {
        return {
          id,
          asset: new ConfidentialAsset({ id: assetId }, context),
          amount,
          eventId,
          createdAt: optionize(middlewareEventDetailsToEventIdentifier)(createdBlock, eventIdx),
        };
      }
    );
    const count = new BigNumber(totalCount);
    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }
}
