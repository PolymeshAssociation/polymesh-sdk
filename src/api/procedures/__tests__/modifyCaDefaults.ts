import BigNumber from 'bignumber.js';
import { Ticker, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareModifyCaDefaults,
} from '~/api/procedures/modifyCaDefaults';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TargetTreatment } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

describe('modifyCaDefaults procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToTickerStub: sinon.SinonStub;
  let targetsToTargetIdentitiesStub: sinon.SinonStub;
  let percentageToPermillStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;
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

    return expect(prepareModifyCaDefaults.call(proc, ({} as unknown) as Params)).rejects.toThrow(
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
      securityTokenOptions: { corporateActionsGetDefaults: { targets } },
    });

    return expect(
      prepareModifyCaDefaults.call(proc, {
        ticker,
        targets,
      })
    ).rejects.toThrow('New targets are the same as the current ones');
  });

  test('should throw an error if the new default tax withholding is the same as the current one', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const defaultTaxWithholding = new BigNumber(10);
    entityMockUtils.configureMocks({
      securityTokenOptions: { corporateActionsGetDefaults: { defaultTaxWithholding } },
    });

    return expect(
      prepareModifyCaDefaults.call(proc, {
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
      securityTokenOptions: { corporateActionsGetDefaults: { taxWithholdings } },
    });

    return expect(
      prepareModifyCaDefaults.call(proc, {
        ticker,
        taxWithholdings,
      })
    ).rejects.toThrow('New per-Identity tax withholding percentages are the same as current ones');
  });

  test('should add a set default targets transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDefaultTargets');

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetDefaults: {
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
    targetsToTargetIdentitiesStub
      .withArgs(
        {
          identities: [],
          treatment: TargetTreatment.Exclude,
        },
        mockContext
      )
      .returns(rawTargets);

    await prepareModifyCaDefaults.call(proc, {
      ticker,
      targets: {
        identities: [],
        treatment: TargetTreatment.Exclude,
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({}),
      rawTicker,
      rawTargets
    );

    rawTargets = dsMockUtils.createMockTargetIdentities({
      identities: ['someDid', 'otherDid'],
      treatment: 'Exclude',
    });
    targetsToTargetIdentitiesStub
      .withArgs(
        {
          identities: ['someDid', 'otherDid'],
          treatment: TargetTreatment.Exclude,
        },
        mockContext
      )
      .returns(rawTargets);

    await prepareModifyCaDefaults.call(proc, {
      ticker,
      targets: {
        identities: ['someDid', 'otherDid'],
        treatment: TargetTreatment.Exclude,
      },
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({}),
      rawTicker,
      rawTargets
    );
  });

  test('should add a set default withholding tax transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDefaultWithholdingTax');

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetDefaults: {
          defaultTaxWithholding: new BigNumber(10),
        },
      },
    });

    const rawPercentage = dsMockUtils.createMockPermill(150000);
    percentageToPermillStub.withArgs(new BigNumber(15), mockContext).returns(rawPercentage);

    await prepareModifyCaDefaults.call(proc, {
      ticker,
      defaultTaxWithholding: new BigNumber(15),
    });

    sinon.assert.calledWith(
      addTransactionStub,
      transaction,
      sinon.match({}),
      rawTicker,
      rawPercentage
    );
  });

  test('should add a batch of set did withholding tax transactions to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('corporateAction', 'setDidWithholdingTax');

    entityMockUtils.configureMocks({
      securityTokenOptions: {
        corporateActionsGetDefaults: {
          taxWithholdings: [],
        },
      },
    });

    const rawDid = dsMockUtils.createMockIdentityId('someDid');
    const rawPercentage = dsMockUtils.createMockPermill(250000);

    stringToIdentityIdStub.withArgs('someDid', mockContext).returns(rawDid);
    percentageToPermillStub.withArgs(new BigNumber(25), mockContext).returns(rawPercentage);

    await prepareModifyCaDefaults.call(proc, {
      ticker,
      taxWithholdings: [
        {
          identity: 'someDid',
          percentage: new BigNumber(25),
        },
      ],
    });

    sinon.assert.calledWith(
      procedureMockUtils.getAddBatchTransactionStub(),
      transaction,
      sinon.match({}),
      [[rawTicker, rawDid, rawPercentage]]
    );
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          transactions: [],
          portfolios: [],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
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
        identityRoles: [{ type: RoleType.TokenCaa, ticker }],
        signerPermissions: {
          transactions: [
            TxTags.corporateAction.SetDefaultTargets,
            TxTags.corporateAction.SetDefaultWithholdingTax,
            TxTags.corporateAction.SetDidWithholdingTax,
          ],
          portfolios: [],
          tokens: [entityMockUtils.getSecurityTokenInstance({ ticker })],
        },
      });
    });
  });
});
