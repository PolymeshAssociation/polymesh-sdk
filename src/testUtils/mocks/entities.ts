/* istanbul ignore file */

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
  CurrentAccount,
  CurrentIdentity,
  DefaultPortfolio,
  DividendDistribution,
  Identity,
  Instruction,
  NumberedPortfolio,
  // NOTE uncomment in Governance v2 upgrade
  // Proposal,
  SecurityToken,
  Sto,
  TickerReservation,
  Venue,
} from '~/internal';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  ActiveTransferRestrictions,
  Authorization,
  AuthorizationType,
  CalendarPeriod,
  CalendarUnit,
  CorporateActionDefaults,
  CorporateActionKind,
  CorporateActionTargets,
  CountTransferRestriction,
  DividendDistributionDetails,
  ExtrinsicData,
  IdentityBalance,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  Leg,
  PercentageTransferRestriction,
  PortfolioBalance,
  ResultSet,
  ScheduleDetails,
  SecondaryKey,
  SecurityTokenDetails,
  StoBalanceStatus,
  StoDetails,
  StoSaleStatus,
  StoTimingStatus,
  TargetTreatment,
  TaxWithholding,
  TickerReservationDetails,
  TickerReservationStatus,
  TokenIdentifier,
  TransferStatus,
  VenueDetails,
  VenueType,
  // NOTE uncomment in Governance v2 upgrade
  // TxTags,
} from '~/types';

const mockInstanceContainer = {
  identity: {} as MockIdentity,
  currentIdentity: {} as MockCurrentIdentity,
  tickerReservation: {} as MockTickerReservation,
  securityToken: {} as MockSecurityToken,
  authorizationRequest: {} as MockAuthorizationRequest,
  // NOTE uncomment in Governance v2 upgrade
  // proposal: {} as MockProposal,
  account: {} as MockAccount,
  currentAccount: {} as MockCurrentAccount,
  venue: {} as MockVenue,
  instruction: {} as MockInstruction,
  numberedPortfolio: {} as MockNumberedPortfolio,
  defaultPortfolio: {} as MockDefaultPortfolio,
  sto: {} as MockSto,
  checkpoint: {} as MockCheckpoint,
  checkpointSchedule: {} as MockCheckpointSchedule,
  corporateAction: {} as MockCorporateAction,
  dividendDistribution: {} as MockDividendDistribution,
};

type MockIdentity = Mocked<Identity>;
type MockCurrentIdentity = Mocked<CurrentIdentity>;
type MockAccount = Mocked<Account>;
type MockCurrentAccount = Mocked<CurrentAccount>;
type MockTickerReservation = Mocked<TickerReservation>;
type MockSecurityToken = Mocked<SecurityToken>;
type MockAuthorizationRequest = Mocked<AuthorizationRequest>;
// NOTE uncomment in Governance v2 upgrade
// type MockProposal = Mocked<Proposal>;
type MockVenue = Mocked<Venue>;
type MockInstruction = Mocked<Instruction>;
type MockNumberedPortfolio = Mocked<NumberedPortfolio>;
type MockDefaultPortfolio = Mocked<DefaultPortfolio>;
type MockSto = Mocked<Sto>;
type MockCheckpoint = Mocked<Checkpoint>;
type MockCheckpointSchedule = Mocked<CheckpointSchedule>;
type MockCorporateAction = Mocked<CorporateAction>;
type MockDividendDistribution = Mocked<DividendDistribution>;

interface IdentityOptions {
  did?: string;
  hasRoles?: boolean;
  hasRole?: boolean;
  hasValidCdd?: boolean;
  getPrimaryKey?: string;
  authorizations?: {
    getReceived: AuthorizationRequest[];
  };
  getVenues?: Venue[];
  getScopeId?: string;
  getTokenBalance?: BigNumber;
  areScondaryKeysFrozen?: boolean;
}

interface CurrentIdentityOptions extends IdentityOptions {
  getSecondaryKeys?: SecondaryKey[];
}

interface TickerReservationOptions {
  ticker?: string;
  details?: Partial<TickerReservationDetails>;
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
  corporateActionsGetAgent?: Identity;
  corporateActionsGetDefaults?: Partial<CorporateActionDefaults>;
}

interface AuthorizationRequestOptions {
  authId?: BigNumber;
  target?: Identity;
  issuer?: Identity;
  expiry?: Date | null;
  data?: Authorization;
}

interface ProposalOptions {
  pipId?: BigNumber;
  getDetails?: ProposalDetails;
  getStage?: ProposalStage;
  identityHasVoted?: boolean;
}

interface AccountOptions {
  address?: string;
  key?: string;
  getBalance?: AccountBalance;
  getIdentity?: Identity | null;
  getTransactionHistory?: ExtrinsicData[];
}

interface CurrentAccountOptions extends AccountOptions {
  getIdentity?: CurrentIdentity | null;
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
  uuid?: string;
  isCustodiedBy?: boolean;
}

interface DefaultPortfolioOptions {
  isOwnedBy?: boolean;
  tokenBalances?: PortfolioBalance[];
  did?: string;
  custodian?: Identity;
  uuid?: string;
  isCustodiedBy?: boolean;
}

