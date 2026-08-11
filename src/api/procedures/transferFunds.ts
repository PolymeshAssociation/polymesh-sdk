import { PolymeshPrimitivesPortfolioFund } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { createAddInstructionResolver } from '~/api/procedures/addInstruction';
import { getAssetHolderDid } from '~/api/procedures/utils';
import {
  Account,
  Context,
  DefaultPortfolio,
  Instruction,
  Nft,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { AssetHolder, ErrorCode, InstructionNftLeg, TransferFundsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  fungibleMovementToPortfolioFund,
  nftMovementToPortfolioFund,
} from '~/utils/conversion';
import { asAssetId, asNftId } from '~/utils/internal';
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
  storage: Storage
): Promise<PolymeshPrimitivesPortfolioFund> {
  const { memo, ...leg } = args;
  const { fromHolder, signingAccount } = storage;
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

    // allowances are granted key to key, so spender mode applies whenever the submitting Account
    // isn't the source Account itself — even when both keys belong to the same DID. Portfolio
    // sources are always authorized via custody on-chain, regardless of the owning DID
    if (fromHolder instanceof Account && fromHolder.address !== signingAccount) {
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

    rawFund = await fungibleMovementToPortfolioFund(
      { asset, amount, ...(memo !== undefined && { memo }) },
      context
    );
  } else {
    const { asset, nfts } = leg as InstructionNftLeg;

    // NFTs have no allowance mechanism, so only the owning key (or the owning identity's
    // custodied Portfolio) can authorize their transfer
    if (fromHolder instanceof Account && fromHolder.address !== signingAccount) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          'Only the owning key can transfer NFTs from an Account. Allowances do not apply to NFTs',
      });
    }

    const assetId = await asAssetId(asset, context);

    const unavailableNfts: BigNumber[] = [];
    await Promise.all(
      nfts.map(async nftId => {
        const id = asNftId(nftId);
        const nft = new Nft({ id, assetId }, context);

        const owner = await nft.getOwner();
        if (!owner || !owner.isEqual(fromHolder)) {
          unavailableNfts.push(id);
          return;
        }

        const isLocked = await nft.isLocked();
        if (isLocked) {
          unavailableNfts.push(id);
        }
      })
    );

    if (unavailableNfts.length) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Some of the NFTs are not owned by the sender, are locked, or do not exist',
        data: { unavailableNfts },
      });
    }

    rawFund = await nftMovementToPortfolioFund(
      { asset, nfts, ...(memo !== undefined && { memo }) },
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
  const rawFund = await getFund(context, args, storage);

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
