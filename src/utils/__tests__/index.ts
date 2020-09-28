import { bool, Bytes, u64 } from '@polkadot/types';
import { AccountId, Balance, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import { ComplianceRequirement, Memo, PipId, PortfolioId } from 'polymesh-types/polymesh';
import {
  AssetIdentifier,
  AssetName,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  Claim as MeshClaim,
  DocumentHash,
  DocumentName,
  DocumentUri,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  Permission as MeshPermission,
  PortfolioKind as MeshPortfolioKind,
  ProtocolOp,
  Signatory,
  Ticker,
  TxTags,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Identity } from '~/api/entities';
import { ProposalState } from '~/api/entities/Proposal/types';
import { Context, PostTransactionValue } from '~/base';
import { CallIdEnum, ClaimTypeEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  Authorization,
  AuthorizationType,
  Claim,
  ClaimType,
  Condition,
  ConditionTarget,
  ConditionType,
  CountryCode,
  KnownPortfolioKind,
  KnownTokenType,
  Permission,
  Signer,
  TokenIdentifierType,
  TransferStatus,
} from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import { tuple } from '~/types/utils';
import { MAX_BATCH_ELEMENTS, MAX_TICKER_LENGTH } from '~/utils/constants';

import {
  accountIdToString,
  addressToKey,
  assetComplianceResultToRequirementCompliance,
  assetIdentifierToString,
  assetNameToString,
  assetTypeToString,
  authIdentifierToAuthTarget,
  authorizationDataToAuthorization,
  authorizationToAuthorizationData,
  authorizationTypeToMeshAuthorizationType,
  authTargetToAuthIdentifier,
  balanceToBigNumber,
  batchArguments,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  calculateNextKey,
  canTransferResultToTransferStatus,
  cddStatusToBoolean,
  claimToMeshClaim,
  complianceRequirementToRequirement,
  createClaim,
  dateToMoment,
  delay,
  documentHashToString,
  documentNameToString,
  documentToTokenDocumentData,
  documentUriToString,
  extrinsicIdentifierToTxTag,
  findEventRecord,
  fundingRoundNameToString,
  identifierTypeToString,
  identityIdToString,
  keyToAddress,
  meshClaimToClaim,
  meshPermissionToPermission,
  meshProposalStateToProposalState,
  middlewareProposalToProposalDetails,
  moduleAddressToString,
  momentToDate,
  numberToBalance,
  numberToPipId,
  numberToU32,
  numberToU64,
  padString,
  permissionToMeshPermission,
  portfolioIdToMeshPortfolioId,
  portfolioKindToMeshPortfolioKind,
  posRatioToBigNumber,
  removePadding,
  requestAtBlock,
  requestPaginated,
  requirementToComplianceRequirement,
  secondaryKeyToMeshSecondaryKey,
  serialize,
  signatoryToSignerValue,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
  signerValueToSigner,
  stringToAccountId,
  stringToAssetIdentifier,
  stringToAssetName,
  stringToBytes,
  stringToDocumentHash,
  stringToDocumentName,
  stringToDocumentUri,
  stringToFundingRoundName,
  stringToIdentityId,
  stringToMemo,
  stringToText,
  stringToTicker,
  textToString,
  tickerToDid,
  tickerToString,
  toIdentityWithClaimsArray,
  tokenDocumentDataToDocument,
  tokenIdentifierTypeToIdentifierType,
  tokenTypeToAssetType,
  transactionHexToTxTag,
  txTagToExtrinsicIdentifier,
  txTagToProtocolOp,
  u8ToTransferStatus,
  u64ToBigNumber,
  unserialize,
  unwrapValues,
} from '../';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);
jest.mock(
  '~/base/Context',
  require('~/testUtils/mocks/dataSources').mockContextModule('~/base/Context')
);

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

describe('moduleAddressToString', () => {
  test('should convert a module address to a string', () => {
    const moduleAddress = 'someModuleName';

    const result = moduleAddressToString(moduleAddress);
    expect(result).toBe('5Eg4TucMsdiyc9LjA3BT7VXioUqMoQ4vLn1VSUDsYsiJMdbN');
  });
});

describe('keyToAddress and addressToKey', () => {
  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const publicKey = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';

  test('addressToKey should decode an address into a public key', () => {
    const result = addressToKey(address);

    expect(result).toBe(publicKey);
  });

  test('keyToAddress should encode a public key into an address', () => {
    const result = keyToAddress(publicKey);

    expect(result).toBe(address);
  });
});

describe('stringToIdentityId and identityIdToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToIdentityId should convert a did string into an IdentityId', () => {
    const identity = 'IdentityObject';
    const fakeResult = ('type' as unknown) as IdentityId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('IdentityId', identity)
      .returns(fakeResult);

    const result = stringToIdentityId(identity, context);

    expect(result).toBe(fakeResult);
  });

  test('identityIdToString should convert an IdentityId to a did string', () => {
    const fakeResult = 'IdentityString';
    const identityId = dsMockUtils.createMockIdentityId(fakeResult);

    const result = identityIdToString(identityId);
    expect(result).toBe(fakeResult);
  });
});

describe('portfolioKindToMeshPortfolioKind', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('portfolioKindToMeshPortfolioKind should convert a portfolio kind object into a polkadot portfolio kind', () => {
    const portfolioKind = KnownPortfolioKind.Default;
    const fakeResult = ('PortfolioKind' as unknown) as MeshPortfolioKind;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('PortfolioKind', portfolioKind)
      .returns(fakeResult);

    const result = portfolioKindToMeshPortfolioKind(portfolioKind, context);

    expect(result).toBe(fakeResult);
  });
});

describe('portfolioIdToMeshPortfolioId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('portfolioIdToMeshPortfolioId should convert a portfolio id into a polkadot portfolio id', () => {
    const portfolioId = {
      did: dsMockUtils.createMockIdentityId(),
      kind: KnownPortfolioKind.Default,
    };
    const fakeResult = ('PortfolioId' as unknown) as PortfolioId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('PortfolioId', portfolioId)
      .returns(fakeResult);

    const result = portfolioIdToMeshPortfolioId(portfolioId, context);

    expect(result).toBe(fakeResult);
  });
});

