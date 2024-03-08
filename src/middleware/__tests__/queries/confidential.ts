import BigNumber from 'bignumber.js';

import {
  confidentialAssetQuery,
  confidentialAssetsByHolderQuery,
  getConfidentialAssetHistoryByConfidentialAccountQuery,
  getConfidentialTransactionsByConfidentialAccountQuery,
} from '~/middleware/queries';
import { ConfidentialTransactionStatusEnum, EventIdEnum } from '~/middleware/types';

describe('confidentialAssetsByHolderQuery', () => {
  it('should return correct query and variables when size, start  are not provided', () => {
    const result = confidentialAssetsByHolderQuery('1');
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({ size: undefined, start: undefined, accountId: '1' });
  });

  it('should return correct query and variables when size, start are provided', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(0);
    const result = confidentialAssetsByHolderQuery('1', size, start);
    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: size.toNumber(),
      start: start.toNumber(),
      accountId: '1',
    });
  });
});

describe('confidentialAssetQuery', () => {
  it('should pass the variables to the grapqhl query', () => {
    const variables = {
      id: 'assetId',
    };

    const result = confidentialAssetQuery(variables);

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual(variables);
  });
});

describe('getConfidentialTransactionsByConfidentialAccountQuery', () => {
  it('should return correct query and variables when direction is provided and start, status or size is not', () => {
    let result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'All',
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
    });

    result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'Incoming',
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
    });

    result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'Outgoing',
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
    });
  });

  it('should return correct query and variables when status is provided', () => {
    let result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'All',
      status: ConfidentialTransactionStatusEnum.Created,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
      status: ConfidentialTransactionStatusEnum.Created,
    });

    result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'All',
      status: ConfidentialTransactionStatusEnum.Rejected,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
      status: ConfidentialTransactionStatusEnum.Rejected,
    });

    result = getConfidentialTransactionsByConfidentialAccountQuery({
      accountId: '1',
      direction: 'All',
      status: ConfidentialTransactionStatusEnum.Executed,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      accountId: '1',
      status: ConfidentialTransactionStatusEnum.Executed,
    });
  });

  it('should return correct query and variables when size, start are provided', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(0);
    const result = getConfidentialTransactionsByConfidentialAccountQuery(
      {
        accountId: '1',
        direction: 'All',
      },
      size,
      start
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: size.toNumber(),
      start: start.toNumber(),
      accountId: '1',
    });
  });
});

describe('getConfidentialAssetHistoryByConfidentialAccountQuery', () => {
  const accountId = 'accountId';
  const assetId = 'assetId';
  const eventId = EventIdEnum.AccountDeposit;

  it('should return correct query and variables when accountId is provided', () => {
    const result = getConfidentialAssetHistoryByConfidentialAccountQuery({
      accountId,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      eventId: undefined,
      assetId: undefined,
      accountId,
    });
  });

  it('should return correct query and variables when eventId is provided', () => {
    const result = getConfidentialAssetHistoryByConfidentialAccountQuery({
      accountId,
      eventId,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      eventId,
      assetId: undefined,
      accountId,
    });
  });

  it('should return correct query and variables when assetId is provided', () => {
    const result = getConfidentialAssetHistoryByConfidentialAccountQuery({
      accountId,
      assetId,
    });

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: undefined,
      start: undefined,
      eventId: undefined,
      assetId,
      accountId,
    });
  });

  it('should return correct query and variables when size, start are provided', () => {
    const size = new BigNumber(10);
    const start = new BigNumber(0);
    const result = getConfidentialAssetHistoryByConfidentialAccountQuery(
      {
        accountId,
      },
      size,
      start
    );

    expect(result.query).toBeDefined();
    expect(result.variables).toEqual({
      size: size.toNumber(),
      start: start.toNumber(),
      accountId,
    });
  });
});
