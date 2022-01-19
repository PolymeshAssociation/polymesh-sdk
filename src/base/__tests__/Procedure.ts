import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import { PosRatio, ProtocolOp, TxTag, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Context, PolymeshTransaction, PolymeshTransactionBatch, Procedure } from '~/internal';
import {
  dsMockUtils,
  entityMockUtils,
  polymeshTransactionMockUtils,
  procedureMockUtils,
} from '~/testUtils/mocks';
import { MockContext } from '~/testUtils/mocks/dataSources';
import { Role, RoleType } from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/TransactionQueue',
  require('~/testUtils/mocks/procedure').mockTransactionQueueModule('~/base/TransactionQueue')
);
jest.mock(
  '~/base/PolymeshTransaction',
  require('~/testUtils/mocks/polymeshTransaction').mockPolymeshTransactionModule(
    '~/base/PolymeshTransaction'
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: checkAuthorization', () => {
    test('should return whether the current user has sufficient authorization to run the procedure', async () => {
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
      context.getCurrentAccount.returns(
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

    test('should throw an error if the Procedure requires permissions over more than one Asset', () => {
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
    let fees: number[];
    let rawCoefficient: PosRatio;
    let rawFees: Balance[];
    let numerator: number;
    let denominator: number;
    let coefficient: BigNumber;

    beforeAll(() => {
      posRatioToBigNumberStub = sinon.stub(utilsConversionModule, 'posRatioToBigNumber');
      balanceToBigNumberStub = sinon.stub(utilsConversionModule, 'balanceToBigNumber');
      txTagToProtocolOpStub = sinon.stub(utilsConversionModule, 'txTagToProtocolOp');
      txTags = [TxTags.asset.RegisterTicker, TxTags.identity.CddRegisterDid];
      fees = [250, 0];
      numerator = 7;
      denominator = 3;
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
        txTagToProtocolOpStub.withArgs(txTag, context).returns((txTag as unknown) as ProtocolOp)
      );

      rawFees.forEach((rawFee, index) =>
        balanceToBigNumberStub.withArgs(rawFee).returns(new BigNumber(fees[index]))
      );
    });

    test('should prepare and return a transaction queue with the corresponding transactions, arguments, fees and return value', async () => {
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
      ): Promise<string> {
        this.addTransaction(tx1, {}, args.ticker);

        this.addTransaction(tx2, {}, args.secondaryAccounts);

        return returnValue;
      };

      const constructorStub = procedureMockUtils.getTransactionQueueConstructorStub();

      const proc1 = new Procedure(func1);

      let queue = await proc1.prepare({ args: procArgs }, context, { signer: 'something' });

      expect(queue).toMatchObject({
        transactions: [
          { tx: tx1, args: [ticker] },
          { tx: tx2, args: [secondaryAccounts] },
        ],
      });
      sinon.assert.calledWith(
        constructorStub,
        sinon.match({
          transactions: sinon.match([
            sinon.match({ tx: tx1, args: [ticker] }),
            sinon.match({ tx: tx2, args: [secondaryAccounts] }),
          ]),
        }),
        { ...context, currentPair: { address: 'something' } }
      );

      const func2 = async function (
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<MaybePostTransactionValue<string>> {
        return this.addProcedure(proc1, args);
      };

      dsMockUtils.reset();

      const proc2 = new Procedure(func2);

      context = dsMockUtils.getContextInstance();

      queue = await proc2.prepare({ args: procArgs }, context);
      expect(queue).toMatchObject({
        transactions: [
          { tx: tx1, args: [ticker] },
          { tx: tx2, args: [secondaryAccounts] },
        ],
        procedureResult: returnValue,
      });
      sinon.assert.calledWith(
        constructorStub,
        sinon.match({
          transactions: sinon.match([
            sinon.match({ tx: tx1, args: [ticker] }),
            sinon.match({ tx: tx2, args: [secondaryAccounts] }),
          ]),
          procedureResult: returnValue,
        }),
        context
      );
    });

    test('should throw any errors encountered during preparation', () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };

      const errorMsg = 'failed';
      const func = async function (this: Procedure<typeof procArgs, string>): Promise<string> {
        throw new Error(errorMsg);
      };

      const proc = new Procedure(func);

      return expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(errorMsg);
    });

    test("should throw an error if the caller doesn't have the appropriate roles", async () => {
      const ticker = 'MY_ASSET';
      const secondaryAccounts = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryAccounts,
      };
      const func = async function (this: Procedure<typeof procArgs, string>): Promise<string> {
        return 'success';
      };

      let proc = new Procedure(func, {
        roles: [({ type: 'FakeRole' } as unknown) as Role],
      });

      context = dsMockUtils.getContextInstance({
        isFrozen: false,
        checkRoles: {
          result: false,
          missingRoles: [({ type: 'FakeRole' } as unknown) as Role],
        },
        checkPermissions: {
          result: false,
        },
        checkAssetPermissions: {
          result: false,
        },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "Current Identity doesn't have the required roles to execute this procedure"
      );

      proc = new Procedure(func, {
        permissions: {
          assets: [],
          transactions: [],
          portfolios: [],
        },
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "Current Account doesn't have the required permissions to execute this procedure"
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
        "Current Identity doesn't have the required permissions to execute this procedure"
      );

      context = dsMockUtils.getContextInstance();

      context.getCurrentAccount.returns(
        entityMockUtils.getAccountInstance({
          getIdentity: null,
        })
      );

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        'This procedure requires the Current Account to have an associated Identity'
      );

      proc = new Procedure(func, {
        permissions: 'Some Failure Message',
      });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "Current Account doesn't have the required permissions to execute this procedure"
      );

      proc = new Procedure(func, async () => ({ roles: 'Failed just because' }));

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "Current Identity doesn't have the required roles to execute this procedure"
      );

      context = dsMockUtils.getContextInstance({ isFrozen: true });

      await expect(proc.prepare({ args: procArgs }, context)).rejects.toThrow(
        "Current Account can't execute this procedure because it is frozen"
      );
    });
  });

  describe('method: addTransaction', () => {
    test('should return an array of post transaction values corresponding to the resolver functions passed to it', async () => {
      const ticker = 'MY_ASSET';
      const resolvedNum = 1;
      const resolvedStr = 'something';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = context;

      const values = proc.addTransaction(
        tx,
        {
          resolvers: tuple(
            async (): Promise<number> => resolvedNum,
            async (): Promise<string> => resolvedStr
          ),
        },
        ticker
      );

      await Promise.all(values.map(value => value.run({} as ISubmittableResult)));
      const [num, str] = values;

      expect(num.value).toBe(resolvedNum);
      expect(str.value).toBe(resolvedStr);
    });
  });

  describe('method: addBatchTransaction', () => {
    test('should return an array of post transaction values corresponding to the resolver functions passed to it', async () => {
      const ticker = 'MY_ASSET';
      const resolvedNum = 1;
      const resolvedStr = 'something';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = context;

      const values = proc.addBatchTransaction(
        tx,
        {
          resolvers: tuple(
            async (): Promise<number> => resolvedNum,
            async (): Promise<string> => resolvedStr
          ),
        },
        [[ticker]]
      );

      await Promise.all(values.map(value => value.run({} as ISubmittableResult)));
      const [num, str] = values;

      expect(num.value).toBe(resolvedNum);
      expect(str.value).toBe(resolvedStr);
    });

    test('should add a non-batch transaction to the queue if only one set of arguments is passed', async () => {
      const ticker = 'MY_ASSET';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = context;

      proc.addBatchTransaction(tx, {}, [[ticker]]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (proc as any).transactions;
      expect(transactions[0] instanceof PolymeshTransaction).toBe(true);
      expect(transactions.length).toBe(1);
    });

    test('should separate large argument lists into multiple batches', async () => {
      const ticker = 'MY_ASSET';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = context;

      let i = 0;

      proc.addBatchTransaction(
        tx,
        {
          fee: new BigNumber(100),
          groupByFn: () => `${i++}`,
        },
        [...range(22).map(() => [ticker])]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (proc as any).transactions;

      expect(transactions.length).toBe(2);
      expect(transactions[0] instanceof PolymeshTransactionBatch).toBe(true);
      expect(transactions[1] instanceof PolymeshTransactionBatch).toBe(true);
    });
  });

  describe('method: addProcedure', () => {
    test('should return the return value of the passed procedure', async () => {
      const returnValue = 1;

      const proc1 = new Procedure(async () => returnValue);
      const proc2 = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc2 as any)._context = context;
      const result = await proc2.addProcedure(proc1);

      expect(result).toBe(returnValue);
    });

    test('should throw any validation errors encountered while preparing the passed procedure', () => {
      const errorMsg = 'Procedure Error';

      const proc1 = new Procedure(async () => {
        throw new Error(errorMsg);
      });
      const proc2 = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc2 as any)._context = context;
      const result = proc2.addProcedure(proc1);

      return expect(result).rejects.toThrow(errorMsg);
    });
  });

  describe('method: storage', () => {
    let proc: Procedure<void, undefined, { something: string }>;

    beforeAll(() => {
      proc = new Procedure(async () => undefined);
    });

    test('should return the storage', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._storage = { something: 'yeah' };

      expect(proc.storage).toEqual({ something: 'yeah' });
    });

    test("should throw an error if the storage hasnt't been set", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._storage = null;

      expect(() => proc.storage).toThrow('Attempt to access storage before it was set');
    });
  });

  describe('method: context', () => {
    let proc: Procedure<void, undefined>;

    beforeAll(() => {
      proc = new Procedure(async () => undefined);
    });

    test('should return the context', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = 'context';

      expect(proc.context).toBe('context');
    });

    test("should throw an error if the context hasnt't been set", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proc as any)._context = null;

      expect(() => proc.context).toThrow('Attempt to access context before it was set');
    });
  });
});
