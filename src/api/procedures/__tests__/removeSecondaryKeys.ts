import { Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import {
  getAuthorization,
  Params,
  prepareRemoveSecondaryKeys,
} from '~/api/procedures/removeSecondaryKeys';
import { Account, Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { PermissionType, RoleType, Signer, SignerType, SignerValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('removeSecondaryKeys procedure', () => {
  let mockContext: Mocked<Context>;
  let addTransactionStub: sinon.SinonStub;
  let signerValueToSignatoryStub: sinon.SinonStub<[SignerValue, Context], Signatory>;
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  let args: Params;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    signerValueToSignatoryStub = sinon.stub(utilsConversionModule, 'signerValueToSignatory');
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
  });

  beforeEach(() => {
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    mockContext = dsMockUtils.getContextInstance();

    const signers = [entityMockUtils.getAccountInstance({ address: 'someFakeAccount' })];
    args = {
      signers,
      identity: entityMockUtils.getIdentityInstance({
        getPrimaryKey: entityMockUtils.getAccountInstance({ address: 'primaryKey' }),
        getSecondaryKeys: signers.map(signer => ({
          signer,
          permissions: {
            tokens: {
              type: PermissionType.Include,
              values: [],
            },
            portfolios: {
              type: PermissionType.Include,
              values: [],
            },
            transactions: {
              type: PermissionType.Include,
              values: [],
            },
            transactionGroups: [],
          },
        })),
      }),
    };
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

  test('should add a remove secondary items transaction to the queue', async () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    const rawSignatory = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(signerValue.value),
    });

    dsMockUtils.configureMocks({
      contextOptions: {
        secondaryKeys: signers.map(signer => ({
          signer,
          permissions: {
            tokens: null,
            transactions: null,
            transactionGroups: [],
            portfolios: null,
          },
        })),
      },
    });

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);
    signerValueToSignatoryStub.withArgs(signerValue, mockContext).returns(rawSignatory);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const transaction = dsMockUtils.createTxStub('identity', 'removeSecondaryKeys');

    await prepareRemoveSecondaryKeys.call(proc, args);

    sinon.assert.calledWith(addTransactionStub, transaction, {}, [rawSignatory]);
  });

  test('should throw an error if attempting to remove the primary key', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    const signer = entityMockUtils.getAccountInstance({ address: 'primaryKey' });

    signerToSignerValueStub
      .withArgs(signer)
      .returns({ type: SignerType.Account, value: signer.address });

    return expect(
      prepareRemoveSecondaryKeys.call(proc, {
        ...args,
        signers: [signer],
      })
    ).rejects.toThrow('You cannot remove the primary key');
  });

  test('should throw an error if at least one of the secondary keys to remove is not present in the secondary keys list', () => {
    const { signers } = args;
    const signerValue = { type: SignerType.Account, value: (signers[0] as Account).address };

    signerToSignerValueStub.withArgs(signers[0]).returns(signerValue);

    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareRemoveSecondaryKeys.call(proc, {
        ...args,
        identity: entityMockUtils.getIdentityInstance({
          getPrimaryKey: entityMockUtils.getAccountInstance({ address: 'primaryKey' }),
          getSecondaryKeys: [],
        }),
      })
    ).rejects.toThrow('One of the Signers is not a Secondary Key for the Identity');
  });

  describe('getAuthorization', () => {
    test('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        roles: [{ type: RoleType.Identity, did: args.identity.did }],
        permissions: {
          transactions: [TxTags.identity.RemoveSecondaryKeys],
          tokens: [],
          portfolios: [],
        },
      });
    });
  });
});
