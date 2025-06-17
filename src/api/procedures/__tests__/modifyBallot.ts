import {
  PalletCorporateActionsBallotBallotMeta,
  PalletCorporateActionsCaId,
  PalletCorporateActionsInitiateCorporateActionArgs,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { CorporateBallotDetails } from '~/api/entities/CorporateBallot/types';
import {
  assertEndDateChange,
  assertMetaChanged,
  assertRcvChange,
  getAuthorization,
  modifyBallot,
  Params,
  prepareModifyBallot,
} from '~/api/procedures/modifyBallot';
import { Context, CorporateBallot, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  CorporateActionKind,
  CorporateActionParams,
  CorporateBallotWithDetails,
  FungibleAsset,
  TargetTreatment,
  TxTags,
} from '~/types';
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

describe('modifyBallot procedure', () => {
  const assetId = '12341234-1234-1234-1234-123412341234';
  const ballotId = new BigNumber(1);

  let asset: FungibleAsset;
  let ballot: CorporateBallot;
  let ballotDetails: CorporateBallotDetails;

  let proc: Procedure<Params, CorporateBallotWithDetails>;

  let rawCaId: PalletCorporateActionsCaId;
  let mockContext: Mocked<Context>;
  let rawCorporateActionArgs: PalletCorporateActionsInitiateCorporateActionArgs;
  const declarationDate = new Date();
  const description = 'description';

  let corporateActionIdentifierToCaIdSpy: jest.SpyInstance;
  let getCorporateActionWithDescriptionSpy: jest.SpyInstance;
  let meshCorporateActionToCorporateActionParamsSpy: jest.SpyInstance;
  const mockCorporateActionParam: CorporateActionParams = {
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
  const mockDescription = dsMockUtils.createMockBytes(description);

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    corporateActionIdentifierToCaIdSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionIdentifierToCaId'
    );
    getCorporateActionWithDescriptionSpy = jest.spyOn(
      utilsInternalModule,
      'getCorporateActionWithDescription'
    );
    meshCorporateActionToCorporateActionParamsSpy = jest.spyOn(
      utilsConversionModule,
      'meshCorporateActionToCorporateActionParams'
    );

    rawCorporateActionArgs = dsMockUtils.createMockInitiateCorporateActionArgs({
      assetId,
      kind: CorporateActionKind.IssuerNotice,
      declDate: dsMockUtils.createMockMoment(new BigNumber(declarationDate.getTime())),
      recordDate: dsMockUtils.createMockOption(),
      details: description,
      targets: dsMockUtils.createMockOption(),
      defaultWithholdingTax: dsMockUtils.createMockOption(),
      withholdingTax: [],
    });

    asset = entityMockUtils.getFungibleAssetInstance({ assetId });

    ballotDetails = {
      startDate: new Date(new Date().getTime() + 500000),
      endDate: new Date(new Date().getTime() + 1000000),
      meta: {
        title: 'title',
        motions: [],
      },
      rcv: true,
    };

    ballot = entityMockUtils.getCorporateBallotInstance({
      id: ballotId,
      assetId,
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    proc = procedureMockUtils.getInstance<Params, CorporateBallotWithDetails>(mockContext);
    rawCaId = dsMockUtils.createMockCaId({
      assetId,
      localId: ballotId,
    });

    when(corporateActionIdentifierToCaIdSpy)
      .calledWith(
        expect.objectContaining({
          asset,
          localId: ballotId,
        }),
        mockContext
      )
      .mockReturnValue(rawCaId);
    jest
      .spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow')
      .mockResolvedValue(ballotDetails);

    when(getCorporateActionWithDescriptionSpy)
      .calledWith(asset, ballotId, mockContext)
      .mockResolvedValue({
        corporateAction: rawCorporateActionArgs,
        description: mockDescription,
      });

    when(meshCorporateActionToCorporateActionParamsSpy)
      .calledWith(rawCorporateActionArgs, mockDescription, mockContext)
      .mockReturnValue(mockCorporateActionParam);
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

  describe('assertMetaChanged', () => {
    it('should throw if the meta is the same', () => {
      expect(() => assertMetaChanged(ballotDetails.meta, ballotDetails)).toThrow(
        'Provided CorporateBallot meta is the same as the current one'
      );
    });

    it('should not throw if the meta is different', () => {
      expect(() =>
        assertMetaChanged({ ...ballotDetails.meta, title: 'different' }, ballotDetails)
      ).not.toThrow();
    });
  });

  describe('assertEndDateChange', () => {
    it('should throw if the end date is the same', () => {
      expect(() => assertEndDateChange(ballotDetails.endDate, ballotDetails)).toThrow(
        'Provided CorporateBallot end date is the same as the current one'
      );
    });

    it('should throw if the end date is before the start date', () => {
      expect(() =>
        assertEndDateChange(new Date(ballotDetails.startDate.getTime() - 1000000), ballotDetails)
      ).toThrow('End date must be after start date');
    });

    it('should not throw if the end date is different and after the start date', () => {
      expect(() =>
        assertEndDateChange(new Date(ballotDetails.startDate.getTime() + 1000000), ballotDetails)
      ).not.toThrow();
    });
  });

  describe('assertRcvChange', () => {
    it('should throw if the rcv is the same', () => {
      expect(() => assertRcvChange(ballotDetails.rcv, ballotDetails)).toThrow(
        'Provided CorporateBallot rcv is the same as the current one'
      );
    });

    it('should not throw if the rcv is different', () => {
      expect(() => assertRcvChange(!ballotDetails.rcv, ballotDetails)).not.toThrow();
    });
  });

  describe('prepareModifyBallot', () => {
    it('should throw if no modification params are provided', async () => {
      await expect(prepareModifyBallot.call(proc, { asset } as Params)).rejects.toThrow(
        'No properties given for ballot modification'
      );
    });

    it('should add modifyMeta transaction to the batch', async () => {
      const transaction = dsMockUtils.createTxMock('corporateBallot', 'changeMeta');
      const meta = { ...ballotDetails.meta, title: 'different' };
      const corporateBallotMetaToMeshCorporateBallotMetaSpy = jest.spyOn(
        utilsConversionModule,
        'corporateBallotMetaToMeshCorporateBallotMeta'
      );
      const mockRawMeta = 'MOCK META';

      when(corporateBallotMetaToMeshCorporateBallotMetaSpy)
        .calledWith(meta, mockContext)
        .mockReturnValue(mockRawMeta as unknown as PalletCorporateActionsBallotBallotMeta);

      let result = await prepareModifyBallot.call(proc, {
        asset,
        ballot,
        meta,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockRawMeta] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        meta,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockRawMeta] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });
    });

    it('should add modifyEnd transaction to the batch', async () => {
      const transaction = dsMockUtils.createTxMock('corporateBallot', 'changeEnd');
      const endDate = new Date(ballotDetails.endDate.getTime() + 1000000);
      const dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
      const mockMoment = dsMockUtils.createMockMoment();

      when(dateToMomentSpy).calledWith(endDate, mockContext).mockReturnValue(mockMoment);

      let result = await prepareModifyBallot.call(proc, {
        asset,
        ballot,
        endDate,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockMoment] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        endDate,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockMoment] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });
    });

    it('should add modifyRcv transaction to the batch', async () => {
      const transaction = dsMockUtils.createTxMock('corporateBallot', 'changeRcv');
      const rcv = !ballotDetails.rcv;

      const booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
      const mockBool = dsMockUtils.createMockBool();

      when(booleanToBoolSpy).calledWith(rcv, mockContext).mockReturnValue(mockBool);

      let result = await prepareModifyBallot.call(proc, {
        asset,
        ballot,
        rcv,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockBool] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        rcv,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockBool] }],
        resolver: {
          ballot: expect.any(CorporateBallot),
          details: expect.any(Object),
        },
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ballot,
        asset,
        meta: ballotDetails.meta,
        endDate: ballotDetails.endDate,
        rcv: ballotDetails.rcv,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [
            TxTags.corporateBallot.ChangeMeta,
            TxTags.corporateBallot.ChangeEnd,
            TxTags.corporateBallot.ChangeRcv,
          ],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('modifyBallot', () => {
    it('should be instance of Procedure', async () => {
      expect(modifyBallot()).toBeInstanceOf(Procedure);
    });
  });
});
