import { Balance } from '@polkadot/types/interfaces';
import {
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshPrimitivesPosRatio,
} from '@polkadot/types/lookup';
import {
  BatchTransactionSpec,
  ProcedureAuthorization,
  TransactionSpec,
} from '@polymeshassociation/polymesh-sdk/types/internal';
import * as utilsConversionModule from '@polymeshassociation/polymesh-sdk/utils/conversion';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialProcedure } from '~/internal';
import {
  dsMockUtils,
  entityMockUtils,
  polymeshTransactionMockUtils,
  procedureMockUtils,
} from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { Role, RoleType, TxTag, TxTags } from '~/types';
import * as internalUtilsModule from '~/utils/internal';

jest.mock(
  '@polymeshassociation/polymesh-sdk/base/PolymeshTransaction',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionModule(
    '@polymeshassociation/polymesh-sdk/base/PolymeshTransaction'
  )
);
jest.mock(
  '@polymeshassociation/polymesh-sdk/base/PolymeshTransactionBatch',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionBatchModule(
    '@polymeshassociation/polymesh-sdk/base/PolymeshTransactionBatch'
  )
);

jest.mock(
  '@polymeshassociation/polymesh-sdk/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '@polymeshassociation/polymesh-sdk/api/entities/TickerReservation'
  )
);

