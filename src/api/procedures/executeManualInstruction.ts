import { PolymeshPrimitivesIdentityIdPortfolioId } from '@polkadot/types/lookup';
import { Option } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import P from 'bluebird';

import { assertInstructionValidForManualExecution } from '~/api/procedures/utils';
import {
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ExecuteInstructionInfo } from '~/polkadot/polymesh';
import {
  ErrorCode,
  ExecuteManualInstructionParams,
  InstructionDetails,
  Leg,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { tuple } from '~/types/utils';
import { isOffChainLeg } from '~/utils';
import {
  bigNumberToU64,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolioId,
  u64ToBigNumber,
} from '~/utils/conversion';

export interface Storage {
  portfolios: (DefaultPortfolio | NumberedPortfolio)[];
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
        call,
      },
    },
    context,
    storage: { portfolios, instructionDetails, signerDid, offChainParties },
  } = this;

  const { id, skipAffirmationCheck } = args;

  const instruction = new Instruction({ id }, context);

  await assertInstructionValidForManualExecution(instructionDetails, context);

  if (!portfolios.length) {
    const details = await instructionDetails.venue?.details();

    if (details?.owner.did !== signerDid && !offChainParties.has(signerDid)) {
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

  let executeInstructionInfo: ExecuteInstructionInfo;

  /* istanbul ignore if: this will be removed after dual version support for v6-v7 */
  if (context.isV6) {
    executeInstructionInfo =
      await call.settlementApi.getExecuteInstructionInfo<ExecuteInstructionInfo>(rawInstructionId);
  } else {
    const rawInfo = await call.settlementApi.getExecuteInstructionInfo<
      Option<ExecuteInstructionInfo>
    >(rawInstructionId);

    executeInstructionInfo = rawInfo.unwrapOrDefault();
  }
  const { fungibleTokens, nonFungibleTokens, offChainAssets, consumedWeight } =
    executeInstructionInfo;

  return {
    transaction: settlementTx.executeManualInstruction,
    resolver: instruction,
    args: [
      rawInstructionId,
      rawPortfolioIds.length ? rawPortfolioIds[0] : null,
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
export async function getAuthorization(
  this: Procedure<Params, Instruction, Storage>
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
  this: Procedure<Params, Instruction, Storage>,
  { id }: Params
): Promise<Storage> {
  const { context } = this;

  const instruction = new Instruction({ id }, context);

  const [{ data: legs }, { did }, details] = await Promise.all([
    instruction.getLegs(),
    context.getSigningIdentity(),
    instruction.details(),
  ]);

  const [portfolios, offChainParties] = await P.reduce<
    Leg,
    [(DefaultPortfolio | NumberedPortfolio)[], Set<string>]
  >(
    legs,
    async (data, leg) => {
      const [custodiedPortfolios, offChainDids] = data;

      if (isOffChainLeg(leg)) {
        const { from, to } = leg;
        offChainDids.add(from.did);
        offChainDids.add(to.did);
      } else {
        const { from, to } = leg;
        const [fromIsCustodied, toIsCustodied] = await Promise.all([
          from.isCustodiedBy({ identity: did }),
          to.isCustodiedBy({ identity: did }),
        ]);

        if (fromIsCustodied) {
          custodiedPortfolios.push(from);
        }

        if (toIsCustodied) {
          custodiedPortfolios.push(to);
        }
      }

      return tuple(custodiedPortfolios, offChainDids);
    },
    [[], new Set<string>()]
  );

  return {
    portfolios,
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
