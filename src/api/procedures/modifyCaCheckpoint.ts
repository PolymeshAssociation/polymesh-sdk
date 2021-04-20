import {
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  PolymeshError,
  Procedure,
  SecurityToken,
} from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';
import { optionize } from '~/utils/internal';

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

  if (checkpoint) {
    if (!(checkpoint instanceof Date)) {
      const exists = await checkpoint.exists();

      if (!exists) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message:
            checkpoint instanceof Checkpoint
              ? "Checkpoint doesn't exist"
              : "Checkpoint Schedule doesn't exist",
        });
      }
    } else if (checkpoint <= new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint date must be in the future',
      });
    }
  }

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
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
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
