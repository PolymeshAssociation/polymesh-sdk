import { bool, Bytes, Text, u8, u32, u64 } from '@polkadot/types';
import { AccountId, Balance, Hash, Moment, Permill, Signature } from '@polkadot/types/interfaces';
import {
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
  includes,
  map,
  padEnd,
  range,
  rangeRight,
  snakeCase,
  uniq,
  values,
} from 'lodash';
import {
  AffirmationStatus as MeshAffirmationStatus,
  AgentGroup,
  AssetComplianceResult,
  AssetIdentifier,
  AssetName,
  AssetType,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  CAId,
  CAKind,
  CalendarPeriod as MeshCalendarPeriod,
  CanTransferResult,
  CddId,
  CddStatus,
  Claim as MeshClaim,
  ClaimType as MeshClaimType,
  ComplianceRequirement,
  ComplianceRequirementResult,
  Condition as MeshCondition,
  ConditionType as MeshConditionType,
  CorporateAction as MeshCorporateAction,
  DispatchableName,
  Distribution,
  Document,
  DocumentHash,
  DocumentName,
  DocumentType,
  DocumentUri,
  EcdsaSignature,
  ExtrinsicPermissions,
  FundingRoundName,
  Fundraiser,
  FundraiserName,
  FundraiserTier,
  GranularCanTransferResult,
  IdentityId,
  InstructionStatus as MeshInstructionStatus,
  InvestorZKProofData,
  Memo,
  ModuleName,
  MovePortfolioItem,
  Permissions as MeshPermissions,
  PortfolioId as MeshPortfolioId,
  PosRatio,
  PriceTier,
  ProtocolOp,
  RecordDateSpec,
  RistrettoPoint,
  Scalar,
  ScheduleSpec as MeshScheduleSpec,
  Scope as MeshScope,
  ScopeClaimProof as MeshScopeClaimProof,
  ScopeId,
  SecondaryKey as MeshSecondaryKey,
  SettlementType,
  Signatory,
  StoredSchedule,
  TargetIdentities,
  TargetIdentity,
  Ticker,
  TransferManager,
  TrustedIssuer,
  TxTag,
  TxTags,
  VenueDetails,
  VenueType as MeshVenueType,
} from 'polymesh-types/types';

import { meshCountryCodeToCountryCode } from '~/generated/utils';
// import { ProposalDetails } from '~/api/types';
import {
  Account,
  Asset,
  Checkpoint,
  CheckpointSchedule,
  Context,
  CustomPermissionGroup,
  DefaultPortfolio,
  Identity,
  KnownPermissionGroup,
  NumberedPortfolio,
  PolymeshError,
  Portfolio,
  Venue,
} from '~/internal';
import {
  CallIdEnum,
  ClaimScopeTypeEnum,
  Event as MiddlewareEvent,
  IdentityWithClaims as MiddlewareIdentityWithClaims,
  ModuleIdEnum,
  Portfolio as MiddlewarePortfolio,
  // Proposal,
  Scope as MiddlewareScope,
} from '~/middleware/types';
import {
  AffirmationStatus,
  AssetDocument,
  Authorization,
  AuthorizationType,
  CalendarPeriod,
  CalendarUnit,
  CheckpointScheduleParams,
  Claim,
  ClaimType,
  Compliance,
  Condition,
  ConditionCompliance,
  ConditionTarget,
  ConditionType,
  CorporateActionKind,
  CorporateActionParams,
  CorporateActionTargets,
  DividendDistributionParams,
  ErrorCode,
  EventIdentifier,
  ExternalAgentCondition,
  IdentityCondition,
  IdentityWithClaims,
  InputRequirement,
  InputTrustedClaimIssuer,
  InstructionType,
  KnownAssetType,
  MultiClaimCondition,
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
  PortfolioLike,
  PortfolioMovement,
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
  VenueType,
} from '~/types';
import {
  CorporateActionIdentifier,
  ExtrinsicIdentifier,
  InstructionStatus,
  InternalAssetType,
  PalletPermissions,
  PermissionGroupIdentifier,
  PermissionsEnum,
  PolymeshTx,
  PortfolioId,
  ScheduleSpec,
  ScopeClaimProof,
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
  assertAddressValid,
  assertIsInteger,
  assertIsPositive,
  conditionsAreEqual,
  createClaim,
  getTicker,
  isModuleOrTagMatch,
  isPrintableAscii,
  optionize,
  padString,
  removePadding,
} from '~/utils/internal';
import { isMultiClaimCondition, isSingleClaimCondition } from '~/utils/typeguards';

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
export function stringToAssetName(name: string, context: Context): AssetName {
  return context.createType('AssetName', name);
}

/**
 * @hidden
 */
