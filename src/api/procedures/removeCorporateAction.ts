import { QueryableStorage } from '@polkadot/api/types';
import { PalletCorporateActionsCaId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  Context,
  CorporateActionBase,
  DividendDistribution,
  FungibleAsset,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RemoveCorporateActionParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToU32,
  corporateActionIdentifierToCaId,
  momentToDate,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveCorporateActionParams & {
  asset: FungibleAsset;
};

const caNotExistsMessage = "The Corporate Action doesn't exist";

/**
 * @hidden
 */
const assertCaIsRemovable = async (
  rawCaId: PalletCorporateActionsCaId,
  query: QueryableStorage<'promise'>,
  asset: FungibleAsset,
  context: Context,
  corporateAction: CorporateActionBase | BigNumber
): Promise<void> => {
  const distribution = await query.capitalDistribution.distributions(rawCaId);
  const exists = distribution.isSome;

  if (!exists && !(corporateAction instanceof BigNumber)) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Distribution doesn't exist",
    });
  }

  if (corporateAction instanceof BigNumber) {
    const CA = await query.corporateAction.corporateActions(
      assetToMeshAssetId(asset, context),
      bigNumberToU32(corporateAction, context)
    );

    if (CA.isEmpty) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: caNotExistsMessage,
      });
    }
  } else {
    const { paymentAt: rawPaymentAt } = distribution.unwrap();

    if (momentToDate(rawPaymentAt) < new Date()) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Distribution has already started',
      });
    }
  }
};

/**
 * @hidden
 */
export async function prepareRemoveCorporateAction(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateAction', 'removeCa'>>> {
  const {
    context,
    context: {
      polymeshApi: { tx, query },
    },
  } = this;
  const { asset, corporateAction } = args;

  const localId =
    corporateAction instanceof CorporateActionBase ? corporateAction.id : corporateAction;
  const rawCaId = corporateActionIdentifierToCaId({ asset, localId }, context);

  if (corporateAction instanceof DividendDistribution || corporateAction instanceof BigNumber) {
    await assertCaIsRemovable(rawCaId, query, asset, context, corporateAction);
  } else {
    const exists = await corporateAction.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: caNotExistsMessage,
      });
    }
  }

  return {
    transaction: tx.corporateAction.removeCa,
    args: [rawCaId],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.RemoveCa],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCorporateAction = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCorporateAction, getAuthorization);
