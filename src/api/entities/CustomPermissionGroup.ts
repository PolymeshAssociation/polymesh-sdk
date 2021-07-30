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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const transactionPermissions = extrinsicPermissionsToTransactionPermissions(
      rawGroupPermissions.unwrap()
    )!;

    const txGroups = transactionPermissionsToTxGroups(transactionPermissions);

    return {
      transactions: transactionPermissions,
      transactionGroups: txGroups,
    };
  }
}
