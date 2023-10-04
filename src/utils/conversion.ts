import { bool, Bytes, Option, Text, u8, U8aFixed, u16, u32, u64, u128, Vec } from '@polkadot/types';
import { AccountId, Balance, BlockHash, Hash, Permill } from '@polkadot/types/interfaces';
import {
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsDistribution,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletStoFundraiser,
  PalletStoFundraiserTier,
  PalletStoPriceTier,
  PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesAssetNonFungibleType,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesCddId,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesConditionConditionType,
  PolymeshPrimitivesConditionTargetIdentity,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesDocumentHash,
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityClaimScope,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesIdentityIdPortfolioKind,
  PolymeshPrimitivesJurisdictionCountryCode,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesMultisigProposalStatus,
  PolymeshPrimitivesNftNftMetadataAttribute,
  PolymeshPrimitivesNftNfTs,
  PolymeshPrimitivesPortfolioFund,
  PolymeshPrimitivesPosRatio,
  PolymeshPrimitivesSecondaryKey,
  PolymeshPrimitivesSecondaryKeyPermissions,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesSettlementAffirmationStatus,
  PolymeshPrimitivesSettlementInstructionStatus,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementSettlementType,
  PolymeshPrimitivesSettlementVenueType,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatClaim,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { ITuple } from '@polkadot/types/types';
import { BTreeSet } from '@polkadot/types-codec';
import {
  hexHasPrefix,
  hexToString,
  hexToU8a,
  isHex,
  stringLowerFirst,
  stringToU8a,
  stringUpperFirst,
  u8aConcat,
  u8aFixLength,
  u8aToHex,
  u8aToString,
} from '@polkadot/util';
import { blake2AsHex, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import { computeWithoutCheck } from 'iso-7064';
import {
  camelCase,
  flatten,
  groupBy,
  includes,
  map,
  padEnd,
  range,
  rangeRight,
  snakeCase,
  uniq,
  values,
} from 'lodash';

import { assertCaTaxWithholdingsValid, UnreachableCaseError } from '~/api/procedures/utils';
import { countryCodeToMeshCountryCode, meshCountryCodeToCountryCode } from '~/generated/utils';
import {
  Account,
  Checkpoint,
  CheckpointSchedule,
  Context,
  CustomPermissionGroup,
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  KnownPermissionGroup,
  NumberedPortfolio,
  PolymeshError,
  Portfolio,
  Venue,
} from '~/internal';
import { AuthTypeEnum, CallIdEnum, ModuleIdEnum } from '~/middleware/enums';
import {
  Block,
  Claim as MiddlewareClaim,
  Instruction,
  Portfolio as MiddlewarePortfolio,
} from '~/middleware/types';
import { ClaimScopeTypeEnum, MiddlewareScope } from '~/middleware/typesV1';
import {
  AssetComplianceResult,
  AuthorizationType as MeshAuthorizationType,
  CanTransferResult,
  CddStatus,
  ComplianceRequirementResult,
  GranularCanTransferResult,
  Moment,
} from '~/polkadot/polymesh';
import {
  AffirmationStatus,
  AssetDocument,
  Authorization,
  AuthorizationType,
  Claim,
  ClaimCountRestrictionValue,
  ClaimCountStatInput,
  ClaimData,
  ClaimPercentageRestrictionValue,
  ClaimType,
  Compliance,
  Condition,
  ConditionCompliance,
  ConditionTarget,
  ConditionType,
  CorporateActionKind,
  CorporateActionParams,
  CorporateActionTargets,
  CountryCode,
  CountTransferRestrictionInput,
  DividendDistributionParams,
  ErrorCode,
  EventIdentifier,
  ExternalAgentCondition,
  HistoricInstruction,
  IdentityCondition,
  IdentityWithClaims,
  InputCorporateActionTargets,
  InputCorporateActionTaxWithholdings,
  InputRequirement,
  InputStatClaim,
  InputStatType,
  InputTrustedClaimIssuer,
  InstructionEndCondition,
  InstructionType,
  KnownAssetType,
  KnownNftType,
  MetadataKeyId,
  MetadataLockStatus,
  MetadataSpec,
  MetadataType,
  MetadataValue,
  MetadataValueDetails,
  ModuleName,
  MultiClaimCondition,
  NftMetadataInput,
  OfferingBalanceStatus,
  OfferingDetails,
  OfferingSaleStatus,
  OfferingTier,
  OfferingTimingStatus,
  PermissionedAccount,
  PermissionGroupType,
  Permissions,
  PermissionsLike,
  PermissionType,
  PortfolioId,
  PortfolioLike,
  PortfolioMovementFungible,
  PortfolioMovementNonFungible,
  ProposalStatus,
  Requirement,
  RequirementCompliance,
  Scope,
  ScopeType,
  SectionPermissions,
  SecurityIdentifier,
  SecurityIdentifierType,
  Signer,
  SignerType,
  SignerValue,
  SingleClaimCondition,
  StatClaimType,
  StatType,
  TargetTreatment,
  Tier,
  TransactionPermissions,
  TransferBreakdown,
  TransferError,
  TransferRestriction,
  TransferRestrictionType,
  TransferStatus,
  TrustedClaimIssuer,
  TxGroup,
  TxTag,
  TxTags,
  VenueType,
} from '~/types';
import {
  CorporateActionIdentifier,
  ExemptKey,
  ExtrinsicIdentifier,
  InstructionStatus,
  InternalAssetType,
  InternalNftType,
  PalletPermissions,
  PermissionGroupIdentifier,
  PermissionsEnum,
  PolymeshTx,
  StatClaimInputType,
  StatClaimIssuer,
  TickerKey,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  IGNORE_CHECKSUM,
  MAX_BALANCE,
  MAX_DECIMALS,
  MAX_MEMO_LENGTH,
  MAX_MODULE_LENGTH,
  MAX_TICKER_LENGTH,
} from '~/utils/constants';
import {
  asDid,
  asNftId,
  assertAddressValid,
  assertIsInteger,
  assertIsPositive,
  assertTickerValid,
  asTicker,
  conditionsAreEqual,
  createClaim,
  isModuleOrTagMatch,
  optionize,
  padString,
  removePadding,
} from '~/utils/internal';
import {
  isIdentityCondition,
  isMultiClaimCondition,
  isNumberedPortfolio,
  isSingleClaimCondition,
} from '~/utils/typeguards';

export * from '~/generated/utils';

/**
 * Generate an Asset's DID from a ticker
 */
export function tickerToDid(ticker: string): string {
  return blake2AsHex(
    u8aConcat(stringToU8a('SECURITY_TOKEN:'), u8aFixLength(stringToU8a(ticker), 96, true))
  );
}

/**
 * @hidden
 */
export function booleanToBool(value: boolean, context: Context): bool {
  return context.createType('bool', value);
}

/**
 * @hidden
 */
export function boolToBoolean(value: bool): boolean {
  return value.isTrue;
}

/**
 * @hidden
 */
export function stringToBytes(bytes: string, context: Context): Bytes {
  return context.createType('Bytes', bytes);
}

/**
 * @hidden
 */
export function bytesToString(bytes: Bytes): string {
  return u8aToString(bytes);
}

/**
 * @hidden
 */
export function stringToTicker(ticker: string, context: Context): PolymeshPrimitivesTicker {
  assertTickerValid(ticker);

  return context.createType('PolymeshPrimitivesTicker', padString(ticker, MAX_TICKER_LENGTH));
}

/**
 * @hidden
 */
export function stringToTickerKey(ticker: string, context: Context): TickerKey {
  return { Ticker: stringToTicker(ticker, context) };
}

/**
 * @hidden
 */
export function tickerToString(ticker: PolymeshPrimitivesTicker): string {
  return removePadding(u8aToString(ticker));
}

/**
 * @hidden
 */
export function stringToU8aFixed(value: string, context: Context): U8aFixed {
  return context.createType('U8aFixed', value);
}

/**
 * @hidden
 */
export function dateToMoment(date: Date, context: Context): Moment {
  return context.createType('u64', date.getTime());
}

/**
 * @hidden
 */
export function momentToDate(moment: Moment): Date {
  return new Date(moment.toNumber());
}

/**
 * @hidden
 */
export function stringToAccountId(accountId: string, context: Context): AccountId {
  assertAddressValid(accountId, context.ss58Format);

  return context.createType('AccountId', accountId);
}

/**
 * @hidden
 */
export function accountIdToString(accountId: AccountId): string {
  return accountId.toString();
}

/**
 * @hidden
 */
export function hashToString(hash: Hash): string {
  return hash.toString();
}

/**
 * @hidden
 */
export function stringToHash(hash: string, context: Context): Hash {
  return context.createType('Hash', hash);
}

/**
 * @hidden
 */
export function stringToBlockHash(blockHash: string, context: Context): BlockHash {
  return context.createType('BlockHash', blockHash);
}

/**
 * @hidden
 */
export function stringToIdentityId(
  identityId: string,
  context: Context
): PolymeshPrimitivesIdentityId {
  return context.createType('PolymeshPrimitivesIdentityId', identityId);
}

/**
 * @hidden
 */
export function identityIdToString(identityId: PolymeshPrimitivesIdentityId): string {
  return identityId.toString();
}

/**
 * @hidden
 */
export function signerValueToSignatory(
  signer: SignerValue,
  context: Context
): PolymeshPrimitivesSecondaryKeySignatory {
  return context.createType('PolymeshPrimitivesSecondaryKeySignatory', {
    [signer.type]: signer.value,
  });
}

/**
 * @hidden
 */
function createSignerValue(type: SignerType, value: string): SignerValue {
  return {
    type,
    value,
  };
}

/**
 * @hidden
 */
export function signatoryToSignerValue(
  signatory: PolymeshPrimitivesSecondaryKeySignatory
): SignerValue {
  if (signatory.isAccount) {
    return createSignerValue(SignerType.Account, accountIdToString(signatory.asAccount));
  }

  return createSignerValue(SignerType.Identity, identityIdToString(signatory.asIdentity));
}

/**
 * @hidden
 */
export function signerToSignerValue(signer: Signer): SignerValue {
  if (signer instanceof Account) {
    return createSignerValue(SignerType.Account, signer.address);
  }

  return createSignerValue(SignerType.Identity, signer.did);
}

/**
 * @hidden
 */
export function signerValueToSigner(signerValue: SignerValue, context: Context): Signer {
  const { type, value } = signerValue;

  if (type === SignerType.Account) {
    return new Account({ address: value }, context);
  }

  return new Identity({ did: value }, context);
}

/**
 * @hidden
 */
export function signerToSignatory(
  signer: Signer,
  context: Context
): PolymeshPrimitivesSecondaryKeySignatory {
  return signerValueToSignatory(signerToSignerValue(signer), context);
}

/**
 * @hidden
 */
export function signerToString(signer: string | Signer): string {
  if (typeof signer === 'string') {
    return signer;
  }

  return signerToSignerValue(signer).value;
}

/**
 * @hidden
 */
export function u64ToBigNumber(value: u64): BigNumber {
  return new BigNumber(value.toString());
}

/**
 * @hidden
 */
export function u128ToBigNumber(value: u128): BigNumber {
  return new BigNumber(value.toString());
}

/**
 * @hidden
 */
export function bigNumberToU64(value: BigNumber, context: Context): u64 {
  assertIsInteger(value);
  assertIsPositive(value);
  return context.createType('u64', value.toString());
}
/**
 * @hidden
 */
export function bigNumberToU128(value: BigNumber, context: Context): u128 {
  assertIsInteger(value);
  assertIsPositive(value);
  return context.createType('u128', value.toString());
}

/**
 * @hidden
 */
export function percentageToPermill(value: BigNumber, context: Context): Permill {
  assertIsPositive(value);

  if (value.gt(100)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "Percentage shouldn't exceed 100",
    });
  }

  return context.createType('Permill', value.shiftedBy(4).toString()); // (value : 100) * 10^6
}

/**
 * @hidden
 *
 * @note returns a percentage value ([0, 100])
 */
export function permillToBigNumber(value: Permill): BigNumber {
  return new BigNumber(value.toString()).shiftedBy(-4); // (value : 10^6) * 100
}

/**
 *  @hidden
 */
export function meshClaimToInputStatClaim(
  claim: PolymeshPrimitivesStatisticsStatClaim
): InputStatClaim {
  if (claim.isAccredited) {
    return {
      type: ClaimType.Accredited,
      accredited: boolToBoolean(claim.asAccredited),
    };
  } else if (claim.isAffiliate) {
    return {
      type: ClaimType.Affiliate,
      affiliate: boolToBoolean(claim.asAffiliate),
    };
  } else {
    return {
      type: ClaimType.Jurisdiction,
      countryCode: claim.asJurisdiction.isSome
        ? meshCountryCodeToCountryCode(claim.asJurisdiction.unwrap())
        : undefined,
    };
  }
}

/**
 * @hidden
 */
export function claimCountToClaimCountRestrictionValue(
  value: ITuple<
    [PolymeshPrimitivesStatisticsStatClaim, PolymeshPrimitivesIdentityId, u64, Option<u64>]
  >,
  context: Context
): ClaimCountRestrictionValue {
  const [claim, issuer, min, max] = value;
  return {
    claim: meshClaimToInputStatClaim(claim),
    issuer: new Identity({ did: identityIdToString(issuer) }, context),
    min: u64ToBigNumber(min),
    max: max.isSome ? u64ToBigNumber(max.unwrap()) : undefined,
  };
}

/**
 * @hidden
 */
export function claimPercentageToClaimPercentageRestrictionValue(
  value: ITuple<
    [PolymeshPrimitivesStatisticsStatClaim, PolymeshPrimitivesIdentityId, Permill, Permill]
  >,
  context: Context
): ClaimPercentageRestrictionValue {
  const [claim, issuer, min, max] = value;
  return {
    claim: meshClaimToInputStatClaim(claim),
    issuer: new Identity({ did: identityIdToString(issuer) }, context),
    min: permillToBigNumber(min),
    max: permillToBigNumber(max),
  };
}

/**
 * @hidden
 */
export function meshPortfolioIdToPortfolio(
  portfolioId: PolymeshPrimitivesIdentityIdPortfolioId,
  context: Context
): DefaultPortfolio | NumberedPortfolio {
  const { did, kind } = portfolioId;
  const identityId = identityIdToString(did);

  if (kind.isDefault) {
    return new DefaultPortfolio({ did: identityId }, context);
  }
  return new NumberedPortfolio({ did: identityId, id: u64ToBigNumber(kind.asUser) }, context);
}

/**
 * @hidden
 */
export function portfolioToPortfolioId(
  portfolio: DefaultPortfolio | NumberedPortfolio
): PortfolioId {
  const {
    owner: { did },
  } = portfolio;
  if (portfolio instanceof DefaultPortfolio) {
    return { did };
  } else {
    const { id: number } = portfolio;

    return { did, number };
  }
}

/**
 * @hidden
 */
export function portfolioLikeToPortfolioId(value: PortfolioLike): PortfolioId {
  let did: string;
  let number: BigNumber | undefined;

  if (typeof value === 'string') {
    did = value;
  } else if (value instanceof Identity) {
    ({ did } = value);
  } else if (value instanceof Portfolio) {
    ({ did, number } = portfolioToPortfolioId(value));
  } else {
    const { identity: valueIdentity } = value;
    ({ id: number } = value);

    did = asDid(valueIdentity);
  }

  return { did, number };
}

/**
 * @hidden
 */
