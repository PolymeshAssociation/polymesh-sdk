import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyCaDefaultConfig,
} from '~/api/procedures/modifyCaDefaultConfig';
import * as utilsProcedureModule from '~/api/procedures/utils';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InputTargets, TargetTreatment } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('modifyCaDefaultConfig procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let targetsToTargetIdentitiesStub: sinon.SinonStub;
  let percentageToPermillStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;

  let assertCaTargetsValidStub: sinon.SinonStub;
  let assertCaTaxWithholdingsValidStub: sinon.SinonStub;

  let ticker: string;
  let rawTicker: Ticker;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    targetsToTargetIdentitiesStub = sinon.stub(utilsConversionModule, 'targetsToTargetIdentities');
    percentageToPermillStub = sinon.stub(utilsConversionModule, 'percentageToPermill');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    ticker = 'someTicker';
    rawTicker = dsMockUtils.createMockTicker(ticker);

    assertCaTargetsValidStub = sinon.stub(utilsProcedureModule, 'assertCaTargetsValid');
    assertCaTaxWithholdingsValidStub = sinon.stub(
      utilsProcedureModule,
      'assertCaTaxWithholdingsValid'
    );
  });

  let addTransactionStub: sinon.SinonStub;

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the user has not passed any arguments', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(prepareModifyCaDefaultConfig.call(proc, {} as unknown as Params)).rejects.toThrow(
      'Nothing to modify'
    );
  });

  test('should throw an error if the new targets are the same as the current ones', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const targets = {
      identities: [],
      treatment: TargetTreatment.Exclude,
    };
    entityMockUtils.configureMocks({
      assetOptions: { corporateActionsGetDefaultConfig: { targets } },
    });

    return expect(
      prepareModifyCaDefaultConfig.call(proc, {
        ticker,
        targets,
      })
    ).rejects.toThrow('New targets are the same as the current ones');
  });

  test('should throw an error if the new default tax withholding is the same as the current one', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const defaultTaxWithholding = new BigNumber(10);
    entityMockUtils.configureMocks({
      assetOptions: { corporateActionsGetDefaultConfig: { defaultTaxWithholding } },
    });

    return expect(
      prepareModifyCaDefaultConfig.call(proc, {
        ticker,
        defaultTaxWithholding,
      })
    ).rejects.toThrow('New default tax withholding is the same as the current one');
  });

  test('should throw an error if the new tax withholdings are the same as the current ones', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const taxWithholdings = [
      {
        identity: entityMockUtils.getIdentityInstance({ did: 'someDid' }),
        percentage: new BigNumber(15),
      },
    ];
    entityMockUtils.configureMocks({
      assetOptions: { corporateActionsGetDefaultConfig: { taxWithholdings } },
    });

    return expect(
      prepareModifyCaDefaultConfig.call(proc, {
        ticker,
        taxWithholdings,
      })
    ).rejects.toThrow('New per-Identity tax withholding percentages are the same as current ones');
  });

  test('should add a set default targets transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDefaultTargets');

    let targets: InputTargets = {
      identities: [],
      treatment: TargetTreatment.Exclude,
    };

    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetDefaultConfig: {
          targets: {
            identities: [entityMockUtils.getIdentityInstance({ did: 'someDid' })],
            treatment: TargetTreatment.Include,
          },
        },
      },
    });

    let rawTargets = dsMockUtils.createMockTargetIdentities({
      identities: [],
      treatment: 'Exclude',
    });
    targetsToTargetIdentitiesStub.withArgs(targets, mockContext).returns(rawTargets);

    await prepareModifyCaDefaultConfig.call(proc, {
      ticker,
      targets,
    });

    sinon.assert.calledWith(assertCaTargetsValidStub, targets, mockContext);
    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({ transaction, args: [rawTicker, rawTargets] })
    );

    rawTargets = dsMockUtils.createMockTargetIdentities({
      identities: ['someDid', 'otherDid'],
      treatment: 'Exclude',
    });

    targets = {
      identities: ['someDid', 'otherDid'],
      treatment: TargetTreatment.Exclude,
    };
    targetsToTargetIdentitiesStub.withArgs(targets, mockContext).returns(rawTargets);

    await prepareModifyCaDefaultConfig.call(proc, {
      ticker,
      targets,
    });

    sinon.assert.calledWith(assertCaTargetsValidStub, targets, mockContext);
    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({ transaction, args: [rawTicker, rawTargets] })
    );
  });

  test('should add a set default withholding tax transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDefaultWithholdingTax');

    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetDefaultConfig: {
          defaultTaxWithholding: new BigNumber(10),
        },
      },
    });

    const rawPercentage = dsMockUtils.createMockPermill(new BigNumber(150000));
    percentageToPermillStub.withArgs(new BigNumber(15), mockContext).returns(rawPercentage);

    await prepareModifyCaDefaultConfig.call(proc, {
      ticker,
      defaultTaxWithholding: new BigNumber(15),
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({ transaction, args: [rawTicker, rawPercentage] })
    );
  });

  test('should add a batch of set did withholding tax transactions to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDidWithholdingTax');

    entityMockUtils.configureMocks({
      assetOptions: {
        corporateActionsGetDefaultConfig: {
          taxWithholdings: [],
        },
      },
    });

    const rawDid = dsMockUtils.createMockIdentityId('someDid');
    const rawPercentage = dsMockUtils.createMockPermill(new BigNumber(250000));

    stringToIdentityIdStub.withArgs('someDid', mockContext).returns(rawDid);
    percentageToPermillStub.withArgs(new BigNumber(25), mockContext).returns(rawPercentage);

    const taxWithholdings = [
      {
        identity: 'someDid',
        percentage: new BigNumber(25),
      },
    ];
    await prepareModifyCaDefaultConfig.call(proc, {
      ticker,
      taxWithholdings,
    });

    sinon.assert.calledWith(assertCaTaxWithholdingsValidStub, taxWithholdings, mockContext);
    sinon.assert.calledWith(procedureMockUtils.getAddBatchTransactionStub(), {
      transactions: [
        {
          transaction,
          args: [rawTicker, rawDid, rawPercentage],
        },
      ],
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [],
          portfolios: [],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
        },
      });

      expect(
        boundFunc({
          ...args,
          targets: { identities: [], treatment: TargetTreatment.Include },
          defaultTaxWithholding: new BigNumber(10),
          taxWithholdings: [],
        })
      ).toEqual({
        permissions: {
          transactions: [
            TxTags.corporateAction.SetDefaultTargets,
            TxTags.corporateAction.SetDefaultWithholdingTax,
            TxTags.corporateAction.SetDidWithholdingTax,
          ],
          portfolios: [],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
        },
      });
    });
  });
});
