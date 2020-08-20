import { AugmentedQuery, AugmentedQueryDoubleMap, ObsInnerType } from '@polkadot/api/types';
import { bool, Bytes, StorageKey, Text, u8, u32, u64 } from '@polkadot/types';
import { AccountId, Balance, EventRecord, Moment } from '@polkadot/types/interfaces';
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
import stringify from 'json-stable-stringify';
import { camelCase, chunk, groupBy, isEqual, map, padEnd, snakeCase } from 'lodash';
import {
  AssetIdentifier,
  AssetName,
  AssetTransferRule,
  AssetTransferRulesResult,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  CanTransferResult,
  CddStatus,
  Claim as MeshClaim,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  IssueAssetItem,
  JurisdictionName,
  Permission as MeshPermission,
  PosRatio,
  ProposalState as MeshProposalState,
  ProtocolOp,
  Rule as MeshRule,
  RuleType,
  Signatory,
  Ticker,
  TxTag,
  TxTags,
} from 'polymesh-types/types';

import { Identity } from '~/api/entities/Identity';
import { ProposalState } from '~/api/entities/Proposal/types';
import { PolymeshError, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import {
  CallIdEnum,
  IdentityWithClaims as MiddlewareIdentityWithClaims,
  ModuleIdEnum,
} from '~/middleware/types';
import {
  Authorization,
  AuthorizationType,
  Claim,
  ClaimType,
  Condition,
  ConditionTarget,
  ConditionType,
  ErrorCode,
  IdentityWithClaims,
  isMultiClaimCondition,
  isSingleClaimCondition,
  IssuanceData,
  KnownTokenType,
  MultiClaimCondition,
  NextKey,
  PaginationOptions,
  Permission,
  Rule,
  RuleCompliance,
  Signer,
  SignerType,
  SingleClaimCondition,
  TokenIdentifierType,
  TokenType,
  TransferStatus,
} from '~/types';
import {
  AuthTarget,
  ExtrinsicIdentifier,
  Extrinsics,
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  TokenDocumentData,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  BATCH_REGEX,
  DEFAULT_GQL_PAGE_SIZE,
  IGNORE_CHECKSUM,
  MAX_BATCH_ELEMENTS,
  MAX_MODULE_LENGTH,
  MAX_TICKER_LENGTH,
  SS58_FORMAT,
} from '~/utils/constants';

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
 * @hidden
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
export function valueToDid(value: string | Identity): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.did;
}

/**
 * @hidden
 */
export function signerToSignatory(signer: Signer, context: Context): Signatory {
  return context.polymeshApi.createType('Signatory', {
    [signer.type]: signer.value,
  });
}

/**
 * @hidden
 */
