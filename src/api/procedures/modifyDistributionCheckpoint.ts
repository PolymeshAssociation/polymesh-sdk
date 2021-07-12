import { assertDistributionDatesValid } from '~/api/procedures/utils';
import {
  Checkpoint,
  CheckpointSchedule,
  DividendDistribution,
  modifyCaCheckpoint,
  PolymeshError,
  Procedure,
  SecurityToken,
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
      message: 'Distribution is already in its payment period',
    });
  }

  if (!(checkpoint instanceof Checkpoint)) {
    await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
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

  await this.addProcedure(modifyCaCheckpoint(), {
    checkpoint,
    corporateAction: distribution,
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { distribution: { ticker } }: Params
): ProcedureAuthorization {
  const { context } = this;

  return {
    roles: [{ type: RoleType.TokenCaa, ticker }],
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
export const modifyDistributionCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyDistributionCheckpoint, getAuthorization);
