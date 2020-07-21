import { u32 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Identity, Proposal } from '~/api/entities';
import { createProposal } from '~/api/procedures';
import { TransactionQueue } from '~/base';
import { Context } from '~/context';
import { Governance } from '~/Governance';
import { dsMockUtils } from '~/testUtils/mocks';
import { TxTags } from '~/types';
import * as utilsModule from '~/utils';

describe('Governance class', () => {
  let context: Context;
  let governance: Governance;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
  let u32ToBigNumberStub: sinon.SinonStub<[u32], BigNumber>;
  let createProposalStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
    createProposalStub = sinon.stub(createProposal, 'prepare');
    u32ToBigNumberStub = sinon.stub(utilsModule, 'u32ToBigNumber');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    governance = new Governance(context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  describe('method: getGovernanceCommitteeMembers', () => {
    test('should retrieve a list of the identities of all active members', async () => {
      const did = 'someDid';
      const expectedMembers = [new Identity({ did }, context)];

      dsMockUtils.createQueryStub('committeeMembership', 'activeMembers', {
        returnValue: [dsMockUtils.createMockIdentityId('someDid')],
      });

      const result = await governance.getGovernanceCommitteeMembers();

      expect(result).toEqual(expectedMembers);
    });
  });

  describe('method: createProposal', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const args = {
        discussionUrl: 'www.my-proposal.com',
        description: 'A proposal',
        bondAmount: new BigNumber(1000),
        tag: TxTags.asset.RegisterTicker,
        args: ['someTicker'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Proposal>;

      createProposalStub.withArgs(args, context).resolves(expectedQueue);

      const queue = await governance.createProposal(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: minimumProposalDeposit', () => {
    let amount: BigNumber;
    let fakeBalance: Balance;
    let minimumProposalDepositStub: sinon.SinonStub;

    beforeAll(() => {
      amount = new BigNumber(5000);
      fakeBalance = dsMockUtils.createMockBalance(amount.toNumber());
    });

    beforeEach(() => {
      minimumProposalDepositStub = dsMockUtils.createQueryStub('pips', 'minimumProposalDeposit');
      balanceToBigNumberStub.withArgs(fakeBalance).returns(amount);
    });

    test('should return the minimum amount of POLYX to be used for create a referendum proposal', async () => {
      minimumProposalDepositStub.resolves(fakeBalance);

      const result = await governance.minimumProposalDeposit();

      expect(result).toBe(amount);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const callback = sinon.stub();

      minimumProposalDepositStub.callsFake(async cbFunc => {
        cbFunc(fakeBalance);
        return unsubCallback;
      });

      const result = await governance.minimumProposalDeposit(callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, amount);
    });
  });

  describe('method: proposalTimeFrames', () => {
    test('should return the number of blocks the proposal cool off period and proposal ballot are valid', async () => {
      const coolOfPeriod = new BigNumber(100);
      const proposalDuration = new BigNumber(600);

      const mockCoolOfPeriod = dsMockUtils.createMockU32(coolOfPeriod.toNumber());
      const mockProposalDuration = dsMockUtils.createMockU32(proposalDuration.toNumber());

      dsMockUtils.createQueryStub('pips', 'proposalCoolOffPeriod', {
        returnValue: mockCoolOfPeriod,
      });

      dsMockUtils.createQueryStub('pips', 'proposalDuration', {
        returnValue: mockProposalDuration,
      });

      u32ToBigNumberStub.withArgs(mockCoolOfPeriod).returns(coolOfPeriod);
      u32ToBigNumberStub.withArgs(mockProposalDuration).returns(proposalDuration);

      const result = await governance.proposalTimeFrames();

      expect(result.coolOff).toBe(coolOfPeriod.toNumber());
      expect(result.duration).toBe(proposalDuration.toNumber());
    });
  });
});
