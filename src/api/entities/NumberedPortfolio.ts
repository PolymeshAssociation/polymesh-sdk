import BigNumber from 'bignumber.js';

import { Portfolio } from '~/api/entities';
import { deletePortfolio, renamePortfolio, RenamePortfolioParams } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, EventIdentifier } from '~/types';
import { bytesToString, numberToU64 } from '~/utils';

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
   * portfolio identifier number
   */
  public id: BigNumber;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id } = identifiers;

    this.id = id;
  }

  /**
   * Delete this Portfolio
   */
  public async delete(): Promise<TransactionQueue<void>> {
    const {
      id,
      owner: { did },
    } = this;
    return deletePortfolio.prepare({ did, id }, this.context);
  }

  /**
   * Rename portfolio
   */
  public async modifyName(
    args: RenamePortfolioParams
  ): Promise<TransactionQueue<NumberedPortfolio>> {
    const {
      id,
      owner: { did },
    } = this;
    const { name } = args;
    return renamePortfolio.prepare({ did, id, name }, this.context);
  }

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
    return bytesToString(rawPortfolioName);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when this portfolio was created
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

    const result = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Portfolio,
        eventId: EventIdEnum.PortfolioCreated,
        eventArg0: did,
        eventArg1: id.toString(),
      })
    );

    if (result.data.eventByIndexedArgs) {
      // TODO remove null check once types fixed
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return {
        blockNumber: new BigNumber(result.data.eventByIndexedArgs.block_id),
        blockDate: result.data.eventByIndexedArgs.block!.datetime,
        eventIndex: result.data.eventByIndexedArgs.event_idx,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }
}
