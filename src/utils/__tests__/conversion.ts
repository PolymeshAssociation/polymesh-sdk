import { bool, Bytes, Option, Text, U8aFixed, u32, u64, u128 } from '@polkadot/types';
import {
  AccountId,
  Balance,
  BlockHash,
  Call,
  Hash,
  Moment,
  Permill,
} from '@polkadot/types/interfaces';
import {
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletStoPriceTier,
  PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesCddId,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
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
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesMultisigProposalStatus,
  PolymeshPrimitivesPortfolioFund,
  PolymeshPrimitivesSecondaryKeySignatory,
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
import { BTreeSet } from '@polkadot/types-codec';
import type { ITuple } from '@polkadot/types-codec/types';
import { hexToU8a, stringToHex } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import {
  AuthorizationType as MeshAuthorizationType,
  ExtrinsicPermissions,
  Permissions as MeshPermissions,
} from 'polymesh-types/polymesh';

import { UnreachableCaseError } from '~/api/procedures/utils';
import {
  Account,
  Context,
  DefaultPortfolio,
  Identity,
  NumberedPortfolio,
  PolymeshError,
} from '~/internal';
import { CallIdEnum, ClaimTypeEnum, InstructionStatusEnum, ModuleIdEnum } from '~/middleware/enums';
import {
  Block,
  Claim as MiddlewareClaim,
  Instruction,
  Portfolio as MiddlewarePortfolio,
} from '~/middleware/types';
import { ClaimScopeTypeEnum } from '~/middleware/typesV1';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  createMockOption,
  createMockPortfolioId,
  createMockTicker,
  createMockU32,
  createMockU64,
  createMockU128,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  AffirmationStatus,
  AssetDocument,
  Authorization,
  AuthorizationType,
  CalendarPeriod,
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
  ErrorCode,
  InputCondition,
  InstructionType,
  KnownAssetType,
  MetadataLockStatus,
  MetadataType,
  ModuleName,
  OfferingBalanceStatus,
  OfferingSaleStatus,
  OfferingTier,
  OfferingTimingStatus,
  PermissionGroupType,
  Permissions,
  PermissionsLike,
  PermissionType,
  PortfolioMovement,
  ProposalStatus,
  Scope,
  ScopeType,
  SecurityIdentifierType,
  Signer,
  SignerType,
  SignerValue,
  StatType,
  TargetTreatment,
  TransferError,
  TransferRestriction,
  TransferRestrictionType,
  TransferStatus,
  TrustedClaimIssuer,
  TxGroup,
  TxTags,
  VenueType,
} from '~/types';
import { InstructionStatus, PermissionGroupIdentifier } from '~/types/internal';
import { tuple } from '~/types/utils';
import { DUMMY_ACCOUNT_ID, MAX_BALANCE, MAX_DECIMALS, MAX_TICKER_LENGTH } from '~/utils/constants';
import * as internalUtils from '~/utils/internal';
import { padString, periodComplexity } from '~/utils/internal';

