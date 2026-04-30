import { BTreeSet, u64 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementSettlementType,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { flatten, isEqual, union, unionWith } from 'lodash';

import {
  assertAssetHolderExists,
  assertValidCdd,
  assertVenueExists,
  getAssetHolderDid,
} from '~/api/procedures/utils';
import {
  Account,
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
  AssetHolder,
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
  assetHolderIdsToBtreeSet,
  assetHolderIdToMeshAssetHolder,
  assetHolderLikeToAssetHolder,
  assetHolderLikeToAssetHolderId,
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  endConditionToSettlementType,
  identitiesToBtreeSet,
  legToFungibleLeg,
  legToNonFungibleLeg,
  legToOffChainLeg,
  nftToMeshNft,
  stringToAssetId,
  stringToIdentityId,
  stringToMemo,
  stringToTicker,
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
  venueId?: BigNumber | undefined;
};

/**
 * @hidden
 */
export interface Storage {
  assetHoldersToAffirm: AssetHolder[][];
}

/**
 * @hidden
 */
type InternalAddAndAffirmInstructionParams = [
  u64 | null,
  PolymeshPrimitivesSettlementSettlementType,
  u64 | null,
  u64 | null,
  PolymeshPrimitivesSettlementLeg[],
  BTreeSet<PolymeshPrimitivesIdentityIdPortfolioId> | BTreeSet<PolymeshPrimitivesAssetAssetHolder>,
  PolymeshPrimitivesMemo | null,
  BTreeSet<PolymeshPrimitivesIdentityId>
][];

/**
 * @hidden
 */
type InternalAddInstructionParams = [
  u64 | null,
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
function checkAllErrorsAreEmpty(errors: ErrIndexes): boolean {
  const {
    legEmptyErrIndexes,
    legLengthErrIndexes,
    legAmountErrIndexes,
    endBlockErrIndexes,
    datesErrIndexes,
    sameSenderReceiverIndexes,
    offChainNoVenueErrIndexes,
    mediatorErrIndexes,
  } = errors;

  return (
    !legEmptyErrIndexes.length &&
    !legLengthErrIndexes.length &&
    !legAmountErrIndexes.length &&
    !endBlockErrIndexes.length &&
    !datesErrIndexes.length &&
    !sameSenderReceiverIndexes.length &&
    !offChainNoVenueErrIndexes.length &&
    !mediatorErrIndexes.length
  );
}

/**
 * @hidden
 */
async function getRawLegDetails(
  leg: InstructionFungibleLeg | InstructionNftLeg,
  context: Context
): Promise<{
  sender: PolymeshPrimitivesAssetAssetHolder;
  receiver: PolymeshPrimitivesAssetAssetHolder;
  baseAsset: BaseAsset;
}> {
  const { from, to, asset } = leg;
  const fromId = assetHolderLikeToAssetHolderId(from);
  const toId = assetHolderLikeToAssetHolderId(to);

  const assertPromises = [
    assertAssetHolderExists(fromId, context),
    assertAssetHolderExists(toId, context),
  ];

  if (context.isV7) {
    const [fromDid, toDid] = await Promise.all([
      getAssetHolderDid(from, context),
      getAssetHolderDid(to, context),
    ]);

    if (!fromDid) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'From Asset Holder does not exist',
      });
    }
    if (!toDid) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'To Asset Holder does not exist',
      });
    }
    assertPromises.push(assertValidCdd(fromDid, context));
    assertPromises.push(assertValidCdd(toDid, context));
  }
  await Promise.all(assertPromises);

  const sender = await assetHolderIdToMeshAssetHolder(fromId, context);
  const receiver = await assetHolderIdToMeshAssetHolder(toId, context);

  const baseAsset = await asBaseAsset(asset, context);

  return { sender, receiver, baseAsset };
}

/**
 * @hidden
 */
