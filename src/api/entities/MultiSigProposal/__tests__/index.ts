import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, MultiSig, PolymeshError, PolymeshTransaction } from '~/internal';
import { multiSigProposalQuery, multiSigProposalVotesQuery } from '~/middleware/queries/multisigs';
import { MultiSigProposalVoteActionEnum, SignerTypeEnum } from '~/middleware/types';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockMoment, createMockOption } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, MultiSigProposalAction, ProposalStatus } from '~/types';
import { tuple } from '~/types/utils';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account/MultiSig',
  require('~/testUtils/mocks/entities').mockMultiSigModule('~/api/entities/Account/MultiSig')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('MultiSigProposal class', () => {
  let context: Mocked<Context>;

  let address: string;
  let proposal: MultiSigProposal;
  let id: BigNumber;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();

    address = 'someAddress';
    id = new BigNumber(1);
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    proposal = new MultiSigProposal({ multiSigAddress: address, id }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should extend Entity', () => {
    expect(MultiSig.prototype).toBeInstanceOf(Account);
  });

  describe('method: details', () => {
    it('should return the details of the MultiSigProposal', async () => {
      dsMockUtils.createQueryMock('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: new BigNumber(1),
          rejections: new BigNumber(1),
          status: dsMockUtils.createMockProposalStatus('ActiveOrExpired'),
          autoClose: true,
          expiry: createMockOption(createMockMoment(new BigNumber(3))),
        }),
      });

      const mockProposal = dsMockUtils.createMockCall({
        args: ['ABC'],
        method: 'reserveTicker',
        section: 'asset',
      });
      mockProposal.toJSON = jest.fn().mockReturnValue({ args: ['ABC'] });
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        returnValue: createMockOption(mockProposal),
      });
      dsMockUtils.createQueryMock('multiSig', 'votes', {
        entries: [
          tuple(
            [
              [dsMockUtils.createMockAccountId(), dsMockUtils.createMockU64()],
              dsMockUtils.createMockSignatory({
                Account: dsMockUtils.createMockAccountId(DUMMY_ACCOUNT_ID),
              }),
            ],
            dsMockUtils.createMockBool(true)
          ),
          tuple(
            [
              [dsMockUtils.createMockAccountId(), dsMockUtils.createMockU64()],
              dsMockUtils.createMockSignatory({
                Identity: dsMockUtils.createMockIdentityId('some_did'),
              }),
            ],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      let result = await proposal.details();

      expect(result).toEqual({
        approvalAmount: new BigNumber(1),
        args: ['ABC'],
        autoClose: undefined,
        expiry: new Date(3),
        rejectionAmount: new BigNumber(1),
        status: ProposalStatus.Expired,
        txTag: 'asset.reserveTicker',
        voted: [new Account({ address: DUMMY_ACCOUNT_ID }, dsMockUtils.getContextInstance())],
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: new BigNumber(1),
          rejections: new BigNumber(1),
          status: dsMockUtils.createMockProposalStatus('ActiveOrExpired'),
          autoClose: true,
          expiry: createMockOption(),
        }),
      });

      result = await proposal.details();

      expect(result).toEqual({
        approvalAmount: new BigNumber(1),
        args: ['ABC'],
        autoClose: undefined,
        expiry: null,
        rejectionAmount: new BigNumber(1),
        status: ProposalStatus.Active,
        txTag: 'asset.reserveTicker',
        voted: [new Account({ address: DUMMY_ACCOUNT_ID }, dsMockUtils.getContextInstance())],
      });
    });

    it('should throw an error if no data is returned', () => {
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        returnValue: createMockOption(),
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: new BigNumber(1),
          rejections: new BigNumber(1),
          status: dsMockUtils.createMockProposalStatus('ActiveOrExpired'),
          autoClose: true,
          expiry: null,
        }),
      });

      dsMockUtils.createQueryMock('multiSig', 'votes', {
        entries: [],
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Proposal with ID: "1" was not found. It may have already been executed',
      });

      return expect(proposal.details()).rejects.toThrowError(expectedError);
    });
  });

  describe('method: exists', () => {
    it('should return true if the MultiSigProposal is present on chain', async () => {
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCall({
            args: [],
            method: 'Asset',
            section: 'create',
          })
        ),
      });

      const result = await proposal.exists();
      expect(result).toBe(true);
    });

    it('should return false if the MultiSigProposal is not present on chain', async () => {
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const result = await proposal.exists();
      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable representation of the entity', () => {
      const result = proposal.toHuman();
      expect(result).toEqual({ id: '1', multiSigAddress: 'someAddress' });
    });
  });

  describe('method: votes', () => {
    it('should return the votes for the MultiSigProposal', async () => {
      jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();

      const voter = 'voter';
      const blockNumber = new BigNumber(1234);
      const blockDate = new Date('4/14/2020');
      const eventIdx = new BigNumber(1);
      const blockHash = 'blockHash';
      const action = MultiSigProposalVoteActionEnum.Approved;

      dsMockUtils.createApolloQueryMock(
        multiSigProposalVotesQuery({
          proposalId: `${address}/${id.toString()}`,
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

      const mockVoter = new Account({ address: voter }, context);
      jest.spyOn(utilsConversionModule, 'signerValueToSigner').mockReturnValue(mockVoter);

      const fakeResult = [
        { blockNumber, blockHash, blockDate, eventIndex: eventIdx, action, signer: mockVoter },
      ];

      const result = await proposal.votes();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: createdAt and method: creator', () => {
    const blockNumber = new BigNumber(1234);
    const blockDate = new Date('4/14/2020');
    const eventIdx = new BigNumber(1);
    const blockHash = 'blockHash';

    beforeEach(() => {
      jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();

      dsMockUtils.createApolloQueryMock(
        multiSigProposalQuery({
          multisigId: address,
          proposalId: id.toNumber(),
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
    });

    describe('method: createdAt', () => {
      it('should return the event details when the MultiSig proposal was created', async () => {
        let result = await proposal.createdAt();
        expect(result).toEqual({ blockNumber, blockHash, blockDate, eventIndex: eventIdx });

        dsMockUtils.createApolloQueryMock(
          multiSigProposalQuery({
            multisigId: address,
            proposalId: id.toNumber(),
          }),
          {
            multiSigProposals: {
              nodes: [],
            },
          }
        );

        result = await proposal.createdAt();
        expect(result).toBeNull();
      });
    });

    describe('method: creator', () => {
      it('should return the creator of the MultiSig proposal', async () => {
        let result = await proposal.creator();
        expect(result).toEqual(
          expect.objectContaining({
            address: 'creator',
          })
        );

        dsMockUtils.createApolloQueryMock(
          multiSigProposalQuery({
            multisigId: address,
            proposalId: id.toNumber(),
          }),
          {
            multiSigProposals: {
              nodes: [],
            },
          }
        );

        result = await proposal.creator();
        expect(result).toBeNull();
      });
    });
  });

  describe('method: approve', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { proposal, action: MultiSigProposalAction.Approve },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockReturnValue(expectedTransaction);

      const tx = await proposal.approve();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: reject', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { proposal, action: MultiSigProposalAction.Reject },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockReturnValue(expectedTransaction);

      const tx = await proposal.reject();

      expect(tx).toBe(expectedTransaction);
    });
  });
});
