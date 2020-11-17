import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';

import { Identity, Namespace, SecurityToken } from '~/api/entities';
import { IdentityBalance } from '~/api/entities/types';
import { PaginationOptions, ResultSet } from '~/types';
import { balanceToBigNumber, identityIdToString, stringToTicker } from '~/utils/conversion';
import { requestPaginated } from '~/utils/internal';

/**
 * Handles all Security Token Holders related functionality
 */
export class TokenHolders extends Namespace<SecurityToken> {
  /**
   * Retrieve all the token holders with balance
   *
   * @note supports pagination
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

    const data: { identity: Identity; balance: BigNumber }[] = entries.map(
      ([storageKey, balance]) => {
        const entry = {
          identity: new Identity(
            { did: identityIdToString(storageKey.args[1] as IdentityId) },
            context
          ),
          balance: balanceToBigNumber(balance),
        };
        return entry;
      }
    );

    return {
      data,
      next,
    };
  }
}
