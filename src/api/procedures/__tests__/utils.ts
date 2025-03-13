import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import {
  assertAuthorizationRequestValid,
  assertCaCheckpointValid,
  assertCaTaxWithholdingsValid,
  assertDistributionDatesValid,
  assertGroupDoesNotExist,
  assertInstructionValid,
  assertInstructionValidForManualExecution,
  assertPortfolioExists,
  assertRequirementsNotTooComplex,
  assertSecondaryAccounts,
  assertValidCdd,
  createAuthorizationResolver,
  createCreateGroupResolver,
  getGroupFromPermissions,
  UnreachableCaseError,
} from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  CheckpointSchedule,
  Context,
  CustomPermissionGroup,
  FungibleAsset,
  Identity,
  Instruction,
  PolymeshError,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { createMockAccountId, createMockIdentityId } from '~/testUtils/mocks/dataSources';
import { Mocked } from '~/testUtils/types';
import {
  Account,
  Authorization,
  AuthorizationType,
  Condition,
  ConditionTarget,
  ConditionType,
  ErrorCode,
  InstructionDetails,
  InstructionStatus,
  InstructionType,
  PermissionGroupType,
  PermissionType,
  Signer,
  SignerType,
  SignerValue,
  TickerReservationStatus,
  TrustedClaimIssuer,
  TxTags,
} from '~/types';
import { hexToUuid } from '~/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

jest.mock(
  '~/api/entities/KnownPermissionGroup',
  require('~/testUtils/mocks/entities').mockKnownPermissionGroupModule(
    '~/api/entities/KnownPermissionGroup'
  )
);

jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

jest.mock(
  '~/api/entities/Venue',
  require('~/testUtils/mocks/entities').mockVenueModule('~/api/entities/Venue')
);

describe('assertInstructionValid', () => {
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let instruction: Instruction;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        latestBlock,
      },
    });
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if instruction is not in pending or failed state', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        detailsFromChain: {
          status: InstructionStatus.Success,
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    return expect(assertInstructionValid(instruction, mockContext)).rejects.toThrow(
      'The Instruction must be in pending or failed state'
    );
  });

  it('should throw an error if the instruction can not be modified', async () => {
    const endBlock = new BigNumber(10);

    entityMockUtils.configureMocks({
      instructionOptions: {
        detailsFromChain: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          tradeDate: new Date('10/10/2010'),
          endBlock,
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    let error;

    try {
      await assertInstructionValid(instruction, mockContext);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The Instruction cannot be modified; it has already reached its end block'
    );
    expect(error.data.currentBlock).toBe(latestBlock);
    expect(error.data.endBlock).toEqual(endBlock);
  });

  it('should not throw an error', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnAffirmation,
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    let result = await assertInstructionValid(instruction, mockContext);

    expect(result).toBeUndefined();

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Failed,
          type: InstructionType.SettleOnAffirmation,
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    result = await assertInstructionValid(instruction, mockContext);

    expect(result).toBeUndefined();

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(1000000),
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    result = await assertInstructionValid(instruction, mockContext);

    expect(result).toBeUndefined();
  });
});

