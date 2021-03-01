import { Context, launchSto, LaunchStoParams, Namespace, SecurityToken, Sto } from '~/internal';
import { StoStatus, StoWithDetails } from '~/types';
import { ProcedureMethod } from '~/types/internal';
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

    this.launch = createProcedureMethod(args => [launchSto, { ticker, ...args }], context);
  }

  /**
   * Launch a Security Token Offering
   *
   * @param args.offeringPortfolio - portfolio in which the Tokens to be sold are stored
   *   (optional, defaults to the default portfolio of the Security Token's Primary Issuance Agent)
   * @param args.raisingPorfolio - portfolio in which the raised funds will be stored
   * @param args.raisingCurrency - ticker symbol of the currency in which the funds are being raised (i.e. 'USD' or 'CAD').
   *   Other Security Tokens can be used as currency as well
   * @param args.venue - venue through which all offering related trades will be settled
   *   (optional, defaults to the first `Sto` type Venue owned by the owner of the Offering Portfolio.
   *   If passed, it must be of type `Sto`)
   * @param start - start date of the Offering (optional, defaults to right now)
   * @param end - end date of the Offering (optional, defaults to never)
   * @param tiers - array of sale tiers. Each tier consists of an amount of Tokens to be sold at a certain price.
   *   Tokens in a tier can only be bought when all Tokens in previous tiers have been bought
   * @param minInvestment - minimum amount that can be spent on this offering
   *
   * @note required roles:
   *   - Security Token Primary Issuance Agent
   *   - Offering Portfolio Custodian
   *   - Raising Portfolio Custodian
   */
  public launch: ProcedureMethod<LaunchStoParams, Sto>;

  /**
   * Retrieve all of the Token's Offerings. Can be filtered using parameters
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [, name] = nameEntries.find(([{ args: [, rawId] }]) => u64ToBigNumber(rawId).eq(id))!;
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
