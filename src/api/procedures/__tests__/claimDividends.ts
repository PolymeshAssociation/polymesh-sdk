import BigNumber from 'bignumber.js';

import { Params, prepareClaimDividends } from '~/api/procedures/claimDividends';
import { Context, DividendDistribution } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TargetTreatment } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('claimDividends procedure', () => {
  const assetId = '0x12341234123412341234123412341234';
  const did = 'someDid';
  const id = new BigNumber(1);
  const paymentDate = new Date('10/14/1987');
  const expiryDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);

  const rawCaId = dsMockUtils.createMockCAId({ assetId, localId: id });
  const rawDid = dsMockUtils.createMockIdentityId(did);

  let distribution: DividendDistribution;

  let mockContext: Mocked<Context>;
  let claimDividendsTransaction: PolymeshTx<unknown[]>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'corporateActionIdentifierToCaId').mockReturnValue(rawCaId);
    jest.spyOn(utilsConversionModule, 'stringToIdentityId').mockReturnValue(rawDid);
  });

  beforeEach(() => {
    claimDividendsTransaction = dsMockUtils.createTxMock('capitalDistribution', 'claim');
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

  it('should throw an error if the Distribution is expired', async () => {
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

  it('should throw an error if the Distribution is expired', async () => {
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

  it('should throw an error if the signing Identity is not included in the Distribution', async () => {
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate,
      getParticipant: null,
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The signing Identity is not included in this Distribution');
  });

  it('should throw an error if the signing Identity has already claimed', async () => {
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate,
      getParticipant: {
        paid: true,
        identity: entityMockUtils.getIdentityInstance({ did }),
        amount: new BigNumber(100),
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let err;

    try {
      await prepareClaimDividends.call(proc, { distribution });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('The signing Identity has already claimed dividends');
  });

  it('should return a claim dividends transaction spec', async () => {
    distribution = entityMockUtils.getDividendDistributionInstance({
      paymentDate,
      getParticipant: {
        paid: false,
        identity: entityMockUtils.getIdentityInstance({ did }),
        amount: new BigNumber(100),
      },
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareClaimDividends.call(proc, {
      distribution,
    });

    expect(result).toEqual({
      transaction: claimDividendsTransaction,
      args: [rawCaId],
      resolver: undefined,
    });
  });
});
