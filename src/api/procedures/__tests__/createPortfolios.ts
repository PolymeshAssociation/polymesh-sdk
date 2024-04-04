import { Bytes, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  createPortfoliosResolver,
  Params,
  prepareCreatePortfolios,
} from '~/api/procedures/createPortfolios';
import { Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createPortfolios procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToBytesSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let getPortfolioIdsByNameSpy: jest.SpyInstance;
  let newPortfolioName: string;
  let rawNewPortfolioName: Bytes;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    getPortfolioIdsByNameSpy = jest.spyOn(utilsInternalModule, 'getPortfolioIdsByName');

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockBytes(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToBytesSpy)
      .calledWith(newPortfolioName, mockContext)
      .mockReturnValue(rawNewPortfolioName);
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

  it('should throw an error if the portfolio name is duplicated', () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio[]>(mockContext);
    getPortfolioIdsByNameSpy.mockResolvedValue([new BigNumber(1)]);

    return expect(
      prepareCreatePortfolios.call(proc, { names: [newPortfolioName] })
    ).rejects.toThrow('There already exist Portfolios with some of the given names');
  });

  it('should return a create portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio[]>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxMock('portfolio', 'createPortfolio');
    getPortfolioIdsByNameSpy.mockResolvedValue([null]);

    const result = await prepareCreatePortfolios.call(proc, { names: [newPortfolioName] });

    expect(result).toEqual({
      transactions: [
        {
          transaction: createPortfolioTransaction,
          args: [rawNewPortfolioName],
        },
      ],
      resolver: expect.any(Function),
    });
  });
});

describe('createPortfoliosResolver', () => {
  const filterEventRecordsSpy = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id);
  let identityIdToStringSpy: jest.SpyInstance<string, [PolymeshPrimitivesIdentityId]>;
  let u64ToBigNumberSpy: jest.SpyInstance<BigNumber, [u64]>;

  beforeAll(() => {
    identityIdToStringSpy = jest.spyOn(utilsConversionModule, 'identityIdToString');
    u64ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    when(identityIdToStringSpy).calledWith(rawIdentityId).mockReturnValue(did);
    when(u64ToBigNumberSpy).calledWith(rawId).mockReturnValue(id);
    filterEventRecordsSpy.mockReturnValue([dsMockUtils.createMockIEvent([rawIdentityId, rawId])]);
  });

  afterEach(() => {
    jest.resetAllMocks();
    filterEventRecordsSpy.mockReset();
  });

  it('should return the new Numbered Portfolios', () => {
    const fakeContext = {} as Context;

    const [result] = createPortfoliosResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
