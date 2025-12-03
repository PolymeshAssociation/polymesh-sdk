import { ISubmittableResult } from '@polkadot/types/types';

import { assertCaTaxWithholdingsValid } from '~/api/procedures/utils';
import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  CorporateAction,
  FungibleAsset,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, InitiateCorporateActionParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetIdToString,
  corporateActionParamsToMeshCorporateActionArgs,
  meshCorporateActionToCorporateActionParams,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  assertDeclarationDate,
  filterEventRecords,
  getCheckpointValue,
  getCorporateActionWithDescription,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = InitiateCorporateActionParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export const initiateCorporateActionResolver =
  (asset: FungibleAsset, context: Context) =>
  async (receipt: ISubmittableResult): Promise<CorporateAction> => {
    const [record] = filterEventRecords(receipt, 'corporateAction', 'CAInitiated');

    const { data } = record!;
    const [, caId] = data;

    const id = u32ToBigNumber(caId.localId);
    const assetId = assetIdToString(caId.assetId);

    const { corporateAction, description } = await getCorporateActionWithDescription(
      asset,
      id,
      context
    );

    const action = new CorporateAction(
      {
        assetId,
        id,
        ...meshCorporateActionToCorporateActionParams(corporateAction, description, context),
      },
      context
    );

    return action;
  };

/**
 * @hidden
 */
export async function assertCheckpointValue(
  checkpoint: Checkpoint | CheckpointSchedule | Date
): Promise<void> {
  if (checkpoint instanceof Checkpoint) {
    const createdAt = await checkpoint.createdAt();

    // throw an error if the checkpoint is in the past
    if (createdAt < new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint must be in the future',
        data: {
          checkpoint: checkpoint.toHuman(),
        },
      });
    }
  }

  if (checkpoint instanceof CheckpointSchedule && checkpoint.pendingPoints.length === 0) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The provided CheckpointSchedule has no pending checkpoints',
    });
  }

  if (checkpoint instanceof Date && checkpoint < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Checkpoint must be in the future',
      data: {
        checkpoint,
      },
    });
  }
}

/**
 * @hidden
 */
export async function prepareInitiateCorporateAction(
  this: Procedure<Params, CorporateAction>,
  args: Params
): Promise<
  TransactionSpec<CorporateAction, ExtrinsicParams<'corporateAction', 'initiateCorporateAction'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { corporateAction },
        query,
      },
    },
    context,
  } = this;

  const {
    asset,
    kind,
    description,
    targets,
    declarationDate,
    checkpoint,
    taxWithholdings,
    defaultTaxWithholding,
  } = args;

  // Validate declarationDate is in the past
  assertDeclarationDate(declarationDate);

  // Validate checkpoint/recordDate
  let checkpointValue: Checkpoint | CheckpointSchedule | Date | null = null;

  if (checkpoint) {
    checkpointValue = await getCheckpointValue(checkpoint, asset, context);

    await assertCheckpointValue(checkpointValue);
  }

  // Validate details length (max_details_length)
  const rawMaxDetailsLength = await query.corporateAction.maxDetailsLength();
  const maxDetailsLength = u32ToBigNumber(rawMaxDetailsLength);

  // ensure the corporate action details are short enough
  if (maxDetailsLength.lt(description.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Description too long',
      data: {
        maxLength: maxDetailsLength.toNumber(),
      },
    });
  }

  // Validate targets limit (handled in targetsToTargetIdentities conversion)
  // Validate withholding_tax: check limit and detect duplicates (chain throws error on duplicates)
  if (taxWithholdings && taxWithholdings.length > 0) {
    // Check limit and detect duplicates (assertCaTaxWithholdingsValid handles both)
    assertCaTaxWithholdingsValid(taxWithholdings, context);
  }

  const rawArgs = corporateActionParamsToMeshCorporateActionArgs(
    {
      asset,
      kind,
      declarationDate,
      description,
      checkpoint: checkpointValue,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
    },
    context
  );

  return {
    transaction: corporateAction.initiateCorporateAction,
    args: [
      rawArgs.assetId,
      rawArgs.kind,
      rawArgs.declDate,
      rawArgs.recordDate,
      rawArgs.details,
      rawArgs.targets,
      rawArgs.defaultWithholdingTax,
      rawArgs.withholdingTax,
    ],
    resolver: initiateCorporateActionResolver(asset, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CorporateAction>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.InitiateCorporateAction],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const initiateCorporateAction = (): Procedure<Params, CorporateAction> =>
  new Procedure(prepareInitiateCorporateAction, getAuthorization);
