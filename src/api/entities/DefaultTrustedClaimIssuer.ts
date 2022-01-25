import { Context, Identity, PolymeshError, SecurityToken } from '~/internal';
import { eventByAddedTrustedClaimIssuer } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { ClaimType, ErrorCode, EventIdentifier } from '~/types';
import { Ensured } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  middlewareEventToEventIdentifier,
  stringToTicker,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { optionize, padString } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

/**
 * Represents a default trusted claim issuer for a specific token in the Polymesh blockchain
 */
export class DefaultTrustedClaimIssuer extends Identity {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * Security Token for which this Identity is a Default Trusted Claim Issuer
   */
  public token: SecurityToken;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers, context: Context) {
    const { ticker, ...identifiers } = args;

    super(identifiers, context);

    this.token = new SecurityToken({ ticker }, context);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the trusted claim issuer was added
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAt(): Promise<EventIdentifier | null> {
    const {
      token: { ticker },
      did,
      context,
    } = this;

    const {
      data: { eventByAddedTrustedClaimIssuer: event },
    } = await context.queryMiddleware<Ensured<Query, 'eventByAddedTrustedClaimIssuer'>>(
      eventByAddedTrustedClaimIssuer({
        ticker: padString(ticker, MAX_TICKER_LENGTH),
        identityId: did,
      })
    );

    return optionize(middlewareEventToEventIdentifier)(event);
  }

  /**
   * Retrieve claim types for which this Claim Issuer is trusted. A null value means that the issuer is trusted for all claim types
   */
  public async trustedFor(): Promise<ClaimType[] | null> {
    const {
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
      token: { ticker },
      did,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    const issuer = claimIssuers
      .map(claimIssuer => trustedIssuerToTrustedClaimIssuer(claimIssuer, context))
      .find(({ identity: { did: issuerDid } }) => did === issuerDid);

    if (!issuer) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `The Identity with DID "${did}" is no longer a trusted issuer for "${ticker}"`,
      });
    }

    return issuer.trustedFor;
  }
}
