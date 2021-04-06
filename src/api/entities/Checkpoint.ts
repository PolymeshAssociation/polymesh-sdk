import { Vec } from '@polkadot/types/codec';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { CheckpointId, IdentityId, Ticker } from 'polymesh-types/types';

import { Context, Entity, Identity } from '~/internal';
import { IdentityBalance, PaginationOptions, ResultSet } from '~/types';
import { tuple } from '~/types/utils';
import {
  balanceToBigNumber,
  identityIdToString,
  momentToDate,
  numberToU64,
  stringToIdentityId,
  stringToTicker,
  u64ToBigNumber,
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
      context: {
        polymeshApi: { query },
      },
      context,
      ticker,
      id,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const { entries, lastKey: next } = await requestPaginated(query.asset.balanceOf, {
      arg: rawTicker,
      paginationOpts,
    });

    const currentDidBalances: { did: string; balance: BigNumber }[] = [];
    const balanceUpdatesMultiParams: [Ticker, IdentityId][] = [];

    entries.forEach(([storageKey, balance]) => {
      const {
        args: [, identityId],
      } = storageKey;
      currentDidBalances.push({
        did: identityIdToString(identityId),
        balance: balanceToBigNumber(balance),
      });
      balanceUpdatesMultiParams.push(tuple(rawTicker, identityId));
    });

    const rawBalanceUpdates = await query.checkpoint.balanceUpdates.multi<Vec<CheckpointId>>(
      balanceUpdatesMultiParams
    );

    const checkpointBalanceMultiParams: {
      did: string;
      params: [(Ticker | CheckpointId)[], IdentityId];
    }[] = [];
    const currentIdentityBalances: IdentityBalance[] = [];

    rawBalanceUpdates.forEach((rawCheckpointIds, index) => {
      const firstUpdatedCheckpoint = rawCheckpointIds.find(checkpointId =>
        u64ToBigNumber(checkpointId).gte(id)
      );
      const { did, balance } = currentDidBalances[index];
      if (firstUpdatedCheckpoint) {
        checkpointBalanceMultiParams.push({
          did,
          params: tuple([rawTicker, firstUpdatedCheckpoint], stringToIdentityId(did, context)),
        });
      } else {
        currentIdentityBalances.push({
          identity: new Identity({ did }, context),
          balance,
        });
      }
    });

    const checkpointBalances = await query.checkpoint.balance.multi<Balance>(
      checkpointBalanceMultiParams.map(({ params }) => params)
    );

    return {
      data: [
        ...checkpointBalanceMultiParams.map(({ did }, index) => ({
          identity: new Identity({ did }, context),
          balance: balanceToBigNumber(checkpointBalances[index]),
        })),
        ...currentIdentityBalances,
      ],
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
    const rawIdentityId = stringToIdentityId(did, context);

    const balanceUpdate = await checkpoint.balanceUpdates(rawTicker, rawIdentityId);
    const firstUpdatedCheckpoint = balanceUpdate.find(checkpointId =>
      u64ToBigNumber(checkpointId).gte(id)
    );

    let balance: BigNumber;
    if (firstUpdatedCheckpoint) {
      const rawBalance = await checkpoint.balance(
        tuple(rawTicker, firstUpdatedCheckpoint),
        rawIdentityId
      );
      balance = balanceToBigNumber(rawBalance);
    } else {
      balance = await identity.getTokenBalance({ ticker });
    }

    return balance;
  }
}
