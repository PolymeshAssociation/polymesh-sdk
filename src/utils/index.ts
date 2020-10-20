import { AugmentedQuery, AugmentedQueryDoubleMap, ObsInnerType } from '@polkadot/api/types';
import { bool, Bytes, StorageKey, Text, u8, u32, u64 } from '@polkadot/types';
import { AccountId, Balance, EventRecord, Moment } from '@polkadot/types/interfaces';
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { AnyFunction, ISubmittableResult } from '@polkadot/types/types';
import {
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
import stringify from 'json-stable-stringify';
import {
  camelCase,
  chunk,
  groupBy,
  isEqual,
  map,
  padEnd,
  range,
  rangeRight,
  snakeCase,
} from 'lodash';
import {
  AssetComplianceResult,
  AssetIdentifier,
  AssetName,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  AuthorizationStatus as MeshAuthorizationStatus,
  AuthorizationType as MeshAuthorizationType,
  CanTransferResult,
  CddId,
  CddStatus,
  Claim as MeshClaim,
  ComplianceRequirement,
  Condition as MeshCondition,
  ConditionType as MeshConditionType,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentityId,
  InstructionStatus as MeshInstructionStatus,
  Memo,
  Permission as MeshPermission,
  PipId,
  PortfolioId as MeshPortfolioId,
  PosRatio,
  ProtocolOp,
  Scope as MeshScope,
  SecondaryKey as MeshSecondaryKey,
  SettlementType,
  Signatory,
  Ticker,
  TxTag,
  TxTags,
  VenueDetails,
  VenueType as MeshVenueType,
} from 'polymesh-types/types';

import { Account, DefaultPortfolio, Identity, NumberedPortfolio } from '~/api/entities';
import { ProposalDetails } from '~/api/entities/Proposal/types';
import { Context, PolymeshError, PostTransactionValue } from '~/base';
import { meshCountryCodeToCountryCode } from '~/generated/utils';
import {
  CallIdEnum,
  IdentityWithClaims as MiddlewareIdentityWithClaims,
  ModuleIdEnum,
  Proposal,
  Scope as MiddlewareScope,
} from '~/middleware/types';
import {
  Authorization,
  AuthorizationStatus,
  AuthorizationType,
  Claim,
  ClaimType,
  Condition,
  ConditionTarget,
  ConditionType,
  CountryCode,
  ErrorCode,
  IdentityWithClaims,
  InstructionStatus,
  InstructionType,
  isMultiClaimCondition,
  isSingleClaimCondition,
  KnownTokenType,
  MultiClaimCondition,
  NextKey,
  PaginationOptions,
  Permission,
  Requirement,
  RequirementCompliance,
  Scope,
  ScopeType,
  SecondaryKey,
  Signer,
  SingleClaimCondition,
  TokenIdentifier,
  TokenIdentifierType,
  TokenType,
  TransferStatus,
  VenueType,
} from '~/types';
import {
  AuthTarget,
  ExtrinsicIdentifier,
  Extrinsics,
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  PortfolioId,
  SignerType,
  SignerValue,
  TokenDocumentData,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  BATCH_REGEX,
  DEFAULT_GQL_PAGE_SIZE,
  IGNORE_CHECKSUM,
  MAX_BATCH_ELEMENTS,
  MAX_DECIMALS,
  MAX_MODULE_LENGTH,
  MAX_TICKER_LENGTH,
  MAX_TOKEN_AMOUNT,
  SS58_FORMAT,
} from '~/utils/constants';

export { cryptoWaitReady } from '@polkadot/util-crypto';
export * from '~/generated/utils';

/**
 * @hidden
 * Promisified version of a timeout
 *
 * @param amount - time to wait
 */
export async function delay(amount: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, amount);
  });
}

/**
 * @hidden
 * Convert an entity type and its unique Identifiers to a base64 string
 */
