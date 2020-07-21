import { ApolloQueryResult } from 'apollo-client';

import { Identity } from '~/api/entities/Identity';
import { Entity, PolymeshError } from '~/base';
import { Context } from '~/context';
import { eventByIndexedArgs } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { Ensured, ErrorCode, EventIdentifier } from '~/types';
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
   * @note this data is harvested from the chain and stored in a database, so there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAt(): Promise<EventIdentifier | null> {
    const {
      context: { middlewareApi },
      ticker,
      identity,
    } = this;

    let result: ApolloQueryResult<Ensured<Query, 'eventByIndexedArgs'>>;
    try {
      result = await middlewareApi.query<Ensured<Query, 'eventByIndexedArgs'>>(
        eventByIndexedArgs({
          moduleId: 'complianceManager',
          eventId: 'TrustedDefaultClaimIssuerAdded',
          eventArg1: padString(ticker, MAX_TICKER_LENGTH),
          eventArg2: identity.did,
        })
      );
    } catch (e) {
      throw new PolymeshError({
        code: ErrorCode.MiddlewareError,
        message: `Error in middleware query: ${e.message}`,
      });
    }

    if (result.data.eventByIndexedArgs) {
      // TODO remove null check once types fixed
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      return {
        blockNumber: result.data.eventByIndexedArgs.block_id!,
        blockDate: result.data.eventByIndexedArgs.block!.datetime,
        eventIndex: result.data.eventByIndexedArgs.event_idx!,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }
}
