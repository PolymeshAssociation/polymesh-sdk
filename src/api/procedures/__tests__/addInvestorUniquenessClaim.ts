import BigNumber from 'bignumber.js';
import {
  Claim as MeshClaim,
  IdentityId,
  InvestorZKProofData,
  Moment,
  Scope as MeshScope,
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
import { Claim, ClaimType, Scope, ScopeType } from '~/types';
import { ScopeClaimProof } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('addInvestorUniquenessClaim procedure', () => {
  let mockContext: Mocked<Context>;
  let did: string;
  let ticker: string;
  let cddId: string;
  let scope: Scope;
  let scopeId: string;
  let proof: string;
  let proofScopeIdWellFormed: string;
  let firstChallengeResponse: string;
  let secondChallengeResponse: string;
  let subtractExpressionsRes: string;
  let blindedScopeDidHash: string;
  let scopeClaimProof: ScopeClaimProof;
  let expiry: Date;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let stringToInvestorZkProofDataStub: sinon.SinonStub<[string, Context], InvestorZKProofData>;
  let scopeClaimProofToMeshScopeClaimProofStub: sinon.SinonStub<
    [ScopeClaimProof, string, Context],
    MeshScopeClaimProof
  >;
  let scopeToMeshScopeStub: sinon.SinonStub<[Scope, Context], MeshScope>;
  let stringToScopeIdStub: sinon.SinonStub<[string, Context], ScopeId>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let rawDid: IdentityId;
  let rawTicker: Ticker;
  let rawScope: MeshScope;
  let rawScopeId: ScopeId;
  let rawClaim: MeshClaim;
  let rawClaimV2: MeshClaim;
  let rawProof: InvestorZKProofData;
  let rawScopeClaimProof: MeshScopeClaimProof;
  let rawExpiry: Moment;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    did = 'someDid';
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    ticker = 'SOME_ASSET';
    cddId = 'someCddId';
    scope = { type: ScopeType.Ticker, value: ticker };
    scopeId = 'someScopeId';
    proof = 'someProof';
    proofScopeIdWellFormed = 'someProofScopeIdWellFormed';
    firstChallengeResponse = 'someFirstChallengeResponse';
    secondChallengeResponse = 'someSecondChallengeResponse';
    subtractExpressionsRes = 'someSubtractExpressionsRes';
    blindedScopeDidHash = 'someBlindedScopeDidHash';
    scopeClaimProof = {
      proofScopeIdWellFormed,
      proofScopeIdCddIdMatch: {
        challengeResponses: [firstChallengeResponse, secondChallengeResponse],
        subtractExpressionsRes,
        blindedScopeDidHash,
      },
    };
    expiry = new Date(new Date().getTime() + 10000);

    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    claimToMeshClaimStub = sinon.stub(utilsConversionModule, 'claimToMeshClaim');
    stringToInvestorZkProofDataStub = sinon.stub(
      utilsConversionModule,
      'stringToInvestorZKProofData'
    );
    scopeClaimProofToMeshScopeClaimProofStub = sinon.stub(
      utilsConversionModule,
      'scopeClaimProofToMeshScopeClaimProof'
    );
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    stringToScopeIdStub = sinon.stub(utilsConversionModule, 'stringToScopeId');
    scopeToMeshScopeStub = sinon.stub(utilsConversionModule, 'scopeToMeshScope');
    rawDid = dsMockUtils.createMockIdentityId(did);
    rawTicker = dsMockUtils.createMockTicker(ticker);
    /* eslint-disable @typescript-eslint/naming-convention */
    rawClaim = dsMockUtils.createMockClaim({
      InvestorUniqueness: [
        dsMockUtils.createMockScope({ Ticker: rawTicker }),
        dsMockUtils.createMockScopeId(ticker),
        dsMockUtils.createMockCddId(cddId),
      ],
    });
    rawClaimV2 = dsMockUtils.createMockClaim({
      InvestorUniquenessV2: dsMockUtils.createMockCddId(cddId),
    });
    rawScope = dsMockUtils.createMockScope({ Ticker: rawTicker });
    rawScopeId = dsMockUtils.createMockScopeId(scopeId);
    rawProof = dsMockUtils.createMockInvestorZKProofData(proof);
    rawScopeClaimProof = dsMockUtils.createMockScopeClaimProof({
      proof_scope_id_wellformed: proofScopeIdWellFormed,
      proof_scope_id_cdd_id_match: {
        subtract_expressions_res: subtractExpressionsRes,
        challenge_responses: [firstChallengeResponse, secondChallengeResponse],
        blinded_scope_did_hash: blindedScopeDidHash,
      },
      scope_id: scopeId,
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();

    stringToIdentityIdStub.withArgs(did, mockContext).returns(rawDid);
    claimToMeshClaimStub
      .withArgs(
        {
          type: ClaimType.InvestorUniqueness,
          scope,
          cddId,
          scopeId,
        },
        mockContext
      )
      .returns(rawClaim);
    claimToMeshClaimStub
      .withArgs(
        {
          type: ClaimType.InvestorUniquenessV2,
          cddId,
        },
        mockContext
      )
      .returns(rawClaimV2);
    stringToInvestorZkProofDataStub.withArgs(proof, mockContext).returns(rawProof);
    scopeClaimProofToMeshScopeClaimProofStub
      .withArgs(scopeClaimProof, scopeId, mockContext)
      .returns(rawScopeClaimProof);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
    stringToScopeIdStub.withArgs(scopeId, mockContext).returns(rawScopeId);
    scopeToMeshScopeStub.withArgs(scope, mockContext).returns(rawScope);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should add an add investor uniqueness claim transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimTransaction = dsMockUtils.createTxStub(
      'identity',
      'addInvestorUniquenessClaim'
    );

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof,
      cddId,
      scopeId,
      expiry,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addInvestorUniquenessClaimTransaction,
      args: [rawDid, rawClaim, rawProof, rawExpiry],
    });

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof,
      cddId,
      scopeId,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addInvestorUniquenessClaimTransaction,
      args: [rawDid, rawClaim, rawProof, null],
    });
  });

  it('should add an add investor uniqueness claim v2 transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimV2Transaction = dsMockUtils.createTxStub(
      'identity',
      'addInvestorUniquenessClaimV2'
    );

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof: scopeClaimProof,
      cddId,
      scopeId,
      expiry,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addInvestorUniquenessClaimV2Transaction,
      args: [rawDid, rawScope, rawClaimV2, rawScopeClaimProof, rawExpiry],
    });

    await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof: scopeClaimProof,
      cddId,
      scopeId,
    });

    sinon.assert.calledWith(addTransactionStub, {
      transaction: addInvestorUniquenessClaimV2Transaction,
      args: [rawDid, rawScope, rawClaimV2, rawScopeClaimProof, null],
    });
  });

  it('should throw an error if the expiry date is in the past', async () => {
    const commonArgs = {
      scope,
      cddId,
      scopeId,
      expiry: new Date('10/14/1987'),
    };

    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );

    await expect(
      prepareAddInvestorUniquenessClaim.call(proc, { ...commonArgs, proof })
    ).rejects.toThrow('Expiry date must be in the future');

    return expect(
      prepareAddInvestorUniquenessClaim.call(proc, { ...commonArgs, proof: scopeClaimProof })
    ).rejects.toThrow('Expiry date must be in the future');
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const commonArgs = {
        scope,
        cddId,
        scopeId,
      };
      const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
        mockContext
      );
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc({ ...commonArgs, proof })).toEqual({
        permissions: {
          assets: [],
          transactions: [TxTags.identity.AddInvestorUniquenessClaim],
          portfolios: [],
        },
      });

      expect(boundFunc({ ...commonArgs, proof: scopeClaimProof })).toEqual({
        permissions: {
          assets: [],
          transactions: [TxTags.identity.AddInvestorUniquenessClaimV2],
          portfolios: [],
        },
      });
    });
  });
});
