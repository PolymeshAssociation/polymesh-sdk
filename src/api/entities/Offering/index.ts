import { Bytes, Option } from '@polkadot/types';
import { PalletStoFundraiser } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  closeOffering,
  Context,
  Entity,
  FungibleAsset,
  Identity,
  investInOffering,
  modifyOfferingTimes,
  toggleFreezeOffering,
} from '~/internal';
import { investmentsQuery } from '~/middleware/queries/stos';
import { Query } from '~/middleware/types';
import {
  InvestInOfferingParams,
  ModifyOfferingTimesParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  ResultSet,
  SubCallback,
  UnsubCallback,
} from '~/types';
import { Ensured } from '~/types/utils';
import {
  assetToMeshAssetId,
  bigNumberToU64,
  fundraiserToOfferingDetails,
} from '~/utils/conversion';
import {
  calculateNextKey,
  createProcedureMethod,
  getAssetIdForMiddleware,
  getLatestSqVersion,
  toHumanReadable,
} from '~/utils/internal';

import { Investment, OfferingDetails } from './types';

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
 * Represents an Asset Offering in the Polymesh blockchain
 */
export class Offering extends Entity<UniqueIdentifiers, HumanReadable> {
  /**
   * @hidden
   * Check if a value is of type {@link UniqueIdentifiers}
   */
  public static override isUniqueIdentifiers(identifier: unknown): identifier is UniqueIdentifiers {
    const { id, assetId } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof assetId === 'string';
  }

  /**
   * identifier number of the Offering
   */
  public id: BigNumber;

  /**
   * Asset being offered
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

    this.freeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { asset: this.asset, id, freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { asset: this.asset, id, freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.close = createProcedureMethod(
      { getProcedureAndArgs: () => [closeOffering, { asset: this.asset, id }], voidArgs: true },
      context
    );
    this.modifyTimes = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyOfferingTimes, { asset: this.asset, id, ...args }] },
      context
    );
    this.invest = createProcedureMethod(
      { getProcedureAndArgs: args => [investInOffering, { asset: this.asset, id, ...args }] },
      context
    );
  }

  /**
   * Retrieve the Offering's details
   *
   * @note can be subscribed to, if connected to node using a web socket
   */
  public details(): Promise<OfferingDetails>;
  public details(callback: SubCallback<OfferingDetails>): Promise<UnsubCallback>;

  // eslint-disable-next-line require-jsdoc
  public async details(
    callback?: SubCallback<OfferingDetails>
  ): Promise<OfferingDetails | UnsubCallback> {
    const {
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
      id,
      asset,
      context,
    } = this;

    const assembleResult = (
      rawFundraiser: Option<PalletStoFundraiser>,
      rawName: Option<Bytes>
    ): OfferingDetails => {
      return fundraiserToOfferingDetails(rawFundraiser.unwrap(), rawName.unwrap(), context);
    };

    const rawAssetId = assetToMeshAssetId(asset, context);
    const rawU64 = bigNumberToU64(id, context);

    const fetchName = (): Promise<Option<Bytes>> => sto.fundraiserNames(rawAssetId, rawU64);

    if (callback) {
      context.assertSupportsSubscription();

      const fundraiserName = await fetchName();
      return sto.fundraisers(rawAssetId, rawU64, fundraiserData => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(fundraiserData, fundraiserName));
      });
    }

    const [fundraiser, name] = await Promise.all([
      sto.fundraisers(rawAssetId, rawU64),
      fetchName(),
    ]);

    return assembleResult(fundraiser, name);
  }

  /**
   * Close the Offering
   */
  public close: NoArgsProcedureMethod<void>;

  /**
   * Freeze the Offering
   */
  public freeze: NoArgsProcedureMethod<Offering>;

  /**
   * Unfreeze the Offering
   */
  public unfreeze: NoArgsProcedureMethod<Offering>;

  /**
   * Modify the start/end time of the Offering
   *
   * @throws if:
   *   - Trying to modify the start time on an Offering that already started
   *   - Trying to modify anything on an Offering that already ended
   *   - Trying to change start or end time to a past date
   */
  public modifyTimes: ProcedureMethod<ModifyOfferingTimesParams, void>;

  /**
   * Invest in the Offering
   *
   * @note required roles:
   *   - Purchase Portfolio Custodian
   *   - Funding Portfolio Custodian
   */
  public invest: ProcedureMethod<InvestInOfferingParams, void>;

  /**
   * Retrieve all investments made on this Offering
   *
   * @param opts.size - page size
   * @param opts.start - page offset
   *
   * @note supports pagination
   * @note uses the middleware V2
   */
  public async getInvestments(
    opts: {
      size?: BigNumber;
      start?: BigNumber;
    } = {}
  ): Promise<ResultSet<Investment>> {
    const {
      context,
      id,
      asset: { id: assetId },
    } = this;

    const latestSqVersion = await getLatestSqVersion(context);
    const middlewareAssetId = await getAssetIdForMiddleware(assetId, latestSqVersion, context);

    const { size, start } = opts;

    const {
      data: {
        investments: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'investments'>>(
      investmentsQuery(
        {
          stoId: id.toNumber(),
          offeringToken: middlewareAssetId,
        },
        size,
        start
      )
    );

    const count = new BigNumber(totalCount);

    const data = nodes.map(({ investorId: did, offeringTokenAmount, raiseTokenAmount }) => ({
      investor: new Identity({ did }, context),
      soldAmount: new BigNumber(offeringTokenAmount).shiftedBy(-6),
      investedAmount: new BigNumber(raiseTokenAmount).shiftedBy(-6),
    }));

    const next = calculateNextKey(count, data.length, start);

    return {
      data,
      next,
      count,
    };
  }

  /**
   * Determine whether this Offering exists on chain
   */
  public async exists(): Promise<boolean> {
    const { asset, id, context } = this;

    const rawAssetId = assetToMeshAssetId(asset, context);

    const fundraiser = await context.polymeshApi.query.sto.fundraisers(
      rawAssetId,
      bigNumberToU64(id, context)
    );

    return fundraiser.isSome;
  }

  /**
   * Return the Offering's ID and Asset ticker
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
