import BigNumber from 'bignumber.js';
import { isEqual } from 'lodash';

import { BallotMeta, CorporateBallotDetails } from '~/api/entities/CorporateBallot/types';
import { Context, CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  CorporateBallotWithDetails,
  ErrorCode,
  ModifyCorporateBallotParams,
  TxTags,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  booleanToBool,
  corporateActionIdentifierToCaId,
  corporateBallotMetaToMeshCorporateBallotMeta,
  dateToMoment,
  meshCorporateActionToCorporateActionParams,
} from '~/utils/conversion';
import {
  assertBallotNotStarted,
  checkTxType,
  getCorporateActionWithDescription,
  getCorporateBallotDetailsOrThrow,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = ModifyCorporateBallotParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export function assertMetaChanged(meta: BallotMeta, details: CorporateBallotDetails): void {
  if (isEqual(meta, details.meta)) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Provided CorporateBallot meta is the same as the current one',
      data: { meta },
    });
  }
}

/**
 * @hidden
 */
export function assertEndDateChange(
  newEndDate: Date,
  { startDate, endDate }: CorporateBallotDetails
): void {
  if (endDate.getTime() === newEndDate.getTime()) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Provided CorporateBallot end date is the same as the current one',
      data: { endDate },
    });
  }

  if (newEndDate < startDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'End date must be after start date',
      data: { newEndDate, startDate },
    });
  }
}

/**
 * @hidden
 */
export function assertRcvChange(rcv: boolean, details: CorporateBallotDetails): void {
  if (rcv === details.rcv) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'Provided CorporateBallot rcv is the same as the current one',
      data: { rcv },
    });
  }
}

/**
 * @hidden
 */
export async function modifyCorporateBallotResolver(
  asset: FungibleAsset,
  ballotId: BigNumber,
  context: Context
): Promise<CorporateBallotWithDetails> {
  const details = await getCorporateBallotDetailsOrThrow(asset, ballotId, context);
  const { corporateAction, description } = await getCorporateActionWithDescription(
    asset,
    ballotId,
    context
  );

  const ballot = new CorporateBallot(
    {
      ...meshCorporateActionToCorporateActionParams(corporateAction, description, context),
      id: ballotId,
      assetId: asset.id,
    },
    context
  );

  return {
    ballot,
    details,
  };
}

/**
 * @hidden
 */
export async function prepareModifyBallot(
  this: Procedure<Params, CorporateBallotWithDetails>,
  args: Params
): Promise<BatchTransactionSpec<CorporateBallotWithDetails, unknown[][]>> {
  const {
    context,
    context: {
      polymeshApi: { tx },
    },
  } = this;
  const { asset, ballot, meta, endDate, rcv } = args;
  const transactions = [];

  if (!meta && !endDate && typeof rcv === 'undefined') {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'No properties given for ballot modification',
    });
  }

  const ballotId = BigNumber.isBigNumber(ballot) ? ballot : ballot.id;

  const details = await getCorporateBallotDetailsOrThrow(asset, ballotId, context);

  assertBallotNotStarted(details);

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId: ballotId }, context);

  if (meta) {
    assertMetaChanged(meta, details);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeMeta,
        args: [rawCaId, corporateBallotMetaToMeshCorporateBallotMeta(meta, context)],
      })
    );
  }

  if (endDate) {
    assertEndDateChange(endDate, details);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeEnd,
        args: [rawCaId, dateToMoment(endDate, context)],
      })
    );
  }

  if (typeof rcv !== 'undefined') {
    assertRcvChange(rcv, details);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeRcv,
        args: [rawCaId, booleanToBool(rcv, context)],
      })
    );
  }

  return {
    transactions,
    resolver: (): Promise<CorporateBallotWithDetails> =>
      modifyCorporateBallotResolver(asset, ballotId, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CorporateBallotWithDetails>,
  { asset, meta, endDate, rcv }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (meta) {
    transactions.push(TxTags.corporateBallot.ChangeMeta);
  }

  if (endDate) {
    transactions.push(TxTags.corporateBallot.ChangeEnd);
  }

  if (typeof rcv !== 'undefined') {
    transactions.push(TxTags.corporateBallot.ChangeRcv);
  }

  return {
    permissions: {
      transactions,
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyBallot = (): Procedure<Params, CorporateBallotWithDetails> =>
  new Procedure(prepareModifyBallot, getAuthorization);
