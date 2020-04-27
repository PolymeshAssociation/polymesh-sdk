import { bool, Bytes, u64 } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import * as decodeAddressModule from '@polkadot/util-crypto/address/decode';
import * as encodeAddressModule from '@polkadot/util-crypto/address/encode';
import BigNumber from 'bignumber.js';
import {
  AccountKey,
  AssetIdentifier,
  AssetTransferRule,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  Claim as MeshClaim,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  JurisdictionName,
  Signatory,
  Ticker,
  TokenName,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { PostTransactionValue } from '~/base';
import { polkadotMockUtils } from '~/testUtils/mocks';
import {
  Authorization,
  AuthorizationType,
  Claim,
  ClaimType,
  Condition,
  ConditionTarget,
  ConditionType,
  KnownTokenType,
  TokenIdentifierType,
} from '~/types';
import { SignerType } from '~/types/internal';

import {
  accountKeyToString,
  assetIdentifierToString,
  assetTransferRuleToRule,
  assetTypeToString,
  authIdentifierToAuthTarget,
  authorizationDataToAuthorization,
  authorizationToAuthorizationData,
  authTargetToAuthIdentifier,
  balanceToBigNumber,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  claimToMeshClaim,
  dateToMoment,
  delay,
  documentHashToString,
  documentNameToString,
  documentToTokenDocument,
  documentUriToString,
  findEventRecord,
  fundingRoundNameToString,
  identifierTypeToString,
  identityIdToString,
  jurisdictionNameToString,
  meshClaimToClaim,
  momentToDate,
  numberToBalance,
  numberToU32,
  numberToU64,
  ruleToAssetTransferRule,
  serialize,
  signatoryToSigner,
  signerToSignatory,
  stringToAccountKey,
  stringToAssetIdentifier,
  stringToBytes,
  stringToDocumentHash,
  stringToDocumentName,
  stringToDocumentUri,
  stringToFundingRoundName,
  stringToIdentityId,
  stringToJurisdictionName,
  stringToTicker,
  stringToTokenName,
  tickerToDid,
  tickerToString,
  tokenDocumentToDocument,
  tokenIdentifierTypeToIdentifierType,
  tokenNameToString,
  tokenTypeToAssetType,
  u64ToBigNumber,
  unserialize,
  unwrapValues,
  valueToDid,
} from '../';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/polkadot').mockPolkadotModule('@polkadot/api')
);
jest.mock('~/context', require('~/testUtils/mocks/polkadot').mockContextModule('~/context'));

describe('delay', () => {
  jest.useFakeTimers();

  test('should resolve after the supplied timeout', () => {
    const delayPromise = delay(5000);

    jest.advanceTimersByTime(5000);

    return expect(delayPromise).resolves.toBeUndefined();
  });
});

describe('serialize and unserialize', () => {
  const entityType = 'someEntity';

  const pojo1 = {
    foo: 'Foo',
    bar: 'Bar',
  };

  const inversePojo1 = {
    bar: 'Bar',
    foo: 'Foo',
  };

  const pojo2 = {
    baz: 'baz',
  };

  test('serialize returns the same unique id for the same pojo', () => {
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, pojo1));
    expect(serialize(entityType, pojo1)).toBe(serialize(entityType, inversePojo1));
  });

  test('serialize returns a different unique id for different pojos', () => {
    expect(serialize(entityType, pojo1)).not.toBe(serialize(entityType, pojo2));
  });

  test('unserialize recovers the serialized object', () => {
    expect(unserialize(serialize(entityType, pojo1))).toEqual(pojo1);
    expect(unserialize(serialize(entityType, inversePojo1))).toEqual(pojo1);
  });

  const errorMsg = 'Wrong ID format';

  test('unserialize throws an error if the argument has an incorrect format', () => {
    expect(() => unserialize('unformatted')).toThrowError(errorMsg);
  });

  test('unserialize throws an error if the serialized string is not valid JSON', () => {
    const fakeSerialized = Buffer.from('someEntity:nonJsonString').toString('base64');
    expect(() => unserialize(fakeSerialized)).toThrowError(errorMsg);
  });
});

