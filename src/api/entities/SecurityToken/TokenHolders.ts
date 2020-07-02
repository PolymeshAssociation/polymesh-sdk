import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { chunk } from 'lodash';

import { Identity } from '~/api/entities/Identity';
import { IdentityBalance } from '~/api/entities/types';
import { Namespace } from '~/base';
import { IdentityId } from '~/polkadot';
import { PaginationOptions, ResultSet, TransferStatus } from '~/types';
import { balanceToBigNumber, identityIdToString, requestPaginated, stringToTicker } from '~/utils';
import { MAX_CONCURRENT_REQUESTS } from '~/utils/constants';

import { SecurityToken } from './';
import { TokenHolderOptions, TokenHolderProperties } from './types';

/**
 * Handles all Security Token Holders related functionality
 */
export class TokenHolders extends Namespace<SecurityToken> {
  public async get(
    opts: Pick<TokenHolderOptions, 'canBeIssuedTo'>,
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<IdentityBalance & Pick<TokenHolderProperties, 'canBeIssuedTo'>>>;

  public async get(paginationOpts?: PaginationOptions): Promise<ResultSet<IdentityBalance>>;

  /**
   * Retrieve all the token holders with balance
   *
   * @param opts - object that represents whether extra properties should be fetched for each token holder
   */
  public async get(
    opts?: Pick<TokenHolderOptions, 'canBeIssuedTo'> | PaginationOptions,
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<IdentityBalance & Partial<TokenHolderProperties>>> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
      parent: { ticker },
    } = this;

    let paginationOptions = paginationOpts;
    let canBeIssuedTo: boolean | undefined;
    let transferStatuses: TransferStatus[] = [];

    if (opts) {
      if ('size' in opts) {
        pagination = opts;
      } else {
        ({ canBeIssuedTo } = opts);
      }
    }

    const rawTicker = stringToTicker(ticker, context);
    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
      paginationOpts: pagination || paginationOpts,
    });
    const securityToken = new SecurityToken({ ticker }, context);
    const areFrozen = await securityToken.transfers.areFrozen();

    if (canBeIssuedTo) {
      if (!areFrozen) {
        const entriesChunks = chunk(entries, MAX_CONCURRENT_REQUESTS);

        await P.each(entriesChunks, async entriesChunk => {
          transferStatuses = await Promise.all(
            entriesChunk.map(([storageKey]) =>
              securityToken.transfers.canMint({
                to: identityIdToString(storageKey.args[1] as IdentityId),
                amount: new BigNumber(1),
              })
            )
          );
        });
      }
    }

    const data = entries.map(([storageKey, balance], i) => {
      const entry = {
        identity: new Identity(
          { did: identityIdToString(storageKey.args[1] as IdentityId) },
          context
        ),
        balance: balanceToBigNumber(balance),
      };
      if (canBeIssuedTo) {
        if (areFrozen) {
          return { ...entry, canBeIssuedTo: false };
        }
        return { ...entry, canBeIssuedTo: transferStatuses[i] === TransferStatus.Success };
      }
      return entry;
    });

    return {
      data,
      next,
    };
  }
}
