import { Vec } from '@polkadot/types/codec';
import {
  AssetTransferRules,
  AssetTransferRulesResult,
  IdentityId,
  Ticker,
} from 'polymesh-types/types';
import sinon from 'sinon';

import { Namespace, SecurityToken } from '~/api/entities';
import { setTokenRules, togglePauseRules } from '~/api/procedures';
import { Params } from '~/api/procedures/setTokenRules';
import { Context, TransactionQueue } from '~/base';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, ConditionTarget, ConditionType, Rule } from '~/types';
import * as utilsModule from '~/utils';

import { Rules } from '../Rules';

describe('Rules class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Rules.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rules = new Rules(token, context);

      const args: Omit<Params, 'ticker'> = {
        rules: [
          [
            {
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Exempted,
                scope: 'someTokenDid',
              },
              target: ConditionTarget.Both,
            },
            {
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: 'someTokenDid',
              },
              target: ConditionTarget.Both,
            },
          ],
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setTokenRules, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await rules.set(args);

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: reset', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rules = new Rules(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setTokenRules, 'prepare')
        .withArgs({ ticker: token.ticker, rules: [] }, context)
        .resolves(expectedQueue);

      const queue = await rules.reset();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let ticker: string;
    let context: Context;
    let token: SecurityToken;
    let rules: Rules;
    let defaultClaimIssuers: string[];
    let notDefaultClaimIssuer: string;
    let tokenDid: string;

    let expected: Rule[];

    let queryMultiStub: sinon.SinonStub;
    let queryMultiResult: [AssetTransferRules, Vec<IdentityId>];

    beforeEach(() => {
      ticker = 'test';
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance({ ticker });
      rules = new Rules(token, context);
      defaultClaimIssuers = ['defaultissuer'];
      notDefaultClaimIssuer = 'notDefaultClaimIssuer';
      tokenDid = 'someTokenDid';
      dsMockUtils.createQueryStub('complianceManager', 'assetRulesMap');
      dsMockUtils.createQueryStub('complianceManager', 'trustedClaimIssuer');

      queryMultiStub = dsMockUtils.getQueryMultiStub();

      const scope = dsMockUtils.createMockScope(tokenDid);
      const ruleForBoth = dsMockUtils.createMockRule({
        // eslint-disable-next-line @typescript-eslint/camelcase
        rule_type: dsMockUtils.createMockRuleType({
          IsAnyOf: [
            dsMockUtils.createMockClaim({
              KnowYourCustomer: scope,
            }),
            dsMockUtils.createMockClaim('CustomerDueDiligence'),
          ],
        }),
        issuers: [],
      });

      queryMultiResult = [
        {
          rules: [
            dsMockUtils.createMockAssetTransferRule({
              /* eslint-disable @typescript-eslint/camelcase */
              sender_rules: [
                dsMockUtils.createMockRule({
                  rule_type: dsMockUtils.createMockRuleType({
                    IsPresent: dsMockUtils.createMockClaim({
                      Exempted: scope,
                    }),
                  }),
                  issuers: [dsMockUtils.createMockIdentityId(notDefaultClaimIssuer)],
                }),
              ],
              receiver_rules: [],
              rule_id: dsMockUtils.createMockU32(1),
            }),
            dsMockUtils.createMockAssetTransferRule({
              sender_rules: [ruleForBoth],
              receiver_rules: [
                ruleForBoth,
                dsMockUtils.createMockRule({
                  rule_type: dsMockUtils.createMockRuleType({
                    IsAbsent: dsMockUtils.createMockClaim({
                      Blocked: scope,
                    }),
                  }),
                  issuers: [],
                }),
              ],
              rule_id: dsMockUtils.createMockU32(2),
              /* eslint-enable @typescript-eslint/camelcase */
            }),
          ],
        } as AssetTransferRules,
        (defaultClaimIssuers as unknown) as Vec<IdentityId>,
      ];

      expected = [
        {
          id: 1,
          conditions: [
            {
              target: ConditionTarget.Sender,
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Exempted,
                scope: tokenDid,
              },
              trustedClaimIssuers: [notDefaultClaimIssuer],
            },
          ],
        },
        {
          id: 2,
          conditions: [
            {
              target: ConditionTarget.Both,
              type: ConditionType.IsAnyOf,
              claims: [
                {
                  type: ClaimType.KnowYourCustomer,
                  scope: tokenDid,
                },
                { type: ClaimType.CustomerDueDiligence },
              ],
              trustedClaimIssuers: defaultClaimIssuers,
            },
            {
              target: ConditionTarget.Receiver,
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: tokenDid,
              },
              trustedClaimIssuers: defaultClaimIssuers,
            },
          ],
        },
      ];
    });

    afterAll(() => {
      sinon.restore();
    });

    test('should return all transfer rules attached to the Security Token, using the default trusted claim issuers where none are set', async () => {
      queryMultiStub.resolves(queryMultiResult);
      const result = await rules.get();

      expect(result).toEqual(expected);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      queryMultiStub.callsFake((_, cbFunc) => {
        cbFunc(queryMultiResult);
        return unsubCallback;
      });

      const callback = sinon.stub();

      const result = await rules.get(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, expected);
    });
  });

  describe('method: pause', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rules = new Rules(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(togglePauseRules, 'prepare')
        .withArgs({ ticker: token.ticker, pause: true }, context)
        .resolves(expectedQueue);

      const queue = await rules.pause();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: unpause', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rules = new Rules(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(togglePauseRules, 'prepare')
        .withArgs({ ticker: token.ticker, pause: false }, context)
        .resolves(expectedQueue);

      const queue = await rules.unpause();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: arePaused', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return whether compliance rules are paused or not', async () => {
      const fakeResult = false;
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rawTicker = dsMockUtils.createMockTicker(token.ticker);
      const mockBool = dsMockUtils.createMockBool(fakeResult);

      const rules = new Rules(token, context);

      sinon
        .stub(utilsModule, 'stringToTicker')
        .withArgs(token.ticker, context)
        .returns(rawTicker);

      sinon
        .stub(utilsModule, 'boolToBoolean')
        .withArgs(mockBool)
        .returns(fakeResult);

      dsMockUtils
        .createQueryStub('complianceManager', 'assetRulesMap')
        .withArgs(rawTicker)
        // eslint-disable-next-line @typescript-eslint/camelcase
        .resolves({ is_paused: mockBool });

      const result = await rules.arePaused();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: checkTransfer/checkMint', () => {
    let context: Mocked<Context>;
    let token: SecurityToken;
    let rules: Rules;
    let currentDid: string;
    let fromDid: string;
    let toDid: string;
    let rawFromDid: IdentityId;
    let rawToDid: IdentityId;
    let rawCurrentDid: IdentityId;
    let rawTicker: Ticker;

    let stringToIdentityIdStub: sinon.SinonStub;
    let assetTransferRulesResultToRuleComplianceStub: sinon.SinonStub;
    let stringToTickerStub: sinon.SinonStub;

    beforeAll(() => {
      fromDid = 'fromDid';
      toDid = 'toDid';

      stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
      assetTransferRulesResultToRuleComplianceStub = sinon.stub(
        utilsModule,
        'assetTransferRulesResultToRuleCompliance'
      );
      stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    });

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
      rules = new Rules(token, context);
      ({ did: currentDid } = await context.getCurrentIdentity());

      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawToDid = dsMockUtils.createMockIdentityId(toDid);
      rawCurrentDid = dsMockUtils.createMockIdentityId(currentDid);
      rawTicker = dsMockUtils.createMockTicker(token.ticker);

      stringToIdentityIdStub.withArgs(currentDid, context).returns(rawCurrentDid);
      stringToIdentityIdStub.withArgs(fromDid, context).returns(rawFromDid);
      stringToIdentityIdStub.withArgs(toDid, context).returns(rawToDid);
      stringToTickerStub.withArgs(token.ticker, context).returns(rawTicker);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('checkTransfer should return the current rules and whether the transfer complies', async () => {
      const rawResponse = ('response' as unknown) as AssetTransferRulesResult;

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, rawCurrentDid, rawToDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetTransferRulesResultToRuleComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await rules.checkTransfer({ to: toDid });

      expect(result).toEqual(fakeResult);
    });

    test('checkTransfer should return the current rules and whether the transfer complies with another identity', async () => {
      const rawResponse = ('response' as unknown) as AssetTransferRulesResult;

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, rawFromDid, rawToDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetTransferRulesResultToRuleComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await rules.checkTransfer({ from: fromDid, to: toDid });

      expect(result).toBe(fakeResult);
    });

    test('checkMint should return the current rules and whether the mint complies', async () => {
      const rawResponse = ('response' as unknown) as AssetTransferRulesResult;

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, null, rawToDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetTransferRulesResultToRuleComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await rules.checkMint({ to: toDid });

      expect(result).toBe(fakeResult);
    });
  });
});
