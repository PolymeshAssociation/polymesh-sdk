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

    if (opts) {
      if ('size' in opts) {
        paginationOptions = opts;
      } else {
        ({ canBeIssuedTo } = opts);
      }
    }

    const rawTicker = stringToTicker(ticker, context);
    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
      paginationOpts: paginationOptions,
    });
    const securityToken = new SecurityToken({ ticker }, context);

    let data: { identity: Identity; balance: BigNumber; canBeIssuedTo?: boolean }[] = entries.map(
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

    if (canBeIssuedTo) {
      const areFrozen = await securityToken.transfers.areFrozen();

      if (areFrozen) {
        data = data.map(dataElement => ({ ...dataElement, canBeIssuedTo: false }));
      } else {
        const dataChunks = chunk(data, MAX_CONCURRENT_REQUESTS);

        await P.each(dataChunks, async dataChunk => {
          await Promise.all(
            dataChunk.map(async dataElement => {
              const status = await securityToken.transfers.canMint({
                to: dataElement.identity,
                amount: new BigNumber(1),
              });

              dataElement.canBeIssuedTo = status === TransferStatus.Success;
            })
          );
        });
      }
    }

    return {
      data,
      next,
    };
  }
}
