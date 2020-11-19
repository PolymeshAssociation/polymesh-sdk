import { Bytes, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import { Params, prepareRenamePortfolio } from '~/api/procedures/renamePortfolio';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { NumberedPortfolio } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('modifyNamePortfolio procedure', () => {
  const id = new BigNumber(1);
  const did = 'someDid';
  const identityId = dsMockUtils.createMockIdentityId(did);
  const rawPortfolioNumber = dsMockUtils.createMockU64(id.toNumber());
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let bytesToStringStub: sinon.SinonStub<[Bytes], string>;
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let portfoliosStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsModule, 'stringToIdentityId');
    numberToU64Stub = sinon.stub(utilsModule, 'numberToU64');
    bytesToStringStub = sinon.stub(utilsModule, 'bytesToString');
    stringToBytesStub = sinon.stub(utilsModule, 'stringToBytes');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToIdentityIdStub.withArgs(did, mockContext).returns(identityId);
    numberToU64Stub.withArgs(id, mockContext).returns(rawPortfolioNumber);
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });

    portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios');
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

  test('should throw an error if the Current Identity is not the Portfolio owner', async () => {
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: false,
      },
    });

    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareRenamePortfolio.call(proc, {
        id,
        did,
        name: 'newName',
      })
    ).rejects.toThrow('You are not the owner of this Portfolio');
  });

  test('should throw an error if the new name is the same as the current one', async () => {
    const newName = 'newName';
    const rawNewName = dsMockUtils.createMockBytes(newName);

    bytesToStringStub.withArgs(rawNewName).returns(newName);
    portfoliosStub.resolves(rawNewName);

    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareRenamePortfolio.call(proc, {
        id,
        did,
        name: newName,
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  test('should throw an error if there already is a portfolio with the new name', async () => {
    const portfolioName = 'portfolioName';
    const rawPortfolioName = dsMockUtils.createMockBytes(portfolioName);
    const entryPortfolioName = 'someName';
    const rawEntryPortfolioName = dsMockUtils.createMockBytes(entryPortfolioName);

    bytesToStringStub.withArgs(rawPortfolioName).returns(portfolioName);
    bytesToStringStub.withArgs(rawEntryPortfolioName).returns(entryPortfolioName);

    portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios', {
      entries: [tuple([], dsMockUtils.createMockBytes(entryPortfolioName))],
    });
    portfoliosStub.resolves(rawPortfolioName);

    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareRenamePortfolio.call(proc, {
        id,
        did,
        name: entryPortfolioName,
      })
    ).rejects.toThrow('A portfolio with that name already exists');
  });

  test('should add a rename portfolio transaction to the queue', async () => {
    const portfolioName = 'portfolioName';
    const rawPortfolioName = dsMockUtils.createMockBytes(portfolioName);
    const newName = 'newName';
    const rawNewName = dsMockUtils.createMockBytes(newName);

    bytesToStringStub.withArgs(rawPortfolioName).returns(portfolioName);
    stringToBytesStub.returns(rawNewName);

    portfoliosStub.resolves(rawPortfolioName);

    const transaction = dsMockUtils.createTxStub('portfolio', 'renamePortfolio');
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    const result = await prepareRenamePortfolio.call(proc, {
      id,
      did,
      name: newName,
    });

    const addTransactionStub = procedureMockUtils.getAddTransactionStub();

    sinon.assert.calledWith(addTransactionStub, transaction, {}, rawPortfolioNumber, rawNewName);
    expect(result.id).toBe(id);
  });
});
