import { Bytes } from '@polkadot/types';
import {
  PalletCorporateActionsCaId,
  PalletCorporateActionsInitiateCorporateActionArgs,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  assertCheckpointValue,
  getAuthorization,
  initiateCorporateAction,
  initiateCorporateActionResolver,
  Params,
  prepareInitiateCorporateAction,
} from '~/api/procedures/initiateCorporateAction';
import { Checkpoint, CheckpointSchedule, Context, CorporateAction, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  CorporateActionKind,
  CorporateActionParams,
  FungibleAsset,
  TargetTreatment,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('assertCheckpointValue', () => {
  const context = dsMockUtils.getContextInstance();
  const asset = entityMockUtils.getFungibleAssetInstance({
    assetId: '0x12341234123412341234123412341234',
  });

  it('should throw an error if the provided Date is in the past', async () => {
    const checkpoint = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);

    return expect(assertCheckpointValue(checkpoint)).rejects.toThrow(
      'Checkpoint must be in the future'
    );
  });

  it('should throw an error if the checkpoint is in the past', async () => {
    const mockCheckpoint = new Checkpoint({ id: new BigNumber(1), assetId: asset.id }, context);
    mockCheckpoint.createdAt = jest
      .fn()
      .mockResolvedValue(new Date(new Date().getTime() - 1000 * 60 * 60 * 24));

    return expect(assertCheckpointValue(mockCheckpoint)).rejects.toThrow(
      'Checkpoint must be in the future'
    );
  });

  it('should throw an error if the provided CheckpointSchedule has no pending checkpoints', async () => {
    const mockSchedule = new CheckpointSchedule(
      { id: new BigNumber(1), assetId: asset.id, pendingPoints: [] },
      context
    );

    return expect(assertCheckpointValue(mockSchedule)).rejects.toThrow(
      'The provided CheckpointSchedule has no pending checkpoints'
    );
  });
});

