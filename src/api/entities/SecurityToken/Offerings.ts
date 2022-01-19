import BigNumber from 'bignumber.js';
import { remove } from 'lodash';

import {
  Context,
  launchSto,
  LaunchStoParams,
  Namespace,
  PolymeshError,
  SecurityToken,
  Sto,
} from '~/internal';
import { ErrorCode, ProcedureMethod, StoStatus, StoWithDetails } from '~/types';
import { fundraiserToStoDetails, stringToTicker, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Offering related functionality
 */
export class Offerings extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.launch = createProcedureMethod(
      { getProcedureAndArgs: args => [launchSto, { ticker, ...args }] },
      context
    );
  }

  /**
   * Launch a Security Token Offering
   *
   * @note required roles:
   *   - Offering Portfolio Custodian
   *   - Raising Portfolio Custodian
   */
  public launch: ProcedureMethod<LaunchStoParams, Sto>;

  /**
   * Retrieve a single Offering associated to this Security Token by its ID
   *
   * @throws if there is no Offering with the passed ID
   */
  public async getOne(args: { id: BigNumber }): Promise<Sto> {
    const {
      parent: { ticker },
      context,
    } = this;
    const { id } = args;
    const offering = new Sto({ ticker, id }, context);

    const exists = await offering.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Offering does not exist',
      });
    }

    return offering;
  }

  /**
   * Retrieve all of the Token's Offerings and their details. Can be filtered using parameters
   *
   * @param opts.status - status of the offerings to fetch. If defined, only STOs that have all passed statuses will be returned
   */
  public async get(opts: { status?: Partial<StoStatus> } = {}): Promise<StoWithDetails[]> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
      context,
    } = this;

    const {
      status: { timing: timingFilter, balance: balanceFilter, sale: saleFilter } = {},
    } = opts;

    const rawTicker = stringToTicker(ticker, context);

    const [fundraiserEntries, nameEntries] = await Promise.all([
      sto.fundraisers.entries(rawTicker),
      sto.fundraiserNames.entries(rawTicker),
    ]);

    const stos = fundraiserEntries.map(
      ([
        {
          args: [, rawFundraiserId],
        },
        fundraiser,
      ]) => {
        const id = u64ToBigNumber(rawFundraiserId);
        const [[, name]] = remove(nameEntries, ([{ args: [, rawId] }]) =>
          u64ToBigNumber(rawId).eq(id)
        );
        return {
          sto: new Sto({ id, ticker }, context),
          details: fundraiserToStoDetails(fundraiser.unwrap(), name, context),
        };
      }
    );

    return stos.filter(
      ({
        details: {
          status: { timing, sale, balance },
        },
      }) =>
        (!timingFilter || timingFilter === timing) &&
        (!saleFilter || saleFilter === sale) &&
        (!balanceFilter || balanceFilter === balance)
    );
  }
}