describe('tickerToDid', () => {
  test('should generate the ticker did', () => {
    let ticker = 'someTicker';
    let result = tickerToDid(ticker);

    expect(result).toBe('0x51a5fed99b9d305ef26e6af92dd3dcb181a30a07dc5f075e260b82a92d48913c');

    ticker = 'otherTicker';
    result = tickerToDid(ticker);

    expect(result).toBe('0xae37fa10f763fa5d302c5999ac06897f1fcf383dcc9787f1ede189ba161d06a5');

    ticker = 'lastTicker';
    result = tickerToDid(ticker);

    expect(result).toBe('0xa643b102d0c58adb3d13a28ab260644f2d0b010dc73aab99a3802b843868ab64');
  });
});

describe('stringToIdentityId and identityIdToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToIdentityId should convert a did string into an IdentityId', () => {
    const identity = 'IdentityObject';
    const fakeResult = ('type' as unknown) as IdentityId;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('IdentityId', identity)
      .returns(fakeResult);

    const result = stringToIdentityId(identity, context);

    expect(result).toBe(fakeResult);
  });

  test('identityIdToString should convert an IdentityId to a did string', () => {
    const fakeResult = 'IdentityString';
    const identityId = polkadotMockUtils.createMockIdentityId(fakeResult);

    const result = identityIdToString(identityId);
    expect(result).toBe(fakeResult);
  });
});

describe('valueToDid', () => {
  test('valueToDid should return the Indentity DID string', () => {
    const did = 'someDid';
    const context = polkadotMockUtils.getContextInstance();
    const identity = new Identity({ did }, context);

    const result = valueToDid(identity);

    expect(result).toBe(did);
  });

  test('valueToDid should return the same DID string that it receives', () => {
    const did = 'someDid';
    const result = valueToDid(did);

    expect(result).toBe(did);
  });
});

describe('stringToAccountKey and accountKeyToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
    sinon.restore();
  });

  test('stringToAccountKey should convert a string to a polkadot AccountKey object', () => {
    const value = 'someAccountId';
    const fakeResult = ('convertedAccountKey' as unknown) as AccountKey;
    const context = polkadotMockUtils.getContextInstance();
    const decodedValue = ('decodedAccountId' as unknown) as Uint8Array;

    sinon
      .stub(decodeAddressModule, 'default')
      .withArgs(value)
      .returns(decodedValue);

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AccountKey', decodedValue)
      .returns(fakeResult);

    const result = stringToAccountKey(value, context);

    expect(result).toBe(fakeResult);
  });

  test('accountKeyToString should convert a polkadot AccountKey object to a string', () => {
    const fakeResult = 'someAccountId';
    const accountKey = polkadotMockUtils.createMockAccountKey(fakeResult);

    sinon
      .stub(encodeAddressModule, 'default')
      .withArgs(accountKey)
      .returns(fakeResult);

    const result = accountKeyToString(accountKey);
    expect(result).toEqual(fakeResult);
  });
});

describe('numberToBalance and balanceToBigNumber', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('numberToBalance should convert a number to a polkadot Balance object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
      .returns(fakeResult);

    const result = numberToBalance(value, context);

    expect(result).toBe(fakeResult);
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = polkadotMockUtils.createMockBalance(fakeResult);

    const result = balanceToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult).div(Math.pow(10, 6)));
  });
});

describe('numberToU64 and u64ToBigNumber', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('numberToU64 should convert a number to a polkadot u64 object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as u64;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('u64', value.toString())
      .returns(fakeResult);

    const result = numberToU64(value, context);

    expect(result).toBe(fakeResult);
  });

  test('u64ToBigNumber should convert a polkadot u64 object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = polkadotMockUtils.createMockBalance(fakeResult);

    const result = u64ToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult));
  });
});

describe('stringToBytes and bytesToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToBytes should convert a string to a polkadot Bytes object', () => {
    const value = 'someBytes';
    const fakeResult = ('convertedBytes' as unknown) as Bytes;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Bytes', value)
      .returns(fakeResult);

    const result = stringToBytes(value, context);

    expect(result).toBe(fakeResult);
  });

  test('bytesToString should convert a polkadot Bytes object to a string', () => {
    const fakeResult = 'someBytes';
    const ticker = polkadotMockUtils.createMockBytes(fakeResult);

    const result = bytesToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToTicker and tickerToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToTicker should convert a string to a polkadot Ticker object', () => {
    const value = 'someTicker';
    const fakeResult = ('convertedTicker' as unknown) as Ticker;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Ticker', value)
      .returns(fakeResult);

    const result = stringToTicker(value, context);

    expect(result).toBe(fakeResult);
  });

  test('tickerToString should convert a polkadot Ticker object to a string', () => {
    const fakeResult = 'someTicker';
    const ticker = polkadotMockUtils.createMockTicker(fakeResult);

    const result = tickerToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToTokenName and tokenNameToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToTokenName should convert a string to a polkadot TokenName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as TokenName;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('TokenName', value)
      .returns(fakeResult);

    const result = stringToTokenName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('tokenNameToString should convert a polkadot TokenName object to a string', () => {
    const fakeResult = 'someTokenName';
    const tokenName = polkadotMockUtils.createMockTokenName(fakeResult);

    const result = tokenNameToString(tokenName);
    expect(result).toEqual(fakeResult);
  });
});

