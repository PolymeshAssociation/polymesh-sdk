import { PolymeshPrimitivesIdentityId } from '@polkadot/types/lookup';
import { when } from 'jest-when';

import { prepareRevokeIdentityToCreatePortfolios } from '~/api/procedures/revokeIdentityToCreatePortfolios';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, Identity, RevokeIdentityToCreatePortfoliosParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

describe('revokeIdentityToCreatePortfolios procedure', () => {
  let mockContext: Mocked<Context>;
  let allowIdentityToCreatePortfoliosTransaction: PolymeshTx<unknown[]>;
  let stringToIdentityIdSpy: jest.SpyInstance;
  let identityToSet: Identity;
  let rawIdentityToSetDid: PolymeshPrimitivesIdentityId;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToIdentityIdSpy = jest.spyOn(utilsConversionModule, 'stringToIdentityId');
    identityToSet = entityMockUtils.getIdentityInstance({ did: 'someDid' });
    rawIdentityToSetDid = dsMockUtils.createMockIdentityId(identityToSet.did);
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    allowIdentityToCreatePortfoliosTransaction = dsMockUtils.createTxMock(
      'portfolio',
      'revokeCreatePortfoliosPermission'
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

  it('should return a prepareRevokeIdentityToCreatePortfolios transaction spec', async () => {
    dsMockUtils.createQueryMock('portfolio', 'allowedCustodians', {
      returnValue: dsMockUtils.createMockBool(true),
    });
    entityMockUtils.configureMocks({ identityOptions: { exists: true } });

    const args = {
      did: identityToSet,
    };

    when(stringToIdentityIdSpy).calledWith(identityToSet).mockReturnValue(rawIdentityToSetDid);

    const proc = procedureMockUtils.getInstance<RevokeIdentityToCreatePortfoliosParams, void>(
      mockContext
    );

    const result = await prepareRevokeIdentityToCreatePortfolios.call(proc, args);

    expect(result).toEqual({
      transaction: allowIdentityToCreatePortfoliosTransaction,
      args: [],
      resolver: undefined,
    });
  });

  it('should throw an error if the Identity already has can create portfolios', async () => {
    dsMockUtils.createQueryMock('portfolio', 'allowedCustodians', {
      returnValue: dsMockUtils.createMockBool(false),
    });
    entityMockUtils.configureMocks({ identityOptions: { exists: true } });

    const args = {
      did: identityToSet,
    };

    const proc = procedureMockUtils.getInstance<RevokeIdentityToCreatePortfoliosParams, void>(
      mockContext
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The provided Identity is not in the list of allowed custodians',
    });

    return expect(prepareRevokeIdentityToCreatePortfolios.call(proc, args)).rejects.toThrowError(
      expectedError
    );
  });
});