import {
  accountIdToString,
  addressToKey,
  agentGroupToPermissionGroup,
  agentGroupToPermissionGroupIdentifier,
  assetComplianceResultToCompliance,
  assetDocumentToDocument,
  assetIdentifierToSecurityIdentifier,
  assetTypeToKnownOrId,
  authorizationDataToAuthorization,
  authorizationToAuthorizationData,
  authorizationTypeToMeshAuthorizationType,
  balanceToBigNumber,
  bigNumberToBalance,
  bigNumberToU32,
  bigNumberToU64,
  bigNumberToU128,
  booleanToBool,
  boolToBoolean,
  bytesToString,
  calendarPeriodToMeshCalendarPeriod,
  canTransferResultToTransferStatus,
  caTaxWithholdingsToMeshTaxWithholdings,
  cddIdToString,
  cddStatusToBoolean,
  checkpointToRecordDateSpec,
  claimCountStatInputToStatUpdates,
  claimCountToClaimCountRestrictionValue,
  claimToMeshClaim,
  claimTypeToMeshClaimType,
  complianceConditionsToBtreeSet,
  complianceRequirementResultToRequirementCompliance,
  complianceRequirementToRequirement,
  corporateActionIdentifierToCaId,
  corporateActionKindToCaKind,
  corporateActionParamsToMeshCorporateActionArgs,
  countStatInputToStatUpdates,
  createStat2ndKey,
  datesToScheduleCheckpoints,
  dateToMoment,
  distributionToDividendDistributionParams,
  documentHashToString,
  documentToAssetDocument,
  endConditionToSettlementType,
  expiryToMoment,
  extrinsicIdentifierToTxTag,
  fundingRoundToAssetFundingRound,
  fundraiserTierToTier,
  fundraiserToOfferingDetails,
  granularCanTransferResultToTransferBreakdown,
  hashToString,
  identitiesToBtreeSet,
  identityIdToString,
  inputStatTypeToMeshStatType,
  instructionMemoToString,
  internalAssetTypeToAssetType,
  isCusipValid,
  isFigiValid,
  isIsinValid,
  isLeiValid,
  keyAndValueToStatUpdate,
  keyToAddress,
  legToSettlementLeg,
  meshAffirmationStatusToAffirmationStatus,
  meshCalendarPeriodToCalendarPeriod,
  meshClaimToClaim,
  meshClaimToInputStatClaim,
  meshClaimTypeToClaimType,
  meshCorporateActionToCorporateActionParams,
  meshInstructionStatusToInstructionStatus,
  meshMetadataSpecToMetadataSpec,
  meshMetadataValueToMetadataValue,
  meshPermissionsToPermissions,
  meshProposalStatusToProposalStatus,
  meshScopeToScope,
  meshSettlementTypeToEndCondition,
  meshStatToStatType,
  meshVenueTypeToVenueType,
  metadataSpecToMeshMetadataSpec,
  metadataToMeshMetadataKey,
  metadataValueDetailToMeshMetadataValueDetail,
  metadataValueToMeshMetadataValue,
  middlewareInstructionToHistoricInstruction,
  middlewareScopeToScope,
  middlewareV2ClaimToClaimData,
  middlewareV2EventDetailsToEventIdentifier,
  middlewareV2PortfolioToPortfolio,
  moduleAddressToString,
  momentToDate,
  nameToAssetName,
  offeringTierToPriceTier,
  percentageToPermill,
  permillToBigNumber,
  permissionGroupIdentifierToAgentGroup,
  permissionsLikeToPermissions,
  permissionsToMeshPermissions,
  portfolioIdToMeshPortfolioId,
  portfolioLikeToPortfolio,
  portfolioLikeToPortfolioId,
  portfolioMovementToPortfolioFund,
  portfolioToPortfolioKind,
  posRatioToBigNumber,
  requirementToComplianceRequirement,
  scheduleSpecToMeshScheduleSpec,
  scopeToMeshScope,
  scopeToMiddlewareScope,
  secondaryAccountToMeshSecondaryKey,
  securityIdentifierToAssetIdentifier,
  signatoryToSignerValue,
  signerToSignatory,
  signerToSignerValue,
  signerToString,
  signerValueToSignatory,
  signerValueToSigner,
  sortStatsByClaimType,
  sortTransferRestrictionByClaimValue,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statsClaimToStatClaimInputType,
  statUpdatesToBtreeStatUpdate,
  stringToAccountId,
  stringToBlockHash,
  stringToBytes,
  stringToCddId,
  stringToDocumentHash,
  stringToHash,
  stringToIdentityId,
  stringToMemo,
  stringToText,
  stringToTicker,
  stringToTickerKey,
  stringToU8aFixed,
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
  transferConditionsToBtreeTransferConditions,
  transferConditionToTransferRestriction,
  transferRestrictionToPolymeshTransferCondition,
  transferRestrictionTypeToStatOpType,
  trustedClaimIssuerToTrustedIssuer,
  txGroupToTxTags,
  txTagToExtrinsicIdentifier,
  txTagToProtocolOp,
  u8ToBigNumber,
  u8ToTransferStatus,
  u16ToBigNumber,
  u32ToBigNumber,
  u64ToBigNumber,
  u128ToBigNumber,
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
    let ticker = 'SOME_TICKER';
    let result = tickerToDid(ticker);

    expect(result).toBe('0x3a2c35c06ab681afb326a1a1110467c0a6d9138b76fc0e1e42d0d5b06dae8e3d');

    ticker = 'OTHER_TICKER';
    result = tickerToDid(ticker);

    expect(result).toBe('0xc8870af7d813b13964b99580b394649088275d2393a3cfdbb1f1689dfb6f3981');

    ticker = 'LAST_TICKER';
    result = tickerToDid(ticker);

    expect(result).toBe('0x8c2d4fa74d62ff136c267a80ec3738a0eea6d804386c8238a11d8f3cc465fa79');
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

      when(context.createType).calledWith('bool', value).mockReturnValue(fakeResult);

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

      when(context.createType).calledWith('Bytes', value).mockReturnValue(fakeResult);

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

describe('portfolioMovementToPortfolioFund', () => {
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
    const rawMemo = 'memo' as unknown as PolymeshPrimitivesMemo;
    const fakeResult =
      'PolymeshPrimitivesPortfolioFund' as unknown as PolymeshPrimitivesPortfolioFund;

    let portfolioMovement: PortfolioMovement = {
      asset: ticker,
      amount,
    };

    when(context.createType)
      .calledWith('PolymeshPrimitivesTicker', padString(ticker, 12))
      .mockReturnValue(rawTicker);

    when(context.createType)
      .calledWith('Balance', portfolioMovement.amount.multipliedBy(Math.pow(10, 6)).toString())
      .mockReturnValue(rawAmount);

    when(context.createType)
      .calledWith('PolymeshPrimitivesPortfolioFund', {
        description: {
          Fungible: {
            ticker: rawTicker,
            amount: rawAmount,
          },
        },
        memo: null,
      })
      .mockReturnValue(fakeResult);

    let result = portfolioMovementToPortfolioFund(portfolioMovement, context);

    expect(result).toBe(fakeResult);

    portfolioMovement = {
      asset,
      amount,
    };

    result = portfolioMovementToPortfolioFund(portfolioMovement, context);

    expect(result).toBe(fakeResult);

    when(context.createType)
      .calledWith('PolymeshPrimitivesMemo', padString(memo, 32))
      .mockReturnValue(rawMemo);

    when(context.createType)
      .calledWith('PolymeshPrimitivesPortfolioFund', {
        description: {
          Fungible: {
            ticker: rawTicker,
            amount: rawAmount,
          },
        },
        memo: rawMemo,
      })
      .mockReturnValue(fakeResult);

    portfolioMovement = {
      asset,
      amount,
      memo,
    };

    result = portfolioMovementToPortfolioFund(portfolioMovement, context);

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
    let context: Mocked<Context>;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
    });

    it('should convert a string to a polkadot Ticker object', () => {
      const value = 'SOME_TICKER';
      const fakeResult = 'convertedTicker' as unknown as PolymeshPrimitivesTicker;

      when(context.createType)
        .calledWith('PolymeshPrimitivesTicker', padString(value, 12))
        .mockReturnValue(fakeResult);

      const result = stringToTicker(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should throw an error if the ticker does not have a length between 1 and 12 characters', () => {
      expect(() => stringToTicker('SOME_LONG_TICKER', context)).toThrow(
        'Ticker length must be between 1 and 12 characters'
      );
      expect(() => stringToTicker('', context)).toThrow(
        'Ticker length must be between 1 and 12 characters'
      );
    });

    it('should throw an error if the ticker is not printable ASCII', () => {
      expect(() => stringToTicker('TICKER\x80', context)).toThrow(
        'Only printable ASCII is allowed as ticker name'
      );
    });

    it('should throw an error if the ticker contains lowercase letters', () => {
      expect(() => stringToTicker('ticker', context)).toThrow(
        'Ticker cannot contain lower case letters'
      );
    });
  });

  describe('stringToTickerKey', () => {
    beforeAll(() => {
      dsMockUtils.initMocks();
    });

    afterEach(() => {
      dsMockUtils.reset();
    });

    afterAll(() => {
      dsMockUtils.cleanup();
    });

    it('should call stringToTicker and return the result as an object', () => {
      const value = 'SOME_TICKER';
      const fakeResult = 'convertedTicker' as unknown as PolymeshPrimitivesTicker;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesTicker', padString(value, 12))
        .mockReturnValue(fakeResult);

      const result = stringToTickerKey(value, context);
      expect(result).toEqual({ Ticker: fakeResult });
    });
  });

  describe('tickerToString', () => {
    it('should convert a polkadot Ticker object to a string', () => {
      const fakeResult = 'SOME_TICKER';
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

      when(context.createType)
        .calledWith('u64', Math.round(value.getTime()))
        .mockReturnValue(fakeResult);

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

      when(context.createType).calledWith('AccountId', value).mockReturnValue(fakeResult);

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

      when(context.createType).calledWith('Hash', value).mockReturnValue(fakeResult);

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

describe('stringToBlockHash', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a block hash string into an BlockHash', () => {
    const blockHash = 'BlockHash';
    const fakeResult = 'type' as unknown as BlockHash;
    const context = dsMockUtils.getContextInstance();

    when(context.createType).calledWith('BlockHash', blockHash).mockReturnValue(fakeResult);

    const result = stringToBlockHash(blockHash, context);

    expect(result).toBe(fakeResult);
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
    it('should convert a did string into an PolymeshPrimitivesIdentityId', () => {
      const identity = 'IdentityObject';
      const fakeResult = 'type' as unknown as PolymeshPrimitivesIdentityId;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesIdentityId', identity)
        .mockReturnValue(fakeResult);

      const result = stringToIdentityId(identity, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('identityIdToString', () => {
    it('should convert an PolymeshPrimitivesIdentityId to a did string', () => {
      const fakeResult = 'IdentityString';
      const identityId = dsMockUtils.createMockIdentityId(fakeResult);

      const result = identityIdToString(identityId);
      expect(result).toBe(fakeResult);
    });
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
    jest.restoreAllMocks();
  });

  describe('signerValueToSignatory', () => {
    it('should convert a SignerValue to a polkadot PolymeshPrimitivesSecondaryKeySignatory object', () => {
      const value = {
        type: SignerType.Identity,
        value: 'someIdentity',
      };
      const fakeResult = 'SignatoryEnum' as unknown as PolymeshPrimitivesSecondaryKeySignatory;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesSecondaryKeySignatory', { [value.type]: value.value })
        .mockReturnValue(fakeResult);

      const result = signerValueToSignatory(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('signerToSignatory', () => {
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
      jest.restoreAllMocks();
    });
    it('should convert a Signer to a polkadot PolymeshPrimitivesSecondaryKeySignatory object', () => {
      const context = dsMockUtils.getContextInstance();
      const address = DUMMY_ACCOUNT_ID;
      const fakeResult = 'SignatoryEnum' as unknown as PolymeshPrimitivesSecondaryKeySignatory;
      const account = new Account({ address }, context);

      when(context.createType)
        .calledWith('PolymeshPrimitivesSecondaryKeySignatory', { [SignerType.Account]: address })
        .mockReturnValue(fakeResult);

      const result = signerToSignatory(account, context);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('signatoryToSignerValue', () => {
    it('should convert a polkadot PolymeshPrimitivesSecondaryKeySignatory object to a SignerValue', () => {
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
    jest.restoreAllMocks();
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
        value: entityMockUtils.getIdentityInstance({ did: 'someIdentity' }),
      };

      const fakeResult =
        'AuthorizationDataEnum' as unknown as PolymeshPrimitivesAuthorizationAuthorizationData;

      const createTypeMock = context.createType;
      const rawIdentity = dsMockUtils.createMockIdentityId(value.value.did);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityId', value.value.did)
        .mockReturnValue(rawIdentity);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: rawIdentity,
        })
        .mockReturnValue(fakeResult);

      let result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      const fakeTicker = 'convertedTicker' as unknown as PolymeshPrimitivesTicker;
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesTicker', padString(ticker, 12))
        .mockReturnValue(fakeTicker);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', expect.anything())
        .mockReturnValue(rawPermissions);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: rawPermissions,
        })
        .mockReturnValue(fakeResult);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioId', expect.anything())
        .mockReturnValue(rawPortfolioId);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: rawPortfolioId,
        })
        .mockReturnValue(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.RotatePrimaryKey,
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', { [value.type]: null })
        .mockReturnValue(fakeResult);

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

      let rawAgentGroup = 'Full' as unknown as PolymeshPrimitivesAgentAgentGroup;
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAgentAgentGroup', knownPermissionGroup.type)
        .mockReturnValue(rawAgentGroup);

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: [fakeTicker, rawAgentGroup],
        })
        .mockReturnValue(fakeResult);

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

      rawAgentGroup = 'Full' as unknown as PolymeshPrimitivesAgentAgentGroup;
      when(createTypeMock)
        .calledWith('u32', id.toString())
        .mockReturnValue(id as unknown as u32);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAgentAgentGroup', { Custom: id })
        .mockReturnValue(rawAgentGroup);

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: [fakeTicker, rawAgentGroup],
        })
        .mockReturnValue(fakeResult);
      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.TransferAssetOwnership,
        value: 'TICKER',
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesTicker', padString('TICKER', MAX_TICKER_LENGTH))
        .mockReturnValue(fakeTicker);

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: fakeTicker,
        })
        .mockReturnValue(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.TransferTicker,
        value: 'TICKER',
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesTicker', padString('TICKER', MAX_TICKER_LENGTH))
        .mockReturnValue(fakeTicker);

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: fakeTicker,
        })
        .mockReturnValue(fakeResult);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', expect.anything())
        .mockReturnValue(rawPermissions);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: rawPermissions,
        })
        .mockReturnValue(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);

      value = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: {
          beneficiary: new Account({ address: 'beneficiary' }, context),
          subsidizer: new Account({ address: 'subsidizer' }, context),
          allowance: new BigNumber(100),
        },
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesAuthorizationAuthorizationData', {
          [value.type]: value.value,
        })
        .mockReturnValue(fakeResult);

      result = authorizationToAuthorizationData(value, context);
      expect(result).toBe(fakeResult);
    });
  });

  describe('authorizationDataToAuthorization', () => {
    it('should convert a polkadot AuthorizationData object to an Authorization', () => {
      const context = dsMockUtils.getContextInstance();
      let fakeResult: Authorization = {
        type: AuthorizationType.AttestPrimaryKeyRotation,
        value: expect.objectContaining({ did: 'someDid' }),
      };
      let authorizationData = dsMockUtils.createMockAuthorizationData({
        AttestPrimaryKeyRotation: dsMockUtils.createMockIdentityId('someDid'),
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
        value: 'SOME_TICKER',
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
        value: 'SOME_TICKER',
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
        'Unsupported Authorization Type. Please contact the Polymesh team'
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
    it('should convert a PermissionGroupIdentifier to a polkadot PolymeshPrimitivesAgentAgentGroup object', () => {
      let value: PermissionGroupIdentifier = PermissionGroupType.PolymeshV1Pia;
      const fakeResult = 'convertedAgentGroup' as unknown as PolymeshPrimitivesAgentAgentGroup;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesAgentAgentGroup', value)
        .mockReturnValue(fakeResult);

      let result = permissionGroupIdentifierToAgentGroup(value, context);

      expect(result).toEqual(fakeResult);

      const custom = new BigNumber(100);
      value = { custom };

      const u32FakeResult = '100' as unknown as u32;

      when(context.createType).calledWith('u32', custom.toString()).mockReturnValue(u32FakeResult);
      when(context.createType)
        .calledWith('PolymeshPrimitivesAgentAgentGroup', { Custom: u32FakeResult })
        .mockReturnValue(fakeResult);

      result = permissionGroupIdentifierToAgentGroup(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('agentGroupToPermissionGroupIdentifier', () => {
    it('should convert a polkadot PolymeshPrimitivesAgentAgentGroup object to a PermissionGroupIdentifier', () => {
      let agentGroup = dsMockUtils.createMockAgentGroup('Full');

      let result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.Full);

      agentGroup = dsMockUtils.createMockAgentGroup('ExceptMeta');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.ExceptMeta);

      agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1CAA');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.PolymeshV1Caa);

      agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1PIA');

      result = agentGroupToPermissionGroupIdentifier(agentGroup);
      expect(result).toEqual(PermissionGroupType.PolymeshV1Pia);

      const id = new BigNumber(1);
      const rawAgId = dsMockUtils.createMockU32(id);
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

    when(context.createType).calledWith('AuthorizationType', value).mockReturnValue(fakeResult);

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
    it('should convert a Permissions to a polkadot PolymeshPrimitivesSecondaryKeyPermissions object (ordering tx alphabetically)', () => {
      let value: Permissions = {
        assets: null,
        transactions: null,
        transactionGroups: [],
        portfolios: null,
      };
      const fakeResult = 'convertedPermission' as unknown as MeshPermissions;
      const context = dsMockUtils.getContextInstance();

      const createTypeMock = context.createType;

      let fakeExtrinsicPermissionsResult: unknown =
        'convertedExtrinsicPermissions' as unknown as ExtrinsicPermissions;
      when(context.createType)
        .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', 'Whole')
        .mockReturnValue(
          fakeExtrinsicPermissionsResult as unknown as PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
        );

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', {
          asset: 'Whole',
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: 'Whole',
        })
        .mockReturnValue(fakeResult);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', expect.anything())
        .mockReturnValue(
          fakeExtrinsicPermissionsResult as unknown as PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
        );

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
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', {
          asset: {
            These: [rawTicker],
          },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: {
            These: [rawPortfolioId],
          },
        })
        .mockReturnValue(fakeResult);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesTicker', padString(ticker, 12))
        .mockReturnValue(rawTicker);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityIdPortfolioId', expect.anything())
        .mockReturnValue(rawPortfolioId);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', expect.anything())
        .mockReturnValue(
          fakeExtrinsicPermissionsResult as unknown as PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
        );

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', {
          asset: 'Whole',
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: 'Whole',
        })
        .mockReturnValue(fakeResult);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', expect.anything())
        .mockReturnValue(
          fakeExtrinsicPermissionsResult as unknown as PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
        );

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', {
          asset: {
            Except: [rawTicker],
          },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: {
            Except: [rawPortfolioId],
          },
        })
        .mockReturnValue(fakeResult);

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

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', expect.anything())
        .mockReturnValue(
          fakeExtrinsicPermissionsResult as unknown as PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
        );

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
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesSecondaryKeyPermissions', {
          asset: { These: [rawTickers[1], rawTickers[0], rawTickers[2]] },
          extrinsic: fakeExtrinsicPermissionsResult,
          portfolio: { These: [rawPortfolioId] },
        })
        .mockReturnValue(fakeResult);

      tickers.forEach((t, i) =>
        when(createTypeMock)
          .calledWith('PolymeshPrimitivesTicker', padString(t, 12))
          .mockReturnValue(rawTickers[i])
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
      const ticker = 'SOME_TICKER';
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
            dsMockUtils.createMockPalletPermissions({
              palletName: 'Identity',
              dispatchableNames: dsMockUtils.createMockDispatchableNames({
                These: [dsMockUtils.createMockBytes('add_claim')],
              }),
            }),
            dsMockUtils.createMockPalletPermissions({
              palletName: 'Authorship',
              dispatchableNames: dsMockUtils.createMockDispatchableNames('Whole'),
            }),
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
            dsMockUtils.createMockPalletPermissions({
              palletName: 'Identity',
              dispatchableNames: dsMockUtils.createMockDispatchableNames({
                Except: [dsMockUtils.createMockBytes('add_claim')],
              }),
            }),
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

      when(context.createType).calledWith('u64', value.toString()).mockReturnValue(fakeResult);

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

      when(context.createType).calledWith('u32', value.toString()).mockReturnValue(fakeResult);

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

describe('bigNumberToU128', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a number to a polkadot u128 object', () => {
    const value = new BigNumber(100);
    const fakeResult = '100' as unknown as u128;
    const context = dsMockUtils.getContextInstance();

    when(context.createType).calledWith('u128', value.toString()).mockReturnValue(fakeResult);

    const result = bigNumberToU128(value, context);

    expect(result).toBe(fakeResult);
  });

  it('should throw an error if the number is negative', () => {
    const value = new BigNumber(-100);
    const context = dsMockUtils.getContextInstance();

    expect(() => bigNumberToU128(value, context)).toThrow();
  });

  it('should throw an error if the number is not an integer', () => {
    const value = new BigNumber(1.5);
    const context = dsMockUtils.getContextInstance();

    expect(() => bigNumberToU128(value, context)).toThrow();
  });
});

describe('u128ToBigNumber', () => {
  it('should convert a polkadot u128 object to a BigNumber', () => {
    const fakeResult = new BigNumber(100);
    const num = dsMockUtils.createMockU128(fakeResult);

    const result = u128ToBigNumber(num);
    expect(result).toEqual(new BigNumber(fakeResult));
  });
});

describe('u16ToBigNumber', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('u16ToBigNumber', () => {
    it('should convert a polkadot u32 object to a BigNumber', () => {
      const fakeResult = new BigNumber(100);
      const num = dsMockUtils.createMockU16(fakeResult);

      const result = u16ToBigNumber(num);
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

      when(context.createType)
        .calledWith('Permill', value.multipliedBy(Math.pow(10, 4)).toString())
        .mockReturnValue(fakeResult);

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

      when(context.createType)
        .calledWith('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
        .mockReturnValue(fakeResult);

      let result = bigNumberToBalance(value, context, false);

      expect(result).toBe(fakeResult);

      value = new BigNumber(100.1);

      when(context.createType)
        .calledWith('Balance', value.multipliedBy(Math.pow(10, 6)).toString())
        .mockReturnValue(fakeResult);

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
      const correct = isLeiValid('724500VKKSH9QOLTFR81');
      let incorrect = isLeiValid('969500T3MBS4SQAMHJ45');

      expect(correct).toBeTruthy();
      expect(incorrect).toBeFalsy();

      incorrect = isLeiValid('969500T3MS4SQAMHJ4');
      expect(incorrect).toBeFalsy();
    });
  });

  describe('isFigiValid', () => {
    it('should return if the Figi value identifier is valid or not', () => {
      const validIdentifiers = [
        'BBG000BLNQ16',
        'NRG92C84SB39',
        'BBG0013YWBF3',
        'BBG00H9NR574',
        'BBG00094DJF9',
        'BBG016V71XT0',
      ];

      validIdentifiers.forEach(identifier => expect(isFigiValid(identifier)).toBeTruthy());

      const invalidIdentifiers = [
        'BBG00024DJF9', // Bad check digit
        'BSG00024DJF9', // disallowed prefix
        'BBB00024DJF9', // 3rd char not G
        'BBG00024AEF9', // vowels not allowed
      ];

      invalidIdentifiers.forEach(identifier => expect(isFigiValid(identifier)).toBeFalsy());
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

  it('should convert a string to a polkadot PolymeshPrimitivesMemo object', () => {
    const value = 'someDescription';
    const fakeResult = 'memoDescription' as unknown as PolymeshPrimitivesMemo;
    const context = dsMockUtils.getContextInstance();

    when(context.createType)
      .calledWith('PolymeshPrimitivesMemo', padString(value, 32))
      .mockReturnValue(fakeResult);

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
      `Unsupported status code "${fakeStatusCode}". Please report this issue to the Polymesh team`
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
    it('should convert an AssetType to a polkadot PolymeshPrimitivesAssetAssetType object', () => {
      const value = KnownAssetType.Commodity;
      const fakeResult = 'CommodityEnum' as unknown as PolymeshPrimitivesAssetAssetType;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesAssetAssetType', value)
        .mockReturnValue(fakeResult);

      const result = internalAssetTypeToAssetType(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('assetTypeToKnownOrId', () => {
    it('should convert a polkadot PolymeshPrimitivesAssetAssetType object to a string', () => {
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

  it('should convert a polkadot PolymeshPrimitivesPosRatio object to a BigNumber', () => {
    const numerator = new BigNumber(1);
    const denominator = new BigNumber(1);
    const balance = dsMockUtils.createMockPosRatio(numerator, denominator);

    const result = posRatioToBigNumber(balance);
    expect(result).toEqual(new BigNumber(numerator).dividedBy(new BigNumber(denominator)));
  });
});

describe('nameToAssetName', () => {
  let mockContext: Mocked<Context>;
  let nameMaxLength: BigNumber;
  let rawNameMaxLength: u32;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    nameMaxLength = new BigNumber(10);
    rawNameMaxLength = dsMockUtils.createMockU32(nameMaxLength);

    dsMockUtils.setConstMock('asset', 'assetNameMaxLength', {
      returnValue: rawNameMaxLength,
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if Asset name exceeds max length', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset name length exceeded',
      data: {
        maxLength: nameMaxLength,
      },
    });

    expect(() => nameToAssetName('TOO_LONG_NAME', mockContext)).toThrowError(expectedError);
  });

  it('should convert Asset name to Bytes', () => {
    const name = 'SOME_NAME';
    const fakeName = 'fakeName' as unknown as Bytes;
    when(mockContext.createType).calledWith('Bytes', name).mockReturnValue(fakeName);

    const result = nameToAssetName(name, mockContext);
    expect(result).toEqual(fakeName);
  });
});

describe('fundingRoundToAssetFundingRound', () => {
  let mockContext: Mocked<Context>;
  let fundingRoundNameMaxLength: BigNumber;
  let rawFundingRoundNameMaxLength: u32;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    fundingRoundNameMaxLength = new BigNumber(10);
    rawFundingRoundNameMaxLength = dsMockUtils.createMockU32(fundingRoundNameMaxLength);

    dsMockUtils.setConstMock('asset', 'fundingRoundNameMaxLength', {
      returnValue: rawFundingRoundNameMaxLength,
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if funding round name exceeds max length', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset funding round name length exceeded',
      data: {
        maxLength: fundingRoundNameMaxLength,
      },
    });

    expect(() =>
      fundingRoundToAssetFundingRound('TOO_LONG_FUNDING_ROUND_NAME', mockContext)
    ).toThrowError(expectedError);
  });

  it('should convert funding round name to Bytes', () => {
    const name = 'SOME_NAME';
    const fakeFundingRoundName = 'fakeFundingRoundName' as unknown as Bytes;
    when(mockContext.createType).calledWith('Bytes', name).mockReturnValue(fakeFundingRoundName);

    const result = fundingRoundToAssetFundingRound(name, mockContext);
    expect(result).toEqual(fakeFundingRoundName);
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
      const figiValue = 'BBG00H9NR574';

      let value = { type: SecurityIdentifierType.Isin, value: isinValue };
      const fakeResult = 'IsinEnum' as unknown as PolymeshPrimitivesAssetIdentifier;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesAssetIdentifier', {
          [SecurityIdentifierType.Isin]: isinValue,
        })
        .mockReturnValue(fakeResult);

      let result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);

      value = { type: SecurityIdentifierType.Lei, value: leiValue };

      when(context.createType)
        .calledWith('PolymeshPrimitivesAssetIdentifier', { [SecurityIdentifierType.Lei]: leiValue })
        .mockReturnValue(fakeResult);

      result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);

      value = { type: SecurityIdentifierType.Cusip, value: cusipValue };

      when(context.createType)
        .calledWith('PolymeshPrimitivesAssetIdentifier', {
          [SecurityIdentifierType.Cusip]: cusipValue,
        })
        .mockReturnValue(fakeResult);

      result = securityIdentifierToAssetIdentifier(value, context);

      expect(result).toBe(fakeResult);

      value = { type: SecurityIdentifierType.Figi, value: figiValue };

      when(context.createType)
        .calledWith('PolymeshPrimitivesAssetIdentifier', {
          [SecurityIdentifierType.Figi]: figiValue,
        })
        .mockReturnValue(fakeResult);

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

      identifier = { type: SecurityIdentifierType.Figi, value: 'BBB00024DJF9' };

      expect(() => securityIdentifierToAssetIdentifier(identifier, context)).toThrow(
        `Invalid security identifier ${identifier.value} of type Figi`
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

      fakeResult = { type: SecurityIdentifierType.Figi, value: 'someValue' };
      identifier = dsMockUtils.createMockAssetIdentifier({
        [SecurityIdentifierType.Figi]: dsMockUtils.createMockU8aFixed('someValue'),
      });

      result = assetIdentifierToSecurityIdentifier(identifier);
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

    it('should convert a string to a polkadot PolymeshPrimitivesDocumentHash object', () => {
      const fakeResult = 'convertedHash' as unknown as PolymeshPrimitivesDocumentHash;
      const context = dsMockUtils.getContextInstance();

      const createTypeMock = context.createType;

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', 'None')
        .mockReturnValue(fakeResult);

      let result = stringToDocumentHash(undefined, context);

      expect(result).toEqual(fakeResult);

      let value = '0x1';
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H128: hexToU8a(value.padEnd(34, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(35, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H160: hexToU8a(value.padEnd(42, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(43, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H192: hexToU8a(value.padEnd(50, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(51, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H224: hexToU8a(value.padEnd(58, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(59, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H256: hexToU8a(value.padEnd(66, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(67, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H320: hexToU8a(value.padEnd(82, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(83, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H384: hexToU8a(value.padEnd(98, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);

      value = value.padEnd(99, '1');
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesDocumentHash', { H512: hexToU8a(value.padEnd(130, '0')) })
        .mockReturnValue(fakeResult);

      result = stringToDocumentHash(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('documentHashToString', () => {
    it('should convert a polkadot PolymeshPrimitivesDocumentHash object to a string', () => {
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
      const fakeResult = 'convertedDocument' as unknown as PolymeshPrimitivesDocument;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesDocument', {
          uri: stringToBytes(uri, context),
          name: stringToBytes(name, context),
          contentHash: stringToDocumentHash(contentHash, context),
          docType: null,
          filingDate: null,
        })
        .mockReturnValue(fakeResult);

      let result = assetDocumentToDocument(value, context);
      expect(result).toEqual(fakeResult);

      when(context.createType)
        .calledWith('PolymeshPrimitivesDocument', {
          uri: stringToBytes(uri, context),
          name: stringToBytes(name, context),
          contentHash: stringToDocumentHash(contentHash, context),
          docType: stringToBytes(type, context),
          filingDate: dateToMoment(filedAt, context),
        })
        .mockReturnValue(fakeResult);

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
        uri: dsMockUtils.createMockBytes(uri),
        name: dsMockUtils.createMockBytes(name),
        contentHash: dsMockUtils.createMockDocumentHash('None'),
        docType: dsMockUtils.createMockOption(),
        filingDate: dsMockUtils.createMockOption(),
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
        uri: dsMockUtils.createMockBytes(uri),
        name: dsMockUtils.createMockBytes(name),
        contentHash: dsMockUtils.createMockDocumentHash({
          H128: dsMockUtils.createMockU8aFixed(contentHash, true),
        }),
        docType: dsMockUtils.createMockOption(dsMockUtils.createMockBytes(type)),
        filingDate: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(filedAt.getTime()))
        ),
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
        transfer_condition_result: [
          {
            condition: {
              MaxInvestorCount: createMockU64(new BigNumber(100)),
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
        transfer_condition_result: [
          {
            condition: {
              MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(100)),
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
      const fakeResult = 'ScopeEnum' as unknown as PolymeshPrimitivesIdentityClaimScope;

      when(context.createType)
        .calledWith('Scope', { [value.type]: value.value })
        .mockReturnValue(fakeResult);

      const result = scopeToMeshScope(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should convert a Identity type Scope into a polkadot Scope object', () => {
      const context = dsMockUtils.getContextInstance();
      const value: Scope = {
        type: ScopeType.Identity,
        value: '0x51a5fed99b9d305ef26e6af92dd3dcb181a30a07dc5f075e260b82a92d48913c',
      };
      const fakeResult = 'ScopeEnum' as unknown as PolymeshPrimitivesIdentityClaimScope;
      const fakeIdentityId =
        '0x51a5fed99b9d305ef26e6af92dd3dcb181a30a07dc5f075e260b82a92d48913c' as unknown as PolymeshPrimitivesIdentityId;

      when(context.createType)
        .calledWith('PolymeshPrimitivesIdentityId', value.value)
        .mockReturnValue(fakeIdentityId);

      when(context.createType)
        .calledWith('Scope', { [value.type]: fakeIdentityId })
        .mockReturnValue(fakeResult);

      const result = scopeToMeshScope(value, context);

      expect(result).toBe(fakeResult);
    });

    it('should convert a Ticker type Scope into a polkadot Scope object', () => {
      const context = dsMockUtils.getContextInstance();
      const value: Scope = {
        type: ScopeType.Ticker,
        value: 'SOME_TICKER',
      };
      const fakeResult = 'ScopeEnum' as unknown as PolymeshPrimitivesIdentityClaimScope;
      const fakeTicker = 'SOME_TICKER' as unknown as PolymeshPrimitivesTicker;

      when(context.createType)
        .calledWith('PolymeshPrimitivesTicker', padString(value.value, MAX_TICKER_LENGTH))
        .mockReturnValue(fakeTicker);

      when(context.createType)
        .calledWith('Scope', { [value.type]: fakeTicker })
        .mockReturnValue(fakeResult);

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
        value: 'SOME_TICKER',
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
    it('should convert a Claim to a polkadot PolymeshPrimitivesIdentityClaimClaim object', () => {
      const context = dsMockUtils.getContextInstance();
      let value: Claim = {
        type: ClaimType.Jurisdiction,
        code: CountryCode.Cl,
        scope: { type: ScopeType.Identity, value: 'SOME_TICKER_DID' },
      };
      const fakeResult = 'meshClaim' as unknown as PolymeshPrimitivesIdentityClaimClaim;
      const fakeScope = 'scope' as unknown as PolymeshPrimitivesIdentityClaimScope;

      const createTypeMock = context.createType;

      when(createTypeMock).calledWith('Scope', expect.anything()).mockReturnValue(fakeScope);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityClaimClaim', {
          [value.type]: [value.code, scopeToMeshScope(value.scope, context)],
        })
        .mockReturnValue(fakeResult);

      let result = claimToMeshClaim(value, context);

      expect(result).toBe(fakeResult);

      value = {
        type: ClaimType.Exempted,
        scope: { type: ScopeType.Identity, value: 'SOME_TICKERDid' },
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityClaimClaim', {
          [value.type]: scopeToMeshScope(value.scope, context),
        })
        .mockReturnValue(fakeResult);

      result = claimToMeshClaim(value, context);

      expect(result).toBe(fakeResult);

      value = {
        type: ClaimType.CustomerDueDiligence,
        id: 'someCddId',
      };

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityClaimClaim', {
          [value.type]: stringToCddId(value.id, context),
        })
        .mockReturnValue(fakeResult);

      result = claimToMeshClaim(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshClaimToClaim', () => {
    it('should convert a polkadot Claim object to a Claim', () => {
      let scope = { type: ScopeType.Ticker, value: 'SOME_TICKER' };

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
});

describe('corporateActionParamsToMeshCorporateActionArgs', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.setConstMock('corporateAction', 'maxTargetIds', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(10)),
    });
    dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(10)),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a list of corporate action parameters to a polkadot PalletCorporateActionsInitiateCorporateActionArgs object', () => {
    const ticker = 'SOME_TICKER';
    const kind = CorporateActionKind.UnpredictableBenefit;
    const declarationDate = new Date();
    const checkpoint = new Date(new Date().getTime() + 10000);
    const description = 'someDescription';
    const targets = {
      identities: ['someDid'],
      treatment: TargetTreatment.Exclude,
    };
    const defaultTaxWithholding = new BigNumber(10);
    const taxWithholdings = [
      {
        identity: 'someDid',
        percentage: new BigNumber(20),
      },
    ];

    const rawCheckpointDate = dsMockUtils.createMockMoment(new BigNumber(checkpoint.getTime()));
    const recordDateValue = {
      Scheduled: rawCheckpointDate,
    };
    const declarationDateValue = new BigNumber(declarationDate.getTime());

    const context = dsMockUtils.getContextInstance();
    const createTypeMock = context.createType;

    const rawTicker = dsMockUtils.createMockTicker(ticker);
    const rawKind = dsMockUtils.createMockCAKind(kind);
    const rawDeclDate = dsMockUtils.createMockMoment(declarationDateValue);
    const rawRecordDate = dsMockUtils.createMockRecordDateSpec(recordDateValue);
    const rawDetails = dsMockUtils.createMockBytes(description);
    const rawTargetTreatment = dsMockUtils.createMockTargetTreatment(targets.treatment);
    const rawTargets = dsMockUtils.createMockTargetIdentities(targets);
    const rawTax = dsMockUtils.createMockPermill(defaultTaxWithholding);

    const { identity, percentage } = taxWithholdings[0];
    const rawIdentityId = dsMockUtils.createMockIdentityId(identity);
    const rawPermill = dsMockUtils.createMockPermill(percentage);

    const fakeResult = dsMockUtils.createMockInitiateCorporateActionArgs({
      ticker,
      kind,
      declDate: declarationDateValue,
      recordDate: dsMockUtils.createMockOption(rawRecordDate),
      details: description,
      targets: dsMockUtils.createMockOption(rawTargets),
      defaultWithholdingTax: dsMockUtils.createMockOption(rawTax),
      withholdingTax: [[rawIdentityId, rawPermill]],
    });

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTicker', padString(ticker, MAX_TICKER_LENGTH))
      .mockReturnValue(rawTicker);
    when(createTypeMock).calledWith('PalletCorporateActionsCaKind', kind).mockReturnValue(rawKind);
    when(createTypeMock).calledWith('u64', declarationDate.getTime()).mockReturnValue(rawDeclDate);
    when(createTypeMock).calledWith('u64', checkpoint.getTime()).mockReturnValue(rawCheckpointDate);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsRecordDateSpec', recordDateValue)
      .mockReturnValue(rawRecordDate);
    when(createTypeMock).calledWith('Bytes', description).mockReturnValue(rawDetails);
    when(createTypeMock)
      .calledWith('TargetTreatment', targets.treatment)
      .mockReturnValue(rawTargetTreatment);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsTargetIdentities', {
        identities: [rawIdentityId],
        treatment: rawTargetTreatment,
      })
      .mockReturnValue(rawTargets);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesIdentityId', identity)
      .mockReturnValue(rawIdentityId);
    when(createTypeMock)
      .calledWith('Permill', percentage.shiftedBy(4).toString())
      .mockReturnValue(rawPermill);
    when(createTypeMock)
      .calledWith('Permill', defaultTaxWithholding.shiftedBy(4).toString())
      .mockReturnValue(rawTax);

    when(createTypeMock)
      .calledWith('PalletCorporateActionsInitiateCorporateActionArgs', {
        ticker: rawTicker,
        kind: rawKind,
        declDate: rawDeclDate,
        recordDate: rawRecordDate,
        details: rawDetails,
        targets: rawTargets,
        defaultWithholdingTax: rawTax,
        withholdingTax: [[rawIdentityId, rawPermill]],
      })
      .mockReturnValue(fakeResult);

    expect(
      corporateActionParamsToMeshCorporateActionArgs(
        {
          ticker,
          kind,
          declarationDate,
          checkpoint,
          description,
          targets,
          defaultTaxWithholding,
          taxWithholdings,
        },
        context
      )
    ).toEqual(fakeResult);
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

      fakeResult = ClaimType.SellLockup;

      claimType = dsMockUtils.createMockClaimType(fakeResult);

      result = meshClaimTypeToClaimType(claimType);
      expect(result).toEqual(fakeResult);
    });
  });

  describe('claimTypeToMeshClaimType', () => {
    it('should convert a ClaimType to a polkadot ClaimType', () => {
      const context = dsMockUtils.getContextInstance();
      const mockClaim = dsMockUtils.createMockClaimType(ClaimType.Accredited);
      when(context.createType)
        .calledWith('PolymeshPrimitivesIdentityClaimClaimType', ClaimType.Accredited)
        .mockReturnValue(mockClaim);

      const result = claimTypeToMeshClaimType(ClaimType.Accredited, context);
      expect(result).toEqual(mockClaim);
    });
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

  it('should convert a statistics enabled ClaimType to a claimType', () => {
    let fakeResult = ClaimType.Accredited;
    let claimType = dsMockUtils.createMockClaimType(fakeResult);

    let result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Affiliate;
    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);

    fakeResult = ClaimType.Jurisdiction;
    claimType = dsMockUtils.createMockClaimType(fakeResult);

    result = meshClaimTypeToClaimType(claimType);
    expect(result).toEqual(fakeResult);
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

      result = scopeToMiddlewareScope(scope, false);
      expect(result).toEqual({ type: ClaimScopeTypeEnum.Ticker, value: 'someTicker' });

      scope = { type: ScopeType.Custom, value: 'customValue' };
      result = scopeToMiddlewareScope(scope);
      expect(result).toEqual({ type: ClaimScopeTypeEnum.Custom, value: scope.value });
    });
  });
});

describe('middlewareInstructionToHistoricInstruction', () => {
  it('should convert a middleware Instruction object to a HistoricInstruction', () => {
    const instructionId1 = new BigNumber(1);
    const instructionId2 = new BigNumber(2);
    const blockNumber = new BigNumber(1234);
    const blockHash = 'someHash';
    const memo = 'memo';
    const ticker = 'SOME_TICKER';
    const amount1 = new BigNumber(10);
    const amount2 = new BigNumber(5);
    const venueId = new BigNumber(1);
    const createdAt = new Date('2022/01/01');
    const status = InstructionStatusEnum.Executed;
    const portfolioDid1 = 'portfolioDid1';
    const portfolioKind1 = 'Default';

    const portfolioDid2 = 'portfolioDid2';
    const portfolioKind2 = '10';
    const type1 = InstructionType.SettleOnAffirmation;
    const type2 = InstructionType.SettleOnBlock;
    const endBlock = new BigNumber(1238);

    const legs1 = [
      {
        assetId: ticker,
        amount: amount1.shiftedBy(6).toString(),
        from: {
          number: portfolioKind1,
          identityId: portfolioDid1,
        },
        to: {
          number: portfolioKind2,
          identityId: portfolioDid2,
        },
      },
    ];
    const legs2 = [
      {
        assetId: ticker,
        amount: amount2.shiftedBy(6).toString(),
        from: {
          number: portfolioKind2,
          identityId: portfolioDid2,
        },
        to: {
          number: portfolioKind1,
          identityId: portfolioDid1,
        },
      },
    ];

    const context = dsMockUtils.getContextInstance();

    let instruction = {
      id: instructionId1.toString(),
      createdBlock: {
        blockId: blockNumber.toNumber(),
        hash: blockHash,
        datetime: createdAt,
      },
      status,
      memo,
      venueId: venueId.toString(),
      settlementType: type1,
      legs: {
        nodes: legs1,
      },
    } as unknown as Instruction;

    let result = middlewareInstructionToHistoricInstruction(instruction, context);

    expect(result.id).toEqual(instructionId1);
    expect(result.blockHash).toEqual(blockHash);
    expect(result.blockNumber).toEqual(blockNumber);
    expect(result.status).toEqual(status);
    expect(result.memo).toEqual(memo);
    expect(result.type).toEqual(InstructionType.SettleOnAffirmation);
    expect(result.venueId).toEqual(venueId);
    expect(result.createdAt).toEqual(createdAt);
    expect(result.legs[0].asset.ticker).toBe(ticker);
    expect(result.legs[0].amount).toEqual(amount1);
    expect(result.legs[0].from.owner.did).toBe(portfolioDid1);
    expect(result.legs[0].to.owner.did).toBe(portfolioDid2);
    expect((result.legs[0].to as NumberedPortfolio).id).toEqual(new BigNumber(portfolioKind2));

    instruction = {
      id: instructionId2.toString(),
      createdBlock: {
        blockId: blockNumber.toNumber(),
        hash: blockHash,
        datetime: createdAt,
      },
      status,
      settlementType: type2,
      endBlock: endBlock.toString(),
      venueId: venueId.toString(),
      legs: {
        nodes: legs2,
      },
    } as unknown as Instruction;

    result = middlewareInstructionToHistoricInstruction(instruction, context);

    expect(result.id).toEqual(instructionId2);
    expect(result.memo).toBeNull();
    expect(result.type).toEqual(InstructionType.SettleOnBlock);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).endBlock).toEqual(endBlock);
    expect(result.venueId).toEqual(venueId);
    expect(result.createdAt).toEqual(createdAt);
    expect(result.legs[0].asset.ticker).toBe(ticker);
    expect(result.legs[0].amount).toEqual(amount2);
    expect(result.legs[0].from.owner.did).toBe(portfolioDid2);
    expect(result.legs[0].to.owner.did).toBe(portfolioDid1);
    expect((result.legs[0].from as NumberedPortfolio).id).toEqual(new BigNumber(portfolioKind2));
  });
});

describe('middlewareV2EventDetailsToEventIdentifier', () => {
  it('should convert Event details to an EventIdentifier', () => {
    const eventIdx = 3;
    const block = {
      blockId: 3000,
      hash: 'someHash',
      datetime: new Date('10/14/1987').toISOString(),
    } as Block;

    const fakeResult = {
      blockNumber: new BigNumber(3000),
      blockDate: new Date('10/14/1987'),
      blockHash: 'someHash',
      eventIndex: new BigNumber(3),
    };

    expect(middlewareV2EventDetailsToEventIdentifier(block)).toEqual({
      ...fakeResult,
      eventIndex: new BigNumber(0),
    });

    expect(middlewareV2EventDetailsToEventIdentifier(block, eventIdx)).toEqual(fakeResult);
  });
});

describe('middlewareV2ClaimToClaimData', () => {
  let createClaimSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    createClaimSpy = jest.spyOn(internalUtils, 'createClaim');
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert middleware V2 Claim to ClaimData', () => {
    const context = dsMockUtils.getContextInstance();
    const issuanceDate = new Date('10/14/1987');
    const lastUpdateDate = new Date('10/14/1987');
    const expiry = new Date('10/10/1988');
    const middlewareV2Claim = {
      targetId: 'targetId',
      issuerId: 'issuerId',
      issuanceDate: issuanceDate.getTime(),
      lastUpdateDate: lastUpdateDate.getTime(),
      expiry: null,
      cddId: 'someCddId',
      type: 'CustomerDueDiligence',
    } as MiddlewareClaim;
    const claim = {
      type: ClaimType.CustomerDueDiligence,
      id: 'someCddId',
    };
    createClaimSpy.mockReturnValue(claim);

    const fakeResult = {
      target: expect.objectContaining({ did: 'targetId' }),
      issuer: expect.objectContaining({ did: 'issuerId' }),
      issuedAt: issuanceDate,
      lastUpdatedAt: lastUpdateDate,
      expiry: null,
      claim,
    };

    expect(middlewareV2ClaimToClaimData(middlewareV2Claim, context)).toEqual(fakeResult);

    expect(
      middlewareV2ClaimToClaimData(
        {
          ...middlewareV2Claim,
          expiry: expiry.getTime(),
        },
        context
      )
    ).toEqual({
      ...fakeResult,
      expiry,
    });
  });
});

describe('toIdentityWithClaimsArrayV2', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
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
      lastUpdatedAt: new Date(date),
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
    const commonClaimData = {
      targetId: targetDid,
      issuerId: issuerDid,
      issuanceDate: date,
      lastUpdateDate: date,
      cddId: cddId,
    };
    const fakeMiddlewareV2Claims = [
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
    ] as MiddlewareClaim[];
    /* eslint-enable @typescript-eslint/naming-convention */

    const result = toIdentityWithClaimsArray(fakeMiddlewareV2Claims, context, 'targetId');

    expect(result).toEqual(fakeResult);
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
    it('should convert a cdd id string into a PolymeshPrimitivesCddId', () => {
      const cddId = 'someId';
      const fakeResult = 'type' as unknown as PolymeshPrimitivesCddId;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesCddId', cddId)
        .mockReturnValue(fakeResult);

      const result = stringToCddId(cddId, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('cddIdToString', () => {
    it('should convert a PolymeshPrimitivesCddId to a cddId string', () => {
      const fakeResult = 'cddId';
      const cddId = dsMockUtils.createMockCddId(fakeResult);

      const result = cddIdToString(cddId);
      expect(result).toBe(fakeResult);
    });
  });
});

describe('identityIdToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a PolymeshPrimitivesIdentityId to a identityId string', () => {
    const fakeResult = 'scopeId';
    const scopeId = dsMockUtils.createMockIdentityId(fakeResult);

    const result = identityIdToString(scopeId);
    expect(result).toBe(fakeResult);
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
            scope: { type: ScopeType.Identity, value: 'SOME_TICKERDid' },
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
              scope: { type: ScopeType.Identity, value: 'SOME_TICKERDid' },
            },
            {
              type: ClaimType.SellLockup,
              scope: { type: ScopeType.Identity, value: 'SOME_TICKERDid' },
            },
          ],
        },
        {
          type: ConditionType.IsAbsent,
          target: ConditionTarget.Receiver,
          claim: {
            type: ClaimType.Jurisdiction as const,
            scope: { type: ScopeType.Identity, value: 'SOME_TICKERDid' },
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
      const fakeResult =
        'convertedComplianceRequirement' as unknown as PolymeshPrimitivesComplianceManagerComplianceRequirement;

      const createTypeMock = context.createType;

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesIdentityClaimClaim', expect.anything())
        .mockReturnValue('claim' as unknown as PolymeshPrimitivesIdentityClaimClaim);

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesConditionTargetIdentity', expect.anything())
        .mockReturnValue('targetIdentity' as unknown as PolymeshPrimitivesConditionTargetIdentity);

      conditions.forEach(({ type }) => {
        const meshType = type === ConditionType.IsExternalAgent ? ConditionType.IsIdentity : type;
        when(createTypeMock)
          .calledWith(
            'PolymeshPrimitivesCondition',
            expect.objectContaining({
              conditionType: {
                [meshType]: expect.anything(),
              },
            })
          )
          .mockReturnValue(`meshCondition${meshType}` as unknown as PolymeshPrimitivesCondition);
      });

      when(createTypeMock)
        .calledWith('PolymeshPrimitivesComplianceManagerComplianceRequirement', {
          senderConditions: [
            'meshConditionIsPresent',
            'meshConditionIsNoneOf',
            'meshConditionIsIdentity',
          ],
          receiverConditions: [
            'meshConditionIsPresent',
            'meshConditionIsAbsent',
            'meshConditionIsIdentity',
          ],
          id: bigNumberToU32(value.id, context),
        })
        .mockReturnValue(fakeResult);

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
          trustedFor: dsMockUtils.createMockTrustedFor(),
        })
      );
      const rawConditions = [
        dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
          }),
          issuers,
        }),
        dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
          }),
          issuers,
        }),
        dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsNoneOf: [
              dsMockUtils.createMockClaim({ Blocked: scope }),
              dsMockUtils.createMockClaim({ SellLockup: scope }),
            ],
          }),
          issuers,
        }),
        dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
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
          conditionType: dsMockUtils.createMockConditionType({
            IsIdentity: dsMockUtils.createMockTargetIdentity({
              Specific: dsMockUtils.createMockIdentityId(targetIdentityDid),
            }),
          }),
          issuers,
        }),
        dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsIdentity: dsMockUtils.createMockTargetIdentity('ExternalAgent'),
          }),
          issuers,
        }),
      ];
      const complianceRequirement = dsMockUtils.createMockComplianceRequirement({
        senderConditions: [
          rawConditions[0],
          rawConditions[2],
          rawConditions[2],
          rawConditions[3],
          rawConditions[4],
        ],
        receiverConditions: [
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

  it('should convert a TxTag to a polkadot PolymeshCommonUtilitiesProtocolFeeProtocolOp object', () => {
    const fakeResult =
      'convertedProtocolOp' as unknown as PolymeshCommonUtilitiesProtocolFeeProtocolOp;
    const context = dsMockUtils.getContextInstance();

    const createTypeMock = context.createType;
    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'AssetRegisterTicker')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.RegisterTicker, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'AssetIssue')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.Issue, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'AssetAddDocuments')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.AddDocuments, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'AssetCreateAsset')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.asset.CreateAsset, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'CheckpointCreateSchedule')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.checkpoint.CreateSchedule, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith(
        'PolymeshCommonUtilitiesProtocolFeeProtocolOp',
        'ComplianceManagerAddComplianceRequirement'
      )
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.complianceManager.AddComplianceRequirement, context)).toEqual(
      fakeResult
    );

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'IdentityCddRegisterDid')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.CddRegisterDid, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'IdentityAddClaim')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.AddClaim, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith(
        'PolymeshCommonUtilitiesProtocolFeeProtocolOp',
        'IdentityAddSecondaryKeysWithAuthorization'
      )
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.identity.AddSecondaryKeysWithAuthorization, context)).toEqual(
      fakeResult
    );

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'PipsPropose')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.pips.Propose, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'CorporateBallotAttachBallot')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.corporateBallot.AttachBallot, context)).toEqual(fakeResult);

    when(createTypeMock)
      .calledWith('PolymeshCommonUtilitiesProtocolFeeProtocolOp', 'CapitalDistributionDistribute')
      .mockReturnValue(fakeResult);
    expect(txTagToProtocolOp(TxTags.capitalDistribution.Distribute, context)).toEqual(fakeResult);
  });

  it('should throw an error if tag does not match any PolymeshCommonUtilitiesProtocolFeeProtocolOp', () => {
    const value = TxTags.asset.MakeDivisible;
    const context = dsMockUtils.getContextInstance();
    const mockTag = 'AssetMakeDivisible';

    expect(() => txTagToProtocolOp(value, context)).toThrow(
      `${mockTag} does not match any PolymeshCommonUtilitiesProtocolFeeProtocolOp`
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

      when(context.createType).calledWith('Text', value).mockReturnValue(fakeResult);

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
    const fakeResult = 'PortfolioId' as unknown as PolymeshPrimitivesIdentityIdPortfolioId;
    const context = dsMockUtils.getContextInstance();

    when(context.createType)
      .calledWith('PolymeshPrimitivesIdentityId', portfolioId.did)
      .mockReturnValue(rawIdentityId);

    when(context.createType)
      .calledWith('PolymeshPrimitivesIdentityIdPortfolioId', {
        did: rawIdentityId,
        kind: 'Default',
      })
      .mockReturnValue(fakeResult);

    let result = portfolioIdToMeshPortfolioId(portfolioId, context);

    expect(result).toBe(fakeResult);

    when(context.createType).calledWith('u64', number.toString()).mockReturnValue(rawU64);

    when(context.createType)
      .calledWith('PolymeshPrimitivesIdentityIdPortfolioId', {
        did: rawIdentityId,
        kind: { User: rawU64 },
      })
      .mockReturnValue(fakeResult);

    result = portfolioIdToMeshPortfolioId({ ...portfolioId, number }, context);

    expect(result).toBe(fakeResult);
  });
});

