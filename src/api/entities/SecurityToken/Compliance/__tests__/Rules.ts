import { Vec } from '@polkadot/types/codec';
import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setTokenRules, togglePauseRules } from '~/api/procedures';
import { Params } from '~/api/procedures/setTokenRules';
import { Namespace, TransactionQueue } from '~/base';
import { Context } from '~/context';
import { AssetTransferRules, IdentityId } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils } from '~/testUtils/mocks';
import { ClaimType, ConditionTarget, ConditionType, Rule } from '~/types';

import { Rules } from '../Rules';

describe('Rules class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    polkadotMockUtils.initMocks();
  });

  afterEach(() => {
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    polkadotMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Rules.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rules = new Rules(token, context);

      const args: Omit<Params, 'ticker'> = {
        rules: [
          [
            {
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Whitelisted,
                scope: 'someTokenDid',
              },
              target: ConditionTarget.Both,
            },
            {
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blacklisted,
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
      const context = polkadotMockUtils.getContextInstance();
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
      context = polkadotMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance({ ticker });
      rules = new Rules(token, context);
      defaultClaimIssuers = ['defaultissuer'];
      notDefaultClaimIssuer = 'notDefaultClaimIssuer';
      tokenDid = 'someTokenDid';
      polkadotMockUtils.createQueryStub('complianceManager', 'assetRulesMap');
      polkadotMockUtils.createQueryStub('complianceManager', 'trustedClaimIssuer');

      queryMultiStub = polkadotMockUtils.getQueryMultiStub();

      const scope = polkadotMockUtils.createMockScope(tokenDid);
      const ruleForBoth = polkadotMockUtils.createMockRule({
        // eslint-disable-next-line @typescript-eslint/camelcase
        rule_type: polkadotMockUtils.createMockRuleType({
          IsAnyOf: [
            polkadotMockUtils.createMockClaim({
              KnowYourCustomer: scope,
            }),
            polkadotMockUtils.createMockClaim('CustomerDueDiligence'),
          ],
        }),
        issuers: [],
      });

      queryMultiResult = [
        {
          rules: [
            polkadotMockUtils.createMockAssetTransferRule({
              /* eslint-disable @typescript-eslint/camelcase */
              sender_rules: [
                polkadotMockUtils.createMockRule({
                  rule_type: polkadotMockUtils.createMockRuleType({
                    IsPresent: polkadotMockUtils.createMockClaim({
                      Whitelisted: scope,
                    }),
                  }),
                  issuers: [polkadotMockUtils.createMockIdentityId(notDefaultClaimIssuer)],
                }),
              ],
              receiver_rules: [],
              rule_id: polkadotMockUtils.createMockU32(1),
            }),
            polkadotMockUtils.createMockAssetTransferRule({
              sender_rules: [ruleForBoth],
              receiver_rules: [
                ruleForBoth,
                polkadotMockUtils.createMockRule({
                  rule_type: polkadotMockUtils.createMockRuleType({
                    IsAbsent: polkadotMockUtils.createMockClaim({
                      Blacklisted: scope,
                    }),
                  }),
                  issuers: [],
                }),
              ],
              rule_id: polkadotMockUtils.createMockU32(2),
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
                type: ClaimType.Whitelisted,
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
                type: ClaimType.Blacklisted,
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
      const context = polkadotMockUtils.getContextInstance();
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
      const context = polkadotMockUtils.getContextInstance();
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
});
