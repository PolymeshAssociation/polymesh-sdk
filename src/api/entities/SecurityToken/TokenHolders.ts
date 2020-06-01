import { Identity } from '~/api/entities/Identity';
import { IdentityBalance } from '~/api/entities/types';
import { Namespace } from '~/base';
import { IdentityId } from '~/polkadot';
import { balanceToBigNumber, identityIdToString, stringToTicker } from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Holders related functionality
 */
export class TokenHolders extends Namespace<SecurityToken> {
  /**
   * Retrieve all the token holders with balance
   */
  public async get(): Promise<IdentityBalance[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    const entries = await query.asset.balanceOf.entries(stringToTicker(ticker, context));
    const balances: IdentityBalance[] = [];

    entries.forEach(([storageKey, balance]) => {
      balances.push({
        identity: new Identity(
          { did: identityIdToString(storageKey.args[1] as IdentityId) },
          context
        ),
        balance: balanceToBigNumber(balance),
      });
    });

    return balances;
  }
}
