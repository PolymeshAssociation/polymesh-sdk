import { BTreeSet, u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementSettlementType,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { flatten, isEqual, union, unionWith } from 'lodash';

import { assertPortfolioExists, assertValidCdd, assertVenueExists } from '~/api/procedures/utils';
import {
  BaseAsset,
  Context,
  DefaultPortfolio,
  Instruction,
  NumberedPortfolio,
  PolymeshError,
  Procedure,
} from '~/internal';
import {
  AddInstructionParams,
  AddInstructionsParams,
  ErrorCode,
  FungibleLeg,
  InstructionEndCondition,
  InstructionFungibleLeg,
  InstructionLeg,
  InstructionNftLeg,
  InstructionOffChainLeg,
  InstructionType,
  NftLeg,
  RoleType,
  SettlementTx,
  TxTags,
  Venue,
} from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import { isFungibleLegBuilder, isNftLegBuilder, isOffChainLeg } from '~/utils';
import { MAX_LEGS_LENGTH } from '~/utils/constants';
import {
  assetToMeshAssetIdWithKey,
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  endConditionToSettlementType,
  identitiesToBtreeSet,
  legToFungibleLeg,
  legToNonFungibleLeg,
  legToOffChainLeg,
  nftToMeshNft,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  stringToIdentityId,
  stringToMemo,
  u64ToBigNumber,
} from '~/utils/conversion';
import {
  asAssetId,
  asBaseAsset,
  asDid,
  asIdentity,
  assembleBatchTransactions,
  assertIdentityExists,
  filterEventRecords,
  optionize,
} from '~/utils/internal';

/**
 * @hidden
 */
export type Params = AddInstructionsParams & {
  venueId: BigNumber;
};

/**
 * @hidden
 */
export interface Storage {
  portfoliosToAffirm: (DefaultPortfolio | NumberedPortfolio)[][];
}

/**
 * @hidden
 */
type InternalAddAndAffirmInstructionParams = [
  u64,
  PolymeshPrimitivesSettlementSettlementType,
  u64 | null,
  u64 | null,
  PolymeshPrimitivesSettlementLeg[],
  PolymeshPrimitivesIdentityIdPortfolioId[],
  PolymeshPrimitivesMemo | null,
  BTreeSet<PolymeshPrimitivesIdentityId>
][];

/**
 * @hidden
 */
type InternalAddInstructionParams = [
  u64,
  PolymeshPrimitivesSettlementSettlementType,
  u64 | null,
  u64 | null,
  PolymeshPrimitivesSettlementLeg[],
  PolymeshPrimitivesMemo | null,
  BTreeSet<PolymeshPrimitivesIdentityId>
][];

/**
 * @hidden
 */
export const createAddInstructionResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): Instruction[] => {
    const events = filterEventRecords(receipt, 'settlement', 'InstructionCreated');

    const result = events.map(
      ({ data }) => new Instruction({ id: u64ToBigNumber(data[2]) }, context)
    );

    return result;
  };

/**
 * @hidden
 */
function getEndCondition(
  instruction: AddInstructionParams,
  latestBlock: BigNumber,
  index: number
): { endCondition: InstructionEndCondition; errorIndex: number | null } {
  let endCondition: InstructionEndCondition;
  let errorIndex = null;

  if ('endBlock' in instruction && instruction.endBlock) {
    const { endBlock } = instruction;

    if (endBlock.lte(latestBlock)) {
      errorIndex = index;
    }

    endCondition = { type: InstructionType.SettleOnBlock, endBlock };
  } else if ('endAfterBlock' in instruction && instruction.endAfterBlock) {
    endCondition = { type: InstructionType.SettleManual, endAfterBlock: instruction.endAfterBlock };
  } else {
    endCondition = { type: InstructionType.SettleOnAffirmation };
  }

  return {
    endCondition,
    errorIndex,
  };
}

/**
 * @hidden
 */
function validateFungibleLeg(leg: FungibleLeg, assetId: string): void {
  if (!('amount' in leg)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The key "amount" should be present in a fungible leg',
      data: { assetId },
    });
  }
}

/**
 * @hidden
 */
function validateNonFungibleLeg(leg: NftLeg, assetId: string): void {
  if (!('nfts' in leg)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The key "nfts" should be present in an NFT leg',
      data: { assetId },
    });
  }
}

/**
 * @hidden
 */
