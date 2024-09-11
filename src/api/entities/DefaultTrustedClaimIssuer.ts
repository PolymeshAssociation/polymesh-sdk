import { Context, FungibleAsset, Identity, PolymeshError } from '~/internal';
import { trustedClaimIssuerQuery } from '~/middleware/queries';
import { Query } from '~/middleware/types';
import { ClaimType, ErrorCode, EventIdentifier } from '~/types';
import { Ensured } from '~/types/utils';
import {
  middlewareEventDetailsToEventIdentifier,
  stringToTicker,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { getAssetIdForMiddleware, optionize } from '~/utils/internal';

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
  public asset: FungibleAsset;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers, context: Context) {
    const { ticker, ...identifiers } = args;

    super(identifiers, context);

    this.asset = new FungibleAsset({ ticker }, context);
  }

  /**
   * Retrieve the identifier data (block number, date and event index) of the event that was emitted when the trusted claim issuer was added
   *
   * @note uses the middlewareV2
   * @note there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned
   */
  public async addedAt(): Promise<EventIdentifier | null> {
    const {
      asset: { ticker: assetId },
      did: issuer,
      context,
    } = this;

    const middlewareAssetId = await getAssetIdForMiddleware(assetId, context);
    const {
      data: {
        trustedClaimIssuers: {
          nodes: [node],
        },
      },
    } = await context.queryMiddleware<Ensured<Query, 'trustedClaimIssuers'>>(
      trustedClaimIssuerQuery({
        assetId: middlewareAssetId,
        issuer,
      })
    );

    return optionize(middlewareEventDetailsToEventIdentifier)(node?.createdBlock, node?.eventIdx);
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
