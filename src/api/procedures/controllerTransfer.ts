import { DefaultPortfolio, FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ControllerTransferParams, ErrorCode, RoleType, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToBalance,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToTicker,
} from '~/utils/conversion';

export interface Storage {
  did: string;
}

/**
 * @hidden
 */
export type Params = { ticker: string } & ControllerTransferParams;

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
  const { ticker, originPortfolio, amount } = args;

  const asset = new FungibleAsset({ ticker }, context);

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

  return {
    transaction: tx.asset.controllerTransfer,
    args: [
      stringToTicker(ticker, context),
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
  { ticker }: Params
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { did },
  } = this;

  const asset = new FungibleAsset({ ticker }, context);

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
