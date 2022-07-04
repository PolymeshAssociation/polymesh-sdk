import { Bytes, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { IdentityId } from 'polymesh-types/types';
import sinon from 'sinon';

import { getAuthorization, Params, prepareRenamePortfolio } from '~/api/procedures/renamePortfolio';
import { Context, NumberedPortfolio } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { RoleType, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

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
  const rawPortfolioNumber = dsMockUtils.createMockU64(id);
  const newName = 'newName';
  const rawNewName = dsMockUtils.createMockBytes(newName);
  let mockContext: Mocked<Context>;
  let stringToIdentityIdStub: sinon.SinonStub<[string, Context], IdentityId>;
  let bigNumberToU64Stub: sinon.SinonStub<[BigNumber, Context], u64>;
  let stringToBytesStub: sinon.SinonStub<[string, Context], Bytes>;
  let getPortfolioIdByNameStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = sinon.stub(utilsConversionModule, 'stringToIdentityId');
    bigNumberToU64Stub = sinon.stub(utilsConversionModule, 'bigNumberToU64');
    stringToBytesStub = sinon.stub(utilsConversionModule, 'stringToBytes');
    getPortfolioIdByNameStub = sinon.stub(utilsInternalModule, 'getPortfolioIdByName');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    stringToIdentityIdStub.withArgs(did, mockContext).returns(identityId);
    bigNumberToU64Stub.withArgs(id, mockContext).returns(rawPortfolioNumber);
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });
    stringToBytesStub.returns(rawNewName);
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

  it('should throw an error if the new name is the same as the current one', () => {
    getPortfolioIdByNameStub.returns(id);

    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareRenamePortfolio.call(proc, {
        id,
        did,
        name: newName,
      })
    ).rejects.toThrow('New name is the same as current name');
  });

  it('should throw an error if there already is a portfolio with the new name', () => {
    getPortfolioIdByNameStub.returns(new BigNumber(2));

    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    return expect(
      prepareRenamePortfolio.call(proc, {
        id,
        did,
        name: newName,
      })
    ).rejects.toThrow('A Portfolio with that name already exists');
  });

  it('should return a rename portfolio transaction spec', async () => {
    getPortfolioIdByNameStub.returns(undefined);

    const transaction = dsMockUtils.createTxStub('portfolio', 'renamePortfolio');
    const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);

    const result = await prepareRenamePortfolio.call(proc, {
      id,
      did,
      name: newName,
    });

    expect(result).toEqual({
      transaction,
      args: [rawPortfolioNumber, rawNewName],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, NumberedPortfolio>(mockContext);
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        did,
        id,
      } as Params;

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.PortfolioCustodian, portfolioId: { did, number: id } }],
        permissions: {
          assets: [],
          portfolios: [expect.objectContaining({ owner: expect.objectContaining({ did }), id })],
          transactions: [TxTags.portfolio.RenamePortfolio],
        },
      });
    });
  });
});
