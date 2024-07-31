import { PalletConfidentialAssetConfidentialMoveFunds } from '@polkadot/types/lookup';
import { ErrorCode } from '@polymeshassociation/polymesh-sdk/types';
import { when } from 'jest-when';

import { getAuthorization, moveFunds, prepareMoveFunds } from '~/api/procedures/moveFunds';
import {
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialProcedure,
  Context,
  PolymeshError,
} from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialLegProof, MoveFundsArgs, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('moveFunds procedure', () => {
  let mockContext: Mocked<Context>;

  const assetId = 'someAsset';

  let from: ConfidentialAccount;
  let to: ConfidentialAccount;
  let asset: ConfidentialAsset;
  let proof: 'someProof';
  let proofs: ConfidentialLegProof[];
  let args: MoveFundsArgs;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    from = entityMockUtils.getConfidentialAccountInstance();
    to = entityMockUtils.getConfidentialAccountInstance();
    asset = entityMockUtils.getConfidentialAssetInstance();
    proofs = [{ proof, asset }];

    args = [
      {
        from,
        to,
        proofs,
      },
    ];
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
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);
    const createMoveFundsTransaction = dsMockUtils.createTxMock('confidentialAsset', 'moveAssets');
    const serializeConfidentialAssetMovesSpy = jest.spyOn(
      utilsConversionModule,
      'serializeConfidentialAssetMoves'
    );

    asset = entityMockUtils.getConfidentialAssetInstance({
      id: assetId,
      isFrozen: false,
      isAccountFrozen: false,
    });

    const mockSerializedArgs = {
      from: 'someFrom',
      to: 'someTo',
      proofs: 'someProofs',
    } as unknown as PalletConfidentialAssetConfidentialMoveFunds;

    when(serializeConfidentialAssetMovesSpy)
      .calledWith(from, to, proofs, mockContext)
      .mockReturnValue(mockSerializedArgs);

    const result = await prepareMoveFunds.call(proc, args);

    expect(result).toEqual({
      transaction: createMoveFundsTransaction,
      resolver: undefined,
      args: [[mockSerializedArgs]],
    });
  });

  it('should throw an error if sending ConfidentialAccount getIdentity resolves to null', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    from.getIdentity = jest.fn().mockResolvedValue(null);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if sending ConfidentialAccount Identity does not exist', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    from = entityMockUtils.getConfidentialAccountInstance({
      getIdentity: entityMockUtils.getIdentityInstance({ exists: false }),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });

    return expect(prepareMoveFunds.call(proc, [{ ...args[0], from }])).rejects.toThrowError(
      expectedError
    );
  });

  it('should throw an error if receiving ConfidentialAccount getIdentity resolves to null', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    to.getIdentity = jest.fn().mockResolvedValue(null);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if receiving ConfidentialAccount Identity does not exist', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    to = entityMockUtils.getConfidentialAccountInstance({
      getIdentity: entityMockUtils.getIdentityInstance({ exists: false }),
    });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have identities associated with them',
    });

    return expect(prepareMoveFunds.call(proc, [{ ...args[0], to }])).rejects.toThrowError(
      expectedError
    );
  });

  it('should throw an error if signing identity is not the owner of the sending ConfidentialAccount', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);
    mockContext = dsMockUtils.getContextInstance({ signingIdentityIsEqual: false });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only the of the owner of the sender account can move funds',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if from and to ConfidentialAccounts does not belong to the same Identity', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    from.getIdentity = jest.fn().mockResolvedValue(
      entityMockUtils.getIdentityInstance({
        isEqual: false,
        exists: true,
      })
    );

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The provided accounts must have the same identity',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the ConfidentialAsset is frozen', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    asset.isFrozen = jest.fn().mockResolvedValue(true);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The asset is frozen',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the ConfidentialAsset is frozen for sending ConfidentialAccount', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    const assetFrozenSpy = jest.fn();

    when(assetFrozenSpy).calledWith(from).mockResolvedValue(true);
    when(assetFrozenSpy).calledWith(to).mockResolvedValue(false);

    asset.isAccountFrozen = assetFrozenSpy;

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The sender account is frozen for trading specified asset',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  it('should throw an error if the ConfidentialAsset is frozen for receiving ConfidentialAccount', async () => {
    const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);

    const assetFrozenSpy = jest.fn();

    when(assetFrozenSpy).calledWith(from).mockResolvedValue(false);
    when(assetFrozenSpy).calledWith(to).mockResolvedValue(true);

    asset.isAccountFrozen = assetFrozenSpy;

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The receiver account is frozen for trading specified asset',
    });

    return expect(prepareMoveFunds.call(proc, args)).rejects.toThrowError(expectedError);
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<MoveFundsArgs, void>(mockContext);
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