interface InstructionOptions {
  id?: BigNumber;
  details?: Partial<InstructionDetails>;
  getLegs?: ResultSet<Leg>;
  exists?: boolean;
}

interface StoOptions {
  id?: BigNumber;
  ticker?: string;
  details?: Partial<StoDetails>;
}

interface CheckpointOptions {
  id?: BigNumber;
  ticker?: string;
  createdAt?: Date;
  totalSupply?: BigNumber;
  exists?: boolean;
  allBalances?: ResultSet<IdentityBalance>;
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
}

let identityConstructorStub: SinonStub;
let currentIdentityConstructorStub: SinonStub;
let accountConstructorStub: SinonStub;
let currentAccountConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;
let authorizationRequestConstructorStub: SinonStub;
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

let securityTokenDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenIsFrozenStub: SinonStub;
let securityTokenTransfersCanTransferStub: SinonStub;
let securityTokenGetIdentifiersStub: SinonStub;
let securityTokenTransferRestrictionsCountGetStub: SinonStub;
let securityTokenTransferRestrictionsPercentageGetStub: SinonStub;
let securityTokenCorporateActionsGetAgentStub: SinonStub;
let securityTokenCorporateActionsGetDefaultsStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let identityHasValidCddStub: SinonStub;
let identityGetPrimaryKeyStub: SinonStub;
let identityAuthorizationsGetReceivedStub: SinonStub;
let identityGetVenuesStub: SinonStub;
let identityGetScopeIdStub: SinonStub;
let identityGetTokenBalanceStub: SinonStub;
let currentIdentityHasRolesStub: SinonStub;
let currentIdentityHasRoleStub: SinonStub;
let currentIdentityHasValidCddStub: SinonStub;
let currentIdentityGetPrimaryKeyStub: SinonStub;
let currentIdentityAuthorizationsGetReceivedStub: SinonStub;
let currentIdentityGetVenuesStub: SinonStub;
let currentIdentityGetScopeIdStub: SinonStub;
let currentIdentityGetSecondaryKeysStub: SinonStub;
let currentIdentityAreSecondaryKeysFrozenStub: SinonStub;
let accountGetBalanceStub: SinonStub;
let accountGetIdentityStub: SinonStub;
let accountGetTransactionHistoryStub: SinonStub;
let currentAccountGetBalanceStub: SinonStub;
let currentAccountGetIdentityStub: SinonStub;
let currentAccountGetTransactionHistoryStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;
let venueDetailsStub: SinonStub;
let venueExistsStub: SinonStub;
let instructionDetailsStub: SinonStub;
let instructionGetLegsStub: SinonStub;
let instructionExistsStub: SinonStub;
let numberedPortfolioIsOwnedByStub: SinonStub;
let numberedPortfolioGetTokenBalancesStub: SinonStub;
let numberedPortfolioExistsStub: SinonStub;
let numberedPortfolioGetCustodianStub: SinonStub;
let numberedPortfolioIsCustodiedByStub: SinonStub;
let defaultPortfolioIsOwnedByStub: SinonStub;
let defaultPortfolioGetTokenBalancesStub: SinonStub;
let defaultPortfolioGetCustodianStub: SinonStub;
let defaultPortfolioIsCustodiedByStub: SinonStub;
let stoDetailsStub: SinonStub;
let checkpointCreatedAtStub: SinonStub;
let checkpointTotalSupplyStub: SinonStub;
let checkpointExistsStub: SinonStub;
let checkpointAllBalancesStub: SinonStub;
let checkpointScheduleDetailsStub: SinonStub;
let corporateActionExistsStub: SinonStub;
let checkpointScheduleExistsStub: SinonStub;
let dividendDistributionDetailsStub: SinonStub;

const MockIdentityClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return identityConstructorStub(...args);
  }
};

const MockCurrentIdentityClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return currentIdentityConstructorStub(...args);
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

const MockCurrentAccountClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return currentAccountConstructorStub(...args);
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

export const mockIdentityModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Identity: MockIdentityClass,
});

export const mockCurrentIdentityModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  CurrentIdentity: MockCurrentIdentityClass,
});

export const mockAccountModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Account: MockAccountClass,
});

export const mockCurrentAccountModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  CurrentAccount: MockCurrentAccountClass,
});

export const mockTickerReservationModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  TickerReservation: MockTickerReservationClass,
});

export const mockSecurityTokenModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  SecurityToken: MockSecurityTokenClass,
});

export const mockAuthorizationRequestModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  AuthorizationRequest: MockAuthorizationRequestClass,
});

export const mockProposalModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Proposal: MockProposalClass,
});

export const mockVenueModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Venue: MockVenueClass,
});

export const mockInstructionModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Instruction: MockInstructionClass,
});

export const mockNumberedPortfolioModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  NumberedPortfolio: MockNumberedPortfolioClass,
});

export const mockDefaultPortfolioModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  DefaultPortfolio: MockDefaultPortfolioClass,
});