export function portfolioIdToPortfolio(
  portfolioId: PortfolioId,
  context: Context
): DefaultPortfolio | NumberedPortfolio {
  const { did, number } = portfolioId;
  return number
    ? new NumberedPortfolio({ did, id: number }, context)
    : new DefaultPortfolio({ did }, context);
}

/**
 * @hidden
 */
export function portfolioLikeToPortfolio(
  value: PortfolioLike,
  context: Context
): DefaultPortfolio | NumberedPortfolio {
  return portfolioIdToPortfolio(portfolioLikeToPortfolioId(value), context);
}

/**
 * @hidden
 */
export function portfolioIdToMeshPortfolioId(
  portfolioId: PortfolioId,
  context: Context
): PolymeshPrimitivesIdentityIdPortfolioId {
  const { did, number } = portfolioId;
  return context.createType('PolymeshPrimitivesIdentityIdPortfolioId', {
    did: stringToIdentityId(did, context),
    kind: number ? { User: bigNumberToU64(number, context) } : 'Default',
  });
}

/**
 * @hidden
 */
export function portfolioToPortfolioKind(
  portfolio: DefaultPortfolio | NumberedPortfolio,
  context: Context
): PolymeshPrimitivesIdentityIdPortfolioKind {
  let portfolioKind;
  if (isNumberedPortfolio(portfolio)) {
    portfolioKind = { User: bigNumberToU64(portfolio.id, context) };
  } else {
    portfolioKind = 'Default';
  }
  return context.createType('PolymeshPrimitivesIdentityIdPortfolioKind', portfolioKind);
}

/**
 * @hidden
 */
export function stringToText(text: string, context: Context): Text {
  return context.createType('Text', text);
}

/**
 * @hidden
 */
export function textToString(value: Text): string {
  return value.toString();
}

/**
 * Retrieve every Transaction Tag associated to a Transaction Group
 */
export function txGroupToTxTags(group: TxGroup): TxTag[] {
  switch (group) {
    case TxGroup.PortfolioManagement: {
      return [
        TxTags.identity.AddInvestorUniquenessClaim,
        TxTags.portfolio.MovePortfolioFunds,
        TxTags.settlement.AddInstruction,
        TxTags.settlement.AddInstructionWithMemo,
        TxTags.settlement.AddAndAffirmInstruction,
        TxTags.settlement.AddAndAffirmInstructionWithMemo,
        TxTags.settlement.AffirmInstruction,
        TxTags.settlement.RejectInstruction,
        TxTags.settlement.CreateVenue,
      ];
    }
    case TxGroup.AssetManagement: {
      return [
        TxTags.asset.MakeDivisible,
        TxTags.asset.RenameAsset,
        TxTags.asset.SetFundingRound,
        TxTags.asset.AddDocuments,
        TxTags.asset.RemoveDocuments,
      ];
    }
    case TxGroup.AdvancedAssetManagement: {
      return [
        TxTags.asset.Freeze,
        TxTags.asset.Unfreeze,
        TxTags.identity.AddAuthorization,
        TxTags.identity.RemoveAuthorization,
      ];
    }
    case TxGroup.Distribution: {
      return [
        TxTags.identity.AddInvestorUniquenessClaim,
        TxTags.settlement.CreateVenue,
        TxTags.settlement.AddInstruction,
        TxTags.settlement.AddInstructionWithMemo,
        TxTags.settlement.AddAndAffirmInstruction,
        TxTags.settlement.AddAndAffirmInstructionWithMemo,
      ];
    }
    case TxGroup.Issuance: {
      return [TxTags.asset.Issue];
    }
    case TxGroup.TrustedClaimIssuersManagement: {
      return [
        TxTags.complianceManager.AddDefaultTrustedClaimIssuer,
        TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer,
      ];
    }
    case TxGroup.ClaimsManagement: {
      return [TxTags.identity.AddClaim, TxTags.identity.RevokeClaim];
    }
    case TxGroup.ComplianceRequirementsManagement: {
      return [
        TxTags.complianceManager.AddComplianceRequirement,
        TxTags.complianceManager.RemoveComplianceRequirement,
        TxTags.complianceManager.PauseAssetCompliance,
        TxTags.complianceManager.ResumeAssetCompliance,
        TxTags.complianceManager.ResetAssetCompliance,
      ];
    }
    case TxGroup.CorporateActionsManagement: {
      return [
        TxTags.checkpoint.CreateSchedule,
        TxTags.checkpoint.RemoveSchedule,
        TxTags.checkpoint.CreateCheckpoint,
        TxTags.corporateAction.InitiateCorporateAction,
        TxTags.capitalDistribution.Distribute,
        TxTags.capitalDistribution.Claim,
        TxTags.identity.AddInvestorUniquenessClaim,
      ];
    }
    case TxGroup.StoManagement: {
      return [
        TxTags.sto.CreateFundraiser,
        TxTags.sto.FreezeFundraiser,
        TxTags.sto.Invest,
        TxTags.sto.ModifyFundraiserWindow,
        TxTags.sto.Stop,
        TxTags.sto.UnfreezeFundraiser,
        TxTags.identity.AddInvestorUniquenessClaim,
        TxTags.asset.Issue,
        TxTags.settlement.CreateVenue,
      ];
    }
  }
}

/**
 * @hidden
 *
 * @note tags that don't belong to any group will be ignored.
 *   The same goes for tags that belong to a group that wasn't completed
 */
export function transactionPermissionsToTxGroups(
  permissions: TransactionPermissions | null
): TxGroup[] {
  if (!permissions) {
    return [];
  }

  const { values: transactionValues, type, exceptions = [] } = permissions;
  let includedTags: (TxTag | ModuleName)[];
  let excludedTags: (TxTag | ModuleName)[];
  if (type === PermissionType.Include) {
    includedTags = transactionValues;
    excludedTags = exceptions;
  } else {
    includedTags = exceptions;
    excludedTags = transactionValues;
  }

  return values(TxGroup)
    .sort()
    .filter(group => {
      const tagsInGroup = txGroupToTxTags(group);

      return tagsInGroup.every(tag => {
        const isExcluded = !!excludedTags.find(excluded => isModuleOrTagMatch(excluded, tag));

        if (isExcluded) {
          return false;
        }

        return !!includedTags.find(included => isModuleOrTagMatch(included, tag));
      });
    });
}

/**
 * @hidden
 */
function splitTag(tag: TxTag): { palletName: string; dispatchableName: string } {
  const [modName, txName] = tag.split('.');
  const palletName = stringUpperFirst(modName);
  const dispatchableName = snakeCase(txName);

  return { palletName, dispatchableName };
}

/**
 * @hidden
 */
function initExtrinsicDict(
  txValues: (TxTag | ModuleName)[],
  message: string
): Record<string, { tx: string[]; exception?: true } | null> {
  const extrinsicDict: Record<string, { tx: string[]; exception?: true } | null> = {};

  uniq(txValues)
    .sort()
    .forEach(tag => {
      if (tag.includes('.')) {
        const { palletName, dispatchableName } = splitTag(tag as TxTag);
        let pallet = extrinsicDict[palletName];

        if (pallet === null) {
          throw new PolymeshError({
            code: ErrorCode.ValidationError,
            message,
            data: {
              module: palletName,
              transactions: [dispatchableName],
            },
          });
        } else if (pallet === undefined) {
          pallet = extrinsicDict[palletName] = { tx: [] };
        }

        pallet.tx.push(dispatchableName);
      } else {
        extrinsicDict[stringUpperFirst(tag)] = null;
      }
    });

  return extrinsicDict;
}

/**
 * @hidden
 */
function buildPalletPermissions(
  transactions: TransactionPermissions
): PermissionsEnum<PalletPermissions> {
  let extrinsic: PermissionsEnum<PalletPermissions>;
  const message =
    'Attempting to add permissions for specific transactions as well as the entire module';
  const { values: txValues, exceptions = [], type } = transactions;

  const extrinsicDict = initExtrinsicDict(txValues, message);

  exceptions.forEach(exception => {
    const { palletName, dispatchableName } = splitTag(exception);

    const pallet = extrinsicDict[palletName];

    if (pallet === undefined) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'Attempting to add a transaction permission exception without its corresponding module being included/excluded',
      });
    } else if (pallet === null) {
      extrinsicDict[palletName] = { tx: [dispatchableName], exception: true };
    } else if (pallet.exception) {
      pallet.tx.push(dispatchableName);
    } else {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message:
          'Cannot simultaneously include and exclude transactions belonging to the same module',
      });
    }
  });

  const pallets: PalletPermissions[] = map(extrinsicDict, (val, key) => {
    let dispatchables: PermissionsEnum<string>;

    if (val === null) {
      dispatchables = 'Whole';
    } else {
      const { tx, exception } = val;

      if (exception) {
        dispatchables = {
          Except: tx,
        };
      } else {
        dispatchables = {
          These: tx,
        };
      }
    }

    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      pallet_name: key,
      dispatchable_names: dispatchables,
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  });
  if (type === PermissionType.Include) {
    extrinsic = {
      These: pallets,
    };
  } else {
    extrinsic = {
      Except: pallets,
    };
  }

  return extrinsic;
}

/**
 * @hidden
 */
export function transactionPermissionsToExtrinsicPermissions(
  transactionPermissions: TransactionPermissions | null,
  context: Context
): PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions {
  return context.createType(
    'PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions',
    transactionPermissions ? buildPalletPermissions(transactionPermissions) : 'Whole'
  );
}

/**
 * @hidden
 */
export function permissionsToMeshPermissions(
  permissions: Permissions,
  context: Context
): PolymeshPrimitivesSecondaryKeyPermissions {
  const { assets, transactions, portfolios } = permissions;

  const extrinsic = transactionPermissionsToExtrinsicPermissions(transactions, context);

  let asset: PermissionsEnum<PolymeshPrimitivesTicker> = 'Whole';
  if (assets) {
    const { values: assetValues, type } = assets;
    assetValues.sort(({ ticker: tickerA }, { ticker: tickerB }) => tickerA.localeCompare(tickerB));
    const tickers = assetValues.map(({ ticker }) => stringToTicker(ticker, context));
    if (type === PermissionType.Include) {
      asset = {
        These: tickers,
      };
    } else {
      asset = {
        Except: tickers,
      };
    }
  }

  let portfolio: PermissionsEnum<PolymeshPrimitivesIdentityIdPortfolioId> = 'Whole';
  if (portfolios) {
    const { values: portfolioValues, type } = portfolios;
    const portfolioIds = portfolioValues.map(pValue =>
      portfolioIdToMeshPortfolioId(portfolioToPortfolioId(pValue), context)
    );

    if (type === PermissionType.Include) {
      portfolio = {
        These: portfolioIds,
      };
    } else {
      portfolio = {
        Except: portfolioIds,
      };
    }
  }

  const value = {
    asset,
    extrinsic,
    portfolio,
  };

  return context.createType('PolymeshPrimitivesSecondaryKeyPermissions', value);
}

const formatTxTag = (dispatchable: string, moduleName: string): TxTag => {
  return `${moduleName}.${camelCase(dispatchable)}` as TxTag;
};

/**
 * @hidden
 */
export function extrinsicPermissionsToTransactionPermissions(
  permissions: PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
): TransactionPermissions | null {
  let extrinsicType: PermissionType;
  let pallets;
  if (permissions.isThese) {
    extrinsicType = PermissionType.Include;
    pallets = permissions.asThese;
  } else if (permissions.isExcept) {
    extrinsicType = PermissionType.Exclude;
    pallets = permissions.asExcept;
  }

  let txValues: (ModuleName | TxTag)[] = [];
  let exceptions: TxTag[] = [];

  if (pallets) {
    pallets.forEach(({ palletName, dispatchableNames }) => {
      const moduleName = stringLowerFirst(bytesToString(palletName));
      if (dispatchableNames.isExcept) {
        const dispatchables = [...dispatchableNames.asExcept];
        exceptions = [
          ...exceptions,
          ...dispatchables.map(name => formatTxTag(bytesToString(name), moduleName)),
        ];
        txValues = [...txValues, moduleName as ModuleName];
      } else if (dispatchableNames.isThese) {
        const dispatchables = [...dispatchableNames.asThese];
        txValues = [
          ...txValues,
          ...dispatchables.map(name => formatTxTag(bytesToString(name), moduleName)),
        ];
      } else {
        txValues = [...txValues, moduleName as ModuleName];
      }
    });

    const result = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: extrinsicType!,
      values: txValues,
    };

    return exceptions.length ? { ...result, exceptions } : result;
  }

  return null;
}

/**
 * @hidden
 */
export function meshPermissionsToPermissions(
  permissions: PolymeshPrimitivesSecondaryKeyPermissions,
  context: Context
): Permissions {
  const { asset, extrinsic, portfolio } = permissions;

  let assets: SectionPermissions<FungibleAsset> | null = null;
  let transactions: TransactionPermissions | null = null;
  let portfolios: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null = null;

  let assetsType: PermissionType;
  let assetsPermissions;
  if (asset.isThese) {
    assetsType = PermissionType.Include;
    assetsPermissions = asset.asThese;
  } else if (asset.isExcept) {
    assetsType = PermissionType.Exclude;
    assetsPermissions = asset.asExcept;
  }

  if (assetsPermissions) {
    assets = {
      values: [...assetsPermissions].map(
        ticker => new FungibleAsset({ ticker: tickerToString(ticker) }, context)
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: assetsType!,
    };
  }

  transactions = extrinsicPermissionsToTransactionPermissions(extrinsic);

  let portfoliosType: PermissionType;
  let portfolioIds;
  if (portfolio.isThese) {
    portfoliosType = PermissionType.Include;
    portfolioIds = portfolio.asThese;
  } else if (portfolio.isExcept) {
    portfoliosType = PermissionType.Exclude;
    portfolioIds = portfolio.asExcept;
  }

  if (portfolioIds) {
    portfolios = {
      values: [...portfolioIds].map(portfolioId =>
        meshPortfolioIdToPortfolio(portfolioId, context)
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: portfoliosType!,
    };
  }

  return {
    assets,
    transactions,
    transactionGroups: transactions ? transactionPermissionsToTxGroups(transactions) : [],
    portfolios,
  };
}

/**
 * @hidden
 */
export function bigNumberToU32(value: BigNumber, context: Context): u32 {
  assertIsInteger(value);
  assertIsPositive(value);
  return context.createType('u32', value.toString());
}

/**
 * @hidden
 */
export function u32ToBigNumber(value: u32): BigNumber {
  return new BigNumber(value.toString());
}

/**
 * @hidden
 */
export function u16ToBigNumber(value: u16): BigNumber {
  return new BigNumber(value.toString());
}

/**
 * @hidden
 */
export function u8ToBigNumber(value: u8): BigNumber {
  return new BigNumber(value.toString());
}

/**
 * @hidden
 */
export function permissionGroupIdentifierToAgentGroup(
  permissionGroup: PermissionGroupIdentifier,
  context: Context
): PolymeshPrimitivesAgentAgentGroup {
  return context.createType(
    'PolymeshPrimitivesAgentAgentGroup',
    typeof permissionGroup !== 'object'
      ? permissionGroup
      : { Custom: bigNumberToU32(permissionGroup.custom, context) }
  );
}

/**
 * @hidden
 */
export function agentGroupToPermissionGroupIdentifier(
  agentGroup: PolymeshPrimitivesAgentAgentGroup
): PermissionGroupIdentifier {
  if (agentGroup.isFull) {
    return PermissionGroupType.Full;
  } else if (agentGroup.isExceptMeta) {
    return PermissionGroupType.ExceptMeta;
  } else if (agentGroup.isPolymeshV1CAA) {
    return PermissionGroupType.PolymeshV1Caa;
  } else if (agentGroup.isPolymeshV1PIA) {
    return PermissionGroupType.PolymeshV1Pia;
  } else {
    return { custom: u32ToBigNumber(agentGroup.asCustom) };
  }
}

/**
 * @hidden
 */
export function authorizationToAuthorizationData(
  auth: Authorization,
  context: Context
): PolymeshPrimitivesAuthorizationAuthorizationData {
  let value;

  const { type } = auth;

  if (type === AuthorizationType.AttestPrimaryKeyRotation) {
    value = stringToIdentityId(auth.value.did, context);
  } else if (type === AuthorizationType.RotatePrimaryKey) {
    value = null;
  } else if (type === AuthorizationType.JoinIdentity) {
    value = permissionsToMeshPermissions(auth.value, context);
  } else if (type === AuthorizationType.PortfolioCustody) {
    value = portfolioIdToMeshPortfolioId(portfolioToPortfolioId(auth.value), context);
  } else if (
    auth.type === AuthorizationType.TransferAssetOwnership ||
    auth.type === AuthorizationType.TransferTicker
  ) {
    value = stringToTicker(auth.value, context);
  } else if (type === AuthorizationType.RotatePrimaryKeyToSecondary) {
    value = permissionsToMeshPermissions(auth.value, context);
  } else if (type === AuthorizationType.BecomeAgent) {
    const ticker = stringToTicker(auth.value.asset.ticker, context);
    if (auth.value instanceof CustomPermissionGroup) {
      const { id } = auth.value;
      value = [ticker, permissionGroupIdentifierToAgentGroup({ custom: id }, context)];
    } else {
      const { type: groupType } = auth.value;
      value = [ticker, permissionGroupIdentifierToAgentGroup(groupType, context)];
    }
  } else {
    value = auth.value;
  }

  return context.createType('PolymeshPrimitivesAuthorizationAuthorizationData', {
    [type]: value,
  });
}

/**
 * @hidden
 */
export function authorizationTypeToMeshAuthorizationType(
  authorizationType: AuthorizationType,
  context: Context
): MeshAuthorizationType {
  return context.createType('AuthorizationType', authorizationType);
}

/**
 * @hidden
 */
export function bigNumberToBalance(value: BigNumber, context: Context, divisible = true): Balance {
  assertIsPositive(value);

  if (value.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The value exceeds the maximum possible balance',
      data: {
        currentValue: value,
        amountLimit: MAX_BALANCE,
      },
    });
  }

  if (divisible) {
    if ((value.decimalPlaces() ?? 0) > MAX_DECIMALS) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The value has more decimal places than allowed',
        data: {
          currentValue: value,
          decimalsLimit: MAX_DECIMALS,
        },
      });
    }
  } else {
    if (value.decimalPlaces()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The value has decimals but the Asset is indivisible',
      });
    }
  }

  return context.createType('Balance', value.shiftedBy(6).toString());
}