export function serialize<UniqueIdentifiers extends object>(
  entityType: string,
  uniqueIdentifiers: UniqueIdentifiers
): string {
  return Buffer.from(`${entityType}:${stringify(uniqueIdentifiers)}`).toString('base64');
}

/**
 * @hidden
 * Convert a uuid string to an Identifier object
 */
export function unserialize<UniqueIdentifiers extends object>(id: string): UniqueIdentifiers {
  const unserialized = Buffer.from(id, 'base64').toString('utf8');

  const matched = unserialized.match(/^.*?:(.*)/);

  const errorMsg = 'Wrong ID format';

  if (!matched) {
    throw new Error(errorMsg);
  }

  const [, jsonString] = matched;

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error(errorMsg);
  }
}

/**
 * Generate a Security Token's DID from a ticker
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
  return context.polymeshApi.createType('AssetName', name);
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
  return context.polymeshApi.createType('bool', value);
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
  return context.polymeshApi.createType('Bytes', bytes);
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
  if (ticker.length > MAX_TICKER_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker length cannot exceed ${MAX_TICKER_LENGTH} characters`,
    });
  }
  return context.polymeshApi.createType('Ticker', ticker);
}

/**
 * @hidden
 */
export function tickerToString(ticker: Ticker): string {
  // eslint-disable-next-line no-control-regex
  return u8aToString(ticker).replace(/\u0000/g, '');
}

/**
 * @hidden
 */
export function dateToMoment(date: Date, context: Context): Moment {
  return context.polymeshApi.createType('Moment', date.getTime());
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
  return context.polymeshApi.createType('AccountId', accountId);
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
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return context.polymeshApi.createType('IdentityId', identityId);
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
export function signerValueToSignatory(signer: SignerValue, context: Context): Signatory {
  return context.polymeshApi.createType('Signatory', {
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
 * Extract the DID from an Identity, or return the Current DID if no Identity is passed
 */
export async function getDid(
  target: string | Identity | undefined,
  context: Context
): Promise<string> {
  let did;
  if (target) {
    did = signerToString(target);
  } else {
    ({ did } = await context.getCurrentIdentity());
  }

  return did;
}

/**
 * @hidden
 */
export function authorizationToAuthorizationData(
  auth: Authorization,
  context: Context
): AuthorizationData {
  const { type, value = null } = auth as { type: AuthorizationType; value?: string };

  return context.polymeshApi.createType('AuthorizationData', {
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
  return context.polymeshApi.createType('AuthorizationType', authorizationType);
}

/**
 * @hidden
 */
export function permissionToMeshPermission(
  permission: Permission,
  context: Context
): MeshPermission {
  return context.polymeshApi.createType('Permission', permission);
}

/**
 * @hidden
 */
export function meshPermissionToPermission(permission: MeshPermission): Permission {
  if (permission.isAdmin) {
    return Permission.Admin;
  }

  if (permission.isFull) {
    return Permission.Full;
  }

  if (permission.isOperator) {
    return Permission.Operator;
  }

  return Permission.SpendFunds;
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
export function portfolioIdToPortfolio(
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
      value: identityIdToString(auth.asRotatePrimaryKey),
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
      value: portfolioIdToPortfolio(auth.asPortfolioCustody, context),
    };
  }

  if (auth.isJoinIdentity) {
    return {
      type: AuthorizationType.JoinIdentity,
      value: auth.asJoinIdentity.map(meshPermissionToPermission),
    };
  }

  if (auth.isCustom) {
    return {
      type: AuthorizationType.Custom,
      value: bytesToString(auth.asCustom),
    };
  }

  return {
    type: AuthorizationType.NoData,
  };
}

/**
 * @hidden
 */
export function numberToBalance(
  value: number | BigNumber,
  context: Context,
  divisible?: boolean
): Balance {
  const rawValue = new BigNumber(value);

  divisible = divisible ?? true;

  if (rawValue.isGreaterThan(MAX_TOKEN_AMOUNT)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The value exceed the amount limit allowed',
      data: {
        currentValue: rawValue,
        amountLimit: MAX_TOKEN_AMOUNT,
      },
    });
  }

  if (divisible) {
    if (rawValue.decimalPlaces() > MAX_DECIMALS) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The value exceed the decimals limit allowed',
        data: {
          currentValue: rawValue,
          decimalsLimit: MAX_DECIMALS,
        },
      });
    }
  } else {
    if (rawValue.decimalPlaces()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The value cannot have decimals if the token is indivisible',
      });
    }
  }

  return context.polymeshApi.createType(
    'Balance',
    rawValue.multipliedBy(Math.pow(10, 6)).toString()
  );
}

