import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import { range } from 'lodash';
import { PosRatio, ProtocolOp, TxTag, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import * as baseModule from '~/internal';
import { dsMockUtils } from '~/testUtils/mocks';
import { KeyringPair, Role, RoleType } from '~/types';
import { MaybePostTransactionValue, ProcedureAuthorization } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

const { Procedure } = baseModule;

describe('Procedure class', () => {
  let context: baseModule.Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('method: checkAuthorization', () => {
    test('should return whether the current user has sufficient authorization to run the procedure', async () => {
      const prepareFunc = sinon.stub();
      const authFunc = sinon.stub();
      const authorization: ProcedureAuthorization = {
        identityRoles: true,
        signerPermissions: true,
      };
      authFunc.resolves(authorization);
      let procedure = new Procedure(prepareFunc, authFunc);

      const args = 'args';

      let result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        permissions: true,
        roles: true,
      });

      context = dsMockUtils.getContextInstance({ hasRoles: false, hasPermissions: false });
      authFunc.resolves({
        identityRoles: [{ type: RoleType.TickerOwner, ticker: 'ticker' }],
        signerPermissions: {
          tokens: null,
          portfolios: null,
          transactions: null,
        },
      });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        permissions: false,
        roles: false,
      });

      procedure = new Procedure(prepareFunc, { signerPermissions: true, identityRoles: true });

      result = await procedure.checkAuthorization(args, context);
      expect(result).toEqual({
        permissions: true,
        roles: true,
      });
    });
  });

  describe('method: prepare', () => {
    let posRatioToBigNumberStub: sinon.SinonStub<[PosRatio], BigNumber>;
    let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
    let txTagToProtocolOpStub: sinon.SinonStub<[TxTag, baseModule.Context], ProtocolOp>;
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
      txTags = [TxTags.asset.RegisterTicker, TxTags.identity.RegisterDid];
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
      const ticker = 'MY_TOKEN';
      const secondaryKeys = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryKeys,
      };
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxStub('identity', 'registerDid');

      const returnValue = 'good';

      const func1 = async function(
        this: baseModule.Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<string> {
        this.addTransaction(tx1, {}, args.ticker);

        this.addTransaction(tx2, {}, args.secondaryKeys);

        return returnValue;
      };

      const proc1 = new Procedure(func1);

      const constructorSpy = sinon.spy(baseModule, 'TransactionQueue');

      let { transactions } = await proc1.prepare(procArgs, context);

      expect(transactions.length).toBe(2);
      sinon.assert.calledWith(
        constructorSpy,
        sinon.match([
          sinon.match({ tx: tx1, args: [ticker] }),
          sinon.match({ tx: tx2, args: [secondaryKeys] }),
        ]),
        returnValue,
        context
      );

      const func2 = async function(
        this: baseModule.Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<MaybePostTransactionValue<string>> {
        return this.addProcedure(proc1, args);
      };

      const proc2 = new Procedure(func2);

      ({ transactions } = await proc2.prepare(procArgs, context));

      expect(transactions.length).toBe(2);
      sinon.assert.calledWith(
        constructorSpy,
        sinon.match([
          sinon.match({ tx: tx1, args: [ticker] }),
          sinon.match({ tx: tx2, args: [secondaryKeys] }),
        ]),
        returnValue,
        context
      );
    });

    test('should throw any errors encountered during preparation', () => {
      const ticker = 'MY_TOKEN';
      const secondaryKeys = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryKeys,
      };

      const errorMsg = 'failed';
      const func = async function(
        this: baseModule.Procedure<typeof procArgs, string>
      ): Promise<string> {
        throw new Error(errorMsg);
      };

      const proc = new Procedure(func);

      return expect(proc.prepare(procArgs, context)).rejects.toThrow(errorMsg);
    });

    test("should throw an error if the caller doesn't have the appropriate roles", async () => {
      const ticker = 'MY_TOKEN';
      const secondaryKeys = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        secondaryKeys,
      };
      const func = async function(
        this: baseModule.Procedure<typeof procArgs, string>
      ): Promise<string> {
        return 'success';
      };

      let proc = new Procedure(func, {
        identityRoles: [({ type: 'FakeRole' } as unknown) as Role],
      });
      context = dsMockUtils.getContextInstance({ hasRoles: false, hasPermissions: false });

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        "Current Identity doesn't have the required roles to execute this procedure"
      );

      proc = new Procedure(func, {
        signerPermissions: {
          tokens: [],
          transactions: [],
          portfolios: [],
        },
      });

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        "Current Account doesn't have the required permissions to execute this procedure"
      );

      proc = new Procedure(func, {
        signerPermissions: false,
      });

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        "Current Account doesn't have the required permissions to execute this procedure"
      );

      proc = new Procedure(func, async () => ({ identityRoles: false }));

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        "Current Identity doesn't have the required roles to execute this procedure"
      );
    });
  });

  describe('method: addTransaction', () => {
    test('should return an array of post transaction values corresponding to the resolver functions passed to it', async () => {
      const ticker = 'MY_TOKEN';
      const resolvedNum = 1;
      const resolvedStr = 'something';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      const values = proc.addTransaction(
        tx,
        {
          resolvers: tuple(
            async (): Promise<number> => resolvedNum,
            async (): Promise<string> => resolvedStr
          ),
          signer: {} as KeyringPair,
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
      const ticker = 'MY_TOKEN';
      const resolvedNum = 1;
      const resolvedStr = 'something';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      const values = proc.addBatchTransaction(
        tx,
        {
          resolvers: tuple(
            async (): Promise<number> => resolvedNum,
            async (): Promise<string> => resolvedStr
          ),
          signer: {} as KeyringPair,
        },
        [[ticker]]
      );

      await Promise.all(values.map(value => value.run({} as ISubmittableResult)));
      const [num, str] = values;

      expect(num.value).toBe(resolvedNum);
      expect(str.value).toBe(resolvedStr);
    });

    test('should add a non-batch transaction to the queue if only one set of arguments is passed', async () => {
      const ticker = 'MY_TOKEN';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      proc.addBatchTransaction(
        tx,
        {
          signer: {} as KeyringPair,
        },
        [[ticker]]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (proc as any).transactions;
      expect(transactions[0] instanceof baseModule.PolymeshTransaction).toBe(true);
      expect(transactions.length).toBe(1);
    });

    test('should separate large argument lists into multiple batches', async () => {
      const ticker = 'MY_TOKEN';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      let i = 0;

      proc.addBatchTransaction(
        new baseModule.PostTransactionValue(() => tx),
        {
          fee: new BigNumber(100),
          groupByFn: () => `${i++}`,
        },
        [...range(22).map(() => [ticker])]
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transactions = (proc as any).transactions;

      expect(transactions.length).toBe(2);
      expect(transactions[0] instanceof baseModule.PolymeshTransactionBatch).toBe(true);
      expect(transactions[1] instanceof baseModule.PolymeshTransactionBatch).toBe(true);
    });
  });

  describe('method: addProcedure', () => {
    test('should return the return value of the passed procedure', async () => {
      const returnValue = 1;

      const proc1 = new Procedure(async () => returnValue);
      const proc2 = new Procedure(async () => undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      proc2.context = context;
      const result = await proc2.addProcedure(proc1);

      expect(result).toBe(returnValue);
    });

    test('should throw any validation errors encountered while preparing the passed procedure', () => {
      const errorMsg = 'Procedure Error';

      const proc1 = new Procedure(async () => {
        throw new Error(errorMsg);
      });
      const proc2 = new Procedure(async () => undefined);
      proc2.context = context;
      const result = proc2.addProcedure(proc1);

      return expect(result).rejects.toThrow(errorMsg);
    });
  });
});
