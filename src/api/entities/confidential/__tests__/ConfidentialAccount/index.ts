import { ConfidentialAccount, Context, Entity } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import * as utilsConversionModule from '~/utils/conversion';

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
});
