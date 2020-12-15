import { bool, Bytes, u64 } from '@polkadot/types';
import { AccountId, Balance, Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import {
  CddId,
  ComplianceRequirement,
  InvestorZKProofData,
  Memo,
  MovePortfolioItem,
  PipId,
  PortfolioId,
  ScopeId,
  SettlementType,
  TrustedIssuer,
  VenueDetails,
} from 'polymesh-types/polymesh';
import {
  AssetIdentifier,
  AssetName,
  AssetTx,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  Claim as MeshClaim,
  DocumentHash,
  DocumentName,
  DocumentType,
  DocumentUri,
  FundingRoundName,
  IdentityId,
  Permissions as MeshPermissions,
  ProtocolOp,
  Scope as MeshScope,
  Signatory,
  Ticker,
  TxTags,
  VenueType as MeshVenueType,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities/SecurityToken';
import { Account, Context, DefaultPortfolio, Identity, NumberedPortfolio } from '~/internal';
// import { ProposalState } from '~/api/entities/types';
import { CallIdEnum, ClaimScopeTypeEnum, ClaimTypeEnum, ModuleIdEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  AffirmationStatus,
  Authorization,
  AuthorizationType,
  Claim,
  ClaimType,
  Condition,
  ConditionCompliance,
  ConditionTarget,
  ConditionType,
  CountryCode,
  InstructionStatus,
  InstructionType,
  KnownTokenType,
  Permissions,
  PermissionsLike,
  PortfolioLike,
  PortfolioMovement,
  Scope,
  ScopeType,
  Signer,
  TokenDocument,
  TokenIdentifierType,
  TransferStatus,
  TrustedClaimIssuer,
  VenueType,
} from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import { MAX_DECIMALS, MAX_TICKER_LENGTH, MAX_TOKEN_AMOUNT } from '~/utils/constants';

import {
  accountIdToString,
  addressToKey,
  assetComplianceResultToCompliance,
  assetIdentifierToTokenIdentifier,
  assetNameToString,
  assetTypeToString,
  authIdentifierToAuthTarget,
  authorizationDataToAuthorization,
  authorizationToAuthorizationData,
  authorizationTypeToMeshAuthorizationType,
  authTargetToAuthIdentifier,
  balanceToBigNumber,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  canTransferResultToTransferStatus,
  cddIdToString,
  cddStatusToBoolean,
  claimToMeshClaim,
  complianceRequirementResultToRequirementCompliance,
  complianceRequirementToRequirement,
  dateToMoment,
  documentHashToString,
  documentNameToString,
  documentToTokenDocument,
  documentTypeToString,
  documentUriToString,
  endConditionToSettlementType,
  extrinsicIdentifierToTxTag,
  fundingRoundNameToString,
  identityIdToString,
  isCusipValid,
  isIsinValid,
  isLeiValid,
  keyToAddress,
  meshAffirmationStatusToAffirmationStatus,
  meshClaimToClaim,
  meshClaimTypeToClaimType,
  meshInstructionStatusToInstructionStatus,
  meshPermissionsToPermissions,
  meshScopeToScope,
  meshVenueTypeToVenueType,
  middlewareScopeToScope,
  // middlewareProposalToProposalDetails,
  moduleAddressToString,
  momentToDate,
  numberToBalance,
  numberToPipId,
  numberToU32,
  numberToU64,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  portfolioMovementToMovePortfolioItem,
  posRatioToBigNumber,
  requirementToComplianceRequirement,
  scopeToMeshScope,
  scopeToMiddlewareScope,
  secondaryKeyToMeshSecondaryKey,
  signatoryToSignerValue,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
  signerValueToSigner,
  stringToAccountId,
  stringToAssetName,
  stringToBytes,
  stringToCddId,
  stringToDocumentHash,
  stringToDocumentName,
  stringToDocumentType,
  stringToDocumentUri,
  stringToFundingRoundName,
  stringToIdentityId,
  stringToInvestorZKProofData,
  stringToMemo,
  stringToScopeId,
  stringToText,
  stringToTicker,
  stringToVenueDetails,
  textToString,
  tickerToDid,
  tickerToString,
  toIdentityWithClaimsArray,
  tokenDocumentToDocument,
  tokenIdentifierToAssetIdentifier,
  tokenTypeToAssetType,
  transactionHexToTxTag,
  transactionToTxTag,
  trustedClaimIssuerToTrustedIssuer,
  trustedIssuerToTrustedClaimIssuer,
  txTagToExtrinsicIdentifier,
  txTagToProtocolOp,
  u8ToTransferStatus,
  u64ToBigNumber,
  venueDetailsToString,
  venueTypeToMeshVenueType,
} from '../conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

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

describe('stringToInvestorZKProofData', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToInvestorZKProofData should convert a string to a polkadot InvestorZKProofData object', () => {
    const value = 'someProof';
    const fakeResult = ('convertedProof' as unknown) as InvestorZKProofData;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('InvestorZKProofData', value)
      .returns(fakeResult);

    const result = stringToInvestorZKProofData(value, context);

    expect(result).toBe(fakeResult);
  });
});

