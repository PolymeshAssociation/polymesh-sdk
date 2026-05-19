import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { CorporateBallotStatus } from '~/api/entities/CorporateBallot/types';
import { Context, CorporateBallot, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockCorporateBallotMeta } from '~/testUtils/mocks/dataSources';
import { ErrorCode, TargetTreatment, TaxWithholding } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CorporateBallot class', () => {
  let context: Context;

  let id: BigNumber;
  let assetId: string;
  let corporateBallot: CorporateBallot;
  let getAssetIdForMiddlewareSpy: jest.SpyInstance;

  const startDate = new Date();
  const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const declarationDate = new Date();
  const description = 'Test Description';
  const targets = {
    identities: [],
    treatment: TargetTreatment.Include,
  };
  const defaultTaxWithholding = new BigNumber(0);
  const taxWithholdings: TaxWithholding[] = [];

  const mockBallotMeta = {
    title: 'Test Ballot',
    motions: [
      {
        title: 'Test Motion Title',
        infoLink: 'https://example.com',
        choices: ['Yes', 'No', 'Abstain'],
      },
    ],
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    assetId = '12341234-1234-1234-1234-123412341234';

    corporateBallot = new CorporateBallot(
      {
        id,
        assetId,
        declarationDate,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
      },
      context
    );

    when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('constructor', () => {
    it('should assign parameters to instance', () => {
      expect(corporateBallot.id).toEqual(id);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(CorporateBallot.isUniqueIdentifiers({ assetId: 'SYMBOL', id: new BigNumber(1) })).toBe(
        true
      );
      expect(CorporateBallot.isUniqueIdentifiers({})).toBe(false);
      expect(CorporateBallot.isUniqueIdentifiers({ assetId: 'SYMBOL' })).toBe(false);
      expect(CorporateBallot.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Corporate Ballot exists', async () => {
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec({ title: dsMockUtils.createMockBytes(), motions: [] }, false)
        ),
      });

      let result = await corporateBallot.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await corporateBallot.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(corporateBallot.toHuman()).toEqual({
        id: '1',
        assetId: '12341234-1234-1234-1234-123412341234',
        declarationDate: declarationDate.toISOString(),
        description,
        targets,
        defaultTaxWithholding: defaultTaxWithholding.toString(),
        taxWithholdings,
      });
    });
  });

  describe('method: remove', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(expect.anything(), context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateBallot.remove();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: details', () => {
    it('should return the details of the CorporateBallot', async () => {
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        meta: mockBallotMeta,
        startDate,
        endDate,
        rcv: false,
      });

      const details = await corporateBallot.details();

      expect(details).toEqual({
        meta: mockBallotMeta,
        rcv: false,
        startDate,
        endDate,
      });

      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockRejectedValue(
        new PolymeshError({
          code: ErrorCode.DataUnavailable,
          message: 'The CorporateBallot does not exist',
          data: { id: corporateBallot.id },
        })
      );

      await expect(corporateBallot.details()).rejects.toThrow('The CorporateBallot does not exist');
    });
  });

  describe('method: status', () => {
    it('should return the status of the CorporateBallot', async () => {
      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
            {
              start: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).getTime())
              ),
              end: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() + 2000 * 60 * 60 * 24 * 30).getTime())
              ),
            },
            false
          )
        ),
      });

      let status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Pending);

      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
            {
              start: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() - 2000 * 60 * 60 * 24 * 30).getTime())
              ),
              end: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() + 2000 * 60 * 60 * 24 * 30).getTime())
              ),
            },
            false
          )
        ),
      });

      status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Active);

      dsMockUtils.createQueryMock('corporateBallot', 'timeRanges', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCodec(
            {
              start: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() - 2000 * 60 * 60 * 24 * 30).getTime())
              ),
              end: dsMockUtils.createMockMoment(
                new BigNumber(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).getTime())
              ),
            },
            false
          )
        ),
      });

      status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Closed);
    });
  });

  describe('method: results', () => {
    it('should throw an error if the CorporateBallot does not exist', async () => {
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });
      dsMockUtils.createQueryMock('corporateBallot', 'results');

      await expect(corporateBallot.results()).rejects.toThrow('The CorporateBallot does not exist');
    });

    it('should return 0 if no votes have been cast', async () => {
      const mockRawMeta = createMockCorporateBallotMeta(mockBallotMeta);
      const meshCorporateBallotMetaToCorporateBallotMetaSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateBallotMetaToCorporateBallotMeta'
      );

      when(meshCorporateBallotMetaToCorporateBallotMetaSpy)
        .calledWith(mockRawMeta)
        .mockReturnValue(mockBallotMeta);

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockCodec(mockRawMeta, false)),
      });
      dsMockUtils.createQueryMock('corporateBallot', 'results', {
        returnValue: dsMockUtils.createMockVec(),
      });

      const results = await corporateBallot.results();

      expect(results).toEqual({
        title: mockBallotMeta.title,
        motions: [
          {
            title: mockBallotMeta.motions[0]!.title,
            infoLink: mockBallotMeta.motions[0]!.infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0]!.choices[0],
                votes: new BigNumber(0),
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[1],
                votes: new BigNumber(0),
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[2],
                votes: new BigNumber(0),
              },
            ],
            total: new BigNumber(0),
          },
        ],
      });
    });

    it('should return the results of the CorporateBallot', async () => {
      const mockResults = ['100', '200', '300'];
      const mockRawMeta = createMockCorporateBallotMeta(mockBallotMeta);
      const meshCorporateBallotMetaToCorporateBallotMetaSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateBallotMetaToCorporateBallotMeta'
      );

      when(meshCorporateBallotMetaToCorporateBallotMetaSpy)
        .calledWith(mockRawMeta)
        .mockReturnValue(mockBallotMeta);

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockCodec(mockRawMeta, false)),
      });
      dsMockUtils.createQueryMock('corporateBallot', 'results', {
        returnValue: dsMockUtils.createMockVec(
          mockResults.map(result => dsMockUtils.createMockU128(new BigNumber(result)))
        ),
      });

      const results = await corporateBallot.results();

      expect(results).toEqual({
        title: mockBallotMeta.title,
        motions: [
          {
            title: mockBallotMeta.motions[0]!.title,
            infoLink: mockBallotMeta.motions[0]!.infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0]!.choices[0],
                votes: new BigNumber(mockResults[0]!),
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[1],
                votes: new BigNumber(mockResults[1]!),
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[2],
                votes: new BigNumber(mockResults[2]!),
              },
            ],
            total: new BigNumber(
              mockResults.reduce((acc, result) => acc.plus(result), new BigNumber(0))
            ),
          },
        ],
      });
    });
  });

  describe('method: votesByIdentity', () => {
    it('should throw an error if the CorporateBallot does not exist', async () => {
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });
      dsMockUtils.createQueryMock('corporateBallot', 'votes');
      await expect(
        corporateBallot.votesByIdentity('12341234-1234-1234-1234-123412341234')
      ).rejects.toThrow('The CorporateBallot does not exist');
    });

    it('should return the votes of the CorporateBallot by identity', async () => {
      const mockRawMeta = createMockCorporateBallotMeta(mockBallotMeta);
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockCodec(mockRawMeta, false)),
      });

      const meshCorporateBallotMetaToCorporateBallotMetaSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateBallotMetaToCorporateBallotMeta'
      );

      when(meshCorporateBallotMetaToCorporateBallotMetaSpy)
        .calledWith(mockRawMeta)
        .mockReturnValue(mockBallotMeta);

      const u16ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u16ToBigNumber');
      const u128ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u128ToBigNumber');

      const mockFallback = dsMockUtils.createMockU16(new BigNumber(1));

      const mockVotePower = dsMockUtils.createMockU128(new BigNumber(100));
      const mockVotePower2 = dsMockUtils.createMockU128(new BigNumber(0));

      when(u16ToBigNumberSpy).calledWith(mockFallback).mockReturnValue(new BigNumber(1));
      when(u128ToBigNumberSpy).calledWith(mockVotePower).mockReturnValue(new BigNumber(100));
      when(u128ToBigNumberSpy).calledWith(mockVotePower2).mockReturnValue(new BigNumber(0));

      const mockVotes = [
        {
          power: mockVotePower,
          fallback: dsMockUtils.createMockOption(mockFallback),
        },
        {
          power: mockVotePower2,
          fallback: dsMockUtils.createMockOption(),
        },
        {
          power: mockVotePower2,
        },
      ];

      dsMockUtils.createQueryMock('corporateBallot', 'votes', {
        returnValue: dsMockUtils.createMockVec(mockVotes),
      });

      const votes = await corporateBallot.votesByIdentity('12341234-1234-1234-1234-123412341234');

      expect(votes).toEqual({
        title: mockBallotMeta.title,
        motions: [
          {
            title: mockBallotMeta.motions[0]!.title,
            infoLink: mockBallotMeta.motions[0]!.infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0]!.choices[0],
                power: new BigNumber(100),
                fallback: new BigNumber(1),
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[1],
                power: new BigNumber(0),
                fallback: undefined,
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[2],
                power: new BigNumber(0),
                fallback: undefined,
              },
            ],
          },
        ],
      });
    });

    it('should return the votes of the CorporateBallot by identity', async () => {
      const mockRawMeta = createMockCorporateBallotMeta(mockBallotMeta);
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockCodec(mockRawMeta, false)),
      });

      const meshCorporateBallotMetaToCorporateBallotMetaSpy = jest.spyOn(
        utilsConversionModule,
        'meshCorporateBallotMetaToCorporateBallotMeta'
      );

      when(meshCorporateBallotMetaToCorporateBallotMetaSpy)
        .calledWith(mockRawMeta)
        .mockReturnValue(mockBallotMeta);

      dsMockUtils.createQueryMock('corporateBallot', 'votes', {
        returnValue: dsMockUtils.createMockVec(),
      });

      const votes = await corporateBallot.votesByIdentity('12341234-1234-1234-1234-123412341234');

      expect(votes).toEqual({
        title: mockBallotMeta.title,
        motions: [
          {
            title: mockBallotMeta.motions[0]!.title,
            infoLink: mockBallotMeta.motions[0]!.infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0]!.choices[0],
                power: new BigNumber(0),
                fallback: undefined,
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[1],
                power: new BigNumber(0),
                fallback: undefined,
              },
              {
                choice: mockBallotMeta.motions[0]!.choices[2],
                power: new BigNumber(0),
                fallback: undefined,
              },
            ],
          },
        ],
      });
    });
  });

  describe('method: vote', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(expect.anything(), context, {})
        .mockResolvedValue(expectedTransaction);

      const mockVote = {
        vote: 'Yes',
        power: new BigNumber(100),
        fallback: new BigNumber(0),
      };

      const tx = await corporateBallot.vote({ votes: [[mockVote]] });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: modifyCheckpoint', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const args = { checkpoint: new Date() };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          { args: { corporateAction: corporateBallot, ...args }, transformer: undefined },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateBallot.modifyCheckpoint(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
