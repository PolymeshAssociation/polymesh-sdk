import { QueryableStorage } from '@polkadot/api/types';
import { PalletCorporateActionsCaId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  Asset,
  Context,
  CorporateActionBase,
  DividendDistribution,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, RemoveCorporateActionParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  bigNumberToU32,
  corporateActionIdentifierToCaId,
  momentToDate,
  stringToTicker,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = RemoveCorporateActionParams & {
  ticker: string;
};

const caNotExistsMessage = "The Corporate Action doesn't exist";

/**
 * @hidden
 */
const assertCaIsRemovable = async (
  rawCaId: PalletCorporateActionsCaId,
  query: QueryableStorage<'promise'>,
  ticker: string,
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
      stringToTicker(ticker, context),
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
): Promise<void> {
  const {
    context,
    context: {
      polymeshApi: { tx, query },
    },
  } = this;
  const { ticker, corporateAction } = args;

  const localId =
    corporateAction instanceof CorporateActionBase ? corporateAction.id : corporateAction;
  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  if (corporateAction instanceof DividendDistribution || corporateAction instanceof BigNumber) {
    await assertCaIsRemovable(rawCaId, query, ticker, context, corporateAction);
  } else {
    const exists = await corporateAction.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: caNotExistsMessage,
      });
    }
  }

  this.addTransaction({
    transaction: tx.corporateAction.removeCa,
    args: [rawCaId],
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.RemoveCa],
      assets: [new Asset({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCorporateAction = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCorporateAction, getAuthorization);