describe('portfolioIdToMeshPortfolioId', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a portfolio to a polkadot PortfolioKind', () => {
    const context = dsMockUtils.getContextInstance();

    const fakeResult = 'PortfolioKind' as unknown as PolymeshPrimitivesIdentityIdPortfolioKind;

    when(context.createType)
      .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', 'Default')
      .mockReturnValue(fakeResult);

    let result = portfolioToPortfolioKind(entityMockUtils.getDefaultPortfolioInstance(), context);

    expect(result).toBe(fakeResult);

    const number = new BigNumber(1);
    const rawU64 = dsMockUtils.createMockU64(number);

    when(context.createType).calledWith('u64', number.toString()).mockReturnValue(rawU64);

    when(context.createType)
      .calledWith('PolymeshPrimitivesIdentityIdPortfolioKind', { User: rawU64 })
      .mockReturnValue(fakeResult);

    result = portfolioToPortfolioKind(
      entityMockUtils.getNumberedPortfolioInstance({ id: number }),
      context
    );

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
        trustedFor: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
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
          conditionType: dsMockUtils.createMockConditionType({
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
          conditionType: dsMockUtils.createMockConditionType({
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
          conditionType: dsMockUtils.createMockConditionType({
            IsIdentity: dsMockUtils.createMockTargetIdentity('ExternalAgent'),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
    ];
    const complianceRequirement = dsMockUtils.createMockComplianceRequirementResult({
      senderConditions: [
        rawConditions[0],
        rawConditions[2],
        rawConditions[2],
        rawConditions[3],
        rawConditions[4],
      ],
      receiverConditions: [
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
        trustedFor: dsMockUtils.createMockTrustedFor(),
      })
    );
    const rawConditions = [
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsPresent: dsMockUtils.createMockClaim({ KnowYourCustomer: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(true),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
            IsAbsent: dsMockUtils.createMockClaim({ BuyLockup: scope }),
          }),
          issuers,
        }),
        result: dsMockUtils.createMockBool(false),
      }),
      dsMockUtils.createMockConditionResult({
        condition: dsMockUtils.createMockCondition({
          conditionType: dsMockUtils.createMockConditionType({
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
          conditionType: dsMockUtils.createMockConditionType({
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
      senderConditions: [rawConditions[0], rawConditions[2], rawConditions[3]],
      receiverConditions: [rawConditions[0], rawConditions[1], rawConditions[3]],
      id: dsMockUtils.createMockU32(new BigNumber(1)),
      result: dsMockUtils.createMockBool(false),
    });

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
      let result = keyToAddress(publicKey, context);

      expect(result).toBe(address);

      result = keyToAddress(publicKey.substring(2), context);
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
    } as unknown as Call;

    const context = dsMockUtils.getContextInstance();

    when(context.createType).calledWith('Call', hex).mockReturnValue(mockResult);

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
    const tx = dsMockUtils.createTxMock('asset', 'unfreeze');
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

    when(context.createType)
      .calledWith('PolymeshPrimitivesSecondaryKey', {
        signer: signerValueToSignatory({ type: SignerType.Account, value: address }, context),
        permissions: permissionsToMeshPermissions(secondaryAccount.permissions, context),
      })
      .mockReturnValue(fakeResult);

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
    it('should convert a VenueType to a polkadot PolymeshPrimitivesSettlementVenueType object', () => {
      const value = VenueType.Other;
      const fakeResult = 'Other' as unknown as PolymeshPrimitivesSettlementVenueType;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesSettlementVenueType', value)
        .mockReturnValue(fakeResult);

      const result = venueTypeToMeshVenueType(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshVenueTypeToVenueType', () => {
    it('should convert a polkadot PalletSettlementVenueType object to a VenueType', () => {
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

describe('meshSettlementTypeToEndCondition', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert polkadot PalletSettlementSettlementType to an InstructionEndCondition object', () => {
    let result = meshSettlementTypeToEndCondition(
      dsMockUtils.createMockSettlementType('SettleOnAffirmation')
    );

    expect(result.type).toEqual(InstructionType.SettleOnAffirmation);

    const block = new BigNumber(123);

    result = meshSettlementTypeToEndCondition(
      dsMockUtils.createMockSettlementType({ SettleOnBlock: createMockU32(block) })
    );

    expect(result).toEqual(
      expect.objectContaining({
        type: InstructionType.SettleOnBlock,
        endBlock: block,
      })
    );

    result = meshSettlementTypeToEndCondition(
      dsMockUtils.createMockSettlementType({ SettleManual: createMockU32(block) })
    );

    expect(result).toEqual(
      expect.objectContaining({
        type: InstructionType.SettleManual,
        endAfterBlock: block,
      })
    );
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

  it('should convert an end condition to a polkadot PolymeshPrimitivesSettlementSettlementType object', () => {
    const fakeResult = 'type' as unknown as PolymeshPrimitivesSettlementSettlementType;
    const context = dsMockUtils.getContextInstance();

    when(context.createType)
      .calledWith('PolymeshPrimitivesSettlementSettlementType', InstructionType.SettleOnAffirmation)
      .mockReturnValue(fakeResult);

    let result = endConditionToSettlementType(
      { type: InstructionType.SettleOnAffirmation },
      context
    );

    expect(result).toBe(fakeResult);

    const blockNumber = new BigNumber(10);
    const rawBlockNumber = dsMockUtils.createMockU32(blockNumber);

    when(context.createType)
      .calledWith('u32', blockNumber.toString())
      .mockReturnValue(rawBlockNumber);
    when(context.createType)
      .calledWith('PolymeshPrimitivesSettlementSettlementType', {
        [InstructionType.SettleOnBlock]: rawBlockNumber,
      })
      .mockReturnValue(fakeResult);

    result = endConditionToSettlementType(
      { type: InstructionType.SettleOnBlock, endBlock: blockNumber },
      context
    );

    expect(result).toBe(fakeResult);

    when(context.createType)
      .calledWith('PolymeshPrimitivesSettlementSettlementType', {
        [InstructionType.SettleManual]: rawBlockNumber,
      })
      .mockReturnValue(fakeResult);

    result = endConditionToSettlementType(
      { type: InstructionType.SettleManual, endAfterBlock: blockNumber },
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

  it('should convert a DID string to a PolymeshPrimitivesIdentityIdPortfolioId', async () => {
    const result = portfolioLikeToPortfolioId(did);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert an Identity to a PolymeshPrimitivesIdentityIdPortfolioId', async () => {
    const identity = entityMockUtils.getIdentityInstance({ did });

    const result = portfolioLikeToPortfolioId(identity);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert a NumberedPortfolio to a PolymeshPrimitivesIdentityIdPortfolioId', async () => {
    const portfolio = new NumberedPortfolio({ did, id: number }, context);

    const result = portfolioLikeToPortfolioId(portfolio);

    expect(result).toEqual({ did, number });
  });

  it('should convert a DefaultPortfolio to a PolymeshPrimitivesIdentityIdPortfolioId', async () => {
    const portfolio = new DefaultPortfolio({ did }, context);

    const result = portfolioLikeToPortfolioId(portfolio);

    expect(result).toEqual({ did, number: undefined });
  });

  it('should convert a Portfolio identifier object to a PolymeshPrimitivesIdentityIdPortfolioId', async () => {
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
    it('should convert a did string into an PolymeshPrimitivesIdentityId', () => {
      const did = 'someDid';
      const fakeResult = 'type' as unknown as PolymeshPrimitivesConditionTrustedIssuer;
      const context = dsMockUtils.getContextInstance();

      let issuer: TrustedClaimIssuer = {
        identity: entityMockUtils.getIdentityInstance({ did }),
        trustedFor: null,
      };

      when(context.createType)
        .calledWith('PolymeshPrimitivesConditionTrustedIssuer', {
          issuer: stringToIdentityId(did, context),
          trustedFor: 'Any',
        })
        .mockReturnValue(fakeResult);

      let result = trustedClaimIssuerToTrustedIssuer(issuer, context);
      expect(result).toBe(fakeResult);

      issuer = {
        identity: entityMockUtils.getIdentityInstance({ did }),
        trustedFor: [ClaimType.Accredited, ClaimType.Blocked],
      };

      when(context.createType)
        .calledWith('PolymeshPrimitivesConditionTrustedIssuer', {
          issuer: stringToIdentityId(did, context),
          trustedFor: { Specific: [ClaimType.Accredited, ClaimType.Blocked] },
        })
        .mockReturnValue(fakeResult);

      result = trustedClaimIssuerToTrustedIssuer(issuer, context);
      expect(result).toBe(fakeResult);
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

describe('middlewareV2PortfolioToPortfolio', () => {
  it('should convert a MiddlewarePortfolio into a Portfolio', async () => {
    const context = dsMockUtils.getContextInstance();
    let middlewareV2Portfolio = {
      identityId: 'someDid',
      number: 0,
    } as MiddlewarePortfolio;

    let result = await middlewareV2PortfolioToPortfolio(middlewareV2Portfolio, context);
    expect(result instanceof DefaultPortfolio).toBe(true);

    middlewareV2Portfolio = {
      identityId: 'someDid',
      number: 10,
    } as MiddlewarePortfolio;

    result = await middlewareV2PortfolioToPortfolio(middlewareV2Portfolio, context);
    expect(result instanceof NumberedPortfolio).toBe(true);
  });
});

describe('transferRestrictionToPolymeshTransferCondition', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should convert a Transfer Restriction to a PolymeshTransferCondition object', () => {
    const count = new BigNumber(10);
    let value: TransferRestriction = {
      type: TransferRestrictionType.Count,
      value: count,
    };
    const fakeResult =
      'TransferConditionEnum' as unknown as PolymeshPrimitivesTransferComplianceTransferCondition;
    const context = dsMockUtils.getContextInstance();

    const rawCount = dsMockUtils.createMockU64(count);

    const createTypeMock = context.createType;
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTransferComplianceTransferCondition', {
        MaxInvestorCount: rawCount,
      })
      .mockReturnValue(fakeResult);

    when(createTypeMock).calledWith('u64', count.toString()).mockReturnValue(rawCount);

    let result = transferRestrictionToPolymeshTransferCondition(value, context);

    expect(result).toBe(fakeResult);

    const percentage = new BigNumber(49);
    const rawPercentage = dsMockUtils.createMockPermill(percentage.multipliedBy(10000));
    value = {
      type: TransferRestrictionType.Percentage,
      value: percentage,
    };

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTransferComplianceTransferCondition', {
        MaxInvestorOwnership: rawPercentage,
      })
      .mockReturnValue(fakeResult);

    when(createTypeMock)
      .calledWith('Permill', percentage.multipliedBy(10000).toString())
      .mockReturnValue(rawPercentage);

    result = transferRestrictionToPolymeshTransferCondition(value, context);

    expect(result).toBe(fakeResult);

    const did = 'someDid';
    const min = new BigNumber(10);
    const max = new BigNumber(20);
    const issuer = entityMockUtils.getIdentityInstance({ did });
    const countryCode = CountryCode.Ca;
    const rawCountryCode = dsMockUtils.createMockCountryCode(CountryCode.Ca);
    const rawMinCount = dsMockUtils.createMockU64(min);
    const rawMaxCount = dsMockUtils.createMockOption(dsMockUtils.createMockU64(max));
    const rawMinPercent = dsMockUtils.createMockPermill(min);
    const rawMaxPercent = dsMockUtils.createMockPermill(max);
    const rawIssuerId = dsMockUtils.createMockIdentityId(did);
    const rawClaimValue = { Jurisdiction: rawCountryCode };

    const claimCount = {
      min,
      max,
      issuer,
      claim: { type: ClaimType.Jurisdiction as const, countryCode },
    };
    value = {
      type: TransferRestrictionType.ClaimCount,
      value: claimCount,
    };

    when(createTypeMock).calledWith('u64', min.toString()).mockReturnValue(rawMinCount);
    when(createTypeMock).calledWith('u64', max.toString()).mockReturnValue(rawMaxCount);
    when(createTypeMock)
      .calledWith('Permill', min.shiftedBy(4).toString())
      .mockReturnValue(rawMinPercent);
    when(createTypeMock)
      .calledWith('Permill', max.shiftedBy(4).toString())
      .mockReturnValue(rawMaxPercent);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesJurisdictionCountryCode', CountryCode.Ca)
      .mockReturnValue(rawCountryCode);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesIdentityId', did)
      .mockReturnValue(rawIssuerId);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTransferComplianceTransferCondition', {
        ClaimCount: [rawClaimValue, rawIssuerId, rawMinCount, rawMaxCount],
      })
      .mockReturnValue(fakeResult);

    result = transferRestrictionToPolymeshTransferCondition(value, context);

    expect(result).toBe(fakeResult);

    const claimPercentage = {
      min,
      max,
      issuer,
      claim: {
        type: ClaimType.Affiliate as const,
        affiliate: true,
      },
    };
    value = {
      type: TransferRestrictionType.ClaimPercentage,
      value: claimPercentage,
    };
    const rawTrue = dsMockUtils.createMockBool(true);
    const rawOwnershipClaim = { Affiliate: rawTrue };

    when(createTypeMock).calledWith('bool', true).mockReturnValue(rawTrue);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTransferComplianceTransferCondition', {
        ClaimOwnership: [rawOwnershipClaim, rawIssuerId, rawMinPercent, rawMaxPercent],
      })
      .mockReturnValue(fakeResult);

    result = transferRestrictionToPolymeshTransferCondition(value, context);

    expect(result).toBe(fakeResult);

    const claimPercentageAccredited = {
      min,
      max,
      issuer,
      claim: {
        type: ClaimType.Accredited as const,
        accredited: true,
      },
    };
    value = {
      type: TransferRestrictionType.ClaimPercentage,
      value: claimPercentageAccredited,
    };
    const rawOwnershipClaimAccredited = { Accredited: rawTrue };

    when(createTypeMock).calledWith('bool', true).mockReturnValue(rawTrue);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesTransferComplianceTransferCondition', {
        ClaimOwnership: [rawOwnershipClaimAccredited, rawIssuerId, rawMinPercent, rawMaxPercent],
      })
      .mockReturnValue(fakeResult);

    result = transferRestrictionToPolymeshTransferCondition(value, context);

    expect(result).toBe(fakeResult);
  });

  it('should throw if there is an unknown transfer type', () => {
    const context = dsMockUtils.getContextInstance();
    const value = {
      type: 'Unknown',
      value: new BigNumber(3),
    } as unknown as TransferRestriction;

    const expectedError = new PolymeshError({
      code: ErrorCode.UnexpectedError,
      message:
        'Unexpected transfer restriction type: "Unknown". Please report this to the Polymesh team',
    });

    return expect(() =>
      transferRestrictionToPolymeshTransferCondition(value, context)
    ).toThrowError(expectedError);
  });
});

describe('transferConditionToTransferRestriction', () => {
  it('should convert a TransferRestriction to a PolymeshPrimitivesTransferComplianceTransferCondition', () => {
    const mockContext = dsMockUtils.getContextInstance();
    const count = new BigNumber(10);
    let fakeResult = {
      type: TransferRestrictionType.Count,
      value: count,
    };
    let transferCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: dsMockUtils.createMockU64(count),
    });

    let result = transferConditionToTransferRestriction(transferCondition, mockContext);
    expect(result).toEqual(fakeResult);

    const percentage = new BigNumber(49);
    fakeResult = {
      type: TransferRestrictionType.Percentage,
      value: percentage,
    };
    transferCondition = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: dsMockUtils.createMockPermill(percentage.multipliedBy(10000)),
    });

    result = transferConditionToTransferRestriction(transferCondition, mockContext);
    expect(result).toEqual(fakeResult);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (transferCondition as any).isMaxInvestorOwnership = false;
    const expectedError = new PolymeshError({
      code: ErrorCode.FatalError,
      message: 'Unexpected transfer condition type',
    });

    expect(() =>
      transferConditionToTransferRestriction(transferCondition, mockContext)
    ).toThrowError(expectedError);
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

  it('should convert an Offering Tier into a polkadot PalletStoPriceTier object', () => {
    const context = dsMockUtils.getContextInstance();
    const total = new BigNumber(100);
    const price = new BigNumber(1000);
    const rawTotal = dsMockUtils.createMockBalance(total);
    const rawPrice = dsMockUtils.createMockBalance(price);
    const fakeResult = 'PalletStoPriceTier' as unknown as PalletStoPriceTier;

    const offeringTier: OfferingTier = {
      price,
      amount: total,
    };

    const createTypeMock = context.createType;

    when(createTypeMock)
      .calledWith('Balance', total.multipliedBy(Math.pow(10, 6)).toString())
      .mockReturnValue(rawTotal);
    when(createTypeMock)
      .calledWith('Balance', price.multipliedBy(Math.pow(10, 6)).toString())
      .mockReturnValue(rawPrice);

    when(createTypeMock)
      .calledWith('PalletStoPriceTier', {
        total: rawTotal,
        price: rawPrice,
      })
      .mockReturnValue(fakeResult);

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
      TxTags.settlement.AddInstructionWithMemo,
      TxTags.settlement.AddAndAffirmInstruction,
      TxTags.settlement.AddAndAffirmInstructionWithMemo,
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
      TxTags.settlement.AddInstructionWithMemo,
      TxTags.settlement.AddAndAffirmInstruction,
      TxTags.settlement.AddAndAffirmInstructionWithMemo,
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
          TxTags.settlement.AddInstructionWithMemo,
          TxTags.settlement.AddAndAffirmInstruction,
          TxTags.settlement.AddAndAffirmInstructionWithMemo,
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
          TxTags.settlement.AddInstructionWithMemo,
          TxTags.settlement.AddAndAffirmInstruction,
          TxTags.settlement.AddAndAffirmInstructionWithMemo,
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

  it('should convert a polkadot PalletStoFundraiserTier object to a Tier', () => {
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
    startDate.setTime(startDate.getTime() - 10);
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
    const rawName = dsMockUtils.createMockBytes(name);
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

    let fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offeringPortfolio: offeringPortfolio,
      offeringAsset: offeringAsset,
      raisingPortfolio: raisingPortfolio,
      raisingAsset: raisingAsset,
      tiers: rawTiers,
      venueId: venueId,
      start,
      end,
      status,
      minimumInvestment: minInvestment,
    });

    let result = fundraiserToOfferingDetails(fundraiser, rawName, context);

    expect(result).toEqual(fakeResult);

    const futureStart = new Date(startDate.getTime() + 50000);

    fundraiser = dsMockUtils.createMockFundraiser({
      creator,
      offeringPortfolio: offeringPortfolio,
      offeringAsset: offeringAsset,
      raisingPortfolio: raisingPortfolio,
      raisingAsset: raisingAsset,
      tiers: rawTiers,
      venueId: venueId,
      start: dsMockUtils.createMockMoment(new BigNumber(futureStart.getTime())),
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('Closed'),
      minimumInvestment: minInvestment,
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
      offeringPortfolio: offeringPortfolio,
      offeringAsset: offeringAsset,
      raisingPortfolio: raisingPortfolio,
      raisingAsset: raisingAsset,
      tiers: rawTiers,
      venueId: venueId,
      start,
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('ClosedEarly'),
      minimumInvestment: minInvestment,
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
      offeringPortfolio: offeringPortfolio,
      offeringAsset: offeringAsset,
      raisingPortfolio: raisingPortfolio,
      raisingAsset: raisingAsset,
      tiers: [
        dsMockUtils.createMockFundraiserTier({
          total: dsMockUtils.createMockBalance(amount),
          price: dsMockUtils.createMockBalance(priceA),
          remaining: dsMockUtils.createMockBalance(new BigNumber(0)),
        }),
      ],
      venueId: venueId,
      start,
      end: dsMockUtils.createMockOption(),
      status: dsMockUtils.createMockFundraiserStatus('Frozen'),
      minimumInvestment: minInvestment,
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
      offeringPortfolio: offeringPortfolio,
      offeringAsset: offeringAsset,
      raisingPortfolio: raisingPortfolio,
      raisingAsset: raisingAsset,
      tiers: [
        dsMockUtils.createMockFundraiserTier({
          total: dsMockUtils.createMockBalance(amount),
          price: dsMockUtils.createMockBalance(priceA),
          remaining: dsMockUtils.createMockBalance(new BigNumber(1)),
        }),
      ],
      venueId: venueId,
      start: dsMockUtils.createMockMoment(new BigNumber(pastStart.getTime())),
      end: dsMockUtils.createMockOption(
        dsMockUtils.createMockMoment(new BigNumber(pastEnd.getTime()))
      ),
      status: dsMockUtils.createMockFundraiserStatus('Frozen'),
      minimumInvestment: minInvestment,
    });

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
    const details = dsMockUtils.createMockBytes(description);

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

    const params = {
      from: { did, kind: { User: dsMockUtils.createMockU64(from) } },
      currency,
      perShare: perShare.shiftedBy(6),
      amount: maxAmount.shiftedBy(6),
      remaining: new BigNumber(9000).shiftedBy(6),
      reclaimed: false,
      paymentAt: new BigNumber(paymentDate.getTime()),
      expiresAt: dsMockUtils.createMockOption(
        dsMockUtils.createMockMoment(new BigNumber(expiryDate.getTime()))
      ),
    };

    let distribution = dsMockUtils.createMockDistribution(params);

    let result = distributionToDividendDistributionParams(distribution, context);

    expect(result).toEqual(fakeResult);

    distribution = dsMockUtils.createMockDistribution({
      ...params,
      expiresAt: dsMockUtils.createMockOption(),
    });

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

  it('should convert a string to a polkadot PalletCorporateActionsCaKind object', () => {
    const value = CorporateActionKind.IssuerNotice;
    const fakeResult = 'issuerNotice' as unknown as PalletCorporateActionsCaKind;
    const context = dsMockUtils.getContextInstance();

    when(context.createType)
      .calledWith('PalletCorporateActionsCaKind', value)
      .mockReturnValue(fakeResult);

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

  it('should convert a Checkpoint to a polkadot PalletCorporateActionsRecordDateSpec', () => {
    const id = new BigNumber(1);
    const value = entityMockUtils.getCheckpointInstance({ id });

    const fakeResult = 'recordDateSpec' as unknown as PalletCorporateActionsRecordDateSpec;
    const rawId = dsMockUtils.createMockU64(id);
    const context = dsMockUtils.getContextInstance();
    const createTypeMock = context.createType;

    when(createTypeMock).calledWith('u64', id.toString()).mockReturnValue(rawId);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsRecordDateSpec', { Existing: rawId })
      .mockReturnValue(fakeResult);

    const result = checkpointToRecordDateSpec(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should convert a Date to a polkadot PalletCorporateActionsRecordDateSpec', () => {
    const value = new Date('10/14/2022');

    const fakeResult = 'recordDateSpec' as unknown as PalletCorporateActionsRecordDateSpec;
    const rawDate = dsMockUtils.createMockMoment(new BigNumber(value.getTime()));
    const context = dsMockUtils.getContextInstance();
    const createTypeMock = context.createType;

    when(createTypeMock).calledWith('u64', value.getTime()).mockReturnValue(rawDate);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsRecordDateSpec', { Scheduled: rawDate })
      .mockReturnValue(fakeResult);

    const result = checkpointToRecordDateSpec(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should convert a CheckpointSchedule to a polkadot PalletCorporateActionsRecordDateSpec', () => {
    const id = new BigNumber(1);
    const value = entityMockUtils.getCheckpointScheduleInstance({ id });

    const fakeResult = 'recordDateSpec' as unknown as PalletCorporateActionsRecordDateSpec;
    const rawId = dsMockUtils.createMockU64(id);
    const context = dsMockUtils.getContextInstance();
    const createTypeMock = context.createType;

    when(createTypeMock).calledWith('u64', id.toString()).mockReturnValue(rawId);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsRecordDateSpec', { ExistingSchedule: rawId })
      .mockReturnValue(fakeResult);

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

  it('should convert a polkadot PalletCorporateActionsTargetIdentities object to a CorporateActionTargets object', () => {
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
  const did = 'someDid';
  const treatment = TargetTreatment.Include;
  const value = { identities: [entityMockUtils.getIdentityInstance({ did })], treatment };

  let context: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    dsMockUtils.setConstMock('corporateAction', 'maxTargetIds', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a CorporateActionTargets object to a polkadot PalletCorporateActionsTargetIdentities object', () => {
    const fakeResult = 'targetIdentities' as unknown as PalletCorporateActionsTargetIdentities;
    const createTypeMock = context.createType;

    const rawDid = dsMockUtils.createMockIdentityId(did);
    const rawTreatment = dsMockUtils.createMockTargetTreatment();

    when(createTypeMock).calledWith('PolymeshPrimitivesIdentityId', did).mockReturnValue(rawDid);
    when(createTypeMock).calledWith('TargetTreatment', treatment).mockReturnValue(rawTreatment);
    when(createTypeMock)
      .calledWith('PalletCorporateActionsTargetIdentities', {
        identities: [rawDid],
        treatment: rawTreatment,
      })
      .mockReturnValue(fakeResult);

    const result = targetsToTargetIdentities(value, context);

    expect(result).toEqual(fakeResult);
  });

  it('should throw an error if there are more targets than the max allowed amount', () => {
    expect(() =>
      targetsToTargetIdentities(
        { identities: ['someDid', 'otherDid'], treatment: TargetTreatment.Exclude },
        context
      )
    ).toThrow('Too many target Identities');
  });

  it('should not throw an error if there are less or equal targets than the max allowed amount', () => {
    expect(() => targetsToTargetIdentities(value, context)).not.toThrow();
  });
});

describe('caTaxWithholdingsToMeshTaxWithholdings', () => {
  let context: Mocked<Context>;

  const withholdings = [
    {
      identity: 'someDid',
      percentage: new BigNumber(50),
    },
    {
      identity: 'otherDid',
      percentage: new BigNumber(10),
    },
  ];

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if the tax withholding entries are more than the max allowed', () => {
    expect(() => caTaxWithholdingsToMeshTaxWithholdings(withholdings, context)).toThrow();
  });

  it('should convert a set of tax withholding entries to a set of polkadot tax withholding entry', () => {
    const createTypeMock = context.createType;

    const { identity, percentage } = withholdings[0];
    const rawIdentityId = dsMockUtils.createMockIdentityId(identity);
    const rawPermill = dsMockUtils.createMockPermill(percentage);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesIdentityId', identity)
      .mockReturnValue(rawIdentityId);
    when(createTypeMock)
      .calledWith('Permill', percentage.shiftedBy(4).toString())
      .mockReturnValue(rawPermill);

    expect(caTaxWithholdingsToMeshTaxWithholdings([withholdings[0]], context)).toEqual([
      [rawIdentityId, rawPermill],
    ]);
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

  it('should convert a CorporateActionIdentifier object to a polkadot PalletCorporateActionsCaId object', () => {
    const context = dsMockUtils.getContextInstance();
    const args = {
      ticker: 'SOME_TICKER',
      localId: new BigNumber(1),
    };
    const ticker = dsMockUtils.createMockTicker(args.ticker);
    const localId = dsMockUtils.createMockU32(args.localId);
    const fakeResult = 'CAId' as unknown as PalletCorporateActionsCaId;

    when(context.createType)
      .calledWith('PolymeshPrimitivesTicker', padString(args.ticker, 12))
      .mockReturnValue(ticker);
    when(context.createType).calledWith('u32', args.localId.toString()).mockReturnValue(localId);

    when(context.createType)
      .calledWith('PalletCorporateActionsCaId', {
        ticker,
        localId: localId,
      })
      .mockReturnValue(fakeResult);

    const result = corporateActionIdentifierToCaId(args, context);
    expect(result).toEqual(fakeResult);
  });
});

describe('stringToU8aFixed', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a string to a polkadot U8aFixed object', () => {
    const value = 'someValue';
    const fakeResult = 'result' as unknown as U8aFixed;
    const context = dsMockUtils.getContextInstance();

    when(context.createType).calledWith('U8aFixed', value).mockReturnValue(fakeResult);

    const result = stringToU8aFixed(value, context);

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

    when(context.createType)
      .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', expect.anything())
      .mockReturnValue(fakeResult);

    let result = transactionPermissionsToExtrinsicPermissions(value, context);

    expect(result).toEqual(fakeResult);

    when(context.createType)
      .calledWith('PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions', 'Whole')
      .mockReturnValue(fakeResult);

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

  it('should convert a polkadot PolymeshPrimitivesAgentAgentGroup object to a PermissionGroup entity', () => {
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

    agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1CAA');
    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.PolymeshV1Caa,
      })
    );

    agentGroup = dsMockUtils.createMockAgentGroup('PolymeshV1PIA');

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({
        asset: expect.objectContaining({ ticker }),
        type: PermissionGroupType.PolymeshV1Pia,
      })
    );

    const id = new BigNumber(1);
    const rawAgId = dsMockUtils.createMockU32(id);
    agentGroup = dsMockUtils.createMockAgentGroup({ Custom: rawAgId });

    result = agentGroupToPermissionGroup(agentGroup, ticker, context);
    expect(result).toEqual(
      expect.objectContaining({ asset: expect.objectContaining({ ticker }), id })
    );
  });

  describe('identitiesToBtreeSet', () => {
    it('should convert Identities to a BTreeSetIdentityID', () => {
      const context = dsMockUtils.getContextInstance();
      const ids = [{ did: 'b' }, { did: 'a' }, { did: 'c' }] as unknown as Identity[];
      ids.forEach(({ did }) =>
        when(context.createType)
          .calledWith('PolymeshPrimitivesIdentityId', did)
          .mockReturnValue(did as unknown as PolymeshPrimitivesIdentityId)
      );

      when(context.createType)
        .calledWith('BTreeSet<PolymeshPrimitivesIdentityId>', ['b', 'a', 'c'])
        .mockReturnValue(['a', 'b', 'c'] as unknown as BTreeSet<PolymeshPrimitivesIdentityId>);

      const result = identitiesToBtreeSet(ids, context);
      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('statisticsOpTypeToStatType', () => {
    it('should return a statType', () => {
      const op = 'MaxInvestorCount' as unknown as PolymeshPrimitivesStatisticsStatOpType;
      const context = dsMockUtils.getContextInstance();
      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStatType', { op, claimIssuer: undefined })
        .mockReturnValue('statType' as unknown as PolymeshPrimitivesStatisticsStatType);

      const result = statisticsOpTypeToStatType({ op }, context);

      expect(result).toEqual('statType');
    });
  });

  describe('transferRestrictionTypeToStatOpType', () => {
    it('should return the appropriate StatType for the TransferRestriction', () => {
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Count)
        .mockReturnValue('countType' as unknown as PolymeshPrimitivesStatisticsStatOpType);

      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance)
        .mockReturnValue('percentType' as unknown as PolymeshPrimitivesStatisticsStatOpType);

      let result = transferRestrictionTypeToStatOpType(TransferRestrictionType.Count, context);
      expect(result).toEqual('countType');

      result = transferRestrictionTypeToStatOpType(TransferRestrictionType.ClaimCount, context);
      expect(result).toEqual('countType');

      result = transferRestrictionTypeToStatOpType(TransferRestrictionType.Percentage, context);
      expect(result).toEqual('percentType');

      result = transferRestrictionTypeToStatOpType(
        TransferRestrictionType.ClaimPercentage,
        context
      );
      expect(result).toEqual('percentType');
    });
  });

  describe('statUpdate', () => {
    it('should return a statUpdate', () => {
      const key2 = 'key2' as unknown as PolymeshPrimitivesStatisticsStat2ndKey;
      const value = createMockU128(new BigNumber(3));
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStatUpdate', { key2, value })
        .mockReturnValue('statUpdate' as unknown as PolymeshPrimitivesStatisticsStatUpdate);

      const result = keyAndValueToStatUpdate(key2, value, context);

      expect(result).toEqual('statUpdate');
    });
  });

  describe('meshStatToStat', () => {
    it('should return the type', () => {
      const rawStat = {
        op: { type: 'Count' },
        claimIssuer: createMockOption(),
      } as unknown as PolymeshPrimitivesStatisticsStatType;

      const result = meshStatToStatType(rawStat);

      expect(result).toEqual(StatType.Count);
    });
  });

  describe('createStat2ndKey', () => {
    it('should return a NoClaimStat 2nd key', () => {
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', 'NoClaimStat')
        .mockReturnValue('2ndKey' as unknown as PolymeshPrimitivesStatisticsStat2ndKey);

      const result = createStat2ndKey('NoClaimStat', context);

      expect(result).toEqual('2ndKey');
    });

    it('should return a scoped second key', () => {
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
          claim: { [ClaimType.Jurisdiction]: CountryCode.Ca },
        })
        .mockReturnValue('Scoped2ndKey' as unknown as PolymeshPrimitivesStatisticsStat2ndKey);

      const result = createStat2ndKey(ClaimType.Jurisdiction, context, CountryCode.Ca);

      expect(result).toEqual('Scoped2ndKey');
    });
  });
});

describe('statUpdatesToBtreeStatUpdate', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert stat updates to a sorted BTreeSet', () => {
    const context = dsMockUtils.getContextInstance();
    const key2 = dsMockUtils.createMock2ndKey();
    const stat1 = dsMockUtils.createMockStatUpdate({
      key2,
      value: dsMockUtils.createMockOption(dsMockUtils.createMockU128(new BigNumber(1))),
    });
    const stat2 = dsMockUtils.createMockStatUpdate({
      key2,
      value: dsMockUtils.createMockOption(dsMockUtils.createMockU128(new BigNumber(2))),
    });

    const input = [stat1, stat2];
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>', input)
      .mockReturnValue([
        stat1,
        stat2,
      ] as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>);

    const result = statUpdatesToBtreeStatUpdate(input, context);
    expect(result).toEqual([stat1, stat2]);
  });
});

describe('complianceConditionsToBtreeSet', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert transfer conditions to a sorted BTreeSet', () => {
    const context = dsMockUtils.getContextInstance();
    const condition1 = dsMockUtils.createMockTransferCondition();
    const condition2 = dsMockUtils.createMockTransferCondition();

    const input = [condition2, condition1];
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>', input)
      .mockReturnValue([
        condition1,
        condition2,
      ] as unknown as BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>);

    const result = complianceConditionsToBtreeSet(input, context);
    expect(result).toEqual([condition1, condition2]);
  });
});

describe('statisticStatTypesToBtreeStatType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert an array of PolymeshPrimitivesStatisticsStatType to a BTreeSet', () => {
    const context = dsMockUtils.getContextInstance();
    const stat = dsMockUtils.createMockStatisticsStatType();

    const btreeSet = dsMockUtils.createMockBTreeSet([stat]);

    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesStatisticsStatType>', [stat])
      .mockReturnValue(btreeSet);

    const result = statisticStatTypesToBtreeStatType([stat], context);

    expect(result).toEqual(btreeSet);
  });
});

describe('transferConditionsToBtreeTransferConditions', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert an array of PolymeshPrimitivesStatisticsStatType to a BTreeSet', () => {
    const context = dsMockUtils.getContextInstance();
    const condition = dsMockUtils.createMockTransferCondition();

    const btreeSet = dsMockUtils.createMockBTreeSet([condition]);

    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>', [condition])
      .mockReturnValue(btreeSet);

    const result = transferConditionsToBtreeTransferConditions([condition], context);

    expect(result).toEqual(btreeSet);
  });
});

