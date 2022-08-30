import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveCorporateAction,
} from '~/api/procedures/removeCorporateAction';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/CorporateAction',
  require('~/testUtils/mocks/entities').mockCorporateActionModule('~/api/entities/CorporateAction')
);

describe('removeCorporateAction procedure', () => {
  let mockContext: Mocked<Context>;
  let corporateActionsQueryStub: sinon.SinonStub;

  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);
  const rawCaId = dsMockUtils.createMockCAId({ ticker, localId: id });

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'corporateActionIdentifierToCaId').returns(rawCaId);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    corporateActionsQueryStub = dsMockUtils.createQueryStub('corporateAction', 'corporateActions');
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

  it("should throw an error if the Corporate Action is a Distribution and it doesn't exist", () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getDividendDistributionInstance(),
        ticker,
      })
    ).rejects.toThrow("The Distribution doesn't exist");
  });

  it("should throw an error if the Corporate Action is not a Distribution and the Corporate Action doesn't exist", () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(),
    });

    corporateActionsQueryStub.returns(dsMockUtils.createMockOption());

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: new BigNumber(1),
        ticker,
      })
    ).rejects.toThrow("The Corporate Action doesn't exist");
  });

  it('should throw an error if the distribution has already started', () => {
    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          perShare: new BigNumber(20000000),
          amount: new BigNumber(50000000000),
          remaining: new BigNumber(40000000000),
          paymentAt: new BigNumber(new Date('1/1/2020').getTime()),
          expiresAt: dsMockUtils.createMockOption(),
          reclaimed: false,
        })
      ),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getDividendDistributionInstance(),
        ticker,
      })
    ).rejects.toThrow('The Distribution has already started');
  });

  it('should throw an error if the corporate action does not exist', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveCorporateAction.call(proc, {
        corporateAction: entityMockUtils.getCorporateActionInstance({
          exists: false,
        }),
        ticker,
      })
    ).rejects.toThrow("The Corporate Action doesn't exist");
  });

  it('should return a remove corporate agent transaction spec', async () => {
    const transaction = dsMockUtils.createTxStub('corporateAction', 'removeCa');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let result = await prepareRemoveCorporateAction.call(proc, {
      corporateAction: entityMockUtils.getCorporateActionInstance({
        exists: true,
      }),
      ticker,
    });

    expect(result).toEqual({ transaction, args: [rawCaId], resolver: undefined });

    dsMockUtils.createQueryStub('capitalDistribution', 'distributions', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockDistribution({
          from: {
            kind: 'Default',
            did: 'someDid',
          },
          currency: 'USD',
          perShare: new BigNumber(20000000),
          amount: new BigNumber(50000000000),
          remaining: new BigNumber(40000000000),
          paymentAt: new BigNumber(new Date('10/10/2030').getTime()),
          expiresAt: dsMockUtils.createMockOption(),
          reclaimed: false,
        })
      ),
    });

    result = await prepareRemoveCorporateAction.call(proc, {
      corporateAction: entityMockUtils.getDividendDistributionInstance(),
      ticker,
    });

    expect(result).toEqual({ transaction, args: [rawCaId], resolver: undefined });

    corporateActionsQueryStub.returns(
      dsMockUtils.createMockOption(dsMockUtils.createMockCorporateAction())
    );

    result = await prepareRemoveCorporateAction.call(proc, {
      corporateAction: new BigNumber(1),
      ticker,
    });

    expect(result).toEqual({ transaction, args: [rawCaId], resolver: undefined });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateAction.RemoveCa],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
