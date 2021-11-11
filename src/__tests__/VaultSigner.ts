import { SignerPayloadJSON } from '@polkadot/types/types';

import { VaultSigner } from '~/externalSigners/VaultSigner';
import { PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';

const vaultUrl = 'http://example.com';
const address = '5FUAXfiwa1zKwc8zwwkiJBc1RxHLFLYFeHspcpzEdzGLoJq8';

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
      .mockResolvedValue(address);
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
