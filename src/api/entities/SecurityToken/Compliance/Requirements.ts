import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import { AssetCompliance, AssetComplianceResult, TrustedIssuer } from 'polymesh-types/types';

import {
  Identity,
  Namespace,
  SecurityToken,
  setAssetRequirements,
  SetAssetRequirementsParams,
  togglePauseRequirements,
  TransactionQueue,
} from '~/internal';
import { Compliance, Requirement, SubCallback, UnsubCallback } from '~/types';
import {
  assetComplianceResultToCompliance,
  boolToBoolean,
  complianceRequirementToRequirement,
  signerToString,
  stringToIdentityId,
  stringToTicker,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';

/**
 * Handles all Security Token Compliance Requirements related functionality
 */
export class Requirements extends Namespace<SecurityToken> {
  /**
   * Configure asset compliance requirements for the Security Token. This operation will replace all existing requirements with a new requirement set
   *
   * This requires two transactions
   *
   * @param args.requirements - array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays. In other words, higher level arrays are *OR* between them,
   * while conditions inside each array are *AND* between them
   *
   * @example Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set(args: SetAssetRequirementsParams): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setAssetRequirements.prepare({ ticker, ...args }, context);
  }

  /**
   * Retrieve all of the Security Token's requirements
   *
   * @note can be subscribed to
   */
  public get(): Promise<Requirement[]>;
  public get(callback: SubCallback<Requirement[]>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(callback?: SubCallback<Requirement[]>): Promise<Requirement[] | UnsubCallback> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { complianceManager },
          queryMulti,
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const assembleResult = ([assetCompliance, claimIssuers]: [
      AssetCompliance,
      Vec<TrustedIssuer>
    ]): Requirement[] => {
      const defaultTrustedClaimIssuers = claimIssuers.map(claimIssuer => {
        return trustedIssuerToTrustedClaimIssuer(claimIssuer, context);
      });

      return assetCompliance.requirements.map(complianceRequirement => {
        const requirement = complianceRequirementToRequirement(complianceRequirement, context);

        requirement.conditions.forEach(condition => {
          if (!condition.trustedClaimIssuers || !condition.trustedClaimIssuers.length) {
            condition.trustedClaimIssuers = defaultTrustedClaimIssuers;
          }
        });

        return requirement;
      });
    };

    if (callback) {
      return queryMulti<[AssetCompliance, Vec<TrustedIssuer>]>(
        [
          [complianceManager.assetCompliances as QueryableStorageEntry<'promise'>, rawTicker],
          [complianceManager.trustedClaimIssuer as QueryableStorageEntry<'promise'>, rawTicker],
        ],
        res => {
          callback(assembleResult(res));
        }
      );
    }

    const result = await queryMulti<[AssetCompliance, Vec<TrustedIssuer>]>([
      [complianceManager.assetCompliances as QueryableStorageEntry<'promise'>, rawTicker],
      [complianceManager.trustedClaimIssuer as QueryableStorageEntry<'promise'>, rawTicker],
    ]);

    return assembleResult(result);
  }

  /**
   * Detele all the current requirements for the Security Token.
   */
  public reset(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return setAssetRequirements.prepare({ ticker, requirements: [] }, context);
  }

  /**
   * Pause all the Security Token's requirements. This means that all transfers will be allowed until requirements are unpaused
   */
  public pause(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return togglePauseRequirements.prepare({ ticker, pause: true }, context);
  }

  /**
   * Un-pause all the Security Token's current requirements
   */
  public unpause(): Promise<TransactionQueue<SecurityToken>> {
    const {
      parent: { ticker },
      context,
    } = this;
    return togglePauseRequirements.prepare({ ticker, pause: false }, context);
  }

  /**
   * Check whether the sender and receiver Identities in a transfer comply with all the requirements of this asset
   *
   * @note this does not take balances into account
   *
   * @param args.from - sender Identity (optional, defaults to the current Identity)
   * @param args.to - receiver Identity
   */
  public async checkSettle(args: {
    from?: string | Identity;
    to: string | Identity;
  }): Promise<Compliance> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: { rpc },
      },
      context,
    } = this;

    const { from = await context.getCurrentIdentity(), to } = args;

    const fromDid = stringToIdentityId(signerToString(from), context);
    const toDid = signerToString(to);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: AssetComplianceResult = await (rpc as any).compliance.canTransfer(
      stringToTicker(ticker, context),
      fromDid,
      stringToIdentityId(toDid, context)
    );

    return assetComplianceResultToCompliance(res, context);
  }

  /**
   * Check whether asset compliance requirements are paused or not
   */
  public async arePaused(): Promise<boolean> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { is_paused: isPaused } = await complianceManager.assetCompliances(rawTicker);

    return boolToBoolean(isPaused);
  }
}
