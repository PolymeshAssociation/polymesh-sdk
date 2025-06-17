import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Ballots } from '~/api/entities/Asset/Fungible/CorporateActions/Ballots';
import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  CorporateActionKind,
  CorporateActionParams,
  CorporateBallotWithDetails,
  CreateBallotParams,
  PolymeshTransaction,
  TargetTreatment,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Ballots class', () => {
  const start = new Date();
  const end = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Ballots.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getOne', () => {
    let getCorporateActionWithDescriptionSpy: jest.SpyInstance;
    let meshCorporateActionToCorporateActionParamsSpy: jest.SpyInstance;
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'stringToAssetId').mockImplementation();
      jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockImplementation();
      getCorporateActionWithDescriptionSpy = jest.spyOn(
        utilsInternalModule,
        'getCorporateActionWithDescription'
      );
      meshCorporateActionToCorporateActionParamsSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateActionToCorporateActionParams'
      );
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the requested Ballot', async () => {
      const context = dsMockUtils.getContextInstance();
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const queryMultiMock = dsMockUtils.getQueryMultiMock();

      const mockDescription = dsMockUtils.createMockBytes('ballot details');
      const mockDeclarationDate = new Date();
      const mockCorporateActionParams: CorporateActionParams = {
        kind: CorporateActionKind.IssuerNotice,
        declarationDate: mockDeclarationDate,
        description: 'ballot details',
        targets: {
          identities: [],
          treatment: TargetTreatment.Include,
        },
        defaultTaxWithholding: new BigNumber(0),
        taxWithholdings: [],
      };

      when(getCorporateActionWithDescriptionSpy).calledWith(asset, id, context).mockResolvedValue({
        corporateAction: mockCorporateActionParams,
        description: mockDescription,
      });

      when(meshCorporateActionToCorporateActionParamsSpy)
        .calledWith(mockCorporateActionParams, mockDescription, context)
        .mockReturnValue(mockCorporateActionParams);

      dsMockUtils.createQueryMock('corporateBallot', 'rcv');
      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges');

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockBool(false),
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
            {
              start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
              end: dsMockUtils.createMockMoment(new BigNumber(end.getTime())),
            },
            false
          )
        ),
      ]);

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
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
          )
        ),
      });

      const target = new Ballots(asset, context);

      const ballot = await target.getOne({ id });

      expect(ballot.ballot.id).toEqual(id);
      expect(ballot.details.startDate).toEqual(start);
      expect(ballot.details.endDate).toEqual(end);
      expect(ballot.details.rcv).toEqual(false);
      expect(ballot.details.meta).toEqual({
        title: 'Test Ballot',
        motions: [
          {
            title: 'Test Motion Title',
            infoLink: 'https://example.com',
            choices: ['Yes', 'No', 'Abstain'],
          },
        ],
      });
    });
  });

  describe('method: get', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all existing Ballots for the Asset', async () => {
      /* eslint-disable @typescript-eslint/naming-convention */
      const params = {
        declDate: new BigNumber(new Date().getTime()),
        recordDate: null,
        targets: {
          identities: [],
          treatment: TargetTreatment.Include,
        },
        defaultWithholdingTax: new BigNumber(0),
        withholdingTax: [],
      };
      /* eslint-enable @typescript-eslint/naming-convention */

      const context = dsMockUtils.getContextInstance();
      const assetId = '12341234-1234-1234-1234-123412341234';
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });

      const ballotId = new BigNumber(2);
      const ballotWithoutDetailsId = new BigNumber(3);
      const mockCaId = dsMockUtils.createMockU32(new BigNumber(1));
      const mockCaIdWithBallot = dsMockUtils.createMockU32(ballotId);
      const mockCaIdWithEmptyBallot = dsMockUtils.createMockU32(ballotWithoutDetailsId);
      const mockCorporateAction = dsMockUtils.createMockCorporateAction();
      const mockCorporateActionWithBallot = dsMockUtils.createMockCorporateAction({
        ...params,
        kind: dsMockUtils.createMockCaKind('IssuerNotice'),
      });
      const mockCorporateActionWithEmptyBallot = dsMockUtils.createMockCorporateAction({
        ...params,
        kind: dsMockUtils.createMockCaKind('IssuerNotice'),
      });
      const getCorporateBallotDetailsOrNullSpy = jest.spyOn(
        utilsInternalModule,
        'getCorporateBallotDetailsOrNull'
      );
      const mockDetails = {
        startDate: new Date(),
        endDate: new Date(),
        meta: {
          title: 'test',
          motions: [],
        },
        rcv: false,
      };
      const mockDescription = dsMockUtils.createMockBytes('ballot details');
      const mockCorporateActionParams = {
        kind: CorporateActionKind.IssuerNotice,
        declarationDate: new Date(),
        description: 'ballot details',
        targets: {
          identities: [],
          treatment: TargetTreatment.Include,
        },
        defaultTaxWithholding: new BigNumber(0),
        taxWithholdings: [],
      };

      const meshCorporateActionToCorporateActionParamsSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateActionToCorporateActionParams'
      );
      const u32ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u32ToBigNumber');

      when(u32ToBigNumberSpy).calledWith(mockCaId).mockReturnValue(ballotId);
      when(u32ToBigNumberSpy).calledWith(mockCaIdWithBallot).mockReturnValue(ballotId);
      when(u32ToBigNumberSpy)
        .calledWith(mockCaIdWithEmptyBallot)
        .mockReturnValue(ballotWithoutDetailsId);

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        entries: [
          [[assetId, mockCaId], dsMockUtils.createMockOption(mockCorporateAction)],
          [
            [assetId, mockCaIdWithBallot],
            dsMockUtils.createMockOption(mockCorporateActionWithBallot),
          ],
          [
            [assetId, mockCaIdWithEmptyBallot],
            dsMockUtils.createMockOption(mockCorporateActionWithEmptyBallot),
          ],
        ],
      });

      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: mockDescription,
      });

      when(getCorporateBallotDetailsOrNullSpy)
        .calledWith(asset, ballotId, context)
        .mockResolvedValue(mockDetails);

      when(getCorporateBallotDetailsOrNullSpy)
        .calledWith(asset, ballotWithoutDetailsId, context)
        .mockResolvedValue(null);

      when(meshCorporateActionToCorporateActionParamsSpy)
        .calledWith(mockCorporateActionWithBallot, mockDescription, context)
        .mockReturnValue(mockCorporateActionParams);

      const ballots = await new Ballots(asset, context).get();

      expect(getCorporateBallotDetailsOrNullSpy).toHaveBeenCalledWith(asset, ballotId, context);
      expect(getCorporateBallotDetailsOrNullSpy).toHaveBeenCalledWith(
        asset,
        ballotWithoutDetailsId,
        context
      );
      expect(meshCorporateActionToCorporateActionParamsSpy).toHaveBeenCalledWith(
        mockCorporateActionWithBallot,
        mockDescription,
        context
      );

      expect(ballots.length).toBe(1);
      expect(ballots[0].ballot.id.isEqualTo(ballotId)).toBe(true);
    });
  });

  describe('method: create', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const ballots = new Ballots(asset, context);

      const args = { id: 'bar' } as unknown as CreateBallotParams;

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<CorporateBallotWithDetails>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await ballots.create(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