describe('booleanToBool and boolToBoolean', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('booleanToBool should convert a boolean to a polkadot bool object', () => {
    const value = true;
    const fakeResult = ('true' as unknown) as bool;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('bool', value)
      .returns(fakeResult);

    const result = booleanToBool(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('boolToBoolean should convert a polkadot bool object to a boolean', () => {
    const fakeResult = true;
    const mockBool = polkadotMockUtils.createMockBool(fakeResult);

    const result = boolToBoolean(mockBool);
    expect(result).toEqual(fakeResult);
  });
});

describe('dateToMoment and momentToDate', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('dateToMoment should convert a Date to a polkadot Moment object', () => {
    const value = new Date();
    const fakeResult = (10000 as unknown) as Moment;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Moment', Math.round(value.getTime()))
      .returns(fakeResult);

    const result = dateToMoment(value, context);

    expect(result).toBe(fakeResult);
  });

  test('momentToDate should convert a polkadot Moment object to a Date', () => {
    const fakeResult = 10000;
    const moment = polkadotMockUtils.createMockMoment(fakeResult);

    const result = momentToDate(moment);
    expect(result).toEqual(new Date(fakeResult));
  });
});

describe('tokenTypeToAssetType and assetTypeToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('tokenTypeToAssetType should convert a TokenType to a polkadot AssetType object', () => {
    const value = KnownTokenType.Commodity;
    const fakeResult = ('CommodityEnum' as unknown) as AssetType;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AssetType', value)
      .returns(fakeResult);

    const result = tokenTypeToAssetType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetTypeToString should convert a polkadot AssetType object to a string', () => {
    let fakeResult = KnownTokenType.Commodity;
    let assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    let result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Equity;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Debt;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.StructuredProduct;
    assetType = polkadotMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    const fakeType = 'otherType';
    assetType = polkadotMockUtils.createMockAssetType({
      Custom: polkadotMockUtils.createMockBytes(fakeType),
    });

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeType);
  });
});

describe('tokenIdentifierTypeToIdentifierType and identifierTypeToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('tokenIdentifierTypeToIdentifierType should convert a TokenIdentifierType to a polkadot IdentifierType object', () => {
    const value = TokenIdentifierType.Isin;
    const fakeResult = ('IsinEnum' as unknown) as IdentifierType;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('IdentifierType', value)
      .returns(fakeResult);

    const result = tokenIdentifierTypeToIdentifierType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('identifierTypeToString should convert a polkadot IdentifierType object to a string', () => {
    let fakeResult = TokenIdentifierType.Isin;
    let identifierType = polkadotMockUtils.createMockIdentifierType(fakeResult);

    let result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    fakeResult = TokenIdentifierType.Cusip;
    identifierType = polkadotMockUtils.createMockIdentifierType(fakeResult);

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    const fakeType = 'otherType';
    identifierType = polkadotMockUtils.createMockIdentifierType({
      Custom: polkadotMockUtils.createMockBytes(fakeType),
    });

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeType);
  });
});