export const mockStoModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Sto: MockStoClass,
});

export const mockCheckpointModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  Checkpoint: MockCheckpointClass,
});

export const mockCheckpointScheduleModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  CheckpointSchedule: MockCheckpointScheduleClass,
});

export const mockCorporateActionModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  CorporateAction: MockCorporateActionClass,
});

export const mockDividendDistributionModule = (path: string) => (): object => ({
  ...jest.requireActual(path),
  DividendDistribution: MockDividendDistributionClass,
});

const defaultIdentityOptions: IdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  getPrimaryKey: 'someAddress',
  authorizations: {
    getReceived: [],
  },
  getVenues: [],
  getScopeId: 'someScopeId',
  getTokenBalance: new BigNumber(100),
  areScondaryKeysFrozen: false,
};
let identityOptions: IdentityOptions = defaultIdentityOptions;
const defaultCurrentIdentityOptions: CurrentIdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  getPrimaryKey: 'someAddress',
  getSecondaryKeys: [],
  authorizations: {
    getReceived: [],
  },
  getVenues: [],
  getScopeId: 'someScopeId',
  areScondaryKeysFrozen: false,
};
let currentIdentityOptions: CurrentIdentityOptions = defaultCurrentIdentityOptions;
const defaultAccountOptions: AccountOptions = {
  address: 'someAddress',
  key: 'someKey',
  getBalance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  getTransactionHistory: [],
};
let accountOptions: AccountOptions = defaultAccountOptions;
const defaultCurrentAccountOptions: CurrentAccountOptions = {
  address: 'someAddress',
  key: 'someKey',
  getBalance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
    total: new BigNumber(110),
  },
  getTransactionHistory: [],
};
let currentAccountOptions: CurrentAccountOptions = defaultCurrentAccountOptions;
const defaultTickerReservationOptions: TickerReservationOptions = {
  ticker: 'SOME_TICKER',
  details: {
    expiryDate: new Date(),
    status: TickerReservationStatus.Reserved,
  },
};
let tickerReservationOptions = defaultTickerReservationOptions;
const defaultSecurityTokenOptions: SecurityTokenOptions = {
  ticker: 'SOME_TICKER',
  details: {
    name: 'TOKEN_NAME',
    totalSupply: new BigNumber(1000000),
    isDivisible: false,
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
  corporateActionsGetAgent: { did: 'someDid' } as Identity,
  corporateActionsGetDefaults: {
    targets: { identities: [], treatment: TargetTreatment.Exclude },
    defaultTaxWithholding: new BigNumber(10),
    taxWithholdings: [],
  },
};
let securityTokenOptions = defaultSecurityTokenOptions;
const defaultAuthorizationRequestOptions: AuthorizationRequestOptions = {
  authId: new BigNumber(1),
  target: { did: 'targetDid' } as Identity,
  issuer: { did: 'issuerDid' } as Identity,
  data: { type: AuthorizationType.TransferAssetOwnership, value: 'UNWANTED_TOKEN' },
  expiry: null,
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
      token: ('someToken' as unknown) as SecurityToken,
      total: new BigNumber(1),
      locked: new BigNumber(0),
      free: new BigNumber(1),
    },
  ],
  did: 'someDid',
  exists: true,
  uuid: 'someUuid',
  custodian: ('identity' as unknown) as Identity,
  isCustodiedBy: true,
};
let numberedPortfolioOptions = defaultNumberedPortfolioOptions;
const defaultDefaultPortfolioOptions: DefaultPortfolioOptions = {
  isOwnedBy: true,
  tokenBalances: [
    {
      token: ('someToken' as unknown) as SecurityToken,
      total: new BigNumber(1),
      locked: new BigNumber(0),
      free: new BigNumber(1),
    },
  ],
  did: 'someDid',
  uuid: 'someUuid',
  custodian: ('identity' as unknown) as Identity,
  isCustodiedBy: true,
};
let defaultPortfolioOptions = defaultDefaultPortfolioOptions;
const defaultInstructionOptions: InstructionOptions = {
  id: new BigNumber(1),
  details: {
    status: InstructionStatus.Pending,
    createdAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    tradeDate: null,
    valueDate: null,
    type: InstructionType.SettleOnAffirmation,
  },
  exists: false,
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
};
let dividendDistributionOptions = defaultDividendDistributionOptions;
// NOTE uncomment in Governance v2 upgrade
// const defaultProposalOptions: ProposalOptions = {
//   pipId: new BigNumber(1),
//   getDetails: {
//     lastState: ProposalState.Referendum,
//     transaction: TxTags.treasury.Disbursement,
//   } as ProposalDetails,
//   getStage: ProposalStage.Open,
//   identityHasVoted: false,
// };

// let proposalOptions = defaultProposalOptions;

/**
 * @hidden
 * Configure the Proposal instance
 */
// NOTE uncomment in Governance v2 upgrade

