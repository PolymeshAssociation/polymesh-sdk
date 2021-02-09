import { bool, Bytes, Text, u8, u32, u64 } from '@polkadot/types';
import { AccountId, Balance, Moment, Permill } from '@polkadot/types/interfaces';
import {
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
  includes,
  isEqual,
  map,
  padEnd,
  range,
  rangeRight,
  snakeCase,
  values,
} from 'lodash';
import {
  AffirmationStatus as MeshAffirmationStatus,
  AssetComplianceResult,
  AssetIdentifier,
  AssetName,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  CanTransferResult,
  CddId,
  CddStatus,
  Claim as MeshClaim,
  ClaimType as MeshClaimType,
  ComplianceRequirement,
  ComplianceRequirementResult,
  Condition as MeshCondition,
  ConditionType as MeshConditionType,
  Document,
  DocumentHash,
  DocumentName,
  DocumentType,
  DocumentUri,
  FundingRoundName,
  Fundraiser,
  FundraiserStatus as MeshFundraiserStatus,
  FundraiserTier,
  IdentityId,
  InstructionStatus as MeshInstructionStatus,
  InvestorZKProofData,
  Memo,
  MovePortfolioItem,
  Permissions as MeshPermissions,
  PipId,
  PortfolioId as MeshPortfolioId,
  PosRatio,
  PriceTier,
  ProtocolOp,
  Scope as MeshScope,
  ScopeId,
  SecondaryKey as MeshSecondaryKey,
  SettlementType,
  Signatory,
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
  Context,
  DefaultPortfolio,
  Identity,
  NumberedPortfolio,
  PolymeshError,
  Portfolio,
  SecurityToken,
  Venue,
} from '~/internal';
import {
  CallIdEnum,
  ClaimScopeTypeEnum,
  IdentityWithClaims as MiddlewareIdentityWithClaims,
  ModuleIdEnum,
  Portfolio as MiddlewarePortfolio,
  // Proposal,
  Scope as MiddlewareScope,
} from '~/middleware/types';
import {
  AffirmationStatus,
  Authorization,
  AuthorizationType,
  Claim,
  ClaimType,
  Compliance,
  Condition,
  ConditionCompliance,
  ConditionTarget,
  ConditionType,
  ErrorCode,
  IdentityCondition,
  IdentityWithClaims,
  InstructionStatus,
  InstructionType,
  isMultiClaimCondition,
  isSingleClaimCondition,
  KnownTokenType,
  MultiClaimCondition,
  Permissions,
  PermissionsLike,
  PortfolioLike,
  PortfolioMovement,
  PrimaryIssuanceAgentCondition,
  Requirement,
  RequirementCompliance,
  Scope,
  ScopeType,
  SecondaryKey,
  Signer,
  SingleClaimCondition,
  StoDetails,
  StoStatus,
  StoTier,
  Tier,
  TokenDocument,
  TokenIdentifier,
  TokenIdentifierType,
  TokenType,
  TransferStatus,
  TrustedClaimIssuer,
  VenueType,
} from '~/types';
import {
  AuthTarget,
  ExtrinsicIdentifier,
  PolymeshTx,
  PortfolioId,
  SignerType,
  SignerValue,
  TransferRestriction,
  TransferRestrictionType,
} from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  IGNORE_CHECKSUM,
  MAX_BALANCE,
  MAX_DECIMALS,
  MAX_MODULE_LENGTH,
  MAX_TICKER_LENGTH,
  SS58_FORMAT,
} from '~/utils/constants';
import { createClaim, isPrintableAscii, padString, removePadding } from '~/utils/internal';

export * from '~/generated/utils';

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
  if (!ticker.length || ticker.length > MAX_TICKER_LENGTH) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `Ticker length must be between 1 and ${MAX_TICKER_LENGTH} character`,
    });
  }

  if (!isPrintableAscii(ticker)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only printable ASCII is alowed as ticker name',
    });
  }

  if (ticker !== ticker.toUpperCase()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Ticker cannot contain lower case letters',
    });
  }

  return context.polymeshApi.createType('Ticker', ticker);
}

/**
 * @hidden
 */
export function tickerToString(ticker: Ticker): string {
  return removePadding(u8aToString(ticker));
}

/**
 * @hidden
 */
