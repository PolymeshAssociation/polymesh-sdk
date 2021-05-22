import { TrustedIssuer } from 'polymesh-types/types';

import {
  Context,
  DefaultTrustedClaimIssuer,
  modifyTokenTrustedClaimIssuers,
  ModifyTokenTrustedClaimIssuersAddSetParams,
  ModifyTokenTrustedClaimIssuersParams,
  ModifyTokenTrustedClaimIssuersRemoveParams,
  Namespace,
  SecurityToken,
} from '~/internal';
import { ProcedureMethod, SubCallback, UnsubCallback } from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { stringToTicker, trustedIssuerToTrustedClaimIssuer } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Security Token Default Trusted Claim Issuers related functionality
 */
export class TrustedClaimIssuers extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.set = createProcedureMethod<
      ModifyTokenTrustedClaimIssuersAddSetParams,
      ModifyTokenTrustedClaimIssuersParams,
      SecurityToken
    >(
      {
        getProcedureAndArgs: args => [
          modifyTokenTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
        ],
      },
      context
    );
    this.add = createProcedureMethod<
      ModifyTokenTrustedClaimIssuersAddSetParams,
      ModifyTokenTrustedClaimIssuersParams,
      SecurityToken
    >(
      {
        getProcedureAndArgs: args => [
          modifyTokenTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
        ],
      },
      context
    );
    this.remove = createProcedureMethod<
      ModifyTokenTrustedClaimIssuersRemoveParams,
      ModifyTokenTrustedClaimIssuersParams,
      SecurityToken
    >(
      {
        getProcedureAndArgs: args => [
          modifyTokenTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
        ],
      },
      context
    );
  }

  /**
   * Assign a new default list of trusted claim issuers to the Security Token by replacing the existing ones with the list passed as a parameter
   *
   * This requires two transactions
   *
   * @param args.claimIssuerDids - array of Identity IDs of the default Trusted Claim Issuers
   *
   * @note required role:
   *   - Security Token Owner
   */
  public set: ProcedureMethod<ModifyTokenTrustedClaimIssuersAddSetParams, SecurityToken>;

  /**
   * Add the supplied Identities to the Security Token's list of trusted claim issuers
   *
   * @param args.claimIssuers - array of [[TrustedClaimIssuer | Trusted Claim Issuers]]
   *
   * @note required role:
   *   - Security Token Owner
   */
  public add: ProcedureMethod<ModifyTokenTrustedClaimIssuersAddSetParams, SecurityToken>;

  /**
   * Remove the supplied Identities from the Security Token's list of trusted claim issuers   *
   *
   * @param args.claimIssuers - array of Identities (or DIDs) of the default claim issuers
   *
   * @note required role:
   *   - Security Token Owner
   */
  public remove: ProcedureMethod<ModifyTokenTrustedClaimIssuersRemoveParams, SecurityToken>;

  /**
   * Retrieve the current default trusted claim issuers of the Security Token
   *
   * @note can be subscribed to
   */
  public get(): Promise<DefaultTrustedClaimIssuer[]>;
  public get(callback: SubCallback<DefaultTrustedClaimIssuer[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<DefaultTrustedClaimIssuer[]>
  ): Promise<DefaultTrustedClaimIssuer[] | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = (issuers: TrustedIssuer[]): DefaultTrustedClaimIssuer[] =>
      issuers.map(issuer => {
        const {
          identity: { did },
          trustedFor,
        } = trustedIssuerToTrustedClaimIssuer(issuer, context);
        return new DefaultTrustedClaimIssuer({ did, ticker, trustedFor }, context);
      });

    if (callback) {
      return complianceManager.trustedClaimIssuer(rawTicker, issuers => {
        callback(assembleResult(issuers));
      });
    }

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    return assembleResult(claimIssuers);
  }
}
