import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/base';
import { Context } from '~/context';
import {
  balanceToBigNumber,
  boolToBoolean,
  identityIdToString,
  tickerToDid,
  tokenNameToString,
} from '~/utils';

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
   * identity id of the Security Token
   */
  public did: string;

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
    this.did = tickerToDid(ticker);
  }

  /**
   * Retrieve the Security Token's name, total supply, whether it is divisible or not and the identity of the owner
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
      name: tokenNameToString(name),
      totalSupply: balanceToBigNumber(total_supply),
      isDivisible: boolToBoolean(divisible),
      owner: new Identity({ did: identityIdToString(owner_did) }, context),
    };
    /* eslint-enable @typescript-eslint/camelcase */
  }
}
