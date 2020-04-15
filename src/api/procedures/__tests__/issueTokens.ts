import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { getRequiredRoles, Params, prepareIssueTokens } from '~/api/procedures/issueTokens';
import { Context } from '~/context';
import { IdentityId, Ticker } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsModule from '~/utils';
import { MAX_DECIMALS, MAX_TOKEN_AMOUNT } from '~/utils/constants';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('issueTokens procedure', () => {
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

  test('should throw an error if security token is divisible and at least one amount exceeds six decimals', () => {
    const args = {
      issuanceData: [
        {
          did: 'someDid',
          amount: new BigNumber(100),
        },
        {
          did: 'anotherDid',
          amount: new BigNumber(50.1234567),
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

    return expect(prepareIssueTokens.call(proc, args)).rejects.toThrow(
      `Issuance amounts cannot have more than ${MAX_DECIMALS} decimals`
    );
  });

  test('should throw an error if security token is not divisible and at least one amount has decimals', () => {
    const args = {
      issuanceData: [
        {
          did: 'someDid',
          amount: new BigNumber(100),
        },
        {
          did: 'anotherDid',
          amount: new BigNumber(50.1),
        },
      ],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    return expect(prepareIssueTokens.call(proc, args)).rejects.toThrow(
      'Cannot issue decimal amounts of an indivisible token'
    );
  });

  test('should throw an error if token supply is bigger than the limit total supply', () => {
    const args = {
      issuanceData: [
        {
          did: 'someDid',
          amount: new BigNumber(100),
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

    return expect(prepareIssueTokens.call(proc, args)).rejects.toThrow(
      `This issuance operation will cause the total supply of "${ticker}" to exceed the maximum allowed (${MAX_TOKEN_AMOUNT.toFormat()})`
    );
  });

  test('should add a batch issue transaction to the queue', async () => {
    const args = {
      issuanceData: [
        {
          did: 'someDid',
          amount: new BigNumber(100),
        },
        {
          did: 'otherDid',
          amount: new BigNumber(200),
        },
      ],
      ticker,
    };

    const investors: IdentityId[] = [];
    const balances: Balance[] = [];

    const stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    const numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');

    args.issuanceData.forEach(data => {
      const identityId = polkadotMockUtils.createMockIdentityId(`${data.did}Identity`);
      const balance = polkadotMockUtils.createMockBalance(data.amount.toNumber());

      investors.push(identityId);
      balances.push(balance);

      stringToIdentityIdStub.withArgs(data.did, mockContext).returns(identityId);
      numberToBalanceStub.withArgs(data.amount, mockContext).returns(balance);
    });

    const transaction = polkadotMockUtils.createTxStub('asset', 'batchIssue');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>();
    proc.context = mockContext;

    const result = await prepareIssueTokens.call(proc, args);

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
