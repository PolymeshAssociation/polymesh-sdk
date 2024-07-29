import { ISubmittableResult } from '@polkadot/types/types';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import * as utilsPublicInternalModule from '@polymeshassociation/polymesh-sdk/utils/internal';

import {
  checkArgs,
  createMoveFundsResolver,
  getAuthorization,
  moveFunds,
  MoveFundsArgs,
  MoveFundsResolverResult,
  prepareMoveFunds,
} from '~/api/procedures/moveFunds';
import { ConfidentialProcedure, Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { TxTags } from '~/types';
import * as utilsInternalModule from '~/utils/internal';

describe('moveFunds procedure', () => {
  let mockContext: Mocked<Context>;
  const proofs = [{ asset: 'someAsset', proof: 'someProof' }];

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    jest.resetAllMocks();
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return a ConfidentialProcedure', () => {
    const procedure = moveFunds();

    expect(procedure).toBeInstanceOf(ConfidentialProcedure);
  });

  it('should add a create MoveAssets transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, MoveFundsResolverResult>(
      mockContext
    );
    const createMoveFundsTransaction = dsMockUtils.createTxMock('confidentialAsset', 'moveAssets');
    const result = await prepareMoveFunds.call(proc, {
      from: entityMockUtils.getConfidentialAccountInstance(),
      to: entityMockUtils.getConfidentialAccountInstance(),
      proofs,
    });

    expect(result).toEqual({
      transaction: createMoveFundsTransaction,
      resolver: expect.any(Function),
      args: [[]],
    });
  });

  it('should add a create MoveAssets transaction to the queue for multiple moves', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, MoveFundsResolverResult>(
      mockContext
    );
    const createMoveFundsTransaction = dsMockUtils.createTxMock('confidentialAsset', 'moveAssets');
    const result = await prepareMoveFunds.call(proc, [
      {
        from: entityMockUtils.getConfidentialAccountInstance(),
        to: entityMockUtils.getConfidentialAccountInstance(),
        proofs,
      },
    ]);

    expect(result).toEqual({
      transaction: createMoveFundsTransaction,
      resolver: expect.any(Function),
      args: [[]],
    });
  });

  describe('checkArgs', () => {
    const fromDid = 'someDid';
    const toDid = 'someOtherDid';

    it('should throw an error if from ConfidentialAccount does not have an Identity associated with', async () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The provided accounts must have identities associated with them',
      });

      return expect(
        checkArgs(
          {
            from: entityMockUtils.getConfidentialAccountInstance({ getIdentity: null }),
            to: entityMockUtils.getConfidentialAccountInstance({ getIdentity: null }),
            proofs,
          },
          mockContext
        )
      ).rejects.toThrowError(expectedError);
    });

    it('should throw an error if to ConfidentialAccount does not have an Identity associated with', async () => {
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The provided accounts must have identities associated with them',
      });

      return expect(
        checkArgs(
          {
            from: entityMockUtils.getConfidentialAccountInstance({
              getIdentity: entityMockUtils.getIdentityInstance({
                did: fromDid,
                exists: true,
              }),
            }),
            to: entityMockUtils.getConfidentialAccountInstance({ getIdentity: null }),
            proofs,
          },
          mockContext
        )
      ).rejects.toThrowError(expectedError);
    });

    it('should throw an error if from and to ConfidentialAccount does not belong to the same Identity', () => {
      const from = entityMockUtils.getConfidentialAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({
          did: fromDid,
          isEqual: false,
          exists: true,
        }),
      });
      const to = entityMockUtils.getConfidentialAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({
          did: toDid,
          exists: true,
        }),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The provided accounts must have the same identity',
      });

      return expect(checkArgs({ from, to, proofs }, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should return serialized params', () => {
      const from = entityMockUtils.getConfidentialAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({
          did: fromDid,
          isEqual: false,
          exists: true,
        }),
      });
      const to = entityMockUtils.getConfidentialAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({
          did: toDid,
          exists: true,
        }),
      });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The provided accounts must have the same identity',
      });

      return expect(checkArgs({ from, to, proofs }, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    describe('getAuthorization', () => {
      it('should return the appropriate roles and permissions', () => {
        const proc = procedureMockUtils.getInstance<MoveFundsArgs, MoveFundsResolverResult>(
          mockContext
        );
        const boundFunc = getAuthorization.bind(proc);
        expect(boundFunc()).toEqual({
          permissions: {
            transactions: [TxTags.confidentialAsset.MoveAssets],
            assets: [],
            portfolios: [],
          },
        });
      });
    });
  });

  describe('createMoveFundsResolver', () => {
    const rawDid = dsMockUtils.createMockIdentityId('someDid');
    const confidentialAccount = entityMockUtils.getConfidentialAccountInstance();
    const rawPublicKey = dsMockUtils.createMockConfidentialAccount(confidentialAccount.publicKey);
    const filterEventRecordsSpy = jest.spyOn(utilsPublicInternalModule, 'filterEventRecords');
    const rawProofs = dsMockUtils.createMockBTreeMap();

    beforeEach(() => {
      jest.spyOn(utilsInternalModule, 'assertElgamalPubKeyValid').mockImplementation();
      filterEventRecordsSpy.mockReturnValue([
        dsMockUtils.createMockIEvent([rawDid, rawPublicKey, rawPublicKey, rawProofs]),
      ]);
    });

    afterEach(() => {
      jest.resetAllMocks();
      filterEventRecordsSpy.mockReset();
    });

    it('should return the move funds result', () => {
      const fakeContext = {} as Context;

      const result = createMoveFundsResolver(fakeContext)({} as ISubmittableResult);

      expect(result[0].callerDid.toHuman()).toEqual('someDid');
      expect(result[0].from.toHuman()).toEqual(confidentialAccount.toHuman());
      expect(result[0].to.toHuman()).toEqual(confidentialAccount.toHuman());
      expect(result[0].proofs).toEqual([]);
    });
  });
});
