import { Bytes, u64 } from '@polkadot/types';
import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

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
  let stringToIdentityIdSpy: jest.SpyInstance<PolymeshPrimitivesIdentityId, [string, Context]>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let stringToBytesSpy: jest.SpyInstance<Bytes, [string, Context]>;
  let getPortfolioIdsByNameSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');
    stringToBytesSpy = jest.spyOn(utilsConversionModule, 'stringToBytes');
    getPortfolioIdsByNameSpy = jest.spyOn(utilsInternalModule, 'getPortfolioIdsByName');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    when(stringToIdentityIdSpy).calledWith(did, mockContext).mockReturnValue(identityId);
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawPortfolioNumber);
    entityMockUtils.configureMocks({
      numberedPortfolioOptions: {
        isOwnedBy: true,
      },
    });
    stringToBytesSpy.mockReturnValue(rawNewName);
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
    getPortfolioIdsByNameSpy.mockReturnValue([id]);

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
    getPortfolioIdsByNameSpy.mockReturnValue([new BigNumber(2)]);

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
    getPortfolioIdsByNameSpy.mockReturnValue([]);

    const transaction = dsMockUtils.createTxMock('portfolio', 'renamePortfolio');
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
