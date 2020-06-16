import { Identity } from '~/api/entities/Identity';
import { IdentityBalance } from '~/api/entities/types';
import { Namespace } from '~/base';
import { IdentityId } from '~/polkadot';
import { PaginationOptions, ResultSet } from '~/types';
import { balanceToBigNumber, identityIdToString, requestPaginated, stringToTicker } from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Holders related functionality
 */
export class TokenHolders extends Namespace<SecurityToken> {
  /**
   * Retrieve all the token holders with balance
   */
  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<IdentityBalance>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
      paginationOpts,
    });

    const data: IdentityBalance[] = entries.map(([storageKey, balance]) => ({
      identity: new Identity(
        { did: identityIdToString(storageKey.args[1] as IdentityId) },
        context
      ),
      balance: balanceToBigNumber(balance),
    }));

    return {
      data,
      next,
    };
  }
}