describe('meshClaimToInputStatClaim', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a meshClaimStat to StatClaimUserInput', () => {
    let args = dsMockUtils.createMockStatisticsStatClaim({
      Accredited: dsMockUtils.createMockBool(true),
    });
    let result = meshClaimToInputStatClaim(args);
    expect(result).toEqual({
      accredited: true,
      type: ClaimType.Accredited,
    });

    args = dsMockUtils.createMockStatisticsStatClaim({
      Affiliate: dsMockUtils.createMockBool(true),
    });
    result = meshClaimToInputStatClaim(args);
    expect(result).toEqual({
      affiliate: true,
      type: ClaimType.Affiliate,
    });

    args = dsMockUtils.createMockStatisticsStatClaim({
      Jurisdiction: dsMockUtils.createMockOption(),
    });
    result = meshClaimToInputStatClaim(args);
    expect(result).toEqual({
      countryCode: undefined,
      type: ClaimType.Jurisdiction,
    });

    args = dsMockUtils.createMockStatisticsStatClaim({
      Jurisdiction: dsMockUtils.createMockOption(dsMockUtils.createMockCountryCode(CountryCode.Ca)),
    });
    result = meshClaimToInputStatClaim(args);
    expect(result).toEqual({
      countryCode: CountryCode.Ca,
      type: ClaimType.Jurisdiction,
    });
  });
});

