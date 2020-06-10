import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import * as baseModule from '~/base';
import { Context } from '~/context';
import { PosRatio, ProtocolOp } from '~/polkadot';
import { dsMockUtils } from '~/testUtils/mocks';
import { KeyringPair, Role } from '~/types';
import { MaybePostTransactionValue } from '~/types/internal';
import { tuple } from '~/types/utils';
import * as utilsModule from '~/utils';

import { Procedure } from '../Procedure';

describe('Procedure class', () => {
  let context: Context;
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

  describe('method: prepare', () => {
    let posRatioToBigNumberStub: sinon.SinonStub<[PosRatio], BigNumber>;
    let balanceToBigNumberStub: sinon.SinonStub<[Balance], BigNumber>;
    let stringToProtocolOpStub: sinon.SinonStub<[string, Context], ProtocolOp>;
    let protocolOps: string[];
    let fees: number[];
    let rawCoefficient: PosRatio;
    let rawFees: Balance[];
    let numerator: number;
    let denominator: number;
    let coefficient: BigNumber;

    beforeAll(() => {
      posRatioToBigNumberStub = sinon.stub(utilsModule, 'posRatioToBigNumber');
      balanceToBigNumberStub = sinon.stub(utilsModule, 'balanceToBigNumber');
      stringToProtocolOpStub = sinon.stub(utilsModule, 'stringToProtocolOp');
      protocolOps = ['AssetRegisterTicker', 'IdentityRegisterDid'];
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
      protocolOps.forEach(protocolOp =>
        stringToProtocolOpStub
          .withArgs(protocolOp, context)
          .returns((protocolOp as unknown) as ProtocolOp)
      );

      rawFees.forEach((rawFee, index) =>
        balanceToBigNumberStub.withArgs(rawFee).returns(new BigNumber(fees[index]))
      );
    });

    test('should prepare and return a transaction queue with the corresponding transactions, arguments, fees and return value', async () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxStub('identity', 'registerDid');
      const fee1 = new BigNumber(20);
      const fee2 = new BigNumber(30);

      const totalFees = fee1.plus(fee2);

      const returnValue = 'good';

      const func1 = async function(
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<string> {
        this.addTransaction(
          tx1,
          {
            fee: fee1,
          },
          args.ticker
        );

        this.addTransaction(
          tx2,
          {
            fee: fee2,
          },
          args.signingItems
        );

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
          sinon.match({ tx: tx2, args: [signingItems] }),
        ]),
        totalFees,
        returnValue
      );

      const func2 = async function(
        this: Procedure<typeof procArgs, string>,
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
          sinon.match({ tx: tx2, args: [signingItems] }),
        ]),
        totalFees,
        returnValue
      );
    });

    test('should throw any errors encountered during preparation', () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };

      const errorMsg = 'failed';
      const func = async function(this: Procedure<typeof procArgs, string>): Promise<string> {
        throw new Error(errorMsg);
      };

      const proc = new Procedure(func);

      return expect(proc.prepare(procArgs, context)).rejects.toThrow(errorMsg);
    });

    test("should throw an error if the caller doesn't have the appropriate roles", async () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };
      const func = async function(this: Procedure<typeof procArgs, string>): Promise<string> {
        return 'success';
      };

      let proc = new Procedure(func, [({ type: 'FakeRole' } as unknown) as Role]);
      context = dsMockUtils.getContextInstance({ hasRoles: false });

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        'Current account is not authorized to execute this procedure'
      );

      proc = new Procedure(func, async () => false);

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        'Current account is not authorized to execute this procedure'
      );
    });

    test("should fetch missing transaction fees and throw an error if the current account doesn't have enough balance", async () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxStub('identity', 'registerDid');

      stringToProtocolOpStub.withArgs(protocolOps[1], context).throws(); // extrinsic without a fee

      const returnValue = 'good';

      const func = async function(
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<string> {
        this.addTransaction(tx1, {}, args.ticker);

        this.addTransaction(tx2, {}, args.signingItems);

        return returnValue;
      };

      const proc = new Procedure(func);
      const balance = await context.accountBalance();

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        `Not enough POLYX balance to pay for this procedure's fees. Balance: ${balance.free.toFormat()}, fees: ${new BigNumber(
          fees.reduce((sum, fee) => sum + fee, 0)
        )
          .multipliedBy(coefficient)
          .toFormat()}`
      );
    });

    test('should throw an error if there is a batch transaction in the queue with no batch size', async () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };
      const tx1 = dsMockUtils.createTxStub('asset', 'registerTicker');
      const tx2 = dsMockUtils.createTxStub('identity', 'batchAcceptAuthorization');

      stringToProtocolOpStub.withArgs(protocolOps[1], context).throws(); // extrinsic without a fee

      const returnValue = 'good';

      const func = async function(
        this: Procedure<typeof procArgs, string>,
        args: typeof procArgs
      ): Promise<string> {
        this.addTransaction(tx1, {}, args.ticker);

        this.addTransaction(tx2, {}, args.signingItems);

        return returnValue;
      };

      const proc = new Procedure(func);

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        'Did not set batch size for batch transaction. Please report this error to the Polymath team'
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

    test('should use the current pair as a default signer', async () => {
      const ticker = 'MY_TOKEN';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      proc.addTransaction(tx, {}, ticker);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((proc as any).transactions[0].signer).toBe(context.getCurrentPair());
    });

    test("should use the current pair's address as a default signer if the pair is locked", async () => {
      const ticker = 'MY_TOKEN';
      const tx = dsMockUtils.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      proc.context = context;

      const pair = context.getCurrentPair();
      pair.isLocked = true;

      proc.addTransaction(tx, {}, ticker);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((proc as any).transactions[0].signer).toBe(pair.address);
    });
  });

  describe('method: addProcedure', () => {
    test('should return the return value of the passed procedure', async () => {
      const returnValue = 1;

      const proc1 = new Procedure(async () => returnValue);
      const proc2 = new Procedure(async () => undefined);
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
