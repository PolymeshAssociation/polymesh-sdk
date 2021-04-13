import { DividendDistribution, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { checkpointToRecordDateSpec, corporateActionIdentifierToCaId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface ModifyRecordDateParams {
  recordDate: Date;
}

export type Params = ModifyRecordDateParams & {
  distribution: DividendDistribution;
};

/**
 * @hidden
 */
export async function prepareModifyRecordDate(
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
    recordDate,
    distribution: { id: localId, ticker, paymentDate, expiryDate },
  } = args;

  const now = new Date();

  if (now >= paymentDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution payment has started',
      data: { paymentDate },
    });
  }

  if (recordDate >= paymentDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution record date must be before the Payment date',
      data: { paymentDate },
    });
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const rawRecordDateSpec = checkpointToRecordDateSpec(recordDate, context);

  this.addTransaction(tx.corporateAction.changeRecordDate, {}, rawCaId, rawRecordDateSpec);
}

/**
 * @hidden
 */
export function getAuthorization({ distribution: { ticker } }: Params): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
    signerPermissions: {
      transactions: [TxTags.corporateAction.ChangeRecordDate],
      tokens: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyRecordDate = new Procedure(prepareModifyRecordDate, getAuthorization);
