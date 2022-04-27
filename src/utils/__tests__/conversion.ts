import { bool, Bytes, u32, u64 } from '@polkadot/types';
import { AccountId, Balance, Hash, Moment, Permill, Signature } from '@polkadot/types/interfaces';
import { hexToU8a } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import {
  AgentGroup,
  AGId,
  CAKind,
  CalendarPeriod as MeshCalendarPeriod,
  CddId,
  ComplianceRequirement,
  EcdsaSignature,
  ExtrinsicPermissions,
  InvestorZKProofData,
  Memo,
  MovePortfolioItem,
  PortfolioId,
  PriceTier,
  RecordDateSpec,
  RistrettoPoint,
  Scalar,
  ScheduleSpec,
  ScopeId,
  SettlementType,
  TargetIdentities,
  TransferManager,
  TrustedIssuer,
  VenueDetails,
} from 'polymesh-types/polymesh';
import {
  AssetIdentifier,
  AssetName,
  AssetType,
  AuthorizationData,
  AuthorizationType as MeshAuthorizationType,
  CAId,
  Claim as MeshClaim,
  DocumentHash,
  DocumentName,
  DocumentType,
  DocumentUri,
  FundingRoundName,
  IdentityId,
  ModuleName,
  Permissions as MeshPermissions,
  ProtocolOp,
  Scope as MeshScope,
  Signatory,
  Ticker,
  TxTags,
  VenueType as MeshVenueType,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Account, Context, DefaultPortfolio, Identity, NumberedPortfolio } from '~/internal';
import {
  CallIdEnum,
  ClaimScopeTypeEnum,
  ClaimTypeEnum,
  Event as MiddlewareEvent,
  ModuleIdEnum,
} from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  AffirmationStatus,
  AssetDocument,
  Authorization,
  AuthorizationType,
  CalendarUnit,
  Claim,
  ClaimType,
  Condition,
  ConditionCompliance,
  ConditionTarget,
  ConditionType,
  CorporateActionKind,
  CorporateActionParams,
  CountryCode,
  DividendDistributionParams,
  InputCondition,
  InstructionType,
  KnownAssetType,
  OfferingBalanceStatus,
  OfferingSaleStatus,
  OfferingTier,
  OfferingTimingStatus,
  PermissionGroupType,
  Permissions,
  PermissionsLike,
  PermissionType,
  PortfolioMovement,
  Scope,
  ScopeType,
  SecurityIdentifierType,
  Signer,
  SignerType,
  SignerValue,
  TargetTreatment,
  TransferError,
  TransferRestrictionType,
  TransferStatus,
  TrustedClaimIssuer,
  TxGroup,
  VenueType,
} from '~/types';
import { InstructionStatus, PermissionGroupIdentifier, ScopeClaimProof } from '~/types/internal';
import { tuple } from '~/types/utils';
import { DUMMY_ACCOUNT_ID, MAX_BALANCE, MAX_DECIMALS, MAX_TICKER_LENGTH } from '~/utils/constants';
import { padString } from '~/utils/internal';

import {
  accountIdToString,
  addressToKey,
  agentGroupToPermissionGroup,
  agentGroupToPermissionGroupIdentifier,
  assetComplianceResultToCompliance,
  assetDocumentToDocument,
  assetIdentifierToSecurityIdentifier,
  assetNameToString,
  assetTypeToKnownOrId,
  authorizationDataToAuthorization,
  authorizationToAuthorizationData,
  authorizationTypeToMeshAuthorizationType,
  balanceToBigNumber,
  bigNumberToBalance,
  bigNumberToU32,
  bigNumberToU64,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  calendarPeriodToMeshCalendarPeriod,
  canTransferResultToTransferStatus,
  cddIdToString,
  cddStatusToBoolean,
  checkpointToRecordDateSpec,
  claimToMeshClaim,
  claimTypeToMeshClaimType,
  complianceRequirementResultToRequirementCompliance,
  complianceRequirementToRequirement,
  corporateActionIdentifierToCaId,
  corporateActionKindToCaKind,
  dateToMoment,
  distributionToDividendDistributionParams,
  documentHashToString,
  documentNameToString,
  documentToAssetDocument,
  documentTypeToString,
  documentUriToString,
  endConditionToSettlementType,
  extrinsicIdentifierToTxTag,
  fundingRoundNameToString,
  fundraiserTierToTier,
  fundraiserToOfferingDetails,
  granularCanTransferResultToTransferBreakdown,
  hashToString,
  identityIdToString,
  internalAssetTypeToAssetType,
  isCusipValid,
  isIsinValid,
  isLeiValid,
  keyToAddress,
  meshAffirmationStatusToAffirmationStatus,
  meshCalendarPeriodToCalendarPeriod,
  meshClaimToClaim,
  meshClaimTypeToClaimType,
  meshCorporateActionToCorporateActionParams,
  meshInstructionStatusToInstructionStatus,
  meshPermissionsToPermissions,
  meshScopeToScope,
  meshVenueTypeToVenueType,
  middlewareEventToEventIdentifier,
  middlewarePortfolioToPortfolio,
  middlewareScopeToScope,
  moduleAddressToString,
  momentToDate,
  offeringTierToPriceTier,
  percentageToPermill,
  permillToBigNumber,
  permissionGroupIdentifierToAgentGroup,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  portfolioMovementToMovePortfolioItem,
  posRatioToBigNumber,
  requirementToComplianceRequirement,
  scheduleSpecToMeshScheduleSpec,
  scopeClaimProofToMeshScopeClaimProof,
  scopeIdToString,
  scopeToMeshScope,
  scopeToMiddlewareScope,
  secondaryAccountToMeshSecondaryKey,
  securityIdentifierToAssetIdentifier,
  signatoryToAccount,
  signatoryToSignerValue,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
  signerValueToSigner,
  storedScheduleToCheckpointScheduleParams,
  stringToAccountId,
  stringToAssetName,
  stringToBytes,
  stringToCddId,
  stringToDocumentHash,
  stringToDocumentName,
  stringToDocumentType,
  stringToDocumentUri,
  stringToEcdsaSignature,
  stringToFundingRoundName,
  stringToHash,
  stringToIdentityId,
  stringToInvestorZKProofData,
  stringToMemo,
  stringToRistrettoPoint,
  stringToScalar,
  stringToScopeId,
  stringToSignature,
  stringToText,
  stringToTicker,
  stringToVenueDetails,
  targetIdentitiesToCorporateActionTargets,
  targetsToTargetIdentities,
  textToString,
  tickerToDid,
  tickerToString,
  toIdentityWithClaimsArray,
  transactionHexToTxTag,
  transactionPermissionsToExtrinsicPermissions,
  transactionPermissionsToTxGroups,
  transactionToTxTag,
  transferManagerToTransferRestriction,
  transferRestrictionToTransferManager,
  trustedClaimIssuerToTrustedIssuer,
  trustedIssuerToTrustedClaimIssuer,
  txGroupToTxTags,
  txTagToExtrinsicIdentifier,
  txTagToProtocolOp,
  u8ToBigNumber,
  u8ToTransferStatus,
  u32ToBigNumber,
  u64ToBigNumber,
  venueDetailsToString,
  venueTypeToMeshVenueType,
} from '../conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
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
jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);
jest.mock(
  '~/api/entities/KnownPermissionGroup',
  require('~/testUtils/mocks/entities').mockKnownPermissionGroupModule(
    '~/api/entities/KnownPermissionGroup'
  )
);
jest.mock(
  '~/api/entities/CustomPermissionGroup',
  require('~/testUtils/mocks/entities').mockCustomPermissionGroupModule(
    '~/api/entities/CustomPermissionGroup'
  )
);

