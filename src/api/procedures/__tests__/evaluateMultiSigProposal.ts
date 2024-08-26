import { u64 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKeySignatory } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  evaluateMultiSigProposal,
  MultiSigProposalVoteParams,
  prepareMultiSigProposalEvaluation,
} from '~/api/procedures/evaluateMultiSigProposal';
import { Account, Context, MultiSigProposal, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, Identity, MultiSigProposalAction, ProposalStatus } from '~/types';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('evaluateMultiSigProposal', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountId: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let signerToSignatorySpy: jest.SpyInstance;
  let multiSigAddress: string;
  let signerAddress: string;
  let otherAddress: string;
  let proposalId: BigNumber;
  let rawMultiSigAccount: AccountId;
  let rawSignerAccount: AccountId;
  let rawOtherAccount: AccountId;
  let rawProposalId: u64;
  let proposal: MultiSigProposal;
  let rawSigner: PolymeshPrimitivesSecondaryKeySignatory;
  let creator: Identity;
  let proposalDetails;
  let votesQuery: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToAccountId = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    signerToSignatorySpy = jest.spyOn(utilsConversionModule, 'signerToSignatory');

    multiSigAddress = 'multiSigAddress';
    signerAddress = 'someAddress';
    otherAddress = 'someOtherAddress';
    proposalId = new BigNumber(1);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({
      signingAddress: 'someAddress',
    });

    votesQuery = dsMockUtils.createQueryMock('multiSig', 'votes');

    rawMultiSigAccount = dsMockUtils.createMockAccountId(multiSigAddress);
    rawSignerAccount = dsMockUtils.createMockAccountId(signerAddress);
    rawOtherAccount = dsMockUtils.createMockAccountId(otherAddress);
    when(stringToAccountId)
      .calledWith(multiSigAddress, mockContext)
      .mockReturnValue(rawMultiSigAccount);

    when(stringToAccountId)
      .calledWith(signerAddress, mockContext)
      .mockReturnValue(rawSignerAccount);

    when(stringToAccountId).calledWith(otherAddress, mockContext).mockReturnValue(rawOtherAccount);

    rawProposalId = dsMockUtils.createMockU64(proposalId);
    when(bigNumberToU64Spy).calledWith(proposalId, mockContext).mockReturnValue(rawProposalId);

    rawSigner = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerAddress),
    });

    creator = entityMockUtils.getIdentityInstance();
    signerToSignatorySpy.mockReturnValue(rawSigner);

    proposalDetails = {
      status: ProposalStatus.Active,
      approvalAmount: new BigNumber(1),
      rejectionAmount: new BigNumber(0),
    };
    proposal = entityMockUtils.getMultiSigProposalInstance({
      id: proposalId,
      multiSig: entityMockUtils.getMultiSigInstance({
        address: multiSigAddress,
        getCreator: creator,
        details: {
          signers: [
            new Account({ address: 'someAddress' }, mockContext),
            new Account({ address: 'someOtherAddress' }, mockContext),
          ],
          requiredSignatures: new BigNumber(1),
        },
      }),
      details: proposalDetails,
    });

    votesQuery.mockResolvedValue(dsMockUtils.createMockBool(false));
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

  describe('prepareMultiSigProposalEvaluation', () => {
    it('should throw an error if the signing Account is not a part of the MultiSig', async () => {
      mockContext = dsMockUtils.getContextInstance({
        signingAccountIsEqual: false,
      });

      const mockSigner = mockContext.getSigningAccount();

      when(stringToAccountId)
        .calledWith(mockSigner.address, mockContext)
        .mockReturnValue(dsMockUtils.createMockAccountId('unknownAccount'));

      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing Account is not a signer of the MultiSig',
      });

      await expect(
        prepareMultiSigProposalEvaluation.call(proc, {
          proposal,
          action: MultiSigProposalAction.Approve,
        })
      ).rejects.toThrow(expectedError);
    });

    it('should throw an error if the signing Account has already voted for the proposal', async () => {
      votesQuery.mockResolvedValueOnce(dsMockUtils.createMockBool(true));

      const votedProposal = entityMockUtils.getMultiSigProposalInstance({
        id: proposalId,
        multiSig: entityMockUtils.getMultiSigInstance({
          address: multiSigAddress,
          getCreator: creator,
          details: {
            signers: [
              new Account({ address: 'someAddress' }, mockContext),
              new Account({ address: 'someOtherAddress' }, mockContext),
            ],
            requiredSignatures: new BigNumber(1),
          },
        }),
        details: {
          status: ProposalStatus.Active,
          approvalAmount: new BigNumber(1),
          rejectionAmount: new BigNumber(1),
        },
      });

      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing Account has already voted for this MultiSig Proposal',
      });

      await expect(
        prepareMultiSigProposalEvaluation.call(proc, {
          proposal: votedProposal,
          action: MultiSigProposalAction.Approve,
        })
      ).rejects.toThrow(expectedError);
      votesQuery.mockReset();
    });

    it('should throw an error if the proposal is not active', async () => {
      const errorCases: [ProposalStatus, { code: ErrorCode; message: string }][] = [
        [
          ProposalStatus.Invalid,
          {
            code: ErrorCode.DataUnavailable,
            message: 'The MultiSig Proposal does not exist',
          },
        ],
        [
          ProposalStatus.Rejected,
          {
            code: ErrorCode.UnmetPrerequisite,
            message: 'The MultiSig Proposal has already been rejected',
          },
        ],
        [
          ProposalStatus.Successful,
          {
            code: ErrorCode.UnmetPrerequisite,
            message: 'The MultiSig Proposal has already been executed',
          },
        ],
        [
          ProposalStatus.Failed,
          {
            code: ErrorCode.UnmetPrerequisite,
            message: 'The MultiSig Proposal has already been executed',
          },
        ],
        [
          ProposalStatus.Expired,
          {
            code: ErrorCode.UnmetPrerequisite,
            message: 'The MultiSig Proposal has expired',
          },
        ],
      ];

      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      for (const errorCase of errorCases) {
        proposal = entityMockUtils.getMultiSigProposalInstance({
          id: proposalId,
          multiSig: entityMockUtils.getMultiSigInstance({
            address: multiSigAddress,
            getCreator: creator,
            details: {
              signers: [
                new Account({ address: 'someAddress' }, mockContext),
                new Account({ address: 'someOtherAddress' }, mockContext),
              ],
              requiredSignatures: new BigNumber(1),
            },
          }),
          details: {
            status: errorCase[0],
            approvalAmount: new BigNumber(1),
            rejectionAmount: new BigNumber(0),
          },
        });

        const expectedError = new PolymeshError(errorCase[1]);

        await expect(
          prepareMultiSigProposalEvaluation.call(proc, {
            proposal,
            action: MultiSigProposalAction.Approve,
          })
        ).rejects.toThrow(expectedError);
      }
    });

    it('should return a approveAsKey transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const transaction = dsMockUtils.createTxMock('multiSig', 'approve');

      const result = await prepareMultiSigProposalEvaluation.call(proc, {
        proposal,
        action: MultiSigProposalAction.Approve,
      });

      expect(result).toEqual({
        transaction,
        paidForBy: creator,
        args: [rawMultiSigAccount, rawProposalId],
      });
    });

    it('should return a reject transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const transaction = dsMockUtils.createTxMock('multiSig', 'reject');

      const result = await prepareMultiSigProposalEvaluation.call(proc, {
        proposal,
        action: MultiSigProposalAction.Reject,
      });

      expect(result).toEqual({
        transaction,
        paidForBy: creator,
        args: [rawMultiSigAccount, rawProposalId],
      });
    });
  });

  describe('evaluateMultiSigProposal', () => {
    it('should return new Procedure called with prepareMultiSigProposalEvaluation', () => {
      const result = evaluateMultiSigProposal();

      expect(result).toBeInstanceOf(Procedure);
    });
  });
});
