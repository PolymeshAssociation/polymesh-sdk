import {
  Context,
  createGroup,
  CreateGroupParams,
  CustomPermissionGroup,
  Namespace,
  SecurityToken,
} from '~/internal';
import { PaginationOptions, ProcedureMethod, ResultSet } from '~/types';
import { stringToTicker, tickerToString, u32ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Security Token Permissions related functionality
 */
export class Permissions extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.createGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [createGroup, { ticker, ...args }] },
      context
    );
  }

  /**
   * Create a Security Token Agent Group
   */
  public createGroup: ProcedureMethod<CreateGroupParams, CustomPermissionGroup>;

  /**
   * Retrieve all custom group permissions of the Security Token
   *
   * @note supports pagination
   */
  public async getGroups(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<CustomPermissionGroup>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const { entries, lastKey: next } = await requestPaginated(
      query.externalAgents.groupPermissions,
      {
        arg: stringToTicker(ticker, context),
        paginationOpts,
      }
    );

    const data: CustomPermissionGroup[] = entries.map(
      ([storageKey]) =>
        new CustomPermissionGroup(
          { ticker: tickerToString(storageKey.args[0]), id: u32ToBigNumber(storageKey.args[1]) },
          context
        )
    );

    return {
      data,
      next,
    };
  }
}
