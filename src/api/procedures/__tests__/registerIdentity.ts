import { AccountId } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { SecondaryKey as MeshSecondaryKey } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  createRegisterIdentityResolver,
  getRequiredRoles,
  prepareRegisterIdentity,
} from '~/api/procedures/registerIdentity';
import { Context, Identity, PostTransactionValue, RegisterIdentityParams } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Permission, RoleType, SecondaryKey } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('registerIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let secondaryKeyToMeshSecondaryKeyStub: sinon.SinonStub<
    [SecondaryKey, Context],
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
    secondaryKeyToMeshSecondaryKeyStub = sinon.stub(
      utilsConversionModule,
      'secondaryKeyToMeshSecondaryKey'
    );
    identity = ('identity' as unknown) as PostTransactionValue<Identity>;
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
    entityMockUtils.cleanup();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should add a cddRegisterIdentity transaction to the queue', async () => {
    const targetAccount = 'someAccount';
    const secondaryKeys = [
      {
        signer: new Identity({ did: 'someValue' }, mockContext),
        permissions: [Permission.Full],
      },
    ];
    const args = {
      targetAccount,
      secondaryKeys,
    };
    const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
    const rawSecondaryKey = dsMockUtils.createMockSecondaryKey({
      signer: dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(secondaryKeys[0].signer.did),
      }),
      permissions: [dsMockUtils.createMockPermission(secondaryKeys[0].permissions[0])],
    });

    const proc = procedureMockUtils.getInstance<RegisterIdentityParams, Identity>(mockContext);

    stringToAccountIdStub.withArgs(targetAccount, mockContext).returns(rawAccountId);
    secondaryKeyToMeshSecondaryKeyStub
      .withArgs(secondaryKeys[0], mockContext)
      .returns(rawSecondaryKey);

    let result = await prepareRegisterIdentity.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      registerIdentityTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawAccountId,
      [rawSecondaryKey]
    );
    expect(result).toBe(identity);

    result = await prepareRegisterIdentity.call(proc, { targetAccount });

    sinon.assert.calledWith(
      addTransactionStub,
      registerIdentityTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawAccountId,
      []
    );
    expect(result).toBe(identity);
  });
});

describe('createRegisterIdentityResolver', () => {
  const findEventRecordStub = sinon.stub(utilsInternalModule, 'findEventRecord');
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
    findEventRecordStub.returns(
      dsMockUtils.createMockEventRecord([rawDid, 'accountId', 'signingItem'])
    );
  });

  afterEach(() => {
    findEventRecordStub.reset();
  });

  test('should return the new Identity', () => {
    const fakeContext = {} as Context;

    const result = createRegisterIdentityResolver(fakeContext)({} as ISubmittableResult);

    expect(result.did).toEqual(did);
  });
});

describe('getRequiredRoles', () => {
  test('should return a cdd provider role if args has at least one customer due diligence claim type', () => {
    expect(getRequiredRoles()).toEqual([{ type: RoleType.CddProvider }]);
  });
});
