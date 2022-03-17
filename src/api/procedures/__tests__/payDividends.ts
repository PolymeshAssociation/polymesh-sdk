import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { getAuthorization, Params, preparePayDividends } from '~/api/procedures/payDividends';
import { Context, DividendDistribution } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TargetTreatment, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('payDividends procedure', () => {
  const ticker = 'SOME_TICKER';
  const did = 'someDid';
  const id = new BigNumber(1);
  const paymentDate = new Date('10/14/1987');
  const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id });

  let distribution: DividendDistribution;

  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub;
  let addBatchTransactionStub: sinon.SinonStub;
  let payDividendsTransaction: PolymeshTx<unknown[]>;

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
    payDividendsTransaction = dsMockUtils.createTxStub('capitalDistribution', 'pushBenefit');
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add a stop Offering transaction to the queue', async () => {
    const targets = ['someDid'];
    const identityId = dsMockUtils.createMockIdentityId(targets[0]);

    dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
      multi: [dsMockUtils.createMockBool(false)],
    });

    distribution = entityMockUtils.getDividendDistributionInstance({
      targets: {
        identities: targets.map(identityDid =>
          entityMockUtils.getIdentityInstance({ did: identityDid })
        ),
        treatment: TargetTreatment.Include,
      },
      ticker,
      id,
      paymentDate,
      expiryDate,
    });

    stringToIdentityIdStub.returns(identityId);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await preparePayDividends.call(proc, { targets, distribution });
    sinon.assert.calledWith(addBatchTransactionStub, {
      transactions: [{ transaction: payDividendsTransaction, args: [rawCaId, identityId] }],
    });
  });

  it('should throw an error if the Distribution is expired', async () => {
    const targets = ['someDid'];
    const date = new Date(new Date().getTime() + 1000 * 60 * 60);
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate: date,
      expiryDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePayDividends.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe("The Distribution's payment date hasn't been reached");
    expect(err.data).toEqual({
      paymentDate: date,
    });
  });

  it('should throw an error if the Distribution is expired', async () => {
    const targets = ['someDid'];
    const date = new Date(new Date().getTime() - 1000);
    distribution = entityMockUtils.getDividendDistributionInstance({
      expiryDate: date,
      paymentDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePayDividends.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution has already expired');
    expect(err.data).toEqual({
      expiryDate: date,
    });
  });

  it('should throw an error if some of the supplied targets are not included in the Distribution', async () => {
    const excludedDid = 'someDid';

    dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
      multi: [dsMockUtils.createMockBool(true)],
    });

    distribution = entityMockUtils.getDividendDistributionInstance({
      targets: {
        identities: [entityMockUtils.getIdentityInstance({ isEqual: false, did: 'otherDid' })],
        treatment: TargetTreatment.Include,
      },
      paymentDate,
      expiryDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePayDividends.call(proc, { targets: [excludedDid], distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Some of the supplied Identities are not included in this Distribution'
    );
    expect(err.data.excluded[0].did).toBe(excludedDid);
  });

  it('should throw an error if some of the supplied targets has already claimed their benefits', async () => {
    const dids = ['someDid', 'otherDid'];
    const targets = [dids[0], entityMockUtils.getIdentityInstance({ isEqual: true, did: dids[1] })];

    dsMockUtils.createQueryStub('capitalDistribution', 'holderPaid', {
      multi: [dsMockUtils.createMockBool(true)],
    });

    dids.forEach(targetDid =>
      stringToIdentityIdStub
        .withArgs(targetDid)
        .returns(dsMockUtils.createMockIdentityId(targetDid))
    );

    distribution = entityMockUtils.getDividendDistributionInstance({
      targets: {
        identities: dids.map(identityDid =>
          entityMockUtils.getIdentityInstance({ isEqual: true, did: identityDid })
        ),
        treatment: TargetTreatment.Include,
      },
      expiryDate,
      paymentDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await preparePayDividends.call(proc, { targets, distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe(
      'Some of the supplied Identities have already either been paid or claimed their share of the Distribution'
    );
    expect(err.data.targets[0].did).toEqual(dids[0]);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      distribution = entityMockUtils.getDividendDistributionInstance({
        ticker,
      });

      const result = await boundFunc();

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.capitalDistribution.PushBenefit],
        },
      });
    });
  });
});
