import {
  PalletCorporateActionsBallotBallotMeta,
  PalletCorporateActionsCaId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

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
import { CorporateBallotParams, FungibleAsset, TxTags } from '~/types';
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

describe('removeBallot procedure', () => {
  const assetId = '12341234-1234-1234-1234-123412341234';
  const ballotId = new BigNumber(1);

  let asset: FungibleAsset;
  let ballot: CorporateBallot;
  let ballotDetails: CorporateBallotParams;

  let proc: Procedure<Params, CorporateBallot>;

  let rawCaId: PalletCorporateActionsCaId;
  let mockContext: Mocked<Context>;

  let corporateActionIdentifierToCaIdSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    corporateActionIdentifierToCaIdSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionIdentifierToCaId'
    );

    asset = entityMockUtils.getFungibleAssetInstance({ assetId });

    ballotDetails = {
      startDate: new Date(new Date().getTime() + 500000),
      endDate: new Date(new Date().getTime() + 1000000),
      description: 'description',
      meta: {
        title: 'title',
        motions: [],
      },
      rcv: true,
      declarationDate: new Date(new Date().getTime() + 500000),
    };

    ballot = entityMockUtils.getCorporateBallotInstance({
      id: ballotId,
      assetId,
      startDate: new Date(new Date().getTime() + 500000),
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    proc = procedureMockUtils.getInstance<Params, CorporateBallot>(mockContext);
    rawCaId = dsMockUtils.createMockCAId({
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
        resolver: expect.objectContaining({ id: ballotId }),
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        meta,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockRawMeta] }],
        resolver: expect.objectContaining({ id: ballotId }),
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
        resolver: expect.objectContaining({ id: ballotId }),
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        endDate,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockMoment] }],
        resolver: expect.objectContaining({ id: ballotId }),
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
        resolver: expect.objectContaining({ id: ballotId }),
      });

      result = await prepareModifyBallot.call(proc, {
        asset,
        ballot: ballotId,
        rcv,
      });

      expect(result).toEqual({
        transactions: [{ transaction, args: [rawCaId, mockBool] }],
        resolver: expect.objectContaining({ id: ballotId }),
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
