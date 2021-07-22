import {
  Context,
  createGroup,
  CreateGroupParams,
  Namespace,
  PermissionGroup,
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
  public createGroup: ProcedureMethod<CreateGroupParams, void>;

  /**
   * Retrieve all group permissions of the Security Token
   *
   * @note supports pagination
   */
  public async getGroups(paginationOpts?: PaginationOptions): Promise<ResultSet<PermissionGroup>> {
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

    const data: PermissionGroup[] = entries.map(
      ([storageKey]) =>
        new PermissionGroup(
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
