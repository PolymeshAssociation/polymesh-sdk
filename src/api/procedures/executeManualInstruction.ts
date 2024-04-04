import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import P from 'bluebird';

import { assertInstructionValidForManualExecution } from '~/api/procedures/utils';
import { Instruction, PolymeshError, Procedure } from '~/internal';
import {
  DefaultPortfolio,
  ErrorCode,
  ExecuteManualInstructionParams,
  InstructionDetails,
  Leg,
  NumberedPortfolio,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  bigNumberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  u64ToBigNumber,
} from '~/utils/conversion';

export interface Storage {
  portfolios: (DefaultPortfolio | NumberedPortfolio)[];
  instructionDetails: InstructionDetails;
  signerDid: string;
}

/**
 * @hidden
 */
export async function prepareExecuteManualInstruction(
  this: Procedure<ExecuteManualInstructionParams, Instruction, Storage>,
  args: ExecuteManualInstructionParams
): Promise<
  TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'executeManualInstruction'>>
> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        query: { settlement },
        rpc,
      },
    },
    context,
    storage: { portfolios, instructionDetails, signerDid },
  } = this;

  const { id, skipAffirmationCheck } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValidForManualExecution(instructionDetails, context);

  if (!portfolios.length) {
    const {
      owner: { did: venueOwner },
    } = await instructionDetails.venue.details();

    if (venueOwner !== signerDid) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing identity is not involved in this Instruction',
      });
    }
  }

  const rawInstructionId = bigNumberToU64(id, context);
  const rawPortfolioIds: PolymeshPrimitivesIdentityIdPortfolioId[] = portfolios.map(portfolio =>
    portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
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

  const { fungibleTokens, nonFungibleTokens, offChainAssets, consumedWeight } =
    await rpc.settlement.getExecuteInstructionInfo(rawInstructionId);

  return {
    transaction: settlementTx.executeManualInstruction,
    resolver: instruction,
    args: [
      rawInstructionId,
      rawPortfolioIds.length ? rawPortfolioIds[0] : null,
      fungibleTokens,
      nonFungibleTokens,
      offChainAssets,
      consumedWeight,
    ],
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<ExecuteManualInstructionParams, Instruction, Storage>
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfolios },
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
  this: Procedure<ExecuteManualInstructionParams, Instruction, Storage>,
  { id }: ExecuteManualInstructionParams
): Promise<Storage> {
  const { context } = this;

  const instruction = new Instruction({ id }, context);

  const [{ data: legs }, { did }, details] = await Promise.all([
    instruction.getLegs(),
    context.getSigningIdentity(),
    instruction.details(),
  ]);

  const portfolios = await P.reduce<Leg, (DefaultPortfolio | NumberedPortfolio)[]>(
    legs,
    async (custodiedPortfolios, { from, to }) => {
      const [fromIsCustodied, toIsCustodied] = await Promise.all([
        from.isCustodiedBy({ identity: did }),
        to.isCustodiedBy({ identity: did }),
      ]);

      const result = [...custodiedPortfolios];

      if (fromIsCustodied) {
        result.push(from);
      }

      if (toIsCustodied) {
        result.push(to);
      }

      return result;
    },
    []
  );

  return {
    portfolios,
    instructionDetails: details,
    signerDid: did,
  };
}

/**
 * @hidden
 */
export const executeManualInstruction = (): Procedure<
  ExecuteManualInstructionParams,
  Instruction,
  Storage
> => new Procedure(prepareExecuteManualInstruction, getAuthorization, prepareStorage);
