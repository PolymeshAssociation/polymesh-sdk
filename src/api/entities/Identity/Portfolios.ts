import BigNumber from 'bignumber.js';

import { getSettlementHistory } from '~/api/entities/common/settlementHistory';
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
import {
  ErrorCode,
  HistoricSettlement,
  MiddlewarePaginationOptions,
  PaginationOptions,
  ProcedureMethod,
  ResultSet,
} from '~/types';
import {
  identityIdToString,
  stringToBytes,
  stringToIdentityId,
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
          const id = BigNumber.isBigNumber(portfolio) ? portfolio : portfolio.id;

          return [deletePortfolio, { id, did }];
        },
      },
      context
    );
  }

  /**
   * Retrieve all the Portfolios owned by this Identity
   *
   * @returns An array where the first item is always the Default Portfolio, followed by any Numbered Portfolios owned by this Identity
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
   * This only includes portfolios owned by a different Identity but custodied by this one.
   * To fetch Portfolios owned by this Identity, use {@link getPortfolios}
   *
   * @param paginationOpts - Optional pagination options
   *
   * @returns A ResultSet of portfolios (Default or Numbered) and pagination metadata
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
   * Retrieve the Default Portfolio for this Identity
   *
   * @returns Promise that resolves to the Default Portfolio
   */
  public async getPortfolio(): Promise<DefaultPortfolio>;

  /**
   * Retrieve a Numbered Portfolio by its ID
   *
   * @param args.portfolioId - ID of the Portfolio to retrieve
   * @returns Promise that resolves to the requested Numbered Portfolio
   */
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
   * Retrieve a Numbered Portfolio by its name
   *
   * @param args.name - Name of the Portfolio to fetch
   * @returns Promise that resolves to the Portfolio with the given name
   * @throws if no Portfolio exists with the given name
   */
  public async getPortfolioByName(args: { name: string }): Promise<NumberedPortfolio> {
    const {
      context,
      context: {
        polymeshApi: {
          query: {
            portfolio: { nameToNumber },
          },
        },
      },
      parent: { did },
    } = this;

    const rawDid = stringToIdentityId(did, context);
    const rawName = stringToBytes(args.name, context);

    const rawId = await nameToNumber(rawDid, rawName);

    if (rawId.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `No Portfolio exists with the name '${args.name}'`,
      });
    }

    const portfolioId = u64ToBigNumber(rawId.unwrap());
    return new NumberedPortfolio({ id: portfolioId, did }, context);
  }

  /**
   * Delete a Portfolio by ID
   *
   * @note The calling Identity must be the custodian of the Portfolio
   *
   * @param args.portfolio - Portfolio instance or portfolio ID to delete
   */
  public delete: ProcedureMethod<{ portfolio: BigNumber | NumberedPortfolio }, void>;

  /**
   * Retrieve, oldest first, the settlements and transfers that sent assets from or to any holder of
   *   this Identity: its portfolios and, from Polymesh 8.0, its Accounts. They are the instructions
   *   with a leg that moves its assets, and the transfers no instruction made: movements between two
   *   of its holders, and transfers between Identities such as a controller transfer or a
   *   distribution payout. Each leg's direction is seen from the Identity, so a movement has none
   *
   * @param filters.account - only the settlements and transfers this Account signed, such as by
   *   creating, affirming or executing an instruction. It does not select the Account as a holder
   * @param filters.ticker - ticker involved in the transaction
   * @param filters.assetId - Asset ID to filter by (overrides ticker if both provided)
   * @param filters.size - page size
   * @param filters.start - page offset
   *
   * @note uses the middlewareV2
   * @note supports pagination. A later page takes more middleware requests than an earlier one
   */
  public async getTransactionHistory(
    filters: MiddlewarePaginationOptions & {
      account?: string;
      ticker?: string;
      assetId?: string;
    } = {}
  ): Promise<ResultSet<HistoricSettlement>> {
    const {
      context,
      parent: { did: identityId },
    } = this;

    const { account, ticker, assetId, size, start } = filters;

    let middlewareAssetId;
    const assetIdValue = assetId ?? ticker;

    if (assetIdValue) {
      middlewareAssetId = await getAssetIdForMiddleware(assetIdValue, context);
    }

    const queryFilters = {
      identityId,
      address: account,
      assetId: middlewareAssetId,
    };

    return getSettlementHistory(
      context,
      {
        instructions: (pageSize, pageStart) =>
          settlementsForAllPortfoliosQuery(queryFilters, pageSize, pageStart),
        transfers: (pageSize, pageStart) =>
          portfoliosMovementsQuery(queryFilters, pageSize, pageStart),
      },
      { identityId },
      { size, start }
    );
  }
}
