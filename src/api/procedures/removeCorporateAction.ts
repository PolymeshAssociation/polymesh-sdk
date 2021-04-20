import BigNumber from 'bignumber.js';

import { CorporateAction } from '~/api/entities/CorporateAction';
import { DividendDistribution } from '~/api/entities/DividendDistribution';
import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { corporateActionIdentifierToCaId, momentToDate } from '~/utils/conversion';

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
    const distributionDetail = await query.capitalDistribution.distributions(rawCaId);
    const exists = distributionDetail.isSome;

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Distribution doesn't exist",
      });
    }

    const { payment_at: rawPaymentAt } = distributionDetail.unwrap();

    if (momentToDate(rawPaymentAt) < new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Distribution has already started',
      });
    }
  } else {
    const exists = await corporateAction.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: "The Corporate Action doesn't exist",
      });
    }
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
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const removeCorporateAction = (): Procedure<Params, void> =>
  new Procedure(prepareRemoveCorporateAction, getAuthorization);