describe('portfolioMovementToMovePortfolioItem', () => {
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

  test('portfolioMovementToMovePortfolioItem should convert a portfolio item into a polkadot move portfolio item', () => {
    const context = dsMockUtils.getContextInstance();
    const ticker = 'someToken';
    const amount = new BigNumber(100);
    const token = entityMockUtils.getSecurityTokenInstance({ ticker });
    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawAmount = dsMockUtils.createMockBalance(amount.toNumber());
    const fakeResult = ('MovePortfolioItem' as unknown) as MovePortfolioItem;

    let portfolioMovement: PortfolioMovement = {
      token: ticker,
      amount,
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Ticker', ticker)
      .returns(rawTicker);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Balance', portfolioMovement.amount.multipliedBy(Math.pow(10, 6)).toString())
      .returns(rawAmount);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('MovePortfolioItem', {
        ticker: rawTicker,
        amount: rawAmount,
      })
      .returns(fakeResult);

    let result = portfolioMovementToMovePortfolioItem(portfolioMovement, context);

    expect(result).toBe(fakeResult);

    portfolioMovement = {
      token,
      amount,
    };

    result = portfolioMovementToMovePortfolioItem(portfolioMovement, context);

    expect(result).toBe(fakeResult);
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

  test('stringToTicker should throw an error if the string contains unreadable characters', () => {
    const value = `Illegal ${String.fromCharCode(65533)}`;
    const context = dsMockUtils.getContextInstance();

    expect(() => stringToTicker(value, context)).toThrow('Ticker contains unreadable characters');
  });

  test('tickerToString should convert a polkadot Ticker object to a string', () => {
    const fakeResult = 'someTicker';
    const ticker = dsMockUtils.createMockTicker(fakeResult);

    const result = tickerToString(ticker);
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

describe('signerValueToSignatory and signatoryToSigner', () => {
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

  test('signerValueToSignatory should convert a Signer to a polkadot Signatory object', () => {
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
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
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

describe('signerToString', () => {
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
    entityMockUtils.reset();
  });

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

    const createTypeStub = dsMockUtils.getCreateTypeStub();
    createTypeStub.withArgs('AuthorizationData', { [value.type]: value.value }).returns(fakeResult);

    let result = authorizationToAuthorizationData(value, context);
    expect(result).toBe(fakeResult);

    value = {
      type: AuthorizationType.JoinIdentity,
      value: {
        tokens: null,
        transactions: null,
        portfolios: null,
      },
    };

    const rawPermissions = dsMockUtils.createMockPermissions({
      asset: null,
      extrinsic: null,
      portfolio: null,
    });

    createTypeStub.withArgs('Permissions', sinon.match(sinon.match.object)).returns(rawPermissions);
    createTypeStub
      .withArgs('AuthorizationData', {
        [value.type]: rawPermissions,
      })
      .returns(fakeResult);

    result = authorizationToAuthorizationData(value, context);
    expect(result).toBe(fakeResult);

    const did = 'someDid';
    value = {
      type: AuthorizationType.PortfolioCustody,
      value: entityMockUtils.getDefaultPortfolioInstance({ did }),
    };

    const rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });

    createTypeStub.withArgs('PortfolioId', sinon.match(sinon.match.object)).returns(rawPortfolioId);
    createTypeStub
      .withArgs('AuthorizationData', {
        [value.type]: rawPortfolioId,
      })
      .returns(fakeResult);

    result = authorizationToAuthorizationData(value, context);
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
    const context = dsMockUtils.getContextInstance();
    let fakeResult: Authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: 'someIdentity',
    };
    let authorizationData = dsMockUtils.createMockAuthorizationData({
      AttestPrimaryKeyRotation: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.RotatePrimaryKey,
      value: 'someIdentity',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      RotatePrimaryKey: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferTicker,
      value: 'someTicker',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      TransferTicker: dsMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.AddMultiSigSigner,
      value: 'someAccount',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      AddMultiSigSigner: dsMockUtils.createMockAccountId(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.PortfolioCustody,
      value: new DefaultPortfolio({ did: 'someDid' }, context),
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      PortfolioCustody: dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(fakeResult.value.owner.did),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      }),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    const portfolioId = new BigNumber(1);
    fakeResult = {
      type: AuthorizationType.PortfolioCustody,
      value: new NumberedPortfolio({ did: 'someDid', id: portfolioId }, context),
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      PortfolioCustody: dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(fakeResult.value.owner.did),
        kind: dsMockUtils.createMockPortfolioKind({
          User: dsMockUtils.createMockU64(portfolioId.toNumber()),
        }),
      }),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.TransferAssetOwnership,
      value: 'someTicker',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      TransferAssetOwnership: dsMockUtils.createMockTicker(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.JoinIdentity,
      value: { tokens: [], portfolios: [], transactions: [] },
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      JoinIdentity: dsMockUtils.createMockPermissions({ asset: [], portfolio: [], extrinsic: [] }),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.Custom,
      value: 'someBytes',
    };
    authorizationData = dsMockUtils.createMockAuthorizationData({
      custom: dsMockUtils.createMockBytes(fakeResult.value),
    });

    result = authorizationDataToAuthorization(authorizationData, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: AuthorizationType.NoData,
    };
    authorizationData = dsMockUtils.createMockAuthorizationData('NoData');

    result = authorizationDataToAuthorization(authorizationData, context);
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

describe('permissionsToMeshPermissions and meshPermissionsToPermissions', () => {
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

  test('permissionsToMeshPermissions should convert a Permissions to a polkadot Permissions object', () => {
    let value: Permissions = {
      tokens: null,
      transactions: null,
      portfolios: null,
    };
    const fakeResult = ('convertedPermission' as unknown) as MeshPermissions;
    const context = dsMockUtils.getContextInstance();

    const createTypeStub = dsMockUtils.getCreateTypeStub();

    createTypeStub
      .withArgs('Permissions', {
        asset: null,
        extrinsic: null,
        portfolio: null,
      })
      .returns(fakeResult);

    let result = permissionsToMeshPermissions(value, context);
    expect(result).toEqual(fakeResult);

    const ticker = 'someTicker';
    const did = 'someDid';
    value = {
      tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
      transactions: [TxTags.identity.AddClaim],
      portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did })],
    };

    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    createTypeStub
      .withArgs('Permissions', {
        asset: [rawTicker],
        extrinsic: [
          {
            /* eslint-disable @typescript-eslint/camelcase */
            pallet_name: 'Identity',
            dispatchable_names: ['add_claim'],
            /* eslint-enable @typescript-eslint/camelcase */
          },
        ],
        portfolio: [rawPortfolioId],
      })
      .returns(fakeResult);
    createTypeStub.withArgs('Ticker', ticker).returns(rawTicker);
    createTypeStub.withArgs('PortfolioId', sinon.match(sinon.match.object)).returns(rawPortfolioId);

    result = permissionsToMeshPermissions(value, context);
    expect(result).toEqual(fakeResult);
  });

  test('meshPermissionsToPermissions should convert a polkadot Permissions object to a Permissions', () => {
    const context = dsMockUtils.getContextInstance();
    const ticker = 'someTicker';
    const did = 'someDid';
    let fakeResult: Permissions = {
      tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
      transactions: [
        TxTags.identity.AddClaim,
        TxTags.confidential.AddRangeProof,
        TxTags.confidential.AddVerifyRangeProof,
      ],
      portfolios: [entityMockUtils.getDefaultPortfolioInstance({ did })],
    };
    let permissions = dsMockUtils.createMockPermissions({
      asset: [dsMockUtils.createMockTicker(ticker)],
      extrinsic: [
        /* eslint-disable @typescript-eslint/camelcase */
        dsMockUtils.createMockPalletPermissions({
          pallet_name: dsMockUtils.createMockPalletName('Identity'),
          dispatchable_names: [dsMockUtils.createMockDispatchableName('add_claim')],
        }),
        dsMockUtils.createMockPalletPermissions({
          pallet_name: dsMockUtils.createMockPalletName('Confidential'),
          dispatchable_names: null,
        }),
        /* eslint-enable @typescript-eslint/camelcase */
      ],
      portfolio: [
        dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId(did),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
      ],
    });

    let result = meshPermissionsToPermissions(permissions, context);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      tokens: null,
      transactions: null,
      portfolios: null,
    };
    permissions = dsMockUtils.createMockPermissions({
      asset: null,
      extrinsic: null,
      portfolio: null,
    });

    result = meshPermissionsToPermissions(permissions, context);
    expect(result).toEqual(fakeResult);
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
    let value = new BigNumber(100);
    const fakeResult = ('100' as unknown) as Balance;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
      .returns(fakeResult);

    let result = numberToBalance(value, context, false);

    expect(result).toBe(fakeResult);

    value = new BigNumber(100.1);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
      .returns(fakeResult);

    result = numberToBalance(value, context);

    expect(result).toBe(fakeResult);
  });

  test('numberToBalance should throw an error if the value exceeds the max token amount constant', () => {
    const value = new BigNumber(Math.pow(20, 15));
    const context = dsMockUtils.getContextInstance();

    let error;

    try {
      numberToBalance(value, context);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The value exceed the amount limit allowed');
    expect(error.data).toMatchObject({ currentValue: value, amountLimit: MAX_TOKEN_AMOUNT });
  });

  test('numberToBalance should throw an error if security token is divisible and the value exceeds the max decimals constant', () => {
    const value = new BigNumber(50.1234567);
    const context = dsMockUtils.getContextInstance();

    let error;

    try {
      numberToBalance(value, context);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('The value exceed the decimals limit allowed');
    expect(error.data).toMatchObject({ currentValue: value, decimalsLimit: MAX_DECIMALS });
  });

  test('numberToBalance should throw an error if security token is not divisible and the value has decimals', () => {
    const value = new BigNumber(50.1234567);
    const context = dsMockUtils.getContextInstance();

    expect(() => numberToBalance(value, context, false)).toThrow(
      'The value cannot have decimals if the token is indivisible'
    );
  });

  test('balanceToBigNumber should convert a polkadot Balance object to a BigNumber', () => {
    const fakeResult = 100;
    const balance = dsMockUtils.createMockBalance(fakeResult);

    const result = balanceToBigNumber(balance);
    expect(result).toEqual(new BigNumber(fakeResult).div(Math.pow(10, 6)));
  });
});

describe('isIsinValid, isCusipValid and isLeiValid', () => {
  test('isIsinValid should return if the Isin value identifier is valid or not', () => {
    const correct = isIsinValid('US0378331005');
    let incorrect = isIsinValid('US0373431005');

    expect(correct).toBeTruthy();
    expect(incorrect).toBeFalsy();

    incorrect = isIsinValid('US0373431');
    expect(incorrect).toBeFalsy();
  });

  test('isCusipValid should return if the Cusip value identifier is valid or not', () => {
    const correct = isCusipValid('037833100');
    let incorrect = isCusipValid('037831200');

    expect(correct).toBeTruthy();
    expect(incorrect).toBeFalsy();

    incorrect = isCusipValid('037831');

    expect(incorrect).toBeFalsy();

    incorrect = isCusipValid('0378312CD');

    expect(incorrect).toBeFalsy();
  });

  test('isLeiValid should return if the Lei value identifier is valid or not', () => {
    const correct = isLeiValid('724500VKKSH9QOLTFR81');
    let incorrect = isLeiValid('969500T3MBS4SQAMHJ45');

    expect(correct).toBeTruthy();
    expect(incorrect).toBeFalsy();

    incorrect = isLeiValid('969500T3MS4SQAMHJ4');
    expect(incorrect).toBeFalsy();
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

    result = u8ToTransferStatus(dsMockUtils.createMockU8(169));

    expect(result).toBe(TransferStatus.PortfolioFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(176));

    expect(result).toBe(TransferStatus.CustodianError);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(177));

    expect(result).toBe(TransferStatus.ScopeClaimMissing);

    const fakeStatusCode = 1;
    expect(() => u8ToTransferStatus(dsMockUtils.createMockU8(fakeStatusCode))).toThrow(
      `Unsupported status code "${fakeStatusCode}". Please report this issue to the Polymath team`
    );
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

describe('tokenIdentifierToAssetIdentifier and assetIdentifierToTokenIdentifier', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('tokenIdentifierToAssetIdentifier should convert a TokenIdentifier to a polkadot AssetIdentifier object', () => {
    const isinValue = 'US0378331005';
    const leiValue = '724500VKKSH9QOLTFR81';
    const cusipValue = '037833100';

    let value = { type: TokenIdentifierType.Isin, value: isinValue };
    const fakeResult = ('IsinEnum' as unknown) as AssetIdentifier;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetIdentifier', { [TokenIdentifierType.Isin]: isinValue })
      .returns(fakeResult);

    let result = tokenIdentifierToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);

    value = { type: TokenIdentifierType.Lei, value: leiValue };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetIdentifier', { [TokenIdentifierType.Lei]: leiValue })
      .returns(fakeResult);

    result = tokenIdentifierToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);

    value = { type: TokenIdentifierType.Cusip, value: cusipValue };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('AssetIdentifier', { [TokenIdentifierType.Cusip]: cusipValue })
      .returns(fakeResult);

    result = tokenIdentifierToAssetIdentifier(value, context);

    expect(result).toBe(fakeResult);
  });

  test('tokenIdentifierToAssetIdentifier should throw an error if some identifier is invalid', () => {
    const context = dsMockUtils.getContextInstance();

    let identifier = { type: TokenIdentifierType.Isin, value: 'US0373431005' };

    expect(() => tokenIdentifierToAssetIdentifier(identifier, context)).toThrow(
      `Error while checking value identifier ${identifier.value} as Isin type`
    );

    identifier = { type: TokenIdentifierType.Lei, value: '969500T3MBS4SQAMHJ45' };

    expect(() => tokenIdentifierToAssetIdentifier(identifier, context)).toThrow(
      `Error while checking value identifier ${identifier.value} as Lei type`
    );

    identifier = { type: TokenIdentifierType.Cusip, value: '037831200' };

    expect(() => tokenIdentifierToAssetIdentifier(identifier, context)).toThrow(
      `Error while checking value identifier ${identifier.value} as Cusip type`
    );
  });

  test('assetIdentifierToTokenIdentifier should convert a polkadot AssetIdentifier object to a TokenIdentifier', () => {
    let fakeResult = { type: TokenIdentifierType.Isin, value: 'someValue' };
    let identifier = dsMockUtils.createMockAssetIdentifier({
      [TokenIdentifierType.Isin]: dsMockUtils.createMockU8aFixed('someValue'),
    });

    let result = assetIdentifierToTokenIdentifier(identifier);
    expect(result).toEqual(fakeResult);

    fakeResult = { type: TokenIdentifierType.Cusip, value: 'someValue' };
    identifier = dsMockUtils.createMockAssetIdentifier({
      [TokenIdentifierType.Cusip]: dsMockUtils.createMockU8aFixed('someValue'),
    });

    result = assetIdentifierToTokenIdentifier(identifier);
    expect(result).toEqual(fakeResult);

    fakeResult = { type: TokenIdentifierType.Cins, value: 'someValue' };
    identifier = dsMockUtils.createMockAssetIdentifier({
      [TokenIdentifierType.Cins]: dsMockUtils.createMockU8aFixed('someValue'),
    });

    result = assetIdentifierToTokenIdentifier(identifier);
    expect(result).toEqual(fakeResult);

    fakeResult = { type: TokenIdentifierType.Lei, value: 'someValue' };
    identifier = dsMockUtils.createMockAssetIdentifier({
      [TokenIdentifierType.Lei]: dsMockUtils.createMockU8aFixed('someValue'),
    });

    result = assetIdentifierToTokenIdentifier(identifier);
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

describe('stringToDocumentType and documentTypeToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToDocumentType should convert a string to a polkadot DocumentType object', () => {
    const value = 'someType';
    const fakeResult = ('convertedType' as unknown) as DocumentType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('DocumentType', value)
      .returns(fakeResult);

    const result = stringToDocumentType(value, context);

    expect(result).toEqual(fakeResult);
  });

  test('documentTypeToString should convert a polkadot DocumentType object to a string', () => {
    const fakeResult = 'someDocumentType';
    const docType = dsMockUtils.createMockDocumentType(fakeResult);

    const result = documentTypeToString(docType);
    expect(result).toEqual(fakeResult);
  });
});

describe('tokenDocumentToDocument and documentToTokenDocument', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('tokenDocumentToDocument should convert a TokenDocument object to a polkadot Document object', () => {
    const uri = 'someUri';
    const contentHash = 'someHash';
    const name = 'someName';
    const type = 'someType';
    const filedAt = new Date();
    const value = {
      uri,
      contentHash,
      name,
    };
    const fakeResult = ('convertedDocument' as unknown) as Document;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Document', {
        uri: stringToDocumentUri(uri, context),
        name: stringToDocumentName(name, context),
        /* eslint-disable @typescript-eslint/camelcase */
        content_hash: stringToDocumentHash(contentHash, context),
        doc_type: null,
        filing_date: null,
        /* eslint-enable @typescript-eslint/camelcase */
      })
      .returns(fakeResult);

    let result = tokenDocumentToDocument(value, context);
    expect(result).toEqual(fakeResult);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Document', {
        uri: stringToDocumentUri(uri, context),
        name: stringToDocumentName(name, context),
        /* eslint-disable @typescript-eslint/camelcase */
        content_hash: stringToDocumentHash(contentHash, context),
        doc_type: stringToDocumentType(type, context),
        filing_date: dateToMoment(filedAt, context),
        /* eslint-enable @typescript-eslint/camelcase */
      })
      .returns(fakeResult);

    result = tokenDocumentToDocument({ ...value, filedAt, type }, context);
    expect(result).toEqual(fakeResult);
  });

  test('documentToTokenDocument should convert a polkadot Document object to a TokenDocument object', () => {
    const name = 'someName';
    const uri = 'someUri';
    const contentHash = 'someHash';
    const filedAt = new Date();
    const type = 'someType';
    let fakeResult: TokenDocument = {
      name,
      uri,
      contentHash,
    };

    let doc = dsMockUtils.createMockDocument({
      uri: dsMockUtils.createMockDocumentUri(uri),
      name: dsMockUtils.createMockDocumentName(name),
      /* eslint-disable @typescript-eslint/camelcase */
      content_hash: dsMockUtils.createMockDocumentHash(contentHash),
      doc_type: dsMockUtils.createMockOption(),
      filing_date: dsMockUtils.createMockOption(),
      /* eslint-enable @typescript-eslint/camelcase */
    });

    let result = documentToTokenDocument(doc);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      ...fakeResult,
      filedAt,
      type,
    };

    doc = dsMockUtils.createMockDocument({
      uri: dsMockUtils.createMockDocumentUri(uri),
      name: dsMockUtils.createMockDocumentName(name),
      /* eslint-disable @typescript-eslint/camelcase */
      content_hash: dsMockUtils.createMockDocumentHash(contentHash),
      doc_type: dsMockUtils.createMockOption(dsMockUtils.createMockDocumentType(type)),
      filing_date: dsMockUtils.createMockOption(dsMockUtils.createMockMoment(filedAt.getTime())),
      /* eslint-enable @typescript-eslint/camelcase */
    });

    result = documentToTokenDocument(doc);
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

describe('scopeToMeshScope and meshScopeToScope', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('scopeToMeshScope should convert a Scope into a polkadot Scope object', () => {
    const context = dsMockUtils.getContextInstance();
    const value: Scope = {
      type: ScopeType.Identity,
      value: 'someDid',
    };
    const fakeResult = ('ScopeEnum' as unknown) as MeshScope;

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('Scope', { [value.type]: value.value })
      .returns(fakeResult);

    const result = scopeToMeshScope(value, context);

    expect(result).toBe(fakeResult);
  });

  test('meshScopeToScope should convert a polkadot Scope object into a Scope', () => {
    let fakeResult: Scope = {
      type: ScopeType.Identity,
      value: 'someDid',
    };
    let scope = dsMockUtils.createMockScope({
      Identity: dsMockUtils.createMockIdentityId(fakeResult.value),
    });

    let result = meshScopeToScope(scope);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ScopeType.Ticker,
      value: 'someTicker',
    };
    scope = dsMockUtils.createMockScope({
      Ticker: dsMockUtils.createMockTicker(fakeResult.value),
    });

    result = meshScopeToScope(scope);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ScopeType.Custom,
      value: 'something',
    };
    scope = dsMockUtils.createMockScope({
      Custom: dsMockUtils.createMockBytes(fakeResult.value),
    });

    result = meshScopeToScope(scope);
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
      scope: { type: ScopeType.Identity, value: 'someTickerDid' },
    };
    const fakeResult = ('meshClaim' as unknown) as MeshClaim;
    const fakeScope = ('scope' as unknown) as MeshScope;

    const createTypeStub = dsMockUtils.getCreateTypeStub();

    createTypeStub.withArgs('Scope', sinon.match.any).returns(fakeScope);
    createTypeStub
      .withArgs('Claim', { [value.type]: [value.code, scopeToMeshScope(value.scope, context)] })
      .returns(fakeResult);

    let result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.Exempted,
      scope: { type: ScopeType.Identity, value: 'someTickerDid' },
    };

    createTypeStub
      .withArgs('Claim', { [value.type]: scopeToMeshScope(value.scope, context) })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.CustomerDueDiligence,
      id: 'someCddId',
    };

    createTypeStub
      .withArgs('Claim', { [value.type]: stringToCddId(value.id, context) })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.NoData,
    };

    createTypeStub.withArgs('Claim', { [value.type]: null }).returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);

    value = {
      type: ClaimType.InvestorUniqueness,
      ticker: 'someTicker',
      cddId: 'someCddId',
      scopeId: 'someScopeId',
    };

    createTypeStub
      .withArgs('Claim', {
        [value.type]: [
          scopeToMeshScope({ type: ScopeType.Ticker, value: value.ticker }, context),
          stringToScopeId(value.scopeId, context),
          stringToCddId(value.cddId, context),
        ],
      })
      .returns(fakeResult);

    result = claimToMeshClaim(value, context);

    expect(result).toBe(fakeResult);
  });

  test('meshClaimToClaim should convert a polkadot Claim object to a Claim', () => {
    let scope = { type: ScopeType.Ticker, value: 'someTicker' };

    let fakeResult: Claim = {
      type: ClaimType.Accredited,
      scope,
    };

    let claim = dsMockUtils.createMockClaim({
      Accredited: dsMockUtils.createMockScope({
        Ticker: dsMockUtils.createMockTicker(scope.value),
      }),
    });

    let result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    scope = { type: ScopeType.Identity, value: 'someDid' };

    fakeResult = {
      type: ClaimType.Affiliate,
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      Affiliate: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Blocked,
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      Blocked: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.BuyLockup,
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      BuyLockup: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.CustomerDueDiligence,
      id: 'someId',
    };
    claim = dsMockUtils.createMockClaim({
      CustomerDueDiligence: dsMockUtils.createMockCddId(fakeResult.id),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Jurisdiction,
      code: CountryCode.Cl,
      scope,
    };

    claim = dsMockUtils.createMockClaim({
      Jurisdiction: [
        dsMockUtils.createMockCountryCode(fakeResult.code),
        dsMockUtils.createMockScope({ Identity: dsMockUtils.createMockIdentityId(scope.value) }),
      ],
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.KnowYourCustomer,
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      KnowYourCustomer: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
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
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      SellLockup: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);

    fakeResult = {
      type: ClaimType.Exempted,
      scope,
    };
    claim = dsMockUtils.createMockClaim({
      Exempted: dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(scope.value),
      }),
    });

    result = meshClaimToClaim(claim);
    expect(result).toEqual(fakeResult);
  });
});

