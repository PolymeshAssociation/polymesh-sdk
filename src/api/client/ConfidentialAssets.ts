import { ConfidentialAsset, Context, createConfidentialAsset, PolymeshError } from '~/internal';
import { CreateConfidentialAssetParams, ErrorCode, ProcedureMethod } from '~/types';
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
   * Create a confidential Asset
   */
  public createConfidentialAsset: ProcedureMethod<CreateConfidentialAssetParams, ConfidentialAsset>;
}
