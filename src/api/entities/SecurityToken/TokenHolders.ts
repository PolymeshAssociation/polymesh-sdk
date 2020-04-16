import BigNumber from 'bignumber.js';

import { Identity } from '~/api/entities/Identity';
import { Namespace } from '~/base';
import { IdentityId } from '~/polkadot';
import { balanceToBigNumber, identityIdToString } from '~/utils';

import { SecurityToken } from './';

/**
 * Represents the balance of a token holder
 */
export interface IdentityBalance {
  identity: Identity;
  balance: BigNumber;
}

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

    const entries = await query.asset.balanceOf.entries(ticker);
    const IdentityBalance: IdentityBalance[] = [];

    entries.forEach(([storageKey, balance]) => {
      IdentityBalance.push({
        identity: new Identity(
          { did: identityIdToString(storageKey.args[1] as IdentityId) },
          context
        ),
        balance: balanceToBigNumber(balance),
      });
    });

    return IdentityBalance;
  }
}
