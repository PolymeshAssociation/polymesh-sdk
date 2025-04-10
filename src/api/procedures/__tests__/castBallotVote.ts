import {
  PalletCorporateActionsBallotBallotVote,
  PalletCorporateActionsCaId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  assertBallotIsActive,
  assertMotionVotes,
  assertRcvVoting,
  assertVoteCount,
  castBallotVote,
  getAuthorization,
  Params,
  prepareCastBallotVote,
} from '~/api/procedures/castBallotVote';
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

describe('castBallotVote procedure', () => {
  const assetId = '12341234-1234-1234-1234-123412341234';
  const ballotId = new BigNumber(1);

  let asset: FungibleAsset;
  let ballot: CorporateBallot;
  let ballotDetails: CorporateBallotParams;

  let proc: Procedure<Params, void>;

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
      startDate: new Date(new Date().getTime() - 500000),
      endDate: new Date(new Date().getTime() + 1000000),
      description: 'description',
      meta: {
        title: 'title',
        motions: [
          {
            title: 'motion 1',
            choices: ['yes', 'no', 'abstain'],
            infoLink: 'https://info.com',
          },
        ],
      },
      rcv: true,
      declarationDate: new Date(new Date().getTime() + 500000),
    };

    ballot = entityMockUtils.getCorporateBallotInstance({
      id: ballotId,
      assetId,
      details: ballotDetails,
    });
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    proc = procedureMockUtils.getInstance<Params, void>(mockContext);
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

  describe('assertBallotIsActive', () => {
    it('should throw if the ballot is not active', () => {
      expect(() =>
        assertBallotIsActive({
          ...ballotDetails,
          startDate: new Date('10/14/1987'),
          endDate: new Date('10/14/1988'),
        })
      ).toThrow('Ballot is not active');
    });
  });

  describe('assertRcvVoting', () => {
    it('should throw if the ballot is not rcv voting but fallback values provided', () => {
      const testBallotDetails = {
        ...ballotDetails,
        rcv: false,
      };
      const testVotes = [[{ fallback: new BigNumber(0), power: new BigNumber(1) }]];

      expect(() => assertRcvVoting(testBallotDetails, testVotes)).toThrow(
        'Fallback votes are not allowed for this ballot'
      );
    });
  });

  describe('assertVoteCount', () => {
    it('should throw if the number of votes does not match the number of choices', () => {
      expect(() =>
        assertVoteCount(ballotDetails, [[{ fallback: new BigNumber(0), power: new BigNumber(1) }]])
      ).toThrow('Number of votes must match total number choices in all motions');
    });
  });

  describe('assertMotionVotes', () => {
    it('should throw if the number of votes does not match the number of choices', () => {
      expect(() =>
        assertMotionVotes(
          [{ fallback: new BigNumber(0), power: new BigNumber(1) }],
          ballotDetails.meta.motions[0]
        )
      ).toThrow('Number of votes must match number of choices in motion');
    });

    it('should throw if the fallback vote is out of bounds', () => {
      expect(() =>
        assertMotionVotes(
          [
            { fallback: new BigNumber(3), power: new BigNumber(1) },
            { power: new BigNumber(0) },
            { power: new BigNumber(0) },
          ],
          ballotDetails.meta.motions[0]
        )
      ).toThrow('Fallback vote must point to a choice in the motion');
    });

    it('should throw if the fallback vote is the same as the vote', () => {
      expect(() =>
        assertMotionVotes(
          [
            { fallback: new BigNumber(0), power: new BigNumber(1) },
            { power: new BigNumber(1) },
            { power: new BigNumber(1) },
          ],
          ballotDetails.meta.motions[0]
        )
      ).toThrow('Fallback vote cannot point to the same choice as the vote');
    });
  });

  describe('prepareCastBallotVote', () => {
    beforeEach(() => {
      jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockResolvedValue({
        ...ballotDetails,
        startDate: new Date('10/14/1987'),
        endDate: new Date(new Date().getTime() + 1000000),
      });
    });

    it('should add a vote transaction to the batch', async () => {
      const transaction = dsMockUtils.createTxMock('corporateBallot', 'vote');
      const mockRawVotes = ['MOCK VOTE 1', 'MOCK VOTE 2', 'MOCK VOTE 3'];
      const ballotVoteToMeshBallotVoteSpy = jest.spyOn(
        utilsConversionModule,
        'ballotVoteToMeshBallotVote'
      );

      const votes = [
        [
          { power: new BigNumber(90) },
          { power: new BigNumber(50), fallback: new BigNumber(0) },
          { power: new BigNumber(0) },
        ],
      ];

      when(ballotVoteToMeshBallotVoteSpy)
        .calledWith(new BigNumber(90), undefined, mockContext)
        .mockReturnValue(mockRawVotes[0] as unknown as PalletCorporateActionsBallotBallotVote);
      when(ballotVoteToMeshBallotVoteSpy)
        .calledWith(new BigNumber(50), new BigNumber(0), mockContext)
        .mockReturnValue(mockRawVotes[1] as unknown as PalletCorporateActionsBallotBallotVote);
      when(ballotVoteToMeshBallotVoteSpy)
        .calledWith(new BigNumber(0), undefined, mockContext)
        .mockReturnValue(mockRawVotes[2] as unknown as PalletCorporateActionsBallotBallotVote);

      const result = await prepareCastBallotVote.call(proc, {
        asset,
        ballot,
        votes,
      });

      expect(result).toEqual({
        transaction,
        args: [rawCaId, mockRawVotes],
        resolver: undefined,
      });
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        asset,
        ballot,
        votes: [[{ fallback: new BigNumber(0), power: new BigNumber(1) }]],
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateBallot.Vote],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('castBallotVote', () => {
    it('should be instance of Procedure', async () => {
      expect(castBallotVote()).toBeInstanceOf(Procedure);
    });
  });
});
