import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { boolToBoolean, stringToTicker } from '~/utils/conversion';

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
export function getAuthorization(
  this: Procedure<Params, SecurityToken>,
  { ticker, pause }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenOwner, ticker }],
    signerPermissions: {
      transactions: [
        pause
          ? TxTags.complianceManager.PauseAssetCompliance
          : TxTags.complianceManager.ResumeAssetCompliance,
      ],
      tokens: [new SecurityToken({ ticker }, this.context)],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const togglePauseRequirements = (): Procedure<Params, SecurityToken> =>
  new Procedure(prepareTogglePauseRequirements, getAuthorization);