describe('meshClaimTypeToClaimType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('meshClaimTypeToClaimType should convert a polkadot ClaimType object to a ClaimType', () => {
    let fakeResult: ClaimType = ClaimType.Accredited;

    let claimType = dsMockUtils.createMockClaimType(fakeResult);

    let result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Affiliate;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Blocked;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.BuyLockup;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.CustomerDueDiligence;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Exempted;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Jurisdiction;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.KnowYourCustomer;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.NoData;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.SellLockup;

    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);
  });
});

describe('middlewareScopeToScope and scopeToMiddlewareScope', () => {
  test('should convert a MiddlewareScope object to a Scope', () => {
    let result = middlewareScopeToScope({
      type: ClaimScopeTypeEnum.Ticker,
      value: 'SOMETHING\u0000\u0000\u0000',
    });

    expect(result).toEqual({ type: ScopeType.Ticker, value: 'SOMETHING' });

    result = middlewareScopeToScope({ type: ClaimScopeTypeEnum.Identity, value: 'someDid' });

    expect(result).toEqual({ type: ScopeType.Identity, value: 'someDid' });

    result = middlewareScopeToScope({ type: ClaimScopeTypeEnum.Custom, value: 'SOMETHINGELSE' });

    expect(result).toEqual({ type: ScopeType.Custom, value: 'SOMETHINGELSE' });
  });

  test('scopeToMiddlewareScope should convert a Scope to a MiddlewareScope object', () => {
    let scope: Scope = { type: ScopeType.Identity, value: 'someDid' };
    let result = scopeToMiddlewareScope(scope);
    expect(result).toEqual({ type: ClaimScopeTypeEnum.Identity, value: scope.value });

    scope = { type: ScopeType.Ticker, value: 'someTicker' };
    result = scopeToMiddlewareScope(scope);
    expect(result).toEqual({ type: ClaimScopeTypeEnum.Ticker, value: 'someTicker\0\0' });

    scope = { type: ScopeType.Custom, value: 'customValue' };
    result = scopeToMiddlewareScope(scope);
    expect(result).toEqual({ type: ClaimScopeTypeEnum.Custom, value: scope.value });
  });
});

