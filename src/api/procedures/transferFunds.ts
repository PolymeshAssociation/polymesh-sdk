import { PolymeshPrimitivesPortfolioFund } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { createAddInstructionResolver } from '~/api/procedures/addInstruction';
import { getAssetHolderDid } from '~/api/procedures/utils';
import { Account, Context, Instruction, Nft, PolymeshError, Procedure } from '~/internal';
import {
  AssetHolder,
  ErrorCode,
  FungibleLeg,
  InstructionNftLeg,
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
import { asAssetId, asFungibleAsset, asNftId, filterEventRecords } from '~/utils/internal';
import { isFungibleLegBuilder, isPortfolioAssetHolder } from '~/utils/typeguards';

export interface Storage {
  fromHolder: AssetHolder;
  toHolder: AssetHolder;
  fromDid: string | undefined;
  toDid: string | undefined;
  signingDid: string;
  signingAccount: string;
}

/**
 * @hidden
 */
async function getFungibleFund(
  context: Context,
  storage: Storage,
  leg: FungibleLeg,
  memo?: string
): Promise<PolymeshPrimitivesPortfolioFund> {
  const { fromHolder, signingAccount } = storage;
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
    // `isFungibleLegBuilder` narrows the leg to a `FungibleLeg`, whose `asset` is a
    // `FungibleAsset` — but the parameter accepts `string | FungibleAsset`, so an Asset ID may
    // still be there at runtime and has to be resolved before any of its methods can be used
    const fungibleAsset = await asFungibleAsset(asset, context);
    const allowance = await fungibleAsset.getAllowance({
      owner: fromHolder,
      spender: signingAccount,
    });

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

  return fungibleMovementToPortfolioFund(
    { asset, amount, ...(memo !== undefined && { memo }) },
    context
  );
}

/**
 * @hidden
 */
async function getNftFund(
  context: Context,
  storage: Storage,
  leg: InstructionNftLeg,
  memo?: string
): Promise<PolymeshPrimitivesPortfolioFund> {
  const { fromHolder, signingAccount } = storage;
  const { asset, nfts } = leg;

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
      // `getOwner` always resolves Account holders to a plain `Account`, so comparing a MultiSig
      // `fromHolder` via `isEqual` would incorrectly fail (its uuid is keyed by class name) even
      // when the address matches -- compare by address for any Account/MultiSig pairing instead
      const isOwner =
        owner instanceof Account && fromHolder instanceof Account
          ? owner.address === fromHolder.address
          : !!owner?.isEqual(fromHolder);
      if (!isOwner) {
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

  return nftMovementToPortfolioFund({ asset, nfts, ...(memo !== undefined && { memo }) }, context);
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
  const isFungible = await isFungibleLegBuilder(leg, context);

  if (isFungible(leg)) {
    return getFungibleFund(context, storage, leg, memo);
  }

  return getNftFund(context, storage, leg as InstructionNftLeg, memo);
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
    storage: { fromHolder, toHolder, fromDid, toDid },
    storage,
  } = this;

  if (fromHolder.isEqual(toHolder)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'from and to asset holders cannot be the same',
    });
  }

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
    resolver: (receipt): Instruction | undefined => {
      const [instruction] = createAddInstructionResolver(context, true)(receipt);
      if (!instruction) {
        return undefined;
      }

      // `settlement.InstructionCreated` fires whether or not the instruction is also executed
      // inline within this same transaction (e.g. when the caller is also the receiver and both
      // sides end up affirmed), so a settled instruction still resolves an `Instruction` above.
      // `SettlementManuallyExecuted` only fires on that inline-execution path, so its presence
      // means the instruction is already done rather than still pending.
      const [executed] = filterEventRecords(
        receipt,
        'settlement',
        'SettlementManuallyExecuted',
        true
      );

      return executed ? undefined : instruction;
    },
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<TransferFundsParams, Instruction | undefined, Storage>
): Promise<ProcedureAuthorization> {
  const {
    storage: { fromHolder, signingDid },
  } = this;

  let roles: ProcedureAuthorization['roles'];

  if (isPortfolioAssetHolder(fromHolder)) {
    // a Portfolio source is custody checked on every path. Compared against the acting Identity
    // (the MultiSig's own when signing through one); a `PortfolioCustodian` role would use the
    // signing key's Identity instead
    const isCustodian = await fromHolder.isCustodiedBy({ identity: signingDid });

    roles = isCustodian || 'The signing Identity must be the custodian of the origin Portfolio';
  }

  return {
    roles,
    permissions: {
      transactions: [TxTags.settlement.TransferFunds],
      assets: [],
      // the destination is never required - the chain affirms it opportunistically, leaving the
      // Instruction pending rather than failing when the caller can't affirm it
      portfolios: [fromHolder].filter(isPortfolioAssetHolder),
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

  const fromHolder = assetHolderLikeToAssetHolder(from, context);
  const toHolder = assetHolderLikeToAssetHolder(to, context);

  // the extrinsic is dispatched with the acting Account as its origin — a MultiSig proposal
  // executes as the MultiSig itself — so both the allowance/ownership checks and the chain's
  // permission checks key off that Account and the Identity it belongs to, not off the key that
  // signs the proposal
  const actingAccount = await context.getActingAccount();

  const [identity, fromDid, toDid] = await Promise.all([
    actingAccount.getIdentity(),
    getAssetHolderDid(fromHolder, context),
    getAssetHolderDid(toHolder, context),
  ]);

  if (!identity) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'The acting Account does not have an associated Identity',
      data: { actingAddress: actingAccount.address },
    });
  }

  return {
    fromHolder,
    toHolder,
    fromDid,
    toDid,
    signingDid: identity.did,
    signingAccount: actingAccount.address,
  };
}

/**
 * @hidden
 */
export const transferFunds = (): Procedure<TransferFundsParams, Instruction | undefined, Storage> =>
  new Procedure(prepareTransferFunds, getAuthorization, prepareStorage);
