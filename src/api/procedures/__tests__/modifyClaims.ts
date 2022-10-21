import { Option } from '@polkadot/types';
import { Balance, Moment } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { getAuthorization, prepareModifyClaims } from '~/api/procedures/modifyClaims';
import { Context, Identity } from '~/internal';
import { didsWithClaims } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  Claim,
  ClaimOperation,
  ClaimType,
  ModifyClaimsParams,
  RoleType,
  ScopeType,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DEFAULT_CDD_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('modifyClaims procedure', () => {
  let mockContext: Mocked<Context>;
  let claimToMeshClaimSpy: jest.SpyInstance<PolymeshPrimitivesIdentityClaimClaim, [Claim, Context]>;
  let dateToMomentSpy: jest.SpyInstance<Moment, [Date, Context]>;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let addClaimTransaction: PolymeshTx<[PolymeshPrimitivesIdentityId, Claim, Option<Moment>]>;
  let revokeClaimTransaction: PolymeshTx<[PolymeshPrimitivesIdentityId, Claim]>;
  let balanceToBigNumberSpy: jest.SpyInstance<BigNumber, [Balance]>;

  let someDid: string;
  let otherDid: string;
  let cddId: string;
  let defaultCddClaim: Claim;
  let cddClaim: Claim;
  let buyLockupClaim: Claim;
  let iuClaim: Claim;
  let expiry: Date;
  let args: ModifyClaimsParams;

  let rawCddClaim: PolymeshPrimitivesIdentityClaimClaim;
  let rawBuyLockupClaim: PolymeshPrimitivesIdentityClaimClaim;
  let rawIuClaim: PolymeshPrimitivesIdentityClaimClaim;
  let rawDefaultCddClaim: PolymeshPrimitivesIdentityClaimClaim;
  let rawSomeDid: PolymeshPrimitivesIdentityId;
  let rawOtherDid: PolymeshPrimitivesIdentityId;
  let rawExpiry: Moment;

  const includeExpired = true;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();

    claimToMeshClaimSpy = jest.spyOn(utilsConversionModule, 'claimToMeshClaim');
    dateToMomentSpy = jest.spyOn(utilsConversionModule, 'dateToMoment');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');

    jest.spyOn(utilsConversionModule, 'stringToTicker').mockImplementation();

    someDid = 'someDid';
    otherDid = 'otherDid';
    cddId = 'cddId';
    cddClaim = { type: ClaimType.CustomerDueDiligence, id: cddId };
    defaultCddClaim = { type: ClaimType.CustomerDueDiligence, id: DEFAULT_CDD_ID };
    iuClaim = {
      type: ClaimType.InvestorUniqueness,
      scope: {
        type: ScopeType.Ticker,
        value: 'SOME_TICKER',
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

    rawDefaultCddClaim = dsMockUtils.createMockClaim({
      CustomerDueDiligence: dsMockUtils.createMockCddId(DEFAULT_CDD_ID),
    });

    rawBuyLockupClaim = dsMockUtils.createMockClaim({
      BuyLockup: dsMockUtils.createMockScope(),
    });
    rawIuClaim = dsMockUtils.createMockClaim({
      InvestorUniqueness: [
        dsMockUtils.createMockScope(),
        dsMockUtils.createMockIdentityId(),
        dsMockUtils.createMockCddId(),
      ],
    });
    rawSomeDid = dsMockUtils.createMockIdentityId(someDid);
    rawOtherDid = dsMockUtils.createMockIdentityId(otherDid);
    rawExpiry = dsMockUtils.createMockMoment(new BigNumber(expiry.getTime()));
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addClaimTransaction = dsMockUtils.createTxMock('identity', 'addClaim');
    revokeClaimTransaction = dsMockUtils.createTxMock('identity', 'revokeClaim');
    when(claimToMeshClaimSpy).calledWith(cddClaim, mockContext).mockReturnValue(rawCddClaim);
    when(claimToMeshClaimSpy)
      .calledWith(buyLockupClaim, mockContext)
      .mockReturnValue(rawBuyLockupClaim);
    when(claimToMeshClaimSpy).calledWith(iuClaim, mockContext).mockReturnValue(rawIuClaim);
    when(claimToMeshClaimSpy)
      .calledWith(defaultCddClaim, mockContext)
      .mockReturnValue(rawDefaultCddClaim);
    when(stringToIdentityIdSpy).calledWith(someDid, mockContext).mockReturnValue(rawSomeDid);
    when(stringToIdentityIdSpy).calledWith(otherDid, mockContext).mockReturnValue(rawOtherDid);
    when(dateToMomentSpy).calledWith(expiry, mockContext).mockReturnValue(rawExpiry);
    when(identityIdToStringSpy).calledWith(rawOtherDid).mockReturnValue(otherDid);
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

  it("should throw an error if some of the supplied target dids don't exist", async () => {
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

  it('should return a batch of add claim transactions spec', async () => {
    dsMockUtils.configureMocks({
      contextOptions: {
        issuedClaims: {
          data: [
            {
              target: new Identity({ did: someDid }, mockContext),
              issuer: 'issuerIdentity' as unknown as Identity,
              issuedAt: new Date(),
              expiry: null,
              claim: defaultCddClaim,
            },
          ],
          next: new BigNumber(1),
          count: new BigNumber(1),
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getSigningIdentity();

    let result = await prepareModifyClaims.call(proc, {
      claims: [
        {
          target: someDid,
          claim: buyLockupClaim,
          expiry,
        },
      ],
      operation: ClaimOperation.Add,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: addClaimTransaction,
          args: [rawSomeDid, rawBuyLockupClaim, rawExpiry],
        },
      ],
      resolver: undefined,
    });

    result = await prepareModifyClaims.call(proc, args);

    const rawAddClaimItems = [
      [rawSomeDid, rawCddClaim, null],
      [rawOtherDid, rawCddClaim, null],
      [rawSomeDid, rawBuyLockupClaim, rawExpiry],
      [rawSomeDid, rawIuClaim, null],
    ] as const;

    expect(result).toEqual({
      transactions: rawAddClaimItems.map(item => ({
        transaction: addClaimTransaction,
        args: item,
      })),
      resolver: undefined,
    });

    jest.clearAllMocks();

    dsMockUtils.createApolloQueryMock(
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

    result = await prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Edit });

    expect(result).toEqual({
      transactions: rawAddClaimItems.map(item => ({
        transaction: addClaimTransaction,
        args: item,
      })),
      resolver: undefined,
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        issuedClaims: {
          data: [
            {
              target: new Identity({ did: someDid }, mockContext),
              issuer: 'issuerIdentity' as unknown as Identity,
              issuedAt: new Date(),
              expiry: null,
              claim: cddClaim,
            },
          ],
          next: new BigNumber(1),
          count: new BigNumber(1),
        },
      },
    });

    result = await prepareModifyClaims.call(proc, {
      claims: [
        {
          target: someDid,
          claim: defaultCddClaim,
          expiry,
        },
      ],
      operation: ClaimOperation.Add,
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: addClaimTransaction,
          args: [rawSomeDid, rawDefaultCddClaim, rawExpiry],
        },
      ],
      resolver: undefined,
    });
  });

  it('should throw an error if any of the CDD IDs of the claims that will be added are neither equal to the CDD ID of current CDD claims nor equal to default CDD ID', async () => {
    const otherId = 'otherId';
    dsMockUtils.configureMocks({
      contextOptions: {
        issuedClaims: {
          data: [
            {
              target: new Identity({ did: someDid }, mockContext),
              issuer: 'issuerIdentity' as unknown as Identity,
              issuedAt: new Date(),
              expiry: null,
              claim: { type: ClaimType.CustomerDueDiligence, id: otherId },
            },
          ],
          next: new BigNumber(1),
          count: new BigNumber(1),
        },
      },
    });
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getSigningIdentity();

    dsMockUtils.createApolloQueryMock(
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

  it("should throw an error if any of the claims that will be modified weren't issued by the signing Identity", async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getSigningIdentity();

    dsMockUtils.createApolloQueryMock(
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
    ).rejects.toThrow("Attempt to edit claims that weren't issued by the signing Identity");

    return expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke })
    ).rejects.toThrow("Attempt to revoke claims that weren't issued by the signing Identity");
  });

  it('should throw an error if any Investor Uniqueness claim has balance in a revoke operation', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getSigningIdentity();

    dsMockUtils.createApolloQueryMock(
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

    dsMockUtils.createQueryMock('asset', 'aggregateBalance');
    balanceToBigNumberSpy.mockReturnValue(new BigNumber(1));

    return expect(
      prepareModifyClaims.call(proc, { ...args, operation: ClaimOperation.Revoke })
    ).rejects.toThrow(
      'Attempt to revoke Investor Uniqueness claims from investors with positive balance'
    );
  });

  it('should return a batch of revoke claim transactions spec', async () => {
    const proc = procedureMockUtils.getInstance<ModifyClaimsParams, void>(mockContext);
    const { did } = await mockContext.getSigningIdentity();

    dsMockUtils.createApolloQueryMock(
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

    dsMockUtils.createQueryMock('asset', 'aggregateBalance');
    balanceToBigNumberSpy.mockReturnValue(new BigNumber(0));

    const result = await prepareModifyClaims.call(proc, {
      ...args,
      operation: ClaimOperation.Revoke,
    });

    const rawRevokeClaimItems = [
      [rawSomeDid, rawCddClaim],
      [rawOtherDid, rawCddClaim],
      [rawSomeDid, rawBuyLockupClaim],
      [rawSomeDid, rawIuClaim],
    ];

    expect(result).toEqual({
      transactions: rawRevokeClaimItems.map(item => ({
        transaction: revokeClaimTransaction,
        args: item,
      })),
      resolver: undefined,
    });
  });
});

describe('getAuthorization', () => {
  it('should return the appropriate roles and permissions', () => {
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
        assets: [],
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
        assets: [],
        portfolios: [],
        transactions: [TxTags.identity.RevokeClaim],
      },
    });
  });
});