describe('stringToAssetIdentifier and assetIdentifierToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToAssetIdentifier should convert a string to a polkadot AssetIdentifier object', () => {
    const value = 'someIdentifier';
    const fakeResult = ('convertedIdentifier' as unknown) as AssetIdentifier;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AssetIdentifier', value)
      .returns(fakeResult);

    const result = stringToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetIdentifierToString should convert a polkadot AssetIdentifier object to a string', () => {
    const fakeResult = 'someIdentifier';
    const identifierType = polkadotMockUtils.createMockAssetIdentifier(fakeResult);

    const result = assetIdentifierToString(identifierType);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToFundingRoundName and fundingRoundNameToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToFundingRoundName should convert a string to a polkadot FundingRoundName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as FundingRoundName;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('FundingRoundName', value)
      .returns(fakeResult);

    const result = stringToFundingRoundName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('fundingRoundNameToString should convert a polkadot FundingRoundName object to a string', () => {
    const fakeResult = 'someFundingRoundName';
    const roundName = polkadotMockUtils.createMockFundingRoundName(fakeResult);

    const result = fundingRoundNameToString(roundName);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentName and documentNameToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToDocumentName should convert a string to a polkadot DocumentName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as DocumentName;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentName', value)
      .returns(fakeResult);

    const result = stringToDocumentName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentNameToString should convert a polkadot DocumentName object to a string', () => {
    const fakeResult = 'someDocumentName';
    const docName = polkadotMockUtils.createMockDocumentName(fakeResult);

    const result = documentNameToString(docName);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentUri and documentUriToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToDocumentUri should convert a string to a polkadot DocumentUri object', () => {
    const value = 'someUri';
    const fakeResult = ('convertedUri' as unknown) as DocumentUri;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentUri', value)
      .returns(fakeResult);

    const result = stringToDocumentUri(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentUriToString should convert a polkadot DocumentUri object to a string', () => {
    const fakeResult = 'someDocumentUri';
    const docUri = polkadotMockUtils.createMockDocumentUri(fakeResult);

    const result = documentUriToString(docUri);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentHash and documentHashToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToDocumentHash should convert a string to a polkadot DocumentHash object', () => {
    const value = 'someHash';
    const fakeResult = ('convertedHash' as unknown) as DocumentHash;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentHash', value)
      .returns(fakeResult);

    const result = stringToDocumentHash(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentHashToString should convert a polkadot DocumentHash object to a string', () => {
    const fakeResult = 'someDocumentHash';
    const docHash = polkadotMockUtils.createMockDocumentHash(fakeResult);

    const result = documentHashToString(docHash);
    expect(result).toEqual(fakeResult);
  });
});

describe('tokenDocumentToDocument and documentToTokenDocument', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('tokenDocumentToDocument should convert a TokenDocument to a polkadot Document object', () => {
    const name = 'someName';
    const uri = 'someUri';
    const contentHash = 'someHash';
    const value = {
      name,
      uri,
      contentHash,
    };
    const fakeResult = ('convertedDocument' as unknown) as Document;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Document', {
        name: stringToDocumentName(name, context),
        uri: stringToDocumentUri(uri, context),
        // eslint-disable-next-line @typescript-eslint/camelcase
        content_hash: stringToDocumentHash(contentHash, context),
      })
      .returns(fakeResult);

    const result = tokenDocumentToDocument(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentToTokenDocument should convert a polkadot Document object to a TokenDocument', () => {
    const name = 'someName';
    const uri = 'someUri';
    const contentHash = 'someHash';
    const fakeResult = {
      name,
      uri,
      contentHash,
    };
    const mockDocument = {
      name: polkadotMockUtils.createMockDocumentName(name),
      uri: polkadotMockUtils.createMockDocumentUri(uri),
      // eslint-disable-next-line @typescript-eslint/camelcase
      content_hash: polkadotMockUtils.createMockDocumentHash(contentHash),
    };
    const doc = polkadotMockUtils.createMockDocument(mockDocument);

    const result = documentToTokenDocument(doc);
    expect(result).toEqual(fakeResult);
  });
});

describe('authTargetToAuthIdentifier and authIdentifierToAuthTarget', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('authTargetToAuthIdentifier should convert an AuthTarget to a polkadot AuthIdentifer object', () => {
    const did = 'someDid';
    const authId = new BigNumber(1);
    const value = {
      did,
      authId,
    };
    const fakeResult = ('convertedAuthIdentifier' as unknown) as AuthIdentifier;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AuthIdentifier', {
        // eslint-disable-next-line @typescript-eslint/camelcase
        auth_id: numberToU64(authId, context),
        signatory: signerToSignatory({ type: SignerType.Identity, value: did }, context),
      })
      .returns(fakeResult);

    const result = authTargetToAuthIdentifier(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('authIdentifierToAuthTarget should convert a polkadot AuthIdentifier object to an AuthTarget', () => {
    const did = 'someDid';
    const authId = new BigNumber(1);
    const fakeResult = {
      did,
      authId,
    };
    const authIdentifier = polkadotMockUtils.createMockAuthIdentifier({
      signatory: polkadotMockUtils.createMockSignatory({
        Identity: polkadotMockUtils.createMockIdentityId(did),
      }),
      // eslint-disable-next-line @typescript-eslint/camelcase
      auth_id: polkadotMockUtils.createMockU64(authId.toNumber()),
    });

    const result = authIdentifierToAuthTarget(authIdentifier);
    expect(result).toEqual(fakeResult);
  });
});

