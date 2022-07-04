import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Asset, Context, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TargetTreatment } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

import { CorporateActions } from '../';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CorporateActions class', () => {
  let context: Context;
  let ticker: string;
  let rawTicker: PolymeshPrimitivesTicker;
  let asset: Asset;
  let corporateActions: CorporateActions;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_TICKER';

    sinon
      .stub(utilsConversionModule, 'stringToTicker')
      .withArgs(ticker, context)
      .returns(rawTicker);
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();

    context = dsMockUtils.getContextInstance();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    asset = entityMockUtils.getAssetInstance();
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

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: 'SOME_TICKER', targets, taxWithholdings, defaultTaxWithholding },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedTransaction);

      const tx = await corporateActions.setDefaultConfig({
        targets,
        taxWithholdings,
        defaultTaxWithholding,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setAgent', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const target = 'someDid';

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, target }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await corporateActions.setAgent({ target });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: removeAgent', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker: 'SOME_TICKER' }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await corporateActions.removeAgent();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: remove', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<void>;
      const corporateAction = new BigNumber(100);

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          { args: { corporateAction, ticker: 'SOME_TICKER' }, transformer: undefined },
          context
        )
        .resolves(expectedTransaction);

      const tx = await corporateActions.remove({ corporateAction });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getAgents', () => {
    it('should retrieve a list of agent Identities', async () => {
      const did = 'someDid';
      const otherDid = 'otherDid';
      const fakeTicker = 'TEST';

      dsMockUtils.createQueryStub('externalAgents', 'groupOfAgent', {
        entries: [
          tuple(
            [dsMockUtils.createMockTicker(fakeTicker), dsMockUtils.createMockIdentityId(did)],
            dsMockUtils.createMockOption(dsMockUtils.createMockAgentGroup('PolymeshV1CAA'))
          ),
          tuple(
            [dsMockUtils.createMockTicker(fakeTicker), dsMockUtils.createMockIdentityId(otherDid)],
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

      dsMockUtils.createQueryStub('corporateAction', 'defaultTargetIdentities');
      dsMockUtils.createQueryStub('corporateAction', 'defaultWithholdingTax');
      dsMockUtils.createQueryStub('corporateAction', 'didWithholdingTax');

      dsMockUtils.getQueryMultiStub().resolves([
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