describe('signerToString', () => {
  test('signerToString should return the Indentity DID string', () => {
    const did = 'someDid';
    const context = dsMockUtils.getContextInstance();
    const identity = new Identity({ did }, context);

    const result = signerToString(identity);

    expect(result).toBe(did);
  });

  test('signerToStrings should return the Account address string', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const context = dsMockUtils.getContextInstance();

    const account = new Account({ address }, context);

    const result = signerToString(account);

    expect(result).toBe(address);
  });

  test('signerToStrings should return the same address string that it receives', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const result = signerToString(address);

    expect(result).toBe(address);
  });
});

describe('numberToBalance and balanceToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('numberToBalance should convert a number to a polkadot Balance object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
      .returns(fakeResult);

    const result = numberToBalance(value, context);

    expect(result).toBe(fakeResult);
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = dsMockUtils.createMockBalance(fakeResult);

    const result = balanceToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult).div(Math.pow(10, 6)));
  });
});

describe('stringToMemo', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToMemo should convert a string to a polkadot Memo object', () => {
    const value = 'someDescription';
    const fakeResult = ('memoDescription' as unknown) as Memo;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Memo', value)
      .returns(fakeResult);

    const result = stringToMemo(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('posRatioToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('posRatioToBigNumber should convert a polkadot PosRatio object to a BigNumber', () => {
    const numerator = 1;
    const denominator = 1;
    const balance = dsMockUtils.createMockPosRatio(numerator, denominator);

    const result = posRatioToBigNumber(balance);
    expect(result).toEqual(new BigNumber(numerator).dividedBy(new BigNumber(denominator)));
  });
});

describe('numberToU64 and u64ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('numberToU64 should convert a number to a polkadot u64 object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as u64;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('u64', value.toString())
      .returns(fakeResult);

    const result = numberToU64(value, context);

    expect(result).toBe(fakeResult);
  });

  test('u64ToBigNumber should convert a polkadot u64 object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = dsMockUtils.createMockBalance(fakeResult);

    const result = u64ToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult));
  });
});

describe('stringToBytes and bytesToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToBytes should convert a string to a polkadot Bytes object', () => {
    const value = 'someBytes';
    const fakeResult = ('convertedBytes' as unknown) as Bytes;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Bytes', value)
      .returns(fakeResult);

    const result = stringToBytes(value, context);

    expect(result).toBe(fakeResult);
  });

  test('bytesToString should convert a polkadot Bytes object to a string', () => {
    const fakeResult = 'someBytes';
    const ticker = dsMockUtils.createMockBytes(fakeResult);

    const result = bytesToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToTicker and tickerToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToTicker should convert a string to a polkadot Ticker object', () => {
    const value = 'someTicker';
    const fakeResult = ('convertedTicker' as unknown) as Ticker;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Ticker', value)
      .returns(fakeResult);

    const result = stringToTicker(value, context);

    expect(result).toBe(fakeResult);
  });

  test('stringToTicker should throw an error if the string length exceeds the max ticker length', () => {
    const value = 'veryLongTickr';
    const context = dsMockUtils.getContextInstance();

    expect(() => stringToTicker(value, context)).toThrow(
      `Ticker length cannot exceed ${MAX_TICKER_LENGTH} characters`
    );
  });

  test('tickerToString should convert a polkadot Ticker object to a string', () => {
    const fakeResult = 'someTicker';
    const ticker = dsMockUtils.createMockTicker(fakeResult);

    const result = tickerToString(ticker);
    expect(result).toEqual(fakeResult);
  });
});

describe('numberToPipId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('numberToPipId should convert a number to a polkadot pipId object', () => {
    const value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as PipId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('PipId', value.toString())
      .returns(fakeResult);

    const result = numberToPipId(value, context);

    expect(result).toBe(fakeResult);
  });
});

describe('stringToText and textToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToText should convert a string to a polkadot Text object', () => {
    const value = 'someText';
    const fakeResult = ('convertedText' as unknown) as Text;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Text', value)
      .returns(fakeResult);

    const result = stringToText(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('textToString should convert polkadot Text object to string', () => {
    const text = 'someText';
    const mockText = dsMockUtils.createMockText(text);

    const result = textToString(mockText);
    expect(result).toEqual(text);
  });
});

describe('stringToAssetName and assetNameToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToAssetName should convert a string to a polkadot AssetName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as AssetName;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetName', value)
      .returns(fakeResult);

    const result = stringToAssetName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('assetNameToString should convert a polkadot AssetName object to a string', () => {
    const fakeResult = 'someAssetName';
    const assetName = dsMockUtils.createMockAssetName(fakeResult);

    const result = assetNameToString(assetName);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToAccountId and accountIdToSting', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToAccountId should convert a string to a polkadot AccountId object', () => {
    const value = 'someAccountId';
    const fakeResult = ('convertedAccountId' as unknown) as AccountId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AccountId', value)
      .returns(fakeResult);

    const result = stringToAccountId(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('accountIdToSting should convert a polkadot AccountId object to a string', () => {
    const fakeResult = 'someAccountId';
    const accountId = dsMockUtils.createMockAccountId(fakeResult);

    const result = accountIdToString(accountId);
    expect(result).toEqual(fakeResult);
  });
});

describe('booleanToBool and boolToBoolean', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('booleanToBool should convert a boolean to a polkadot bool object', () => {
    const value = true;
    const fakeResult = ('true' as unknown) as bool;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('bool', value)
      .returns(fakeResult);

    const result = booleanToBool(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('boolToBoolean should convert a polkadot bool object to a boolean', () => {
    const fakeResult = true;
    const mockBool = dsMockUtils.createMockBool(fakeResult);

    const result = boolToBoolean(mockBool);
    expect(result).toEqual(fakeResult);
  });
});

describe('dateToMoment and momentToDate', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('dateToMoment should convert a Date to a polkadot Moment object', () => {
    const value = new Date();
    const fakeResult = (10000 as unknown) as Moment;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Moment', Math.round(value.getTime()))
      .returns(fakeResult);

    const result = dateToMoment(value, context);

    expect(result).toBe(fakeResult);
  });

  test('momentToDate should convert a polkadot Moment object to a Date', () => {
    const fakeResult = 10000;
    const moment = dsMockUtils.createMockMoment(fakeResult);

    const result = momentToDate(moment);
    expect(result).toEqual(new Date(fakeResult));
  });
});

describe('tokenTypeToAssetType and assetTypeToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('tokenTypeToAssetType should convert a TokenType to a polkadot AssetType object', () => {
    const value = KnownTokenType.Commodity;
    const fakeResult = ('CommodityEnum' as unknown) as AssetType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetType', value)
      .returns(fakeResult);

    const result = tokenTypeToAssetType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetTypeToString should convert a polkadot AssetType object to a string', () => {
    let fakeResult = KnownTokenType.Commodity;
    let assetType = dsMockUtils.createMockAssetType(fakeResult);

    let result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.EquityCommon;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.EquityPreferred;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Commodity;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.FixedIncome;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Reit;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Fund;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.RevenueShareAgreement;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.StructuredProduct;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    fakeResult = KnownTokenType.Derivative;
    assetType = dsMockUtils.createMockAssetType(fakeResult);

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeResult);

    const fakeType = 'otherType';
    assetType = dsMockUtils.createMockAssetType({
      Custom: dsMockUtils.createMockBytes(fakeType),
    });

    result = assetTypeToString(assetType);
    expect(result).toEqual(fakeType);
  });
});

