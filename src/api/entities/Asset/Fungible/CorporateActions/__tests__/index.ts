import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TargetTreatment } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { CorporateActions } from '..';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CorporateActions class', () => {
  let context: Context;
  let assetId: string;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let asset: FungibleAsset;
  let corporateActions: CorporateActions;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    assetId = '0x1234';

    when(jest.spyOn(utilsConversionModule, 'stringToAssetId'))
      .calledWith(assetId, context)
      .mockReturnValue(rawAssetId);
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    asset = entityMockUtils.getFungibleAssetInstance();
    corporateActions = new CorporateActions(asset, context);
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(CorporateActions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: setDefaultConfig', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const targets = {
        identities: ['someDid'],
        treatment: TargetTreatment.Exclude,
      };
      const defaultTaxWithholding = new BigNumber(15);
      const taxWithholdings = [
        {
          identity: 'someDid',
          percentage: new BigNumber(20),
        },
      ];
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, targets, taxWithholdings, defaultTaxWithholding },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateActions.setDefaultConfig({
        targets,
        taxWithholdings,
        defaultTaxWithholding,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const corporateAction = new BigNumber(100);

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { corporateAction, asset }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await corporateActions.remove({ corporateAction });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getAgents', () => {
    it('should retrieve a list of agent Identities', async () => {
      const did = 'someDid';
      const otherDid = 'otherDid';
      const fakeAssetId = '0x9999';

      dsMockUtils.createQueryMock('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockAssetId(fakeAssetId), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1CAA'))
          ),
          tuple(
            [
              dsMockUtils.createMockAssetId(fakeAssetId),
              dsMockUtils.createMockIdentityId(otherDid),
            ],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1PIA'))
          ),
        ],
      });

      const result = await corporateActions.getAgents();

      expect(result).toEqual([expect.objectContaining({ did })]);
    });
  });

  describe('method: getDefaultConfig', () => {
    it("should retrieve the Asset's Corporate Actions Default Config", async () => {
      const dids = ['someDid', 'otherDid'];
      const defaultTaxWithholding = new BigNumber(10);

      dsMockUtils.createQueryMock('corporateAction', 'defaultTargetIdentities');
      dsMockUtils.createQueryMock('corporateAction', 'defaultWithholdingTax');
      dsMockUtils.createQueryMock('corporateAction', 'didWithholdingTax');

      dsMockUtils.getQueryMultiMock().mockResolvedValue([
        dsMockUtils.createMockTargetIdentities({
          identities: dids,
          treatment: 'Include',
        }),
        dsMockUtils.createMockPermill(new BigNumber(10 * 10000)),
        [
          [
            dsMockUtils.createMockIdentityId(dids[0]),
            dsMockUtils.createMockPermill(new BigNumber(15 * 10000)),
          ],
        ],
      ]);

      const result = await corporateActions.getDefaultConfig();

      expect(result).toEqual({
        targets: {
          identities: dids.map(did => expect.objectContaining({ did })),
          treatment: TargetTreatment.Include,
        },
        defaultTaxWithholding,
        taxWithholdings: [
          {
            identity: expect.objectContaining({ did: dids[0] }),
            percentage: new BigNumber(15),
          },
        ],
      });
    });
  });
});