async function separateLegs(
  legs: InstructionLeg[],
  context: Context
): Promise<{
  fungibleLegs: InstructionFungibleLeg[];
  nftLegs: InstructionNftLeg[];
  offChainLegs: InstructionOffChainLeg[];
}> {
  const fungibleLegs: InstructionFungibleLeg[] = [];
  const nftLegs: InstructionNftLeg[] = [];
  const offChainLegs: InstructionOffChainLeg[] = [];

  for (const leg of legs) {
    if (isOffChainLeg(leg)) {
      offChainLegs.push(leg);
    } else {
      const [isFungible, isNft] = await Promise.all([
        isFungibleLegBuilder(leg, context),
        isNftLegBuilder(leg, context),
      ]);
      const assetId = await asAssetId(leg.asset, context);

      if (isFungible(leg)) {
        validateFungibleLeg(leg, assetId);
        fungibleLegs.push(leg);
      } else if (isNft(leg)) {
        validateNonFungibleLeg(leg, assetId);
        nftLegs.push(leg);
      }
    }
  }

  return { fungibleLegs, nftLegs, offChainLegs };
}

/**
 * @hidden
 */
async function assertVenueFiltering(
  instructions: AddInstructionParams[],
  venueId: BigNumber,
  context: Context
): Promise<void> {
  const assetPromises = instructions.flatMap(instruction => {
    const result: Promise<BaseAsset>[] = [];
    instruction.legs.forEach(leg => {
      if (!isOffChainLeg(leg)) {
        result.push(asBaseAsset(leg.asset, context));
      }
    });
    return result;
  });

  const assets = await Promise.all(assetPromises);

  const venueFiltering = await Promise.all(assets.map(asset => asset.getVenueFilteringDetails()));

  // finds the intersection of possible venues for the given assets
  const permittedVenues = venueFiltering.reduce<undefined | Venue[]>(
    (acc, { isEnabled, allowedVenues }) => {
      if (isEnabled) {
        if (acc === undefined) {
          acc = allowedVenues;
        } else {
          acc = acc.filter(venue => allowedVenues.some(({ id }) => venue.id.eq(id)));
        }
      }

      return acc;
    },
    undefined
  );

  if (permittedVenues !== undefined && !permittedVenues.some(({ id }) => id.eq(venueId))) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One or more assets are not allowed to be traded at this venue',
      data: {
        possibleVenues: permittedVenues.map(venue => venue.id.toString()),
        venueId: venueId.toString(),
      },
    });
  }
}

/**
 * @hidden
 */