describe('tokenIdentifierTypeToIdentifierType and identifierTypeToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('tokenIdentifierTypeToIdentifierType should convert a TokenIdentifierType to a polkadot IdentifierType object', () => {
    const value = TokenIdentifierType.Isin;
    const fakeResult = ('IsinEnum' as unknown) as IdentifierType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('IdentifierType', value)
      .returns(fakeResult);

    const result = tokenIdentifierTypeToIdentifierType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('identifierTypeToString should convert a polkadot IdentifierType object to a string', () => {
    let fakeResult = TokenIdentifierType.Isin;
    let identifierType = dsMockUtils.createMockIdentifierType(fakeResult);

    let result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    fakeResult = TokenIdentifierType.Cusip;
    identifierType = dsMockUtils.createMockIdentifierType(fakeResult);

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    fakeResult = TokenIdentifierType.Cins;
    identifierType = dsMockUtils.createMockIdentifierType(fakeResult);

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);

    fakeResult = TokenIdentifierType.Dti;
    identifierType = dsMockUtils.createMockIdentifierType(fakeResult);

    result = identifierTypeToString(identifierType);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToAssetIdentifier and assetIdentifierToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToAssetIdentifier should convert a string to a polkadot AssetIdentifier object', () => {
    const value = 'someIdentifier';
    const fakeResult = ('convertedIdentifier' as unknown) as AssetIdentifier;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetIdentifier', value)
      .returns(fakeResult);

    const result = stringToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);
  });

  test('assetIdentifierToString should convert a polkadot AssetIdentifier object to a string', () => {
    const fakeResult = 'someIdentifier';
    const identifierType = dsMockUtils.createMockAssetIdentifier(fakeResult);

    const result = assetIdentifierToString(identifierType);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToFundingRoundName and fundingRoundNameToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToFundingRoundName should convert a string to a polkadot FundingRoundName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as FundingRoundName;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('FundingRoundName', value)
      .returns(fakeResult);

    const result = stringToFundingRoundName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('fundingRoundNameToString should convert a polkadot FundingRoundName object to a string', () => {
    const fakeResult = 'someFundingRoundName';
    const roundName = dsMockUtils.createMockFundingRoundName(fakeResult);

    const result = fundingRoundNameToString(roundName);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentName and documentNameToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToDocumentName should convert a string to a polkadot DocumentName object', () => {
    const value = 'someName';
    const fakeResult = ('convertedName' as unknown) as DocumentName;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentName', value)
      .returns(fakeResult);

    const result = stringToDocumentName(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentNameToString should convert a polkadot DocumentName object to a string', () => {
    const fakeResult = 'someDocumentName';
    const docName = dsMockUtils.createMockDocumentName(fakeResult);

    const result = documentNameToString(docName);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentUri and documentUriToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToDocumentUri should convert a string to a polkadot DocumentUri object', () => {
    const value = 'someUri';
    const fakeResult = ('convertedUri' as unknown) as DocumentUri;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentUri', value)
      .returns(fakeResult);

    const result = stringToDocumentUri(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentUriToString should convert a polkadot DocumentUri object to a string', () => {
    const fakeResult = 'someDocumentUri';
    const docUri = dsMockUtils.createMockDocumentUri(fakeResult);

    const result = documentUriToString(docUri);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToDocumentHash and documentHashToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToDocumentHash should convert a string to a polkadot DocumentHash object', () => {
    const value = 'someHash';
    const fakeResult = ('convertedHash' as unknown) as DocumentHash;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentHash', value)
      .returns(fakeResult);

    const result = stringToDocumentHash(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentHashToString should convert a polkadot DocumentHash object to a string', () => {
    const fakeResult = 'someDocumentHash';
    const docHash = dsMockUtils.createMockDocumentHash(fakeResult);

    const result = documentHashToString(docHash);
    expect(result).toEqual(fakeResult);
  });
});

describe('tokenDocumentDataToDocument and documentToTokenDocumentData', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('tokenDocumentDataToDocument should convert a TokenDocumentData object to a polkadot Document object', () => {
    const uri = 'someUri';
    const contentHash = 'someHash';
    const value = {
      uri,
      contentHash,
    };
    const fakeResult = ('convertedDocument' as unknown) as Document;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Document', {
        uri: stringToDocumentUri(uri, context),
        // eslint-disable-next-line @typescript-eslint/camelcase
        content_hash: stringToDocumentHash(contentHash, context),
      })
      .returns(fakeResult);

    const result = tokenDocumentDataToDocument(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentToTokenDocumentData should convert a polkadot Document object to a TokenDocumentData object', () => {
    const uri = 'someUri';
    const contentHash = 'someHash';
    const fakeResult = {
      uri,
      contentHash,
    };
    const mockDocument = {
      uri: dsMockUtils.createMockDocumentUri(uri),
      // eslint-disable-next-line @typescript-eslint/camelcase
      content_hash: dsMockUtils.createMockDocumentHash(contentHash),
    };
    const doc = dsMockUtils.createMockDocument(mockDocument);

    const result = documentToTokenDocumentData(doc);
    expect(result).toEqual(fakeResult);
  });
});

describe('authTargetToAuthIdentifier and authIdentifierToAuthTarget', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('authTargetToAuthIdentifier should convert an AuthTarget to a polkadot AuthIdentifer object', () => {
    const target = { type: SignerType.Identity, value: 'someDid' };
    const authId = new BigNumber(1);
    const value = {
      target,
      authId,
    };
    const fakeResult = ('convertedAuthIdentifier' as unknown) as AuthIdentifier;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AuthIdentifier', {
        // eslint-disable-next-line @typescript-eslint/camelcase
        auth_id: numberToU64(authId, context),
        signatory: signerValueToSignatory(target, context),
      })
      .returns(fakeResult);

    const result = authTargetToAuthIdentifier(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('authIdentifierToAuthTarget should convert a polkadot AuthIdentifier object to an AuthTarget', () => {
    const target = { type: SignerType.Identity, value: 'someDid' };
    const authId = new BigNumber(1);
    const fakeResult = {
      target,
      authId,
    };
    const authIdentifier = dsMockUtils.createMockAuthIdentifier({
      signatory: dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(target.value),
      }),
      // eslint-disable-next-line @typescript-eslint/camelcase
      auth_id: dsMockUtils.createMockU64(authId.toNumber()),
    });

    const result = authIdentifierToAuthTarget(authIdentifier);
    expect(result).toEqual(fakeResult);
  });
});

