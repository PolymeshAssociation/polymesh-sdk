
import {
  Context,
  CustomPermissionGroup,
  Identity,
  KnownPermissionGroup,
  PolymeshError,
  setPermissionGroup,
  SetPermissionGroupParams,
} from '~/internal';
import { ErrorCode, ProcedureMethod } from '~/types';
import {
  agentGroupToPermissionGroup,
  stringToIdentityId,
  stringToTicker
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

export interface UniqueIdentifiers {
  did: string;
  ticker: string;
}

/**
 * Represents an agent for a Security Token
 */
export class Agent extends Identity {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { did, ticker } = identifier as UniqueIdentifiers;

    return typeof did === 'string' && typeof ticker === 'string';
  }

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;

    this.setPermissionGroup = createProcedureMethod(
      { getProcedureAndArgs: args => [setPermissionGroup, { agent: this, ...args }] },
      context
    );
  }

  /**
   * Remove an external agent from this Security Token
   */
  public setPermissionGroup: ProcedureMethod<SetPermissionGroupParams, void>;

  /**
   * Retrieve the agent group associated with this Agent
   */
  public async getPermissionGroup(): Promise<CustomPermissionGroup | KnownPermissionGroup> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      context,
      ticker,
      did,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const rawGroupPermissions = await externalAgents.groupOfAgent(rawTicker, rawIdentityId);

    if (rawGroupPermissions.isNone) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'This Identity is no longer an Agent for this Security Token',
      });
    }
    const agentGroup = rawGroupPermissions.unwrap();

    return agentGroupToPermissionGroup(agentGroup, ticker, context);
  }
}
