import { DefaultPortfolio, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ControllerTransferParams, ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
} from '~/utils/conversion';

export interface Storage {
  did: string;
}

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
): Promise<TransactionSpec<void, ExtrinsicParams<'asset', 'controllerTransfer'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    storage: { did },
    context,
  } = this;
  const { asset, originPortfolio, amount } = args;

  const originPortfolioId = portfolioLikeToPortfolioId(originPortfolio);

  if (did === originPortfolioId.did) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Controller transfers to self are not allowed',
    });
  }

  const fromPortfolio = portfolioIdToPortfolio(originPortfolioId, context);

  const [{ free }] = await fromPortfolio.getAssetBalances({
    assets: [asset],
  });

  if (free.lt(amount)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The origin Portfolio does not have enough free balance for this transfer',
      data: { free },
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);

  return {
    transaction: tx.asset.controllerTransfer,
    args: [
      rawAssetId,
      bigNumberToBalance(amount, context),
      portfolioIdToMeshPortfolioId(originPortfolioId, context),
    ],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { asset }: Params
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { did },
  } = this;

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
export async function prepareStorage(this: Procedure<Params, void, Storage>): Promise<Storage> {
  const { context } = this;

  const { did } = await context.getSigningIdentity();

  return {
    did,
  };
}

/**
 * @hidden
 */
export const controllerTransfer = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareControllerTransfer, getAuthorization, prepareStorage);
