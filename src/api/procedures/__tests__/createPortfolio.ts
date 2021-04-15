import { Text, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId, PortfolioName } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createPortfolioResolver,
  Params,
  prepareCreatePortfolio,
} from '~/api/procedures/createPortfolio';
import { Context, NumberedPortfolio, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createPortfolio procedure', () => {
  let mockContext: Mocked<Context>;
  let numberedPortfolio: PostTransactionValue<NumberedPortfolio>;
  let textToStringStub: sinon.SinonStub<[Text], string>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let rawPortfolios: [PortfolioName][];
  let portfolioEntries: [[], PortfolioName][];
  let portfolioNames: { name: string }[];
  let newPortfolioName: string;
  let addTransactionStub: sinon.SinonStub;
  let rawNewPortfolioName: Text;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberedPortfolio = ('numberedPortfolio' as unknown) as PostTransactionValue<NumberedPortfolio>;
    textToStringStub = sinon.stub(utilsConversionModule, 'textToString');
    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');

    portfolioNames = [
      {
        name: 'portfolioName1',
      },
    ];

    rawPortfolios = portfolioNames.map(({ name }) => tuple(dsMockUtils.createMockText(name)));

    portfolioEntries = rawPortfolios.map(([name]) => tuple([], name));

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockText(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([numberedPortfolio]);
    textToStringStub.withArgs(rawPortfolios[0][0]).returns(portfolioNames[0].name);
    stringToTextStub.withArgs(newPortfolioName, mockContext).returns(rawNewPortfolioName);

    dsMockUtils.createQueryStub('portfolio', 'portfolios', {
      entries: [portfolioEntries[0]],
    });
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

  test('should throw an error if the portfolio name is duplicated', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareCreatePortfolio.call(proc, { name: portfolioNames[0].name })
    ).rejects.toThrow('A portfolio with that name already exists');
  });

  test('should add a create portfolio transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
    const createPortfolioTransaction = dsMockUtils.createTxStub('portfolio', 'createPortfolio');

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
