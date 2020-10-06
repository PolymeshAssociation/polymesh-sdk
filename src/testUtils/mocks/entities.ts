/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import {
  Account,
  AuthorizationRequest,
  CurrentAccount,
  CurrentIdentity,
  Identity,
  // NOTE uncomment in Governance v2 upgrade
  // Proposal,
  SecurityToken,
  TickerReservation,
} from '~/api/entities';
import { ProposalDetails, ProposalStage /*, ProposalState */ } from '~/api/entities/Proposal/types';
import { Mocked } from '~/testUtils/types';
import {
  AccountBalance,
  Authorization,
  AuthorizationType,
  ExtrinsicData,
  SecondaryKey,
  SecurityTokenDetails,
  TickerReservationDetails,
  TickerReservationStatus,
  TransferStatus,
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

interface IdentityOptions {
  did?: string;
  hasRoles?: boolean;
  hasRole?: boolean;
  hasValidCdd?: boolean;
  getPrimaryKey?: string;
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
}

interface AuthorizationRequestOptions {
  targetDid?: string;
  issuerDid?: string;
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
  getIdentity?: Identity;
  getTransactionHistory?: ExtrinsicData[];
}

interface CurrentAccountOptions extends AccountOptions {
  getIdentity?: CurrentIdentity;
}

let identityConstructorStub: SinonStub;
let currentIdentityConstructorStub: SinonStub;
let accountConstructorStub: SinonStub;
let currentAccountConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;
let authorizationRequestConstructorStub: SinonStub;
let proposalConstructorStub: SinonStub;

let securityTokenDetailsStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let identityHasValidCddStub: SinonStub;
let identityGetPrimaryKeyStub: SinonStub;
let currentIdentityHasRolesStub: SinonStub;
let currentIdentityHasRoleStub: SinonStub;
let currentIdentityHasValidCddStub: SinonStub;
let currentIdentityGetPrimaryKeyStub: SinonStub;
let currentIdentityGetSecondaryKeysStub: SinonStub;
let accountGetBalanceStub: SinonStub;
let accountGetIdentityStub: SinonStub;
let accountGetTransactionHistoryStub: SinonStub;
let currentAccountGetBalanceStub: SinonStub;
let currentAccountGetIdentityStub: SinonStub;
let currentAccountGetTransactionHistoryStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenIsFrozenStub: SinonStub;
let securityTokenTransfersCanTransferStub: SinonStub;

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

const defaultIdentityOptions: IdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  getPrimaryKey: 'someAddress',
};
let identityOptions: IdentityOptions = defaultIdentityOptions;
const defaultCurrentIdentityOptions: CurrentIdentityOptions = {
  did: 'someDid',
  hasValidCdd: true,
  getPrimaryKey: 'someAddress',
  getSecondaryKeys: [],
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
};
let securityTokenOptions = defaultSecurityTokenOptions;
const defaultAuthorizationRequestOptions: AuthorizationRequestOptions = {
  targetDid: 'targetDid',
  issuerDid: 'issuerDid',
  data: { type: AuthorizationType.TransferAssetOwnership, value: 'UNWANTED_TOKEN' },
  expiry: null,
};
let authorizationRequestOptions = defaultAuthorizationRequestOptions;
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
function configureAuthorizationRequest(opts: AuthorizationRequestOptions): void {
  const authorizationRequest = ({
    targetDid: opts.targetDid,
    issuerDid: opts.issuerDid,
    expiry: opts.expiry,
    data: opts.data,
  } as unknown) as MockAuthorizationRequest;

  Object.assign(mockInstanceContainer.authorizationRequest, authorizationRequest);
  authorizationRequestConstructorStub.callsFake(args => {
    return merge({}, authorizationRequest, args);
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
  } as unknown) as MockSecurityToken;

  Object.assign(mockInstanceContainer.securityToken, securityToken);
  securityTokenConstructorStub.callsFake(args => {
    return merge({}, securityToken, args);
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
    return merge({}, tickerReservation, args);
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
  } as unknown) as MockIdentity;

  Object.assign(mockInstanceContainer.identity, identity);
  identityConstructorStub.callsFake(args => {
    return merge({}, identity, args);
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

  identityOptions = { ...defaultIdentityOptions, ...opts };

  configureIdentity(identityOptions);
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
  } as unknown) as MockIdentity;

  Object.assign(mockInstanceContainer.currentIdentity, identity);
  currentIdentityConstructorStub.callsFake(args => {
    return merge({}, identity, args);
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
      opts.getIdentity || mockInstanceContainer.identity
    ),
    getTransactionHistory: accountGetTransactionHistoryStub.resolves(opts.getTransactionHistory),
  } as unknown) as MockAccount;

  Object.assign(mockInstanceContainer.account, account);
  accountConstructorStub.callsFake(args => {
    return merge({}, account, args);
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
      opts.getIdentity || mockInstanceContainer.currentIdentity
    ),
    getTransactionHistory: currentAccountGetTransactionHistoryStub.resolves(
      opts.getTransactionHistory
    ),
  } as unknown) as MockAccount;

  Object.assign(mockInstanceContainer.currentAccount, account);
  currentAccountConstructorStub.callsFake(args => {
    return merge({}, account, args);
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

  // Proposal
  // NOTE uncomment in Governance v2 upgrade
  // initProposal(opts?.proposalOptions);
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
  });
}

/**
 * @hidden
 * Retrieve an Identity instance
 */
export function getIdentityInstance(opts?: IdentityOptions): MockIdentity {
  if (opts) {
    configureIdentity(opts);
  }

  return mockInstanceContainer.identity;
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
 * Retrieve a Current Identity instance
 */
export function getCurrentIdentityInstance(opts?: CurrentIdentityOptions): MockCurrentIdentity {
  if (opts) {
    configureCurrentIdentity(opts);
  }

  return mockInstanceContainer.currentIdentity;
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
 * Retrieve an Account instance
 */
export function getAccountInstance(opts?: AccountOptions): MockAccount {
  if (opts) {
    configureAccount(opts);
  }

  return mockInstanceContainer.account;
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
    configureCurrentAccount(opts);
  }

  return mockInstanceContainer.currentAccount;
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
 * Retrieve a Ticker Reservation instance
 */
export function getTickerReservationInstance(
  opts?: TickerReservationOptions
): MockTickerReservation {
  if (opts) {
    configureTickerReservation(opts);
  }

  return mockInstanceContainer.tickerReservation;
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
    configureSecurityToken(opts);
  }

  return mockInstanceContainer.securityToken;
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
 * Retrieve an Authorization Request instance
 */
export function getAuthorizationRequestInstance(
  opts?: AuthorizationRequestOptions
): MockAuthorizationRequest {
  if (opts) {
    configureAuthorizationRequest(opts);
  }

  return mockInstanceContainer.authorizationRequest;
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
