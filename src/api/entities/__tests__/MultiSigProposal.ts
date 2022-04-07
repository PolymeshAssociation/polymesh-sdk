import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, MultiSig, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockMoment, createMockOption } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import * as utilsInternalModule from '~/utils/internal';

describe('MultiSigProposal class', () => {
  let context: Mocked<Context>;

  let address: string;
  let proposal: MultiSigProposal;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    sinon.stub(utilsInternalModule, 'assertAddressValid');

    address = 'someAddress';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    proposal = new MultiSigProposal({ multiSigAddress: address, id: new BigNumber(1) }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
    sinon.restore();
  });

  it('should extend Entity', () => {
    expect(MultiSig.prototype).toBeInstanceOf(Account);
  });

  describe('method: details', () => {
    it('should return the details of the MultiSigProposal', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: '1',
          rejections: '1',
          status: 'ActiveOrExpired',
          autoClose: true,
          expiry: createMockOption(createMockMoment()),
        }),
      });

      dsMockUtils.createQueryStub('multiSig', 'proposals', {
        returnValue: createMockOption(
          dsMockUtils.createMockProposalData({
            args: ['ABC'],
            method: 'reserveTicker',
            section: 'asset',
          })
        ),
      });

      const result = await proposal.details();

      expect(result).toBeDefined();
    });

    it('should throw an error if no data is returned', () => {
      dsMockUtils.createQueryStub('multiSig', 'proposals', {
        returnValue: createMockOption(),
      });

      dsMockUtils.createQueryStub('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: '1',
          rejections: '1',
          status: 'ActiveOrExpired',
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

    it('should throw if it receives an unexpected proposal status', () => {
      dsMockUtils.createQueryStub('multiSig', 'proposals', {
        returnValue: createMockOption(
          dsMockUtils.createMockProposalData({
            args: ['ABC'],
            method: 'reserveTicker',
            section: 'asset',
          })
        ),
      });

      dsMockUtils.createQueryStub('multiSig', 'proposalDetail', {
        returnValue: dsMockUtils.createMockProposalDetails({
          approvals: '1',
          rejections: '1',
          status: 'badStatus',
          autoClose: false,
          expiry: null,
        }),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          'Unexpected MultiSigProposal status: "badStatus". Try upgrading the SDK to the latest version. Contact the Polymesh team if the problem persists',
      });

      return expect(proposal.details()).rejects.toThrowError(expectedError);
    });
  });

  describe('method: exists', () => {
    it('should return true if the MultiSigProposal is present chain', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposals', {
        returnValue: dsMockUtils.createMockProposalData({
          args: [],
          method: 'Asset',
          section: 'create',
        }),
      });

      const result = await proposal.exists();
      expect(result).toBe(true);
    });

    it('should return false if the MultiSigProposal is not present on chain', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposals', {
        returnValue: dsMockUtils.createMockProposalData(),
      });

      const result = await proposal.exists();
      expect(result).toBe(false);
    });
  });

  describe('method: toJson', () => {
    it('should return a human readable representation of the entity', () => {
      const result = proposal.toJson();
      expect(result).toEqual('{"multiSigAddress":"someAddress","id":"1"}');
    });
  });
});
