import { TxTags } from '@polymathnetwork/polkadot/api/types';
import { ISubmittableResult } from '@polymathnetwork/polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import * as baseModule from '~/base';
import { PolkadotMockFactory } from '~/testUtils/mocks';
import { Role } from '~/types';
import { MaybePostTransactionValue } from '~/types/internal';
import { tuple } from '~/types/utils';

import { Procedure } from '../Procedure';

describe('Procedure class', () => {
  const polkadotMockFactory = new PolkadotMockFactory();
  polkadotMockFactory.initMocks({ mockContext: true });

  afterEach(() => {
    polkadotMockFactory.reset();
  });

  describe('method: prepare', () => {
    test('should prepare and return a transaction queue with the corresponding transactions, arguments, fees and return value', async () => {
      const ticker = 'MY_TOKEN';
      const signingItems = ['0x1', '0x2'];
      const procArgs = {
        ticker,
        signingItems,
      };
      const tx1 = polkadotMockFactory.createTxStub('asset', 'registerTicker');
      const tx2 = polkadotMockFactory.createTxStub('identity', 'registerDid');
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
            tag: TxTags.asset.RegisterTicker,
            fee: fee1,
          },
          args.ticker
        );

        this.addTransaction(
          tx2,
          {
            tag: TxTags.asset.CreateToken,
            fee: fee2,
          },
          args.signingItems
        );

        return returnValue;
      };

      const proc1 = new Procedure(func1);
      const context = polkadotMockFactory.getContextInstance();

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
      const context = polkadotMockFactory.getContextInstance();

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

      let proc = new Procedure(func, [Role.Owner]);
      const context = polkadotMockFactory.getContextInstance();

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        'Current account is not authorized to execute this procedure'
      );

      proc = new Procedure(func, async () => false);

      await expect(proc.prepare(procArgs, context)).rejects.toThrow(
        'Current account is not authorized to execute this procedure'
      );
    });
  });

  describe('method: addTransaction', () => {
    test('should return an array of post transaction values corresponding to the resolver functions passed to it', async () => {
      const ticker = 'MY_TOKEN';
      const resolvedNum = 1;
      const resolvedStr = 'something';
      const tx = polkadotMockFactory.createTxStub('asset', 'registerTicker');

      const proc = new Procedure(async () => undefined);
      const context = polkadotMockFactory.getContextInstance();
      proc.context = context;

      const values = proc.addTransaction(
        tx,
        {
          tag: TxTags.asset.RegisterTicker,
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

  describe('method: addProcedure', () => {
    test('should return the return value of the passed procedure', async () => {
      const returnValue = 1;

      const proc1 = new Procedure(async () => returnValue);
      const proc2 = new Procedure(async () => undefined);
      const context = polkadotMockFactory.getContextInstance();
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
      const context = polkadotMockFactory.getContextInstance();
      proc2.context = context;
      const result = proc2.addProcedure(proc1);

      expect(result).rejects.toThrow(errorMsg);
    });
  });
});
