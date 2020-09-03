import { AccountId, Moment } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { SigningKey as MeshSigningKey } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { RegisterIdentityParams } from '~/api/procedures';
import {
  createRegisterIdentityResolver,
  getRequiredRoles,
  prepareRegisterIdentity,
} from '~/api/procedures/registerIdentity';
import { PostTransactionValue } from '~/base';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Permission, RoleType, SignerType, SigningKey } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsModule from '~/utils';

describe('registerIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let stringToAccountIdStub: sinon.SinonStub<[string, Context], AccountId>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signingKeyToMeshSigningKeyStub: sinon.SinonStub<[SigningKey, Context], MeshSigningKey>;
  let addTransactionStub: sinon.SinonStub;
  let registerIdentityTransaction: PolymeshTx<unknown[]>;
  let identity: PostTransactionValue<Identity>;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    stringToAccountIdStub = sinon.stub(utilsModule, 'stringToAccountId');
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    signingKeyToMeshSigningKeyStub = sinon.stub(utilsModule, 'signingKeyToMeshSigningKey');
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
    const expiry = new Date('10/10/2050');
    const signingKeys = [
      {
        signer: {
          type: SignerType.Identity,
          value: 'someValue',
        },
        permissions: [Permission.Full],
      },
    ];
    const args = {
      targetAccount,
      expiry,
      signingKeys,
    };
    const rawAccountId = dsMockUtils.createMockAccountId(targetAccount);
    const rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
    const rawSigningKey = dsMockUtils.createMockSigningKey({
      signer: dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(signingKeys[0].signer.value),
      }),
      permissions: [dsMockUtils.createMockPermission(signingKeys[0].permissions[0])],
    });

    const proc = procedureMockUtils.getInstance<RegisterIdentityParams, Identity>(mockContext);

    stringToAccountIdStub.withArgs(targetAccount, mockContext).returns(rawAccountId);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
    signingKeyToMeshSigningKeyStub.withArgs(signingKeys[0], mockContext).returns(rawSigningKey);

    let result = await prepareRegisterIdentity.call(proc, args);

    sinon.assert.calledWith(
      addTransactionStub,
      registerIdentityTransaction,
      sinon.match({
        resolvers: sinon.match.array,
      }),
      rawAccountId,
      rawExpiry,
      [rawSigningKey]
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
      null,
      []
    );
  });
});

describe('createRegisterIdentityResolver', () => {
  const findEventRecordStub = sinon.stub(utilsModule, 'findEventRecord');
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