describe('initiateCorporateAction procedure', () => {
  let assetId: string;
  let asset: FungibleAsset;
  let checkpoint: Date;
  let kind: CorporateActionKind;

  let declarationDate: Date;
  let description: string;
  let rawCorporateActionArgs: PalletCorporateActionsInitiateCorporateActionArgs;

  let mockContext: Mocked<Context>;
  let initiateCorporateActionTransaction: PolymeshTx<unknown[]>;

  let corporateActionParamsToMeshCorporateActionArgsSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    checkpoint = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
    kind = CorporateActionKind.IssuerNotice;

    declarationDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
    description = 'someDescription';
    rawCorporateActionArgs = dsMockUtils.createMockInitiateCorporateActionArgs({
      assetId,
      kind,
      declDate: dsMockUtils.createMockMoment(new BigNumber(declarationDate.getTime())),
      recordDate: dsMockUtils.createMockOption(),
      details: description,
      targets: dsMockUtils.createMockOption(),
      defaultWithholdingTax: dsMockUtils.createMockOption(),
      withholdingTax: [],
    });

    corporateActionParamsToMeshCorporateActionArgsSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionParamsToMeshCorporateActionArgs'
    );
  });

  beforeEach(() => {
    initiateCorporateActionTransaction = dsMockUtils.createTxMock(
      'corporateAction',
      'initiateCorporateAction'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(corporateActionParamsToMeshCorporateActionArgsSpy)
      .calledWith(
        {
          asset,
          kind,
          declarationDate,
          description,
          checkpoint,
          targets: null,
          defaultTaxWithholding: null,
          taxWithholdings: expect.any(Array),
        },
        mockContext
      )
      .mockReturnValue(rawCorporateActionArgs);

    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(100)),
    });
    dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });
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

  it('should throw an error if the description length is greater than the allowed maximum', async () => {
    const proc = procedureMockUtils.getInstance<Params, CorporateAction>(mockContext);

    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    return expect(
      prepareInitiateCorporateAction.call(proc, {
        asset,
        declarationDate,
        description,
        kind: CorporateActionKind.IssuerNotice,
        checkpoint: null,
        taxWithholdings: [],
        targets: null,
        defaultTaxWithholding: null,
      })
    ).rejects.toThrow('Description too long');
  });

  it('should return an initiate corporate action transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CorporateAction>(mockContext);

    const result = await prepareInitiateCorporateAction.call(proc, {
      asset,
      declarationDate,
      description,
      kind,
      checkpoint,
      taxWithholdings: [],
      targets: null,
      defaultTaxWithholding: null,
    });

    expect(result).toEqual({
      transaction: initiateCorporateActionTransaction,
      resolver: expect.any(Function),
      args: [
        rawCorporateActionArgs.assetId,
        rawCorporateActionArgs.kind,
        rawCorporateActionArgs.declDate,
        rawCorporateActionArgs.recordDate,
        rawCorporateActionArgs.details,
        rawCorporateActionArgs.targets,
        rawCorporateActionArgs.defaultWithholdingTax,
        rawCorporateActionArgs.withholdingTax,
      ],
    });
  });

  describe('initiateCorporateActionResolver', () => {
    let filterEventRecordsSpy: jest.SpyInstance;
    let getCorporateActionWithDescriptionSpy: jest.SpyInstance;
    let meshCorporateActionToCorporateActionParamsSpy: jest.SpyInstance;
    let assetIdToStringSpy: jest.SpyInstance;
    let u32ToBigNumberSpy: jest.SpyInstance;

    let mockRawCaId: PalletCorporateActionsCaId;
    let mockCaId: BigNumber;
    let mockCorporateActionParams: CorporateActionParams;
    let mockDescription: Bytes;

    beforeAll(() => {
      entityMockUtils.initMocks();

      filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
      getCorporateActionWithDescriptionSpy = jest.spyOn(
        utilsInternalModule,
        'getCorporateActionWithDescription'
      );
      meshCorporateActionToCorporateActionParamsSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateActionToCorporateActionParams'
      );

      assetIdToStringSpy = jest.spyOn(utilsConversionModule, 'assetIdToString');
      u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');
      mockRawCaId = dsMockUtils.createMockCaId();
      mockCaId = new BigNumber(1);
      mockDescription = dsMockUtils.createMockBytes(description);
      mockCorporateActionParams = {
        kind: CorporateActionKind.IssuerNotice,
        declarationDate,
        description,
        targets: {
          identities: [],
          treatment: TargetTreatment.Include,
        },
        defaultTaxWithholding: new BigNumber(0),
        taxWithholdings: [],
      };
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([dsMockUtils.createMockIEvent(['data', mockRawCaId])]);

      when(assetIdToStringSpy).calledWith(mockRawCaId.assetId).mockReturnValue(assetId);
      when(u32ToBigNumberSpy).calledWith(mockRawCaId.localId).mockReturnValue(mockCaId);
      when(getCorporateActionWithDescriptionSpy)
        .calledWith(asset, mockCaId, mockContext)
        .mockResolvedValue({
          corporateAction: rawCorporateActionArgs,
          description: mockDescription,
        });

      when(meshCorporateActionToCorporateActionParamsSpy)
        .calledWith(rawCorporateActionArgs, mockDescription, mockContext)
        .mockReturnValue(mockCorporateActionParams);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new CorporateAction', async () => {
      const result = await initiateCorporateActionResolver(
        asset,
        mockContext
      )({} as ISubmittableResult);

      expect(result.id).toEqual(mockCaId);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CorporateAction>(mockContext);

      const boundFunc = getAuthorization.bind(proc);
      const args = {
        asset,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateAction.InitiateCorporateAction],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('initiateCorporateAction', () => {
    it('should be instance of Procedure', async () => {
      expect(initiateCorporateAction()).toBeInstanceOf(Procedure);
    });
  });
});
