import { SignerPayloadJSON } from '@polkadot/types/types';

import { VaultSigner } from '~/externalSigners/VaultSigner';
import { PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';

const vaultUrl = 'http://example.com';
const address = '5FJtuUyQv34FwN6TaMDN7KrJ2RToFoTzEfMCWToYrMp3Rw89';

/* eslint-disable @typescript-eslint/naming-convention */
const fetchKeyResponse = {
  data: {
    keys: {
      '1': {
        public_key: 'j4dUI2Dbj1+oYW+2kv9KZ0h4j1jPWqErtMY3KoBhVlQ=',
      },
    },
    latest_version: 1,
    name: 'MyKey',
    type: 'ed25519',
  },
  statusCode: 200,
};
/* eslint-enable @typescript-eslint/naming-convention */

describe('Vault Signer', () => {
  let vaultSigner: VaultSigner;
  let fetchKeySpy: any;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registry = dsMockUtils.getApiInstance().registry as any;
    registry.createType.mockReturnValue({ toU8a: () => [1, 123, 41, 12] });
    vaultSigner = new VaultSigner(vaultUrl, 'some_secret');
    vaultSigner.configure(dsMockUtils.getApiInstance().registry, 42);
    fetchKeySpy = jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(vaultSigner as any, 'fetchKeyAddress')
      .mockResolvedValue(fetchKeyResponse);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    fetchKeySpy.mockRestore();
  });

  describe('method: addKey', () => {
    test('should return the KeyringPair', async () => {
      const result = await vaultSigner.addKey('MyKey');
      expect(result).toBe(address);
    });

    test('should throw if Vault returns non 200 response', async () => {
      fetchKeySpy.mockResolvedValue({ ...fetchKeyResponse, statusCode: 403 });
      let error;
      try {
        await vaultSigner.addKey('MyKey');
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'Could not add key: "MyKey". Vault returned status code: 403',
      });
      expect(error).toStrictEqual(expectedError);
    });

    test('should throw if key is not ed25519', async () => {
      const badTypeResponse = JSON.parse(JSON.stringify(fetchKeyResponse));
      badTypeResponse.data.type = 'rsa-4096';
      fetchKeySpy.mockResolvedValue(badTypeResponse);
      let error;
      try {
        await vaultSigner.addKey('MyKey');
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.General,
        message: 'Only ed25519 type keys can sign extrinsics. Key: "MyKey" was: rsa-4096',
      });
      expect(error).toStrictEqual(expectedError);
    });
  });

  describe('method: signPayload', () => {
    test('should sign payloads', async () => {
      const sendSignRequestSpy = jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(vaultSigner as any, 'sendSignRequest')
        .mockResolvedValue({
          data: {
            signature:
              '"vault:v1:UTMPjIkboqEbUZU/QAKvYhpjdfKHN7nY3a+0nriNOrOLM3PWuH5SzvYr383wuRjV0mz6qf8vy/4kaxhevuZIAg=="',
          },
        });
      const keyring = dsMockUtils.getKeyringInstance();
      keyring.addFromAddress.returns({ address });
      await vaultSigner.addKey('MyKey');

      const result = await vaultSigner.signPayload({ address } as SignerPayloadJSON);
      expect(result.signature).toBe(
        '0x0051330f8c891ba2a11b51953f4002af621a6375f28737b9d8ddafb49eb88d3ab38b3373d6b87e52cef62bdfcdf0b918d5d26cfaa9ff2fcbfe246b185ebee64802'
      );
      expect(result.id).toBe(1);
      fetchKeySpy.mockRestore();
      sendSignRequestSpy.mockRestore();
    });
  });

  test('throws if registry is not set', async () => {
    const unconfiguredSigner = new VaultSigner(vaultUrl, 'some_secret');
    let error;
    try {
      await unconfiguredSigner.signPayload({ address } as SignerPayloadJSON);
    } catch (err) {
      error = err;
    }

    const expectedError = new PolymeshError({
      code: ErrorCode.General,
      message: 'VaultSigner has not been configured',
    });

    expect(error).toStrictEqual(expectedError);
  });
});
