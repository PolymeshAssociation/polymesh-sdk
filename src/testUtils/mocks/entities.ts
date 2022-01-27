/* istanbul ignore file */
/* eslint-disable @typescript-eslint/naming-convention */
import BigNumber from 'bignumber.js';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import { ProposalDetails, ProposalStage /*, ProposalState */ } from '~/api/entities/Proposal/types';
import {
  Account,
  AuthorizationRequest,
  Checkpoint,
  CheckpointSchedule,
  CorporateAction,
  CustomPermissionGroup,
  DefaultPortfolio,
  DividendDistribution,
  Identity,
  Instruction,
  KnownPermissionGroup,
  NumberedPortfolio,
  PermissionGroup,
  SecurityToken,
  Sto,
  TickerReservation,
  Venue,
} from '~/internal';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  ActiveTransferRestrictions,
  AgentWithGroup,
  Authorization,
  AuthorizationType,
  CalendarPeriod,
  CalendarUnit,
  CheckPermissionsResult,
  CheckRolesResult,
  ComplianceRequirements,
  CorporateActionDefaultConfig,
  CorporateActionKind,
  CorporateActionTargets,
  CountTransferRestriction,
  DistributionParticipant,
  DividendDistributionDetails,
  ExtrinsicData,
  GroupPermissions,
  IdentityBalance,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  Leg,
  PercentageTransferRestriction,
  PermissionGroups,
  PermissionGroupType,
  PortfolioBalance,
  ResultSet,
  ScheduleDetails,
  ScheduleWithDetails,
  SecondaryAccount,
  SecurityTokenDetails,
  SignerType,
  StoBalanceStatus,
  StoDetails,
  StoSaleStatus,
  StoTimingStatus,
  TargetTreatment,
  TaxWithholding,
  TickerReservationDetails,
  TickerReservationStatus,
  TokenIdentifier,
  TokenWithGroup,
  TransferStatus,
  VenueDetails,
  VenueType,
} from '~/types';

type MockIdentity = Mocked<Identity>;
type MockAccount = Mocked<Account>;
type MockTickerReservation = Mocked<TickerReservation>;
type MockSecurityToken = Mocked<SecurityToken>;
type MockAuthorizationRequest = Mocked<AuthorizationRequest>;
type MockPermissionGroup = Mocked<PermissionGroup>;
type MockVenue = Mocked<Venue>;
type MockInstruction = Mocked<Instruction>;
type MockNumberedPortfolio = Mocked<NumberedPortfolio>;
type MockDefaultPortfolio = Mocked<DefaultPortfolio>;
type MockSto = Mocked<Sto>;
type MockCheckpoint = Mocked<Checkpoint>;
type MockCheckpointSchedule = Mocked<CheckpointSchedule>;
type MockCorporateAction = Mocked<CorporateAction>;
type MockDividendDistribution = Mocked<DividendDistribution>;
type MockCustomPermissionGroup = Mocked<CustomPermissionGroup>;
type MockKnownPermissionGroup = Mocked<KnownPermissionGroup>;

const mockInstanceContainer = {
  identity: {} as MockIdentity,
  tickerReservation: {} as MockTickerReservation,
  securityToken: {} as MockSecurityToken,
  authorizationRequest: {} as MockAuthorizationRequest,
  permissionGroup: {} as MockPermissionGroup,
  account: {} as MockAccount,
  venue: {} as MockVenue,
  instruction: {} as MockInstruction,
  numberedPortfolio: {} as MockNumberedPortfolio,
  defaultPortfolio: {} as MockDefaultPortfolio,
  customPermissionGroup: {} as MockCustomPermissionGroup,
  knownPermissionGroup: {} as MockKnownPermissionGroup,
  sto: {} as MockSto,
  checkpoint: {} as MockCheckpoint,
  checkpointSchedule: {} as MockCheckpointSchedule,
  corporateAction: {} as MockCorporateAction,
  dividendDistribution: {} as MockDividendDistribution,
};

interface IdentityOptions {
  did?: string;
  hasRoles?: boolean;
  hasRole?: boolean;
  checkRoles?: CheckRolesResult;
  tokenPermissionsHasPermissions?: boolean;
  tokenPermissionsCheckPermissions?: CheckPermissionsResult<SignerType.Identity>;
  hasValidCdd?: boolean;
  isCddProvider?: boolean;
  getPrimaryAccount?: Account;
  authorizations?: {
    getReceived?: AuthorizationRequest[];
    getSent?: ResultSet<AuthorizationRequest>;
  };
  getVenues?: Venue[];
  getScopeId?: string;
  getTokenBalance?: BigNumber;
  getSecondaryAccounts?: SecondaryAccount[];
  areSecondaryAccountsFrozen?: boolean;
  isEqual?: boolean;
  tokenPermissionsGetGroup?: CustomPermissionGroup | KnownPermissionGroup;
  tokenPermissionsGet?: TokenWithGroup[];
  exists?: boolean;
}

interface TickerReservationOptions {
  ticker?: string;
  details?: Partial<TickerReservationDetails>;
  exists?: boolean;
}

interface SecurityTokenOptions {
  ticker?: string;
  details?: Partial<SecurityTokenDetails>;
  currentFundingRound?: string;
  isFrozen?: boolean;
  transfersCanTransfer?: TransferStatus;
  getIdentifiers?: TokenIdentifier[];
  transferRestrictionsCountGet?: ActiveTransferRestrictions<CountTransferRestriction>;
  transferRestrictionsPercentageGet?: ActiveTransferRestrictions<PercentageTransferRestriction>;
  corporateActionsGetAgents?: Identity[];
  corporateActionsGetDefaultConfig?: Partial<CorporateActionDefaultConfig>;
  permissionsGetAgents?: AgentWithGroup[];
  permissionsGetGroups?: PermissionGroups;
  complianceRequirementsGet?: ComplianceRequirements;
  checkpointsGetOne?: Partial<Checkpoint>;
  checkpointsSchedulesGetOne?: Partial<ScheduleWithDetails>;
  isEqual?: boolean;
  exists?: boolean;
  toJson?: string;
}

interface AuthorizationRequestOptions {
  authId?: BigNumber;
  target?: Identity;
  issuer?: Identity;
  expiry?: Date | null;
  data?: Authorization;
  exists?: boolean;
  isExpired?: boolean;
}

interface ProposalOptions {
  pipId?: BigNumber;
  getDetails?: ProposalDetails;
  getStage?: ProposalStage;
  identityHasVoted?: boolean;
  exists?: boolean;
}

interface AccountOptions {
  address?: string;
  key?: string;
  isFrozen?: boolean;
  getBalance?: AccountBalance;
  getIdentity?: Identity | null;
  getTransactionHistory?: ExtrinsicData[];
  isEqual?: boolean;
  exists?: boolean;
  hasPermissions?: boolean;
  checkPermissions?: CheckPermissionsResult<SignerType.Account>;
}

interface VenueOptions {
  id?: BigNumber;
  details?: Partial<VenueDetails>;
  exists?: boolean;
}

interface NumberedPortfolioOptions {
  id?: BigNumber;
  isOwnedBy?: boolean;
  tokenBalances?: PortfolioBalance[];
  custodian?: Identity;
  did?: string;
  exists?: boolean;
  isCustodiedBy?: boolean;
  isEqual?: boolean;
}

interface DefaultPortfolioOptions {
  isOwnedBy?: boolean;
  tokenBalances?: PortfolioBalance[];
  did?: string;
  custodian?: Identity;
  isCustodiedBy?: boolean;
  isEqual?: boolean;
  exists?: boolean;
}

interface CustomPermissionGroupOptions {
  ticker?: string;
  id?: BigNumber;
  getPermissions?: GroupPermissions;
  isEqual?: boolean;
  exists?: boolean;
}

interface KnownPermissionGroupOptions {
  ticker?: string;
  type?: PermissionGroupType;
  getPermissions?: GroupPermissions;
  isEqual?: boolean;
  exists?: boolean;
}

interface InstructionOptions {
  id?: BigNumber;
  details?: Partial<InstructionDetails>;
  getLegs?: ResultSet<Leg>;
  isPending?: boolean;
  exists?: boolean;
}

interface StoOptions {
  id?: BigNumber;
  ticker?: string;
  details?: Partial<StoDetails>;
  exists?: boolean;
}

interface CheckpointOptions {
  id?: BigNumber;
  ticker?: string;
  createdAt?: Date;
  totalSupply?: BigNumber;
  exists?: boolean;
  allBalances?: ResultSet<IdentityBalance>;
  balance?: BigNumber;
}

interface CheckpointScheduleOptions {
  id?: BigNumber;
  ticker?: string;
  start?: Date;
  period?: CalendarPeriod | null;
  expiryDate?: Date | null;
  complexity?: number;
  details?: Partial<ScheduleDetails>;
  exists?: boolean;
}

interface CorporateActionOptions {
  id?: BigNumber;
  ticker?: string;
  kind?: CorporateActionKind;
  declarationDate?: Date;
  description?: string;
  targets?: CorporateActionTargets;
  defaultTaxWithholding?: BigNumber;
  taxWithholdings?: TaxWithholding[];
  exists?: boolean;
}

interface DividendDistributionOptions {
  id?: BigNumber;
  ticker?: string;
  declarationDate?: Date;
  description?: string;
  checkpoint?: Checkpoint | CheckpointSchedule;
  targets?: CorporateActionTargets;
  defaultTaxWithholding?: BigNumber;
  taxWithholdings?: TaxWithholding[];
  origin?: DefaultPortfolio | NumberedPortfolio;
  currency?: string;
  perShare?: BigNumber;
  maxAmount?: BigNumber;
  expiryDate?: null | Date;
  paymentDate?: Date;
  details?: Partial<DividendDistributionDetails>;
  getParticipant?: Partial<DistributionParticipant> | null;
  exists?: boolean;
}

