import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Params, prepareClaimDividends } from '~/api/procedures/claimDividends';
import { Context, DividendDistribution } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TargetTreatment } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('claimDividends procedure', () => {
  const ticker = 'SOMETICKER';
  const did = 'someDid';
  const id = new BigNumber(1);
  const paymentDate = new Date('10/14/1987');
  const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

  // eslint-disable-next-line @typescript-eslint/camelcase
  const rawCaId = dsMockUtils.createMockCAId({ ticker, local_id: id.toNumber() });
  const rawDid = dsMockUtils.createMockIdentityId(did);

  let distribution: DividendDistribution;

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let claimDividendsTransaction: PolymeshTx<unknown[]>;

  let holderPaidStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks({
      dividendDistributionOptions: {
        targets: {
          identities: [],
          treatment: TargetTreatment.Exclude,
        },
        ticker,
        id,
        paymentDate,
        expiryDate,
      },
    });
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
    sinon.stub(utilsConversionModule, 'stringToIdentityId').returns(rawDid);
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    claimDividendsTransaction = dsMockUtils.createTxStub('capitalDistribution', 'claim');
    mockContext = dsMockUtils.getContextInstance();
    distribution = entityMockUtils.getDividendDistributionInstance({
      ticker,
      id,
      paymentDate,
      expiryDate,
      targets: {
        identities: [],
        treatment: TargetTreatment.Exclude,
      },
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

  test('should throw an error if the Distribution is expired', async () => {
    const date = new Date(new Date().getTime() + 1000 * 60 * 60);
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate: date,
      expiryDate,
      targets: {
        identities: [],
        treatment: TargetTreatment.Exclude,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe("The Distribution's payment date hasn't been reached");
    expect(err.data).toEqual({
      paymentDate: date,
    });
  });

  test('should throw an error if the Distribution is expired', async () => {
    const date = new Date(new Date().getTime() - 1000);
    distribution = entityMockUtils.getDividendDistributionInstance({
      expiryDate: date,
      paymentDate,
      targets: {
        identities: [],
        treatment: TargetTreatment.Exclude,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The Distribution has already expired');
    expect(err.data).toEqual({
      expiryDate: date,
    });
  });

  test('should throw an error if the current Identity is not included in the Distribution', async () => {
    distribution = entityMockUtils.getDividendDistributionInstance({
      targets: {
        identities: [entityMockUtils.getIdentityInstance({ did: 'otherDid' })],
        treatment: TargetTreatment.Include,
      },
      paymentDate,
      expiryDate,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The current Identity is not included in this Distribution');
  });

  test('should throw an error if the current Identity has already claimed', async () => {
    distribution = entityMockUtils.getDividendDistributionInstance({
      expiryDate,
      paymentDate,
      targets: {
        identities: [],
        treatment: TargetTreatment.Exclude,
      },
    });
    holderPaidStub.resolves(dsMockUtils.createMockBool(true));

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The current Identity has already claimed dividends');
  });

  test('should add a stop sto transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareClaimDividends.call(proc, { distribution });

    sinon.assert.calledWith(addTransactionStub, claimDividendsTransaction, {}, rawCaId);
  });
});
