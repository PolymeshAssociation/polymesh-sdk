import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, MultiSig, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockMoment, createMockOption } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, ProposalStatus, SignerType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Account/MultiSig',
  require('~/testUtils/mocks/entities').mockMultiSigModule('~/api/entities/Account/MultiSig')
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

      let result = await proposal.details();

      expect(result).toEqual({
        approvalAmount: new BigNumber(1),
        args: ['ABC'],
        autoClose: undefined,
        expiry: new Date(3),
        rejectionAmount: new BigNumber(1),
        status: ProposalStatus.Expired,
        txTag: 'asset.reserveTicker',
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

      const stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
      const rawMultiSigAddress = dsMockUtils.createMockAccountId(address);
      when(stringToAccountIdSpy).calledWith(address, context).mockReturnValue(rawMultiSigAddress);

      const bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
      const rawProposalId = dsMockUtils.createMockU64(id);
      when(bigNumberToU64Spy).calledWith(id, context).mockReturnValue(rawProposalId);

      const voter = 'voter';
      dsMockUtils.createQueryMock('multiSig', 'votes', {
        entries: [
          tuple(
            [rawMultiSigAddress, rawProposalId],
            dsMockUtils.createMockSignatory({
              Account: dsMockUtils.createMockAccountId(voter),
            })
          ),
        ],
      });

      jest.spyOn(utilsConversionModule, 'signatoryToSignerValue').mockReturnValue({
        type: SignerType.Account,
        value: voter,
      });

      const mockVoter = new Account({ address: voter }, context);
      jest.spyOn(utilsConversionModule, 'signerValueToSigner').mockReturnValue(mockVoter);

      const result = await proposal.votes();

      expect(result).toEqual([mockVoter]);
    });
  });
});