type MockOptions = {
  identityOptions?: IdentityOptions;
  accountOptions?: AccountOptions;
  tickerReservationOptions?: TickerReservationOptions;
  securityTokenOptions?: SecurityTokenOptions;
  authorizationRequestOptions?: AuthorizationRequestOptions;
  proposalOptions?: ProposalOptions;
  venueOptions?: VenueOptions;
  instructionOptions?: InstructionOptions;
  numberedPortfolioOptions?: NumberedPortfolioOptions;
  defaultPortfolioOptions?: DefaultPortfolioOptions;
  stoOptions?: StoOptions;
  checkpointOptions?: CheckpointOptions;
  checkpointScheduleOptions?: CheckpointScheduleOptions;
  corporateActionOptions?: CorporateActionOptions;
  dividendDistributionOptions?: DividendDistributionOptions;
  customPermissionGroupOptions?: CustomPermissionGroupOptions;
  knownPermissionGroupOptions?: KnownPermissionGroupOptions;
};

let identityConstructorStub: SinonStub;
let accountConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;
let authorizationRequestConstructorStub: SinonStub;
let permissionGroupConstructorStub: SinonStub;
let proposalConstructorStub: SinonStub;
let venueConstructorStub: SinonStub;
let instructionConstructorStub: SinonStub;
let numberedPortfolioConstructorStub: SinonStub;
let defaultPortfolioConstructorStub: SinonStub;
let stoConstructorStub: SinonStub;
let checkpointConstructorStub: SinonStub;
let checkpointScheduleConstructorStub: SinonStub;
let corporateActionConstructorStub: SinonStub;
let dividendDistributionConstructorStub: SinonStub;
let customPermissionGroupConstructorStub: SinonStub;
let knownPermissionGroupConstructorStub: SinonStub;
let agentConstructorStub: SinonStub;

let securityTokenDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenIsFrozenStub: SinonStub;
let securityTokenTransfersCanTransferStub: SinonStub;
let securityTokenGetIdentifiersStub: SinonStub;
let securityTokenTransferRestrictionsCountGetStub: SinonStub;
let securityTokenTransferRestrictionsPercentageGetStub: SinonStub;
let securityTokenCorporateActionsGetAgentsStub: SinonStub;
let securityTokenCorporateActionsGetDefaultConfigStub: SinonStub;
let securityTokenPermissionsGetGroupsStub: SinonStub;
let securityTokenPermissionsGetAgentsStub: SinonStub;
let securityTokenComplianceRequirementsGetStub: SinonStub;
let securityTokenCheckpointsGetOneStub: SinonStub;
let securityTokenCheckpointsSchedulesGetOneStub: SinonStub;
let securityTokenIsEqualStub: SinonStub;
let securityTokenExistsStub: SinonStub;
let securityTokenToJsonStub: SinonStub;
let authorizationRequestExistsStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let identityCheckRolesStub: SinonStub;
let identityHasValidCddStub: SinonStub;
let identityGetPrimaryAccountStub: SinonStub;
let identityAuthorizationsGetReceivedStub: SinonStub;
let identityAuthorizationsGetSentStub: SinonStub;
let identityGetVenuesStub: SinonStub;
let identityGetScopeIdStub: SinonStub;
let identityGetTokenBalanceStub: SinonStub;
let identityGetSecondaryAccountsStub: SinonStub;
let identityAreSecondaryAccountsFrozenStub: SinonStub;
let identityIsEqualStub: SinonStub;
let identityTokenPermissionsHasPermissionsStub: SinonStub;
let identityTokenPermissionsCheckPermissionsStub: SinonStub;
let identityTokenPermissionsGetStub: SinonStub;
let identityTokenPermissionsGetGroupStub: SinonStub;
let identityExistsStub: SinonStub;
let identityIsCddProviderStub: SinonStub;
let accountGetBalanceStub: SinonStub;
let accountGetIdentityStub: SinonStub;
let accountGetTransactionHistoryStub: SinonStub;
let accountIsFrozenStub: SinonStub;
let accountIsEqualStub: SinonStub;
let accountExistsStub: SinonStub;
let accountHasPermissionsStub: SinonStub;
let accountCheckPermissionsStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;
let tickerReservationExistsStub: SinonStub;
let venueDetailsStub: SinonStub;
let venueExistsStub: SinonStub;
let instructionDetailsStub: SinonStub;
let instructionGetLegsStub: SinonStub;
let instructionIsPendingStub: SinonStub;
let instructionExistsStub: SinonStub;
let numberedPortfolioIsOwnedByStub: SinonStub;
let numberedPortfolioGetTokenBalancesStub: SinonStub;
let numberedPortfolioExistsStub: SinonStub;
let numberedPortfolioGetCustodianStub: SinonStub;
let numberedPortfolioIsCustodiedByStub: SinonStub;
let numberedPortfolioIsEqualStub: SinonStub;
let defaultPortfolioIsOwnedByStub: SinonStub;
let defaultPortfolioGetTokenBalancesStub: SinonStub;
let defaultPortfolioGetCustodianStub: SinonStub;
let defaultPortfolioIsCustodiedByStub: SinonStub;
let defaultPortfolioIsEqualStub: SinonStub;
let defaultPortfolioExistsStub: SinonStub;
let stoDetailsStub: SinonStub;
let stoExistsStub: SinonStub;
let checkpointCreatedAtStub: SinonStub;
let checkpointTotalSupplyStub: SinonStub;
let checkpointExistsStub: SinonStub;
let checkpointAllBalancesStub: SinonStub;
let checkpointBalanceStub: SinonStub;
let corporateActionExistsStub: SinonStub;
let checkpointScheduleDetailsStub: SinonStub;
let checkpointScheduleExistsStub: SinonStub;
let dividendDistributionDetailsStub: SinonStub;
let dividendDistributionGetParticipantStub: SinonStub;
let dividendDistributionCheckpointStub: SinonStub;
let dividendDistributionExistsStub: SinonStub;
let customPermissionGroupGetPermissionsStub: SinonStub;
let customPermissionGroupIsEqualStub: SinonStub;
let customPermissionGroupExistsStub: SinonStub;
let knownPermissionGroupGetPermissionsStub: SinonStub;
let knownPermissionGroupIsEqualStub: SinonStub;
let knownPermissionGroupExistsStub: SinonStub;

const MockIdentityClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return identityConstructorStub(...args);
  }
};

const MockAccountClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return accountConstructorStub(...args);
  }
};

const MockTickerReservationClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return tickerReservationConstructorStub(...args);
  }
};

const MockSecurityTokenClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return securityTokenConstructorStub(...args);
  }
};

const MockAuthorizationRequestClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return authorizationRequestConstructorStub(...args);
  }
};

const MockPermissionGroupClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return permissionGroupConstructorStub(...args);
  }
};

const MockProposalClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return proposalConstructorStub(...args);
  }
};

const MockVenueClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return venueConstructorStub(...args);
  }
};

const MockNumberedPortfolioClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return numberedPortfolioConstructorStub(...args);
  }
};

const MockDefaultPortfolioClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return defaultPortfolioConstructorStub(...args);
  }
};

const MockInstructionClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return instructionConstructorStub(...args);
  }
};

const MockStoClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return stoConstructorStub(...args);
  }
};

const MockCheckpointClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return checkpointConstructorStub(...args);
  }
};

const MockCheckpointScheduleClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return checkpointScheduleConstructorStub(...args);
  }
};

const MockCorporateActionClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return corporateActionConstructorStub(...args);
  }
};

const MockDividendDistributionClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return dividendDistributionConstructorStub(...args);
  }
};

const MockCustomPermissionGroupClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return customPermissionGroupConstructorStub(...args);
  }
};

const MockKnownPermissionGroupClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return knownPermissionGroupConstructorStub(...args);
  }
};

const MockAgentClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return agentConstructorStub(...args);
  }
};

export const mockIdentityModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Identity: MockIdentityClass,
});

export const mockAccountModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Account: MockAccountClass,
});

export const mockTickerReservationModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  TickerReservation: MockTickerReservationClass,
});

export const mockSecurityTokenModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  SecurityToken: MockSecurityTokenClass,
});

export const mockAuthorizationRequestModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  AuthorizationRequest: MockAuthorizationRequestClass,
});

export const mockPermissionGroupModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  PermissionGroup: MockPermissionGroupClass,
});

export const mockProposalModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Proposal: MockProposalClass,
});

export const mockVenueModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Venue: MockVenueClass,
});

export const mockInstructionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Instruction: MockInstructionClass,
});

export const mockNumberedPortfolioModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  NumberedPortfolio: MockNumberedPortfolioClass,
});

export const mockDefaultPortfolioModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  DefaultPortfolio: MockDefaultPortfolioClass,
});

export const mockStoModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Sto: MockStoClass,
});

export const mockCheckpointModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Checkpoint: MockCheckpointClass,
});

export const mockCheckpointScheduleModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CheckpointSchedule: MockCheckpointScheduleClass,
});

export const mockCorporateActionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CorporateAction: MockCorporateActionClass,
});

export const mockDividendDistributionModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  DividendDistribution: MockDividendDistributionClass,
});

export const mockCustomPermissionGroupModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  CustomPermissionGroup: MockCustomPermissionGroupClass,
});

export const mockKnownPermissionGroupModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  KnownPermissionGroup: MockKnownPermissionGroupClass,
});

export const mockAgentModule = (path: string) => (): Record<string, unknown> => ({
  ...jest.requireActual(path),
  Agent: MockAgentClass,
});

