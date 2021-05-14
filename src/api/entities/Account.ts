import BigNumber from 'bignumber.js';
import { TxTag } from 'polymesh-types/types';

import { Authorizations, Context, Entity, Identity } from '~/internal';
import { transactions } from '~/middleware/queries';
import { Query, TransactionOrderByInput } from '~/middleware/types';
import {
  AccountBalance,
  Ensured,
  ExtrinsicData,
  ResultSet,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  addressToKey,
  extrinsicIdentifierToTxTag,
  identityIdToString,
  stringToAccountId,
  txTagToExtrinsicIdentifier,
} from '~/utils/conversion';
import { assertFormatValid, calculateNextKey } from '~/utils/internal';

export interface UniqueIdentifiers {
  address: string;
}

/**
 * Represents an account in the Polymesh blockchain. Accounts can hold POLYX, control Identities and vote on proposals (among other things)
 */
export class Account extends Entity<UniqueIdentifiers> {
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
      transactions({
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
}