describe('cddStatusToBoolean', () => {
  test('cddStatusToBoolean should convert a valid CDD status to a true boolean', async () => {
    const cddStatusMock = dsMockUtils.createMockCddStatus({
      Ok: dsMockUtils.createMockIdentityId(),
    });
    const result = cddStatusToBoolean(cddStatusMock);

    expect(result).toEqual(true);
  });

  test('cddStatusToBoolean should convert an invalid CDD status to a false boolean', async () => {
    const cddStatusMock = dsMockUtils.createMockCddStatus();
    const result = cddStatusToBoolean(cddStatusMock);

    expect(result).toEqual(false);
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
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    sinon.restore();
  });

  test('signerToSignatory should convert a Signer to a polkadot Signatory object', () => {
    const value = {
      type: SignerType.Identity,
      value: 'someIdentity',
    };
    const fakeResult = ('SignatoryEnum' as unknown) as Signatory;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Signatory', { [value.type]: value.value })
      .returns(fakeResult);

    const result = signerValueToSignatory(value, context);

    expect(result).toBe(fakeResult);
  });

  test('signatoryToSigner should convert a polkadot Signatory object to a Signer', () => {
    let fakeResult = {
      type: SignerType.Identity,
      value: 'someIdentity',
    };
    let signatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = signatoryToSignerValue(signatory);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: SignerType.Account,
      value: 'someAccountId',
    };
    signatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(fakeResult.value),
    });

    result = signatoryToSignerValue(signatory);
    expect(result).toEqual(fakeResult);
  });
});

describe('signerToSignerValue and signerValueToSigner', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    sinon.restore();
  });

  test('signerToSignerValue should convert a Signer to a SignerValue', () => {
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    let signer: Signer = new Account({ address }, context);

    let result = signerToSignerValue(signer);

    expect(result).toEqual({
      type: SignerType.Account,
      value: address,
    });

    const did = 'someDid';
    signer = new Identity({ did }, context);

    result = signerToSignerValue(signer);

    expect(result).toEqual({ type: SignerType.Identity, value: did });
  });

  test('signerValueToSigner should convert a SignerValue to a Signer', () => {
    let value = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    let signerValue: SignerValue = { type: SignerType.Account, value };

    let result = signerValueToSigner(signerValue, context);

    expect((result as Account).address).toBe(value);

    value = 'someDid';
    signerValue = { type: SignerType.Identity, value };

    result = signerValueToSigner(signerValue, context);

    expect((result as Identity).did).toBe(value);
  });
});

describe('authorizationToAuthorizationData and authorizationDataToAuthorization', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('authorizationToAuthorizationData should convert an Authorization to a polkadot AuthorizationData object', () => {
    const context = dsMockUtils.getContextInstance();
    let value: Authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: 'someIdentity',
    };
    const fakeResult = ('AuthorizationDataEnum' as unknown) as AuthorizationData;

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AuthorizationData', { [value.type]: value.value })
      .returns(fakeResult);

    let result = authorizationToAuthorizationData(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: AuthorizationType.NoData,
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AuthorizationData', { [value.type]: null })
      .returns(fakeResult);

    result = authorizationToAuthorizationData(value, context);

    expect(result).toBe(fakeResult);
  });

  test('authorizationDataToAuthorization should convert a polkadot AuthorizationData object to an Authorization', () => {
    let fakeResult: Authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: 'someIdentity',
    };
    let authorizationData = dsMockUtils.createMockAuthorizationData({
      AttestPrimaryKeyRotation: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.RotatePrimaryKey,
      value: 'someIdentity',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      RotatePrimaryKey: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferTicker,
      value: 'someTicker',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      TransferTicker: dsMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.AddMultiSigSigner,
    };
    authorizationData = dsMockUtils.createMockAuthorizationData('AddMultiSigSigner');

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferAssetOwnership,
      value: 'someTicker',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      TransferAssetOwnership: dsMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.JoinIdentity,
      value: [Permission.Operator],
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      JoinIdentity: [dsMockUtils.createMockPermission('Operator')],
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.Custom,
      value: 'someBytes',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      custom: dsMockUtils.createMockBytes(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.NoData,
    };
    authorizationData = dsMockUtils.createMockAuthorizationData('NoData');

    result = authorizationDataToAuthorization(authorizationData);
    expect(result).toEqual(fakeResult);
  });
});