describe('unwrapValues', () => {
  test('should unwrap all Post Transaction Values in the array', async () => {
    const values = [1, 2, 3, 4, 5];
    const wrapped = values.map(value => new PostTransactionValue(async () => value));
    await Promise.all(wrapped.map(postValue => postValue.run({} as ISubmittableResult)));

    const unwrapped = unwrapValues(wrapped);

    expect(unwrapped).toEqual(values);
  });
});

describe('findEventRecord', () => {
  const findRecordStub = sinon.stub();
  const mockReceipt = ({
    findRecord: findRecordStub,
  } as unknown) as ISubmittableResult;

  afterEach(() => {
    findRecordStub.reset();
  });

  test('returns the corresponding Event Record', () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    const fakeResult = 'event';
    findRecordStub.withArgs(mod, eventName).returns(fakeResult);

    const eventRecord = findEventRecord(mockReceipt, mod, eventName);

    expect(eventRecord).toBe(fakeResult);
  });

  test("throws if the Event wasn't fired", () => {
    const mod = 'asset';
    const eventName = 'TickerRegistered';
    findRecordStub.withArgs(mod, eventName).returns(undefined);

    expect(() => findEventRecord(mockReceipt, mod, eventName)).toThrow(
      `Event "${mod}.${eventName}" wasnt't fired even though the corresponding transaction was completed. Please report this to the Polymath team`
    );
  });
});

describe('signerToSignatory and signatoryToSigner', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
    sinon.restore();
  });

  test('signerToSignatory should convert a Signer to a polkadot Signatory object', () => {
    const value = {
      type: SignerType.Identity,
      value: 'someIdentity',
    };
    const fakeResult = ('SignatoryEnum' as unknown) as Signatory;
    const context = polkadotMockUtils.getContextInstance();

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Signatory', { [value.type]: value.value })
      .returns(fakeResult);

    const result = signerToSignatory(value, context);

    expect(result).toBe(fakeResult);
  });

  test('signatoryToSigner should convert a polkadot Signatory object to a Signer', () => {
    let fakeResult = {
      type: SignerType.Identity,
      value: 'someIdentity',
    };
    let signatory = polkadotMockUtils.createMockSignatory({
      Identity: polkadotMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = signatoryToSigner(signatory);
    expect(result).toEqual(fakeResult);

    const accountKey = polkadotMockUtils.createMockAccountKey('someAccountKey');
    const encodedAddress = 'someEncodedAddress';

    fakeResult = {
      type: SignerType.AccountKey,
      value: encodedAddress,
    };
    signatory = polkadotMockUtils.createMockSignatory({
      AccountKey: accountKey,
    });

    sinon
      .stub(encodeAddressModule, 'default')
      .withArgs(accountKey)
      .returns(encodedAddress);

    result = signatoryToSigner(signatory);
    expect(result).toEqual(fakeResult);
  });
});

