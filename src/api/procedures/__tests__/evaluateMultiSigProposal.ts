import { u64 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesSecondaryKeySignatory } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  MultiSigProposalVoteParams,
  prepareMultiSigProposalEvaluation,
} from '~/api/procedures/evaluateMultiSigProposal';
import { Context, MultiSigProposal, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, Identity, MultiSigProposalAction, ProposalStatus, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Base',
  require('~/testUtils/mocks/entities').mockBaseAssetModule('~/api/entities/Asset/Base')
);

describe('evaluateMultiSigProposal', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountId: jest.SpyInstance;
  let bigNumberToU64Spy: jest.SpyInstance;
  let signerToSignatorySpy: jest.SpyInstance;
  let multiSigAddress: string;
  let proposalId: BigNumber;
  let rawMultiSigAccount: AccountId;
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
    proposalId = new BigNumber(1);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({
      signingAddress: 'someAddress',
    });

    votesQuery = dsMockUtils.createQueryMock('multiSig', 'votes');

    rawMultiSigAccount = dsMockUtils.createMockAccountId(multiSigAddress);
    when(stringToAccountId)
      .calledWith(multiSigAddress, mockContext)
      .mockReturnValue(rawMultiSigAccount);

    rawProposalId = dsMockUtils.createMockU64(proposalId);
    when(bigNumberToU64Spy).calledWith(proposalId, mockContext).mockReturnValue(rawProposalId);

    rawSigner = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId('someAddress'),
    });

    creator = entityMockUtils.getIdentityInstance();
    when(signerToSignatorySpy).mockReturnValue(rawSigner);

    proposalDetails = {
      status: ProposalStatus.Active,
    };
    proposal = entityMockUtils.getMultiSigProposalInstance({
      id: proposalId,
      multiSig: entityMockUtils.getMultiSigInstance({
        address: multiSigAddress,
        getCreator: creator,
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
    it('should throw an error if the signing Account has already voted for the proposal', async () => {
      votesQuery.mockResolvedValueOnce(dsMockUtils.createMockBool(true));

      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The signing Account has already voted for this MultiSig Proposal',
      });

      await expect(
        prepareMultiSigProposalEvaluation.call(proc, {
          proposal,
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
          }),
          details: {
            status: errorCase[0],
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

      const transaction = dsMockUtils.createTxMock('multiSig', 'approveAsKey');

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

    it('should return a rejectAsKey transaction spec', async () => {
      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);

      const transaction = dsMockUtils.createTxMock('multiSig', 'rejectAsKey');

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

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<MultiSigProposalVoteParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(
        boundFunc({
          proposal,
          action: MultiSigProposalAction.Approve,
        })
      ).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.ApproveAsKey],
          assets: [],
          portfolios: [],
        },
      });

      expect(
        boundFunc({
          proposal,
          action: MultiSigProposalAction.Reject,
        })
      ).toEqual({
        permissions: {
          transactions: [TxTags.multiSig.RejectAsKey],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
