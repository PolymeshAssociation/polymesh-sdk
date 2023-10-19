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
import { investmentsQuery } from '~/middleware/queries';
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
import { bigNumberToU64, fundraiserToOfferingDetails, stringToTicker } from '~/utils/conversion';
import { calculateNextKey, createProcedureMethod, toHumanReadable } from '~/utils/internal';

import { Investment, OfferingDetails } from './types';

export interface UniqueIdentifiers {
  id: BigNumber;
  ticker: string;
}

export interface HumanReadable {
  id: string;
  ticker: string;
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
    const { id, ticker } = identifier as UniqueIdentifiers;

    return id instanceof BigNumber && typeof ticker === 'string';
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

    const { id, ticker } = identifiers;

    this.id = id;
    this.asset = new FungibleAsset({ ticker }, context);

    this.freeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { ticker, id, freeze: true }],
        voidArgs: true,
      },
      context
    );
    this.unfreeze = createProcedureMethod(
      {
        getProcedureAndArgs: () => [toggleFreezeOffering, { ticker, id, freeze: false }],
        voidArgs: true,
      },
      context
    );
    this.close = createProcedureMethod(
      { getProcedureAndArgs: () => [closeOffering, { ticker, id }], voidArgs: true },
      context
    );
    this.modifyTimes = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyOfferingTimes, { ticker, id, ...args }] },
      context
    );
    this.invest = createProcedureMethod(
      { getProcedureAndArgs: args => [investInOffering, { ticker, id, ...args }] },
      context
    );
  }

  /**
   * Retrieve the Offering's details
   *
   * @note can be subscribed to
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
      asset: { ticker },
      context,
    } = this;

    const assembleResult = (
      rawFundraiser: Option<PalletStoFundraiser>,
      rawName: Option<Bytes>
    ): OfferingDetails => {
      return fundraiserToOfferingDetails(rawFundraiser.unwrap(), rawName.unwrap(), context);
    };

    const rawTicker = stringToTicker(ticker, context);
    const rawU64 = bigNumberToU64(id, context);

    const fetchName = (): Promise<Option<Bytes>> => sto.fundraiserNames(rawTicker, rawU64);

    if (callback) {
      const fundraiserName = await fetchName();
      return sto.fundraisers(rawTicker, rawU64, fundraiserData => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- callback errors should be handled by the caller
        callback(assembleResult(fundraiserData, fundraiserName));
      });
    }

    const [fundraiser, name] = await Promise.all([sto.fundraisers(rawTicker, rawU64), fetchName()]);

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
      asset: { ticker },
    } = this;

    const { size, start } = opts;

    const {
      data: {
        investments: { nodes, totalCount },
      },
    } = await context.queryMiddleware<Ensured<Query, 'investments'>>(
      investmentsQuery(
        {
          stoId: id.toNumber(),
          offeringToken: ticker,
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
    const {
      asset: { ticker },
      id,
      context,
    } = this;

    const fundraiser = await context.polymeshApi.query.sto.fundraisers(
      stringToTicker(ticker, context),
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
      id,
    });
  }
}