describe('claimToMeshClaim and meshClaimToClaim', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('claimToMeshClaim should convert a Claim to a polkadot Claim object', () => {
    const context = dsMockUtils.getContextInstance();
    let value: Claim = {
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope: 'someTickerDid',
    };
    const fakeResult = ('meshClaim' as unknown) as MeshClaim;

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Claim', { [value.type]: [value.code, value.scope] })
      .returns(fakeResult);

    let result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.Exempted,
      scope: 'someTickerDid',
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Claim', { [value.type]: value.scope })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.NoData,
    };

    dsMockUtils
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

    let claim = dsMockUtils.createMockClaim({
      Accredited: dsMockUtils.createMockScope(fakeResult.scope),
    });

    let result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Affiliate,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      Affiliate: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Blocked,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      Blocked: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.BuyLockup,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      BuyLockup: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.CustomerDueDiligence,
    };
    claim = dsMockUtils.createMockClaim('CustomerDueDiligence');

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope: 'someIdentity',
    };

    claim = dsMockUtils.createMockClaim({
      Jurisdiction: [
        dsMockUtils.createMockCountryCode(fakeResult.code),
        dsMockUtils.createMockScope(fakeResult.scope),
      ],
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.KnowYourCustomer,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      KnowYourCustomer: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.NoData,
    };
    claim = dsMockUtils.createMockClaim('NoData');

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.SellLockup,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      SellLockup: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Exempted,
      scope: 'someIdentity',
    };
    claim = dsMockUtils.createMockClaim({
      Exempted: dsMockUtils.createMockScope(fakeResult.scope),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);
  });
});

describe('createClaim', () => {
  test('', () => {
    let type = 'Jurisdiction';
    const jurisdiction = CountryCode.Cl;
    let scope = 'someScope';

    let result = createClaim(type, jurisdiction, scope);
    expect(result).toEqual({
      type: ClaimType.Jurisdiction,
      code: jurisdiction,
      scope,
    });

    type = 'BuyLockup';
    scope = 'someScope';

    result = createClaim(type, null, scope);
    expect(result).toEqual({
      type: ClaimType.BuyLockup,
      scope,
    });

    type = 'NoData';

    result = createClaim(type, null, null);
    expect(result).toEqual({
      type: ClaimType.NoData,
    });
  });
});

describe('requirementToComplianceRequirement and complianceRequirementToRequirement', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('requirementToComplianceRequirement should convert a Requirement to a polkadot ComplianceRequirement object', () => {
    const conditions: Condition[] = [
      {
        type: ConditionType.IsPresent,
        target: ConditionTarget.Both,
        claim: {
          type: ClaimType.Exempted,
          scope: 'someTickerDid',
        },
        trustedClaimIssuers: ['someDid', 'otherDid'],
      },
      {
        type: ConditionType.IsNoneOf,
        target: ConditionTarget.Sender,
        claims: [
          {
            type: ClaimType.Blocked,
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
          code: CountryCode.Cl,
        },
      },
    ];
    const value = {
      conditions,
      id: 1,
    };
    const fakeResult = ('convertedComplianceRequirement' as unknown) as ComplianceRequirement;
    const context = dsMockUtils.getContextInstance();

    const createTypeStub = dsMockUtils.getCreateTypeStub();

    conditions.forEach(({ type }, index) => {
      createTypeStub
        .withArgs(
          'Condition',
          sinon.match({
            // eslint-disable-next-line @typescript-eslint/camelcase
            condition_type: sinon.match.has(type),
          })
        )
        .returns(`meshCondition${index}${type}`);
    });

    createTypeStub
      .withArgs('ComplianceRequirement', {
        /* eslint-disable @typescript-eslint/camelcase */
        sender_conditions: ['meshCondition0IsPresent', 'meshCondition1IsNoneOf'],
        receiver_conditions: ['meshCondition0IsPresent', 'meshCondition2IsAbsent'],
        id: numberToU32(value.id, context),
        /* eslint-enable @typescript-eslint/camelcase */
      })
      .returns(fakeResult);

    const result = requirementToComplianceRequirement(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('complianceRequirementToRequirement should convert a polkadot Compliance Requirement object to a Requirement', () => {
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
            type: ClaimType.Blocked,
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
            type: ClaimType.Exempted,
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

    const scope = dsMockUtils.createMockScope(tokenDid);
    const issuers = issuerDids.map(dsMockUtils.createMockIdentityId);
    const rawConditions = [
      /* eslint-disable @typescript-eslint/camelcase */
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsNoneOf: [
            dsMockUtils.createMockClaim({ Blocked: scope }),
            dsMockUtils.createMockClaim({ SellLockup: scope }),
          ],
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsAnyOf: [
            dsMockUtils.createMockClaim({ Exempted: scope }),
            dsMockUtils.createMockClaim('CustomerDueDiligence'),
          ],
        }),
        issuers,
      }),
    ];
    const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
      sender_conditions: [rawConditions[0], rawConditions[2], rawConditions[3]],
      receiver_conditions: [rawConditions[0], rawConditions[1], rawConditions[3]],
      id: dsMockUtils.createMockU32(1),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    const result = complianceRequirementToRequirement(complianceRequirement);
    expect(result.conditions).toEqual(expect.arrayContaining(fakeResult.conditions));
  });
});