/**
 * @hidden
 */
export function balanceToBigNumber(balance: Balance): BigNumber {
  return new BigNumber(balance.toString()).div(Math.pow(10, 6));
}

/**
 * @hidden
 */
export function stringToMemo(value: string, context: Context): Memo {
  return context.polymeshApi.createType('Memo', value);
}

/**
 * @hidden
 */
export function numberToU32(value: number | BigNumber, context: Context): u32 {
  return context.polymeshApi.createType('u32', new BigNumber(value).toString());
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
export function numberToU64(value: number | BigNumber, context: Context): u64 {
  return context.polymeshApi.createType('u64', new BigNumber(value).toString());
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
    case 80: {
      return TransferStatus.Failure;
    }
    default: {
      throw new PolymeshError({
        code: ErrorCode.FatalError,
        message: `Unsupported status code "${status.toString()}". Please report this issue to the Polymath team`,
      });
    }
  }
}

/**
 * @hidden
 */
export function tokenTypeToAssetType(type: TokenType, context: Context): AssetType {
  return context.polymeshApi.createType('AssetType', type);
}

/**
 * @hidden
 */
export function assetTypeToString(assetType: AssetType): string {
  if (assetType.isEquityCommon) {
    return KnownTokenType.EquityCommon;
  }
  if (assetType.isEquityPreferred) {
    return KnownTokenType.EquityPreferred;
  }
  if (assetType.isCommodity) {
    return KnownTokenType.Commodity;
  }
  if (assetType.isFixedIncome) {
    return KnownTokenType.FixedIncome;
  }
  if (assetType.isReit) {
    return KnownTokenType.Reit;
  }
  if (assetType.isFund) {
    return KnownTokenType.Fund;
  }
  if (assetType.isRevenueShareAgreement) {
    return KnownTokenType.RevenueShareAgreement;
  }
  if (assetType.isStructuredProduct) {
    return KnownTokenType.StructuredProduct;
  }
  if (assetType.isDerivative) {
    return KnownTokenType.Derivative;
  }

  return u8aToString(assetType.asCustom);
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

  if (!new RegExp('^[0-9A-Z]{12}$').test(isin)) {
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

  if (!new RegExp('^[0-9A-Z@#*]{9}$').test(cusip)) {
    return false;
  }

  let sum = 0;

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

  if (!new RegExp('^[0-9A-Z]{18}[0-9]{2}$').test(lei)) {
    return false;
  }

  return computeWithoutCheck(lei) === 1;
}

/**
 * @hidden
 */
export function tokenIdentifierToAssetIdentifier(
  identifier: TokenIdentifier,
  context: Context
): AssetIdentifier {
  const { type, value } = identifier;

  let error = false;

  switch (type) {
    case TokenIdentifierType.Isin: {
      if (!isIsinValid(value)) {
        error = true;
      }
      break;
    }
    case TokenIdentifierType.Lei: {
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
      message: `Error while checking value identifier ${value} as ${type} type`,
    });
  }

  return context.polymeshApi.createType('AssetIdentifier', { [type]: value });
}

/**
 * @hidden
 */
