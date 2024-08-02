import { Option } from '@polkadot/types';
import { PalletCorporateActionsCorporateAction } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  Entity,
  FungibleAsset,
  linkCaDocs,
  PolymeshError,
} from '~/internal';
import {
  ErrorCode,
  InputCaCheckpoint,
  LinkCaDocsParams,
  ModifyCaCheckpointParams,
  ProcedureMethod,
} from '~/types';
import { HumanReadableType, Modify } from '~/types/utils';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  momentToDate,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, toHumanReadable } from '~/utils/internal';

import { CorporateActionKind, CorporateActionTargets, TaxWithholding } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  /**
   * @deprecated in favour of `assetId`
   */
  ticker: string;
  assetId: string;
  declarationDate: string;
  description: string;
  targets: HumanReadableType<CorporateActionTargets>;
  defaultTaxWithholding: string;
  taxWithholdings: HumanReadableType<TaxWithholding[]>;
}

export interface Params {
  kind: CorporateActionKind;
  declarationDate: Date;
  description: string;
  targets: CorporateActionTargets;
  defaultTaxWithholding: BigNumber;
  taxWithholdings: TaxWithholding[];
}

/**
 * Represents an action initiated by the issuer of an Asset which may affect the positions of
 *   the Asset Holders
 */
export abstract class CorporateActionBase extends Entity<UniqueIdentifiers, unknown> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * internal Corporate Action ID
   */
  public id: BigNumber;

  /**
   * Asset affected by this Corporate Action
   */
  public asset: FungibleAsset;

  /**
   * date at which the Corporate Action was created
   */
  public declarationDate: Date;

  /**
   * brief text description of the Corporate Action
   */
  public description: string;

  /**
   * Asset Holder Identities related to this Corporate action. If the treatment is `Exclude`, the Identities
   *   in the array will not be targeted by the Action, Identities not in the array will be targeted, and vice versa
   */
  public targets: CorporateActionTargets;

  /**
   * default percentage (0-100) of tax withholding for this Corporate Action
   */
  public defaultTaxWithholding: BigNumber;

  /**
   * percentage (0-100) of tax withholding per Identity. Any Identity not present
   *   in this array uses the default tax withholding percentage
   */
  public taxWithholdings: TaxWithholding[];

  /**
   * type of corporate action being represented
   */
  protected kind: CorporateActionKind;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const {
      kind,
      declarationDate,
      targets,
      description,
      defaultTaxWithholding,
      taxWithholdings,
      ...identifiers
    } = args;

    super(identifiers, context);

    const { id, assetId } = identifiers;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
    this.kind = kind;
    this.declarationDate = declarationDate;
    this.description = description;
    this.targets = targets;
    this.defaultTaxWithholding = defaultTaxWithholding;
    this.taxWithholdings = taxWithholdings;

    this.linkDocuments = createProcedureMethod(
      {
        getProcedureAndArgs: procedureArgs => [
          linkCaDocs,
          { id, asset: this.asset, ...procedureArgs },
        ],
      },
      context
    );
  }

  /**
   * Link a list of documents to this corporate action
   *
   * @note any previous links are removed in favor of the new list
   */
  public linkDocuments: ProcedureMethod<LinkCaDocsParams, void>;

  /**
   * Modify the Corporate Action's Checkpoint
   */
  public abstract modifyCheckpoint: ProcedureMethod<
    Modify<
      ModifyCaCheckpointParams,
      {
        checkpoint: InputCaCheckpoint;
      }
    >,
    void
  >;

  /**
   * Determine whether this Corporate Action exists on chain
   */
  public async exists(): Promise<boolean> {
    const corporateAction = await this.fetchCorporateAction();

    return corporateAction.isSome;
  }

  /**
   * Retrieve the Checkpoint associated with this Corporate Action. If the Checkpoint is scheduled and has
   *   not been created yet, the corresponding CheckpointSchedule is returned instead. A null value means
   *   the Corporate Action was created without an associated Checkpoint
   */
  public async checkpoint(): Promise<Checkpoint | CheckpointSchedule | null> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      asset,
      asset: { id: assetId },
    } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const corporateAction = await this.fetchCorporateAction();
    if (corporateAction.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Corporate Action no longer exists',
      });
    }

    const { recordDate } = corporateAction.unwrap();

    if (recordDate.isNone) {
      return null;
    }

    const { checkpoint } = recordDate.unwrap();

    if (checkpoint.isExisting) {
      return new Checkpoint({ assetId, id: u64ToBigNumber(checkpoint.asExisting) }, context);
    }

    const [scheduleId, amount] = checkpoint.asScheduled;

    const [schedule, rawCheckpointIds] = await Promise.all([
      query.checkpoint.scheduledCheckpoints(rawAssetId, scheduleId),
      query.checkpoint.schedulePoints(rawAssetId, scheduleId),
    ]);

    const createdCheckpointIndex = u64ToBigNumber(amount).toNumber();
    if (schedule.isSome) {
      const id = u64ToBigNumber(scheduleId);
      const points = [...schedule.unwrap().pending].map(rawPoint => momentToDate(rawPoint));
      return new CheckpointSchedule(
        {
          id,
          pendingPoints: points,
          assetId,
        },
        context
      );
    }

    return new Checkpoint(
      { assetId, id: u64ToBigNumber(rawCheckpointIds[createdCheckpointIndex]) },
      context
    );
  }

  /**
   * @hidden
   */
  private fetchCorporateAction(): Promise<Option<PalletCorporateActionsCorporateAction>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      id,
      asset,
    } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    return query.corporateAction.corporateActions(rawAssetId, bigNumberToU32(id, context));
  }

  /**
   * Return the Corporate Action's static data
   */
  public toHuman(): HumanReadable {
    const {
      asset,
      id,
      declarationDate,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
    } = this;

    return toHumanReadable({
      ticker: asset,
      assetId: asset,
      id,
      declarationDate,
      defaultTaxWithholding,
      taxWithholdings,
      targets,
      description,
    });
  }
}
