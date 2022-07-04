import { Bytes, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createPortfolioResolver,
  Params,
  prepareCreatePortfolio,
} from '~/api/procedures/createPortfolio';
import { Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createPortfolio procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let getPortfolioIdByNameStub: sinon.SinonStub;
  let newPortfolioName: string;
  let rawNewPortfolioName: Bytes;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    getPortfolioIdByNameStub = sinon.stub(utilsInternalModule, 'getPortfolioIdByName');

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
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    getPortfolioIdByNameStub.returns(new BigNumber(1));

    return expect(prepareCreatePortfolio.call(proc, { name: newPortfolioName })).rejects.toThrow(
      'A Portfolio with that name already exists'
    );
  });

  it('should return a create portfolio transaction spec', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');
    getPortfolioIdByNameStub.returns(null);

    const result = await prepareCreatePortfolio.call(proc, { name: newPortfolioName });

    expect(result).toEqual({
      transaction: createPortfolioTransaction,
      args: [rawNewPortfolioName],
      resolver: expect.any(Function),
    });
  });
});

describe('createPortfolioResolver', () => {
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

  it('should return the new Numbered Portfolio', () => {
    const fakeContext = {} as Context;

    const result = createPortfolioResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
