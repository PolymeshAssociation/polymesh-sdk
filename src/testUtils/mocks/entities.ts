/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import { merge } from 'lodash';
import sinon, { SinonStub } from 'sinon';

import { Identity, SecurityToken, TickerReservation } from '~/api/entities';
import { SecurityTokenDetails } from '~/api/entities/SecurityToken/types';
import { Mocked } from '~/testUtils/types';
import { TickerReservationDetails, TickerReservationStatus } from '~/types';

const mockInstanceContainer = {
  identity: {} as MockIdentity,
  tickerReservation: {} as MockTickerReservation,
  securityToken: {} as MockSecurityToken,
};

type MockIdentity = Mocked<Identity>;
type MockTickerReservation = Mocked<TickerReservation>;
type MockSecurityToken = Mocked<SecurityToken>;

interface IdentityOptions {
  did?: string;
  getPolyXBalance?: BigNumber;
  hasRoles?: boolean;
  hasRole?: boolean;
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
}

let identityConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;

let securityTokenDetailsStub: SinonStub;
let identityGetPolyXBalanceStub: SinonStub;
let identityHasRolesStub: SinonStub;
let identityHasRoleStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;
let securityTokenCurrentFundingRoundStub: SinonStub;
let securityTokenTransfersAreFrozenStub: SinonStub;

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

const defaultIdentityOptions: IdentityOptions = {
  did: 'someDid',
  getPolyXBalance: new BigNumber(100),
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
};
let securityTokenOptions = defaultSecurityTokenOptions;

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
}): void {
  // Identity
  initIdentity(opts?.identityOptions);

  // Ticker Reservation
  initTickerReservation(opts?.tickerReservationOptions);

  // Security Token
  initSecurityToken(opts?.securityTokenOptions);
}

/**
 * @hidden
 * Restore instances to their original state
 */
export function cleanup(): void {
  mockInstanceContainer.identity = {} as MockIdentity;
  mockInstanceContainer.tickerReservation = {} as MockTickerReservation;
  mockInstanceContainer.securityToken = {} as MockSecurityToken;
}

/**
 * @hidden
 * Reinitialize mocks
 */
export function reset(): void {
  cleanup();
  initMocks({ identityOptions, tickerReservationOptions, securityTokenOptions });
}

/**
 * @hidden
 * Retrieve an Identity instance
 */
export function getIdentityInstance(opts?: IdentityOptions): MockIdentity {
  if (opts) {
    initIdentity(opts);
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
 * Retrieve a Ticker Reservation instance
 */
export function getTickerReservationInstance(
  opts: TickerReservationOptions
): MockTickerReservation {
  if (opts) {
    initTickerReservation(opts);
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
    initSecurityToken(opts);
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
export function getSecurityTokenTransfersAreFrozenStub(frozen: boolean): SinonStub {
  if (frozen) {
    return securityTokenTransfersAreFrozenStub.resolves(frozen);
  }

  return securityTokenTransfersAreFrozenStub;
}
