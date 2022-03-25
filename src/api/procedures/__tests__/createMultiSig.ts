import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { MultiSig } from '~/api/entities/MultiSig';
import {
  CreateMultiSigParams,
  createMultiSigResolver,
  prepareCreateMultiSigAccount,
} from '~/api/procedures/createMultiSig';
import { Context, PolymeshError, PostTransactionValue } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

describe('createMultiSig procedure', () => {
  let mockContext: Mocked<Context>;
  let multiSigResponse: PostTransactionValue<MultiSig>;
  let addTransactionStub: sinon.SinonStub;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    multiSigResponse = [
      'callerDid',
      'multiSigResponse',
    ] as unknown as PostTransactionValue<MultiSig>;
    sinon.stub(utilsInternalModule, 'assertAddressValid');
    sinon.stub(utilsConversionModule, 'addressToKey');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub().returns([multiSigResponse]);
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

  it('should add a create multiSig transaction to the queue', async () => {
    const proc = procedureMockUtils.getInstance<CreateMultiSigParams, MultiSig>(mockContext);
    const createMultiSigTransaction = dsMockUtils.createTxStub('multiSig', 'createMultisig');
    const mockAccount = entityMockUtils.getAccountInstance();

    const signers = [mockAccount];
    const signaturesRequired = new BigNumber(1);

    const signatories = signers.map(s => utilsConversionModule.signerToSignatory(s, mockContext));
    const convertedSignersRequired = utilsConversionModule.bigNumberToU64(
      signaturesRequired,
      mockContext
    );

    const result = await prepareCreateMultiSigAccount.call(proc, {
      signers,
      signaturesRequired,
    });

    sinon.assert.calledWith(
      addTransactionStub,
      sinon.match({
        transaction: createMultiSigTransaction,
        resolvers: sinon.match.array,
        args: [signatories, convertedSignersRequired],
      })
    );
    expect(result).toBe(multiSigResponse);
  });

  it('should throw an error if more signatures are required than signers', () => {
    const proc = procedureMockUtils.getInstance<CreateMultiSigParams, MultiSig>(mockContext);
    const mockAccount = entityMockUtils.getAccountInstance();

    const signers = [mockAccount];
    const signaturesRequired = new BigNumber(2);

    const expectedError = new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The number of required signatures should not exceed the number of signers',
    });

    return expect(
      prepareCreateMultiSigAccount.call(proc, {
        signers,
        signaturesRequired,
      })
    ).rejects.toThrowError(expectedError);
  });
});

describe('createMultiSigResolver', () => {
  const filterEventRecordsStub = sinon.stub(utilsInternalModule, 'filterEventRecords');
  const did = 'someDid';
  const rawIdentityId = dsMockUtils.createMockIdentityId(did);
  const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const rawAddress = dsMockUtils.createMockAccountId(address);

  beforeEach(() => {
    filterEventRecordsStub.returns([dsMockUtils.createMockIEvent([rawIdentityId, rawAddress])]);
  });

  afterEach(() => {
    sinon.reset();
    filterEventRecordsStub.reset();
  });

  it('should return the new MultiSig', () => {
    const fakeContext = {} as Context;

    const multiSig = createMultiSigResolver(fakeContext)({} as ISubmittableResult);

    expect(multiSig.address).toEqual(address);
  });
});