describe('authorizationToAuthorizationData and authorizationDataToAuthorization', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('authorizationToAuthorizationData should convert an Authorization to a polkadot AuthorizationData object', () => {
    const context = polkadotMockUtils.getContextInstance();
    let value: Authorization = {
      type: AuthorizationType.AttestMasterKeyRotation,
      value: 'someIdentity',
    };
    const fakeResult = ('AuthorizationDataEnum' as unknown) as AuthorizationData;

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AuthorizationData', { [value.type]: value.value })
      .returns(fakeResult);

    let result = authorizationToAuthorizationData(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: AuthorizationType.NoData,
    };

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('AuthorizationData', { [value.type]: null })
      .returns(fakeResult);

    result = authorizationToAuthorizationData(value, context);

    expect(result).toBe(fakeResult);
  });

  test('authorizationDataToAuthorization should convert a polkadot AuthorizationData object to an Authorization', () => {
    let fakeResult: Authorization = {
      type: AuthorizationType.AttestMasterKeyRotation,
      value: 'someIdentity',
    };
    let authorizationData = polkadotMockUtils.createMockAuthorizationData({
      AttestMasterKeyRotation: polkadotMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.RotateMasterKey,
      value: 'someIdentity',
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData({
      RotateMasterKey: polkadotMockUtils.createMockIdentityId(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferTicker,
      value: 'someTicker',
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData({
      TransferTicker: polkadotMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.AddMultiSigSigner,
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData('AddMultiSigSigner');

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferTokenOwnership,
      value: 'someTicker',
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData({
      TransferTokenOwnership: polkadotMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.JoinIdentity,
      value: 'someIdentity',
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData({
      JoinIdentity: polkadotMockUtils.createMockIdentityId(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.Custom,
      value: 'someBytes',
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData({
      custom: polkadotMockUtils.createMockBytes(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.NoData,
    };
    authorizationData = polkadotMockUtils.createMockAuthorizationData('NoData');

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToJurisdictionName and jurisdictionNameToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('stringToJurisdictionName should convert a string to a polkadot JurisdictionName object', () => {
    const context = polkadotMockUtils.getContextInstance();
    const value = 'someJurisdiction';
    const fakeResult = ('jurisdictionName' as unknown) as JurisdictionName;

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('JurisdictionName', value)
      .returns(fakeResult);

    const result = stringToJurisdictionName(value, context);

    expect(result).toBe(fakeResult);
  });

  test('jurisdictionNameToString should convert a polkadot JurisdictionName object to a string', () => {
    const fakeResult = 'someJurisdiction';
    const jurisdictionName = polkadotMockUtils.createMockJurisdictionName(fakeResult);

    const result = jurisdictionNameToString(jurisdictionName);
    expect(result).toEqual(fakeResult);
  });
});

describe('claimToMeshClaim and jurisdictionNameToString', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('claimToMeshClaim should convert a Claim to a polkadot Claim object', () => {
    const context = polkadotMockUtils.getContextInstance();
    let value: Claim = {
      type: ClaimType.Jurisdiction,
      name: 'someJurisdiction',
      scope: 'someTickerDid',
    };
    const fakeResult = ('meshClaim' as unknown) as MeshClaim;

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Claim', { [value.type]: [value.name, value.scope] })
      .returns(fakeResult);

    let result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.Whitelisted,
      scope: 'someTickerDid',
    };

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Claim', { [value.type]: value.scope })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.NoData,
    };

    polkadotMockUtils
      .getCreateTypeStub()
      .withArgs('Claim', { [value.type]: null })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);
  });

  test('meshClaimToClaim should convert a polkadot Claim object to a Claim', () => {
    let fakeResult: Claim = {
      type: ClaimType.Accredited,
      scope: 'someTickerDid',
    };

    let claim = polkadotMockUtils.createMockClaim({
      Accredited: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    let result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Affiliate,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      Affiliate: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Blacklisted,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      Blacklisted: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.BuyLockup,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      BuyLockup: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.CustomerDueDiligence,
    };
    claim = polkadotMockUtils.createMockClaim('CustomerDueDiligence');

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Jurisdiction,
      name: 'someJurisdiction',
      scope: 'someIdentity',
    };

    claim = polkadotMockUtils.createMockClaim({
      Jurisdiction: [
        polkadotMockUtils.createMockJurisdictionName(fakeResult.name),
        polkadotMockUtils.createMockScope(fakeResult.scope),
      ],
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.KnowYourCustomer,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      KnowYourCustomer: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.NoData,
    };
    claim = polkadotMockUtils.createMockClaim('NoData');

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.SellLockup,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      SellLockup: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Whitelisted,
      scope: 'someIdentity',
    };
    claim = polkadotMockUtils.createMockClaim({
      Whitelisted: polkadotMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);
  });
});

describe('ruleToAssetTransferRule and assetTransferRuleToRule', () => {
  beforeAll(() => {
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('ruleToAssetTransferRule should convert a Rule to a polkadot AssetTransferRule object', () => {
    const conditions: Condition[] = [
      {
        type: ConditionType.IsPresent,
        target: ConditionTarget.Both,
        claim: {
          type: ClaimType.Whitelisted,
          scope: 'someTickerDid',
        },
        trustedClaimIssuers: ['someDid', 'otherDid'],
      },
      {
        type: ConditionType.IsNoneOf,
        target: ConditionTarget.Sender,
        claims: [
          {
            type: ClaimType.Blacklisted,
            scope: 'someTickerDid',
          },
          {
            type: ClaimType.SellLockup,
            scope: 'someTickerDid',
          },
        ],
      },
      {
        type: ConditionType.IsAbsent,
        target: ConditionTarget.Receiver,
        claim: {
          type: ClaimType.Jurisdiction,
          scope: 'someTickerDid',
          name: 'someJurisdiction',
        },
      },
    ];
    const value = {
      conditions,
      id: 1,
    };
    const fakeResult = ('convertedAssetTransferRule' as unknown) as AssetTransferRule;
    const context = polkadotMockUtils.getContextInstance();

    const createTypeStub = polkadotMockUtils.getCreateTypeStub();

    conditions.forEach(({ type }, index) => {
      createTypeStub
        .withArgs(
          'Rule',
          sinon.match({
            // eslint-disable-next-line @typescript-eslint/camelcase
            rule_type: sinon.match.has(type),
          })
        )
        .returns(`meshRule${index}${type}`);
    });

    createTypeStub
      .withArgs('AssetTransferRule', {
        /* eslint-disable @typescript-eslint/camelcase */
        sender_rules: ['meshRule0IsPresent', 'meshRule1IsNoneOf'],
        receiver_rules: ['meshRule0IsPresent', 'meshRule2IsAbsent'],
        rule_id: numberToU32(value.id, context),
        /* eslint-enable @typescript-eslint/camelcase */
      })
      .returns(fakeResult);

    const result = ruleToAssetTransferRule(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('assetTransferRuleToRule should convert a polkadot AssetTransferRule object to a Rule', () => {
    const id = 1;
    const tokenDid = 'someTokenDid';
    const issuerDids = ['someDid', 'otherDid'];
    const conditions: Condition[] = [
      {
        type: ConditionType.IsPresent,
        target: ConditionTarget.Both,
        claim: {
          type: ClaimType.KnowYourCustomer,
          scope: tokenDid,
        },
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsAbsent,
        target: ConditionTarget.Receiver,
        claim: {
          type: ClaimType.BuyLockup,
          scope: tokenDid,
        },
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsNoneOf,
        target: ConditionTarget.Sender,
        claims: [
          {
            type: ClaimType.Blacklisted,
            scope: tokenDid,
          },
          {
            type: ClaimType.SellLockup,
            scope: tokenDid,
          },
        ],
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsAnyOf,
        target: ConditionTarget.Both,
        claims: [
          {
            type: ClaimType.Whitelisted,
            scope: tokenDid,
          },
          {
            type: ClaimType.CustomerDueDiligence,
          },
        ],
        trustedClaimIssuers: issuerDids,
      },
    ];
    const fakeResult = {
      id,
      conditions,
    };

    const scope = polkadotMockUtils.createMockScope(tokenDid);
    const issuers = issuerDids.map(polkadotMockUtils.createMockIdentityId);
    const rules = [
      /* eslint-disable @typescript-eslint/camelcase */
      polkadotMockUtils.createMockRule({
        rule_type: polkadotMockUtils.createMockRuleType({
          IsPresent: polkadotMockUtils.createMockClaim({ KnowYourCustomer: scope }),
        }),
        issuers,
      }),
      polkadotMockUtils.createMockRule({
        rule_type: polkadotMockUtils.createMockRuleType({
          IsAbsent: polkadotMockUtils.createMockClaim({ BuyLockup: scope }),
        }),
        issuers,
      }),
      polkadotMockUtils.createMockRule({
        rule_type: polkadotMockUtils.createMockRuleType({
          IsNoneOf: [
            polkadotMockUtils.createMockClaim({ Blacklisted: scope }),
            polkadotMockUtils.createMockClaim({ SellLockup: scope }),
          ],
        }),
        issuers,
      }),
      polkadotMockUtils.createMockRule({
        rule_type: polkadotMockUtils.createMockRuleType({
          IsAnyOf: [
            polkadotMockUtils.createMockClaim({ Whitelisted: scope }),
            polkadotMockUtils.createMockClaim('CustomerDueDiligence'),
          ],
        }),
        issuers,
      }),
    ];
    const assetTransferRule = polkadotMockUtils.createMockAssetTransferRule({
      sender_rules: [rules[0], rules[2], rules[3]],
      receiver_rules: [rules[0], rules[1], rules[3]],
      rule_id: polkadotMockUtils.createMockU32(1),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    const result = assetTransferRuleToRule(assetTransferRule);
    expect(result.conditions).toEqual(expect.arrayContaining(fakeResult.conditions));
  });
});
