import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareToggleTickerPreApproval,
} from '~/api/procedures/toggleTickerPreApproval';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Identity, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('toggleTickerPreApproval procedure', () => {
  let mockContext: Mocked<Context>;
  let mockSigningIdentity: Mocked<Identity>;
  let stringToTickerSpy: jest.SpyInstance<PolymeshPrimitivesTicker, [string, Context]>;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    ticker = 'TEST';
    rawTicker = dsMockUtils.createMockTicker(ticker);
  });

  beforeEach(() => {
    mockSigningIdentity = entityMockUtils.getIdentityInstance({
      isAssetPreApproved: false,
    });
    mockContext = dsMockUtils.getContextInstance();
    mockContext.getSigningIdentity.mockResolvedValue(mockSigningIdentity);
    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
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

  it('should throw an error if pre approving an already approved asset', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    mockSigningIdentity.isAssetPreApproved.mockResolvedValue(true);

    return expect(
      prepareToggleTickerPreApproval.call(proc, {
        ticker,
        preApprove: true,
      })
    ).rejects.toThrow('The signing identity has already pre-approved the ticker');
  });

  it('should throw an error if removing pre approval for an asset that is not pre-approved', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareToggleTickerPreApproval.call(proc, {
        ticker,
        preApprove: false,
      })
    ).rejects.toThrow('The signing identity has not pre-approved the asset');
  });

  it('should return a pre approve transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxMock('asset', 'preApproveTicker');

    const result = await prepareToggleTickerPreApproval.call(proc, {
      ticker,
      preApprove: true,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  it('should return a remove pre approval transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    mockSigningIdentity.isAssetPreApproved.mockResolvedValue(true);

    const transaction = dsMockUtils.createTxMock('asset', 'removeTickerPreApproval');

    const result = await prepareToggleTickerPreApproval.call(proc, {
      ticker,
      preApprove: false,
    });

    expect(result).toEqual({
      transaction,
      args: [rawTicker],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args: Params = {
        ticker,
        preApprove: true,
      };

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.asset.PreApproveTicker],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });

      args.preApprove = false;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.asset.RemoveTickerPreApproval],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
