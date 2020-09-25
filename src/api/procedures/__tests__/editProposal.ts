// NOTE uncomment in Governance v2 upgrade

describe('editProposal procedure', () => {
  test('dummy test', () => {
    expect(true).toBeTruthy();
  });
});

// import { Text } from '@polkadot/types';
// import { AccountId } from '@polkadot/types/interfaces/runtime';
// import BigNumber from 'bignumber.js';
// import sinon from 'sinon';

// import { isAuthorized, Params, prepareEditProposal } from '~/api/procedures/editProposal';
// import * as proceduresUtilsModule from '~/api/procedures/utils';
// import { Context, PostTransactionValue } from '~/base';
// import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
// import { Mocked } from '~/testUtils/types';
// import { PolymeshTx } from '~/types/internal';
// import * as utilsModule from '~/utils';

// describe('editProposal procedure', () => {
//   const pipId = new BigNumber(10);
//   const mockAddress = 'someAddress';
//   const description = 'Some Proposal';
//   const discussionUrl = 'www.proposal.com';
//   const args = {
//     description,
//     discussionUrl,
//   };
//   const proposal = ('proposal' as unknown) as PostTransactionValue<void>;
//   const rawDescription = dsMockUtils.createMockText(description);
//   const rawDiscussionUrl = dsMockUtils.createMockText(discussionUrl);

//   let mockContext: Mocked<Context>;
//   let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
//   let accountIdToStringStub: sinon.SinonStub<[AccountId], string>;
//   let addTransactionStub: sinon.SinonStub;
//   let editProposalTransaction: PolymeshTx<unknown[]>;
//   let assertProposalUnlockedStub: sinon.SinonStub;

//   beforeAll(() => {
//     dsMockUtils.initMocks({
//       contextOptions: {
//         currentPairAddress: mockAddress,
//       },
//     });
//     procedureMockUtils.initMocks();
//     entityMockUtils.initMocks();

//     stringToTextStub = sinon.stub(utilsModule, 'stringToText');
//     accountIdToStringStub = sinon.stub(utilsModule, 'accountIdToString');
//     assertProposalUnlockedStub = sinon.stub(proceduresUtilsModule, 'assertProposalUnlocked');
//   });

//   beforeEach(() => {
//     addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([proposal]);

//     editProposalTransaction = dsMockUtils.createTxStub('pips', 'amendProposal');

//     mockContext = dsMockUtils.getContextInstance();

//     stringToTextStub.withArgs(description, mockContext).returns(rawDescription);
//     stringToTextStub.withArgs(discussionUrl, mockContext).returns(rawDiscussionUrl);
//   });

//   afterEach(() => {
//     entityMockUtils.reset();
//     procedureMockUtils.reset();
//     dsMockUtils.reset();
//   });

//   afterAll(() => {
//     entityMockUtils.cleanup();
//     procedureMockUtils.cleanup();
//     dsMockUtils.cleanup();
//   });

//   test('should throw an error if the user has not passed any arguments', () => {
//     const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

//     return expect(prepareEditProposal.call(proc, ({} as unknown) as Params)).rejects.toThrow(
//       'Nothing to modify'
//     );
//   });

//   test('should assert that the proposal is not locked', async () => {
//     const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

//     await prepareEditProposal.call(proc, { pipId, ...args });

//     sinon.assert.calledWith(assertProposalUnlockedStub, pipId, mockContext);
//   });

//   test('should add an edit proposal transaction to the queue', async () => {
//     const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

//     const rawPipId = dsMockUtils.createMockPipId(pipId);
//     sinon
//       .stub(utilsModule, 'numberToPipId')
//       .withArgs(pipId, mockContext)
//       .returns(rawPipId);

//     await prepareEditProposal.call(proc, { pipId, ...args });

//     sinon.assert.calledWith(
//       addTransactionStub,
//       editProposalTransaction,
//       {},
//       rawPipId,
//       rawDiscussionUrl,
//       rawDescription
//     );

//     await prepareEditProposal.call(proc, {
//       pipId,
//       description,
//     });

//     sinon.assert.calledWith(
//       addTransactionStub,
//       editProposalTransaction,
//       {},
//       rawPipId,
//       null,
//       rawDescription
//     );

//     await prepareEditProposal.call(proc, {
//       pipId,
//       discussionUrl,
//     });

//     sinon.assert.calledWith(
//       addTransactionStub,
//       editProposalTransaction,
//       {},
//       rawPipId,
//       rawDiscussionUrl,
//       null
//     );
//   });

//   describe('isAuthorized', () => {
//     test('should return whether the current account is the owner of the proposal', async () => {
//       const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

//       accountIdToStringStub.returns(mockAddress);

//       dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
//         returnValue: dsMockUtils.createMockOption(
//           dsMockUtils.createMockPipsMetadata({
//             proposer: dsMockUtils.createMockAccountId(mockAddress),
//             // eslint-disable-next-line @typescript-eslint/camelcase
//             cool_off_until: dsMockUtils.createMockU32(),
//             end: dsMockUtils.createMockU32(),
//           })
//         ),
//       });

//       const boundFunc = isAuthorized.bind(proc);
//       let result = await boundFunc({ pipId, ...args });
//       expect(result).toBe(true);

//       dsMockUtils.configureMocks({
//         contextOptions: {
//           currentPairAddress: 'otherAddress',
//         },
//       });

//       result = await boundFunc({ pipId, ...args });
//       expect(result).toBe(false);
//     });
//   });
// });