async function getTxArgsAndErrors(
  instructions: AddInstructionParams[],
  portfoliosToAffirm: (DefaultPortfolio | NumberedPortfolio)[][],
  latestBlock: BigNumber,
  venueId: BigNumber,
  context: Context
): Promise<{
  errIndexes: {
    legEmptyErrIndexes: number[];
    legLengthErrIndexes: number[];
    legAmountErrIndexes: number[];
    endBlockErrIndexes: number[];
    datesErrIndexes: number[];
    sameIdentityErrIndexes: number[];
  };
  addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams;
  addInstructionParams: InternalAddInstructionParams;
}> {
  const addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams = [];
  const addInstructionParams: InternalAddInstructionParams = [];

  const legEmptyErrIndexes: number[] = [];
  const legLengthErrIndexes: number[] = [];
  const legAmountErrIndexes: number[] = [];
  const endBlockErrIndexes: number[] = [];
  const sameIdentityErrIndexes: number[] = [];
  /**
   * array of indexes of Instructions where the value date is before the trade date
   */
  const datesErrIndexes: number[] = [];

  await P.each(instructions, async (instruction, i) => {
    const { legs, tradeDate, valueDate, memo, mediators } = instruction;
    if (!legs.length) {
      legEmptyErrIndexes.push(i);
    }

    if (legs.length > MAX_LEGS_LENGTH) {
      legLengthErrIndexes.push(i);
    }

    const { fungibleLegs, nftLegs, offChainLegs } = await separateLegs(legs, context);

    const zeroAmountFungibleLegs = fungibleLegs.filter(leg => leg.amount.isZero());
    if (zeroAmountFungibleLegs.length) {
      legAmountErrIndexes.push(i);
    }

    const zeroNftsNonFungible = nftLegs.filter(leg => leg.nfts.length === 0);
    if (zeroNftsNonFungible.length) {
      legAmountErrIndexes.push(i);
    }

    const zeroAmountOffChainLegs = offChainLegs.filter(leg => leg.offChainAmount.isZero());
    if (zeroAmountOffChainLegs.length) {
      legAmountErrIndexes.push(i);
    }

    const sameIdentityLegs = legs.filter(leg => {
      if (isOffChainLeg(leg)) {
        return asDid(leg.from) === asDid(leg.to);
      } else {
        const { from, to } = leg;
        const fromId = portfolioLikeToPortfolioId(from);
        const toId = portfolioLikeToPortfolioId(to);
        return fromId.did === toId.did;
      }
    });

    if (sameIdentityLegs.length) {
      sameIdentityErrIndexes.push(i);
    }

    const { endCondition, errorIndex } = getEndCondition(instruction, latestBlock, i);

    if (errorIndex !== null) {
      endBlockErrIndexes.push(errorIndex);
    }

    if (tradeDate && valueDate && tradeDate > valueDate) {
      datesErrIndexes.push(i);
    }

    if (
      !legEmptyErrIndexes.length &&
      !legLengthErrIndexes.length &&
      !legAmountErrIndexes.length &&
      !endBlockErrIndexes.length &&
      !datesErrIndexes.length &&
      !sameIdentityErrIndexes.length
    ) {
      const rawVenueId = bigNumberToU64(venueId, context);
      const rawSettlementType = endConditionToSettlementType(endCondition, context);
      const rawTradeDate = optionize(dateToMoment)(tradeDate, context);
      const rawValueDate = optionize(dateToMoment)(valueDate, context);
      const rawLegs: PolymeshPrimitivesSettlementLeg[] = [];
      const rawInstructionMemo = optionize(stringToMemo)(memo, context);
      const mediatorIds = mediators?.map(mediator => asIdentity(mediator, context));
      const rawMediators = identitiesToBtreeSet(mediatorIds ?? [], context);

      await Promise.all([
        ...fungibleLegs.map(async ({ from, to, amount, asset }) => {
          const fromId = portfolioLikeToPortfolioId(from);
          const toId = portfolioLikeToPortfolioId(to);

          await Promise.all([
            assertPortfolioExists(fromId, context),
            assertPortfolioExists(toId, context),
            assertValidCdd(fromId.did, context),
            assertValidCdd(toId.did, context),
          ]);

          const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromId, context);
          const rawToPortfolio = portfolioIdToMeshPortfolioId(toId, context);

          const baseAsset = await asBaseAsset(asset, context);
          const rawLeg = legToFungibleLeg(
            {
              sender: rawFromPortfolio,
              receiver: rawToPortfolio,
              ...assetToMeshAssetIdWithKey(baseAsset, context),
              amount: bigNumberToBalance(amount, context),
            },
            context
          );

          rawLegs.push(rawLeg);
        }),
        ...nftLegs.map(async ({ from, to, nfts, asset }) => {
          const fromId = portfolioLikeToPortfolioId(from);
          const toId = portfolioLikeToPortfolioId(to);

          await Promise.all([
            assertPortfolioExists(fromId, context),
            assertPortfolioExists(toId, context),
            assertValidCdd(fromId.did, context),
            assertValidCdd(toId.did, context),
          ]);

          const baseAsset = await asBaseAsset(asset, context);

          const rawFromPortfolio = portfolioIdToMeshPortfolioId(fromId, context);
          const rawToPortfolio = portfolioIdToMeshPortfolioId(toId, context);

          const rawLeg = legToNonFungibleLeg(
            {
              sender: rawFromPortfolio,
              receiver: rawToPortfolio,
              nfts: nftToMeshNft(baseAsset, nfts, context),
            },
            context
          );

          rawLegs.push(rawLeg);
        }),
        ...offChainLegs.map(async ({ from, to, offChainAmount, asset }) => {
          const fromId = asDid(from);
          const toId = asDid(to);

          const rawFromIdentityId = stringToIdentityId(fromId, context);
          const rawToIdentityId = stringToIdentityId(toId, context);

          const rawLeg = legToOffChainLeg(
            {
              senderIdentity: rawFromIdentityId,
              receiverIdentity: rawToIdentityId,
              ...assetToMeshAssetIdWithKey(new BaseAsset({ assetId: asset }, context), context),
              amount: bigNumberToBalance(offChainAmount, context),
            },
            context
          );

          rawLegs.push(rawLeg);
        }),
      ]);

      if (portfoliosToAffirm[i].length) {
        addAndAffirmInstructionParams.push([
          rawVenueId,
          rawSettlementType,
          rawTradeDate,
          rawValueDate,
          rawLegs,
          portfoliosToAffirm[i].map(portfolio =>
            portfolioIdToMeshPortfolioId(portfolioLikeToPortfolioId(portfolio), context)
          ),
          rawInstructionMemo,
          rawMediators,
        ]);
      } else {
        addInstructionParams.push([
          rawVenueId,
          rawSettlementType,
          rawTradeDate,
          rawValueDate,
          rawLegs,
          rawInstructionMemo,
          rawMediators,
        ]);
      }
    }
  });

  return {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      legAmountErrIndexes,
      endBlockErrIndexes,
      datesErrIndexes,
      sameIdentityErrIndexes,
    },
    addAndAffirmInstructionParams,
    addInstructionParams,
  };
}

/**
 * @hidden
 */