const defaultIdentityOptions: IdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  isCddProvider: false,
  authorizations: {
    getReceived: [],
    getSent: { data: [], next: null },
  },
  getVenues: [],
  getScopeId: 'someScopeId',
  getTokenBalance: new BigNumber(100),
  getSecondaryAccounts: [],
  areSecondaryAccountsFrozen: false,
  isEqual: true,
  tokenPermissionsGet: [],
  tokenPermissionsCheckPermissions: {
    result: true,
  },
  tokenPermissionsHasPermissions: true,
  exists: true,
};
let identityOptions: IdentityOptions = defaultIdentityOptions;
const defaultAccountOptions: AccountOptions = {
  address: 'someAddress',
  key: 'someKey',
  getBalance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  getTransactionHistory: [],
  isEqual: true,
  exists: true,
  isFrozen: false,
  hasPermissions: true,
  checkPermissions: {
    result: true,
  },
};
let accountOptions: AccountOptions = defaultAccountOptions;
const defaultTickerReservationOptions: TickerReservationOptions = {
  ticker: 'SOME_TICKER',
  details: {
    expiryDate: new Date(),
    status: TickerReservationStatus.Reserved,
  },
  exists: true,
};
let tickerReservationOptions = defaultTickerReservationOptions;
const defaultSecurityTokenOptions: SecurityTokenOptions = {
  ticker: 'SOME_TICKER',
  details: {
    name: 'TOKEN_NAME',
    totalSupply: new BigNumber(1000000),
    isDivisible: false,
    primaryIssuanceAgents: [],
    fullAgents: [],
  },
  currentFundingRound: 'Series A',
  isFrozen: false,
  transfersCanTransfer: TransferStatus.Success,
  getIdentifiers: [],
  transferRestrictionsCountGet: {
    restrictions: [],
    availableSlots: 3,
  },
  transferRestrictionsPercentageGet: {
    restrictions: [],
    availableSlots: 3,
  },
  corporateActionsGetAgents: [],
  corporateActionsGetDefaultConfig: {
    targets: { identities: [], treatment: TargetTreatment.Exclude },
    defaultTaxWithholding: new BigNumber(10),
    taxWithholdings: [],
  },
  permissionsGetAgents: [],
  permissionsGetGroups: {
    known: [],
    custom: [],
  },
  complianceRequirementsGet: {
    requirements: [],
    defaultTrustedClaimIssuers: [],
  },
  checkpointsGetOne: {},
  checkpointsSchedulesGetOne: {},
  isEqual: false,
  exists: true,
  toJson: 'SOME_TICKER',
};
let securityTokenOptions = defaultSecurityTokenOptions;
const defaultAuthorizationRequestOptions: AuthorizationRequestOptions = {
  target: { did: 'targetDid' } as Identity,
  issuer: { did: 'issuerDid' } as Identity,
  data: { type: AuthorizationType.TransferAssetOwnership, value: 'UNWANTED_TOKEN' },
  expiry: null,
  exists: true,
};
let authorizationRequestOptions = defaultAuthorizationRequestOptions;
const defaultVenueOptions: VenueOptions = {
  id: new BigNumber(1),
  details: {
    type: VenueType.Distribution,
    description: 'someDescription',
  },
  exists: true,
};
let venueOptions = defaultVenueOptions;
const defaultNumberedPortfolioOptions: NumberedPortfolioOptions = {
  id: new BigNumber(1),
  isOwnedBy: true,
  tokenBalances: [
    {
      token: 'someToken' as unknown as SecurityToken,
      total: new BigNumber(1),
      locked: new BigNumber(0),
      free: new BigNumber(1),
    },
  ],
  did: 'someDid',
  exists: true,
  custodian: 'identity' as unknown as Identity,
  isCustodiedBy: true,
  isEqual: true,
};
let numberedPortfolioOptions = defaultNumberedPortfolioOptions;
const defaultDefaultPortfolioOptions: DefaultPortfolioOptions = {
  isOwnedBy: true,
  tokenBalances: [
    {
      token: 'someToken' as unknown as SecurityToken,
      total: new BigNumber(1),
      locked: new BigNumber(0),
      free: new BigNumber(1),
    },
  ],
  did: 'someDid',
  custodian: 'identity' as unknown as Identity,
  isCustodiedBy: true,
  isEqual: true,
  exists: true,
};
let defaultPortfolioOptions = defaultDefaultPortfolioOptions;
const defaultCustomPermissionGroupOptions: CustomPermissionGroupOptions = {
  ticker: 'SOME_TICKER',
  id: new BigNumber(1),
  getPermissions: {
    transactions: null,
    transactionGroups: [],
  },
  isEqual: true,
  exists: true,
};
let customPermissionGroupOptions = defaultCustomPermissionGroupOptions;
const defaultKnownPermissionGroupOptions: KnownPermissionGroupOptions = {
  ticker: 'SOME_TICKER',
  type: 'someType' as unknown as PermissionGroupType,
  getPermissions: {
    transactions: null,
    transactionGroups: [],
  },
  isEqual: true,
  exists: true,
};
let knownPermissionGroupOptions = defaultKnownPermissionGroupOptions;
const defaultInstructionOptions: InstructionOptions = {
  id: new BigNumber(1),
  details: {
    status: InstructionStatus.Pending,
    createdAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    tradeDate: null,
    valueDate: null,
    type: InstructionType.SettleOnAffirmation,
  },
  isPending: false,
  exists: true,
};
let instructionOptions = defaultInstructionOptions;
const defaultStoOptions: StoOptions = {
  details: {
    end: null,
    start: new Date('10/14/1987'),
    status: {
      timing: StoTimingStatus.Started,
      balance: StoBalanceStatus.Available,
      sale: StoSaleStatus.Live,
    },
    tiers: [
      {
        price: new BigNumber(100000000),
        remaining: new BigNumber(700000000),
        amount: new BigNumber(1000000000),
      },
    ],
    totalAmount: new BigNumber(1000000000),
    totalRemaining: new BigNumber(700000000),
    raisingCurrency: 'USD',
    minInvestment: new BigNumber(100000000),
  },
  ticker: 'SOME_TICKER',
  id: new BigNumber(1),
  exists: true,
};
let stoOptions = defaultStoOptions;
const defaultCheckpointOptions: CheckpointOptions = {
  totalSupply: new BigNumber(10000),
  createdAt: new Date('10/14/1987'),
  ticker: 'SOME_TICKER',
  id: new BigNumber(1),
  exists: true,
};
let checkpointOptions = defaultCheckpointOptions;
const defaultCheckpointScheduleOptions: CheckpointScheduleOptions = {
  id: new BigNumber(1),
  ticker: 'SOME_TICKER',
  start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
  period: {
    unit: CalendarUnit.Month,
    amount: 1,
  },
  expiryDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
  complexity: 2,
  details: {
    remainingCheckpoints: 1,
    nextCheckpointDate: new Date('10/10/2030'),
  },
  exists: true,
};
let checkpointScheduleOptions = defaultCheckpointScheduleOptions;
const defaultCorporateActionOptions: CorporateActionOptions = {
  id: new BigNumber(1),
  ticker: 'SOME_TICKER',
  kind: CorporateActionKind.UnpredictableBenefit,
  declarationDate: new Date('10/14/1987'),
  description: 'someDescription',
  targets: {
    identities: [],
    treatment: TargetTreatment.Include,
  },
  defaultTaxWithholding: new BigNumber(10),
  taxWithholdings: [],
  exists: true,
};
let corporateActionOptions = defaultCorporateActionOptions;
const defaultDividendDistributionOptions: DividendDistributionOptions = {
  id: new BigNumber(1),
  ticker: 'SOME_TICKER',
  declarationDate: new Date('10/14/1987'),
  description: 'someDescription',
  targets: {
    identities: [],
    treatment: TargetTreatment.Include,
  },
  defaultTaxWithholding: new BigNumber(10),
  taxWithholdings: [],
  currency: 'USD',
  perShare: new BigNumber(100),
  maxAmount: new BigNumber(1000000),
  expiryDate: null,
  paymentDate: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
  details: {
    remainingFunds: new BigNumber(100),
    fundsReclaimed: false,
  },
  getParticipant: {
    amount: new BigNumber(100),
    paid: false,
  },
  exists: true,
};
let dividendDistributionOptions = defaultDividendDistributionOptions;

/**
 * @hidden
 * Configure the Authorization Request instance
 */
