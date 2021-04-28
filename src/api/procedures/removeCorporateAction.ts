import BigNumber from 'bignumber.js';

import { CorporateAction } from '~/api/entities/CorporateAction';
import { DividendDistribution } from '~/api/entities/DividendDistribution';
import { Context, PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  corporateActionIdentifierToCaId,
  momentToDate,
  numberToU32,
  stringToTicker,
} from '~/utils/conversion';

export interface RemoveCorporateActionParams {
  corporateAction: CorporateAction | BigNumber;
}

/**
 * @hidden
 */
export type Params = RemoveCorporateActionParams & {
  ticker: string;
};

/**
 * @hidden
 */
const checkCorporateActionExistsOrThrow = async (
  corporateAction: CorporateAction | BigNumber,
  context: Context,
  ticker?: string
): Promise<void> => {
  const {
    polymeshApi: { query },
  } = context;

  let exists: boolean;

  if (corporateAction instanceof BigNumber) {
    const CA = await query.corporateAction.corporateActions(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stringToTicker(ticker!, context),
      numberToU32(corporateAction, context)
    );
    exists = CA.isSome;
  } else {
    exists = await corporateAction.exists();
  }

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Corporate Action doesn't exist",
    });
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

  const localId = corporateAction instanceof CorporateAction ? corporateAction.id : corporateAction;
  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);

  if (corporateAction instanceof DividendDistribution || corporateAction instanceof BigNumber) {
    const isBn = corporateAction instanceof BigNumber;
    const distribution = await query.capitalDistribution.distributions(rawCaId);
    const exists = distribution.isSome;

    if (!exists && !isBn) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Distribution doesn't exist",
      });
    }

    if (!isBn) {
      const { payment_at: rawPaymentAt } = distribution.unwrap();

      if (momentToDate(rawPaymentAt) < new Date()) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The Distribution has already started',
        });
      }
    } else {
      await checkCorporateActionExistsOrThrow(corporateAction, context, ticker);
    }
  } else {
    await checkCorporateActionExistsOrThrow(corporateAction, context);
  }

  this.addTransaction(tx.corporateAction.removeCa, {}, rawCaId);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions: [TxTags.corporateAction.RemoveCa],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCorporateAction = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCorporateAction, getAuthorization);
