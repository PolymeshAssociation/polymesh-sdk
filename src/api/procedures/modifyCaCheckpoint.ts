// import { assertCaCheckpointValid } from '~/api/procedures/utils';
import { assertCaCheckpointValid } from '~/api/procedures/utils';
import { CorporateActionBase, Procedure, SecurityToken } from '~/internal';
import { InputCaCheckpoint, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';
import { getCheckpointValue, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export interface ModifyCaCheckpointParams {
  checkpoint: InputCaCheckpoint | null;
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
  let checkpointValue;
  if (checkpoint) {
    checkpointValue = await getCheckpointValue(checkpoint, ticker, context);
    await assertCaCheckpointValid(checkpointValue);
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = optionize(checkpointToRecordDateSpec)(checkpointValue, context);

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
