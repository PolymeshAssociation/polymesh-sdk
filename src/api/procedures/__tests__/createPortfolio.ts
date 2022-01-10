import { Text, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId, PortfolioName, PortfolioNumber } from 'polymesh-types/types';
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
  let portfolio: { id: BigNumber; name: string };
  let rawPortfolio: { id: PortfolioNumber; name: PortfolioName };
  let newPortfolioName: string;
  let addTransactionStub: sinon.SinonStub;
  let rawNewPortfolioName: Text;
  let nameToNumberStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberedPortfolio = ('numberedPortfolio' as unknown) as PostTransactionValue<NumberedPortfolio>;
    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');

    portfolio = {
      id: new BigNumber(1),
      name: 'portfolioName1',
    };

    rawPortfolio = {
      id: dsMockUtils.createMockU64(portfolio.id.toNumber()),
      name: dsMockUtils.createMockText(portfolio.name),
    };

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockText(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([numberedPortfolio]);
    stringToTextStub.withArgs(newPortfolioName, mockContext).returns(rawNewPortfolioName);

    nameToNumberStub = dsMockUtils.createQueryStub('portfolio', 'nameToNumber');
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if the portfolio name is duplicated', () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    nameToNumberStub.returns(rawPortfolio.id);

    return expect(prepareCreatePortfolio.call(proc, { name: portfolio.name })).rejects.toThrow(
      'A portfolio with that name already exists'
    );
  });

  test('should add a create portfolio transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');
    nameToNumberStub.returns(dsMockUtils.createMockU64(0));

    const result = await prepareCreatePortfolio.call(proc, { name: newPortfolioName });

    sinon.assert.calledWith(
      addTransactionStub,
      createPortfolioTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawNewPortfolioName
    );
    expect(result).toBe(numberedPortfolio);
  });
});

describe('createPortfolioResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id.toNumber());
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
