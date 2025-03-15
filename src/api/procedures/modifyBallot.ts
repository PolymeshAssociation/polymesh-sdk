import BigNumber from 'bignumber.js';
import _ from 'lodash';

import { Context, CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  BallotMeta,
  CorporateBallotParams,
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
} from '~/utils/conversion';
import {
  assertBallotNotStarted,
  checkTxType,
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
export function assertMetaChanged(meta: BallotMeta, ballotDetails: CorporateBallotParams): void {
  if (_.isEqual(meta, ballotDetails.meta)) {
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
  { startDate, endDate }: CorporateBallotParams
): void {
  if (endDate === newEndDate) {
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
export function assertRcvChange(rcv: boolean, ballotDetails: CorporateBallotParams): void {
  if (rcv === ballotDetails.rcv) {
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
): Promise<CorporateBallot> {
  const ballotDetails = await getCorporateBallotDetailsOrThrow(asset, ballotId, context);

  return new CorporateBallot({ assetId: asset.id, id: ballotId, ...ballotDetails }, context);
}
/**
 * @hidden
 */
export async function prepareModifyBallot(
  this: Procedure<Params, CorporateBallot>,
  args: Params
): Promise<BatchTransactionSpec<CorporateBallot, unknown[][]>> {
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

  const ballotDetails = await getCorporateBallotDetailsOrThrow(asset, ballotId, context);

  assertBallotNotStarted(ballotDetails);

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId: ballotId }, context);

  if (meta) {
    assertMetaChanged(meta, ballotDetails);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeMeta,
        args: [rawCaId, corporateBallotMetaToMeshCorporateBallotMeta(meta, context)],
      })
    );
  }

  if (endDate) {
    assertEndDateChange(endDate, ballotDetails);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeEnd,
        args: [rawCaId, dateToMoment(endDate, context)],
      })
    );
  }

  if (typeof rcv !== 'undefined') {
    assertRcvChange(rcv, ballotDetails);

    transactions.push(
      checkTxType({
        transaction: tx.corporateBallot.changeRcv,
        args: [rawCaId, booleanToBool(rcv, context)],
      })
    );
  }

  return {
    transactions,
    resolver: await modifyCorporateBallotResolver(asset, ballotId, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CorporateBallot>,
  { asset, meta, endDate, rcv }: Params
): ProcedureAuthorization {
  const transactions = [];

  if (meta) {
    transactions.push(TxTags.corporateBallot.ChangeMeta);
  }

  if (endDate) {
    transactions.push(TxTags.corporateBallot.ChangeEnd);
  }

  if (rcv) {
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
export const modifyBallot = (): Procedure<Params, CorporateBallot> =>
  new Procedure(prepareModifyBallot, getAuthorization);
