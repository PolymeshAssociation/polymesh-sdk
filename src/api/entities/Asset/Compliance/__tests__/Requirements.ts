import { Vec } from '@polkadot/types/codec';
import {
  PolymeshPrimitivesComplianceManagerAssetCompliance,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Params } from '~/api/procedures/setAssetRequirements';
import { Asset, Context, Namespace, PolymeshTransaction } from '~/internal';
import { AssetComplianceResult } from '~/polkadot/polymesh';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCodec } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  ClaimType,
  ComplianceRequirements,
  ConditionTarget,
  ConditionType,
  InputCondition,
  ScopeType,
  TrustedClaimIssuer,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { Requirements } from '../Requirements';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Requirements class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Requirements.prototype instanceof Namespace).toBe(true);
  });

  describe('method: set', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const args: Omit<Params, 'ticker'> = {
        requirements: [
          [
            {
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Exempted,
                scope: { type: ScopeType.Ticker, value: 'SOME_TICKER' },
              },
              target: ConditionTarget.Both,
            },
            {
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: { type: ScopeType.Ticker, value: 'SOME_TICKER' },
              },
              target: ConditionTarget.Both,
            },
          ],
        ],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await requirements.set(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: add', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const args = {
        conditions: [
          {
            type: ConditionType.IsPresent,
            claim: {
              type: ClaimType.Exempted,
              scope: { type: ScopeType.Ticker, value: 'SOME_TICKER' },
            },
            target: ConditionTarget.Both,
          },
          {
            type: ConditionType.IsAbsent,
            claim: {
              type: ClaimType.Blocked,
              scope: { type: ScopeType.Ticker, value: 'SOME_TICKER' },
            },
            target: ConditionTarget.Both,
          },
        ] as InputCondition[],
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await requirements.add(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const args = {
        requirement: new BigNumber(10),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await requirements.remove(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: reset', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { ticker: asset.ticker, requirements: [] }, transformer: undefined },
          context
        )
        .resolves(expectedQueue);

      const tx = await requirements.reset();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let ticker: string;
    let context: Context;
    let asset: Asset;
    let requirements: Requirements;
    let defaultClaimIssuers: TrustedClaimIssuer[];
    let notDefaultClaimIssuer: TrustedClaimIssuer;
    let assetDid: string;
    let cddId: string;
    let trustedIssuerToTrustedClaimIssuer: sinon.SinonStub;

    let expected: ComplianceRequirements;

    let queryMultiStub: sinon.SinonStub;
    let queryMultiResult: [
      MockCodec<PolymeshPrimitivesComplianceManagerAssetCompliance>,
      Vec<PolymeshPrimitivesIdentityId>
    ];

    beforeAll(() => {
      trustedIssuerToTrustedClaimIssuer = sinon.stub(
        utilsConversionModule,
        'trustedIssuerToTrustedClaimIssuer'
      );
    });

    beforeEach(() => {
      ticker = 'FAKE_TICKER';
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance({ ticker });
      requirements = new Requirements(asset, context);
      defaultClaimIssuers = [
        {
          identity: entityMockUtils.getIdentityInstance({ did: 'defaultIssuer' }),
          trustedFor: null,
        },
      ];
      notDefaultClaimIssuer = {
        identity: entityMockUtils.getIdentityInstance({ did: 'notDefaultClaimIssuer' }),
        trustedFor: null,
      };
      assetDid = 'someAssetDid';
      cddId = 'someCddId';
      dsMockUtils.createQueryStub('complianceManager', 'assetCompliances');
      dsMockUtils.createQueryStub('complianceManager', 'trustedClaimIssuer');

      queryMultiStub = dsMockUtils.getQueryMultiStub();

      trustedIssuerToTrustedClaimIssuer.returns({
        identity: defaultClaimIssuers[0].identity,
        trustedFor: null,
      });

      const scope = dsMockUtils.createMockScope({
        Identity: dsMockUtils.createMockIdentityId(assetDid),
      });
      const conditionForBoth = dsMockUtils.createMockCondition({
        conditionType: dsMockUtils.createMockConditionType({
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
              senderConditions: [
                dsMockUtils.createMockCondition({
                  conditionType: dsMockUtils.createMockConditionType({
                    IsPresent: dsMockUtils.createMockClaim({
                      Exempted: scope,
                    }),
                  }),
                  issuers: [
                    dsMockUtils.createMockTrustedIssuer({
                      issuer: dsMockUtils.createMockIdentityId(notDefaultClaimIssuer.identity.did),
                      trustedFor: dsMockUtils.createMockTrustedFor('Any'),
                    }),
                  ],
                }),
              ],
              receiverConditions: [],
              id: dsMockUtils.createMockU32(new BigNumber(1)),
            }),
            dsMockUtils.createMockComplianceRequirement({
              senderConditions: [conditionForBoth],
              receiverConditions: [
                conditionForBoth,
                dsMockUtils.createMockCondition({
                  conditionType: dsMockUtils.createMockConditionType({
                    IsAbsent: dsMockUtils.createMockClaim({
                      Blocked: scope,
                    }),
                  }),
                  issuers: [],
                }),
              ],
              id: dsMockUtils.createMockU32(new BigNumber(2)),
            }),
          ],
        } as unknown as MockCodec<PolymeshPrimitivesComplianceManagerAssetCompliance>,
        defaultClaimIssuers as unknown as Vec<PolymeshPrimitivesIdentityId>,
      ];

      expected = {
        requirements: [
          {
            id: new BigNumber(1),
            conditions: [
              {
                target: ConditionTarget.Sender,
                type: ConditionType.IsPresent,
                claim: {
                  type: ClaimType.Exempted,
                  scope: { type: ScopeType.Identity, value: assetDid },
                },
                trustedClaimIssuers: [
                  {
                    identity: expect.objectContaining({ did: notDefaultClaimIssuer.identity.did }),
                    trustedFor: null,
                  },
                ],
              },
            ],
          },
          {
            id: new BigNumber(2),
            conditions: [
              {
                target: ConditionTarget.Both,
                type: ConditionType.IsAnyOf,
                claims: [
                  {
                    type: ClaimType.KnowYourCustomer,
                    scope: { type: ScopeType.Identity, value: assetDid },
                  },
                  { type: ClaimType.CustomerDueDiligence, id: cddId },
                ],
              },
              {
                target: ConditionTarget.Receiver,
                type: ConditionType.IsAbsent,
                claim: {
                  type: ClaimType.Blocked,
                  scope: { type: ScopeType.Identity, value: assetDid },
                },
              },
            ],
          },
        ],
        defaultTrustedClaimIssuers: [
          { identity: expect.objectContaining({ did: 'defaultIssuer' }), trustedFor: null },
        ],
      };
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return all requirements attached to the Asset, along with the default trusted claim issuers', async () => {
      queryMultiStub.resolves(queryMultiResult);
      const result = await requirements.get();

      expect(result).toEqual(expected);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      queryMultiStub.callsFake((_, cbFunc) => {
        cbFunc(queryMultiResult);
        return unsubCallback;
      });

      const callback = sinon.stub();

      const result = await requirements.get(callback);

      expect(result).toBe(unsubCallback);

      sinon.assert.calledWithExactly(
        callback,
        sinon.match({
          requirements: [
            {
              id: new BigNumber(1),
              conditions: [
                {
                  ...expected.requirements[0].conditions[0],
                  trustedClaimIssuers: [
                    {
                      identity: sinon.match({ did: notDefaultClaimIssuer.identity.did }),
                      trustedFor: null,
                    },
                  ],
                },
              ],
            },
            {
              id: new BigNumber(2),
              conditions: expected.requirements[1].conditions,
            },
          ],
          defaultTrustedClaimIssuers: [
            {
              identity: sinon.match({ did: 'defaultIssuer' }),
              trustedFor: null,
            },
          ],
        })
      );
    });
  });

  describe('method: pause', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, pause: true }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const tx = await requirements.pause();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: unpause', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, pause: false }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const tx = await requirements.unpause();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: modify', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const requirements = new Requirements(asset, context);

      const args = {
        id: new BigNumber(1),
        conditions: [
          {
            type: ConditionType.IsIdentity,
            identity: entityMockUtils.getIdentityInstance(),
            target: ConditionTarget.Both,
          },
        ] as InputCondition[],
      };

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: asset.ticker, ...args }, transformer: undefined }, context)
        .resolves(expectedQueue);

      const tx = await requirements.modify(args);

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: arePaused', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should return whether compliance conditions are paused or not', async () => {
      const fakeResult = false;
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const rawTicker = dsMockUtils.createMockTicker(asset.ticker);
      const mockBool = dsMockUtils.createMockBool(fakeResult);

      const requirements = new Requirements(asset, context);

      sinon
        .stub(utilsConversionModule, 'stringToTicker')
        .withArgs(asset.ticker, context)
        .returns(rawTicker);

      sinon.stub(utilsConversionModule, 'boolToBoolean').withArgs(mockBool).returns(fakeResult);

      dsMockUtils
        .createQueryStub('complianceManager', 'assetCompliances')
        .withArgs(rawTicker)
        .resolves({ paused: mockBool });

      const result = await requirements.arePaused();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: checkSettle', () => {
    let context: Mocked<Context>;
    let asset: Asset;
    let requirements: Requirements;
    let signingDid: string;
    let fromDid: string;
    let toDid: string;
    let rawTicker: PolymeshPrimitivesTicker;

    let assetComplianceResultToRequirementComplianceStub: sinon.SinonStub;
    let stringToTickerStub: sinon.SinonStub;

    beforeAll(() => {
      fromDid = 'fromDid';
      toDid = 'toDid';

      assetComplianceResultToRequirementComplianceStub = sinon.stub(
        utilsConversionModule,
        'assetComplianceResultToCompliance'
      );
      stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    });

    beforeEach(async () => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getAssetInstance();
      requirements = new Requirements(asset, context);
      ({ did: signingDid } = await context.getSigningIdentity());

      rawTicker = dsMockUtils.createMockTicker(asset.ticker);

      stringToTickerStub.withArgs(asset.ticker, context).returns(rawTicker);
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return the current requirement compliance and whether the transfer complies', async () => {
      const rawResponse = 'response' as unknown as AssetComplianceResult;

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, signingDid, toDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetComplianceResultToRequirementComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await requirements.checkSettle({ to: toDid });

      expect(result).toEqual(fakeResult);
    });

    it('should return the current requirement compliance and whether the transfer complies with another Identity', async () => {
      const rawResponse = 'response' as unknown as AssetComplianceResult;

      dsMockUtils
        .createRpcStub('compliance', 'canTransfer')
        .withArgs(rawTicker, fromDid, toDid)
        .resolves(rawResponse);

      const fakeResult = 'result';

      assetComplianceResultToRequirementComplianceStub.withArgs(rawResponse).returns(fakeResult);

      const result = await requirements.checkSettle({ from: fromDid, to: toDid });

      expect(result).toBe(fakeResult);
    });
  });
});
