import BigNumber from 'bignumber.js';

import { assertInstructionValidForManualExecution } from '~/api/procedures/utils';
import {
  Account,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  AssetHolder,
  ErrorCode,
  ExecuteManualInstructionParams,
  InstructionDetails,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { tuple } from '~/types/utils';
import { isOffChainLeg } from '~/utils';
import {
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  bigNumberToU64,
  u64ToBigNumber,
} from '~/utils/conversion';

export interface Storage {
  allowedAssetHolders: AssetHolder[];
  offChainParties: Set<string>;
  instructionDetails: InstructionDetails;
  signerDid: string;
}

/**
 * @hidden
 */
export type Params = ExecuteManualInstructionParams & {
  id: BigNumber;
};

/**
 * @hidden
 */
export async function prepareExecuteManualInstruction(
  this: Procedure<Params, Instruction, Storage>,
  args: Params
): Promise<
  TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'executeManualInstruction'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        query: { settlement },
        call: { settlementApi },
      },
    },
    context,
    storage: { allowedAssetHolders, instructionDetails, signerDid, offChainParties },
  } = this;

  const { id, skipAffirmationCheck } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValidForManualExecution(instructionDetails, context);

  if (!allowedAssetHolders.length) {
    const details = await instructionDetails.venue?.details();

    if (details?.owner.did !== signerDid && !offChainParties.has(signerDid)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing identity is not involved in this Instruction',
      });
    }
  }

  const rawInstructionId = bigNumberToU64(id, context);
  const rawAssetHolders = await Promise.all(
    allowedAssetHolders.map(
      async assetHolder =>
        await assetHolderIdToMeshAssetHolder(assetHolderLikeToAssetHolderId(assetHolder), context)
    )
  );

  if (!skipAffirmationCheck) {
    const pendingAffirmationsCount = await settlement.instructionAffirmsPending(rawInstructionId);
    if (!u64ToBigNumber(pendingAffirmationsCount).isZero()) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Instruction needs to be affirmed by all parties before it can be executed',
        data: {
          pendingAffirmationsCount,
        },
      });
    }
  }

  const rawInfo = await settlementApi.getExecuteInstructionInfo(rawInstructionId);

  const { fungibleTokens, nonFungibleTokens, offChainAssets, consumedWeight } =
    rawInfo.unwrapOrDefault();

  return {
    transaction: settlementTx.executeManualInstruction,
    resolver: instruction,
    args: [
      rawInstructionId,
      rawAssetHolders.length ? rawAssetHolders[0] : null,
      fungibleTokens,
      nonFungibleTokens,
      offChainAssets,
      skipAffirmationCheck ? null : consumedWeight,
    ],
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Instruction, Storage>
): ProcedureAuthorization {
  const {
    storage: { allowedAssetHolders },
  } = this;

  return {
    permissions: {
      portfolios: allowedAssetHolders.filter(assetHolder => !(assetHolder instanceof Account)) as (
        | DefaultPortfolio
        | NumberedPortfolio
      )[],
      transactions: [TxTags.settlement.ExecuteManualInstruction],
      assets: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Instruction, Storage>,
  { id }: Params
): Promise<Storage> {
  const { context } = this;

  const instruction = new Instruction({ id }, context);

  const [{ data: legs }, { did }, details] = await Promise.all([
    instruction.getLegsFromChain(),
    context.getSigningIdentity(),
    instruction.detailsFromChain(),
  ]);

  const [allowedAssetHolders, offChainParties] = await legs.reduce<
    Promise<[AssetHolder[], Set<string>]>
  >(async (accPromise, leg) => {
    const [allowedAssetHolders, offChainDids] = await accPromise;

    const isAssetHolderAllowed = async (assetHolder: AssetHolder): Promise<AssetHolder | null> => {
      if (assetHolder instanceof Account) {
        const identity = await assetHolder.getIdentity();
        if (identity?.did === did) {
          return assetHolder;
        }
        return null;
      }

      const isCustodied = await assetHolder.isCustodiedBy({ identity: did });
      if (isCustodied) {
        return assetHolder;
      }

      return null;
    };

    if (isOffChainLeg(leg)) {
      const { from, to } = leg;
      offChainDids.add(from.did);
      offChainDids.add(to.did);
    } else {
      const { from, to } = leg;
      const fromAssetHolder = assetHolderLikeToAssetHolder(from, context);
      const toAssetHolder = assetHolderLikeToAssetHolder(to, context);

      const [fromPortfolio, toPortfolio] = await Promise.all([
        isAssetHolderAllowed(fromAssetHolder),
        isAssetHolderAllowed(toAssetHolder),
      ]);

      if (fromPortfolio) {
        allowedAssetHolders.push(fromPortfolio);
      }

      if (toPortfolio) {
        allowedAssetHolders.push(toPortfolio);
      }
    }

    return tuple(allowedAssetHolders, offChainDids);
  }, Promise.resolve(tuple([], new Set<string>())));

  return {
    allowedAssetHolders,
    instructionDetails: details,
    signerDid: did,
    offChainParties,
  };
}

/**
 * @hidden
 */
export const executeManualInstruction = (): Procedure<Params, Instruction, Storage> =>
  new Procedure(prepareExecuteManualInstruction, getAuthorization, prepareStorage);
