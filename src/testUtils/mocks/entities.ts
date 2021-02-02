/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import { ProposalDetails, ProposalStage /*, ProposalState */ } from '~/api/entities/Proposal/types';
import {
  Account,
  AuthorizationRequest,
  CurrentAccount,
  CurrentIdentity,
  DefaultPortfolio,
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
  CountTransferRestriction,
  ExtrinsicData,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  Leg,
  PercentageTransferRestriction,
  PortfolioBalance,
  SecondaryKey,
  SecurityTokenDetails,
  TickerReservationDetails,
  TickerReservationStatus,
  TokenIdentifier,
  TransferStatus,
  VenueDetails,
  VenueType,
  // NOTE uncomment in Governance v2 upgrade
  // TxTags,
} from '~/types';
import { MAX_TRANSFER_MANAGERS } from '~/utils/constants';

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
  getLegs?: Leg[];
}

interface StoOptions {
  id?: BigNumber;
  ticker?: string;
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

let securityTokenDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenIsFrozenStub: SinonStub;
let securityTokenTransfersCanTransferStub: SinonStub;
let securityTokenGetIdentifiersStub: SinonStub;
let securityTokenTransferRestrictionsCountGetStub: SinonStub;
let securityTokenTransferRestrictionsPercentageGetStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let identityHasValidCddStub: SinonStub;
let identityGetPrimaryKeyStub: SinonStub;
let identityAuthorizationsGetReceivedStub: SinonStub;
let identityGetVenuesStub: SinonStub;
let currentIdentityHasRolesStub: SinonStub;
let currentIdentityHasRoleStub: SinonStub;
let currentIdentityHasValidCddStub: SinonStub;
let currentIdentityGetPrimaryKeyStub: SinonStub;
let currentIdentityAuthorizationsGetReceivedStub: SinonStub;
let currentIdentityGetVenuesStub: SinonStub;
let currentIdentityGetSecondaryKeysStub: SinonStub;
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
let numberedPortfolioIsOwnedByStub: SinonStub;
let numberedPortfolioGetTokenBalancesStub: SinonStub;
let numberedPortfolioExistsStub: SinonStub;
let numberedPortfolioGetCustodianStub: SinonStub;
let numberedPortfolioIsCustodiedByStub: SinonStub;
let defaultPortfolioIsOwnedByStub: SinonStub;
let defaultPortfolioGetTokenBalancesStub: SinonStub;
let defaultPortfolioGetCustodianStub: SinonStub;
let defaultPortfolioIsCustodiedByStub: SinonStub;

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

const defaultIdentityOptions: IdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  getPrimaryKey: 'someAddress',
  authorizations: {
    getReceived: [],
  },
  getVenues: [],
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
};
let currentIdentityOptions: CurrentIdentityOptions = defaultCurrentIdentityOptions;
const defaultAccountOptions: AccountOptions = {
  address: 'someAddress',
  key: 'someKey',
  getBalance: {
    free: new BigNumber(100),
    locked: new BigNumber(10),
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
    availableSlots: MAX_TRANSFER_MANAGERS,
  },
  transferRestrictionsPercentageGet: {
    restrictions: [],
    availableSlots: MAX_TRANSFER_MANAGERS,
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
};
let instructionOptions = defaultInstructionOptions;
const defaultStoOptions: StoOptions = {
  ticker: 'SOME_TICKER',
  id: new BigNumber(1),
};
let stoOptions = defaultStoOptions;
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

  identityOptions = { ...defaultIdentityOptions, ...opts };

  configureIdentity(identityOptions);
}

/**
 * @hidden
 * Configure the Instruction instance
 */
function configureInstruction(opts: InstructionOptions): void {
  const details = { venue: mockInstanceContainer.venue, ...opts.details };
  const legs = opts.getLegs || [
    {
      from: mockInstanceContainer.numberedPortfolio,
      to: mockInstanceContainer.numberedPortfolio,
      token: mockInstanceContainer.securityToken,
      amount: new BigNumber(100),
    },
  ];
  const instruction = ({
    details: instructionDetailsStub.resolves(details),
    getLegs: instructionGetLegsStub.resolves(legs),
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
  currentIdentityGetSecondaryKeysStub = sinon.stub();

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
 * Configure the Sto instance
 */
function configureSto(opts: StoOptions): void {
  const sto = ({
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

  stoOptions = { ...defaultStoOptions, ...opts };

  configureSto(stoOptions);
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
    ...defaultStoOptions,
    ...opts?.stoOptions,
  };
  configureSto(tempStoOptions);
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
 * Retrieve the stub of the `CurrentIdentity.authorizations.getReceived` method
 */
export function getCurrentIdentityAuthorizationsGetReceivedStub(): SinonStub {
  return currentIdentityAuthorizationsGetReceivedStub;
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
export function getInstructionGetLegsStub(legs?: Leg[]): SinonStub {
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
 * Retrieve the Sto constructor stub
 */
export function getStoConstructorStub(): SinonStub {
  return stoConstructorStub;
}