describe('claimCountToClaimCountRestrictionValue', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  const did = 'someDid';

  it('should return a ClaimRestrictionValue', () => {
    const context = dsMockUtils.getContextInstance();
    const min = new BigNumber(10);
    const max = new BigNumber(20);
    const rawMin = dsMockUtils.createMockU64(min);
    const rawMax = dsMockUtils.createMockU64(max);
    const maxOption = dsMockUtils.createMockOption(rawMax);
    const issuer = entityMockUtils.getIdentityInstance({ did });
    const rawIssuerId = dsMockUtils.createMockIdentityId(did);
    const rawClaim = dsMockUtils.createMockStatisticsStatClaim({
      Accredited: dsMockUtils.createMockBool(true),
    });
    let result = claimCountToClaimCountRestrictionValue(
      [rawClaim, rawIssuerId, rawMin, maxOption] as unknown as ITuple<
        [PolymeshPrimitivesStatisticsStatClaim, PolymeshPrimitivesIdentityId, u64, Option<u64>]
      >,
      context
    );
    expect(JSON.stringify(result)).toEqual(
      JSON.stringify({
        claim: {
          type: ClaimType.Accredited,
          accredited: true,
        },
        issuer,
        min,
        max,
      })
    );

    result = claimCountToClaimCountRestrictionValue(
      [rawClaim, rawIssuerId, rawMin, dsMockUtils.createMockOption()] as unknown as ITuple<
        [PolymeshPrimitivesStatisticsStatClaim, PolymeshPrimitivesIdentityId, u64, Option<u64>]
      >,
      context
    );
    expect(JSON.stringify(result)).toEqual(
      JSON.stringify({
        claim: {
          type: ClaimType.Accredited,
          accredited: true,
        },
        issuer,
        min,
        max: undefined,
      })
    );
  });
});

