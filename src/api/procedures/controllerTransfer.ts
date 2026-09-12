import {
  assertAssetHolderExists,
  assertControllerTransferDestinationAccepted,
  assertTxSupported,
  ControllerTransferDestination,
  getAssetHolderDid,
  getControllerTransferDestination,
} from '~/api/procedures/utils';
import { DefaultPortfolio, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ControllerTransferParams, ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  assetHolderToAssetHolderKind,
  assetToMeshAssetId,
  bigNumberToBalance,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Storage = ControllerTransferDestination;

/**
 * @hidden
 */
export type Params = { asset: FungibleAsset } & ControllerTransferParams;

/**
 * @hidden
 */
export async function prepareControllerTransfer(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'asset', 'controllerTransfer'>>
  | TransactionSpec<void, ExtrinsicParams<'asset', 'controllerTransferTo'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { did, actingAddress, destinationAssetHolder, isDestinationCallers },
    context,
  } = this;
  const { asset, originPortfolio, amount } = args;

  const originAssetHolderId = assetHolderLikeToAssetHolderId(originPortfolio);

  const [originHolderDid, destinationDid] = await Promise.all([
    getAssetHolderDid(originPortfolio, context),
    getAssetHolderDid(destinationAssetHolder, context),
  ]);

  // the chain refuses any transfer between two holders of the same Identity, a controller
  // transfer included, so seizing from a holder and delivering to another of its own is not possible
  if (originHolderDid && originHolderDid === destinationDid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The origin and destination must belong to different Identities',
      data: { did: originHolderDid },
    });
  }

  const destinationAssetHolderId = assetHolderLikeToAssetHolderId(destinationAssetHolder);

  if (!isDestinationCallers) {
    assertTxSupported(TxTags.asset.ControllerTransferTo, '8.1.1', context);

    await assertAssetHolderExists(destinationAssetHolderId, context);
    await assertControllerTransferDestinationAccepted(
      destinationAssetHolder,
      asset,
      { did, address: actingAddress },
      context
    );
  }

  const fromPortfolio = assetHolderLikeToAssetHolder(originPortfolio, context);

  const [balance] = await fromPortfolio.getAssetBalances({
    assets: [asset],
  });

  // a controller transfer can seize frozen tokens, which is what makes seizing from a frozen
  // holder possible, but not locked ones. So the ceiling is `total - locked` rather than `free`
  const { total, locked } = balance!;
  const available = total.minus(locked);

  if (available.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The origin Portfolio does not have enough unlocked balance for this transfer',
      data: { available },
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawAmount = bigNumberToBalance(amount, context);
  const rawSource = assetHolderIdToMeshAssetHolder(originAssetHolderId, context);

  if (isDestinationCallers) {
    return {
      transaction: tx.asset.controllerTransfer,
      args: [
        rawAssetId,
        rawAmount,
        rawSource,
        assetHolderToAssetHolderKind(destinationAssetHolder, context),
      ],
      resolver: undefined,
    };
  }

  return {
    transaction: tx.asset.controllerTransferTo,
    args: [
      rawAssetId,
      rawAmount,
      rawSource,
      assetHolderIdToMeshAssetHolder(destinationAssetHolderId, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): ProcedureAuthorization {
  const {
    context,
    storage: { did, isDestinationCallers },
  } = this;

  // the chain checks only the agent's Asset permission for a transfer to a named destination
  if (!isDestinationCallers) {
    return {
      permissions: {
        assets: [asset],
        transactions: [TxTags.asset.ControllerTransferTo],
        portfolios: [],
      },
    };
  }

  const portfolioId = { did };

  return {
    roles: [{ type: RoleType.PortfolioCustodian, portfolioId }],
    permissions: {
      assets: [asset],
      transactions: [TxTags.asset.ControllerTransfer],
      portfolios: [new DefaultPortfolio({ did }, context)],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, void, Storage>,
  { destination }: Params
): Promise<Storage> {
  return getControllerTransferDestination(destination, this.context);
}

/**
 * @hidden
 */
export const controllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareControllerTransfer, getAuthorization, prepareStorage);
