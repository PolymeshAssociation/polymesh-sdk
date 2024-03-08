import { u32, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRejectConfidentialTransaction,
} from '~/api/procedures/rejectConfidentialTransaction';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialTransaction, ConfidentialTransactionStatus, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('rejectConfidentialTransaction procedure', () => {
  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance;
  let bigNumberToU32Spy: jest.SpyInstance;
  let transactionId: BigNumber;
  let legsCount: BigNumber;
  let rawLegsCount: u32;
  let rawTransactionId: u64;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    bigNumberToU32Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU32');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    transactionId = new BigNumber(1);
    legsCount = new BigNumber(1);
    rawTransactionId = dsMockUtils.createMockU64(transactionId);
    rawLegsCount = dsMockUtils.createMockU32(legsCount);

    when(bigNumberToU64Spy)
      .calledWith(transactionId, mockContext)
      .mockReturnValue(rawTransactionId);
    when(bigNumberToU32Spy).calledWith(legsCount, mockContext).mockReturnValue(rawLegsCount);
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

  it('should throw an error if the signing identity is not involved in the transaction', () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    return expect(
      prepareRejectConfidentialTransaction.call(proc, {
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          getInvolvedParties: [entityMockUtils.getIdentityInstance({ did: 'randomDid' })],
        }),
      })
    ).rejects.toThrow('The signing identity is not involved in this Confidential Transaction');
  });

  it('should throw an error if status is already Executed or Rejected', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    await expect(
      prepareRejectConfidentialTransaction.call(proc, {
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          details: {
            status: ConfidentialTransactionStatus.Executed,
          },
        }),
      })
    ).rejects.toThrow('The Confidential Transaction has already been completed');

    await expect(
      prepareRejectConfidentialTransaction.call(proc, {
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          details: {
            status: ConfidentialTransactionStatus.Rejected,
          },
        }),
      })
    ).rejects.toThrow('The Confidential Transaction has already been completed');
  });

  it('should return a reject transaction spec', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'rejectTransaction');

    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    const result = await prepareRejectConfidentialTransaction.call(proc, {
      transaction: entityMockUtils.getConfidentialTransactionInstance(),
    });

    expect(result).toEqual({
      transaction,
      args: [rawTransactionId, rawLegsCount],
      resolver: expect.objectContaining({ id: transactionId }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', async () => {
      const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      const result = await boundFunc();

      expect(result).toEqual({
        permissions: {
          transactions: [TxTags.confidentialAsset.RejectTransaction],
          portfolios: [],
          assets: [],
        },
      });
    });
  });
});
