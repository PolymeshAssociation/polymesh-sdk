import BigNumber from 'bignumber.js';

import { Context, Entity, PolymeshError } from '~/internal';
import { ConfidentialTransactionDetails, ErrorCode } from '~/types';
import {
  bigNumberToU64,
  meshConfidentialTransactionDetailsToDetails,
  meshConfidentialTransactionStatusToStatus,
  u64ToBigNumber,
} from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
}

/**
 * Represents a confidential Asset Transaction to be executed on a certain Venue
 */
export class ConfidentialTransaction extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber;
  }

  /**
   * Unique identifier number of the settlement transaction
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Fetch details about this transaction
   */
  public async details(): Promise<ConfidentialTransactionDetails> {
    const {
      id,
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const rawId = bigNumberToU64(id, context);

    const [rawDetails, rawStatus] = await Promise.all([
      confidentialAsset.transactions(rawId),
      confidentialAsset.transactionStatuses(rawId),
    ]);

    if (rawDetails.isNone || rawStatus.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential transaction details were not found',
        data: { id },
      });
    }

    const details = meshConfidentialTransactionDetailsToDetails(rawDetails.unwrap());
    const status = meshConfidentialTransactionStatusToStatus(rawStatus.unwrap());

    return {
      ...details,
      status,
    };
  }

  /**
   * Determine whether this settlement Transaction exists on chain (or existed and was pruned)
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

    const transactionCounter = await confidentialAsset.transactionCounter();

    return id.lte(u64ToBigNumber(transactionCounter.unwrap()));
  }

  /**
   * Return the settlement Transaction's ID
   */
  public toHuman(): string {
    return this.id.toString();
  }
}
