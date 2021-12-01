import BigNumber from 'bignumber.js';

import { assertCaCheckpointValid } from '~/api/procedures/utils';
import {
  Checkpoint,
  CheckpointSchedule,
  CorporateActionBase,
  Procedure,
  SecurityToken,
} from '~/internal';
import { TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';
import { optionize } from '~/utils/internal';

export enum DistributionCheckpointType {
  Existing = 'Existing',
  Schedule = 'Schedule',
}

export type CheckpointId = {
  type: DistributionCheckpointType.Existing;
  id: BigNumber;
};

export type CheckpointScheduleId = {
  type: DistributionCheckpointType.Schedule;
  id: BigNumber;
};
/**
 * @hidden
 */
export interface ModifyCaCheckpointParams {
  checkpoint: Checkpoint | CheckpointSchedule | Date | null | CheckpointId | CheckpointScheduleId;
}

export type Params = ModifyCaCheckpointParams & {
  corporateAction: CorporateActionBase;
};

/**
 * @hidden
 */
export async function prepareModifyCaCheckpoint(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const {
    checkpoint,
    corporateAction: {
      id: localId,
      token: { ticker },
    },
  } = args;
  let point;
  if (checkpoint) {
    if (checkpoint instanceof Checkpoint || checkpoint instanceof CheckpointSchedule) {
      await assertCaCheckpointValid(checkpoint);
      point = checkpoint;
    } else if (checkpoint instanceof Date) {
      point = checkpoint;
    } else {
      // point = checkpoint;
      const token = new SecurityToken({ ticker }, context);
      if (checkpoint.type === DistributionCheckpointType.Existing) {
        point = await token.checkpoints.getOne({ id: checkpoint.id });
      } else {
        point = (await token.checkpoints.schedules.getOne({ id: checkpoint.id })).schedule;
      }
    }
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = optionize(checkpointToRecordDateSpec)(point, context);

  this.addTransaction(tx.corporateAction.changeRecordDate, {}, rawCaId, rawRecordDateSpec);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  {
    corporateAction: {
      token: { ticker },
    },
  }: Params
): ProcedureAuthorization {
  const { context } = this;

  return {
    permissions: {
      transactions: [TxTags.corporateAction.ChangeRecordDate],
      tokens: [new SecurityToken({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyCaCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaCheckpoint, getAuthorization);
