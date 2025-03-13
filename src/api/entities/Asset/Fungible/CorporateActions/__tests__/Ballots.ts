import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Ballots } from '~/api/entities/Asset/Fungible/CorporateActions/Ballots';
import { CorporateBallot, Namespace, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCorporateBallot } from '~/testUtils/mocks/entities';
import { CreateBallotParams, ErrorCode, PolymeshTransaction } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

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
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(
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
      });

      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockBytes('ballot details'),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'rcv', {
        returnValue: dsMockUtils.createMockBool(false),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
            {
              start: dsMockUtils.createMockMoment(new BigNumber(start.getTime())),
              end: dsMockUtils.createMockMoment(new BigNumber(end.getTime())),
            },
            false
          )
        ),
      });

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

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const target = new Ballots(asset, context);

      const ballot = await target.getOne({ id });

      expect(ballot.id).toEqual(id);
      expect(ballot.asset.id).toBe(assetId);
      expect(ballot.declarationDate).toEqual(start);
      expect(ballot.startDate).toEqual(start);
      expect(ballot.endDate).toEqual(end);
      expect(ballot.description).toEqual('ballot details');
      expect(ballot.rcv).toEqual(false);
      expect(ballot.meta).toEqual({
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

    it('should throw an error if the Ballot does not exist', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockBytes(),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'rcv', {
        returnValue: dsMockUtils.createMockBool(),
      });

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const target = new Ballots(asset, context);

      await expect(target.getOne({ id })).rejects.toThrow('The Ballot does not exist');
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
          return Promise.resolve(mockBallot);
        } else if (id.isEqualTo(1)) {
          return Promise.reject(
            new PolymeshError({
              code: ErrorCode.DataUnavailable,
              message: 'The Ballot does not exist',
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
      expect(ballots[0].id.isEqualTo(new BigNumber(0))).toBe(true);
      expect(ballots[0].asset.id).toBe(assetId);
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

      const args = { foo: 'bar' } as unknown as CreateBallotParams;

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<CorporateBallot>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await ballots.create(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
