import { PolymeshPrimitivesPortfolioFund } from '@polkadot/types/lookup';

import { getAssetHolderDid } from '~/api/procedures/utils';
import { Account, DefaultPortfolio, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import {
  AssetHolder,
  ErrorCode,
  FungiblePortfolioMovement,
  InstructionNftLeg,
  NonFungiblePortfolioMovement,
  TransferFundsParams,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  fungibleMovementToPortfolioFund,
  nftMovementToPortfolioFund,
} from '~/utils/conversion';
import { isFungibleLegBuilder } from '~/utils/typeguards';

export interface Storage {
  fromHolder: AssetHolder;
  toHolder: AssetHolder;
  signingDid: string;
  signingAccount: string;
}

/**
 * @hidden
 */
export async function prepareMoveFunds(
  this: Procedure<TransferFundsParams, void, Storage>,
  args: TransferFundsParams
): Promise<TransactionSpec<void, ExtrinsicParams<'settlement', 'transferFunds'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { fromHolder, toHolder, signingDid, signingAccount },
  } = this;

  const { memo, ...leg } = args;

  if (fromHolder.isEqual(toHolder)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'from and to asset holders cannot be the same',
    });
  }

  const [fromDid, toDid] = await Promise.all([
    getAssetHolderDid(fromHolder, context),
    getAssetHolderDid(toHolder, context),
  ]);

  if (!fromDid || !toDid) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Unable to retrieve the DID from one or both asset holders',
    });
  }

  if (fromDid !== toDid) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'For transferring funds between different DIDs, use `addInstruction` method instead.',
    });
  }

  const isFungible = await isFungibleLegBuilder(leg, context);

  let rawFund: PolymeshPrimitivesPortfolioFund;
  if (isFungible(leg)) {
    const { asset, amount } = leg;

    if (amount.lte(0)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Amount should be greater than 0',
      });
    }

    // when sender and receiver DID are same we need to only check asset balance has for either account or portfolio
    if (fromDid === signingDid) {
      const [balance] = await fromHolder.getAssetBalances({ assets: [asset] });
      if (balance?.free.lt(amount)) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Sender has insufficient balance to cover the transfer',
          data: {
            balance,
          },
        });
      }
    } else if (fromHolder instanceof Account) {
      const allowance = await asset.getAllowance({ owner: fromHolder, spender: signingAccount });

      if (allowance.lt(amount)) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Spender has insufficient allowance to cover the transfer',
          data: {
            allowance,
          },
        });
      }
    }

    rawFund = await fungibleMovementToPortfolioFund(
      { asset, amount, memo } as FungiblePortfolioMovement,
      context
    );
  } else {
    const { asset, nfts } = leg as InstructionNftLeg;
    rawFund = await nftMovementToPortfolioFund(
      { asset, nfts, memo } as NonFungiblePortfolioMovement,
      context
    );
  }

  const rawFrom = await assetHolderIdToMeshAssetHolder(
    assetHolderLikeToAssetHolderId(fromHolder),
    context
  );
  const rawTo = await assetHolderIdToMeshAssetHolder(
    assetHolderLikeToAssetHolderId(toHolder),
    context
  );

  return {
    transaction: settlement.transferFunds,
    args: [rawFrom, rawTo, rawFund],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<TransferFundsParams, void, Storage>
): ProcedureAuthorization {
  const {
    storage: { fromHolder, toHolder },
  } = this;

  const portfolios = [fromHolder, toHolder].filter(
    holder => !(holder instanceof Account)
  ) as unknown as (DefaultPortfolio | NumberedPortfolio)[];

  return {
    permissions: {
      transactions: [TxTags.settlement.TransferFunds],
      assets: [],
      portfolios,
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<TransferFundsParams, void, Storage>,
  { from, to }: TransferFundsParams
): Promise<Storage> {
  const { context } = this;

  const [identity, { address }] = await Promise.all([
    context.getSigningIdentity(),
    context.getActingAccount(),
  ]);

  const fromHolder = assetHolderLikeToAssetHolder(from, context);
  const toHolder = assetHolderLikeToAssetHolder(to, context);

  return {
    fromHolder,
    toHolder,
    signingDid: identity.did,
    signingAccount: address,
  };
}

/**
 * @hidden
 */
export const transferFunds = (): Procedure<TransferFundsParams, void, Storage> =>
  new Procedure(prepareMoveFunds, getAuthorization, prepareStorage);