describe('assertInstructionValidForManualExecution', () => {
  const latestBlock = new BigNumber(200);
  let mockContext: Mocked<Context>;
  let instructionDetails: InstructionDetails;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        latestBlock,
      },
    });
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    instructionDetails = {
      status: InstructionStatus.Pending,
      type: InstructionType.SettleManual,
      endAfterBlock: new BigNumber(100),
    } as InstructionDetails;
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if instruction is already Executed', () => {
    return expect(
      assertInstructionValidForManualExecution(
        {
          ...instructionDetails,
          status: InstructionStatus.Success,
        },
        mockContext
      )
    ).rejects.toThrow('The Instruction has already been executed');
  });

  it('should throw an error if the instruction is not of type SettleManual', async () => {
    return expect(
      assertInstructionValidForManualExecution(
        {
          ...instructionDetails,
          type: InstructionType.SettleOnAffirmation,
        },
        mockContext
      )
    ).rejects.toThrow("You cannot manually execute settlement of type 'SettleOnAffirmation'");
  });

  it('should throw an error if the instruction is being executed before endAfterBlock', async () => {
    const endAfterBlock = new BigNumber(1000);

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Instruction cannot be executed until the specified end after block',
      data: {
        currentBlock: latestBlock,
        endAfterBlock,
      },
    });
    return expect(
      assertInstructionValidForManualExecution(
        {
          ...instructionDetails,
          endAfterBlock,
        } as InstructionDetails,
        mockContext
      )
    ).rejects.toThrowError(expectedError);
  });

  it('should not throw an error', async () => {
    // executing instruction of type SettleManual
    await expect(
      assertInstructionValidForManualExecution(instructionDetails, mockContext)
    ).resolves.not.toThrow();

    // executing failed instruction
    await expect(
      assertInstructionValidForManualExecution(
        {
          ...instructionDetails,
          status: InstructionStatus.Failed,
          type: InstructionType.SettleOnAffirmation,
        },
        mockContext
      )
    ).resolves.not.toThrow();
  });
});