describe('stringToCddId and cddIdToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToCddId should convert a cdd id string into a CddId', () => {
    const cddId = 'someId';
    const fakeResult = ('type' as unknown) as CddId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('CddId', cddId)
      .returns(fakeResult);

    const result = stringToCddId(cddId, context);

    expect(result).toBe(fakeResult);
  });

  test('cddIdToString should convert a CddId to a cddId string', () => {
    const fakeResult = 'cddId';
    const cddId = dsMockUtils.createMockCddId(fakeResult);

    const result = cddIdToString(cddId);
    expect(result).toBe(fakeResult);
  });
});

describe('stringToCddId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToScopeId should convert a scope id string into a ScopeId', () => {
    const scopeId = 'someId';
    const fakeResult = ('type' as unknown) as ScopeId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('ScopeId', scopeId)
      .returns(fakeResult);

    const result = stringToScopeId(scopeId, context);

    expect(result).toBe(fakeResult);
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
    const did = 'someDid';
    const context = dsMockUtils.getContextInstance();
    const conditions: Condition[] = [
      {
        type: ConditionType.IsPresent,
        target: ConditionTarget.Both,
        claim: {
          type: ClaimType.Exempted,
          scope: { type: ScopeType.Identity, value: 'someTickerDid' },
        },
        trustedClaimIssuers: ['someDid', 'otherDid'],
      },
      {
        type: ConditionType.IsNoneOf,
        target: ConditionTarget.Sender,
        claims: [
          {
            type: ClaimType.Blocked,
            scope: { type: ScopeType.Identity, value: 'someTickerDid' },
          },
          {
            type: ClaimType.SellLockup,
            scope: { type: ScopeType.Identity, value: 'someTickerDid' },
          },
        ],
      },
      {
        type: ConditionType.IsAbsent,
        target: ConditionTarget.Receiver,
        claim: {
          type: ClaimType.Jurisdiction,
          scope: { type: ScopeType.Identity, value: 'someTickerDid' },
          code: CountryCode.Cl,
        },
      },
      {
        type: ConditionType.IsIdentity,
        target: ConditionTarget.Sender,
        identity: new Identity({ did }, context),
      },
      {
        type: ConditionType.IsPrimaryIssuanceAgent,
        target: ConditionTarget.Receiver,
      },
    ];
    const value = {
      conditions,
      id: 1,
    };
    const fakeResult = ('convertedComplianceRequirement' as unknown) as ComplianceRequirement;

    const createTypeStub = dsMockUtils.getCreateTypeStub();

    conditions.forEach(({ type }) => {
      const meshType =
        type === ConditionType.IsPrimaryIssuanceAgent ? ConditionType.IsIdentity : type;
      createTypeStub
        .withArgs(
          'Condition',
          sinon.match({
            // eslint-disable-next-line @typescript-eslint/camelcase
            condition_type: sinon.match.has(meshType),
          })
        )
        .returns(`meshCondition${meshType}`);
    });

    createTypeStub
      .withArgs('ComplianceRequirement', {
        /* eslint-disable @typescript-eslint/camelcase */
        sender_conditions: [
          'meshConditionIsPresent',
          'meshConditionIsNoneOf',
          'meshConditionIsIdentity',
        ],
        receiver_conditions: [
          'meshConditionIsPresent',
          'meshConditionIsAbsent',
          'meshConditionIsIdentity',
        ],
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
    const cddId = 'someCddId';
    const issuerDids = ['someDid', 'otherDid'];
    const targetIdentityDid = 'someDid';
    const context = dsMockUtils.getContextInstance();
    const conditions: Condition[] = [
      {
        type: ConditionType.IsPresent,
        target: ConditionTarget.Both,
        claim: {
          type: ClaimType.KnowYourCustomer,
          scope: { type: ScopeType.Identity, value: tokenDid },
        },
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsAbsent,
        target: ConditionTarget.Receiver,
        claim: {
          type: ClaimType.BuyLockup,
          scope: { type: ScopeType.Identity, value: tokenDid },
        },
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsNoneOf,
        target: ConditionTarget.Sender,
        claims: [
          {
            type: ClaimType.Blocked,
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          {
            type: ClaimType.SellLockup,
            scope: { type: ScopeType.Identity, value: tokenDid },
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
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          {
            type: ClaimType.CustomerDueDiligence,
            id: cddId,
          },
        ],
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsIdentity,
        target: ConditionTarget.Sender,
        identity: new Identity({ did: targetIdentityDid }, context),
        trustedClaimIssuers: issuerDids,
      },
      {
        type: ConditionType.IsPrimaryIssuanceAgent,
        target: ConditionTarget.Receiver,
        trustedClaimIssuers: issuerDids,
      },
    ];
    const fakeResult = {
      id,
      conditions,
    };

    const scope = dsMockUtils.createMockScope({
      Identity: dsMockUtils.createMockIdentityId(tokenDid),
    });
    /* eslint-disable @typescript-eslint/camelcase */
    const issuers = issuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        trusted_for: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
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
            dsMockUtils.createMockClaim({
              CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
            }),
          ],
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsIdentity: dsMockUtils.createMockTargetIdentity({
            Specific: dsMockUtils.createMockIdentityId(targetIdentityDid),
          }),
        }),
        issuers,
      }),
      dsMockUtils.createMockCondition({
        condition_type: dsMockUtils.createMockConditionType({
          IsIdentity: dsMockUtils.createMockTargetIdentity('PrimaryIssuanceAgent'),
        }),
        issuers,
      }),
    ];
    const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
      sender_conditions: [
        rawConditions[0],
        rawConditions[2],
        rawConditions[2],
        rawConditions[3],
        rawConditions[4],
      ],
      receiver_conditions: [
        rawConditions[0],
        rawConditions[1],
        rawConditions[1],
        rawConditions[3],
        rawConditions[5],
      ],
      id: dsMockUtils.createMockU32(1),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    const result = complianceRequirementToRequirement(
      complianceRequirement,
      dsMockUtils.getContextInstance()
    );
    expect(result.conditions).toEqual(expect.arrayContaining(fakeResult.conditions));
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
    const value = TxTags.asset.AddDocuments;
    const fakeResult = ('convertedProtocolOp' as unknown) as ProtocolOp;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('ProtocolOp', 'AssetAddDocument')
      .returns(fakeResult);

    const result = txTagToProtocolOp(value, context);

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
      did: 'someDid',
    };
    const number = new BigNumber(1);
    const rawIdentityId = dsMockUtils.createMockIdentityId(portfolioId.did);
    const rawU64 = dsMockUtils.createMockU64(number.toNumber());
    const fakeResult = ('PortfolioId' as unknown) as PortfolioId;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('IdentityId', portfolioId.did)
      .returns(rawIdentityId);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('PortfolioId', {
        did: rawIdentityId,
        kind: 'Default',
      })
      .returns(fakeResult);

    let result = portfolioIdToMeshPortfolioId(portfolioId, context);

    expect(result).toBe(fakeResult);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('u64', number.toString())
      .returns(rawU64);

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('PortfolioId', {
        did: rawIdentityId,
        kind: { User: rawU64 },
      })
      .returns(fakeResult);

    result = portfolioIdToMeshPortfolioId({ ...portfolioId, number }, context);

    expect(result).toBe(fakeResult);
  });
});