describe('tickerToDid', () => {
  it('should generate the ticker did', () => {
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

  describe('stringToAssetName', () => {
    it('should convert a string to a polkadot AssetName object', () => {
      const value = 'someName';
      const fakeResult = 'convertedName' as unknown as AssetName;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('AssetName', value).returns(fakeResult);

      const result = stringToAssetName(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('assetNameToString', () => {
    it('should convert a polkadot AssetName object to a string', () => {
      const fakeResult = 'someAssetName';
      const assetName = dsMockUtils.createMockAssetName(fakeResult);

      const result = assetNameToString(assetName);
      expect(result).toEqual(fakeResult);
    });
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

  describe('booleanToBool', () => {
    it('should convert a boolean to a polkadot bool object', () => {
      const value = true;
      const fakeResult = 'true' as unknown as bool;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('bool', value).returns(fakeResult);

      const result = booleanToBool(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('boolToBoolean', () => {
    it('should convert a polkadot bool object to a boolean', () => {
      const fakeResult = true;
      const mockBool = dsMockUtils.createMockBool(fakeResult);

      const result = boolToBoolean(mockBool);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToBytes', () => {
    it('should convert a string to a polkadot Bytes object', () => {
      const value = 'someBytes';
      const fakeResult = 'convertedBytes' as unknown as Bytes;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Bytes', value).returns(fakeResult);

      const result = stringToBytes(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('bytesToString', () => {
    it('should convert a polkadot Bytes object to a string', () => {
      const fakeResult = 'someBytes';
      const ticker = dsMockUtils.createMockBytes(fakeResult);

      const result = bytesToString(ticker);
      expect(result).toEqual(fakeResult);
    });
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

  it('should convert a string to a polkadot InvestorZKProofData object', () => {
    const value = 'someProof';
    const fakeResult = 'convertedProof' as unknown as InvestorZKProofData;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('InvestorZKProofData', value).returns(fakeResult);

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
  });

  it('should convert a portfolio item into a polkadot move portfolio item', () => {
    const context = dsMockUtils.getContextInstance();
    const ticker = 'SOME_ASSET';
    const amount = new BigNumber(100);
    const memo = 'someMessage';
    const asset = entityMockUtils.getAssetInstance({ ticker });
    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawAmount = dsMockUtils.createMockBalance(amount);
    const rawMemo = 'memo' as unknown as Memo;
    const fakeResult = 'MovePortfolioItem' as unknown as MovePortfolioItem;

    let portfolioMovement: PortfolioMovement = {
      asset: ticker,
      amount,
    };

    context.createType.withArgs('Ticker', padString(ticker, 12)).returns(rawTicker);

    context.createType
      .withArgs('Balance', portfolioMovement.amount.multipliedBy(Math.pow(10, 6)).toString())
      .returns(rawAmount);

    context.createType
      .withArgs('MovePortfolioItem', {
        ticker: rawTicker,
        amount: rawAmount,
        memo: null,
      })
      .returns(fakeResult);

    let result = portfolioMovementToMovePortfolioItem(portfolioMovement, context);

    expect(result).toBe(fakeResult);

    portfolioMovement = {
      asset,
      amount,
    };

    result = portfolioMovementToMovePortfolioItem(portfolioMovement, context);

    expect(result).toBe(fakeResult);

    context.createType.withArgs('Memo', padString(memo, 32)).returns(rawMemo);

    context.createType
      .withArgs('MovePortfolioItem', {
        ticker: rawTicker,
        amount: rawAmount,
        memo: rawMemo,
      })
      .returns(fakeResult);

    portfolioMovement = {
      asset,
      amount,
      memo,
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

  describe('stringToTicker', () => {
    it('should convert a string to a polkadot Ticker object', () => {
      const value = 'SOME_TICKER';
      const fakeResult = 'convertedTicker' as unknown as Ticker;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Ticker', padString(value, 12)).returns(fakeResult);

      const result = stringToTicker(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('tickerToString', () => {
    it('should convert a polkadot Ticker object to a string', () => {
      const fakeResult = 'someTicker';
      const ticker = dsMockUtils.createMockTicker(fakeResult);

      const result = tickerToString(ticker);
      expect(result).toEqual(fakeResult);
    });
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

  describe('dateToMoment', () => {
    it('should convert a Date to a polkadot Moment object', () => {
      const value = new Date();
      const fakeResult = 10000 as unknown as Moment;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Moment', Math.round(value.getTime())).returns(fakeResult);

      const result = dateToMoment(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('momentToDate', () => {
    it('should convert a polkadot Moment object to a Date', () => {
      const fakeResult = 10000;
      const moment = dsMockUtils.createMockMoment(new BigNumber(fakeResult));

      const result = momentToDate(moment);
      expect(result).toEqual(new Date(fakeResult));
    });
  });
});

describe('stringToAccountId and accountIdToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('stringToAccountId', () => {
    it('should convert a string to a polkadot AccountId object', () => {
      const value = '5EYCAe5ijAx5xEfZdpCna3grUpY1M9M5vLUH5vpmwV1EnaYR';
      const fakeResult = 'convertedAccountId' as unknown as AccountId;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('AccountId', value).returns(fakeResult);

      const result = stringToAccountId(value, context);

      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if the passed string is not a valid SS58 formatted address', () => {
      const value = 'notAnAddress';
      const context = dsMockUtils.getContextInstance();

      expect(() => stringToAccountId(value, context)).toThrow(
        'The supplied address is not a valid SS58 address'
      );
    });
  });

  describe('accountIdToString', () => {
    it('should convert a polkadot AccountId object to a string', () => {
      const fakeResult = 'someAccountId';
      const accountId = dsMockUtils.createMockAccountId(fakeResult);

      const result = accountIdToString(accountId);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('stringToHash and hashToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('stringToHash', () => {
    it('should convert a string to a polkadot Hash object', () => {
      const value = 'someHash';
      const fakeResult = 'convertedHash' as unknown as Hash;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Hash', value).returns(fakeResult);

      const result = stringToHash(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('hashToString', () => {
    it('should convert a polkadot Hash object to a string', () => {
      const fakeResult = 'someHash';
      const accountId = dsMockUtils.createMockHash(fakeResult);

      const result = hashToString(accountId);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToIdentityId', () => {
    it('should convert a did string into an IdentityId', () => {
      const identity = 'IdentityObject';
      const fakeResult = 'type' as unknown as IdentityId;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('IdentityId', identity).returns(fakeResult);

      const result = stringToIdentityId(identity, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('identityIdToString', () => {
    it('should convert an IdentityId to a did string', () => {
      const fakeResult = 'IdentityString';
      const identityId = dsMockUtils.createMockIdentityId(fakeResult);

      const result = identityIdToString(identityId);
      expect(result).toBe(fakeResult);
    });
  });
});

describe('stringToEcdsaSignature', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a signature string into a polkadot EcdsaSignature object', () => {
    const signature = 'hexSig';
    const fakeResult = 'sig' as unknown as EcdsaSignature;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('EcdsaSignature', signature).returns(fakeResult);

    const result = stringToEcdsaSignature(signature, context);

    expect(result).toBe(fakeResult);
  });
});

describe('signerValueToSignatory and signatoryToSignerValue', () => {
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

  describe('signerValueToSignatory', () => {
    it('should convert a SignerValue to a polkadot Signatory object', () => {
      const value = {
        type: SignerType.Identity,
        value: 'someIdentity',
      };
      const fakeResult = 'SignatoryEnum' as unknown as Signatory;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Signatory', { [value.type]: value.value }).returns(fakeResult);

      const result = signerValueToSignatory(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('signatoryToSignerValue', () => {
    it('should convert a polkadot Signatory object to a SignerValue', () => {
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
    sinon.restore();
  });

  describe('signerToSignerValue', () => {
    it('should convert a Signer to a SignerValue', () => {
      const address = DUMMY_ACCOUNT_ID;
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
  });

  describe('signerValueToSigner', () => {
    it('should convert a SignerValue to a Signer', () => {
      let value = DUMMY_ACCOUNT_ID;
      let signerValue: SignerValue = { type: SignerType.Account, value };

      let result = signerValueToSigner(signerValue, context);

      expect((result as Account).address).toBe(value);

      value = 'someDid';

      signerValue = { type: SignerType.Identity, value };

      result = signerValueToSigner(signerValue, context);

      expect((result as Identity).did).toBe(value);
    });
  });
});

describe('signatoryToAccount', () => {
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

  it('should convert a polkadot Signatory Account object to an Account', () => {
    const address = 'someAccountId';
    const signatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(address),
    });

    const result = signatoryToAccount(signatory, context);
    expect(result).toEqual(expect.objectContaining({ address }));
  });

  it('should throw an error while converting a polkadot Signatory Identity object', () => {
    const signatory = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId('someIdentity'),
    });

    let err;
    try {
      signatoryToAccount(signatory, context);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Received an Identity where an Account was expected. Please report this issue to the Polymath team'
    );
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

  it('should return the Identity DID string', () => {
    const did = 'someDid';
    const context = dsMockUtils.getContextInstance();
    const identity = new Identity({ did }, context);

    const result = signerToString(identity);

    expect(result).toBe(did);
  });

  it('should return the Account address string', () => {
    const address = DUMMY_ACCOUNT_ID;
    const context = dsMockUtils.getContextInstance();

    const account = new Account({ address }, context);

    const result = signerToString(account);

    expect(result).toBe(address);
  });

  it('should return the same address string that it receives', () => {
    const address = DUMMY_ACCOUNT_ID;
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

  describe('authorizationToAuthorizationData', () => {
    it('should convert an Authorization to a polkadot AuthorizationData object', () => {
      const ticker = 'TICKER_NAME';
      const context = dsMockUtils.getContextInstance();

      let value: Authorization = {
        type: AuthorizationType.AttestPrimaryKeyRotation,
        value: 'someIdentity',
      };
      const fakeResult = 'AuthorizationDataEnum' as unknown as AuthorizationData;

      const createTypeStub = context.createType;
      createTypeStub
        .withArgs('AuthorizationData', { [value.type]: value.value })
        .returns(fakeResult);

      const fakeTicker = 'convertedTicker' as unknown as Ticker;
      createTypeStub.withArgs('Ticker', padString(ticker, 12)).returns(fakeTicker);

      let result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.JoinIdentity,
        value: {
          assets: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      };

      const rawPermissions = dsMockUtils.createMockPermissions({
        asset: dsMockUtils.createMockAssetPermissions('Whole'),
        portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
        extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
      });

      createTypeStub
        .withArgs('Permissions', sinon.match(sinon.match.object))
        .returns(rawPermissions);
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

      createTypeStub
        .withArgs('PortfolioId', sinon.match(sinon.match.object))
        .returns(rawPortfolioId);
      createTypeStub
        .withArgs('AuthorizationData', {
          [value.type]: rawPortfolioId,
        })
        .returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.RotatePrimaryKey,
      };

      createTypeStub.withArgs('AuthorizationData', { [value.type]: null }).returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      const knownPermissionGroup = entityMockUtils.getKnownPermissionGroupInstance({
        ticker,
        type: PermissionGroupType.Full,
      });

      value = {
        type: AuthorizationType.BecomeAgent,
        value: knownPermissionGroup,
      };

      let rawAgentGroup = 'Full' as unknown as AgentGroup;
      createTypeStub.withArgs('AgentGroup', knownPermissionGroup.type).returns(rawAgentGroup);

      createTypeStub
        .withArgs('AuthorizationData', { [value.type]: [fakeTicker, rawAgentGroup] })
        .returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      const id = new BigNumber(1);
      const customPermissionGroup = entityMockUtils.getCustomPermissionGroupInstance({
        ticker,
        id,
      });

      value = {
        type: AuthorizationType.BecomeAgent,
        value: customPermissionGroup,
      };

      rawAgentGroup = 'Full' as unknown as AgentGroup;
      createTypeStub.withArgs('u32', id.toString()).returns(id);
      createTypeStub.withArgs('AgentGroup', { Custom: id }).returns(rawAgentGroup);

      createTypeStub
        .withArgs('AuthorizationData', { [value.type]: [fakeTicker, rawAgentGroup] })
        .returns(fakeResult);
      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.TransferAssetOwnership,
        value: 'TICKER',
      };

      createTypeStub.withArgs('Ticker', padString('TICKER', MAX_TICKER_LENGTH)).returns(fakeTicker);

      createTypeStub
        .withArgs('AuthorizationData', { [value.type]: fakeTicker })
        .returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.TransferTicker,
        value: 'TICKER',
      };

      createTypeStub.withArgs('Ticker', padString('TICKER', MAX_TICKER_LENGTH)).returns(fakeTicker);

      createTypeStub
        .withArgs('AuthorizationData', { [value.type]: fakeTicker })
        .returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.RotatePrimaryKeyToSecondary,
        value: {
          assets: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      };

      createTypeStub
        .withArgs('Permissions', sinon.match(sinon.match.object))
        .returns(rawPermissions);
      createTypeStub
        .withArgs('AuthorizationData', {
          [value.type]: rawPermissions,
        })
        .returns(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);
    });
  });

  describe('authorizationDataToAuthorization', () => {
    it('should convert a polkadot AuthorizationData object to an Authorization', () => {
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
      };
      authorizationData = dsMockUtils.createMockAuthorizationData('RotatePrimaryKey');

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
        value: expect.objectContaining({ owner: expect.objectContaining({ did: 'someDid' }) }),
      };
      authorizationData = dsMockUtils.createMockAuthorizationData({
        PortfolioCustody: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId('someDid'),
          kind: dsMockUtils.createMockPortfolioKind('Default'),
        }),
      });

      result = authorizationDataToAuthorization(authorizationData, context);
      expect(result).toEqual(fakeResult);

      const portfolioId = new BigNumber(1);
      fakeResult = {
        type: AuthorizationType.PortfolioCustody,
        value: expect.objectContaining({
          owner: expect.objectContaining({ did: 'someDid' }),
          id: portfolioId,
        }),
      };
      authorizationData = dsMockUtils.createMockAuthorizationData({
        PortfolioCustody: dsMockUtils.createMockPortfolioId({
          did: dsMockUtils.createMockIdentityId('someDid'),
          kind: dsMockUtils.createMockPortfolioKind({
            User: dsMockUtils.createMockU64(portfolioId),
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
        value: { assets: null, portfolios: null, transactions: null, transactionGroups: [] },
      };
      authorizationData = dsMockUtils.createMockAuthorizationData({
        JoinIdentity: dsMockUtils.createMockPermissions({
          asset: dsMockUtils.createMockAssetPermissions('Whole'),
          portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
          extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
        }),
      });

      result = authorizationDataToAuthorization(authorizationData, context);
      expect(result).toEqual(fakeResult);

      const beneficiaryAddress = 'beneficiaryAddress';
      const relayerAddress = 'relayerAddress';
      const allowance = new BigNumber(1000);
      fakeResult = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: {
          beneficiary: expect.objectContaining({ address: beneficiaryAddress }),
          subsidizer: expect.objectContaining({ address: relayerAddress }),
          allowance,
        },
      };
      authorizationData = dsMockUtils.createMockAuthorizationData({
        AddRelayerPayingKey: [
          dsMockUtils.createMockAccountId(beneficiaryAddress),
          dsMockUtils.createMockAccountId(relayerAddress),
          dsMockUtils.createMockBalance(allowance.shiftedBy(6)),
        ],
      });

      result = authorizationDataToAuthorization(authorizationData, context);
      expect(result).toEqual(fakeResult);

      const ticker = 'SOME_TICKER';
      const type = PermissionGroupType.Full;
      fakeResult = {
        type: AuthorizationType.BecomeAgent,
        value: expect.objectContaining({
          asset: expect.objectContaining({ ticker }),
          type,
        }),
      };

      authorizationData = dsMockUtils.createMockAuthorizationData({
        BecomeAgent: [dsMockUtils.createMockTicker(ticker), dsMockUtils.createMockAgentGroup(type)],
      });

      result = authorizationDataToAuthorization(authorizationData, context);
      expect(result).toEqual(fakeResult);

      authorizationData = dsMockUtils.createMockAuthorizationData({
        RotatePrimaryKeyToSecondary: dsMockUtils.createMockPermissions({
          asset: dsMockUtils.createMockAssetPermissions('Whole'),
          portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
          extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
        }),
      });
      fakeResult = {
        type: AuthorizationType.RotatePrimaryKeyToSecondary,
        value: { assets: null, portfolios: null, transactions: null, transactionGroups: [] },
      };

      result = authorizationDataToAuthorization(authorizationData, context);
      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if the authorization has an unsupported type', () => {
      const context = dsMockUtils.getContextInstance();
      const authorizationData = dsMockUtils.createMockAuthorizationData(
        'Whatever' as 'RotatePrimaryKey'
      );

      expect(() => authorizationDataToAuthorization(authorizationData, context)).toThrow(
        'Unsupported Authorization Type. Please contact the Polymath team'
      );
    });
  });
});

describe('permissionGroupIdentifierToAgentGroup and agentGroupToPermissionGroupIdentifier', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('permissionGroupIdentifierToAgentGroup', () => {
    it('should convert a PermissionGroupIdentifier to a polkadot AgentGroup object', () => {
      let value: PermissionGroupIdentifier = PermissionGroupType.PolymeshV1Pia;
      const fakeResult = 'convertedAgentGroup' as unknown as AgentGroup;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('AgentGroup', value).returns(fakeResult);

      let result = permissionGroupIdentifierToAgentGroup(value, context);

      expect(result).toEqual(fakeResult);

      const custom = new BigNumber(100);
      value = { custom };

      const u32FakeResult = '100' as unknown as u32;

      context.createType.withArgs('u32', custom.toString()).returns(u32FakeResult);
      context.createType.withArgs('AgentGroup', { Custom: u32FakeResult }).returns(fakeResult);

      result = permissionGroupIdentifierToAgentGroup(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('agentGroupToPermissionGroupIdentifier', () => {
    it('should convert a polkadot AgentGroup object to a PermissionGroupIdentifier', () => {
      let agentGroup = dsMockUtils.createMockAgentGroup('Full');

      let result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.Full);

      agentGroup = dsMockUtils.createMockAgentGroup('ExceptMeta');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.ExceptMeta);

      agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1Caa');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.PolymeshV1Caa);

      agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1Pia');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.PolymeshV1Pia);

      const id = new BigNumber(1);
      const rawAgId = dsMockUtils.createMockU32(id) as AGId;
      agentGroup = dsMockUtils.createMockAgentGroup({ Custom: rawAgId });

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual({ custom: id });
    });
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

  it('should convert a AuthorizationType to a polkadot AuthorizationType object', () => {
    const value = AuthorizationType.TransferTicker;
    const fakeResult = 'convertedAuthorizationType' as unknown as MeshAuthorizationType;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('AuthorizationType', value).returns(fakeResult);

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
  });

  describe('permissionsToMeshPermissions', () => {
    it('should convert a Permissions to a polkadot Permissions object (ordering tx alphabetically)', () => {
      let value: Permissions = {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
      const fakeResult = 'convertedPermission' as unknown as MeshPermissions;
      const context = dsMockUtils.getContextInstance();

      const createTypeStub = context.createType;

      let fakeExtrinsicPermissionsResult: unknown =
        'convertedExtrinsicPermissions' as unknown as ExtrinsicPermissions;
      context.createType
        .withArgs('ExtrinsicPermissions', 'Whole')
        .returns(fakeExtrinsicPermissionsResult);

      createTypeStub
        .withArgs('Permissions', {
          asset: 'Whole',
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: 'Whole',
        })
        .returns(fakeResult);

      let result = permissionsToMeshPermissions(value, context);
      expect(result).toEqual(fakeResult);

      fakeExtrinsicPermissionsResult = {
        These: [
          /* eslint-disable @typescript-eslint/naming-convention */
          {
            pallet_name: 'Identity',
            dispatchable_names: {
              These: ['add_claim'],
            },
          },
          {
            pallet_name: 'Sto',
            dispatchable_names: {
              These: ['create_fundraiser', 'invest'],
            },
          },
          /* eslint-enable @typescript-eslint/naming-convention */
        ],
      };

      createTypeStub
        .withArgs('ExtrinsicPermissions', sinon.match(sinon.match.object))
        .returns(fakeExtrinsicPermissionsResult);

      const ticker = 'SOME_TICKER';
      const did = 'someDid';
      value = {
        assets: {
          values: [entityMockUtils.getAssetInstance({ ticker })],
          type: PermissionType.Include,
        },
        transactions: {
          values: [TxTags.sto.Invest, TxTags.identity.AddClaim, TxTags.sto.CreateFundraiser],
          type: PermissionType.Include,
        },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did })],
          type: PermissionType.Include,
        },
      };

      const rawTicker = dsMockUtils.createMockTicker(ticker);
      const rawPortfolioId = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      });
      createTypeStub
        .withArgs('Permissions', {
          asset: {
            These: [rawTicker],
          },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: {
            These: [rawPortfolioId],
          },
        })
        .returns(fakeResult);
      createTypeStub.withArgs('Ticker', padString(ticker, 12)).returns(rawTicker);
      createTypeStub
        .withArgs('PortfolioId', sinon.match(sinon.match.object))
        .returns(rawPortfolioId);

      result = permissionsToMeshPermissions(value, context);
      expect(result).toEqual(fakeResult);

      fakeExtrinsicPermissionsResult = {
        These: [
          /* eslint-disable @typescript-eslint/naming-convention */
          {
            pallet_name: 'Sto',
            dispatchable_names: { Except: ['invest', 'stop'] },
          },
          /* eslint-enable @typescript-eslint/naming-convention */
        ],
      };

      createTypeStub
        .withArgs('ExtrinsicPermissions', sinon.match(sinon.match.object))
        .returns(fakeExtrinsicPermissionsResult);

      value = {
        assets: null,
        transactions: {
          values: [ModuleName.Sto],
          type: PermissionType.Include,
          exceptions: [TxTags.sto.Invest, TxTags.sto.Stop],
        },
        transactionGroups: [],
        portfolios: null,
      };

      createTypeStub
        .withArgs('Permissions', {
          asset: 'Whole',
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: 'Whole',
        })
        .returns(fakeResult);

      result = permissionsToMeshPermissions(value, context);
      expect(result).toEqual(fakeResult);

      fakeExtrinsicPermissionsResult = {
        Except: [
          /* eslint-disable @typescript-eslint/naming-convention */
          {
            pallet_name: 'Sto',
            dispatchable_names: 'Whole',
          },
          /* eslint-enable @typescript-eslint/naming-convention */
        ],
      };

      createTypeStub
        .withArgs('ExtrinsicPermissions', sinon.match(sinon.match.object))
        .returns(fakeExtrinsicPermissionsResult);

      value = {
        assets: {
          values: [entityMockUtils.getAssetInstance({ ticker })],
          type: PermissionType.Exclude,
        },
        transactions: {
          values: [ModuleName.Sto],
          type: PermissionType.Exclude,
        },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did })],
          type: PermissionType.Exclude,
        },
      };

      createTypeStub
        .withArgs('Permissions', {
          asset: {
            Except: [rawTicker],
          },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: {
            Except: [rawPortfolioId],
          },
        })
        .returns(fakeResult);

      result = permissionsToMeshPermissions(value, context);
      expect(result).toEqual(fakeResult);

      fakeExtrinsicPermissionsResult = {
        These: [
          /* eslint-disable @typescript-eslint/naming-convention */
          {
            pallet_name: 'Identity',
            dispatchable_names: {
              These: ['add_claim'],
            },
          },
          /* eslint-enable @typescript-eslint/naming-convention */
        ],
      };

      createTypeStub
        .withArgs('ExtrinsicPermissions', sinon.match(sinon.match.object))
        .returns(fakeExtrinsicPermissionsResult);

      const tickers = ['B_TICKER', 'A_TICKER', 'C_TICKER'];

      value = {
        assets: {
          values: tickers.map(t => entityMockUtils.getAssetInstance({ ticker: t })),
          type: PermissionType.Include,
        },
        transactions: {
          values: [TxTags.identity.AddClaim],
          type: PermissionType.Include,
        },
        transactionGroups: [],
        portfolios: {
          values: [entityMockUtils.getDefaultPortfolioInstance({ did })],
          type: PermissionType.Include,
        },
      };

      const rawTickers = tickers.map(t => dsMockUtils.createMockTicker(t));
      createTypeStub
        .withArgs('Permissions', {
          asset: { These: [rawTickers[1], rawTickers[0], rawTickers[2]] },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: { These: [rawPortfolioId] },
        })
        .returns(fakeResult);

      tickers.forEach((t, i) =>
        createTypeStub.withArgs('Ticker', padString(t, 12)).returns(rawTickers[i])
      );

      result = permissionsToMeshPermissions(value, context);
      expect(result).toEqual(fakeResult);
    });

    it('should throw an error if attempting to add permissions for specific transactions as well as the entire module', () => {
      const value: Permissions = {
        assets: null,
        transactions: {
          values: [TxTags.sto.Invest, ModuleName.Sto],
          type: PermissionType.Include,
        },
        transactionGroups: [],
        portfolios: null,
      };
      const context = dsMockUtils.getContextInstance();

      expect(() => permissionsToMeshPermissions(value, context)).toThrow(
        'Attempting to add permissions for specific transactions as well as the entire module'
      );
    });

    it('should throw an error if user simultaneously include and exclude transactions belonging to the same module', () => {
      const value: Permissions = {
        assets: null,
        transactions: {
          values: [TxTags.sto.Invest, TxTags.identity.AddClaim, TxTags.sto.CreateFundraiser],
          type: PermissionType.Exclude,
          exceptions: [TxTags.sto.Stop],
        },
        transactionGroups: [],
        portfolios: null,
      };
      const context = dsMockUtils.getContextInstance();

      expect(() => permissionsToMeshPermissions(value, context)).toThrow(
        'Cannot simultaneously include and exclude transactions belonging to the same module'
      );
    });

    it('should throw an error if attempting to add a transaction permission exception without its corresponding module being included/excluded', () => {
      const value: Permissions = {
        assets: null,
        transactions: {
          values: [],
          type: PermissionType.Exclude,
          exceptions: [TxTags.sto.Stop],
        },
        transactionGroups: [],
        portfolios: null,
      };
      const context = dsMockUtils.getContextInstance();

      expect(() => permissionsToMeshPermissions(value, context)).toThrow(
        'Attempting to add a transaction permission exception without its corresponding module being included/excluded'
      );
    });
  });

  describe('meshPermissionsToPermissions', () => {
    it('should convert a polkadot Permissions object to a Permissions', () => {
      const context = dsMockUtils.getContextInstance();
      const ticker = 'someTicker';
      const did = 'someDid';
      let fakeResult: Permissions = {
        assets: {
          values: [expect.objectContaining({ ticker })],
          type: PermissionType.Include,
        },
        transactions: {
          type: PermissionType.Include,
          values: [TxTags.identity.AddClaim, ModuleName.Authorship],
        },
        transactionGroups: [],
        portfolios: {
          values: [expect.objectContaining({ owner: expect.objectContaining({ did }) })],
          type: PermissionType.Include,
        },
      };
      let permissions = dsMockUtils.createMockPermissions({
        asset: dsMockUtils.createMockAssetPermissions({
          These: [dsMockUtils.createMockTicker(ticker)],
        }),
        extrinsic: dsMockUtils.createMockExtrinsicPermissions({
          These: [
            /* eslint-disable @typescript-eslint/naming-convention */
            dsMockUtils.createMockPalletPermissions({
              pallet_name: dsMockUtils.createMockPalletName('Identity'),
              dispatchable_names: dsMockUtils.createMockDispatchableNames({
                These: [dsMockUtils.createMockDispatchableName('add_claim')],
              }),
            }),
            dsMockUtils.createMockPalletPermissions({
              pallet_name: dsMockUtils.createMockPalletName('Authorship'),
              dispatchable_names: dsMockUtils.createMockDispatchableNames('Whole'),
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
          ],
        }),
        portfolio: dsMockUtils.createMockPortfolioPermissions({
          These: [
            dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(did),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
          ],
        }),
      });

      let result = meshPermissionsToPermissions(permissions, context);
      expect(result).toEqual(fakeResult);

      fakeResult = {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
      permissions = dsMockUtils.createMockPermissions({
        asset: dsMockUtils.createMockAssetPermissions('Whole'),
        portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
        extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
      });

      result = meshPermissionsToPermissions(permissions, context);
      expect(result).toEqual(fakeResult);

      fakeResult = {
        assets: {
          values: [expect.objectContaining({ ticker })],
          type: PermissionType.Exclude,
        },
        transactions: {
          type: PermissionType.Exclude,
          values: [ModuleName.Identity],
          exceptions: [TxTags.identity.AddClaim],
        },
        transactionGroups: [],
        portfolios: {
          values: [expect.objectContaining({ owner: expect.objectContaining({ did }) })],
          type: PermissionType.Exclude,
        },
      };

      permissions = dsMockUtils.createMockPermissions({
        asset: dsMockUtils.createMockAssetPermissions({
          Except: [dsMockUtils.createMockTicker(ticker)],
        }),
        extrinsic: dsMockUtils.createMockExtrinsicPermissions({
          Except: [
            /* eslint-disable @typescript-eslint/naming-convention */
            dsMockUtils.createMockPalletPermissions({
              pallet_name: dsMockUtils.createMockPalletName('Identity'),
              dispatchable_names: dsMockUtils.createMockDispatchableNames({
                Except: [dsMockUtils.createMockDispatchableName('add_claim')],
              }),
            }),
            /* eslint-enable @typescript-eslint/naming-convention */
          ],
        }),
        portfolio: dsMockUtils.createMockPortfolioPermissions({
          Except: [
            dsMockUtils.createMockPortfolioId({
              did: dsMockUtils.createMockIdentityId(did),
              kind: dsMockUtils.createMockPortfolioKind('Default'),
            }),
          ],
        }),
      });

      result = meshPermissionsToPermissions(permissions, context);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('bigNumberToU64 and u64ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('bigNumberToU64', () => {
    it('should convert a number to a polkadot u64 object', () => {
      const value = new BigNumber(100);
      const fakeResult = '100' as unknown as u64;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('u64', value.toString()).returns(fakeResult);

      const result = bigNumberToU64(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the number is negative', () => {
      const value = new BigNumber(-100);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU64(value, context)).toThrow();
    });

    it('should throw an error if the number is not an integer', () => {
      const value = new BigNumber(1.5);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU64(value, context)).toThrow();
    });
  });

  describe('u64ToBigNumber', () => {
    it('should convert a polkadot u64 object to a BigNumber', () => {
      const fakeResult = new BigNumber(100);
      const num = dsMockUtils.createMockU64(fakeResult);

      const result = u64ToBigNumber(num);
      expect(result).toEqual(new BigNumber(fakeResult));
    });
  });
});

describe('bigNumberToU32 and u32ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('bigNumberToU32', () => {
    it('should convert a number to a polkadot u32 object', () => {
      const value = new BigNumber(100);
      const fakeResult = '100' as unknown as u32;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('u32', value.toString()).returns(fakeResult);

      const result = bigNumberToU32(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the number is negative', () => {
      const value = new BigNumber(-100);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU32(value, context)).toThrow();
    });

    it('should throw an error if the number is not an integer', () => {
      const value = new BigNumber(1.5);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToU32(value, context)).toThrow();
    });
  });

  describe('u32ToBigNumber', () => {
    it('should convert a polkadot u32 object to a BigNumber', () => {
      const fakeResult = new BigNumber(100);
      const num = dsMockUtils.createMockU32(fakeResult);

      const result = u32ToBigNumber(num);
      expect(result).toEqual(new BigNumber(fakeResult));
    });
  });
});

describe('u8ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot u8 object to a BigNumber', () => {
    const fakeResult = new BigNumber(100);
    const num = dsMockUtils.createMockU8(fakeResult);

    const result = u8ToBigNumber(num);
    expect(result).toEqual(new BigNumber(fakeResult));
  });
});

describe('percentageToPermill and permillToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('percentageToPermill', () => {
    it('should convert a number to a polkadot Permill object', () => {
      const value = new BigNumber(49);
      const fakeResult = '100' as unknown as Permill;
      const context = dsMockUtils.getContextInstance();

      context.createType
        .withArgs('Permill', value.multipliedBy(Math.pow(10, 4)).toString())
        .returns(fakeResult);

      const result = percentageToPermill(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the number is negative', () => {
      const value = new BigNumber(-10);
      const context = dsMockUtils.getContextInstance();

      expect(() => percentageToPermill(value, context)).toThrow();
    });

    it('should throw an error if the number is greater than 100', () => {
      const value = new BigNumber(250);
      const context = dsMockUtils.getContextInstance();

      expect(() => percentageToPermill(value, context)).toThrow();
    });
  });

  describe('permillToBigNumber', () => {
    it('should convert a polkadot Permill object to a BigNumber', () => {
      const fakeResult = new BigNumber(490000);
      const permill = dsMockUtils.createMockPermill(fakeResult);

      const result = permillToBigNumber(permill);
      expect(result).toEqual(new BigNumber(49));
    });
  });
});

describe('bigNumberToBalance and balanceToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('bigNumberToBalance', () => {
    it('should convert a number to a polkadot Balance object', () => {
      let value = new BigNumber(100);
      const fakeResult = '100' as unknown as Balance;
      const context = dsMockUtils.getContextInstance();

      context.createType
        .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
        .returns(fakeResult);

      let result = bigNumberToBalance(value, context, false);

      expect(result).toBe(fakeResult);

      value = new BigNumber(100.1);

      context.createType
        .withArgs('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
        .returns(fakeResult);

      result = bigNumberToBalance(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the value exceeds the max balance', () => {
      const value = new BigNumber(Math.pow(20, 15));
      const context = dsMockUtils.getContextInstance();

      let error;

      try {
        bigNumberToBalance(value, context);
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('The value exceeds the maximum possible balance');
      expect(error.data).toMatchObject({ currentValue: value, amountLimit: MAX_BALANCE });
    });

    it('should throw an error if the value has more decimal places than allowed', () => {
      const value = new BigNumber(50.1234567);
      const context = dsMockUtils.getContextInstance();

      let error;

      try {
        bigNumberToBalance(value, context);
      } catch (err) {
        error = err;
      }

      expect(error.message).toBe('The value has more decimal places than allowed');
      expect(error.data).toMatchObject({ currentValue: value, decimalsLimit: MAX_DECIMALS });
    });

    it('should throw an error if the value has decimals and the Asset is indivisible', () => {
      const value = new BigNumber(50.1234567);
      const context = dsMockUtils.getContextInstance();

      expect(() => bigNumberToBalance(value, context, false)).toThrow(
        'The value has decimals but the Asset is indivisible'
      );
    });
  });

  describe('balanceToBigNumber', () => {
    it('should convert a polkadot Balance object to a BigNumber', () => {
      const fakeResult = new BigNumber(100);
      const balance = dsMockUtils.createMockBalance(fakeResult);

      const result = balanceToBigNumber(balance);
      expect(result).toEqual(new BigNumber(fakeResult).shiftedBy(-6));
    });
  });
});

describe('isIsinValid, isCusipValid and isLeiValid', () => {
  describe('isIsinValid', () => {
    it('should return if the Isin value identifier is valid or not', () => {
      const correct = isIsinValid('US0378331005');
      let incorrect = isIsinValid('US0373431005');

      expect(correct).toBeTruthy();
      expect(incorrect).toBeFalsy();

      incorrect = isIsinValid('US0373431');
      expect(incorrect).toBeFalsy();
    });
  });

  describe('isCusipValid', () => {
    it('should return if the Cusip value identifier is valid or not', () => {
      const correct = isCusipValid('037833100');
      let incorrect = isCusipValid('037831200');

      expect(correct).toBeTruthy();
      expect(incorrect).toBeFalsy();

      incorrect = isCusipValid('037831');

      expect(incorrect).toBeFalsy();

      incorrect = isCusipValid('0378312CD');

      expect(incorrect).toBeFalsy();
    });
  });

  describe('isLeiValid', () => {
    it('should return if the Lei value identifier is valid or not', () => {
      /* cSpell: disable */
      const correct = isLeiValid('724500VKKSH9QOLTFR81');
      let incorrect = isLeiValid('969500T3MBS4SQAMHJ45');

      expect(correct).toBeTruthy();
      expect(incorrect).toBeFalsy();

      incorrect = isLeiValid('969500T3MS4SQAMHJ4');
      expect(incorrect).toBeFalsy();
      /* cSpell: enable */
    });
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

  it('should convert a string to a polkadot Memo object', () => {
    const value = 'someDescription';
    const fakeResult = 'memoDescription' as unknown as Memo;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('Memo', padString(value, 32)).returns(fakeResult);

    const result = stringToMemo(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should throw an error if the value exceeds the maximum length', () => {
    const value = 'someVeryLongDescriptionThatIsDefinitelyLongerThanTheMaxLength';
    const context = dsMockUtils.getContextInstance();

    expect(() => stringToMemo(value, context)).toThrow('Max memo length exceeded');
  });
});

describe('u8ToTransferStatus', () => {
  it('should convert a polkadot u8 object to a TransferStatus', () => {
    let result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(80)));

    expect(result).toBe(TransferStatus.Failure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(81)));

    expect(result).toBe(TransferStatus.Success);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(82)));

    expect(result).toBe(TransferStatus.InsufficientBalance);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(83)));

    expect(result).toBe(TransferStatus.InsufficientAllowance);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(84)));

    expect(result).toBe(TransferStatus.TransfersHalted);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(85)));

    expect(result).toBe(TransferStatus.FundsLocked);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(86)));

    expect(result).toBe(TransferStatus.InvalidSenderAddress);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(87)));

    expect(result).toBe(TransferStatus.InvalidReceiverAddress);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(88)));

    expect(result).toBe(TransferStatus.InvalidOperator);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(160)));

    expect(result).toBe(TransferStatus.InvalidSenderIdentity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(161)));

    expect(result).toBe(TransferStatus.InvalidReceiverIdentity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(162)));

    expect(result).toBe(TransferStatus.ComplianceFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(163)));

    expect(result).toBe(TransferStatus.SmartExtensionFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(164)));

    expect(result).toBe(TransferStatus.InvalidGranularity);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(165)));

    expect(result).toBe(TransferStatus.VolumeLimitReached);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(166)));

    expect(result).toBe(TransferStatus.BlockedTransaction);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(168)));

    expect(result).toBe(TransferStatus.FundsLimitReached);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(169)));

    expect(result).toBe(TransferStatus.PortfolioFailure);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(170)));

    expect(result).toBe(TransferStatus.CustodianError);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(171)));

    expect(result).toBe(TransferStatus.ScopeClaimMissing);

    result = u8ToTransferStatus(dsMockUtils.createMockU8(new BigNumber(172)));

    expect(result).toBe(TransferStatus.TransferRestrictionFailure);

    const fakeStatusCode = new BigNumber(1);
    expect(() => u8ToTransferStatus(dsMockUtils.createMockU8(fakeStatusCode))).toThrow(
      `Unsupported status code "${fakeStatusCode}". Please report this issue to the Polymath team`
    );
  });
});

describe('internalSecurityTypeToAssetType and assetTypeToKnownOrId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('internalSecurityTypeToAssetType', () => {
    it('should convert an AssetType to a polkadot AssetType object', () => {
      const value = KnownAssetType.Commodity;
      const fakeResult = 'CommodityEnum' as unknown as AssetType;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('AssetType', value).returns(fakeResult);

      const result = internalAssetTypeToAssetType(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('assetTypeToKnownOrId', () => {
    it('should convert a polkadot AssetType object to a string', () => {
      let fakeResult = KnownAssetType.Commodity;
      let assetType = dsMockUtils.createMockAssetType(fakeResult);

      let result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.EquityCommon;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.EquityPreferred;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.Commodity;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.FixedIncome;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.Reit;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.Fund;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.RevenueShareAgreement;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.StructuredProduct;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.Derivative;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      fakeResult = KnownAssetType.StableCoin;
      assetType = dsMockUtils.createMockAssetType(fakeResult);

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(fakeResult);

      assetType = dsMockUtils.createMockAssetType({
        Custom: dsMockUtils.createMockU32(new BigNumber(1)),
      });

      result = assetTypeToKnownOrId(assetType);
      expect(result).toEqual(new BigNumber(1));
    });
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

  it('should convert a polkadot PosRatio object to a BigNumber', () => {
    const numerator = new BigNumber(1);
    const denominator = new BigNumber(1);
    const balance = dsMockUtils.createMockPosRatio(numerator, denominator);

    const result = posRatioToBigNumber(balance);
    expect(result).toEqual(new BigNumber(numerator).dividedBy(new BigNumber(denominator)));
  });
});

describe('securityIdentifierToAssetIdentifier and assetIdentifierToSecurityIdentifier', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('securityIdentifierToAssetIdentifier', () => {
    it('should convert a SecurityIdentifier to a polkadot AssetIdentifier object', () => {
      const isinValue = 'US0378331005';
      // cSpell: disable-next-line
      const leiValue = '724500VKKSH9QOLTFR81';
      const cusipValue = '037833100';

      let value = { type: SecurityIdentifierType.Isin, value: isinValue };
      const fakeResult = 'IsinEnum' as unknown as AssetIdentifier;
      const context = dsMockUtils.getContextInstance();

      context.createType
        .withArgs('AssetIdentifier', { [SecurityIdentifierType.Isin]: isinValue })
        .returns(fakeResult);

      let result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);

      value = { type: SecurityIdentifierType.Lei, value: leiValue };

      context.createType
        .withArgs('AssetIdentifier', { [SecurityIdentifierType.Lei]: leiValue })
        .returns(fakeResult);

      result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);

      value = { type: SecurityIdentifierType.Cusip, value: cusipValue };

      context.createType
        .withArgs('AssetIdentifier', { [SecurityIdentifierType.Cusip]: cusipValue })
        .returns(fakeResult);

      result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if some identifier is invalid', () => {
      const context = dsMockUtils.getContextInstance();

      let identifier = { type: SecurityIdentifierType.Isin, value: 'US0373431005' };

      expect(() => securityIdentifierToAssetIdentifier(identifier, context)).toThrow(
        `Invalid security identifier ${identifier.value} of type Isin`
      );

      // cSpell: disable-next-line
      identifier = { type: SecurityIdentifierType.Lei, value: '969500T3MBS4SQAMHJ45' };

      expect(() => securityIdentifierToAssetIdentifier(identifier, context)).toThrow(
        `Invalid security identifier ${identifier.value} of type Lei`
      );

      identifier = { type: SecurityIdentifierType.Cusip, value: '037831200' };

      expect(() => securityIdentifierToAssetIdentifier(identifier, context)).toThrow(
        `Invalid security identifier ${identifier.value} of type Cusip`
      );
    });
  });

  describe('assetIdentifierToSecurityIdentifier', () => {
    it('should convert a polkadot AssetIdentifier object to a SecurityIdentifier', () => {
      let fakeResult = { type: SecurityIdentifierType.Isin, value: 'someValue' };
      let identifier = dsMockUtils.createMockAssetIdentifier({
        [SecurityIdentifierType.Isin]: dsMockUtils.createMockU8aFixed('someValue'),
      });

      let result = assetIdentifierToSecurityIdentifier(identifier);
      expect(result).toEqual(fakeResult);

      fakeResult = { type: SecurityIdentifierType.Cusip, value: 'someValue' };
      identifier = dsMockUtils.createMockAssetIdentifier({
        [SecurityIdentifierType.Cusip]: dsMockUtils.createMockU8aFixed('someValue'),
      });

      result = assetIdentifierToSecurityIdentifier(identifier);
      expect(result).toEqual(fakeResult);

      fakeResult = { type: SecurityIdentifierType.Cins, value: 'someValue' };
      identifier = dsMockUtils.createMockAssetIdentifier({
        [SecurityIdentifierType.Cins]: dsMockUtils.createMockU8aFixed('someValue'),
      });

      result = assetIdentifierToSecurityIdentifier(identifier);
      expect(result).toEqual(fakeResult);

      fakeResult = { type: SecurityIdentifierType.Lei, value: 'someValue' };
      identifier = dsMockUtils.createMockAssetIdentifier({
        [SecurityIdentifierType.Lei]: dsMockUtils.createMockU8aFixed('someValue'),
      });

      result = assetIdentifierToSecurityIdentifier(identifier);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToFundingRoundName', () => {
    it('should convert a string to a polkadot FundingRoundName object', () => {
      const value = 'someName';
      const fakeResult = 'convertedName' as unknown as FundingRoundName;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('FundingRoundName', value).returns(fakeResult);

      const result = stringToFundingRoundName(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('fundingRoundNameToString', () => {
    it('should convert a polkadot FundingRoundName object to a string', () => {
      const fakeResult = 'someFundingRoundName';
      const roundName = dsMockUtils.createMockFundingRoundName(fakeResult);

      const result = fundingRoundNameToString(roundName);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToDocumentName', () => {
    it('should convert a string to a polkadot DocumentName object', () => {
      const value = 'someName';
      const fakeResult = 'convertedName' as unknown as DocumentName;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('DocumentName', value).returns(fakeResult);

      const result = stringToDocumentName(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentNameToString', () => {
    it('should convert a polkadot DocumentName object to a string', () => {
      const fakeResult = 'someDocumentName';
      const docName = dsMockUtils.createMockDocumentName(fakeResult);

      const result = documentNameToString(docName);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToDocumentUri', () => {
    it('should convert a string to a polkadot DocumentUri object', () => {
      const value = 'someUri';
      const fakeResult = 'convertedUri' as unknown as DocumentUri;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('DocumentUri', value).returns(fakeResult);

      const result = stringToDocumentUri(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentUriToString', () => {
    it('documentUriToString should convert a polkadot DocumentUri object to a string', () => {
      const fakeResult = 'someDocumentUri';
      const docUri = dsMockUtils.createMockDocumentUri(fakeResult);

      const result = documentUriToString(docUri);
      expect(result).toEqual(fakeResult);
    });
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

  describe('stringToDocumentHash', () => {
    it('should throw if document hash is not prefixed with 0x', () => {
      expect(() => stringToDocumentHash('', dsMockUtils.getContextInstance())).toThrow(
        'Document hash must be a hexadecimal string prefixed by 0x'
      );
    });

    it('should throw if document hash is longer than 128 characters', () => {
      expect(() =>
        stringToDocumentHash('0x'.padEnd(131, '1'), dsMockUtils.getContextInstance())
      ).toThrow('Document hash exceeds max length');
    });

    it('should convert a string to a polkadot DocumentHash object', () => {
      const fakeResult = 'convertedHash' as unknown as DocumentHash;
      const context = dsMockUtils.getContextInstance();

      const createTypeStub = context.createType;

      createTypeStub.withArgs('DocumentHash', 'None').returns(fakeResult);

      let result = stringToDocumentHash(undefined, context);

      expect(result).toEqual(fakeResult);

      let value = '0x1';
      createTypeStub
        .withArgs('DocumentHash', { H128: hexToU8a(value.padEnd(34, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(35, '1');
      createTypeStub
        .withArgs('DocumentHash', { H160: hexToU8a(value.padEnd(42, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(43, '1');
      createTypeStub
        .withArgs('DocumentHash', { H192: hexToU8a(value.padEnd(50, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(51, '1');
      createTypeStub
        .withArgs('DocumentHash', { H224: hexToU8a(value.padEnd(58, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(59, '1');
      createTypeStub
        .withArgs('DocumentHash', { H256: hexToU8a(value.padEnd(66, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(67, '1');
      createTypeStub
        .withArgs('DocumentHash', { H320: hexToU8a(value.padEnd(82, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(83, '1');
      createTypeStub
        .withArgs('DocumentHash', { H384: hexToU8a(value.padEnd(98, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(99, '1');
      createTypeStub
        .withArgs('DocumentHash', { H512: hexToU8a(value.padEnd(130, '0')) })
        .returns(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentHashToString', () => {
    it('should convert a polkadot DocumentHash object to a string', () => {
      const fakeResult = '0x01';
      let docHash = dsMockUtils.createMockDocumentHash({
        H128: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      let result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H160: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H192: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H224: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H256: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H320: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H384: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash({
        H512: dsMockUtils.createMockU8aFixed(fakeResult, true),
      });

      result = documentHashToString(docHash);
      expect(result).toEqual(fakeResult);

      docHash = dsMockUtils.createMockDocumentHash('None');

      result = documentHashToString(docHash);
      expect(result).toBeUndefined();
    });
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

  describe('stringToDocumentType', () => {
    it('should convert a string to a polkadot DocumentType object', () => {
      const value = 'someType';
      const fakeResult = 'convertedType' as unknown as DocumentType;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('DocumentType', value).returns(fakeResult);

      const result = stringToDocumentType(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentTypeToString', () => {
    it('should convert a polkadot DocumentType object to a string', () => {
      const fakeResult = 'someDocumentType';
      const docType = dsMockUtils.createMockDocumentType(fakeResult);

      const result = documentTypeToString(docType);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('assetDocumentToDocument and documentToAssetDocument', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('assetDocumentToDocument', () => {
    it('should convert an AssetDocument object to a polkadot Document object', () => {
      const uri = 'someUri';
      const contentHash = '0x01';
      const name = 'someName';
      const type = 'someType';
      const filedAt = new Date();
      const value = {
        uri,
        contentHash,
        name,
      };
      const fakeResult = 'convertedDocument' as unknown as Document;
      const context = dsMockUtils.getContextInstance();

      context.createType
        .withArgs('Document', {
          uri: stringToDocumentUri(uri, context),
          name: stringToDocumentName(name, context),
          /* eslint-disable @typescript-eslint/naming-convention */
          content_hash: stringToDocumentHash(contentHash, context),
          doc_type: null,
          filing_date: null,
          /* eslint-enable @typescript-eslint/naming-convention */
        })
        .returns(fakeResult);

      let result = assetDocumentToDocument(value, context);
      expect(result).toEqual(fakeResult);

      context.createType
        .withArgs('Document', {
          uri: stringToDocumentUri(uri, context),
          name: stringToDocumentName(name, context),
          /* eslint-disable @typescript-eslint/naming-convention */
          content_hash: stringToDocumentHash(contentHash, context),
          doc_type: stringToDocumentType(type, context),
          filing_date: dateToMoment(filedAt, context),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
        .returns(fakeResult);

      result = assetDocumentToDocument({ ...value, filedAt, type }, context);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentToAssetDocument', () => {
    it('should convert a polkadot Document object to an AssetDocument object', () => {
      const name = 'someName';
      const uri = 'someUri';
      const contentHash = '0x111111';
      const filedAt = new Date();
      const type = 'someType';
      let fakeResult: AssetDocument = {
        name,
        uri,
      };

      let doc = dsMockUtils.createMockDocument({
        uri: dsMockUtils.createMockDocumentUri(uri),
        name: dsMockUtils.createMockDocumentName(name),
        /* eslint-disable @typescript-eslint/naming-convention */
        content_hash: dsMockUtils.createMockDocumentHash('None'),
        doc_type: dsMockUtils.createMockOption(),
        filing_date: dsMockUtils.createMockOption(),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      let result = documentToAssetDocument(doc);
      expect(result).toEqual(fakeResult);

      fakeResult = {
        ...fakeResult,
        contentHash,
        filedAt,
        type,
      };

      doc = dsMockUtils.createMockDocument({
        uri: dsMockUtils.createMockDocumentUri(uri),
        name: dsMockUtils.createMockDocumentName(name),
        /* eslint-disable @typescript-eslint/naming-convention */
        content_hash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash, true),
        }),
        doc_type: dsMockUtils.createMockOption(dsMockUtils.createMockDocumentType(type)),
        filing_date: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime()))
        ),
        /* eslint-enable @typescript-eslint/naming-convention */
      });

      result = documentToAssetDocument(doc);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('cddStatusToBoolean', () => {
  it('should convert a valid CDD status to a true boolean', async () => {
    const cddStatusMock = dsMockUtils.createMockCddStatus({
      Ok: dsMockUtils.createMockIdentityId(),
    });
    const result = cddStatusToBoolean(cddStatusMock);

    expect(result).toEqual(true);
  });

  it('should convert an invalid CDD status to a false boolean', async () => {
    const cddStatusMock = dsMockUtils.createMockCddStatus();
    const result = cddStatusToBoolean(cddStatusMock);

    expect(result).toEqual(false);
  });
});

describe('canTransferResultToTransferStatus', () => {
  it('should convert a polkadot CanTransferResult object to a TransferStatus', () => {
    const errorMsg = 'someError';
    expect(() =>
      canTransferResultToTransferStatus(
        dsMockUtils.createMockCanTransferResult({
          Err: dsMockUtils.createMockBytes(errorMsg),
        })
      )
    ).toThrow(`Error while checking transfer validity: ${errorMsg}`);

    const result = canTransferResultToTransferStatus(
      dsMockUtils.createMockCanTransferResult({ Ok: dsMockUtils.createMockU8(new BigNumber(81)) })
    );

    expect(result).toBe(TransferStatus.Success);
  });
});

describe('granularCanTransferResultToTransferBreakdown', () => {
  it('should convert a polkadot GranularCanTransferResult object to a TransferBreakdown', () => {
    const context = dsMockUtils.getContextInstance();
    let result = granularCanTransferResultToTransferBreakdown(
      dsMockUtils.createMockGranularCanTransferResult({
        /* eslint-disable @typescript-eslint/naming-convention */
        invalid_granularity: true,
        self_transfer: true,
        invalid_receiver_cdd: true,
        invalid_sender_cdd: true,
        missing_scope_claim: true,
        receiver_custodian_error: true,
        sender_custodian_error: true,
        sender_insufficient_balance: true,
        portfolio_validity_result: {
          receiver_is_same_portfolio: true,
          sender_portfolio_does_not_exist: true,
          receiver_portfolio_does_not_exist: true,
          sender_insufficient_balance: true,
          result: false,
        },
        asset_frozen: true,
        statistics_result: [
          {
            tm: {
              CountTransferManager: dsMockUtils.createMockU64(new BigNumber(100)),
            },
            result: false,
          },
        ],
        compliance_result: dsMockUtils.createMockAssetComplianceResult({
          paused: false,
          requirements: [],
          result: false,
        }),
        result: false,
        /* eslint-enable @typescript-eslint/naming-convention */
      }),
      context
    );

    expect(result).toEqual({
      general: [
        TransferError.InvalidGranularity,
        TransferError.SelfTransfer,
        TransferError.InvalidReceiverCdd,
        TransferError.InvalidSenderCdd,
        TransferError.ScopeClaimMissing,
        TransferError.InsufficientBalance,
        TransferError.TransfersFrozen,
        TransferError.InvalidSenderPortfolio,
        TransferError.InvalidReceiverPortfolio,
        TransferError.InsufficientPortfolioBalance,
      ],
      compliance: {
        requirements: [],
        complies: false,
      },
      restrictions: [
        {
          restriction: {
            type: TransferRestrictionType.Count,
            value: new BigNumber(100),
          },
          result: false,
        },
      ],
      result: false,
    });

    result = granularCanTransferResultToTransferBreakdown(
      dsMockUtils.createMockGranularCanTransferResult({
        /* eslint-disable @typescript-eslint/naming-convention */
        invalid_granularity: false,
        self_transfer: false,
        invalid_receiver_cdd: false,
        invalid_sender_cdd: false,
        missing_scope_claim: false,
        receiver_custodian_error: false,
        sender_custodian_error: false,
        sender_insufficient_balance: false,
        portfolio_validity_result: {
          receiver_is_same_portfolio: false,
          sender_portfolio_does_not_exist: false,
          receiver_portfolio_does_not_exist: false,
          sender_insufficient_balance: false,
          result: false,
        },
        asset_frozen: false,
        statistics_result: [
          {
            tm: {
              CountTransferManager: dsMockUtils.createMockU64(new BigNumber(100)),
            },
            result: false,
          },
        ],
        compliance_result: dsMockUtils.createMockAssetComplianceResult({
          paused: false,
          requirements: [],
          result: false,
        }),
        result: false,
        /* eslint-enable @typescript-eslint/naming-convention */
      }),
      context
    );

    expect(result).toEqual({
      general: [],
      compliance: {
        requirements: [],
        complies: false,
      },
      restrictions: [
        {
          restriction: {
            type: TransferRestrictionType.Count,
            value: new BigNumber(100),
          },
          result: false,
        },
      ],
      result: false,
    });
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

  describe('scopeToMeshScope', () => {
    it('should convert a Custom type Scope into a polkadot Scope object', () => {
      const context = dsMockUtils.getContextInstance();
      const value: Scope = {
        type: ScopeType.Custom,
        value: 'someValue',
      };
      const fakeResult = 'ScopeEnum' as unknown as MeshScope;

      context.createType.withArgs('Scope', { [value.type]: value.value }).returns(fakeResult);

      const result = scopeToMeshScope(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should convert a Identity type Scope into a polkadot Scope object', () => {
      const context = dsMockUtils.getContextInstance();
      const value: Scope = {
        type: ScopeType.Identity,
        value: '0x51a5fed99b9d305ef26e6af92dd3dcb181a30a07dc5f075e260b82a92d48913c',
      };
      const fakeResult = 'ScopeEnum' as unknown as MeshScope;
      const fakeIdentityId =
        '0x51a5fed99b9d305ef26e6af92dd3dcb181a30a07dc5f075e260b82a92d48913c' as unknown as IdentityId;

      context.createType.withArgs('IdentityId', value.value).returns(fakeIdentityId);

      context.createType.withArgs('Scope', { [value.type]: fakeIdentityId }).returns(fakeResult);

      const result = scopeToMeshScope(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should convert a Ticker type Scope into a polkadot Scope object', () => {
      const context = dsMockUtils.getContextInstance();
      const value: Scope = {
        type: ScopeType.Ticker,
        value: 'SOME_TICKER',
      };
      const fakeResult = 'ScopeEnum' as unknown as MeshScope;
      const fakeTicker = 'SOME_TICKER' as unknown as Ticker;

      context.createType
        .withArgs('Ticker', padString(value.value, MAX_TICKER_LENGTH))
        .returns(fakeTicker);

      context.createType.withArgs('Scope', { [value.type]: fakeTicker }).returns(fakeResult);

      const result = scopeToMeshScope(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshScopeToScope', () => {
    it('should convert a polkadot Scope object into a Scope', () => {
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

  describe('claimToMeshClaim', () => {
    it('should convert a Claim to a polkadot Claim object', () => {
      const context = dsMockUtils.getContextInstance();
      let value: Claim = {
        type: ClaimType.Jurisdiction,
        code: CountryCode.Cl,
        scope: { type: ScopeType.Identity, value: 'someTickerDid' },
      };
      const fakeResult = 'meshClaim' as unknown as MeshClaim;
      const fakeScope = 'scope' as unknown as MeshScope;

      const createTypeStub = context.createType;

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
        scope: { type: ScopeType.Ticker, value: 'SOME_TICKER' },
        cddId: 'someCddId',
        scopeId: 'someScopeId',
      };

      createTypeStub
        .withArgs('Claim', {
          [value.type]: [
            scopeToMeshScope(value.scope, context),
            stringToScopeId(value.scopeId, context),
            stringToCddId(value.cddId, context),
          ],
        })
        .returns(fakeResult);

      result = claimToMeshClaim(value, context);

      expect(result).toBe(fakeResult);

      value = {
        type: ClaimType.InvestorUniquenessV2,
        cddId: 'someCddId',
      };

      createTypeStub
        .withArgs('Claim', {
          [value.type]: stringToCddId(value.cddId, context),
        })
        .returns(fakeResult);

      result = claimToMeshClaim(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshClaimToClaim', () => {
    it('should convert a polkadot Claim object to a Claim', () => {
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

      fakeResult = {
        type: ClaimType.InvestorUniqueness,
        scope,
        scopeId: 'scopeId',
        cddId: 'cddId',
      };
      claim = dsMockUtils.createMockClaim({
        InvestorUniqueness: [
          dsMockUtils.createMockScope({ Identity: dsMockUtils.createMockIdentityId(scope.value) }),
          dsMockUtils.createMockScopeId(fakeResult.scopeId),
          dsMockUtils.createMockCddId(fakeResult.cddId),
        ],
      });

      result = meshClaimToClaim(claim);
      expect(result).toEqual(fakeResult);

      fakeResult = {
        type: ClaimType.InvestorUniquenessV2,
        cddId: 'cddId',
      };
      claim = dsMockUtils.createMockClaim({
        InvestorUniquenessV2: dsMockUtils.createMockCddId(fakeResult.cddId),
      });

      result = meshClaimToClaim(claim);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('meshClaimTypeToClaimType and claimTypeToMeshClaimType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('meshClaimTypeToClaimType', () => {
    it('should convert a polkadot ClaimType object to a ClaimType', () => {
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

  describe('claimTypeToMeshClaimType', () => {
    it('should convert a ClaimType to a polkadot ClaimType object', () => {
      const context = dsMockUtils.getContextInstance();
      const fakeResult = 'meshClaim' as unknown as MeshClaim;

      context.createType.returns(fakeResult);

      const result = claimTypeToMeshClaimType(ClaimType.SellLockup, context);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('middlewareScopeToScope and scopeToMiddlewareScope', () => {
  describe('middlewareScopeToScope', () => {
    it('should convert a MiddlewareScope object to a Scope', () => {
      let result = middlewareScopeToScope({
        type: ClaimScopeTypeEnum.Ticker,
        value: 'SOMETHING\u0000\u0000\u0000',
      });

      expect(result).toEqual({ type: ScopeType.Ticker, value: 'SOMETHING' });

      result = middlewareScopeToScope({ type: ClaimScopeTypeEnum.Identity, value: 'someDid' });

      expect(result).toEqual({ type: ScopeType.Identity, value: 'someDid' });

      result = middlewareScopeToScope({ type: ClaimScopeTypeEnum.Custom, value: 'SOMETHING_ELSE' });

      expect(result).toEqual({ type: ScopeType.Custom, value: 'SOMETHING_ELSE' });
    });
  });

  describe('scopeToMiddlewareScope', () => {
    it('should convert a Scope to a MiddlewareScope object', () => {
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
});

describe('middlewareEventToEventIdentifier', () => {
  it('should convert a middleware Event object to an EventIdentifier', () => {
    const event = {
      /* eslint-disable @typescript-eslint/naming-convention */
      block_id: 3000,
      event_idx: 3,
      /* eslint-enable @typescript-eslint/naming-convention */
      block: {
        datetime: new Date('10/14/1987').toISOString(),
      },
    } as MiddlewareEvent;

    expect(middlewareEventToEventIdentifier(event)).toEqual({
      blockNumber: new BigNumber(3000),
      blockDate: new Date('10/14/1987'),
      eventIndex: new BigNumber(3),
    });
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

  describe('stringToCddId', () => {
    it('should convert a cdd id string into a CddId', () => {
      const cddId = 'someId';
      const fakeResult = 'type' as unknown as CddId;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('CddId', cddId).returns(fakeResult);

      const result = stringToCddId(cddId, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('cddIdToString', () => {
    it('should convert a CddId to a cddId string', () => {
      const fakeResult = 'cddId';
      const cddId = dsMockUtils.createMockCddId(fakeResult);

      const result = cddIdToString(cddId);
      expect(result).toBe(fakeResult);
    });
  });
});

describe('stringToScopeId and scopeIdToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('stringToScopeId', () => {
    it('should convert a scope id string into a ScopeId', () => {
      const scopeId = 'someId';
      const fakeResult = 'type' as unknown as ScopeId;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('ScopeId', scopeId).returns(fakeResult);

      const result = stringToScopeId(scopeId, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('scopeIdToString', () => {
    it('should convert a ScopeId to a scopeId string', () => {
      const fakeResult = 'scopeId';
      const scopeId = dsMockUtils.createMockScopeId(fakeResult);

      const result = scopeIdToString(scopeId);
      expect(result).toBe(fakeResult);
    });
  });
});

describe('requirementToComplianceRequirement and complianceRequirementToRequirement', () => {
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
  });

  describe('requirementToComplianceRequirement', () => {
    it('should convert a Requirement to a polkadot ComplianceRequirement object', () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance();
      const conditions: InputCondition[] = [
        {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.Exempted,
            scope: { type: ScopeType.Identity, value: 'someTickerDid' },
          },
          trustedClaimIssuers: [
            { identity: new Identity({ did }, context), trustedFor: null },
            { identity: new Identity({ did: 'otherDid' }, context), trustedFor: null },
          ],
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
            type: ClaimType.Jurisdiction as const,
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
          type: ConditionType.IsExternalAgent,
          target: ConditionTarget.Receiver,
        },
      ];
      const value = {
        conditions,
        id: new BigNumber(1),
      };
      const fakeResult = 'convertedComplianceRequirement' as unknown as ComplianceRequirement;

      const createTypeStub = context.createType;

      conditions.forEach(({ type }) => {
        const meshType = type === ConditionType.IsExternalAgent ? ConditionType.IsIdentity : type;
        createTypeStub
          .withArgs(
            'Condition',
            sinon.match({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              condition_type: sinon.match.has(meshType),
            })
          )
          .returns(`meshCondition${meshType}`);
      });

      createTypeStub
        .withArgs('ComplianceRequirement', {
          /* eslint-disable @typescript-eslint/naming-convention */
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
          id: bigNumberToU32(value.id, context),
          /* eslint-enable @typescript-eslint/naming-convention */
        })
        .returns(fakeResult);

      const result = requirementToComplianceRequirement(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('complianceRequirementToRequirement', () => {
    it('should convert a polkadot Compliance Requirement object to a Requirement', () => {
      const id = new BigNumber(1);
      const assetDid = 'someAssetDid';
      const cddId = 'someCddId';
      const issuerDids = [
        { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }) },
        { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }) },
      ];
      const fakeIssuerDids = [
        { identity: expect.objectContaining({ did: 'someDid' }), trustedFor: null },
        { identity: expect.objectContaining({ did: 'otherDid' }), trustedFor: null },
      ];
      const targetIdentityDid = 'targetIdentityDid';
      const conditions: Condition[] = [
        {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.KnowYourCustomer,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
        },
        {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.BuyLockup,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
        },
        {
          type: ConditionType.IsNoneOf,
          target: ConditionTarget.Sender,
          claims: [
            {
              type: ClaimType.Blocked,
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: assetDid },
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
        },
        {
          type: ConditionType.IsAnyOf,
          target: ConditionTarget.Both,
          claims: [
            {
              type: ClaimType.Exempted,
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.CustomerDueDiligence,
              id: cddId,
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
        },
        {
          type: ConditionType.IsIdentity,
          target: ConditionTarget.Sender,
          identity: expect.objectContaining({ did: targetIdentityDid }),
          trustedClaimIssuers: fakeIssuerDids,
        },
        {
          type: ConditionType.IsExternalAgent,
          target: ConditionTarget.Receiver,
          trustedClaimIssuers: fakeIssuerDids,
        },
      ];
      const fakeResult = {
        id,
        conditions,
      };

      const scope = dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(assetDid),
      });
      /* eslint-disable @typescript-eslint/naming-convention */
      const issuers = issuerDids.map(({ identity }) =>
        dsMockUtils.createMockTrustedIssuer({
          issuer: dsMockUtils.createMockIdentityId(identity.did),
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
            IsIdentity: dsMockUtils.createMockTargetIdentity('ExternalAgent'),
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
        id: dsMockUtils.createMockU32(new BigNumber(1)),
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      const result = complianceRequirementToRequirement(
        complianceRequirement,
        dsMockUtils.getContextInstance()
      );
      expect(result.conditions).toEqual(expect.arrayContaining(fakeResult.conditions));
    });
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

  it('should convert a TxTag to a polkadot ProtocolOp object', () => {
    const fakeResult = 'convertedProtocolOp' as unknown as ProtocolOp;
    const context = dsMockUtils.getContextInstance();

    const createTypeStub = context.createType
      .withArgs('ProtocolOp', 'AssetRegisterTicker')
      .returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.RegisterTicker, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'AssetIssue').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.Issue, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'AssetAddDocuments').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.AddDocuments, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'AssetCreateAsset').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.CreateAsset, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'CheckpointCreateSchedule').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.checkpoint.CreateSchedule, context)).toEqual(fakeResult);

    createTypeStub
      .withArgs('ProtocolOp', 'ComplianceManagerAddComplianceRequirement')
      .returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.complianceManager.AddComplianceRequirement, context)).toEqual(
      fakeResult
    );

    createTypeStub.withArgs('ProtocolOp', 'IdentityCddRegisterDid').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.CddRegisterDid, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'IdentityAddClaim').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.AddClaim, context)).toEqual(fakeResult);

    createTypeStub
      .withArgs('ProtocolOp', 'IdentityAddSecondaryKeysWithAuthorization')
      .returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.AddSecondaryKeysWithAuthorization, context)).toEqual(
      fakeResult
    );

    createTypeStub.withArgs('ProtocolOp', 'PipsPropose').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.pips.Propose, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'CorporateBallotAttachBallot').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.corporateBallot.AttachBallot, context)).toEqual(fakeResult);

    createTypeStub.withArgs('ProtocolOp', 'CapitalDistributionDistribute').returns(fakeResult);
    expect(txTagToProtocolOp(TxTags.capitalDistribution.Distribute, context)).toEqual(fakeResult);
  });

  it('should throw an error if tag does not match any ProtocolOp', () => {
    const value = TxTags.asset.MakeDivisible;
    const context = dsMockUtils.getContextInstance();
    const mockTag = 'AssetMakeDivisible';

    expect(() => txTagToProtocolOp(value, context)).toThrow(
      `${mockTag} does not match any ProtocolOp`
    );
  });
});

describe('txTagToExtrinsicIdentifier and extrinsicIdentifierToTxTag', () => {
  describe('txTagToExtrinsicIdentifier', () => {
    it('should convert a TxTag enum to a ExtrinsicIdentifier object', () => {
      let result = txTagToExtrinsicIdentifier(TxTags.identity.CddRegisterDid);

      expect(result).toEqual({
        moduleId: ModuleIdEnum.Identity,
        callId: CallIdEnum.CddRegisterDid,
      });

      result = txTagToExtrinsicIdentifier(TxTags.babe.ReportEquivocation);

      expect(result).toEqual({
        moduleId: ModuleIdEnum.Babe,
        callId: CallIdEnum.ReportEquivocation,
      });
    });
  });

  describe('extrinsicIdentifierToTxTag', () => {
    it('should convert a ExtrinsicIdentifier object to a TxTag', () => {
      let result = extrinsicIdentifierToTxTag({
        moduleId: ModuleIdEnum.Identity,
        callId: CallIdEnum.CddRegisterDid,
      });

      expect(result).toEqual(TxTags.identity.CddRegisterDid);

      result = extrinsicIdentifierToTxTag({
        moduleId: ModuleIdEnum.Babe,
        callId: CallIdEnum.ReportEquivocation,
      });

      expect(result).toEqual(TxTags.babe.ReportEquivocation);
    });
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

  describe('stringToText', () => {
    it('should convert a string to a polkadot Text object', () => {
      const value = 'someText';
      const fakeResult = 'convertedText' as unknown as Text;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('Text', value).returns(fakeResult);

      const result = stringToText(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('textToString', () => {
    it('should convert polkadot Text object to string', () => {
      const text = 'someText';
      const mockText = dsMockUtils.createMockText(text);

      const result = textToString(mockText);
      expect(result).toEqual(text);
    });
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

  it('should convert a portfolio id into a polkadot portfolio id', () => {
    const portfolioId = {
      did: 'someDid',
    };
    const number = new BigNumber(1);
    const rawIdentityId = dsMockUtils.createMockIdentityId(portfolioId.did);
    const rawU64 = dsMockUtils.createMockU64(number);
    const fakeResult = 'PortfolioId' as unknown as PortfolioId;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('IdentityId', portfolioId.did).returns(rawIdentityId);

    context.createType
      .withArgs('PortfolioId', {
        did: rawIdentityId,
        kind: 'Default',
      })
      .returns(fakeResult);

    let result = portfolioIdToMeshPortfolioId(portfolioId, context);

    expect(result).toBe(fakeResult);

    context.createType.withArgs('u64', number.toString()).returns(rawU64);

    context.createType
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
    entityMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot Compliance Requirement Result object to a RequirementCompliance', () => {
    const id = new BigNumber(1);
    const assetDid = 'someAssetDid';
    const cddId = 'someCddId';
    const issuerDids = [
      { identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }), trustedFor: null },
      { identity: entityMockUtils.getIdentityInstance({ did: 'otherDid' }), trustedFor: null },
    ];
    const fakeIssuerDids = [
      { identity: expect.objectContaining({ did: 'someDid' }), trustedFor: null },
      { identity: expect.objectContaining({ did: 'otherDid' }), trustedFor: null },
    ];
    const targetIdentityDid = 'targetIdentityDid';
    const conditions: ConditionCompliance[] = [
      {
        condition: {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.KnowYourCustomer,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.BuyLockup,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
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
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: assetDid },
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
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
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.CustomerDueDiligence,
              id: cddId,
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
        },
        complies: false,
      },
      {
        condition: {
          type: ConditionType.IsIdentity,
          target: ConditionTarget.Sender,
          identity: expect.objectContaining({ did: targetIdentityDid }),
          trustedClaimIssuers: fakeIssuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsExternalAgent,
          target: ConditionTarget.Receiver,
          trustedClaimIssuers: fakeIssuerDids,
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
      Identity: dsMockUtils.createMockIdentityId(assetDid),
    });
    /* eslint-disable @typescript-eslint/naming-convention */
    const issuers = issuerDids.map(({ identity: { did } }) =>
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
            IsIdentity: dsMockUtils.createMockTargetIdentity('ExternalAgent'),
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
      id: dsMockUtils.createMockU32(new BigNumber(1)),
      result: dsMockUtils.createMockBool(false),
    });
    /* eslint-enable @typescript-eslint/naming-convention */

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

  it('should convert a polkadot AssetComplianceResult object to a RequirementCompliance', () => {
    const id = new BigNumber(1);
    const assetDid = 'someAssetDid';
    const cddId = 'someCddId';
    const context = dsMockUtils.getContextInstance();
    const issuerDids = [
      { identity: new Identity({ did: 'someDid' }, context), trustedFor: null },
      { identity: new Identity({ did: 'otherDid' }, context), trustedFor: null },
    ];
    const fakeIssuerDids = [
      { identity: expect.objectContaining({ did: 'someDid' }), trustedFor: null },
      { identity: expect.objectContaining({ did: 'otherDid' }), trustedFor: null },
    ];
    const conditions: ConditionCompliance[] = [
      {
        condition: {
          type: ConditionType.IsPresent,
          target: ConditionTarget.Both,
          claim: {
            type: ClaimType.KnowYourCustomer,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
        },
        complies: true,
      },
      {
        condition: {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.BuyLockup,
            scope: { type: ScopeType.Identity, value: assetDid },
          },
          trustedClaimIssuers: fakeIssuerDids,
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
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: assetDid },
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
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
              scope: { type: ScopeType.Identity, value: assetDid },
            },
            {
              type: ClaimType.CustomerDueDiligence,
              id: cddId,
            },
          ],
          trustedClaimIssuers: fakeIssuerDids,
        },
        complies: false,
      },
    ];
    const fakeResult = {
      id,
      conditions,
    };

    const scope = dsMockUtils.createMockScope({
      Identity: dsMockUtils.createMockIdentityId(assetDid),
    });
    /* eslint-disable @typescript-eslint/naming-convention */
    const issuers = issuerDids.map(({ identity: { did } }) =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        trusted_for: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
      /* eslint-disable @typescript-eslint/naming-convention */
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
      id: dsMockUtils.createMockU32(new BigNumber(1)),
      result: dsMockUtils.createMockBool(false),
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    let assetComplianceResult = dsMockUtils.createMockAssetComplianceResult({
      paused: dsMockUtils.createMockBool(true),
      requirements: [rawRequirements],
      result: dsMockUtils.createMockBool(true),
    });

    let result = assetComplianceResultToCompliance(assetComplianceResult, context);
    expect(result.requirements[0].conditions).toEqual(
      expect.arrayContaining(fakeResult.conditions)
    );
    expect(result.complies).toBe(true);

    assetComplianceResult = dsMockUtils.createMockAssetComplianceResult({
      paused: dsMockUtils.createMockBool(false),
      requirements: [rawRequirements],
      result: dsMockUtils.createMockBool(true),
    });

    result = assetComplianceResultToCompliance(assetComplianceResult, context);
    expect(result.complies).toBe(true);
  });
});

describe('moduleAddressToString', () => {
  const context = dsMockUtils.getContextInstance();

  it('should convert a module address to a string', () => {
    const moduleAddress = 'someModuleName';

    const result = moduleAddressToString(moduleAddress, context);
    expect(result).toBe('5Eg4TucMsdiyc9LjA3BT7VXioUqMoQ4vLn1VSUDsYsiJMdbN');
  });
});

describe('keyToAddress and addressToKey', () => {
  const address = DUMMY_ACCOUNT_ID;
  const publicKey = '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d';
  const context = dsMockUtils.getContextInstance();

  describe('addressToKey', () => {
    it('should decode an address into a public key', () => {
      const result = addressToKey(address, context);

      expect(result).toBe(publicKey);
    });
  });

  describe('keyToAddress', () => {
    it('should encode a public key into an address', () => {
      const result = keyToAddress(publicKey, context);

      expect(result).toBe(address);
    });
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

  it('should convert a hex string to a TxTag', () => {
    const hex = '0x110000';
    const fakeResult = TxTags.treasury.Disbursement;
    const mockResult = {
      method: 'disbursement',
      section: 'treasury',
    };

    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('Proposal', hex).returns(mockResult);

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

  it('should convert a transaction to a TxTag', () => {
    const tx = dsMockUtils.createTxStub('asset', 'unfreeze');
    const fakeResult = TxTags.asset.Unfreeze;

    const result = transactionToTxTag(tx);
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

  it('should convert a polkadot AffirmationStatus object to a AffirmationStatus', () => {
    let fakeResult = AffirmationStatus.Affirmed;
    let permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    let result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Pending;
    permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);

    fakeResult = AffirmationStatus.Unknown;
    permission = dsMockUtils.createMockAffirmationStatus(fakeResult);

    result = meshAffirmationStatusToAffirmationStatus(permission);
    expect(result).toEqual(fakeResult);
  });
});

describe('secondaryAccountToMeshSecondaryKey', () => {
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
  });

  it('should convert a SecondaryAccount to a polkadot SecondaryKey', () => {
    const address = 'someAccount';
    const context = dsMockUtils.getContextInstance();
    const secondaryAccount = {
      account: entityMockUtils.getAccountInstance(),
      permissions: {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      },
    };
    const mockAccountId = dsMockUtils.createMockAccountId(address);
    const mockSignatory = dsMockUtils.createMockSignatory({ Account: mockAccountId });
    const mockPermissions = dsMockUtils.createMockPermissions({
      asset: dsMockUtils.createMockAssetPermissions('Whole'),
      portfolio: dsMockUtils.createMockPortfolioPermissions('Whole'),
      extrinsic: dsMockUtils.createMockExtrinsicPermissions('Whole'),
    });
    const fakeResult = dsMockUtils.createMockSecondaryKey({
      signer: mockSignatory,
      permissions: mockPermissions,
    });

    context.createType
      .withArgs('SecondaryKey', {
        signer: signerValueToSignatory({ type: SignerType.Account, value: address }, context),
        permissions: permissionsToMeshPermissions(secondaryAccount.permissions, context),
      })
      .returns(fakeResult);

    const result = secondaryAccountToMeshSecondaryKey(secondaryAccount, context);

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

  describe('venueTypeToMeshVenueType', () => {
    it('should convert a VenueType to a polkadot VenueType object', () => {
      const value = VenueType.Other;
      const fakeResult = 'Other' as unknown as MeshVenueType;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('VenueType', value).returns(fakeResult);

      const result = venueTypeToMeshVenueType(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshVenueTypeToVenueType', () => {
    it('should convert a polkadot VenueType object to a VenueType', () => {
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

  describe('stringToVenueDetails', () => {
    it('should convert a string into a polkadot VenueDetails object', () => {
      const details = 'details';
      const fakeResult = 'type' as unknown as VenueDetails;
      const context = dsMockUtils.getContextInstance();

      context.createType.withArgs('VenueDetails', details).returns(fakeResult);

      const result = stringToVenueDetails(details, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('venueDetailsToString', () => {
    it('should convert a polkadot VenueDetails object to a string', () => {
      const fakeResult = 'details';
      const venueDetails = dsMockUtils.createMockVenueDetails(fakeResult);

      const result = venueDetailsToString(venueDetails);
      expect(result).toBe(fakeResult);
    });
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

  it('should convert a polkadot InstructionStatus object to an InstructionStatus', () => {
    let fakeResult = InstructionStatus.Pending;
    let instructionStatus = dsMockUtils.createMockInstructionStatus(fakeResult);

    let result = meshInstructionStatusToInstructionStatus(instructionStatus);
    expect(result).toEqual(fakeResult);

    fakeResult = InstructionStatus.Failed;
    instructionStatus = dsMockUtils.createMockInstructionStatus(fakeResult);

    result = meshInstructionStatusToInstructionStatus(instructionStatus);
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

  it('should convert a polkadot AffirmationStatus object to a AffirmationStatus', () => {
    let fakeResult = AffirmationStatus.Unknown;
    let authorizationStatus = dsMockUtils.createMockAffirmationStatus(fakeResult);

    let result = meshAffirmationStatusToAffirmationStatus(authorizationStatus);
    expect(result).toEqual(fakeResult);

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

  it('should convert an end condition to a polkadot SettlementType object', () => {
    const fakeResult = 'type' as unknown as SettlementType;
    const context = dsMockUtils.getContextInstance();

    context.createType
      .withArgs('SettlementType', InstructionType.SettleOnAffirmation)
      .returns(fakeResult);

    let result = endConditionToSettlementType(
      { type: InstructionType.SettleOnAffirmation },
      context
    );

    expect(result).toBe(fakeResult);

    const blockNumber = new BigNumber(10);
    const rawBlockNumber = dsMockUtils.createMockU32(blockNumber);

    context.createType.withArgs('u32', blockNumber.toString()).returns(rawBlockNumber);
    context.createType
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
  });

  it('should convert a DID string to a PortfolioId', async () => {
    const result = portfolioLikeToPortfolioId(did);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert an Identity to a PortfolioId', async () => {
    const identity = entityMockUtils.getIdentityInstance({ did });

    const result = portfolioLikeToPortfolioId(identity);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert a NumberedPortfolio to a PortfolioId', async () => {
    const portfolio = new NumberedPortfolio({ did, id: number }, context);

    const result = portfolioLikeToPortfolioId(portfolio);

    expect(result).toEqual({ did, number });
  });

  it('should convert a DefaultPortfolio to a PortfolioId', async () => {
    const portfolio = new DefaultPortfolio({ did }, context);

    const result = portfolioLikeToPortfolioId(portfolio);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert a Portfolio identifier object to a PortfolioId', async () => {
    let result = portfolioLikeToPortfolioId({ identity: did, id: number });
    expect(result).toEqual({ did, number });

    result = portfolioLikeToPortfolioId({
      identity: entityMockUtils.getIdentityInstance({ did }),
      id: number,
    });
    expect(result).toEqual({ did, number });
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
  });

  it('should convert a PortfolioLike to a DefaultPortfolio instance', async () => {
    const result = portfolioLikeToPortfolio(did, context);
    expect(result instanceof DefaultPortfolio).toBe(true);
  });

  it('should convert a PortfolioLike to a NumberedPortfolio instance', async () => {
    const result = portfolioLikeToPortfolio({ identity: did, id }, context);
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
  });

  it('should return an IdentityWithClaims array object', () => {
    const context = dsMockUtils.getContextInstance();
    const targetDid = 'someTargetDid';
    const issuerDid = 'someIssuerDid';
    const cddId = 'someCddId';
    const date = 1589816265000;
    const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
    const claim = {
      target: expect.objectContaining({ did: targetDid }),
      issuer: expect.objectContaining({ did: issuerDid }),
      issuedAt: new Date(date),
    };
    const fakeResult = [
      {
        identity: expect.objectContaining({ did: targetDid }),
        claims: [
          {
            ...claim,
            expiry: new Date(date),
            claim: {
              type: customerDueDiligenceType,
              id: cddId,
            },
          },
          {
            ...claim,
            expiry: null,
            claim: {
              type: customerDueDiligenceType,
              id: cddId,
            },
          },
        ],
      },
    ];
    /* eslint-disable @typescript-eslint/naming-convention */
    const commonClaimData = {
      targetDID: targetDid,
      issuer: issuerDid,
      issuance_date: date,
      last_update_date: date,
      cdd_id: cddId,
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
    /* eslint-enable @typescript-eslint/naming-convention */

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
  });

  describe('trustedClaimIssuerToTrustedIssuer', () => {
    it('should convert a did string into an IdentityId', () => {
      const did = 'someDid';
      const fakeResult = 'type' as unknown as TrustedIssuer;
      const context = dsMockUtils.getContextInstance();

      let issuer: TrustedClaimIssuer = {
        identity: entityMockUtils.getIdentityInstance({ did }),
        trustedFor: null,
      };

      context.createType
        .withArgs('TrustedIssuer', {
          issuer: stringToIdentityId(did, context),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trusted_for: 'Any',
        })
        .returns(fakeResult);

      let result = trustedClaimIssuerToTrustedIssuer(issuer, context);
      expect(result).toBe(fakeResult);

      issuer = {
        identity: entityMockUtils.getIdentityInstance({ did }),
        trustedFor: [ClaimType.Accredited, ClaimType.Blocked],
      };

      context.createType
        .withArgs('TrustedIssuer', {
          issuer: stringToIdentityId(did, context),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          trusted_for: { Specific: [ClaimType.Accredited, ClaimType.Blocked] },
        })
        .returns(fakeResult);

      result = trustedClaimIssuerToTrustedIssuer(issuer, context);
      expect(result).toBe(fakeResult);
    });
  });

  describe('trustedIssuerToTrustedClaimIssuer', () => {
    it('should convert an IdentityId to an Identity object', () => {
      const did = 'someDid';
      const context = dsMockUtils.getContextInstance();
      let fakeResult: TrustedClaimIssuer = {
        identity: expect.objectContaining({ did }),
        trustedFor: null,
      };
      let trustedIssuer = dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        trusted_for: dsMockUtils.createMockTrustedFor('Any'),
      });

      let result = trustedIssuerToTrustedClaimIssuer(trustedIssuer, context);
      expect(result).toEqual(fakeResult);

      fakeResult = {
        identity: expect.objectContaining({ did }),
        trustedFor: [ClaimType.SellLockup],
      };
      trustedIssuer = dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        trusted_for: dsMockUtils.createMockTrustedFor({
          Specific: [dsMockUtils.createMockClaimType(ClaimType.SellLockup)],
        }),
      });

      result = trustedIssuerToTrustedClaimIssuer(trustedIssuer, context);
      expect(result).toEqual(fakeResult);
    });
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
  });

  it('should convert a PermissionsLike into a Permissions', () => {
    const context = dsMockUtils.getContextInstance();
    let args: PermissionsLike = { assets: null, transactions: null, portfolios: null };
    let result = permissionsLikeToPermissions(args, context);
    expect(result).toEqual({
      assets: null,
      transactions: null,
      transactionGroups: [],
      portfolios: null,
    });

    const firstTicker = 'TICKER';
    const firstToken = entityMockUtils.getAssetInstance({ ticker: firstTicker });
    const secondTicker = 'OTHER_TICKER';
    const did = 'someDid';
    const portfolio = entityMockUtils.getDefaultPortfolioInstance({ did });

    args = {
      assets: {
        values: [firstToken, secondTicker],
        type: PermissionType.Include,
      },
      transactions: {
        values: [TxTags.asset.MakeDivisible],
        type: PermissionType.Include,
      },
      transactionGroups: [TxGroup.TrustedClaimIssuersManagement],
      portfolios: {
        values: [portfolio],
        type: PermissionType.Include,
      },
    };

    const fakeFirstToken = expect.objectContaining({ ticker: firstTicker });
    const fakeSecondToken = expect.objectContaining({ ticker: secondTicker });
    const fakePortfolio = expect.objectContaining({ owner: expect.objectContaining({ did }) });

    result = permissionsLikeToPermissions(args, context);
    expect(result).toEqual({
      assets: {
        values: [fakeFirstToken, fakeSecondToken],
        type: PermissionType.Include,
      },
      transactions: {
        values: [TxTags.asset.MakeDivisible],
        type: PermissionType.Include,
      },
      transactionGroups: [],
      portfolios: {
        values: [fakePortfolio],
        type: PermissionType.Include,
      },
    });

    result = permissionsLikeToPermissions({}, context);
    expect(result).toEqual({
      assets: {
        values: [],
        type: PermissionType.Include,
      },
      transactions: {
        values: [],
        type: PermissionType.Include,
      },
      transactionGroups: [],
      portfolios: {
        values: [],
        type: PermissionType.Include,
      },
    });

    result = permissionsLikeToPermissions(
      {
        transactionGroups: [TxGroup.TrustedClaimIssuersManagement],
      },
      context
    );
    expect(result).toEqual({
      assets: {
        values: [],
        type: PermissionType.Include,
      },
      transactions: {
        values: [
          TxTags.complianceManager.AddDefaultTrustedClaimIssuer,
          TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer,
        ],
        type: PermissionType.Include,
      },
      transactionGroups: [TxGroup.TrustedClaimIssuersManagement],
      portfolios: {
        values: [],
        type: PermissionType.Include,
      },
    });

    args = {
      assets: null,
      transactions: {
        values: [TxTags.balances.SetBalance, TxTags.asset.MakeDivisible],
        type: PermissionType.Include,
      },
      transactionGroups: [],
      portfolios: null,
    };

    result = permissionsLikeToPermissions(args, context);
    expect(result).toEqual({
      assets: null,
      transactions: {
        values: [TxTags.asset.MakeDivisible, TxTags.balances.SetBalance],
        type: PermissionType.Include,
      },
      transactionGroups: [],
      portfolios: null,
    });
  });
});

describe('middlewarePortfolioToPortfolio', () => {
  it('should convert a MiddlewarePortfolio into a Portfolio', async () => {
    const context = dsMockUtils.getContextInstance();
    let middlewarePortfolio = {
      kind: 'Default',
      did: 'someDid',
    };

    let result = await middlewarePortfolioToPortfolio(middlewarePortfolio, context);
    expect(result instanceof DefaultPortfolio).toBe(true);

    middlewarePortfolio = {
      kind: '0',
      did: 'someDid',
    };

    result = await middlewarePortfolioToPortfolio(middlewarePortfolio, context);
    expect(result instanceof DefaultPortfolio).toBe(true);

    middlewarePortfolio = {
      kind: '10',
      did: 'someDid',
    };

    result = await middlewarePortfolioToPortfolio(middlewarePortfolio, context);
    expect(result instanceof NumberedPortfolio).toBe(true);
  });
});

describe('transferRestrictionToTransferManager', () => {
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

  it('should convert a Transfer Restriction to a polkadot TransferManager object', () => {
    const count = new BigNumber(10);
    let value = {
      type: TransferRestrictionType.Count,
      value: count,
    };
    const fakeResult = 'TransferManagerEnum' as unknown as TransferManager;
    const context = dsMockUtils.getContextInstance();

    const rawCount = dsMockUtils.createMockU64(count);

    const createTypeStub = context.createType;
    createTypeStub
      .withArgs('TransferManager', { CountTransferManager: rawCount })
      .returns(fakeResult);

    createTypeStub.withArgs('u64', count.toString()).returns(rawCount);

    let result = transferRestrictionToTransferManager(value, context);

    expect(result).toBe(fakeResult);

    const percentage = new BigNumber(49);
    const rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    value = {
      type: TransferRestrictionType.Percentage,
      value: percentage,
    };

    createTypeStub
      .withArgs('TransferManager', { PercentageTransferManager: rawPercentage })
      .returns(fakeResult);

    createTypeStub
      .withArgs('Permill', percentage.multipliedBy(10000).toString())
      .returns(rawPercentage);

    result = transferRestrictionToTransferManager(value, context);

    expect(result).toBe(fakeResult);
  });

  it('should convert a polkadot Signatory object to a SignerValue', () => {
    const count = new BigNumber(10);
    let fakeResult = {
      type: TransferRestrictionType.Count,
      value: count,
    };
    let transferManager = dsMockUtils.createMockTransferManager({
      CountTransferManager: dsMockUtils.createMockU64(count),
    });

    let result = transferManagerToTransferRestriction(transferManager);
    expect(result).toEqual(fakeResult);

    const percentage = new BigNumber(49);
    fakeResult = {
      type: TransferRestrictionType.Percentage,
      value: percentage,
    };
    transferManager = dsMockUtils.createMockTransferManager({
      PercentageTransferManager: dsMockUtils.createMockPermill(percentage.multipliedBy(10000)),
    });

    result = transferManagerToTransferRestriction(transferManager);
    expect(result).toEqual(fakeResult);
  });
});

describe('offeringTierToPriceTier', () => {
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
  });

  it('should convert an Offering Tier into a polkadot PriceTier object', () => {
    const context = dsMockUtils.getContextInstance();
    const total = new BigNumber(100);
    const price = new BigNumber(1000);
    const rawTotal = dsMockUtils.createMockBalance(total);
    const rawPrice = dsMockUtils.createMockBalance(price);
    const fakeResult = 'PriceTier' as unknown as PriceTier;

    const offeringTier: OfferingTier = {
      price,
      amount: total,
    };

    const createTypeStub = context.createType;

    createTypeStub
      .withArgs('Balance', total.multipliedBy(Math.pow(10, 6)).toString())
      .returns(rawTotal);
    createTypeStub
      .withArgs('Balance', price.multipliedBy(Math.pow(10, 6)).toString())
      .returns(rawPrice);

    createTypeStub
      .withArgs('PriceTier', {
        total: rawTotal,
        price: rawPrice,
      })
      .returns(fakeResult);

    const result = offeringTierToPriceTier(offeringTier, context);

    expect(result).toBe(fakeResult);
  });
});

describe('txGroupToTxTags', () => {
  it('should return the corresponding group of TxTags', () => {
    let result = txGroupToTxTags(TxGroup.PortfolioManagement);

    expect(result).toEqual([
      TxTags.identity.AddInvestorUniquenessClaim,
      TxTags.portfolio.MovePortfolioFunds,
      TxTags.settlement.AddInstruction,
      TxTags.settlement.AddAndAffirmInstruction,
      TxTags.settlement.AffirmInstruction,
      TxTags.settlement.RejectInstruction,
      TxTags.settlement.CreateVenue,
    ]);

    result = txGroupToTxTags(TxGroup.AssetManagement);

    expect(result).toEqual([
      TxTags.asset.MakeDivisible,
      TxTags.asset.RenameAsset,
      TxTags.asset.SetFundingRound,
      TxTags.asset.AddDocuments,
      TxTags.asset.RemoveDocuments,
    ]);

    result = txGroupToTxTags(TxGroup.AdvancedAssetManagement);

    expect(result).toEqual([
      TxTags.asset.Freeze,
      TxTags.asset.Unfreeze,
      TxTags.identity.AddAuthorization,
      TxTags.identity.RemoveAuthorization,
    ]);

    result = txGroupToTxTags(TxGroup.Distribution);

    expect(result).toEqual([
      TxTags.identity.AddInvestorUniquenessClaim,
      TxTags.settlement.CreateVenue,
      TxTags.settlement.AddInstruction,
      TxTags.settlement.AddAndAffirmInstruction,
    ]);

    result = txGroupToTxTags(TxGroup.Issuance);

    expect(result).toEqual([TxTags.asset.Issue]);

    result = txGroupToTxTags(TxGroup.TrustedClaimIssuersManagement);

    expect(result).toEqual([
      TxTags.complianceManager.AddDefaultTrustedClaimIssuer,
      TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer,
    ]);

    result = txGroupToTxTags(TxGroup.ClaimsManagement);

    expect(result).toEqual([TxTags.identity.AddClaim, TxTags.identity.RevokeClaim]);

    result = txGroupToTxTags(TxGroup.ComplianceRequirementsManagement);

    expect(result).toEqual([
      TxTags.complianceManager.AddComplianceRequirement,
      TxTags.complianceManager.RemoveComplianceRequirement,
      TxTags.complianceManager.PauseAssetCompliance,
      TxTags.complianceManager.ResumeAssetCompliance,
      TxTags.complianceManager.ResetAssetCompliance,
    ]);

    result = txGroupToTxTags(TxGroup.CorporateActionsManagement);

    expect(result).toEqual([
      TxTags.checkpoint.CreateSchedule,
      TxTags.checkpoint.RemoveSchedule,
      TxTags.checkpoint.CreateCheckpoint,
      TxTags.corporateAction.InitiateCorporateAction,
      TxTags.capitalDistribution.Distribute,
      TxTags.capitalDistribution.Claim,
      TxTags.identity.AddInvestorUniquenessClaim,
    ]);

    result = txGroupToTxTags(TxGroup.StoManagement);

    expect(result).toEqual([
      TxTags.sto.CreateFundraiser,
      TxTags.sto.FreezeFundraiser,
      TxTags.sto.Invest,
      TxTags.sto.ModifyFundraiserWindow,
      TxTags.sto.Stop,
      TxTags.sto.UnfreezeFundraiser,
      TxTags.identity.AddInvestorUniquenessClaim,
      TxTags.asset.Issue,
      TxTags.settlement.CreateVenue,
    ]);
  });
});

describe('transactionPermissionsToTxGroups', () => {
  it('should return all completed groups in the tag array', () => {
    expect(
      transactionPermissionsToTxGroups({
        values: [
          TxTags.identity.AddInvestorUniquenessClaim,
          TxTags.portfolio.MovePortfolioFunds,
          TxTags.settlement.AddInstruction,
          TxTags.settlement.AddAndAffirmInstruction,
          TxTags.settlement.AffirmInstruction,
          TxTags.settlement.RejectInstruction,
          TxTags.settlement.CreateVenue,
          TxTags.asset.MakeDivisible,
          TxTags.asset.RenameAsset,
          TxTags.asset.SetFundingRound,
          TxTags.asset.AddDocuments,
          TxTags.asset.RemoveDocuments,
          TxTags.asset.Freeze,
          TxTags.asset.Unfreeze,
          TxTags.identity.AddAuthorization,
          TxTags.identity.RemoveAuthorization,
        ],
        type: PermissionType.Include,
      })
    ).toEqual([
      TxGroup.AdvancedAssetManagement,
      TxGroup.AssetManagement,
      TxGroup.Distribution,
      TxGroup.PortfolioManagement,
    ]);

    expect(
      transactionPermissionsToTxGroups({
        values: [
          TxTags.identity.AddInvestorUniquenessClaim,
          TxTags.portfolio.MovePortfolioFunds,
          TxTags.settlement.AddInstruction,
          TxTags.settlement.AddAndAffirmInstruction,
          TxTags.settlement.AffirmInstruction,
          TxTags.settlement.RejectInstruction,
          TxTags.settlement.CreateVenue,
          TxTags.identity.AddAuthorization,
          TxTags.identity.RemoveAuthorization,
        ],
        type: PermissionType.Include,
      })
    ).toEqual([TxGroup.Distribution, TxGroup.PortfolioManagement]);

    expect(
      transactionPermissionsToTxGroups({
        values: [
          TxTags.identity.AddInvestorUniquenessClaim,
          TxTags.portfolio.MovePortfolioFunds,
          TxTags.settlement.AddInstruction,
        ],
        type: PermissionType.Exclude,
      })
    ).toEqual([]);

    expect(transactionPermissionsToTxGroups(null)).toEqual([]);
  });
});

describe('fundraiserTierToTier', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot FundraiserTier object to a FundraiserTier', () => {
    const amount = new BigNumber(5);
    const price = new BigNumber(5);
    const remaining = new BigNumber(5);

    const fundraiserTier = dsMockUtils.createMockFundraiserTier({
      total: dsMockUtils.createMockBalance(amount),
      price: dsMockUtils.createMockBalance(price),
      remaining: dsMockUtils.createMockBalance(remaining),
    });

    const result = fundraiserTierToTier(fundraiserTier);
    expect(result).toEqual({
      amount: amount.shiftedBy(-6),
      price: price.shiftedBy(-6),
      remaining: remaining.shiftedBy(-6),
    });
  });
});

describe('fundraiserToOfferingDetails', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot Fundraiser object to a StoDetails', () => {
    const context = dsMockUtils.getContextInstance();

    const someDid = 'someDid';
    const name = 'someSto';
    const ticker = 'TICKER';
    const otherDid = 'otherDid';
    const raisingCurrency = 'USD';
    const amount = new BigNumber(10000);
    const priceA = new BigNumber(1000);
    const priceB = new BigNumber(2000);
    const remaining = new BigNumber(7000);
    const tiers = [
      {
        amount: amount.shiftedBy(-6),
        price: priceA.shiftedBy(-6),
        remaining: remaining.shiftedBy(-6),
      },
      {
        amount: amount.shiftedBy(-6),
        price: priceB.shiftedBy(-6),
        remaining: remaining.shiftedBy(-6),
      },
    ];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 100000);
    const minInvestmentValue = new BigNumber(1);

    const fakeResult = {
      creator: expect.objectContaining({ did: someDid }),
      name,
      offeringPortfolio: expect.objectContaining({
        owner: expect.objectContaining({ did: someDid }),
      }),
      raisingPortfolio: expect.objectContaining({
        owner: expect.objectContaining({ did: otherDid }),
      }),
      raisingCurrency,
      tiers,
      venue: expect.objectContaining({ id: new BigNumber(1) }),
      start: startDate,
      end: endDate,
      status: {
        timing: OfferingTimingStatus.Started,
        balance: OfferingBalanceStatus.Available,
        sale: OfferingSaleStatus.Live,
      },
      minInvestment: minInvestmentValue.shiftedBy(-6),
      totalAmount: amount.multipliedBy(2).shiftedBy(-6),
      totalRemaining: remaining.multipliedBy(2).shiftedBy(-6),
    };

    const creator = dsMockUtils.createMockIdentityId(someDid);
    const rawName = dsMockUtils.createMockFundraiserName(name);
    const offeringPortfolio = dsMockUtils.createMockPortfolioId({
      did: creator,
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    const offeringAsset = dsMockUtils.createMockTicker(ticker);
    const raisingPortfolio = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(otherDid),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    const raisingAsset = dsMockUtils.createMockTicker(raisingCurrency);
    const rawTiers = [
      dsMockUtils.createMockFundraiserTier({
        total: dsMockUtils.createMockBalance(amount),
        price: dsMockUtils.createMockBalance(priceA),
        remaining: dsMockUtils.createMockBalance(remaining),
      }),
      dsMockUtils.createMockFundraiserTier({
        total: dsMockUtils.createMockBalance(amount),
        price: dsMockUtils.createMockBalance(priceB),
        remaining: dsMockUtils.createMockBalance(remaining),
      }),
    ];
    const venueId = dsMockUtils.createMockU64(new BigNumber(1));
    const start = dsMockUtils.createMockMoment(new BigNumber(startDate.getTime()));
    const end = dsMockUtils.createMockOption(
      dsMockUtils.createMockMoment(new BigNumber(endDate.getTime()))
    );
    const status = dsMockUtils.createMockFundraiserStatus('Live');
    const minInvestment = dsMockUtils.createMockBalance(minInvestmentValue);

    /* eslint-disable @typescript-eslint/naming-convention */
    let fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offering_portfolio: offeringPortfolio,
      offering_asset: offeringAsset,
      raising_portfolio: raisingPortfolio,
      raising_asset: raisingAsset,
      tiers: rawTiers,
      venue_id: venueId,
      start,
      end,
      status,
      minimum_investment: minInvestment,
    });

    let result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual(fakeResult);

    const futureStart = new Date(startDate.getTime() + 50000);

    fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offering_portfolio: offeringPortfolio,
      offering_asset: offeringAsset,
      raising_portfolio: raisingPortfolio,
      raising_asset: raisingAsset,
      tiers: rawTiers,
      venue_id: venueId,
      start: dsMockUtils.createMockMoment(new BigNumber(futureStart.getTime())),
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('Closed'),
      minimum_investment: minInvestment,
    });

    result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual({
      ...fakeResult,
      name,
      status: {
        ...fakeResult.status,
        timing: OfferingTimingStatus.NotStarted,
        sale: OfferingSaleStatus.Closed,
      },
      start: futureStart,
      end: null,
    });

    fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offering_portfolio: offeringPortfolio,
      offering_asset: offeringAsset,
      raising_portfolio: raisingPortfolio,
      raising_asset: raisingAsset,
      tiers: rawTiers,
      venue_id: venueId,
      start,
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('ClosedEarly'),
      minimum_investment: minInvestment,
    });

    result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual({
      ...fakeResult,
      name,
      status: {
        ...fakeResult.status,
        timing: OfferingTimingStatus.Started,
        sale: OfferingSaleStatus.ClosedEarly,
      },
      end: null,
    });

    fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offering_portfolio: offeringPortfolio,
      offering_asset: offeringAsset,
      raising_portfolio: raisingPortfolio,
      raising_asset: raisingAsset,
      tiers: [
        dsMockUtils.createMockFundraiserTier({
          total: dsMockUtils.createMockBalance(amount),
          price: dsMockUtils.createMockBalance(priceA),
          remaining: dsMockUtils.createMockBalance(new BigNumber(0)),
        }),
      ],
      venue_id: venueId,
      start,
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('Frozen'),
      minimum_investment: minInvestment,
    });

    result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual({
      ...fakeResult,
      name,
      tiers: [{ ...tiers[0], remaining: new BigNumber(0) }],
      status: {
        balance: OfferingBalanceStatus.SoldOut,
        timing: OfferingTimingStatus.Started,
        sale: OfferingSaleStatus.Frozen,
      },
      end: null,
      totalRemaining: new BigNumber(0),
      totalAmount: amount.shiftedBy(-6),
    });

    const pastEnd = new Date(startDate.getTime() - 50000);
    const pastStart = new Date(startDate.getTime() - 100000);

    fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offering_portfolio: offeringPortfolio,
      offering_asset: offeringAsset,
      raising_portfolio: raisingPortfolio,
      raising_asset: raisingAsset,
      tiers: [
        dsMockUtils.createMockFundraiserTier({
          total: dsMockUtils.createMockBalance(amount),
          price: dsMockUtils.createMockBalance(priceA),
          remaining: dsMockUtils.createMockBalance(new BigNumber(1)),
        }),
      ],
      venue_id: venueId,
      start: dsMockUtils.createMockMoment(new BigNumber(pastStart.getTime())),
      end: dsMockUtils.createMockOption(
        dsMockUtils.createMockMoment(new BigNumber(pastEnd.getTime()))
      ),
      status: dsMockUtils.createMockFundraiserStatus('Frozen'),
      minimum_investment: minInvestment,
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual({
      ...fakeResult,
      name,
      tiers: [{ ...tiers[0], remaining: new BigNumber(1).shiftedBy(-6) }],
      status: {
        balance: OfferingBalanceStatus.Residual,
        timing: OfferingTimingStatus.Expired,
        sale: OfferingSaleStatus.Frozen,
      },
      start: pastStart,
      end: pastEnd,
      totalRemaining: new BigNumber(1).shiftedBy(-6),
      totalAmount: amount.shiftedBy(-6),
    });
  });
});

describe('calendarPeriodToMeshCalendarPeriod and meshCalendarPeriodToCalendarPeriod', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('calendarPeriodToMeshCalendarPeriod', () => {
    it('should throw an error if amount is negative', () => {
      const context = dsMockUtils.getContextInstance();

      expect(() =>
        calendarPeriodToMeshCalendarPeriod(
          { unit: CalendarUnit.Month, amount: new BigNumber(-3) },
          context
        )
      ).toThrow('Calendar period cannot have a negative amount');
    });

    it('should convert a CalendarPeriod to a polkadot CalendarPeriod object', () => {
      const amount = new BigNumber(1);
      const value = { unit: CalendarUnit.Month, amount };
      const fakeResult = 'Period' as unknown as MeshCalendarPeriod;
      const context = dsMockUtils.getContextInstance();

      const createTypeStub = context.createType;
      const rawAmount = dsMockUtils.createMockU64(amount);

      createTypeStub.withArgs('u64', `${amount}`).returns(rawAmount);
      createTypeStub
        .withArgs('CalendarPeriod', { unit: 'Month', amount: rawAmount })
        .returns(fakeResult);

      const result = calendarPeriodToMeshCalendarPeriod(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshCalendarPeriodToCalendarPeriod', () => {
    it('should convert a polkadot CalendarPeriod object to a CalendarPeriod', () => {
      let fakeResult = { unit: CalendarUnit.Second, amount: new BigNumber(1) };
      let calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Second'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      let result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Minute, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Minute'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Hour, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Hour'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Day, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Day'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Week, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Week'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Month, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Month'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);

      fakeResult = { unit: CalendarUnit.Year, amount: new BigNumber(1) };
      calendarPeriod = dsMockUtils.createMockCalendarPeriod({
        unit: dsMockUtils.createMockCalendarUnit('Year'),
        amount: dsMockUtils.createMockU64(fakeResult.amount),
      });

      result = meshCalendarPeriodToCalendarPeriod(calendarPeriod);
      expect(result).toEqual(fakeResult);
    });
  });
});

describe('scheduleSpecToMeshScheduleSpec', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a ScheduleDetails object to a polkadot ScheduleSpec object', () => {
    const start = new Date('10/14/1987');
    const amount = new BigNumber(1);
    const period = { unit: CalendarUnit.Month, amount };
    const repetitions = new BigNumber(10);

    const value = { start, period, repetitions };
    const fakeResult = 'Spec' as unknown as ScheduleSpec;
    const context = dsMockUtils.getContextInstance();

    const createTypeStub = context.createType;
    const rawStart = dsMockUtils.createMockMoment(new BigNumber(start.getTime()));
    const rawAmount = dsMockUtils.createMockU64(amount);
    const rawZero = dsMockUtils.createMockU64(new BigNumber(0));
    const rawPeriod = dsMockUtils.createMockCalendarPeriod({
      unit: dsMockUtils.createMockCalendarUnit('Month'),
      amount: rawAmount,
    });
    const rawZeroPeriod = dsMockUtils.createMockCalendarPeriod({
      unit: dsMockUtils.createMockCalendarUnit('Month'),
      amount: rawZero,
    });
    const rawRepetitions = dsMockUtils.createMockU64(repetitions);

    createTypeStub.withArgs('u64', `${amount}`).returns(rawAmount);
    createTypeStub.withArgs('u64', '0').returns(rawZero);
    createTypeStub.withArgs('u64', `${repetitions}`).returns(rawRepetitions);
    createTypeStub.withArgs('Moment', start.getTime()).returns(rawStart);
    createTypeStub
      .withArgs('CalendarPeriod', { unit: 'Month', amount: rawAmount })
      .returns(rawPeriod);
    createTypeStub
      .withArgs('CalendarPeriod', { unit: 'Month', amount: rawZero })
      .returns(rawZeroPeriod);
    createTypeStub
      .withArgs('ScheduleSpec', {
        start: rawStart,
        period: rawPeriod,
        remaining: rawRepetitions,
      })
      .returns(fakeResult);
    createTypeStub
      .withArgs('ScheduleSpec', {
        start: null,
        period: rawZeroPeriod,
        remaining: rawZero,
      })
      .returns(fakeResult);

    let result = scheduleSpecToMeshScheduleSpec(value, context);

    expect(result).toBe(fakeResult);

    result = scheduleSpecToMeshScheduleSpec(
      { start: null, period: null, repetitions: null },
      context
    );

    expect(result).toBe(fakeResult);
  });
});

describe('storedScheduleToCheckpointScheduleParams', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot StoredSchedule object to a CheckpointScheduleParams object', () => {
    const start = new Date('10/14/1987');
    const nextCheckpointDate = new Date('10/14/2021');
    const id = new BigNumber(1);
    const remaining = new BigNumber(5);

    const fakeResult = {
      id,
      period: {
        unit: CalendarUnit.Month,
        amount: new BigNumber(1),
      },
      start,
      remaining,
      nextCheckpointDate,
    };

    const storedSchedule = dsMockUtils.createMockStoredSchedule({
      schedule: dsMockUtils.createMockCheckpointSchedule({
        start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
        period: dsMockUtils.createMockCalendarPeriod({
          unit: dsMockUtils.createMockCalendarUnit('Month'),
          amount: dsMockUtils.createMockU64(new BigNumber(1)),
        }),
      }),
      id: dsMockUtils.createMockU64(id),
      remaining: dsMockUtils.createMockU32(remaining),
      at: dsMockUtils.createMockMoment(new BigNumber(nextCheckpointDate.getTime())),
    });

    const result = storedScheduleToCheckpointScheduleParams(storedSchedule);

    expect(result).toEqual(fakeResult);
  });
});

describe('meshCorporateActionToCorporateActionParams', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot CorporateAction object to a CorporateActionParams object', () => {
    const kind = CorporateActionKind.UnpredictableBenefit;
    const declarationDate = new Date('10/14/1987');
    const description = 'someDescription';
    const dids = ['someDid', 'otherDid'];
    const defaultTaxWithholding = new BigNumber(10);
    const taxWithholdings = [
      {
        identity: entityMockUtils.getIdentityInstance({ did: dids[0] }),
        percentage: new BigNumber(30),
      },
    ];

    const context = dsMockUtils.getContextInstance();

    const fakeResult: CorporateActionParams = {
      kind,
      declarationDate,
      targets: {
        identities: [
          expect.objectContaining({ did: dids[0] }),
          expect.objectContaining({ did: dids[1] }),
        ],
        treatment: TargetTreatment.Include,
      },
      description,
      defaultTaxWithholding,
      taxWithholdings: [
        {
          identity: expect.objectContaining({ did: dids[0] }),
          percentage: new BigNumber(30),
        },
      ],
    };

    /* eslint-disable @typescript-eslint/naming-convention */
    const params = {
      kind,
      decl_date: new BigNumber(declarationDate.getTime()),
      record_date: null,
      targets: {
        identities: dids,
        treatment: TargetTreatment.Include,
      },
      default_withholding_tax: defaultTaxWithholding.shiftedBy(4),
      withholding_tax: [tuple(dids[0], taxWithholdings[0].percentage.shiftedBy(4))],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    let corporateAction = dsMockUtils.createMockCorporateAction(params);
    const details = dsMockUtils.createMockText(description);

    let result = meshCorporateActionToCorporateActionParams(corporateAction, details, context);

    expect(result).toEqual(fakeResult);

    corporateAction = dsMockUtils.createMockCorporateAction({
      ...params,
      targets: {
        identities: dids,
        treatment: TargetTreatment.Exclude,
      },
      kind: dsMockUtils.createMockCAKind('IssuerNotice'),
    });

    result = meshCorporateActionToCorporateActionParams(corporateAction, details, context);

    expect(result).toEqual({
      ...fakeResult,
      kind: CorporateActionKind.IssuerNotice,
      targets: { ...fakeResult.targets, treatment: TargetTreatment.Exclude },
    });

    corporateAction = dsMockUtils.createMockCorporateAction({
      ...params,
      kind: dsMockUtils.createMockCAKind('PredictableBenefit'),
    });

    result = meshCorporateActionToCorporateActionParams(corporateAction, details, context);

    expect(result).toEqual({ ...fakeResult, kind: CorporateActionKind.PredictableBenefit });

    corporateAction = dsMockUtils.createMockCorporateAction({
      ...params,
      kind: dsMockUtils.createMockCAKind('Other'),
    });

    result = meshCorporateActionToCorporateActionParams(corporateAction, details, context);

    expect(result).toEqual({ ...fakeResult, kind: CorporateActionKind.Other });

    corporateAction = dsMockUtils.createMockCorporateAction({
      ...params,
      kind: dsMockUtils.createMockCAKind('Reorganization'),
    });

    result = meshCorporateActionToCorporateActionParams(corporateAction, details, context);

    expect(result).toEqual({ ...fakeResult, kind: CorporateActionKind.Reorganization });
  });
});

describe('distributionToDividendDistributionParams', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a polkadot Distribution object to a DividendDistributionParams object', () => {
    const from = new BigNumber(1);
    const did = 'someDid';
    const currency = 'USD';
    const perShare = new BigNumber(100);
    const maxAmount = new BigNumber(10000);
    const paymentDate = new Date('10/14/2022');
    const expiryDate = new Date('10/14/2024');

    const context = dsMockUtils.getContextInstance();

    const fakeResult: DividendDistributionParams = {
      origin: expect.objectContaining({ id: from, owner: expect.objectContaining({ did }) }),
      currency,
      perShare,
      maxAmount,
      paymentDate,
      expiryDate,
    };

    /* eslint-disable @typescript-eslint/naming-convention */
    const params = {
      from: { did, kind: { User: dsMockUtils.createMockU64(from) } },
      currency,
      per_share: perShare.shiftedBy(6),
      amount: maxAmount.shiftedBy(6),
      remaining: new BigNumber(9000).shiftedBy(6),
      reclaimed: false,
      payment_at: new BigNumber(paymentDate.getTime()),
      expires_at: dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime())),
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    let distribution = dsMockUtils.createMockDistribution(params);

    let result = distributionToDividendDistributionParams(distribution, context);

    expect(result).toEqual(fakeResult);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    distribution = dsMockUtils.createMockDistribution({ ...params, expires_at: null });

    result = distributionToDividendDistributionParams(distribution, context);

    expect(result).toEqual({ ...fakeResult, expiryDate: null });
  });
});

describe('corporateActionKindToCaKind', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a string to a polkadot CAKind object', () => {
    const value = CorporateActionKind.IssuerNotice;
    const fakeResult = 'issuerNotice' as unknown as CAKind;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('CAKind', value).returns(fakeResult);

    const result = corporateActionKindToCaKind(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('checkpointToRecordDateSpec', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a Checkpoint to a polkadot RecordDateSpec', () => {
    const id = new BigNumber(1);
    const value = entityMockUtils.getCheckpointInstance({ id });

    const fakeResult = 'recordDateSpec' as unknown as RecordDateSpec;
    const rawId = dsMockUtils.createMockU64(id);
    const context = dsMockUtils.getContextInstance();
    const createTypeStub = context.createType;

    createTypeStub.withArgs('u64', id.toString()).returns(rawId);
    createTypeStub.withArgs('RecordDateSpec', { Existing: rawId }).returns(fakeResult);

    const result = checkpointToRecordDateSpec(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should convert a Date to a polkadot RecordDateSpec', () => {
    const value = new Date('10/14/2022');

    const fakeResult = 'recordDateSpec' as unknown as RecordDateSpec;
    const rawDate = dsMockUtils.createMockMoment(new BigNumber(value.getTime()));
    const context = dsMockUtils.getContextInstance();
    const createTypeStub = context.createType;

    createTypeStub.withArgs('Moment', value.getTime()).returns(rawDate);
    createTypeStub.withArgs('RecordDateSpec', { Scheduled: rawDate }).returns(fakeResult);

    const result = checkpointToRecordDateSpec(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should convert a CheckpointSchedule to a polkadot RecordDateSpec', () => {
    const id = new BigNumber(1);
    const value = entityMockUtils.getCheckpointScheduleInstance({ id });

    const fakeResult = 'recordDateSpec' as unknown as RecordDateSpec;
    const rawId = dsMockUtils.createMockU64(id);
    const context = dsMockUtils.getContextInstance();
    const createTypeStub = context.createType;

    createTypeStub.withArgs('u64', id.toString()).returns(rawId);
    createTypeStub.withArgs('RecordDateSpec', { ExistingSchedule: rawId }).returns(fakeResult);

    const result = checkpointToRecordDateSpec(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('targetIdentitiesToCorporateActionTargets', () => {
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
  });

  it('should convert a polkadot TargetIdentities object to a CorporateActionTargets object', () => {
    const fakeResult = {
      identities: [expect.objectContaining({ did: 'someDid' })],
      treatment: TargetTreatment.Include,
    };
    const context = dsMockUtils.getContextInstance();
    let targetIdentities = dsMockUtils.createMockTargetIdentities({
      identities: ['someDid'],
      treatment: 'Include',
    });

    let result = targetIdentitiesToCorporateActionTargets(targetIdentities, context);
    expect(result).toEqual(fakeResult);

    fakeResult.treatment = TargetTreatment.Exclude;
    targetIdentities = dsMockUtils.createMockTargetIdentities({
      identities: ['someDid'],
      treatment: 'Exclude',
    });

    result = targetIdentitiesToCorporateActionTargets(targetIdentities, context);
    expect(result).toEqual(fakeResult);
  });
});

describe('targetsToTargetIdentities', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a CorporateActionTargets object to a polkadot TargetIdentities object', () => {
    const did = 'someDid';
    const treatment = TargetTreatment.Include;
    const value = { identities: [entityMockUtils.getIdentityInstance({ did })], treatment };
    const fakeResult = 'targetIdentities' as unknown as TargetIdentities;
    const context = dsMockUtils.getContextInstance();
    const createTypeStub = context.createType;

    const rawDid = dsMockUtils.createMockIdentityId(did);
    const rawTreatment = dsMockUtils.createMockTargetTreatment();

    createTypeStub.withArgs('IdentityId', did).returns(rawDid);
    createTypeStub.withArgs('TargetTreatment', treatment).returns(rawTreatment);
    createTypeStub
      .withArgs('TargetIdentities', {
        identities: [rawDid],
        treatment: rawTreatment,
      })
      .returns(fakeResult);

    const result = targetsToTargetIdentities(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('corporateActionIdentifierToCaId', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a CorporateActionIdentifier object to a polkadot CAId object', () => {
    const context = dsMockUtils.getContextInstance();
    const args = {
      ticker: 'SOME_TICKER',
      localId: new BigNumber(1),
    };
    const ticker = dsMockUtils.createMockTicker(args.ticker);
    const localId = dsMockUtils.createMockU32(args.localId);
    const fakeResult = 'CAId' as unknown as CAId;

    context.createType.withArgs('Ticker', padString(args.ticker, 12)).returns(ticker);
    context.createType.withArgs('u32', args.localId.toString()).returns(localId);

    context.createType
      .withArgs('CAId', {
        ticker,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        local_id: localId,
      })
      .returns(fakeResult);

    const result = corporateActionIdentifierToCaId(args, context);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToSignature', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a string to a polkadot Signature object', () => {
    const value = 'someValue';
    const fakeResult = 'convertedSignature' as unknown as Signature;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('Signature', value).returns(fakeResult);

    const result = stringToSignature(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('stringToRistrettoPoint', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a string to a polkadot RistrettoPoint object', () => {
    const value = 'someValue';
    const fakeResult = 'convertedRistrettoPoint' as unknown as RistrettoPoint;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('RistrettoPoint', value).returns(fakeResult);

    const result = stringToRistrettoPoint(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('stringToScalar', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a string to a polkadot Scalar object', () => {
    const value = 'someValue';
    const fakeResult = 'convertedScalar' as unknown as Scalar;
    const context = dsMockUtils.getContextInstance();

    context.createType.withArgs('Scalar', value).returns(fakeResult);

    const result = stringToScalar(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('scopeClaimProofToMeshScopeClaimProof', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a proof and a scopeId to a polkadot ScopeClaimProof object', () => {
    const [
      scopeId,
      proofScopeIdWellFormed,
      firstChallengeResponse,
      secondChallengeResponse,
      subtractExpressionsRes,
      blindedScopeDidHash,
    ] = [
      'someScopeId',
      'someProofScopeIdWellFormed',
      'someFirstChallengeResponse',
      'someSecondChallengeResponse',
      'someSubtractExpressionsRes',
      'someBlindedScopeDidHash',
    ];
    const proof: ScopeClaimProof = {
      proofScopeIdWellFormed,
      proofScopeIdCddIdMatch: {
        challengeResponses: [firstChallengeResponse, secondChallengeResponse],
        subtractExpressionsRes,
        blindedScopeDidHash,
      },
    };
    /* eslint-disable @typescript-eslint/naming-convention */
    const rawFirstChallengeResponse = dsMockUtils.createMockScalar(firstChallengeResponse);
    const rawSecondChallengeResponse = dsMockUtils.createMockScalar(secondChallengeResponse);
    const rawSubtractExpressionsRes = dsMockUtils.createMockRistrettoPoint(subtractExpressionsRes);
    const rawBlindedScopeDidHash = dsMockUtils.createMockRistrettoPoint(blindedScopeDidHash);
    const rawZkProofData = dsMockUtils.createMockZkProofData({
      subtract_expressions_res: subtractExpressionsRes,
      challenge_responses: [firstChallengeResponse, secondChallengeResponse],
      blinded_scope_did_hash: blindedScopeDidHash,
    });
    const rawProofScopeIdWellFormed = dsMockUtils.createMockSignature(proofScopeIdWellFormed);
    const rawScopeId = dsMockUtils.createMockRistrettoPoint(scopeId);
    const fakeResult = dsMockUtils.createMockScopeClaimProof({
      proof_scope_id_wellformed: proofScopeIdWellFormed,
      proof_scope_id_cdd_id_match: {
        subtract_expressions_res: subtractExpressionsRes,
        challenge_responses: [firstChallengeResponse, secondChallengeResponse],
        blinded_scope_did_hash: blindedScopeDidHash,
      },
      scope_id: scopeId,
    });

    const zkProofData = {
      challenge_responses: [rawFirstChallengeResponse, rawSecondChallengeResponse],
      subtract_expressions_res: rawSubtractExpressionsRes,
      blinded_scope_did_hash: rawBlindedScopeDidHash,
    };
    const scopeClaimProof = {
      proof_scope_id_wellformed: rawProofScopeIdWellFormed,
      proof_scope_id_cdd_id_match: rawZkProofData,
      scope_id: rawScopeId,
    };
    /* eslint-enable @typescript-eslint/naming-convention */
    const context = dsMockUtils.getContextInstance();

    context.createType
      .withArgs('Scalar', firstChallengeResponse)
      .returns(rawFirstChallengeResponse);
    context.createType
      .withArgs('Scalar', secondChallengeResponse)
      .returns(rawSecondChallengeResponse);
    context.createType
      .withArgs('RistrettoPoint', subtractExpressionsRes)
      .returns(rawSubtractExpressionsRes);
    context.createType
      .withArgs('RistrettoPoint', blindedScopeDidHash)
      .returns(rawBlindedScopeDidHash);
    context.createType.withArgs('ZkProofData', zkProofData).returns(rawZkProofData);

    context.createType
      .withArgs('Signature', proofScopeIdWellFormed)
      .returns(rawProofScopeIdWellFormed);
    context.createType.withArgs('RistrettoPoint', scopeId).returns(rawScopeId);

    context.createType.withArgs('ScopeClaimProof', scopeClaimProof).returns(fakeResult);

    const result = scopeClaimProofToMeshScopeClaimProof(proof, scopeId, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('transactionPermissionsToExtrinsicPermissions', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a TransactionPermissions to a polkadot ExtrinsicPermissions object', () => {
    const value = {
      values: [TxTags.sto.Invest],
      type: PermissionType.Include,
    };
    const context = dsMockUtils.getContextInstance();

    const fakeResult = 'convertedExtrinsicPermissions' as unknown as ExtrinsicPermissions;

    context.createType
      .withArgs('ExtrinsicPermissions', sinon.match(sinon.match.object))
      .returns(fakeResult);

    let result = transactionPermissionsToExtrinsicPermissions(value, context);

    expect(result).toEqual(fakeResult);

    context.createType.withArgs('ExtrinsicPermissions', 'Whole').returns(fakeResult);

    result = transactionPermissionsToExtrinsicPermissions(null, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('agentGroupToPermissionGroup', () => {
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
  });

  it('should convert a polkadot AgentGroup object to a PermissionGroup entity', () => {
    const ticker = 'SOME_TICKER';
    const context = dsMockUtils.getContextInstance();

    let agentGroup = dsMockUtils.createMockAgentGroup('Full');

    let result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.Full,
      })
    );

    agentGroup = dsMockUtils.createMockAgentGroup('ExceptMeta');

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.ExceptMeta,
      })
    );

    agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1Caa');

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.PolymeshV1Caa,
      })
    );

    agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1Pia');

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.PolymeshV1Pia,
      })
    );

    const id = new BigNumber(1);
    const rawAgId = dsMockUtils.createMockU32(id) as AGId;
    agentGroup = dsMockUtils.createMockAgentGroup({ Custom: rawAgId });

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({ asset: expect.objectContaining({ ticker }), id })
    );
  });
});
