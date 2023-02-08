import { Asset, Context, Identity, PolymeshError } from '~/internal';
import { eventByAddedTrustedClaimIssuer } from '~/middleware/queries';
import { trustedClaimIssuerQuery } from '~/middleware/queriesV2';
import { Query } from '~/middleware/types';
import { Query as QueryV2 } from '~/middleware/typesV2';
import { ClaimType, ErrorCode, EventIdentifier } from '~/types';
import { Ensured, EnsuredV2 } from '~/types/utils';
import { MAX_TICKER_LENGTH } from '~/utils/constants';
import {
  middlewareEventToEventIdentifier,
  middlewareV2EventDetailsToEventIdentifier,
  stringToTicker,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { optionize, padString } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

/**
 * Represents a default trusted claim issuer for a specific Asset in the Polymesh blockchain
 */
export class DefaultTrustedClaimIssuer extends Identity {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * Asset for which this Identity is a Default Trusted Claim Issuer
   */
  public asset: Asset;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers, context: Context) {
    const { ticker, ...identifiers } = args;

    super(identifiers, context);

    this.asset = new Asset({ ticker }, context);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the trusted claim issuer was added
   *
   * @note uses the middleware
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAt(): Promise<EventIdentifier | null> {
    const {
      asset: { ticker },
      did,
      context,
    } = this;

    if (context.isMiddlewareV2Enabled()) {
      return this.addedAtV2();
    }

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
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the trusted claim issuer was added
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAtV2(): Promise<EventIdentifier | null> {
    const {
      asset: { ticker: assetId },
      did: issuer,
      context,
    } = this;

    const {
      data: {
        trustedClaimIssuers: {
          nodes: [node],
        },
      },
    } = await context.queryMiddlewareV2<EnsuredV2<QueryV2, 'trustedClaimIssuers'>>(
      trustedClaimIssuerQuery({
        assetId,
        issuer,
      })
    );

    return optionize(middlewareV2EventDetailsToEventIdentifier)(node?.createdBlock, node?.eventIdx);
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
      asset: { ticker },
      did,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    const claimIssuer = claimIssuers
      .map(issuer => trustedIssuerToTrustedClaimIssuer(issuer, context))
      .find(({ identity }) => this.isEqual(identity));

    if (!claimIssuer) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `The Identity with DID "${did}" is no longer a trusted issuer for "${ticker}"`,
      });
    }

    return claimIssuer.trustedFor;
  }
}