async function mapFungibleLeg(
  leg: InstructionFungibleLeg,
  context: Context
): Promise<PolymeshPrimitivesSettlementLeg> {
  const { amount } = leg;
  const { sender, receiver, baseAsset } = await getRawLegDetails(leg, context);

  const assetId = stringToAssetId(baseAsset.id, context);
  const rawLeg = legToFungibleLeg(
    {
      sender,
      receiver,
      assetId,
      amount: bigNumberToBalance(amount, context),
    },
    context
  );

  return rawLeg;
}
/**
 * @hidden
 */
async function mapNftLeg(
  leg: InstructionNftLeg,
  context: Context
): Promise<PolymeshPrimitivesSettlementLeg> {
  const { sender, receiver, baseAsset } = await getRawLegDetails(leg, context);
  const rawLeg = legToNonFungibleLeg(
    {
      sender,
      receiver,
      nfts: nftToMeshNft(baseAsset, leg.nfts, context),
    },
    context
  );

  return rawLeg;
}

/**
 * @hidden
 */
function mapOffChainLeg(
  leg: InstructionOffChainLeg,
  context: Context
): PolymeshPrimitivesSettlementLeg {
  const { from, to, offChainAmount, asset } = leg;
  const fromId = asDid(from);
  const toId = asDid(to);

  const rawFromIdentityId = stringToIdentityId(fromId, context);
  const rawToIdentityId = stringToIdentityId(toId, context);

  const rawLeg = legToOffChainLeg(
    {
      senderIdentity: rawFromIdentityId,
      receiverIdentity: rawToIdentityId,
      ticker: stringToTicker(asset, context),
      amount: bigNumberToBalance(offChainAmount, context),
    },
    context
  );

  return rawLeg;
}

/**
 * @hidden
 */
function getEndCondition(
  instruction: AddInstructionParams,
  latestBlock: BigNumber,
  index: number
): {
  endCondition: InstructionEndCondition;
  errorEndBlockIndex: number | null;
  errorMediatorIndex: number | null;
} {
  let endCondition: InstructionEndCondition;
  let errorEndBlockIndex = null;
  let errorMediatorIndex = null;

  if ('endBlock' in instruction && instruction.endBlock) {
    const { endBlock } = instruction;

    if (endBlock.lte(latestBlock)) {
      errorEndBlockIndex = index;
    }

    endCondition = { type: InstructionType.SettleOnBlock, endBlock };
  } else if ('endAfterBlock' in instruction && instruction.endAfterBlock) {
    endCondition = { type: InstructionType.SettleManual, endAfterBlock: instruction.endAfterBlock };
  } else if ('endAfterLock' in instruction && instruction.endAfterLock) {
    endCondition = { type: InstructionType.SettleAfterLock };
    if (!instruction.mediators?.length) {
      errorMediatorIndex = index;
    }
  } else {
    endCondition = { type: InstructionType.SettleOnAffirmation };
  }

  return {
    endCondition,
    errorEndBlockIndex,
    errorMediatorIndex,
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
function validateInstructionErrors(errIndexes: ErrIndexes): void {
  const {
    legEmptyErrIndexes,
    legAmountErrIndexes,
    legLengthErrIndexes,
    endBlockErrIndexes,
    datesErrIndexes,
    sameSenderReceiverIndexes,
    offChainNoVenueErrIndexes,
    mediatorErrIndexes,
  } = errIndexes;

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

  if (sameSenderReceiverIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction leg cannot transfer Assets between same asset holder',
      data: {
        failedInstructionIndexes: sameSenderReceiverIndexes,
      },
    });
  }

  if (offChainNoVenueErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction legs cannot be offchain without a venue',
      data: {
        failedInstructionIndexes: offChainNoVenueErrIndexes,
      },
    });
  }

  if (mediatorErrIndexes.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Instruction must have at least one mediator',
      data: {
        failedInstructionIndexes: mediatorErrIndexes,
      },
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
  venueId: BigNumber | undefined,
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

  if (permittedVenues !== undefined) {
    if (venueId === undefined) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'One or more of the assets must be traded at a venue',
        data: {
          possibleVenues: permittedVenues.map(venue => venue.id.toString()),
        },
      });
    }

    if (!permittedVenues.some(({ id }) => id.eq(venueId))) {
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
}

