import BigNumber from 'bignumber.js';
import { TransferManager } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  AddCountTransferRestrictionParams,
  AddPercentageTransferRestrictionParams,
  Context,
  Namespace,
  SecurityToken,
  SetCountTransferRestrictionsParams,
  SetPercentageTransferRestrictionsParams,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { CountTransferRestriction, PercentageTransferRestriction } from '~/types';
import { TransferRestrictionType } from '~/types/internal';

import { Count } from '../Count';
import { Percentage } from '../Percentage';
import { TransferRestrictionBase } from '../TransferRestrictionBase';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TransferRestrictionBase class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.initMocks();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend namespace', () => {
    expect(TransferRestrictionBase.prototype instanceof Namespace).toBe(true);
  });

  describe('method: addRestriction', () => {
    let context: Context;
    let token: SecurityToken;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(token, context);

      const args: Omit<AddCountTransferRestrictionParams, 'type'> = {
        count: new BigNumber(3),
        exemptedScopeIds: ['someScopeId'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: token.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(token, context);

      const args: Omit<AddPercentageTransferRestrictionParams, 'type'> = {
        percentage: new BigNumber(3),
        exemptedScopeIds: ['someScopeId'],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: token.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await percentage.addRestriction({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: setRestrictions', () => {
    let context: Context;
    let token: SecurityToken;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(token, context);

      const args: Omit<SetCountTransferRestrictionsParams, 'type'> = {
        restrictions: [{ count: new BigNumber(3), exemptedScopeIds: ['someScopeId'] }],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: token.ticker, ...args, type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.setRestrictions({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(token, context);

      const args: Omit<SetPercentageTransferRestrictionsParams, 'type'> = {
        restrictions: [{ percentage: new BigNumber(49), exemptedScopeIds: ['someScopeId'] }],
      };

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: token.ticker, ...args, type: TransferRestrictionType.Percentage },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await percentage.setRestrictions({
        ...args,
      });

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: removeRestrictions', () => {
    let context: Context;
    let token: SecurityToken;

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should prepare the procedure (count) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const count = new Count(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: { ticker: token.ticker, restrictions: [], type: TransferRestrictionType.Count },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await count.removeRestrictions();

      expect(queue).toBe(expectedQueue);
    });

    test('should prepare the procedure (percentage) with the correct arguments and context, and return the resulting transaction queue', async () => {
      const percentage = new Percentage(token, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<number>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs(
          {
            args: {
              ticker: token.ticker,
              restrictions: [],
              type: TransferRestrictionType.Percentage,
            },
            transformer: undefined,
          },
          context
        )
        .resolves(expectedQueue);

      const queue = await percentage.removeRestrictions();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: get', () => {
    let context: Context;
    let token: SecurityToken;
    let scopeId: string;
    let countRestriction: CountTransferRestriction;
    let percentageRestriction: PercentageTransferRestriction;
    let rawCountRestriction: TransferManager;
    let rawPercentageRestriction: TransferManager;

    beforeAll(() => {
      scopeId = 'someScopeId';
      countRestriction = {
        exemptedScopeIds: [scopeId],
        count: new BigNumber(10),
      };
      percentageRestriction = {
        exemptedScopeIds: [scopeId],
        percentage: new BigNumber(49),
      };
      rawCountRestriction = dsMockUtils.createMockTransferManager({
        CountTransferManager: dsMockUtils.createMockU64(countRestriction.count.toNumber()),
      });
      rawPercentageRestriction = dsMockUtils.createMockTransferManager({
        PercentageTransferManager: dsMockUtils.createMockPermill(
          percentageRestriction.percentage.toNumber() * 10000
        ),
      });
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      token = entityMockUtils.getSecurityTokenInstance();
      dsMockUtils.createQueryStub('statistics', 'activeTransferManagers', {
        returnValue: [rawCountRestriction, rawPercentageRestriction],
      });
      dsMockUtils.createQueryStub('statistics', 'exemptEntities', {
        entries: [[[null, dsMockUtils.createMockScopeId(scopeId)], true]],
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    test('should return all count transfer restrictions', async () => {
      const count = new Count(token, context);

      const result = await count.get();

      expect(result).toEqual({
        restrictions: [countRestriction],
        availableSlots: 1,
      });
    });

    test('should return all percentage transfer restrictions', async () => {
      const percentage = new Percentage(token, context);

      let result = await percentage.get();

      expect(result).toEqual({
        restrictions: [percentageRestriction],
        availableSlots: 1,
      });

      dsMockUtils.createQueryStub('statistics', 'exemptEntities', {
        entries: [],
      });

      result = await percentage.get();

      expect(result).toEqual({
        restrictions: [
          {
            percentage: new BigNumber(49),
          },
        ],
        availableSlots: 1,
      });
    });
  });
});
