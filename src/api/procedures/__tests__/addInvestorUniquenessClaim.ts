import {
  Claim as MeshClaim,
  IdentityId,
  InvestorZKProofData,
  Moment,
  ScopeClaimProof as MeshScopeClaimProof,
  ScopeId,
  Ticker,
  TxTags,
} from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddInvestorUniquenessClaimParams,
  getAuthorization,
  prepareAddInvestorUniquenessClaim,
} from '~/api/procedures/addInvestorUniquenessClaim';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType, ScopeType } from '~/types';
import { ScopeClaimProof } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('addInvestorUniquenessClaim procedure', () => {
  let mockContext: Mocked<Context>;
  let did: string;
  let ticker: string;
  let cddId: string;
  let scopeId: string;
  let proof: string;
  let proofScopeIdWellformed: string;
  let firstChallengeResponse: string;
  let secondChallengeResponse: string;
  let subtractExpressionsRes: string;
  let blindedScopeDidHash: string;
  let scopeClaimProof: ScopeClaimProof;
  let expiry: Date;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let stringToInvestorZKProofDataStub: sinon.SinonStub<[string, Context], InvestorZKProofData>;
  let scopeClaimProofToMeshScopeClaimProofStub: sinon.SinonStub<
    [ScopeClaimProof, string, Context],
    MeshScopeClaimProof
  >;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let rawDid: IdentityId;
  let rawTicker: Ticker;
  let rawScopeId: ScopeId;
  let rawClaim: MeshClaim;
  let rawProof: InvestorZKProofData;
  let rawScopeClaimProof: MeshScopeClaimProof;
  let rawExpiry: Moment;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    did = 'someDid';
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'SOME_TOKEN';
    cddId = 'someCddId';
    scopeId = 'someScopeId';
    proof = 'someProof';
    proofScopeIdWellformed = 'someProofScopeIdWellformed';
    firstChallengeResponse = 'someFirstChallengeResponse';
    secondChallengeResponse = 'someSecondChallengeResponse';
    subtractExpressionsRes = 'someSubtractExpressionsRes';
    blindedScopeDidHash = 'someBlindedScopeDidHash';
    scopeClaimProof = {
      proofScopeIdWellformed,
      proofScopeIdCddIdMatch: {
        firstChallengeResponse,
        secondChallengeResponse,
        subtractExpressionsRes,
        blindedScopeDidHash,
      },
    };
    expiry = new Date(new Date().getTime() + 10000);

    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    claimToMeshClaimStub = sinon.stub(utilsConversionModule, 'claimToMeshClaim');
    stringToInvestorZKProofDataStub = sinon.stub(
      utilsConversionModule,
      'stringToInvestorZKProofData'
    );
    scopeClaimProofToMeshScopeClaimProofStub = sinon.stub(
      utilsConversionModule,
      'scopeClaimProofToMeshScopeClaimProof'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');

    rawDid = dsMockUtils.createMockIdentityId(did);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawClaim = dsMockUtils.createMockClaim({
      InvestorUniqueness: [
        dsMockUtils.createMockScope({ Ticker: rawTicker }),
        dsMockUtils.createMockScopeId(ticker),
        dsMockUtils.createMockCddId(cddId),
      ],
    });
    rawScopeId = dsMockUtils.createMockScopeId(scopeId);
    rawProof = dsMockUtils.createMockInvestorZKProofData(proof);
    rawScopeClaimProof = dsMockUtils.createMockScopeClaimProof(
      proofScopeIdWellformed,
      [firstChallengeResponse, secondChallengeResponse],
      subtractExpressionsRes,
      blindedScopeDidHash,
      scopeId
    );
    rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    stringToIdentityIdStub.withArgs(did, mockContext).returns(rawDid);
    claimToMeshClaimStub
      .withArgs(
        {
          type: ClaimType.InvestorUniqueness,
          scope: { type: ScopeType.Ticker, value: ticker },
          cddId,
          scopeId,
        },
        mockContext
      )
      .returns(rawClaim);
    stringToInvestorZKProofDataStub.withArgs(proof, mockContext).returns(rawProof);
    scopeClaimProofToMeshScopeClaimProofStub
      .withArgs(scopeClaimProof, scopeId, mockContext)
      .returns(rawScopeClaimProof);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
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

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope: { type: ScopeType.Ticker, value: ticker },
      proof,
      cddId,
      scopeId,
      expiry,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      addInvestorUniquenessClaimTransaction,
      {},
      rawDid,
      rawClaim,
      rawProof,
      rawExpiry
    );

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope: { type: ScopeType.Ticker, value: ticker },
      proof,
      cddId,
      scopeId,
    });

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

  test('should add an add investor uniqueness claim v2 transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimV2Transaction = dsMockUtils.createTxStub(
      'identity',
      'addInvestorUniquenessClaimV2'
    );

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope: { type: ScopeType.Ticker, value: ticker },
      proof: scopeClaimProof,
      cddId,
      scopeId,
      expiry,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      addInvestorUniquenessClaimV2Transaction,
      {},
      rawDid,
      rawClaim,
      rawScopeClaimProof,
      rawExpiry
    );

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope: { type: ScopeType.Ticker, value: ticker },
      proof: scopeClaimProof,
      cddId,
      scopeId,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      addInvestorUniquenessClaimV2Transaction,
      {},
      rawDid,
      rawClaim,
      rawScopeClaimProof,
      null
    );
  });

  test('should throw an error if the expiry date is in the past', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );

    expect(
      prepareAddInvestorUniquenessClaim.call(proc, {
        scope: { type: ScopeType.Ticker, value: ticker },
        proof: scopeClaimProof,
        cddId,
        scopeId,
        expiry: new Date('10/14/1987'),
      })
    ).rejects.toThrow('Expiry date must be in the future');
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const commonArgs = {
        scope: { type: ScopeType.Ticker, value: ticker },
        cddId,
        scopeId,
      };
      const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...commonArgs, proof })).toEqual({
        signerPermissions: {
          tokens: [],
          transactions: [TxTags.identity.AddInvestorUniquenessClaim],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...commonArgs, proof: scopeClaimProof })).toEqual({
        signerPermissions: {
          tokens: [],
          transactions: [TxTags.identity.AddInvestorUniquenessClaimV2],
          portfolios: [],
        },
      });
    });
  });
});
