import { Bytes, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

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
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let getPortfolioIdsByNameStub: sinon.SinonStub;
  let newPortfolioName: string;
  let rawNewPortfolioName: Bytes;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    getPortfolioIdsByNameStub = sinon.stub(utilsInternalModule, 'getPortfolioIdsByName');

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockBytes(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToBytesStub.withArgs(newPortfolioName, mockContext).returns(rawNewPortfolioName);
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
    getPortfolioIdsByNameStub.resolves([new BigNumber(1)]);

    return expect(
      prepareCreatePortfolios.call(proc, { names: [newPortfolioName] })
    ).rejects.toThrow('There already exist Portfolios with some of the given names');
  });

  it('should return a create portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio[]>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');
    getPortfolioIdsByNameStub.resolves([null]);

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
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id);
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let u64ToBigNumberStub: sinon.SinonStub<[u64], BigNumber>;

  beforeAll(() => {
    identityIdToStringStub = sinon.stub(utilsConversionModule, 'identityIdToString');
    u64ToBigNumberStub = sinon.stub(utilsConversionModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    identityIdToStringStub.withArgs(rawIdentityId).returns(did);
    u64ToBigNumberStub.withArgs(rawId).returns(id);
    filterEventRecordsStub.returns([dsMockUtils.createMockIEvent([rawIdentityId, rawId])]);
  });

  afterEach(() => {
    sinon.reset();
    filterEventRecordsStub.reset();
  });

  it('should return the new Numbered Portfolios', () => {
    const fakeContext = {} as Context;

    const [result] = createPortfoliosResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
