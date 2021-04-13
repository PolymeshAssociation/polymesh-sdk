import BigNumber from 'bignumber.js';
import { TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyRecordDate,
} from '~/api/procedures/modifyRecordDate';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifyRecordDate procedure', () => {
  const ticker = 'SOMETICKER';

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let changeRecordDateTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    changeRecordDateTransaction = dsMockUtils.createTxStub('corporateAction', 'changeRecordDate');
    mockContext = dsMockUtils.getContextInstance();
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

  test('should throw an error if the distribution payment has started', async () => {
    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        paymentDate: new Date('10/14/1987'),
      }),
      recordDate: new Date(),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyRecordDate.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution payment has started');
    expect(err.data).toEqual({
      paymentDate: new Date('10/14/1987'),
    });
  });

  test('should throw an error if the distribution record date must be before the Payment date', async () => {
    const paymentDate = new Date('11/11/2021');

    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        paymentDate,
      }),
      recordDate: new Date('12/12/2021'),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyRecordDate.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution record date must be before the Payment date');
    expect(err.data).toEqual({
      paymentDate,
    });
  });

  test('should throw an error if the distribution has already expired', async () => {
    const expiryDate = new Date('1/1/2020');
    const paymentDate = new Date('11/11/2021');

    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        expiryDate,
        paymentDate,
      }),
      recordDate: new Date('10/10/2021'),
    };

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareModifyRecordDate.call(proc, args);
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution has already expired');
    expect(err.data).toEqual({
      expiryDate,
    });
  });

  test('should add a change record date transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const id = new BigNumber(1);

    const args = {
      distribution: entityMockUtils.getDividendDistributionInstance({
        id,
        paymentDate: new Date('10/10/2021'),
        expiryDate: new Date('10/10/2022'),
      }),
      recordDate: new Date('2/2/2021'),
    };

    // eslint-disable-next-line @typescript-eslint/camelcase
    const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);

    const rawRecordDateSpec = dsMockUtils.createMockRecordDateSpec({
      Scheduled: dsMockUtils.createMockMoment(new Date().getTime()),
    });

    sinon.stub(utilsConversionModule, 'checkpointToRecordDateSpec').returns(rawRecordDateSpec);

    await prepareModifyRecordDate.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      changeRecordDateTransaction,
      {},
      rawCaId,
      rawRecordDateSpec
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        distribution: {
          ticker,
        },
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          tokens: [],
          transactions: [TxTags.corporateAction.ChangeRecordDate],
          portfolios: [],
        },
      });
    });
  });
});
