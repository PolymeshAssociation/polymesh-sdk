import { Bytes, u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { IdentityId, PortfolioName } from 'polymesh-types/types';
import sinon from 'sinon';

import { NumberedPortfolio } from '~/api/entities';
import {
  createPortfolioResolver,
  Params,
  prepareCreatePortfolio,
} from '~/api/procedures/createPortfolio';
import { Context, PostTransactionValue } from '~/base';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

describe('createPortfolio procedure', () => {
  let mockContext: Mocked<Context>;
  let numberedPortfolio: PostTransactionValue<NumberedPortfolio>;
  let bytesToStringStub: sinon.SinonStub;
  let stringToBytesStub: sinon.SinonStub;
  let rawPortfolios: [PortfolioName][];
  let portfolioEntries: [[], PortfolioName][];
  let portfoliosName: { name: string }[];
  let newPortfolioName: string;
  let addTransactionStub: sinon.SinonStub;
  let rawNewPortfolioName: Bytes;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    numberedPortfolio = ('numberedPortfolio' as unknown) as PostTransactionValue<NumberedPortfolio>;
    bytesToStringStub = sinon.stub(utilsModule, 'bytesToString');
    stringToBytesStub = sinon.stub(utilsModule, 'stringToBytes');

    portfoliosName = [
      {
        name: 'portfolioName1',
      },
    ];

    rawPortfolios = portfoliosName.map(({ name }) => tuple(dsMockUtils.createMockBytes(name)));

    portfolioEntries = rawPortfolios.map(([name]) => tuple([], name));

    newPortfolioName = 'newPortfolioName';
    rawNewPortfolioName = dsMockUtils.createMockBytes(newPortfolioName);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([numberedPortfolio]);
    bytesToStringStub.withArgs(rawPortfolios[0][0]).returns(portfoliosName[0].name);
    stringToBytesStub.withArgs(newPortfolioName, mockContext).returns(rawNewPortfolioName);

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
      prepareCreatePortfolio.call(proc, { name: portfoliosName[0].name })
    ).rejects.toThrow('Already exists a portfolio with the same name');
  });

  test('should add a create portfolio transaction and an add documents transaction to the queue', async () => {
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
  const findEventRecordStub = sinon.stub(utilsModule, 'findEventRecord');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const id = new BigNumber(1);
  const rawId = dsMockUtils.createMockU64(id.toNumber());
  let identityIdToStringStub: sinon.SinonStub<[IdentityId], string>;
  let u64ToBigNumberStub: sinon.SinonStub<[u64], BigNumber>;

  beforeAll(() => {
    identityIdToStringStub = sinon.stub(utilsModule, 'identityIdToString');
    u64ToBigNumberStub = sinon.stub(utilsModule, 'u64ToBigNumber');
  });

  beforeEach(() => {
    identityIdToStringStub.withArgs(rawIdentityId).returns(did);
    u64ToBigNumberStub.withArgs(rawId).returns(id);
    findEventRecordStub.returns(dsMockUtils.createMockEventRecord([rawIdentityId, rawId]));
  });

  afterEach(() => {
    sinon.reset();
    findEventRecordStub.reset();
  });

  test('should return the new Numbered Portfolio', () => {
    const fakeContext = {} as Context;

    const result = createPortfolioResolver(fakeContext)({} as ISubmittableResult);

    expect(result.id).toEqual(id);
  });
});