describe('statsClaimToStatClaimUserType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a stats claim to a Claim', () => {
    const accreditedClaim = dsMockUtils.createMockStatisticsStatClaim({
      Accredited: dsMockUtils.createMockBool(true),
    });
    let result = statsClaimToStatClaimInputType(accreditedClaim);
    expect(result).toEqual({ type: ClaimType.Accredited });

    const affiliateClaim = dsMockUtils.createMockStatisticsStatClaim({
      Affiliate: dsMockUtils.createMockBool(false),
    });
    result = statsClaimToStatClaimInputType(affiliateClaim);
    expect(result).toEqual({ type: ClaimType.Affiliate });

    const jurisdictionClaim = dsMockUtils.createMockStatisticsStatClaim({
      Jurisdiction: dsMockUtils.createMockOption(dsMockUtils.createMockCountryCode(CountryCode.Ca)),
    });
    result = statsClaimToStatClaimInputType(jurisdictionClaim);
    expect(result).toEqual({ type: ClaimType.Jurisdiction });
  });
});

describe('claimCountStatInputToStatUpdates', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return stat update values', () => {
    const context = dsMockUtils.getContextInstance();
    const yes = new BigNumber(12);
    const no = new BigNumber(14);
    const canadaCount = new BigNumber(7);
    const usCount = new BigNumber(10);
    const rawYes = dsMockUtils.createMockU64(yes);
    const rawNo = dsMockUtils.createMockU64(no);
    const rawCanadaCount = dsMockUtils.createMockU64(canadaCount);
    const rawUsCount = dsMockUtils.createMockU64(usCount);
    const rawYesKey = dsMockUtils.createMock2ndKey();
    const rawNoKey = dsMockUtils.createMock2ndKey();
    const rawCountryKey = dsMockUtils.createMockCountryCode(CountryCode.Ca);
    const fakeYesUpdate = 'fakeYes';
    const fakeNoUpdate = 'fakeNo';
    const fakeJurisdictionUpdate = 'fakeJurisdiction';
    const issuer = entityMockUtils.getIdentityInstance();

    when(context.createType).calledWith('u128', yes.toString()).mockReturnValue(rawYes);
    when(context.createType).calledWith('u128', no.toString()).mockReturnValue(rawNo);
    when(context.createType)
      .calledWith('u128', canadaCount.toString())
      .mockReturnValue(rawCanadaCount);
    when(context.createType).calledWith('u128', usCount.toString()).mockReturnValue(rawUsCount);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Affiliate]: true },
      })
      .mockReturnValue(rawYesKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Affiliate]: false },
      })
      .mockReturnValue(rawNoKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Accredited]: true },
      })
      .mockReturnValue(rawYesKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Accredited]: false },
      })
      .mockReturnValue(rawNoKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Jurisdiction]: CountryCode.Ca },
      })
      .mockReturnValue(rawCountryKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', {
        claim: { [ClaimType.Jurisdiction]: CountryCode.Us },
      })
      .mockReturnValue(rawCountryKey as unknown as PolymeshPrimitivesStatisticsStat2ndKey);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatUpdate', { key2: rawYesKey, value: rawYes })
      .mockReturnValue(fakeYesUpdate as unknown as PolymeshPrimitivesStatisticsStatUpdate);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatUpdate', { key2: rawNoKey, value: rawNo })
      .mockReturnValue(fakeNoUpdate as unknown as PolymeshPrimitivesStatisticsStatUpdate);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatUpdate', {
        key2: rawCountryKey,
        value: rawCanadaCount,
      })
      .mockReturnValue(fakeJurisdictionUpdate as unknown as PolymeshPrimitivesStatisticsStatUpdate);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatUpdate', {
        key2: rawCountryKey,
        value: rawUsCount,
      })
      .mockReturnValue(fakeJurisdictionUpdate as unknown as PolymeshPrimitivesStatisticsStatUpdate);
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>', [fakeYesUpdate, fakeNoUpdate])
      .mockReturnValue(
        'yesNoBtreeSet' as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
      );
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>', [
        fakeJurisdictionUpdate,
        fakeJurisdictionUpdate,
      ])
      .mockReturnValue(
        'jurisdictionBtreeSet' as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
      );

    let result = claimCountStatInputToStatUpdates(
      {
        issuer,
        claimType: ClaimType.Affiliate,
        value: { affiliate: yes, nonAffiliate: no },
      },
      context
    );
    expect(result).toEqual('yesNoBtreeSet');

    result = claimCountStatInputToStatUpdates(
      {
        issuer,
        claimType: ClaimType.Accredited,
        value: { accredited: yes, nonAccredited: no },
      },
      context
    );
    expect(result).toEqual('yesNoBtreeSet');

    const countryValue = [
      {
        countryCode: CountryCode.Ca,
        count: canadaCount,
      },
      {
        countryCode: CountryCode.Us,
        count: usCount,
      },
    ];
    result = claimCountStatInputToStatUpdates(
      {
        issuer,
        claimType: ClaimType.Jurisdiction,
        value: countryValue,
      },
      context
    );
    expect(result).toEqual('jurisdictionBtreeSet');
  });
});

