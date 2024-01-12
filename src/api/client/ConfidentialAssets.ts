import { ConfidentialAsset, Context, PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

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
        message: `No confidential Asset exists with ID: "${id}"`,
      });
    }

    return confidentialAsset;
  }
}
