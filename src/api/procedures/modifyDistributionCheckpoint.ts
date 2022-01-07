import { assertDistributionDatesValid } from '~/api/procedures/utils';
import {
  Asset,
  Checkpoint,
  DividendDistribution,
  modifyCaCheckpoint,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, InputCaCheckpoint, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { getCheckpointValue } from '~/utils/internal';

/**
 * @hidden
 */
export interface ModifyDistributionCheckpointParams {
  checkpoint: InputCaCheckpoint;
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
    distribution: { paymentDate, expiryDate, asset },
  } = args;

  const now = new Date();

  if (paymentDate <= now) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Distribution is already in its payment period',
    });
  }

  const checkpointValue = await getCheckpointValue(checkpoint, asset, this.context);

  if (!(checkpointValue instanceof Checkpoint)) {
    await assertDistributionDatesValid(checkpointValue, paymentDate, expiryDate);
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
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
  {
    distribution: {
      asset: { ticker },
    },
  }: Params
): ProcedureAuthorization {
  const { context } = this;

  return {
    permissions: {
      transactions: [TxTags.corporateAction.ChangeRecordDate],
      assets: [new Asset({ ticker }, context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyDistributionCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyDistributionCheckpoint, getAuthorization);