type ErrIndexes = {
  legEmptyErrIndexes: number[];
  legLengthErrIndexes: number[];
  legAmountErrIndexes: number[];
  endBlockErrIndexes: number[];
  datesErrIndexes: number[];
  sameSenderReceiverIndexes: number[];
  offChainNoVenueErrIndexes: number[];
  mediatorErrIndexes: number[];
};

/**
 * @hidden
 */
async function validateInstruction(
  instruction: AddInstructionParams,
  index: number,
  venueId: BigNumber | undefined,
  context: Context
): Promise<{
  errors: Partial<ErrIndexes>;
  legs: {
    fungibleLegs: InstructionFungibleLeg[];
    nftLegs: InstructionNftLeg[];
    offChainLegs: InstructionOffChainLeg[];
  };
}> {
  const { legs, tradeDate, valueDate } = instruction;
  const errors: Partial<ErrIndexes> = {};

  if (!legs.length) {
    errors.legEmptyErrIndexes = [index];
  }

  if (legs.length > MAX_LEGS_LENGTH) {
    errors.legLengthErrIndexes = [index];
  }

  const separatedLegs = await separateLegs(legs, context);

  if (venueId === undefined && separatedLegs.offChainLegs.length > 0) {
    errors.offChainNoVenueErrIndexes = [index];
  }

  const zeroAmountFungibleLegs = separatedLegs.fungibleLegs.filter(leg => leg.amount.isZero());
  const zeroNftsNonFungible = separatedLegs.nftLegs.filter(leg => leg.nfts.length === 0);
  const zeroAmountOffChainLegs = separatedLegs.offChainLegs.filter(leg =>
    leg.offChainAmount.isZero()
  );

  if (
    zeroAmountFungibleLegs.length ||
    zeroNftsNonFungible.length ||
    zeroAmountOffChainLegs.length
  ) {
    errors.legAmountErrIndexes = [index];
  }

  const sameSenderReceiver = legs.filter(async leg => {
    if (isOffChainLeg(leg)) {
      return asDid(leg.from) === asDid(leg.to);
    } else {
      const { from, to } = leg;
      const [fromDid, toDid] = await Promise.all([
        getAssetHolderDid(from, context),
        getAssetHolderDid(to, context),
      ]);
      return fromDid === toDid;
    }
  });

  if (sameSenderReceiver.length) {
    errors.sameSenderReceiverIndexes = [index];
  }

  if (tradeDate && valueDate && tradeDate > valueDate) {
    errors.datesErrIndexes = [index];
  }

  return { errors, legs: separatedLegs };
}

/**
 * @hidden
 */
function buildInstructionParams(
  instruction: AddInstructionParams,
  endCondition: InstructionEndCondition,
  venueId: BigNumber | undefined,
  context: Context
): {
  rawVenueId: u64 | null;
  rawSettlementType: PolymeshPrimitivesSettlementSettlementType;
  rawTradeDate: u64 | null;
  rawValueDate: u64 | null;
  rawLegs: PolymeshPrimitivesSettlementLeg[];
  rawInstructionMemo: PolymeshPrimitivesMemo | null;
  rawMediators: BTreeSet<PolymeshPrimitivesIdentityId>;
} {
  const { tradeDate, valueDate, memo, mediators } = instruction;

  const rawVenueId = optionize(bigNumberToU64)(venueId, context);
  const rawSettlementType = endConditionToSettlementType(endCondition, context);
  const rawTradeDate = optionize(dateToMoment)(tradeDate, context);
  const rawValueDate = optionize(dateToMoment)(valueDate, context);
  const rawInstructionMemo = optionize(stringToMemo)(memo, context);
  const mediatorIds = mediators?.map(mediator => asIdentity(mediator, context));
  const rawMediators = identitiesToBtreeSet(mediatorIds ?? [], context);

  return {
    rawVenueId,
    rawSettlementType,
    rawTradeDate,
    rawValueDate,
    rawLegs: [],
    rawInstructionMemo,
    rawMediators,
  };
}