describe('assertPortfolioExists', () => {
  it("should throw an error if the portfolio doesn't exist", async () => {
    entityMockUtils.configureMocks({ numberedPortfolioOptions: { exists: false } });

    const context = dsMockUtils.getContextInstance();

    let error;
    try {
      await assertPortfolioExists({ did: 'someDid', number: new BigNumber(10) }, context);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The Portfolio doesn't exist");
  });

  it('should not throw an error if the portfolio exists', async () => {
    entityMockUtils.configureMocks({ numberedPortfolioOptions: { exists: true } });

    const context = dsMockUtils.getContextInstance();

    let error;
    try {
      await assertPortfolioExists({ did: 'someDid', number: new BigNumber(10) }, context);
      await assertPortfolioExists({ did: 'someDid' }, context);
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
  });
});

describe('assertSecondaryAccounts', () => {
  let signerToSignerValueSpy: jest.SpyInstance<SignerValue, [Signer]>;

  beforeAll(() => {
    signerToSignerValueSpy = jest.spyOn(utilsConversionModule, 'signerToSignerValue');
  });

  it('should not throw an error if all signers are secondary Accounts', async () => {
    const address = 'someAddress';
    const account = entityMockUtils.getAccountInstance({ address });
    const secondaryAccounts = [
      {
        account,
        permissions: {
          assets: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];

    const result = assertSecondaryAccounts([account], secondaryAccounts);
    expect(result).toBeUndefined();
  });

  it('should throw an error if one of the Accounts is not a Secondary Account for the Identity', () => {
    const address = 'someAddress';
    const secondaryAccounts = [
      {
        account: entityMockUtils.getAccountInstance({ address }),
        permissions: {
          assets: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    const accounts = [
      entityMockUtils.getAccountInstance({ address: 'otherAddress', isEqual: false }),
    ];

    signerToSignerValueSpy.mockReturnValue({ type: SignerType.Account, value: address });

    let error;

    try {
      assertSecondaryAccounts(accounts, secondaryAccounts);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('One of the Accounts is not a secondary Account for the Identity');
    expect(error.data.missing).toEqual([accounts[0].address]);
  });
});

describe('assertCaTaxWithholdingsValid', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.setConstMock('corporateAction', 'maxDidWhts', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(1)),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if there are more target Identities than the maximum', async () => {
    expect(() =>
      assertCaTaxWithholdingsValid(
        [
          { identity: 'someDid', percentage: new BigNumber(15) },
          { identity: 'otherDid', percentage: new BigNumber(16) },
        ],
        mockContext
      )
    ).toThrow('Too many tax withholding entries');
  });

  it('should not throw an error if the number of target Identities is appropriate', async () => {
    expect(() =>
      assertCaTaxWithholdingsValid(
        [{ identity: 'someDid', percentage: new BigNumber(15) }],
        mockContext
      )
    ).not.toThrow();
  });
});

describe('assertCaCheckpointValid', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if date is in the past', async () => {
    let checkpoint = new Date(new Date().getTime() - 100000);

    let error;
    try {
      await assertCaCheckpointValid(checkpoint);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Checkpoint date must be in the future');

    checkpoint = new Date(new Date().getTime() + 100000);

    return expect(assertCaCheckpointValid(checkpoint)).resolves.not.toThrow();
  });

  it('should throw an error if the checkpoint does not exist', async () => {
    let checkpoint = entityMockUtils.getCheckpointInstance({
      exists: false,
    });

    let error;
    try {
      await assertCaCheckpointValid(checkpoint);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("Checkpoint doesn't exist");

    checkpoint = entityMockUtils.getCheckpointInstance({
      exists: true,
    });

    return expect(assertCaCheckpointValid(checkpoint)).resolves.not.toThrow();
  });

  it('should throw an error if checkpoint schedule no longer exists', async () => {
    const checkpoint = entityMockUtils.getCheckpointScheduleInstance({
      exists: false,
    });

    let error;
    try {
      await assertCaCheckpointValid(checkpoint);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("Checkpoint Schedule doesn't exist");
  });
});

describe('assertCaCheckpointValid', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if the payment date is earlier than the Checkpoint date', async () => {
    const date = new Date(new Date().getTime() + 10000);

    let checkpoint: CheckpointSchedule | Date = date;
    const paymentDate = new Date(new Date().getTime() - 100000);
    const expiryDate = new Date();

    let error;
    try {
      await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Payment date must be after the Checkpoint date');

    checkpoint = entityMockUtils.getCheckpointScheduleInstance({
      details: {
        nextCheckpointDate: date,
      },
    });
    try {
      await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Payment date must be after the Checkpoint date');
  });

  it('should throw an error if the expiry date is earlier than the Checkpoint date', async () => {
    const date = new Date(new Date().getTime() + 10000);

    let checkpoint: CheckpointSchedule | Date = date;
    const paymentDate = new Date(new Date().getTime() + 20000);
    const expiryDate = new Date(new Date().getTime() - 200000);

    let error;
    try {
      await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Expiry date must be after the Checkpoint date');

    checkpoint = entityMockUtils.getCheckpointScheduleInstance({
      details: {
        nextCheckpointDate: date,
      },
    });

    try {
      await assertDistributionDatesValid(checkpoint, paymentDate, expiryDate);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Expiry date must be after the Checkpoint date');

    checkpoint = entityMockUtils.getCheckpointScheduleInstance({
      details: {
        nextCheckpointDate: new Date(new Date().getTime() - 300000),
      },
    });

    return expect(
      assertDistributionDatesValid(checkpoint, paymentDate, expiryDate)
    ).resolves.not.toThrow();
  });
});

describe('assertRequirementsNotTooComplex', () => {
  let mockContext: Mocked<Context>;

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should throw an error if the total added complexity is greater than max condition complexity', async () => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(2)),
    });
    expect(() =>
      assertRequirementsNotTooComplex(
        [
          {
            type: ConditionType.IsPresent,
            target: ConditionTarget.Both,
            trustedClaimIssuers: ['issuer' as unknown as TrustedClaimIssuer],
          },
          {
            type: ConditionType.IsAnyOf,
            claims: [dsMockUtils.createMockClaim(), dsMockUtils.createMockClaim()],
            target: ConditionTarget.Sender,
          },
        ] as Condition[],
        new BigNumber(1),
        mockContext
      )
    ).toThrow('Compliance Requirement complexity limit exceeded');
  });

  it('should not throw an error if the complexity is less than the max condition complexity', async () => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(50)),
    });
    expect(() =>
      assertRequirementsNotTooComplex(
        [{ type: ConditionType.IsPresent, target: ConditionTarget.Receiver }] as Condition[],
        new BigNumber(1),
        mockContext
      )
    ).not.toThrow();

    expect(() =>
      assertRequirementsNotTooComplex(
        [
          {
            type: ConditionType.IsPresent,
            target: ConditionTarget.Both,
          },
          {
            type: ConditionType.IsAbsent,
            target: ConditionTarget.Sender,
          },
          {
            type: ConditionType.IsAbsent,
            target: ConditionTarget.Receiver,
          },
          {
            type: ConditionType.IsAnyOf,
            claims: [
              dsMockUtils.createMockClaim(),
              dsMockUtils.createMockClaim(),
              dsMockUtils.createMockClaim(),
              dsMockUtils.createMockClaim(),
            ],
            target: ConditionTarget.Both,
          },
        ] as Condition[],
        new BigNumber(2),
        mockContext
      )
    ).not.toThrow();
  });
});

