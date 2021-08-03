import sinon from 'sinon';

import {
  Account,
  Context,
  CurrentAccount,
  CurrentIdentity,
  Identity,
  TransactionQueue,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('CurrentAccount class', () => {
  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    sinon.stub(utilsConversionModule, 'addressToKey');
    sinon.stub(utilsInternalModule, 'assertFormatValid');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  test('should extend Account', () => {
    expect(CurrentAccount.prototype instanceof Account).toBe(true);
  });

  describe('method: leaveIdentity', () => {
    test('should prepare the procedure with the correct arguments and context, and return the resulting transaction queue', async () => {
      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const expectedQueue = ('someQueue' as unknown) as TransactionQueue<void>;

      const args = {
        account,
      };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedQueue);

      const queue = await account.leaveIdentity();

      expect(queue).toBe(expectedQueue);
    });
  });

  describe('method: getIdentity', () => {
    test('should return the current Identity', async () => {
      const did = 'someDid';
      sinon.stub(Account.prototype, 'getIdentity').resolves(new Identity({ did }, context));

      const account = new CurrentAccount({ address: 'someAddress' }, context);

      const result = await account.getIdentity();

      expect(result instanceof CurrentIdentity).toBe(true);
      expect(result?.did).toBe(did);
    });
  });
});
