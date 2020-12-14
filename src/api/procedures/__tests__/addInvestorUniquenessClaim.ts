import {
  Claim as MeshClaim,
  IdentityId,
  InvestorZKProofData,
  Moment,
  Ticker,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddInvestorUniquenessClaimParams,
  prepareAddInvestorUniquenessClaim,
} from '~/api/procedures/addInvestorUniquenessClaim';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('addInvestorUniquenessClaim procedure', () => {
  let mockContext: Mocked<Context>;
  let did: string;
  let ticker: string;
  let cddId: string;
  let proof: string;
  let expiry: Date;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let stringToInvestorZKProofDataStub: sinon.SinonStub<[string, Context], InvestorZKProofData>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let rawDid: IdentityId;
  let rawTicker: Ticker;
  let rawClaim: MeshClaim;
  let rawProof: InvestorZKProofData;
  let rawExpiry: Moment;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    did = 'someDid';
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'SOME_TOKEN';
    cddId = 'someCddId';
    proof = 'someProof';
    expiry = new Date(new Date().getTime() + 10000);

    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    claimToMeshClaimStub = sinon.stub(utilsConversionModule, 'claimToMeshClaim');
    stringToInvestorZKProofDataStub = sinon.stub(
      utilsConversionModule,
      'stringToInvestorZKProofData'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');

    rawDid = dsMockUtils.createMockIdentityId(did);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawClaim = dsMockUtils.createMockClaim({
      InvestorUniqueness: [
        dsMockUtils.createMockScope({ Ticker: rawTicker }),
        dsMockUtils.createMockScopeId(ticker),
        dsMockUtils.createMockCddId(cddId),
      ],
    });
    rawProof = dsMockUtils.createMockInvestorZKProofData(proof);
    rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    stringToIdentityIdStub.withArgs(did, mockContext).returns(rawDid);
    claimToMeshClaimStub
      .withArgs({ type: ClaimType.InvestorUniqueness, ticker, cddId }, mockContext)
      .returns(rawClaim);
    stringToInvestorZKProofDataStub.withArgs(proof, mockContext).returns(rawProof);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
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

  test('should add an add investor uniqueness claim transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimTransaction = dsMockUtils.createTxStub(
      'identity',
      'addInvestorUniquenessClaim'
    );

    await prepareAddInvestorUniquenessClaim.call(proc, { ticker, proof, cddId, expiry });

    sinon.assert.calledWith(
      addTransactionStub,
      addInvestorUniquenessClaimTransaction,
      {},
      rawDid,
      rawClaim,
      rawProof,
      rawExpiry
    );

    await prepareAddInvestorUniquenessClaim.call(proc, { ticker, proof, cddId });

    sinon.assert.calledWith(
      addTransactionStub,
      addInvestorUniquenessClaimTransaction,
      {},
      rawDid,
      rawClaim,
      rawProof,
      null
    );
  });

  test('should throw an error if the expiry date is in the past', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );

    expect(
      prepareAddInvestorUniquenessClaim.call(proc, {
        ticker,
        proof,
        cddId,
        expiry: new Date('10/14/1987'),
      })
    ).rejects.toThrow('Expiry date must be in the future');
  });
});
