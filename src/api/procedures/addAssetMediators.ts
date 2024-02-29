import { BaseAsset, PolymeshError, Procedure } from '~/internal';
import { AssetMediatorParams, ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { MAX_ASSET_MEDIATORS } from '~/utils/constants';
import { identitiesToBtreeSet, stringToTicker } from '~/utils/conversion';
import { asIdentity, assertIdentityExists } from '~/utils/internal';
/**
 * @hidden
 */
export type Params = { asset: BaseAsset } & AssetMediatorParams;

/**
 * @hidden
 */
export async function prepareAddAssetMediators(
  this: Procedure<Params>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'addMandatoryMediators'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const {
    asset,
    asset: { ticker },
    mediators: mediatorInput,
  } = args;

  const currentMediators = await asset.getRequiredMediators();

  const newMediators = mediatorInput.map(mediator => asIdentity(mediator, context));

  const mediatorsExistAsserts = newMediators.map(mediator => assertIdentityExists(mediator));
  await Promise.all(mediatorsExistAsserts);

  newMediators.forEach(({ did: newDid }) => {
    const alreadySetDid = currentMediators.find(({ did: currentDid }) => currentDid === newDid);

    if (alreadySetDid) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One of the specified mediators is already set',
        data: { ticker, did: alreadySetDid.did },
      });
    }
  });

  const newMediatorCount = currentMediators.length + newMediators.length;

  if (newMediatorCount > MAX_ASSET_MEDIATORS) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `At most ${MAX_ASSET_MEDIATORS} are allowed`,
      data: { newMediatorCount },
    });
  }

  const rawNewMediators = identitiesToBtreeSet(newMediators, context);
  const rawTicker = stringToTicker(ticker, context);

  return {
    transaction: tx.asset.addMandatoryMediators,
    args: [rawTicker, rawNewMediators],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params>, args: Params): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.asset.AddMandatoryMediators],
      portfolios: [],
      assets: [args.asset],
    },
  };
}

/**
 * @hidden
 */
export const addAssetMediators = (): Procedure<Params> =>
  new Procedure(prepareAddAssetMediators, getAuthorization);