describe('assetComplianceResultToRequirementCompliance', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('assetComplianceResultToRequirementCompliance should convert a polkadot AssetComplianceResult object to a RequirementCompliance', () => {
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
            type: ClaimType.Blocked,
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
            type: ClaimType.Exempted,
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

    const scope = dsMockUtils.createMockScope(tokenDid);
    const issuers = issuerDids.map(dsMockUtils.createMockIdentityId);
    const rawConditions = [
      /* eslint-disable @typescript-eslint/camelcase */
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsNoneOf: [
            dsMockUtils.createMockClaim({ Blocked: scope }),
            dsMockUtils.createMockClaim({ SellLockup: scope }),
          ],
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsAnyOf: [
            dsMockUtils.createMockClaim({ Exempted: scope }),
            dsMockUtils.createMockClaim('CustomerDueDiligence'),
          ],
        }),
        issuers,
      }),
    ];
    const assetComplianceResult = dsMockUtils.createMockAssetComplianceResult({
      paused: dsMockUtils.createMockBool(false),
      requirements: [
        dsMockUtils.createMockComplianceRequirementResult({
          sender_conditions: [rawConditions[0], rawConditions[2], rawConditions[3]],
          receiver_conditions: [rawConditions[0], rawConditions[1], rawConditions[3]],
          id: dsMockUtils.createMockU32(1),
          result: dsMockUtils.createMockBool(false),
        }),
      ],
      result: dsMockUtils.createMockBool(false),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    const result = assetComplianceResultToRequirementCompliance(assetComplianceResult);
    expect(result.requirements[0].conditions).toEqual(
      expect.arrayContaining(fakeResult.conditions)
    );
  });
});

describe('u8ToTransferStatus', () => {
  test('u8ToTransferStatus should convert a polkadot u8 object to a TransferStatus', () => {
    let result = u8ToTransferStatus(dsMockUtils.createMockU8(80));

    expect(result).toBe(TransferStatus.Failure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(81));

    expect(result).toBe(TransferStatus.Success);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(82));

    expect(result).toBe(TransferStatus.InsufficientBalance);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(83));

    expect(result).toBe(TransferStatus.InsufficientAllowance);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(84));

    expect(result).toBe(TransferStatus.TransfersHalted);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(85));

    expect(result).toBe(TransferStatus.FundsLocked);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(86));

    expect(result).toBe(TransferStatus.InvalidSenderAddress);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(87));

    expect(result).toBe(TransferStatus.InvalidReceiverAddress);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(88));

    expect(result).toBe(TransferStatus.InvalidOperator);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(160));

    expect(result).toBe(TransferStatus.InvalidSenderIdentity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(161));

    expect(result).toBe(TransferStatus.InvalidReceiverIdentity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(162));

    expect(result).toBe(TransferStatus.ComplianceFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(163));

    expect(result).toBe(TransferStatus.SmartExtensionFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(164));

    expect(result).toBe(TransferStatus.InvalidGranularity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(165));

    expect(result).toBe(TransferStatus.VolumeLimitReached);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(166));

    expect(result).toBe(TransferStatus.BlockedTransaction);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(168));

    expect(result).toBe(TransferStatus.FundsLimitReached);

    const fakeStatusCode = 1;
    expect(() => u8ToTransferStatus(dsMockUtils.createMockU8(fakeStatusCode))).toThrow(
      `Unsupported status code "${fakeStatusCode}". Please report this issue to the Polymath team`
    );
  });
});

describe('canTransferResultToTransferStatus', () => {
  test('canTransferResultToTransferStatus should convert a polkadot CanTransferResult object to a TransferStatus', () => {
    const errorMsg = 'someError';
    expect(() =>
      canTransferResultToTransferStatus(
        dsMockUtils.createMockCanTransferResult({
          Err: dsMockUtils.createMockBytes(errorMsg),
        })
      )
    ).toThrow(`Error while checking transfer validity: ${errorMsg}`);

    const result = canTransferResultToTransferStatus(
      dsMockUtils.createMockCanTransferResult({ Ok: dsMockUtils.createMockU8(81) })
    );

    expect(result).toBe(TransferStatus.Success);
  });
});

