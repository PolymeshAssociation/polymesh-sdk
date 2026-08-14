import { hexToU8a } from '@polkadot/util';
import { encodeAddress, ethereumEncode } from '@polkadot/util-crypto';
import { PalletRevivePrimitivesEthTransactError } from '@polymeshassociation/polymesh-types/polkadot/types-lookup';
import BigNumber from 'bignumber.js';

import { PolymeshError } from '~/base/PolymeshError';
import { dsMockUtils } from '~/testUtils/mocks';
import { ErrorCode } from '~/types';
import {
  ethAddressFromSs58,
  isEthDerivedAddress,
  parseEthTransactError,
  ss58FromEthAddress,
} from '~/utils/eth';

describe('eth utils', () => {
  const h160 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const checksummedH160 = ethereumEncode(hexToU8a(h160));

  const buildEthAccountId = (): Uint8Array => {
    const accountId = new Uint8Array(32);
    accountId.set(hexToU8a(h160), 0);
    accountId.set(new Uint8Array(12).fill(0xee), 20);
    return accountId;
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('isEthDerivedAddress', () => {
    it.each([new BigNumber(42), new BigNumber(12)])(
      'should return true for an Ethereum-derived address (ss58Format %s)',
      ss58Format => {
        const accountId = buildEthAccountId();
        const address = encodeAddress(accountId, ss58Format.toNumber());

        expect(isEthDerivedAddress(address, ss58Format)).toBe(true);
      }
    );

    it.each([new BigNumber(42), new BigNumber(12)])(
      'should return false for a non Ethereum-derived address (ss58Format %s)',
      ss58Format => {
        const accountId = new Uint8Array(32).fill(1);
        const address = encodeAddress(accountId, ss58Format.toNumber());

        expect(isEthDerivedAddress(address, ss58Format)).toBe(false);
      }
    );

    it('should return false rather than throw for a malformed address', () => {
      expect(isEthDerivedAddress('not an address', new BigNumber(42))).toBe(false);
      expect(isEthDerivedAddress('', new BigNumber(42))).toBe(false);
    });

    it('should return false for a validly encoded address that is not 32 bytes', () => {
      // SS58 also encodes shorter keys, which can never carry the 12 byte 0xEE suffix
      const shortAddress = encodeAddress(new Uint8Array(8).fill(0xee), 42);

      expect(isEthDerivedAddress(shortAddress, new BigNumber(42))).toBe(false);
    });
  });

  describe('ethAddressFromSs58', () => {
    it.each([new BigNumber(42), new BigNumber(12)])(
      'should convert the ss58 address of an Ethereum Account into its checksummed H160 (ss58Format %s)',
      ss58Format => {
        const accountId = buildEthAccountId();
        const address = encodeAddress(accountId, ss58Format.toNumber());

        expect(ethAddressFromSs58(address, ss58Format)).toBe(checksummedH160);
      }
    );

    it('should throw a ValidationError if the address is not Ethereum-derived', () => {
      const ss58Format = new BigNumber(42);
      const accountId = new Uint8Array(32).fill(1);
      const address = encodeAddress(accountId, ss58Format.toNumber());

      expect(() => ethAddressFromSs58(address, ss58Format)).toThrow(
        expect.objectContaining({ code: ErrorCode.ValidationError })
      );
    });
  });

  describe('ss58FromEthAddress', () => {
    it.each([new BigNumber(42), new BigNumber(12)])(
      'should convert an H160 address into the ss58 address of the Account it controls (ss58Format %s)',
      ss58Format => {
        const accountId = buildEthAccountId();
        const expected = encodeAddress(accountId, ss58Format.toNumber());

        expect(ss58FromEthAddress(h160, ss58Format)).toBe(expected);
        expect(ss58FromEthAddress(checksummedH160, ss58Format)).toBe(expected);
      }
    );

    it('should throw a ValidationError if the address is not valid hex', () => {
      expect(() => ss58FromEthAddress('not hex', new BigNumber(42))).toThrow(
        expect.objectContaining({ code: ErrorCode.ValidationError })
      );
    });

    it('should throw a ValidationError if the address is not 20 bytes long', () => {
      expect(() => ss58FromEthAddress('0x1234', new BigNumber(42))).toThrow(
        expect.objectContaining({ code: ErrorCode.ValidationError })
      );
    });

    it('should report malformed input as a hex problem rather than a length problem', () => {
      /*
       * `hexToU8a` decodes non-hex input to garbage bytes instead of throwing, so without an
       *   up-front check this would surface as the (misleading) length error
       */
      expect(() => ss58FromEthAddress('not hex', new BigNumber(42))).toThrow(
        expect.objectContaining({
          code: ErrorCode.ValidationError,
          message: 'The supplied Ethereum address is not valid hex',
        })
      );
    });
  });

  describe('round trip', () => {
    it.each([new BigNumber(42), new BigNumber(12)])(
      'should round trip an Ethereum address through its ss58 form (ss58Format %s)',
      ss58Format => {
        const ss58 = ss58FromEthAddress(h160, ss58Format);

        expect(isEthDerivedAddress(ss58, ss58Format)).toBe(true);
        expect(ethAddressFromSs58(ss58, ss58Format)).toBe(checksummedH160);
      }
    );
  });

  describe('parseEthTransactError', () => {
    it('should resolve a Module error through chain metadata, matching the exact verified string', () => {
      const context = dsMockUtils.getContextInstance();

      (context.polymeshApi.registry.findMetaError as jest.Mock).mockReturnValue({
        section: 'identity',
        name: 'AlreadyLinked',
        docs: ['One secondary or primary key can only belong to one DID'],
      });

      const error = {
        isData: false,
        isMessage: true,
        asMessage: {
          toString: () =>
            'Failed to dispatch call: Module(ModuleError { index: 7, error: [0, 0, 0, 0], message: Some("AlreadyLinked") })',
        },
      } as unknown as PalletRevivePrimitivesEthTransactError;

      const result = parseEthTransactError(error, context);

      expect(result).toEqual(
        expect.objectContaining({
          code: ErrorCode.TransactionReverted,
          message:
            'identity.AlreadyLinked: One secondary or primary key can only belong to one DID',
        })
      );
      expect(context.polymeshApi.registry.findMetaError).toHaveBeenCalledWith({
        index: expect.objectContaining({ words: [7] }),
        error: Uint8Array.from([0, 0, 0, 0]),
      });
    });

    it('should fall back to UnexpectedError carrying the raw message when it does not match the module error pattern', () => {
      const context = dsMockUtils.getContextInstance();

      const rawMessage = 'Failed to instantiate';
      const error = {
        isData: false,
        isMessage: true,
        asMessage: { toString: () => rawMessage },
      } as unknown as PalletRevivePrimitivesEthTransactError;

      const result = parseEthTransactError(error, context);

      expect(result).toEqual(
        expect.objectContaining({
          code: ErrorCode.UnexpectedError,
          message: rawMessage,
        })
      );
    });

    it('should fall back to UnexpectedError if metadata lookup throws for a matching message', () => {
      const context = dsMockUtils.getContextInstance();

      (context.polymeshApi.registry.findMetaError as jest.Mock).mockImplementation(() => {
        throw new Error('not found');
      });

      const rawMessage =
        'Failed to dispatch call: Module(ModuleError { index: 99, error: [9, 0, 0, 0], message: Some("Unknown") })';
      const error = {
        isData: false,
        isMessage: true,
        asMessage: { toString: () => rawMessage },
      } as unknown as PalletRevivePrimitivesEthTransactError;

      const result = parseEthTransactError(error, context);

      expect(result).toEqual(
        expect.objectContaining({
          code: ErrorCode.UnexpectedError,
          message: rawMessage,
        })
      );
    });

    it('should map a Data variant to UnexpectedError with the raw hex, without ABI decoding', () => {
      const context = dsMockUtils.getContextInstance();

      const error = {
        isData: true,
        asData: { toHex: () => '0xdeadbeef' },
      } as unknown as PalletRevivePrimitivesEthTransactError;

      const result = parseEthTransactError(error, context);

      expect(result).toBeInstanceOf(PolymeshError);
      expect(result).toEqual(
        expect.objectContaining({
          code: ErrorCode.UnexpectedError,
          data: { data: '0xdeadbeef' },
        })
      );
    });
  });
});