/**
 * @hidden
 */
async function getTxArgsAndErrors(
  instructions: AddInstructionParams[],
  assetHoldersToAffirm: AssetHolder[][],
  latestBlock: BigNumber,
  venueId: BigNumber | undefined,
  context: Context
): Promise<{
  errIndexes: ErrIndexes;
  addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams;
  addInstructionParams: InternalAddInstructionParams;
}> {
  const addAndAffirmInstructionParams: InternalAddAndAffirmInstructionParams = [];
  const addInstructionParams: InternalAddInstructionParams = [];

  const errIndexes: ErrIndexes = {
    legEmptyErrIndexes: [],
    legLengthErrIndexes: [],
    legAmountErrIndexes: [],
    endBlockErrIndexes: [],
    datesErrIndexes: [],
    sameSenderReceiverIndexes: [],
    offChainNoVenueErrIndexes: [],
    mediatorErrIndexes: [],
  };

  for (const [i, instruction] of instructions.entries()) {
    // Validate instruction and get separated legs
    const { errors, legs } = await validateInstruction(instruction, i, venueId, context);

    // Merge validation errors
    Object.entries(errors).forEach(([key, indexes]) => {
      if (indexes && indexes.length > 0) {
        const targetArray = (errIndexes as Record<string, number[]>)[key];
        if (targetArray) {
          targetArray.push(...indexes);
        }
      }
    });

    // Check end condition
    const { endCondition, errorEndBlockIndex, errorMediatorIndex } = getEndCondition(
      instruction,
      latestBlock,
      i
    );

    if (errorEndBlockIndex !== null) {
      errIndexes.endBlockErrIndexes.push(errorEndBlockIndex);
    }

    if (errorMediatorIndex !== null) {
      errIndexes.mediatorErrIndexes.push(errorMediatorIndex);
    }

    if (checkAllErrorsAreEmpty(errIndexes)) {
      const baseParams = buildInstructionParams(instruction, endCondition, venueId, context);

      const rawLegValues = await Promise.all([
        ...legs.fungibleLegs.map(async leg => await mapFungibleLeg(leg, context)),
        ...legs.nftLegs.map(async leg => await mapNftLeg(leg, context)),
        ...legs.offChainLegs.map(async leg => await Promise.resolve(mapOffChainLeg(leg, context))),
      ]);

      const rawLegs: PolymeshPrimitivesSettlementLeg[] = rawLegValues.flat();

      if (assetHoldersToAffirm[i]!.length) {
        const rawAssetHolders = await Promise.all(
          assetHoldersToAffirm[i]!.map(
            async portfolio =>
              await assetHolderIdToMeshAssetHolder(
                assetHolderLikeToAssetHolderId(portfolio),
                context
              )
          )
        );
        addAndAffirmInstructionParams.push([
          baseParams.rawVenueId,
          baseParams.rawSettlementType,
          baseParams.rawTradeDate,
          baseParams.rawValueDate,
          rawLegs,
          assetHolderIdsToBtreeSet(rawAssetHolders, context),
          baseParams.rawInstructionMemo,
          baseParams.rawMediators,
        ]);
      } else {
        addInstructionParams.push([
          baseParams.rawVenueId,
          baseParams.rawSettlementType,
          baseParams.rawTradeDate,
          baseParams.rawValueDate,
          rawLegs,
          baseParams.rawInstructionMemo,
          baseParams.rawMediators,
        ]);
      }
    }
  }

  return {
    errIndexes,
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
    storage: { assetHoldersToAffirm: portfoliosToAffirm },
  } = this;
  const { instructions, venueId } = args;

  const venueAssertions = [assertVenueFiltering(instructions, venueId, context)];
  if (venueId) {
    venueAssertions.push(assertVenueExists(venueId, context));
  }

  const allMediators = instructions.flatMap(
    ({ mediators }) => mediators?.map(mediator => asIdentity(mediator, context)) ?? []
  );

  const [latestBlock] = await Promise.all([
    context.getLatestBlock(),
    ...allMediators.map(mediator => assertIdentityExists(mediator)),
    ...venueAssertions,
  ]);

  if (!instructions.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Instructions array cannot be empty',
    });
  }

  const { errIndexes, addAndAffirmInstructionParams, addInstructionParams } =
    await getTxArgsAndErrors(instructions, portfoliosToAffirm, latestBlock, venueId, context);

  validateInstructionErrors(errIndexes);

  /**
   * After the upgrade is out, the "withMediator" variants are safe to use exclusively
   */
  const addTx = {
    transaction: settlement.addInstructionWithMediators,
    argsArray: addInstructionParams,
  };

  const addAndAffirmTx = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transaction: settlement.addAndAffirmWithMediators as any, // TODO @prashantasdeveloper remove this when removing dual version support
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
export function getAuthorization(
  this: Procedure<Params, Instruction[], Storage>,
  { venueId }: Params
): ProcedureAuthorization {
  const {
    storage: { assetHoldersToAffirm },
  } = this;

  const addAndAffirmTag = TxTags.settlement.AddAndAffirmWithMediators;

  const addInstructionTag = TxTags.settlement.AddInstructionWithMediators;

  let transactions: SettlementTx[] = [];
  let portfolios: (DefaultPortfolio | NumberedPortfolio)[] = [];

  assetHoldersToAffirm.forEach(assetHolders => {
    transactions = union(transactions, [assetHolders.length ? addAndAffirmTag : addInstructionTag]);
    portfolios = unionWith(
      portfolios,
      assetHolders.filter(holder => !(holder instanceof Account)) as (
        | DefaultPortfolio
        | NumberedPortfolio
      )[],
      isEqual
    );
  });

  return {
    roles: venueId ? [{ type: RoleType.VenueOwner, venueId }] : undefined,
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

  const checkIfAssetHolderCanBeAffirmed = async (
    assetHolder: AssetHolder
  ): Promise<AssetHolder | null> => {
    if (assetHolder instanceof Account) {
      return assetHolder.address === context.getSigningAddress() ? null : assetHolder;
    }

    const isCustodied = await assetHolder.isCustodiedBy({ identity });
    if (isCustodied) {
      return assetHolder;
    }

    return null;
  };

  const assetHoldersToAffirm = await Promise.all(
    instructions.map(async ({ legs }) => {
      const portfolios = await Promise.all(
        legs.map(async leg => {
          const result = [];
          if (!isOffChainLeg(leg)) {
            const { from, to } = leg;
            const fromAssetHolder = assetHolderLikeToAssetHolder(from, context);
            const toAssetHolder = assetHolderLikeToAssetHolder(to, context);

            const [fromHolder, toHolder] = await Promise.all([
              checkIfAssetHolderCanBeAffirmed(fromAssetHolder),
              checkIfAssetHolderCanBeAffirmed(toAssetHolder),
            ]);

            if (fromHolder) {
              result.push(fromHolder);
            }

            if (toHolder) {
              result.push(toHolder);
            }
          }
          return result;
        })
      );
      return flatten(portfolios);
    })
  );

  return {
    assetHoldersToAffirm,
  };
}

/**
 * @hidden
 */
export const addInstruction = (): Procedure<Params, Instruction[], Storage> =>
  new Procedure(prepareAddInstruction, getAuthorization, prepareStorage);
