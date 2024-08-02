import BigNumber from 'bignumber.js';

import {
  Context,
  DefaultPortfolio,
  deletePortfolio,
  Identity,
  Namespace,
  NumberedPortfolio,
  PolymeshError,
} from '~/internal';
import { portfoliosMovementsQuery } from '~/middleware/queries/portfolios';
import { settlementsForAllPortfoliosQuery } from '~/middleware/queries/settlements';
import { Query } from '~/middleware/types';
import {
  ErrorCode,
  HistoricSettlement,
  PaginationOptions,
  ProcedureMethod,
  ResultSet,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  identityIdToString,
  stringToIdentityId,
  toHistoricalSettlements,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, getAssetIdForMiddleware, requestPaginated } from '~/utils/internal';

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
   *   To fetch Portfolios owned by this Identity, use {@link getPortfolios}
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
   * Retrieve a Numbered Portfolio or the Default Portfolio if Portfolio ID is not passed
   *
   * @param args.portfolioId - optional, defaults to the Default Portfolio
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
        code: ErrorCode.DataUnavailable,
        message: "The Portfolio doesn't exist",
      });
    }

    return numberedPortfolio;
  }

  /**
   * Delete a Portfolio by ID
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public delete: ProcedureMethod<{ portfolio: BigNumber | NumberedPortfolio }, void>;

  /**
   * Retrieve a list of transactions where this identity was involved. Can be filtered using parameters
   *
   * @param filters.account - Account involved in the settlement
   * @param filters.ticker - ticker involved in the transaction
   *
   * @note uses the middlewareV2
   */
  public async getTransactionHistory(
    filters: {
      account?: string;
      /**
       * @deprecated in favour of assetId
       */
      ticker?: string;
      assetId?: string;
    } = {}
  ): Promise<HistoricSettlement[]> {
    const {
      context,
      parent: { did: identityId },
    } = this;

    const { account, ticker, assetId } = filters; // NOSONAR

    let middlewareAssetId;
    const assetIdValue = assetId ?? ticker;

    if (assetIdValue) {
      middlewareAssetId = await getAssetIdForMiddleware(assetIdValue, context);
    }

    const settlementsPromise = context.queryMiddleware<Ensured<Query, 'legs'>>(
      settlementsForAllPortfoliosQuery({
        identityId,
        address: account,
        assetId: middlewareAssetId,
      })
    );

    const portfolioMovementsPromise = context.queryMiddleware<Ensured<Query, 'portfolioMovements'>>(
      portfoliosMovementsQuery({
        identityId,
        address: account,
        assetId: middlewareAssetId,
      })
    );

    const [
      {
        data: {
          legs: { nodes: settlements },
        },
      },
      {
        data: {
          portfolioMovements: { nodes: portfolioMovements },
        },
      },
    ] = await Promise.all([settlementsPromise, portfolioMovementsPromise]);

    return toHistoricalSettlements(settlements, portfolioMovements, { identityId }, context);
  }
}
