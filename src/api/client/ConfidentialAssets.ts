import { Context, PolymeshError } from '@polymeshassociation/polymesh-sdk/internal';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';

import { ConfidentialAsset, createConfidentialAsset } from '~/internal';
import { ConfidentialProcedureMethod, CreateConfidentialAssetParams } from '~/types';
import { createConfidentialProcedureMethod } from '~/utils/internal';

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

    this.createConfidentialAsset = createConfidentialProcedureMethod(
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
  public createConfidentialAsset: ConfidentialProcedureMethod<
    CreateConfidentialAssetParams,
    ConfidentialAsset
  >;
}
