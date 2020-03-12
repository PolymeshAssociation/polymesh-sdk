import { modifyToken, ModifyTokenParams } from '~/api/procedures';
import { Entity, TransactionQueue } from '~/base';
import { Context } from '~/context';

/**
 * Properties that uniquely identify a Security Token
 */
export interface UniqueIdentifiers {
  /**
   * ticker of the security token
   */
  ticker: string;
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
    const { ticker } = identifier as UniqueIdentifiers;

    return typeof ticker === 'string';
  }

  /**
   * ticker of the Security Token
   */
  public ticker: string;

  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { ticker } = identifiers;

    this.ticker = ticker;
  }

  /**
   * Modify some properties of the Security Token
   *
   * @param args.makeDivisible - makes an indivisible token divisible. Only called by the token owner
   */
  public async modify(
    args: Omit<ModifyTokenParams, 'ticker'>
  ): Promise<TransactionQueue<SecurityToken>> {
    // pedir details() de security token y obtener el owner y si ya es divisible.
    /*
    VALIDAR: si es divisible tirar error: 
    VALIDAR: si el usuario no es el owner, tirar error: You must be the owner of the token to make it divisible
    */
    const { ticker } = this;
    return modifyToken.prepare({ ...args, ticker }, this.context);
  }
}
