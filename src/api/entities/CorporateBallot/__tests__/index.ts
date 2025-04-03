import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { CorporateBallotStatus } from '~/api/entities/CorporateBallot/types';
import { Context, CorporateBallot, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';
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
  const declarationDate = new Date();
  const startDate = new Date();
  const endDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);
  const description = 'Test Description';

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
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrNull').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate,
        endDate,
        rcv: false,
      });

      let result = await corporateBallot.exists();

      expect(result).toBe(true);

      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrNull').mockResolvedValue(null);

      result = await corporateBallot.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(corporateBallot.toHuman()).toEqual({
        id: '1',
        assetId: '12341234-1234-1234-1234-123412341234',
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
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate,
        endDate,
        rcv: false,
      });

      const details = await corporateBallot.details();

      expect(details).toEqual({
        declarationDate,
        description,
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
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
        endDate: new Date(new Date().getTime() + 2000 * 60 * 60 * 24 * 30),
        rcv: false,
      });

      let status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Pending);

      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate: new Date(new Date().getTime() - 2000 * 60 * 60 * 24 * 30),
        endDate: new Date(new Date().getTime() + 2000 * 60 * 60 * 24 * 30),
        rcv: false,
      });

      status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Active);

      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate: new Date(new Date().getTime() - 2000 * 60 * 60 * 24 * 30),
        endDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30),
        rcv: false,
      });

      status = await corporateBallot.status();

      expect(status).toEqual(CorporateBallotStatus.Closed);
    });
  });

  describe('method: results', () => {
    it('should return the results of the CorporateBallot', async () => {
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate,
        endDate,
        rcv: false,
      });

      const mockResults = ['100', '200', '300'];

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
            title: mockBallotMeta.motions[0].title,
            infoLink: mockBallotMeta.motions[0].infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0].choices[0],
                votes: new BigNumber(mockResults[0]),
              },
              {
                choice: mockBallotMeta.motions[0].choices[1],
                votes: new BigNumber(mockResults[1]),
              },
              {
                choice: mockBallotMeta.motions[0].choices[2],
                votes: new BigNumber(mockResults[2]),
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
    it('should return the votes of the CorporateBallot by identity', async () => {
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        declarationDate,
        description,
        meta: mockBallotMeta,
        startDate,
        endDate,
        rcv: false,
      });

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
          fallback: dsMockUtils.createMockOption(),
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
            title: mockBallotMeta.motions[0].title,
            infoLink: mockBallotMeta.motions[0].infoLink,
            choices: [
              {
                choice: mockBallotMeta.motions[0].choices[0],
                power: new BigNumber(100),
                fallback: mockBallotMeta.motions[0].choices[1],
              },
              {
                choice: mockBallotMeta.motions[0].choices[1],
                power: new BigNumber(0),
                fallback: undefined,
              },
              {
                choice: mockBallotMeta.motions[0].choices[2],
                power: new BigNumber(0),
                fallback: undefined,
              },
            ],
          },
        ],
      });
    });
  });
});
