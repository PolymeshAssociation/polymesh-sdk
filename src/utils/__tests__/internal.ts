/* eslint-disable import/first */
const mockRistrettoPointFromHex = jest.fn();

import {
  ErrorCode,
  PermissionType,
  RoleType as PublicRoleType,
} from '@polymeshassociation/polymesh-sdk/types';
import * as utilsPublicConversionModule from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';

import { ConfidentialProcedure } from '~/base/ConfidentialProcedure';
import {
  ConfidentialAccount,
  ConfidentialAsset,
  Context,
  Identity,
  PolymeshError,
  Procedure,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import {
  ConfidentialOptionalArgsProcedureMethod,
  ConfidentialProcedureMethod,
  ModuleName,
  RoleType,
  TxTags,
} from '~/types';
import * as utilsInternalModule from '~/utils/internal';

import {
  asConfidentialAccount,
  asConfidentialAsset,
  asIdentity,
  assertCaAssetValid,
  assertElgamalPubKeyValid,
  checkConfidentialPermissions,
  checkConfidentialRoles,
  createConfidentialProcedureMethod,
  getMissingPortfolioPermissions,
  getMissingTransactionPermissions,
  isModuleOrTagMatch,
} from '../internal';

jest.mock('websocket', require('~/testUtils/mocks/dataSources').mockWebSocketModule());

jest.mock('@noble/curves/ed25519', () => {
  return {
    ...jest.requireActual('@noble/curves/ed25519'),
    RistrettoPoint: {
      fromHex: mockRistrettoPointFromHex,
    },
  };
});

jest.mock(
  '~/api/entities/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/ConfidentialAsset'
  )
);

jest.mock(
  '~/api/entities/ConfidentialVenue',
  require('~/testUtils/mocks/entities').mockConfidentialVenueModule(
    '~/api/entities/ConfidentialVenue'
  )
);

jest.mock(
  '@polymeshassociation/polymesh-sdk/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '@polymeshassociation/polymesh-sdk/api/entities/TickerReservation'
  )
);

jest.mock(
  '@polymeshassociation/polymesh-sdk/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule(
    '@polymeshassociation/polymesh-sdk//api/entities/Venue'
  )
);

describe('asIdentity', () => {
  it('should return identity instance', () => {
    const mockContext = dsMockUtils.getContextInstance();

    const did = 'did';
    const identity = entityMockUtils.getIdentityInstance({
      did,
    });

    let result = asIdentity(did, mockContext);

    expect(result).toEqual(expect.objectContaining({ did }));

    result = asIdentity(identity, mockContext);

    expect(result).toEqual(expect.objectContaining({ did }));
  });
});