/**
 * @hidden
 */
export function balanceToBigNumber(balance: Balance): BigNumber {
  return new BigNumber(balance.toString()).shiftedBy(-6);
}

/**
 * Assembles permissions group identifier + ticker into appropriate permission group based on group identifier
 */
function assemblePermissionGroup(
  permissionGroupIdentifier: PermissionGroupIdentifier,
  ticker: string,
  context: Context
): KnownPermissionGroup | CustomPermissionGroup {
  switch (permissionGroupIdentifier) {
    case PermissionGroupType.ExceptMeta:
    case PermissionGroupType.Full:
    case PermissionGroupType.PolymeshV1Caa:
    case PermissionGroupType.PolymeshV1Pia: {
      return new KnownPermissionGroup({ type: permissionGroupIdentifier, ticker }, context);
    }
    default: {
      const { custom: id } = permissionGroupIdentifier;
      return new CustomPermissionGroup({ id, ticker }, context);
    }
  }
}
/**
 * @hidden
 */
export function agentGroupToPermissionGroup(
  agentGroup: PolymeshPrimitivesAgentAgentGroup,
  ticker: string,
  context: Context
): KnownPermissionGroup | CustomPermissionGroup {
  const permissionGroupIdentifier = agentGroupToPermissionGroupIdentifier(agentGroup);
  return assemblePermissionGroup(permissionGroupIdentifier, ticker, context);
}

/**
 * @hidden
 */
export function authorizationDataToAuthorization(
  auth: PolymeshPrimitivesAuthorizationAuthorizationData,
  context: Context
): Authorization {
  if (auth.isAttestPrimaryKeyRotation) {
    return {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: new Identity(
        {
          did: identityIdToString(auth.asAttestPrimaryKeyRotation),
        },
        context
      ),
    };
  }

  if (auth.isRotatePrimaryKey) {
    return {
      type: AuthorizationType.RotatePrimaryKey,
    };
  }

  if (auth.isTransferTicker) {
    return {
      type: AuthorizationType.TransferTicker,
      value: tickerToString(auth.asTransferTicker),
    };
  }

  if (auth.isAddMultiSigSigner) {
    return {
      type: AuthorizationType.AddMultiSigSigner,
      value: accountIdToString(auth.asAddMultiSigSigner),
    };
  }

  if (auth.isTransferAssetOwnership) {
    return {
      type: AuthorizationType.TransferAssetOwnership,
      value: tickerToString(auth.asTransferAssetOwnership),
    };
  }

  if (auth.isPortfolioCustody) {
    return {
      type: AuthorizationType.PortfolioCustody,
      value: meshPortfolioIdToPortfolio(auth.asPortfolioCustody, context),
    };
  }

  if (auth.isJoinIdentity) {
    return {
      type: AuthorizationType.JoinIdentity,
      value: meshPermissionsToPermissions(auth.asJoinIdentity, context),
    };
  }

  if (auth.isAddRelayerPayingKey) {
    const [userKey, payingKey, polyxLimit] = auth.asAddRelayerPayingKey;

    return {
      type: AuthorizationType.AddRelayerPayingKey,
      value: {
        beneficiary: new Account({ address: accountIdToString(userKey) }, context),
        subsidizer: new Account({ address: accountIdToString(payingKey) }, context),
        allowance: balanceToBigNumber(polyxLimit),
      },
    };
  }

  if (auth.isBecomeAgent) {
    const [ticker, agentGroup] = auth.asBecomeAgent;

    return {
      type: AuthorizationType.BecomeAgent,
      value: agentGroupToPermissionGroup(agentGroup, tickerToString(ticker), context),
    };
  }

  if (auth.isRotatePrimaryKeyToSecondary) {
    return {
      type: AuthorizationType.RotatePrimaryKeyToSecondary,
      value: meshPermissionsToPermissions(auth.asRotatePrimaryKeyToSecondary, context),
    };
  }

  throw new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message: 'Unsupported Authorization Type. Please contact the Polymesh team',
    data: {
      auth: JSON.stringify(auth, null, 2),
    },
  });
}

/**
 * @hidden
 */
function assertMemoValid(value: string): void {
  if (value.length > MAX_MEMO_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Max memo length exceeded',
      data: {
        maxLength: MAX_MEMO_LENGTH,
      },
    });
  }
}

/**
 * @hidden
 */
export function stringToMemo(value: string, context: Context): PolymeshPrimitivesMemo {
  assertMemoValid(value);

  return context.createType('PolymeshPrimitivesMemo', padString(value, MAX_MEMO_LENGTH));
}

/**
 * @hidden
 */
export function u8ToTransferStatus(status: u8): TransferStatus {
  const code = status.toNumber();

  switch (code) {
    case 81: {
      return TransferStatus.Success;
    }
    case 82: {
      return TransferStatus.InsufficientBalance;
    }
    case 83: {
      return TransferStatus.InsufficientAllowance;
    }
    case 84: {
      return TransferStatus.TransfersHalted;
    }
    case 85: {
      return TransferStatus.FundsLocked;
    }
    case 86: {
      return TransferStatus.InvalidSenderAddress;
    }
    case 87: {
      return TransferStatus.InvalidReceiverAddress;
    }
    case 88: {
      return TransferStatus.InvalidOperator;
    }
    case 160: {
      return TransferStatus.InvalidSenderIdentity;
    }
    case 161: {
      return TransferStatus.InvalidReceiverIdentity;
    }
    case 162: {
      return TransferStatus.ComplianceFailure;
    }
    case 163: {
      return TransferStatus.SmartExtensionFailure;
    }
    case 164: {
      return TransferStatus.InvalidGranularity;
    }
    case 165: {
      return TransferStatus.VolumeLimitReached;
    }
    case 166: {
      return TransferStatus.BlockedTransaction;
    }
    case 168: {
      return TransferStatus.FundsLimitReached;
    }
    case 169: {
      return TransferStatus.PortfolioFailure;
    }
    case 170: {
      return TransferStatus.CustodianError;
    }
    case 171: {
      return TransferStatus.ScopeClaimMissing;
    }
    case 172: {
      return TransferStatus.TransferRestrictionFailure;
    }
    case 80: {
      return TransferStatus.Failure;
    }
    default: {
      throw new PolymeshError({
        code: ErrorCode.UnexpectedError,
        message: `Unsupported status code "${status.toString()}". Please report this issue to the Polymesh team`,
      });
    }
  }
}

/**
 * @hidden
 */
export function internalAssetTypeToAssetType(
  type: InternalAssetType,
  context: Context
): PolymeshPrimitivesAssetAssetType {
  return context.createType('PolymeshPrimitivesAssetAssetType', type);
}

/**
 * @hidden
 */
export function internalNftTypeToNftType(
  type: InternalNftType,
  context: Context
): PolymeshPrimitivesAssetNonFungibleType {
  return context.createType('PolymeshPrimitivesAssetNonFungibleType', type);
}

/**
 * @hidden
 */
export function assetTypeToKnownOrId(
  assetType: PolymeshPrimitivesAssetAssetType
):
  | { type: 'Fungible'; value: KnownAssetType | BigNumber }
  | { type: 'NonFungible'; value: KnownNftType | BigNumber } {
  if (assetType.isNonFungible) {
    const type = 'NonFungible';
    const rawNftType = assetType.asNonFungible;
    if (rawNftType.isDerivative) {
      return { type, value: KnownNftType.Derivative };
    } else if (rawNftType.isFixedIncome) {
      return { type, value: KnownNftType.FixedIncome };
    } else if (rawNftType.isInvoice) {
      return { type, value: KnownNftType.Invoice };
    }
    return { type, value: u32ToBigNumber(rawNftType.asCustom) };
  }
  const type = 'Fungible';
  if (assetType.isEquityCommon) {
    return { type, value: KnownAssetType.EquityCommon };
  }
  if (assetType.isEquityPreferred) {
    return { type, value: KnownAssetType.EquityPreferred };
  }
  if (assetType.isCommodity) {
    return { type, value: KnownAssetType.Commodity };
  }
  if (assetType.isFixedIncome) {
    return { type, value: KnownAssetType.FixedIncome };
  }
  if (assetType.isReit) {
    return { type, value: KnownAssetType.Reit };
  }
  if (assetType.isFund) {
    return { type, value: KnownAssetType.Fund };
  }
  if (assetType.isRevenueShareAgreement) {
    return { type, value: KnownAssetType.RevenueShareAgreement };
  }
  if (assetType.isStructuredProduct) {
    return { type, value: KnownAssetType.StructuredProduct };
  }
  if (assetType.isDerivative) {
    return { type, value: KnownAssetType.Derivative };
  }
  if (assetType.isStableCoin) {
    return { type, value: KnownAssetType.StableCoin };
  }

  return { type, value: u32ToBigNumber(assetType.asCustom) };
}

/**
 * @hidden
 */
export function posRatioToBigNumber(postRatio: PolymeshPrimitivesPosRatio): BigNumber {
  const [numerator, denominator] = postRatio.map(u32ToBigNumber);
  return numerator.dividedBy(denominator);
}

/**
 * @hidden
 */
export function nameToAssetName(value: string, context: Context): Bytes {
  const {
    polymeshApi: {
      consts: {
        asset: { assetNameMaxLength },
      },
    },
  } = context;

  const nameMaxLength = u32ToBigNumber(assetNameMaxLength);

  if (nameMaxLength.lt(value.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset name length exceeded',
      data: {
        maxLength: nameMaxLength,
      },
    });
  }
  return stringToBytes(value, context);
}

/**
 * @hidden
 */
export function fundingRoundToAssetFundingRound(value: string, context: Context): Bytes {
  const {
    polymeshApi: {
      consts: {
        asset: { fundingRoundNameMaxLength },
      },
    },
  } = context;

  const nameMaxLength = u32ToBigNumber(fundingRoundNameMaxLength);

  if (nameMaxLength.lt(value.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset funding round name length exceeded',
      data: {
        maxLength: nameMaxLength,
      },
    });
  }
  return stringToBytes(value, context);
}

/**
 * @hidden
 */
export function isIsinValid(isin: string): boolean {
  isin = isin.toUpperCase();

  if (!/^[0-9A-Z]{12}$/.test(isin)) {
    return false;
  }

  const v: number[] = [];

  rangeRight(11).forEach(i => {
    const c = parseInt(isin.charAt(i));
    if (isNaN(c)) {
      const letterCode = isin.charCodeAt(i) - 55;
      v.push(letterCode % 10);
      v.push(Math.floor(letterCode / 10));
    } else {
      v.push(Number(c));
    }
  });

  let sum = 0;

  range(v.length).forEach(i => {
    if (i % 2 === 0) {
      const d = v[i] * 2;
      sum += Math.floor(d / 10);
      sum += d % 10;
    } else {
      sum += v[i];
    }
  });

  return (10 - (sum % 10)) % 10 === Number(isin[isin.length - 1]);
}

/**
 * @hidden
 */
function validateCusipChecksum(cusip: string): boolean {
  let sum = 0;

  // cSpell: disable-next-line
  const cusipChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ*@#'.split('');

  const cusipLength = cusip.length - 1;

  range(cusipLength).forEach(i => {
    const item = cusip[i];
    const code = item.charCodeAt(0);

    let num;

    if (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) {
      num = cusipChars.indexOf(item) + 10;
    } else {
      num = Number(item);
    }

    if (i % 2 !== 0) {
      num *= 2;
    }

    num = (num % 10) + Math.floor(num / 10);
    sum += num;
  });

  return (10 - (sum % 10)) % 10 === Number(cusip[cusip.length - 1]);
}

/**
 * @hidden
 *
 * @note CINS and CUSIP use the same validation
 */
