import { Entity } from '~/base';
import { Context } from '~/context';

/**
 * Properties that uniquely identify a Security Token
 */
export interface UniqueIdentifiers {
  /**
   * symbol of the security token
   */
  symbol: string;
}

/**
 * Class used to manage all the Security Token functionality
 */
export class SecurityToken extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { symbol } = identifier as UniqueIdentifiers;

    return typeof symbol === 'string';
  }

  public symbol: string;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { symbol } = identifiers;

    this.symbol = symbol;
  }
}
