import { Text } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import {
  CAId,
  CAKind,
  IdentityId,
  Moment,
  RecordDateSpec,
  TargetIdentities,
  Tax,
  Ticker,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createCaIdResolver,
  getAuthorization,
  Params,
  prepareInitiateCorporateAction,
} from '~/api/procedures/initiateCorporateAction';
import * as utilsProcedureModule from '~/api/procedures/utils';
import { Context, Identity, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CorporateActionKind, InputCaCheckpoint, TargetTreatment, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);

describe('initiateCorporateAction procedure', () => {
  let ticker: string;
  let kind: CorporateActionKind;
  let declarationDate: Date;
  let checkpoint: InputCaCheckpoint;
  let description: string;
  let targets: { identities: (string | Identity)[]; treatment: TargetTreatment };
  let defaultTaxWithholding: BigNumber;
  let taxWithholdings: { identity: string | Identity; percentage: BigNumber }[];

  let rawTicker: Ticker;
  let rawKind: CAKind;
  let rawDeclDate: Moment;
  let rawRecordDate: RecordDateSpec;
  let rawDetails: Text;
  let rawTargets: TargetIdentities;
  let rawTax: Tax;
  let rawWithholdings: [IdentityId, Tax][];

  let rawCaId: PostTransactionValue<CAId>;

  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let initiateCorporateActionTransaction: PolymeshTx<unknown[]>;

  let maxDetailsLengthQueryStub: sinon.SinonStub;

  let stringToTickerStub: sinon.SinonStub;
  let corporateActionKindToCaKindStub: sinon.SinonStub;
  let dateToMomentStub: sinon.SinonStub;
  let checkpointToRecordDateSpecStub: sinon.SinonStub;
  let stringToTextStub: sinon.SinonStub;
  let targetsToTargetIdentitiesStub: sinon.SinonStub;
  let percentageToPermillStub: sinon.SinonStub;
  let stringToIdentityIdStub: sinon.SinonStub;

  let assertCaTargetsValidStub: sinon.SinonStub;
  let assertCaTaxWithholdingsValidStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    ticker = 'SOME_TICKER';
    kind = CorporateActionKind.UnpredictableBenefit;
    declarationDate = new Date('10/14/1987');
    checkpoint = new Date(new Date().getTime() + 60 * 60 * 24 * 365);
    description = 'someDescription';
    targets = {
      identities: ['someDid'],
      treatment: TargetTreatment.Exclude,
    };
    defaultTaxWithholding = new BigNumber(10);
    taxWithholdings = [{ identity: 'someDid', percentage: new BigNumber(30) }];

    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawKind = dsMockUtils.createMockCAKind(kind);
    rawDeclDate = dsMockUtils.createMockMoment(declarationDate.getTime());
    rawRecordDate = dsMockUtils.createMockRecordDateSpec({
      Scheduled: dsMockUtils.createMockMoment(checkpoint.getTime()),
    });
    rawDetails = dsMockUtils.createMockText(description);
    rawTargets = dsMockUtils.createMockTargetIdentities({
      identities: targets.identities as string[],
      treatment: targets.treatment,
    });
    rawTax = dsMockUtils.createMockPermill(defaultTaxWithholding.toNumber());
    rawWithholdings = [
      tuple(dsMockUtils.createMockIdentityId('someDid'), dsMockUtils.createMockPermill(30)),
    ];

    rawCaId = 'caId' as unknown as PostTransactionValue<CAId>;

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    corporateActionKindToCaKindStub = sinon.stub(
      utilsConversionModule,
      'corporateActionKindToCaKind'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    checkpointToRecordDateSpecStub = sinon.stub(
      utilsConversionModule,
      'checkpointToRecordDateSpec'
    );
    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');
    targetsToTargetIdentitiesStub = sinon.stub(utilsConversionModule, 'targetsToTargetIdentities');
    percentageToPermillStub = sinon.stub(utilsConversionModule, 'percentageToPermill');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    assertCaTargetsValidStub = sinon.stub(utilsProcedureModule, 'assertCaTargetsValid');
    assertCaTaxWithholdingsValidStub = sinon.stub(
      utilsProcedureModule,
      'assertCaTaxWithholdingsValid'
    );
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([rawCaId]);
    initiateCorporateActionTransaction = dsMockUtils.createTxStub(
      'corporateAction',
      'initiateCorporateAction'
    );

    maxDetailsLengthQueryStub = dsMockUtils.createQueryStub('corporateAction', 'maxDetailsLength', {
      returnValue: dsMockUtils.createMockU32(100),
    });
    mockContext = dsMockUtils.getContextInstance();

    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    corporateActionKindToCaKindStub.withArgs(kind, mockContext).returns(rawKind);
    dateToMomentStub.withArgs(declarationDate, mockContext).returns(rawDeclDate);
    checkpointToRecordDateSpecStub.withArgs(checkpoint, mockContext).returns(rawRecordDate);
    stringToTextStub.withArgs(description, mockContext).returns(rawDetails);
    targetsToTargetIdentitiesStub.withArgs(targets, mockContext).returns(rawTargets);
    percentageToPermillStub.withArgs(defaultTaxWithholding, mockContext).returns(rawTax);
    percentageToPermillStub
      .withArgs(taxWithholdings[0].percentage, mockContext)
      .returns(rawWithholdings[0][1]);
    stringToIdentityIdStub.withArgs('someDid', mockContext).returns(rawWithholdings[0][0]);
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

  test('should throw an error if the declaration date is in the future', async () => {
    const proc = procedureMockUtils.getInstance<Params, CAId>(mockContext);

    let err;

    try {
      await prepareInitiateCorporateAction.call(proc, {
        ticker,
        kind,
        declarationDate: new Date(new Date().getTime() + 1000 * 60 * 60),
        checkpoint,
        description,
        targets,
        defaultTaxWithholding,
        taxWithholdings,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Declaration date must be in the past');
  });

  test('should throw an error if the description is too long', async () => {
    const proc = procedureMockUtils.getInstance<Params, CAId>(mockContext);

    maxDetailsLengthQueryStub.returns(dsMockUtils.createMockU32(1));

    let err;

    try {
      await prepareInitiateCorporateAction.call(proc, {
        ticker,
        kind,
        description,
        taxWithholdings,
      });
    } catch (error) {
      err = error;
    }

    expect(err.message).toBe('Description too long');
    expect(err.data).toEqual({
      maxLength: 1,
    });
  });

  test('should add a initiate corporate action transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, CAId>(mockContext);

    const result = await prepareInitiateCorporateAction.call(proc, {
      ticker,
      kind,
      declarationDate,
      checkpoint,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
    });

    sinon.assert.calledWith(assertCaTargetsValidStub, targets, mockContext);
    sinon.assert.calledWith(assertCaTaxWithholdingsValidStub, taxWithholdings, mockContext);

    sinon.assert.calledWith(
      addTransactionStub,
      initiateCorporateActionTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawTicker,
      rawKind,
      rawDeclDate,
      rawRecordDate,
      rawDetails,
      rawTargets,
      rawTax,
      rawWithholdings
    );

    expect(result).toEqual(rawCaId);

    await prepareInitiateCorporateAction.call(proc, {
      ticker,
      kind,
      declarationDate,
      description,
      targets,
      defaultTaxWithholding,
      taxWithholdings,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      initiateCorporateActionTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawTicker,
      rawKind,
      rawDeclDate,
      null,
      rawDetails,
      rawTargets,
      rawTax,
      rawWithholdings
    );

    await prepareInitiateCorporateAction.call(proc, {
      ticker,
      kind,
      declarationDate,
      description,
      targets,
      defaultTaxWithholding,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      initiateCorporateActionTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawTicker,
      rawKind,
      rawDeclDate,
      null,
      rawDetails,
      rawTargets,
      rawTax,
      null
    );
  });

  describe('caIdResolver', () => {
    const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
    const id = 'caId' as unknown as CAId;

    beforeEach(() => {
      filterEventRecordsStub.returns([dsMockUtils.createMockIEvent(['data', id])]);
    });

    afterEach(() => {
      filterEventRecordsStub.reset();
    });

    test('should return the CAId ', () => {
      const result = createCaIdResolver()({} as ISubmittableResult);

      expect(result).toBe(id);
    });
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, CAId>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ticker,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateAction.InitiateCorporateAction],
          assets: [entityMockUtils.getAssetInstance({ ticker })],
          portfolios: [],
        },
      });
    });
  });
});
