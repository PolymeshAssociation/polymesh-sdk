import BigNumber from 'bignumber.js';

import { HistoricalMultiSigProposal } from '~/api/entities/HistoricalMultiSigProposal';
import { Account, Context } from '~/internal';
import { multiSigProposalQuery, multiSigProposalVotesQuery } from '~/middleware/queries';
import { SignerTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { MultiSigProposalVoteActionEnum } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

const historicalProposalData = {
  id: 'someAddress/1',
  proposalId: 1,
  multisigId: 'someAddress',
};

describe('HistoricalMultiSigProposal class', () => {
  let context: Mocked<Context>;
  let historicalMultiSigProposal: HistoricalMultiSigProposal;
  const blockNumber = new BigNumber(1234);
  const blockDate = new Date('4/14/2020');
  const eventIdx = new BigNumber(1);
  const blockHash = 'blockHash';

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    historicalMultiSigProposal = new HistoricalMultiSigProposal(
      {
        proposalId: historicalProposalData.proposalId,
        multiSigAddress: historicalProposalData.multisigId,
      },
      context
    );
  });

  describe('method: votes', () => {
    it('should return votes for the MultiSigProposal', async () => {
      jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();
      const { multisigId, proposalId } = historicalProposalData;
      const voter = 'voter';
      const action = MultiSigProposalVoteActionEnum.Approved;

      dsMockUtils.createApolloQueryMock(
        multiSigProposalVotesQuery({
          proposalId: `${multisigId}/${proposalId}`,
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

      const result = await historicalMultiSigProposal.votes();
      const mockVoter = new Account({ address: voter }, context);

      const fakeResult = [
        { blockNumber, blockHash, blockDate, eventIndex: eventIdx, action, signer: mockVoter },
      ];

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: createdAt', () => {
    it('should return a human readable version of the entity', async () => {
      dsMockUtils.createApolloQueryMock(
        multiSigProposalQuery({
          multisigId: historicalProposalData.multisigId,
          proposalId: historicalProposalData.proposalId,
        }),
        {
          multiSigProposals: {
            nodes: [
              {
                creatorAccount: 'creator',
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

      const result = await historicalMultiSigProposal.createdAt();

      expect(result).toEqual({ blockNumber, blockHash, blockDate, eventIndex: eventIdx });
    });
  });

  describe('method: creator', () => {
    it('should return a human readable version of the entity', async () => {
      dsMockUtils.createApolloQueryMock(
        multiSigProposalQuery({
          multisigId: historicalProposalData.multisigId,
          proposalId: historicalProposalData.proposalId,
        }),
        {
          multiSigProposals: {
            nodes: [
              {
                creatorAccount: 'creator',
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

      const result = await historicalMultiSigProposal.creator();

      expect(result).toEqual(
        expect.objectContaining({
          address: 'creator',
        })
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      const { multisigId, proposalId } = historicalProposalData;

      expect(historicalMultiSigProposal.toHuman()).toEqual({
        proposalId,
        multiSigAddress: multisigId,
      });
    });
  });
});
