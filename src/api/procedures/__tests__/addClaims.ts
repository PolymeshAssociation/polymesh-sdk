import { Vec } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import { BatchAddClaimItem, Claim as MeshClaim } from 'polymesh-types/types';
import sinon from 'sinon';

import { AddClaimsParams, getRequiredRoles, prepareAddClaims } from '~/api/procedures/addClaims';
import { Context } from '~/context';
import { IdentityId } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType, RoleType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('addClaims procedure', () => {
  let mockContext: Mocked<Context>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let addTransactionStub: sinon.SinonStub;
  let addClaimsBatchTransaction: PolymeshTx<[Vec<BatchAddClaimItem>]>;

  let someDid: string;
  let otherDid: string;
  let cddClaim: Claim;
  let buyLockupClaim: Claim;
  let expiry: Date;
  let args: AddClaimsParams;

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

  test("should throw an error if some of the supplied target dids don't exist", () => {
    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [otherDid] } });

    const proc = procedureMockUtils.getInstance<AddClaimsParams, void>();
    proc.context = mockContext;

    return expect(prepareAddClaims.call(proc, args)).rejects.toThrow(
      `Some of the supplied identity IDs do not exist: ${otherDid}`
    );
  });

  test('should add an add claims batch transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<AddClaimsParams, void>();
    proc.context = mockContext;

    await prepareAddClaims.call(proc, args);

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
    } as AddClaimsParams;

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
    } as AddClaimsParams;

    expect(getRequiredRoles(args)).toEqual([]);
  });
});
