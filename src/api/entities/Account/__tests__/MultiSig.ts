import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Account, Context, MultiSig, PolymeshError, PolymeshTransaction } from '~/internal';
import { multiSigProposalsQuery } from '~/middleware/queries/multisigs';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import {
  createMockAccountId,
  createMockBool,
  createMockCall,
  createMockIdentityId,
  createMockMoment,
  createMockOption,
  createMockSignatory,
} from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import { AssetTx, BalancesTx, ErrorCode, ProposalStatus, UtilityTx } from '~/types';
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
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();

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
    jest.restoreAllMocks();
  });

  it('should extend Account', () => {
    expect(MultiSig.prototype).toBeInstanceOf(Account);
  });

  describe('method: details', () => {
    it('should return the details of the MultiSig', async () => {
      dsMockUtils.createQueryMock('multiSig', 'multiSigSigners', {
        entries: [
          [
            [
              createMockAccountId(),
              createMockSignatory({
                Identity: createMockIdentityId('def'),
              }),
            ],
            createMockBool(true),
          ],
          [
            [
              createMockAccountId(),
              createMockSignatory({
                Account: createMockAccountId('abc'),
              }),
            ],
            createMockBool(true),
          ],
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'multiSigSignsRequired', {
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
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        entries: [
          [
            [dsMockUtils.createMockAccountId(address), dsMockUtils.createMockU64(id)],
            createMockOption(createMockCall()),
          ],
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalStates', {
        multi: [
          dsMockUtils.createMockOption(
            dsMockUtils.createMockProposalState({
              Active: {
                until: createMockOption(
                  createMockMoment(new BigNumber(new Date().getTime() + 10000))
                ),
              },
            })
          ),
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalVoteCounts', {
        multi: [
          dsMockUtils.createMockProposalVoteCount({
            approvals: new BigNumber(1),
            rejections: new BigNumber(1),
          }),
        ],
      });

      const result = await multiSig.getProposals();

      expect(result).toMatchObject([{ multiSig: expect.objectContaining({ address }), id }]);
    });

    it('should return an empty array if no proposals are pending', async () => {
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        entries: [],
      });

      const result = await multiSig.getProposals();

      expect(result).toEqual([]);
    });

    it('should filter out non pending proposals', async () => {
      dsMockUtils.createQueryMock('multiSig', 'proposals', {
        entries: [
          [
            [dsMockUtils.createMockAccountId(address), dsMockUtils.createMockU64(id)],
            createMockOption(createMockCall()),
          ],
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalVoteCounts', {
        multi: [
          dsMockUtils.createMockProposalVoteCount({
            approvals: new BigNumber(1),
            rejections: new BigNumber(1),
          }),
        ],
      });

      dsMockUtils.createQueryMock('multiSig', 'proposalStates', {
        multi: [
          dsMockUtils.createMockProposalState({
            Active: {
              until: createMockOption(createMockMoment(new BigNumber(3))),
            },
          }),
        ],
      });

      const result = await multiSig.getProposals();

      expect(result).toMatchObject([]);
    });
  });

  describe('method: getHistoricalProposals', () => {
    let middlewareProposalStateToProposalStatusSpy: jest.SpyInstance;

    beforeEach(() => {
      middlewareProposalStateToProposalStatusSpy = jest.spyOn(
        utilsConversionModule,
        'middlewareProposalStateToProposalStatus'
      );
      when(middlewareProposalStateToProposalStatusSpy)
        .calledWith('Pending')
        .mockReturnValue(ProposalStatus.Active);
    });

    it('should get historical proposals with pagination params', async () => {
      const mockHistoricalMultisig = {
        id: 'someId',
        multisigId: address,
        proposalId: 1,
        status: 'Pending',
        approvalCount: 1,
        rejectionCount: 0,
        params: {
          expiry: null,
          isBatch: false,
          isBridge: false,
          autoClose: false,
          proposals: [
            {
              args: '{"name":"0x4d554c5449544f4b454e3100","ticker":"0x4d554c5449544f4b454e3100","divisible":false,"asset_type":"EquityPreferred","identifiers":[],"funding_round":null}',
              call: 'create_asset',
              module: 'Asset',
            },
          ],
        },
      };

      const multiSigProposalsResponse = {
        totalCount: 2,
        nodes: [mockHistoricalMultisig],
      };

      dsMockUtils.createApolloQueryMock(
        multiSigProposalsQuery(address, new BigNumber(1), new BigNumber(0)),
        {
          multiSigProposals: multiSigProposalsResponse,
        }
      );

      const result = await multiSig.getHistoricalProposals({
        size: new BigNumber(1),
        start: new BigNumber(0),
      });

      const { data, next, count } = result;

      expect(next).toEqual(new BigNumber(1));
      expect(count).toEqual(new BigNumber(2));
      expect(data.length).toEqual(1);

      expect(data[0]).toEqual({
        proposal: expect.objectContaining({
          id: new BigNumber(mockHistoricalMultisig.proposalId),
          multiSig: expect.objectContaining({ address }),
        }),
        status: ProposalStatus.Active,
        approvalAmount: new BigNumber(1),
        rejectionAmount: new BigNumber(0),
        expiry: null,
        txTag: AssetTx.CreateAsset,
        args: mockHistoricalMultisig.params.proposals[0].args,
      });
    });

    it('should get historical proposals without pagination params', async () => {
      const expiry = new Date('2050/01/01');
      const mockHistoricalMultisig = {
        id: 'someId',
        multisigId: address,
        proposalId: 1,
        status: 'Pending',
        approvalCount: 1,
        rejectionCount: 0,
        params: {
          expiry: expiry.getTime().toString(),
          isBatch: true,
          isBridge: false,
          autoClose: false,
          proposals: [
            {
              args: '{"dest":{"Id":"5DnuhGGm5PVgSWasCbUo3xknTDEeYjdEUAHEzgd93YohhjrQ"},"value":"100,000,000,000,000"}',
              call: 'transfer',
              module: 'Balances',
            },
            {
              args: '{"dest":{"Id":"5EvJiD9RDfiW7MUg3aPsUmnxzbogNpAmnHvz7nzvREEwEGZp"},"value":"200,000,000,000,000","memo":"MEMOMEMOMMEMOMEMOMEMOMEMOMEMOMEM"}',
              call: 'transfer_with_memo',
              module: 'Balances',
            },
          ],
        },
      };

      const multiSigProposalsResponse = {
        totalCount: 1,
        nodes: [mockHistoricalMultisig],
      };

      dsMockUtils.createApolloQueryMock(multiSigProposalsQuery(address), {
        multiSigProposals: multiSigProposalsResponse,
      });

      const result = await multiSig.getHistoricalProposals();

      const { data, next, count } = result;

      expect(next).toBeNull();
      expect(count).toEqual(new BigNumber(1));

      expect(data[0]).toEqual({
        proposal: expect.objectContaining({
          id: new BigNumber(mockHistoricalMultisig.proposalId),
          multiSig: expect.objectContaining({ address }),
        }),
        status: ProposalStatus.Active,
        approvalAmount: new BigNumber(1),
        rejectionAmount: new BigNumber(0),
        expiry,
        txTag: UtilityTx.Batch,
        args: [
          {
            txTag: BalancesTx.Transfer,
            args: mockHistoricalMultisig.params.proposals[0].args,
          },
          {
            txTag: BalancesTx.TransferWithMemo,
            args: mockHistoricalMultisig.params.proposals[1].args,
          },
        ],
      });
    });
  });

  describe('method: getAdmin', () => {
    it('should return the Identity of the creator of the MultiSig', async () => {
      const expectedDid = 'abc';
      dsMockUtils.createQueryMock('multiSig', 'adminDid', {
        returnValue: createMockOption(createMockIdentityId(expectedDid)),
      });

      const result = await multiSig.getAdmin();
      return expect(result?.did).toEqual(expectedDid);
    });

    it('should return null if there is no admin', () => {
      dsMockUtils.createQueryMock('multiSig', 'adminDid', {
        returnValue: createMockOption(),
      });

      return expect(multiSig.getAdmin()).resolves.toBeNull();
    });
  });

  describe('method: getPayer', () => {
    it('should return the Identity of the payer of the MultiSig', async () => {
      const expectedDid = 'abc';
      dsMockUtils.createQueryMock('multiSig', 'payingDid', {
        returnValue: createMockOption(createMockIdentityId(expectedDid)),
      });

      const result = await multiSig.getPayer();
      return expect(result?.did).toEqual(expectedDid);
    });

    it('should return null if there is no admin', () => {
      dsMockUtils.createQueryMock('multiSig', 'payingDid', {
        returnValue: createMockOption(),
      });

      return expect(multiSig.getPayer()).resolves.toBeNull();
    });
  });

  describe('method: modify', () => {
    const account = entityMockUtils.getAccountInstance({ address });
    it('should prepare the procedure and return the resulting procedure', async () => {
      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;
      const args = {
        signers: [account],
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { multiSig, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const procedure = await multiSig.modify(args);

      expect(procedure).toBe(expectedTransaction);
    });
  });

  describe('method: setAdmin', () => {
    it('should prepare the procedure and return the resulting procedure', async () => {
      const did = 'someDid';
      const admin = entityMockUtils.getIdentityInstance({ did });

      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;
      const args = {
        admin,
      };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { multiSig, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const procedure = await multiSig.setAdmin(args);

      expect(procedure).toBe(expectedTransaction);
    });
  });

  describe('method: removePayer', () => {
    it('should prepare the procedure and return the resulting procedure', async () => {
      const expectedTransaction = 'someQueue' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { multiSig }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const procedure = await multiSig.removePayer();

      expect(procedure).toBe(expectedTransaction);
    });
  });
});
