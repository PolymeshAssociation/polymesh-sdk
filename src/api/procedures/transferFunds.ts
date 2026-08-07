import { PolymeshPrimitivesPortfolioFund } from '@polkadot/types/lookup';

import { createAddInstructionResolver } from '~/api/procedures/addInstruction';
import { getAssetHolderDid } from '~/api/procedures/utils';
import {
  Account,
  Context,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
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
export async function getFund(
  context: Context,
  args: TransferFundsParams,
  fromDid: string,
  storage: Storage
): Promise<PolymeshPrimitivesPortfolioFund> {
  const { memo, ...leg } = args;
  const { fromHolder, signingDid, signingAccount } = storage;
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

    // spender mode only applies to Account sources where the signer isn't the owner; Portfolio
    // sources are always authorized via custody on-chain, regardless of the owning DID
    if (fromHolder instanceof Account && fromDid !== signingDid) {
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
    } else {
      const [balance] = await fromHolder.getAssetBalances({ assets: [asset] });
      if (!balance || balance.free.lt(amount)) {
        throw new PolymeshError({
          code: ErrorCode.UnmetPrerequisite,
          message: 'Sender has insufficient balance to cover the transfer',
          data: {
            balance,
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

  return rawFund;
}

/**
 * @hidden
 */
export async function prepareTransferFunds(
  this: Procedure<TransferFundsParams, Instruction | undefined, Storage>,
  args: TransferFundsParams
): Promise<
  TransactionSpec<Instruction | undefined, ExtrinsicParams<'settlement', 'transferFunds'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { fromHolder, toHolder },
    storage,
  } = this;

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
      data: {
        fromDid,
        toDid,
      },
    });
  }

  const rawFrom = assetHolderIdToMeshAssetHolder(
    assetHolderLikeToAssetHolderId(fromHolder),
    context
  );
  const rawTo = assetHolderIdToMeshAssetHolder(assetHolderLikeToAssetHolderId(toHolder), context);
  const rawFund = await getFund(context, args, fromDid, storage);

  return {
    transaction: settlement.transferFunds,
    args: [rawFrom, rawTo, rawFund],
    resolver: (receipt): Instruction | undefined =>
      createAddInstructionResolver(context, true)(receipt)[0],
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<TransferFundsParams, Instruction | undefined, Storage>
): Promise<ProcedureAuthorization> {
  const {
    context,
    storage: { fromHolder, toHolder, signingDid },
  } = this;

  const toDid = await getAssetHolderDid(toHolder, context);

  // the signer always authorizes/affirms the source; the destination is only auto-affirmed
  // (and thus requires permission) when the signer's own identity also owns it
  const holders = [fromHolder, ...(toDid === signingDid ? [toHolder] : [])];

  const portfolios = holders.filter(holder => !(holder instanceof Account)) as unknown as (
    | DefaultPortfolio
    | NumberedPortfolio
  )[];

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
  this: Procedure<TransferFundsParams, Instruction | undefined, Storage>,
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
export const transferFunds = (): Procedure<TransferFundsParams, Instruction | undefined, Storage> =>
  new Procedure(prepareTransferFunds, getAuthorization, prepareStorage);