export function isCusipValid(cusip: string): boolean {
  cusip = cusip.toUpperCase();

  if (!/^[0-9A-Z@#*]{9}$/.test(cusip)) {
    return false;
  }

  return validateCusipChecksum(cusip);
}

/**
 * @hidden
 */
export function isLeiValid(lei: string): boolean {
  lei = lei.toUpperCase();

  if (!/^[0-9A-Z]{18}\d{2}$/.test(lei)) {
    return false;
  }

  return computeWithoutCheck(lei) === 1;
}

/**
 * Check if given string is a valid FIGI identifier
 *
 * A FIGI consists of three parts:
 *   - a two-character prefix which is a combination of upper case consonants with the following exceptions: BS, BM, GG, GB, GH, KY, VG
 *   - a 'G' as the third character;
 *   - an eight-character combination of upper case consonants and the numerals 0 – 9
 *   - a single check digit
 * @hidden
 */
export function isFigiValid(figi: string): boolean {
  figi = figi.toUpperCase();

  if (
    ['BS', 'BM', 'GG', 'GB', 'GH', 'KY', 'VG'].includes(figi.substring(0, 2)) ||
    !/^[B-DF-HJ-NP-TV-Z]{2}G[B-DF-HJ-NP-TV-Z0-9]{8}\d$/.test(figi)
  ) {
    return false;
  }

  return validateCusipChecksum(figi);
}

/**
 * @hidden
 */
export function securityIdentifierToAssetIdentifier(
  identifier: SecurityIdentifier,
  context: Context
): PolymeshPrimitivesAssetIdentifier {
  const { type, value } = identifier;

  let error = false;

  switch (type) {
    case SecurityIdentifierType.Isin: {
      if (!isIsinValid(value)) {
        error = true;
      }
      break;
    }
    case SecurityIdentifierType.Lei: {
      if (!isLeiValid(value)) {
        error = true;
      }
      break;
    }
    case SecurityIdentifierType.Figi: {
      if (!isFigiValid(value)) {
        error = true;
      }
      break;
    }
    // CINS and CUSIP use the same validation
    default: {
      if (!isCusipValid(value)) {
        error = true;
      }
    }
  }

  if (error) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Invalid security identifier ${value} of type ${type}`,
    });
  }

  return context.createType('PolymeshPrimitivesAssetIdentifier', { [type]: value });
}

/**
 * @hidden
 */
export function assetIdentifierToSecurityIdentifier(
  identifier: PolymeshPrimitivesAssetIdentifier
): SecurityIdentifier {
  if (identifier.isCusip) {
    return {
      type: SecurityIdentifierType.Cusip,
      value: u8aToString(identifier.asCusip),
    };
  }
  if (identifier.isIsin) {
    return {
      type: SecurityIdentifierType.Isin,
      value: u8aToString(identifier.asIsin),
    };
  }
  if (identifier.isCins) {
    return {
      type: SecurityIdentifierType.Cins,
      value: u8aToString(identifier.asCins),
    };
  }

  if (identifier.isFigi) {
    return {
      type: SecurityIdentifierType.Figi,
      value: u8aToString(identifier.asFigi),
    };
  }

  return {
    type: SecurityIdentifierType.Lei,
    value: u8aToString(identifier.asLei),
  };
}

/**
 * @hidden
 */
export function stringToDocumentHash(
  docHash: string | undefined,
  context: Context
): PolymeshPrimitivesDocumentHash {
  if (docHash === undefined) {
    return context.createType('PolymeshPrimitivesDocumentHash', 'None');
  }

  if (!isHex(docHash, -1, true)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Document hash must be a hexadecimal string prefixed by 0x',
    });
  }

  const { length } = docHash;

  // array of Hash types (H128, H160, etc) and their corresponding hex lengths
  const hashTypes = [32, 40, 48, 56, 64, 80, 96, 128].map(max => ({
    maxLength: max + 2,
    key: `H${max * 4}`,
  }));

  const type = hashTypes.find(({ maxLength: max }) => length <= max);

  if (!type) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Document hash exceeds max length',
    });
  }

  const { maxLength, key } = type;

  return context.createType('PolymeshPrimitivesDocumentHash', {
    [key]: hexToU8a(docHash.padEnd(maxLength, '0')),
  });
}

/**
 * @hidden
 */
export function documentHashToString(docHash: PolymeshPrimitivesDocumentHash): string | undefined {
  if (docHash.isNone) {
    return;
  }

  if (docHash.isH128) {
    return u8aToHex(docHash.asH128);
  }

  if (docHash.isH160) {
    return u8aToHex(docHash.asH160);
  }

  if (docHash.isH192) {
    return u8aToHex(docHash.asH192);
  }

  if (docHash.isH224) {
    return u8aToHex(docHash.asH224);
  }

  if (docHash.isH256) {
    return u8aToHex(docHash.asH256);
  }

  if (docHash.isH320) {
    return u8aToHex(docHash.asH320);
  }

  if (docHash.isH384) {
    return u8aToHex(docHash.asH384);
  }

  return u8aToHex(docHash.asH512);
}

/**
 * @hidden
 */
export function assetDocumentToDocument(
  { uri, contentHash, name, filedAt, type }: AssetDocument,
  context: Context
): PolymeshPrimitivesDocument {
  return context.createType('PolymeshPrimitivesDocument', {
    uri: stringToBytes(uri, context),
    name: stringToBytes(name, context),
    contentHash: stringToDocumentHash(contentHash, context),
    docType: optionize(stringToBytes)(type, context),
    filingDate: optionize(dateToMoment)(filedAt, context),
  });
}

/**
 * @hidden
 */
export function documentToAssetDocument({
  uri,
  contentHash: hash,
  name,
  docType,
  filingDate,
}: PolymeshPrimitivesDocument): AssetDocument {
  const filedAt = filingDate.unwrapOr(undefined);
  const type = docType.unwrapOr(undefined);
  const contentHash = documentHashToString(hash);

  let doc: AssetDocument = {
    uri: bytesToString(uri),
    name: bytesToString(name),
  };

  if (contentHash) {
    doc = { ...doc, contentHash };
  }

  if (filedAt) {
    doc = { ...doc, filedAt: momentToDate(filedAt) };
  }

  if (type) {
    doc = { ...doc, type: bytesToString(type) };
  }

  return doc;
}

/**
 * @hidden
 */
export function cddStatusToBoolean(cddStatus: CddStatus): boolean {
  if (cddStatus.isOk) {
    return true;
  }
  return false;
}

/**
 * @hidden
 */
export function canTransferResultToTransferStatus(
  canTransferResult: CanTransferResult
): TransferStatus {
  if (canTransferResult.isErr) {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Error while checking transfer validity: ${bytesToString(canTransferResult.asErr)}`,
    });
  }

  return u8ToTransferStatus(canTransferResult.asOk);
}

/**
 * @hidden
 */
export function scopeToMeshScope(
  scope: Scope,
  context: Context
): PolymeshPrimitivesIdentityClaimScope {
  const { type, value } = scope;

  let scopeValue: PolymeshPrimitivesTicker | PolymeshPrimitivesIdentityId | string;
  switch (type) {
    case ScopeType.Ticker:
      scopeValue = stringToTicker(value, context);
      break;
    case ScopeType.Identity:
      scopeValue = stringToIdentityId(value, context);
      break;
    default:
      scopeValue = value;
      break;
  }

  return context.createType('Scope', {
    [type]: scopeValue,
  });
}

/**
 * @hidden
 */
export function meshScopeToScope(scope: PolymeshPrimitivesIdentityClaimScope): Scope {
  if (scope.isTicker) {
    return {
      type: ScopeType.Ticker,
      value: tickerToString(scope.asTicker),
    };
  }

  if (scope.isIdentity) {
    return {
      type: ScopeType.Identity,
      value: identityIdToString(scope.asIdentity),
    };
  }

  return {
    type: ScopeType.Custom,
    value: u8aToString(scope.asCustom),
  };
}

/**
 * @hidden
 */
export function stringToCddId(cddId: string, context: Context): PolymeshPrimitivesCddId {
  return context.createType('PolymeshPrimitivesCddId', cddId);
}

/**
 * @hidden
 */
export function cddIdToString(cddId: PolymeshPrimitivesCddId): string {
  return cddId.toString();
}

/**
 * @hidden
 */
export function claimToMeshClaim(
  claim: Claim,
  context: Context
): PolymeshPrimitivesIdentityClaimClaim {
  let value;

  switch (claim.type) {
    case ClaimType.CustomerDueDiligence: {
      value = stringToCddId(claim.id, context);
      break;
    }
    case ClaimType.Jurisdiction: {
      const { code, scope } = claim;
      value = tuple(code, scopeToMeshScope(scope, context));
      break;
    }
    default: {
      value = scopeToMeshScope(claim.scope, context);
    }
  }

  return context.createType('PolymeshPrimitivesIdentityClaimClaim', { [claim.type]: value });
}

/**
 * @hidden
 */
export function middlewareScopeToScope(scope: MiddlewareScope): Scope {
  const { type, value } = scope;

  switch (type) {
    case ClaimScopeTypeEnum.Ticker:
      return { type: ScopeType.Ticker, value: removePadding(value) };
    case ClaimScopeTypeEnum.Identity:
    case ClaimScopeTypeEnum.Custom:
      return { type: scope.type as ScopeType, value };
  }

  throw new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message: 'Unsupported Scope Type. Please contact the Polymesh team',
    data: {
      scope,
    },
  });
}

/**
 * @hidden
 */
export function scopeToMiddlewareScope(scope: Scope, padTicker = true): MiddlewareScope {
  const { type, value } = scope;

  switch (type) {
    case ScopeType.Ticker:
      return {
        type: ClaimScopeTypeEnum.Ticker,
        value: padTicker ? padEnd(value, 12, '\0') : value,
      };
    case ScopeType.Identity:
    case ScopeType.Custom:
      return { type: ClaimScopeTypeEnum[scope.type], value };
  }
}

/**
 * @hidden
 */
export function middlewareEventDetailsToEventIdentifier(
  block: Block,
  eventIdx = 0
): EventIdentifier {
  const { blockId, datetime, hash } = block;

  return {
    blockNumber: new BigNumber(blockId),
    blockHash: hash,
    blockDate: new Date(`${datetime}`),
    eventIndex: new BigNumber(eventIdx),
  };
}

/**
 * @hidden
 */
export function meshClaimToClaim(claim: PolymeshPrimitivesIdentityClaimClaim): Claim {
  if (claim.isJurisdiction) {
    const [code, scope] = claim.asJurisdiction;
    return {
      type: ClaimType.Jurisdiction,
      code: meshCountryCodeToCountryCode(code),
      scope: meshScopeToScope(scope),
    };
  }

  if (claim.isAccredited) {
    return {
      type: ClaimType.Accredited,
      scope: meshScopeToScope(claim.asAccredited),
    };
  }

  if (claim.isAffiliate) {
    return {
      type: ClaimType.Affiliate,
      scope: meshScopeToScope(claim.asAffiliate),
    };
  }

  if (claim.isBuyLockup) {
    return {
      type: ClaimType.BuyLockup,
      scope: meshScopeToScope(claim.asBuyLockup),
    };
  }

  if (claim.isSellLockup) {
    return {
      type: ClaimType.SellLockup,
      scope: meshScopeToScope(claim.asSellLockup),
    };
  }

  if (claim.isCustomerDueDiligence) {
    return {
      type: ClaimType.CustomerDueDiligence,
      id: cddIdToString(claim.asCustomerDueDiligence),
    };
  }

  if (claim.isKnowYourCustomer) {
    return {
      type: ClaimType.KnowYourCustomer,
      scope: meshScopeToScope(claim.asKnowYourCustomer),
    };
  }

  if (claim.isExempted) {
    return {
      type: ClaimType.Exempted,
      scope: meshScopeToScope(claim.asExempted),
    };
  }

  return {
    type: ClaimType.Blocked,
    scope: meshScopeToScope(claim.asBlocked),
  };
}

/**
 * @hidden
 */
export function statsClaimToStatClaimInputType(
  claim: PolymeshPrimitivesStatisticsStatClaim
): StatClaimInputType {
  if (claim.isJurisdiction) {
    return {
      type: ClaimType.Jurisdiction,
    };
  } else if (claim.isAccredited) {
    return { type: ClaimType.Accredited };
  } else {
    return { type: ClaimType.Affiliate };
  }
}

/**
 * @hidden
 */
export function stringToTargetIdentity(
  did: string | null,
  context: Context
): PolymeshPrimitivesConditionTargetIdentity {
  return context.createType(
    'PolymeshPrimitivesConditionTargetIdentity',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    did ? { Specific: stringToIdentityId(did, context) } : 'ExternalAgent'
  );
}

/**
 * @hidden
 */
export function meshClaimTypeToClaimType(
  claimType: PolymeshPrimitivesIdentityClaimClaimType
): ClaimType {
  if (claimType.isJurisdiction) {
    return ClaimType.Jurisdiction;
  }

  if (claimType.isAccredited) {
    return ClaimType.Accredited;
  }

  if (claimType.isAffiliate) {
    return ClaimType.Affiliate;
  }

  if (claimType.isBuyLockup) {
    return ClaimType.BuyLockup;
  }

  if (claimType.isSellLockup) {
    return ClaimType.SellLockup;
  }

  if (claimType.isCustomerDueDiligence) {
    return ClaimType.CustomerDueDiligence;
  }

  if (claimType.isKnowYourCustomer) {
    return ClaimType.KnowYourCustomer;
  }

  if (claimType.isExempted) {
    return ClaimType.Exempted;
  }

  return ClaimType.Blocked;
}

/**
 * @hidden
 */
export function trustedIssuerToTrustedClaimIssuer(
  trustedIssuer: PolymeshPrimitivesConditionTrustedIssuer,
  context: Context
): TrustedClaimIssuer {
  const { issuer, trustedFor: claimTypes } = trustedIssuer;

  const identity = new Identity({ did: identityIdToString(issuer) }, context);

  let trustedFor: ClaimType[] | null = null;

  if (claimTypes.isSpecific) {
    trustedFor = claimTypes.asSpecific.map(meshClaimTypeToClaimType);
  }

  return {
    identity,
    trustedFor,
  };
}

/**
 * @hidden
 */
export function trustedClaimIssuerToTrustedIssuer(
  issuer: InputTrustedClaimIssuer,
  context: Context
): PolymeshPrimitivesConditionTrustedIssuer {
  const { trustedFor: claimTypes, identity } = issuer;
  const did = signerToString(identity);

  let trustedFor;

  if (!claimTypes) {
    trustedFor = 'Any';
  } else {
    trustedFor = { Specific: claimTypes };
  }

  return context.createType('PolymeshPrimitivesConditionTrustedIssuer', {
    issuer: stringToIdentityId(did, context),
    trustedFor,
  });
}

/**
 * @hidden
 */
export function requirementToComplianceRequirement(
  requirement: InputRequirement,
  context: Context
): PolymeshPrimitivesComplianceManagerComplianceRequirement {
  const senderConditions: PolymeshPrimitivesCondition[] = [];
  const receiverConditions: PolymeshPrimitivesCondition[] = [];

  requirement.conditions.forEach(condition => {
    let conditionContent:
      | PolymeshPrimitivesIdentityClaimClaim
      | PolymeshPrimitivesIdentityClaimClaim[]
      | PolymeshPrimitivesConditionTargetIdentity;
    let { type } = condition;
    if (isSingleClaimCondition(condition)) {
      const { claim } = condition;
      conditionContent = claimToMeshClaim(claim, context);
    } else if (isMultiClaimCondition(condition)) {
      const { claims } = condition;
      conditionContent = claims.map(claim => claimToMeshClaim(claim, context));
    } else if (isIdentityCondition(condition)) {
      const { identity } = condition;
      conditionContent = stringToTargetIdentity(signerToString(identity), context);
    } else {
      // IsExternalAgent does not exist as a condition type in Polymesh, it's SDK sugar
      type = ConditionType.IsIdentity;
      conditionContent = stringToTargetIdentity(null, context);
    }

    const { target, trustedClaimIssuers = [] } = condition;

    const meshCondition = context.createType<PolymeshPrimitivesCondition>(
      'PolymeshPrimitivesCondition',
      {
        conditionType: {
          [type]: conditionContent,
        },
        issuers: trustedClaimIssuers.map(issuer =>
          trustedClaimIssuerToTrustedIssuer(issuer, context)
        ),
      }
    );

    if ([ConditionTarget.Both, ConditionTarget.Receiver].includes(target)) {
      receiverConditions.push(meshCondition);
    }

    if ([ConditionTarget.Both, ConditionTarget.Sender].includes(target)) {
      senderConditions.push(meshCondition);
    }
  });

  return context.createType('PolymeshPrimitivesComplianceManagerComplianceRequirement', {
    senderConditions,
    receiverConditions,
    id: bigNumberToU32(requirement.id, context),
  });
}

