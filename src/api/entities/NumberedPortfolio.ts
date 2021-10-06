import BigNumber from 'bignumber.js';

import {
  Context,
  deletePortfolio,
  Portfolio,
  renamePortfolio,
  RenamePortfolioParams,
} from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, EventIdentifier, ProcedureMethod } from '~/types';
import {
  middlewareEventToEventIdentifier,
  numberToU64,
  stringToIdentityId,
  textToString,
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
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
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

    this.delete = createProcedureMethod(
      { getProcedureAndArgs: () => [deletePortfolio, { did, id }] },
      context
    );
    this.modifyName = createProcedureMethod(
      { getProcedureAndArgs: args => [renamePortfolio, { ...args, did, id }] },
      context
    );
  }

  /**
   * Delete this Portfolio
   *
   * @note required role:
   *   - Portfolio Custodian
   */
  public delete: ProcedureMethod<void, void>;

  /**
   * Rename portfolio
   *
   * @note required role:
   *   - Portfolio Custodian
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

    const rawPortfolioName = await portfolio.portfolios(did, numberToU64(id, context));

    return textToString(rawPortfolioName);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this Portfolio was created
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async createdAt(): Promise<EventIdentifier | null> {
    const {
      owner: { did },
      id,
      context,
    } = this;

    const {
      data: { eventByIndexedArgs: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Portfolio,
        eventId: EventIdEnum.PortfolioCreated,
        eventArg0: did,
        eventArg1: id.toString(),
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
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
    const rawPortfolioNumber = numberToU64(id, context);
    const size = await portfolio.portfolios.size(identityId, rawPortfolioNumber);

    return !size.isZero();
  }
}
