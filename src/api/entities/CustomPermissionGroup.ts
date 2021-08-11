import BigNumber from 'bignumber.js';

import { Context, PermissionGroup } from '~/internal';
import { GroupPermissions } from '~/types';
import {
  extrinsicPermissionsToTransactionPermissions,
  numberToU32,
  stringToTicker,
  transactionPermissionsToTxGroups,
} from '~/utils/conversion';

export interface HumanReadable {
  id: BigNumber;
  ticker: string;
}

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

/**
 * Represents a group of custom permissions for a Security Token
 */
export class CustomPermissionGroup extends PermissionGroup {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

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
   * Return the Group's ID
   */
  public toJson(): HumanReadable {
    const { id, ticker } = this;
    return {
      id,
      ticker,
    };
  }

  /**
   * Retrieve the list of permissions and transaction groups associated with this Permission Group
   */
  public async getPermissions(): Promise<GroupPermissions> {
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

    const transactions = extrinsicPermissionsToTransactionPermissions(rawGroupPermissions.unwrap());

    const transactionGroups = transactionPermissionsToTxGroups(transactions);

    return {
      transactions,
      transactionGroups,
    };
  }
}
