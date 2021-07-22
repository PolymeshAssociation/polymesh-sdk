import BigNumber from 'bignumber.js';

import { Context, Entity } from '~/internal';
import { GroupDetails } from '~/types';
import {
  extrinsicPermissionsToTransactionPermissions,
  numberToU32,
  stringToTicker,
  transactionPermissionsToTxGroups,
} from '~/utils/conversion';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

/**
 * Represents a group of permissions for a Security Token
 */
export class PermissionGroup extends Entity<UniqueIdentifiers, string> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  public id: BigNumber;
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, ticker } = identifiers;

    this.id = id;
    this.ticker = ticker;
  }

  /**
   * Return the Group's ID
   */
  public toJson(): string {
    return this.id.toString();
  }

  /**
   * Retrieve information specific to this Permission Group
   */
  public async details(): Promise<GroupDetails> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      ticker,
      id,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawAgId = numberToU32(id, context);

    const rawGroupPermissions = await externalAgents.groupPermissions(rawTicker, rawAgId);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transactionPermissions = extrinsicPermissionsToTransactionPermissions(
      rawGroupPermissions.unwrap()
    )!;

    const txGroups = transactionPermissionsToTxGroups(transactionPermissions);

    return {
      permissions: transactionPermissions,
      groups: txGroups,
    };
  }
}
