import { Vec } from '@polkadot/types/codec';
import {
  PolymeshPrimitivesComplianceManagerAssetCompliance,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Params } from '~/api/procedures/setAssetRequirements';
import { Context, FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCodec } from '~/testUtils/mocks/dataSources';
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

import { Requirements } from '../../../Base/Compliance/Requirements';

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
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const args: Omit<Params, 'asset'> = {
        requirements: [
          [
            {
              type: ConditionType.IsPresent,
              claim: {
                type: ClaimType.Exempted,
                scope: { type: ScopeType.Asset, value: '0x12341234123412341234123412341234' },
              },
              target: ConditionTarget.Both,
            },
            {
              type: ConditionType.IsAbsent,
              claim: {
                type: ClaimType.Blocked,
                scope: { type: ScopeType.Asset, value: '0x12341234123412341234123412341234' },
              },
              target: ConditionTarget.Both,
            },
          ],
        ],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await requirements.set(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: add', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const args = {
        conditions: [
          {
            type: ConditionType.IsPresent,
            claim: {
              type: ClaimType.Exempted,
              scope: { type: ScopeType.Asset, value: '0x12341234123412341234123412341234' },
            },
            target: ConditionTarget.Both,
          },
          {
            type: ConditionType.IsAbsent,
            claim: {
              type: ClaimType.Blocked,
              scope: { type: ScopeType.Asset, value: '0x12341234123412341234123412341234' },
            },
            target: ConditionTarget.Both,
          },
        ] as InputCondition[],
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await requirements.add(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const args = {
        requirement: new BigNumber(10),
      };

      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await requirements.remove(args);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: reset', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, requirements: [] }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedQueue);

      const tx = await requirements.reset();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let assetId: string;
    let context: Context;
    let asset: FungibleAsset;
    let requirements: Requirements;
    let defaultClaimIssuers: TrustedClaimIssuer[];
    let notDefaultClaimIssuer: TrustedClaimIssuer;
    let assetDid: string;
    let cddId: string;
    let trustedIssuerToTrustedClaimIssuerSpy: jest.SpyInstance;

    let expected: ComplianceRequirements;

    let queryMultiMock: jest.Mock;
    let queryMultiResult: [
      MockCodec<PolymeshPrimitivesComplianceManagerAssetCompliance>,
      Vec<PolymeshPrimitivesIdentityId>
    ];

    beforeAll(() => {
      trustedIssuerToTrustedClaimIssuerSpy = jest.spyOn(
        utilsConversionModule,
        'trustedIssuerToTrustedClaimIssuer'
      );
    });

    beforeEach(() => {
      assetId = '12341234-1234-1234-1234-123412341234';
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance({ assetId });
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
      dsMockUtils.createQueryMock('complianceManager', 'assetCompliances');
      dsMockUtils.createQueryMock('complianceManager', 'trustedClaimIssuer');

      queryMultiMock = dsMockUtils.getQueryMultiMock();

      trustedIssuerToTrustedClaimIssuerSpy.mockReturnValue({
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
      jest.restoreAllMocks();
    });

    it('should return all requirements attached to the Asset, along with the default trusted claim issuers', async () => {
      queryMultiMock.mockResolvedValue(queryMultiResult);
      const result = await requirements.get();

      expect(result).toEqual(expected);
    });

    it('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      queryMultiMock.mockImplementation((_, cbFunc) => {
        cbFunc(queryMultiResult);
        return unsubCallback;
      });

      const callback = jest.fn();

      const result = await requirements.get(callback);

      expect(result).toBe(unsubCallback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          requirements: [
            {
              id: new BigNumber(1),
              conditions: [
                {
                  ...expected.requirements[0].conditions[0],
                  trustedClaimIssuers: [
                    {
                      identity: expect.objectContaining({
                        did: notDefaultClaimIssuer.identity.did,
                      }),
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
              identity: expect.objectContaining({ did: 'defaultIssuer' }),
              trustedFor: null,
            },
          ],
        })
      );
    });
  });

  describe('method: pause', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, pause: true }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedQueue);

      const tx = await requirements.pause();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: unpause', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const requirements = new Requirements(asset, context);

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, pause: false }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedQueue);

      const tx = await requirements.unpause();

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: modify', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
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

      const expectedQueue = 'someQueue' as unknown as PolymeshTransaction<FungibleAsset>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { asset, ...args }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedQueue);

      const tx = await requirements.modify(args);

      expect(tx).toBe(expectedQueue);
    });
  });

  describe('method: arePaused', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return whether compliance conditions are paused or not', async () => {
      const fakeResult = false;
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance();
      const rawAssetId = dsMockUtils.createMockAssetId(asset.id);
      const mockBool = dsMockUtils.createMockBool(fakeResult);

      when(jest.spyOn(utilsConversionModule, 'assetToMeshAssetId'))
        .calledWith(asset, context)
        .mockReturnValue(rawAssetId);

      const requirements = new Requirements(asset, context);

      when(jest.spyOn(utilsConversionModule, 'boolToBoolean'))
        .calledWith(mockBool)
        .mockReturnValue(fakeResult);

      when(dsMockUtils.createQueryMock('complianceManager', 'assetCompliances'))
        .calledWith(rawAssetId)
        .mockResolvedValue({ paused: mockBool });

      const result = await requirements.arePaused();

      expect(result).toEqual(fakeResult);
    });
  });
});
