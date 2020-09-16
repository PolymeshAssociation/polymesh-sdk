import { Entity, Identity } from '~/api/entities';
import { Context } from '~/base';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { Ensured, EventIdentifier } from '~/types';
import { padString } from '~/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

/**
 * Represents a trusted claim issuer for a specific token in the Polymesh blockchain
 */
export class TrustedClaimIssuer extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * identity of the trusted claim issuer
   */
  public identity: Identity;

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { did, ticker } = identifiers;

    this.identity = new Identity({ did }, context);
    this.ticker = ticker;
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the token was created
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAt(): Promise<EventIdentifier | null> {
    const { ticker, identity, context } = this;

    const result = await context.queryMiddleware<Ensured<Query, 'eventByIndexedArgs'>>(
      eventByIndexedArgs({
        moduleId: ModuleIdEnum.Compliancemanager,
        eventId: EventIdEnum.TrustedDefaultClaimIssuerAdded,
        eventArg1: padString(ticker, MAX_TICKER_LENGTH),
        eventArg2: identity.did,
      })
    );

    if (result.data.eventByIndexedArgs) {
      // TODO remove null check once types fixed
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return {
        blockNumber: result.data.eventByIndexedArgs.block_id!,
        blockDate: result.data.eventByIndexedArgs.block!.datetime!,
        eventIndex: result.data.eventByIndexedArgs.event_idx!,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }
}
