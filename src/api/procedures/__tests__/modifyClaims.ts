import { Vec } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import { BatchAddClaimItem, BatchRevokeClaimItem, Claim as MeshClaim } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getRequiredRoles,
  ModifyClaimsParams,
  prepareModifyClaims,
} from '~/api/procedures/modifyClaims';
import { Context } from '~/context';
import { didsWithClaims } from '~/middleware/queries';
import { IdentityId } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType, RoleType } from '~/types';
import { ClaimOperation, PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('modifyClaims procedure', () => {
  let mockContext: Mocked<Context>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let addTransactionStub: sinon.SinonStub;
  let addClaimsBatchTransaction: PolymeshTx<[Vec<BatchAddClaimItem>]>;
  let revokeClaimsBatchTransaction: PolymeshTx<[Vec<BatchRevokeClaimItem>]>;

  let someDid: string;
  let otherDid: string;
  let cddClaim: Claim;
  let buyLockupClaim: Claim;
  let expiry: Date;
  let args: ModifyClaimsParams;

  let rawCddClaim: MeshClaim;
  let rawBuyLockupClaim: MeshClaim;
  let rawSomeDid: IdentityId;
  let rawOtherDid: IdentityId;
  let rawExpiry: Moment;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();

    claimToMeshClaimStub = sinon.stub(utilsModule, 'claimToMeshClaim');
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');

    someDid = 'someDid';
    otherDid = 'otherDid';
    cddClaim = { type: ClaimType.CustomerDueDiligence };
    buyLockupClaim = { type: ClaimType.BuyLockup, scope: 'someIdentityId' };
    expiry = new Date();
    args = {
      claims: [
        {
          targets: [someDid, otherDid],
          claim: cddClaim,
        },
        {
          targets: [someDid],
          claim: buyLockupClaim,
          expiry,
        },
      ],
      operation: ClaimOperation.Add,
    };

    rawCddClaim = dsMockUtils.createMockClaim('CustomerDueDiligence');
    rawBuyLockupClaim = dsMockUtils.createMockClaim({
      BuyLockup: dsMockUtils.createMockIdentityId(),
    });
    rawSomeDid = dsMockUtils.createMockIdentityId(someDid);
    rawOtherDid = dsMockUtils.createMockIdentityId(otherDid);
    rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
    addClaimsBatchTransaction = dsMockUtils.createTxStub('identity', 'addClaimsBatch');
    revokeClaimsBatchTransaction = dsMockUtils.createTxStub('identity', 'revokeClaimsBatch');
    claimToMeshClaimStub.withArgs(cddClaim, mockContext).returns(rawCddClaim);
    claimToMeshClaimStub.withArgs(buyLockupClaim, mockContext).returns(rawBuyLockupClaim);
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

    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>();
    proc.context = mockContext;

    let error;

    try {
      await prepareModifyClaims.call(proc, args);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the supplied identity IDs do not exist');
    expect(error.data).toMatchObject({ nonExistentDids: [otherDid] });
  });

  test('should add an add claims batch transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>();
    proc.context = mockContext;

    await prepareModifyClaims.call(proc, args);

    const rawAddClaimItems = [
      {
        target: rawSomeDid,
        claim: rawCddClaim,
        expiry: null,
      },
      {
        target: rawOtherDid,
        claim: rawCddClaim,
        expiry: null,
      },
      {
        target: rawSomeDid,
        claim: rawBuyLockupClaim,
        expiry: rawExpiry,
      },
    ];

    sinon.assert.calledWith(
      addTransactionStub,
      addClaimsBatchTransaction,
      { batchSize: rawAddClaimItems.length },
      rawAddClaimItems
    );

    sinon.resetHistory();

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [mockContext.getCurrentIdentity().did],
        dids: [someDid, otherDid],
      }),
      {
        didsWithClaims: [
          {
            did: someDid,
            claims: [cddClaim, buyLockupClaim],
          },
          {
            did: otherDid,
            claims: [cddClaim],
          },
        ],
      }
    );

    await prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Edit });

    sinon.assert.calledWith(
      addTransactionStub,
      addClaimsBatchTransaction,
      { batchSize: rawAddClaimItems.length },
      rawAddClaimItems
    );
  });

  test("should throw an error if any of the claims that will be modified weren't issued by the current identity", async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>();
    proc.context = mockContext;

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [mockContext.getCurrentIdentity().did],
        dids: [someDid, otherDid],
      }),
      {
        didsWithClaims: [],
      }
    );

    await expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Edit })
    ).rejects.toThrow(
      new RegExp("Attempt to edit claims that weren't issued by the current identity")
    );

    await expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke })
    ).rejects.toThrow(
      new RegExp("Attempt to revoke claims that weren't issued by the current identity")
    );
  });

  test('should add a revoke claims batch transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>();
    proc.context = mockContext;

    dsMockUtils.createApolloQueryStub(
      didsWithClaims({
        trustedClaimIssuers: [mockContext.getCurrentIdentity().did],
        dids: [someDid, otherDid],
      }),
      {
        didsWithClaims: [
          {
            did: someDid,
            claims: [cddClaim, buyLockupClaim],
          },
          {
            did: otherDid,
            claims: [cddClaim],
          },
        ],
      }
    );

    await prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke });

    const rawRevokeClaimItems = [
      {
        target: rawSomeDid,
        claim: rawCddClaim,
        expiry: null,
      },
      {
        target: rawOtherDid,
        claim: rawCddClaim,
        expiry: null,
      },
      {
        target: rawSomeDid,
        claim: rawBuyLockupClaim,
        expiry: rawExpiry,
      },
    ];

    sinon.assert.calledWith(
      addTransactionStub,
      revokeClaimsBatchTransaction,
      { batchSize: rawRevokeClaimItems.length },
      rawRevokeClaimItems
    );
  });
});

describe('getRequiredRoles', () => {
  test('should return a cdd provider role if args has at least one customer due diligence claim type', () => {
    const args = {
      claims: [
        {
          targets: ['someDid'],
          claim: { type: ClaimType.CustomerDueDiligence },
        },
      ],
    } as ModifyClaimsParams;

    expect(getRequiredRoles(args)).toEqual([{ type: RoleType.CddProvider }]);
  });

  test("should return an empty array if args doesn't have a customer due diligence claim type", () => {
    const args = {
      claims: [
        {
          targets: ['someDid'],
          claim: { type: ClaimType.Accredited, scope: 'someIdentityId' },
        },
      ],
    } as ModifyClaimsParams;

    expect(getRequiredRoles(args)).toEqual([]);
  });
});