export function assetIdentifierToTokenIdentifier(identifier: AssetIdentifier): TokenIdentifier {
  if (identifier.isCusip) {
    return {
      type: TokenIdentifierType.Cusip,
      value: u8aToString(identifier.asCusip),
    };
  }
  if (identifier.isIsin) {
    return {
      type: TokenIdentifierType.Isin,
      value: u8aToString(identifier.asIsin),
    };
  }
  if (identifier.isCins) {
    return {
      type: TokenIdentifierType.Cins,
      value: u8aToString(identifier.asCins),
    };
  }

  return {
    type: TokenIdentifierType.Lei,
    value: u8aToString(identifier.asLei),
  };
}

/**
 * @hidden
 */
export function stringToFundingRoundName(roundName: string, context: Context): FundingRoundName {
  return context.polymeshApi.createType('FundingRoundName', roundName);
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
  return context.polymeshApi.createType('DocumentName', docName);
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
export function stringToDocumentUri(docUri: string, context: Context): DocumentUri {
  return context.polymeshApi.createType('DocumentUri', docUri);
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
export function stringToDocumentHash(docHash: string, context: Context): DocumentHash {
  return context.polymeshApi.createType('DocumentHash', docHash);
}

/**
 * @hidden
 */
export function documentHashToString(docHash: DocumentHash): string {
  return docHash.toString();
}

/**
 * @hidden
 */
export function tokenDocumentDataToDocument(
  { uri, contentHash }: TokenDocumentData,
  context: Context
): Document {
  return context.polymeshApi.createType('Document', {
    uri: stringToDocumentUri(uri, context),
    // eslint-disable-next-line @typescript-eslint/camelcase
    content_hash: stringToDocumentHash(contentHash, context),
  });
}

/**
 * @hidden
 */
export function documentToTokenDocumentData(
  // eslint-disable-next-line @typescript-eslint/camelcase
  { uri, content_hash }: Document
): TokenDocumentData {
  return {
    uri: documentUriToString(uri),
    contentHash: documentHashToString(content_hash),
  };
}

/**
 * @hidden
 */
export function authTargetToAuthIdentifier(
  { target, authId }: AuthTarget,
  context: Context
): AuthIdentifier {
  return context.polymeshApi.createType('AuthIdentifier', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    auth_id: numberToU64(authId, context),
    signatory: signerValueToSignatory(target, context),
  });
}

/**
 * @hidden
 */
export function authIdentifierToAuthTarget({
  auth_id: authId,
  signatory,
}: AuthIdentifier): AuthTarget {
  return {
    authId: u64ToBigNumber(authId),
    target: signatoryToSignerValue(signatory),
  };
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
      code: ErrorCode.FatalError,
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

  return context.polymeshApi.createType('Scope', {
    [type]: value,
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
export function claimToMeshClaim(claim: Claim, context: Context): MeshClaim {
  let value;

  switch (claim.type) {
    case ClaimType.NoData:
    case ClaimType.CustomerDueDiligence: {
      value = null;
      break;
    }
    case ClaimType.Jurisdiction: {
      value = tuple(claim.code, scopeToMeshScope(claim.scope, context));
      break;
    }
    default: {
      value = scopeToMeshScope(claim.scope, context);
    }
  }

  return context.polymeshApi.createType('Claim', { [claim.type]: value });
}

/**
 * @hidden
 */
export function middlewareScopeToScope(scope: MiddlewareScope): Scope {
  return { type: ScopeType[scope.type], value: scope.value } as Scope;
}

/**
 * @hidden
 */
export function createClaim(
  claimType: string,
  jurisdiction: string | null | undefined,
  middlewareScope: MiddlewareScope | null | undefined,
  cddId: string | null | undefined
): Claim {
  const type = claimType as ClaimType;
  const scope = (middlewareScope
    ? { type: ScopeType[middlewareScope.type], value: middlewareScope.value }
    : {}) as Scope;

  if (type === ClaimType.Jurisdiction) {
    return {
      type,
      // this assertion is necessary because CountryCode is not in the middleware types
      code: jurisdiction as CountryCode,
      scope,
    };
  } else if (type === ClaimType.NoData) {
    return {
      type,
    };
  } else if (type === ClaimType.CustomerDueDiligence) {
    return {
      type,
      id: cddId as string,
    };
  }

  return { type, scope };
}

/**
 * @hidden
 */
export function stringToCddId(cddId: string, context: Context): CddId {
  return context.polymeshApi.createType('CddId', cddId);
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

  return {
    type: ClaimType.Blocked,
    scope: meshScopeToScope(claim.asBlocked),
  };
}

/**
 * @hidden
 */
export function requirementToComplianceRequirement(
  requirement: Requirement,
  context: Context
): ComplianceRequirement {
  const { polymeshApi } = context;
  const senderConditions: MeshCondition[] = [];
  const receiverConditions: MeshCondition[] = [];

  requirement.conditions.forEach(condition => {
    let claimContent: MeshClaim | MeshClaim[];
    if (isSingleClaimCondition(condition)) {
      const { claim } = condition;
      claimContent = claimToMeshClaim(claim, context);
    } else {
      const { claims } = condition;
      claimContent = claims.map(claim => claimToMeshClaim(claim, context));
    }

    const { target, type, trustedClaimIssuers = [] } = condition;

    const meshCondition = polymeshApi.createType('Condition', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      condition_type: {
        [type]: claimContent,
      },
      issuers: trustedClaimIssuers.map(issuer => stringToIdentityId(issuer, context)),
    });

    if ([ConditionTarget.Both, ConditionTarget.Receiver].includes(target)) {
      receiverConditions.push(meshCondition);
    }

    if ([ConditionTarget.Both, ConditionTarget.Sender].includes(target)) {
      senderConditions.push(meshCondition);
    }
  });

  return polymeshApi.createType('ComplianceRequirement', {
    /* eslint-disable @typescript-eslint/camelcase */
    sender_conditions: senderConditions,
    receiver_conditions: receiverConditions,
    id: numberToU32(requirement.id, context),
    /* eslint-enable @typescript-eslint/camelcase */
  });
}

/**
 * @hidden
 */
export function complianceRequirementToRequirement(
  complianceRequirement: ComplianceRequirement
): Requirement {
  const meshConditionTypeToCondition = (
    meshConditionType: MeshConditionType
  ):
    | Pick<SingleClaimCondition, 'type' | 'claim'>
    | Pick<MultiClaimCondition, 'type' | 'claims'> => {
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

    return {
      type: ConditionType.IsNoneOf,
      claims: meshConditionType.asIsNoneOf.map(claim => meshClaimToClaim(claim)),
    };
  };

  const conditions: Condition[] = complianceRequirement.sender_conditions.map(
    ({ condition_type: conditionType, issuers }) => ({
      ...meshConditionTypeToCondition(conditionType),
      target: ConditionTarget.Sender,
      trustedClaimIssuers: issuers.map(issuer => identityIdToString(issuer)),
    })
  );

  complianceRequirement.receiver_conditions.forEach(
    ({ condition_type: conditionType, issuers }) => {
      const newCondition = {
        ...meshConditionTypeToCondition(conditionType),
        target: ConditionTarget.Receiver,
        trustedClaimIssuers: issuers.map(issuer => identityIdToString(issuer)),
      };

      const existingCondition = conditions.find(condition => {
        let equalClaims = false;

        if (isSingleClaimCondition(condition) && isSingleClaimCondition(newCondition)) {
          equalClaims = isEqual(condition.claim, newCondition.claim);
        }

        if (isMultiClaimCondition(condition) && isMultiClaimCondition(newCondition)) {
          equalClaims = isEqual(condition.claims, newCondition.claims);
        }

        return (
          equalClaims && isEqual(condition.trustedClaimIssuers, newCondition.trustedClaimIssuers)
        );
      });

      if (existingCondition) {
        existingCondition.target = ConditionTarget.Both;
      } else {
        conditions.push(newCondition);
      }
    }
  );

  return {
    id: u32ToBigNumber(complianceRequirement.id).toNumber(),
    conditions,
  };
}

/**
 * @hidden
 */
export function txTagToProtocolOp(tag: TxTag, context: Context): ProtocolOp {
  const [moduleName, extrinsicName] = tag.split('.');
  const value = `${stringUpperFirst(moduleName)}${stringUpperFirst(
    extrinsicName.replace(BATCH_REGEX, '')
  )}`;

  return context.polymeshApi.createType('ProtocolOp', value);
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
export function numberToPipId(id: number | BigNumber, context: Context): PipId {
  return context.polymeshApi.createType('PipId', new BigNumber(id).toString());
}

/**
 * @hidden
 */
export function stringToText(text: string, context: Context): Text {
  return context.polymeshApi.createType('Text', text);
}

/**
 * @hidden
 */
export function textToString(value: Text): string {
  return value.toString();
}

/**
 * @hidden
 */
export function portfolioIdToMeshPortfolioId(
  portfolioId: PortfolioId,
  context: Context
): MeshPortfolioId {
  const { did, number } = portfolioId;
  return context.polymeshApi.createType('PortfolioId', {
    did: stringToIdentityId(did, context),
    kind: number ? { User: numberToU64(number, context) } : 'Default',
  });
}

/**
 * @hidden
 */
export function assetComplianceResultToRequirementCompliance(
  assetComplianceResult: AssetComplianceResult
): RequirementCompliance {
  const { requirements: rawRequirements, result, paused } = assetComplianceResult;
  const requirements = rawRequirements.map(requirement => ({
    ...complianceRequirementToRequirement(requirement),
    complies: boolToBoolean(requirement.result),
  }));

  return {
    requirements,
    complies: boolToBoolean(paused) || boolToBoolean(result),
  };
}

/**
 * @hidden
 *
 * Unwrap a Post Transaction Value
 */
export function unwrapValue<T extends unknown>(value: MaybePostTransactionValue<T>): T {
  if (value instanceof PostTransactionValue) {
    return value.value;
  }

  return value;
}

/**
 * @hidden
 *
 * Unwrap all Post Transaction Values present in a tuple
 */
export function unwrapValues<T extends unknown[]>(values: MapMaybePostTransactionValue<T>): T {
  return values.map(unwrapValue) as T;
}

// TODO @monitz87: use event enum instead of string when it exists
/**
 * @hidden
 * Find a specific event inside a receipt
 *
 * @throws If the event is not found
 */
export function findEventRecord(
  receipt: ISubmittableResult,
  mod: keyof Extrinsics,
  eventName: string
): EventRecord {
  const eventRecord = receipt.findRecord(mod, eventName);

  if (!eventRecord) {
    throw new PolymeshError({
      code: ErrorCode.FatalError,
      message: `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`,
    });
  }

  return eventRecord;
}

/**
 * @hidden
 */
export function padString(value: string, length: number): string {
  return padEnd(value, length, '\0');
}

/**
 * @hidden
 */
export function removePadding(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/\u0000/g, '');
}

/**
 * @hidden
 */
export function moduleAddressToString(moduleAddress: string): string {
  return encodeAddress(stringToU8a(padString(moduleAddress, MAX_MODULE_LENGTH)), SS58_FORMAT);
}

/**
 * @hidden
 */
export function keyToAddress(key: string): string {
  return encodeAddress(key, SS58_FORMAT);
}

/**
 * @hidden
 */
export function addressToKey(address: string): string {
  return u8aToHex(decodeAddress(address, IGNORE_CHECKSUM, SS58_FORMAT));
}

/**
 * @hidden
 *
 * Makes an entries request to the chain. If pagination options are supplied,
 * the request will be paginated. Otherwise, all entries will be requested at once
 */
export async function requestPaginated<F extends AnyFunction>(
  query: AugmentedQuery<'promise', F> | AugmentedQueryDoubleMap<'promise', F>,
  opts: {
    paginationOpts?: PaginationOptions;
    arg?: Parameters<F>[0];
  }
): Promise<{
  entries: [StorageKey, ObsInnerType<ReturnType<F>>][];
  lastKey: NextKey;
}> {
  const { arg, paginationOpts } = opts;
  let entries: [StorageKey, ObsInnerType<ReturnType<F>>][];
  let lastKey: NextKey = null;

  if (paginationOpts) {
    const { size: pageSize, start: startKey } = paginationOpts;
    entries = await query.entriesPaged({
      arg,
      pageSize,
      startKey,
    });

    if (entries.length === pageSize) {
      lastKey = entries[entries.length - 1][0].toHex();
    }
  } else {
    entries = await query.entries(arg);
  }

  return {
    entries,
    lastKey,
  };
}

/**
 * @hidden
 *
 * Makes a request to the chain. If a block hash is supplied,
 * the request will be made at that block. Otherwise, the most recent block will be queried
 */
export async function requestAtBlock<F extends AnyFunction>(
  query: AugmentedQuery<'promise', F> | AugmentedQueryDoubleMap<'promise', F>,
  opts: {
    blockHash?: string | BlockHash;
    args: Parameters<F>;
  },
  context: Context
): Promise<ObsInnerType<ReturnType<F>>> {
  const { blockHash, args } = opts;

  if (blockHash) {
    if (!context.isArchiveNode) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Cannot query previous blocks in a non-archive node',
      });
    }
    return query.at(blockHash, ...args);
  }

  return query(...args);
}

