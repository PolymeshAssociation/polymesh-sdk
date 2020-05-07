import sinon from 'sinon';

import { SecurityToken } from '~/api/entities';
import { setTokenRules } from '~/api/procedures';
import { Params } from '~/api/procedures/setTokenRules';
import { Namespace, TransactionQueue } from '~/base';
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
    afterAll(() => {
      sinon.restore();
    });

    test('should return all transfer rules attached to the Security Token, using the default trusted claim issuers where none are set', async () => {
      const ticker = 'test';
      const context = polkadotMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance({ ticker });
      const rules = new Rules(token, context);

      const defaultClaimIssuers = ['defaultissuer'];
      const notDefaultClaimIssuer = 'notDefaultClaimIssuer';
      const tokenDid = 'someTokenDid';
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

      polkadotMockUtils.createQueryStub('generalTm', 'assetRulesMap', {
        returnValue: {
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
        },
      });

      polkadotMockUtils.createQueryStub('generalTm', 'trustedClaimIssuer', {
        returnValue: defaultClaimIssuers,
      });

      const result = await rules.get();
      const expected: Rule[] = [
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

      expect(result).toEqual(expected);
    });
  });
});
