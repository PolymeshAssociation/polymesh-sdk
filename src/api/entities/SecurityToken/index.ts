import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { Entity } from '~/base';
import { Context } from '~/context';
import { balanceToBigNumber } from '~/utils';

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
   * Retrieve the name of the Security Token
   */
  public async name(): Promise<string> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    const { name } = await asset.tokens(ticker);

    return name.toString();
  }

  /**
   * Retrieve the total supply of the Security Token
   */
  public async totalSupply(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    // eslint-disable-next-line @typescript-eslint/camelcase
    const { total_supply } = await asset.tokens(ticker);

    return balanceToBigNumber(total_supply);
  }

  /**
   * Retrieve whether or not the Security Token is divisible
   */
  public async isDivisible(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { asset },
        },
      },
      ticker,
    } = this;

    const { divisible } = await asset.tokens(ticker);

    return divisible.valueOf();
  }

  /**
   * Retrieve the identity owner of the Security Token
   */
  public async owner(): Promise<Identity> {
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
    const { owner_did } = await asset.tokens(ticker);

    return new Identity({ did: owner_did.toString() }, context);
    /* eslint-enable @typescript-eslint/camelcase */
  }
}