export async function prepareAddInstruction(
  this: Procedure<Params, Instruction[], Storage>,
  args: Params
): Promise<BatchTransactionSpec<Instruction[], unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement },
      },
    },
    context,
    storage: { portfoliosToAffirm },
  } = this;
  const { instructions, venueId } = args;

  await assertVenueFiltering(instructions, venueId, context);

  const allMediators = instructions.flatMap(
    ({ mediators }) => mediators?.map(mediator => asIdentity(mediator, context)) ?? []
  );

  const [latestBlock] = await Promise.all([
    context.getLatestBlock(),
    assertVenueExists(venueId, context),
    ...allMediators.map(mediator => assertIdentityExists(mediator)),
  ]);

  if (!instructions.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instructions array cannot be empty',
    });
  }

  const {
    errIndexes: {
      legEmptyErrIndexes,
      legLengthErrIndexes,
      legAmountErrIndexes,
      endBlockErrIndexes,
      datesErrIndexes,
      sameIdentityErrIndexes,
    },
    addAndAffirmInstructionParams,
    addInstructionParams,
  } = await getTxArgsAndErrors(instructions, portfoliosToAffirm, latestBlock, venueId, context);

  if (legEmptyErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The legs array can't be empty",
      data: {
        failedInstructionIndexes: legEmptyErrIndexes,
      },
    });
  }

  if (legAmountErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction legs cannot have zero amount',
      data: {
        failedInstructionIndexes: legAmountErrIndexes,
      },
    });
  }

  if (legLengthErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'The legs array exceeds the maximum allowed length',
      data: {
        maxLength: MAX_LEGS_LENGTH,
        failedInstructionIndexes: legLengthErrIndexes,
      },
    });
  }

  if (endBlockErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'End block must be a future block',
      data: {
        failedInstructionIndexes: endBlockErrIndexes,
      },
    });
  }

  if (datesErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Value date must be after trade date',
      data: {
        failedInstructionIndexes: datesErrIndexes,
      },
    });
  }

  if (sameIdentityErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction leg cannot transfer Assets between same identity',
      data: {
        failedInstructionIndexes: sameIdentityErrIndexes,
      },
    });
  }

  /**
   * After the upgrade is out, the "withMediator" variants are safe to use exclusively
   */
  const addTx = {
    transaction: settlement.addInstructionWithMediators,
    argsArray: addInstructionParams,
  };

  const addAndAffirmTx = {
    transaction: settlement.addAndAffirmWithMediators,
    argsArray: addAndAffirmInstructionParams,
  };

  const transactions = assembleBatchTransactions([addTx, addAndAffirmTx] as const);

  return {
    transactions,
    resolver: createAddInstructionResolver(context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, Instruction[], Storage>,
  { venueId }: Params
): Promise<ProcedureAuthorization> {
  const {
    storage: { portfoliosToAffirm },
  } = this;

  const addAndAffirmTag = TxTags.settlement.AddAndAffirmWithMediators;

  const addInstructionTag = TxTags.settlement.AddInstructionWithMediators;

  let transactions: SettlementTx[] = [];
  let portfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];

  portfoliosToAffirm.forEach(portfoliosList => {
    transactions = union(transactions, [
      portfoliosList.length ? addAndAffirmTag : addInstructionTag,
    ]);
    portfolios = unionWith(portfolios, portfoliosList, isEqual);
  });

  return {
    roles: [{ type: RoleType.VenueOwner, venueId }],
    permissions: {
      assets: [],
      portfolios,
      transactions,
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, Instruction[], Storage>,
  { instructions }: Params
): Promise<Storage> {
  const { context } = this;

  const identity = await context.getSigningIdentity();

  const portfoliosToAffirm = await P.map(instructions, async ({ legs }) => {
    const portfolios = await P.map(legs, async leg => {
      const result = [];
      if (!isOffChainLeg(leg)) {
        const { from, to } = leg;
        const fromPortfolio = portfolioLikeToPortfolio(from, context);
        const toPortfolio = portfolioLikeToPortfolio(to, context);

        const [fromCustodied, toCustodied] = await Promise.all([
          fromPortfolio.isCustodiedBy({ identity }),
          toPortfolio.isCustodiedBy({ identity }),
        ]);

        if (fromCustodied) {
          result.push(fromPortfolio);
        }

        if (toCustodied) {
          result.push(toPortfolio);
        }
      }
      return result;
    });
    return flatten(portfolios);
  });

  return {
    portfoliosToAffirm,
  };
}

/**
 * @hidden
 */
export const addInstruction = (): Procedure<Params, Instruction[], Storage> =>
  new Procedure(prepareAddInstruction, getAuthorization, prepareStorage);
