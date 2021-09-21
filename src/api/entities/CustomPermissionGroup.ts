import BigNumber from 'bignumber.js';

import {
  Context,
  PermissionGroup,
  setGroupPermissions,
  SetGroupPermissionsParams,
} from '~/internal';
import { GroupPermissions, ProcedureMethod } from '~/types';
import {
  extrinsicPermissionsToTransactionPermissions,
  numberToU32,
  stringToTicker,
  transactionPermissionsToTxGroups,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

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

    this.setPermissions = createProcedureMethod(
      { getProcedureAndArgs: args => [setGroupPermissions, { group: this, ...args }] },
      context
    );
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
   * Modify the group's permissions
   */
  public setPermissions: ProcedureMethod<SetGroupPermissionsParams, void>;

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

  /**
   * Determine whether this Custom Permission Group exists on chain
   */
  public async exists(): Promise<boolean> {
    const { ticker, id, context } = this;

    const nextId = await context.polymeshApi.query.externalAgents.agIdSequence(
      stringToTicker(ticker, context)
    );

    // 1 < id < next
    return u32ToBigNumber(nextId).gt(id) && id.gte(1);
  }
}
