import { u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { Context, Entity, FungibleAsset, Identity } from '~/internal';
import { IdentityBalance, PaginationOptions, ResultSet } from '~/types';
import { tuple } from '~/types/utils';
import {
  assetToMeshAssetId,
  balanceToBigNumber,
  bigNumberToU64,
  identityIdToString,
  momentToDate,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { getIdentity, requestPaginated, toHumanReadable } from '~/utils/internal';

export interface UniqueIdentifiers {
  id: BigNumber;
  assetId: string;
}

export interface HumanReadable {
  id: string;
  /**
   * @deprecated in favour of `assetId`
   */
  ticker: string;
  assetId: string;
}

/**
 * Represents a snapshot of the Asset's holders and their respective balances
 *   at a certain point in time
 */
export class Checkpoint extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * Checkpoint identifier number
   */
  public id: BigNumber;

  /**
   * Asset whose balances are being recorded in this Checkpoint
   */
  public asset: FungibleAsset;

  /**
   * @hidden
   */
  public constructor(identifiers: UniqueIdentifiers, context: Context) {
    super(identifiers, context);

    const { id, assetId } = identifiers;

    this.id = id;
    this.asset = new FungibleAsset({ assetId }, context);
  }

  /**
   * Retrieve the Asset's total supply at this checkpoint
   */
  public async totalSupply(): Promise<BigNumber> {
    const { context, asset, id } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);
    const rawSupply = await context.polymeshApi.query.checkpoint.totalSupply(
      rawAssetId,
      bigNumberToU64(id, context)
    );

    return balanceToBigNumber(rawSupply);
  }

  /**
   * Retrieve this Checkpoint's creation date
   */
  public async createdAt(): Promise<Date> {
    const { context, asset, id } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const creationTime = await context.polymeshApi.query.checkpoint.timestamps(
      rawAssetId,
      bigNumberToU64(id, context)
    );

    return momentToDate(creationTime);
  }

  /**
   * Retrieve all Asset Holder balances at this Checkpoint
   *
   * @note supports pagination
   * @note current Asset holders who didn't hold any tokens when the Checkpoint was created will be listed with a balance of 0.
   * This arises from a chain storage optimization and pagination. @see {@link balance} for a more detailed explanation of the logic
   */
  public async allBalances(
    paginationOpts?: PaginationOptions
  ): Promise<ResultSet<IdentityBalance>> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint, asset },
        },
      },
      context,
      asset: assetEntity,
      id,
    } = this;

    const rawAssetId = assetToMeshAssetId(assetEntity, context);

    // Get one page of current Asset balances
    const { entries, lastKey: next } = await requestPaginated(asset.balanceOf, {
      arg: rawAssetId,
      paginationOpts,
    });

    const currentDidBalances: { did: string; balance: BigNumber }[] = [];
    const balanceUpdatesMultiParams: [
      PolymeshPrimitivesAssetAssetId,
      PolymeshPrimitivesIdentityId
    ][] = [];

    // Prepare the query for balance updates. Push to currentDidBalances to be used if there are no updates for the balance
    entries.forEach(([storageKey, balance]) => {
      const {
        args: [, identityId],
      } = storageKey;
      currentDidBalances.push({
        did: identityIdToString(identityId),
        balance: balanceToBigNumber(balance),
      });
      balanceUpdatesMultiParams.push(tuple(rawAssetId, identityId));
    });

    // Query for balance updates
    const rawBalanceUpdates = await checkpoint.balanceUpdates.multi(balanceUpdatesMultiParams);

    const checkpointBalanceMultiParams: {
      did: string;
      params: [(PolymeshPrimitivesAssetAssetId | u64)[], PolymeshPrimitivesIdentityId];
    }[] = [];
    const currentIdentityBalances: IdentityBalance[] = [];

    rawBalanceUpdates.forEach((rawCheckpointIds, index) => {
      const firstUpdatedCheckpoint = rawCheckpointIds.find(checkpointId =>
        u64ToBigNumber(checkpointId).gte(id)
      );
      const { did, balance } = currentDidBalances[index];
      if (firstUpdatedCheckpoint) {
        // If a balance update has occurred for the Identity since the desired Checkpoint, then query Checkpoint storage directly
        checkpointBalanceMultiParams.push({
          did,
          params: tuple([rawAssetId, firstUpdatedCheckpoint], stringToIdentityId(did, context)),
        });
      } else {
        // Otherwise use the current balance
        currentIdentityBalances.push({
          identity: new Identity({ did }, context),
          balance,
        });
      }
    });

    // Query for Identities with balance updates
    const checkpointBalances = await checkpoint.balance.multi(
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
   * Retrieve the balance of a specific Asset Holder Identity at this Checkpoint
   *
   * @param args.identity - defaults to the signing Identity
   * @note A checkpoint only records balances when they change. The implementation is to query for all balance updates for [ticker, did] pair.
   * If no balance updates have happened since the Checkpoint has been created, then the storage will not have an entry for the user. Instead the current balance should be used.
   * The balance is stored only when the Identity makes a transaction after a Checkpoint is created. This helps keep storage usage to a minimum
   */
  public async balance(args?: { identity: string | Identity }): Promise<BigNumber> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      asset,
      id,
    } = this;

    const identity = await getIdentity(args?.identity, context);

    const rawAssetId = assetToMeshAssetId(asset, context);

    const rawIdentityId = stringToIdentityId(identity.did, context);

    const balanceUpdates = await checkpoint.balanceUpdates(rawAssetId, rawIdentityId);
    const firstUpdatedCheckpoint = balanceUpdates.find(checkpointId =>
      u64ToBigNumber(checkpointId).gte(id)
    );

    /*
     * If there has been a balance change since the Checkpoint was created, then query the Checkpoint storage.
     * Otherwise, the storage will not have an entry for the Identity. The current balance should be queried instead.
     */
    let balance: BigNumber;
    if (firstUpdatedCheckpoint) {
      const rawBalance = await checkpoint.balance(
        tuple(rawAssetId, firstUpdatedCheckpoint),
        rawIdentityId
      );
      balance = balanceToBigNumber(rawBalance);
    } else {
      // if no balanceUpdate has occurred since the Checkpoint has been created, then the current balance should be used. The Checkpoint storage will not have an entry
      balance = await identity.getAssetBalance({ assetId: asset.id });
    }

    return balance;
  }

  /**
   * Determine whether this Checkpoint exists on chain
   */
  public async exists(): Promise<boolean> {
    const {
      context: {
        polymeshApi: {
          query: { checkpoint },
        },
      },
      context,
      asset,
      id,
    } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const rawCheckpointId = await checkpoint.checkpointIdSequence(rawAssetId);

    return id.lte(u64ToBigNumber(rawCheckpointId));
  }

  /**
   * Return the Checkpoint's ticker and identifier
   */
  public toHuman(): HumanReadable {
    const { asset, id } = this;

    return toHumanReadable({
      ticker: asset,
      assetId: asset,
      id,
    });
  }
}
