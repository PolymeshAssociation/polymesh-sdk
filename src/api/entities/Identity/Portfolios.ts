import BigNumber from 'bignumber.js';

import {
  Account,
  Context,
  DefaultPortfolio,
  deletePortfolio,
  FungibleAsset,
  Identity,
  Namespace,
  NumberedPortfolio,
  PolymeshError,
} from '~/internal';
import { portfoliosMovementsQuery, settlementsForAllPortfoliosQuery } from '~/middleware/queries';
import { Query, SettlementResultEnum } from '~/middleware/types';
import {
  ErrorCode,
  HistoricSettlement,
  PaginationOptions,
  ProcedureMethod,
  ResultSet,
  SettlementDirectionEnum,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  addressToKey,
  identityIdToString,
  keyToAddress,
  middlewarePortfolioToPortfolio,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils/conversion';
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
      ticker?: string;
    } = {}
  ): Promise<HistoricSettlement[]> {
    const {
      context,
      parent: { did: identityId },
    } = this;

    const { account, ticker } = filters;

    const address = account ? addressToKey(account, context) : undefined;

    const settlementsPromise = context.queryMiddleware<Ensured<Query, 'legs'>>(
      settlementsForAllPortfoliosQuery({
        identityId,
        address,
        ticker,
      })
    );

    const portfolioMovementsPromise = context.queryMiddleware<Ensured<Query, 'portfolioMovements'>>(
      portfoliosMovementsQuery({
        identityId,
        address,
        ticker,
      })
    );

    const [settlementsResult, portfolioMovementsResult] = await Promise.all([
      settlementsPromise,
      portfolioMovementsPromise,
    ]);

    const data: HistoricSettlement[] = [];

    const getDirection = (fromId: string, toId: string): SettlementDirectionEnum => {
      const fromDid = fromId.split('/')[0];
      const toDid = toId.split('/')[0];

      if (fromDid === toDid) {
        return SettlementDirectionEnum.Internal;
      }

      if (fromDid === identityId) {
        return SettlementDirectionEnum.Outgoing;
      }

      return SettlementDirectionEnum.Incoming;
    };

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    settlementsResult.data.legs.nodes.forEach(({ settlement }) => {
      const {
        createdBlock,
        result: settlementResult,
        legs: { nodes: legs },
      } = settlement!;

      const { blockId, hash } = createdBlock!;

      data.push({
        blockNumber: new BigNumber(blockId),
        blockHash: hash,
        status: settlementResult as unknown as SettlementResultEnum,
        accounts: legs[0].addresses.map(
          (accountAddress: string) =>
            new Account({ address: keyToAddress(accountAddress, context) }, context)
        ),
        legs: legs.map(({ from, to, fromId, toId, assetId, amount }) => ({
          asset: new FungibleAsset({ ticker: assetId }, context),
          amount: new BigNumber(amount).shiftedBy(-6),
          direction: getDirection(fromId, toId),
          from: middlewarePortfolioToPortfolio(from!, context),
          to: middlewarePortfolioToPortfolio(to!, context),
        })),
      });
    });

    portfolioMovementsResult.data.portfolioMovements.nodes.forEach(
      ({ createdBlock, from, to, fromId, toId, assetId, amount, address: accountAddress }) => {
        const { blockId, hash } = createdBlock!;
        data.push({
          blockNumber: new BigNumber(blockId),
          blockHash: hash,
          status: SettlementResultEnum.Executed,
          accounts: [new Account({ address: keyToAddress(accountAddress, context) }, context)],
          legs: [
            {
              asset: new FungibleAsset({ ticker: assetId }, context),
              amount: new BigNumber(amount).shiftedBy(-6),
              direction: getDirection(fromId, toId),
              from: middlewarePortfolioToPortfolio(from!, context),
              to: middlewarePortfolioToPortfolio(to!, context),
            },
          ],
        });
      }
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    return data;
  }
}
