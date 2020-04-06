import { bool, Bytes, u64 } from '@polkadot/types';
import { createType } from '@polkadot/types/create/createType';
import { Balance, EventRecord, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { stringToU8a, u8aConcat, u8aFixLength, u8aToString } from '@polkadot/util';
import * as utilsCrypto from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';
import stringify from 'json-stable-stringify';
import {
  AccountKey,
  AssetIdentifier,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  Document,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  Signatory,
  Ticker,
  TokenName,
} from 'polymesh-types/types';

import { PolymeshError, PostTransactionValue } from '~/base';
import { Context } from '~/context';
import {
  Authorization,
  AuthorizationType,
  ErrorCode,
  KnownTokenType,
  TokenDocument,
  TokenIdentifierType,
  TokenType,
} from '~/types';
import {
  AuthTarget,
  Extrinsics,
  MapMaybePostTransactionValue,
  MaybePostTransactionValue,
  Signer,
  SignerType,
} from '~/types/internal';

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
  return utilsCrypto.blake2AsHex(
    u8aConcat(stringToU8a('SECURITY_TOKEN:'), u8aFixLength(stringToU8a(ticker), 96, true))
  );
}

/**
 * @hidden
 */
export function stringToTokenName(name: string, context: Context): TokenName {
  return createType<'TokenName'>(context.polymeshApi.registry, 'TokenName', name);
}

/**
 * @hidden
 */
export function tokenNameToString(name: TokenName): string {
  return name.toString();
}

/**
 * @hidden
 */
export function booleanToBool(value: boolean, context: Context): bool {
  return createType<'bool'>(context.polymeshApi.registry, 'bool', value);
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
  return createType<'Bytes'>(context.polymeshApi.registry, 'Bytes', bytes);
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
  return createType<'Ticker'>(context.polymeshApi.registry, 'Ticker', ticker);
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
  return createType<'Moment'>(context.polymeshApi.registry, 'Moment', date.getTime());
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
export function stringToIdentityId(identityId: string, context: Context): IdentityId {
  return createType<'IdentityId'>(context.polymeshApi.registry, 'IdentityId', identityId);
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
export function stringToAccountKey(accountKey: string, context: Context): AccountKey {
  return createType<'AccountKey'>(
    context.polymeshApi.registry,
    'AccountKey',
    utilsCrypto.decodeAddress(accountKey)
  );
}

/**
 * @hidden
 */
export function accountKeyToString(accountKey: AccountKey): string {
  return utilsCrypto.encodeAddress(u8aToString(accountKey));
}

/**
 * @hidden
 */
export function signerToSignatory(signer: Signer, context: Context): Signatory {
  return createType<'Signatory'>(context.polymeshApi.registry, 'Signatory', {
    [signer.type]: signer.value,
  });
}

/**
 * @hidden
 */
export function signatoryToSigner(signatory: Signatory): Signer {
  if (signatory.isAccountKey) {
    return {
      type: SignerType.AccountKey,
      value: accountKeyToString(signatory.asAccountKey),
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

  return createType<'AuthorizationData'>(context.polymeshApi.registry, 'AuthorizationData', {
    [type]: value,
  });
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

  if (auth.isTransferTokenOwnership) {
    return {
      type: AuthorizationType.TransferTokenOwnership,
      value: tickerToString(auth.asTransferTokenOwnership),
    };
  }

  if (auth.isJoinIdentity) {
    return {
      type: AuthorizationType.JoinIdentity,
      value: identityIdToString(auth.asJoinIdentity),
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
  return createType<'Balance'>(
    context.polymeshApi.registry,
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
export function numberToU64(value: number | BigNumber, context: Context): u64 {
  return createType<'u64'>(context.polymeshApi.registry, 'u64', new BigNumber(value).toString());
}

/**
 * @hidden
 */
export function u64ToBigNumber(balance: u64): BigNumber {
  return new BigNumber(balance.toString());
}

/**
 * @hidden
 */
export function tokenTypeToAssetType(type: TokenType, context: Context): AssetType {
  return createType<'AssetType'>(context.polymeshApi.registry, 'AssetType', type);
}

/**
 * @hidden
 */
export function assetTypeToString(assetType: AssetType): string {
  if (assetType.isCommodity) {
    return KnownTokenType.Commodity;
  }
  if (assetType.isDebt) {
    return KnownTokenType.Debt;
  }
  if (assetType.isEquity) {
    return KnownTokenType.Equity;
  }
  if (assetType.isStructuredProduct) {
    return KnownTokenType.StructuredProduct;
  }

  return u8aToString(assetType.asCustom);
}

/**
 * @hidden
 */
export function tokenIdentifierTypeToIdentifierType(
  type: TokenIdentifierType,
  context: Context
): IdentifierType {
  return createType<'IdentifierType'>(context.polymeshApi.registry, 'IdentifierType', type);
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

  return u8aToString(type.asCustom);
}

/**
 * @hidden
 */
export function stringToAssetIdentifier(id: string, context: Context): AssetIdentifier {
  return createType<'AssetIdentifier'>(context.polymeshApi.registry, 'AssetIdentifier', id);
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
  return createType<'FundingRoundName'>(
    context.polymeshApi.registry,
    'FundingRoundName',
    roundName
  );
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
  return createType<'DocumentName'>(context.polymeshApi.registry, 'DocumentName', docName);
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
  return createType<'DocumentUri'>(context.polymeshApi.registry, 'DocumentUri', docUri);
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
  return createType<'DocumentHash'>(context.polymeshApi.registry, 'DocumentHash', docHash);
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
  { name, uri, contentHash }: TokenDocument,
  context: Context
): Document {
  return createType<'Document'>(context.polymeshApi.registry, 'Document', {
    name: stringToDocumentName(name, context),
    uri: stringToDocumentUri(uri, context),
    // eslint-disable-next-line @typescript-eslint/camelcase
    content_hash: stringToDocumentHash(contentHash, context),
  });
}

/**
 * @hidden
 */
export function documentToTokenDocument(
  // eslint-disable-next-line @typescript-eslint/camelcase
  { name, uri, content_hash }: Document
): TokenDocument {
  return {
    name: documentNameToString(name),
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
  return createType<'AuthIdentifier'>(context.polymeshApi.registry, 'AuthIdentifier', {
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
