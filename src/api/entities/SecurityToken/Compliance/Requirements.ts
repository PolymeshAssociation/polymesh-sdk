import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import { AssetCompliance, AssetComplianceResult, TrustedIssuer } from 'polymesh-types/types';

import {
  addAssetRequirement,
  AddAssetRequirementParams,
  Context,
  Identity,
  modifyComplianceRequirement,
  ModifyComplianceRequirementParams,
  Namespace,
  removeAssetRequirement,
  RemoveAssetRequirementParams,
  SecurityToken,
  setAssetRequirements,
  SetAssetRequirementsParams,
  togglePauseRequirements,
} from '~/internal';
import {
  Compliance,
  ComplianceRequirements,
  NoArgsProcedureMethod,
  ProcedureMethod,
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
 * Handles all Security Token Compliance Requirements related functionality
 */
export class Requirements extends Namespace<SecurityToken> {
  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
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
   * Add a new compliance requirement to the the Security Token. This doesn't modify existing requirements
   */
  public add: ProcedureMethod<AddAssetRequirementParams, SecurityToken>;

  /**
   * Remove an existing compliance requirement from the Security Token
   */
  public remove: ProcedureMethod<RemoveAssetRequirementParams, SecurityToken>;

  /**
   * Configure asset compliance requirements for the Security Token. This operation will replace all existing requirements with a new requirement set
   *
   * @example Say A, B, C, D and E are requirements and we arrange them as `[[A, B], [C, D], [E]]`.
   * For a transfer to succeed, it must either comply with A AND B, C AND D, OR E.
   */
  public set: ProcedureMethod<SetAssetRequirementsParams, SecurityToken>;

  /**
   * Retrieve all of the Security Token's compliance requirements, together with the Default Trusted Claim Issuers
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
      AssetCompliance,
      Vec<TrustedIssuer>
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
            (complianceManager.assetCompliances as unknown) as QueryableStorageEntry<'promise'>,
            rawTicker,
          ],
          [
            (complianceManager.trustedClaimIssuer as unknown) as QueryableStorageEntry<'promise'>,
            rawTicker,
          ],
        ],
        res => {
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
        (complianceManager.assetCompliances as unknown) as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [
        (complianceManager.trustedClaimIssuer as unknown) as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
    ]);

    return assembleResult(result);
  }

  /**
   * Detele all the current requirements for the Security Token.
   */
  public reset: NoArgsProcedureMethod<SecurityToken>;

  /**
   * Pause all the Security Token's requirements. This means that all transfers will be allowed until requirements are unpaused
   */
  public pause: NoArgsProcedureMethod<SecurityToken>;

  /**
   * Un-pause all the Security Token's current requirements
   */
  public unpause: NoArgsProcedureMethod<SecurityToken>;

  /**
   * Check whether the sender and receiver Identities in a transfer comply with all the requirements of this asset
   *
   * @note this does not take balances into account
   *
   * @param args.from - sender Identity (optional, defaults to the current Identity)
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

    const { from = await context.getCurrentIdentity(), to } = args;

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

    const { paused } = await complianceManager.assetCompliances(rawTicker);

    return boolToBoolean(paused);
  }

  /**
   * Modify a compliance requirement for the Security Token
   */
  public modify: ProcedureMethod<ModifyComplianceRequirementParams, void>;
}
