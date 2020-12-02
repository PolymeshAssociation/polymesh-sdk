import BigNumber from 'bignumber.js';

import { Context, Entity, Identity } from '~/internal';
import { eventByIndexedArgs } from '~/middleware/queries';
import { EventIdEnum, ModuleIdEnum, Query } from '~/middleware/types';
import { ClaimType, Ensured, EventIdentifier } from '~/types';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import { padString } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

export interface Params {
  trustedFor: ClaimType[] | null;
}

/**
 * Represents a default trusted claim issuer for a specific token in the Polymesh blockchain
 */
export class DefaultTrustedClaimIssuer extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * identity of the Trusted Claim Issuer
   */
  public identity: Identity;

  /**
   * claim types for which this Claim Issuer is trusted. A null value means that the issuer is trusted for all claim types
   */
  public trustedFor: ClaimType[] | null;

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const { trustedFor, ...identifiers } = args;

    super(identifiers, context);

    const { did, ticker } = identifiers;

    this.identity = new Identity({ did }, context);
    this.ticker = ticker;
    this.trustedFor = trustedFor;
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
        blockNumber: new BigNumber(result.data.eventByIndexedArgs.block_id),
        blockDate: result.data.eventByIndexedArgs.block!.datetime,
        eventIndex: result.data.eventByIndexedArgs.event_idx,
      };
      /* eslint-enabled @typescript-eslint/no-non-null-assertion */
    }

    return null;
  }
}
