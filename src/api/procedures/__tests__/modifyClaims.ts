import { Option } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { Claim as MeshClaim, IdentityId, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  groupByDid,
  ModifyClaimsParams,
  prepareModifyClaims,
} from '~/api/procedures/modifyClaims';
import { Context, Identity } from '~/internal';
import { didsWithClaims } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType, RoleType, ScopeType } from '~/types';
import { ClaimOperation, PolymeshTx } from '~/types/internal';
import { DEFAULT_CDD_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifyClaims procedure', () => {
  let mockContext: Mocked<Context>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let addBatchTransactionStub: sinon.SinonStub;
  let addClaimTransaction: PolymeshTx<[IdentityId, Claim, Option<Moment>]>;
  let revokeClaimTransaction: PolymeshTx<[IdentityId, Claim]>;
  let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;

  let someDid: string;
  let otherDid: string;
  let cddId: string;
  let cddClaim: Claim;
  let buyLockupClaim: Claim;
  let iuClaim: Claim;
  let expiry: Date;
  let args: ModifyClaimsParams;

  let rawCddClaim: MeshClaim;
  let rawBuyLockupClaim: MeshClaim;
  let rawIuClaim: MeshClaim;
  let rawSomeDid: IdentityId;
  let rawOtherDid: IdentityId;
  let rawExpiry: Moment;

  const includeExpired = true;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();

    claimToMeshClaimStub = sinon.stub(utilsConversionModule, 'claimToMeshClaim');
    dateToMomentStub = sinon.stub(utilsConversionModule, 'dateToMoment');
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');

    sinon.stub(utilsConversionModule, 'stringToTicker');
    sinon.stub(utilsConversionModule, 'stringToScopeId');

    someDid = 'someDid';
    otherDid = 'otherDid';
    cddId = 'cddId';
    cddClaim = { type: ClaimType.CustomerDueDiligence, id: cddId };
    iuClaim = {
      type: ClaimType.InvestorUniqueness,
      scope: {
        type: ScopeType.Ticker,
        value: 'SOMETICKER',
      },
      cddId: 'someCddId',
      scopeId: 'someScopeId',
    };
    buyLockupClaim = {
      type: ClaimType.BuyLockup,
      scope: { type: ScopeType.Identity, value: 'someIdentityId' },
    };
    expiry = new Date();
    args = {
      claims: [
        {
          target: someDid,
          claim: cddClaim,
        },
        {
          target: otherDid,
          claim: cddClaim,
        },
        {
          target: someDid,
          claim: buyLockupClaim,
          expiry,
        },
        {
          target: someDid,
          claim: iuClaim,
        },
      ],
      operation: ClaimOperation.Add,
    };

    rawCddClaim = dsMockUtils.createMockClaim({
      CustomerDueDiligence: dsMockUtils.createMockCddId(),
    });
    rawBuyLockupClaim = dsMockUtils.createMockClaim({
      BuyLockup: dsMockUtils.createMockScope(),
    });
    rawIuClaim = dsMockUtils.createMockClaim({
      InvestorUniqueness: [
        dsMockUtils.createMockScope(),
        dsMockUtils.createMockScopeId(),
        dsMockUtils.createMockCddId(),
      ],
    });
    rawSomeDid = dsMockUtils.createMockIdentityId(someDid);
    rawOtherDid = dsMockUtils.createMockIdentityId(otherDid);
    rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
  });

  beforeEach(() => {
    addBatchTransactionStub = procedureMockUtils.getAddBatchTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    addClaimTransaction = dsMockUtils.createTxStub('identity', 'addClaim');
    revokeClaimTransaction = dsMockUtils.createTxStub('identity', 'revokeClaim');
    claimToMeshClaimStub.withArgs(cddClaim, mockContext).returns(rawCddClaim);
    claimToMeshClaimStub.withArgs(buyLockupClaim, mockContext).returns(rawBuyLockupClaim);
    claimToMeshClaimStub.withArgs(iuClaim, mockContext).returns(rawIuClaim);
    stringToIdentityIdStub.withArgs(someDid, mockContext).returns(rawSomeDid);
    stringToIdentityIdStub.withArgs(otherDid, mockContext).returns(rawOtherDid);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
    identityIdToStringStub.withArgs(rawOtherDid).returns(otherDid);
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

  test("should throw an error if some of the supplied target dids don't exist", async () => {
    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [otherDid] } });

    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);

    let error;

    try {
      await prepareModifyClaims.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the supplied Identity IDs do not exist');
    expect(error.data).toMatchObject({ nonExistentDids: [otherDid] });
  });

  describe('groupByDid', () => {
    test('should return the DID of the target identity', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(groupByDid([rawOtherDid] as any)).toBe(otherDid);
    });
  });

  test('should add a batch of add claim transactions to the queue', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        issuedClaims: {
          data: [
            {
              target: new Identity({ did: someDid }, mockContext),
              issuer: ('issuerIdentity' as unknown) as Identity,
              issuedAt: new Date(),
              expiry: null,
              claim: { type: ClaimType.CustomerDueDiligence, id: DEFAULT_CDD_ID },
            },
          ],
          next: 1,
          count: 1,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getCurrentIdentity();

    await prepareModifyClaims.call(
      procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext),
      {
        claims: [
          {
            target: someDid,
            claim: buyLockupClaim,
            expiry,
          },
        ],
        operation: ClaimOperation.Add,
      }
    );

    sinon.assert.calledWith(
      addBatchTransactionStub,
      addClaimTransaction,
      { groupByFn: sinon.match(sinon.match.func) },
      [[rawSomeDid, rawBuyLockupClaim, rawExpiry]]
    );

    await prepareModifyClaims.call(proc, args);

    const rawAddClaimItems = [
      [rawSomeDid, rawCddClaim, null],
      [rawOtherDid, rawCddClaim, null],
      [rawSomeDid, rawBuyLockupClaim, rawExpiry],
      [rawSomeDid, rawIuClaim, null],
    ];

    sinon.assert.calledWith(
      addBatchTransactionStub,
      addClaimTransaction,
      { groupByFn: sinon.match(sinon.match.func) },
      rawAddClaimItems
    );

    sinon.resetHistory();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [did],
        dids: [someDid, otherDid],
        includeExpired,
        count: 2,
      }),
      {
        didsWithClaims: {
          totalCount: 2,
          items: [
            {
              did: someDid,
              claims: [cddClaim, buyLockupClaim, iuClaim],
            },
            {
              did: otherDid,
              claims: [cddClaim],
            },
          ],
        },
      }
    );

    await prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Edit });

    sinon.assert.calledWith(
      addBatchTransactionStub,
      addClaimTransaction,
      { groupByFn: sinon.match(sinon.match.func) },
      rawAddClaimItems
    );
  });

  test('should throw an error if any of the CDD IDs of the claims that will be added are not equal to the CDD ID of current CDD claims', async () => {
    const otherId = 'otherId';
    dsMockUtils.configureMocks({
      contextOptions: {
        issuedClaims: {
          data: [
            {
              target: new Identity({ did: someDid }, mockContext),
              issuer: ('issuerIdentity' as unknown) as Identity,
              issuedAt: new Date(),
              expiry: null,
              claim: { type: ClaimType.CustomerDueDiligence, id: otherId },
            },
          ],
          next: 1,
          count: 1,
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getCurrentIdentity();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [did],
        dids: [someDid, otherDid],
        includeExpired,
        count: 2,
      }),
      {
        didsWithClaims: {
          totalCount: 2,
          items: [
            {
              did: someDid,
              claims: [cddClaim, buyLockupClaim],
            },
            {
              did: otherDid,
              claims: [cddClaim],
            },
          ],
        },
      }
    );

    let error;

    try {
      await prepareModifyClaims.call(proc, {
        claims: [
          {
            target: someDid,
            claim: cddClaim,
          },
          {
            target: otherDid,
            claim: cddClaim,
          },
          {
            target: new Identity({ did: someDid }, mockContext),
            claim: cddClaim,
          },
        ],
        operation: ClaimOperation.Add,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('A target Identity cannot have CDD claims with different IDs');

    const {
      target: { did: targetDid },
      currentCddId,
      newCddId,
    } = error.data.invalidCddClaims[0];
    expect(targetDid).toEqual(someDid);
    expect(currentCddId).toEqual(otherId);
    expect(newCddId).toEqual(cddId);
  });

  test("should throw an error if any of the claims that will be modified weren't issued by the current Identity", async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getCurrentIdentity();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [did],
        dids: [someDid, otherDid],
        includeExpired,
        count: 2,
      }),
      {
        didsWithClaims: {
          totalCount: 0,
          items: [],
        },
      }
    );

    await expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Edit })
    ).rejects.toThrow(
      new RegExp("Attempt to edit claims that weren't issued by the current Identity")
    );

    return expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke })
    ).rejects.toThrow(
      new RegExp("Attempt to revoke claims that weren't issued by the current Identity")
    );
  });

  test('should throw an error if any Investor Uniqueness claim has balance in a revoke operation', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getCurrentIdentity();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [did],
        dids: [someDid, otherDid],
        includeExpired,
        count: 2,
      }),
      {
        didsWithClaims: {
          totalCount: 2,
          items: [
            {
              did: someDid,
              claims: [cddClaim, buyLockupClaim, iuClaim],
            },
            {
              did: otherDid,
              claims: [cddClaim],
            },
          ],
        },
      }
    );

    dsMockUtils.createQueryStub('asset', 'aggregateBalance');
    balanceToBigNumberStub.returns(new BigNumber(1));

    return expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke })
    ).rejects.toThrow(
      new RegExp(
        'Attempt to revoke Investor Uniqueness claims from investors with positive balance'
      )
    );
  });

  test('should add a batch of revoke claim transactions to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getCurrentIdentity();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [did],
        dids: [someDid, otherDid],
        includeExpired,
        count: 2,
      }),
      {
        didsWithClaims: {
          totalCount: 2,
          items: [
            {
              did: someDid,
              claims: [cddClaim, buyLockupClaim, iuClaim],
            },
            {
              did: otherDid,
              claims: [cddClaim],
            },
          ],
        },
      }
    );

    dsMockUtils.createQueryStub('asset', 'aggregateBalance');
    balanceToBigNumberStub.returns(new BigNumber(0));

    await prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke });

    const rawRevokeClaimItems = [
      [rawSomeDid, rawCddClaim],
      [rawOtherDid, rawCddClaim],
      [rawSomeDid, rawBuyLockupClaim],
      [rawSomeDid, rawIuClaim],
    ];

    sinon.assert.calledWith(
      addBatchTransactionStub,
      revokeClaimTransaction,
      { groupByFn: sinon.match(sinon.match.func) },
      rawRevokeClaimItems
    );
  });
});

describe('getAuthorization', () => {
  test('should return the appropriate roles and permissions', () => {
    let args = {
      claims: [
        {
          target: 'someDid',
          claim: { type: ClaimType.CustomerDueDiligence },
        },
      ],
      operation: ClaimOperation.Add,
    } as ModifyClaimsParams;

    expect(getAuthorization(args)).toEqual({
      roles: [{ type: RoleType.CddProvider }],
      permissions: {
        tokens: [],
        portfolios: [],
        transactions: [TxTags.identity.AddClaim],
      },
    });

    args = {
      claims: [
        {
          target: 'someDid',
          claim: {
            type: ClaimType.Accredited,
            scope: { type: ScopeType.Identity, value: 'someIdentityId' },
          },
        },
      ],
      operation: ClaimOperation.Revoke,
    } as ModifyClaimsParams;

    expect(getAuthorization(args)).toEqual({
      permissions: {
        tokens: [],
        portfolios: [],
        transactions: [TxTags.identity.RevokeClaim],
      },
    });
  });
});
