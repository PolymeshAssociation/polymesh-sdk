import { Text, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareRenamePortfolio } from '~/api/procedures/renamePortfolio';
import { Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

describe('renamePortfolio procedure', () => {
  const id = new BigNumber(1);
  const did = 'someDid';
  const identityId = dsMockUtils.createMockIdentityId(did);
  const rawPortfolioNumber = dsMockUtils.createMockU64(id.toNumber());
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let numberToU64Stub: sinon.SinonStub<[number | BigNumber, Context], u64>;
  let textToStringStub: sinon.SinonStub<[Text], string>;
  let stringToTextStub: sinon.SinonStub<[string, Context], Text>;
  let portfoliosStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    numberToU64Stub = sinon.stub(utilsConversionModule, 'numberToU64');
    textToStringStub = sinon.stub(utilsConversionModule, 'textToString');
    stringToTextStub = sinon.stub(utilsConversionModule, 'stringToText');
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

  test('should throw an error if the new name is the same as the current one', () => {
    const newName = 'newName';
    const rawNewName = dsMockUtils.createMockText(newName);

    textToStringStub.withArgs(rawNewName).returns(newName);
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

  test('should throw an error if there already is a portfolio with the new name', () => {
    const portfolioName = 'portfolioName';
    const rawPortfolioName = dsMockUtils.createMockText(portfolioName);
    const entryPortfolioName = 'someName';
    const rawEntryPortfolioName = dsMockUtils.createMockText(entryPortfolioName);

    textToStringStub.withArgs(rawPortfolioName).returns(portfolioName);
    textToStringStub.withArgs(rawEntryPortfolioName).returns(entryPortfolioName);

    portfoliosStub = dsMockUtils.createQueryStub('portfolio', 'portfolios', {
      entries: [tuple([], rawEntryPortfolioName)],
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
    const rawPortfolioName = dsMockUtils.createMockText(portfolioName);
    const newName = 'newName';
    const rawNewName = dsMockUtils.createMockText(newName);

    textToStringStub.withArgs(rawPortfolioName).returns(portfolioName);
    stringToTextStub.returns(rawNewName);

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

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        did,
        id,
      } as Params;
      const portfolio = entityMockUtils.getNumberedPortfolioInstance({ did, id });

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId: { did, number: id } }],
        permissions: {
          tokens: [],
          portfolios: [portfolio],
          transactions: [TxTags.portfolio.RenamePortfolio],
        },
      });
    });
  });
});