/**
 * @hidden
 */
function meshConditionTypeToCondition(
  meshConditionType: PolymeshPrimitivesConditionConditionType,
  context: Context
):
  | Pick<SingleClaimCondition, 'type' | 'claim'>
  | Pick<MultiClaimCondition, 'type' | 'claims'>
  | Pick<IdentityCondition, 'type' | 'identity'>
  | Pick<ExternalAgentCondition, 'type'> {
  if (meshConditionType.isIsPresent) {
    return {
      type: ConditionType.IsPresent,
      claim: meshClaimToClaim(meshConditionType.asIsPresent),
    };
  }

  if (meshConditionType.isIsAbsent) {
    return {
      type: ConditionType.IsAbsent,
      claim: meshClaimToClaim(meshConditionType.asIsAbsent),
    };
  }

  if (meshConditionType.isIsAnyOf) {
    return {
      type: ConditionType.IsAnyOf,
      claims: meshConditionType.asIsAnyOf.map(claim => meshClaimToClaim(claim)),
    };
  }

  if (meshConditionType.isIsIdentity) {
    const target = meshConditionType.asIsIdentity;

    if (target.isExternalAgent) {
      return {
        type: ConditionType.IsExternalAgent,
      };
    }

    return {
      type: ConditionType.IsIdentity,
      identity: new Identity({ did: identityIdToString(target.asSpecific) }, context),
    };
  }

  return {
    type: ConditionType.IsNoneOf,
    claims: meshConditionType.asIsNoneOf.map(claim => meshClaimToClaim(claim)),
  };
}

/**
 * @hidden
 * @note - the data for this method comes from an RPC call, which hasn't been updated to the camelCase types
 */
export function complianceRequirementResultToRequirementCompliance(
  complianceRequirement: ComplianceRequirementResult,
  context: Context
): RequirementCompliance {
  const conditions: ConditionCompliance[] = [];

  const conditionCompliancesAreEqual = (
    { condition: aCondition, complies: aComplies }: ConditionCompliance,
    { condition: bCondition, complies: bComplies }: ConditionCompliance
  ): boolean => conditionsAreEqual(aCondition, bCondition) && aComplies === bComplies;

  complianceRequirement.senderConditions.forEach(
    ({ condition: { conditionType, issuers }, result }) => {
      const newCondition = {
        condition: {
          ...meshConditionTypeToCondition(conditionType, context),
          target: ConditionTarget.Sender,
          trustedClaimIssuers: issuers.map(trustedIssuer =>
            trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
          ),
        },
        complies: boolToBoolean(result),
      };

      const existingCondition = conditions.find(condition =>
        conditionCompliancesAreEqual(condition, newCondition)
      );

      if (!existingCondition) {
        conditions.push(newCondition);
      }
    }
  );

  complianceRequirement.receiverConditions.forEach(
    ({ condition: { conditionType, issuers }, result }) => {
      const newCondition = {
        condition: {
          ...meshConditionTypeToCondition(conditionType, context),
          target: ConditionTarget.Receiver,
          trustedClaimIssuers: issuers.map(trustedIssuer =>
            trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
          ),
        },
        complies: boolToBoolean(result),
      };

      const existingCondition = conditions.find(condition =>
        conditionCompliancesAreEqual(condition, newCondition)
      );

      if (existingCondition && existingCondition.condition.target === ConditionTarget.Sender) {
        existingCondition.condition.target = ConditionTarget.Both;
      } else {
        conditions.push(newCondition);
      }
    }
  );

  return {
    id: u32ToBigNumber(complianceRequirement.id),
    conditions,
    complies: boolToBoolean(complianceRequirement.result),
  };
}

/**
 * @hidden
 */
export function complianceRequirementToRequirement(
  complianceRequirement: PolymeshPrimitivesComplianceManagerComplianceRequirement,
  context: Context
): Requirement {
  const conditions: Condition[] = [];

  complianceRequirement.senderConditions.forEach(({ conditionType, issuers }) => {
    const newCondition: Condition = {
      ...meshConditionTypeToCondition(conditionType, context),
      target: ConditionTarget.Sender,
    };

    if (issuers.length) {
      newCondition.trustedClaimIssuers = issuers.map(trustedIssuer =>
        trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
      );
    }

    const existingCondition = conditions.find(condition =>
      conditionsAreEqual(condition, newCondition)
    );

    if (!existingCondition) {
      conditions.push(newCondition);
    }
  });

  complianceRequirement.receiverConditions.forEach(({ conditionType, issuers }) => {
    const newCondition: Condition = {
      ...meshConditionTypeToCondition(conditionType, context),
      target: ConditionTarget.Receiver,
    };

    if (issuers.length) {
      newCondition.trustedClaimIssuers = issuers.map(trustedIssuer =>
        trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
      );
    }

    const existingCondition = conditions.find(condition =>
      conditionsAreEqual(condition, newCondition)
    );

    if (existingCondition && existingCondition.target === ConditionTarget.Sender) {
      existingCondition.target = ConditionTarget.Both;
    } else {
      conditions.push(newCondition);
    }
  });

  return {
    id: u32ToBigNumber(complianceRequirement.id),
    conditions,
  };
}

/**
 * @hidden
 */
export function txTagToProtocolOp(
  tag: TxTag,
  context: Context
): PolymeshCommonUtilitiesProtocolFeeProtocolOp {
  const protocolOpTags = [
    TxTags.asset.RegisterTicker,
    TxTags.asset.Issue,
    TxTags.asset.AddDocuments,
    TxTags.asset.CreateAsset,
    TxTags.capitalDistribution.Distribute,
    TxTags.checkpoint.CreateSchedule,
    TxTags.complianceManager.AddComplianceRequirement,
    TxTags.identity.CddRegisterDid,
    TxTags.identity.AddClaim,
    TxTags.identity.AddSecondaryKeysWithAuthorization,
    TxTags.pips.Propose,
    TxTags.corporateBallot.AttachBallot,
    TxTags.capitalDistribution.Distribute,
  ];

  const [moduleName, extrinsicName] = tag.split('.');
  const value = `${stringUpperFirst(moduleName)}${stringUpperFirst(extrinsicName)}`;

  if (!includes(protocolOpTags, tag)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `${value} does not match any PolymeshCommonUtilitiesProtocolFeeProtocolOp`,
    });
  }

  return context.createType('PolymeshCommonUtilitiesProtocolFeeProtocolOp', value);
}

/**
 * @hidden
 */
export function extrinsicIdentifierToTxTag(extrinsicIdentifier: ExtrinsicIdentifier): TxTag {
  const { moduleId, callId } = extrinsicIdentifier;
  let moduleName;
  for (const txTagItem in TxTags) {
    if (txTagItem.toLowerCase() === moduleId) {
      moduleName = txTagItem;
    }
  }

  return `${moduleName}.${camelCase(callId)}` as TxTag;
}

/**
 * @hidden
 */
export function txTagToExtrinsicIdentifier(tag: TxTag): ExtrinsicIdentifier {
  const [moduleName, extrinsicName] = tag.split('.');
  return {
    moduleId: moduleName.toLowerCase() as ModuleIdEnum,
    callId: snakeCase(extrinsicName) as CallIdEnum,
  };
}

/**
 * @hidden
 */
export function assetComplianceResultToCompliance(
  assetComplianceResult: AssetComplianceResult,
  context: Context
): Compliance {
  const { requirements: rawRequirements, result, paused } = assetComplianceResult;
  const requirements = rawRequirements.map(requirement =>
    complianceRequirementResultToRequirementCompliance(requirement, context)
  );

  return {
    requirements,
    complies: boolToBoolean(paused) || boolToBoolean(result),
  };
}

/**
 * @hidden
 */
export function moduleAddressToString(moduleAddress: string, context: Context): string {
  return encodeAddress(
    stringToU8a(padString(moduleAddress, MAX_MODULE_LENGTH)),
    context.ss58Format.toNumber()
  );
}

/**
 * @hidden
 */
export function keyToAddress(key: string, context: Context): string {
  if (!key.startsWith('0x')) {
    key = `0x${key}`;
  }
  return encodeAddress(key, context.ss58Format.toNumber());
}

/**
 * @hidden
 */
export function addressToKey(address: string, context: Context): string {
  return u8aToHex(decodeAddress(address, IGNORE_CHECKSUM, context.ss58Format.toNumber()));
}

/**
 *
 */
export const coerceHexToString = (input: string): string => {
  if (hexHasPrefix(input)) {
    return removePadding(hexToString(input));
  }
  return input;
};

/**
 * @hidden
 */
export function transactionHexToTxTag(bytes: string, context: Context): TxTag {
  const { section, method } = context.createType('Call', bytes);

  return extrinsicIdentifierToTxTag({
    moduleId: section.toLowerCase() as ModuleIdEnum,
    callId: method as CallIdEnum,
  });
}

/**
 * @hidden
 */
export function transactionToTxTag<Args extends unknown[]>(tx: PolymeshTx<Args>): TxTag {
  return `${tx.section}.${tx.method}` as TxTag;
}

/**
 * @hidden
 */
export function secondaryAccountToMeshSecondaryKey(
  secondaryKey: PermissionedAccount,
  context: Context
): PolymeshPrimitivesSecondaryKey {
  const { account, permissions } = secondaryKey;

  return context.createType('PolymeshPrimitivesSecondaryKey', {
    signer: signerValueToSignatory(signerToSignerValue(account), context),
    permissions: permissionsToMeshPermissions(permissions, context),
  });
}

/**
 * @hidden
 */
export function meshVenueTypeToVenueType(type: PolymeshPrimitivesSettlementVenueType): VenueType {
  if (type.isOther) {
    return VenueType.Other;
  }

  if (type.isDistribution) {
    return VenueType.Distribution;
  }

  if (type.isSto) {
    return VenueType.Sto;
  }

  return VenueType.Exchange;
}

/**
 * @hidden
 */
export function venueTypeToMeshVenueType(
  type: VenueType,
  context: Context
): PolymeshPrimitivesSettlementVenueType {
  return context.createType('PolymeshPrimitivesSettlementVenueType', type);
}

/**
 * @hidden
 */
export function meshInstructionStatusToInstructionStatus(
  instruction: PolymeshPrimitivesSettlementInstructionStatus
): InstructionStatus {
  if (instruction.isPending) {
    return InstructionStatus.Pending;
  }

  if (instruction.isFailed) {
    return InstructionStatus.Failed;
  }

  if (instruction.isRejected) {
    return InstructionStatus.Rejected;
  }

  if (instruction.isSuccess) {
    return InstructionStatus.Success;
  }

  return InstructionStatus.Unknown;
}

/**
 * @hidden
 */
export function meshAffirmationStatusToAffirmationStatus(
  status: PolymeshPrimitivesSettlementAffirmationStatus
): AffirmationStatus {
  if (status.isUnknown) {
    return AffirmationStatus.Unknown;
  }

  if (status.isPending) {
    return AffirmationStatus.Pending;
  }

  return AffirmationStatus.Affirmed;
}

/**
 * @hidden
 */
export function meshSettlementTypeToEndCondition(
  type: PolymeshPrimitivesSettlementSettlementType
): InstructionEndCondition {
  if (type.isSettleOnBlock) {
    return { type: InstructionType.SettleOnBlock, endBlock: u32ToBigNumber(type.asSettleOnBlock) };
  }

  if (type.isSettleManual) {
    return {
      type: InstructionType.SettleManual,
      endAfterBlock: u32ToBigNumber(type.asSettleManual),
    };
  }
  return { type: InstructionType.SettleOnAffirmation };
}

/**
 * @hidden
 */
export function endConditionToSettlementType(
  endCondition: InstructionEndCondition,
  context: Context
): PolymeshPrimitivesSettlementSettlementType {
  let value;

  const { type } = endCondition;

  switch (type) {
    case InstructionType.SettleOnBlock:
      value = { [InstructionType.SettleOnBlock]: bigNumberToU32(endCondition.endBlock, context) };
      break;
    case InstructionType.SettleManual:
      value = {
        [InstructionType.SettleManual]: bigNumberToU32(endCondition.endAfterBlock, context),
      };
      break;
    default:
      value = InstructionType.SettleOnAffirmation;
  }

  return context.createType('PolymeshPrimitivesSettlementSettlementType', value);
}

/**
 * @hidden
 */
export function middlewareClaimToClaimData(claim: MiddlewareClaim, context: Context): ClaimData {
  const {
    targetId,
    issuerId,
    issuanceDate,
    lastUpdateDate,
    expiry,
    type,
    jurisdiction,
    scope,
    cddId,
  } = claim;
  return {
    target: new Identity({ did: targetId }, context),
    issuer: new Identity({ did: issuerId }, context),
    issuedAt: new Date(parseFloat(issuanceDate)),
    lastUpdatedAt: new Date(parseFloat(lastUpdateDate)),
    expiry: expiry ? new Date(parseFloat(expiry)) : null,
    claim: createClaim(type, jurisdiction, scope, cddId),
  };
}

/**
 * @hidden
 */
export function toIdentityWithClaimsArray(
  data: MiddlewareClaim[],
  context: Context,
  groupByAttribute: string
): IdentityWithClaims[] {
  const groupedData = groupBy(data, groupByAttribute);

  return map(groupedData, (claims, did) => ({
    identity: new Identity({ did }, context),
    claims: claims.map(claim => middlewareClaimToClaimData(claim, context)),
  }));
}

/**
 * @hidden
 */
export function nftToMeshNft(
  ticker: string,
  ids: BigNumber[],
  context: Context
): PolymeshPrimitivesNftNfTs {
  return context.createType('PolymeshPrimitivesNftNfTs', {
    ticker: stringToTicker(ticker, context),
    ids: ids.map(id => bigNumberToU64(id, context)),
  });
}

/**
 * @hidden
 */
export function fungibleMovementToPortfolioFund(
  portfolioItem: PortfolioMovementFungible,
  context: Context
): PolymeshPrimitivesPortfolioFund {
  const { asset, amount, memo } = portfolioItem;

  return context.createType('PolymeshPrimitivesPortfolioFund', {
    description: {
      Fungible: {
        ticker: stringToTicker(asTicker(asset), context),
        amount: bigNumberToBalance(amount, context),
      },
    },
    memo: optionize(stringToMemo)(memo, context),
  });
}

/**
 * @hidden
 */
export function nftMovementToPortfolioFund(
  portfolioItem: PortfolioMovementNonFungible,
  context: Context
): PolymeshPrimitivesPortfolioFund {
  const { asset, nfts, memo } = portfolioItem;

  return context.createType('PolymeshPrimitivesPortfolioFund', {
    description: {
      NonFungible: {
        ticker: stringToTicker(asTicker(asset), context),
        ids: nfts.map(nftId => bigNumberToU64(asNftId(nftId), context)),
      },
    },
    memo: optionize(stringToMemo)(memo, context),
  });
}

/**
 * @hidden
 */
export function claimTypeToMeshClaimType(
  claimType: ClaimType,
  context: Context
): PolymeshPrimitivesIdentityClaimClaimType {
  return context.createType('PolymeshPrimitivesIdentityClaimClaimType', claimType);
}

/**
 * @hidden
 */
