import BigNumber from 'bignumber.js';
import { DidRecord, ProtocolOp, Signatory, TxTags } from 'polymesh-types/types';
import sinon from 'sinon';

import { Identity } from '~/api/entities';
import { Context } from '~/context';
import { didsWithClaims } from '~/middleware/queries';
import { ClaimTypeEnum, IdentityWithClaimsResult } from '~/middleware/types';
import { dsMockUtils } from '~/testUtils/mocks';
import { createMockAccountId } from '~/testUtils/mocks/dataSources';
import { ClaimType, SignerType, TransactionArgumentType } from '~/types';
import { GraphqlQuery } from '~/types/internal';
import * as utilsModule from '~/utils';

jest.mock(
  '@polkadot/api',
  require('~/testUtils/mocks/dataSources').mockPolkadotModule('@polkadot/api')
);

// TODO: refactor tests (too much repeated code)
describe('Context class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should throw an error if accessing the transaction submodule without an active account', async () => {
    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi: dsMockUtils.getMiddlewareApi(),
    });

    expect(() => context.polymeshApi.tx).toThrow(
      'Cannot perform transactions without an active account'
    );
  });

  test('should throw an error if accessing the middleware client without an active connection', async () => {
    const newPair = {
      address: 'someAddress1',
      meta: {},
      publicKey: 'publicKey',
    };
    dsMockUtils.configureMocks({
      keyringOptions: {
        addFromSeed: newPair,
      },
    });
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockLinkedKeyInfo({
          Unique: dsMockUtils.createMockIdentityId('someDid'),
        })
      ),
    });

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi: null,
      seed: 'Alice'.padEnd(32, ' '),
    });

    expect(() => context.middlewareApi).toThrow(
      'Cannot perform this action without an active middleware connection'
    );
  });

  test('should check if the middleware client is equal to the instance passed to the constructor', async () => {
    const newPair = {
      address: 'someAddress1',
      meta: {},
      publicKey: 'publicKey',
    };
    dsMockUtils.configureMocks({
      keyringOptions: {
        addFromSeed: newPair,
      },
    });
    dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockLinkedKeyInfo({
          Unique: dsMockUtils.createMockIdentityId('someDid'),
        })
      ),
    });

    const middlewareApi = dsMockUtils.getMiddlewareApi();

    const context = await Context.create({
      polymeshApi: dsMockUtils.getApiInstance(),
      middlewareApi,
      seed: 'Alice'.padEnd(32, ' '),
    });

    expect(context.middlewareApi).toEqual(middlewareApi);
  });

  describe('method: create', () => {
    test('should throw if seed parameter is not a 32 length string', async () => {
      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'abc',
      });

      return expect(context).rejects.toThrow(new Error('Seed must be 32 characters in length'));
    });

    test('should create a Context class from a seed with Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(newPair);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a keyring with Pair and Identity attached', async () => {
      const pairs = [{ address: 'someAddress', meta: {}, publicKey: 'publicKey' }];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        keyring: dsMockUtils.getKeyringInstance(),
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(pairs[0]);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class from a uri with Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromUri: newPair,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        uri: '//Alice',
      });

      sinon.assert.calledOnce(keyToIdentityIdsStub);
      expect(context.currentPair).toEqual(newPair);
      sinon.assert.match(context.getCurrentIdentity() instanceof Identity, true);
    });

    test('should create a Context class without Pair and Identity attached', async () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      const keyToIdentityIdsStub = dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      sinon.assert.notCalled(keyToIdentityIdsStub);
      expect(context.currentPair).toBe(undefined);
      expect(() => context.getCurrentIdentity()).toThrow();
    });

    test('should throw if the account seed is not assotiated with an IdentityId ', () => {
      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: newPair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds');

      const context = Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      return expect(context).rejects.toThrow(
        new Error('There is no Identity associated to this account')
      );
    });
  });

  describe('method: getAccounts', () => {
    test('should retrieve an array of addresses and metadata', async () => {
      const pairs = [
        {
          address: '01',
          meta: {
            name: 'name 01',
          },
          somethingElse: false,
          publicKey: 'publicKey',
        },
        {
          address: '02',
          meta: {},
          somethingElse: false,
          publicKey: 'publicKey',
        },
      ];
      dsMockUtils.configureMocks({
        keyringOptions: {
          getPairs: pairs,
        },
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      const result = context.getAccounts();
      expect(result[0].address).toBe(pairs[0].address);
      expect(result[1].address).toBe(pairs[1].address);
      expect(result[0].name).toBe(pairs[0].meta.name);
      expect(result[1].name).toBe(undefined);
    });
  });

  describe('method: setPair', () => {
    test('should throw error if the pair does not exist in the keyring set', async () => {
      dsMockUtils.configureMocks({
        keyringOptions: {
          error: true,
        },
      });
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      await expect(context.setPair('012')).rejects.toThrow(
        'The address is not present in the keyring set'
      );
    });

    test("should throw error if the address doesn't have an associated identity", async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: 'address',
            meta: {},
            publicKey,
          },
          getPair: {
            address: newAddress,
            meta: {},
            publicKey: newPublicKey,
          },
        },
      });

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(newPublicKey)
        .returns(dsMockUtils.createMockOption());

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      await expect(context.setPair(newAddress)).rejects.toThrow(
        'There is no Identity associated to this account'
      );
    });

    test('should set new values for currentPair and getCurrentIdentity', async () => {
      const publicKey = 'publicKey';
      const newPublicKey = 'newPublicKey';
      const newAddress = 'newAddress';
      const newIdentityId = 'newIdentityId';
      const accountId = dsMockUtils.createMockAccountId(newAddress);
      const newCurrentPair = {
        address: newAddress,
        meta: {},
        publicKey: newPublicKey,
      };

      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: {
            address: 'address',
            meta: {},
            publicKey,
          },
          getPair: newCurrentPair,
        },
      });

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(publicKey)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId('currentIdentityId'),
            })
          )
        );

      dsMockUtils
        .createQueryStub('identity', 'keyToIdentityIds')
        .withArgs(accountId)
        .returns(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockLinkedKeyInfo({
              Unique: dsMockUtils.createMockIdentityId(newIdentityId),
            })
          )
        );

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      sinon
        .stub(utilsModule, 'stringToAccountId')
        .withArgs(newAddress, context)
        .returns(accountId);

      await context.setPair('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

      expect(context.currentPair).toEqual(newCurrentPair);
      expect(context.getCurrentIdentity().did).toEqual(newIdentityId);
    });
  });

  describe('method: accountBalance', () => {
    test('should throw if accountId or currentPair is not set', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(context.accountBalance()).rejects.toThrow(
        'There is no account associated with the SDK'
      );
    });

    test('should return the account POLYX balance if currentPair is set', async () => {
      const freeBalance = dsMockUtils.createMockBalance(100);
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free: freeBalance,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen: dsMockUtils.createMockBalance(),
          feeFrozen: dsMockUtils.createMockBalance(),
        }),
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance();
      expect(result.free).toEqual(utilsModule.balanceToBigNumber(freeBalance));
    });

    test('should return the account POLYX balance if accountId is set', async () => {
      const freeBalance = dsMockUtils.createMockBalance(100);
      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free: freeBalance,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen: dsMockUtils.createMockBalance(),
          feeFrozen: dsMockUtils.createMockBalance(),
        }),
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account', { returnValue });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = await context.accountBalance('accountId');
      expect(result.free).toEqual(utilsModule.balanceToBigNumber(freeBalance));
    });

    test('should allow subscription', async () => {
      const unsubCallback = 'unsubCallback';
      const free = dsMockUtils.createMockBalance(100);
      const miscFrozen = dsMockUtils.createMockBalance(10);
      const feeFrozen = dsMockUtils.createMockBalance(12);

      const returnValue = dsMockUtils.createMockAccountInfo({
        nonce: dsMockUtils.createMockIndex(),
        refcount: dsMockUtils.createMockRefCount(),
        data: dsMockUtils.createMockAccountData({
          free,
          reserved: dsMockUtils.createMockBalance(),
          miscFrozen,
          feeFrozen,
        }),
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('system', 'account').callsFake(async (_, cbFunc) => {
        cbFunc(returnValue);
        return unsubCallback;
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const callback = sinon.stub();
      const result = await context.accountBalance('accountId', callback);

      expect(result).toEqual(unsubCallback);
      sinon.assert.calledWithExactly(callback, {
        free: utilsModule.balanceToBigNumber(free),
        locked: utilsModule.balanceToBigNumber(feeFrozen),
      });
    });
  });

  describe('method: getCurrentIdentity', () => {
    test('should return the current identity', async () => {
      const did = 'someDid';
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId(did),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = context.getCurrentIdentity();
      expect(result.did).toBe(did);
    });

    test("should throw an error if the current identity isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getCurrentIdentity()).toThrow(
        'The current account does not have an associated identity'
      );
    });
  });

  describe('method: getCurrentPair', () => {
    test('should return the current keyring pair', async () => {
      const pair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: pair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const result = context.getCurrentPair();

      expect(result).toBe(pair);
    });

    test("should throw an error if the current pair isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getCurrentPair()).toThrow(
        'There is no account associated with the current SDK instance'
      );
    });
  });

  describe('method: getInvalidDids', () => {
    /* eslint-disable @typescript-eslint/camelcase */
    test('should return which DIDs in the input array are invalid', async () => {
      const inputDids = ['someDid', 'otherDid', 'invalidDid', 'otherInvalidDid'];
      dsMockUtils.createQueryStub('identity', 'didRecords', {
        multi: [
          dsMockUtils.createMockDidRecord({
            roles: [],
            master_key: createMockAccountId('someId'),
            signing_keys: [],
          }),
          dsMockUtils.createMockDidRecord({
            roles: [],
            master_key: createMockAccountId('otherId'),
            signing_keys: [],
          }),
          dsMockUtils.createMockDidRecord(),
          dsMockUtils.createMockDidRecord(),
        ],
      });

      const newPair = {
        address: 'someAddress',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromUri: newPair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        uri: '//Alice',
      });

      const invalidDids = await context.getInvalidDids(inputDids);

      expect(invalidDids).toEqual(inputDids.slice(2, 4));
    });
    /* eslint-enable @typescript-eslint/camelcase */
  });

  describe('method: getTransactionFees', () => {
    test('should return the fees associated to the supplied transaction', async () => {
      const pair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: pair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(1, 2),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const txTagToProtocolOpStub = sinon.stub(utilsModule, 'txTagToProtocolOp');

      txTagToProtocolOpStub
        .withArgs(TxTags.asset.CreateAsset, context)
        .returns(('someProtocolOp' as unknown) as ProtocolOp);
      txTagToProtocolOpStub.withArgs(TxTags.asset.Freeze, context).throws(); // transaction without fees

      dsMockUtils.createQueryStub('protocolFee', 'baseFees', {
        returnValue: dsMockUtils.createMockBalance(500000000),
      });

      let result = await context.getTransactionFees(TxTags.asset.CreateAsset);

      expect(result).toEqual(new BigNumber(250));

      result = await context.getTransactionFees(TxTags.asset.Freeze);

      expect(result).toEqual(new BigNumber(0));
    });

    test("should throw an error if the current pair isn't defined", async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
      });

      expect(() => context.getCurrentPair()).toThrow(
        'There is no account associated with the current SDK instance'
      );
    });
  });

  describe('method: getSigningKeys', () => {
    const did = 'someDid';
    const accountId = 'someAccountId';
    const fakeResult = [
      { value: did, type: SignerType.Identity },
      { value: accountId, type: SignerType.Account },
    ];
    const signerIdentityId = dsMockUtils.createMockSignatory({
      Identity: dsMockUtils.createMockIdentityId(did),
    });
    const signerAccountId = dsMockUtils.createMockSignatory({
      Account: dsMockUtils.createMockAccountId(accountId),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let signatoryToSignerStub: sinon.SinonStub<[Signatory], any>;
    let didRecordsStub: sinon.SinonStub;
    let rawDidRecord: DidRecord;

    beforeAll(() => {
      signatoryToSignerStub = sinon.stub(utilsModule, 'signatoryToSigner');
      signatoryToSignerStub.withArgs(signerIdentityId).returns(fakeResult[0]);
      signatoryToSignerStub.withArgs(signerAccountId).returns(fakeResult[1]);
    });

    beforeEach(() => {
      didRecordsStub = dsMockUtils.createQueryStub('identity', 'didRecords');
      /* eslint-disable @typescript-eslint/camelcase */
      rawDidRecord = dsMockUtils.createMockDidRecord({
        roles: [],
        master_key: dsMockUtils.createMockAccountId(),
        signing_keys: [
          dsMockUtils.createMockSigningKey({
            signer: signerIdentityId,
            permissions: [],
          }),
          dsMockUtils.createMockSigningKey({
            signer: signerAccountId,
            permissions: [],
          }),
        ],
      });
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
    });

    test('should return a list of Signers', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      didRecordsStub.returns(rawDidRecord);

      const result = await context.getSigningKeys();
      expect(result).toEqual(fakeResult);
    });

    test('should allow subscription', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const unsubCallback = 'unsubCallBack';

      didRecordsStub.callsFake(async (_, cbFunc) => {
        cbFunc(rawDidRecord);
        return unsubCallback;
      });

      const callback = sinon.stub();
      const result = await context.getSigningKeys(callback);

      expect(result).toBe(unsubCallback);
      sinon.assert.calledWithExactly(callback, fakeResult);
    });
  });

  describe('method: getTransactionArguments', () => {
    test('should return a representation of the arguments of a transaction', async () => {
      const pair = {
        address: 'someAddress1',
        meta: {},
        publicKey: 'publicKey',
      };
      dsMockUtils.configureMocks({
        keyringOptions: {
          addFromSeed: pair,
        },
      });
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
      dsMockUtils.createQueryStub('protocolFee', 'coefficient', {
        returnValue: dsMockUtils.createMockPosRatio(1, 2),
      });

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      dsMockUtils.createTxStub('asset', 'registerTicker', {
        meta: {
          args: [
            {
              type: 'Ticker',
              name: 'ticker',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.RegisterTicker })).toMatchObject([
        {
          name: 'ticker',
          type: TransactionArgumentType.Text,
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('identity', 'addClaim', {
        meta: {
          args: [
            {
              type: 'IdentityId',
              name: 'target',
            },
            {
              type: 'Claim',
              name: 'claim',
            },
            {
              type: 'Option<Moment>',
              name: 'expiry',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.identity.AddClaim })).toMatchObject([
        {
          name: 'target',
          type: TransactionArgumentType.Did,
          optional: false,
        },
        {
          name: 'claim',
          type: TransactionArgumentType.RichEnum,
          optional: false,
          internal: [
            {
              name: 'Accredited',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'Affiliate',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'BuyLockup',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'SellLockup',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'CustomerDueDiligence',
              type: TransactionArgumentType.Null,
              optional: false,
            },
            {
              name: 'KnowYourCustomer',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'Jurisdiction',
              type: TransactionArgumentType.Tuple,
              optional: false,
              internal: [
                {
                  name: '0',
                  type: TransactionArgumentType.Text,
                  optional: false,
                },
                {
                  name: '1',
                  type: TransactionArgumentType.Did,
                  optional: false,
                },
              ],
            },
            {
              name: 'Exempted',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'Blocked',
              type: TransactionArgumentType.Did,
              optional: false,
            },
            {
              name: 'NoData',
              type: TransactionArgumentType.Null,
              optional: false,
            },
          ],
        },
        {
          name: 'expiry',
          type: TransactionArgumentType.Date,
          optional: true,
        },
      ]);

      dsMockUtils.createTxStub('identity', 'cddRegisterDid', {
        meta: {
          args: [
            {
              type: 'Compact<Bytes>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.identity.CddRegisterDid })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Unknown,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'createAsset', {
        meta: {
          args: [
            {
              type: 'Vec<IdentityId>',
              name: 'dids',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.CreateAsset })).toMatchObject([
        {
          type: TransactionArgumentType.Array,
          name: 'dids',
          optional: false,
          internal: {
            name: '',
            type: TransactionArgumentType.Did,
            optional: false,
          },
        },
      ]);

      dsMockUtils.createTxStub('asset', 'batchRemoveDocument', {
        meta: {
          args: [
            {
              type: '[u8;32]',
              name: 'someArg',
            },
          ],
        },
      });

      expect(
        context.getTransactionArguments({ tag: TxTags.asset.BatchRemoveDocument })
      ).toMatchObject([
        {
          type: TransactionArgumentType.Text,
          name: 'someArg',
          optional: false,
        },
      ]);

      dsMockUtils.createTxStub('asset', 'setFundingRound', {
        meta: {
          args: [
            {
              type: 'Permission',
              name: 'permission',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.SetFundingRound })).toMatchObject([
        {
          type: TransactionArgumentType.SimpleEnum,
          name: 'permission',
          optional: false,
          internal: ['Full', 'Admin', 'Operator', 'SpendFunds'],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'unfreeze', {
        meta: {
          args: [
            {
              type: 'Document',
              name: 'document',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.Unfreeze })).toMatchObject([
        {
          type: TransactionArgumentType.Object,
          name: 'document',
          optional: false,
          internal: [
            {
              name: 'uri',
              type: TransactionArgumentType.Text,
            },
            {
              name: 'content_hash',
              type: TransactionArgumentType.Text,
            },
          ],
        },
      ]);

      dsMockUtils.createTxStub('asset', 'archiveExtension', {
        meta: {
          args: [
            {
              type: 'UInt<8>',
              name: 'someArg',
            },
          ],
        },
      });

      expect(context.getTransactionArguments({ tag: TxTags.asset.ArchiveExtension })).toMatchObject(
        [
          {
            type: TransactionArgumentType.Unknown,
            name: 'someArg',
            optional: false,
          },
        ]
      );
    });
  });

  describe('method: issuedClaims', () => {
    beforeEach(() => {
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
    });

    test('should return a list of claims', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      const targetDid = 'someTargetDid';
      const issuerDid = 'someIssuerDid';
      const date = 1589816265000;
      const customerDueDiligenceType = ClaimTypeEnum.CustomerDueDiligence;
      const claim = {
        target: new Identity({ did: targetDid }, context),
        issuer: new Identity({ did: issuerDid }, context),
        issuedAt: new Date(date),
      };
      const fakeClaims = [
        {
          ...claim,
          expiry: new Date(date),
          claim: {
            type: customerDueDiligenceType,
          },
        },
        {
          ...claim,
          expiry: null,
          claim: {
            type: customerDueDiligenceType,
          },
        },
      ];
      /* eslint-disable @typescript-eslint/camelcase */
      const commonClaimData = {
        targetDID: targetDid,
        issuer: issuerDid,
        issuance_date: date,
        last_update_date: date,
      };
      const didsWithClaimsQueryResponse: IdentityWithClaimsResult = {
        totalCount: 25,
        items: [
          {
            did: targetDid,
            claims: [
              {
                ...commonClaimData,
                expiry: date,
                type: customerDueDiligenceType,
              },
              {
                ...commonClaimData,
                expiry: null,
                type: customerDueDiligenceType,
              },
            ],
          },
        ],
      };
      /* eslint-enabled @typescript-eslint/camelcase */

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: [targetDid],
          trustedClaimIssuers: [targetDid],
          claimTypes: [ClaimTypeEnum.Accredited],
          count: 1,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      let result = await context.issuedClaims({
        targets: [targetDid],
        trustedClaimIssuers: [targetDid],
        claimTypes: [ClaimType.Accredited],
        size: 1,
      });

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toEqual(1);

      dsMockUtils.createApolloQueryStub(
        didsWithClaims({
          dids: undefined,
          trustedClaimIssuers: undefined,
          claimTypes: undefined,
          count: undefined,
          skip: undefined,
        }),
        {
          didsWithClaims: didsWithClaimsQueryResponse,
        }
      );

      result = await context.issuedClaims();

      expect(result.data).toEqual(fakeClaims);
      expect(result.count).toEqual(25);
      expect(result.next).toBeNull();
    });
  });

  describe('method: queryMiddleware', () => {
    beforeEach(() => {
      dsMockUtils.createQueryStub('identity', 'keyToIdentityIds', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockLinkedKeyInfo({
            Unique: dsMockUtils.createMockIdentityId('someDid'),
          })
        ),
      });
    });

    test('should throw if the middleware query fails', async () => {
      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      dsMockUtils.throwOnMiddlewareQuery();

      return expect(
        context.queryMiddleware(('query' as unknown) as GraphqlQuery<unknown>)
      ).rejects.toThrow('Error in middleware query: Error');
    });

    test('should perform a middleware query and return the results', async () => {
      const fakeResult = 'res';
      const fakeQuery = ('fakeQuery' as unknown) as GraphqlQuery<unknown>;

      const context = await Context.create({
        polymeshApi: dsMockUtils.getApiInstance(),
        middlewareApi: dsMockUtils.getMiddlewareApi(),
        seed: 'Alice'.padEnd(32, ' '),
      });

      dsMockUtils.createApolloQueryStub(fakeQuery, fakeResult);

      const res = await context.queryMiddleware(fakeQuery);

      expect(res.data).toBe(fakeResult);
    });
  });
});
