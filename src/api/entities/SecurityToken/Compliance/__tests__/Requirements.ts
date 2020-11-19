import { Vec } from '@polkadot/types/codec';
import { AssetCompliance, AssetComplianceResult, IdentityId, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { Params } from '~/api/procedures/setAssetRequirements';
import {
  Context,
  Identity,
  Namespace,
  SecurityToken,
  setAssetRequirements,
  togglePauseRequirements,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, ConditionTarget, ConditionType, Requirement, ScopeType } from '~/types';
import * as utilsModule from '~/utils';

import { Requirements } from '../Requirements';

describe('Requirements class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(Requirements.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const requirements = new Requirements(token, context);

      const args: Omit<Params, 'ticker'> = {
        requirements: [
          [
            {
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Exempted,
                scope: { type: ScopeType.Ticker, value: 'someTicker' },
              },
              target: ConditionTarget.Both,
            },
            {
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: { type: ScopeType.Ticker, value: 'someTicker' },
              },
              target: ConditionTarget.Both,
            },
          ],
        ],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setAssetRequirements, 'prepare')
        .withArgs({ ticker: token.ticker, ...args }, context)
        .resolves(expectedQueue);

      const queue = await requirements.set(args);

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
      const requirements = new Requirements(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(setAssetRequirements, 'prepare')
        .withArgs({ ticker: token.ticker, requirements: [] }, context)
        .resolves(expectedQueue);

      const queue = await requirements.reset();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let ticker: string;
    let context: Context;
    let token: SecurityToken;
    let requirements: Requirements;
    let defaultClaimIssuers: string[];
    let notDefaultClaimIssuer: string;
    let tokenDid: string;
    let cddId: string;

    let expected: Requirement[];

    let queryMultiStub: sinon.SinonStub;
    let queryMultiResult: [AssetCompliance, Vec<IdentityId>];

    beforeEach(() => {
      ticker = 'test';
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance({ ticker });
      requirements = new Requirements(token, context);
      defaultClaimIssuers = ['defaultissuer'];
      notDefaultClaimIssuer = 'notDefaultClaimIssuer';
      tokenDid = 'someTokenDid';
      cddId = 'someCddId';
      dsMockUtils.createQueryStub('complianceManager', 'assetCompliances');
      dsMockUtils.createQueryStub('complianceManager', 'trustedClaimIssuer');

      queryMultiStub = dsMockUtils.getQueryMultiStub();

      const scope = dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(tokenDid),
      });
      const conditionForBoth = dsMockUtils.createMockCondition({
        // eslint-disable-next-line @typescript-eslint/camelcase
        condition_type: dsMockUtils.createMockConditionType({
          IsAnyOf: [
            dsMockUtils.createMockClaim({
              KnowYourCustomer: scope,
            }),
            dsMockUtils.createMockClaim({
              CustomerDueDiligence: dsMockUtils.createMockCddId(cddId),
            }),
          ],
        }),
        issuers: [],
      });

      queryMultiResult = [
        {
          requirements: [
            dsMockUtils.createMockComplianceRequirement({
              /* eslint-disable @typescript-eslint/camelcase */
              sender_conditions: [
                dsMockUtils.createMockCondition({
                  condition_type: dsMockUtils.createMockConditionType({
                    IsPresent: dsMockUtils.createMockClaim({
                      Exempted: scope,
                    }),
                  }),
                  issuers: [dsMockUtils.createMockIdentityId(notDefaultClaimIssuer)],
                }),
              ],
              receiver_conditions: [],
              id: dsMockUtils.createMockU32(1),
            }),
            dsMockUtils.createMockComplianceRequirement({
              sender_conditions: [conditionForBoth],
              receiver_conditions: [
                conditionForBoth,
                dsMockUtils.createMockCondition({
                  condition_type: dsMockUtils.createMockConditionType({
                    IsAbsent: dsMockUtils.createMockClaim({
                      Blocked: scope,
                    }),
                  }),
                  issuers: [],
                }),
              ],
              id: dsMockUtils.createMockU32(2),
              /* eslint-enable @typescript-eslint/camelcase */
            }),
          ],
        } as AssetCompliance,
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
                scope: { type: ScopeType.Identity, value: tokenDid },
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
                  scope: { type: ScopeType.Identity, value: tokenDid },
                },
                { type: ClaimType.CustomerDueDiligence, id: cddId },
              ],
              trustedClaimIssuers: defaultClaimIssuers,
            },
            {
              target: ConditionTarget.Receiver,
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: { type: ScopeType.Identity, value: tokenDid },
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

    test('should return all requirement attached to the Security Token, using the default trusted claim issuers where none are set', async () => {
      queryMultiStub.resolves(queryMultiResult);
      const result = await requirements.get();

      expect(result).toEqual(expected);
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      queryMultiStub.callsFake((_, cbFunc) => {
        cbFunc(queryMultiResult);
        return unsubCallback;
      });

      const callback = sinon.stub();

      const result = await requirements.get(callback);

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
      const requirements = new Requirements(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(togglePauseRequirements, 'prepare')
        .withArgs({ ticker: token.ticker, pause: true }, context)
        .resolves(expectedQueue);

      const queue = await requirements.pause();

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
      const requirements = new Requirements(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<SecurityToken>;

      sinon
        .stub(togglePauseRequirements, 'prepare')
        .withArgs({ ticker: token.ticker, pause: false }, context)
        .resolves(expectedQueue);

      const queue = await requirements.unpause();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: arePaused', () => {
    afterAll(() => {
      sinon.restore();
    });

    test('should return whether compliance conditions are paused or not', async () => {
      const fakeResult = false;
      const context = dsMockUtils.getContextInstance();
      const token = entityMockUtils.getSecurityTokenInstance();
      const rawTicker = dsMockUtils.createMockTicker(token.ticker);
      const mockBool = dsMockUtils.createMockBool(fakeResult);

      const requeriments = new Requirements(token, context);

      sinon
        .stub(utilsModule, 'stringToTicker')
        .withArgs(token.ticker, context)
        .returns(rawTicker);

      sinon
        .stub(utilsModule, 'boolToBoolean')
        .withArgs(mockBool)
        .returns(fakeResult);

      dsMockUtils
        .createQueryStub('complianceManager', 'assetCompliances')
        .withArgs(rawTicker)
        // eslint-disable-next-line @typescript-eslint/camelcase
        .resolves({ is_paused: mockBool });

      const result = await requeriments.arePaused();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: checkSettle', () => {
    let context: Mocked<Context>;
    let token: SecurityToken;
    let requirements: Requirements;
    let currentDid: string;
    let fromDid: string;
    let toDid: string;
    let rawFromDid: IdentityId;
    let rawToDid: IdentityId;
    let rawCurrentDid: IdentityId;
    let rawTicker: Ticker;
    let primaryIssuanceAgentDid: string;
    let rawPrimaryIssuanceAgentDid: IdentityId;

    let stringToIdentityIdStub: sinon.SinonStub;
    let assetComplianceResultToRequirementComplianceStub: sinon.SinonStub;
    let stringToTickerStub: sinon.SinonStub;

    beforeAll(() => {
      fromDid = 'fromDid';
      toDid = 'toDid';
      primaryIssuanceAgentDid = 'primaryIssuanceAgentDid';

      stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
      assetComplianceResultToRequirementComplianceStub = sinon.stub(
        utilsModule,
        'assetComplianceResultToCompliance'
      );
      stringToTickerStub = sinon.stub(utilsModule, 'stringToTicker');
    });

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
      requirements = new Requirements(token, context);
      ({ did: currentDid } = await context.getCurrentIdentity());

      rawFromDid = dsMockUtils.createMockIdentityId(fromDid);
      rawToDid = dsMockUtils.createMockIdentityId(toDid);
      rawCurrentDid = dsMockUtils.createMockIdentityId(currentDid);
      rawTicker = dsMockUtils.createMockTicker(token.ticker);
      rawPrimaryIssuanceAgentDid = dsMockUtils.createMockIdentityId(primaryIssuanceAgentDid);

      stringToIdentityIdStub.withArgs(currentDid, context).returns(rawCurrentDid);
      stringToIdentityIdStub.withArgs(fromDid, context).returns(rawFromDid);
      stringToIdentityIdStub.withArgs(toDid, context).returns(rawToDid);
      stringToTickerStub.withArgs(token.ticker, context).returns(rawTicker);
      stringToIdentityIdStub
        .withArgs(primaryIssuanceAgentDid, context)
        .returns(rawPrimaryIssuanceAgentDid);
    });

    afterAll(() => {
      sinon.restore();
    });

    test('checkSettle should return the current requirement compliance and whether the transfer complies', async () => {
      const rawResponse = ('response' as unknown) as AssetComplianceResult;

      const primaryIssuanceAgent = new Identity({ did: primaryIssuanceAgentDid }, context);

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          details: {
            primaryIssuanceAgent,
          },
        },
      });

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, rawCurrentDid, rawToDid, rawPrimaryIssuanceAgentDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetComplianceResultToRequirementComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await requirements.checkSettle({ to: toDid });

      expect(result).toEqual(fakeResult);
    });

    test('checkSettle should return the current requirement compliance and whether the transfer complies with another Identity', async () => {
      const rawResponse = ('response' as unknown) as AssetComplianceResult;

      entityMockUtils.configureMocks({
        securityTokenOptions: {
          details: {
            primaryIssuanceAgent: null,
          },
        },
      });

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, rawFromDid, rawToDid, null)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetComplianceResultToRequirementComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await requirements.checkSettle({ from: fromDid, to: toDid });

      expect(result).toBe(fakeResult);
    });
  });
});
