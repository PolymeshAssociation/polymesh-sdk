import BigNumber from 'bignumber.js';
import { chunk } from 'lodash';

import { Identity } from '~/api/entities/Identity';
import { IdentityBalance } from '~/api/entities/types';
import { Namespace } from '~/base';
import { IdentityId } from '~/polkadot';
import { PaginationOptions, ResultSet, TransferStatus } from '~/types';
import { balanceToBigNumber, identityIdToString, requestPaginated, stringToTicker } from '~/utils';

import { SecurityToken } from './';

/**
 * Handles all Security Token Holders related functionality
 */
export class TokenHolders extends Namespace<SecurityToken> {
  public async get(opts: { pagination: PaginationOptions }): Promise<ResultSet<IdentityBalance>>;

  public async get(opts: { mintStatus: boolean }): Promise<ResultSet<IdentityBalance>>;

  public async get(opts?: {
    pagination: PaginationOptions;
    mintStatus: boolean;
  }): Promise<ResultSet<IdentityBalance>>;

  /**
   * Retrieve all the token holders with balance
   */
  public async get(opts?: {
    pagination?: PaginationOptions;
    mintStatus?: boolean;
  }): Promise<ResultSet<IdentityBalance>> {
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
      paginationOpts: opts?.pagination || undefined,
    });

    let data: IdentityBalance[] = [];

    const securityToken = new SecurityToken({ ticker }, context);

    const areFrozen = opts?.mintStatus ? await securityToken.transfers.areFrozen() : undefined;

    if (opts?.mintStatus && !areFrozen) {
      const entriesChunks = chunk(entries, 10);

      await Promise.all(
        entriesChunks.map(async entriesChunk => {
          const canMint = await Promise.all(
            entriesChunk.map(([storageKey]) => {
              return securityToken.transfers.canMint({
                to: identityIdToString(storageKey.args[1] as IdentityId),
                amount: new BigNumber(1),
              });
            })
          );

          entriesChunk.forEach(([storageKey, balance], index) => {
            data.push({
              identity: new Identity(
                { did: identityIdToString(storageKey.args[1] as IdentityId) },
                context
              ),
              balance: balanceToBigNumber(balance),
              canMint: canMint[index] === TransferStatus.Success,
            });
          });
        })
      );
    } else {
      data = entries.map(([storageKey, balance]) => {
        const entrie = {
          identity: new Identity(
            { did: identityIdToString(storageKey.args[1] as IdentityId) },
            context
          ),
          balance: balanceToBigNumber(balance),
        };
        if (opts?.mintStatus) {
          return { ...entrie, canMint: false };
        }
        return entrie;
      });
    }

    return {
      data,
      next,
    };
  }
}
