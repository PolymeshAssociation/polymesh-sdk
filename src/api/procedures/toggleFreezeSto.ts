import BigNumber from 'bignumber.js';

import { PolymeshError, Procedure, SecurityToken, Sto } from '~/internal';
import { ErrorCode, RoleType, StoStatus, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { numberToU64, stringToTicker } from '~/utils/conversion';

export interface ToggleFreezeStoParams {
  id: BigNumber;
  freeze: boolean;
  ticker: string;
}

/**
 * @hidden
 */
export async function prepareToggleFreezeSto(
  this: Procedure<ToggleFreezeStoParams, Sto>,
  args: ToggleFreezeStoParams
): Promise<Sto> {
  const {
    context: {
      polymeshApi: {
        tx: { sto: txSto },
      },
    },
    context,
  } = this;
  const { ticker, id, freeze } = args;

  const rawTicker = stringToTicker(ticker, context);
  const rawId = numberToU64(id, context);

  const sto = new Sto({ ticker, id }, context);

  const { status, end } = await sto.details();

  const now = new Date();

  if (end && end < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The STO has already ended',
    });
  }

  if (freeze) {
    if (status === StoStatus.Frozen) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The STO is already frozen',
      });
    }

    this.addTransaction(txSto.freezeFundraiser, {}, rawTicker, rawId);
  } else {
    if (status === StoStatus.Live) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The STO is already unfrozen',
      });
    }

    if (status === StoStatus.Closed) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The STO is already closed',
      });
    }

    this.addTransaction(txSto.unfreezeFundraiser, {}, rawTicker, rawId);
  }

  return sto;
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<ToggleFreezeStoParams, Sto>,
  { ticker, freeze }: ToggleFreezeStoParams
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenPia, ticker }],
    signerPermissions: {
      transactions: [freeze ? TxTags.sto.FreezeFundraiser : TxTags.sto.UnfreezeFundraiser],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const toggleFreezeSto = new Procedure(prepareToggleFreezeSto, getAuthorization);
