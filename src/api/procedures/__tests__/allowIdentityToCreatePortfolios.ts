import { when } from 'jest-when';

import {
  AllowIdentityToCreatePortfoliosParams,
  prepareAllowIdentityToCreatePortfolios,
} from '~/api/procedures/allowIdentityToCreatePortfolios';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('allowIdentityToCreatePortfolios procedure', () => {
  let mockContext: Mocked<Context>;
  let allowIdentityToCreatePortfoliosTransaction: PolymeshTx<unknown[]>;
  let stringToIdentityIdSpy: jest.SpyInstance;

  const did = 'someDid';
  const identityId = dsMockUtils.createMockIdentityId(did);

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    allowIdentityToCreatePortfoliosTransaction = dsMockUtils.createTxMock(
      'portfolio',
      'allowIdentityToCreatePortfolios'
    );
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

  it('should return a prepareAllowIdentityToCreatePortfolios transaction spec', async () => {
    dsMockUtils.createQueryMock('portfolio', 'allowedCustodians', {
      returnValue: dsMockUtils.createMockBool(false),
    });

    const args = {
      did,
    };

    when(stringToIdentityIdSpy).calledWith(args.did).mockReturnValue(identityId);

    const proc = procedureMockUtils.getInstance<AllowIdentityToCreatePortfoliosParams, void>(
      mockContext
    );

    const result = await prepareAllowIdentityToCreatePortfolios.call(proc, args);

    expect(result).toEqual({
      transaction: allowIdentityToCreatePortfoliosTransaction,
      args: [],
      resolver: undefined,
    });
  });

  it('should throw an error if the Identity already has can create portfolios', async () => {
    dsMockUtils.createQueryMock('portfolio', 'allowedCustodians', {
      returnValue: dsMockUtils.createMockBool(true),
    });

    const args = {
      did,
    };

    const proc = procedureMockUtils.getInstance<AllowIdentityToCreatePortfoliosParams, void>(
      mockContext
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The provided Identity is already in the list of allowed custodians',
    });

    return expect(prepareAllowIdentityToCreatePortfolios.call(proc, args)).rejects.toThrowError(
      expectedError
    );
  });
});
