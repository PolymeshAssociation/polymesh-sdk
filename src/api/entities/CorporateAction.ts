import BigNumber from 'bignumber.js';

import { Context, CorporateActionBase, modifyCaCheckpoint } from '~/internal';
import {
  CorporateActionKind,
  CorporateActionTargets,
  ModifyCaCheckpointParams,
  ProcedureMethod,
  TaxWithholding,
} from '~/types';
import { HumanReadableType } from '~/types/utils';
import { createProcedureMethod } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface HumanReadable {
  id: string;
  ticker: string;
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
export class CorporateAction extends CorporateActionBase {
  /**
   * @hidden
   */
  public constructor(args: UniqueIdentifiers & Params, context: Context) {
    super(args, context);

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
   * Modify the Corporate Action's Checkpoint
   */
  public modifyCheckpoint: ProcedureMethod<ModifyCaCheckpointParams, void>;
}
