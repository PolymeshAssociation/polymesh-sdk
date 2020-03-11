/* istanbul ignore file */

import BigNumber from 'bignumber.js';
import sinon, { SinonStub } from 'sinon';

import { Identity, SecurityToken, TickerReservation } from '~/api/entities';
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
}

interface TickerReservationOptions {
  ticker?: string;
  details?: TickerReservationDetails;
}

interface SecurityTokenOptions {
  ticker?: string;
}

let identityConstructorStub: SinonStub;
let tickerReservationConstructorStub: SinonStub;
let securityTokenConstructorStub: SinonStub;

let identityGetPolyXBalanceStub: SinonStub;
let tickerReservationDetailsStub: SinonStub;

const MockIdentityClass = class {
  /**
   * @hidden
   */
  constructor() {
    return identityConstructorStub();
  }
};

const MockTickerReservationClass = class {
  /**
   * @hidden
   */
  constructor() {
    return tickerReservationConstructorStub();
  }
};

const MockSecurityTokenClass = class {
  /**
   * @hidden
   */
  constructor() {
    return securityTokenConstructorStub();
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
};
let securityTokenOptions = defaultSecurityTokenOptions;

/**
 * @hidden
 * Initialize the Security Token instance
 */
function initSecurityToken(opts: SecurityTokenOptions): void {
  securityTokenConstructorStub = sinon.stub();

  const securityToken = ({
    ticker: opts.ticker,
  } as unknown) as MockSecurityToken;

  mockInstanceContainer.securityToken = securityToken;
  securityTokenConstructorStub.returns(securityToken);
}

/**
 * @hidden
 * Initialize the Ticker Reservation instance
 */
function initTickerReservation(opts: TickerReservationOptions): void {
  tickerReservationConstructorStub = sinon.stub();
  tickerReservationDetailsStub = sinon.stub();

  const tickerReservation = ({
    ticker: opts.ticker,
    details: tickerReservationDetailsStub.resolves(opts.details),
  } as unknown) as MockTickerReservation;

  mockInstanceContainer.tickerReservation = tickerReservation;
  tickerReservationConstructorStub.returns(tickerReservation);
}

/**
 * @hidden
 * Initialize the Identity instance
 */
function initIdentity(opts: IdentityOptions): void {
  identityConstructorStub = sinon.stub();
  identityGetPolyXBalanceStub = sinon.stub();

  const identity = ({
    did: opts.did,
    getPolyXBalance: identityGetPolyXBalanceStub.resolves(opts.getPolyXBalance),
  } as unknown) as MockIdentity;

  mockInstanceContainer.identity = identity;
  identityConstructorStub.returns(identity);
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
  identityOptions = { ...defaultIdentityOptions, ...opts?.identityOptions };
  initIdentity(identityOptions);

  // Ticker Reservation
  tickerReservationOptions = {
    ...defaultTickerReservationOptions,
    ...opts?.tickerReservationOptions,
  };
  initTickerReservation(tickerReservationOptions);

  // Security Token
  securityTokenOptions = { ...defaultSecurityTokenOptions, ...opts?.securityTokenOptions };
  initSecurityToken(securityTokenOptions);
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
  initMocks({ identityOptions });
}

/**
 * @hidden
 * Retrieve an Identity instance
 */
export function getIdentityInstance(): MockIdentity {
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
 * Retrieve an Identity instance
 */
export function getTickerReservationInstance(): MockTickerReservation {
  return mockInstanceContainer.tickerReservation;
}

/**
 * @hidden
 * Retrieve the stub of the `TickerReservation.details` method
 */
export function getTickerReservationDetailsStub(): SinonStub {
  return tickerReservationDetailsStub;
}
