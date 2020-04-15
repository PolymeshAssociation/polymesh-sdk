import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import {
  getRequiredRoles,
  Params,
  prepareSetIssuancesData,
} from '~/api/procedures/setIssuancesData';
import { Context } from '~/context';
import { Ticker } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('setIssuancesData procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    polkadotMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = polkadotMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = polkadotMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test('should throw an error if security token is divisible and at least one balance exceeds six decimals', () => {
    const args = {
      issuances: [
        {
          did: 'someDid',
          balance: new BigNumber(100),
        },
        {
          did: 'anotherDid',
          balance: new BigNumber(50.1234567),
        },
      ],
      ticker,
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          isDivisible: true,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetIssuancesData.call(proc, args)).rejects.toThrow(
      'At most one balance exceeds the six decimals limit'
    );
  });

  test('should throw an error if security token is not divisible and at least one balance has decimals', () => {
    const args = {
      issuances: [
        {
          did: 'someDid',
          balance: new BigNumber(100),
        },
        {
          did: 'anotherDid',
          balance: new BigNumber(50.1),
        },
      ],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetIssuancesData.call(proc, args)).rejects.toThrow(
      'At most one balance has decimals'
    );
  });

  test('should throw an error if token supply is bigger than the limit total supply', () => {
    const args = {
      issuances: [
        {
          did: 'someDid',
          balance: new BigNumber(100),
        },
      ],
      ticker,
    };

    const limitTotalSupply = new BigNumber(Math.pow(10, 12));

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        details: {
          totalSupply: limitTotalSupply,
        },
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareSetIssuancesData.call(proc, args)).rejects.toThrow(
      `The total supply for "${ticker}" cannot be bigger than ${limitTotalSupply.toString()}`
    );
  });

  test('should add a batch issue transaction to the queue', async () => {
    const balanceOne = 100;
    const balanceTwo = 200;
    const args = {
      issuances: [
        {
          did: 'someDid',
          balance: new BigNumber(balanceOne),
        },
        {
          did: 'otherDid',
          balance: new BigNumber(balanceTwo),
        },
      ],
      ticker,
    };

    const someIdentityId = 'someIdentityId';
    const otherIdentityId = 'otherIdentityId';

    const investors = [
      polkadotMockUtils.createMockIdentityId(someIdentityId),
      polkadotMockUtils.createMockIdentityId(otherIdentityId),
    ];
    const balances = [
      polkadotMockUtils.createMockBalance(balanceOne),
      polkadotMockUtils.createMockBalance(balanceTwo),
    ];

    const stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    const numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');

    stringToIdentityIdStub.withArgs(args.issuances[0].did, mockContext).returns(investors[0]);
    stringToIdentityIdStub.withArgs(args.issuances[1].did, mockContext).returns(investors[1]);
    numberToBalanceStub.withArgs(args.issuances[0].balance, mockContext).returns(balances[0]);
    numberToBalanceStub.withArgs(args.issuances[1].balance, mockContext).returns(balances[1]);

    const transaction = polkadotMockUtils.createTxStub('asset', 'batchIssue');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareSetIssuancesData.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawTicker, investors, balances);
    expect(result.ticker).toBe(ticker);
  });
});

describe('getRequiredRoles', () => {
  test('should return a token owner role', () => {
    const ticker = 'someTicker';
    const args = {
      ticker,
    } as Params;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.TokenOwner, ticker }]);
  });
});
