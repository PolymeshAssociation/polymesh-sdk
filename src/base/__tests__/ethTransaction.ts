import { SubmittableExtrinsic } from '@polkadot/api/types';
import { GenericExtrinsic } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { keccakAsHex } from '@polkadot/util-crypto';
import BigNumber from 'bignumber.js';

import {
  buildDetachedEthTransactionRequest,
  buildEthTransactionRequest,
  buildSdkBroadcastSubmission,
  buildWalletBroadcastSubmission,
  calculateEthGasFee,
  dryRunEthTransaction,
  ethTransactKeccakMatcher,
  getEthSubmissionMode,
  getNativeToEthRatio,
} from '~/base/ethTransaction';
import { EthSigner } from '~/base/types';
import { Context } from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { ErrorCode } from '~/types';

describe('ethTransaction', () => {
  /**
   * SS58 (format 42) encoding of `<ALITH_H160> ++ [0xEE; 12]`, i.e. the Polymesh Account the
   *   `revive` pallet dispatches as for Alith's key
   */
  const ethSs58Address = '5HYRCKHYJN9z5xUtfFkyMj4JUhsAwWyvuU8vKB1FcnYTf9ZQ';
  const alithH160 = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac';
  const sentinelAddress = '0x6d6f646c70792f70616464720000000000000000';
  const calldata = '0x0719';
  const chainId = new BigNumber(1641818);

  let context: MockContext;

  /**
   * A composed transaction whose SCALE-encoded call becomes the `data` field
   */
  const composedTx = {
    method: { toHex: (): string => calldata },
  } as unknown as SubmittableExtrinsic<'promise', ISubmittableResult>;

  const buildEthSigner = (
    capabilities: Partial<EthSigner['capabilities']> = {},
    overrides: Partial<EthSigner> = {}
  ): EthSigner =>
    ({
      capabilities: {
        signTransaction: true,
        sendTransaction: false,
        eip1559: true,
        ...capabilities,
      },
      signTransaction: jest.fn().mockResolvedValue('0xrawsigned'),
      sendTransaction: jest.fn().mockResolvedValue('0xethtxhash'),
      ...overrides,
    } as unknown as EthSigner);

  /**
   * Mock the `reviveApi` runtime calls the eth path depends on
   */
  const mockReviveApi = ({
    ethGas = 1842,
    gasPrice = 100000000000000,
    nonce = 0,
    dryRunError,
  }: {
    ethGas?: number;
    gasPrice?: number;
    nonce?: number;
    dryRunError?: unknown;
  } = {}): void => {
    dsMockUtils.createCallMock('reviveApi', 'gasPrice', {
      returnValue: { toString: () => `${gasPrice}` },
    });
    dsMockUtils.createCallMock('reviveApi', 'nonce', {
      returnValue: { toString: () => `${nonce}` },
    });
    dsMockUtils.createCallMock('reviveApi', 'ethTransactWithConfig', {
      returnValue: dryRunError
        ? { isErr: true, asErr: dryRunError }
        : { isErr: false, asOk: { ethGas: { toString: () => `${ethGas}` } } },
    });
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance({
      getEthRuntimePalletsAddress: sentinelAddress,
      getEthChainId: chainId,
    });
    context.ss58Format = new BigNumber(42);
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('getEthSubmissionMode', () => {
    it('should prefer SDK broadcast when the signer can return raw signed bytes', () => {
      const signer = buildEthSigner({ signTransaction: true, sendTransaction: true });

      expect(getEthSubmissionMode(signer)).toBe('sdkBroadcast');
    });

    it('should fall back to wallet broadcast when the signer can only broadcast', () => {
      const signer = buildEthSigner({ signTransaction: false, sendTransaction: true });

      expect(getEthSubmissionMode(signer)).toBe('walletBroadcast');
    });

    it('should throw if the signer advertises neither capability', () => {
      const signer = buildEthSigner({ signTransaction: false, sendTransaction: false });

      expect(() => getEthSubmissionMode(signer)).toThrow(
        'does not support signing or sending transactions'
      );
    });
  });

  describe('dryRunEthTransaction', () => {
    it('should return the gas, price and chain data needed to build the transaction', async () => {
      mockReviveApi({ ethGas: 1842, gasPrice: 100000000000000 });

      const result = await dryRunEthTransaction(
        context as unknown as Context,
        ethSs58Address,
        composedTx
      );

      expect(result.from.toLowerCase()).toBe(alithH160.toLowerCase());
      expect(result.to).toBe(sentinelAddress);
      expect(result.calldata).toBe(calldata);
      expect(result.rawEthGas).toEqual(new BigNumber(1842));
      expect(result.gasPrice).toEqual(new BigNumber(100000000000000));
      expect(result.chainId).toEqual(chainId);
    });

    it('should throw the parsed error when the dry run fails, before the wallet is consulted', async () => {
      const dispatchFailure =
        'Failed to dispatch call: Module(ModuleError { index: 7, error: [0, 0, 0, 0], message: Some("AlreadyLinked") })';

      dsMockUtils.getApiInstance().registry.findMetaError = jest.fn().mockReturnValue({
        section: 'identity',
        name: 'AlreadyLinked',
        docs: ['One secondary or primary key can only belong to one DID'],
      });

      mockReviveApi({
        dryRunError: {
          isData: false,
          asMessage: { toString: () => dispatchFailure },
        },
      });

      let error;
      try {
        await dryRunEthTransaction(context as unknown as Context, ethSs58Address, composedTx);
      } catch (err) {
        error = err;
      }

      expect(error.code).toBe(ErrorCode.TransactionReverted);
      expect(error.message).toBe(
        'identity.AlreadyLinked: One secondary or primary key can only belong to one DID'
      );
    });
  });

  describe('buildEthTransactionRequest', () => {
    it('should build an EIP-1559 request, resolving the nonce on chain when the SDK broadcasts', async () => {
      mockReviveApi({ ethGas: 1842, gasPrice: 100000000000000, nonce: 7 });

      const { request, rawEthGas, gasPrice } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner(),
      });

      expect(request.to).toBe(sentinelAddress);
      expect(request.data).toBe(calldata);
      expect(request.value).toBe('0x0');
      expect(request.gas).toBe('0x732');
      expect(request.chainId).toBe('0x190d5a');
      expect(request.nonce).toBe('0x7');
      expect(request.type).toBe(2);
      expect(request.maxFeePerGas).toBe('0x5af3107a4000');
      expect(request.maxPriorityFeePerGas).toBe('0x0');
      expect(request.gasPrice).toBeUndefined();
      expect(rawEthGas).toEqual(new BigNumber(1842));
      expect(gasPrice).toEqual(new BigNumber(100000000000000));
    });

    it('should build a legacy (type 0) request when the signer does not support EIP-1559', async () => {
      mockReviveApi();

      const { request } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner({ eip1559: false }),
      });

      expect(request.type).toBe(0);
      expect(request.gasPrice).toBe('0x5af3107a4000');
      expect(request.maxFeePerGas).toBeUndefined();
      expect(request.maxPriorityFeePerGas).toBeUndefined();
    });

    it('should use an explicitly passed nonce when the SDK broadcasts', async () => {
      mockReviveApi({ nonce: 7 });

      const { request } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner(),
        nonce: new BigNumber(42),
      });

      expect(request.nonce).toBe('0x2a');
    });

    it('should omit the nonce when the wallet broadcasts, leaving it to the wallet', async () => {
      mockReviveApi();

      const { request } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner({ signTransaction: false, sendTransaction: true }),
      });

      expect(request.nonce).toBeUndefined();
    });

    it('should throw a ValidationError if a nonce is passed while the wallet owns it', async () => {
      mockReviveApi();

      let error;
      try {
        await buildEthTransactionRequest({
          context: context as unknown as Context,
          signingAddress: ethSs58Address,
          composedTx,
          ethSigner: buildEthSigner({ signTransaction: false, sendTransaction: true }),
          nonce: new BigNumber(1),
        });
      } catch (err) {
        error = err;
      }

      expect(error.code).toBe(ErrorCode.ValidationError);
      expect(error.message).toContain('nonce cannot be set explicitly');
    });

    it('should apply a gas multiplier, rounding up', async () => {
      mockReviveApi({ ethGas: 1000 });

      const { request, rawEthGas } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner(),
        gasMultiplier: new BigNumber(1.5),
      });

      expect(request.gas).toBe('0x5dc');
      // the fee estimate is based on the un-multiplied gas, since headroom is not part of the fee
      expect(rawEthGas).toEqual(new BigNumber(1000));
    });

    it('should never reduce the gas below the dry run estimate', async () => {
      mockReviveApi({ ethGas: 1000 });

      const { request } = await buildEthTransactionRequest({
        context: context as unknown as Context,
        signingAddress: ethSs58Address,
        composedTx,
        ethSigner: buildEthSigner(),
        gasMultiplier: new BigNumber(0.5),
      });

      expect(request.gas).toBe('0x3e8');
    });
  });

  describe('buildDetachedEthTransactionRequest', () => {
    it('should always resolve a nonce, since a detached signer cannot own it', async () => {
      mockReviveApi({ nonce: 3, ethGas: 1842 });

      const request = await buildDetachedEthTransactionRequest(
        context as unknown as Context,
        ethSs58Address,
        composedTx,
        true
      );

      expect(request.nonce).toBe('0x3');
      expect(request.gas).toBe('0x732');
      expect(request.type).toBe(2);
    });

    it('should honour an explicitly passed nonce, and emit a legacy transaction when asked', async () => {
      mockReviveApi({ nonce: 3 });

      const request = await buildDetachedEthTransactionRequest(
        context as unknown as Context,
        ethSs58Address,
        composedTx,
        false,
        new BigNumber(9)
      );

      expect(request.nonce).toBe('0x9');
      expect(request.type).toBe(0);
      expect(request.gasPrice).toBe('0x5af3107a4000');
    });
  });

  describe('calculateEthGasFee', () => {
    it('should derive the fee as ethGas * gasPrice / nativeToEthRatio, as a display POLYX value', () => {
      /*
       * 1,339 gas at 10^14 wei over a 10^12 ratio is 133,900 base units,
       *   which is 0.1339 POLYX. The result must be a display value, since it is summed with
       *   protocol fees and compared against Account balances, both of which are display values
       */
      const result = calculateEthGasFee(
        new BigNumber(1339),
        new BigNumber(100000000000000),
        new BigNumber(1000000000000)
      );

      expect(result).toEqual(new BigNumber(0.1339));
    });

    it('should round up to a whole base unit, so the estimate is never short', () => {
      // 3/2 base units rounds up to 2 base units, i.e. 0.000002 POLYX
      const result = calculateEthGasFee(new BigNumber(1), new BigNumber(3), new BigNumber(2));

      expect(result).toEqual(new BigNumber(0.000002));
    });
  });

  describe('getNativeToEthRatio', () => {
    it('should read the ratio from chain constants', () => {
      dsMockUtils.setConstMock('revive', 'nativeToEthRatio', {
        returnValue: dsMockUtils.createMockU64(new BigNumber(1000000000000)),
      });

      expect(getNativeToEthRatio(context as unknown as Context)).toEqual(
        new BigNumber(1000000000000)
      );
    });
  });

  describe('ethTransactKeccakMatcher', () => {
    const payloadBytes = new Uint8Array([1, 2, 3, 4]);
    const ethTxHash = keccakAsHex(payloadBytes);

    const buildExtrinsic = (section: string, method: string, args: unknown[]): GenericExtrinsic =>
      ({ method: { section, method }, args } as unknown as GenericExtrinsic);

    it('should match the revive.ethTransact extrinsic carrying the payload', () => {
      const matcher = ethTransactKeccakMatcher(ethTxHash);

      expect(
        matcher(
          buildExtrinsic('revive', 'ethTransact', [{ toU8a: (): Uint8Array => payloadBytes }])
        )
      ).toBe(true);
    });

    it('should be case insensitive about the hash', () => {
      const matcher = ethTransactKeccakMatcher(ethTxHash.toUpperCase());

      expect(
        matcher(
          buildExtrinsic('revive', 'ethTransact', [{ toU8a: (): Uint8Array => payloadBytes }])
        )
      ).toBe(true);
    });

    it('should not match an extrinsic from another pallet or call', () => {
      const matcher = ethTransactKeccakMatcher(ethTxHash);

      expect(
        matcher(buildExtrinsic('balances', 'transfer', [{ toU8a: (): Uint8Array => payloadBytes }]))
      ).toBe(false);
      expect(
        matcher(
          buildExtrinsic('revive', 'ethSubstrateCall', [{ toU8a: (): Uint8Array => payloadBytes }])
        )
      ).toBe(false);
    });

    it('should not match a revive.ethTransact carrying a different payload', () => {
      const matcher = ethTransactKeccakMatcher(ethTxHash);

      expect(
        matcher(
          buildExtrinsic('revive', 'ethTransact', [
            { toU8a: (): Uint8Array => new Uint8Array([9, 9, 9]) },
          ])
        )
      ).toBe(false);
    });

    it('should not match an extrinsic with no payload argument', () => {
      const matcher = ethTransactKeccakMatcher(ethTxHash);

      expect(matcher(buildExtrinsic('revive', 'ethTransact', []))).toBe(false);
    });
  });

  describe('buildSdkBroadcastSubmission', () => {
    it('should submit the raw signed bytes as a bare revive.ethTransact extrinsic', async () => {
      const send = jest.fn().mockResolvedValue(jest.fn());
      const hash = dsMockUtils.createMockHash('0xextrinsichash');
      const ethTransactMock = dsMockUtils.createTxMock('revive', 'ethTransact');
      ethTransactMock.mockReturnValue({ send, hash });

      const { subscription } = buildSdkBroadcastSubmission(
        context as unknown as Context,
        '0xrawsigned' as HexString
      );

      const callback = jest.fn();
      await subscription.subscribe(callback);

      expect(ethTransactMock).toHaveBeenCalledWith('0xrawsigned');
      expect(send).toHaveBeenCalledWith(callback);
      expect(subscription.getTxHash()).toBe(hash.toString());
    });

    it('should expose a polling submission that matches on the extrinsic hash', async () => {
      const hash = dsMockUtils.createMockHash('0xextrinsichash');
      const send = jest.fn().mockResolvedValue(hash);
      const ethTransactMock = dsMockUtils.createTxMock('revive', 'ethTransact');
      ethTransactMock.mockReturnValue({ send, hash });

      const { polling } = buildSdkBroadcastSubmission(
        context as unknown as Context,
        '0xrawsigned' as HexString
      );

      const { txHash, matcher } = await polling.send();

      expect(txHash).toBe(hash.toString());
      expect(matcher({ hash } as unknown as GenericExtrinsic)).toBe(true);
    });
  });

  describe('buildWalletBroadcastSubmission', () => {
    it('should broadcast through the wallet and match on the returned eth tx hash', async () => {
      const payloadBytes = new Uint8Array([1, 2, 3, 4]);
      const ethTxHash = keccakAsHex(payloadBytes);
      const sendTransaction = jest.fn().mockResolvedValue(ethTxHash);
      const ethSigner = buildEthSigner(
        { signTransaction: false, sendTransaction: true },
        { sendTransaction }
      );
      const request = { from: alithH160 } as never;

      const { txHash, matcher } = await buildWalletBroadcastSubmission(ethSigner, request).send();

      expect(sendTransaction).toHaveBeenCalledWith(request);
      expect(txHash).toBe(ethTxHash);
      expect(
        matcher({
          method: { section: 'revive', method: 'ethTransact' },
          args: [{ toU8a: (): Uint8Array => payloadBytes }],
        } as unknown as GenericExtrinsic)
      ).toBe(true);
    });

    it('should throw if the signer advertised sendTransaction but does not implement it', async () => {
      const ethSigner = {
        capabilities: { signTransaction: false, sendTransaction: true, eip1559: true },
      } as unknown as EthSigner;

      let error;
      try {
        await buildWalletBroadcastSubmission(ethSigner, {} as never).send();
      } catch (err) {
        error = err;
      }

      expect(error.code).toBe(ErrorCode.General);
      expect(error.message).toContain('does not implement sendTransaction');
    });
  });
});