describe('authorization request validations', () => {
  let mockContext: Context;
  let target: Identity;
  let issuer: Identity;
  let expiry: Date;

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    issuer = entityMockUtils.getIdentityInstance();
    target = entityMockUtils.getIdentityInstance();
    dsMockUtils.createQueryMock('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          authorizationData: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
          authId: new BigNumber(1),
          authorizedBy: 'someDid',
          expiry: dsMockUtils.createMockOption(),
        })
      ),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  describe('assertAuthorizationRequestValid', () => {
    it('should throw with an expired request', () => {
      const auth = entityMockUtils.getAuthorizationRequestInstance({ isExpired: true });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Authorization Request has expired',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw with an Authorization that does not exist', () => {
      const auth = entityMockUtils.getAuthorizationRequestInstance({ exists: false });

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Authorization Request no longer exists',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertPrimaryKeyRotationValid', () => {
    const data = { type: AuthorizationType.RotatePrimaryKey } as Authorization;
    it('should not throw with a valid request', () => {
      const goodTarget = entityMockUtils.getAccountInstance({ getIdentity: null });
      const auth = new AuthorizationRequest(
        { authId: new BigNumber(1), target: goodTarget, issuer, expiry, data },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw with target that is an Identity', () => {
      const badTarget = entityMockUtils.getIdentityInstance();
      const auth = new AuthorizationRequest(
        { authId: new BigNumber(1), target: badTarget, issuer, expiry, data },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'An Identity can not become the primary Account of another Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertAttestPrimaryKeyAuthorizationValid', () => {
    const data: Authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: entityMockUtils.getIdentityInstance(),
    };

    it('should not throw with a valid request', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ isCddProvider: true });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw with non CDD provider Issuer', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ isCddProvider: false });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Issuer must be a CDD provider',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertTransferTickerAuthorizationValid', () => {
    it('should not throw with a valid request', () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.Reserved } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: '0x12341234123412341234123412341234',
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw with an unreserved assetId', () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.Free } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: '0x12341234123412341234123412341234',
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Ticker is not reserved',
      });
      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw with an already used assetId', () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.AssetCreated } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: '0x12341234123412341234123412341234',
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Ticker has already been used to create an Asset',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertTransferAssetOwnershipAuthorizationValid', () => {
    it('should not throw with a valid request', () => {
      entityMockUtils.configureMocks({ fungibleAssetOptions: { exists: true } });
      const data: Authorization = {
        type: AuthorizationType.TransferAssetOwnership,
        value: '0x12341234123412341234123412341234',
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          issuer,
          target,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw with a Asset that does not exist', () => {
      entityMockUtils.configureMocks({ fungibleAssetOptions: { exists: false } });
      const data: Authorization = {
        type: AuthorizationType.TransferAssetOwnership,
        value: '0x12341234123412341234123412341234',
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          issuer,
          target,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Asset does not exist',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertPortfolioCustodyAuthorizationValid', () => {
    it('should throw with a valid request', () => {
      const data: Authorization = {
        type: AuthorizationType.PortfolioCustody,
        value: entityMockUtils.getNumberedPortfolioInstance(),
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });
  });

  describe('assertJoinOrRotateAuthorizationValid', () => {
    const permissions = {
      assets: null,
      transactions: null,
      transactionGroups: [],
      portfolios: null,
    };
    const data: Authorization = {
      type: AuthorizationType.JoinIdentity,
      value: permissions,
    };
    it('should not throw with a valid request', () => {
      const mockTarget = entityMockUtils.getAccountInstance({ getIdentity: null });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: mockTarget,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw when the issuer lacks a valid CDD', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: false });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Issuing Identity does not have a valid CDD claim',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw when the target is an Identity', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const mockTarget = entityMockUtils.getIdentityInstance();
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: mockTarget,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target cannot be an Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw if the target already has an Identity', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const mockTarget = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ isEqual: false }),
      });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: mockTarget,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target Account already has an associated Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should not throw if the target is already associated to the identity', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const mockTarget = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ isEqual: true }),
      });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: mockTarget,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });
  });

  describe('assertAddRelayerPayingKeyAuthorizationValid', () => {
    const allowance = new BigNumber(100);
    it('should not throw with a valid request', () => {
      const subsidizer = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: true }),
      });
      const beneficiary = entityMockUtils.getAccountInstance({ getIdentity: target });

      const subsidy = {
        beneficiary,
        subsidizer,
        allowance,
        remaining: allowance,
      };
      const data: Authorization = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: subsidy,
      };

      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw with a beneficiary that does not have a CDD Claim', () => {
      const subsidizer = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance(),
      });
      const beneficiary = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: false }),
      });

      const subsidy = {
        beneficiary,
        subsidizer,
        allowance,
        remaining: allowance,
      };
      const data: Authorization = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: subsidy,
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Beneficiary Account does not have a valid CDD Claim',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw with a Subsidizer that does not have a CDD Claim', () => {
      const beneficiary = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: true }),
      });
      // getIdentityInstance modifies the prototype, which prevents two mocks from returning different values
      const subsidizer = {
        getIdentity: () => {
          return { hasValidCdd: (): boolean => false };
        },
      } as unknown as Account;

      const subsidy = {
        beneficiary,
        subsidizer,
        allowance,
        remaining: allowance,
      };
      const data: Authorization = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: subsidy,
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Subsidizer Account does not have a valid CDD Claim',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw with a beneficiary that does not have an Identity', () => {
      const subsidizer = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: false }),
      });
      const beneficiary = entityMockUtils.getAccountInstance({ getIdentity: null });

      const subsidy = {
        beneficiary,
        subsidizer,
        allowance,
        remaining: allowance,
      };
      const data: Authorization = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: subsidy,
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Beneficiary Account does not have an Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw with a Subsidizer that does not have an Identity', () => {
      const beneficiary = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: true }),
      });
      // getIdentityInstance modifies the prototype, which prevents two mocks from returning different values
      const subsidizer = {
        getIdentity: () => null,
      } as unknown as Account;

      const subsidy = {
        beneficiary,
        subsidizer,
        allowance,
        remaining: allowance,
      };
      const data: Authorization = {
        type: AuthorizationType.AddRelayerPayingKey,
        value: subsidy,
      };
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Subsidizer Account does not have an Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('assertMultiSigSignerAuthorizationValid', () => {
    beforeAll(() => {
      dsMockUtils.initMocks();
    });

    afterAll(() => {
      dsMockUtils.cleanup();
    });

    it('should not throw with a valid request', () => {
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer,
          expiry,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'multisigAddress',
          },
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw if the multisig is being added as its own signer', () => {
      const address = 'multiSigAddress';

      const badTarget = entityMockUtils.getAccountInstance({
        address,
        getIdentity: null,
      });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: badTarget,
          issuer,
          expiry,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: address,
          },
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A multisig cannot be its own signer',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw if the target Account is already associated to an Identity', () => {
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: entityMockUtils.getAccountInstance(),
          issuer,
          expiry,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'address',
          },
        },
        mockContext
      );

      dsMockUtils
        .createQueryMock('identity', 'keyRecords')
        .mockResolvedValue(
          dsMockUtils.createMockOption(
            dsMockUtils.createMockKeyRecord({ PrimaryKey: createMockIdentityId('someDid') })
          )
        );

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The target Account is already part of an Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw if the target Account is already associated to a multisig', () => {
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: entityMockUtils.getAccountInstance({ getIdentity: null }),
          issuer,
          expiry,
          data: {
            type: AuthorizationType.AddMultiSigSigner,
            value: 'address',
          },
        },
        mockContext
      );

      dsMockUtils.createQueryMock('identity', 'keyRecords').mockReturnValue(
        dsMockUtils.createMockOption(
          dsMockUtils.createMockKeyRecord({
            MultiSigSignerKey: createMockAccountId('someAddress'),
          })
        )
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The target Account is already associated to a multisig address',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('assertRotatePrimaryKeyToSecondaryAuthorization', () => {
    beforeAll(() => {
      dsMockUtils.initMocks();
    });

    afterAll(() => {
      dsMockUtils.cleanup();
    });

    const permissions = {
      assets: null,
      transactions: null,
      transactionGroups: [],
      portfolios: null,
    };
    const data: Authorization = {
      type: AuthorizationType.RotatePrimaryKeyToSecondary,
      value: permissions,
    };

    it('should not throw with a valid request', () => {
      const validTarget = entityMockUtils.getAccountInstance({ getIdentity: null });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: validTarget,
          issuer,
          expiry,
          data,
        },
        mockContext
      );

      return expect(assertAuthorizationRequestValid(auth, mockContext)).resolves.not.toThrow();
    });

    it('should throw when the issuer lacks a valid CDD', () => {
      const noCddIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: false });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target,
          issuer: noCddIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Issuing Identity does not have a valid CDD claim',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw when the target is an Identity', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const identityTarget = entityMockUtils.getIdentityInstance();
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: identityTarget,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target cannot be an Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });

    it('should throw if the target already has an Identity', () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const unavailableTarget = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ isEqual: false }),
      });
      const auth = new AuthorizationRequest(
        {
          authId: new BigNumber(1),
          target: unavailableTarget,
          issuer: mockIssuer,
          expiry,
          data,
        },
        mockContext
      );

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target Account already has an associated Identity',
      });

      return expect(assertAuthorizationRequestValid(auth, mockContext)).rejects.toThrowError(
        expectedError
      );
    });
  });

  describe('unreachable code', () => {
    it('should throw an error with an any assertion', () => {
      const expectedError = new UnreachableCaseError({ type: 'FAKE_TYPE' } as never);
      return expect(
        assertAuthorizationRequestValid(
          {
            data: { type: 'FAKE_TYPE' },
            isExpired: () => false,
            exists: () => true,
          } as never,
          mockContext
        )
      ).rejects.toThrowError(expectedError);
    });
  });
});