describe('createProcedureMethod', () => {
  let context: Context;
  let prepare: jest.Mock;
  let checkAuthorization: jest.Mock;
  let transformer: jest.Mock;
  let fakeProcedure: () => Procedure<number, void>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    prepare = jest.fn();
    checkAuthorization = jest.fn();
    transformer = jest.fn();
    fakeProcedure = (): Procedure<number, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as Procedure<number, void>);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return a ProcedureMethod object', async () => {
    const method: ConfidentialProcedureMethod<number, void> = createConfidentialProcedureMethod(
      { getProcedureAndArgs: args => [fakeProcedure, args], transformer },
      context
    );

    const procArgs = 1;
    await method(procArgs);

    expect(prepare).toHaveBeenCalledWith({ args: procArgs, transformer }, context, {});

    await method.checkAuthorization(procArgs);

    expect(checkAuthorization).toHaveBeenCalledWith(procArgs, context, {});
  });

  it('should return a OptionalArgsProcedureMethod object', async () => {
    const method: ConfidentialOptionalArgsProcedureMethod<number, void> =
      createConfidentialProcedureMethod(
        {
          getProcedureAndArgs: (args?: number) => [fakeProcedure, args],
          transformer,
          optionalArgs: true,
        },
        context
      );

    await method();

    expect(prepare).toHaveBeenCalledWith({ args: undefined, transformer }, context, {});

    await method.checkAuthorization(undefined);

    expect(checkAuthorization).toHaveBeenCalledWith(undefined, context, {});

    const procArgs = 1;
    await method(procArgs);

    expect(prepare).toHaveBeenCalledWith({ args: procArgs, transformer }, context, {});

    await method.checkAuthorization(procArgs);

    expect(checkAuthorization).toHaveBeenCalledWith(procArgs, context, {});
  });

  it('should return a NoArgsProcedureMethod object', async () => {
    const noArgsFakeProcedure = (): ConfidentialProcedure<void, void> =>
      ({
        prepare,
        checkAuthorization,
      } as unknown as ConfidentialProcedure<void, void>);

    const method = createConfidentialProcedureMethod(
      { getProcedureAndArgs: () => [noArgsFakeProcedure, undefined], transformer, voidArgs: true },
      context
    );

    await method();

    expect(prepare).toHaveBeenCalledWith({ transformer, args: undefined }, context, {});

    await method.checkAuthorization();

    expect(checkAuthorization).toHaveBeenCalledWith(undefined, context, {});
  });
});

describe('assetCaAssetValid', () => {
  it('should return true for a valid ID', () => {
    const guid = '76702175-d8cb-e3a5-5a19-734433351e25';
    const id = '76702175d8cbe3a55a19734433351e25';

    let result = assertCaAssetValid(id);

    expect(result).toEqual(guid);

    result = assertCaAssetValid(guid);

    expect(result).toEqual(guid);
  });

  it('should throw an error for an invalid ID', async () => {
    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The supplied ID is not a valid confidential Asset ID',
    });
    expect(() => assertCaAssetValid('small-length-string')).toThrow(expectedError);

    expect(() => assertCaAssetValid('NotMatching32CharactersString$$$')).toThrow(expectedError);

    expect(() => assertCaAssetValid('7670-2175d8cb-e3a55a-1973443-3351e25')).toThrow(expectedError);
  });
});

describe('assertElgamalPubKeyValid', () => {
  it('should throw an error if the public key is not a valid ElGamal public key', async () => {
    mockRistrettoPointFromHex.mockImplementationOnce(() => {
      throw new Error('RistrettoPoint.fromHex: the hex is not valid encoding of RistrettoPoint');
    });
    expect(() =>
      assertElgamalPubKeyValid('0xc8d4b6d94730b17c5efdd6ee1119aaf1fa79c7fe1f9db031bf87713e94000000')
    ).toThrow('The supplied public key is not a valid ElGamal public key');
  });

  it('should not throw if the public key is valid', async () => {
    expect(() =>
      assertElgamalPubKeyValid('0xc8d4b6d94730b17c5efdd6ee1119aaf1fa79c7fe1f9db031bf87713e94145831')
    ).not.toThrow();
  });
});

describe('asConfidentialAccount', () => {
  let context: Context;
  let publicKey: string;
  let confidentialAccount: ConfidentialAccount;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertElgamalPubKeyValid').mockImplementation();
    publicKey = 'someKey';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAccount = new ConfidentialAccount({ publicKey }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return ConfidentialAccount for given public key', async () => {
    const result = asConfidentialAccount(publicKey, context);

    expect(result).toEqual(expect.objectContaining({ publicKey }));
  });

  it('should return the passed ConfidentialAccount', async () => {
    const result = asConfidentialAccount(confidentialAccount, context);

    expect(result).toBe(confidentialAccount);
  });
});

