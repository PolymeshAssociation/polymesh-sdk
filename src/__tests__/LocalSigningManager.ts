import { hexToU8a } from '@polkadot/util';

import { LocalSigningManager } from '~/LocalSigningManager';
import { PrivateKey } from '~/types';

describe('LocalSigningManager Class', () => {
  let signingManager: LocalSigningManager;
  let accounts: { privateKey: PrivateKey; address: string; publicKey: Uint8Array }[];

  beforeAll(() => {
    accounts = [
      {
        privateKey: {
          seed: '0x93a2c0c831f0f7c722285daf8522df4799727dffad4ee6669b57d9a6c45b69b6',
        },
        address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        publicKey: hexToU8a('0x72a5a53f6a04459a8e8ed266cc048db7f8c8d3faac0204f99ed593400bad636c'),
      },
      {
        privateKey: {
          uri: 'zone earth dad evidence club text roast claim decorate satoshi dress seven//test',
        },
        address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
        publicKey: hexToU8a('0xec2624ca769be5bc57cd23f0f1d8c06a0f68ac06a57e00355361d45000af7c28'),
      },
      {
        privateKey: {
          mnemonic: 'bachelor nurse busy spot cannon equal drip outer autumn fork virtual thunder',
        },
        address: '5Cg3MNhhuPD5UUjXjjKNszzXic5KMDwMpUansgPVqb9KoE54',
        publicKey: hexToU8a('0x1af337073aac07c2622ba393854850341cff112d5d6380def23ee323b0d48802'),
      },
    ];
  });

  beforeEach(async () => {
    signingManager = await LocalSigningManager.create({
      accounts: accounts.map(({ privateKey }) => privateKey),
    });

    signingManager.setSs58Format(42);
  });

  describe('method: getAccounts', () => {
    test('should return all accounts held in the keyring', async () => {
      const result = await signingManager.getAccounts();

      expect(result).toEqual([
        expect.objectContaining({
          address: accounts[0].address,
          publicKey: accounts[0].publicKey,
        }),
        expect.objectContaining({
          address: accounts[1].address,
          publicKey: accounts[1].publicKey,
        }),
        expect.objectContaining({
          address: accounts[2].address,
          publicKey: accounts[2].publicKey,
        }),
      ]);
    });
  });

  describe('method: getExternalSigner', () => {
    test('should return null', () => {
      expect(signingManager.getExternalSigner()).toBeNull();
    });
  });

  describe('method: addAccount', () => {
    test('should add a new account and return its address', () => {
      const result = signingManager.addAccount({
        seed: '0xb5da7610352f87452fe5fa4d9af35a3fbb613e7afee2c72056333db0b94d6f98',
      });

      expect(result).toBe('5FcF7cEA4e3yg8FJmu6UZZeh96dEV5AF84cih4WV9bhKsWjw');
    });

    test('should throw an error if the Signing Manager doesnt have a SS58 format', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (signingManager as any).hasFormat = false;

      expect(() =>
        signingManager.addAccount({
          seed: '0xb5da7610352f87452fe5fa4d9af35a3fbb613e7afee2c72056333db0b94d6f98',
        })
      ).toThrow('Cannot add accounts before calling `setSs58Format`');
    });
  });
});
