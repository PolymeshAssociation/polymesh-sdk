import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  AssetStat,
  ClaimCountTransferRestrictionInput,
  ClaimType,
  ErrorCode,
  TransferRestriction,
  TransferRestrictionParams,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetStatToStat,
  assetToMeshAssetId,
  complianceConditionsToBtreeSet,
  transferRestrictionToPolymeshTransferCondition,
} from '~/utils/conversion';
import { assertStatIsSet } from '~/utils/internal';

export type Params = { asset: FungibleAsset } & TransferRestrictionParams;

export interface SetTransferRestrictionsStorage {
  currentStats: AssetStat[];
}

/**
 * @hidden
 * Checks if the input restrictions are valid
 */
/**
 * Ensure claim-count restrictions do not contain duplicate identifiers.
 */
/**
 * Ensure claim-count restrictions do not contain duplicate identifiers.
 */
function ensureClaimCountRestrictionIsUnique(
  restriction: ClaimCountTransferRestrictionInput,
  seenRestrictions: Set<string>
): void {
  const { claim, issuer } = restriction;

  /* istanbul ignore next */
  if (!claim) {
    return;
  }

  let claimValue = '';

  if (claim.type === ClaimType.Jurisdiction) {
    claimValue = claim.countryCode ?? 'none';
  } else if (claim.type === ClaimType.Accredited) {
    claimValue = claim.accredited ? 'true' : 'false';
  } else if (claim.type === ClaimType.Affiliate) {
    claimValue = claim.affiliate ? 'true' : 'false';
  }

  const key = `${claim.type}:${issuer.did}:${claimValue}`;

  if (seenRestrictions.has(key)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Duplicate restriction found in input',
      data: { restriction },
    });
  }

  seenRestrictions.add(key);
}

/**
 * Ensure there are no duplicate claim-based restrictions in the provided input.
 */
function assertInputValid(input: TransferRestrictionParams): void {
  const seenRestrictions = new Set<string>();

  for (const restriction of input.restrictions) {
    if (restriction.type === TransferRestrictionType.ClaimCount) {
      ensureClaimCountRestrictionIsUnique(restriction, seenRestrictions);
    }
  }
}

type RestrictionInput = TransferRestrictionParams['restrictions'][number];

/**
 * Convert loose restriction input into a normalized transfer restriction.
 */
function toTransferRestriction(restriction: RestrictionInput): TransferRestriction {
  if ('count' in restriction) {
    return {
      type: TransferRestrictionType.Count,
      value: restriction.count,
    };
  }

  if ('percentage' in restriction) {
    return {
      type: TransferRestrictionType.Percentage,
      value: restriction.percentage,
    };
  }

  if (restriction.type === TransferRestrictionType.ClaimCount) {
    const { min, max, claim, issuer } = restriction;

    return {
      type: TransferRestrictionType.ClaimCount,
      value: {
        min,
        max,
        claim,
        issuer,
      },
    };
  }

  if (restriction.type === TransferRestrictionType.ClaimPercentage) {
    const { min, max, claim, issuer } = restriction;

    return {
      type: TransferRestrictionType.ClaimPercentage,
      value: {
        min,
        max,
        claim,
        issuer,
      },
    };
  }

  /* istanbul ignore next */
  throw new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message: `Unexpected transfer restriction: "${JSON.stringify(
      restriction
    )}". Please report this to the Polymesh team`,
  });
}

/**
 * @hidden
 */
export function prepareSetTransferRestrictions(
  this: Procedure<Params, void, SetTransferRestrictionsStorage>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'statistics', 'setAssetTransferCompliance'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
      },
    },
    context,
    storage: { currentStats },
  } = this;
  const { restrictions, asset } = args;
  const rawAssetId = assetToMeshAssetId(asset, context);

  assertInputValid(args);

  const conditions = restrictions.map(restriction => {
    const condition = toTransferRestriction(restriction);
    assertStatIsSet(currentStats, condition);

    return transferRestrictionToPolymeshTransferCondition(condition, context);
  });

  const rawConditions = complianceConditionsToBtreeSet(conditions, context);

  return Promise.resolve({
    transaction: statistics.setAssetTransferCompliance,
    args: [rawAssetId, rawConditions],
    resolver: undefined,
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, SetTransferRestrictionsStorage>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [asset],
      transactions: [TxTags.statistics.SetAssetTransferCompliance],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(
  this: Procedure<Params, void, SetTransferRestrictionsStorage>,
  { asset }: Params
): Promise<SetTransferRestrictionsStorage> {
  const {
    context: {
      polymeshApi: {
        query: { statistics },
      },
    },
    context,
  } = this;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawCurrentStats = await statistics.activeAssetStats(rawAssetId);
  const currentStats = [...rawCurrentStats].map(stat => assetStatToStat(stat, context));

  return {
    currentStats,
  };
}

/**
 * @hidden
 */
export const setTransferRestrictions = (): Procedure<
  Params,
  void,
  SetTransferRestrictionsStorage
> => new Procedure(prepareSetTransferRestrictions, getAuthorization, prepareStorage);
