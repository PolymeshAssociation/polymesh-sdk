import BigNumber from 'bignumber.js';

import { Context, PolymeshError, Portfolio, renamePortfolio } from '~/internal';
import { portfolioQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { ErrorCode, EventIdentifier, ProcedureMethod, RenamePortfolioParams } from '~/types';
import { Ensured } from '~/types/utils';
import {
  bigNumberToU64,
  bytesToString,
  middlewareEventDetailsToEventIdentifier,
  stringToIdentityId,
} from '~/utils/conversion';
import { createProcedureMethod, optionize } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  id: BigNumber;
}

/**
 * Represents a numbered (non-default) Portfolio for an Identity
 */
export class NumberedPortfolio extends Portfolio {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, id } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && id instanceof BigNumber;
  }

  /**
   * Portfolio identifier number
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, did } = identifiers;

    this.id = id;

    this.modifyName = createProcedureMethod(
      { getProcedureAndArgs: args => [renamePortfolio, { ...args, did, id }] },
      context
    );
  }

  /**
   * Rename portfolio
   *
   * @note Only the owner is allowed to rename the Portfolio.
   */
  public modifyName: ProcedureMethod<RenamePortfolioParams, NumberedPortfolio>;

  /**
   * Return the Portfolio name
   */
  public async getName(): Promise<string> {
    const {
      owner: { did },
      id,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
      context,
    } = this;
    const rawPortfolioName = await portfolio.portfolios(did, bigNumberToU64(id, context));

    if (rawPortfolioName.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The Portfolio doesn't exist",
      });
    }

    return bytesToString(rawPortfolioName.unwrap());
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Portfolio was created
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const {
      owner: { did },
      id,
      context,
    } = this;

    const {
      data: {
        portfolios: {
          nodes: [node],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'portfolios'>>(
      portfolioQuery({
        identityId: did,
        number: id.toNumber(),
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(node?.createdBlock, node?.eventIdx);
  }

  /**
   * Return whether this Portfolio exists
   */
  public async exists(): Promise<boolean> {
    const {
      owner: { did },
      id,
      context,
      context: {
        polymeshApi: {
          query: { portfolio },
        },
      },
    } = this;

    const identityId = stringToIdentityId(did, context);
    const rawPortfolioNumber = bigNumberToU64(id, context);
    const size = await portfolio.portfolios.size(identityId, rawPortfolioNumber);

    return !size.isZero();
  }
}