describe('countStatInputToStatUpdates', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert input parameters into an StatUpdate', () => {
    const context = dsMockUtils.getContextInstance();
    const count = new BigNumber(3);
    const rawCount = dsMockUtils.createMockU128(count);

    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStat2ndKey', 'NoClaimStat')
      .mockReturnValue('2ndKey' as unknown as PolymeshPrimitivesStatisticsStat2ndKey);
    when(context.createType).calledWith('u128', count.toString()).mockReturnValue(rawCount);
    when(context.createType)
      .calledWith('PolymeshPrimitivesStatisticsStatUpdate', { key2: '2ndKey', value: rawCount })
      .mockReturnValue('statUpdate' as unknown as PolymeshPrimitivesStatisticsStatUpdate);
    when(context.createType)
      .calledWith('BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>', ['statUpdate'])
      .mockReturnValue('fakeResult' as unknown as BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>);

    const result = countStatInputToStatUpdates({ count }, context);
    expect(result).toEqual('fakeResult');
  });
});

describe('sortStatsByClaimType', () => {
  it('should sort by claim type', () => {
    const issuer = dsMockUtils.createMockIdentityId('did');
    type ClaimTypeTuple = [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
    const accreditedIssuer: ClaimTypeTuple = [
      dsMockUtils.createMockClaimType(ClaimType.Accredited),
      issuer,
    ];
    const affiliateIssuer: ClaimTypeTuple = [
      dsMockUtils.createMockClaimType(ClaimType.Affiliate),
      issuer,
    ];
    const jurisdictionIssuer: ClaimTypeTuple = [
      dsMockUtils.createMockClaimType(ClaimType.Jurisdiction),
      issuer,
    ];
    const nonStatIssuer: ClaimTypeTuple = [
      dsMockUtils.createMockClaimType(ClaimType.Blocked),
      issuer,
    ];
    const op = dsMockUtils.createMockStatisticsOpType(StatType.Count);
    const accreditedStat = dsMockUtils.createMockStatisticsStatType({
      op,
      claimIssuer: dsMockUtils.createMockOption(accreditedIssuer),
    });

    const affiliateStat = dsMockUtils.createMockStatisticsStatType({
      op,
      claimIssuer: dsMockUtils.createMockOption(affiliateIssuer),
    });

    const jurisdictionStat = dsMockUtils.createMockStatisticsStatType({
      op,
      claimIssuer: dsMockUtils.createMockOption(jurisdictionIssuer),
    });

    const nonStat = dsMockUtils.createMockStatisticsStatType({
      op,
      claimIssuer: dsMockUtils.createMockOption(nonStatIssuer),
    });

    const countStat = dsMockUtils.createMockStatisticsStatType({
      op,
      claimIssuer: dsMockUtils.createMockOption(),
    });

    let result = sortStatsByClaimType([jurisdictionStat, accreditedStat, affiliateStat, countStat]);

    expect(result).toEqual([accreditedStat, affiliateStat, jurisdictionStat, countStat]);

    result = sortStatsByClaimType([
      nonStat,
      jurisdictionStat,
      nonStat,
      countStat,
      nonStat,
      jurisdictionStat,
      countStat,
      affiliateStat,
      countStat,
    ]);

    expect(result).toEqual([
      affiliateStat,
      jurisdictionStat,
      jurisdictionStat,
      nonStat,
      nonStat,
      nonStat,
      countStat,
      countStat,
      countStat,
    ]);
  });
});

describe('sortTransferRestrictionByClaimValue', () => {
  it('should sort conditions', () => {
    const countRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(10)),
    });
    const percentRestriction = dsMockUtils.createMockTransferCondition({
      MaxInvestorOwnership: dsMockUtils.createMockU64(new BigNumber(10)),
    });
    const accreditedRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Accredited: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });
    const affiliatedRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({ Affiliate: dsMockUtils.createMockBool(true) }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });
    const canadaRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({
          Jurisdiction: dsMockUtils.createMockOption(
            dsMockUtils.createMockCountryCode(CountryCode.Ca)
          ),
        }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });
    const usRestriction = dsMockUtils.createMockTransferCondition({
      ClaimCount: [
        dsMockUtils.createMockStatisticsStatClaim({
          Jurisdiction: dsMockUtils.createMockOption(
            dsMockUtils.createMockCountryCode(CountryCode.Us)
          ),
        }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockU64(new BigNumber(10)),
        dsMockUtils.createMockOption(),
      ],
    });
    const jurisdictionRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({
          Jurisdiction: dsMockUtils.createMockOption(),
        }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockPermill(new BigNumber(10)),
        dsMockUtils.createMockPermill(new BigNumber(20)),
      ],
    });
    const ownershipAffiliateRestriction = dsMockUtils.createMockTransferCondition({
      ClaimOwnership: [
        dsMockUtils.createMockStatisticsStatClaim({
          Affiliate: dsMockUtils.createMockBool(true),
        }),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockPermill(new BigNumber(10)),
        dsMockUtils.createMockPermill(new BigNumber(20)),
      ],
    });

    let result = sortTransferRestrictionByClaimValue([
      countRestriction,
      percentRestriction,
      accreditedRestriction,
      affiliatedRestriction,
      ownershipAffiliateRestriction,
      canadaRestriction,
      usRestriction,
      jurisdictionRestriction,
    ]);
    expect(result).toEqual([
      jurisdictionRestriction,
      canadaRestriction,
      usRestriction,
      countRestriction,
      percentRestriction,
      accreditedRestriction,
      affiliatedRestriction,
      ownershipAffiliateRestriction,
    ]);

    result = sortTransferRestrictionByClaimValue([
      canadaRestriction,
      jurisdictionRestriction,
      accreditedRestriction,
      affiliatedRestriction,
      usRestriction,
      jurisdictionRestriction,
      canadaRestriction,
    ]);
    expect(result).toEqual([
      jurisdictionRestriction,
      jurisdictionRestriction,
      canadaRestriction,
      canadaRestriction,
      usRestriction,
      accreditedRestriction,
      affiliatedRestriction,
    ]);
  });
});

describe('inputStatTypeToMeshStatType', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert InputStatType to PolymeshPrimitivesStatisticsStatType', () => {
    const mockContext = dsMockUtils.getContextInstance();
    const createTypeMock = mockContext.createType;
    const fakeOp = 'fakeOp' as unknown as PolymeshPrimitivesStatisticsStatOpType;
    const fakeIssuer = 'fakeIssuer' as unknown as PolymeshPrimitivesIdentityId;
    const fakeClaimType = 'fakeClaimType' as unknown as PolymeshPrimitivesIdentityClaimClaimType;
    const fakeStatistic = 'fakeStatistic' as unknown as PolymeshPrimitivesStatisticsStatType;
    const did = 'did';

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Count)
      .mockReturnValue(fakeOp);

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesStatisticsStatOpType', StatType.Balance)
      .mockReturnValue(fakeOp);

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesStatisticsStatType', { op: fakeOp, claimIssuer: undefined })
      .mockReturnValue(fakeStatistic);

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesIdentityClaimClaimType', ClaimType.Accredited)
      .mockReturnValue(fakeClaimType);

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesIdentityId', did)
      .mockReturnValue(fakeIssuer);

    when(createTypeMock)
      .calledWith('PolymeshPrimitivesStatisticsStatType', {
        op: fakeOp,
        claimIssuer: [fakeClaimType, fakeIssuer],
      })
      .mockReturnValue(fakeStatistic);

    const unscopedInput = { type: StatType.Count } as const;
    let result = inputStatTypeToMeshStatType(unscopedInput, mockContext);
    expect(result).toEqual(fakeStatistic);

    const scopedInput = {
      type: StatType.ScopedBalance,
      claimIssuer: {
        issuer: entityMockUtils.getIdentityInstance({ did }),
        claimType: ClaimType.Accredited,
      },
    } as const;
    result = inputStatTypeToMeshStatType(scopedInput, mockContext);
    expect(result).toEqual(fakeStatistic);
  });
});

describe('meshProposalStatusToProposalStatus', () => {
  it('should convert raw statuses to the correct ProposalStatus', () => {
    let result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('ActiveOrExpired'),
      null
    );
    expect(result).toEqual(ProposalStatus.Active);

    result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('ActiveOrExpired'),
      new Date(1)
    );
    expect(result).toEqual(ProposalStatus.Expired);

    result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('ExecutionSuccessful'),
      null
    );
    expect(result).toEqual(ProposalStatus.Successful);

    result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('ExecutionFailed'),
      null
    );
    expect(result).toEqual(ProposalStatus.Failed);

    result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('Rejected'),
      null
    );
    expect(result).toEqual(ProposalStatus.Rejected);

    result = meshProposalStatusToProposalStatus(
      dsMockUtils.createMockProposalStatus('Invalid'),
      null
    );
    expect(result).toEqual(ProposalStatus.Invalid);
  });

  it('should throw an error if it receives an unknown status', () => {
    const expectedError = new UnreachableCaseError('UnknownStatus' as never);
    return expect(() =>
      meshProposalStatusToProposalStatus(
        { type: 'UnknownStatus' } as unknown as PolymeshPrimitivesMultisigProposalStatus,
        null
      )
    ).toThrowError(expectedError);
  });
});

