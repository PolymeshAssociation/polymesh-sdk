import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Ballots } from '~/api/entities/Asset/Fungible/CorporateActions/Ballots';
import { Namespace, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCorporateBallot } from '~/testUtils/mocks/entities';
import {
  CorporateBallotWithDetails,
  CreateBallotParams,
  ErrorCode,
  PolymeshTransaction,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'stringToAssetId').mockImplementation();
      jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the requested Ballot', async () => {
      const context = dsMockUtils.getContextInstance();
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);

      const queryMultiMock = dsMockUtils.getQueryMultiMock();

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions');
      dsMockUtils.createQueryMock('corporateAction', 'details');
      dsMockUtils.createQueryMock('corporateBallot', 'rcv');
      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges');

      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: 'IssuerNotice',
            targets: {
              identities: ['someDid'],
              treatment: 'Include',
            },
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: new BigNumber(start.getTime()),
            record_date: null,
            default_withholding_tax: new BigNumber(0),
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
        dsMockUtils.createMockBytes('ballot details'),
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

      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const target = new Ballots(asset, context);

      const ballot = await target.getOne({ id });

      expect(ballot.ballot.id).toEqual(id);
      expect(ballot.details.declarationDate).toEqual(start);
      expect(ballot.details.startDate).toEqual(start);
      expect(ballot.details.endDate).toEqual(end);
      expect(ballot.details.description).toEqual('ballot details');
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
    const assetId = '12341234-1234-1234-1234-123412341234';
    let target: Ballots;
    let mockBallot: MockCorporateBallot;

    beforeAll(() => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      jest.spyOn(utilsConversionModule, 'u32ToBigNumber').mockReturnValue(new BigNumber(2));

      mockBallot = entityMockUtils.getCorporateBallotInstance({ id: new BigNumber(0), assetId });
      target = new Ballots(asset, context);

      dsMockUtils.createQueryMock('corporateAction', 'caIdSequence', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(2)),
      });

      jest.spyOn(target, 'getOne').mockImplementation(({ id }) => {
        if (id.isEqualTo(0)) {
          return Promise.resolve({
            ballot: mockBallot,
            details: {},
          } as unknown as CorporateBallotWithDetails);
        } else if (id.isEqualTo(1)) {
          return Promise.reject(
            new PolymeshError({
              code: ErrorCode.DataUnavailable,
              message: 'The CorporateBallot does not exist',
            })
          );
        }
        return Promise.reject(new Error('Unexpected id'));
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all existing Ballots for the Asset', async () => {
      const ballots = await target.get();

      expect(ballots.length).toBe(1);
      expect(ballots[0].ballot.id.isEqualTo(new BigNumber(0))).toBe(true);
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
