import { ConfidentialAsset, Context, createConfidentialAsset, PolymeshError } from '~/internal';
import { CreateConfidentialAssetParams, ErrorCode, ProcedureMethod } from '~/types';
import { meshConfidentialAssetToAssetId, stringToTicker } from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Confidential Asset related functionality
 */
export class ConfidentialAssets {
  private context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.createConfidentialAsset = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createConfidentialAsset, { ...args }],
      },
      context
    );
  }

  /**
   * Retrieve a ConfidentialAsset
   */
  public async getConfidentialAsset(args: { id: string }): Promise<ConfidentialAsset> {
    const { context } = this;
    const { id } = args;

    const confidentialAsset = new ConfidentialAsset({ id }, context);

    const exists = await confidentialAsset.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential Asset does not exists',
        data: { id },
      });
    }

    return confidentialAsset;
  }

  /**
   * Retrieves a ConfidentialAsset for a given ticker
   */
  public async getConfidentialAssetFromTicker(args: {
    ticker: string;
  }): Promise<ConfidentialAsset> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { confidentialAsset },
        },
      },
    } = this;

    const { ticker } = args;
    const rawTicker = stringToTicker(ticker, context);
    const rawAssetId = await confidentialAsset.tickerToAsset(rawTicker);

    if (rawAssetId.isNone) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The ticker is not mapped to any Confidential Asset',
        data: {
          ticker,
        },
      });
    }

    const assetId = meshConfidentialAssetToAssetId(rawAssetId.unwrap());

    return new ConfidentialAsset({ id: assetId }, context);
  }

  /**
   * Create a confidential Asset
   */
  public createConfidentialAsset: ProcedureMethod<CreateConfidentialAssetParams, ConfidentialAsset>;
}
