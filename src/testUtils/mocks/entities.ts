/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import {
  AuthorizationRequest,
  Identity,
  Proposal,
  SecurityToken,
  TickerReservation,
} from '~/api/entities';
import { ProposalDetails, ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
import { Mocked } from '~/testUtils/types';
import {
  Authorization,
  AuthorizationType,
  SecurityTokenDetails,
  TickerReservationDetails,
  TickerReservationStatus,
  TransferStatus,
  TxTags,
} from '~/types';

const mockInstanceContainer = {
  identity: {} as MockIdentity,
  tickerReservation: {} as MockTickerReservation,
  securityToken: {} as MockSecurityToken,
  authorizationRequest: {} as MockAuthorizationRequest,
  proposal: {} as MockProposal,
};

type MockIdentity = Mocked<Identity>;
type MockTickerReservation = Mocked<TickerReservation>;
type MockSecurityToken = Mocked<SecurityToken>;
type MockAuthorizationRequest = Mocked<AuthorizationRequest>;
type MockProposal = Mocked<Proposal>;

interface IdentityOptions {
  did?: string;
  getPolyXBalance?: BigNumber;
  hasRoles?: boolean;
  hasRole?: boolean;
  hasValidCdd?: boolean;
  getMasterKey?: string;
}

interface TickerReservationOptions {
  ticker?: string;
  details?: TickerReservationDetails;
}

interface SecurityTokenOptions {
  ticker?: string;
  details?: Partial<SecurityTokenDetails>;
  currentFundingRound?: string;
  transfersAreFrozen?: boolean;
  transfersCanTransfer?: TransferStatus;
  transfersCanMint?: TransferStatus;
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

let identityConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;
let authorizationRequestConstructorStub: SinonStub;
let proposalConstructorStub: SinonStub;

let securityTokenDetailsStub: SinonStub;
let identityGetPolyXBalanceStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let identityHasValidCddStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenTransfersAreFrozenStub: SinonStub;
let securityTokenTransfersCanTransferStub: SinonStub;
let securityTokenTransfersCanMintStub: SinonStub;
let identityGetMasterKeyStub: SinonStub;

const MockIdentityClass = class {
  /**
   * @hidden
   */
  constructor(...args: unknown[]) {
    return identityConstructorStub(...args);
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
  getPolyXBalance: new BigNumber(100),
  hasValidCdd: true,
  getMasterKey: 'someAccountId',
};
let identityOptions: IdentityOptions = defaultIdentityOptions;
const defaultTickerReservationOptions: TickerReservationOptions = {
  ticker: 'SOME_TICKER',
  details: {
    owner: mockInstanceContainer.identity,
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
    owner: mockInstanceContainer.identity,
  },
  currentFundingRound: 'Series A',
  transfersAreFrozen: false,
  transfersCanTransfer: TransferStatus.Success,
  transfersCanMint: TransferStatus.Success,
};
let securityTokenOptions = defaultSecurityTokenOptions;
const defaultAuthorizationRequestOptions: AuthorizationRequestOptions = {
  targetDid: 'targetDid',
  issuerDid: 'issuerDid',
  data: { type: AuthorizationType.TransferAssetOwnership, value: 'UNWANTED_TOKEN' },
  expiry: null,
};
let authorizationRequestOptions = defaultAuthorizationRequestOptions;
const defaultProposalOptions: ProposalOptions = {
  pipId: new BigNumber(1),
  getDetails: {
    lastState: ProposalState.Referendum,
    transaction: TxTags.treasury.Disbursement,
  } as ProposalDetails,
  getStage: ProposalStage.Open,
  identityHasVoted: false,
};
let proposalOptions = defaultProposalOptions;

/**
 * @hidden
 * Configure the Proposal instance
 */
function configureProposal(opts: ProposalOptions): void {
  const proposal = ({
    pipId: opts.pipId,
    getDetails: sinon.stub().returns(opts.getDetails),
    getStage: sinon.stub().returns(opts.getStage),
    identityHasVoted: sinon.stub().returns(opts.identityHasVoted),
  } as unknown) as MockProposal;

  Object.assign(mockInstanceContainer.proposal, proposal);
  proposalConstructorStub.callsFake(args => {
    return merge({}, proposal, args);
  });
}

/**
 * @hidden
 * Initialize the Proposal instance
 */
function initProposal(opts?: ProposalOptions): void {
  proposalConstructorStub = sinon.stub();

  proposalOptions = { ...defaultProposalOptions, ...opts };

  configureProposal(proposalOptions);
}

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
  const securityToken = ({
    ticker: opts.ticker,
    details: securityTokenDetailsStub.resolves(opts.details),
    currentFundingRound: securityTokenCurrentFundingRoundStub.resolves(opts.currentFundingRound),
    transfers: {
      areFrozen: securityTokenTransfersAreFrozenStub.resolves(opts.transfersAreFrozen),
      canTransfer: securityTokenTransfersCanTransferStub.resolves(opts.transfersCanTransfer),
      canMint: securityTokenTransfersCanMintStub.resolves(opts.transfersCanMint),
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
  securityTokenTransfersAreFrozenStub = sinon.stub();
  securityTokenTransfersCanTransferStub = sinon.stub();
  securityTokenTransfersCanMintStub = sinon.stub();

  securityTokenOptions = merge({}, defaultSecurityTokenOptions, opts);

  configureSecurityToken(securityTokenOptions);
}

/**
 * @hidden
 * Configure the Ticker Reservation instance
 */
function configureTickerReservation(opts: TickerReservationOptions): void {
  const tickerReservation = ({
    ticker: opts.ticker,
    details: tickerReservationDetailsStub.resolves(opts.details),
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
    getPolyXBalance: identityGetPolyXBalanceStub.resolves(opts.getPolyXBalance),
    hasRoles: identityHasRolesStub.resolves(opts.hasRoles),
    hasRole: identityHasRoleStub.resolves(opts.hasRole),
    hasValidCdd: identityHasValidCddStub.resolves(opts.hasValidCdd),
    getMasterKey: identityGetMasterKeyStub.resolves(opts.getMasterKey),
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
  identityGetPolyXBalanceStub = sinon.stub();
  identityHasRolesStub = sinon.stub();
  identityHasRoleStub = sinon.stub();
  identityHasValidCddStub = sinon.stub();
  identityGetMasterKeyStub = sinon.stub();

  identityOptions = { ...defaultIdentityOptions, ...opts };

  configureIdentity(identityOptions);
}

/**
 * @hidden
 *
 * Temporarily change instance mock configuration (calling .reset will go back to the configuration passed in `initMocks`)
 */
export function configureMocks(opts?: {
  identityOptions?: IdentityOptions;
  tickerReservationOptions?: TickerReservationOptions;
  securityTokenOptions?: SecurityTokenOptions;
  authorizationRequestOptions?: AuthorizationRequestOptions;
  proposalOptions?: ProposalOptions;
}): void {
  const tempIdentityOptions = { ...defaultIdentityOptions, ...opts?.identityOptions };

  configureIdentity(tempIdentityOptions);

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

  const tempProposalOptions = {
    ...defaultProposalOptions,
    ...opts?.proposalOptions,
  };

  configureProposal(tempProposalOptions);
}

/**
 * @hidden
 *
 * Initialize the factory by adding default all-purpose functionality to the mock manager
 */
export function initMocks(opts?: {
  identityOptions?: IdentityOptions;
  tickerReservationOptions?: TickerReservationOptions;
  securityTokenOptions?: SecurityTokenOptions;
  authorizationRequestOptions?: AuthorizationRequestOptions;
  proposalOptions?: ProposalOptions;
}): void {
  // Identity
  initIdentity(opts?.identityOptions);

  // Ticker Reservation
  initTickerReservation(opts?.tickerReservationOptions);

  // Security Token
  initSecurityToken(opts?.securityTokenOptions);

  // Authorization Request
  initAuthorizationRequest(opts?.authorizationRequestOptions);

  // Proposal
  initProposal(opts?.proposalOptions);
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.identity = {} as MockIdentity;
  mockInstanceContainer.tickerReservation = {} as MockTickerReservation;
  mockInstanceContainer.securityToken = {} as MockSecurityToken;
  mockInstanceContainer.authorizationRequest = {} as MockAuthorizationRequest;
  mockInstanceContainer.proposal = {} as MockProposal;
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();
  initMocks({
    identityOptions,
    tickerReservationOptions,
    securityTokenOptions,
    authorizationRequestOptions,
    proposalOptions,
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
 * Retrieve the stub of the `Identity.getPolyXBalance` method
 */
export function getIdentityGetPolyXBalanceStub(): SinonStub {
  return identityGetPolyXBalanceStub;
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
 * Retrieve the stub of the `Identity.getMasterKey` method
 */
export function getIdentityGetMasterKeyStub(): SinonStub {
  return identityGetMasterKeyStub;
}

/**
 * @hidden
 * Retrieve a Ticker Reservation instance
 */
export function getTickerReservationInstance(
  opts: TickerReservationOptions
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
 * Retrieve the stub of the `SecurityToken.Transfers.areFrozen` method
 */
export function getSecurityTokenTransfersAreFrozenStub(frozen?: boolean): SinonStub {
  if (frozen !== undefined) {
    return securityTokenTransfersAreFrozenStub.resolves(frozen);
  }

  return securityTokenTransfersAreFrozenStub;
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
 * Retrieve the stub of the `SecurityToken.Transfers.canMint` method
 */
export function getSecurityTokenTransfersCanMintStub(status?: TransferStatus): SinonStub {
  if (status) {
    return securityTokenTransfersCanMintStub.resolves(status);
  }

  return securityTokenTransfersCanMintStub;
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
export function getProposalInstance(opts?: ProposalOptions): MockProposal {
  if (opts) {
    configureProposal(opts);
  }

  return mockInstanceContainer.proposal;
}
