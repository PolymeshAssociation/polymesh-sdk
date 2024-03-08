import { u32, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareAffirmConfidentialTransactions,
} from '~/api/procedures/affirmConfidentialTransactions';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import {
  ConfidentialAffirmParty,
  ConfidentialTransaction,
  ConfidentialTransactionStatus,
  TxTags,
} from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialTransaction',
  require('~/testUtils/mocks/entities').mockConfidentialTransactionModule(
    '~/api/entities/confidential/ConfidentialTransaction'
  )
);

describe('affirmConfidentialTransactions procedure', () => {
  let legId: BigNumber;
  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance;
  let bigNumberToU32Spy: jest.SpyInstance;
  let confidentialAffirmsToRawSpy: jest.SpyInstance;
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
    confidentialAffirmsToRawSpy = jest.spyOn(utilsConversionModule, 'confidentialAffirmsToRaw');
    legId = new BigNumber(1);
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
      prepareAffirmConfidentialTransactions.call(proc, {
        legId,
        party: ConfidentialAffirmParty.Mediator,
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          getInvolvedParties: [entityMockUtils.getIdentityInstance({ did: 'randomDid' })],
        }),
      })
    ).rejects.toThrow('The signing identity is not involved in this Confidential Transaction');
  });

  it('should throw an error if status is already Executed or Rejected', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    await expect(
      prepareAffirmConfidentialTransactions.call(proc, {
        legId,
        party: ConfidentialAffirmParty.Sender,
        proofs: [],
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          details: {
            status: ConfidentialTransactionStatus.Executed,
          },
        }),
      })
    ).rejects.toThrow('The Confidential Transaction has already been completed');

    await expect(
      prepareAffirmConfidentialTransactions.call(proc, {
        legId,
        party: ConfidentialAffirmParty.Mediator,
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          details: {
            status: ConfidentialTransactionStatus.Rejected,
          },
        }),
      })
    ).rejects.toThrow('The Confidential Transaction has already been completed');
  });

  it('should throw an error if the sender is affirming an already proved leg', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    return expect(
      prepareAffirmConfidentialTransactions.call(proc, {
        legId,
        party: ConfidentialAffirmParty.Sender,
        proofs: [],
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          getLegState: {
            proved: true,
            assetState: [],
          },
        }),
      })
    ).rejects.toThrow('The leg has already been affirmed by the sender');
  });

  it('should throw an error if a non-sender is affirming a not proved leg', async () => {
    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    return expect(
      prepareAffirmConfidentialTransactions.call(proc, {
        legId,
        party: ConfidentialAffirmParty.Mediator,
        transaction: entityMockUtils.getConfidentialTransactionInstance({
          getLegState: {
            proved: false,
          },
        }),
      })
    ).rejects.toThrow('The sender has not yet provided amounts and proof for this leg');
  });

  it('should return an affirm transaction spec for a sender', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'affirmTransactions');
    const fakeArgs = 'fakeArgs';
    confidentialAffirmsToRawSpy.mockReturnValue(fakeArgs);

    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    const result = await prepareAffirmConfidentialTransactions.call(proc, {
      legId,
      party: ConfidentialAffirmParty.Sender,
      transaction: entityMockUtils.getConfidentialTransactionInstance(),
      proofs: [],
    });

    expect(result).toEqual({
      transaction,
      args: [fakeArgs],
      resolver: expect.objectContaining({ id: transactionId }),
    });
  });

  it('should return an affirm transaction spec for a receiver', async () => {
    const transaction = dsMockUtils.createTxMock('confidentialAsset', 'affirmTransactions');
    const fakeArgs = 'fakeArgs';
    confidentialAffirmsToRawSpy.mockReturnValue(fakeArgs);

    const proc = procedureMockUtils.getInstance<Params, ConfidentialTransaction>(mockContext);

    const result = await prepareAffirmConfidentialTransactions.call(proc, {
      legId,
      party: ConfidentialAffirmParty.Receiver,
      transaction: entityMockUtils.getConfidentialTransactionInstance({
        getLegState: {
          proved: true,
        },
      }),
    });

    expect(result).toEqual({
      transaction,
      args: [fakeArgs],
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
          transactions: [TxTags.confidentialAsset.AffirmTransactions],
          portfolios: [],
          assets: [],
        },
      });
    });
  });
});