describe('asConfidentialAsset', () => {
  let context: Context;
  let assetId: string;
  let confidentialAsset: ConfidentialAsset;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetId = '76702175-d8cb-e3a5-5a19-734433351e25';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    confidentialAsset = new ConfidentialAsset({ id: assetId }, context);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return ConfidentialAsset for the given id', async () => {
    const result = asConfidentialAsset(assetId, context);

    expect(result).toEqual(expect.objectContaining({ id: assetId }));
  });

  it('should return the passed ConfidentialAsset', async () => {
    const result = asConfidentialAsset(confidentialAsset, context);

    expect(result).toBe(confidentialAsset);
  });
});

describe('isModuleOrTagMatch', () => {
  it("should return true if two tags/modules are equal, or if one is the other one's module", () => {
    let result = isModuleOrTagMatch(TxTags.identity.AddInvestorUniquenessClaim, ModuleName.Sto);
    expect(result).toEqual(false);

    result = isModuleOrTagMatch(ModuleName.Sto, TxTags.identity.AddInvestorUniquenessClaim);
    expect(result).toEqual(false);

    result = isModuleOrTagMatch(
      TxTags.identity.AddInvestorUniquenessClaim,
      TxTags.identity.AddClaim
    );
    expect(result).toEqual(false);
  });
});

describe('getMissingTransactionPermissions', () => {
  it('should return nullish values when given empty args', () => {
    let result = getMissingTransactionPermissions(null, null);
    expect(result).toBeUndefined();

    result = getMissingTransactionPermissions(null, { values: [], type: PermissionType.Include });
    expect(result).toBeNull();

    result = getMissingTransactionPermissions([], { values: [], type: PermissionType.Include });
    expect(result).toBeUndefined();
  });

  it('should handle include type', () => {
    const result = getMissingTransactionPermissions([TxTags.asset.CreateAsset], {
      type: PermissionType.Include,
      values: [],
    });
    expect(result).toEqual(['asset.createAsset']);
  });

  it('should handle exempt type', () => {
    let result = getMissingTransactionPermissions([TxTags.asset.CreateAsset], {
      type: PermissionType.Exclude,
      values: [TxTags.asset.CreateAsset],
    });
    expect(result).toEqual(['asset.createAsset']);

    result = getMissingTransactionPermissions([TxTags.balances.Transfer], {
      type: PermissionType.Exclude,
      values: [ModuleName.Balances],
    });

    expect(result).toEqual(['balances.transfer']);

    result = getMissingTransactionPermissions([TxTags.balances.Transfer], {
      type: PermissionType.Exclude,
      values: [TxTags.asset.CreateAsset],
    });
    expect(result).toEqual(undefined);
  });
});

describe('getMissingPortfolioPermissions', () => {
  it('should return nullish values when given empty values', () => {
    let result = getMissingPortfolioPermissions(null, null);
    expect(result).toBeUndefined();

    result = getMissingPortfolioPermissions(null, { values: [], type: PermissionType.Include });
    expect(result).toBeNull();
  });

  it('should handle include type', () => {
    const defaultPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    const numberedPortfolio = entityMockUtils.getNumberedPortfolioInstance();
    let result = getMissingPortfolioPermissions([defaultPortfolio], {
      values: [],
      type: PermissionType.Include,
    });

    expect(result).toEqual([defaultPortfolio]);

    result = getMissingPortfolioPermissions([defaultPortfolio], {
      values: [numberedPortfolio],
      type: PermissionType.Include,
    });

    expect(result).toEqual([defaultPortfolio]);
  });

  it('should handle exclude type', () => {
    const defaultPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    const numberedPortfolio = entityMockUtils.getNumberedPortfolioInstance();

    let result = getMissingPortfolioPermissions([defaultPortfolio], {
      values: [defaultPortfolio],
      type: PermissionType.Exclude,
    });

    expect(result).toEqual([defaultPortfolio]);

    result = getMissingPortfolioPermissions([defaultPortfolio], {
      values: [numberedPortfolio],
      type: PermissionType.Exclude,
    });

    expect(result).toBeUndefined();
  });
});

