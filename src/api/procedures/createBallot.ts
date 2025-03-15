import { ISubmittableResult } from '@polkadot/types/types';

import { Context, CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { CorporateActionKind, CreateBallotParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetIdToString,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  corporateActionParamsToMeshCorporateActionArgs,
  corporateBallotMetaToMeshCorporateBallotMeta,
  corporateBallotTimeRangeToMeshCorporateBallotTimeRange,
  meshCorporateBallotMetaToCorporateBallotMeta,
  momentToDate,
  u32ToBigNumber,
} from '~/utils/conversion';
import { assertDeclarationDate, filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = CreateBallotParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export interface Storage {
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export const createBallotResolver =
  (context: Context) =>
  async (receipt: ISubmittableResult): Promise<CorporateBallot> => {
    const {
      polymeshApi: { query },
    } = context;

    const [{ data }] = filterEventRecords(receipt, 'corporateBallot', 'Created');
    const [, caId, ballotTimeRange, ballotMeta, rcv] = data;
    const { localId, assetId } = caId;

    const [corporateAction, rawDescription] = await Promise.all([
      query.corporateAction.corporateActions(assetId, localId),
      query.corporateAction.details(caId),
    ]);

    return new CorporateBallot(
      {
        assetId: assetIdToString(assetId),
        id: u32ToBigNumber(localId),
        meta: meshCorporateBallotMetaToCorporateBallotMeta(ballotMeta),
        rcv: boolToBoolean(rcv),
        startDate: momentToDate(ballotTimeRange.start),
        endDate: momentToDate(ballotTimeRange.end),
        description: bytesToString(rawDescription),
        declarationDate: momentToDate(corporateAction.unwrap().declDate),
      },
      context
    );
  };

/**
 * @hidden
 */
export async function prepareCreateBallot(
  this: Procedure<Params, CorporateBallot>,
  args: Params
): Promise<
  TransactionSpec<
    CorporateBallot,
    ExtrinsicParams<'corporateAction', 'initiateCorporateActionAndBallot'>
  >
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
    meta,
    description,
    declarationDate = new Date(),
    startDate,
    endDate,
    rcv = false,
  } = args;

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

  assertDeclarationDate(declarationDate);

  return {
    transaction: corporateAction.initiateCorporateActionAndBallot,
    args: [
      corporateActionParamsToMeshCorporateActionArgs(
        {
          asset,
          kind: CorporateActionKind.IssuerNotice,
          declarationDate,
          description,
          checkpoint: null,
          targets: null,
          defaultTaxWithholding: null,
          taxWithholdings: null,
        },
        context
      ),
      corporateBallotTimeRangeToMeshCorporateBallotTimeRange(
        declarationDate,
        startDate,
        endDate,
        context
      ),
      corporateBallotMetaToMeshCorporateBallotMeta(meta, context),
      booleanToBool(rcv, context),
    ],
    resolver: createBallotResolver(context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, CorporateBallot>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.InitiateCorporateActionAndBallot],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createBallot = (): Procedure<Params, CorporateBallot> =>
  new Procedure(prepareCreateBallot, getAuthorization);
