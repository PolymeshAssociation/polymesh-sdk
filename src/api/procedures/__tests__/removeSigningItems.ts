import sinon from 'sinon';

import { isAuthorized, prepareRemoveSigningItems } from '~/api/procedures/removeSigningItems';
import { Context } from '~/context';
import { Signatory } from '~/polkadot';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { Signer, SignerType } from '~/types';
import * as utilsModule from '~/utils';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('removeSigningItems procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerToSignatoryStub: sinon.SinonStub<[Signer, Context], Signatory>;

  const args = [
    {
      type: SignerType.AccountKey,
      value: 'someFakeAccountKey',
    },
  ];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerToSignatoryStub = sinon.stub(utilsModule, 'signerToSignatory');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();
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

  test('should add a remove signing items transaction to the queue', async () => {
    mockContext.getSigningKeys.resolves(args);

    signerToSignatoryStub.returns(
      dsMockUtils.createMockSignatory({
        Identity: dsMockUtils.createMockIdentityId(args[0].value),
      })
    );

    const proc = procedureMockUtils.getInstance<Signer[], void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSigningItems');

    await prepareRemoveSigningItems.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [
      utilsModule.signerToSignatory(args[0], mockContext),
    ]);
  });

  test('should throw an error if the current account is not the master key', async () => {
    const proc = procedureMockUtils.getInstance<Signer[], void>(mockContext);

    await expect(
      prepareRemoveSigningItems.call(proc, [
        {
          type: SignerType.AccountKey,
          value: 'someAccountKey',
        },
      ])
    ).rejects.toThrow(new RegExp('You can not remove a master key'));
  });

  test('should throw an error if at least one of the signing key to remove is not present in the signing keys list', async () => {
    const proc = procedureMockUtils.getInstance<Signer[], void>(mockContext);

    await expect(prepareRemoveSigningItems.call(proc, args)).rejects.toThrow(
      new RegExp('You can not remove a signing key that is not present in your signing keys list')
    );
  });

  describe('isAuthorized', () => {
    test('should return whether the current address is the master key', async () => {
      entityMockUtils.configureMocks({
        identityOptions: {
          getMasterKey: '0xdummy',
        },
      });

      const proc = procedureMockUtils.getInstance<Signer[], void>(mockContext);

      const boundFunc = isAuthorized.bind(proc);
      let result = await boundFunc();
      expect(result).toBe(true);

      entityMockUtils.configureMocks({
        identityOptions: {
          getMasterKey: 'otherAccountKey',
        },
      });

      result = await boundFunc();
      expect(result).toBe(false);
    });
  });
});