describe('complianceRequirementResultToRequirementCompliance', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('complianceRequirementResultToRequirementCompliance should convert a polkadot Compliance Requirement Result object to a RequirementCompliance', () => {
    const id = 1;
    const tokenDid = 'someTokenDid';
    const cddId = 'someCddId';
    const issuerDids = ['someDid', 'otherDid'];
    const targetIdentityDid = 'someDid';
    const context = dsMockUtils.getContextInstance();
    const conditions: ConditionCompliance[] = [
      {
        condition: {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.KnowYourCustomer,
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          trustedClaimIssuers: issuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.BuyLockup,
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          trustedClaimIssuers: issuerDids,
        },
        complies: false,
      },
      {
        condition: {
          type: ConditionType.IsNoneOf,
          target: ConditionTarget.Sender,
          claims: [
            {
              type: ClaimType.Blocked,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
          ],
          trustedClaimIssuers: issuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAnyOf,
          target: ConditionTarget.Both,
          claims: [
            {
              type: ClaimType.Exempted,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
            {
              type: ClaimType.CustomerDueDiligence,
              id: cddId,
            },
          ],
          trustedClaimIssuers: issuerDids,
        },
        complies: false,
      },
      {
        condition: {
          type: ConditionType.IsIdentity,
          target: ConditionTarget.Sender,
          identity: new Identity({ did: targetIdentityDid }, context),
          trustedClaimIssuers: issuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsPrimaryIssuanceAgent,
          target: ConditionTarget.Receiver,
          trustedClaimIssuers: issuerDids,
        },
        complies: false,
      },
    ];
    const fakeResult = {
      id,
      conditions,
      complies: false,
    };

    const scope = dsMockUtils.createMockScope({
      Identity: dsMockUtils.createMockIdentityId(tokenDid),
    });
    /* eslint-disable @typescript-eslint/camelcase */
    const issuers = issuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        trusted_for: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsNoneOf: [
              dsMockUtils.createMockClaim({ Blocked: scope }),
              dsMockUtils.createMockClaim({ SellLockup: scope }),
            ],
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsAnyOf: [
              dsMockUtils.createMockClaim({ Exempted: scope }),
              dsMockUtils.createMockClaim({
                CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
              }),
            ],
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsIdentity: dsMockUtils.createMockTargetIdentity({
              Specific: dsMockUtils.createMockIdentityId(targetIdentityDid),
            }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsIdentity: dsMockUtils.createMockTargetIdentity('PrimaryIssuanceAgent'),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
    ];
    const complianceRequirement = dsMockUtils.createMockComplianceRequirementResult({
      sender_conditions: [
        rawConditions[0],
        rawConditions[2],
        rawConditions[2],
        rawConditions[3],
        rawConditions[4],
      ],
      receiver_conditions: [
        rawConditions[0],
        rawConditions[1],
        rawConditions[1],
        rawConditions[3],
        rawConditions[5],
      ],
      id: dsMockUtils.createMockU32(1),
      result: dsMockUtils.createMockBool(false),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    const result = complianceRequirementResultToRequirementCompliance(
      complianceRequirement,
      dsMockUtils.getContextInstance()
    );
    expect(result.conditions).toEqual(expect.arrayContaining(fakeResult.conditions));
  });
});

describe('assetComplianceResultToCompliance', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('assetComplianceResultToCompliance should convert a polkadot AssetComplianceResult object to a RequirementCompliance', () => {
    const id = 1;
    const tokenDid = 'someTokenDid';
    const cddId = 'someCddId';
    const issuerDids = ['someDid', 'otherDid'];
    const context = dsMockUtils.getContextInstance();
    const conditions: ConditionCompliance[] = [
      {
        condition: {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.KnowYourCustomer,
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          trustedClaimIssuers: issuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.BuyLockup,
            scope: { type: ScopeType.Identity, value: tokenDid },
          },
          trustedClaimIssuers: issuerDids,
        },
        complies: false,
      },
      {
        condition: {
          type: ConditionType.IsNoneOf,
          target: ConditionTarget.Sender,
          claims: [
            {
              type: ClaimType.Blocked,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
          ],
          trustedClaimIssuers: issuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAnyOf,
          target: ConditionTarget.Both,
          claims: [
            {
              type: ClaimType.Exempted,
              scope: { type: ScopeType.Identity, value: tokenDid },
            },
            {
              type: ClaimType.CustomerDueDiligence,
              id: cddId,
            },
          ],
          trustedClaimIssuers: issuerDids,
        },
        complies: false,
      },
    ];
    const fakeResult = {
      id,
      conditions,
    };

    const scope = dsMockUtils.createMockScope({
      Identity: dsMockUtils.createMockIdentityId(tokenDid),
    });
    /* eslint-disable @typescript-eslint/camelcase */
    const issuers = issuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        trusted_for: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
      /* eslint-disable @typescript-eslint/camelcase */
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsNoneOf: [
              dsMockUtils.createMockClaim({ Blocked: scope }),
              dsMockUtils.createMockClaim({ SellLockup: scope }),
            ],
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          condition_type: dsMockUtils.createMockConditionType({
            IsAnyOf: [
              dsMockUtils.createMockClaim({ Exempted: scope }),
              dsMockUtils.createMockClaim({
                CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
              }),
            ],
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
    ];

    const rawRequirements = dsMockUtils.createMockComplianceRequirementResult({
      sender_conditions: [rawConditions[0], rawConditions[2], rawConditions[3]],
      receiver_conditions: [rawConditions[0], rawConditions[1], rawConditions[3]],
      id: dsMockUtils.createMockU32(1),
      result: dsMockUtils.createMockBool(false),
    });
    /* eslint-enable @typescript-eslint/camelcase */

    let assetComplianceResult = dsMockUtils.createMockAssetComplianceResult({
      paused: dsMockUtils.createMockBool(true),
      requirements: [rawRequirements],
      result: dsMockUtils.createMockBool(true),
    });

    let result = assetComplianceResultToCompliance(assetComplianceResult, context);
    expect(result.requirements[0].conditions).toEqual(
      expect.arrayContaining(fakeResult.conditions)
    );
    expect(result.complies).toBeTruthy();

    assetComplianceResult = dsMockUtils.createMockAssetComplianceResult({
      paused: dsMockUtils.createMockBool(false),
      requirements: [rawRequirements],
      result: dsMockUtils.createMockBool(true),
    });

    result = assetComplianceResultToCompliance(assetComplianceResult, context);
    expect(result.complies).toBeTruthy();
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

  test('transactionHexToTxTag should convert a hex string to a TxTag', () => {
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

describe('transactionToTxTag', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('transactionToTxTag should convert a transaction to a TxTag', () => {
    const tx = dsMockUtils.createTxStub('asset', 'unfreeze');
    const fakeResult = TxTags.asset.Unfreeze;

    const result = transactionToTxTag(tx);
    expect(result).toEqual(fakeResult);
  });
});

// describe('middlewareProposalToProposalDetails', () => {
//   beforeAll(() => {
//     dsMockUtils.initMocks();
//   });

//   afterEach(() => {
//     dsMockUtils.reset();
//   });

//   afterAll(() => {
//     dsMockUtils.cleanup();
//   });

//   test('should return a ProposalDetails object', () => {
//     const context = dsMockUtils.getContextInstance();

//     const proposer = 'someProposer';
//     const url = 'http://someUrl';
//     const description = 'some description';
//     const lastState = ProposalState.Pending;
//     const createdAt = new BigNumber(150000);
//     const coolOffEndBlock = new BigNumber(160000);
//     const endBlock = new BigNumber(165000);
//     const lastStateUpdatedAt = new BigNumber(163000);
//     const totalVotes = new BigNumber(30);
//     const totalAyesWeight = new BigNumber(10);
//     const totalNaysWeight = new BigNumber(20);
//     const rawProposal = '0x110000';
//     const fakeProposal = {
//       pipId: 0,
//       proposer,
//       createdAt: createdAt.toNumber(),
//       url,
//       description,
//       coolOffEndBlock: coolOffEndBlock.toNumber(),
//       endBlock: endBlock.toNumber(),
//       proposal: rawProposal,
//       lastState,
//       lastStateUpdatedAt: lastStateUpdatedAt.toNumber(),
//       totalVotes: totalVotes.toNumber(),
//       totalAyesWeight: totalAyesWeight,
//       totalNaysWeight: totalNaysWeight,
//     };
//     const fakeResult = {
//       proposerAddress: proposer,
//       createdAt,
//       discussionUrl: url,
//       description,
//       coolOffEndBlock,
//       endBlock,
//       transaction: 'treasury.disbursement',
//       lastState,
//       lastStateUpdatedAt,
//       totalVotes,
//       totalAyesWeight,
//       totalNaysWeight,
//     };

//     dsMockUtils
//       .getCreateTypeStub()
//       .withArgs('Proposal', rawProposal)
//       .returns({
//         methodName: 'disbursement',
//         sectionName: 'treasury',
//       });

//     let result = middlewareProposalToProposalDetails(fakeProposal, context);

//     expect(result).toEqual(fakeResult);

//     result = middlewareProposalToProposalDetails({ ...fakeProposal, proposal: undefined }, context);

//     expect(result).toEqual({ ...fakeResult, transaction: null });
//   });
// });

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

  // NOTE uncomment in Governance v2 upgrade
  // test('meshProposalStateToProposalState should convert a polkadot ProposalState object to a ProposalState', () => {
  //   let fakeResult: ProposalState = ProposalState.Cancelled;

  //   let proposalState = dsMockUtils.createMockProposalState(fakeResult);

  //   let result = meshProposalStateToProposalState(proposalState);
  //   expect(result).toEqual(fakeResult);

  //   fakeResult = ProposalState.Killed;

  //   proposalState = dsMockUtils.createMockProposalState(fakeResult);

  //   result = meshProposalStateToProposalState(proposalState);
  //   expect(result).toEqual(fakeResult);

  //   fakeResult = ProposalState.Pending;

  //   proposalState = dsMockUtils.createMockProposalState(fakeResult);

  //   result = meshProposalStateToProposalState(proposalState);
  //   expect(result).toEqual(fakeResult);

  //   fakeResult = ProposalState.Referendum;

  //   proposalState = dsMockUtils.createMockProposalState(fakeResult);

  //   result = meshProposalStateToProposalState(proposalState);
  //   expect(result).toEqual(fakeResult);

  //   fakeResult = ProposalState.Rejected;

  //   proposalState = dsMockUtils.createMockProposalState(fakeResult);

  //   result = meshProposalStateToProposalState(proposalState);
  //   expect(result).toEqual(fakeResult);
  // });
});

describe('meshAffirmationStatusToAffirmationStatus', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('meshAffirmationStatusToAffirmationStatus should convert a polkadot AffirmationStatus object to a AffirmationStatus', () => {
    let fakeResult = AffirmationStatus.Affirmed;
    let permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    let result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Pending;
    permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Rejected;
    permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Unknown;
    permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);
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
      permissions: {
        tokens: null,
        transactions: null,
        portfolios: null,
      },
    };
    const mockAccountId = dsMockUtils.createMockAccountId(address);
    const mockSignatory = dsMockUtils.createMockSignatory({ Account: mockAccountId });
    const mockPermissions = dsMockUtils.createMockPermissions({
      asset: null,
      extrinsic: null,
      portfolio: null,
    });
    const fakeResult = dsMockUtils.createMockSecondaryKey({
      signer: mockSignatory,
      permissions: mockPermissions,
    });

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('SecondaryKey', {
        signer: signerValueToSignatory({ type: SignerType.Account, value: address }, context),
        permissions: permissionsToMeshPermissions(secondaryKey.permissions, context),
      })
      .returns(fakeResult);

    const result = secondaryKeyToMeshSecondaryKey(secondaryKey, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('venueTypeToMeshVenueType and meshVenueTypeToVenueType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('venueTypeToMeshVenueType should convert a VenueType to a polkadot VenueType object', () => {
    const value = VenueType.Other;
    const fakeResult = ('Other' as unknown) as MeshVenueType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('VenueType', value)
      .returns(fakeResult);

    const result = venueTypeToMeshVenueType(value, context);

    expect(result).toBe(fakeResult);
  });

  test('meshVenueTypeToVenueType should convert a polkadot VenueType object to a VenueType', () => {
    let fakeResult = VenueType.Other;
    let venueType = dsMockUtils.createMockVenueType(fakeResult);

    let result = meshVenueTypeToVenueType(venueType);
    expect(result).toEqual(fakeResult);

    fakeResult = VenueType.Distribution;
    venueType = dsMockUtils.createMockVenueType(fakeResult);

    result = meshVenueTypeToVenueType(venueType);
    expect(result).toEqual(fakeResult);

    fakeResult = VenueType.Sto;
    venueType = dsMockUtils.createMockVenueType(fakeResult);

    result = meshVenueTypeToVenueType(venueType);
    expect(result).toEqual(fakeResult);

    fakeResult = VenueType.Exchange;
    venueType = dsMockUtils.createMockVenueType(fakeResult);

    result = meshVenueTypeToVenueType(venueType);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToVenueDetails and venueDetailsToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('stringToVenueDetails should convert a string into a polkadot VenueDetails object', () => {
    const details = 'details';
    const fakeResult = ('type' as unknown) as VenueDetails;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('VenueDetails', details)
      .returns(fakeResult);

    const result = stringToVenueDetails(details, context);

    expect(result).toBe(fakeResult);
  });

  test('venueDetailsToString should convert a polkadot VenueDetails object to a string', () => {
    const fakeResult = 'details';
    const venueDetails = dsMockUtils.createMockVenueDetails(fakeResult);

    const result = venueDetailsToString(venueDetails);
    expect(result).toBe(fakeResult);
  });
});

describe('meshInstructionStatusToInstructionStatus', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('meshInstructionStatusToInstructionStatus should convert a polkadot InstructionStatus object to an InstructionStatus', () => {
    let fakeResult = InstructionStatus.Pending;
    let instructionStatus = dsMockUtils.createMockInstructionStatus(fakeResult);

    let result = meshInstructionStatusToInstructionStatus(instructionStatus);
    expect(result).toEqual(fakeResult);

    fakeResult = InstructionStatus.Unknown;
    instructionStatus = dsMockUtils.createMockInstructionStatus(fakeResult);

    result = meshInstructionStatusToInstructionStatus(instructionStatus);
    expect(result).toEqual(fakeResult);
  });
});

describe('meshAffirmationStatusToAffirmationStatus', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('meshAffirmationStatusToAffirmationStatus should convert a polkadot AffirmationStatus object to a AffirmationStatus', () => {
    let fakeResult = AffirmationStatus.Unknown;
    let authorizationStatus = dsMockUtils.createMockAffirmationStatus(fakeResult);

    let result = meshAffirmationStatusToAffirmationStatus(authorizationStatus);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Rejected;
    authorizationStatus = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(authorizationStatus);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Pending;
    authorizationStatus = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(authorizationStatus);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Affirmed;
    authorizationStatus = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(authorizationStatus);
    expect(result).toEqual(fakeResult);
  });
});

describe('endConditionToSettlementType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('endConditionToSettlementType should convert an end condition to a polkadot SettlementType object', () => {
    const fakeResult = ('type' as unknown) as SettlementType;
    const context = dsMockUtils.getContextInstance();

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('SettlementType', InstructionType.SettleOnAffirmation)
      .returns(fakeResult);

    let result = endConditionToSettlementType(
      { type: InstructionType.SettleOnAffirmation },
      context
    );

    expect(result).toBe(fakeResult);

    const blockNumber = new BigNumber(10);
    const rawBlockNumber = dsMockUtils.createMockU32(blockNumber.toNumber());

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('u32', blockNumber.toString())
      .returns(rawBlockNumber);
    dsMockUtils
      .getCreateTypeStub()
      .withArgs('SettlementType', { [InstructionType.SettleOnBlock]: rawBlockNumber })
      .returns(fakeResult);

    result = endConditionToSettlementType(
      { type: InstructionType.SettleOnBlock, value: new BigNumber(10) },
      context
    );

    expect(result).toBe(fakeResult);
  });
});

describe('portfolioLikeToPortfolioId', () => {
  let did: string;
  let number: BigNumber;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    did = 'someDid';
    number = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should convert a DID string to a PortfolioId', async () => {
    const result = await portfolioLikeToPortfolioId(did, context);

    expect(result).toEqual({ did, number: undefined });
  });

  test('should convert an Identity to a PortfolioId', async () => {
    const identity = entityMockUtils.getIdentityInstance({ did });

    const result = await portfolioLikeToPortfolioId(identity, context);

    expect(result).toEqual({ did, number: undefined });
  });

  test('should convert a NumberedPortfolio to a PortfolioId', async () => {
    const portfolio = new NumberedPortfolio({ did, id: number }, context);

    const result = await portfolioLikeToPortfolioId(portfolio, context);

    expect(result).toEqual({ did, number });
  });

  test('should convert a DefaultPortfolio to a PortfolioId', async () => {
    const portfolio = new DefaultPortfolio({ did }, context);

    const result = await portfolioLikeToPortfolioId(portfolio, context);

    expect(result).toEqual({ did, number: undefined });
  });

  test('should convert a Portfolio identifier object to a PortfolioId', async () => {
    const result = await portfolioLikeToPortfolioId({ identity: did, id: number }, context);
    expect(result).toEqual({ did, number });
  });

  test("should throw an error if the Portfolio identifier object refers to a Portfolio that doesn't exist", async () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        exists: false,
      },
    });

    const portfolioIdentifier: PortfolioLike = {
      identity: entityMockUtils.getIdentityInstance({
        did,
      }),
      id: number,
    };

    let err;

    try {
      await portfolioLikeToPortfolioId(portfolioIdentifier, context);
    } catch (e) {
      err = e;
    }

    expect(err.message).toBe("The Portfolio doesn't exist");
    expect(err.data).toEqual({
      did,
      portfolioId: number,
    });
  });
});