function configureVenue(opts: VenueOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const venue = {
    uuid: 'venue',
    id: opts.id,
    details: venueDetailsStub.resolves(details),
    exists: venueExistsStub.resolves(opts.exists),
  } as unknown as MockVenue;

  Object.assign(mockInstanceContainer.venue, venue);
  venueConstructorStub.callsFake(args => {
    const value = merge({}, venue, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Venue.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Venue.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Venue instance
 */
function initVenue(opts?: VenueOptions): void {
  venueConstructorStub = sinon.stub();
  venueDetailsStub = sinon.stub();
  venueExistsStub = sinon.stub();

  venueOptions = { ...defaultVenueOptions, ...opts };

  configureVenue(venueOptions);
}

/**
 * @hidden
 * Configure the Numbered Portfolio instance
 */
function configureNumberedPortfolio(opts: NumberedPortfolioOptions): void {
  const numberedPortfolio = {
    uuid: 'numberedPortfolio',
    id: opts.id,
    isOwnedBy: numberedPortfolioIsOwnedByStub.resolves(opts.isOwnedBy),
    getTokenBalances: numberedPortfolioGetTokenBalancesStub.resolves(opts.tokenBalances),
    getCustodian: numberedPortfolioGetCustodianStub.resolves(opts.custodian),
    owner: { did: opts.did },
    exists: numberedPortfolioExistsStub.resolves(opts.exists),
    isCustodiedBy: numberedPortfolioIsCustodiedByStub.resolves(opts.isCustodiedBy),
    isEqual: numberedPortfolioIsEqualStub.returns(opts.isEqual),
  } as unknown as MockNumberedPortfolio;

  Object.assign(mockInstanceContainer.numberedPortfolio, numberedPortfolio);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  numberedPortfolioConstructorStub.callsFake(({ did, ...args } = {}) => {
    const value = merge({}, numberedPortfolio, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Portfolio.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(entities.NumberedPortfolio.prototype, entities.Portfolio.prototype);
    Object.setPrototypeOf(value, entities.NumberedPortfolio.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the NumberedPortfolio instance
 */
function initNumberedPortfolio(opts?: NumberedPortfolioOptions): void {
  numberedPortfolioConstructorStub = sinon.stub();
  numberedPortfolioIsOwnedByStub = sinon.stub();
  numberedPortfolioGetTokenBalancesStub = sinon.stub();
  numberedPortfolioGetCustodianStub = sinon.stub();
  numberedPortfolioExistsStub = sinon.stub();
  numberedPortfolioGetCustodianStub = sinon.stub();
  numberedPortfolioIsCustodiedByStub = sinon.stub();
  numberedPortfolioIsEqualStub = sinon.stub();

  numberedPortfolioOptions = { ...defaultNumberedPortfolioOptions, ...opts };

  configureNumberedPortfolio(numberedPortfolioOptions);
}

/**
 * @hidden
 * Configure the Default Portfolio instance
 */
function configureDefaultPortfolio(opts: DefaultPortfolioOptions): void {
  const defaultPortfolio = {
    uuid: 'defaultPortfolio',
    isOwnedBy: defaultPortfolioIsOwnedByStub.resolves(opts.isOwnedBy),
    getTokenBalances: defaultPortfolioGetTokenBalancesStub.resolves(opts.tokenBalances),
    owner: { did: opts.did },
    getCustodian: defaultPortfolioGetCustodianStub.resolves(opts.custodian),
    isCustodiedBy: defaultPortfolioIsCustodiedByStub.resolves(opts.isCustodiedBy),
    isEqual: defaultPortfolioIsEqualStub.returns(opts.isEqual),
    exists: defaultPortfolioExistsStub.resolves(opts.exists),
  } as unknown as MockDefaultPortfolio;

  Object.assign(mockInstanceContainer.defaultPortfolio, defaultPortfolio);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultPortfolioConstructorStub.callsFake(({ did, ...args } = {}) => {
    const value = merge({}, defaultPortfolio, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Portfolio.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(entities.DefaultPortfolio.prototype, entities.Portfolio.prototype);
    Object.setPrototypeOf(value, entities.DefaultPortfolio.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the DefaultPortfolio instance
 */
function initDefaultPortfolio(opts?: DefaultPortfolioOptions): void {
  defaultPortfolioConstructorStub = sinon.stub();
  defaultPortfolioIsOwnedByStub = sinon.stub();
  defaultPortfolioGetTokenBalancesStub = sinon.stub();
  defaultPortfolioGetCustodianStub = sinon.stub();
  defaultPortfolioIsCustodiedByStub = sinon.stub();
  defaultPortfolioIsEqualStub = sinon.stub();
  defaultPortfolioExistsStub = sinon.stub();

  defaultPortfolioOptions = { ...defaultDefaultPortfolioOptions, ...opts };

  configureDefaultPortfolio(defaultPortfolioOptions);
}

/**
 * @hidden
 * Configure the Custom Permission Group instance
 */
function configureCustomPermissionGroup(opts: CustomPermissionGroupOptions): void {
  const customPermissionGroup = {
    uuid: 'customPermissionGroup',
    id: opts.id,
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    getPermissions: customPermissionGroupGetPermissionsStub.resolves(opts.getPermissions),
    isEqual: customPermissionGroupIsEqualStub.returns(opts.isEqual),
    exists: customPermissionGroupExistsStub.resolves(opts.exists),
  } as unknown as MockCustomPermissionGroup;

  Object.assign(mockInstanceContainer.customPermissionGroup, customPermissionGroup);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customPermissionGroupConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, customPermissionGroup, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.PermissionGroup.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(
      entities.CustomPermissionGroup.prototype,
      entities.PermissionGroup.prototype
    );
    Object.setPrototypeOf(value, entities.CustomPermissionGroup.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the CustomPermissionGroup instance
 */
function initCustomPermissionGroup(opts?: CustomPermissionGroupOptions): void {
  customPermissionGroupConstructorStub = sinon.stub();
  customPermissionGroupGetPermissionsStub = sinon.stub();
  customPermissionGroupIsEqualStub = sinon.stub();
  customPermissionGroupExistsStub = sinon.stub();

  customPermissionGroupOptions = { ...defaultCustomPermissionGroupOptions, ...opts };

  configureCustomPermissionGroup(customPermissionGroupOptions);
}

/**
 * @hidden
 * Configure the Known Permission Group instance
 */
function configureKnownPermissionGroup(opts: KnownPermissionGroupOptions): void {
  const knownPermissionGroup = {
    uuid: 'knownPermissionGroup',
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    type: opts.type,
    getPermissions: knownPermissionGroupGetPermissionsStub.resolves(opts.getPermissions),
    isEqual: knownPermissionGroupIsEqualStub.returns(opts.isEqual),
    exists: knownPermissionGroupExistsStub.resolves(opts.exists),
  } as unknown as MockKnownPermissionGroup;

  Object.assign(mockInstanceContainer.knownPermissionGroup, knownPermissionGroup);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  knownPermissionGroupConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, knownPermissionGroup, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.PermissionGroup.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(
      entities.KnownPermissionGroup.prototype,
      entities.PermissionGroup.prototype
    );
    Object.setPrototypeOf(value, entities.KnownPermissionGroup.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the KnownPermissionGroup instance
 */
function initKnownPermissionGroup(opts?: KnownPermissionGroupOptions): void {
  knownPermissionGroupConstructorStub = sinon.stub();
  knownPermissionGroupGetPermissionsStub = sinon.stub();
  knownPermissionGroupIsEqualStub = sinon.stub();
  knownPermissionGroupExistsStub = sinon.stub();

  knownPermissionGroupOptions = { ...defaultKnownPermissionGroupOptions, ...opts };

  configureKnownPermissionGroup(knownPermissionGroupOptions);
}

/**
 * @hidden
 * Configure the Authorization Request instance
 */
function configureAuthorizationRequest(opts: AuthorizationRequestOptions): void {
  const authorizationRequest = {
    uuid: 'authorizationRequest',
    authId: opts.authId,
    issuer: opts.issuer,
    target: opts.target,
    expiry: opts.expiry,
    data: opts.data,
    exists: authorizationRequestExistsStub.resolves(opts.data),
    isExpired: authorizationRequestExistsStub.resolves(opts.isExpired),
  } as unknown as MockAuthorizationRequest;

  Object.assign(mockInstanceContainer.authorizationRequest, authorizationRequest);
  authorizationRequestConstructorStub.callsFake(args => {
    const value = merge({}, authorizationRequest, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.AuthorizationRequest.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.AuthorizationRequest.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Authorization Request instance
 */
function initAuthorizationRequest(opts?: AuthorizationRequestOptions): void {
  authorizationRequestConstructorStub = sinon.stub();
  authorizationRequestExistsStub = sinon.stub();

  authorizationRequestOptions = { ...defaultAuthorizationRequestOptions, ...opts };

  configureAuthorizationRequest(authorizationRequestOptions);
}

/**
 * @hidden
 * Configure the Security Token instance
 */
function configureSecurityToken(opts: SecurityTokenOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const securityToken = {
    uuid: 'securityToken',
    ticker: opts.ticker,
    details: securityTokenDetailsStub.resolves(details),
    currentFundingRound: securityTokenCurrentFundingRoundStub.resolves(opts.currentFundingRound),
    isFrozen: securityTokenIsFrozenStub.resolves(opts.isFrozen),
    transfers: {
      canTransfer: securityTokenTransfersCanTransferStub.resolves(opts.transfersCanTransfer),
    },
    getIdentifiers: securityTokenGetIdentifiersStub.resolves(opts.getIdentifiers),
    transferRestrictions: {
      count: {
        get: securityTokenTransferRestrictionsCountGetStub.resolves(
          opts.transferRestrictionsCountGet
        ),
      },
      percentage: {
        get: securityTokenTransferRestrictionsPercentageGetStub.resolves(
          opts.transferRestrictionsPercentageGet
        ),
      },
    },
    corporateActions: {
      getAgents: securityTokenCorporateActionsGetAgentsStub.resolves(
        opts.corporateActionsGetAgents
      ),
      getDefaultConfig: securityTokenCorporateActionsGetDefaultConfigStub.resolves(
        opts.corporateActionsGetDefaultConfig
      ),
    },
    permissions: {
      getGroups: securityTokenPermissionsGetGroupsStub.resolves(opts.permissionsGetGroups),
      getAgents: securityTokenPermissionsGetAgentsStub.resolves(opts.permissionsGetAgents),
    },
    compliance: {
      requirements: {
        get: securityTokenComplianceRequirementsGetStub.resolves(opts.complianceRequirementsGet),
      },
    },
    checkpoints: {
      schedules: {
        getOne: securityTokenCheckpointsSchedulesGetOneStub.resolves(
          opts.checkpointsSchedulesGetOne
        ),
      },
      getOne: securityTokenCheckpointsGetOneStub.resolves(opts.checkpointsGetOne),
    },
    isEqual: securityTokenIsEqualStub.returns(opts.isEqual),
    exists: securityTokenExistsStub.resolves(opts.exists),
    toJson: securityTokenToJsonStub.returns(opts.toJson),
  } as unknown as MockSecurityToken;

  Object.assign(mockInstanceContainer.securityToken, securityToken);
  securityTokenConstructorStub.callsFake(args => {
    const value = merge({}, securityToken, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.SecurityToken.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.SecurityToken.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Security Token instance
 */
function initSecurityToken(opts?: SecurityTokenOptions): void {
  securityTokenConstructorStub = sinon.stub();
  securityTokenDetailsStub = sinon.stub();
  securityTokenCurrentFundingRoundStub = sinon.stub();
  securityTokenIsFrozenStub = sinon.stub();
  securityTokenTransfersCanTransferStub = sinon.stub();
  securityTokenGetIdentifiersStub = sinon.stub();
  securityTokenTransferRestrictionsCountGetStub = sinon.stub();
  securityTokenTransferRestrictionsPercentageGetStub = sinon.stub();
  securityTokenCorporateActionsGetAgentsStub = sinon.stub();
  securityTokenCorporateActionsGetDefaultConfigStub = sinon.stub();
  securityTokenPermissionsGetGroupsStub = sinon.stub();
  securityTokenPermissionsGetAgentsStub = sinon.stub();
  securityTokenComplianceRequirementsGetStub = sinon.stub();
  securityTokenCheckpointsGetOneStub = sinon.stub();
  securityTokenCheckpointsSchedulesGetOneStub = sinon.stub();
  securityTokenIsEqualStub = sinon.stub();
  securityTokenExistsStub = sinon.stub();
  securityTokenToJsonStub = sinon.stub();

  securityTokenOptions = merge({}, defaultSecurityTokenOptions, opts);

  configureSecurityToken(securityTokenOptions);
}

/**
 * @hidden
 * Configure the Ticker Reservation instance
 */
function configureTickerReservation(opts: TickerReservationOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const tickerReservation = {
    uuid: 'tickerReservation',
    ticker: opts.ticker,
    details: tickerReservationDetailsStub.resolves(details),
    exists: tickerReservationExistsStub.resolves(opts.exists),
  } as unknown as MockTickerReservation;

  Object.assign(mockInstanceContainer.tickerReservation, tickerReservation);
  tickerReservationConstructorStub.callsFake(args => {
    const value = merge({}, tickerReservation, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.TickerReservation.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.TickerReservation.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Ticker Reservation instance
 */
function initTickerReservation(opts?: TickerReservationOptions): void {
  tickerReservationConstructorStub = sinon.stub();
  tickerReservationDetailsStub = sinon.stub();
  tickerReservationExistsStub = sinon.stub();

  tickerReservationOptions = {
    ...defaultTickerReservationOptions,
    ...opts,
  };

  configureTickerReservation(tickerReservationOptions);
}

/**
 * @hidden
 * Configure the identity instance
 */
function configureIdentity(opts: IdentityOptions): void {
  const identity = {
    uuid: 'identity',
    did: opts.did,
    hasRoles: identityHasRolesStub.resolves(opts.hasRoles),
    checkRoles: identityCheckRolesStub.resolves(opts.checkRoles),
    hasRole: identityHasRoleStub.resolves(opts.hasRole),
    hasValidCdd: identityHasValidCddStub.resolves(opts.hasValidCdd),
    getPrimaryAccount: identityGetPrimaryAccountStub.resolves(opts.getPrimaryAccount),
    portfolios: {},
    authorizations: {
      getReceived: identityAuthorizationsGetReceivedStub.resolves(opts.authorizations?.getReceived),
      getSent: identityAuthorizationsGetSentStub.resolves(opts.authorizations?.getSent),
    },
    tokenPermissions: {
      get: identityTokenPermissionsGetStub.resolves(opts.tokenPermissionsGet),
      getGroup: identityTokenPermissionsGetGroupStub.resolves(opts.tokenPermissionsGetGroup),
      hasPermissions: identityTokenPermissionsHasPermissionsStub.resolves(
        opts.tokenPermissionsHasPermissions
      ),
      checkPermissions: identityTokenPermissionsCheckPermissionsStub.resolves(
        opts.tokenPermissionsCheckPermissions
      ),
    },
    getVenues: identityGetVenuesStub.resolves(opts.getVenues),
    getScopeId: identityGetScopeIdStub.resolves(opts.getScopeId),
    getTokenBalance: identityGetTokenBalanceStub.resolves(opts.getTokenBalance),
    getSecondaryAccounts: identityGetSecondaryAccountsStub.resolves(opts.getSecondaryAccounts),
    areSecondaryAccountsFrozen: identityAreSecondaryAccountsFrozenStub.resolves(
      opts.areSecondaryAccountsFrozen
    ),
    isEqual: identityIsEqualStub.returns(opts.isEqual),
    exists: identityExistsStub.resolves(opts.exists),
    isCddProvider: identityIsCddProviderStub.resolves(opts.isCddProvider),
  } as unknown as MockIdentity;

  Object.assign(mockInstanceContainer.identity, identity);
  identityConstructorStub.callsFake(args => {
    const value = merge({}, identity, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Identity.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Identity.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Identity instance
 */
function initIdentity(opts?: IdentityOptions): void {
  identityConstructorStub = sinon.stub();
  identityHasRolesStub = sinon.stub();
  identityHasRoleStub = sinon.stub();
  identityCheckRolesStub = sinon.stub();
  identityHasValidCddStub = sinon.stub();
  identityGetPrimaryAccountStub = sinon.stub();
  identityAuthorizationsGetReceivedStub = sinon.stub();
  identityAuthorizationsGetSentStub = sinon.stub();
  identityGetVenuesStub = sinon.stub();
  identityGetScopeIdStub = sinon.stub();
  identityGetTokenBalanceStub = sinon.stub();
  identityGetSecondaryAccountsStub = sinon.stub();
  identityAreSecondaryAccountsFrozenStub = sinon.stub();
  identityIsEqualStub = sinon.stub();
  identityTokenPermissionsGetStub = sinon.stub();
  identityTokenPermissionsGetGroupStub = sinon.stub();
  identityTokenPermissionsHasPermissionsStub = sinon.stub();
  identityTokenPermissionsCheckPermissionsStub = sinon.stub();
  identityExistsStub = sinon.stub();
  identityIsCddProviderStub = sinon.stub();

  identityOptions = { ...defaultIdentityOptions, ...opts };

  configureIdentity(identityOptions);
}

/**
 * @hidden
 * Configure the Instruction instance
 */
function configureInstruction(opts: InstructionOptions): void {
  const details = { venue: mockInstanceContainer.venue, ...opts.details };
  const legs = opts.getLegs || {
    data: [
      {
        from: mockInstanceContainer.numberedPortfolio,
        to: mockInstanceContainer.numberedPortfolio,
        token: mockInstanceContainer.securityToken,
        amount: new BigNumber(100),
      },
    ],
    next: null,
  };
  const instruction = {
    uuid: 'instruction',
    id: opts.id,
    details: instructionDetailsStub.resolves(details),
    getLegs: instructionGetLegsStub.resolves(legs),
    isPending: instructionIsPendingStub.resolves(opts.isPending),
    exists: instructionExistsStub.resolves(opts.exists),
  } as unknown as MockInstruction;

  Object.assign(mockInstanceContainer.instruction, instruction);
  instructionConstructorStub.callsFake(args => {
    const value = merge({}, instruction, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Instruction.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Instruction.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Instruction instance
 */
function initInstruction(opts?: InstructionOptions): void {
  instructionConstructorStub = sinon.stub();
  instructionDetailsStub = sinon.stub();
  instructionGetLegsStub = sinon.stub();
  instructionIsPendingStub = sinon.stub();
  instructionExistsStub = sinon.stub();

  instructionOptions = { ...defaultInstructionOptions, ...opts };

  configureInstruction(instructionOptions);
}

/**
 * @hidden
 * Configure the Account instance
 */
function configureAccount(opts: AccountOptions): void {
  const account = {
    uuid: 'account',
    address: opts.address,
    key: opts.key,
    isFrozen: accountIsFrozenStub.resolves(opts.isFrozen),
    getBalance: accountGetBalanceStub.resolves(opts.getBalance),
    getIdentity: accountGetIdentityStub.resolves(
      opts.getIdentity === undefined ? mockInstanceContainer.identity : opts.getIdentity
    ),
    getTransactionHistory: accountGetTransactionHistoryStub.resolves(opts.getTransactionHistory),
    isEqual: accountIsEqualStub.returns(opts.isEqual),
    exists: accountExistsStub.resolves(opts.exists),
    hasPermissions: accountHasPermissionsStub.returns(opts.hasPermissions),
    checkPermissions: accountCheckPermissionsStub.returns(opts.checkPermissions),
  } as unknown as MockAccount;

  Object.assign(mockInstanceContainer.account, account);
  accountConstructorStub.callsFake(args => {
    const value = merge({}, account, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Account.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Account.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Account instance
 */
function initAccount(opts?: AccountOptions): void {
  accountConstructorStub = sinon.stub();
  accountIsFrozenStub = sinon.stub();
  accountGetBalanceStub = sinon.stub();
  accountGetIdentityStub = sinon.stub();
  accountGetTransactionHistoryStub = sinon.stub();
  accountIsEqualStub = sinon.stub();
  accountExistsStub = sinon.stub();
  accountHasPermissionsStub = sinon.stub();
  accountCheckPermissionsStub = sinon.stub();

  accountOptions = { ...defaultAccountOptions, ...opts };

  configureAccount(accountOptions);
}

/**
 * @hidden
 * Configure the Security Token Offering instance
 */
function configureSto(opts: StoOptions): void {
  const details = {
    creator: mockInstanceContainer.identity,
    venue: mockInstanceContainer.venue,
    offeringPortfolio: mockInstanceContainer.defaultPortfolio,
    raisingPortfolio: mockInstanceContainer.numberedPortfolio,
    ...opts.details,
  };
  const sto = {
    uuid: 'sto',
    details: stoDetailsStub.resolves(details),
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    id: opts.id,
    exists: stoExistsStub.resolves(opts.exists),
  } as unknown as MockSto;

  Object.assign(mockInstanceContainer.sto, sto);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stoConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, sto, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Sto.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Sto.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Sto instance
 */
function initSto(opts?: StoOptions): void {
  stoConstructorStub = sinon.stub();
  stoDetailsStub = sinon.stub();
  stoExistsStub = sinon.stub();

  stoOptions = merge({}, defaultStoOptions, opts);

  configureSto(stoOptions);
}

/**
 * @hidden
 * Configure the Checkpoint instance
 */
function configureCheckpoint(opts: CheckpointOptions): void {
  const allBalances = opts.allBalances || {
    data: [
      {
        identity: mockInstanceContainer.identity,
        balance: new BigNumber(10000),
      },
    ],
    next: null,
  };
  const checkpoint = {
    uuid: 'checkpoint',
    createdAt: checkpointCreatedAtStub.returns(opts.createdAt),
    totalSupply: checkpointTotalSupplyStub.returns(opts.totalSupply),
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    id: opts.id,
    exists: checkpointExistsStub.resolves(opts.exists),
    allBalances: checkpointAllBalancesStub.resolves(allBalances),
    balance: checkpointBalanceStub.resolves(opts.balance),
  } as unknown as MockCheckpoint;

  Object.assign(mockInstanceContainer.checkpoint, checkpoint);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkpointConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, checkpoint, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.Checkpoint.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.Checkpoint.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Checkpoint instance
 */
function initCheckpoint(opts?: CheckpointOptions): void {
  checkpointConstructorStub = sinon.stub();
  checkpointCreatedAtStub = sinon.stub();
  checkpointTotalSupplyStub = sinon.stub();
  checkpointExistsStub = sinon.stub();
  checkpointAllBalancesStub = sinon.stub();
  checkpointBalanceStub = sinon.stub();

  checkpointOptions = merge({}, defaultCheckpointOptions, opts);

  configureCheckpoint(checkpointOptions);
}

/**
 * @hidden
 * Configure the CheckpointSchedule instance
 */
function configureCheckpointSchedule(opts: CheckpointScheduleOptions): void {
  const checkpointSchedule = {
    uuid: 'checkpointSchedule',
    id: opts.id,
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    start: opts.start,
    period: opts.period,
    expiryDate: opts.expiryDate,
    complexity: opts.complexity,
    details: checkpointScheduleDetailsStub.resolves(opts.details),
    exists: checkpointScheduleExistsStub.resolves(opts.exists),
  } as unknown as MockCheckpointSchedule;

  Object.assign(mockInstanceContainer.checkpointSchedule, checkpointSchedule);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkpointScheduleConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, checkpointSchedule, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.CheckpointSchedule.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(value, entities.CheckpointSchedule.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the CheckpointSchedule instance
 */
function initCheckpointSchedule(opts?: CheckpointScheduleOptions): void {
  checkpointScheduleConstructorStub = sinon.stub();
  checkpointScheduleDetailsStub = sinon.stub();
  checkpointScheduleExistsStub = sinon.stub();

  checkpointScheduleOptions = merge({}, defaultCheckpointScheduleOptions, opts);

  configureCheckpointSchedule(checkpointScheduleOptions);
}

/**
 * @hidden
 * Configure the CorporateAction instance
 */
function configureCorporateAction(opts: CorporateActionOptions): void {
  const corporateAction = {
    uuid: 'corporateAction',
    id: opts.id,
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    kind: opts.kind,
    declarationDate: opts.declarationDate,
    description: opts.description,
    targets: opts.targets,
    defaultTaxWithholding: opts.defaultTaxWithholding,
    taxWithholdings: opts.taxWithholdings,
    exists: corporateActionExistsStub.resolves(opts.exists),
  } as unknown as MockCorporateAction;

  Object.assign(mockInstanceContainer.corporateAction, corporateAction);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  corporateActionConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, corporateAction, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.CorporateActionBase.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(
      entities.CorporateAction.prototype,
      entities.CorporateActionBase.prototype
    );
    Object.setPrototypeOf(value, entities.CorporateAction.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the CorporateAction instance
 */
function initCorporateAction(opts?: CorporateActionOptions): void {
  corporateActionConstructorStub = sinon.stub();
  corporateActionExistsStub = sinon.stub();

  corporateActionOptions = merge({}, defaultCorporateActionOptions, opts);

  configureCorporateAction(corporateActionOptions);
}

/**
 * @hidden
 * Configure the CorporateAction instance
 */
function configureDividendDistribution(opts: DividendDistributionOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const checkpoint = opts.checkpoint || mockInstanceContainer.checkpoint;
  const getParticipant = opts.getParticipant
    ? { ...defaultDividendDistributionOptions.getParticipant, ...opts.getParticipant }
    : null;

  const dividendDistribution = {
    uuid: 'dividendDistribution',
    id: opts.id,
    token: { ...mockInstanceContainer.securityToken, ticker: opts.ticker },
    kind: CorporateActionKind.UnpredictableBenefit,
    declarationDate: opts.declarationDate,
    description: opts.description,
    targets: opts.targets,
    defaultTaxWithholding: opts.defaultTaxWithholding,
    taxWithholdings: opts.taxWithholdings,
    origin: mockInstanceContainer.defaultPortfolio,
    currency: opts.currency,
    perShare: opts.perShare,
    maxAmount: opts.maxAmount,
    expiryDate: opts.expiryDate,
    paymentDate: opts.paymentDate,
    details: dividendDistributionDetailsStub.resolves(details),
    getParticipant: dividendDistributionGetParticipantStub.resolves(getParticipant),
    checkpoint: dividendDistributionCheckpointStub.resolves(checkpoint),
    exists: dividendDistributionExistsStub.resolves(opts.exists),
  } as unknown as MockDividendDistribution;

  Object.assign(mockInstanceContainer.dividendDistribution, dividendDistribution);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dividendDistributionConstructorStub.callsFake(({ ticker, ...args } = {}) => {
    const value = merge({}, dividendDistribution, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.CorporateActionBase.prototype, entities.Entity.prototype);
    Object.setPrototypeOf(
      entities.DividendDistribution.prototype,
      entities.CorporateActionBase.prototype
    );
    Object.setPrototypeOf(value, entities.DividendDistribution.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the DividendDistribution instance
 */
function initDividendDistribution(opts?: DividendDistributionOptions): void {
  dividendDistributionConstructorStub = sinon.stub();
  dividendDistributionDetailsStub = sinon.stub();
  dividendDistributionGetParticipantStub = sinon.stub();
  dividendDistributionCheckpointStub = sinon.stub();
  dividendDistributionExistsStub = sinon.stub();

  dividendDistributionOptions = merge({}, defaultDividendDistributionOptions, opts);

  configureDividendDistribution(dividendDistributionOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: MockOptions): void {
  const tempIdentityOptions = { ...defaultIdentityOptions, ...opts?.identityOptions };

  configureIdentity(tempIdentityOptions);

  const tempAccountOptions = { ...defaultAccountOptions, ...opts?.accountOptions };

  configureAccount(tempAccountOptions);

  const tempTickerReservationOptions = {
    ...defaultTickerReservationOptions,
    ...opts?.tickerReservationOptions,
  };

  configureTickerReservation(tempTickerReservationOptions);

  const tempSecurityTokenOptions = merge(
    {},
    defaultSecurityTokenOptions,
    opts?.securityTokenOptions
  );

  configureSecurityToken(tempSecurityTokenOptions);

  const tempAuthorizationRequestOptions = {
    ...defaultAuthorizationRequestOptions,
    ...opts?.authorizationRequestOptions,
  };

  configureAuthorizationRequest(tempAuthorizationRequestOptions);

  const tempVenueOptions = {
    ...defaultVenueOptions,
    ...opts?.venueOptions,
  };
  configureVenue(tempVenueOptions);

  const tempNumberedPortfolioOptions = {
    ...defaultNumberedPortfolioOptions,
    ...opts?.numberedPortfolioOptions,
  };
  configureNumberedPortfolio(tempNumberedPortfolioOptions);

  const tempDefaultPortfolioOptions = {
    ...defaultDefaultPortfolioOptions,
    ...opts?.defaultPortfolioOptions,
  };
  configureDefaultPortfolio(tempDefaultPortfolioOptions);

  const tempCustomPermissionGroupOptions = {
    ...defaultCustomPermissionGroupOptions,
    ...opts?.customPermissionGroupOptions,
  };
  configureCustomPermissionGroup(tempCustomPermissionGroupOptions);

  const tempKnownPermissionGroupOptions = {
    ...defaultKnownPermissionGroupOptions,
    ...opts?.knownPermissionGroupOptions,
  };
  configureKnownPermissionGroup(tempKnownPermissionGroupOptions);

  const tempInstructionOptions = {
    ...defaultInstructionOptions,
    ...opts?.instructionOptions,
  };
  configureInstruction(tempInstructionOptions);

  const tempStoOptions = {
    ...stoOptions,
    ...opts?.stoOptions,
  };
  configureSto(tempStoOptions);

  const tempCheckpointOptions = {
    ...checkpointOptions,
    ...opts?.checkpointOptions,
  };
  configureCheckpoint(tempCheckpointOptions);

  const tempCheckpointScheduleOptions = {
    ...checkpointScheduleOptions,
    ...opts?.checkpointScheduleOptions,
  };
  configureCheckpointSchedule(tempCheckpointScheduleOptions);

  const tempCorporateActionOptions = {
    ...corporateActionOptions,
    ...opts?.corporateActionOptions,
  };
  configureCorporateAction(tempCorporateActionOptions);

  const tempDividendDistributionOptions = {
    ...dividendDistributionOptions,
    ...opts?.dividendDistributionOptions,
  };
  configureDividendDistribution(tempDividendDistributionOptions);
}

/**
 * @hidden
 *
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 */
export function initMocks(opts?: MockOptions): void {
  // Identity
  initIdentity(opts?.identityOptions);

  // Account
  initAccount(opts?.accountOptions);

  // Ticker Reservation
  initTickerReservation(opts?.tickerReservationOptions);

  // Security Token
  initSecurityToken(opts?.securityTokenOptions);

  // Authorization Request
  initAuthorizationRequest(opts?.authorizationRequestOptions);

  // Instruction Request
  initInstruction(opts?.instructionOptions);

  // Venue
  initVenue(opts?.venueOptions);

  // NumberedPortfolio
  initNumberedPortfolio(opts?.numberedPortfolioOptions);

  // DefaultPortfolio
  initDefaultPortfolio(opts?.defaultPortfolioOptions);

  // CustomPermissionGroup
  initCustomPermissionGroup(opts?.customPermissionGroupOptions);

  // KnownPermissionGroup
  initKnownPermissionGroup(opts?.knownPermissionGroupOptions);

  // Instruction
  initInstruction(opts?.instructionOptions);

  // Sto
  initSto(opts?.stoOptions);

  // Checkpoint
  initCheckpoint(opts?.checkpointOptions);

  // CheckpointSchedule
  initCheckpointSchedule(opts?.checkpointScheduleOptions);

  // CorporateAction
  initCorporateAction(opts?.corporateActionOptions);

  // DividendDistribution
  initDividendDistribution(opts?.dividendDistributionOptions);
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.identity = {} as MockIdentity;
  mockInstanceContainer.account = {} as MockAccount;
  mockInstanceContainer.tickerReservation = {} as MockTickerReservation;
  mockInstanceContainer.securityToken = {} as MockSecurityToken;
  mockInstanceContainer.authorizationRequest = {} as MockAuthorizationRequest;
  mockInstanceContainer.permissionGroup = {} as MockPermissionGroup;
  mockInstanceContainer.venue = {} as MockVenue;
  mockInstanceContainer.instruction = {} as MockInstruction;
  mockInstanceContainer.sto = {} as MockSto;
  mockInstanceContainer.checkpoint = {} as MockCheckpoint;
  mockInstanceContainer.checkpointSchedule = {} as MockCheckpointSchedule;
  mockInstanceContainer.corporateAction = {} as MockCorporateAction;
  mockInstanceContainer.dividendDistribution = {} as MockDividendDistribution;
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();
  initMocks({
    identityOptions,
    accountOptions,
    tickerReservationOptions,
    securityTokenOptions,
    authorizationRequestOptions,
    venueOptions,
    instructionOptions,
    numberedPortfolioOptions,
    defaultPortfolioOptions,
    stoOptions,
    checkpointOptions,
    checkpointScheduleOptions,
    corporateActionOptions,
    dividendDistributionOptions,
    customPermissionGroupOptions,
    knownPermissionGroupOptions,
  });
}

/**
 * @hidden
 * Retrieve an Identity instance
 */
export function getIdentityInstance(opts?: IdentityOptions): MockIdentity {
  if (opts) {
    configureIdentity({ ...defaultIdentityOptions, ...opts });
  }

  return new MockIdentityClass() as MockIdentity;
}

/**
 * @hidden
 * Retrieve the Identity constructor stub
 */
export function getIdentityConstructorStub(): SinonStub {
  return identityConstructorStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.hasRoles` method
 */
export function getIdentityHasRolesStub(): SinonStub {
  return identityHasRolesStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.hasRoles` method
 */
export function getIdentityHasRoleStub(): SinonStub {
  return identityHasRoleStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.tokenPermissions.hasPermissions` method
 */
export function getIdentityTokenPermissionsHasPermissionsStub(): SinonStub {
  return identityTokenPermissionsHasPermissionsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.hasValidCdd` method
 */
export function getIdentityHasValidCddStub(): SinonStub {
  return identityHasValidCddStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.getPrimaryAccount` method
 */
export function getIdentityGetPrimaryAccountStub(): SinonStub {
  return identityGetPrimaryAccountStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.authorizations.getReceived` method
 */
export function getIdentityAuthorizationsGetReceivedStub(): SinonStub {
  return identityAuthorizationsGetReceivedStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.authorizations.getSent` method
 */
export function getIdentityAuthorizationsGetSentStub(): SinonStub {
  return identityAuthorizationsGetSentStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.getVenues` method
 */
export function getIdentityGetVenuesStub(): SinonStub {
  return identityGetVenuesStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.getScopeId` method
 */
export function getIdentityGetScopeIdStub(): SinonStub {
  return identityGetScopeIdStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.tokenPermissions.getGroup` method
 */
export function getIdentityTokenPermissionsGetGroupStub(
  group?: CustomPermissionGroup | KnownPermissionGroup
): SinonStub {
  if (group) {
    return identityTokenPermissionsGetGroupStub.resolves(group);
  }
  return identityTokenPermissionsGetGroupStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.isEqual` method
 */
export function getIdentityIsEqualStub(): SinonStub {
  return identityIsEqualStub;
}

/**
 * @hidden
 * Retrieve an Account instance
 */
export function getAccountInstance(opts?: AccountOptions): MockAccount {
  if (opts) {
    configureAccount({ ...defaultAccountOptions, ...opts });
  }

  return new MockAccountClass() as MockAccount;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.isFrozen` method
 */
export function getAccountIsFrozenStub(): SinonStub {
  return accountIsFrozenStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.getBalance` method
 */
export function getAccountGetBalanceStub(): SinonStub {
  return accountGetBalanceStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.getIdentity` method
 */
export function getAccountGetIdentityStub(): SinonStub {
  return accountGetIdentityStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.getTransactionHistory` method
 */
export function getAccountGetTransactionHistoryStub(): SinonStub {
  return accountGetTransactionHistoryStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.isEqual` method
 */
export function getAccountIsEqualStub(): SinonStub {
  return accountIsEqualStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Account.isEqual` method
 */
export function getAccountHasPermissionsStub(): SinonStub {
  return accountHasPermissionsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `NumberedPortfolio.isCustodiedBy` method
 */
export function getNumberedPortfolioIsCustodiedByStub(): SinonStub {
  return numberedPortfolioIsCustodiedByStub;
}

/**
 * @hidden
 * Retrieve the stub of the `NumberedPortfolio.getCustodian` method
 */
export function getNumberedPortfolioGetCustodianStub(): SinonStub {
  return numberedPortfolioGetCustodianStub;
}

/**
 * @hidden
 * Retrieve the stub of the `NumberedPortfolio.isEqual` method
 */
export function getNumberedPortfolioIsEqualStub(): SinonStub {
  return numberedPortfolioIsEqualStub;
}

/**
 * @hidden
 * Retrieve the stub of the `DefaultPortfolio.isCustodiedBy` method
 */
export function getDefaultPortfolioIsCustodiedByStub(): SinonStub {
  return defaultPortfolioIsCustodiedByStub;
}

/**
 * @hidden
 * Retrieve the stub of the `DefaultPortfolio.getCustodian` method
 */
export function getDefaultPortfolioGetCustodianStub(): SinonStub {
  return defaultPortfolioGetCustodianStub;
}

/**
 * @hidden
 * Retrieve the stub of the `DefaultPortfolio.isEqual` method
 */
export function getDefaultPortfolioIsEqualStub(): SinonStub {
  return defaultPortfolioIsEqualStub;
}

/**
 * @hidden
 * Retrieve a Ticker Reservation instance
 */
export function getTickerReservationInstance(
  opts?: TickerReservationOptions
): MockTickerReservation {
  if (opts) {
    configureTickerReservation({ ...defaultTickerReservationOptions, ...opts });
  }

  return new MockTickerReservationClass() as MockTickerReservation;
}

/**
 * @hidden
 * Retrieve the stub of the `TickerReservation.details` method
 */
export function getTickerReservationDetailsStub(
  details?: Partial<TickerReservationDetails>
): SinonStub {
  if (details) {
    return tickerReservationDetailsStub.resolves({
      ...defaultTickerReservationOptions.details,
      ...details,
    });
  }
  return tickerReservationDetailsStub;
}

/**
 * @hidden
 * Retrieve a Security Token instance
 */
export function getSecurityTokenInstance(opts?: SecurityTokenOptions): MockSecurityToken {
  if (opts) {
    configureSecurityToken({ ...defaultSecurityTokenOptions, ...opts });
  }

  return new MockSecurityTokenClass() as MockSecurityToken;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.details` method
 */
export function getSecurityTokenDetailsStub(details?: Partial<SecurityTokenDetails>): SinonStub {
  if (details) {
    return securityTokenDetailsStub.resolves({
      ...defaultSecurityTokenOptions.details,
      ...details,
    });
  }
  return securityTokenDetailsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.currentFundingRound` method
 */
export function getSecurityTokenCurrentFundingRoundStub(currentFundingRound?: string): SinonStub {
  if (currentFundingRound) {
    return securityTokenCurrentFundingRoundStub.resolves(currentFundingRound);
  }

  return securityTokenCurrentFundingRoundStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.isFrozen` method
 */
export function getSecurityTokenIsFrozenStub(frozen?: boolean): SinonStub {
  if (frozen !== undefined) {
    return securityTokenIsFrozenStub.resolves(frozen);
  }

  return securityTokenIsFrozenStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.getIdentifiers` method
 */
export function getSecurityTokenGetIdentifiersStub(identifiers?: TokenIdentifier): SinonStub {
  if (identifiers !== undefined) {
    return securityTokenGetIdentifiersStub.resolves(identifiers);
  }

  return securityTokenGetIdentifiersStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.Transfers.canTransfer` method
 */
export function getSecurityTokenTransfersCanTransferStub(status?: TransferStatus): SinonStub {
  if (status) {
    return securityTokenTransfersCanTransferStub.resolves(status);
  }

  return securityTokenTransfersCanTransferStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.transferRestrictions.count.get` method
 */
export function getSecurityTokenTransferRestrictionsCountGetStub(
  restrictions?: ActiveTransferRestrictions<CountTransferRestriction>
): SinonStub {
  if (restrictions) {
    return securityTokenTransferRestrictionsCountGetStub.resolves(restrictions);
  }

  return securityTokenTransferRestrictionsCountGetStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.transferRestrictions.percentage.get` method
 */
export function getSecurityTokenTransferRestrictionsPercentageGetStub(
  restrictions?: ActiveTransferRestrictions<PercentageTransferRestriction>
): SinonStub {
  if (restrictions) {
    return securityTokenTransferRestrictionsPercentageGetStub.resolves(restrictions);
  }

  return securityTokenTransferRestrictionsPercentageGetStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.corporateActions.getAgents` method
 */
export function getSecurityTokenCorporateActionsGetAgentsStub(agent?: Identity): SinonStub {
  if (agent) {
    return securityTokenCorporateActionsGetAgentsStub.resolves(agent);
  }

  return securityTokenCorporateActionsGetAgentsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.corporateActions.getDefaultConfig` method
 */
export function getSecurityTokenCorporateActionsGetDefaultConfigStub(
  defaults?: Partial<CorporateActionDefaultConfig>
): SinonStub {
  if (defaults) {
    return securityTokenCorporateActionsGetDefaultConfigStub.resolves(defaults);
  }

  return securityTokenCorporateActionsGetDefaultConfigStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.permissions.getGroups` method
 */
export function getSecurityTokenPermissionsGetGroupsStub(
  groups?: Partial<ResultSet<PermissionGroup>>
): SinonStub {
  if (groups) {
    return securityTokenPermissionsGetGroupsStub.resolves(groups);
  }

  return securityTokenPermissionsGetGroupsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.permissions.getAgents` method
 */
export function getSecurityTokenPermissionsGetAgentsStub(
  agents?: Partial<AgentWithGroup>[]
): SinonStub {
  if (agents) {
    return securityTokenPermissionsGetAgentsStub.resolves(agents);
  }

  return securityTokenPermissionsGetAgentsStub;
}

/**
 * @hidden
 * Retrieve an Authorization Request instance
 */
export function getAuthorizationRequestInstance(
  opts?: AuthorizationRequestOptions
): MockAuthorizationRequest {
  if (opts) {
    configureAuthorizationRequest({ ...defaultAuthorizationRequestOptions, ...opts });
  }

  return new MockAuthorizationRequestClass() as MockAuthorizationRequest;
}

/**
 * @hidden
 * Retrieve a Venue instance
 */
export function getVenueInstance(opts?: VenueOptions): MockVenue {
  if (opts) {
    configureVenue({ ...defaultVenueOptions, ...opts });
  }

  return new MockVenueClass() as MockVenue;
}

/**
 * @hidden
 * Retrieve the stub of the `Venue.details` method
 */
export function getVenueDetailsStub(details?: Partial<VenueDetails>): SinonStub {
  if (details) {
    return venueDetailsStub.resolves({
      ...defaultVenueOptions.details,
      ...details,
    });
  }
  return venueDetailsStub;
}

/**
 * @hidden
 * Retrieve a NumberedPortfolio instance
 */
export function getNumberedPortfolioInstance(
  opts?: NumberedPortfolioOptions
): MockNumberedPortfolio {
  if (opts) {
    configureNumberedPortfolio({ ...defaultNumberedPortfolioOptions, ...opts });
  }

  return new MockNumberedPortfolioClass() as MockNumberedPortfolio;
}

/**
 * @hidden
 * Retrieve a DefaultPortfolio instance
 */
export function getDefaultPortfolioInstance(opts?: DefaultPortfolioOptions): MockDefaultPortfolio {
  if (opts) {
    configureDefaultPortfolio({ ...defaultDefaultPortfolioOptions, ...opts });
  }

  return new MockDefaultPortfolioClass() as MockDefaultPortfolio;
}

/**
 * @hidden
 * Retrieve a CustomPermissionGroup instance
 */
export function getCustomPermissionGroupInstance(
  opts?: CustomPermissionGroupOptions
): MockCustomPermissionGroup {
  if (opts) {
    configureCustomPermissionGroup({ ...defaultCustomPermissionGroupOptions, ...opts });
  }

  return new MockCustomPermissionGroupClass() as MockCustomPermissionGroup;
}

/**
 * @hidden
 * Retrieve the stub of the `CustomPermissionGroup.getPermissions` method
 */
export function getCustomPermissionGroupGetPermissionsStub(
  getPermissions?: GroupPermissions
): SinonStub {
  if (getPermissions) {
    return customPermissionGroupGetPermissionsStub.resolves(getPermissions);
  }
  return customPermissionGroupGetPermissionsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CustomPermissionGroup.isEqual` method
 */
export function getCustomPermissionIsEqualStub(): SinonStub {
  return customPermissionGroupIsEqualStub;
}

/**
 * @hidden
 * Retrieve a KnownPermissionGroup instance
 */
export function getKnownPermissionGroupInstance(
  opts?: KnownPermissionGroupOptions
): MockKnownPermissionGroup {
  if (opts) {
    configureKnownPermissionGroup({ ...defaultKnownPermissionGroupOptions, ...opts });
  }

  return new MockKnownPermissionGroupClass() as MockKnownPermissionGroup;
}

/**
 * @hidden
 * Retrieve the stub of the `KnownPermissionGroup.getPermissions` method
 */
export function getKnownPermissionGroupGetPermissionsStub(
  getPermissions?: GroupPermissions
): SinonStub {
  if (getPermissions) {
    return knownPermissionGroupGetPermissionsStub.resolves(getPermissions);
  }
  return knownPermissionGroupGetPermissionsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `KnownPermissionGroup.isEqual` method
 */
export function getKnownPermissionGroupIsEqualStub(): SinonStub {
  return knownPermissionGroupIsEqualStub;
}

/**
 * @hidden
 * Retrieve an Instruction instance
 */
export function getInstructionInstance(opts?: InstructionOptions): MockInstruction {
  if (opts) {
    configureInstruction({ ...defaultInstructionOptions, ...opts });
  }

  return new MockInstructionClass() as MockInstruction;
}

/**
 * @hidden
 * Retrieve the stub of the `Instruction.details` method
 */
export function getInstructionDetailsStub(details?: Partial<InstructionDetails>): SinonStub {
  if (details) {
    return instructionDetailsStub.resolves({
      ...defaultInstructionOptions.details,
      ...details,
    });
  }
  return instructionDetailsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Instruction.getLegs` method
 */
export function getInstructionGetLegsStub(legs?: ResultSet<Leg>): SinonStub {
  if (legs) {
    return instructionGetLegsStub.resolves({
      ...defaultInstructionOptions.getLegs,
      ...legs,
    });
  }
  return instructionGetLegsStub;
}

/**
 * @hidden
 * Retrieve an Sto instance
 */
export function getStoInstance(opts?: StoOptions): MockSto {
  if (opts) {
    configureSto({ ...defaultStoOptions, ...opts });
  }

  return new MockStoClass() as MockSto;
}

/**
 * @hidden
 * Retrieve the stub of the `Sto.details` method
 */
export function getStoDetailsStub(details?: Partial<StoDetails>): SinonStub {
  if (details) {
    return stoDetailsStub.resolves({
      ...defaultStoOptions.details,
      ...details,
    });
  }
  return stoDetailsStub;
}

/**
 * @hidden
 * Retrieve the Sto constructor stub
 */
export function getStoConstructorStub(): SinonStub {
  return stoConstructorStub;
}

/**
 * @hidden
 * Retrieve a Checkpoint instance
 */
export function getCheckpointInstance(opts?: CheckpointOptions): MockCheckpoint {
  if (opts) {
    configureCheckpoint({ ...defaultCheckpointOptions, ...opts });
  }

  return new MockCheckpointClass() as MockCheckpoint;
}

/**
 * @hidden
 * Retrieve the stub of the `Checkpoint.createdAt` method
 */
export function getCheckpointCreatedAtStub(createdAt?: Date): SinonStub {
  if (createdAt) {
    return checkpointCreatedAtStub.resolves(createdAt);
  }
  return checkpointCreatedAtStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Checkpoint.totalSupply` method
 */
export function getCheckpointTotalSupplyStub(totalSupply?: BigNumber): SinonStub {
  if (totalSupply) {
    return checkpointTotalSupplyStub.resolves(totalSupply);
  }
  return checkpointTotalSupplyStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Checkpoint.exists` method
 */
export function getCheckpointExistsStub(exists?: boolean): SinonStub {
  if (exists) {
    return checkpointExistsStub.resolves(exists);
  }
  return checkpointExistsStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Checkpoint.allBalances` method
 */
export function getCheckpointAllBalancesStub(allBalances?: ResultSet<IdentityBalance>): SinonStub {
  if (allBalances) {
    return checkpointAllBalancesStub.resolves(allBalances);
  }
  return checkpointAllBalancesStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Checkpoint.balance` method
 */
export function getCheckpointBalanceStub(balance?: BigNumber): SinonStub {
  if (balance) {
    return checkpointBalanceStub.resolves(balance);
  }
  return checkpointBalanceStub;
}

/**
 * @hidden
 * Retrieve the Checkpoint constructor stub
 */
export function getCheckpointConstructorStub(): SinonStub {
  return checkpointConstructorStub;
}

/**
 * @hidden
 * Retrieve a CheckpointSchedule instance
 */
export function getCheckpointScheduleInstance(
  opts?: CheckpointScheduleOptions
): MockCheckpointSchedule {
  if (opts) {
    configureCheckpointSchedule({ ...defaultCheckpointScheduleOptions, ...opts });
  }

  return new MockCheckpointScheduleClass() as MockCheckpointSchedule;
}

/**
 * @hidden
 * Retrieve the CheckpointSchedule constructor stub
 */
export function getCheckpointScheduleConstructorStub(): SinonStub {
  return checkpointScheduleConstructorStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CheckpointSchedule.details` method
 */
export function getCheckpointScheduleDetailsStub(details?: Partial<ScheduleDetails>): SinonStub {
  if (details) {
    return checkpointScheduleDetailsStub.resolves({
      ...defaultCheckpointScheduleOptions.details,
      ...details,
    });
  }
  return checkpointScheduleDetailsStub;
}

/**
 * @hidden
 * Retrieve a CorporateAction instance
 */
export function getCorporateActionInstance(opts?: CorporateActionOptions): MockCorporateAction {
  if (opts) {
    configureCorporateAction({ ...defaultCorporateActionOptions, ...opts });
  }

  return new MockCorporateActionClass() as MockCorporateAction;
}

/**
 * @hidden
 * Retrieve the stub of the `CorporateAction.exists` method
 */
export function getCorporateActionExistsStub(exists?: boolean): SinonStub {
  if (exists) {
    return corporateActionExistsStub.resolves(exists);
  }
  return corporateActionExistsStub;
}

/**
 * @hidden
 * Retrieve the CorporateAction constructor stub
 */
export function getCorporateActionConstructorStub(): SinonStub {
  return corporateActionConstructorStub;
}

/**
 * @hidden
 * Retrieve a DividendDistribution instance
 */
export function getDividendDistributionInstance(
  opts?: DividendDistributionOptions
): MockDividendDistribution {
  if (opts) {
    configureDividendDistribution({ ...defaultDividendDistributionOptions, ...opts });
  }

  return new MockDividendDistributionClass() as MockDividendDistribution;
}

/**
 * @hidden
 * Retrieve the stub of the `DividendDistribution.checkpoint` method
 */
export function getDividendDistributionCheckpointStub(
  checkpoint?: Checkpoint | CheckpointSchedule
): SinonStub {
  if (checkpoint) {
    return dividendDistributionCheckpointStub.resolves(checkpoint);
  }
  return dividendDistributionCheckpointStub;
}

/**
 * @hidden
 * Retrieve the DividendDistribution constructor stub
 */
export function getDividendDistributionConstructorStub(): SinonStub {
  return dividendDistributionConstructorStub;
}

/**
 * @hidden
 * Retrieve the stub of the `DividendDistribution.getParticipant` method
 */
export function getDividendDistributionGetParticipantStub(
  getParticipant?: Partial<DistributionParticipant>
): SinonStub {
  if (getParticipant) {
    return dividendDistributionGetParticipantStub.resolves({
      ...defaultDividendDistributionOptions.getParticipant,
      ...getParticipant,
    });
  }

  return dividendDistributionGetParticipantStub.resolves(getParticipant);
}