describe('assertValidCdd', () => {
  it('should resolve if the identity has a valid CDD claim', () => {
    const context = dsMockUtils.getContextInstance();
    const identity = entityMockUtils.getIdentityInstance({ hasValidCdd: true });

    return expect(assertValidCdd(identity, context)).resolves.not.toThrow();
  });

  it('should throw an error if the identity does not have a valid CDD claim', () => {
    const context = dsMockUtils.getContextInstance();
    const identity = entityMockUtils.getIdentityInstance({ hasValidCdd: false });

    const expectedError = new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The identity does not have a valid CDD claim',
    });

    return expect(assertValidCdd(identity, context)).rejects.toThrow(expectedError);
  });
});

describe('Unreachable error case', () => {
  it('should throw error if called via type assertion', () => {
    const message = 'Should never happen' as never;
    const error = new UnreachableCaseError(message);
    expect(error.message).toEqual(`Unreachable case: "${message}"`);
  });
});

describe('createAuthorizationResolver', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  const filterRecords = (): unknown => [
    { event: { data: [undefined, undefined, undefined, '3', undefined] } },
  ];

  it('should return a function that creates an AuthorizationRequest', () => {
    const authData: Authorization = {
      type: AuthorizationType.RotatePrimaryKey,
    };

    const resolver = createAuthorizationResolver(
      authData,
      entityMockUtils.getIdentityInstance(),
      entityMockUtils.getIdentityInstance(),
      null,
      mockContext
    );
    const authRequest = resolver({
      filterRecords,
    } as unknown as ISubmittableResult);
    expect(authRequest.authId).toEqual(new BigNumber(3));
  });
});

