import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { stringToTicker } from '~/utils';

export interface TogglePauseRulesParams {
  pause: boolean;
}

export type Params = TogglePauseRulesParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareTogglePauseRules(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: { query, tx },
    },
    context,
  } = this;
  const { ticker, pause } = args;

  const rawTicker = stringToTicker(ticker, context);

  const { is_paused: isPaused } = await query.generalTm.assetRulesMap(rawTicker);

  if (pause) {
    if (isPaused) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token rules are already paused',
      });
    }
    this.addTransaction(tx.generalTm.pauseAssetRules, {}, rawTicker);
  } else {
    if (!isPaused) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The Security Token rules are already unpaused',
      });
    }
    this.addTransaction(tx.generalTm.resumeAssetRules, {}, rawTicker);
  }

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

export const togglePauseRules = new Procedure(prepareTogglePauseRules, getRequiredRoles);
