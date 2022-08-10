import { AccountId } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { SecondaryKey as MeshSecondaryKey } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createRegisterIdentityResolver,
  prepareRegisterIdentity,
} from '~/api/procedures/registerIdentity';
import { Context, Identity, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionedAccount, RegisterIdentityParams } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let secondaryAccountToMeshSecondaryKeyStub: sinon.SinonStub<
    [PermissionedAccount, Context],
    MeshSecondaryKey
  >;
  let addTransactionStub: sinon.SinonStub;
  let registerIdentityTransaction: PolymeshTx<unknown[]>;
  let identity: PostTransactionValue<Identity>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdStub = sinon.stub(utilsConversionModule, 'stringToAccountId');
    secondaryAccountToMeshSecondaryKeyStub = sinon.stub(
      utilsConversionModule,
      'secondaryAccountToMeshSecondaryKey'
    );
    identity = 'identity' as unknown as PostTransactionValue<Identity>;
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([identity]);
    registerIdentityTransaction = dsMockUtils.createTxStub('identity', 'cddRegisterDid');
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

  it('should add a cddRegisterIdentity transaction to the queue', async () => {
    const targetAccount = 'someAccount';
    const secondaryAccounts = [
      {
        account: entityMockUtils.getAccountInstance({ address: 'someValue' }),
        permissions: {
          assets: null,
          portfolios: null,
          transactions: null,
          transactionGroups: [],
        },
      },
    ];
    const args = {
      targetAccount,
      secondaryAccounts,
    };
    const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
    const rawSecondaryAccount = dsMockUtils.createMockSecondaryKey({
      signer: dsMockUtils.createMockSignatory({
        Account: dsMockUtils.createMockAccountId(secondaryAccounts[0].account.address),
      }),
      permissions: dsMockUtils.createMockPermissions(),
    });

    const proc = procedureMockUtils.getInstance<RegisterIdentityParams, Identity>(mockContext);

    stringToAccountIdStub.withArgs(targetAccount, mockContext).returns(rawAccountId);
    secondaryAccountToMeshSecondaryKeyStub
      .withArgs(secondaryAccounts[0], mockContext)
      .returns(rawSecondaryAccount);

    let result = await prepareRegisterIdentity.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: registerIdentityTransaction,
        resolvers: sinon.match.array,
        args: [rawAccountId, [rawSecondaryAccount]],
      })
    );
    expect(result).toBe(identity);

    result = await prepareRegisterIdentity.call(proc, { targetAccount });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: registerIdentityTransaction,
        resolvers: sinon.match.array,
        args: [rawAccountId, []],
      })
    );
    expect(result).toBe(identity);
  });
});

describe('createRegisterIdentityResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawDid = dsMockUtils.createMockIdentityId(did);

  beforeAll(() => {
    entityMockUtils.initMocks({
      identityOptions: {
        did,
      },
    });
  });

  beforeEach(() => {
    filterEventRecordsStub.returns([
      dsMockUtils.createMockIEvent([rawDid, 'accountId', 'signingItem']),
    ]);
  });

  afterEach(() => {
    filterEventRecordsStub.reset();
  });

  it('should return the new Identity', () => {
    const fakeContext = {} as Context;

    const result = createRegisterIdentityResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});
