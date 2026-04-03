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
  assetHolders: (DefaultPortfolio | NumberedPortfolio)[];
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
    storage: { assetHolders, instructionDetails, signerDid, offChainParties },
  } = this;

  const { id, skipAffirmationCheck } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValidForManualExecution(instructionDetails, context);

  if (!assetHolders.length) {
    const details = await instructionDetails.venue?.details();

    if (details?.owner.did !== signerDid && !offChainParties.has(signerDid)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing identity is not involved in this Instruction',
      });
    }
  }

  const rawInstructionId = bigNumberToU64(id, context);
  const rawAssetHolders = assetHolders.map(portfolio =>
    assetHolderIdToMeshAssetHolder(assetHolderLikeToAssetHolderId(portfolio), context)
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
    storage: { assetHolders: portfolios },
  } = this;

  return {
    permissions: {
      portfolios,
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

  const [portfolios, offChainParties] = await legs.reduce<
    Promise<[(DefaultPortfolio | NumberedPortfolio)[], Set<string>]>
  >(async (accPromise, leg) => {
    const [custodiedPortfolios, offChainDids] = await accPromise;

    const checkCustodiedPortfolio = async (
      assetHolder: AssetHolder
    ): Promise<DefaultPortfolio | NumberedPortfolio | null> => {
      if (assetHolder instanceof Account) {
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
        checkCustodiedPortfolio(fromAssetHolder),
        checkCustodiedPortfolio(toAssetHolder),
      ]);

      if (fromPortfolio) {
        custodiedPortfolios.push(fromPortfolio);
      }

      if (toPortfolio) {
        custodiedPortfolios.push(toPortfolio);
      }
    }

    return tuple(custodiedPortfolios, offChainDids);
  }, Promise.resolve(tuple([], new Set<string>())));

  return {
    assetHolders: portfolios,
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
