import { Bytes, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { IdentityId } from 'polymesh-types/types';

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
  let stringToBytesStub: jest.SpyInstance<Bytes, [string, Context]>;
  let getPortfolioIdsByNameStub: jest.SpyInstance;
  let newPortfolioName: string;
  let rawNewPortfolioName: Bytes;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToBytesStub = jest.spyOn(utilsConversionModule, 'stringToBytes');
    getPortfolioIdsByNameStub = jest.spyOn(utilsInternalModule, 'getPortfolioIdsByName');

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockBytes(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToBytesStub)
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
    getPortfolioIdsByNameStub.mockResolvedValue([new BigNumber(1)]);

    return expect(
      prepareCreatePortfolios.call(proc, { names: [newPortfolioName] })
    ).rejects.toThrow('There already exist Portfolios with some of the given names');
  });

  it('should return a create portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio[]>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');
    getPortfolioIdsByNameStub.mockResolvedValue([null]);

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
  const filterEventRecordsStub = jest.spyOn(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id);
  let identityIdToStringStub: jest.SpyInstance<string, [IdentityId]>;
  let u64ToBigNumberStub: jest.SpyInstance<BigNumber, [u64]>;

  beforeAll(() => {
    identityIdToStringStub = jest.spyOn(utilsConversionModule, 'identityIdToString');
    u64ToBigNumberStub = jest.spyOn(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    when(identityIdToStringStub).calledWith(rawIdentityId).mockReturnValue(did);
    when(u64ToBigNumberStub).calledWith(rawId).mockReturnValue(id);
    filterEventRecordsStub.mockReturnValue([dsMockUtils.createMockIEvent([rawIdentityId, rawId])]);
  });

  afterEach(() => {
    jest.resetAllMocks();
    filterEventRecordsStub.mockReset();
  });

  it('should return the new Numbered Portfolios', () => {
    const fakeContext = {} as Context;

    const [result] = createPortfoliosResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