export function claimIssuerToMeshClaimIssuer(
  claimIssuer: StatClaimIssuer,
  context: Context
): [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId] {
  const claimType = claimTypeToMeshClaimType(claimIssuer.claimType, context);
  const identityId = stringToIdentityId(claimIssuer.issuer.did, context);
  return [claimType, identityId];
}

/**
 * @hidden
 */
export function transferRestrictionToPolymeshTransferCondition(
  restriction: TransferRestriction,
  context: Context
): PolymeshPrimitivesTransferComplianceTransferCondition {
  const { type, value } = restriction;
  let restrictionType: string;
  let restrictionValue;

  const extractClaimValue = (
    claim: InputStatClaim
  ): bool | PolymeshPrimitivesJurisdictionCountryCode | null => {
    if (claim.type === ClaimType.Accredited) {
      return booleanToBool(claim.accredited, context);
    } else if (claim.type === ClaimType.Affiliate) {
      return booleanToBool(claim.affiliate, context);
    } else {
      return optionize(countryCodeToMeshCountryCode)(claim.countryCode, context);
    }
  };

  if (type === TransferRestrictionType.Count) {
    restrictionType = 'MaxInvestorCount';
    restrictionValue = bigNumberToU64(value, context);
  } else if (type === TransferRestrictionType.Percentage) {
    restrictionType = 'MaxInvestorOwnership';
    restrictionValue = percentageToPermill(value, context);
  } else if (
    type === TransferRestrictionType.ClaimCount ||
    type === TransferRestrictionType.ClaimPercentage
  ) {
    let rawMin;
    let rawMax;
    const { min, max, claim, issuer } = value;
    if (type === TransferRestrictionType.ClaimCount) {
      restrictionType = 'ClaimCount';
      rawMin = bigNumberToU64(min, context);
      rawMax = optionize(bigNumberToU64)(max, context);
    } else {
      // i.e. TransferRestrictionType.ClaimPercentage
      restrictionType = 'ClaimOwnership';
      rawMin = percentageToPermill(min, context);
      rawMax = percentageToPermill(value.max, context);
    }
    const val = extractClaimValue(claim);
    const claimValue = {
      [claim.type]: val,
    };
    const rawIdentityId = stringToIdentityId(issuer.did, context);
    restrictionValue = [claimValue, rawIdentityId, rawMin, rawMax];
  } else {
    throw new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message: `Unexpected transfer restriction type: "${type}". Please report this to the Polymesh team`,
    });
  }
  return context.createType('PolymeshPrimitivesTransferComplianceTransferCondition', {
    [restrictionType]: restrictionValue,
  });
}

/**
 * @hidden
 */
export function identitiesToBtreeSet(
  identities: Identity[],
  context: Context
): BTreeSet<PolymeshPrimitivesIdentityId> {
  const rawIds = identities.map(({ did }) => stringToIdentityId(did, context));

  return context.createType('BTreeSet<PolymeshPrimitivesIdentityId>', rawIds);
}

/**
 * @hidden
 */
export function transferConditionToTransferRestriction(
  transferCondition: PolymeshPrimitivesTransferComplianceTransferCondition,
  context: Context
): TransferRestriction {
  if (transferCondition.isMaxInvestorCount) {
    return {
      type: TransferRestrictionType.Count,
      value: u64ToBigNumber(transferCondition.asMaxInvestorCount),
    };
  } else if (transferCondition.isMaxInvestorOwnership) {
    return {
      type: TransferRestrictionType.Percentage,
      value: permillToBigNumber(transferCondition.asMaxInvestorOwnership),
    };
  } else if (transferCondition.isClaimCount) {
    return {
      type: TransferRestrictionType.ClaimCount,
      value: claimCountToClaimCountRestrictionValue(transferCondition.asClaimCount, context),
    };
  } else if (transferCondition.isClaimOwnership) {
    return {
      type: TransferRestrictionType.ClaimPercentage,
      value: claimPercentageToClaimPercentageRestrictionValue(
        transferCondition.asClaimOwnership,
        context
      ),
    };
  } else {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unexpected transfer condition type',
    });
  }
}

/**
 * @hidden
 */
export function granularCanTransferResultToTransferBreakdown(
  result: GranularCanTransferResult,
  context: Context
): TransferBreakdown {
  const {
    invalid_granularity: invalidGranularity,
    self_transfer: selfTransfer,
    invalid_receiver_cdd: invalidReceiverCdd,
    invalid_sender_cdd: invalidSenderCdd,
    missing_scope_claim: missingScopeClaim,
    sender_insufficient_balance: insufficientBalance,
    asset_frozen: assetFrozen,
    portfolio_validity_result: {
      sender_portfolio_does_not_exist: senderPortfolioNotExists,
      receiver_portfolio_does_not_exist: receiverPortfolioNotExists,
      sender_insufficient_balance: senderInsufficientBalance,
    },
    transfer_condition_result: transferConditionResult,
    compliance_result: complianceResult,
    result: finalResult,
  } = result;

  const general = [];

  if (boolToBoolean(invalidGranularity)) {
    general.push(TransferError.InvalidGranularity);
  }

  if (boolToBoolean(selfTransfer)) {
    general.push(TransferError.SelfTransfer);
  }

  if (boolToBoolean(invalidReceiverCdd)) {
    general.push(TransferError.InvalidReceiverCdd);
  }

  if (boolToBoolean(invalidSenderCdd)) {
    general.push(TransferError.InvalidSenderCdd);
  }

  if (boolToBoolean(missingScopeClaim)) {
    general.push(TransferError.ScopeClaimMissing);
  }

  if (boolToBoolean(insufficientBalance)) {
    general.push(TransferError.InsufficientBalance);
  }

  if (boolToBoolean(assetFrozen)) {
    general.push(TransferError.TransfersFrozen);
  }

  if (boolToBoolean(senderPortfolioNotExists)) {
    general.push(TransferError.InvalidSenderPortfolio);
  }

  if (boolToBoolean(receiverPortfolioNotExists)) {
    general.push(TransferError.InvalidReceiverPortfolio);
  }

  if (boolToBoolean(senderInsufficientBalance)) {
    general.push(TransferError.InsufficientPortfolioBalance);
  }

  const restrictions = transferConditionResult.map(({ condition, result: tmResult }) => {
    return {
      restriction: transferConditionToTransferRestriction(condition, context),
      result: boolToBoolean(tmResult),
    };
  });

  return {
    general,
    compliance: assetComplianceResultToCompliance(complianceResult, context),
    restrictions,
    result: boolToBoolean(finalResult),
  };
}

/**
 * @hidden
 */
export function offeringTierToPriceTier(tier: OfferingTier, context: Context): PalletStoPriceTier {
  const { price, amount } = tier;
  return context.createType('PalletStoPriceTier', {
    total: bigNumberToBalance(amount, context),
    price: bigNumberToBalance(price, context),
  });
}

/**
 * @hidden
 */
export function permissionsLikeToPermissions(
  permissionsLike: PermissionsLike,
  context: Context
): Permissions {
  let assetPermissions: SectionPermissions<FungibleAsset> | null = {
    values: [],
    type: PermissionType.Include,
  };
  let transactionPermissions: TransactionPermissions | null = {
    values: [],
    type: PermissionType.Include,
  };
  let transactionGroupPermissions: TxGroup[] = [];
  let portfolioPermissions: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null = {
    values: [],
    type: PermissionType.Include,
  };

  let transactions: TransactionPermissions | null | undefined;
  let transactionGroups: TxGroup[] | undefined;

  if ('transactions' in permissionsLike) {
    ({ transactions } = permissionsLike);
  }

  if ('transactionGroups' in permissionsLike) {
    ({ transactionGroups } = permissionsLike);
  }

  const { assets, portfolios } = permissionsLike;

  if (assets === null) {
    assetPermissions = null;
  } else if (assets) {
    assetPermissions = {
      ...assets,
      values: assets.values.map(ticker =>
        typeof ticker !== 'string' ? ticker : new FungibleAsset({ ticker }, context)
      ),
    };
  }

  if (transactions !== undefined) {
    transactionPermissions = transactions;
  } else if (transactionGroups !== undefined) {
    transactionGroupPermissions = uniq(transactionGroups);
    const groupTags = flatten(transactionGroups.map(txGroupToTxTags));
    transactionPermissions = {
      ...transactionPermissions,
      values: groupTags,
    };
  }

  if (portfolios === null) {
    portfolioPermissions = null;
  } else if (portfolios) {
    portfolioPermissions = {
      ...portfolios,
      values: portfolios.values.map(portfolio => portfolioLikeToPortfolio(portfolio, context)),
    };
  }

  return {
    assets: assetPermissions,
    transactions: transactionPermissions && {
      ...transactionPermissions,
      values: [...transactionPermissions.values].sort((a, b) => a.localeCompare(b)),
    },
    transactionGroups: transactionGroupPermissions,
    portfolios: portfolioPermissions,
  };
}

/**
 * @hidden
 */
export function middlewarePortfolioToPortfolio(
  portfolio: MiddlewarePortfolio,
  context: Context
): DefaultPortfolio | NumberedPortfolio {
  const { identityId: did, number } = portfolio;

  if (number) {
    return new NumberedPortfolio({ did, id: new BigNumber(number) }, context);
  }

  return new DefaultPortfolio({ did }, context);
}

/**
 * @hidden
 */
export function fundraiserTierToTier(fundraiserTier: PalletStoFundraiserTier): Tier {
  const { total, price, remaining } = fundraiserTier;
  return {
    amount: balanceToBigNumber(total),
    price: balanceToBigNumber(price),
    remaining: balanceToBigNumber(remaining),
  };
}

/**
 * @hidden
 */
export function fundraiserToOfferingDetails(
  fundraiser: PalletStoFundraiser,
  name: Bytes,
  context: Context
): OfferingDetails {
  const {
    creator,
    offeringPortfolio,
    raisingPortfolio,
    raisingAsset,
    tiers: rawTiers,
    venueId,
    start: rawStart,
    end: rawEnd,
    status: rawStatus,
    minimumInvestment: rawMinInvestment,
  } = fundraiser;

  const tiers: Tier[] = [];
  let totalRemaining = new BigNumber(0);
  let totalAmount = new BigNumber(0);
  let totalRemainingValue = new BigNumber(0);

  rawTiers.forEach(rawTier => {
    const tier = fundraiserTierToTier(rawTier);

    tiers.push(tier);
    const { amount, remaining, price } = tier;

    totalAmount = totalAmount.plus(amount);
    totalRemaining = totalRemaining.plus(remaining);
    totalRemainingValue = totalRemainingValue.plus(price.multipliedBy(remaining));
  });

  const start = momentToDate(rawStart);
  const end = rawEnd.isSome ? momentToDate(rawEnd.unwrap()) : null;
  const now = new Date();

  const isStarted = now > start;
  const isExpired = end && now > end;

  const minInvestment = balanceToBigNumber(rawMinInvestment);

  let timing: OfferingTimingStatus = OfferingTimingStatus.NotStarted;
  let balance: OfferingBalanceStatus = OfferingBalanceStatus.Available;
  let sale: OfferingSaleStatus = OfferingSaleStatus.Live;

  if (isExpired) {
    timing = OfferingTimingStatus.Expired;
  } else if (isStarted) {
    timing = OfferingTimingStatus.Started;
  }

  if (totalRemainingValue.isZero()) {
    balance = OfferingBalanceStatus.SoldOut;
  } else if (totalRemainingValue.lt(minInvestment)) {
    balance = OfferingBalanceStatus.Residual;
  }

  if (rawStatus.isClosedEarly) {
    sale = OfferingSaleStatus.ClosedEarly;
  } else if (rawStatus.isClosed) {
    sale = OfferingSaleStatus.Closed;
  } else if (rawStatus.isFrozen) {
    sale = OfferingSaleStatus.Frozen;
  }

  return {
    creator: new Identity({ did: identityIdToString(creator) }, context),
    name: bytesToString(name),
    offeringPortfolio: meshPortfolioIdToPortfolio(offeringPortfolio, context),
    raisingPortfolio: meshPortfolioIdToPortfolio(raisingPortfolio, context),
    raisingCurrency: tickerToString(raisingAsset),
    tiers,
    venue: new Venue({ id: u64ToBigNumber(venueId) }, context),
    start,
    end,
    status: {
      timing,
      balance,
      sale,
    },
    minInvestment,
    totalAmount,
    totalRemaining,
  };
}

/**
 * @hidden
 */
export function meshCorporateActionToCorporateActionParams(
  corporateAction: PalletCorporateActionsCorporateAction,
  details: Bytes,
  context: Context
): CorporateActionParams {
  const {
    kind: rawKind,
    declDate,
    targets: { identities, treatment },
    defaultWithholdingTax,
    withholdingTax,
  } = corporateAction;

  let kind: CorporateActionKind;

  if (rawKind.isIssuerNotice) {
    kind = CorporateActionKind.IssuerNotice;
  } else if (rawKind.isPredictableBenefit) {
    kind = CorporateActionKind.PredictableBenefit;
  } else if (rawKind.isUnpredictableBenefit) {
    kind = CorporateActionKind.UnpredictableBenefit;
  } else if (rawKind.isReorganization) {
    kind = CorporateActionKind.Reorganization;
  } else {
    kind = CorporateActionKind.Other;
  }

  const targets = {
    identities: identities.map(
      identityId => new Identity({ did: identityIdToString(identityId) }, context)
    ),
    treatment: treatment.isExclude ? TargetTreatment.Exclude : TargetTreatment.Include,
  };

  const taxWithholdings = withholdingTax.map(([identityId, tax]) => ({
    identity: new Identity({ did: identityIdToString(identityId) }, context),
    percentage: permillToBigNumber(tax),
  }));

  return {
    kind,
    declarationDate: momentToDate(declDate),
    description: bytesToString(details),
    targets,
    defaultTaxWithholding: permillToBigNumber(defaultWithholdingTax),
    taxWithholdings,
  };
}

/**
 * @hidden
 */
export function corporateActionKindToCaKind(
  kind: CorporateActionKind,
  context: Context
): PalletCorporateActionsCaKind {
  return context.createType('PalletCorporateActionsCaKind', kind);
}

/**
 * @hidden
 */
export function checkpointToRecordDateSpec(
  checkpoint: Checkpoint | Date | CheckpointSchedule,
  context: Context
): PalletCorporateActionsRecordDateSpec {
  let value;

  if (checkpoint instanceof Checkpoint) {
    /* eslint-disable @typescript-eslint/naming-convention */
    value = { Existing: bigNumberToU64(checkpoint.id, context) };
  } else if (checkpoint instanceof Date) {
    value = { Scheduled: dateToMoment(checkpoint, context) };
  } else {
    value = { ExistingSchedule: bigNumberToU64(checkpoint.id, context) };
    /* eslint-enable @typescript-eslint/naming-convention */
  }

  return context.createType('PalletCorporateActionsRecordDateSpec', value);
}

/**
 * @hidden
 */
export function targetIdentitiesToCorporateActionTargets(
  targetIdentities: PalletCorporateActionsTargetIdentities,
  context: Context
): CorporateActionTargets {
  const { identities, treatment } = targetIdentities;

  return {
    identities: identities.map(
      identity => new Identity({ did: identityIdToString(identity) }, context)
    ),
    treatment: treatment.isInclude ? TargetTreatment.Include : TargetTreatment.Exclude,
  };
}

/**
 * @hidden
 */
