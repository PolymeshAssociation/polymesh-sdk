import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { IdentityId } from 'polymesh-types/types';

import { Context, Entity, Identity } from '~/internal';
import { IdentityBalance, PaginationOptions, ResultSet } from '~/types';
import {
  balanceToBigNumber,
  identityIdToString,
  momentToDate,
  numberToU64,
  stringToIdentityId,
  stringToTicker,
} from '~/utils/conversion';
import { getDid, requestPaginated } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

/**
 * Represents a snapshot of the Security Token's holders and their respective balances
 *   at a certain point in time
 */
export class Checkpoint extends Entity<UniqueIdentifiers> {
  /**
   * @hidden
   * Check if a value is of type [[UniqueIdentifiers]]
   */
  public static isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
  }

  /**
   * checkpoint identifier number
   */
  public id: BigNumber;

  /**
   * ticker of the Security Token whose balances are being recorded
   */
  public ticker: string;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, ticker } = identifiers;

    this.id = id;
    this.ticker = ticker;
  }

  /**
   * Retrieve the Security Token's total supply at this checkpoint
   */
  public async totalSupply(): Promise<BigNumber> {
    const { context, ticker, id } = this;

    const rawSupply = await context.polymeshApi.query.checkpoint.totalSupply(
      stringToTicker(ticker, context),
      numberToU64(id, context)
    );

    return balanceToBigNumber(rawSupply);
  }

  /**
   * Retrieve this Checkpoint's creation date
   */
  public async createdAt(): Promise<Date> {
    const { context, ticker, id } = this;

    const creationTime = await context.polymeshApi.query.checkpoint.timestamps(
      stringToTicker(ticker, context),
      numberToU64(id, context)
    );

    return momentToDate(creationTime);
  }

  /**
   * Retrieve all Tokenholder balances at this Checkpoint
   *
   * @note supports pagination
   */
  public async allBalances(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<IdentityBalance>> {
    const {
      context,
      context: {
        polymeshApi: { query },
      },
      ticker,
      id,
    } = this;

    const rawTicker = stringToTicker(ticker, context);
    const rawU64 = numberToU64(id, context);

    // getting all the identities holders for the security token
    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
      paginationOpts,
    });

    const rawIdentitiesId: IdentityId[] = [];

    // composing the data to be returned before checking checkout balance
    const identitiesBalance: { identity: Identity; balance: BigNumber }[] = entries.map(
      ([storageKey, balance]) => {
        rawIdentitiesId.push(storageKey.args[1]);
        return {
          identity: new Identity({ did: identityIdToString(storageKey.args[1]) }, context),
          balance: balanceToBigNumber(balance),
        };
      }
    );

    // getting all the checkpoint balances of the security token holders
    const checkpointsBalance = await query.checkpoint.balance.multi<Balance>(
      rawIdentitiesId.map(identityId => [[rawTicker, rawU64], identityId])
    );

    const data = await P.map(checkpointsBalance, async (rawCheckpointBalance, i) => {
      const { balance, identity } = identitiesBalance[i];

      let checkpointBalance = balanceToBigNumber(rawCheckpointBalance);

      if (checkpointBalance.isZero()) {
        const sizeBalance = await query.checkpoint.balance.size(
          [rawTicker, rawU64],
          stringToIdentityId(identity.did, context)
        );

        if (sizeBalance.isZero()) {
          checkpointBalance = balance;
        }
      }

      return {
        identity,
        balance: checkpointBalance,
      };
    });

    return {
      data,
      next,
    };
  }

  /**
   * Retrieve the balance of a specific Tokenholder Identity at this Checkpoint
   *
   * @param args.identity - defaults to the current Identity
   */
  public async balance(args?: { identity: string | Identity }): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      ticker,
      id,
    } = this;

    const did = await getDid(args?.identity, context);

    const identity = new Identity({ did }, context);

    const rawTicker = stringToTicker(ticker, context);
    const rawU64 = numberToU64(id, context);
    const rawIdentityId = stringToIdentityId(did, context);

    const [rawBalance, sizeBalance, tokenBalance] = await Promise.all([
      checkpoint.balance([rawTicker, rawU64], rawIdentityId),
      checkpoint.balance.size([rawTicker, rawU64], rawIdentityId),
      identity.getTokenBalance({ ticker }),
    ]);

    const balance = balanceToBigNumber(rawBalance);

    if (balance.isZero() && sizeBalance.isZero()) {
      return tokenBalance;
    }

    return balance;
  }
}