/**
 * @hidden
 *
 * Separates an array into smaller batches
 *
 * @param args - elements to separate
 * @param tag - transaction for which the elements are arguments. This serves to determine the size of the batches
 * @param groupByFn - optional function that takes an element and returns a value by which to group the elements.
 *   If supplied, all elements of the same group will be contained in the same batch
 */
export function batchArguments<Args>(
  args: Args[],
  tag: keyof typeof MAX_BATCH_ELEMENTS,
  groupByFn?: (obj: Args) => string
): Args[][] {
  const batchLimit = MAX_BATCH_ELEMENTS[tag];

  if (!groupByFn) {
    return chunk(args, batchLimit);
  }

  const groups = map(groupBy(args, groupByFn), group => group).sort(
    ({ length: first }, { length: second }) => first - second
  );

  const batches: Args[][] = [];

  groups.forEach(group => {
    if (group.length > batchLimit) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Batch size exceeds limit',
        data: {
          batch: group,
          limit: batchLimit,
        },
      });
    }
    let batchIndex = batches.findIndex(batch => batch.length + group.length <= batchLimit);

    if (batchIndex === -1) {
      batchIndex = batches.length;
      batches[batchIndex] = [];
    }

    batches[batchIndex] = [...batches[batchIndex], ...group];
  });

  return batches;
}

