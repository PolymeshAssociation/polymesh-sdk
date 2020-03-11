import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/base';
import { Context } from '~/context';
import { balanceToBigNumber } from '~/utils';

import { SecurityTokenDetails } from './types';

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
   * Retrieve the security token's name, total supply, whether is divisible or not and the identity owner
   */
  public async details(): Promise<SecurityTokenDetails> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
      context,
    } = this;

    /* eslint-disable @typescript-eslint/camelcase */
    const { name, total_supply, divisible, owner_did } = await asset.tokens(ticker);

    return {
      name: name.toString(),
      totalSupply: balanceToBigNumber(total_supply),
      isDivisible: divisible.valueOf(),
      owner: new Identity({ did: owner_did.toString() }, context),
    };
    /* eslint-enable @typescript-eslint/camelcase */
  }
}
