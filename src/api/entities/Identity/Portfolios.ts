import BigNumber from 'bignumber.js';

import {
  Context,
  createPortfolio,
  DefaultPortfolio,
  deletePortfolio,
  Identity,
  Namespace,
  NumberedPortfolio,
  PolymeshError,
} from '~/internal';
import { ErrorCode, PaginationOptions, ProcedureMethod, ResultSet } from '~/types';
import { identityIdToString, stringToIdentityId, u64ToBigNumber } from '~/utils/conversion';
import { createProcedureMethod, requestPaginated } from '~/utils/internal';

/**
 * Handles all Portfolio related functionality on the Identity side
 */
export class Portfolios extends Namespace<Identity> {
  /**
   * @hidden
   */
  constructor(parent: Identity, context: Context) {
    super(parent, context);

    const { did } = parent;

    this.create = createProcedureMethod(
      { getProcedureAndArgs: args => [createPortfolio, args] },
      context
    );
    this.delete = createProcedureMethod(
      {
        getProcedureAndArgs: args => {
          const { portfolio } = args;
          const id = portfolio instanceof BigNumber ? portfolio : portfolio.id;

          return [deletePortfolio, { id, did }];
        },
      },
      context
    );
  }

  /**
   * Retrieve all the Portfolios owned by this Identity
   */
  public async getPortfolios(): Promise<[DefaultPortfolio, ...NumberedPortfolio[]]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      parent: { did },
    } = this;

    const identityId = stringToIdentityId(did, context);
    const rawPortfolios = await portfolio.portfolios.entries(identityId);

    const portfolios: [DefaultPortfolio, ...NumberedPortfolio[]] = [
      new DefaultPortfolio({ did }, context),
    ];
    rawPortfolios.forEach(([key]) => {
      portfolios.push(new NumberedPortfolio({ id: u64ToBigNumber(key.args[1]), did }, context));
    });

    return portfolios;
  }

  /**
   * Retrieve all Portfolios custodied by this Identity.
   *   This only includes portfolios owned by a different Identity but custodied by this one.
   *   To fetch Portfolios owned by this Identity, use [[getPortfolios]]
   *
   * @note supports pagination
   */
  public async getCustodiedPortfolios(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<DefaultPortfolio | NumberedPortfolio>> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      parent: { did: custodianDid },
    } = this;

    const custodian = stringToIdentityId(custodianDid, context);
    const { entries: portfolioEntries, lastKey: next } = await requestPaginated(
      portfolio.portfoliosInCustody,
      {
        arg: custodian,
        paginationOpts,
      }
    );

    const data = portfolioEntries.map(([{ args }]) => {
      const { did: ownerDid, kind } = args[1];

      const did = identityIdToString(ownerDid);

      if (kind.isDefault) {
        return new DefaultPortfolio({ did }, context);
      }

      const id = u64ToBigNumber(kind.asUser);

      return new NumberedPortfolio({ did, id }, context);
    });

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve a numbered Portfolio or the default Portfolio if Portfolio ID is not passed
   *
   * @param args.porfolioId - optional, defaults to the default portfolio
   */
  public async getPortfolio(): Promise<DefaultPortfolio>;
  public async getPortfolio(args: { portfolioId: BigNumber }): Promise<NumberedPortfolio>;

  // eslint-disable-next-line require-jsdoc
  public async getPortfolio(args?: {
    portfolioId: BigNumber;
  }): Promise<DefaultPortfolio | NumberedPortfolio> {
    const {
      context,
      parent: { did },
    } = this;

    const portfolioId = args?.portfolioId;

    if (!portfolioId) {
      return new DefaultPortfolio({ did }, context);
    }

    const numberedPortfolio = new NumberedPortfolio({ id: portfolioId, did }, context);
    const exists = await numberedPortfolio.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Portfolio doesn't exist",
      });
    }

    return numberedPortfolio;
  }

  /**
   * Create a new Portfolio for the Identity
   */
  public create: ProcedureMethod<{ name: string }, NumberedPortfolio>;

  /**
   * Delete a Portfolio by ID
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public delete: ProcedureMethod<{ portfolio: BigNumber | NumberedPortfolio }, void>;
}
