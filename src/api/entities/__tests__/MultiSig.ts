import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { MultiSigProposal } from '~/api/entities/MultiSigProposal';
import { Account, Context, MultiSig, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockAccountId,
  createMockIdentityId,
  createMockOption,
  createMockSignatory,
  createMockU64,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TransactionQueue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/MultiSigProposal',
  require('~/testUtils/mocks/entities').mockMultiSigProposalModule(
    '~/api/entities/MultiSigProposal'
  )
);

describe('MultiSig class', () => {
  let context: Mocked<Context>;

  let address: string;
  let multiSig: MultiSig;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    sinon.stub(utilsInternalModule, 'assertAddressValid');
    sinon.stub(utilsConversionModule, 'addressToKey');

    address = 'someAddress';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    multiSig = new MultiSig({ address }, context);
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

  it('should extend Account', () => {
    expect(MultiSig.prototype).toBeInstanceOf(Account);
  });

  describe('method: details', () => {
    it('should return the details of the MultiSig', async () => {
      dsMockUtils.createQueryStub('multiSig', 'multiSigSigners', {
        entries: [
          [
            [],
            createMockSignatory({
              Identity: createMockIdentityId('def'),
            }),
          ],
          [
            [],
            createMockSignatory({
              Account: createMockAccountId('abc'),
            }),
          ],
        ],
      });

      dsMockUtils.createQueryStub('multiSig', 'multiSigSignsRequired', {
        returnValue: 2,
      });
      const result = await multiSig.details();

      expect(result).toBeDefined();
    });
  });

  describe('method: getProposal', () => {
    const id = new BigNumber(1);

    it('should return a proposal', async () => {
      entityMockUtils.configureMocks({
        multiSigProposalOptions: { exists: true },
      });
      const result = await multiSig.getProposal({ id });
      expect(result).toBeDefined();
      expect(result.id).toEqual(id);
      expect(result.multiSigAddress).toEqual(address);
    });

    it("should throw if the proposal doesn't exist", () => {
      entityMockUtils.configureMocks({
        multiSigProposalOptions: { exists: false },
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Proposal with ID "1" was not found',
      });
      return expect(multiSig.getProposal({ id })).rejects.toThrowError(expectedError);
    });
  });

  describe('method: getPendingProposals', () => {
    const id = new BigNumber(1);
    it('should get pending proposals', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalIds', {
        entries: [[[''], createMockOption(createMockU64(id))]],
      });
      const result = await multiSig.getProposals();

      const expectedProposals: MultiSigProposal[] = [
        new MultiSigProposal({ multiSigAddress: address, id }, context),
      ];

      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedProposals));
    });

    it('should return an empty array if no proposals are pending', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalIds', {
        entries: [],
      });

      const result = await multiSig.getProposals();

      const expectedProposals: MultiSigProposal[] = [];

      expect(result).toEqual(expectedProposals);
    });

    it('should throw if a pending proposal lacks an ID', () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalIds', {
        entries: [[[], createMockOption()]],
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'A Proposal was missing its ID. Perhaps it was already executed',
      });

      return expect(multiSig.getProposals()).rejects.toThrowError(expectedError);
    });
  });

  describe('method: getCreator', () => {
    it('should return the Identity of the creator of the MultiSig', async () => {
      const expectedDid = 'abc';
      dsMockUtils.createQueryStub('multiSig', 'multiSigToIdentity', {
        returnValue: createMockIdentityId(expectedDid),
      });

      const result = await multiSig.getCreator();
      return expect(result.did).toEqual(expectedDid);
    });

    it('should throw an error if there is no creator', () => {
      dsMockUtils.createQueryStub('multiSig', 'multiSigToIdentity', {
        returnValue: createMockIdentityId(),
      });
      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No creator was found for this MultiSig address',
      });

      return expect(multiSig.getCreator()).rejects.toThrowError(expectedError);
    });
  });

  describe('method: modify', () => {
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedQueue = 'someQueue' as unknown as TransactionQueue<void>;
      const args = {
        signers: [],
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { multiSig, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await multiSig.modify(args);

      expect(queue).toBe(expectedQueue);
    });
  });
});