describe('txTagToProtocolOp', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('txTagToProtocolOp should convert a TxTag to a polkadot ProtocolOp object', () => {
    const value = TxTags.identity.AcceptAuthorization;
    const fakeResult = ('convertedProtocolOp' as unknown) as ProtocolOp;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('ProtocolOp', 'IdentityAcceptAuthorization')
      .returns(fakeResult);

    const result = txTagToProtocolOp(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('txTagToProtocolOp should ignore "batch" prefixes and postfixes', () => {
    let value = TxTags.identity.BatchAcceptAuthorization;
    const fakeResult = ('convertedProtocolOp' as unknown) as ProtocolOp;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('ProtocolOp', 'IdentityAcceptAuthorization')
      .returns(fakeResult);

    let result = txTagToProtocolOp(value, context);

    expect(result).toEqual(fakeResult);

    value = TxTags.identity.BatchAddClaim;

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('ProtocolOp', 'IdentityAddClaim')
      .returns(fakeResult);

    result = txTagToProtocolOp(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('txTagToExtrinsicIdentifier and extrinsicIdentifierToTxTag', () => {
  test('txTagToExtrinsicIdentifier should convert a TxTag enum to a ExtrinsicIdentifier object', () => {
    let result = txTagToExtrinsicIdentifier(TxTags.identity.CddRegisterDid);

    expect(result).toEqual({
      moduleId: ModuleIdEnum.Identity,
      callId: CallIdEnum.CddRegisterDid,
    });

    result = txTagToExtrinsicIdentifier(TxTags.finalityTracker.FinalHint);

    expect(result).toEqual({
      moduleId: ModuleIdEnum.Finalitytracker,
      callId: CallIdEnum.FinalHint,
    });
  });

  test('extrinsicIdentifierToTxTag should convert a ExtrinsicIdentifier object to a TxTag', () => {
    let result = extrinsicIdentifierToTxTag({
      moduleId: ModuleIdEnum.Identity,
      callId: CallIdEnum.CddRegisterDid,
    });

    expect(result).toEqual(TxTags.identity.CddRegisterDid);

    result = extrinsicIdentifierToTxTag({
      moduleId: ModuleIdEnum.Finalitytracker,
      callId: CallIdEnum.FinalHint,
    });

    expect(result).toEqual(TxTags.finalityTracker.FinalHint);
  });
});

describe('permissionToMeshPermission and meshPermissionToPermission', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('permissionToMeshPermission should convert a Permission to a polkadot Permission object', () => {
    const value = Permission.Admin;
    const fakeResult = ('convertedPermission' as unknown) as MeshPermission;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Permission', value)
      .returns(fakeResult);

    const result = permissionToMeshPermission(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('meshPermissionToPermission should convert a polkadot Permission object to a Permission', () => {
    let fakeResult = Permission.Admin;
    let permission = dsMockUtils.createMockPermission(fakeResult);

    let result = meshPermissionToPermission(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = Permission.Full;
    permission = dsMockUtils.createMockPermission(fakeResult);

    result = meshPermissionToPermission(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = Permission.Operator;
    permission = dsMockUtils.createMockPermission(fakeResult);

    result = meshPermissionToPermission(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = Permission.SpendFunds;
    permission = dsMockUtils.createMockPermission(fakeResult);

    result = meshPermissionToPermission(permission);
    expect(result).toEqual(fakeResult);
  });
});

describe('authorizationTypeToMeshAuthorizationType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('authorizationTypeToMeshAuthorizationType should convert a AuthorizationType to a polkadot AuthorizationType object', () => {
    const value = AuthorizationType.TransferTicker;
    const fakeResult = ('convertedAuthorizationType' as unknown) as MeshAuthorizationType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AuthorizationType', value)
      .returns(fakeResult);

    const result = authorizationTypeToMeshAuthorizationType(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('padString', () => {
  test('should pad a string on the right side to cover the supplied length', () => {
    const value = 'someString';
    const fakeResult = `${value}\0\0`;

    const result = padString(value, 12);

    expect(result).toBe(fakeResult);
  });
});

describe('removePadding', () => {
  test('should remove all null character padding from the input', () => {
    const expected = 'someString';

    const result = removePadding(`${expected}\0\0\0`);

    expect(result).toBe(expected);
  });
});

describe('requestPaginated', () => {
  test('should fetch and return entries and the hex value of the last key', async () => {
    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      entries: [
        tuple(['ticker0'], dsMockUtils.createMockU32(0)),
        tuple(['ticker1'], dsMockUtils.createMockU32(1)),
        tuple(['ticker2'], dsMockUtils.createMockU32(2)),
      ],
    });

    let res = await requestPaginated(queryStub, {
      paginationOpts: undefined,
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entries);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 3 },
    });

    expect(typeof res.lastKey).toBe('string');
    sinon.assert.calledOnce(queryStub.entriesPaged);

    sinon.resetHistory();

    res = await requestPaginated(queryStub, {
      paginationOpts: { size: 4 },
    });

    expect(res.lastKey).toBeNull();
    sinon.assert.calledOnce(queryStub.entriesPaged);
  });
});

describe('requestAtBlock', () => {
  test('should fetch and return the value at a certain block (current if left empty)', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: true,
    });
    const returnValue = dsMockUtils.createMockU32(5);
    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      returnValue,
    });

    const blockHash = 'someBlockHash';
    const ticker = 'ticker';

    let res = await requestAtBlock(
      queryStub,
      {
        blockHash,
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub.at, blockHash, ticker);
    expect(res).toBe(returnValue);

    res = await requestAtBlock(
      queryStub,
      {
        args: [ticker],
      },
      context
    );

    sinon.assert.calledWith(queryStub, ticker);
    expect(res).toBe(returnValue);
  });

  test('should throw an error if the node is not archive', async () => {
    const context = dsMockUtils.getContextInstance({
      isArchiveNode: false,
    });

    const queryStub = dsMockUtils.createQueryStub('dividend', 'dividendCount', {
      returnValue: dsMockUtils.createMockU32(5),
    });

    await expect(
      requestAtBlock(
        queryStub,
        {
          blockHash: 'someBlockHash',
          args: ['ticker'],
        },
        context
      )
    ).rejects.toThrow('Cannot query previous blocks in a non-archive node');
  });
});

describe('batchArguments', () => {
  test('should return chunks of data', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength + 1);

    const batches = batchArguments(elements, tag);

    expect(batches.length).toBe(4);
    expect(batches[0].length).toBe(expectedBatchLength);
    expect(batches[1].length).toBe(expectedBatchLength);
    expect(batches[2].length).toBe(expectedBatchLength);
    expect(batches[3].length).toBe(1);
  });

  test('should use a custom batching function to group elements', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 2 * expectedBatchLength);

    let batches = batchArguments(elements, tag, element => `${element % 2}`); // separate odd from even

    expect(batches.length).toBe(2);
    expect(batches[0]).toEqual(range(0, 2 * expectedBatchLength, 2));
    expect(batches[1]).toEqual(range(1, 2 * expectedBatchLength, 2));

    batches = batchArguments(elements, tag, element => `${element % 3}`); // separate in 3 groups

    expect(batches.length).toBe(3);
    expect(batches[0].length).toBeLessThan(expectedBatchLength);
    expect(batches[1].length).toBeLessThan(expectedBatchLength);
    expect(batches[2].length).toBeLessThan(expectedBatchLength);
  });

  test('should throw an error if a custom batch has a size bigger than the limit', () => {
    const tag = TxTags.asset.BatchAddDocument;
    const expectedBatchLength = MAX_BATCH_ELEMENTS[tag];

    const elements = range(0, 3 * expectedBatchLength);

    expect(() => batchArguments(elements, tag, element => `${element % 2}`)).toThrowError(
      'Batch size exceeds limit'
    );
  });
});

describe('calculateNextKey', () => {
  test('should return NextKey null as there are less elements than the default page size', () => {
    const totalCount = 20;
    const nextKey = calculateNextKey(totalCount);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey null as it is the last page', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 31;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toBeNull();
  });

  test('should return NextKey', () => {
    const totalCount = 50;
    const currentPageSize = 30;
    const currentStart = 0;
    const nextKey = calculateNextKey(totalCount, currentPageSize, currentStart);

    expect(nextKey).toEqual(30);
  });
});

describe('meshProposalStateToProposalState', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('meshProposalStateToProposalState should convert a polkadot ProposalState object to a ProposalState', () => {
    let fakeResult: ProposalState = ProposalState.Cancelled;

    let proposalState = dsMockUtils.createMockProposalState(fakeResult);

    let result = meshProposalStateToProposalState(proposalState);
    expect(result).toEqual(fakeResult);

    fakeResult = ProposalState.Killed;

    proposalState = dsMockUtils.createMockProposalState(fakeResult);

    result = meshProposalStateToProposalState(proposalState);
    expect(result).toEqual(fakeResult);

    fakeResult = ProposalState.Pending;

    proposalState = dsMockUtils.createMockProposalState(fakeResult);

    result = meshProposalStateToProposalState(proposalState);
    expect(result).toEqual(fakeResult);

    fakeResult = ProposalState.Referendum;

    proposalState = dsMockUtils.createMockProposalState(fakeResult);

    result = meshProposalStateToProposalState(proposalState);
    expect(result).toEqual(fakeResult);

    fakeResult = ProposalState.Rejected;

    proposalState = dsMockUtils.createMockProposalState(fakeResult);

    result = meshProposalStateToProposalState(proposalState);
    expect(result).toEqual(fakeResult);
  });
});

describe('toIdentityWithClaimsArray', () => {
  test('should return an IdentityWithClaims array object', () => {
    const context = dsMockUtils.getContextInstance();
    const targetDid = 'someTargetDid';
    const issuerDid = 'someIssuerDid';
    const date = 1589816265000;
    const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
    const claim = {
      target: new Identity({ did: targetDid }, context),
      issuer: new Identity({ did: issuerDid }, context),
      issuedAt: new Date(date),
    };
    const fakeResult = [
      {
        identity: new Identity({ did: targetDid }, context),
        claims: [
          {
            ...claim,
            expiry: new Date(date),
            claim: {
              type: customerDueDiligenceType,
            },
          },
          {
            ...claim,
            expiry: null,
            claim: {
              type: customerDueDiligenceType,
            },
          },
        ],
      },
    ];
    /* eslint-disable @typescript-eslint/camelcase */
    const commonClaimData = {
      targetDID: targetDid,
      issuer: issuerDid,
      issuance_date: date,
      last_update_date: date,
    };
    const fakeMiddlewareIdentityWithClaims = [
      {
        did: targetDid,
        claims: [
          {
            ...commonClaimData,
            expiry: date,
            type: customerDueDiligenceType,
          },
          {
            ...commonClaimData,
            expiry: null,
            type: customerDueDiligenceType,
          },
        ],
      },
    ];
    /* eslint-enabled @typescript-eslint/camelcase */

    const result = toIdentityWithClaimsArray(fakeMiddlewareIdentityWithClaims, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('transactionHexToTxTag', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('transactionHexToTxTag should convert a hex string to a TxTag type', () => {
    const hex = '0x110000';
    const fakeResult = TxTags.treasury.Disbursement;
    const mockResult = {
      methodName: 'disbursement',
      sectionName: 'treasury',
    };

    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Proposal', hex)
      .returns(mockResult);

    const result = transactionHexToTxTag(hex, context);
    expect(result).toEqual(fakeResult);
  });
});

describe('middlewareProposalToProposalDetails', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should return a ProposalDetails object', () => {
    const context = dsMockUtils.getContextInstance();

    const proposer = 'someProposer';
    const url = 'http://someUrl';
    const description = 'some description';
    const lastState = ProposalState.Pending;
    const createdAt = new BigNumber(150000);
    const coolOffEndBlock = new BigNumber(160000);
    const endBlock = new BigNumber(165000);
    const lastStateUpdatedAt = new BigNumber(163000);
    const totalVotes = new BigNumber(30);
    const totalAyesWeight = new BigNumber(10);
    const totalNaysWeight = new BigNumber(20);
    const rawProposal = '0x110000';
    const fakeProposal = {
      pipId: 0,
      proposer,
      createdAt: createdAt.toNumber(),
      url,
      description,
      coolOffEndBlock: coolOffEndBlock.toNumber(),
      endBlock: endBlock.toNumber(),
      proposal: rawProposal,
      lastState,
      lastStateUpdatedAt: lastStateUpdatedAt.toNumber(),
      totalVotes: totalVotes.toNumber(),
      totalAyesWeight: totalAyesWeight,
      totalNaysWeight: totalNaysWeight,
    };
    const fakeResult = {
      proposerAddress: proposer,
      createdAt,
      discussionUrl: url,
      description,
      coolOffEndBlock,
      endBlock,
      transaction: 'treasury.disbursement',
      lastState,
      lastStateUpdatedAt,
      totalVotes,
      totalAyesWeight,
      totalNaysWeight,
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Proposal', rawProposal)
      .returns({
        methodName: 'disbursement',
        sectionName: 'treasury',
      });

    let result = middlewareProposalToProposalDetails(fakeProposal, context);

    expect(result).toEqual(fakeResult);

    result = middlewareProposalToProposalDetails({ ...fakeProposal, proposal: undefined }, context);

    expect(result).toEqual({ ...fakeResult, transaction: null });
  });
});

describe('secondaryKeyToMeshSecondaryKey', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('secondaryKeyToMeshSecondaryKey should convert a SecondaryKey to a polkadot SecondaryKey', () => {
    const address = 'someAccount';
    const context = dsMockUtils.getContextInstance();
    const secondaryKey = {
      signer: entityMockUtils.getAccountInstance(),
      permissions: [Permission.Full],
    };
    const mockAccountId = dsMockUtils.createMockAccountId(address);
    const mockSignatory = dsMockUtils.createMockSignatory({ Account: mockAccountId });
    const mockPermission = dsMockUtils.createMockPermission(secondaryKey.permissions[0]);
    const fakeResult = dsMockUtils.createMockSecondaryKey({
      signer: mockSignatory,
      permissions: [mockPermission],
    });

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('SecondaryKey', {
        signer: signerValueToSignatory({ type: SignerType.Account, value: address }, context),
        permissions: secondaryKey.permissions.map(permission =>
          permissionToMeshPermission(permission, context)
        ),
      })
      .returns(fakeResult);

    const result = secondaryKeyToMeshSecondaryKey(secondaryKey, context);

    expect(result).toEqual(fakeResult);
  });
});
