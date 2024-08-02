import { Vec } from '@polkadot/types/codec';
import {
  PolymeshPrimitivesComplianceManagerAssetCompliance,
  PolymeshPrimitivesConditionTrustedIssuer,
} from '@polkadot/types/lookup';

import {
  addAssetRequirement,
  BaseAsset,
  Context,
  modifyComplianceRequirement,
  Namespace,
  removeAssetRequirement,
  setAssetRequirements,
  togglePauseRequirements,
} from '~/internal';
import {
  AddAssetRequirementParams,
  ComplianceRequirements,
  ModifyComplianceRequirementParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveAssetRequirementParams,
  SetAssetRequirementsParams,
  SubCallback,
  UnsubCallback,
} from '~/types';
import {
  assetToMeshAssetId,
  boolToBoolean,
  complianceRequirementToRequirement,
  trustedIssuerToTrustedClaimIssuer,
} from '~/utils/conversion';
import { createProcedureMethod, requestMulti } from '~/utils/internal';

/**
 * Handles all Asset Compliance Requirements related functionality
 */
export class Requirements extends Namespace<BaseAsset> {
  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    this.add = createProcedureMethod(
      { getProcedureAndArgs: args => [addAssetRequirement, { asset: parent, ...args }] },
      context
    );
    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeAssetRequirement, { asset: parent, ...args }] },
      context
    );
    this.set = createProcedureMethod(
      { getProcedureAndArgs: args => [setAssetRequirements, { asset: parent, ...args }] },
      context
    );
    this.reset = createProcedureMethod(
      {
        getProcedureAndArgs: () => [setAssetRequirements, { asset: parent, requirements: [] }],
        voidArgs: true,
      },
      context
    );
    this.pause = createProcedureMethod(
      {
        getProcedureAndArgs: () => [togglePauseRequirements, { asset: parent, pause: true }],
        voidArgs: true,
      },
      context
    );
    this.unpause = createProcedureMethod(
      {
        getProcedureAndArgs: () => [togglePauseRequirements, { asset: parent, pause: false }],
        voidArgs: true,
      },
      context
    );
    this.modify = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyComplianceRequirement, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Add a new compliance requirement to the the Asset. This doesn't modify existing requirements
   */
  public add: ProcedureMethod<AddAssetRequirementParams, void>;

  /**
   * Remove an existing compliance requirement from the Asset
   */
  public remove: ProcedureMethod<RemoveAssetRequirementParams, void>;

  /**
   * Configure compliance requirements for the Asset. This operation will replace all existing requirements with a new requirement set
   *
   * @example Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set: ProcedureMethod<SetAssetRequirementsParams, void>;

  /**
   * Retrieve all of the Asset's compliance requirements, together with the Default Trusted Claim Issuers
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public get(): Promise<ComplianceRequirements>;
  public get(callback: SubCallback<ComplianceRequirements>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async get(
    callback?: SubCallback<ComplianceRequirements>
  ): Promise<ComplianceRequirements | UnsubCallback> {
    const {
      parent,
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);

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
      context.assertSupportsSubscription();

      return requestMulti<
        [typeof complianceManager.assetCompliances, typeof complianceManager.trustedClaimIssuer]
      >(
        context,
        [
          [complianceManager.assetCompliances, rawAssetId],
          [complianceManager.trustedClaimIssuer, rawAssetId],
        ],
        res => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
          callback(assembleResult(res));
        }
      );
    }

    const result = await requestMulti<
      [typeof complianceManager.assetCompliances, typeof complianceManager.trustedClaimIssuer]
    >(context, [
      [complianceManager.assetCompliances, rawAssetId],
      [complianceManager.trustedClaimIssuer, rawAssetId],
    ]);

    return assembleResult(result);
  }

  /**
   * Delete all the current requirements for the Asset.
   */
  public reset: NoArgsProcedureMethod<void>;

  /**
   * Pause all the Asset's requirements. This means that all transfers will be allowed until requirements are unpaused
   */
  public pause: NoArgsProcedureMethod<void>;

  /**
   * Un-pause all the Asset's current requirements
   */
  public unpause: NoArgsProcedureMethod<void>;

  /**
   * Check whether Asset compliance requirements are paused or not
   */
  public async arePaused(): Promise<boolean> {
    const {
      parent,
      context: {
        polymeshApi: {
          query: { complianceManager },
        },
      },
      context,
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);

    const { paused } = await complianceManager.assetCompliances(rawAssetId);

    return boolToBoolean(paused);
  }

  /**
   * Modify a compliance requirement for the Asset
   */
  public modify: ProcedureMethod<ModifyComplianceRequirementParams, void>;
}
