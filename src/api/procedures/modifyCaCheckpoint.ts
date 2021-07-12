import { assertCaCheckpointValid } from '~/api/procedures/utils';
import {
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  Procedure,
  SecurityToken,
} from '~/internal';
import { RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';
import { optionize } from '~/utils/internal';

/**
 * @hidden
 */
export interface ModifyCaCheckpointParams {
  checkpoint: Checkpoint | CheckpointSchedule | Date;
}

export type Params = ModifyCaCheckpointParams & {
  corporateAction: CorporateAction;
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
    corporateAction: { id: localId, ticker },
  } = args;

  await assertCaCheckpointValid(checkpoint);

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = optionize(checkpointToRecordDateSpec)(checkpoint, context);

  this.addTransaction(tx.corporateAction.changeRecordDate, {}, rawCaId, rawRecordDateSpec);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { corporateAction: { ticker } }: Params
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
export const modifyCaCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaCheckpoint, getAuthorization);
