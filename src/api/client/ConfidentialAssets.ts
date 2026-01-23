import BigNumber from 'bignumber.js';

import { ConfidentialAsset } from '~/api/entities/ConfidentialAsset';
import { CreateConfidentialAssetParams } from '~/api/entities/ConfidentialAsset/types';
import { createConfidentialAsset } from '~/api/procedures/createConfidentialAsset';
import { Context, PolymeshError } from '~/internal';
import { ErrorCode, ProcedureMethod } from '~/types';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Confidential Asset related functionality
 */
export class ConfidentialAssets {
  private readonly context: Context;

  /**
   * @hidden
   */
  constructor(context: Context) {
    this.context = context;

    this.createConfidentialAsset = createProcedureMethod(
      {
        getProcedureAndArgs: args => [createConfidentialAsset, args],
      },
      context
    );
  }

  /**
   * Create a new Confidential Asset
   *
   * @note This requires auditor/mediator encryption keys to be registered first
   */
  public createConfidentialAsset: ProcedureMethod<CreateConfidentialAssetParams, ConfidentialAsset>;

  /**
   * Retrieve a Confidential Asset by its ID
   *
   * @param args.id - The confidential asset ID (u32)
   */
  public async getConfidentialAsset(args: { id: BigNumber }): Promise<ConfidentialAsset> {
    const { context } = this;

    const asset = new ConfidentialAsset(args, context);

    const exists = await asset.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: `Confidential Asset with ID "${args.id.toString()}" does not exist`,
      });
    }

    return asset;
  }

  /**
   * Get the next confidential asset ID that will be assigned
   */
  public async getNextAssetId(): Promise<BigNumber> {
    const {
      context: {
        polymeshApi: { query },
      },
    } = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidentialAssets = (query as any).confidentialAssets;
    if (!confidentialAssets) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential assets module is not available on this chain',
      });
    }

    const rawNextId = await confidentialAssets.nextAssetId();

    return new BigNumber(rawNextId.toNumber());
  }

  /**
   * Retrieve all Confidential Assets owned by an identity
   *
   * @param args.did - The identity DID
   */
  public async getConfidentialAssetsByOwner(args: { did: string }): Promise<ConfidentialAsset[]> {
    const {
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const { did } = args;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidentialAssets = (query as any).confidentialAssets;
    if (!confidentialAssets) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Confidential assets module is not available on this chain',
      });
    }

    const entries = await confidentialAssets.ownerAssets.entries(did);

    return entries.map(
      ([
        {
          args: [, rawAssetId],
        },
      ]: [{ args: [unknown, { toNumber(): number }] }, unknown]) =>
        new ConfidentialAsset({ id: new BigNumber(rawAssetId.toNumber()) }, context)
    );
  }
}