/**
 * @hidden
 *
 * Calculates next page number for paginated GraphQL ResultSet.
 * Returns null if there is no next page.
 *
 * @param size - page size requested
 * @param start - start index requestd
 * @param totalCount - total amount of elements returned by query
 *
 * @hidden
 *
 */
export function calculateNextKey(totalCount: number, size?: number, start?: number): NextKey {
  const next = (start ?? 0) + (size ?? DEFAULT_GQL_PAGE_SIZE);
  return totalCount > next ? next : null;
}

// NOTE uncomment in Governance v2 upgrade
// /**
//  * @hidden
//  */
// export function meshProposalStateToProposalState(proposalState: MeshProposalState): ProposalState {
//   if (proposalState.isPending) {
//     return ProposalState.Pending;
//   }

//   if (proposalState.isCancelled) {
//     return ProposalState.Cancelled;
//   }

//   if (proposalState.isKilled) {
//     return ProposalState.Killed;
//   }

//   if (proposalState.isRejected) {
//     return ProposalState.Rejected;
//   }

//   return ProposalState.Referendum;
// }

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
        targetDID,
        issuer,
        issuance_date: issuanceDate,
        expiry,
        type,
        jurisdiction,
        scope: claimScope,
        cdd_id: cddId,
      }) => ({
        target: new Identity({ did: targetDID }, context),
        issuer: new Identity({ did: issuer }, context),
        issuedAt: new Date(issuanceDate),
        expiry: expiry ? new Date(expiry) : null,
        claim: createClaim(type, jurisdiction, claimScope, cddId),
      })
    ),
  }));
}