export function stringToInvestorZKProofData(proof: string, context: Context): InvestorZKProofData {
  return context.polymeshApi.createType('InvestorZKProofData', proof);
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
 */
export function u64ToBigNumber(value: u64): BigNumber {
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
export function percentageToPermill(value: number | BigNumber, context: Context): Permill {
  return context.polymeshApi.createType(
    'Permill',
    new BigNumber(value).multipliedBy(Math.pow(10, 4)).toString()
  ); // (value : 100) * 10^6
}

/**
 * @hidden
 *
 * @note returns a percentage value ([0, 100])
 */
export function permillToBigNumber(value: Permill): BigNumber {
  return new BigNumber(value.toString()).dividedBy(Math.pow(10, 4)); // (value : 10^6) * 100
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
  return context.polymeshApi.createType('PortfolioId', {
    did: stringToIdentityId(did, context),
    kind: number ? { User: numberToU64(number, context) } : 'Default',
  });
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
export function permissionsToMeshPermissions(
  permissions: Permissions,
  context: Context
): MeshPermissions {
  const { tokens, transactions, portfolios } = permissions;

  const extrinsicDict: Record<string, string[]> = {};
  let extrinsic: { pallet_name: string; dispatchable_names: string[] }[] | null = null;

  if (transactions) {
    transactions.sort().forEach(tag => {
      const [modName, txName] = tag.split('.');

      const palletName = stringUpperFirst(modName);
      const dispatchableName = snakeCase(txName);

      const pallet = (extrinsicDict[palletName] = extrinsicDict[palletName] || []);

      pallet.push(dispatchableName);
    });

    extrinsic = map(extrinsicDict, (val, key) => ({
      /* eslint-disable @typescript-eslint/camelcase */
      pallet_name: key,
      dispatchable_names: val,
      /* eslint-enable @typescript-eslint/camelcase */
    }));
  }

  const value = {
    asset: tokens?.map(({ ticker }) => stringToTicker(ticker, context)) ?? null,
    extrinsic,
    portfolio:
      portfolios?.map(portfolio =>
        portfolioIdToMeshPortfolioId(portfolioToPortfolioId(portfolio), context)
      ) ?? null,
  };

  return context.polymeshApi.createType('Permissions', value);
}

/**
 * @hidden
 */
export function meshPermissionsToPermissions(
  permissions: MeshPermissions,
  context: Context
): Permissions {
  const { asset, extrinsic, portfolio } = permissions;

  let tokens = null;
  let transactions = null;
  let portfolios = null;

  if (asset.isSome) {
    tokens = asset
      .unwrap()
      .map(ticker => new SecurityToken({ ticker: tickerToString(ticker) }, context));
  }

  if (extrinsic.isSome) {
    transactions = extrinsic
      .unwrap()
      .reduce<TxTag[]>(
        (result, { pallet_name: palletName, dispatchable_names: dispatchableNames }) => {
          const moduleName = stringLowerFirst(textToString(palletName));

          let newTags: TxTag[];

          if (dispatchableNames.isSome) {
            newTags = dispatchableNames
              .unwrap()
              .map(name => `${moduleName}.${camelCase(textToString(name))}` as TxTag);
          } else {
            newTags = values(TxTags[moduleName as keyof typeof TxTags]);
          }

          return [...result, ...newTags];
        },
        []
      );
  }

  if (portfolio.isSome) {
    portfolios = portfolio
      .unwrap()
      .map(portfolioId => meshPortfolioIdToPortfolio(portfolioId, context));
  }

  return {
    tokens,
    transactions,
    portfolios,
  };
}

/**
 * @hidden
 */
export function authorizationToAuthorizationData(
  auth: Authorization,
  context: Context
): AuthorizationData {
  let value;

  if (auth.type === AuthorizationType.NoData) {
    value = null;
  } else if (auth.type === AuthorizationType.JoinIdentity) {
    value = permissionsToMeshPermissions(auth.value, context);
  } else if (auth.type === AuthorizationType.PortfolioCustody) {
    value = portfolioIdToMeshPortfolioId(portfolioToPortfolioId(auth.value), context);
  } else {
    value = auth.value;
  }

  return context.polymeshApi.createType('AuthorizationData', {
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
  return context.polymeshApi.createType('AuthorizationType', authorizationType);
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
      value: meshPortfolioIdToPortfolio(auth.asPortfolioCustody, context),
    };
  }

  if (auth.isJoinIdentity) {
    return {
      type: AuthorizationType.JoinIdentity,
      value: meshPermissionsToPermissions(auth.asJoinIdentity, context),
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

  if (rawValue.isGreaterThan(MAX_BALANCE)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The value exceeds the maximum possible balance',
      data: {
        currentValue: rawValue,
        amountLimit: MAX_BALANCE,
      },
    });
  }

  if (divisible) {
    if (rawValue.decimalPlaces() > MAX_DECIMALS) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The value has more decimal places than allowed',
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
        message: 'The value has decimals but the token is indivisible',
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
export function stringToDocumentType(docType: string, context: Context): DocumentType {
  return context.polymeshApi.createType('DocumentType', docType);
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
export function tokenDocumentToDocument(
  { uri, contentHash, name, filedAt, type }: TokenDocument,
  context: Context
): Document {
  return context.polymeshApi.createType('Document', {
    uri: stringToDocumentUri(uri, context),
    name: stringToDocumentName(name, context),
    /* eslint-disable @typescript-eslint/camelcase */
    content_hash: stringToDocumentHash(contentHash, context),
    doc_type: type ? stringToDocumentType(type, context) : null,
    filing_date: filedAt ? dateToMoment(filedAt, context) : null,
    /* eslint-enable @typescript-eslint/camelcase */
  });
}

/**
 * @hidden
 */
export function documentToTokenDocument(
  // eslint-disable-next-line @typescript-eslint/camelcase
  { uri, content_hash: contentHash, name, doc_type: docType, filing_date: filingDate }: Document
): TokenDocument {
  const filedAt = filingDate.unwrapOr(undefined);
  const type = docType.unwrapOr(undefined);
  let doc: TokenDocument = {
    uri: documentUriToString(uri),
    contentHash: documentHashToString(contentHash),
    name: documentNameToString(name),
  };

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
export function stringToScopeId(scopeId: string, context: Context): ScopeId {
  return context.polymeshApi.createType('ScopeId', scopeId);
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

  return {
    type: ClaimType.Blocked,
    scope: meshScopeToScope(claim.asBlocked),
  };
}

/**
 * @hidden
 */
export function stringToTargetIdentity(did: string | null, context: Context): TargetIdentity {
  return context.polymeshApi.createType(
    'TargetIdentity',
    did ? { Specific: stringToIdentityId(did, context) } : 'PrimaryIssuanceAgent'
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

  let trustedFor: ClaimType[] | undefined;

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
  issuer: TrustedClaimIssuer,
  context: Context
): TrustedIssuer {
  const {
    identity: { did },
    trustedFor: claimTypes,
  } = issuer;

  let trustedFor;

  if (!claimTypes) {
    trustedFor = 'Any';
  } else {
    trustedFor = { Specific: claimTypes };
  }

  return context.polymeshApi.createType('TrustedIssuer', {
    issuer: stringToIdentityId(did, context),
    // eslint-disable-next-line @typescript-eslint/camelcase
    trusted_for: trustedFor,
  });
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
    let conditionContent: MeshClaim | MeshClaim[] | TargetIdentity;
    let { type } = condition;
    if (isSingleClaimCondition(condition)) {
      const { claim } = condition;
      conditionContent = claimToMeshClaim(claim, context);
    } else if (isMultiClaimCondition(condition)) {
      const { claims } = condition;
      conditionContent = claims.map(claim => claimToMeshClaim(claim, context));
    } else if (condition.type === ConditionType.IsIdentity) {
      const {
        identity: { did },
      } = condition;
      conditionContent = stringToTargetIdentity(did, context);
    } else {
      // IsPrimaryIssuanceAgent does not exist as a condition type in Polymesh, it's SDK sugar
      type = ConditionType.IsIdentity;
      conditionContent = stringToTargetIdentity(null, context);
    }

    const { target, trustedClaimIssuers = [] } = condition;

    const meshCondition = polymeshApi.createType('Condition', {
      // eslint-disable-next-line @typescript-eslint/camelcase
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
function meshConditionTypeToCondition(
  meshConditionType: MeshConditionType,
  context: Context
):
  | Pick<SingleClaimCondition, 'type' | 'claim'>
  | Pick<MultiClaimCondition, 'type' | 'claims'>
  | Pick<IdentityCondition, 'type' | 'identity'>
  | Pick<PrimaryIssuanceAgentCondition, 'type'> {
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

    if (target.isPrimaryIssuanceAgent) {
      return {
        type: ConditionType.IsPrimaryIssuanceAgent,
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
  ): boolean => {
    let equalClaims = false;

    if (isSingleClaimCondition(aCondition) && isSingleClaimCondition(bCondition)) {
      equalClaims = isEqual(aCondition.claim, bCondition.claim);
    }

    if (isMultiClaimCondition(aCondition) && isMultiClaimCondition(bCondition)) {
      equalClaims = isEqual(aCondition.claims, bCondition.claims);
    }

    return (
      equalClaims &&
      isEqual(aCondition.trustedClaimIssuers, bCondition.trustedClaimIssuers) &&
      aComplies === bComplies
    );
  };

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
    id: u32ToBigNumber(complianceRequirement.id).toNumber(),
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

  const conditionsAreEqual = (a: Condition, b: Condition): boolean => {
    let equalClaims = false;

    if (isSingleClaimCondition(a) && isSingleClaimCondition(b)) {
      equalClaims = isEqual(a.claim, b.claim);
    }

    if (isMultiClaimCondition(a) && isMultiClaimCondition(b)) {
      equalClaims = isEqual(a.claims, b.claims);
    }

    return equalClaims && isEqual(a.trustedClaimIssuers, b.trustedClaimIssuers);
  };

  complianceRequirement.sender_conditions.forEach(({ condition_type: conditionType, issuers }) => {
    const newCondition = {
      ...meshConditionTypeToCondition(conditionType, context),
      target: ConditionTarget.Sender,
      trustedClaimIssuers: issuers.map(trustedIssuer =>
        trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
      ),
    };
    const existingCondition = conditions.find(condition =>
      conditionsAreEqual(condition, newCondition)
    );

    if (!existingCondition) {
      conditions.push(newCondition);
    }
  });

  complianceRequirement.receiver_conditions.forEach(
    ({ condition_type: conditionType, issuers }) => {
      const newCondition = {
        ...meshConditionTypeToCondition(conditionType, context),
        target: ConditionTarget.Receiver,
        trustedClaimIssuers: issuers.map(trustedIssuer =>
          trustedIssuerToTrustedClaimIssuer(trustedIssuer, context)
        ),
      };

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
    extrinsicName.replace(new RegExp('Documents$'), 'Document') // `asset.addDocuments` and `asset.removeDocuments`
  )}`;

  const protocolOpTags = [
    TxTags.asset.RegisterTicker,
    TxTags.asset.Issue,
    TxTags.asset.AddDocuments,
    TxTags.asset.CreateAsset,
    TxTags.asset.CreateCheckpoint,
    TxTags.dividend.New,
    TxTags.complianceManager.AddComplianceRequirement,
    TxTags.identity.RegisterDid,
    TxTags.identity.CddRegisterDid,
    TxTags.identity.AddClaim,
    TxTags.identity.SetPrimaryKey,
    TxTags.identity.AddSecondaryKeysWithAuthorization,
    TxTags.pips.Propose,
    TxTags.voting.AddBallot,
    TxTags.contracts.PutCode,
    TxTags.corporateBallot.AttachBallot,
    TxTags.capitalDistribution.Distribute,
  ];

  if (!includes(protocolOpTags, tag)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `${value} does not match any ProtocolOp`,
    });
  }

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
 */
export function transactionHexToTxTag(bytes: string, context: Context): TxTag {
  const { section, method } = context.polymeshApi.createType('Proposal', bytes);

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

// /**
//  * @hidden
//  */
// export function middlewareProposalToProposalDetails(
//   proposal: Proposal,
//   context: Context
// ): ProposalDetails {
//   const {
//     proposer: proposerAddress,
//     createdAt,
//     url: discussionUrl,
//     description,
//     coolOffEndBlock,
//     endBlock,
//     proposal: rawProposal,
//     lastState,
//     lastStateUpdatedAt,
//     totalVotes,
//     totalAyesWeight,
//     totalNaysWeight,
//   } = proposal;

//   return {
//     proposerAddress,
//     createdAt: new BigNumber(createdAt),
//     discussionUrl,
//     description,
//     coolOffEndBlock: new BigNumber(coolOffEndBlock),
//     endBlock: new BigNumber(endBlock),
//     transaction: rawProposal ? transactionHexToTxTag(rawProposal, context) : null,
//     lastState,
//     lastStateUpdatedAt: new BigNumber(lastStateUpdatedAt),
//     totalVotes: new BigNumber(totalVotes),
//     totalAyesWeight: new BigNumber(totalAyesWeight),
//     totalNaysWeight: new BigNumber(totalNaysWeight),
//   };
// }

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
export function secondaryKeyToMeshSecondaryKey(
  secondaryKey: SecondaryKey,
  context: Context
): MeshSecondaryKey {
  const { polymeshApi } = context;
  const { signer, permissions } = secondaryKey;

  return polymeshApi.createType('SecondaryKey', {
    signer: signerValueToSignatory(signerToSignerValue(signer), context),
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
export function meshAffirmationStatusToAffirmationStatus(
  status: MeshAffirmationStatus
): AffirmationStatus {
  if (status.isUnknown) {
    return AffirmationStatus.Unknown;
  }

  if (status.isPending) {
    return AffirmationStatus.Pending;
  }

  if (status.isAffirmed) {
    return AffirmationStatus.Affirmed;
  }

  return AffirmationStatus.Rejected;
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
      [InstructionType.SettleOnBlock]: numberToU32(endCondition.value, context),
    };
  }

  return context.polymeshApi.createType('SettlementType', value);
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
  const { token, amount } = portfolioItem;
  return context.polymeshApi.createType('MovePortfolioItem', {
    ticker: stringToTicker(typeof token === 'string' ? token : token.ticker, context),
    amount: numberToBalance(amount, context),
  });
}

/**
 * @hidden
 */
export function claimTypeToMeshClaimType(claimType: ClaimType, context: Context): MeshClaimType {
  return context.polymeshApi.createType('ClaimType', claimType);
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

    if (!value.isInteger() || value.isNegative()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Count should be a positive integer',
      });
    }

    tmValue = numberToU64(value, context);
  } else {
    tmType = 'PercentageTransferManager';

    if (value.lt(0) || value.gt(100)) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Percentage should be between 0 and 100',
      });
    }

    tmValue = percentageToPermill(value, context);
  }

  return context.polymeshApi.createType('TransferManager', {
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
export function stoTierToPriceTier(tier: StoTier, context: Context): PriceTier {
  const { price, amount } = tier;
  return context.polymeshApi.createType('PriceTier', {
    total: numberToBalance(amount, context),
    price: numberToBalance(price, context),
  });
}

/**
 * @hidden
 */
export function permissionsLikeToPermissions(
  permissionsLike: PermissionsLike,
  context: Context
): Permissions {
  let tokenPermissions: SecurityToken[] | null = [];
  let transactionPermissions: TxTag[] | null = [];
  let portfolioPermissions: (DefaultPortfolio | NumberedPortfolio)[] | null = [];

  const { tokens, transactions, portfolios } = permissionsLike;

  if (tokens === null) {
    tokenPermissions = null;
  } else if (tokens) {
    tokenPermissions = tokens.map(ticker =>
      typeof ticker !== 'string' ? ticker : new SecurityToken({ ticker }, context)
    );
  }

  if (transactions !== undefined) {
    transactionPermissions = transactions;
  }

  if (portfolios === null) {
    portfolioPermissions = null;
  } else if (portfolios) {
    portfolioPermissions = portfolios.map(portfolio =>
      portfolioLikeToPortfolio(portfolio, context)
    );
  }

  return {
    tokens: tokenPermissions,
    transactions: transactionPermissions,
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
export function meshFundraiserStatusToStoStatus(
  meshFundraiserStatus: MeshFundraiserStatus
): StoStatus {
  if (meshFundraiserStatus.isLive) {
    return StoStatus.Live;
  }

  if (meshFundraiserStatus.isFrozen) {
    return StoStatus.Frozen;
  }

  return StoStatus.Closed;
}

/**
 * @hidden
 */
export function fundraiserToStoDetails(fundraiser: Fundraiser, context: Context): StoDetails {
  const {
    creator,
    offering_portfolio: offeringPortfolio,
    raising_portfolio: raisingPortfolio,
    raising_asset: raisingAsset,
    tiers,
    venue_id: venueId,
    start,
    end,
    status,
    minimum_investment: minInvestment,
  } = fundraiser;

  return {
    creator: new Identity({ did: identityIdToString(creator) }, context),
    offeringPortfolio: meshPortfolioIdToPortfolio(offeringPortfolio, context),
    raisingPortfolio: meshPortfolioIdToPortfolio(raisingPortfolio, context),
    raisingCurrency: tickerToString(raisingAsset),
    tiers: tiers.map(tier => fundraiserTierToTier(tier)),
    venue: new Venue({ id: u64ToBigNumber(venueId) }, context),
    start: momentToDate(start),
    end: end.isSome ? momentToDate(end.unwrap()) : null,
    status: meshFundraiserStatusToStoStatus(status),
    minInvestment: balanceToBigNumber(minInvestment),
  };
}
