import BigNumber from 'bignumber.js';

import { ConfidentialTransaction, Context, Entity, Identity, PolymeshError } from '~/internal';
import { ConfidentialTransactionStatus, ErrorCode, GroupedTransactions } from '~/types';
import { bigNumberToU64, identityIdToString, u64ToBigNumber } from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a Venue through which confidential transactions are handled
 */
export class ConfidentialVenue extends Entity<UniqueIdentifiers, string> {
  /**
   * identifier number of the confidential Venue
   */
  public id: BigNumber;

  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Retrieve the creator of this confidential Venue
   */
  public async creator(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
      context,
    } = this;

    const rawId = bigNumberToU64(id, context);
    const creator = await confidentialAsset.venueCreator(rawId);

    if (creator.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Venue does not exists',
      });
    }

    return new Identity({ did: identityIdToString(creator.unwrap()) }, context);
  }

  /**
   * Retrieve all transactions in this Confidential Venue.
   * This groups the transactions based on their status as pending, executed or rejected
   */
  public async getTransactions(): Promise<GroupedTransactions> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
      context,
    } = this;

    const transactionEntries = await confidentialAsset.venueTransactions.entries(
      bigNumberToU64(id, context)
    );

    const transactions = transactionEntries.map(
      ([
        {
          args: [, transactionId],
        },
      ]) => new ConfidentialTransaction({ id: u64ToBigNumber(transactionId.unwrap()) }, context)
    );

    const details = await Promise.all(transactions.map(transaction => transaction.details()));
    const pending: ConfidentialTransaction[] = [];
    const executed: ConfidentialTransaction[] = [];
    const rejected: ConfidentialTransaction[] = [];

    details.forEach(({ status }, index) => {
      if (status === ConfidentialTransactionStatus.Pending) {
        pending.push(transactions[index]);
      }

      if (status === ConfidentialTransactionStatus.Executed) {
        executed.push(transactions[index]);
      }

      if (status === ConfidentialTransactionStatus.Rejected) {
        rejected.push(transactions[index]);
      }
    });

    return {
      pending,
      executed,
      rejected,
    };
  }

  /**
   * Determine whether this confidential Venue exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
      id,
    } = this;

    if (id.lte(new BigNumber(0))) {
      return false;
    }

    const rawCounter = await confidentialAsset.venueCounter();

    const nextVenue = u64ToBigNumber(rawCounter);

    return id.lt(nextVenue);
  }

  /**
   * Return the confidential Venue's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
