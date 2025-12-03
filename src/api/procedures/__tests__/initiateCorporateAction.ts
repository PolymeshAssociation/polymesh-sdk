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
import {
  Checkpoint,
  CheckpointSchedule,
  Context,
  CorporateAction,
  Identity,
  Procedure,
} from '~/internal';
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

  it('should throw an error if the provided Date is in the past', () => {
    const checkpoint = new Date(Date.now() - 1000 * 60 * 60 * 24);

    return expect(assertCheckpointValue(checkpoint)).rejects.toThrow(
      'Checkpoint must be in the future'
    );
  });

  it('should throw an error if the checkpoint is in the past', () => {
    const mockCheckpoint = new Checkpoint({ id: new BigNumber(1), assetId: asset.id }, context);
    mockCheckpoint.createdAt = jest
      .fn()
      .mockResolvedValue(new Date(Date.now() - 1000 * 60 * 60 * 24));

    return expect(assertCheckpointValue(mockCheckpoint)).rejects.toThrow(
      'Checkpoint must be in the future'
    );
  });

  it('should throw an error if the provided CheckpointSchedule has no pending checkpoints', () => {
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
  let stringToIdentityIdSpy: jest.SpyInstance;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let signingIdentity: Identity;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    checkpoint = new Date(Date.now() + 1000 * 60 * 60 * 24);
    kind = CorporateActionKind.IssuerNotice;

    declarationDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
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
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');

    signingIdentity = entityMockUtils.getIdentityInstance({ did: 'someDid' });
  });

  beforeEach(() => {
    initiateCorporateActionTransaction = dsMockUtils.createTxMock(
      'corporateAction',
      'initiateCorporateAction'
    );

    mockContext = dsMockUtils.getContextInstance();
    mockContext.getSigningIdentity = jest.fn().mockResolvedValue(signingIdentity);

    const rawAssetId = dsMockUtils.createMockAssetId(assetId);
    const rawIdentityId = dsMockUtils.createMockIdentityId(signingIdentity.did);

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    when(stringToIdentityIdSpy)
      .calledWith(signingIdentity.did, mockContext)
      .mockReturnValue(rawIdentityId);

    // Default: mock Full agent (asset owner scenario)
    dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
      returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('Full')),
    });

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

  it('should throw an error if the description length is greater than the allowed maximum', () => {
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

  describe('tax withholdings validation', () => {
    it('should validate tax withholdings and detect duplicates', async () => {
      const proc = procedureMockUtils.getInstance<Params, CorporateAction>(mockContext);

      // Set maxDidWhts to at least 2 to allow duplicate check to run before limit check
      dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(10)),
      });

      const identity1 = entityMockUtils.getIdentityInstance({ did: 'did1' });
      const identity2 = entityMockUtils.getIdentityInstance({ did: 'did2' });

      const asIdentitySpy = jest.spyOn(utilsInternalModule, 'asIdentity');
      when(asIdentitySpy).calledWith(identity1, mockContext).mockReturnValue(identity1);
      when(asIdentitySpy).calledWith(identity2, mockContext).mockReturnValue(identity2);

      await expect(
        prepareInitiateCorporateAction.call(proc, {
          asset,
          declarationDate,
          description,
          kind,
          checkpoint,
          taxWithholdings: [
            { identity: identity1, percentage: new BigNumber(10) },
            { identity: identity1, percentage: new BigNumber(20) }, // Duplicate
          ],
          targets: null,
          defaultTaxWithholding: null,
        })
      ).rejects.toMatchObject({
        message: 'Identity included more than once in the tax withholding list',
        data: {
          identity: identity1,
        },
      });

      asIdentitySpy.mockRestore();
    });

    it('should validate tax withholdings limit', async () => {
      const proc = procedureMockUtils.getInstance<Params, CorporateAction>(mockContext);

      const identity1 = entityMockUtils.getIdentityInstance({ did: 'did1' });
      const identity2 = entityMockUtils.getIdentityInstance({ did: 'did2' });

      const asIdentitySpy = jest.spyOn(utilsInternalModule, 'asIdentity');
      when(asIdentitySpy).calledWith(identity1, mockContext).mockReturnValue(identity1);
      when(asIdentitySpy).calledWith(identity2, mockContext).mockReturnValue(identity2);

      // Set maxDidWhts to 1, but provide 2 tax withholdings
      dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
      });

      await expect(
        prepareInitiateCorporateAction.call(proc, {
          asset,
          declarationDate,
          description,
          kind,
          checkpoint,
          taxWithholdings: [
            { identity: identity1, percentage: new BigNumber(10) },
            { identity: identity2, percentage: new BigNumber(20) },
          ],
          targets: null,
          defaultTaxWithholding: null,
        })
      ).rejects.toThrow(); // Should throw from assertCaTaxWithholdingsValid

      asIdentitySpy.mockRestore();
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
    it('should be instance of Procedure', () => {
      expect(initiateCorporateAction()).toBeInstanceOf(Procedure);
    });
  });
});
