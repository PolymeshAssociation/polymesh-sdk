import {
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface ModifyCaCheckpointParams {
  checkpoint?: Checkpoint | CheckpointSchedule | Date;
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

  if (checkpoint instanceof Checkpoint) {
    const exists = await checkpoint.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint no longer exists',
      });
    }
  } else if (checkpoint instanceof CheckpointSchedule) {
    const exists = await checkpoint.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint Schedule no longer exists',
      });
    }
  } else if (checkpoint instanceof Date) {
    if (checkpoint <= new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint date must be in the future',
      });
    }
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = checkpoint ? checkpointToRecordDateSpec(checkpoint, context) : null;

  this.addTransaction(tx.corporateAction.changeRecordDate, {}, rawCaId, rawRecordDateSpec);
}

/**
 * @hidden
 */
export function getAuthorization({ corporateAction: { ticker } }: Params): ProcedureAuthorization {
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
export const modifyCaCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaCheckpoint, getAuthorization);