export function assetNameToString(name: AssetName): string {
  return name.toString();
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
export function stringToTicker(ticker: string, context: Context): Ticker {
  if (!ticker.length || ticker.length > MAX_TICKER_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker length must be between 1 and ${MAX_TICKER_LENGTH} characters`,
    });
  }

  if (!isPrintableAscii(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only printable ASCII is allowed as ticker name',
    });
  }

  if (ticker !== ticker.toUpperCase()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Ticker cannot contain lower case letters',
    });
  }

  return context.createType('Ticker', padString(ticker, MAX_TICKER_LENGTH));
}

/**
 * @hidden
 */
export function tickerToString(ticker: Ticker): string {
  return removePadding(u8aToString(ticker));
}

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @hidden
 */
export function stringToInvestorZKProofData(proof: string, context: Context): InvestorZKProofData {
  return context.createType('InvestorZKProofData', proof);
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * @hidden
 */
export function dateToMoment(date: Date, context: Context): Moment {
  return context.createType('Moment', date.getTime());
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
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return context.createType('IdentityId', identityId);
}

/**
 * @hidden
 */
export function identityIdToString(identityId: IdentityId): string {
  return identityId.toString();
}

/**
 * @hidden
 */
export function stringToEcdsaSignature(signature: string, context: Context): EcdsaSignature {
  return context.createType('EcdsaSignature', signature);
}

/**
 * @hidden
 */
export function signatoryToAccount(signatory: Signatory, context: Context): Account {
  if (signatory.isAccount) {
    return new Account({ address: accountIdToString(signatory.asAccount) }, context);
  }

  throw new PolymeshError({
    code: ErrorCode.UnexpectedError,
    message:
      'Received an Identity where an Account was expected. Please report this issue to the Polymath team',
  });
}

/**
 * @hidden
 */
export function signerValueToSignatory(signer: SignerValue, context: Context): Signatory {
  return context.createType('Signatory', {
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
export function signatoryToSignerValue(signatory: Signatory): SignerValue {
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
export function bigNumberToU64(value: BigNumber, context: Context): u64 {
  assertIsInteger(value);
  assertIsPositive(value);
  return context.createType('u64', value.toString());
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
 * @hidden
 */
export function meshPortfolioIdToPortfolio(
  portfolioId: MeshPortfolioId,
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

    if (typeof valueIdentity === 'string') {
      did = valueIdentity;
    } else {
      ({ did } = valueIdentity);
    }
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
): MeshPortfolioId {
  const { did, number } = portfolioId;
  return context.createType('PortfolioId', {
    did: stringToIdentityId(did, context),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    kind: number ? { User: bigNumberToU64(number, context) } : 'Default',
  });
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
        TxTags.settlement.AddAndAffirmInstruction,
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
        TxTags.settlement.AddAndAffirmInstruction,
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
function splitTag(tag: TxTag) {
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
export function permissionsToMeshPermissions(
  permissions: Permissions,
  context: Context
): MeshPermissions {
  const { assets, transactions, portfolios } = permissions;

  const extrinsic = transactionPermissionsToExtrinsicPermissions(transactions, context);

  let asset: PermissionsEnum<Ticker> = 'Whole';
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

  let portfolio: PermissionsEnum<MeshPortfolioId> = 'Whole';
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

  return context.createType('Permissions', value);
}

/**
 * @hidden
 */
export function transactionPermissionsToExtrinsicPermissions(
  transactionPermissions: TransactionPermissions | null,
  context: Context
): ExtrinsicPermissions {
  return context.createType(
    'ExtrinsicPermissions',
    transactionPermissions ? buildPalletPermissions(transactionPermissions) : 'Whole'
  );
}

/**
 * @hidden
 */
export function extrinsicPermissionsToTransactionPermissions(
  permissions: ExtrinsicPermissions
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

  const formatTxTag = (dispatchable: DispatchableName, moduleName: string): TxTag =>
    `${moduleName}.${camelCase(textToString(dispatchable))}` as TxTag;

  if (pallets) {
    pallets.forEach(({ pallet_name: palletName, dispatchable_names: dispatchableNames }) => {
      const moduleName = stringLowerFirst(textToString(palletName));

      if (dispatchableNames.isExcept) {
        const dispatchables = dispatchableNames.asExcept;
        exceptions = [...exceptions, ...dispatchables.map(name => formatTxTag(name, moduleName))];
        txValues = [...txValues, moduleName as ModuleName];
      } else if (dispatchableNames.isThese) {
        const dispatchables = dispatchableNames.asThese;
        txValues = [...txValues, ...dispatchables.map(name => formatTxTag(name, moduleName))];
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
  permissions: MeshPermissions,
  context: Context
): Permissions {
  const { asset, extrinsic, portfolio } = permissions;

  let assets: SectionPermissions<Asset> | null = null;
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
      values: assetsPermissions.map(
        ticker => new Asset({ ticker: tickerToString(ticker) }, context)
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
      values: portfolioIds.map(portfolioId => meshPortfolioIdToPortfolio(portfolioId, context)),
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
export function permissionGroupIdentifierToAgentGroup(
  permissionGroup: PermissionGroupIdentifier,
  context: Context
): AgentGroup {
  return context.createType(
    'AgentGroup',
    typeof permissionGroup !== 'object'
      ? permissionGroup
      : { Custom: bigNumberToU32(permissionGroup.custom, context) }
  );
}

/**
 * @hidden
 */
export function agentGroupToPermissionGroupIdentifier(
  agentGroup: AgentGroup
): PermissionGroupIdentifier {
  if (agentGroup.isFull) {
    return PermissionGroupType.Full;
  } else if (agentGroup.isExceptMeta) {
    return PermissionGroupType.ExceptMeta;
  } else if (agentGroup.isPolymeshV1Caa) {
    return PermissionGroupType.PolymeshV1Caa;
  } else if (agentGroup.isPolymeshV1Pia) {
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
): AuthorizationData {
  let value;

  if (auth.type === AuthorizationType.RotatePrimaryKey) {
    value = null;
  } else if (auth.type === AuthorizationType.JoinIdentity) {
    value = permissionsToMeshPermissions(auth.value, context);
  } else if (auth.type === AuthorizationType.PortfolioCustody) {
    value = portfolioIdToMeshPortfolioId(portfolioToPortfolioId(auth.value), context);
  } else if (auth.type === AuthorizationType.TransferAssetOwnership) {
    value = stringToTicker(auth.value, context);
  } else if (auth.type === AuthorizationType.RotatePrimaryKeyToSecondary) {
    value = permissionsToMeshPermissions(auth.value, context);
  } else if (auth.type === AuthorizationType.BecomeAgent) {
    const ticker = stringToTicker(auth.value.asset.ticker, context);
    if (auth.value instanceof CustomPermissionGroup) {
      const { id } = auth.value;
      value = [ticker, permissionGroupIdentifierToAgentGroup({ custom: id }, context)];
    } else {
      const { type } = auth.value;
      value = [ticker, permissionGroupIdentifierToAgentGroup(type, context)];
    }
  } else {
    value = auth.value;
  }

  return context.createType('AuthorizationData', {
    [auth.type]: value,
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
export function authorizationDataToAuthorization(
  auth: AuthorizationData,
  context: Context
): Authorization {
  if (auth.isAttestPrimaryKeyRotation) {
    return {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: identityIdToString(auth.asAttestPrimaryKeyRotation),
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
    message: 'Unsupported Authorization Type. Please contact the Polymath team',
    data: {
      auth: JSON.stringify(auth, null, 2),
    },
  });
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
    if (value.decimalPlaces() > MAX_DECIMALS) {
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
 * @hidden
 */
export function stringToMemo(value: string, context: Context): Memo {
  if (value.length > MAX_MEMO_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Max memo length exceeded',
      data: {
        maxLength: MAX_MEMO_LENGTH,
      },
    });
  }

  return context.createType('Memo', padString(value, MAX_MEMO_LENGTH));
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
export function u8ToBigNumber(value: u8): BigNumber {
  return new BigNumber(value.toString());
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
        message: `Unsupported status code "${status.toString()}". Please report this issue to the Polymath team`,
      });
    }
  }
}

/**
 * @hidden
 */
export function internalAssetTypeToAssetType(type: InternalAssetType, context: Context): AssetType {
  return context.createType('AssetType', type);
}

/**
 * @hidden
 */
export function assetTypeToKnownOrId(assetType: AssetType): KnownAssetType | BigNumber {
  if (assetType.isEquityCommon) {
    return KnownAssetType.EquityCommon;
  }
  if (assetType.isEquityPreferred) {
    return KnownAssetType.EquityPreferred;
  }
  if (assetType.isCommodity) {
    return KnownAssetType.Commodity;
  }
  if (assetType.isFixedIncome) {
    return KnownAssetType.FixedIncome;
  }
  if (assetType.isReit) {
    return KnownAssetType.Reit;
  }
  if (assetType.isFund) {
    return KnownAssetType.Fund;
  }
  if (assetType.isRevenueShareAgreement) {
    return KnownAssetType.RevenueShareAgreement;
  }
  if (assetType.isStructuredProduct) {
    return KnownAssetType.StructuredProduct;
  }
  if (assetType.isDerivative) {
    return KnownAssetType.Derivative;
  }
  if (assetType.isStableCoin) {
    return KnownAssetType.StableCoin;
  }

  return u32ToBigNumber(assetType.asCustom);
}

/**
 * @hidden
 */
export function posRatioToBigNumber(postRatio: PosRatio): BigNumber {
  const [numerator, denominator] = postRatio.map(u32ToBigNumber);
  return numerator.dividedBy(denominator);
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
 *
 * @note CINS and CUSIP use the same validation
 */
export function isCusipValid(cusip: string): boolean {
  cusip = cusip.toUpperCase();

  if (!/^[0-9A-Z@#*]{9}$/.test(cusip)) {
    return false;
  }

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
 */
export function isLeiValid(lei: string): boolean {
  lei = lei.toUpperCase();

  if (!/^[0-9A-Z]{18}\d{2}$/.test(lei)) {
    return false;
  }

  return computeWithoutCheck(lei) === 1;
}

/**
 * @hidden
 */
export function securityIdentifierToAssetIdentifier(
  identifier: SecurityIdentifier,
  context: Context
): AssetIdentifier {
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

  return context.createType('AssetIdentifier', { [type]: value });
}

/**
 * @hidden
 */
export function assetIdentifierToSecurityIdentifier(
  identifier: AssetIdentifier
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

  return {
    type: SecurityIdentifierType.Lei,
    value: u8aToString(identifier.asLei),
  };
}

/**
 * @hidden
 */
export function stringToFundingRoundName(roundName: string, context: Context): FundingRoundName {
  return context.createType('FundingRoundName', roundName);
}

/**
 * @hidden
 */
export function fundingRoundNameToString(roundName: FundingRoundName): string {
  return roundName.toString();
}

/**
 * @hidden
 */
export function stringToDocumentName(docName: string, context: Context): DocumentName {
  return context.createType('DocumentName', docName);
}

/**
 * @hidden
 */
export function documentNameToString(docName: DocumentName): string {
  return docName.toString();
}

/**
 * @hidden
 */
export function stringToDocumentType(docType: string, context: Context): DocumentType {
  return context.createType('DocumentType', docType);
}

/**
 * @hidden
 */
export function documentTypeToString(docType: DocumentType): string {
  return docType.toString();
}

/**
 * @hidden
 */
export function stringToDocumentUri(docUri: string, context: Context): DocumentUri {
  return context.createType('DocumentUri', docUri);
}

/**
 * @hidden
 */
export function documentUriToString(docUri: DocumentUri): string {
  return docUri.toString();
}

/**
 * @hidden
 */
export function stringToDocumentHash(docHash: string | undefined, context: Context): DocumentHash {
  if (docHash === undefined) {
    return context.createType('DocumentHash', 'None');
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

  return context.createType('DocumentHash', {
    [key]: hexToU8a(docHash.padEnd(maxLength, '0')),
  });
}

/**
 * @hidden
 */
export function documentHashToString(docHash: DocumentHash): string | undefined {
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
): Document {
  return context.createType('Document', {
    uri: stringToDocumentUri(uri, context),
    name: stringToDocumentName(name, context),
    /* eslint-disable @typescript-eslint/naming-convention */
    content_hash: stringToDocumentHash(contentHash, context),
    doc_type: optionize(stringToDocumentType)(type, context),
    filing_date: optionize(dateToMoment)(filedAt, context),
    /* eslint-enable @typescript-eslint/naming-convention */
  });
}

/**
 * @hidden
 */
export function documentToAssetDocument({
  uri,
  content_hash: hash,
  name,
  doc_type: docType,
  filing_date: filingDate,
}: Document): AssetDocument {
  const filedAt = filingDate.unwrapOr(undefined);
  const type = docType.unwrapOr(undefined);
  const contentHash = documentHashToString(hash);

  let doc: AssetDocument = {
    uri: documentUriToString(uri),
    name: documentNameToString(name),
  };

  if (contentHash) {
    doc = { ...doc, contentHash };
  }

  if (filedAt) {
    doc = { ...doc, filedAt: momentToDate(filedAt) };
  }

  if (type) {
    doc = { ...doc, type: documentTypeToString(type) };
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
export function scopeToMeshScope(scope: Scope, context: Context): MeshScope {
  const { type, value } = scope;

  let scopeValue: Ticker | IdentityId | string;
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
export function meshScopeToScope(scope: MeshScope): Scope {
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
export function stringToCddId(cddId: string, context: Context): CddId {
  return context.createType('CddId', cddId);
}

/**
 * @hidden
 */
export function cddIdToString(cddId: CddId): string {
  return cddId.toString();
}

/**
 * @hidden
 */
export function stringToScopeId(scopeId: string, context: Context): ScopeId {
  return context.createType('ScopeId', scopeId);
}

/**
 * @hidden
 */
export function scopeIdToString(scopeId: ScopeId): string {
  return scopeId.toString();
}

/**
 * @hidden
 */
export function claimToMeshClaim(claim: Claim, context: Context): MeshClaim {
  let value;

  switch (claim.type) {
    case ClaimType.NoData: {
      value = null;
      break;
    }
    case ClaimType.CustomerDueDiligence: {
      value = stringToCddId(claim.id, context);
      break;
    }
    case ClaimType.Jurisdiction: {
      const { code, scope } = claim;
      value = tuple(code, scopeToMeshScope(scope, context));
      break;
    }
    case ClaimType.InvestorUniqueness: {
      const { scope, cddId, scopeId } = claim;
      value = tuple(
        scopeToMeshScope(scope, context),
        stringToScopeId(scopeId, context),
        stringToCddId(cddId, context)
      );
      break;
    }
    case ClaimType.InvestorUniquenessV2: {
      value = stringToCddId(claim.cddId, context);
      break;
    }
    default: {
      value = scopeToMeshScope(claim.scope, context);
    }
  }

  return context.createType('Claim', { [claim.type]: value });
}

/**
 * @hidden
 */
export function middlewareScopeToScope(scope: MiddlewareScope): Scope {
  const { type, value } = scope;

  switch (type) {
    case ClaimScopeTypeEnum.Ticker:
      // eslint-disable-next-line no-control-regex
      return { type: ScopeType.Ticker, value: removePadding(value) };
    case ClaimScopeTypeEnum.Identity:
    case ClaimScopeTypeEnum.Custom:
      return { type: ScopeType[scope.type], value };
  }
}

/**
 * @hidden
 */
export function scopeToMiddlewareScope(scope: Scope): MiddlewareScope {
  const { type, value } = scope;

  switch (type) {
    case ScopeType.Ticker:
      return { type: ClaimScopeTypeEnum.Ticker, value: padEnd(value, 12, '\0') };
    case ScopeType.Identity:
    case ScopeType.Custom:
      return { type: ClaimScopeTypeEnum[scope.type], value };
  }
}

/**
 * @hidden
 */
export function middlewareEventToEventIdentifier(event: MiddlewareEvent): EventIdentifier {
  const { block_id: blockNumber, block, event_idx: eventIndex } = event;

  return {
    blockNumber: new BigNumber(blockNumber),
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    blockDate: new Date(block!.datetime),
    blockHash: block!.hash!,
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    eventIndex: new BigNumber(eventIndex),
  };
}

/**
 * @hidden
 */
export function meshClaimToClaim(claim: MeshClaim): Claim {
  if (claim.isJurisdiction) {
    const [code, scope] = claim.asJurisdiction;
    return {
      type: ClaimType.Jurisdiction,
      code: meshCountryCodeToCountryCode(code),
      scope: meshScopeToScope(scope),
    };
  }

  if (claim.isNoData) {
    return {
      type: ClaimType.NoData,
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

  if (claim.isInvestorUniqueness) {
    const [scope, scopeId, cddId] = claim.asInvestorUniqueness;
    return {
      type: ClaimType.InvestorUniqueness,
      scope: meshScopeToScope(scope),
      scopeId: scopeIdToString(scopeId),
      cddId: cddIdToString(cddId),
    };
  }

  if (claim.isInvestorUniquenessV2) {
    return {
      type: ClaimType.InvestorUniquenessV2,
      cddId: cddIdToString(claim.asInvestorUniquenessV2),
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
export function stringToTargetIdentity(did: string | null, context: Context): TargetIdentity {
  return context.createType(
    'TargetIdentity',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    did ? { Specific: stringToIdentityId(did, context) } : 'ExternalAgent'
  );
}

/**
 * @hidden
 */
export function meshClaimTypeToClaimType(claimType: MeshClaimType): ClaimType {
  if (claimType.isJurisdiction) {
    return ClaimType.Jurisdiction;
  }

  if (claimType.isNoData) {
    return ClaimType.NoData;
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
  trustedIssuer: TrustedIssuer,
  context: Context
): TrustedClaimIssuer {
  const { issuer, trusted_for: claimTypes } = trustedIssuer;

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
): TrustedIssuer {
  const { trustedFor: claimTypes, identity } = issuer;
  const did = signerToString(identity);

  let trustedFor;

  if (!claimTypes) {
    trustedFor = 'Any';
  } else {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    trustedFor = { Specific: claimTypes };
  }

  return context.createType('TrustedIssuer', {
    issuer: stringToIdentityId(did, context),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    trusted_for: trustedFor,
  });
}

/**
 * @hidden
 */
export function requirementToComplianceRequirement(
  requirement: InputRequirement,
  context: Context
): ComplianceRequirement {
  const senderConditions: MeshCondition[] = [];
  const receiverConditions: MeshCondition[] = [];

  requirement.conditions.forEach(condition => {
    let conditionContent: MeshClaim | MeshClaim[] | TargetIdentity;
    let { type } = condition;
    if (isSingleClaimCondition(condition)) {
      const { claim } = condition;
      conditionContent = claimToMeshClaim(claim, context);
    } else if (isMultiClaimCondition(condition)) {
      const { claims } = condition;
      conditionContent = claims.map(claim => claimToMeshClaim(claim, context));
    } else if (condition.type === ConditionType.IsIdentity) {
      const { identity } = condition;
      conditionContent = stringToTargetIdentity(signerToString(identity), context);
    } else {
      // IsExternalAgent does not exist as a condition type in Polymesh, it's SDK sugar
      type = ConditionType.IsIdentity;
      conditionContent = stringToTargetIdentity(null, context);
    }

    const { target, trustedClaimIssuers = [] } = condition;

    const meshCondition = context.createType('Condition', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      condition_type: {
        [type]: conditionContent,
      },
      issuers: trustedClaimIssuers.map(issuer =>
        trustedClaimIssuerToTrustedIssuer(issuer, context)
      ),
    });

    if ([ConditionTarget.Both, ConditionTarget.Receiver].includes(target)) {
      receiverConditions.push(meshCondition);
    }

    if ([ConditionTarget.Both, ConditionTarget.Sender].includes(target)) {
      senderConditions.push(meshCondition);
    }
  });

  return context.createType('ComplianceRequirement', {
    /* eslint-disable @typescript-eslint/naming-convention */
    sender_conditions: senderConditions,
    receiver_conditions: receiverConditions,
    id: bigNumberToU32(requirement.id, context),
    /* eslint-enable @typescript-eslint/naming-convention */
  });
}

/**
 * @hidden
 */
function meshConditionTypeToCondition(
  meshConditionType: MeshConditionType,
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

  complianceRequirement.sender_conditions.forEach(
    ({ condition: { condition_type: conditionType, issuers }, result }) => {
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

  complianceRequirement.receiver_conditions.forEach(
    ({ condition: { condition_type: conditionType, issuers }, result }) => {
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
  complianceRequirement: ComplianceRequirement,
  context: Context
): Requirement {
  const conditions: Condition[] = [];

  complianceRequirement.sender_conditions.forEach(({ condition_type: conditionType, issuers }) => {
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

  complianceRequirement.receiver_conditions.forEach(
    ({ condition_type: conditionType, issuers }) => {
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
    }
  );

  return {
    id: u32ToBigNumber(complianceRequirement.id),
    conditions,
  };
}

/**
 * @hidden
 */
export function txTagToProtocolOp(tag: TxTag, context: Context): ProtocolOp {
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
      message: `${value} does not match any ProtocolOp`,
    });
  }

  return context.createType('ProtocolOp', value);
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
  return encodeAddress(key, context.ss58Format.toNumber());
}

/**
 * @hidden
 */
export function addressToKey(address: string, context: Context): string {
  return u8aToHex(decodeAddress(address, IGNORE_CHECKSUM, context.ss58Format.toNumber()));
}

/**
 * @hidden
 */
export function transactionHexToTxTag(bytes: string, context: Context): TxTag {
  const { section, method } = context.createType('Proposal', bytes);

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
): MeshSecondaryKey {
  const { account, permissions } = secondaryKey;

  return context.createType('SecondaryKey', {
    signer: signerValueToSignatory(signerToSignerValue(account), context),
    permissions: permissionsToMeshPermissions(permissions, context),
  });
}

/**
 * @hidden
 */
export function meshVenueTypeToVenueType(type: MeshVenueType): VenueType {
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
export function venueTypeToMeshVenueType(type: VenueType, context: Context): MeshVenueType {
  return context.createType('VenueType', type);
}

/**
 * @hidden
 */
export function stringToVenueDetails(details: string, context: Context): VenueDetails {
  return context.createType('VenueDetails', details);
}

/**
 * @hidden
 */
export function venueDetailsToString(details: VenueDetails): string {
  return details.toString();
}

/**
 * @hidden
 */
export function meshInstructionStatusToInstructionStatus(
  status: MeshInstructionStatus
): InstructionStatus {
  if (status.isPending) {
    return InstructionStatus.Pending;
  }

  if (status.isFailed) {
    return InstructionStatus.Failed;
  }

  return InstructionStatus.Unknown;
}

/**
 * @hidden
 */
export function meshAffirmationStatusToAffirmationStatus(
  status: MeshAffirmationStatus
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
export function endConditionToSettlementType(
  endCondition:
    | { type: InstructionType.SettleOnAffirmation }
    | { type: InstructionType; value: BigNumber },
  context: Context
): SettlementType {
  let value;

  if (endCondition.type === InstructionType.SettleOnAffirmation) {
    value = InstructionType.SettleOnAffirmation;
  } else {
    value = {
      [InstructionType.SettleOnBlock]: bigNumberToU32(endCondition.value, context),
    };
  }

  return context.createType('SettlementType', value);
}

/**
 * @hidden
 */
export function toIdentityWithClaimsArray(
  data: MiddlewareIdentityWithClaims[],
  context: Context
): IdentityWithClaims[] {
  return data.map(({ did, claims }) => ({
    identity: new Identity({ did }, context),
    claims: claims.map(
      ({
        targetDID: targetDid,
        issuer,
        issuance_date: issuanceDate,
        expiry,
        type,
        jurisdiction,
        scope: claimScope,
        cdd_id: cddId,
      }) => ({
        target: new Identity({ did: targetDid }, context),
        issuer: new Identity({ did: issuer }, context),
        issuedAt: new Date(issuanceDate),
        expiry: expiry ? new Date(expiry) : null,
        claim: createClaim(type, jurisdiction, claimScope, cddId, undefined),
      })
    ),
  }));
}

/**
 * @hidden
 */
export function portfolioMovementToMovePortfolioItem(
  portfolioItem: PortfolioMovement,
  context: Context
): MovePortfolioItem {
  const { asset, amount, memo } = portfolioItem;
  return context.createType('MovePortfolioItem', {
    ticker: stringToTicker(getTicker(asset), context),
    amount: bigNumberToBalance(amount, context),
    memo: optionize(stringToMemo)(memo, context),
  });
}

/**
 * @hidden
 */
export function claimTypeToMeshClaimType(claimType: ClaimType, context: Context): MeshClaimType {
  return context.createType('ClaimType', claimType);
}

/**
 * @hidden
 */
export function transferRestrictionToTransferManager(
  restriction: TransferRestriction,
  context: Context
): TransferManager {
  const { type, value } = restriction;
  let tmType;
  let tmValue;

  if (type === TransferRestrictionType.Count) {
    tmType = 'CountTransferManager';
    tmValue = bigNumberToU64(value, context);
  } else {
    tmType = 'PercentageTransferManager';
    tmValue = percentageToPermill(value, context);
  }

  return context.createType('TransferManager', {
    [tmType]: tmValue,
  });
}

/**
 * @hidden
 */
export function transferManagerToTransferRestriction(
  transferManager: TransferManager
): TransferRestriction {
  if (transferManager.isCountTransferManager) {
    return {
      type: TransferRestrictionType.Count,
      value: u64ToBigNumber(transferManager.asCountTransferManager),
    };
  } else {
    return {
      type: TransferRestrictionType.Percentage,
      value: permillToBigNumber(transferManager.asPercentageTransferManager),
    };
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
    statistics_result: transferRestrictionResults,
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

  const restrictions = transferRestrictionResults.map(({ tm, result: tmResult }) => ({
    restriction: transferManagerToTransferRestriction(tm),
    result: boolToBoolean(tmResult),
  }));

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
export function offeringTierToPriceTier(tier: OfferingTier, context: Context): PriceTier {
  const { price, amount } = tier;
  return context.createType('PriceTier', {
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
  let assetPermissions: SectionPermissions<Asset> | null = {
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
        typeof ticker !== 'string' ? ticker : new Asset({ ticker }, context)
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
      values: [...transactionPermissions.values].sort(),
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
  const { did, kind } = portfolio;

  if (kind.toLowerCase() === 'default' || kind === '0') {
    return new DefaultPortfolio({ did }, context);
  }
  return new NumberedPortfolio({ did, id: new BigNumber(kind) }, context);
}

/**
 * @hidden
 */
export function fundraiserTierToTier(fundraiserTier: FundraiserTier): Tier {
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
  fundraiser: Fundraiser,
  name: FundraiserName,
  context: Context
): OfferingDetails {
  const {
    creator,
    offering_portfolio: offeringPortfolio,
    raising_portfolio: raisingPortfolio,
    raising_asset: raisingAsset,
    tiers: rawTiers,
    venue_id: venueId,
    start: rawStart,
    end: rawEnd,
    status: rawStatus,
    minimum_investment: rawMinInvestment,
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
    name: textToString(name),
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
export function calendarPeriodToMeshCalendarPeriod(
  period: CalendarPeriod,
  context: Context
): MeshCalendarPeriod {
  const { unit, amount } = period;

  if (amount.isNegative()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Calendar period cannot have a negative amount',
    });
  }

  return context.createType('CalendarPeriod', {
    unit: stringUpperFirst(unit),
    amount: bigNumberToU64(amount, context),
  });
}

/**
 * @hidden
 */
export function meshCalendarPeriodToCalendarPeriod(period: MeshCalendarPeriod): CalendarPeriod {
  const { unit: rawUnit, amount } = period;

  let unit: CalendarUnit;

  if (rawUnit.isSecond) {
    unit = CalendarUnit.Second;
  } else if (rawUnit.isMinute) {
    unit = CalendarUnit.Minute;
  } else if (rawUnit.isHour) {
    unit = CalendarUnit.Hour;
  } else if (rawUnit.isDay) {
    unit = CalendarUnit.Day;
  } else if (rawUnit.isWeek) {
    unit = CalendarUnit.Week;
  } else if (rawUnit.isMonth) {
    unit = CalendarUnit.Month;
  } else {
    unit = CalendarUnit.Year;
  }

  return {
    unit,
    amount: u64ToBigNumber(amount),
  };
}

/**
 * @hidden
 */
export function scheduleSpecToMeshScheduleSpec(
  details: ScheduleSpec,
  context: Context
): MeshScheduleSpec {
  const { start, period, repetitions } = details;

  return context.createType('ScheduleSpec', {
    start: start && dateToMoment(start, context),
    period: calendarPeriodToMeshCalendarPeriod(
      period || { unit: CalendarUnit.Month, amount: new BigNumber(0) },
      context
    ),
    remaining: bigNumberToU64(repetitions || new BigNumber(0), context),
  });
}

/**
 * @hidden
 */
export function storedScheduleToCheckpointScheduleParams(
  storedSchedule: StoredSchedule
): CheckpointScheduleParams {
  const {
    schedule: { start, period },
    id,
    at,
    remaining,
  } = storedSchedule;

  return {
    id: u64ToBigNumber(id),
    period: meshCalendarPeriodToCalendarPeriod(period),
    start: momentToDate(start),
    remaining: u32ToBigNumber(remaining),
    nextCheckpointDate: momentToDate(at),
  };
}

/**
 * @hidden
 */
export function stringToSignature(signature: string, context: Context): Signature {
  return context.createType('Signature', signature);
}

/**
 * @hidden
 */
export function meshCorporateActionToCorporateActionParams(
  corporateAction: MeshCorporateAction,
  details: Text,
  context: Context
): CorporateActionParams {
  const {
    kind: rawKind,
    decl_date: declDate,
    targets: { identities, treatment },
    default_withholding_tax: defaultWithholdingTax,
    withholding_tax: withholdingTax,
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
    description: textToString(details),
    targets,
    defaultTaxWithholding: permillToBigNumber(defaultWithholdingTax),
    taxWithholdings,
  };
}

/**
 * @hidden
 */
export function stringToRistrettoPoint(ristrettoPoint: string, context: Context): RistrettoPoint {
  return context.createType('RistrettoPoint', ristrettoPoint);
}

/**
 * @hidden
 */
export function corporateActionKindToCaKind(kind: CorporateActionKind, context: Context): CAKind {
  return context.createType('CAKind', kind);
}

/**
 * @hidden
 */
export function stringToScalar(scalar: string, context: Context): Scalar {
  return context.createType('Scalar', scalar);
}

/**
 * @hidden
 */
export function checkpointToRecordDateSpec(
  checkpoint: Checkpoint | Date | CheckpointSchedule,
  context: Context
): RecordDateSpec {
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

  return context.createType('RecordDateSpec', value);
}

/**
 * @hidden
 */
export function scopeClaimProofToMeshScopeClaimProof(
  proof: ScopeClaimProof,
  scopeId: string,
  context: Context
): MeshScopeClaimProof {
  const {
    proofScopeIdWellFormed,
    proofScopeIdCddIdMatch: { challengeResponses, subtractExpressionsRes, blindedScopeDidHash },
  } = proof;

  const zkProofData = context.createType('ZkProofData', {
    /* eslint-disable @typescript-eslint/naming-convention */
    challenge_responses: challengeResponses.map(cr => stringToScalar(cr, context)),
    subtract_expressions_res: stringToRistrettoPoint(subtractExpressionsRes, context),
    blinded_scope_did_hash: stringToRistrettoPoint(blindedScopeDidHash, context),
    /* eslint-enable @typescript-eslint/naming-convention */
  });

  return context.createType('ScopeClaimProof', {
    /* eslint-disable @typescript-eslint/naming-convention */
    proof_scope_id_wellformed: stringToSignature(proofScopeIdWellFormed, context),
    proof_scope_id_cdd_id_match: zkProofData,
    scope_id: stringToRistrettoPoint(scopeId, context),
    /* eslint-enable @typescript-eslint/naming-convention */
  });
}

/**
 * @hidden
 */
export function targetIdentitiesToCorporateActionTargets(
  targetIdentities: TargetIdentities,
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
): TargetIdentities {
  const { treatment, identities } = targets;

  return context.createType('TargetIdentities', {
    identities: identities.map(identity => stringToIdentityId(signerToString(identity), context)),
    treatment: context.createType('TargetTreatment', treatment),
  });
}

/**
 * @hidden
 */
export function distributionToDividendDistributionParams(
  distribution: Distribution,
  context: Context
): DividendDistributionParams {
  const {
    from,
    currency,
    per_share: perShare,
    amount,
    expires_at: expiryDate,
    payment_at: paymentDate,
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
): CAId {
  const { ticker, localId } = corporateActionIdentifier;
  return context.createType('CAId', {
    ticker: stringToTicker(ticker, context),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    local_id: bigNumberToU32(localId, context),
  });
}

/**
 * @hidden
 */
export function agentGroupToPermissionGroup(
  agentGroup: AgentGroup,
  ticker: string,
  context: Context
): KnownPermissionGroup | CustomPermissionGroup {
  const permissionGroupIdentifier = agentGroupToPermissionGroupIdentifier(agentGroup);
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
