import { Text, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createPortfolioResolver,
  Params,
  prepareCreatePortfolio,
} from '~/api/procedures/createPortfolio';
import { Context, NumberedPortfolio, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createPortfolio procedure', () => {
  let mockContext: Mocked<Context>;
  let numberedPortfolio: PostTransactionValue<NumberedPortfolio>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let getPortfolioIdByNameStub: sinon.SinonStub;
  let newPortfolioName: string;
  let rawNewPortfolioName: Text;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    numberedPortfolio = 'numberedPortfolio' as unknown as PostTransactionValue<NumberedPortfolio>;

    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');
    getPortfolioIdByNameStub = sinon.stub(utilsInternalModule, 'getPortfolioIdByName');

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockText(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([numberedPortfolio]);
    stringToTextStub.withArgs(newPortfolioName, mockContext).returns(rawNewPortfolioName);
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

  test('should throw an error if the portfolio name is duplicated', () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    getPortfolioIdByNameStub.returns(new BigNumber(1));

    return expect(prepareCreatePortfolio.call(proc, { name: newPortfolioName })).rejects.toThrow(
      'A Portfolio with that name already exists'
    );
  });

  test('should add a create portfolio transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');
    getPortfolioIdByNameStub.returns(null);

    const result = await prepareCreatePortfolio.call(proc, { name: newPortfolioName });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: createPortfolioTransaction,
        resolvers: sinon.match.array,
        args: [rawNewPortfolioName],
      })
    );
    expect(result).toBe(numberedPortfolio);
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

  test('should return the new Numbered Portfolio', () => {
    const fakeContext = {} as Context;

    const result = createPortfolioResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
