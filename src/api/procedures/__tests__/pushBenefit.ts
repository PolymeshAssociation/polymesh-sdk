import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { getAuthorization, Params, preparePushBenefit } from '~/api/procedures/pushBenefit';
import { Context, DividendDistribution } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('pushBenefit procedure', () => {
  const ticker = 'SOMETICKER';
  const did = 'someDid';
  const id = new BigNumber(1);
  const paymentDate = new Date('10/14/1987');
  const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

  // eslint-disable-next-line @typescript-eslint/camelcase
  const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });

  let distribution: DividendDistribution;

  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub;
  let addBatchTransactionStub: sinon.SinonStub;
  let pushBenefitTransaction: PolymeshTx<unknown[]>;

  let holderPaidStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks({
      dividendDistributionOptions: {
        ticker,
        id,
        paymentDate,
        expiryDate,
      },
    });
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    pushBenefitTransaction = dsMockUtils.createTxStub('capitalDistribution', 'pushBenefit');
    mockContext = dsMockUtils.getContextInstance();
    distribution = entityMockUtils.getDividendDistributionInstance({
      ticker,
      id,
      paymentDate,
      expiryDate,
    });

    holderPaidStub = dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
      returnValue: true,
    });
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

  test('should add a stop sto transaction to the queue', async () => {
    const targets = ['someDid'];
    const identityId = dsMockUtils.createMockIdentityId(targets[0]);

    stringToIdentityIdStub.returns(identityId);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await preparePushBenefit.call(proc, { targets, distribution });
    sinon.assert.calledWith(addBatchTransactionStub, pushBenefitTransaction, {}, [
      [rawCaId, identityId],
    ]);
  });

  test('should throw an error if the Distribution is expired', async () => {
    const targets = ['someDid'];
    const date = new Date(new Date().getTime() + 1000 * 60 * 60);
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate: date,
      expiryDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePushBenefit.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe("The Distribution's benefits date hasn't been reached");
    expect(err.data).toEqual({
      paymentDate: date,
    });
  });

  test('should throw an error if the Distribution is expired', async () => {
    const targets = ['someDid'];
    const date = new Date(new Date().getTime() - 1000);
    distribution = entityMockUtils.getDividendDistributionInstance({
      expiryDate: date,
      paymentDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePushBenefit.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution has already expired');
    expect(err.data).toEqual({
      expiryDate: date,
    });
  });

  test('should throw an error if some of the supplied targets has already claimed their benefits', async () => {
    const dids = ['someDid', 'otherDid'];
    const targets = [dids[0], entityMockUtils.getIdentityInstance({ did: dids[1] })];

    dids.forEach(targetDid =>
      stringToIdentityIdStub
        .withArgs(targetDid)
        .returns(dsMockUtils.createMockIdentityId(targetDid))
    );

    distribution = entityMockUtils.getDividendDistributionInstance({
      expiryDate,
      paymentDate,
    });
    holderPaidStub.resolves(dsMockUtils.createMockBool(true));

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePushBenefit.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Some of the supplied targets has already claimed their benefits');
    expect(err.data.targets[0].did).toEqual(dids[0]);
    expect(err.data.targets[1].did).toEqual(dids[1]);
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc({
        targets: ['someDid'],
        distribution,
      });

      expect(result).toEqual({
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          tokens: [],
          portfolios: [],
          transactions: [TxTags.capitalDistribution.PushBenefit],
        },
      });
    });
  });
});
