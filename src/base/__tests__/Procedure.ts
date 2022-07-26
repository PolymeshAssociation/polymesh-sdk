import { Balance } from '@polkadot/types/interfaces';
import BigNumber from 'bignumber.js';
import { PosRatio, ProtocolOp } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, Procedure } from '~/internal';
import {
  dsMockUtils,
  entityMockUtils,
  polymeshTransactionMockUtils,
  procedureMockUtils,
} from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { Role, RoleType, TxTag, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/PolymeshTransaction',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionModule(
    '~/base/PolymeshTransaction'
  )
);
jest.mock(
  '~/base/PolymeshTransactionBatch',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionBatchModule(
    '~/base/PolymeshTransactionBatch'
  )
);

describe('Procedure class', () => {
  let context: MockContext;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    polymeshTransactionMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    polymeshTransactionMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: checkAuthorization', () => {
    it('should return whether the current user has sufficient authorization to run the procedure', async () => {
      const prepareFunc = sinon.stub();
      const authFunc = sinon.stub();
      const authorization: ProcedureAuthorization = {
        roles: true,
        permissions: true,
      };
      authFunc.resolves(authorization);
      let procedure = new Procedure(prepareFunc, authFunc);

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
        checkRoles: {
          result: false,
          missingRoles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        },
        checkPermissions: {
          result: false,
          missingPermissions: {
            assets: null,
            portfolios: null,
            transactions: null,
          },
        },
      });
      authFunc.resolves({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
        },
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

      context = dsMockUtils.getContextInstance({ hasAssetPermissions: true });
      authFunc.resolves({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        permissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
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

      authFunc.resolves({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        permissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
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

      authFunc.resolves({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        signerPermissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
          portfolios: null,
          transactions: [TxTags.asset.Redeem],
        },
        agentPermissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
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

      authFunc.resolves({
        roles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        permissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
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
      context.getSigningAccount.returns(
        entityMockUtils.getAccountInstance({
          getIdentity: null,
          isFrozen: false,
        })
      );

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        agentPermissions: { result: true },
        signerPermissions: { result: true },
        roles: { result: false, missingRoles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }] },
        accountFrozen: false,
        noIdentity: true,
      });

      procedure = new Procedure(prepareFunc, { permissions: true, roles: true });

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
      const prepareFunc = sinon.stub();
      const authFunc = sinon.stub();
      authFunc.resolves({
        permissions: {
          assets: [
            entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' }),
            entityMockUtils.getAssetInstance({ ticker: 'OTHER_TICKER' }),
          ],
          transactions: [TxTags.asset.Freeze],
        },
      });
      const procedure = new Procedure(prepareFunc, authFunc);

      const args = 'args';

      return expect(procedure.checkAuthorization(args, context)).rejects.toThrow(
        'Procedures cannot require permissions for more than one Asset. Please contact the Polymath team'
      );
    });
  });

  describe('method: prepare', () => {
    let posRatioToBigNumberStub: sinon.SinonStub<[PosRatio], BigNumber>;
    let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
    let txTagToProtocolOpStub: sinon.SinonStub<[TxTag, Context], ProtocolOp>;
    let txTags: TxTag[];
    let fees: BigNumber[];
    let rawCoefficient: PosRatio;
    let rawFees: Balance[];
    let numerator: BigNumber;
    let denominator: BigNumber;
    let coefficient: BigNumber;

    beforeAll(() => {
      posRatioToBigNumberStub = sinon.stub(utilsConversionModule, 'posRatioToBigNumber');
      balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
      txTagToProtocolOpStub = sinon.stub(utilsConversionModule, 'txTagToProtocolOp');
      txTags = [TxTags.asset.RegisterTicker, TxTags.identity.CddRegisterDid];
      fees = [new BigNumber(250), new BigNumber(0)];
      numerator = new BigNumber(7);
      denominator = new BigNumber(3);
      rawCoefficient = dsMockUtils.createMockPosRatio(numerator, denominator);
      rawFees = fees.map(dsMockUtils.createMockBalance);
      coefficient = new BigNumber(numerator).dividedBy(new BigNumber(denominator));
    });

    beforeEach(() => {
      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: rawCoefficient,
      });
      dsMockUtils
        .createQueryStub('protocolFee', 'baseFees')
        .withArgs('AssetRegisterTicker')
        .resolves(rawFees[0]);
      dsMockUtils
        .createQueryStub('protocolFee', 'baseFees')
        .withArgs('IdentityRegisterDid')
        .resolves(rawFees[1]);

      posRatioToBigNumberStub.withArgs(rawCoefficient).returns(coefficient);
      txTags.forEach(txTag =>
        txTagToProtocolOpStub.withArgs(txTag, context).returns(txTag as unknown as ProtocolOp)
      );

      rawFees.forEach((rawFee, index) =>
        balanceToBigNumberStub.withArgs(rawFee).returns(new BigNumber(fees[index]))
      );
    });

    it('should prepare and return a transaction spec with the corresponding transactions, arguments, fees and return value', async () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxStub('identity', 'cddRegisterDid');

      const returnValue = 'good';

      const func1 = async function (
        this: Procedure<typeof procArgs, string>,
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

      const proc1 = new Procedure(func1);

      const transaction = await proc1.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce: new BigNumber(15),
      });

      const batchConstructorStub =
        polymeshTransactionMockUtils.getTransactionBatchConstructorStub();

      expect(transaction).toMatchObject({
        transactions: [
          { transaction: tx1, args: [ticker] },
          { transaction: tx2, args: [secondaryAccounts] },
        ],
      });

      sinon.assert.calledWith(
        batchConstructorStub,
        sinon.match({
          transactions: sinon.match([
            sinon.match({ transaction: tx1, args: [ticker] }),
            sinon.match({ transaction: tx2, args: [secondaryAccounts] }),
          ]),
        }),
        { ...context, signingAddress: 'something', nonce: new BigNumber(15) }
      );
      sinon.assert.calledWith(context.setSigningAddress, 'something');
      sinon.assert.calledWith(context.setNonce, new BigNumber(15));

      const func2 = async function (
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<TransactionSpec<string, [string]>> {
        return {
          transaction: tx1,
          args: [args.ticker],
          resolver: returnValue,
        };
      };

      const proc2 = new Procedure(func2);

      const transaction2 = await proc2.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
      });

      const constructorStub = polymeshTransactionMockUtils.getTransactionConstructorStub();

      expect(transaction2).toMatchObject({
        transaction: tx1,
        args: [ticker],
      });
      sinon.assert.calledWith(constructorStub, sinon.match({ transaction: tx1, args: [ticker] }), {
        ...context,
        signingAddress: 'something',
        nonce: new BigNumber(-1),
      });
      sinon.assert.calledWith(context.setSigningAddress, 'something');

      const func3 = async function (
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<BatchTransactionSpec<string, [[string]]>> {
        return {
          transactions: [{ transaction: tx1, args: [args.ticker] }],
          resolver: returnValue,
        };
      };

      const proc3 = new Procedure(func3);

      constructorStub.resetHistory();

      const transaction3 = await proc3.prepare({ args: procArgs }, context, {
        signingAccount: 'something',
        nonce: () => new BigNumber(10),
      });

      expect(transaction3).toMatchObject({
        transaction: tx1,
        args: [ticker],
      });
      sinon.assert.calledWith(constructorStub, sinon.match({ transaction: tx1, args: [ticker] }), {
        ...context,
        signingAddress: 'something',
        nonce: new BigNumber(10),
      });
      sinon.assert.calledWith(context.setSigningAddress, 'something');
      sinon.assert.calledWith(context.setNonce, new BigNumber(10));
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
        this: Procedure<typeof procArgs, string>
      ): Promise<TransactionSpec<string, [unknown]>> {
        throw new Error(errorMsg);
      };

      const proc = new Procedure(func);

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
        this: Procedure<typeof procArgs, string>
      ): Promise<TransactionSpec<string, [string]>> {
        return {
          transaction: dsMockUtils.createTxStub('asset', 'registerTicker'),
          args: [ticker],
          resolver: 'success',
        };
      };

      let proc = new Procedure(func, {
        roles: [{ type: 'FakeRole' } as unknown as Role],
      });

      context = dsMockUtils.getContextInstance({
        isFrozen: false,
        checkRoles: {
          result: false,
          missingRoles: [{ type: 'FakeRole' } as unknown as Role],
        },
        checkPermissions: {
          result: false,
        },
        checkAssetPermissions: {
          result: false,
        },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Identity doesn't have the required roles to execute this procedure"
      );

      proc = new Procedure(func, {
        permissions: {
          assets: [],
          transactions: [],
          portfolios: [],
        },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Account doesn't have the required permissions to execute this procedure"
      );

      proc = new Procedure(func, {
        permissions: {
          assets: [entityMockUtils.getAssetInstance({ ticker: 'SOME_TICKER' })],
          transactions: [TxTags.asset.Freeze],
          portfolios: [],
        },
      });

      context = dsMockUtils.getContextInstance({
        checkAssetPermissions: { result: false, missingPermissions: [TxTags.asset.Freeze] },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Identity doesn't have the required permissions to execute this procedure"
      );

      context = dsMockUtils.getContextInstance();

      context.getSigningAccount.returns(
        entityMockUtils.getAccountInstance({
          getIdentity: null,
        })
      );

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        'This procedure requires the signing Account to have an associated Identity'
      );

      proc = new Procedure(func, {
        permissions: 'Some Failure Message',
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "The signing Account doesn't have the required permissions to execute this procedure"
      );

      proc = new Procedure(func, async () => ({ roles: 'Failed just because' }));

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
    let proc: Procedure<void, undefined, { something: string }>;

    beforeAll(() => {
      proc = new Procedure(async () => ({
        transaction: dsMockUtils.createTxStub('asset', 'registerTicker'),
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
    let proc: Procedure<void, undefined>;

    beforeAll(() => {
      proc = new Procedure(async () => ({
        transaction: dsMockUtils.createTxStub('asset', 'registerTicker'),
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
