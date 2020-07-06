import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { getRequiredRoles, Params, prepareIssueTokens } from '~/api/procedures/issueTokens';
import { Context } from '~/context';
import { IdentityId, Ticker } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TransferStatus } from '~/types';
import * as utilsModule from '~/utils';
import { MAX_DECIMALS } from '~/utils/constants';

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
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if security token is divisible and at least one amount exceeds six decimals', () => {
    const args = {
      issuanceData: [
        {
          identity: 'someDid',
          amount: new BigNumber(100),
        },
        {
          identity: 'anotherDid',
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

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareIssueTokens.call(proc, args)).rejects.toThrow(
      `Issuance amounts cannot have more than ${MAX_DECIMALS} decimals`
    );
  });

  test('should throw an error if security token is not divisible and at least one amount has decimals', () => {
    const args = {
      issuanceData: [
        {
          identity: 'someDid',
          amount: new BigNumber(100),
        },
        {
          identity: 'anotherDid',
          amount: new BigNumber(50.1),
        },
      ],
      ticker,
    };

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    return expect(prepareIssueTokens.call(proc, args)).rejects.toThrow(
      'Cannot issue decimal amounts of an indivisible token'
    );
  });

  test('should throw an error if token supply is bigger than the limit total supply', async () => {
    const args = {
      issuanceData: [
        {
          identity: 'someDid',
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

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareIssueTokens.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`
    );
    expect(error.data).toMatchObject({
      currentSupply: limitTotalSupply,
      supplyLimit: limitTotalSupply,
    });
  });

  test('should throw an error if canMint returns a status different from Success', async () => {
    const transferStatus = TransferStatus.Failure;
    const args = {
      issuanceData: [
        {
          identity: 'someDid',
          amount: new BigNumber(100),
        },
      ],
      ticker,
    };

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        transfersCanMint: transferStatus,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    let error;

    try {
      await prepareIssueTokens.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("You can't issue tokens to some of the supplied identities");
    expect(error.data).toMatchObject({
      failed: [{ did: args.issuanceData[0].identity, transferStatus }],
    });
  });

  test('should add a batch issue transaction to the queue', async () => {
    const args = {
      issuanceData: [
        {
          identity: 'someDid',
          amount: new BigNumber(100),
        },
        {
          identity: 'otherDid',
          amount: new BigNumber(200),
        },
      ],
      ticker,
    };

    const investors: IdentityId[] = [];
    const balances: Balance[] = [];

    const stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    const numberToBalanceStub = sinon.stub(utilsModule, 'numberToBalance');

    args.issuanceData.forEach(({ identity, amount }) => {
      const identityId = dsMockUtils.createMockIdentityId(`${identity}Identity`);
      const balance = dsMockUtils.createMockBalance(amount.toNumber());

      investors.push(identityId);
      balances.push(balance);

      stringToIdentityIdStub.withArgs(identity, mockContext).returns(identityId);
      numberToBalanceStub.withArgs(amount, mockContext).returns(balance);
    });

    const transaction = dsMockUtils.createTxStub('asset', 'batchIssue');
    const proc = procedureMockUtils.getInstance<Params, SecurityToken>(mockContext);

    const result = await prepareIssueTokens.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      { batchSize: args.issuanceData.length },
      rawTicker,
      investors,
      balances
    );
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
