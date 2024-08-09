import { AccountId } from '@polkadot/types/interfaces';
import {
  PolymeshPrimitivesAssetAssetID,
  PolymeshPrimitivesSecondaryKeyPermissions,
} from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { getAuthorization, Params, prepareJoinCreator } from '~/api/procedures/joinCreator';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ErrorCode,
  MultiSig,
  Permissions,
  PermissionType,
  TickerReservationStatus,
  TxTags,
} from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';
jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('joinCreator procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdSpy: jest.SpyInstance<AccountId, [string, Context]>;
  let permissionsToMeshPermissionsSpy: jest.SpyInstance<
    PolymeshPrimitivesSecondaryKeyPermissions,
    [Permissions, Context]
  >;
  let multiSig: MultiSig;

  beforeAll(() => {
    dsMockUtils.initMocks({});
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');
    permissionsToMeshPermissionsSpy = jest.spyOn(
      utilsConversionModule,
      'permissionsToMeshPermissions'
    );
  });

  let makePrimaryTx: PolymeshTx<[PolymeshPrimitivesAssetAssetID]>;
  let makeSecondaryTx: PolymeshTx<[]>;
  let setPermissionsTx: PolymeshTx<[]>;

  beforeEach(() => {
    entityMockUtils.configureMocks({
      tickerReservationOptions: {
        details: {
          owner: entityMockUtils.getIdentityInstance({ did: 'someOtherDid' }),
          expiryDate: null,
          status: TickerReservationStatus.Free,
        },
      },
    });

    dsMockUtils.createQueryMock('asset', 'tickerConfig', {
      returnValue: dsMockUtils.createMockTickerRegistrationConfig(),
    });

    multiSig = entityMockUtils.getMultiSigInstance({ address: DUMMY_ACCOUNT_ID });

    makePrimaryTx = dsMockUtils.createTxMock('multiSig', 'makeMultisigPrimary');
    makeSecondaryTx = dsMockUtils.createTxMock('multiSig', 'makeMultisigSecondary');
    setPermissionsTx = dsMockUtils.createTxMock('identity', 'setSecondaryKeyPermissions');

    mockContext = dsMockUtils.getContextInstance();

    when(stringToAccountIdSpy)
      .calledWith(multiSig.address, mockContext)
      .mockReturnValue('rawMultiSigAddr' as unknown as AccountId);

    permissionsToMeshPermissionsSpy.mockReturnValue(
      'mockPermissions' as unknown as PolymeshPrimitivesSecondaryKeyPermissions
    );
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

  it('should throw an error if the caller is not the creator', async () => {
    multiSig = entityMockUtils.getMultiSigInstance({
      getCreator: entityMockUtils.getIdentityInstance({ did: 'creatorDid', isEqual: false }),
    });

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const expectedError = new PolymeshError({
      message:
        'A MultiSig can only be join its creator. Instead `accountManagement.inviteAccount` can be used, and the resulting auth accepted',
      code: ErrorCode.ValidationError,
    });

    return expect(prepareJoinCreator.call(proc, { asPrimary: true, multiSig })).rejects.toThrow(
      expectedError
    );
  });

  it('should return a `makeMultiSigPrimary` transaction when being joined as primary', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareJoinCreator.call(proc, { asPrimary: true, multiSig });

    expect(result).toEqual({
      transaction: makePrimaryTx,
      args: ['rawMultiSigAddr', null],
      resolver: undefined,
    });
  });

  it('should return a `makeMultisigSecondary` transaction when being joined as secondary', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareJoinCreator.call(proc, { asPrimary: false, multiSig });

    expect(result).toEqual({
      transaction: makeSecondaryTx,
      args: ['rawMultiSigAddr'],
      resolver: undefined,
    });
  });

  it('should return a batch transaction when appropriate', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareJoinCreator.call(proc, {
      asPrimary: false,
      multiSig,
      permissions: {
        assets: {
          type: PermissionType.Include,
          values: [entityMockUtils.getFungibleAssetInstance()],
        },
      },
    });

    expect(result).toEqual({
      transactions: [
        {
          transaction: makeSecondaryTx,
          args: ['rawMultiSigAddr'],
          resolver: undefined,
        },
        {
          transaction: setPermissionsTx,
          args: ['rawMultiSigAddr', 'mockPermissions'],
          resolver: undefined,
        },
      ],
      resolver: undefined,
    });
  });
});

describe('getAuthorization', () => {
  let mockContext: Context;

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  it('should return the appropriate roles and permissions for as primary', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const boundFunc = getAuthorization.bind(proc);

    expect(boundFunc({ asPrimary: true, multiSig: entityMockUtils.getMultiSigInstance() })).toEqual(
      {
        permissions: {
          transactions: [TxTags.multiSig.MakeMultisigPrimary],
          assets: [],
          portfolios: [],
        },
      }
    );
  });

  it('should return the appropriate roles and permissions for as secondary', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const boundFunc = getAuthorization.bind(proc);

    expect(
      boundFunc({ asPrimary: false, multiSig: entityMockUtils.getMultiSigInstance() })
    ).toEqual({
      permissions: {
        transactions: [TxTags.multiSig.MakeMultisigSecondary],
        assets: [],
        portfolios: [],
      },
    });
  });

  it('should return the appropriate roles and permissions for as secondary with permissions', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const boundFunc = getAuthorization.bind(proc);

    expect(
      boundFunc({
        asPrimary: false,
        multiSig: entityMockUtils.getMultiSigInstance(),
        permissions: {},
      })
    ).toEqual({
      permissions: {
        transactions: [
          TxTags.multiSig.MakeMultisigSecondary,
          TxTags.identity.SetPermissionToSigner,
        ],
        assets: [],
        portfolios: [],
      },
    });
  });
});