export function signatoryToSigner(signatory: Signatory): Signer {
  if (signatory.isAccount) {
    return {
      type: SignerType.Account,
      value: accountIdToString(signatory.asAccount),
    };
  }

  return {
    type: SignerType.Identity,
    value: identityIdToString(signatory.asIdentity),
  };
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
export function authorizationDataToAuthorization(auth: AuthorizationData): Authorization {
  if (auth.isAttestMasterKeyRotation) {
    return {
      type: AuthorizationType.AttestMasterKeyRotation,
      value: identityIdToString(auth.asAttestMasterKeyRotation),
    };
  }

  if (auth.isRotateMasterKey) {
    return {
      type: AuthorizationType.RotateMasterKey,
      value: identityIdToString(auth.asRotateMasterKey),
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
    };
  }

  if (auth.isTransferAssetOwnership) {
    return {
      type: AuthorizationType.TransferAssetOwnership,
      value: tickerToString(auth.asTransferAssetOwnership),
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
export function numberToBalance(value: number | BigNumber, context: Context): Balance {
  return context.polymeshApi.createType(
    'Balance',
    new BigNumber(value).multipliedBy(Math.pow(10, 6)).toString()
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
export function u64ToBigNumber(value: u64): BigNumber {
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
export function tokenIdentifierTypeToIdentifierType(
  type: TokenIdentifierType,
  context: Context
): IdentifierType {
  return context.polymeshApi.createType('IdentifierType', type);
}

/**
 * @hidden
 */
export function identifierTypeToString(type: IdentifierType): string {
  if (type.isCusip) {
    return TokenIdentifierType.Cusip;
  }
  if (type.isIsin) {
    return TokenIdentifierType.Isin;
  }

  return TokenIdentifierType.Cins;
}

/**
 * @hidden
 */
export function stringToAssetIdentifier(id: string, context: Context): AssetIdentifier {
  return context.polymeshApi.createType('AssetIdentifier', id);
}

/**
 * @hidden
 */
export function assetIdentifierToString(id: AssetIdentifier): string {
  return id.toString();
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
  { did, authId }: AuthTarget,
  context: Context
): AuthIdentifier {
  return context.polymeshApi.createType('AuthIdentifier', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    auth_id: numberToU64(authId, context),
    signatory: signerToSignatory({ type: SignerType.Identity, value: did }, context),
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
    did: signatoryToSigner(signatory).value,
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
export function stringToJurisdictionName(name: string, context: Context): JurisdictionName {
  return context.polymeshApi.createType('JurisdictionName', name);
}

/**
 * @hidden
 */
export function jurisdictionNameToString(name: JurisdictionName): string {
  return name.toString();
}

/**
 * @hidden
 */
export function claimToMeshClaim(claim: Claim, context: Context): MeshClaim {
  let value: unknown;

  switch (claim.type) {
    case ClaimType.NoData:
    case ClaimType.CustomerDueDiligence: {
      value = null;
      break;
    }
    case ClaimType.Jurisdiction: {
      value = tuple(claim.name, claim.scope);
      break;
    }
    default: {
      value = claim.scope;
    }
  }

  return context.polymeshApi.createType('Claim', { [claim.type]: value });
}

/**
 * @hidden
 */
export function createClaim(
  claimType: string,
  jurisdiction?: string | null,
  scope?: string | null
): Claim {
  const type = claimType as ClaimType;
  if (type === ClaimType.Jurisdiction) {
    return {
      type,
      name: jurisdiction as string,
      scope: scope as string,
    };
  } else if (type !== ClaimType.NoData && type !== ClaimType.CustomerDueDiligence) {
    return {
      type,
      scope: scope as string,
    };
  }

  return { type };
}

/**
 * @hidden
 */
export function meshClaimToClaim(claim: MeshClaim): Claim {
  if (claim.isJurisdiction) {
    const [name, scope] = claim.asJurisdiction;
    return {
      type: ClaimType.Jurisdiction,
      name: jurisdictionNameToString(name),
      scope: identityIdToString(scope),
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
      scope: identityIdToString(claim.asAccredited),
    };
  }

  if (claim.isAffiliate) {
    return {
      type: ClaimType.Affiliate,
      scope: identityIdToString(claim.asAffiliate),
    };
  }

  if (claim.isBuyLockup) {
    return {
      type: ClaimType.BuyLockup,
      scope: identityIdToString(claim.asBuyLockup),
    };
  }

  if (claim.isSellLockup) {
    return {
      type: ClaimType.SellLockup,
      scope: identityIdToString(claim.asSellLockup),
    };
  }

  if (claim.isCustomerDueDiligence) {
    return {
      type: ClaimType.CustomerDueDiligence,
    };
  }

  if (claim.isKnowYourCustomer) {
    return {
      type: ClaimType.KnowYourCustomer,
      scope: identityIdToString(claim.asKnowYourCustomer),
    };
  }

  if (claim.isExempted) {
    return {
      type: ClaimType.Exempted,
      scope: identityIdToString(claim.asExempted),
    };
  }

  return {
    type: ClaimType.Blocked,
    scope: identityIdToString(claim.asBlocked),
  };
}

/**
 * @hidden
 */
export function ruleToAssetTransferRule(rule: Rule, context: Context): AssetTransferRule {
  const { polymeshApi } = context;
  const senderRules: MeshRule[] = [];
  const receiverRules: MeshRule[] = [];

  rule.conditions.forEach(condition => {
    let claimContent: MeshClaim | MeshClaim[];
    if (isSingleClaimCondition(condition)) {
      const { claim } = condition;
      claimContent = claimToMeshClaim(claim, context);
    } else {
      const { claims } = condition;
      claimContent = claims.map(claim => claimToMeshClaim(claim, context));
    }

    const { target, type, trustedClaimIssuers = [] } = condition;

    const meshRule = polymeshApi.createType('Rule', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      rule_type: {
        [type]: claimContent,
      },
      issuers: trustedClaimIssuers.map(issuer => stringToIdentityId(issuer, context)),
    });

    if ([ConditionTarget.Both, ConditionTarget.Receiver].includes(target)) {
      receiverRules.push(meshRule);
    }

    if ([ConditionTarget.Both, ConditionTarget.Sender].includes(target)) {
      senderRules.push(meshRule);
    }
  });

  return polymeshApi.createType('AssetTransferRule', {
    /* eslint-disable @typescript-eslint/camelcase */
    sender_rules: senderRules,
    receiver_rules: receiverRules,
    rule_id: numberToU32(rule.id, context),
    /* eslint-enable @typescript-eslint/camelcase */
  });
}

/**
 * @hidden
 */
export function assetTransferRuleToRule(rule: AssetTransferRule): Rule {
  const ruleTypeToCondition = (
    ruleType: RuleType
  ):
    | Pick<SingleClaimCondition, 'type' | 'claim'>
    | Pick<MultiClaimCondition, 'type' | 'claims'> => {
    if (ruleType.isIsPresent) {
      return {
        type: ConditionType.IsPresent,
        claim: meshClaimToClaim(ruleType.asIsPresent),
      };
    }

    if (ruleType.isIsAbsent) {
      return {
        type: ConditionType.IsAbsent,
        claim: meshClaimToClaim(ruleType.asIsAbsent),
      };
    }

    if (ruleType.isIsAnyOf) {
      return {
        type: ConditionType.IsAnyOf,
        claims: ruleType.asIsAnyOf.map(claim => meshClaimToClaim(claim)),
      };
    }

    return {
      type: ConditionType.IsNoneOf,
      claims: ruleType.asIsNoneOf.map(claim => meshClaimToClaim(claim)),
    };
  };

  const conditions: Condition[] = rule.sender_rules.map(({ rule_type: ruleType, issuers }) => ({
    ...ruleTypeToCondition(ruleType),
    target: ConditionTarget.Sender,
    trustedClaimIssuers: issuers.map(issuer => identityIdToString(issuer)),
  }));

  rule.receiver_rules.forEach(({ rule_type: ruleType, issuers }) => {
    const newCondition = {
      ...ruleTypeToCondition(ruleType),
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
  });

  return {
    id: u32ToBigNumber(rule.rule_id).toNumber(),
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
export function stringToText(url: string, context: Context): Text {
  return context.polymeshApi.createType('Text', url);
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
export function issuanceDataToIssueAssetItem(
  issuanceData: IssuanceData,
  context: Context
): IssueAssetItem {
  const { identity, amount } = issuanceData;
  return context.polymeshApi.createType('IssueAssetItem', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    identity_did: stringToIdentityId(valueToDid(identity), context),
    value: numberToBalance(amount, context),
  });
}

/**
 * @hidden
 */
export function assetTransferRulesResultToRuleCompliance(
  assetTransferRulesResult: AssetTransferRulesResult
): RuleCompliance {
  const { rules: transferRules, final_result: result } = assetTransferRulesResult;
  const rules = transferRules.map(rule => ({
    ...assetTransferRuleToRule(rule),
    complies: boolToBoolean(rule.transfer_rule_result),
  }));

  return {
    rules,
    complies: boolToBoolean(result),
  };
}

/**
 * Unwrap a Post Transaction Value
 */
export function unwrapValue<T extends unknown>(value: MaybePostTransactionValue<T>): T {
  if (value instanceof PostTransactionValue) {
    return value.value;
  }

  return value;
}

/**
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
 * Makes a request to the chain. If a block hash is supplied,
 * the request will be made at that block. Otherwise, the most recent block will be queried
 */
export async function requestAtBlock<F extends AnyFunction>(
  query: AugmentedQuery<'promise', F> | AugmentedQueryDoubleMap<'promise', F>,
  opts: {
    blockHash?: string;
    args: Parameters<F>;
  }
): Promise<ObsInnerType<ReturnType<F>>> {
  const { blockHash, args } = opts;

  if (blockHash) {
    return query.at(blockHash, ...args);
  }

  return query(...args);
}

/**
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

/**
 * @hidden
 */
export function meshProposalStateToProposalState(proposalState: MeshProposalState): ProposalState {
  if (proposalState.isPending) {
    return ProposalState.Pending;
  }

  if (proposalState.isCancelled) {
    return ProposalState.Cancelled;
  }

  if (proposalState.isKilled) {
    return ProposalState.Killed;
  }

  if (proposalState.isRejected) {
    return ProposalState.Rejected;
  }

  return ProposalState.Referendum;
}

/**
 * @hidden
 */
export function toIdentityWithClaims(
  data: MiddlewareIdentityWithClaims[],
  context: Context
): IdentityWithClaims[] {
  // NOTE: this require statement is necessary to avoid a circular dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Identity: IdentityClass } = require('../api/entities/Identity');

  return data.map(({ did, claims }) => ({
    identity: new IdentityClass({ did }, context),
    claims: claims.map(
      ({
        targetDID,
        issuer,
        issuance_date: issuanceDate,
        expiry,
        type,
        jurisdiction,
        scope: claimScope,
      }) => ({
        target: new IdentityClass({ did: targetDID }, context),
        issuer: new IdentityClass({ did: issuer }, context),
        issuedAt: new Date(issuanceDate),
        expiry: expiry ? new Date(expiry) : null,
        claim: createClaim(type, jurisdiction, claimScope),
      })
    ),
  }));
}