describe('metadataSpecToMeshMetadataSpec', () => {
  let mockContext: Mocked<Context>;
  let typeDefMaxLength: BigNumber;
  let rawTypeDefMaxLength: u32;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    typeDefMaxLength = new BigNumber(15);
    rawTypeDefMaxLength = dsMockUtils.createMockU32(typeDefMaxLength);

    dsMockUtils.setConstMock('asset', 'assetMetadataTypeDefMaxLength', {
      returnValue: rawTypeDefMaxLength,
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if typeDef exceeds max length', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: '"typeDef" length exceeded for given Asset Metadata spec',
      data: {
        maxLength: typeDefMaxLength,
      },
    });

    expect(() =>
      metadataSpecToMeshMetadataSpec({ typeDef: 'INCORRECT_TYPEDEF_VALUE' }, mockContext)
    ).toThrowError(expectedError);
  });

  it('should convert metadataSpec to PolymeshPrimitivesAssetMetadataAssetMetadataSpec', () => {
    const fakeMetadataSpec =
      'fakeMetadataSpec' as unknown as PolymeshPrimitivesAssetMetadataAssetMetadataSpec;

    when(mockContext.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataSpec', {
        url: null,
        description: null,
        typeDef: null,
      })
      .mockReturnValue(fakeMetadataSpec);

    let result = metadataSpecToMeshMetadataSpec({}, mockContext);
    expect(result).toEqual(fakeMetadataSpec);

    const url = 'SOME_URL';
    const fakeUrl = 'fakeUrl' as unknown as Bytes;
    const description = 'SOME_DESCRIPTION';
    const fakeDescription = 'fakeDescription' as unknown as Bytes;
    const typeDef = 'SOME_TYPE_DEF';
    const fakeTypeDef = 'fakeTypeDef' as unknown as Bytes;

    when(mockContext.createType).calledWith('Bytes', url).mockReturnValue(fakeUrl);
    when(mockContext.createType).calledWith('Bytes', description).mockReturnValue(fakeDescription);
    when(mockContext.createType).calledWith('Bytes', typeDef).mockReturnValue(fakeTypeDef);

    when(mockContext.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataSpec', {
        url: fakeUrl,
        description: fakeDescription,
        typeDef: fakeTypeDef,
      })
      .mockReturnValue(fakeMetadataSpec);

    result = metadataSpecToMeshMetadataSpec({ url, description, typeDef }, mockContext);
    expect(result).toEqual(fakeMetadataSpec);
  });
});

describe('meshMetadataSpecToMetadataSpec', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a meshMetadataSpec to MetadataSpec', () => {
    let result = meshMetadataSpecToMetadataSpec();
    expect(result).toEqual({});

    result = meshMetadataSpecToMetadataSpec(dsMockUtils.createMockOption());
    expect(result).toEqual({});

    let rawSpecs = dsMockUtils.createMockOption(dsMockUtils.createMockAssetMetadataSpec());

    result = meshMetadataSpecToMetadataSpec(rawSpecs);
    expect(result).toEqual({});

    rawSpecs = dsMockUtils.createMockOption(
      dsMockUtils.createMockAssetMetadataSpec({
        url: dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_URL')),
        description: dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_DESC')),
        typeDef: dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_TYPEDEF')),
      })
    );

    result = meshMetadataSpecToMetadataSpec(rawSpecs);
    expect(result).toEqual({
      url: 'SOME_URL',
      description: 'SOME_DESC',
      typeDef: 'SOME_TYPEDEF',
    });
  });
});

describe('metadataToMeshMetadataKey', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert MetadataType and ID to PolymeshPrimitivesAssetMetadataAssetMetadataKey', () => {
    const context = dsMockUtils.getContextInstance();
    const id = new BigNumber(1);
    const rawId = dsMockUtils.createMockU64(id);
    when(context.createType).calledWith('u64', id.toString()).mockReturnValue(rawId);

    const fakeResult = 'metadataKey' as unknown as PolymeshPrimitivesAssetMetadataAssetMetadataKey;

    when(context.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataKey', {
        Local: rawId,
      })
      .mockReturnValue(fakeResult);

    let result = metadataToMeshMetadataKey(MetadataType.Local, id, context);

    expect(result).toBe(fakeResult);

    when(context.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataKey', {
        Global: rawId,
      })
      .mockReturnValue(fakeResult);

    result = metadataToMeshMetadataKey(MetadataType.Global, id, context);

    expect(result).toBe(fakeResult);
  });
});

describe('meshMetadataValueToMetadataValue', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should convert a optional Bytes and PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail to MetadataValue', () => {
    let result = meshMetadataValueToMetadataValue(
      dsMockUtils.createMockOption(),
      dsMockUtils.createMockOption()
    );
    expect(result).toBeNull();

    const rawValue = dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_VALUE'));

    result = meshMetadataValueToMetadataValue(rawValue, dsMockUtils.createMockOption());
    expect(result).toEqual({
      value: 'SOME_VALUE',
      expiry: null,
      lockStatus: MetadataLockStatus.Unlocked,
    });

    let rawDetails = dsMockUtils.createMockOption(
      dsMockUtils.createMockAssetMetadataValueDetail({
        lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({ lockStatus: 'Locked' }),
        expire: dsMockUtils.createMockOption(),
      })
    );
    result = meshMetadataValueToMetadataValue(rawValue, rawDetails);
    expect(result).toEqual({
      value: 'SOME_VALUE',
      expiry: null,
      lockStatus: MetadataLockStatus.Locked,
    });

    const expiry = new Date('2030/01/01');

    const lockedUntil = new Date('2025/01/01');

    rawDetails = dsMockUtils.createMockOption(
      dsMockUtils.createMockAssetMetadataValueDetail({
        lockStatus: dsMockUtils.createMockAssetMetadataLockStatus({
          lockStatus: 'LockedUntil',
          lockedUntil,
        }),
        expire: dsMockUtils.createMockOption(
          dsMockUtils.createMockU64(new BigNumber(expiry.getTime()))
        ),
      })
    );

    result = meshMetadataValueToMetadataValue(rawValue, rawDetails);
    expect(result).toEqual({
      value: 'SOME_VALUE',
      expiry,
      lockStatus: MetadataLockStatus.LockedUntil,
      lockedUntil,
    });
  });
});

describe('metadataValueToMeshMetadataValue', () => {
  let mockContext: Mocked<Context>;
  let valueMaxLength: BigNumber;
  let rawValueMaxLength: u32;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    valueMaxLength = new BigNumber(15);
    rawValueMaxLength = dsMockUtils.createMockU32(valueMaxLength);

    dsMockUtils.setConstMock('asset', 'assetMetadataValueMaxLength', {
      returnValue: rawValueMaxLength,
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if value exceeds max length', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Asset Metadata value length exceeded',
      data: {
        maxLength: valueMaxLength,
      },
    });

    expect(() =>
      metadataValueToMeshMetadataValue('INCORRECT_VALUE_LENGTH', mockContext)
    ).toThrowError(expectedError);
  });

  it('should convert value to Bytes', () => {
    const value = 'SOME_VALUE';
    const fakeValue = 'fakeValue' as unknown as Bytes;
    when(mockContext.createType).calledWith('Bytes', value).mockReturnValue(fakeValue);

    const result = metadataValueToMeshMetadataValue(value, mockContext);
    expect(result).toEqual(fakeValue);
  });
});

describe('metadataValueDetailToMeshMetadataValueDetail', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if expiry date is in the past', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Expiry date must be in the future',
    });

    expect(() =>
      metadataValueDetailToMeshMetadataValueDetail(
        { lockStatus: MetadataLockStatus.Locked, expiry: new Date('10/14/1987') },
        mockContext
      )
    ).toThrowError(expectedError);
  });

  it('should throw an error if locked until date is in the past', () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Locked until date must be in the future',
    });

    expect(() =>
      metadataValueDetailToMeshMetadataValueDetail(
        {
          expiry: null,
          lockStatus: MetadataLockStatus.LockedUntil,
          lockedUntil: new Date('10/14/1987'),
        },
        mockContext
      )
    ).toThrowError(expectedError);
  });

  it('should convert value details to PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail', () => {
    const fakeValueDetail =
      'fakeValueDetail' as unknown as PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail;

    when(mockContext.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail', {
        expire: null,
        lockStatus: MetadataLockStatus.Unlocked,
      })
      .mockReturnValue(fakeValueDetail);

    let result = metadataValueDetailToMeshMetadataValueDetail(
      {
        lockStatus: MetadataLockStatus.Unlocked,
        expiry: null,
      },
      mockContext
    );

    expect(result).toEqual(fakeValueDetail);

    const date = new Date('2030/01/01');
    const fakeTime = 'fakeTime' as unknown as u64;
    when(mockContext.createType).calledWith('u64', date.getTime()).mockReturnValue(fakeTime);

    when(mockContext.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail', {
        lockStatus: MetadataLockStatus.Locked,
        expire: fakeTime,
      })
      .mockReturnValue(fakeValueDetail);

    result = metadataValueDetailToMeshMetadataValueDetail(
      {
        lockStatus: MetadataLockStatus.Locked,
        expiry: date,
      },
      mockContext
    );

    expect(result).toEqual(fakeValueDetail);

    when(mockContext.createType)
      .calledWith('PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail', {
        expire: null,
        lockStatus: { LockedUntil: fakeTime },
      })
      .mockReturnValue(fakeValueDetail);

    result = metadataValueDetailToMeshMetadataValueDetail(
      {
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil: date,
        expiry: null,
      },
      mockContext
    );

    expect(result).toEqual(fakeValueDetail);
  });
});

describe('stringToInstructionMemo and instructionMemoToString', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('stringToMemo', () => {
    it('should convert a string to a polkadot PalletSettlementInstructionMemo object', () => {
      const value = 'someDescription';
      const fakeResult = 'memoDescription' as unknown as PolymeshPrimitivesMemo;
      const context = dsMockUtils.getContextInstance();

      when(context.createType)
        .calledWith('PolymeshPrimitivesMemo', padString(value, 32))
        .mockReturnValue(fakeResult);

      const result = stringToMemo(value, context);

      expect(result).toEqual(fakeResult);
    });
  });

  describe('instructionMemoToString', () => {
    it('should convert an InstructionMemo to string', () => {
      const fakeResult = 'memoDescription';
      const rawMemo = dsMockUtils.createMockMemo(stringToHex(fakeResult));

      const result = instructionMemoToString(rawMemo);
      expect(result).toBe(fakeResult);
    });
  });
});

describe('expiryToMoment', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if the expiry date is in the past', () => {
    const value = new Date('01/01/2023');
    const context = dsMockUtils.getContextInstance();
    expect(() => expiryToMoment(value, context)).toThrow('Expiry date must be in the future');
  });

  it('should convert a expiry Date to a polkadot Moment object', () => {
    const value = new Date('01/01/2040');
    const fakeResult = 10000 as unknown as Moment;
    const context = dsMockUtils.getContextInstance();

    when(context.createType)
      .calledWith('u64', Math.round(value.getTime()))
      .mockReturnValue(fakeResult);

    const result = expiryToMoment(value, context);

    expect(result).toBe(fakeResult);
  });
});

describe('legToSettlementLeg', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should make a fungible leg', () => {
    const context = dsMockUtils.getContextInstance();
    const fakeResult = 'fakeResult' as unknown as PolymeshPrimitivesSettlementLeg;

    const value = {
      Fungible: {
        sender: createMockPortfolioId(),
        receiver: createMockPortfolioId(),
        ticker: createMockTicker(),
        amount: createMockU128(),
      },
    } as const;

    when(context.createType)
      .calledWith('PolymeshPrimitivesSettlementLeg', value)
      .mockReturnValue(fakeResult);

    const result = legToSettlementLeg(value, context);

    expect(result).toEqual(fakeResult);
  });
});

describe('datesToScheduleCheckpoints', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should make a BtreeSet<Moment>', () => {
    const context = dsMockUtils.getContextInstance();

    const fakeMoment = 'fakeMoment' as unknown as Moment;

    const fakeBtree = 'fakeBtree' as unknown as BTreeSet<Moment>;

    const fakeResult =
      'fakeResult' as unknown as PolymeshCommonUtilitiesCheckpointScheduleCheckpoints;

    const input = [new Date()];

    when(context.createType).calledWith('u64', input[0].getTime()).mockReturnValue(fakeMoment);
    when(context.createType)
      .calledWith('BTreeSet<Moment>', [fakeMoment])
      .mockReturnValue(fakeBtree);

    when(context.createType)
      .calledWith('PolymeshCommonUtilitiesCheckpointScheduleCheckpoints', {
        pending: fakeBtree,
      })
      .mockReturnValue(fakeResult);

    const result = datesToScheduleCheckpoints(input, context);

    expect(result).toEqual(fakeResult);
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

    it('should convert a CalendarPeriod to a polkadot PolymeshPrimitivesCalendarCalendarPeriod object', () => {
      const amount = new BigNumber(1);
      const value = { unit: CalendarUnit.Month, amount };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fakeResult = 'Period' as unknown as any;
      const context = dsMockUtils.getContextInstance();

      const createTypeMock = context.createType;
      const rawAmount = dsMockUtils.createMockU64(amount);

      when(createTypeMock).calledWith('u64', `${amount}`).mockReturnValue(rawAmount);
      when(createTypeMock)
        .calledWith('PolymeshPrimitivesCalendarCalendarPeriod', {
          unit: 'Month',
          amount: rawAmount,
        })
        .mockReturnValue(fakeResult);

      const result = calendarPeriodToMeshCalendarPeriod(value, context);

      expect(result).toBe(fakeResult);
    });
  });

  describe('meshCalendarPeriodToCalendarPeriod', () => {
    it('should convert a polkadot PolymeshPrimitivesCalendarCalendarPeriod object to a CalendarPeriod', () => {
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

  it('should convert a ScheduleDetails object to a polkadot PalletAssetCheckpointScheduleSpec object', () => {
    const start = new Date('10/14/1987');
    const amount = new BigNumber(1);
    const period = { unit: CalendarUnit.Month, amount };
    const repetitions = new BigNumber(10);

    const value = { start, period, repetitions };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fakeResult = 'Spec' as any;
    const context = dsMockUtils.getContextInstance();

    const createTypeMock = context.createType;
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

    when(createTypeMock).calledWith('u64', `${amount}`).mockReturnValue(rawAmount);
    when(createTypeMock).calledWith('u64', '0').mockReturnValue(rawZero);
    when(createTypeMock).calledWith('u64', `${repetitions}`).mockReturnValue(rawRepetitions);
    when(createTypeMock).calledWith('u64', start.getTime()).mockReturnValue(rawStart);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesCalendarCalendarPeriod', { unit: 'Month', amount: rawAmount })
      .mockReturnValue(rawPeriod);
    when(createTypeMock)
      .calledWith('PolymeshPrimitivesCalendarCalendarPeriod', { unit: 'Month', amount: rawZero })
      .mockReturnValue(rawZeroPeriod);
    when(createTypeMock)
      .calledWith('PalletAssetCheckpointScheduleSpec', {
        start: rawStart,
        period: rawPeriod,
        remaining: rawRepetitions,
      })
      .mockReturnValue(fakeResult);
    when(createTypeMock)
      .calledWith('PalletAssetCheckpointScheduleSpec', {
        start: null,
        period: rawZeroPeriod,
        remaining: rawZero,
      })
      .mockReturnValue(fakeResult);

    let result = scheduleSpecToMeshScheduleSpec(value, context);

    expect(result).toBe(fakeResult);

    result = scheduleSpecToMeshScheduleSpec(
      { start: null, period: null, repetitions: null },
      context
    );

    expect(result).toBe(fakeResult);
  });
});

describe('periodComplexity', () => {
  it('should calculate complexity for any period', () => {
    const period: CalendarPeriod = {
      unit: CalendarUnit.Second,
      amount: new BigNumber(1),
    };
    let result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(31536000));

    period.unit = CalendarUnit.Minute;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(525600));

    period.unit = CalendarUnit.Hour;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(8760));

    period.unit = CalendarUnit.Day;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(365));

    period.unit = CalendarUnit.Week;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(52));

    period.unit = CalendarUnit.Month;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(12));

    period.unit = CalendarUnit.Year;
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(2));

    period.amount = new BigNumber(0);
    result = periodComplexity(period);
    expect(result).toEqual(new BigNumber(1));
  });
});
