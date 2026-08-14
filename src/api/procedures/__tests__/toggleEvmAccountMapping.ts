import { hexToU8a } from '@polkadot/util';
import { encodeAddress, ethereumEncode, keccakAsU8a } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';

import {
  getAuthorization,
  prepareToggleEvmAccountMapping,
  ToggleEvmAccountMappingParams,
} from '~/api/procedures/toggleEvmAccountMapping';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';

describe('toggleEvmAccountMapping procedure', () => {
  let mockContext: Mocked<Context>;

  const ss58Format = new BigNumber(42);

  const nativeAccountId = new Uint8Array(32).fill(1);
  const nativeAddress = encodeAddress(nativeAccountId, ss58Format.toNumber());
  const derivedEvmAddress = ethereumEncode(keccakAsU8a(nativeAccountId).subarray(12));

  const h160 = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const ethAccountId = new Uint8Array(32);
  ethAccountId.set(hexToU8a(h160), 0);
  ethAccountId.set(new Uint8Array(12).fill(0xee), 20);
  const ethDerivedAddress = encodeAddress(ethAccountId, ss58Format.toNumber());

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance({ ss58Format });
    mockContext.getSigningAddress.mockReturnValue(nativeAddress);
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

  it('should return a map account transaction spec when the Account is not mapped', async () => {
    const originalAccountMock = dsMockUtils.createQueryMock('revive', 'originalAccount', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const transaction = dsMockUtils.createTxMock('revive', 'mapAccount');

    const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);

    const result = await prepareToggleEvmAccountMapping.call(proc, { map: true });

    // the storage must be read at the address the chain derives, not at the Account itself
    expect(originalAccountMock).toHaveBeenCalledWith(derivedEvmAddress);
    expect(result).toEqual({ transaction, resolver: undefined });
  });

  it('should return an unmap account transaction spec when the Account is mapped', async () => {
    dsMockUtils.createQueryMock('revive', 'originalAccount', {
      returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId(nativeAddress)),
    });

    const transaction = dsMockUtils.createTxMock('revive', 'unmapAccount');

    const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);

    const result = await prepareToggleEvmAccountMapping.call(proc, { map: false });

    expect(result).toEqual({ transaction, resolver: undefined });
  });

  it('should throw an error if the Account is already mapped', () => {
    dsMockUtils.createQueryMock('revive', 'originalAccount', {
      returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockAccountId(nativeAddress)),
    });

    const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);

    return expect(prepareToggleEvmAccountMapping.call(proc, { map: true })).rejects.toThrow(
      'The signing Account is already mapped to its Ethereum address'
    );
  });

  it('should throw an error if the Account is not mapped', () => {
    dsMockUtils.createQueryMock('revive', 'originalAccount', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);

    return expect(prepareToggleEvmAccountMapping.call(proc, { map: false })).rejects.toThrow(
      'The signing Account is not mapped to its Ethereum address'
    );
  });

  it('should throw an error if the signing Account is Ethereum-derived', async () => {
    mockContext.getSigningAddress.mockReturnValue(ethDerivedAddress);

    const originalAccountMock = dsMockUtils.createQueryMock('revive', 'originalAccount', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);

    await expect(prepareToggleEvmAccountMapping.call(proc, { map: true })).rejects.toThrow(
      'An Ethereum-derived Account cannot be mapped'
    );

    // rejected before reaching the chain, since no mapping can exist for such an Account
    expect(originalAccountMock).not.toHaveBeenCalled();
  });

  describe('getAuthorization', () => {
    it('should return no required permissions, since the chain does not check them', () => {
      const proc = procedureMockUtils.getInstance<ToggleEvmAccountMappingParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc()).toEqual({
        permissions: {
          transactions: [],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
