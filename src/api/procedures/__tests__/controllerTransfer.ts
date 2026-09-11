import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetHolder,
  PolymeshPrimitivesAssetAssetHolderKind,
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityIdPortfolioId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  Params,
  prepareControllerTransfer,
  prepareStorage,
  Storage,
} from '~/api/procedures/controllerTransfer';
import * as proceduresUtilsModule from '~/api/procedures/utils';
import { Context, DefaultPortfolio, FungibleAsset } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, PortfolioBalance, RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('controllerTransfer procedure', () => {
  const actingAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  let mockContext: Mocked<Context>;
  let assetHolderLikeToAssetHolderSpy: jest.SpyInstance;
  let assetHolderIdToMeshAssetHolderSpy: jest.SpyInstance;
  let assertDestinationAcceptedSpy: jest.SpyInstance;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let did: string;
  let rawPortfolioId: PolymeshPrimitivesIdentityIdPortfolioId;
  let rawDestinationHolder: PolymeshPrimitivesAssetAssetHolder;
  let rawDestinationKind: PolymeshPrimitivesAssetAssetHolderKind;
  let originPortfolio: DefaultPortfolio;
  let destinationPortfolio: DefaultPortfolio;
  let rawAmount: Balance;
  let amount: BigNumber;

  const buildStorage = (overrides: Partial<Storage> = {}): Storage => ({
    did: 'someDid',
    actingAddress,
    destinationAssetHolder: destinationPortfolio,
    isDestinationCallers: true,
    ...overrides,
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    const assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    did = 'fakeDid';
    rawPortfolioId = dsMockUtils.createMockPortfolioId({
      did: dsMockUtils.createMockIdentityId(did),
      kind: dsMockUtils.createMockPortfolioKind('Default'),
    });
    rawDestinationHolder = dsMockUtils.createMockAssetHolder({
      Account: dsMockUtils.createMockAccountId('someAccount'),
    });
    rawDestinationKind = dsMockUtils.createMockAssetHolderKind('DefaultPortfolio');

    // 60 of the 90 unlocked tokens are frozen. A controller transfer can still seize them
    originPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did,
      getAssetBalances: [
        {
          total: new BigNumber(100),
          locked: new BigNumber(10),
          frozen: new BigNumber(60),
          free: new BigNumber(30),
        },
      ] as PortfolioBalance[],
    });
    destinationPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' });

    amount = new BigNumber(50);
    rawAmount = dsMockUtils.createMockBalance(amount);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'controllerTransfer');
    dsMockUtils.createTxMock('asset', 'controllerTransferTo');

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
    jest
      .spyOn(utilsConversionModule, 'assetHolderToAssetHolderKind')
      .mockReturnValue(rawDestinationKind);
    assetHolderIdToMeshAssetHolderSpy = jest
      .spyOn(utilsConversionModule, 'assetHolderIdToMeshAssetHolder')
      .mockImplementation(holderId =>
        typeof holderId === 'string'
          ? rawDestinationHolder
          : (rawPortfolioId as unknown as PolymeshPrimitivesAssetAssetHolder)
      );
    assetHolderLikeToAssetHolderSpy = jest
      .spyOn(utilsConversionModule, 'assetHolderLikeToAssetHolder')
      .mockReturnValue(originPortfolio);
    assertDestinationAcceptedSpy = jest
      .spyOn(proceduresUtilsModule, 'assertControllerTransferDestinationAccepted')
      .mockResolvedValue();
    jest.spyOn(proceduresUtilsModule, 'assertAssetHolderExists').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw if the origin and destination belong to the same Identity', () => {
    const selfPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'someDid' });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage()
    );

    return expect(
      prepareControllerTransfer.call(proc, {
        asset,
        originPortfolio: selfPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow('The origin and destination must belong to different Identities');
  });

  it("should allow seizing from the agent's own Portfolio when delivering elsewhere", async () => {
    // the restriction is between origin and destination, not origin and caller: returning seized
    // tokens from the agent's own custody to their owner is exactly what `controllerTransferTo` is for
    const ownPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did: 'someDid',
      getAssetBalances: [
        {
          total: new BigNumber(100),
          locked: new BigNumber(0),
          frozen: new BigNumber(0),
          free: new BigNumber(100),
        },
      ] as PortfolioBalance[],
    });
    assetHolderLikeToAssetHolderSpy.mockReturnValue(ownPortfolio);
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage({
        destinationAssetHolder: entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' }),
        isDestinationCallers: false,
      })
    );

    const result = await prepareControllerTransfer.call(proc, {
      asset,
      originPortfolio: ownPortfolio,
      amount,
    });

    expect(result.transaction).toBe(mockContext.polymeshApi.tx.asset.controllerTransferTo);
  });

  it('should throw an error if the Portfolio does not have enough unlocked balance', () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage()
    );

    return expect(
      prepareControllerTransfer.call(proc, {
        asset,
        originPortfolio,
        amount: new BigNumber(1000),
      })
    ).rejects.toThrow(
      'The origin Portfolio does not have enough unlocked balance for this transfer'
    );
  });

  it('should throw an error if the amount would reach into locked tokens', () => {
    const lockedPortfolio = entityMockUtils.getDefaultPortfolioInstance({
      did,
      getAssetBalances: [
        {
          total: new BigNumber(100),
          locked: new BigNumber(60),
          frozen: new BigNumber(0),
          free: new BigNumber(40),
        },
      ] as PortfolioBalance[],
    });
    assetHolderLikeToAssetHolderSpy.mockReturnValue(lockedPortfolio);
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage()
    );

    return expect(
      prepareControllerTransfer.call(proc, { asset, originPortfolio: lockedPortfolio, amount })
    ).rejects.toThrow(
      'The origin Portfolio does not have enough unlocked balance for this transfer'
    );
  });

  it("should use controllerTransfer, seizing frozen tokens, for the caller's own destination", async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage()
    );

    const result = await prepareControllerTransfer.call(proc, {
      asset,
      originPortfolio,
      amount,
    });

    expect(assertDestinationAcceptedSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      transaction: mockContext.polymeshApi.tx.asset.controllerTransfer,
      args: [rawAssetId, rawAmount, rawPortfolioId, rawDestinationKind],
      resolver: undefined,
    });
  });

  it('should use controllerTransferTo for a destination the caller does not own', async () => {
    const destination = entityMockUtils.getAccountInstance({ address: 'someAccount' });
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage({ destinationAssetHolder: destination, isDestinationCallers: false })
    );

    const result = await prepareControllerTransfer.call(proc, {
      asset,
      originPortfolio,
      amount,
    });

    expect(assertDestinationAcceptedSpy).toHaveBeenCalledWith(
      destination,
      asset,
      { did: 'someDid', address: actingAddress },
      mockContext
    );
    expect(assetHolderIdToMeshAssetHolderSpy).toHaveBeenCalledWith('someAccount', mockContext);
    expect(result).toEqual({
      transaction: mockContext.polymeshApi.tx.asset.controllerTransferTo,
      args: [rawAssetId, rawAmount, rawPortfolioId, rawDestinationHolder],
      resolver: undefined,
    });
  });

  it('should throw if the destination would have to affirm the transfer', () => {
    assertDestinationAcceptedSpy.mockRejectedValue(new Error('must affirm'));
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage({ isDestinationCallers: false })
    );

    return expect(
      prepareControllerTransfer.call(proc, { asset, originPortfolio, amount })
    ).rejects.toThrow('must affirm');
  });

  it('should throw NotSupported for a destination the caller does not own before Polymesh 8.1.1', () => {
    dsMockUtils.reset();
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('asset', 'controllerTransfer');
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(
      mockContext,
      buildStorage({ isDestinationCallers: false })
    );

    return expect(
      prepareControllerTransfer.call(proc, { asset, originPortfolio, amount })
    ).rejects.toThrow(expect.objectContaining({ code: ErrorCode.NotSupported }));
  });

  describe('getAuthorization', () => {
    it("should require custody of the caller's Portfolio for the caller's own destination", () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(
        mockContext,
        buildStorage({ did: 'oneDid' })
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, originPortfolio, amount })).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId: { did: 'oneDid' } }],
        permissions: {
          transactions: [TxTags.asset.ControllerTransfer],
          assets: [asset],
          portfolios: [
            expect.objectContaining({ owner: expect.objectContaining({ did: 'oneDid' }) }),
          ],
        },
      });
    });

    it('should require only the Asset permission for a named destination', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(
        mockContext,
        buildStorage({ isDestinationCallers: false })
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ asset, originPortfolio, amount })).toEqual({
        permissions: {
          transactions: [TxTags.asset.ControllerTransferTo],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('prepareStorage', () => {
    it("should default to the signing Identity's Default Portfolio", async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      const result = await boundFunc({ asset, originPortfolio, amount });

      expect(result).toEqual({
        did: 'someDid',
        actingAddress: expect.any(String),
        destinationAssetHolder: expect.objectContaining({
          owner: expect.objectContaining({ did: 'someDid' }),
        }),
        isDestinationCallers: true,
      });
    });

    it('should treat a Portfolio of another Identity as a named destination', async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const otherPortfolio = entityMockUtils.getDefaultPortfolioInstance({ did: 'otherDid' });
      assetHolderLikeToAssetHolderSpy.mockReturnValue(otherPortfolio);

      const result = await boundFunc({
        asset,
        originPortfolio,
        amount,
        destination: otherPortfolio,
      });

      expect(result.isDestinationCallers).toBe(false);
    });

    it("should treat only the acting Account as the caller's own Account", async () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);
      const { address } = await mockContext.getActingAccount();

      const actingAccount = entityMockUtils.getAccountInstance({ address });
      assetHolderLikeToAssetHolderSpy.mockReturnValue(actingAccount);

      let result = await boundFunc({ asset, originPortfolio, amount, destination: address });

      expect(result.isDestinationCallers).toBe(true);

      const otherAccount = entityMockUtils.getAccountInstance({ address: 'otherAccount' });
      assetHolderLikeToAssetHolderSpy.mockReturnValue(otherAccount);

      result = await boundFunc({ asset, originPortfolio, amount, destination: 'otherAccount' });

      expect(result.isDestinationCallers).toBe(false);
    });
  });
});
