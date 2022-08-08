import { assertCaCheckpointValid } from '~/api/procedures/utils';
import { Asset, CorporateActionBase, Procedure } from '~/internal';
import { ModifyCaCheckpointParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';
import { getCheckpointValue, optionize } from '~/utils/internal';

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
      asset: { ticker },
    },
  } = args;
  let checkpointValue;
  if (checkpoint) {
    checkpointValue = await getCheckpointValue(checkpoint, ticker, context);
    await assertCaCheckpointValid(checkpointValue);
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = optionize(checkpointToRecordDateSpec)(checkpointValue, context);

  this.addTransaction({
    transaction: tx.corporateAction.changeRecordDate,
    args: [rawCaId, rawRecordDateSpec],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  {
    corporateAction: {
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
export const modifyCaCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaCheckpoint, getAuthorization);
