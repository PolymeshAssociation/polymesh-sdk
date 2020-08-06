import sinon from 'sinon';

import { isAuthorized, Params, prepareCancelProposal } from '~/api/procedures/cancelProposal';
import * as proceduresUtilsModule from '~/api/procedures/utils';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { AccountKey } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('cancelProposal procedure', () => {
  const pipId = 10;
  const mockAddress = 'someAddress';
  const proposal = ('proposal' as unknown) as PostTransactionValue<void>;

  let mockContext: Mocked<Context>;
  let accountKeyToStringStub: sinon.SinonStub<[AccountKey], string>;
  let addTransactionStub: sinon.SinonStub;
  let cancelProposalTransaction: PolymeshTx<unknown[]>;
  let assertProposalUnlockedStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        currentPairAddress: mockAddress,
      },
    });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    accountKeyToStringStub = sinon.stub(utilsModule, 'accountKeyToString');
    assertProposalUnlockedStub = sinon.stub(proceduresUtilsModule, 'assertProposalUnlocked');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([proposal]);

    cancelProposalTransaction = dsMockUtils.createTxStub('pips', 'cancelProposal');

    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add a cancel proposal transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareCancelProposal.call(proc, { pipId });

    sinon.assert.calledWith(addTransactionStub, cancelProposalTransaction, {}, pipId);
  });

  test('should assert that the proposal is not locked', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await prepareCancelProposal.call(proc, { pipId });

    sinon.assert.calledWith(assertProposalUnlockedStub, pipId, mockContext);
  });

  describe('isAuthorized', () => {
    test('should return whether the current account is the owner of the proposal', async () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

      accountKeyToStringStub.returns(mockAddress);

      dsMockUtils.createQueryStub('pips', 'proposalMetadata', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockProposalMetadata({
            proposer: dsMockUtils.createMockAccountKey(mockAddress),
            // eslint-disable-next-line @typescript-eslint/camelcase
            cool_off_until: dsMockUtils.createMockU32(),
            end: dsMockUtils.createMockU32(),
          })
        ),
      });

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc({ pipId });
      expect(result).toBe(true);

      dsMockUtils.configureMocks({
        contextOptions: {
          currentPairAddress: 'otherAddress',
        },
      });

      result = await boundFunc({ pipId });
      expect(result).toBe(false);
    });
  });
});
