import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import {
  PolymeshPrimitivesComplianceManagerAssetCompliance,
  PolymeshPrimitivesConditionTrustedIssuer,
} from '@polkadot/types/lookup';

import {
  addAssetRequirement,
  Asset,
  Context,
  Identity,
  modifyComplianceRequirement,
  Namespace,
  removeAssetRequirement,
  setAssetRequirements,
  togglePauseRequirements,
} from '~/internal';
import { AssetComplianceResult } from '~/polkadot/polymesh';
import {
  AddAssetRequirementParams,
  Compliance,
  ComplianceRequirements,
  ModifyComplianceRequirementParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveAssetRequirementParams,
  SetAssetRequirementsParams,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { QueryReturnType } from '~/types/utils';
import {
  assetComplianceResultToCompliance,
  boolToBoolean,
  complianceRequirementToRequirement,
  signerToString,
  stringToIdentityId,
  stringToTicker,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Compliance Requirements related functionality
 */
export class Requirements extends Namespace<Asset> {
  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.add = createProcedureMethod(
      { getProcedureAndArgs: args => [addAssetRequirement, { ticker, ...args }] },
      context
    );
    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeAssetRequirement, { ticker, ...args }] },
      context
    );
    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setAssetRequirements, { ticker, ...args }] },
      context
    );
    this.reset = createProcedureMethod(
      {
        getProcedureAndArgs: () => [setAssetRequirements, { ticker, requirements: [] }],
        voidArgs: true,
      },
      context
    );
    this.pause = createProcedureMethod(
      {
        getProcedureAndArgs: () => [togglePauseRequirements, { ticker, pause: true }],
        voidArgs: true,
      },
      context
    );
    this.unpause = createProcedureMethod(
      {
        getProcedureAndArgs: () => [togglePauseRequirements, { ticker, pause: false }],
        voidArgs: true,
      },
      context
    );
    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyComplianceRequirement, { ticker, ...args }] },
      context
    );
  }

  /**
   * Add a new compliance requirement to the the Asset. This doesn't modify existing requirements
   */
  public add: ProcedureMethod<AddAssetRequirementParams, Asset>;

  /**
   * Remove an existing compliance requirement from the Asset
   */
  public remove: ProcedureMethod<RemoveAssetRequirementParams, Asset>;

  /**
   * Configure compliance requirements for the Asset. This operation will replace all existing requirements with a new requirement set
   *
   * @example Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set: ProcedureMethod<SetAssetRequirementsParams, Asset>;

  /**
   * Retrieve all of the Asset's compliance requirements, together with the Default Trusted Claim Issuers
   *
   * @note can be subscribed to
   */
  public get(): Promise<ComplianceRequirements>;
  public get(callback: SubCallback<ComplianceRequirements>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<ComplianceRequirements>
  ): Promise<ComplianceRequirements | UnsubCallback> {
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
      PolymeshPrimitivesComplianceManagerAssetCompliance,
      Vec<PolymeshPrimitivesConditionTrustedIssuer>
    ]): ComplianceRequirements => {
      const requirements = assetCompliance.requirements.map(complianceRequirement =>
        complianceRequirementToRequirement(complianceRequirement, context)
      );

      const defaultTrustedClaimIssuers = claimIssuers.map(issuer =>
        trustedIssuerToTrustedClaimIssuer(issuer, context)
      );

      return { requirements, defaultTrustedClaimIssuers };
    };

    if (callback) {
      return queryMulti<
        [
          QueryReturnType<typeof complianceManager.assetCompliances>,
          QueryReturnType<typeof complianceManager.trustedClaimIssuer>
        ]
      >(
        [
          [
            complianceManager.assetCompliances as unknown as QueryableStorageEntry<'promise'>,
            rawTicker,
          ],
          [
            complianceManager.trustedClaimIssuer as unknown as QueryableStorageEntry<'promise'>,
            rawTicker,
          ],
        ],
        res => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
          callback(assembleResult(res));
        }
      );
    }

    const result = await queryMulti<
      [
        QueryReturnType<typeof complianceManager.assetCompliances>,
        QueryReturnType<typeof complianceManager.trustedClaimIssuer>
      ]
    >([
      [
        complianceManager.assetCompliances as unknown as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [
        complianceManager.trustedClaimIssuer as unknown as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
    ]);

    return assembleResult(result);
  }

  /**
   * Delete all the current requirements for the Asset.
   */
  public reset: NoArgsProcedureMethod<Asset>;

  /**
   * Pause all the Asset's requirements. This means that all transfers will be allowed until requirements are unpaused
   */
  public pause: NoArgsProcedureMethod<Asset>;

  /**
   * Un-pause all the Asset's current requirements
   */
  public unpause: NoArgsProcedureMethod<Asset>;

  /**
   * Check whether the sender and receiver Identities in a transfer comply with all the requirements of this Asset
   *
   * @note this does not take balances into account
   *
   * @param args.from - sender Identity (optional, defaults to the signing Identity)
   * @param args.to - receiver Identity
   *
   * @deprecated in favor of `settlements.canTransfer`
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

    const { from = await context.getSigningIdentity(), to } = args;

    const fromDid = stringToIdentityId(signerToString(from), context);
    const toDid = signerToString(to);

    const res: AssetComplianceResult = await rpc.compliance.canTransfer(
      stringToTicker(ticker, context),
      fromDid,
      stringToIdentityId(toDid, context)
    );

    return assetComplianceResultToCompliance(res, context);
  }

  /**
   * Check whether Asset compliance requirements are paused or not
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

    const { paused } = await complianceManager.assetCompliances(rawTicker);

    return boolToBoolean(paused);
  }

  /**
   * Modify a compliance requirement for the Asset
   */
  public modify: ProcedureMethod<ModifyComplianceRequirementParams, void>;
}