export function targetsToTargetIdentities(
  targets: Omit<CorporateActionTargets, 'identities'> & {
    identities: (string | Identity)[];
  },
  context: Context
): PalletCorporateActionsTargetIdentities {
  const { treatment, identities } = targets;
  const { maxTargetIds } = context.polymeshApi.consts.corporateAction;

  const maxTargets = u32ToBigNumber(maxTargetIds);

  if (maxTargets.lt(targets.identities.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many target Identities',
      data: {
        maxTargets,
      },
    });
  }

  return context.createType('PalletCorporateActionsTargetIdentities', {
    identities: identities.map(identity => stringToIdentityId(signerToString(identity), context)),
    treatment: context.createType('TargetTreatment', treatment),
  });
}

/**
 * @hidden
 */
export function caTaxWithholdingsToMeshTaxWithholdings(
  taxWithholdings: InputCorporateActionTaxWithholdings,
  context: Context
): [PolymeshPrimitivesIdentityId, Permill][] {
  assertCaTaxWithholdingsValid(taxWithholdings, context);

  return taxWithholdings.map(({ identity, percentage }) =>
    tuple(
      stringToIdentityId(signerToString(identity), context),
      percentageToPermill(percentage, context)
    )
  );
}

/**
 * @hidden
 */
export function distributionToDividendDistributionParams(
  distribution: PalletCorporateActionsDistribution,
  context: Context
): DividendDistributionParams {
  const {
    from,
    currency,
    perShare,
    amount,
    expiresAt: expiryDate,
    paymentAt: paymentDate,
  } = distribution;

  return {
    origin: meshPortfolioIdToPortfolio(from, context),
    currency: tickerToString(currency),
    perShare: balanceToBigNumber(perShare),
    maxAmount: balanceToBigNumber(amount),
    expiryDate: expiryDate.isNone ? null : momentToDate(expiryDate.unwrap()),
    paymentDate: momentToDate(paymentDate),
  };
}

/**
 * @hidden
 */
export function corporateActionIdentifierToCaId(
  corporateActionIdentifier: CorporateActionIdentifier,
  context: Context
): PalletCorporateActionsCaId {
  const { ticker, localId } = corporateActionIdentifier;
  return context.createType('PalletCorporateActionsCaId', {
    ticker: stringToTicker(ticker, context),
    localId: bigNumberToU32(localId, context),
  });
}

/**
 * @hidden
 */
export function corporateActionParamsToMeshCorporateActionArgs(
  params: {
    ticker: string;
    kind: CorporateActionKind;
    declarationDate: Date;
    checkpoint: Date | Checkpoint | CheckpointSchedule;
    description: string;
    targets: InputCorporateActionTargets | null;
    defaultTaxWithholding: BigNumber | null;
    taxWithholdings: InputCorporateActionTaxWithholdings | null;
  },
  context: Context
): PalletCorporateActionsInitiateCorporateActionArgs {
  const {
    ticker,
    kind,
    declarationDate,
    checkpoint,
    description,
    targets,
    defaultTaxWithholding,
    taxWithholdings,
  } = params;
  const rawTicker = stringToTicker(ticker, context);
  const rawKind = corporateActionKindToCaKind(kind, context);
  const rawDeclDate = dateToMoment(declarationDate, context);
  const rawRecordDate = optionize(checkpointToRecordDateSpec)(checkpoint, context);
  const rawDetails = stringToBytes(description, context);
  const rawTargets = optionize(targetsToTargetIdentities)(targets, context);
  const rawTax = optionize(percentageToPermill)(defaultTaxWithholding, context);
  const rawWithholdings = optionize(caTaxWithholdingsToMeshTaxWithholdings)(
    taxWithholdings,
    context
  );

  return context.createType('PalletCorporateActionsInitiateCorporateActionArgs', {
    ticker: rawTicker,
    kind: rawKind,
    declDate: rawDeclDate,
    recordDate: rawRecordDate,
    details: rawDetails,
    targets: rawTargets,
    defaultWithholdingTax: rawTax,
    withholdingTax: rawWithholdings,
  });
}

/**
 * @hidden
 */
export function statisticsOpTypeToStatType(
  args: {
    op: PolymeshPrimitivesStatisticsStatOpType;
    claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
  },
  context: Context
): PolymeshPrimitivesStatisticsStatType {
  const { op, claimIssuer } = args;
  return context.createType('PolymeshPrimitivesStatisticsStatType', { op, claimIssuer });
}

/**
 * @hidden
 *
 * The chain requires BTreeSets to be sorted, Polkadot.js will shallow sort elements when calling `createType`,
 * however it will not look deeper at claimType. This function works around this short fall by sorting based on `claimType`
 * `createType` built in sorting is relied on otherwise.
 */
export function sortStatsByClaimType(
  stats: PolymeshPrimitivesStatisticsStatType[]
): PolymeshPrimitivesStatisticsStatType[] {
  return [...stats].sort((a, b) => {
    if (a.claimIssuer.isNone && b.claimIssuer.isNone) {
      return 0;
    }
    if (a.claimIssuer.isNone) {
      return 1;
    }
    if (b.claimIssuer.isNone) {
      return -1;
    }

    const [aClaim] = a.claimIssuer.unwrap();
    const [bClaim] = b.claimIssuer.unwrap();
    return aClaim.index - bClaim.index;
  });
}

/**
 * @hidden
 */
export function statisticStatTypesToBtreeStatType(
  stats: PolymeshPrimitivesStatisticsStatType[],
  context: Context
): BTreeSet<PolymeshPrimitivesStatisticsStatType> {
  const sortedStats = sortStatsByClaimType(stats);
  return context.createType('BTreeSet<PolymeshPrimitivesStatisticsStatType>', sortedStats);
}

/**
 * @hidden
 */
export function transferConditionsToBtreeTransferConditions(
  conditions: PolymeshPrimitivesTransferComplianceTransferCondition[],
  context: Context
): BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition> {
  return context.createType(
    'BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>',
    conditions
  );
}

/**
 * @hidden
 */
export function keyAndValueToStatUpdate(
  key2: PolymeshPrimitivesStatisticsStat2ndKey,
  value: u128,
  context: Context
): PolymeshPrimitivesStatisticsStatUpdate {
  return context.createType('PolymeshPrimitivesStatisticsStatUpdate', { key2, value });
}

/**
 * @hidden
 */
export function statUpdatesToBtreeStatUpdate(
  statUpdates: PolymeshPrimitivesStatisticsStatUpdate[],
  context: Context
): BTreeSet<PolymeshPrimitivesStatisticsStatUpdate> {
  return context.createType('BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>', statUpdates);
}

/**
 * @hidden
 */
export function meshStatToStatType(rawStat: PolymeshPrimitivesStatisticsStatType): StatType {
  const {
    op: { type },
    claimIssuer,
  } = rawStat;

  if (claimIssuer.isNone) {
    if (type === 'Count') {
      return StatType.Count;
    } else {
      return StatType.Balance;
    }
  }

  if (type === 'Count') {
    return StatType.ScopedCount;
  } else {
    return StatType.ScopedBalance;
  }
}

/**
 * @hidden
 */
export function statTypeToStatOpType(
  type: StatType,
  context: Context
): PolymeshPrimitivesStatisticsStatOpType {
  if (type === StatType.Count || type === StatType.ScopedCount) {
    return context.createType('PolymeshPrimitivesStatisticsStatOpType', StatType.Count);
  }
  return context.createType('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance);
}

/**
 * @hidden
 */
export function transferRestrictionTypeToStatOpType(
  type: TransferRestrictionType,
  context: Context
): PolymeshPrimitivesStatisticsStatOpType {
  if (type === TransferRestrictionType.Count || type === TransferRestrictionType.ClaimCount) {
    return context.createType('PolymeshPrimitivesStatisticsStatOpType', StatType.Count);
  }

  return context.createType('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance);
}

/**
 * Scoped stats are a map of maps, e.g. Jurisdiction has a counter for each CountryCode. a 2ndKey specifies what Country count to use
 * @hidden
 */
export function createStat2ndKey(
  type: 'NoClaimStat' | StatClaimType,
  context: Context,
  claimStat?: 'yes' | 'no' | CountryCode
): PolymeshPrimitivesStatisticsStat2ndKey {
  if (type === 'NoClaimStat') {
    return context.createType('PolymeshPrimitivesStatisticsStat2ndKey', type);
  } else {
    let value;
    if (claimStat === 'yes') {
      value = true;
    } else if (claimStat === 'no') {
      value = false;
    } else {
      value = claimStat;
    }
    return context.createType('PolymeshPrimitivesStatisticsStat2ndKey', {
      claim: { [type]: value },
    });
  }
}

/**
 * @hidden
 * The chain requires BTreeSets to be sorted. While polkadot.js createType will provide shallow sorting
 * it fails to consider the nested CountryCode values. This works around the shortfall, but relies on `createType`
 * sorting for otherwise
 */
export function sortTransferRestrictionByClaimValue(
  conditions: PolymeshPrimitivesTransferComplianceTransferCondition[]
): PolymeshPrimitivesTransferComplianceTransferCondition[] {
  const getJurisdictionValue = (
    condition: PolymeshPrimitivesTransferComplianceTransferCondition
  ): Option<PolymeshPrimitivesJurisdictionCountryCode> | undefined => {
    const { isClaimCount, isClaimOwnership } = condition;
    if (isClaimCount) {
      if (!condition.asClaimCount[0].isJurisdiction) {
        return undefined;
      } else {
        return condition.asClaimCount[0].asJurisdiction;
      }
    } else if (isClaimOwnership) {
      if (!condition.asClaimOwnership[0].isJurisdiction) {
        return undefined;
      }
      return condition.asClaimOwnership[0].asJurisdiction;
    } else {
      return undefined;
    }
  };

  return [...conditions].sort((a, b) => {
    const aClaim = getJurisdictionValue(a);
    if (!aClaim) {
      return 1;
    }
    const bClaim = getJurisdictionValue(b);
    if (!bClaim) {
      return -1;
    }

    if (aClaim.isNone && bClaim.isNone) {
      return 0;
    }
    if (aClaim.isNone) {
      return -1;
    }
    if (bClaim.isNone) {
      return 1;
    }
    const aCode = meshCountryCodeToCountryCode(aClaim.unwrap());
    const bCode = meshCountryCodeToCountryCode(bClaim.unwrap());

    const countryOrder = Object.values(CountryCode);
    return countryOrder.indexOf(aCode) - countryOrder.indexOf(bCode);
  });
}

/**
 * @hidden
 */
export function complianceConditionsToBtreeSet(
  conditions: PolymeshPrimitivesTransferComplianceTransferCondition[],
  context: Context
): BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition> {
  const sortedConditions = sortTransferRestrictionByClaimValue(conditions);
  return context.createType(
    'BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>',
    sortedConditions
  );
}

/**
 * @hidden
 */
export function toExemptKey(
  tickerKey: TickerKey,
  op: PolymeshPrimitivesStatisticsStatOpType,
  claimType?: ClaimType
): ExemptKey {
  return { asset: tickerKey, op, claimType };
}

/**
 * @hidden
 */
export function claimCountStatInputToStatUpdates(
  args: ClaimCountStatInput,
  context: Context
): BTreeSet<PolymeshPrimitivesStatisticsStatUpdate> {
  const { value, claimType: type } = args;
  let updateArgs;

  if (type === ClaimType.Jurisdiction) {
    updateArgs = value.map(({ countryCode, count }) => {
      const rawSecondKey = createStat2ndKey(type, context, countryCode);
      return keyAndValueToStatUpdate(rawSecondKey, bigNumberToU128(count, context), context);
    });
  } else {
    let yes, no;
    if (type === ClaimType.Accredited) {
      ({ accredited: yes, nonAccredited: no } = value);
    } else {
      ({ affiliate: yes, nonAffiliate: no } = value);
    }
    const yes2ndKey = createStat2ndKey(type, context, 'yes');
    const yesCount = bigNumberToU128(yes, context);
    const no2ndKey = createStat2ndKey(type, context, 'no');
    const noCount = bigNumberToU128(no, context);
    updateArgs = [
      keyAndValueToStatUpdate(yes2ndKey, yesCount, context),
      keyAndValueToStatUpdate(no2ndKey, noCount, context),
    ];
  }
  return statUpdatesToBtreeStatUpdate(updateArgs, context);
}

/**
 * @hidden
 * transforms a non scoped count stat to a StatUpdate type
 */
export function countStatInputToStatUpdates(
  args: CountTransferRestrictionInput,
  context: Context
): BTreeSet<PolymeshPrimitivesStatisticsStatUpdate> {
  const { count } = args;
  const secondKey = createStat2ndKey('NoClaimStat', context);
  const stat = keyAndValueToStatUpdate(secondKey, bigNumberToU128(count, context), context);
  return statUpdatesToBtreeStatUpdate([stat], context);
}

/**
 * @hidden
 */
export function inputStatTypeToMeshStatType(
  input: InputStatType,
  context: Context
): PolymeshPrimitivesStatisticsStatType {
  const { type } = input;
  const op = statTypeToStatOpType(type, context);
  let claimIssuer;
  if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
    claimIssuer = claimIssuerToMeshClaimIssuer(input.claimIssuer, context);
  }
  return statisticsOpTypeToStatType({ op, claimIssuer }, context);
}

/**
 * @hidden
 */
export function meshProposalStatusToProposalStatus(
  status: PolymeshPrimitivesMultisigProposalStatus,
  expiry: Date | null
): ProposalStatus {
  const { type } = status;
  switch (type) {
    case 'ActiveOrExpired':
      if (!expiry || expiry > new Date()) {
        return ProposalStatus.Active;
      } else {
        return ProposalStatus.Expired;
      }
    case 'Invalid':
      return ProposalStatus.Invalid;
    case 'ExecutionSuccessful':
      return ProposalStatus.Successful;
    case 'ExecutionFailed':
      return ProposalStatus.Failed;
    case 'Rejected':
      return ProposalStatus.Rejected;
    default:
      throw new UnreachableCaseError(type);
  }
}

/**
 * @hidden
 */
export function metadataSpecToMeshMetadataSpec(
  specs: MetadataSpec,
  context: Context
): PolymeshPrimitivesAssetMetadataAssetMetadataSpec {
  const { url, description, typeDef } = specs;

  const {
    polymeshApi: {
      consts: {
        asset: { assetMetadataTypeDefMaxLength },
      },
    },
  } = context;

  const metadataTypeDefMaxLength = u32ToBigNumber(assetMetadataTypeDefMaxLength);

  if (typeDef && metadataTypeDefMaxLength.lt(typeDef.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: '"typeDef" length exceeded for given Asset Metadata spec',
      data: {
        maxLength: metadataTypeDefMaxLength,
      },
    });
  }

  return context.createType('PolymeshPrimitivesAssetMetadataAssetMetadataSpec', {
    url: optionize(stringToBytes)(url, context),
    description: optionize(stringToBytes)(description, context),
    typeDef: optionize(stringToBytes)(typeDef, context),
  });
}

/**
 * @hidden
 */
export function meshMetadataSpecToMetadataSpec(
  rawSpecs?: Option<PolymeshPrimitivesAssetMetadataAssetMetadataSpec>
): MetadataSpec {
  const specs: MetadataSpec = {};

  if (rawSpecs?.isSome) {
    const { url: rawUrl, description: rawDescription, typeDef: rawTypeDef } = rawSpecs.unwrap();

    if (rawUrl.isSome) {
      specs.url = bytesToString(rawUrl.unwrap());
    }

    if (rawDescription.isSome) {
      specs.description = bytesToString(rawDescription.unwrap());
    }

    if (rawTypeDef.isSome) {
      specs.typeDef = bytesToString(rawTypeDef.unwrap());
    }
  }
  return specs;
}

