import { Vec } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesIdentityId,
} from '@polkadot/types/lookup';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareModifyAssetTrustedClaimIssuers,
} from '~/api/procedures/modifyAssetTrustedClaimIssuers';
import { BaseAsset, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { InputTrustedClaimIssuer, TrustedClaimIssuer, TxTags } from '~/types';
import { PolymeshTx, TrustedClaimIssuerOperation } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('modifyAssetTrustedClaimIssuers procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let trustedClaimIssuerToTrustedIssuerSpy: jest.SpyInstance<
    PolymeshPrimitivesConditionTrustedIssuer,
    [InputTrustedClaimIssuer, Context]
  >;
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let trustedClaimIssuerMock: jest.Mock;
  let assetId: string;
  let asset: BaseAsset;
  let claimIssuerDids: string[];
  let claimIssuers: TrustedClaimIssuer[];
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawClaimIssuers: PolymeshPrimitivesConditionTrustedIssuer[];
  let args: Omit<Params, 'operation' | 'claimIssuers'>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    trustedClaimIssuerToTrustedIssuerSpy = jest.spyOn(
      utilsConversionModule,
      'trustedClaimIssuerToTrustedIssuer'
    );
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getBaseAssetInstance({ assetId });
    claimIssuerDids = ['aDid', 'otherDid', 'differentDid'];
    claimIssuers = claimIssuerDids.map(did => ({
      identity: entityMockUtils.getIdentityInstance({ did }),
      trustedFor: null,
    }));
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawClaimIssuers = claimIssuerDids.map(did =>
      dsMockUtils.createMockTrustedIssuer({
        issuer: dsMockUtils.createMockIdentityId(did),
        trustedFor: dsMockUtils.createMockTrustedFor('Any'),
      })
    );
    args = {
      asset,
    };
  });

  let removeDefaultTrustedClaimIssuerTransaction: PolymeshTx<
    [Vec<PolymeshPrimitivesIdentityId>, PolymeshPrimitivesAssetAssetId]
  >;
  let addDefaultTrustedClaimIssuerTransaction: PolymeshTx<
    [Vec<PolymeshPrimitivesConditionTrustedIssuer>, PolymeshPrimitivesAssetAssetId]
  >;

  beforeEach(() => {
    trustedClaimIssuerMock = dsMockUtils.createQueryMock(
      'complianceManager',
      'trustedClaimIssuer',
      {
        returnValue: [],
      }
    );

    removeDefaultTrustedClaimIssuerTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'removeDefaultTrustedClaimIssuer'
    );
    addDefaultTrustedClaimIssuerTransaction = dsMockUtils.createTxMock(
      'complianceManager',
      'addDefaultTrustedClaimIssuer'
    );

    mockContext = dsMockUtils.getContextInstance();

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    claimIssuerDids.forEach((did, index) => {
      when(trustedClaimIssuerToTrustedIssuerSpy)
        .calledWith(
          expect.objectContaining({ identity: expect.objectContaining({ did }) }),
          mockContext
        )
        .mockReturnValue(rawClaimIssuers[index]);
    });
    claimIssuers.forEach((issuer, index) => {
      when(identityIdToStringSpy)
        .calledWith(rawClaimIssuers[index].issuer)
        .mockReturnValue(issuer.identity.did);
      when(stringToIdentityIdSpy)
        .calledWith(utilsConversionModule.signerToString(issuer.identity), mockContext)
        .mockReturnValue(rawClaimIssuers[index].issuer);
    });
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

  it('should throw an error if the new list is the same as the current one (set)', () => {
    const alternativeClaimIssuers: PolymeshPrimitivesConditionTrustedIssuer[] = rawClaimIssuers.map(
      ({ issuer }) =>
        dsMockUtils.createMockTrustedIssuer({
          issuer,
          trustedFor: dsMockUtils.createMockTrustedFor({ Specific: [] }),
        })
    );
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(alternativeClaimIssuers);
    claimIssuerDids.forEach((did, index) => {
      when(trustedClaimIssuerToTrustedIssuerSpy)
        .calledWith(
          expect.objectContaining({ identity: expect.objectContaining({ did }) }),
          mockContext
        )
        .mockReturnValue(alternativeClaimIssuers[index]);
    });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareModifyAssetTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers: claimIssuers.map(({ identity }) => ({ identity, trustedFor: [] })),
        operation: TrustedClaimIssuerOperation.Set,
      })
    ).rejects.toThrow('The supplied claim issuer list is equal to the current one');
  });

  it("should throw an error if some of the supplied dids don't exist", async () => {
    const nonExistentDid = claimIssuerDids[1];
    dsMockUtils.configureMocks({ contextOptions: { invalidDids: [nonExistentDid] } });
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareModifyAssetTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers,
        operation: TrustedClaimIssuerOperation.Set,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Some of the supplied Identities do not exist');
    expect(error.data).toMatchObject({ nonExistentDids: [nonExistentDid] });
  });

  it('should add a transaction to remove the current claim issuers and another one to add the ones in the input (set)', async () => {
    const currentClaimIssuers = rawClaimIssuers.slice(0, -1);
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyAssetTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers,
      operation: TrustedClaimIssuerOperation.Set,
    });

    expect(result).toEqual({
      transactions: [
        ...currentClaimIssuers.map(({ issuer }) => ({
          transaction: removeDefaultTrustedClaimIssuerTransaction,
          args: [rawAssetId, issuer],
        })),
        ...rawClaimIssuers.map(issuer => ({
          transaction: addDefaultTrustedClaimIssuerTransaction,
          args: [rawAssetId, issuer],
        })),
      ],
      resolver: undefined,
    });
  });

  it('should not add a remove claim issuers transaction if there are no default claim issuers set on the Asset (set)', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyAssetTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: claimIssuers.map(({ identity, trustedFor }) => ({
        identity: utilsConversionModule.signerToString(identity),
        trustedFor,
      })),
      operation: TrustedClaimIssuerOperation.Set,
    });

    expect(result).toEqual({
      transactions: rawClaimIssuers.map(issuer => ({
        transaction: addDefaultTrustedClaimIssuerTransaction,
        args: [rawAssetId, issuer],
      })),
      resolver: undefined,
    });
  });

  it('should not add an add claim issuers transaction if there are no claim issuers passed as arguments (set)', async () => {
    const currentClaimIssuers = rawClaimIssuers.slice(0, -1);
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyAssetTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: [],
      operation: TrustedClaimIssuerOperation.Set,
    });

    expect(result).toEqual({
      transactions: currentClaimIssuers.map(({ issuer }) => ({
        transaction: removeDefaultTrustedClaimIssuerTransaction,
        args: [rawAssetId, issuer],
      })),
      resolver: undefined,
    });
  });

  it('should throw an error if trying to remove an Identity that is not a trusted claim issuer', async () => {
    const currentClaimIssuers: PolymeshPrimitivesIdentityId[] = [];
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareModifyAssetTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers: claimIssuerDids,
        operation: TrustedClaimIssuerOperation.Remove,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities are not Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ notPresent: claimIssuerDids });
  });

  it('should add a transaction to remove the supplied Trusted Claim Issuers (remove)', async () => {
    const currentClaimIssuers = rawClaimIssuers;
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyAssetTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers: claimIssuerDids,
      operation: TrustedClaimIssuerOperation.Remove,
    });

    expect(result).toEqual({
      transactions: currentClaimIssuers.map(({ issuer }) => ({
        transaction: removeDefaultTrustedClaimIssuerTransaction,
        args: [rawAssetId, issuer],
      })),
      resolver: undefined,
    });
  });

  it('should throw an error if trying to add an Identity that is already a Trusted Claim Issuer', async () => {
    const currentClaimIssuers = rawClaimIssuers;
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    let error;

    try {
      await prepareModifyAssetTrustedClaimIssuers.call(proc, {
        ...args,
        claimIssuers,
        operation: TrustedClaimIssuerOperation.Add,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'One or more of the supplied Identities already are Trusted Claim Issuers'
    );
    expect(error.data).toMatchObject({ present: claimIssuerDids });
  });

  it('should add a transaction to add the supplied Trusted Claim Issuers (add)', async () => {
    const currentClaimIssuers: PolymeshPrimitivesIdentityId[] = [];
    when(trustedClaimIssuerMock).calledWith(rawAssetId).mockReturnValue(currentClaimIssuers);
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareModifyAssetTrustedClaimIssuers.call(proc, {
      ...args,
      claimIssuers,
      operation: TrustedClaimIssuerOperation.Add,
    });

    expect(result).toEqual({
      transactions: rawClaimIssuers.map(issuer => ({
        transaction: addDefaultTrustedClaimIssuerTransaction,
        args: [rawAssetId, issuer],
      })),
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      expect(
        boundFunc({ asset, operation: TrustedClaimIssuerOperation.Add, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.AddDefaultTrustedClaimIssuer],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(
        boundFunc({ asset, operation: TrustedClaimIssuerOperation.Remove, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer],
          assets: [asset],
          portfolios: [],
        },
      });

      expect(
        boundFunc({ asset, operation: TrustedClaimIssuerOperation.Set, claimIssuers: [] })
      ).toEqual({
        permissions: {
          transactions: [
            TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer,
            TxTags.complianceManager.AddDefaultTrustedClaimIssuer,
          ],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });
});