/**
 * @hidden
 */
export function transactionHexToTxTag(bytes: string, context: Context): TxTag {
  const { sectionName, methodName } = context.polymeshApi.createType('Proposal', bytes);

  return extrinsicIdentifierToTxTag({
    moduleId: sectionName.toLowerCase() as ModuleIdEnum,
    callId: methodName as CallIdEnum,
  });
}

/**
 * @hidden
 */
export function middlewareProposalToProposalDetails(
  proposal: Proposal,
  context: Context
): ProposalDetails {
  const {
    proposer: proposerAddress,
    createdAt,
    url: discussionUrl,
    description,
    coolOffEndBlock,
    endBlock,
    proposal: rawProposal,
    lastState,
    lastStateUpdatedAt,
    totalVotes,
    totalAyesWeight,
    totalNaysWeight,
  } = proposal;

  return {
    proposerAddress,
    createdAt: new BigNumber(createdAt),
    discussionUrl,
    description,
    coolOffEndBlock: new BigNumber(coolOffEndBlock),
    endBlock: new BigNumber(endBlock),
    transaction: rawProposal ? transactionHexToTxTag(rawProposal, context) : null,
    lastState,
    lastStateUpdatedAt: new BigNumber(lastStateUpdatedAt),
    totalVotes: new BigNumber(totalVotes),
    totalAyesWeight: new BigNumber(totalAyesWeight),
    totalNaysWeight: new BigNumber(totalNaysWeight),
  };
}

