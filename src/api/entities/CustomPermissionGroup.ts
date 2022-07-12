import BigNumber from 'bignumber.js';

import { Context, PermissionGroup, setGroupPermissions } from '~/internal';
import { GroupPermissions, ProcedureMethod, SetGroupPermissionsParams } from '~/types';
import {
  bigNumberToU32,
  extrinsicPermissionsToTransactionPermissions,
  stringToTicker,
  transactionPermissionsToTxGroups,
  u32ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

export interface HumanReadable {
  id: string;
  ticker: string;
}

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

/**
 * Represents a group of custom permissions for an Asset
 */
export class CustomPermissionGroup extends PermissionGroup {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
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
      asset: { ticker },
      id,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawAgId = bigNumberToU32(id, context);

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
    const {
      asset: { ticker },
      id,
      context,
    } = this;

    const nextId = await context.polymeshApi.query.externalAgents.aGIdSequence(
      stringToTicker(ticker, context)
    );

    // 1 < id < next
    return u32ToBigNumber(nextId).gt(id) && id.gte(1);
  }

  /**
   * Return the Group's static data
   */
  public toHuman(): HumanReadable {
    const { id, asset } = this;

    return toHumanReadable({
      id,
      ticker: asset,
    });
  }
}
