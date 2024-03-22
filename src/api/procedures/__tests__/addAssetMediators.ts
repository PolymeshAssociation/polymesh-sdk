import { PolymeshPrimitivesIdentityId, PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareAddAssetMediators,
} from '~/api/procedures/addAssetMediators';
import { BaseAsset, Context, Identity, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { MAX_ASSET_MEDIATORS } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('addAssetRequirement procedure', () => {
  let mockContext: Mocked<Context>;
  let identitiesToSetSpy: jest.SpyInstance;
  let asset: BaseAsset;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let currentMediator: Identity;
  let newMediator: Identity;
  let rawNewMediatorDid: PolymeshPrimitivesIdentityId;
  let stringToTickerSpy: jest.SpyInstance;
  let mockNewMediators: BTreeSet<PolymeshPrimitivesIdentityId>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerSpy = jest.spyOn(utilsConversionModule, 'stringToTicker');
    identitiesToSetSpy = jest.spyOn(utilsConversionModule, 'identitiesToBtreeSet');
    ticker = 'TICKER';
    rawTicker = dsMockUtils.createMockTicker(ticker);
    currentMediator = entityMockUtils.getIdentityInstance({ did: 'currentDid' });
    newMediator = entityMockUtils.getIdentityInstance({ did: 'newDid' });
    rawNewMediatorDid = dsMockUtils.createMockIdentityId(newMediator.did);
    asset = entityMockUtils.getBaseAssetInstance({
      ticker,
      getRequiredMediators: [currentMediator],
    });
    mockNewMediators = dsMockUtils.createMockBTreeSet<PolymeshPrimitivesIdentityId>([
      rawNewMediatorDid,
    ]);
  });

  let addMandatoryMediatorsTransaction: PolymeshTx<
    [PolymeshPrimitivesTicker, BTreeSet<PolymeshPrimitivesIdentityId>]
  >;

  beforeEach(() => {
    addMandatoryMediatorsTransaction = dsMockUtils.createTxMock('asset', 'addMandatoryMediators');

    mockContext = dsMockUtils.getContextInstance();

    when(stringToTickerSpy).calledWith(ticker, mockContext).mockReturnValue(rawTicker);
    when(identitiesToSetSpy)
      .calledWith(
        expect.arrayContaining([expect.objectContaining({ did: newMediator.did })]),
        mockContext
      )
      .mockReturnValue(mockNewMediators);
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

  it('should throw an error if a supplied mediator is already required for the Asset', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'One of the specified mediators is already set',
    });

    return expect(
      prepareAddAssetMediators.call(proc, { asset, mediators: [currentMediator] })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if new mediators exceed the max mediators', () => {
    const mediators = new Array(MAX_ASSET_MEDIATORS).fill(newMediator);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `At most ${MAX_ASSET_MEDIATORS} are allowed`,
    });

    return expect(prepareAddAssetMediators.call(proc, { asset, mediators })).rejects.toThrow(
      expectedError
    );
  });

  it('should return an add required mediators transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareAddAssetMediators.call(proc, {
      asset,
      mediators: [newMediator],
    });

    expect(result).toEqual({
      transaction: addMandatoryMediatorsTransaction,
      args: [rawTicker, mockNewMediators],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const params = {
        asset,
        mediators: [],
      } as Params;

      expect(boundFunc(params)).toEqual({
        permissions: {
          transactions: [TxTags.asset.AddMandatoryMediators],
          assets: [expect.objectContaining({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
