import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, Role, RoleType } from '~/types';
import { boolToBoolean, stringToTicker } from '~/utils';

export interface TogglePauseRulesParams {
  pause: boolean;
}

/**
 * @hidden
 */
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

  const { is_paused: isPaused } = await query.complianceManager.assetRulesMap(rawTicker);

  if (pause === boolToBoolean(isPaused)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Rules are already ${isPaused ? '' : 'un'}paused`,
    });
  }

  this.addTransaction(
    pause ? tx.complianceManager.pauseAssetRules : tx.complianceManager.resumeAssetRules,
    {},
    rawTicker
  );

  return new SecurityToken({ ticker }, context);
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const togglePauseRules = new Procedure(prepareTogglePauseRules, getRequiredRoles);