describe('Procedure class', () => {
  let context: MockContext;
  let checkPermissionsSpy: jest.SpyInstance;
  let checkRolesSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    polymeshTransactionMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    checkPermissionsSpy = jest.spyOn(internalUtilsModule, 'checkConfidentialPermissions');
    checkRolesSpy = jest.spyOn(internalUtilsModule, 'checkConfidentialRoles');
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polymeshTransactionMockUtils.mockReset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: checkAuthorization', () => {
    it('should return whether the current user has sufficient authorization to run the procedure', async () => {
      const prepareFunc = jest.fn();
      const authFunc = jest.fn();
      const authorization: ProcedureAuthorization = {
        roles: true,
        permissions: true,
      };
      authFunc.mockResolvedValue(authorization);
      let procedure = new ConfidentialProcedure(prepareFunc, authFunc);

      const args = 'args';

      let result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });

      context = dsMockUtils.getContextInstance({
        checkPermissions: {
          result: false,
          missingPermissions: {
            assets: null,
            portfolios: null,
            transactions: null,
          },
        },
      });
      authFunc.mockResolvedValue({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
        },
      });

      entityMockUtils.configureMocks({
        tickerReservationOptions: {
          details: {
            owner: null,
          },
        },
      });
      checkPermissionsSpy.mockResolvedValue({
        result: false,
        missingPermissions: { assets: null, portfolios: null, transactions: null },
      });
      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: {
          result: false,
          missingPermissions: {
            assets: null,
            portfolios: null,
            transactions: null,
          },
        },
        roles: { result: false, missingRoles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }] },
        accountFrozen: false,
        noIdentity: false,
      });

      checkRolesSpy.mockResolvedValue({
        result: true,
      });
      checkPermissionsSpy.mockResolvedValue({ result: true });
      context = dsMockUtils.getContextInstance({ hasAssetPermissions: true });
      authFunc.mockResolvedValue({
        roles: [{ type: RoleType.TickerOwner, ticker: 'TICKER' }],
        permissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
          transactions: [TxTags.asset.Redeem],
        },
      });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });

      authFunc.mockResolvedValue({
        roles: [{ type: RoleType.TickerOwner, ticker: 'TICKER' }],
        permissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
          transactions: [TxTags.asset.Redeem],
        },
        agentPermissions: 'Some Message',
        signerPermissions: 'Another Message',
      });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: {
          result: false,
          message: 'Some Message',
        },
        signerPermissions: { result: false, message: 'Another Message' },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });

      authFunc.mockResolvedValue({
        roles: [{ type: RoleType.TickerOwner, ticker: 'TICKER' }],
        signerPermissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
          transactions: [TxTags.asset.Redeem],
        },
        agentPermissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
          transactions: [TxTags.asset.Redeem],
        },
      });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });

      authFunc.mockResolvedValue({
        roles: [{ type: RoleType.TickerOwner, ticker: 'TICKER' }],
        permissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
        },
      });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });

      context = dsMockUtils.getContextInstance();
      context.getSigningAccount.mockReturnValue(
        entityMockUtils.getAccountInstance({
          getIdentity: null,
          isFrozen: false,
        })
      );

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: false, missingRoles: [{ type: RoleType.TickerOwner, ticker: 'TICKER' }] },
        accountFrozen: false,
        noIdentity: true,
      });

      procedure = new ConfidentialProcedure(prepareFunc, { permissions: true, roles: true });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: true },
        accountFrozen: false,
        noIdentity: false,
      });
    });

    it('should throw an error if the Procedure requires permissions over more than one Asset', () => {
      const prepareFunc = jest.fn();
      const authFunc = jest.fn();
      authFunc.mockResolvedValue({
        permissions: {
          assets: [
            entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' }),
            entityMockUtils.getFungibleAssetInstance({ ticker: 'OTHER_TICKER' }),
          ],
          transactions: [TxTags.asset.Freeze],
        },
      });
      const procedure = new ConfidentialProcedure(prepareFunc, authFunc);

      const args = 'args';

      return expect(procedure.checkAuthorization(args, context)).rejects.toThrow(
        'Procedures cannot require permissions for more than one Asset. Please contact the Polymesh team'
      );
    });
  });

  describe('method: prepare', () => {
    let posRatioToBigNumberSpy: jest.SpyInstance<BigNumber, [PolymeshPrimitivesPosRatio]>;
    let balanceToBigNumberSpy: jest.SpyInstance<BigNumber, [Balance]>;
    let txTagToProtocolOpSpy: jest.SpyInstance;
    let txTags: TxTag[];
    let fees: BigNumber[];
    let rawCoefficient: PolymeshPrimitivesPosRatio;
    let rawFees: Balance[];
    let numerator: BigNumber;
    let denominator: BigNumber;
    let coefficient: BigNumber;

    beforeAll(() => {
      posRatioToBigNumberSpy = jest.spyOn(utilsConversionModule, 'posRatioToBigNumber');
      balanceToBigNumberSpy = jest.spyOn(utilsConversionModule, 'balanceToBigNumber');
      txTagToProtocolOpSpy = jest.spyOn(utilsConversionModule, 'txTagToProtocolOp');
      txTags = [TxTags.asset.RegisterTicker, TxTags.identity.CddRegisterDid];
      fees = [new BigNumber(250), new BigNumber(0)];
      numerator = new BigNumber(7);
      denominator = new BigNumber(3);
      rawCoefficient = dsMockUtils.createMockPosRatio(numerator, denominator);
      rawFees = fees.map(dsMockUtils.createMockBalance);
      coefficient = new BigNumber(numerator).dividedBy(new BigNumber(denominator));
    });

    beforeEach(() => {
      dsMockUtils.createQueryMock('protocolFee', 'coefficient', {
        returnValue: rawCoefficient,
      });
      when(dsMockUtils.createQueryMock('protocolFee', 'baseFees'))
        .calledWith('AssetRegisterTicker')
        .mockResolvedValue(rawFees[0]);
      when(dsMockUtils.createQueryMock('protocolFee', 'baseFees'))
        .calledWith('IdentityRegisterDid')
        .mockResolvedValue(rawFees[1]);

      when(posRatioToBigNumberSpy).calledWith(rawCoefficient).mockReturnValue(coefficient);
      txTags.forEach(txTag =>
        when(txTagToProtocolOpSpy)
          .calledWith(txTag, context)
          .mockReturnValue(txTag as unknown as PolymeshCommonUtilitiesProtocolFeeProtocolOp)
      );

      rawFees.forEach((rawFee, index) =>
        when(balanceToBigNumberSpy).calledWith(rawFee).mockReturnValue(new BigNumber(fees[index]))
      );
    });

    it('should prepare and return a transaction spec with the corresponding transactions, arguments, fees and return value', async () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };
      const tx1 = dsMockUtils.createTxMock('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxMock('identity', 'cddRegisterDid');

      const returnValue = 'good';

      const func1 = async function (
        this: ConfidentialProcedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<BatchTransactionSpec<string, [[string], [string[]]]>> {
        return {
          transactions: [
            { transaction: tx1, args: [args.ticker] },
            { transaction: tx2, args: [args.secondaryAccounts] },
          ],
          resolver: returnValue,
        };
      };

      const proc1 = new ConfidentialProcedure(func1);

      const transaction = await proc1.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce: new BigNumber(15),
      });

      const batchConstructorMock =
        polymeshTransactionMockUtils.getTransactionBatchConstructorMock();

      expect(transaction).toMatchObject({
        transactions: [
          { transaction: tx1, args: [ticker] },
          { transaction: tx2, args: [secondaryAccounts] },
        ],
      });

      expect(batchConstructorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          transactions: expect.objectContaining([
            expect.objectContaining({ transaction: tx1, args: [ticker] }),
            expect.objectContaining({ transaction: tx2, args: [secondaryAccounts] }),
          ]),
        }),
        { ...context, signingAddress: 'something', nonce: new BigNumber(15) }
      );
      expect(context.setSigningAddress).toHaveBeenCalledWith('something');
      expect(context.setNonce).toHaveBeenCalledWith(new BigNumber(15));

      const func2 = async function (
        this: ConfidentialProcedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<TransactionSpec<string, [string]>> {
        return {
          transaction: tx1,
          args: [args.ticker],
          resolver: returnValue,
        };
      };

      const proc2 = new ConfidentialProcedure(func2);

      const transaction2 = await proc2.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
      });

      const constructorMock = polymeshTransactionMockUtils.getTransactionConstructorMock();

      expect(transaction2).toMatchObject({
        transaction: tx1,
        args: [ticker],
      });
      expect(constructorMock).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: tx1, args: [ticker] }),
        {
          ...context,
          signingAddress: 'something',
          nonce: new BigNumber(-1),
        }
      );
      expect(context.setSigningAddress).toHaveBeenCalledWith('something');

      const func3 = async function (
        this: ConfidentialProcedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<BatchTransactionSpec<string, [[string]]>> {
        return {
          transactions: [{ transaction: tx1, args: [args.ticker] }],
          resolver: returnValue,
        };
      };

      const proc3 = new ConfidentialProcedure(func3);

      const transaction3 = await proc3.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce: () => new BigNumber(10),
      });

      expect(transaction3).toMatchObject({
        transaction: tx1,
        args: [ticker],
      });
      expect(constructorMock).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: tx1, args: [ticker] }),
        {
          ...context,
          signingAddress: 'something',
          nonce: new BigNumber(10),
        }
      );
      expect(context.setSigningAddress).toHaveBeenCalledWith('something');
      expect(context.setNonce).toHaveBeenCalledWith(new BigNumber(10));

      constructorMock.mockReset();

      const nonce = (): Promise<BigNumber> => Promise.resolve(new BigNumber(15));

      await proc3.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce,
      });

      expect(constructorMock).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: tx1, args: [ticker] }),
        {
          ...context,
          signingAddress: 'something',
          nonce: new BigNumber(15),
        }
      );

      expect(context.setNonce).toHaveBeenCalledWith(new BigNumber(15));

      constructorMock.mockReset();

      await proc3.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce: Promise.resolve(new BigNumber(12)),
      });

      expect(constructorMock).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: tx1, args: [ticker] }),
        {
          ...context,
          signingAddress: 'something',
          nonce: new BigNumber(12),
        }
      );

      expect(context.setNonce).toHaveBeenCalledWith(new BigNumber(12));
    });

    it('should throw any errors encountered during preparation', () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };

      const errorMsg = 'failed';
      const func = async function (
        this: ConfidentialProcedure<typeof procArgs, string>
      ): Promise<TransactionSpec<string, [unknown]>> {
        throw new Error(errorMsg);
      };

      const proc = new ConfidentialProcedure(func);

      return expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(errorMsg);
    });

    it("should throw an error if the caller doesn't have the appropriate roles", async () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };
      const func = async function (
        this: ConfidentialProcedure<typeof procArgs, string>
      ): Promise<TransactionSpec<string, [string]>> {
        return {
          transaction: dsMockUtils.createTxMock('asset', 'registerTicker'),
          args: [ticker],
          resolver: 'success',
        };
      };

      let proc = new ConfidentialProcedure(func, {
        roles: [{ type: 'FakeRole' } as unknown as Role],
      });

      context = dsMockUtils.getContextInstance({
        checkAssetPermissions: {
          result: false,
        },
      });

      checkRolesSpy.mockResolvedValue({
        result: false,
        missingRoles: [{ type: 'FakeRole' } as unknown as Role],
      });
      checkPermissionsSpy.mockResolvedValue({ result: false });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Identity doesn't have the required roles to execute this procedure"
      );

      proc = new ConfidentialProcedure(func, {
        permissions: {
          assets: [],
          transactions: [],
          portfolios: [],
        },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Account doesn't have the required permissions to execute this procedure"
      );

      proc = new ConfidentialProcedure(func, {
        permissions: {
          assets: [entityMockUtils.getFungibleAssetInstance({ ticker: 'SOME_TICKER' })],
          transactions: [TxTags.asset.Freeze],
          portfolios: [],
        },
      });

      context = dsMockUtils.getContextInstance({
        checkAssetPermissions: { result: false, missingPermissions: [TxTags.asset.Freeze] },
      });
      checkPermissionsSpy.mockResolvedValue({ result: true });
      checkRolesSpy.mockResolvedValue({ result: true });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Identity doesn't have the required permissions to execute this procedure"
      );

      context = dsMockUtils.getContextInstance();

      context.getSigningAccount.mockReturnValue(
        entityMockUtils.getAccountInstance({
          getIdentity: null,
        })
      );

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        'This procedure requires the signing Account to have an associated Identity'
      );

      proc = new ConfidentialProcedure(func, {
        permissions: 'Some Failure Message',
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Account doesn't have the required permissions to execute this procedure"
      );

      proc = new ConfidentialProcedure(func, async () => ({
        roles: 'Failed just because',
      }));

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Identity doesn't have the required roles to execute this procedure"
      );

      context = dsMockUtils.getContextInstance({ isFrozen: true });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Account can't execute this procedure because it is frozen"
      );
    });
  });

  describe('method: storage', () => {
    let proc: ConfidentialProcedure<void, undefined, { something: string }>;

    beforeAll(() => {
      proc = new ConfidentialProcedure(async () => ({
        transaction: dsMockUtils.createTxMock('asset', 'registerTicker'),
        resolver: undefined,
        args: ['TICKER'],
      }));
    });

    it('should return the storage', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._storage = { something: 'yeah' };

      expect(proc.storage).toEqual({ something: 'yeah' });
    });

    it("should throw an error if the storage hasn't been set", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._storage = null;

      expect(() => proc.storage).toThrow('Attempt to access storage before it was set');
    });
  });

  describe('method: context', () => {
    let proc: ConfidentialProcedure<void, undefined>;

    beforeAll(() => {
      proc = new ConfidentialProcedure(async () => ({
        transaction: dsMockUtils.createTxMock('asset', 'registerTicker'),
        resolver: undefined,
        args: ['TICKER'],
      }));
    });

    it('should return the context', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = 'context';

      expect(proc.context).toBe('context');
    });

    it("should throw an error if the context hasn't been set", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = null;

      expect(() => proc.context).toThrow('Attempt to access context before it was set');
    });
  });
});
