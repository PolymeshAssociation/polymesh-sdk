import { Option } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { CorporateAction as MeshCorporateAction } from 'polymesh-types/types';

import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  Entity,
  linkCaDocs,
  LinkCaDocsParams,
  modifyCaCheckpoint,
  ModifyCaCheckpointParams,
  PolymeshError,
} from '~/internal';
import { ErrorCode, ProcedureMethod } from '~/types';
import {
  numberToU32,
  storedScheduleToCheckpointScheduleParams,
  stringToTicker,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { CorporateActionKind, CorporateActionTargets, TaxWithholding } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
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
 * Represents an action initiated by the issuer of a Security Token which may affect the positions of
 *   the Tokenholders
 */
export class CorporateAction extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * internal Corporate Action ID
   */
  public id: BigNumber;

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * date at which the Corporate Action was created
   */
  public declarationDate: Date;

  /**
   * brief text description of the Corporate Action
   */
  public description: string;

  /**
   * tokenholder identities related to this Corporate action. If the treatment is `Exclude`, the identities
   *   are not targeted by the Action, and any identities left out of the array will be targeted, and vice versa
   */
  public targets: CorporateActionTargets;

  /**
   * default percentage of tax withholding for this Corporate Action
   */
  public defaultTaxWithholding: BigNumber;

  /**
   * percentage of tax withholding per Identity. Any Identity not present
   *   in this array uses the default tax withholding percentage
   */
  public taxWithholdings: TaxWithholding[];

  protected kind: CorporateActionKind;

  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    const {
      kind,
      declarationDate,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
      ...identifiers
    } = args;

    super(identifiers, context);

    const { id, ticker } = identifiers;

    this.id = id;
    this.ticker = ticker;
    this.kind = kind;
    this.declarationDate = declarationDate;
    this.description = description;
    this.targets = targets;
    this.defaultTaxWithholding = defaultTaxWithholding;
    this.taxWithholdings = taxWithholdings;

    this.linkDocuments = createProcedureMethod(
      { getProcedureAndArgs: procedureArgs => [linkCaDocs, { id, ticker, ...procedureArgs }] },
      context
    );

    this.modifyCheckpoint = createProcedureMethod(
      {
        getProcedureAndArgs: modifyCaCheckpointArgs => [
          modifyCaCheckpoint,
          { corporateAction: this, ...modifyCaCheckpointArgs },
        ],
      },
      context
    );
  }

  /**
   * Link a list of documents to this corporate action
   *
   * @note any previous links are removed in favor of the new list
   * @note required role:
   *   - Corporate Actions Agent
   */
  public linkDocuments: ProcedureMethod<LinkCaDocsParams, void>;

  /**
   * Modify the Corporate Action's Checkpoint
   */
  public modifyCheckpoint: ProcedureMethod<ModifyCaCheckpointParams, void>;

  /**
   * Retrieve whether the Corporate Action exists
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
      ticker,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const corporateAction = await this.fetchCorporateAction();

    if (corporateAction.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Corporate Action no longer exists',
      });
    }

    const { record_date: recordDate } = corporateAction.unwrap();

    if (recordDate.isNone) {
      return null;
    }

    const { checkpoint } = recordDate.unwrap();

    if (checkpoint.isExisting) {
      return new Checkpoint({ ticker, id: u64ToBigNumber(checkpoint.asExisting) }, context);
    }

    const [scheduleId, amount] = checkpoint.asScheduled;

    const [schedules, schedulePoints] = await Promise.all([
      query.checkpoint.schedules(rawTicker),
      query.checkpoint.schedulePoints(rawTicker, scheduleId),
    ]);

    const createdCheckpointIndex = u64ToBigNumber(amount).toNumber();
    if (createdCheckpointIndex >= schedulePoints.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const schedule = schedules.find(({ id: schedId }) =>
        u64ToBigNumber(schedId).eq(u64ToBigNumber(scheduleId))
      )!;

      return new CheckpointSchedule(
        { ticker, ...storedScheduleToCheckpointScheduleParams(schedule) },
        context
      );
    }

    return new Checkpoint(
      { ticker, id: u64ToBigNumber(schedulePoints[createdCheckpointIndex]) },
      context
    );
  }

  /**
   * @hidden
   */
  private fetchCorporateAction(): Promise<Option<MeshCorporateAction>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      id,
      ticker,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    return query.corporateAction.corporateActions(rawTicker, numberToU32(id, context));
  }
}
