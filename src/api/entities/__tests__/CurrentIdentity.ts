import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { CurrentIdentity, Identity, NumberedPortfolio, Venue } from '~/api/entities';
import { DefaultPortfolio } from '~/api/entities/DefaultPortfolio';
import { createVenue, inviteAccount, removeSecondaryKeys } from '~/api/procedures';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { SecondaryKey, SubCallback, VenueType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);
jest.mock(
  '~/api/entities/DefaultPortfolio',
  require('~/testUtils/mocks/entities').mockDefaultPortfolioModule(
    '~/api/entities/DefaultPortfolio'
  )
);

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
      const id4 = new BigNumber(4);

      const did = 'someDid';
      const identity = new CurrentIdentity({ did }, context);

      const otherDid = 'otherDid';
      const otherIdentity = new Identity({ did: otherDid }, context);

      const defaultPortfolioDid = 'someDid';
      const numberedPortfolioDid = 'someDid';
      const numberedPortfolioId = new BigNumber(1);

      const defaultPortfolio = new DefaultPortfolio({ did: defaultPortfolioDid }, context);
      const numberedPortfolio = new NumberedPortfolio(
        { did: numberedPortfolioDid, id: numberedPortfolioId },
        context
      );

      entityMockUtils.configureMocks({
        defaultPortfolioOptions: {
          custodian: identity,
        },
        numberedPortfolioOptions: {
          custodian: otherIdentity,
        },
      });

      identity.portfolios.getPortfolios = sinon
        .stub()
        .resolves([defaultPortfolio, numberedPortfolio]);

      identity.portfolios.getCustodiedPortfolios = sinon.stub().resolves([]);

      const portfolioLikeToPortfolioIdStub = sinon.stub(
        utilsConversionModule,
        'portfolioLikeToPortfolioId'
      );

      portfolioLikeToPortfolioIdStub
        .withArgs(defaultPortfolio, context)
        .resolves({ did: defaultPortfolioDid, number: undefined });
      portfolioLikeToPortfolioIdStub
        .withArgs(numberedPortfolio, context)
        .resolves({ did: numberedPortfolioDid, number: numberedPortfolioId });

      const rawPortfolio = dsMockUtils.createMockPortfolioId({
        did: dsMockUtils.createMockIdentityId(did),
        kind: dsMockUtils.createMockPortfolioKind('Default'),
      });

      const portfolioIdToMeshPortfolioIdStub = sinon.stub(
        utilsConversionModule,
        'portfolioIdToMeshPortfolioId'
      );

      portfolioIdToMeshPortfolioIdStub
        .withArgs({ did, number: undefined }, context)
        .returns(rawPortfolio);

      const userAuthsStub = dsMockUtils.createQueryStub('settlement', 'userAuths');

      const rawId1 = dsMockUtils.createMockU64(id1.toNumber());
      const rawId2 = dsMockUtils.createMockU64(id2.toNumber());
      const rawId3 = dsMockUtils.createMockU64(id3.toNumber());

      const entriesStub = sinon.stub();
      entriesStub
        .withArgs(rawPortfolio)
        .resolves([
          tuple(
            { args: [rawPortfolio, rawId1] },
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
          tuple(
            { args: [rawPortfolio, rawId2] },
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
          tuple(
            { args: [rawPortfolio, rawId3] },
            dsMockUtils.createMockAuthorizationStatus('Pending')
          ),
        ]);

      userAuthsStub.entries = entriesStub;

      /* eslint-disable @typescript-eslint/camelcase */
      const instructionDetailsStub = dsMockUtils.createQueryStub(
        'settlement',
        'instructionDetails',
        {
          multi: [],
        }
      );

      const multiStub = sinon.stub();

      multiStub.withArgs([rawId1, rawId2, rawId3]).resolves([
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
        dsMockUtils.createMockInstruction({
          instruction_id: dsMockUtils.createMockU64(id4.toNumber()),
          venue_id: dsMockUtils.createMockU64(),
          status: dsMockUtils.createMockInstructionStatus('Pending'),
          settlement_type: dsMockUtils.createMockSettlementType('SettleOnAuthorization'),
          created_at: dsMockUtils.createMockOption(),
          valid_from: dsMockUtils.createMockOption(),
        }),
      ]);

      instructionDetailsStub.multi = multiStub;
      /* eslint-enable @typescript-eslint/camelcase */

      const result = await identity.getPendingInstructions();

      expect(result.length).toBe(3);
      expect(result[0].id).toEqual(id1);
      expect(result[1].id).toEqual(id2);
      expect(result[2].id).toEqual(id4);
    });
  });
});
