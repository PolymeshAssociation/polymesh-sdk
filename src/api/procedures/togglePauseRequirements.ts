import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, Role, RoleType } from '~/types';
import { boolToBoolean, stringToTicker } from '~/utils';

export interface TogglePauseRequirementsParams {
  pause: boolean;
}

/**
 * @hidden
 */
export type Params = TogglePauseRequirementsParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareTogglePauseRequirements(
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

  const { is_paused: isPaused } = await query.complianceManager.assetCompliances(rawTicker);

  if (pause === boolToBoolean(isPaused)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Requirements are already ${isPaused ? '' : 'un'}paused`,
    });
  }

  this.addTransaction(
    pause ? tx.complianceManager.pauseAssetCompliance : tx.complianceManager.resumeAssetCompliance,
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
export const togglePauseRequirements = new Procedure(
  prepareTogglePauseRequirements,
  getRequiredRoles
);
