import { ISubmittableResult } from '@polkadot/types/types';
import { TransactionSpec } from '@polymeshassociation/polymesh-sdk/types/internal';
import {
  asIdentity,
  assertIdentityExists,
  filterEventRecords,
} from '@polymeshassociation/polymesh-sdk/utils/internal';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import { ConfidentialAsset, Context } from '~/internal';
import { CreateConfidentialAssetParams, TxTags } from '~/types';
import { ExtrinsicParams } from '~/types/internal';
import {
  auditorsToConfidentialAuditors,
  meshConfidentialAssetToAssetId,
  stringToBytes,
} from '~/utils/conversion';
import { asConfidentialAccount } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = CreateConfidentialAssetParams;

/**
 * @hidden
 */
export const createConfidentialAssetResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): ConfidentialAsset => {
    const [{ data }] = filterEventRecords(receipt, 'confidentialAsset', 'AssetCreated');
    const id = meshConfidentialAssetToAssetId(data[1]);

    return new ConfidentialAsset({ id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateConfidentialAsset(
  this: ConfidentialProcedure<Params, ConfidentialAsset>,
  args: Params
): Promise<
  TransactionSpec<ConfidentialAsset, ExtrinsicParams<'confidentialAsset', 'createAsset'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { data, auditors, mediators } = args;

  const rawData = stringToBytes(data, context);

  const auditorAccounts = auditors.map(auditor => asConfidentialAccount(auditor, context));

  let mediatorIdentities;
  if (mediators?.length) {
    mediatorIdentities = mediators.map(mediator => asIdentity(mediator, context));
    await Promise.all(mediatorIdentities.map(identity => assertIdentityExists(identity)));
  }

  return {
    transaction: tx.confidentialAsset.createAsset,
    args: [rawData, auditorsToConfidentialAuditors(context, auditorAccounts, mediatorIdentities)],
    resolver: createConfidentialAssetResolver(context),
  };
}

/**
 * @hidden
 */
export const createConfidentialAsset = (): ConfidentialProcedure<Params, ConfidentialAsset> =>
  new ConfidentialProcedure(prepareCreateConfidentialAsset, {
    permissions: {
      transactions: [TxTags.confidentialAsset.CreateAsset],
      assets: [],
      portfolios: [],
    },
  });
