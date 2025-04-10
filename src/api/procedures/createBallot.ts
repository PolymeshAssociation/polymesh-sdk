import { ISubmittableResult } from '@polkadot/types/types';

import { Context, CorporateBallot, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  CorporateActionKind,
  CorporateBallotWithDetails,
  CreateBallotParams,
  ErrorCode,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetIdToString,
  booleanToBool,
  corporateActionParamsToMeshCorporateActionArgs,
  corporateBallotMetaToMeshCorporateBallotMeta,
  corporateBallotTimeRangeToMeshCorporateBallotTimeRange,
  meshBallotDetailsToCorporateBallotDetails,
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
  async (receipt: ISubmittableResult): Promise<CorporateBallotWithDetails> => {
    const [{ data }] = filterEventRecords(receipt, 'corporateBallot', 'Created');
    const [, caId, timeRange, meta, rcv] = data;
    const { localId, assetId } = caId;

    const rawCorporateAction = await context.polymeshApi.query.corporateAction.corporateActions(
      assetId,
      localId
    );
    const [rawDetails, ballot] = await Promise.all([
      context.polymeshApi.query.corporateAction.details(caId),
      Promise.resolve(
        new CorporateBallot(
          {
            assetId: assetIdToString(assetId),
            id: u32ToBigNumber(localId),
          },
          context
        )
      ),
    ]);

    const details = meshBallotDetailsToCorporateBallotDetails(
      rawCorporateAction.unwrap(),
      rawDetails,
      timeRange,
      meta,
      rcv
    );

    return { ballot, details };
  };

/**
 * @hidden
 */
export async function prepareCreateBallot(
  this: Procedure<Params, CorporateBallotWithDetails>,
  args: Params
): Promise<
  TransactionSpec<
    CorporateBallotWithDetails,
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
    targets = null,
    declarationDate,
    startDate,
    endDate,
    rcv,
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
          checkpoint: startDate,
          targets,
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
  this: Procedure<Params, CorporateBallotWithDetails>,
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
export const createBallot = (): Procedure<Params, CorporateBallotWithDetails> =>
  new Procedure(prepareCreateBallot, getAuthorization);