describe('createCreateGroupResolver', () => {
  const agId = new BigNumber(1);
  const assetId = '0x12341234123412341234123412341234';

  let rawAgId: u64;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;

  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();

    rawAgId = dsMockUtils.createMockU64(agId);
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  it('should return the new CustomPermissionGroup', () => {
    const filterRecords = (): unknown => [{ event: { data: ['someDid', rawAssetId, rawAgId] } }];

    const resolver = createCreateGroupResolver(mockContext);
    const result = resolver({
      filterRecords,
    } as unknown as ISubmittableResult);

    expect(result.id).toEqual(agId);
    expect(result.asset.id).toEqual(hexToUuid(assetId));
  });
});

describe('assertGroupNotExists', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  it('should throw an error if there already exists a group for the asset with exactly the same permissions as the ones passed', async () => {
    const assetId = '12341234-1234-1234-1234-123412341234';

    const transactions = {
      type: PermissionType.Include,
      values: [TxTags.sto.Invest, TxTags.asset.CreateAsset],
    };
    const customId = new BigNumber(1);

    let asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetGroups: {
        custom: [
          entityMockUtils.getCustomPermissionGroupInstance({
            assetId,
            id: customId,
            getPermissions: {
              transactions,
              transactionGroups: [],
            },
          }),
        ],
        known: [],
      },
    });

    let error;

    try {
      await assertGroupDoesNotExist(asset, transactions);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There already exists a group with the exact same permissions');
    expect(error.data.groupId).toEqual(customId);

    asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetGroups: {
        custom: [],
        known: [
          entityMockUtils.getKnownPermissionGroupInstance({
            assetId,
            type: PermissionGroupType.Full,
            getPermissions: {
              transactions: null,
              transactionGroups: [],
            },
          }),
        ],
      },
    });

    error = undefined;

    try {
      await assertGroupDoesNotExist(asset, null);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('There already exists a group with the exact same permissions');
    expect(error.data.groupId).toEqual(PermissionGroupType.Full);

    error = undefined;

    try {
      await assertGroupDoesNotExist(asset, {
        type: PermissionType.Include,
        values: [TxTags.asset.AcceptAssetOwnershipTransfer],
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
  });
});

describe('getGroupFromPermissions', () => {
  const assetId = '0x12341234123412341234123412341234';

  const transactions = {
    type: PermissionType.Include,
    values: [TxTags.sto.Invest, TxTags.asset.CreateAsset],
  };
  const customId = new BigNumber(1);

  let asset: FungibleAsset;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    asset = entityMockUtils.getFungibleAssetInstance({
      assetId,
      permissionsGetGroups: {
        custom: [
          entityMockUtils.getCustomPermissionGroupInstance({
            assetId,
            id: customId,
            getPermissions: {
              transactions,
              transactionGroups: [],
            },
          }),
        ],
        known: [],
      },
    });
  });

  it('should return a Permission Group if there is one with the same permissions', async () => {
    const result = (await getGroupFromPermissions(asset, transactions)) as CustomPermissionGroup;

    expect(result.id).toEqual(customId);
  });

  it('should return undefined if there is no group with the passed permissions', async () => {
    const result = await getGroupFromPermissions(asset, {
      type: PermissionType.Exclude,
      values: [TxTags.authorship.SetUncles],
    });

    expect(result).toBeUndefined();
  });
});