/**
 * @hidden
 */
export function metadataToMeshMetadataKey(
  type: MetadataType,
  id: BigNumber,
  context: Context
): PolymeshPrimitivesAssetMetadataAssetMetadataKey {
  const rawId = bigNumberToU64(id, context);

  let metadataKey;
  if (type === MetadataType.Local) {
    metadataKey = { Local: rawId };
  } else {
    metadataKey = { Global: rawId };
  }

  return context.createType('PolymeshPrimitivesAssetMetadataAssetMetadataKey', metadataKey);
}

/**
 * @hidden
 */
export function meshMetadataValueToMetadataValue(
  rawValue: Option<Bytes>,
  rawDetails: Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
): MetadataValue | null {
  if (rawValue.isNone) {
    return null;
  }

  let metadataValue: MetadataValue = {
    value: bytesToString(rawValue.unwrap()),
    lockStatus: MetadataLockStatus.Unlocked,
    expiry: null,
  };

  if (rawDetails.isSome) {
    const { lockStatus: rawLockStatus, expire } = rawDetails.unwrap();

    metadataValue = { ...metadataValue, expiry: optionize(momentToDate)(expire.unwrapOr(null)) };

    if (rawLockStatus.isLocked) {
      metadataValue = { ...metadataValue, lockStatus: MetadataLockStatus.Locked };
    }

    if (rawLockStatus.isLockedUntil) {
      metadataValue = {
        ...metadataValue,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil: momentToDate(rawLockStatus.asLockedUntil),
      };
    }
  }
  return metadataValue;
}

/**
 * @hidden
 */
export function metadataValueToMeshMetadataValue(value: string, context: Context): Bytes {
  const {
    polymeshApi: {
      consts: {
        asset: { assetMetadataValueMaxLength },
      },
    },
  } = context;

  const metadataValueMaxLength = u32ToBigNumber(assetMetadataValueMaxLength);

  if (metadataValueMaxLength.lt(value.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset Metadata value length exceeded',
      data: {
        maxLength: metadataValueMaxLength,
      },
    });
  }
  return stringToBytes(value, context);
}

/**
 * @hidden
 */
export function metadataValueDetailToMeshMetadataValueDetail(
  details: MetadataValueDetails,
  context: Context
): PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail {
  const { lockStatus, expiry } = details;

  let meshLockStatus;
  if (lockStatus === MetadataLockStatus.LockedUntil) {
    const { lockedUntil } = details;

    if (lockedUntil < new Date()) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Locked until date must be in the future',
      });
    }

    meshLockStatus = { LockedUntil: dateToMoment(lockedUntil, context) };
  } else {
    meshLockStatus = lockStatus;
  }

  if (expiry && expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Expiry date must be in the future',
    });
  }

  return context.createType('PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail', {
    expire: optionize(dateToMoment)(expiry, context),
    lockStatus: meshLockStatus,
  });
}

/**
 * @hidden
 */
export function instructionMemoToString(value: U8aFixed): string {
  return removePadding(hexToString(value.toString()));
}

/**
 * @hidden
 */
export function middlewareInstructionToHistoricInstruction(
  instruction: Instruction,
  context: Context
): HistoricInstruction {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const {
    id: instructionId,
    status,
    settlementType,
    endBlock,
    tradeDate,
    valueDate,
    legs: { nodes: legs },
    memo,
    createdBlock,
    venueId,
  } = instruction;
  const { blockId, hash, datetime } = createdBlock!;

  let typeDetails;

  if (settlementType === InstructionType.SettleOnAffirmation) {
    typeDetails = {
      type: InstructionType.SettleOnAffirmation,
    };
  } else {
    typeDetails = {
      type: settlementType as InstructionType,
      endBlock: new BigNumber(endBlock!),
    };
  }

  return {
    id: new BigNumber(instructionId),
    blockNumber: new BigNumber(blockId),
    blockHash: hash,
    status,
    tradeDate,
    valueDate,
    ...typeDetails,
    memo: memo ?? null,
    venueId: new BigNumber(venueId),
    createdAt: new Date(datetime),
    legs: legs.map(({ from, to, assetId, amount }) => ({
      asset: new FungibleAsset({ ticker: assetId }, context),
      amount: new BigNumber(amount).shiftedBy(-6),
      from: middlewarePortfolioToPortfolio(from!, context),
      to: middlewarePortfolioToPortfolio(to!, context),
    })),
  };
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

/**
 * @hidden
 */
export function expiryToMoment(expiry: Date | undefined, context: Context): Moment | null {
  if (expiry && expiry <= new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Expiry date must be in the future',
    });
  }

  return optionize(dateToMoment)(expiry, context);
}

/**
 * @hidden
 * Note: currently only supports fungible legs, see `portfolioToPortfolioKind` for exemplary API
 */
export function middlewarePortfolioDataToPortfolio(
  data: {
    did: string;
    kind: { default: null } | { user: number };
  },
  context: Context
): DefaultPortfolio | NumberedPortfolio {
  const { did, kind } = data;

  if ('default' in kind) {
    return new DefaultPortfolio({ did }, context);
  }
  return new NumberedPortfolio({ did, id: new BigNumber(kind.user) }, context);
}

/**
 * @hidden
 */
export function legToSettlementLeg(
  leg: {
    Fungible: {
      sender: PolymeshPrimitivesIdentityIdPortfolioId;
      receiver: PolymeshPrimitivesIdentityIdPortfolioId;
      ticker: PolymeshPrimitivesTicker;
      amount: Balance;
    };
  },
  context: Context
): PolymeshPrimitivesSettlementLeg {
  return context.createType('PolymeshPrimitivesSettlementLeg', leg);
}

/**
 * @hidden
 */
export function middlewareAgentGroupDataToPermissionGroup(
  agentGroupData: Record<string, Record<string, null | number>>,
  context: Context
): KnownPermissionGroup | CustomPermissionGroup {
  const asset = Object.keys(agentGroupData)[0];
  const agentGroup = agentGroupData[asset];

  let permissionGroupIdentifier: PermissionGroupIdentifier;
  if ('full' in agentGroup) {
    permissionGroupIdentifier = PermissionGroupType.Full;
  } else if ('exceptMeta' in agentGroup) {
    permissionGroupIdentifier = PermissionGroupType.ExceptMeta;
  } else if ('polymeshV1CAA' in agentGroup) {
    permissionGroupIdentifier = PermissionGroupType.PolymeshV1Caa;
  } else if ('polymeshV1PIA' in agentGroup) {
    permissionGroupIdentifier = PermissionGroupType.PolymeshV1Pia;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    permissionGroupIdentifier = { custom: new BigNumber(agentGroup.custom!) };
  }

  const ticker = coerceHexToString(asset);
  return assemblePermissionGroup(permissionGroupIdentifier, ticker, context);
}

/**
 * @hidden
 */
function middlewareExtrinsicPermissionsDataToTransactionPermissions(
  permissions: Record<
    string,
    {
      palletName: string;
      dispatchableNames: Record<string, string[]>;
    }[]
  >
): TransactionPermissions | null {
  let extrinsicType: PermissionType;
  let pallets;
  if ('these' in permissions) {
    extrinsicType = PermissionType.Include;
    pallets = permissions.these;
  } else if ('except' in permissions) {
    extrinsicType = PermissionType.Exclude;
    pallets = permissions.except;
  }

  let txValues: (ModuleName | TxTag)[] = [];
  let exceptions: TxTag[] = [];

  if (pallets) {
    pallets.forEach(({ palletName, dispatchableNames }) => {
      const moduleName = stringLowerFirst(coerceHexToString(palletName));
      if ('except' in dispatchableNames) {
        const dispatchables = [...dispatchableNames.except];
        exceptions = [
          ...exceptions,
          ...dispatchables.map(name => formatTxTag(coerceHexToString(name), moduleName)),
        ];
        txValues = [...txValues, moduleName as ModuleName];
      } else if ('these' in dispatchableNames) {
        const dispatchables = [...dispatchableNames.these];
        txValues = [
          ...txValues,
          ...dispatchables.map(name => formatTxTag(coerceHexToString(name), moduleName)),
        ];
      } else {
        txValues = [...txValues, moduleName as ModuleName];
      }
    });

    const result = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: extrinsicType!,
      values: txValues,
    };

    return exceptions.length ? { ...result, exceptions } : result;
  }

  return null;
}

/**
 * @hidden
 */
export function datesToScheduleCheckpoints(
  points: Date[],
  context: Context
): PolymeshCommonUtilitiesCheckpointScheduleCheckpoints {
  const rawPoints = points.map(point => dateToMoment(point, context));

  const pending = context.createType('BTreeSet<Moment>', rawPoints);

  return context.createType('PolymeshCommonUtilitiesCheckpointScheduleCheckpoints', { pending });
}

/**
 * @hidden
 */
export function middlewarePermissionsDataToPermissions(
  permissionsData: string,
  context: Context
): Permissions {
  const { asset, extrinsic, portfolio } = JSON.parse(permissionsData);

  let assets: SectionPermissions<FungibleAsset> | null = null;
  let transactions: TransactionPermissions | null = null;
  let portfolios: SectionPermissions<DefaultPortfolio | NumberedPortfolio> | null = null;

  let assetsType: PermissionType;
  let assetsPermissions;
  if ('these' in asset) {
    assetsType = PermissionType.Include;
    assetsPermissions = asset.these;
  } else if ('except' in asset) {
    assetsType = PermissionType.Exclude;
    assetsPermissions = asset.except;
  }

  if (assetsPermissions) {
    assets = {
      values: [...assetsPermissions].map(
        ticker => new FungibleAsset({ ticker: coerceHexToString(ticker) }, context)
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: assetsType!,
    };
  }

  transactions = middlewareExtrinsicPermissionsDataToTransactionPermissions(extrinsic);

  let portfoliosType: PermissionType;
  let portfolioIds;
  if ('these' in portfolio) {
    portfoliosType = PermissionType.Include;
    portfolioIds = portfolio.these;
  } else if ('except' in portfolio) {
    portfoliosType = PermissionType.Exclude;
    portfolioIds = portfolio.except;
  }

  if (portfolioIds) {
    portfolios = {
      values: [...portfolioIds].map(portfolioId =>
        middlewarePortfolioDataToPortfolio(portfolioId, context)
      ),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      type: portfoliosType!,
    };
  }

  return {
    assets,
    transactions,
    transactionGroups: transactions ? transactionPermissionsToTxGroups(transactions) : [],
    portfolios,
  };
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @hidden
 */
export function middlewareAuthorizationDataToAuthorization(
  context: Context,
  type: AuthTypeEnum,
  data?: string
): Authorization {
  switch (type) {
    case AuthTypeEnum.AttestPrimaryKeyRotation:
      return {
        type: AuthorizationType.AttestPrimaryKeyRotation,
        value: new Identity({ did: data! }, context),
      };
    case AuthTypeEnum.RotatePrimaryKey: {
      return {
        type: AuthorizationType.RotatePrimaryKey,
      };
    }
    case AuthTypeEnum.RotatePrimaryKeyToSecondary: {
      return {
        type: AuthorizationType.RotatePrimaryKeyToSecondary,
        value: middlewarePermissionsDataToPermissions(data!, context),
      };
    }
    case AuthTypeEnum.JoinIdentity: {
      return {
        type: AuthorizationType.JoinIdentity,
        value: middlewarePermissionsDataToPermissions(data!, context),
      };
    }
    case AuthTypeEnum.AddMultiSigSigner:
      return {
        type: AuthorizationType.AddMultiSigSigner,
        value: data!,
      };
    case AuthTypeEnum.AddRelayerPayingKey: {
      // data is received in the format - {"5Ci94GCJC2JBM8U1PCkpHX6HkscWmucN9XwUrjb7o4TDgVns","5DZp1QYH49MKZhCtDupNaAeHp8xtqetuSzgf2p2cUWoxW3iu","1000000000"}
      const [beneficiary, subsidizer, allowance] = data!
        .substring(1, data!.length - 1)
        .replace(/"/g, '')
        .split(',');

      return {
        type: AuthorizationType.AddRelayerPayingKey,
        value: {
          beneficiary: new Account({ address: beneficiary }, context),
          subsidizer: new Account({ address: subsidizer }, context),
          allowance: new BigNumber(allowance).shiftedBy(-6),
        },
      };
    }
    case AuthTypeEnum.BecomeAgent: {
      const becomeAgentData = JSON.parse(data!.replace(',', ':'));
      return {
        type: AuthorizationType.BecomeAgent,
        value: middlewareAgentGroupDataToPermissionGroup(becomeAgentData, context),
      };
    }
    case AuthTypeEnum.TransferTicker:
      return {
        type: AuthorizationType.TransferTicker,
        value: coerceHexToString(data!),
      };
    case AuthTypeEnum.TransferAssetOwnership: {
      return {
        type: AuthorizationType.TransferAssetOwnership,
        value: coerceHexToString(data!),
      };
    }
    case AuthTypeEnum.PortfolioCustody: {
      return {
        type: AuthorizationType.PortfolioCustody,
        value: middlewarePortfolioDataToPortfolio(JSON.parse(data!), context),
      };
    }
  }

  throw new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message: 'Unsupported Authorization Type. Please contact the Polymesh team',
    data: {
      auth: data,
    },
  });
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

/**
 * @hidden
 */
export function collectionKeysToMetadataKeys(
  keys: { type: MetadataType; id: BigNumber }[],
  context: Context
): Vec<PolymeshPrimitivesAssetMetadataAssetMetadataKey> {
  const metadataKeys = keys.map(({ type, id }) => {
    return metadataToMeshMetadataKey(type, id, context);
  });

  return context.createType('Vec<PolymeshPrimitivesAssetMetadataAssetMetadataKey>', metadataKeys);
}

/**
 * @hidden
 */
export function meshMetadataKeyToMetadataKey(
  rawKey: PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  ticker: string
): MetadataKeyId {
  if (rawKey.isGlobal) {
    return { type: MetadataType.Global, id: u64ToBigNumber(rawKey.asGlobal) };
  } else {
    return { type: MetadataType.Local, id: u64ToBigNumber(rawKey.asLocal), ticker };
  }
}

/**
 * @hidden
 */
export function meshNftToNftId(rawInfo: PolymeshPrimitivesNftNfTs): {
  ticker: string;
  ids: BigNumber[];
} {
  const { ticker: rawTicker, ids: rawIds } = rawInfo;

  return {
    ticker: tickerToString(rawTicker),
    ids: rawIds.map(rawId => u64ToBigNumber(rawId)),
  };
}

/**
 * @hidden
 */
export function nftInputToNftMetadataAttribute(
  nftInfo: NftMetadataInput,
  context: Context
): PolymeshPrimitivesNftNftMetadataAttribute {
  const { type, id, value } = nftInfo;

  const rawKey = metadataToMeshMetadataKey(type, id, context);
  const rawValue = metadataValueToMeshMetadataValue(value, context);

  return context.createType('PolymeshPrimitivesNftNftMetadataAttribute', {
    key: rawKey,
    value: rawValue,
  });
}

/**
 * @hidden
 */
export function nftInputToNftMetadataVec(
  nftInfo: NftMetadataInput[],
  context: Context
): Vec<PolymeshPrimitivesNftNftMetadataAttribute> {
  const rawItems = nftInfo.map(item => nftInputToNftMetadataAttribute(item, context));

  return context.createType('Vec<PolymeshPrimitivesNftNftMetadataAttribute>', rawItems);
}
