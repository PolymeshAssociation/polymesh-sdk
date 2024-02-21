import { ConfidentialAccount, ConfidentialAsset, Context, Entity, PolymeshError } from '~/internal';
import { confidentialAssetsByHolderQuery } from '~/middleware/queries';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/confidential/ConfidentialAsset',
  require('~/testUtils/mocks/entities').mockConfidentialAssetModule(
    '~/api/entities/confidential/ConfidentialAsset'
  )
);

describe('ConfidentialAccount class', () => {
  let context: Mocked<Context>;

  let publicKey: string;
  let account: ConfidentialAccount;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    jest.spyOn(utilsConversionModule, 'addressToKey').mockImplementation();

    publicKey = '0xb8bb6107ef0dacb727199b329e2d09141ea6f36774818797e843df800c746d19';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    account = new ConfidentialAccount({ publicKey }, context);
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should extend Entity', () => {
    expect(ConfidentialAccount.prototype).toBeInstanceOf(Entity);
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(ConfidentialAccount.isUniqueIdentifiers({ publicKey })).toBe(true);
      expect(ConfidentialAccount.isUniqueIdentifiers({})).toBe(false);
      expect(ConfidentialAccount.isUniqueIdentifiers({ publicKey: 3 })).toBe(false);
    });
  });

  describe('method: getIdentity', () => {
    let accountDidMock: jest.Mock;

    beforeEach(() => {
      accountDidMock = dsMockUtils.createQueryMock('confidentialAsset', 'accountDid');
    });

    it('should return the Identity associated to the ConfidentialAccount', async () => {
      const did = 'someDid';
      accountDidMock.mockReturnValueOnce(
        dsMockUtils.createMockOption(dsMockUtils.createMockIdentityId(did))
      );

      const result = await account.getIdentity();
      expect(result?.did).toBe(did);
    });

    it('should return null if there is no Identity associated to the ConfidentialAccount', async () => {
      accountDidMock.mockReturnValue(dsMockUtils.createMockOption());

      const result = await account.getIdentity();

      expect(result).toBe(null);
    });
  });

  describe('method: getBalances', () => {
    it('should return existing balances of all Confidential Assets for the current ConfidentialAccount', async () => {
      const assetId = '0xAsset';
      const encryptedBalance = '0xbalance';

      jest.spyOn(utilsConversionModule, 'meshConfidentialAssetToAssetId').mockReturnValue(assetId);

      dsMockUtils.createQueryMock('confidentialAsset', 'accountBalance', {
        entries: [
          tuple(
            [publicKey, assetId],
            dsMockUtils.createMockOption(dsMockUtils.createMockElgamalCipherText(encryptedBalance))
          ),
        ],
      });

      const result = await account.getBalances();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            confidentialAsset: expect.objectContaining({ id: assetId }),
            balance: encryptedBalance,
          }),
        ])
      );
    });
  });

  describe('method: getBalance', () => {
    let accountBalanceMock: jest.Mock;
    let assetId: string;

    beforeEach(() => {
      accountBalanceMock = dsMockUtils.createQueryMock('confidentialAsset', 'accountBalance');
      assetId = 'SOME_ASSET_ID';
    });

    it('should return the incoming balance for the given asset ID', async () => {
      const balance = '0xbalance';
      accountBalanceMock.mockReturnValueOnce(
        dsMockUtils.createMockOption(dsMockUtils.createMockElgamalCipherText(balance))
      );

      const result = await account.getBalance({ asset: assetId });
      expect(result).toEqual(balance);
    });

    it('should throw an error if no account balance is found for the given ID', () => {
      accountBalanceMock.mockReturnValue(dsMockUtils.createMockOption());

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No balance found for the given asset',
      });

      return expect(account.getBalance({ asset: assetId })).rejects.toThrowError(expectedError);
    });
  });

  describe('method: getIncomingBalances', () => {
    it('should return all the incoming balances for the ConfidentialAccount', async () => {
      const assetId = '0xAsset';
      const encryptedBalance = '0xbalance';

      jest.spyOn(utilsConversionModule, 'meshConfidentialAssetToAssetId').mockReturnValue(assetId);

      dsMockUtils.createQueryMock('confidentialAsset', 'incomingBalance', {
        entries: [
          tuple(
            [publicKey, assetId],
            dsMockUtils.createMockOption(dsMockUtils.createMockElgamalCipherText(encryptedBalance))
          ),
        ],
      });

      const result = await account.getIncomingBalances();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            confidentialAsset: expect.objectContaining({ id: assetId }),
            balance: encryptedBalance,
          }),
        ])
      );
    });
  });

  describe('method: getIncomingBalance', () => {
    let incomingBalanceMock: jest.Mock;
    let assetId: string;

    beforeEach(() => {
      incomingBalanceMock = dsMockUtils.createQueryMock('confidentialAsset', 'incomingBalance');
      assetId = 'SOME_ASSET_ID';
    });

    it('should return the incoming balance for the given asset ID', async () => {
      const balance = '0xbalance';
      incomingBalanceMock.mockReturnValueOnce(
        dsMockUtils.createMockOption(dsMockUtils.createMockElgamalCipherText(balance))
      );

      const result = await account.getIncomingBalance({ asset: assetId });
      expect(result).toEqual(balance);
    });

    it('should throw an error if no incoming balance is found for the given ID', () => {
      incomingBalanceMock.mockReturnValue(dsMockUtils.createMockOption());

      const expectedError = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'No balance found for the given asset',
      });

      return expect(account.getIncomingBalance({ asset: assetId })).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(account.toHuman()).toBe(account.publicKey);
    });
  });

  describe('method: exists', () => {
    it('should return true if there is an associated DID', () => {
      const mockDid = dsMockUtils.createMockIdentityId('someDID');
      dsMockUtils
        .createQueryMock('confidentialAsset', 'accountDid')
        .mockResolvedValue(dsMockUtils.createMockOption(mockDid));

      return expect(account.exists()).resolves.toBe(true);
    });

    it('should return false', () => {
      dsMockUtils
        .createQueryMock('confidentialAsset', 'accountDid')
        .mockResolvedValue(dsMockUtils.createMockOption());

      return expect(account.exists()).resolves.toBe(false);
    });
  });

  describe('method: getHeldAssets', () => {
    it('should return an array of ConfidentialAssets held by the ConfidentialAccount', async () => {
      const assetId = '76702175d8cbe3a55a19734433351e25';
      const asset = entityMockUtils.getConfidentialAssetInstance({ id: assetId });

      dsMockUtils.createApolloQueryMock(confidentialAssetsByHolderQuery(publicKey), {
        confidentialAssetHolders: {
          nodes: [
            {
              assetId,
              accountId: publicKey,
            },
          ],
          totalCount: 1,
        },
      });

      let result = await account.getHeldAssets();

      expect(result.data[0].id).toEqual(asset.id);
      expect(result.data[0]).toBeInstanceOf(ConfidentialAsset);

      dsMockUtils.createApolloQueryMock(confidentialAssetsByHolderQuery(publicKey), {
        confidentialAssetHolders: {
          nodes: [],
          totalCount: 0,
        },
      });

      result = await account.getHeldAssets();
      expect(result.data).toEqual([]);
      expect(result.next).toBeNull();
    });
  });
});
