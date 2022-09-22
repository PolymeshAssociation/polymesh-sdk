import { Bytes, u64 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';
import { IdentityId } from 'polymesh-types/types';

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
  let stringToIdentityIdStub: jest.SpyInstance<IdentityId, [string, Context]>;
  let bigNumberToU64Stub: jest.SpyInstance<u64, [BigNumber, Context]>;
  let stringToBytesStub: jest.SpyInstance<Bytes, [string, Context]>;
  let getPortfolioIdsByNameStub: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdStub = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    bigNumberToU64Stub = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    stringToBytesStub = jest.spyOn(utilsConversionModule, 'stringToBytes');
    getPortfolioIdsByNameStub = jest.spyOn(utilsInternalModule, 'getPortfolioIdsByName');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToIdentityIdStub).calledWith(did, mockContext).mockReturnValue(identityId);
    when(bigNumberToU64Stub).calledWith(id, mockContext).mockReturnValue(rawPortfolioNumber);
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });
    stringToBytesStub.mockReturnValue(rawNewName);
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
    getPortfolioIdsByNameStub.mockReturnValue([id]);

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
    getPortfolioIdsByNameStub.mockReturnValue([new BigNumber(2)]);

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
    getPortfolioIdsByNameStub.mockReturnValue([]);

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
