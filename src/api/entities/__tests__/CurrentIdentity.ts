import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { CurrentIdentity, Identity, Venue } from '~/api/entities';
import { createVenue, inviteAccount, removeSecondaryKeys } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { SecondaryKey, SubCallback, VenueType } from '~/types';
import { tuple } from '~/types/utils';

describe('CurrentIdentity class', () => {
  let context: Context;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend Identity', () => {
    expect(CurrentIdentity.prototype instanceof Identity).toBe(true);
  });

  describe('method: getSecondaryKeys', () => {
    test('should return a list of Secondaries', async () => {
      const fakeResult = [
        {
          signer: entityMockUtils.getAccountInstance({ address: 'someAddress' }),
          permissions: [],
        },
      ];

      dsMockUtils.configureMocks({ contextOptions: { secondaryKeys: fakeResult } });

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const result = await identity.getSecondaryKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallBack';

      const getSecondaryKeysStub = dsMockUtils
        .getContextInstance()
        .getSecondaryKeys.resolves(unsubCallback);

      const did = 'someDid';

      const identity = new CurrentIdentity({ did }, context);

      const callback = (() => [] as unknown) as SubCallback<SecondaryKey[]>;
      const result = await identity.getSecondaryKeys(callback);
      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(getSecondaryKeysStub, callback);
    });
  });

  describe('method: removeSecondaryKeys', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const signers = [entityMockUtils.getAccountInstance({ address: 'someAccount' })];

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(removeSecondaryKeys, 'prepare')
        .withArgs({ signers }, context)
        .resolves(expectedQueue);

      const queue = await identity.removeSecondaryKeys({ signers });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: inviteAccount', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        targetAccount: 'someAccount',
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      sinon
        .stub(inviteAccount, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await identity.inviteAccount(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: createVenue', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const args = {
        details: 'details',
        type: VenueType.Distribution,
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<Venue>;

      sinon
        .stub(createVenue, 'prepare')
        .withArgs(args, context)
        .resolves(expectedQueue);

      const queue = await identity.createVenue(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getPendingInstructions', () => {
    test('should return all pending instructions in which the identity is involved', async () => {
      const id1 = new BigNumber(1);
      const id2 = new BigNumber(2);
      const id3 = new BigNumber(3);

      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const rawPortfolio = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      });
      dsMockUtils.createQueryStub('settlement', 'userAuths', {
        entries: [
          tuple(
            [rawPortfolio, dsMockUtils.createMockU64(id1.toNumber())],
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
          tuple(
            [rawPortfolio, dsMockUtils.createMockU64(id2.toNumber())],
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
          tuple(
            [rawPortfolio, dsMockUtils.createMockU64(id3.toNumber())],
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
        ],
      });

      /* eslint-disable @typescript-eslint/camelcase */
      dsMockUtils.createQueryStub('settlement', 'instructionDetails', {
        multi: [
          dsMockUtils.createMockInstruction({
            instruction_id: dsMockUtils.createMockU64(id1.toNumber()),
            venue_id: dsMockUtils.createMockU64(),
            status: dsMockUtils.createMockInstructionStatus('Pending'),
            settlement_type: dsMockUtils.createMockSettlementType('SettleOnAuthorization'),
            created_at: dsMockUtils.createMockOption(),
            valid_from: dsMockUtils.createMockOption(),
          }),
          dsMockUtils.createMockInstruction({
            instruction_id: dsMockUtils.createMockU64(id2.toNumber()),
            venue_id: dsMockUtils.createMockU64(),
            status: dsMockUtils.createMockInstructionStatus('Pending'),
            settlement_type: dsMockUtils.createMockSettlementType('SettleOnAuthorization'),
            created_at: dsMockUtils.createMockOption(),
            valid_from: dsMockUtils.createMockOption(),
          }),
          dsMockUtils.createMockInstruction({
            instruction_id: dsMockUtils.createMockU64(id3.toNumber()),
            venue_id: dsMockUtils.createMockU64(),
            status: dsMockUtils.createMockInstructionStatus('Unknown'),
            settlement_type: dsMockUtils.createMockSettlementType('SettleOnAuthorization'),
            created_at: dsMockUtils.createMockOption(),
            valid_from: dsMockUtils.createMockOption(),
          }),
        ],
      });
      /* eslint-enable @typescript-eslint/camelcase */

      const result = await identity.getPendingInstructions();

      expect(result.length).toBe(2);
      expect(result[0].id).toEqual(id1);
      expect(result[1].id).toEqual(id2);
    });
  });
});
