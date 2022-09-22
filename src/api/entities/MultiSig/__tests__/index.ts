import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Account, Context, MultiSig, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockAccountId,
  createMockIdentityId,
  createMockOption,
  createMockSignatory,
  createMockU64,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/MultiSigProposal',
  require('~/testUtils/mocks/entities').mockMultiSigProposalModule(
    '~/api/entities/MultiSigProposal'
  )
);

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
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
      expect(result).toMatchObject({
        id,
        multiSig: expect.objectContaining({ address }),
      });
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

  describe('method: getProposals', () => {
    const id = new BigNumber(1);
    it('should get proposals', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalIds', {
        entries: [[[''], createMockOption(createMockU64(id))]],
      });
      const result = await multiSig.getProposals();

      expect(result).toMatchObject([{ multiSig: expect.objectContaining({ address }), id }]);
    });

    it('should return an empty array if no proposals are pending', async () => {
      dsMockUtils.createQueryStub('multiSig', 'proposalIds', {
        entries: [],
      });

      const result = await multiSig.getProposals();

      expect(result).toEqual([]);
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
    const account = entityMockUtils.getAccountInstance({ address });
    it('should prepare the procedure and return the resulting transaction queue', async () => {
      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;
      const args = {
        signers: [account],
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { multiSig, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const queue = await multiSig.modify(args);

      expect(queue).toBe(expectedTransaction);
    });
  });
});
