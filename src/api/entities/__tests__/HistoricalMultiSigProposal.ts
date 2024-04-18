import BigNumber from 'bignumber.js';

import { HistoricalMultiSigProposal } from '~/api/entities/HistoricalMultiSigProposal';
import { Account, Context } from '~/internal';
import { multiSigProposalVotesQuery } from '~/middleware/queries';
import { SignerTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { MultiSigProposalVoteActionEnum } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

const historicalProposalData = {
  id: 'someId',
  proposalId: 1,
  multisigId: 'someAddress',
  approvalCount: 1,
  rejectionCount: 1,
  creator: {
    did: 'somedid',
  },
  status: 'Pending',
  createdBlockId: '1',
  updatedBlockId: '1',
  datetime: new Date(),
};

describe('HistoricalMultiSigProposal class', () => {
  let context: Mocked<Context>;
  let historicalMultiSigProposal: HistoricalMultiSigProposal;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    historicalMultiSigProposal = new HistoricalMultiSigProposal(
      { id: historicalProposalData.id },
      historicalProposalData,
      context
    );
  });

  describe('method: getVotes', () => {
    it('should return votes for the MultiSigProposal', async () => {
      jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();

      const voter = 'voter';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'blockHash';
      const action = MultiSigProposalVoteActionEnum.Approved;

      dsMockUtils.createApolloQueryMock(
        multiSigProposalVotesQuery({
          proposalId: historicalMultiSigProposal.id,
        }),
        {
          multiSigProposalVotes: {
            nodes: [
              {
                signer: {
                  signerType: SignerTypeEnum.Account,
                  signerValue: voter,
                },
                action,
                eventIdx: eventIdx.toNumber(),
                createdBlock: {
                  blockId: blockNumber.toNumber(),
                  datetime: blockDate,
                  hash: blockHash,
                },
              },
            ],
          },
        }
      );

      const result = await historicalMultiSigProposal.getVotes();
      const mockVoter = new Account({ address: voter }, context);

      const fakeResult = [
        { blockNumber, blockHash, blockDate, eventIndex: eventIdx, action, signer: mockVoter },
      ];

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: exists', () => {
    it('should return false', async () => {
      const exists = await historicalMultiSigProposal.exists();

      expect(exists).toBeFalsy();
    });
  });

  describe('method: isEqual', () => {
    it("should return false if IDs don't match", async () => {
      const otherHistoricalMultiSigProposal = new HistoricalMultiSigProposal(
        { id: 'otherId' },
        historicalProposalData,
        context
      );

      const isEqual = historicalMultiSigProposal.isEqual(otherHistoricalMultiSigProposal);

      expect(isEqual).toBeFalsy();
    });

    it('should return true if IDs match', async () => {
      const otherHistoricalMultiSigProposal = new HistoricalMultiSigProposal(
        { id: historicalProposalData.id },
        historicalProposalData,
        context
      );

      const isEqual = historicalMultiSigProposal.isEqual(otherHistoricalMultiSigProposal);

      expect(isEqual).toBeTruthy();
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', async () => {
      expect(HistoricalMultiSigProposal.isUniqueIdentifiers({ id: 'someId' })).toBe(true);
      expect(HistoricalMultiSigProposal.isUniqueIdentifiers({})).toBe(false);
      expect(HistoricalMultiSigProposal.isUniqueIdentifiers({ id: 3 })).toBe(false);
    });
  });

  describe('property: creatorDid', () => {
    it('creatorDid should be undefined if creator not passed', async () => {
      const otherHistoricalMultiSigProposal = new HistoricalMultiSigProposal(
        { id: historicalProposalData.id },
        { ...historicalProposalData, creator: undefined },
        context
      );

      expect(otherHistoricalMultiSigProposal.creatorDid).toBeUndefined();
    });

    it('creatorDid should be defined if creator is passed', async () => {
      const otherHistoricalMultiSigProposal = new HistoricalMultiSigProposal(
        { id: historicalProposalData.id },
        historicalProposalData,
        context
      );

      expect(otherHistoricalMultiSigProposal.creatorDid).toBeDefined();
      expect(otherHistoricalMultiSigProposal.creatorDid).toEqual(
        historicalProposalData.creator.did
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const {
        id,
        proposalId,
        multisigId,
        approvalCount,
        rejectionCount,
        creator,
        status,
        createdBlockId,
        updatedBlockId,
        datetime,
      } = historicalProposalData;
      expect(historicalMultiSigProposal.toHuman()).toEqual({
        id,
        proposalId,
        multisigId,
        approvalCount,
        rejectionCount,
        creatorDid: creator.did,
        status,
        createdBlockId,
        updatedBlockId,
        datetime: datetime.toISOString(),
      });
    });
  });
});
