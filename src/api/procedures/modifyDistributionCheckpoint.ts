import { modifyCaCheckpoint } from '~/api/procedures/modifyCaCheckpoint';
import {
  Checkpoint,
  CheckpointSchedule,
  DividendDistribution,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';

/**
 * @hidden
 */
export interface ModifyDistributionCheckpointParams {
  checkpoint: Checkpoint | CheckpointSchedule | Date;
}

export type Params = ModifyDistributionCheckpointParams & {
  distribution: DividendDistribution;
};

/**
 * @hidden
 */
export async function prepareModifyDistributionCheckpoint(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    checkpoint,
    distribution,
    distribution: { paymentDate, expiryDate },
  } = args;

  const now = new Date();

  if (paymentDate <= now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Distribution payment date must be in the future',
    });
  }

  if (!(checkpoint instanceof Checkpoint)) {
    let checkpointDate;

    if (checkpoint instanceof Date) {
      if (checkpoint <= new Date()) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Checkpoint date must be in the future',
        });
      }

      checkpointDate = checkpoint;
    } else {
      ({ nextCheckpointDate: checkpointDate } = await checkpoint.details());
    }

    if (checkpointDate >= paymentDate) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint date must be before the payment date',
      });
    }
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }

  await this.addProcedure(modifyCaCheckpoint, {
    checkpoint,
    corporateAction: distribution,
  });
}

/**
 * @hidden
 */
export function getAuthorization({ distribution: { ticker } }: Params): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions: [TxTags.corporateAction.ChangeRecordDate],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyDistributionCheckpoint = new Procedure(
  prepareModifyDistributionCheckpoint,
  getAuthorization
);
