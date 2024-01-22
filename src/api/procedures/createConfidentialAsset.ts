import { ISubmittableResult } from '@polkadot/types/types';
import { hexStripPrefix } from '@polkadot/util';

import { ConfidentialAsset, Context, PolymeshError, Procedure } from '~/internal';
import { CreateConfidentialAssetParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { auditorsToConfidentialAuditors, stringToBytes, stringToTicker } from '~/utils/conversion';
import { asConfidentialAccount, asIdentity, filterEventRecords } from '~/utils/internal';

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
    const [{ data }] = filterEventRecords(receipt, 'confidentialAsset', 'ConfidentialAssetCreated');
    const id = hexStripPrefix(data[1].toString());

    return new ConfidentialAsset({ id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreateConfidentialAsset(
  this: Procedure<Params, ConfidentialAsset>,
  args: Params
): Promise<
  TransactionSpec<
    ConfidentialAsset,
    ExtrinsicParams<'confidentialAsset', 'createConfidentialAsset'>
  >
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { ticker, data, auditors, mediators } = args;

  let rawTicker = null;
  if (ticker) {
    rawTicker = stringToTicker(ticker, context);
  }
  const rawData = stringToBytes(data, context);

  const auditorAccounts = auditors.map(auditor => asConfidentialAccount(auditor, context));

  const auditorIdentities = await Promise.all(
    auditorAccounts.map(auditor => auditor.getIdentity())
  );

  const invalidAuditors = auditorIdentities.filter(identity => identity === null);
  if (invalidAuditors.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One or more auditors do not exists',
      data: {
        invalidAuditors,
      },
    });
  }

  let mediatorIdentities;
  if (mediators?.length) {
    mediatorIdentities = mediators.map(mediator => asIdentity(mediator, context));
  }

  return {
    transaction: tx.confidentialAsset.createConfidentialAsset,
    args: [
      rawTicker,
      rawData,
      auditorsToConfidentialAuditors(context, auditorAccounts, mediatorIdentities),
    ],
    resolver: createConfidentialAssetResolver(context),
  };
}

/**
 * @hidden
 */
export const createConfidentialAsset = (): Procedure<Params, ConfidentialAsset> =>
  new Procedure(prepareCreateConfidentialAsset, {
    permissions: {
      transactions: [TxTags.confidentialAsset.CreateConfidentialAsset],
      assets: [],
      portfolios: [],
    },
  });