describe('portfolioLikeToPortfolio', () => {
  let did: string;
  let id: BigNumber;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();

    did = 'someDid';
    id = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should convert a PortfolioLike to a DefaultPortfolio instance', async () => {
    const result = await portfolioLikeToPortfolio(did, context);
    expect(result instanceof DefaultPortfolio).toBe(true);
  });

  test('should convert a PortfolioLike to a NumberedPortfolio instance', async () => {
    const result = await portfolioLikeToPortfolio({ identity: did, id }, context);
    expect(result instanceof NumberedPortfolio).toBe(true);
  });
});

describe('toIdentityWithClaimsArray', () => {
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

describe('trustedClaimIssuerToTrustedIssuer and trustedIssuerToTrustedClaimIssuer', () => {
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

  test('trustedClaimIssuerToTrustedIssuer should convert a did string into an IdentityId', () => {
    const did = 'someDid';
    const fakeResult = ('type' as unknown) as TrustedIssuer;
    const context = dsMockUtils.getContextInstance();

    let issuer: TrustedClaimIssuer = {
      identity: entityMockUtils.getIdentityInstance({ did }),
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('TrustedIssuer', {
        issuer: stringToIdentityId(did, context),
        trusted_for: 'Any',
      })
      .returns(fakeResult);

    let result = trustedClaimIssuerToTrustedIssuer(issuer, context);
    expect(result).toBe(fakeResult);

    issuer = {
      identity: entityMockUtils.getIdentityInstance({ did }),
      trustedFor: [ClaimType.Accredited, ClaimType.Blocked],
    };

    dsMockUtils
      .getCreateTypeStub()
      .withArgs('TrustedIssuer', {
        issuer: stringToIdentityId(did, context),
        trusted_for: { Specific: [ClaimType.Accredited, ClaimType.Blocked] },
      })
      .returns(fakeResult);

    result = trustedClaimIssuerToTrustedIssuer(issuer, context);
    expect(result).toBe(fakeResult);
  });

  test('trustedIssuerToTrustedClaimIssuer should convert an IdentityId to a did string', () => {
    const did = 'someDid';
    const context = dsMockUtils.getContextInstance();
    let fakeResult: TrustedClaimIssuer = {
      identity: new Identity({ did }, context),
    };
    let trustedIssuer = dsMockUtils.createMockTrustedIssuer({
      issuer: dsMockUtils.createMockIdentityId(did),
      trusted_for: dsMockUtils.createMockTrustedFor('Any'),
    });

    let result = trustedIssuerToTrustedClaimIssuer(trustedIssuer, context);
    expect(result).toEqual(fakeResult);

    fakeResult = { identity: new Identity({ did }, context), trustedFor: [ClaimType.SellLockup] };
    trustedIssuer = dsMockUtils.createMockTrustedIssuer({
      issuer: dsMockUtils.createMockIdentityId(did),
      trusted_for: dsMockUtils.createMockTrustedFor({
        Specific: [dsMockUtils.createMockClaimType(ClaimType.SellLockup)],
      }),
    });

    result = trustedIssuerToTrustedClaimIssuer(trustedIssuer, context);
    expect(result).toEqual(fakeResult);
  });
});

describe('permissionsLikeToPermissions', () => {
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

  test('permissionsLikeToPermissions should convert a PermissionsLike into a Permissions', async () => {
    const context = dsMockUtils.getContextInstance();
    let args: PermissionsLike = { tokens: null, transactions: null, portfolios: null };
    let result = await permissionsLikeToPermissions(args, context);
    expect(result).toEqual(args);

    const firstToken = new SecurityToken({ ticker: 'TICKER' }, context);
    const ticker = 'OTHERTICKER';
    const secondToken = new SecurityToken({ ticker: ticker }, context);
    const portfolio = new DefaultPortfolio({ did: 'someDid' }, context);

    args = {
      tokens: [firstToken, ticker],
      transactions: [AssetTx.Transfer],
      portfolios: [portfolio],
    };
    result = await permissionsLikeToPermissions(args, context);
    expect(result).toEqual({
      tokens: [firstToken, secondToken],
      transactions: [AssetTx.Transfer],
      portfolios: [portfolio],
    });

    result = await permissionsLikeToPermissions({}, context);
    expect(result).toEqual({
      tokens: [],
      transactions: [],
      portfolios: [],
    });
  });
});
