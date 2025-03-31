import { bool } from '@polkadot/types';
import {
  PalletCorporateActionsBallotBallotMeta,
  PalletCorporateActionsBallotBallotTimeRange,
  PalletCorporateActionsCorporateAction,
  PalletCorporateActionsInitiateCorporateActionArgs,
} from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createBallot,
  createBallotResolver,
  getAuthorization,
  Params,
  prepareCreateBallot,
} from '~/api/procedures/createBallot';
import { Context, CorporateBallot, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { BallotMeta, CorporateActionKind, FungibleAsset, TxTags } from '~/types';
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

describe('createBallot procedure', () => {
  let assetId: string;
  let asset: FungibleAsset;
  let declarationDate: Date;
  let description: string;
  let meta: BallotMeta;
  let startDate: Date;
  let endDate: Date;
  let rcv: boolean;

  let rawCorporateActionArgs: PalletCorporateActionsInitiateCorporateActionArgs;
  let rawCorporateBallotTimeRange: PalletCorporateActionsBallotBallotTimeRange;
  let rawCorporateBallotMeta: PalletCorporateActionsBallotBallotMeta;
  let rawRcv: bool;

  let mockContext: Mocked<Context>;
  let initiateCorporateActionAndBallotTransaction: PolymeshTx<unknown[]>;

  let corporateActionParamsToMeshCorporateActionArgsSpy: jest.SpyInstance;
  let corporateBallotTimeRangeToMeshCorporateBallotTimeRangeSpy: jest.SpyInstance;
  let corporateBallotMetaToMeshCorporateBallotMetaSpy: jest.SpyInstance;
  let booleanToBoolSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    declarationDate = new Date();
    description = 'someDescription';
    meta = {
      title: 'someTitle',
      motions: [
        {
          title: 'someMotion',
          infoLink: 'someInfoLink',
          choices: ['yay', 'nay'],
        },
      ],
    };
    startDate = new Date();
    endDate = new Date(new Date().getTime() + 500000);
    rcv = true;
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

    rawCorporateBallotTimeRange = dsMockUtils.createMockCodec(
      {
        start: dsMockUtils.createMockMoment(new BigNumber(startDate.getTime())),
        end: dsMockUtils.createMockMoment(new BigNumber(endDate.getTime())),
      },
      false
    );

    rawCorporateBallotMeta = dsMockUtils.createMockCodec(
      {
        title: dsMockUtils.createMockBytes('Test Ballot'),
        motions: [
          {
            title: dsMockUtils.createMockBytes('Test Motion Title'),
            infoLink: dsMockUtils.createMockBytes('https://example.com'),
            choices: [
              dsMockUtils.createMockBytes('Yes'),
              dsMockUtils.createMockBytes('No'),
              dsMockUtils.createMockBytes('Abstain'),
            ],
          },
        ],
      },
      false
    );
    rawRcv = dsMockUtils.createMockBool(rcv);

    corporateActionParamsToMeshCorporateActionArgsSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionParamsToMeshCorporateActionArgs'
    );
    corporateBallotTimeRangeToMeshCorporateBallotTimeRangeSpy = jest.spyOn(
      utilsConversionModule,
      'corporateBallotTimeRangeToMeshCorporateBallotTimeRange'
    );
    corporateBallotMetaToMeshCorporateBallotMetaSpy = jest.spyOn(
      utilsConversionModule,
      'corporateBallotMetaToMeshCorporateBallotMeta'
    );
    booleanToBoolSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
  });

  beforeEach(() => {
    initiateCorporateActionAndBallotTransaction = dsMockUtils.createTxMock(
      'corporateAction',
      'initiateCorporateActionAndBallot'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(corporateActionParamsToMeshCorporateActionArgsSpy)
      .calledWith(
        {
          asset,
          kind: CorporateActionKind.IssuerNotice,
          declarationDate,
          description,
          checkpoint: null,
          targets: null,
          defaultTaxWithholding: null,
          taxWithholdings: null,
        },
        mockContext
      )
      .mockReturnValue(rawCorporateActionArgs);
    when(corporateActionParamsToMeshCorporateActionArgsSpy)
      .calledWith(
        {
          asset,
          kind: CorporateActionKind.IssuerNotice,
          declarationDate: expect.any(Date),
          description,
          checkpoint: null,
          targets: null,
          defaultTaxWithholding: null,
          taxWithholdings: null,
        },
        mockContext
      )
      .mockReturnValue(rawCorporateActionArgs);

    when(corporateBallotTimeRangeToMeshCorporateBallotTimeRangeSpy)
      .calledWith(declarationDate, startDate, endDate, mockContext)
      .mockReturnValue(rawCorporateBallotTimeRange);
    when(corporateBallotTimeRangeToMeshCorporateBallotTimeRangeSpy)
      .calledWith(expect.any(Date), startDate, endDate, mockContext)
      .mockReturnValue(rawCorporateBallotTimeRange);

    when(corporateBallotMetaToMeshCorporateBallotMetaSpy)
      .calledWith(meta, mockContext)
      .mockReturnValue(rawCorporateBallotMeta);

    when(booleanToBoolSpy).calledWith(rcv, mockContext).mockReturnValue(rawRcv);
    when(booleanToBoolSpy).calledWith(expect.any(Boolean), mockContext).mockReturnValue(rawRcv);
    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(100)),
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

  it('should throw an error if the declaration date is in the future', async () => {
    const proc = procedureMockUtils.getInstance<Params, CorporateBallot>(mockContext);

    let err;

    try {
      await prepareCreateBallot.call(proc, {
        asset,
        declarationDate: new Date(new Date().getTime() + 500000),
        description,
        meta,
        startDate,
        endDate,
        rcv,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Declaration date must be in the past');
  });

  it('should throw an error if the description length is greater than the allowed maximum', async () => {
    const proc = procedureMockUtils.getInstance<Params, CorporateBallot>(mockContext);

    dsMockUtils.createQueryMock('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    let err;

    try {
      await prepareCreateBallot.call(proc, {
        asset,
        declarationDate,
        description,
        meta,
        startDate,
        endDate,
        rcv,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Description too long');
  });

  it('should return an initiate corporate action and ballot transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, CorporateBallot>(mockContext);

    let result = await prepareCreateBallot.call(proc, {
      asset,
      declarationDate,
      description,
      meta,
      startDate,
      endDate,
      rcv,
    });

    expect(result).toEqual({
      transaction: initiateCorporateActionAndBallotTransaction,
      resolver: expect.any(Function),
      args: [rawCorporateActionArgs, rawCorporateBallotTimeRange, rawCorporateBallotMeta, rawRcv],
    });

    result = await prepareCreateBallot.call(proc, {
      asset,
      description,
      meta,
      startDate,
      endDate,
    });

    expect(result).toEqual({
      transaction: initiateCorporateActionAndBallotTransaction,
      resolver: expect.any(Function),
      args: [rawCorporateActionArgs, rawCorporateBallotTimeRange, rawCorporateBallotMeta, rawRcv],
    });
  });

  describe('createBallotResolver', () => {
    const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
    const id = new BigNumber(1);

    let rawCorporateAction: PalletCorporateActionsCorporateAction;

    beforeAll(() => {
      entityMockUtils.initMocks();

      /* eslint-disable @typescript-eslint/naming-convention */
      rawCorporateAction = dsMockUtils.createMockCorporateAction({
        kind: 'IssuerNotice',
        decl_date: new BigNumber(declarationDate.getTime()),
        record_date: dsMockUtils.createMockRecordDate({
          date: new BigNumber(new Date('10/14/2021').getTime()),
          checkpoint: {
            Scheduled: [
              dsMockUtils.createMockU64(new BigNumber(1)),
              dsMockUtils.createMockU64(new BigNumber(2)),
            ],
          },
        }),
        targets: undefined,
        default_withholding_tax: undefined,
        withholding_tax: [],
      });
      /* eslint-enable @typescript-eslint/naming-convention */

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(rawCorporateAction),
      });
      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockBytes(description),
      });
    });

    beforeEach(() => {
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([
          'data',
          dsMockUtils.createMockCAId({
            assetId,
            localId: id,
          }),
          rawCorporateBallotTimeRange,
          rawCorporateBallotMeta,
          rawRcv,
        ]),
      ]);
    });

    afterEach(() => {
      filterEventRecordsSpy.mockReset();
    });

    it('should return the new CorporateBallot', async () => {
      const result = await createBallotResolver(mockContext)({} as ISubmittableResult);

      expect(result.id).toEqual(id);
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CorporateBallot>(mockContext);

      const boundFunc = getAuthorization.bind(proc);
      const args = {
        asset,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateAction.InitiateCorporateActionAndBallot],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('createBallot', () => {
    it('should be instance of Procedure', async () => {
      expect(createBallot()).toBeInstanceOf(Procedure);
    });
  });
});
