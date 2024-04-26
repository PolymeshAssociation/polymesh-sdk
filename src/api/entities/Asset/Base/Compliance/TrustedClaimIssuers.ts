import { PolymeshPrimitivesConditionTrustedIssuer } from '@polkadot/types/lookup';

import {
  BaseAsset,
  Context,
  DefaultTrustedClaimIssuer,
  modifyAssetTrustedClaimIssuers,
  ModifyAssetTrustedClaimIssuersParams,
  Namespace,
} from '~/internal';
import {
  ModifyAssetTrustedClaimIssuersAddSetParams,
  ModifyAssetTrustedClaimIssuersRemoveParams,
  ProcedureMethod,
  SubCallback,
  TrustedClaimIssuer,
  UnsubCallback,
} from '~/types';
import { TrustedClaimIssuerOperation } from '~/types/internal';
import { stringToTicker, trustedIssuerToTrustedClaimIssuer } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Default Trusted Claim Issuers related functionality
 */
export class TrustedClaimIssuers extends Namespace<BaseAsset> {
  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.set = createProcedureMethod<
      ModifyAssetTrustedClaimIssuersAddSetParams,
      ModifyAssetTrustedClaimIssuersParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAssetTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Set },
        ],
      },
      context
    );
    this.add = createProcedureMethod<
      ModifyAssetTrustedClaimIssuersAddSetParams,
      ModifyAssetTrustedClaimIssuersParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAssetTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Add },
        ],
      },
      context
    );
    this.remove = createProcedureMethod<
      ModifyAssetTrustedClaimIssuersRemoveParams,
      ModifyAssetTrustedClaimIssuersParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          modifyAssetTrustedClaimIssuers,
          { ticker, ...args, operation: TrustedClaimIssuerOperation.Remove },
        ],
      },
      context
    );
  }

  /**
   * Assign a new default list of trusted claim issuers to the Asset by replacing the existing ones with the list passed as a parameter
   *
   * This requires two transactions
   */
  public set: ProcedureMethod<ModifyAssetTrustedClaimIssuersAddSetParams, void>;

  /**
   * Add the supplied Identities to the Asset's list of trusted claim issuers
   */
  public add: ProcedureMethod<ModifyAssetTrustedClaimIssuersAddSetParams, void>;

  /**
   * Remove the supplied Identities from the Asset's list of trusted claim issuers   *
   */
  public remove: ProcedureMethod<ModifyAssetTrustedClaimIssuersRemoveParams, void>;

  /**
   * Retrieve the current Default Trusted Claim Issuers of the Asset
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public get(): Promise<TrustedClaimIssuer<true>[]>;
  public get(callback: SubCallback<TrustedClaimIssuer<true>[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<TrustedClaimIssuer<true>[]>
  ): Promise<TrustedClaimIssuer<true>[] | UnsubCallback> {
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

    const assembleResult = (
      issuers: PolymeshPrimitivesConditionTrustedIssuer[]
    ): TrustedClaimIssuer<true>[] =>
      issuers.map(issuer => {
        const {
          identity: { did },
          trustedFor,
        } = trustedIssuerToTrustedClaimIssuer(issuer, context);
        return {
          identity: new DefaultTrustedClaimIssuer({ did, ticker }, context),
          trustedFor,
        };
      });

    if (callback) {
      context.assertSupportsSubscription();

      return complianceManager.trustedClaimIssuer(rawTicker, issuers => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(issuers));
      });
    }

    const claimIssuers = await complianceManager.trustedClaimIssuer(rawTicker);

    return assembleResult(claimIssuers);
  }
}
