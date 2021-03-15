import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createCheckpointResolver,
  getAuthorization,
  Params,
  prepareCreateCheckpoint,
} from '~/api/procedures/createCheckpoint';
import { Checkpoint, Context, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Checkpoint',
  require('~/testUtils/mocks/entities').mockCheckpointModule('~/api/entities/Checkpoint')
);
jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('createCheckpoint procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub<[string, Context], Ticker>;
  let ticker: string;
  let rawTicker: Ticker;
  let checkpoint: PostTransactionValue<Checkpoint>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    ticker = 'SOME_TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    checkpoint = ('checkpoint' as unknown) as PostTransactionValue<Checkpoint>;
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([checkpoint]);
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
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

  test('should add a create checkpoint transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, Checkpoint>(mockContext);

    const transaction = dsMockUtils.createTxStub('checkpoint', 'createCheckpoint');

    const result = await prepareCreateCheckpoint.call(proc, {
      ticker,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({ resolvers: sinon.match.array }),
      rawTicker
    );

    expect(result).toBe(checkpoint);
  });

  describe('createCheckpointResolver', () => {
    const findEventRecordStub = sinon.stub(utilsInternalModule, 'findEventRecord');
    const id = new BigNumber(1);

    beforeAll(() => {
      entityMockUtils.initMocks({ checkpointOptions: { ticker, id } });
    });

    beforeEach(() => {
      findEventRecordStub.returns(dsMockUtils.createMockEventRecord(['someDid', ticker, id]));
    });

    afterEach(() => {
      findEventRecordStub.reset();
    });

    test('should return the new Checkpoint', () => {
      const result = createCheckpointResolver(ticker, mockContext)({} as ISubmittableResult);

      expect(result.ticker).toBe(ticker);
      expect(result.id).toEqual(id);
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Checkpoint>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const token = entityMockUtils.getSecurityTokenInstance({ ticker });
      const identityRoles = [{ type: RoleType.TokenOwner, ticker }];

      expect(boundFunc({ ticker })).toEqual({
        identityRoles,
        signerPermissions: {
          transactions: [TxTags.checkpoint.CreateCheckpoint],
          tokens: [token],
          portfolios: [],
        },
      });
    });
  });
});
