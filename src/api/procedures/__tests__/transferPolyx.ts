import { PolymeshPrimitivesMemo } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { getAuthorization, prepareTransferPolyx } from '~/api/procedures/transferPolyx';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TransferPolyxParams } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('transferPolyx procedure', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    jest.spyOn(utilsInternalModule, 'assertAddressValid').mockImplementation();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should return a balance transfer transaction spec with preRunValidation', async () => {
    const to = entityMockUtils.getAccountInstance({ address: 'someAccount' });
    const amount = new BigNumber(99);
    const memo = 'someMessage';
    const rawAccount = dsMockUtils.createMockAccountId(to.address);
    const rawAmount = dsMockUtils.createMockBalance(amount);
    const rawMemo = 'memo' as unknown as PolymeshPrimitivesMemo;

    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
    jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
    jest.spyOn(utilsConversionModule, 'stringToMemo').mockReturnValue(rawMemo);

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    let tx = dsMockUtils.createTxMock('balances', 'transferWithMemo');

    let result = await prepareTransferPolyx.call(proc, {
      to,
      amount,
    });

    expect(result).toMatchObject({
      transaction: tx,
      args: [rawAccount, rawAmount, null],
      resolver: undefined,
    });
    expect(result.preRunValidation).toBeDefined();

    tx = dsMockUtils.createTxMock('balances', 'transferWithMemo');

    result = await prepareTransferPolyx.call(proc, {
      to,
      amount,
      memo,
    });

    expect(result).toMatchObject({
      transaction: tx,
      args: [rawAccount, rawAmount, rawMemo],
      resolver: undefined,
    });
    expect(result.preRunValidation).toBeDefined();
  });

  it('should return a v7 transferWithMemo transaction spec when isV7 and memo is provided', async () => {
    mockContext = dsMockUtils.getContextInstance({ isV7: true });
    const to = entityMockUtils.getAccountInstance({ address: 'someAccount' });
    const amount = new BigNumber(99);
    const memo = 'someMessage';
    const rawAccount = dsMockUtils.createMockAccountId(to.address);
    const rawAmount = dsMockUtils.createMockBalance(amount);
    const rawMemo = 'memo' as unknown as PolymeshPrimitivesMemo;

    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
    jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
    jest.spyOn(utilsConversionModule, 'stringToMemo').mockReturnValue(rawMemo);

    const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

    const tx = dsMockUtils.createTxMock('balances', 'transferWithMemo');

    const result = await prepareTransferPolyx.call(proc, {
      to,
      amount,
      memo,
    });

    expect(result).toMatchObject({
      transaction: tx,
      args: [rawAccount, rawAmount, rawMemo],
      resolver: undefined,
    });
    expect(result.preRunValidation).toBeDefined();
  });

  describe('preRunValidation', () => {
    it('should check signing account balance when asProposal is false', async () => {
      const amount = new BigNumber(101);
      const signingAccount = entityMockUtils.getAccountInstance({
        address: 'signerAddress',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });

      const rawAccount = dsMockUtils.createMockAccountId('someAccount');
      const rawAmount = dsMockUtils.createMockBalance(amount);

      jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
      jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
      dsMockUtils.createTxMock('balances', 'transferWithMemo');

      mockContext.getSigningAccount.mockReturnValue(signingAccount);

      const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

      const result = await prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount,
      });

      await expect(result.preRunValidation!({ asProposal: false })).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.InsufficientBalance,
          message: 'Insufficient free balance',
          data: {
            freeBalance: new BigNumber(100),
            fromAccount: 'signerAddress',
          },
        })
      );
    });

    it('should check acting account balance when asProposal is true', async () => {
      const amount = new BigNumber(101);
      const signingAccount = entityMockUtils.getAccountInstance({
        address: 'signerAddress',
      });
      const actingAccount = entityMockUtils.getAccountInstance({
        address: 'multiSigAddress',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });

      const rawAccount = dsMockUtils.createMockAccountId('someAccount');
      const rawAmount = dsMockUtils.createMockBalance(amount);

      jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
      jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
      dsMockUtils.createTxMock('balances', 'transferWithMemo');

      mockContext.getSigningAccount.mockReturnValue(signingAccount);
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

      const result = await prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount,
      });

      await expect(result.preRunValidation!({ asProposal: true })).rejects.toThrow(
        new PolymeshError({
          code: ErrorCode.InsufficientBalance,
          message: 'Insufficient free balance',
          data: {
            freeBalance: new BigNumber(100),
            fromAccount: 'multiSigAddress',
          },
        })
      );
    });

    it('should pass validation when signing account has sufficient balance (asProposal=false)', async () => {
      const amount = new BigNumber(50);
      const signingAccount = entityMockUtils.getAccountInstance({
        address: 'signerAddress',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });

      const rawAccount = dsMockUtils.createMockAccountId('someAccount');
      const rawAmount = dsMockUtils.createMockBalance(amount);

      jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
      jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
      dsMockUtils.createTxMock('balances', 'transferWithMemo');

      mockContext.getSigningAccount.mockReturnValue(signingAccount);

      const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

      const result = await prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount,
      });

      await expect(result.preRunValidation!({ asProposal: false })).resolves.not.toThrow();
    });

    it('should pass validation when acting account has sufficient balance (asProposal=true)', async () => {
      const amount = new BigNumber(50);
      const signingAccount = entityMockUtils.getAccountInstance({
        address: 'signerAddress',
      });
      const actingAccount = entityMockUtils.getAccountInstance({
        address: 'multiSigAddress',
        getBalance: {
          free: new BigNumber(100),
          locked: new BigNumber(0),
          total: new BigNumber(100),
        },
      });

      const rawAccount = dsMockUtils.createMockAccountId('someAccount');
      const rawAmount = dsMockUtils.createMockBalance(amount);

      jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawAccount);
      jest.spyOn(utilsConversionModule, 'bigNumberToBalance').mockReturnValue(rawAmount);
      dsMockUtils.createTxMock('balances', 'transferWithMemo');

      mockContext.getSigningAccount.mockReturnValue(signingAccount);
      mockContext.getActingAccount.mockResolvedValue(actingAccount);

      const proc = procedureMockUtils.getInstance<TransferPolyxParams, void>(mockContext);

      const result = await prepareTransferPolyx.call(proc, {
        to: 'someAccount',
        amount,
      });

      await expect(result.preRunValidation!({ asProposal: true })).resolves.not.toThrow();
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      expect(getAuthorization()).toEqual({
        signerPermissions: true,
      });
    });
  });
});
