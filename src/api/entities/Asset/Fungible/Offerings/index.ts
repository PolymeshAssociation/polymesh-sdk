import BigNumber from 'bignumber.js';
import { remove } from 'lodash';

import {
  Context,
  FungibleAsset,
  launchOffering,
  Namespace,
  Offering,
  PolymeshError,
} from '~/internal';
import {
  ErrorCode,
  LaunchOfferingParams,
  OfferingStatus,
  OfferingWithDetails,
  ProcedureMethod,
} from '~/types';
import {
  assetToMeshAssetId,
  fundraiserToOfferingDetails,
  u64ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Asset Offering related functionality
 */
export class Offerings extends Namespace<FungibleAsset> {
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.launch = createProcedureMethod(
      { getProcedureAndArgs: args => [launchOffering, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Launch an Asset Offering
   *
   * @note required roles:
   *   - Offering Portfolio Custodian
   *   - Raising Portfolio Custodian
   */
  public launch: ProcedureMethod<LaunchOfferingParams, Offering>;

  /**
   * Retrieve a single Offering associated to this Asset by its ID
   *
   * @throws if there is no Offering with the passed ID
   */
  public async getOne(args: { id: BigNumber }): Promise<Offering> {
    const { parent, context } = this;
    const { id } = args;
    const offering = new Offering({ assetId: parent.id, id }, context);

    const exists = await offering.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The Offering does not exist',
      });
    }

    return offering;
  }

  /**
   * Retrieve all of the Asset's Offerings and their details. Can be filtered using parameters
   *
   * @param opts.status - status of the Offerings to fetch. If defined, only Offerings that have all passed statuses will be returned
   */
  public async get(
    opts: { status?: Partial<OfferingStatus> } = {}
  ): Promise<OfferingWithDetails[]> {
    const {
      parent,
      context: {
        polymeshApi: {
          query: { sto },
        },
      },
      context,
    } = this;

    const { status: { timing: timingFilter, balance: balanceFilter, sale: saleFilter } = {} } =
      opts;

    const rawAssetId = assetToMeshAssetId(parent, context);

    const [fundraiserEntries, nameEntries] = await Promise.all([
      sto.fundraisers.entries(rawAssetId),
      sto.fundraiserNames.entries(rawAssetId),
    ]);

    const offerings = fundraiserEntries.map(
      ([
        {
          args: [, rawFundraiserId],
        },
        fundraiser,
      ]) => {
        const id = u64ToBigNumber(rawFundraiserId);
        const [[, name]] = remove(
          nameEntries,
          ([
            {
              args: [, rawId],
            },
          ]) => u64ToBigNumber(rawId).eq(id)
        );
        return {
          offering: new Offering({ id, assetId: parent.id }, context),
          details: fundraiserToOfferingDetails(fundraiser.unwrap(), name.unwrap(), context),
        };
      }
    );

    return offerings.filter(
      ({
        details: {
          status: { timing, sale, balance },
        },
      }) =>
        (!timingFilter || timingFilter === timing) &&
        (!saleFilter || saleFilter === sale) &&
        (!balanceFilter || balanceFilter === balance)
    );
  }
}
