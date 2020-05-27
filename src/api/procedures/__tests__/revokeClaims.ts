import { Vec } from '@polkadot/types';
import { BatchRevokeClaimItem, Claim as MeshClaim } from 'polymesh-types/types';
import sinon from 'sinon';

import { prepareRevokeClaims, RevokeClaimsParams } from '~/api/procedures/revokeClaims';
import { Context } from '~/context';
import { IdentityId } from '~/polkadot';
import { entityMockUtils, polkadotMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Claim, ClaimType } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('revokeClaims procedure', () => {
  let mockContext: Mocked<Context>;
  let claimToMeshClaimStub: sinon.SinonStub<[Claim, Context], MeshClaim>;
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let addTransactionStub: sinon.SinonStub;
  let revokeClaimsBatchTransaction: PolymeshTx<[Vec<BatchRevokeClaimItem>]>;

  let someDid: string;
  let otherDid: string;
  let cddClaim: Claim;
  let buyLockupClaim: Claim;
  let args: RevokeClaimsParams;

  let rawCddClaim: MeshClaim;
  let rawBuyLockupClaim: MeshClaim;
  let rawSomeDid: IdentityId;
  let rawOtherDid: IdentityId;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    polkadotMockUtils.initMocks();

    claimToMeshClaimStub = sinon.stub(utilsModule, 'claimToMeshClaim');
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');

    someDid = 'someDid';
    otherDid = 'otherDid';
    cddClaim = { type: ClaimType.CustomerDueDiligence };
    buyLockupClaim = { type: ClaimType.BuyLockup, scope: 'someIdentityId' };
    args = {
      claims: [
        {
          targets: [someDid, otherDid],
          claim: cddClaim,
        },
        {
          targets: [someDid],
          claim: buyLockupClaim,
        },
      ],
    };

    rawCddClaim = polkadotMockUtils.createMockClaim('CustomerDueDiligence');
    rawBuyLockupClaim = polkadotMockUtils.createMockClaim({
      BuyLockup: polkadotMockUtils.createMockIdentityId(),
    });
    rawSomeDid = polkadotMockUtils.createMockIdentityId(someDid);
    rawOtherDid = polkadotMockUtils.createMockIdentityId(otherDid);
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = polkadotMockUtils.getContextInstance();
    revokeClaimsBatchTransaction = polkadotMockUtils.createTxStub('identity', 'revokeClaimsBatch');
    claimToMeshClaimStub.withArgs(cddClaim, mockContext).returns(rawCddClaim);
    claimToMeshClaimStub.withArgs(buyLockupClaim, mockContext).returns(rawBuyLockupClaim);
    stringToIdentityIdStub.withArgs(someDid, mockContext).returns(rawSomeDid);
    stringToIdentityIdStub.withArgs(otherDid, mockContext).returns(rawOtherDid);
    identityIdToStringStub.withArgs(rawOtherDid).returns(otherDid);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polkadotMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    polkadotMockUtils.cleanup();
  });

  test("should throw an error if some of the supplied target dids don't exist", () => {
    polkadotMockUtils.configureMocks({ contextOptions: { invalidDids: [otherDid] } });

    const proc = procedureMockUtils.getInstance<RevokeClaimsParams, void>();
    proc.context = mockContext;

    return expect(prepareRevokeClaims.call(proc, args)).rejects.toThrow(
      `Some of the supplied identity IDs do not exist: ${otherDid}`
    );
  });

  test('should add a revoke claims batch transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<RevokeClaimsParams, void>();
    proc.context = mockContext;

    await prepareRevokeClaims.call(proc, args);

    const rawRevokeClaimItems = [
      {
        target: rawSomeDid,
        claim: rawCddClaim,
      },
      {
        target: rawOtherDid,
        claim: rawCddClaim,
      },
      {
        target: rawSomeDid,
        claim: rawBuyLockupClaim,
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
