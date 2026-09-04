import { AccountId } from '@polkadot/types/interfaces';
import { Vec } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareNominateValidators,
  prepareStorage,
  Storage,
} from '~/api/procedures/nominateValidators';
import { Account, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { getAccountInstance } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import { DUMMY_ACCOUNT_ID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

describe('nominateValidators procedure', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  let mockContext: Mocked<Context>;
  let nominateTx: PolymeshTx<[Vec<AccountId>]>;
  let actingAccount: Account;
  let validator: Account;
  let rawAccountId: AccountId;

  let stringToAccountIdSpy: jest.SpyInstance;

  let storage: Storage;

  beforeEach(() => {
    nominateTx = dsMockUtils.createTxMock('staking', 'nominate');
    mockContext = dsMockUtils.getContextInstance();
    actingAccount = entityMockUtils.getAccountInstance({ address: DUMMY_ACCOUNT_ID });
    validator = entityMockUtils.getAccountInstance({
      address: '5FvreMigHtY1c6XTzDccjn8SVLiAeHz58z4MV4reJYyrdmj3',
      stakingGetCommission: { commission: new BigNumber(7), blocked: false },
    });
    rawAccountId = dsMockUtils.createMockAccountId(validator.address);

    dsMockUtils.createCallMock('stakingApi', 'nominationsQuota', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(16)),
    });
    dsMockUtils.createQueryMock('staking', 'minNominatorBond', {
      returnValue: dsMockUtils.createMockU128(new BigNumber(1).times(10 ** 6)),
    });

    stringToAccountIdSpy = jest.spyOn(utilsConversionModule, 'stringToAccountId');

    when(stringToAccountIdSpy)
      .calledWith(validator.address, mockContext)
      .mockReturnValue(rawAccountId);

    storage = {
      actingAccount,
      ledger: {
        active: new BigNumber(10),
        stash: getAccountInstance(),
        unlocking: [],
        total: new BigNumber(10),
        claimedRewards: [],
      },
    };
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

  it('should throw an error if the acting account is not a controller', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      ledger: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message:
        'The acting account must be a controller. Pass `bonded` to nominate against a bond that is being made in the same batch',
    });

    await expect(
      prepareNominateValidators.call(proc, {
        validators: [validator],
      })
    ).rejects.toThrow(expectedError);
  });

  it('should nominate against a bond made in the same batch', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      ledger: null,
    });

    const result = await prepareNominateValidators.call(proc, {
      validators: [validator],
      bonded: new BigNumber(500),
    });

    /* not a controller yet — the bond that makes it one is in the same batch */
    expect(result).toEqual({
      transaction: nominateTx,
      args: [[rawAccountId]],
      resolver: undefined,
    });
  });

  it('should throw an error if the bond is below the minimum a nominator may hold', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      ledger: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: 'The bonded amount is below the minimum the chain accepts from a nominator',
    });

    await expect(
      prepareNominateValidators.call(proc, {
        validators: [validator],
        bonded: new BigNumber(0.5),
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if a validator is repeated', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, {
      ...storage,
      ledger: null,
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Validators cannot be repeated',
    });

    await expect(
      prepareNominateValidators.call(proc, {
        validators: [validator, validator],
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if more validators are nominated than the quota allows', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    dsMockUtils.createCallMock('stakingApi', 'nominationsQuota', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });

    const otherValidator = entityMockUtils.getAccountInstance({
      address: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
      stakingGetCommission: { commission: new BigNumber(7), blocked: false },
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'More validators nominated than the acting account may nominate',
    });

    await expect(
      prepareNominateValidators.call(proc, {
        validators: [validator, otherValidator],
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if the target has not set commission', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const expectedError = new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'Commission not found for validator(s)',
    });

    await expect(
      prepareNominateValidators.call(proc, {
        validators: [entityMockUtils.getAccountInstance({ stakingGetCommission: null })],
      })
    ).rejects.toThrow(expectedError);
  });

  it('should throw an error if a nominator is blocked', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const args = {
      validators: [
        entityMockUtils.getAccountInstance({
          stakingGetCommission: { blocked: true, commission: new BigNumber(10) },
        }),
      ],
    };

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Validator(s) have been blocked',
    });

    await expect(prepareNominateValidators.call(proc, args)).rejects.toThrow(expectedError);
  });

  it('should throw an error if no nominators are received', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const args = {
      validators: [],
    };

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'At least one validator must be nominated',
    });

    await expect(prepareNominateValidators.call(proc, args)).rejects.toThrow(expectedError);
  });

  it('should return a nominate transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext, storage);

    const args = {
      validators: [validator],
    };

    const result = await prepareNominateValidators.call(proc, args);

    expect(result).toEqual({
      transaction: nominateTx,
      args: [[rawAccountId]],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should require no permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      /*
       * `true`, not empty arrays: the staking pallet consults no `ExtrinsicPermissions`, and an
       *   empty `SimplePermissions` would still read the key's permissions from chain — which
       *   throws for an Account with no Identity
       */
      expect(boundFunc()).toEqual({ permissions: true });
    });
  });

  describe('prepareStorage', () => {
    it('should return the storage', () => {
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<Params, void, Storage>(mockContext);
      const boundFunc = prepareStorage.bind(proc);

      return expect(boundFunc()).resolves.toEqual(
        expect.objectContaining({
          actingAccount: expect.objectContaining({ address: DUMMY_ACCOUNT_ID }),
          ledger: null,
        })
      );
    });
  });
});
