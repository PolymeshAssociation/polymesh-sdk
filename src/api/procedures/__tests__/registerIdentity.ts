import { Moment } from '@polkadot/types/interfaces';
import { SigningKey as MeshSigningKey } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { RegisterIdentityParams } from '~/api/procedures';
import { getRequiredRoles, prepareRegisterIdentity } from '~/api/procedures/registerIdentity';
import { Context } from '~/context';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Permission, RoleType, SignerType, SigningKey } from '~/types';
import * as utilsModule from '~/utils';

describe('registerIdentity procedure', () => {
  let mockContext: Mocked<Context>;
  let valueToDidStub: sinon.SinonStub<[string | Identity], string>;
  let dateToMomentStub: sinon.SinonStub<[Date, Context], Moment>;
  let signingKeyToMeshSigningKeyStub: sinon.SinonStub<[SigningKey, Context], MeshSigningKey>;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    dsMockUtils.initMocks();
    valueToDidStub = sinon.stub(utilsModule, 'valueToDid');
    dateToMomentStub = sinon.stub(utilsModule, 'dateToMoment');
    signingKeyToMeshSigningKeyStub = sinon.stub(utilsModule, 'signingKeyToMeshSigningKey');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
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

  test('should add a registerIdentity transaction to the queue', async () => {
    const target = 'someTarget';
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
      target,
      expiry,
      signingKeys,
    };
    const rawExpiry = dsMockUtils.createMockMoment(expiry.getTime());
    const rawSigningKeys = dsMockUtils.createMockSigningKey({
      signer: dsMockUtils.createMockSignatory(),
      permissions: [dsMockUtils.createMockPermission(signingKeys[0].permissions[0])],
    });

    const transaction = dsMockUtils.createTxStub('identity', 'cddRegisterDid');
    const proc = procedureMockUtils.getInstance<RegisterIdentityParams, void>(mockContext);

    valueToDidStub.withArgs(target).returns(target);
    dateToMomentStub.withArgs(expiry, mockContext).returns(rawExpiry);
    signingKeyToMeshSigningKeyStub.withArgs(signingKeys[0], mockContext).returns(rawSigningKeys);

    await prepareRegisterIdentity.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, target, rawExpiry, [
      rawSigningKeys,
    ]);

    await prepareRegisterIdentity.call(proc, { target });

    sinon.assert.calledWith(addTransactionStub, transaction, {}, target, null, []);
  });
});

describe('getRequiredRoles', () => {
  test('should return a cdd provider role if args has at least one customer due diligence claim type', () => {
    expect(getRequiredRoles()).toEqual([{ type: RoleType.CddProvider }]);
  });
});
