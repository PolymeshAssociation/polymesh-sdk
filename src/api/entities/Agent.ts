import { Context, Identity, setPermissionGroup, SetPermissionGroupParams } from '~/internal';
import { ProcedureMethod } from '~/types';
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
}
