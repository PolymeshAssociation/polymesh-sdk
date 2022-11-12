import {
  ConfidentialIdentityV2ClaimProofsScopeClaimProof,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesTicker,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import {
  Claim as MeshClaim,
  InvestorZKProofData,
  Moment,
  Scope as MeshScope,
  ScopeId,
} from 'polymesh-types/types';

import {
  getAuthorization,
  prepareAddInvestorUniquenessClaim,
} from '~/api/procedures/addInvestorUniquenessClaim';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  AddInvestorUniquenessClaimParams,
  Claim,
  ClaimType,
  Scope,
  ScopeClaimProof,
  ScopeType,
  TxTags,
} from '~/types';
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
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let claimToMeshClaimSpy: jest.SpyInstance<MeshClaim, [Claim, Context]>;
  let stringToInvestorZkProofDataSpy: jest.SpyInstance<InvestorZKProofData, [string, Context]>;
  let scopeClaimProofToMeshScopeClaimProofSpy: jest.SpyInstance<
    ConfidentialIdentityV2ClaimProofsScopeClaimProof,
    [ScopeClaimProof, string, Context]
  >;
  let scopeToMeshScopeSpy: jest.SpyInstance<MeshScope, [Scope, Context]>;
  let stringToScopeIdSpy: jest.SpyInstance<ScopeId, [string, Context]>;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let rawDid: PolymeshPrimitivesIdentityId;
  let rawTicker: PolymeshPrimitivesTicker;
  let rawScope: MeshScope;
  let rawScopeId: ScopeId;
  let rawClaim: MeshClaim;
  let rawClaimV2: MeshClaim;
  let rawProof: InvestorZKProofData;
  let rawScopeClaimProof: ConfidentialIdentityV2ClaimProofsScopeClaimProof;
  let rawExpiry: Moment;

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

    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    claimToMeshClaimSpy = jest.spyOn(utilsConversionModule, 'claimToMeshClaim');
    stringToInvestorZkProofDataSpy = jest.spyOn(
      utilsConversionModule,
      'stringToInvestorZKProofData'
    );
    scopeClaimProofToMeshScopeClaimProofSpy = jest.spyOn(
      utilsConversionModule,
      'scopeClaimProofToConfidentialIdentityClaimProof'
    );
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    stringToScopeIdSpy = jest.spyOn(utilsConversionModule, 'stringToScopeId');
    scopeToMeshScopeSpy = jest.spyOn(utilsConversionModule, 'scopeToMeshScope');
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
      proofScopeIdWellformed: proofScopeIdWellFormed,
      proofScopeIdCddIdMatch: {
        subtractExpressionsRes,
        challengeResponses: [firstChallengeResponse, secondChallengeResponse],
        blindedScopeDidHash,
      },
      scopeId,
    });
    /* eslint-enable @typescript-eslint/naming-convention */
    rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(rawDid);
    when(claimToMeshClaimSpy)
      .calledWith(
        {
          type: ClaimType.InvestorUniqueness,
          scope,
          cddId,
          scopeId,
        },
        mockContext
      )
      .mockReturnValue(rawClaim);
    when(claimToMeshClaimSpy)
      .calledWith(
        {
          type: ClaimType.InvestorUniquenessV2,
          cddId,
        },
        mockContext
      )
      .mockReturnValue(rawClaimV2);
    when(stringToInvestorZkProofDataSpy).calledWith(proof, mockContext).mockReturnValue(rawProof);
    when(scopeClaimProofToMeshScopeClaimProofSpy)
      .calledWith(scopeClaimProof, scopeId, mockContext)
      .mockReturnValue(rawScopeClaimProof);
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);
    when(stringToScopeIdSpy).calledWith(scopeId, mockContext).mockReturnValue(rawScopeId);
    when(scopeToMeshScopeSpy).calledWith(scope, mockContext).mockReturnValue(rawScope);
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

  it('should return an add investor uniqueness claim transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimTransaction = dsMockUtils.createTxMock(
      'identity',
      'addInvestorUniquenessClaim'
    );

    let result = await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof,
      cddId,
      scopeId,
      expiry,
    });

    expect(result).toEqual({
      transaction: addInvestorUniquenessClaimTransaction,
      args: [rawDid, rawClaim, rawProof, rawExpiry],
      resolver: undefined,
    });

    result = await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof,
      cddId,
      scopeId,
    });

    expect(result).toEqual({
      transaction: addInvestorUniquenessClaimTransaction,
      args: [rawDid, rawClaim, rawProof, null],
      resolver: undefined,
    });
  });

  it('should return an add investor uniqueness claim v2 transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<AddInvestorUniquenessClaimParams, void>(
      mockContext
    );
    const addInvestorUniquenessClaimV2Transaction = dsMockUtils.createTxMock(
      'identity',
      'addInvestorUniquenessClaimV2'
    );

    let result = await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof: scopeClaimProof,
      cddId,
      scopeId,
      expiry,
    });

    expect(result).toEqual({
      transaction: addInvestorUniquenessClaimV2Transaction,
      args: [rawDid, rawScope, rawClaimV2, rawScopeClaimProof, rawExpiry],
      resolver: undefined,
    });

    result = await prepareAddInvestorUniquenessClaim.call(proc, {
      scope,
      proof: scopeClaimProof,
      cddId,
      scopeId,
    });

    expect(result).toEqual({
      transaction: addInvestorUniquenessClaimV2Transaction,
      args: [rawDid, rawScope, rawClaimV2, rawScopeClaimProof, null],
      resolver: undefined,
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