// function configureProposal(opts: ProposalOptions): void {
//   const proposal = ({
//     pipId: opts.pipId,
//     getDetails: sinon.stub().returns(opts.getDetails),
//     getStage: sinon.stub().returns(opts.getStage),
//     identityHasVoted: sinon.stub().returns(opts.identityHasVoted),
//   } as unknown) as MockProposal;

//   Object.assign(mockInstanceContainer.proposal, proposal);
//   proposalConstructorStub.callsFake(args => {
//     return merge({}, proposal, args);
//   });
// }

/**
 * @hidden
 * Initialize the Proposal instance
 */
// NOTE uncomment in Governance v2 upgrade
// function initProposal(opts?: ProposalOptions): void {
//   proposalConstructorStub = sinon.stub();

//   proposalOptions = { ...defaultProposalOptions, ...opts };

//   configureProposal(proposalOptions);
// }

/**
 * @hidden
 * Configure the Authorization Request instance
 */
function configureVenue(opts: VenueOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const venue = ({
    id: opts.id,
    details: venueDetailsStub.resolves(details),
    exists: venueExistsStub.resolves(opts.exists),
  } as unknown) as MockVenue;

  Object.assign(mockInstanceContainer.venue, venue);
  venueConstructorStub.callsFake(args => {
    const value = merge({}, venue, args);
    Object.setPrototypeOf(value, require('~/internal').Venue.prototype);
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
  const numberedPortfolio = ({
    uuid: opts.uuid,
    id: opts.id,
    isOwnedBy: numberedPortfolioIsOwnedByStub.resolves(opts.isOwnedBy),
    getTokenBalances: numberedPortfolioGetTokenBalancesStub.resolves(opts.tokenBalances),
    getCustodian: numberedPortfolioGetCustodianStub.resolves(opts.custodian),
    owner: { did: opts.did },
    exists: numberedPortfolioExistsStub.resolves(opts.exists),
    isCustodiedBy: numberedPortfolioIsCustodiedByStub.resolves(opts.isCustodiedBy),
  } as unknown) as MockNumberedPortfolio;

  Object.assign(mockInstanceContainer.numberedPortfolio, numberedPortfolio);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  numberedPortfolioConstructorStub.callsFake(({ did, ...args } = {}) => {
    const value = merge({}, numberedPortfolio, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
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

  numberedPortfolioOptions = { ...defaultNumberedPortfolioOptions, ...opts };

  configureNumberedPortfolio(numberedPortfolioOptions);
}

/**
 * @hidden
 * Configure the Default Portfolio instance
 */
function configureDefaultPortfolio(opts: DefaultPortfolioOptions): void {
  const defaultPortfolio = ({
    uuid: opts.uuid,
    isOwnedBy: defaultPortfolioIsOwnedByStub.resolves(opts.isOwnedBy),
    getTokenBalances: defaultPortfolioGetTokenBalancesStub.resolves(opts.tokenBalances),
    owner: { did: opts.did },
    getCustodian: defaultPortfolioGetCustodianStub.resolves(opts.custodian),
    isCustodiedBy: defaultPortfolioIsCustodiedByStub.resolves(opts.isCustodiedBy),
  } as unknown) as MockDefaultPortfolio;

  Object.assign(mockInstanceContainer.defaultPortfolio, defaultPortfolio);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultPortfolioConstructorStub.callsFake(({ did, ...args } = {}) => {
    const value = merge({}, defaultPortfolio, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
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

  defaultPortfolioOptions = { ...defaultDefaultPortfolioOptions, ...opts };

  configureDefaultPortfolio(defaultPortfolioOptions);
}

/**
 * @hidden
 * Configure the Authorization Request instance
 */
function configureAuthorizationRequest(opts: AuthorizationRequestOptions): void {
  const authorizationRequest = ({
    authId: opts.authId,
    issuer: opts.issuer,
    target: opts.target,
    expiry: opts.expiry,
    data: opts.data,
  } as unknown) as MockAuthorizationRequest;

  Object.assign(mockInstanceContainer.authorizationRequest, authorizationRequest);
  authorizationRequestConstructorStub.callsFake(args => {
    const value = merge({}, authorizationRequest, args);
    Object.setPrototypeOf(value, require('~/internal').AuthorizationRequest.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Authorization Request instance
 */
function initAuthorizationRequest(opts?: AuthorizationRequestOptions): void {
  authorizationRequestConstructorStub = sinon.stub();

  authorizationRequestOptions = { ...defaultAuthorizationRequestOptions, ...opts };

  configureAuthorizationRequest(authorizationRequestOptions);
}

/**
 * @hidden
 * Configure the Security Token instance
 */
function configureSecurityToken(opts: SecurityTokenOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const securityToken = ({
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
      getAgent: securityTokenCorporateActionsGetAgentStub.resolves(opts.corporateActionsGetAgent),
      getDefaults: securityTokenCorporateActionsGetDefaultsStub.resolves(
        opts.corporateActionsGetDefaults
      ),
    },
  } as unknown) as MockSecurityToken;

  Object.assign(mockInstanceContainer.securityToken, securityToken);
  securityTokenConstructorStub.callsFake(args => {
    const value = merge({}, securityToken, args);
    Object.setPrototypeOf(value, require('~/internal').SecurityToken.prototype);
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
  securityTokenCorporateActionsGetAgentStub = sinon.stub();
  securityTokenCorporateActionsGetDefaultsStub = sinon.stub();

  securityTokenOptions = merge({}, defaultSecurityTokenOptions, opts);

  configureSecurityToken(securityTokenOptions);
}

/**
 * @hidden
 * Configure the Ticker Reservation instance
 */
function configureTickerReservation(opts: TickerReservationOptions): void {
  const details = { owner: mockInstanceContainer.identity, ...opts.details };
  const tickerReservation = ({
    ticker: opts.ticker,
    details: tickerReservationDetailsStub.resolves(details),
  } as unknown) as MockTickerReservation;

  Object.assign(mockInstanceContainer.tickerReservation, tickerReservation);
  tickerReservationConstructorStub.callsFake(args => {
    const value = merge({}, tickerReservation, args);
    Object.setPrototypeOf(value, require('~/internal').TickerReservation.prototype);
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
  const identity = ({
    did: opts.did,
    hasRoles: identityHasRolesStub.resolves(opts.hasRoles),
    hasRole: identityHasRoleStub.resolves(opts.hasRole),
    hasValidCdd: identityHasValidCddStub.resolves(opts.hasValidCdd),
    getPrimaryKey: identityGetPrimaryKeyStub.resolves(opts.getPrimaryKey),
    portfolios: {},
    authorizations: {
      getReceived: identityAuthorizationsGetReceivedStub.resolves(opts.authorizations?.getReceived),
    },
    getVenues: identityGetVenuesStub.resolves(opts.getVenues),
    getScopeId: identityGetScopeIdStub.resolves(opts.getScopeId),
    getTokenBalance: identityGetTokenBalanceStub.resolves(opts.getTokenBalance),
  } as unknown) as MockIdentity;

  Object.assign(mockInstanceContainer.identity, identity);
  identityConstructorStub.callsFake(args => {
    const value = merge({}, identity, args);
    Object.setPrototypeOf(value, require('~/internal').Identity.prototype);
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
  identityHasValidCddStub = sinon.stub();
  identityGetPrimaryKeyStub = sinon.stub();
  identityAuthorizationsGetReceivedStub = sinon.stub();
  identityGetVenuesStub = sinon.stub();
  identityGetScopeIdStub = sinon.stub();
  identityGetTokenBalanceStub = sinon.stub();

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
  const instruction = ({
    id: opts.id,
    details: instructionDetailsStub.resolves(details),
    getLegs: instructionGetLegsStub.resolves(legs),
    exists: instructionExistsStub.resolves(opts.exists),
  } as unknown) as MockInstruction;

  Object.assign(mockInstanceContainer.instruction, instruction);
  instructionConstructorStub.callsFake(args => {
    const value = merge({}, instruction, args);
    Object.setPrototypeOf(value, require('~/internal').Instruction.prototype);
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
  instructionExistsStub = sinon.stub();

  instructionOptions = { ...defaultInstructionOptions, ...opts };

  configureInstruction(instructionOptions);
}

/**
 * @hidden
 * Configure the CurrentIdentity instance
 */
function configureCurrentIdentity(opts: CurrentIdentityOptions): void {
  const identity = ({
    did: opts.did,
    hasRoles: currentIdentityHasRolesStub.resolves(opts.hasRoles),
    hasRole: currentIdentityHasRoleStub.resolves(opts.hasRole),
    hasValidCdd: currentIdentityHasValidCddStub.resolves(opts.hasValidCdd),
    getPrimaryKey: currentIdentityGetPrimaryKeyStub.resolves(opts.getPrimaryKey),
    getSecondaryKeys: currentIdentityGetSecondaryKeysStub.resolves(opts.getSecondaryKeys),
    portfolios: {},
    authorizations: {
      getReceived: currentIdentityAuthorizationsGetReceivedStub.resolves(
        opts.authorizations?.getReceived
      ),
    },
    getVenues: currentIdentityGetVenuesStub.resolves(opts.getVenues),
    getScopeId: currentIdentityGetScopeIdStub.resolves(opts.getScopeId),
    areSecondaryKeysFrozen: currentIdentityAreSecondaryKeysFrozenStub.resolves(
      opts.areScondaryKeysFrozen
    ),
  } as unknown) as MockIdentity;

  Object.assign(mockInstanceContainer.currentIdentity, identity);
  currentIdentityConstructorStub.callsFake(args => {
    const value = merge({}, identity, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.CurrentIdentity.prototype, entities.Identity.prototype);
    Object.setPrototypeOf(value, entities.CurrentIdentity.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the CurrentIdentity instance
 */
function initCurrentIdentity(opts?: CurrentIdentityOptions): void {
  currentIdentityConstructorStub = sinon.stub();
  currentIdentityHasRolesStub = sinon.stub();
  currentIdentityHasRoleStub = sinon.stub();
  currentIdentityHasValidCddStub = sinon.stub();
  currentIdentityGetPrimaryKeyStub = sinon.stub();
  currentIdentityAuthorizationsGetReceivedStub = sinon.stub();
  currentIdentityGetVenuesStub = sinon.stub();
  currentIdentityGetScopeIdStub = sinon.stub();
  currentIdentityGetSecondaryKeysStub = sinon.stub();
  currentIdentityAreSecondaryKeysFrozenStub = sinon.stub();

  currentIdentityOptions = { ...defaultCurrentIdentityOptions, ...opts };

  configureCurrentIdentity(currentIdentityOptions);
}

/**
 * @hidden
 * Configure the Account instance
 */
function configureAccount(opts: AccountOptions): void {
  const account = ({
    address: opts.address,
    key: opts.key,
    getBalance: accountGetBalanceStub.resolves(opts.getBalance),
    getIdentity: accountGetIdentityStub.resolves(
      opts.getIdentity === undefined ? mockInstanceContainer.identity : opts.getIdentity
    ),
    getTransactionHistory: accountGetTransactionHistoryStub.resolves(opts.getTransactionHistory),
  } as unknown) as MockAccount;

  Object.assign(mockInstanceContainer.account, account);
  accountConstructorStub.callsFake(args => {
    const value = merge({}, account, args);
    Object.setPrototypeOf(value, require('~/internal').Account.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Account instance
 */
function initAccount(opts?: AccountOptions): void {
  accountConstructorStub = sinon.stub();
  accountGetBalanceStub = sinon.stub();
  accountGetIdentityStub = sinon.stub();
  accountGetTransactionHistoryStub = sinon.stub();

  accountOptions = { ...defaultAccountOptions, ...opts };

  configureAccount(accountOptions);
}

/**
 * @hidden
 * Configure the Current Account instance
 */
function configureCurrentAccount(opts: CurrentAccountOptions): void {
  const account = ({
    address: opts.address,
    key: opts.key,
    getBalance: currentAccountGetBalanceStub.resolves(opts.getBalance),
    getIdentity: currentAccountGetIdentityStub.resolves(
      opts.getIdentity === undefined ? mockInstanceContainer.identity : opts.getIdentity
    ),
    getTransactionHistory: currentAccountGetTransactionHistoryStub.resolves(
      opts.getTransactionHistory
    ),
  } as unknown) as MockAccount;

  Object.assign(mockInstanceContainer.currentAccount, account);
  currentAccountConstructorStub.callsFake(args => {
    const value = merge({}, account, args);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entities = require('~/internal');
    Object.setPrototypeOf(entities.CurrentAccount.prototype, entities.Account.prototype);
    Object.setPrototypeOf(value, entities.CurrentAccount.prototype);
    return value;
  });
}

/**
 * @hidden
 * Initialize the Current Account instance
 */
function initCurrentAccount(opts?: CurrentAccountOptions): void {
  currentAccountConstructorStub = sinon.stub();
  currentAccountGetBalanceStub = sinon.stub();
  currentAccountGetIdentityStub = sinon.stub();
  currentAccountGetTransactionHistoryStub = sinon.stub();

  currentAccountOptions = { ...defaultCurrentAccountOptions, ...opts };

  configureCurrentAccount(currentAccountOptions);
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
    raisingPorfolio: mockInstanceContainer.numberedPortfolio,
    ...opts.details,
  };
  const sto = ({
    details: stoDetailsStub.resolves(details),
    ticker: opts.ticker,
    id: opts.id,
  } as unknown) as MockSto;

  Object.assign(mockInstanceContainer.sto, sto);
  stoConstructorStub.callsFake(args => {
    const value = merge({}, sto, args);
    Object.setPrototypeOf(value, require('~/internal').Sto.prototype);
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
  const checkpoint = ({
    createdAt: checkpointCreatedAtStub.returns(opts.createdAt),
    totalSupply: checkpointTotalSupplyStub.returns(opts.totalSupply),
    ticker: opts.ticker,
    id: opts.id,
    exists: checkpointExistsStub.resolves(opts.exists),
    allBalances: checkpointAllBalancesStub.resolves(allBalances),
  } as unknown) as MockCheckpoint;

  Object.assign(mockInstanceContainer.checkpoint, checkpoint);
  checkpointConstructorStub.callsFake(args => {
    const value = merge({}, checkpoint, args);
    Object.setPrototypeOf(value, require('~/internal').Checkpoint.prototype);
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

  checkpointOptions = merge({}, defaultCheckpointOptions, opts);

  configureCheckpoint(checkpointOptions);
}

/**
 * @hidden
 * Configure the CheckpointSchedule instance
 */
function configureCheckpointSchedule(opts: CheckpointScheduleOptions): void {
  const checkpointSchedule = ({
    id: opts.id,
    ticker: opts.ticker,
    start: opts.start,
    period: opts.period,
    expiryDate: opts.expiryDate,
    complexity: opts.complexity,
    details: checkpointScheduleDetailsStub.resolves(opts.details),
    exists: checkpointScheduleExistsStub.resolves(opts.exists),
  } as unknown) as MockCheckpointSchedule;

  Object.assign(mockInstanceContainer.checkpointSchedule, checkpointSchedule);
  checkpointScheduleConstructorStub.callsFake(args => {
    const value = merge({}, checkpointSchedule, args);
    Object.setPrototypeOf(value, require('~/internal').CheckpointSchedule.prototype);
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
  const corporateAction = ({
    id: opts.id,
    ticker: opts.ticker,
    kind: opts.kind,
    declarationDate: opts.declarationDate,
    description: opts.description,
    targets: opts.targets,
    defaultTaxWithholding: opts.defaultTaxWithholding,
    taxWithholdings: opts.taxWithholdings,
    exists: corporateActionExistsStub.resolves(opts.exists),
  } as unknown) as MockCorporateAction;

  Object.assign(mockInstanceContainer.corporateAction, corporateAction);
  corporateActionConstructorStub.callsFake(args => {
    const value = merge({}, corporateAction, args);
    Object.setPrototypeOf(value, require('~/internal').CorporateAction.prototype);
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
  const dividendDistribution = ({
    id: opts.id,
    ticker: opts.ticker,
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
    details: dividendDistributionDetailsStub.resolves(opts.details),
  } as unknown) as MockDividendDistribution;

  Object.assign(mockInstanceContainer.dividendDistribution, dividendDistribution);
  dividendDistributionConstructorStub.callsFake(args => {
    const value = merge({}, dividendDistribution, args);
    Object.setPrototypeOf(value, require('~/internal').DividendDistribution.prototype);
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

  dividendDistributionOptions = merge({}, defaultDividendDistributionOptions, opts);

  configureDividendDistribution(dividendDistributionOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: {
  identityOptions?: IdentityOptions;
  currentIdentityOptions?: CurrentIdentityOptions;
  accountOptions?: AccountOptions;
  currentAccountOptions?: CurrentAccountOptions;
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
}): void {
  const tempIdentityOptions = { ...defaultIdentityOptions, ...opts?.identityOptions };

  configureIdentity(tempIdentityOptions);

  const tempCurrentIdentityOptions = {
    ...defaultCurrentIdentityOptions,
    ...opts?.currentIdentityOptions,
  };

  configureCurrentIdentity(tempCurrentIdentityOptions);

  const tempAccountOptions = { ...defaultAccountOptions, ...opts?.accountOptions };

  configureAccount(tempAccountOptions);

  const tempCurrentAccountOptions = {
    ...defaultCurrentAccountOptions,
    ...opts?.currentAccountOptions,
  };

  configureCurrentAccount(tempCurrentAccountOptions);

  const tempTickerReservationOptions = {
    ...defaultTickerReservationOptions,
    ...opts?.tickerReservationOptions,
  };

  configureTickerReservation(tempTickerReservationOptions);

  const tempSecuritytokenOptions = merge(
    {},
    defaultSecurityTokenOptions,
    opts?.securityTokenOptions
  );

  configureSecurityToken(tempSecuritytokenOptions);

  const tempAuthorizationRequestOptions = {
    ...defaultAuthorizationRequestOptions,
    ...opts?.authorizationRequestOptions,
  };

  configureAuthorizationRequest(tempAuthorizationRequestOptions);

  // NOTE uncomment in Governance v2 upgrade
  // const tempProposalOptions = {
  //   ...defaultProposalOptions,
  //   ...opts?.proposalOptions,
  // };

  // NOTE uncomment in Governance v2 upgrade
  // configureProposal(tempProposalOptions);

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
export function initMocks(opts?: {
  identityOptions?: IdentityOptions;
  currentIdentityOptions?: CurrentIdentityOptions;
  accountOptions?: AccountOptions;
  currentAccountOptions?: CurrentAccountOptions;
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
}): void {
  // Identity
  initIdentity(opts?.identityOptions);

  // Current Identity
  initCurrentIdentity(opts?.currentIdentityOptions);

  // Account
  initAccount(opts?.accountOptions);

  // Current Account
  initCurrentAccount(opts?.currentAccountOptions);

  // Ticker Reservation
  initTickerReservation(opts?.tickerReservationOptions);

  // Security Token
  initSecurityToken(opts?.securityTokenOptions);

  // Authorization Request
  initAuthorizationRequest(opts?.authorizationRequestOptions);

  // Instruction Request
  initInstruction(opts?.instructionOptions);

  // Proposal
  // NOTE uncomment in Governance v2 upgrade
  // initProposal(opts?.proposalOptions);

  // Venue
  initVenue(opts?.venueOptions);

  // NumberedPortfolio
  initNumberedPortfolio(opts?.numberedPortfolioOptions);

  // DefaultPortfolio
  initDefaultPortfolio(opts?.defaultPortfolioOptions);

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
  mockInstanceContainer.currentIdentity = {} as MockCurrentIdentity;
  mockInstanceContainer.account = {} as MockAccount;
  mockInstanceContainer.currentAccount = {} as MockCurrentAccount;
  mockInstanceContainer.tickerReservation = {} as MockTickerReservation;
  mockInstanceContainer.securityToken = {} as MockSecurityToken;
  mockInstanceContainer.authorizationRequest = {} as MockAuthorizationRequest;
  // NOTE uncomment in Governance v2 upgrade
  // mockInstanceContainer.proposal = {} as MockProposal;
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
    currentIdentityOptions,
    accountOptions,
    currentAccountOptions,
    tickerReservationOptions,
    securityTokenOptions,
    authorizationRequestOptions,
    // NOTE uncomment in Governance v2 upgrade
    // proposalOptions,
    venueOptions,
    instructionOptions,
    numberedPortfolioOptions,
    defaultPortfolioOptions,
    stoOptions,
    checkpointOptions,
    checkpointScheduleOptions,
    corporateActionOptions,
    dividendDistributionOptions,
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
 * Retrieve the stub of the `Identity.hasValidCdd` method
 */
export function getIdentityHasValidCddStub(): SinonStub {
  return identityHasValidCddStub;
}

/**
 * @hidden
 * Retrieve the stub of the `Identity.getPrimaryKey` method
 */
export function getIdentityGetPrimaryKeyStub(): SinonStub {
  return identityGetPrimaryKeyStub;
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
 * Retrieve a Current Identity instance
 */
export function getCurrentIdentityInstance(opts?: CurrentIdentityOptions): MockCurrentIdentity {
  if (opts) {
    configureCurrentIdentity({ ...defaultCurrentIdentityOptions, ...opts });
  }

  return new MockCurrentIdentityClass() as MockCurrentIdentity;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.hasRoles` method
 */
export function getCurrentIdentityHasRolesStub(): SinonStub {
  return currentIdentityHasRolesStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.hasRoles` method
 */
export function getCurrentIdentityHasRoleStub(): SinonStub {
  return currentIdentityHasRoleStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.hasValidCdd` method
 */
export function getCurrentIdentityHasValidCddStub(): SinonStub {
  return currentIdentityHasValidCddStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.getPrimaryKey` method
 */
export function getCurrentIdentityGetPrimaryKeyStub(): SinonStub {
  return currentIdentityGetPrimaryKeyStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.getVenues` method
 */
export function getCurrentIdentityGetVenuesStub(): SinonStub {
  return currentIdentityGetVenuesStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.getScopeId` method
 */
export function getCurrentIdentityGetScopeIdStub(): SinonStub {
  return currentIdentityGetScopeIdStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.authorizations.getReceived` method
 */
export function getCurrentIdentityAuthorizationsGetReceivedStub(): SinonStub {
  return currentIdentityAuthorizationsGetReceivedStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentIdentity.areSecondaryKeysFrozen` method
 */
export function getCurrentIdentityAreSecondaryKeysFrozenStub(): SinonStub {
  return currentIdentityAreSecondaryKeysFrozenStub;
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
 * Retrieve a Current Account instance
 */
export function getCurrentAccountInstance(opts?: CurrentAccountOptions): MockCurrentAccount {
  if (opts) {
    configureCurrentAccount({ ...defaultCurrentAccountOptions, ...opts });
  }

  return new MockCurrentAccountClass() as MockCurrentAccount;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentAccount.getBalance` method
 */
export function getCurrentAccountGetBalanceStub(): SinonStub {
  return currentAccountGetBalanceStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentAccount.getIdentity` method
 */
export function getCurrentAccountGetIdentityStub(): SinonStub {
  return currentAccountGetIdentityStub;
}

/**
 * @hidden
 * Retrieve the stub of the `CurrentAccount.getTransactionHistory` method
 */
export function getCurrentAccountGetTransactionHistoryStub(): SinonStub {
  return currentAccountGetTransactionHistoryStub;
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
 * Retrieve the stub of the `SecurityToken.transferRestictions.count.get` method
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
 * Retrieve the stub of the `SecurityToken.transferRestictions.pecentage.get` method
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
 * Retrieve the stub of the `SecurityToken.corporateActions.getAgent` method
 */
export function getSecurityTokenCorporateActionsGetAgentStub(agent?: Identity): SinonStub {
  if (agent) {
    return securityTokenCorporateActionsGetAgentStub.resolves(agent);
  }

  return securityTokenCorporateActionsGetAgentStub;
}

/**
 * @hidden
 * Retrieve the stub of the `SecurityToken.corporateActions.getDefaults` method
 */
export function getSecurityTokenCorporateActionsGetDefaultsStub(
  defaults?: Partial<CorporateActionDefaults>
): SinonStub {
  if (defaults) {
    return securityTokenCorporateActionsGetDefaultsStub.resolves(defaults);
  }

  return securityTokenCorporateActionsGetDefaultsStub;
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
 * Retrieve a Proposal instance
 */
// NOTE uncomment in Governance v2 upgrade

// export function getProposalInstance(opts?: ProposalOptions): MockProposal {
//   if (opts) {
//     configureProposal(opts);
//   }

//   return mockInstanceContainer.proposal;
// }

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
 * Retrieve the DividendDistribution constructor stub
 */
export function getDividendDistributionConstructorStub(): SinonStub {
  return dividendDistributionConstructorStub;
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