/**
 * @hidden
 */
export function secondaryKeyToMeshSecondaryKey(
  secondaryKey: SecondaryKey,
  context: Context
): MeshSecondaryKey {
  const { polymeshApi } = context;
  const { signer, permissions } = secondaryKey;

  return polymeshApi.createType('SecondaryKey', {
    signer: signerValueToSignatory(signerToSignerValue(signer), context),
    permissions: permissions.map(permission => permissionToMeshPermission(permission, context)),
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
  return context.polymeshApi.createType('VenueType', type);
}

/**
 * @hidden
 */
export function stringToVenueDetails(details: string, context: Context): VenueDetails {
  return context.polymeshApi.createType('VenueDetails', details);
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

  return InstructionStatus.Unknown;
}

/**
 * @hidden
 */
export function meshAuthorizationStatusToAuthorizationStatus(
  status: MeshAuthorizationStatus
): AuthorizationStatus {
  if (status.isUnknown) {
    return AuthorizationStatus.Unknown;
  }

  if (status.isPending) {
    return AuthorizationStatus.Pending;
  }

  if (status.isAuthorized) {
    return AuthorizationStatus.Authorized;
  }

  return AuthorizationStatus.Rejected;
}

/**
 * @hidden
 */
export function endConditionToSettlementType(
  endCondition:
    | { type: InstructionType.SettleOnAuthorization }
    | { type: InstructionType; value: BigNumber },
  context: Context
): SettlementType {
  let value;

  if (endCondition.type === InstructionType.SettleOnAuthorization) {
    value = InstructionType.SettleOnAuthorization;
  } else {
    value = {
      [InstructionType.SettleOnBlock]: numberToU32(endCondition.value, context),
    };
  }

  return context.polymeshApi.createType('SettlementType', value);
}