describe('checkConfidentialPermissions', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('return true if not missing permissions', async () => {
    const account = entityMockUtils.getAccountInstance({
      getPermissions: {
        assets: { type: PermissionType.Include, values: [] },
        transactions: { type: PermissionType.Include, values: [] },
        portfolios: { type: PermissionType.Include, values: [] },
        transactionGroups: [],
      },
    });

    const result = await checkConfidentialPermissions(account, {});

    expect(result).toEqual({ result: true });
  });

  it('should return missing permissions', async () => {
    const asset = entityMockUtils.getBaseAssetInstance();
    const portfolio = entityMockUtils.getDefaultPortfolioInstance();

    const account = entityMockUtils.getAccountInstance({
      getPermissions: {
        assets: { type: PermissionType.Include, values: [] },
        transactions: { type: PermissionType.Exclude, values: [TxTags.asset.CreateAsset] },
        portfolios: { type: PermissionType.Include, values: [] },
        transactionGroups: [],
      },
    });

    const result = await checkConfidentialPermissions(account, {
      assets: [asset],
      transactions: [TxTags.asset.CreateAsset],
      portfolios: [portfolio],
    });

    expect(result).toEqual({
      result: false,
      missingPermissions: {
        assets: [asset],
        portfolios: [portfolio],
        transactions: ['asset.createAsset'],
      },
    });
  });
});

describe('checkConfidentialRoles', () => {
  let identity: Identity;
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    identity = entityMockUtils.getIdentityInstance();
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return if the identity has the role', async () => {
    const result = await checkConfidentialRoles(identity, [], context);

    expect(result).toEqual({ result: true });
  });

  it('should handle confidential asset owner role', async () => {
    const result = await checkConfidentialRoles(
      identity,
      [{ type: RoleType.ConfidentialAssetOwner, assetId: '76702175-d8cb-e3a5-5a19-734433351e25' }],
      context
    );

    expect(result).toEqual({ result: true });
  });

  it('should handle confidential venue owner role', async () => {
    const result = await checkConfidentialRoles(
      identity,
      [{ type: RoleType.ConfidentialVenueOwner, venueId: new BigNumber(1) }],
      context
    );

    expect(result).toEqual({ result: true });
  });

  it('should handle ticker owner role', async () => {
    const result = await checkConfidentialRoles(
      identity,
      [{ type: PublicRoleType.TickerOwner, ticker: 'TICKER' }],
      context
    );

    expect(result).toEqual({ result: true });
  });

  it('should handle cdd provider role', async () => {
    dsMockUtils.createQueryMock('cddServiceProviders', 'activeMembers', {
      returnValue: [entityMockUtils.getIdentityInstance()],
    });
    const result = await checkConfidentialRoles(
      identity,
      [{ type: PublicRoleType.CddProvider }],
      context
    );

    expect(result).toEqual({ result: false, missingRoles: [{ type: 'CddProvider' }] });
  });

  it('should handle venue owner role', async () => {
    const result = await checkConfidentialRoles(
      identity,
      [{ type: PublicRoleType.VenueOwner, venueId: new BigNumber(1) }],
      context
    );

    expect(result).toEqual({ result: true });
  });

  it('should handle portfolio custodian role', async () => {
    const mockPortfolio = entityMockUtils.getDefaultPortfolioInstance();
    jest
      .spyOn(utilsPublicConversionModule, 'portfolioIdToPortfolio')
      .mockReturnValue(mockPortfolio);

    const result = await checkConfidentialRoles(
      identity,
      [{ type: PublicRoleType.PortfolioCustodian, portfolioId: { did: 'someDid' } }],
      context
    );

    expect(result).toEqual({ result: true });
  });

  it('should handle identity role', async () => {
    const result = await checkConfidentialRoles(
      identity,
      [{ type: PublicRoleType.Identity, did: 'someDid' }],
      context
    );

    expect(result).toEqual({ result: true });
  });
});
