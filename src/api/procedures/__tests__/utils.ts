import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  assertAuthorizationRequestValid,
  assertCaCheckpointValid,
  assertCaTargetsValid,
  assertCaTaxWithholdingsValid,
  assertDistributionDatesValid,
  assertInstructionValid,
  assertPortfolioExists,
  assertRequirementsNotTooComplex,
  assertSecondaryAccounts,
  createAuthorizationResolver,
  UnreachableCaseError,
} from '~/api/procedures/utils';
import {
  AuthorizationRequest,
  CheckpointSchedule,
  Context,
  Identity,
  Instruction,
  PolymeshError,
  PostTransactionValue,
} from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
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
  Signer,
  SignerType,
  SignerValue,
  TargetTreatment,
  TickerReservationStatus,
  TrustedClaimIssuer,
} from '~/types';
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
  '~/api/entities/SecurityToken',
  require('~/testUtils/mocks/entities').mockSecurityTokenModule('~/api/entities/SecurityToken')
);

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
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
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if instruction is not in pending state', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Executed,
        } as InstructionDetails,
      },
    });

    instruction = entityMockUtils.getInstructionInstance();

    return expect(assertInstructionValid(instruction, mockContext)).rejects.toThrow(
      'The Instruction must be in pending state'
    );
  });

  test('should throw an error if the instruction can not be modified', async () => {
    const endBlock = new BigNumber(10);

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
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

  test('should not throw an error', async () => {
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

describe('assertPortfolioExists', () => {
  test("should throw an error if the portfolio doesn't exist", async () => {
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

  test('should not throw an error if the portfolio exists', async () => {
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
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  beforeAll(() => {
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
  });

  test('should not throw an error if all signers are secondary Accounts', async () => {
    const address = 'someAddress';
    const account = entityMockUtils.getAccountInstance({ address });
    const secondaryAccounts = [
      {
        account,
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];

    const result = assertSecondaryAccounts([account], secondaryAccounts);
    expect(result).toBeUndefined();
  });

  test('should throw an error if one of the Accounts is not a Secondary Account for the Identity', () => {
    const address = 'someAddress';
    const secondaryAccounts = [
      {
        account: entityMockUtils.getAccountInstance({ address }),
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    const accounts = [entityMockUtils.getAccountInstance({ address: 'otherAddress' })];

    signerToSignerValueStub.returns({ type: SignerType.Account, value: address });

    let error;

    try {
      assertSecondaryAccounts(accounts, secondaryAccounts);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('One of the Signers is not a secondary Account for the Identity');
    expect(error.data.missing).toEqual([accounts[0].address]);
  });
});

describe('assertCaTargetsValid', () => {
  let mockContext: Mocked<Context>;

  beforeAll(() => {
    dsMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.setConstMock('corporateAction', 'maxTargetIds', {
      returnValue: dsMockUtils.createMockU32(1),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should throw an error if there are more target identities than the maximum', async () => {
    expect(() =>
      assertCaTargetsValid(
        { identities: ['someDid', 'otherDid'], treatment: TargetTreatment.Include },
        mockContext
      )
    ).toThrow('Too many target Identities');
  });

  test('should not throw an error if the number of target identities is appropriate', async () => {
    expect(() =>
      assertCaTargetsValid(
        { identities: ['someDid'], treatment: TargetTreatment.Include },
        mockContext
      )
    ).not.toThrow();
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
      returnValue: dsMockUtils.createMockU32(1),
    });
  });

  afterEach(() => {
    dsMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
  });

  test('should throw an error if there are more target identities than the maximum', async () => {
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

  test('should not throw an error if the number of target identities is appropriate', async () => {
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

  test('should throw an error if date is in the past', async () => {
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

  test('should throw an error if the checkpoint does not exist', async () => {
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

  test('should throw an error if checkpoint schedule no longer exists', async () => {
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

  test('should throw an error if the payment date is earlier than the Checkpoint date', async () => {
    const date = new Date(new Date().getTime());

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

  test('should throw an error if the expiry date is earlier than the Checkpoint date', async () => {
    const date = new Date(new Date().getTime() - 100000);

    let checkpoint: CheckpointSchedule | Date = date;
    const paymentDate = new Date(new Date().getTime());
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

  test('should throw an error if the complexity sumatory is greater than max condition complexity', async () => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(2),
    });
    expect(() =>
      assertRequirementsNotTooComplex(
        [
          {
            type: ConditionType.IsPresent,
            target: ConditionTarget.Both,
            trustedClaimIssuers: [('issuer' as unknown) as TrustedClaimIssuer],
          },
          {
            type: ConditionType.IsAnyOf,
            claims: [dsMockUtils.createMockClaim(), dsMockUtils.createMockClaim()],
            target: ConditionTarget.Sender,
          },
        ] as Condition[],
        1,
        mockContext
      )
    ).toThrow('Compliance Requirement complexity limit exceeded');
  });

  test('should not throw an error if the complexity is less than the max condition complexity', async () => {
    dsMockUtils.setConstMock('complianceManager', 'maxConditionComplexity', {
      returnValue: dsMockUtils.createMockU32(10),
    });
    expect(() =>
      assertRequirementsNotTooComplex(
        [{ type: ConditionType.IsPresent, target: ConditionTarget.Receiver }] as Condition[],
        1,
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
    dsMockUtils.createQueryStub('identity', 'authorizations', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockAuthorization({
          /* eslint-disable @typescript-eslint/naming-convention */
          authorization_data: dsMockUtils.createMockAuthorizationData('RotatePrimaryKey'),
          auth_id: 1,
          authorized_by: 'someDid',
          expiry: dsMockUtils.createMockOption(),
          /* eslint-enable @typescript-eslint/naming-convention */
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
    entityMockUtils.cleanup();
  });

  describe('assertAuthorizationRequestValid', () => {
    test('should throw with an expired request', async () => {
      const auth = entityMockUtils.getAuthorizationRequestInstance({ isExpired: true });

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Authorization Request has expired',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw with an Authorization that does not exist', async () => {
      const auth = entityMockUtils.getAuthorizationRequestInstance({ exists: false });
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }

      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Authorization Request no longer exists',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('assertPrimaryKeyRotationValid', () => {
    const data = { type: AuthorizationType.RotatePrimaryKey } as Authorization;
    test('should not throw with a valid request', async () => {
      const goodTarget = entityMockUtils.getAccountInstance({ getIdentity: null });
      const auth = new AuthorizationRequest(
        { authId: new BigNumber(1), target: goodTarget, issuer, expiry, data },
        mockContext
      );
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw not with target that is an Identity', async () => {
      const badTarget = entityMockUtils.getIdentityInstance();
      const auth = new AuthorizationRequest(
        { authId: new BigNumber(1), target: badTarget, issuer, expiry, data },
        mockContext
      );

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'An Identity can not become the primary Account of another Identity',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('assertAttestPrimaryKeyAuthorizationValid', () => {
    const data: Authorization = {
      type: AuthorizationType.AttestPrimaryKeyRotation,
      value: '',
    };
    test('should not throw with a valid request', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw with non CDD provider Issuer', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Issuer must be a CDD provider',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('assertTransferTickerAuthorizationValid', () => {
    test('should not throw with a valid request', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.Reserved } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: 'TICKER',
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw with an unreserved ticker', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.Free } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: 'TICKER',
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Ticker is not reserved',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw with an already used ticker', async () => {
      entityMockUtils.configureMocks({
        tickerReservationOptions: { details: { status: TickerReservationStatus.TokenCreated } },
      });
      const data: Authorization = {
        type: AuthorizationType.TransferTicker,
        value: 'TICKER',
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Ticker has already been used to create an Asset',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('assertTransferAssetOwnershipAuthorizationValid', () => {
    test('should not throw with a valid request', async () => {
      entityMockUtils.configureMocks({ securityTokenOptions: { exists: true } });
      const data: Authorization = {
        type: AuthorizationType.TransferAssetOwnership,
        value: 'TICKER',
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw with a Asset that does not exist', async () => {
      entityMockUtils.configureMocks({ securityTokenOptions: { exists: false } });
      const data: Authorization = {
        type: AuthorizationType.TransferAssetOwnership,
        value: 'TICKER',
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Asset does not exist',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('PortfolioCustody', () => {
    test('should throw with a valid request', async () => {
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });
  });

  describe('assertJoinIdentityAuthorizationValid', () => {
    const permissions = {
      tokens: null,
      transactions: null,
      transactionGroups: [],
      portfolios: null,
    };
    const data: Authorization = {
      type: AuthorizationType.JoinIdentity,
      value: permissions,
    };
    test('should not throw with a valid request', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw when the issuer lacks a valid CDD', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Issuing Identity does not have a valid CDD claim',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw when the target is an Identity', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target cannot be an Identity',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw if the target already has an Identity', async () => {
      const mockIssuer = entityMockUtils.getIdentityInstance({ hasValidCdd: true });
      const mockTarget = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance(),
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The target Account already has an associated Identity',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('assertAddRelayerPayingKeyAuthorizationValid', () => {
    const allowance = new BigNumber(100);
    test('should not throw with a valid request', async () => {
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

      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      expect(error).toBe(undefined);
    });

    test('should throw with a beneficiary that does not have a CDD Claim', async () => {
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Beneficiary Account does not have a valid CDD Claim',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw with a Subsidizer that does not have a CDD Claim', async () => {
      const beneficiary = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: true }),
      });
      // getIdentityInstance modifies the prototype, which prevents two mocks from returning different values
      const subsidizer = ({
        getIdentity: () => {
          return { hasValidCdd: () => false };
        },
      } as unknown) as Account;

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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Subsidizer Account does not have a valid CDD Claim',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw with a beneficiary that does not have an Identity', async () => {
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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Beneficiary Account does not have an Identity',
      });
      expect(error).toEqual(expectedError);
    });

    test('should throw with a Subsidizer that does not have an Identity', async () => {
      const beneficiary = entityMockUtils.getAccountInstance({
        getIdentity: entityMockUtils.getIdentityInstance({ hasValidCdd: true }),
      });
      // getIdentityInstance modifies the prototype, which prevents two mocks from returning different values
      const subsidizer = ({
        getIdentity: () => null,
      } as unknown) as Account;

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
      let error;
      try {
        await assertAuthorizationRequestValid(auth, mockContext);
      } catch (err) {
        error = err;
      }
      const expectedError = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Subsidizer Account does not have an Identity',
      });
      expect(error).toEqual(expectedError);
    });
  });

  describe('unreachable code', () => {
    test('with an any assertion', async () => {
      let error;
      try {
        await assertAuthorizationRequestValid(
          {
            data: { type: 'FAKE_TYPE' },
            isExpired: () => false,
            exists: () => true,
          } as never,
          mockContext
        );
      } catch (err) {
        error = err;
      }
      const expectedError = new UnreachableCaseError({ type: 'FAKE_TYPE' } as never);
      expect(error).toEqual(expectedError);
    });
  });
});

describe('Unreachable error case', () => {
  test('should throw error if called via type assertion', async () => {
    const message = 'Should never happen' as never;
    const error = new UnreachableCaseError(message);
    expect(error.message).toEqual(`Unreachable case: "${message}"`);
  });
});

describe('createAuthorizationResolver', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });
  const filterRecords = () => [
    { event: { data: [undefined, undefined, undefined, '3', undefined] } },
  ];

  test('should return a function that creates an AuthorizationRequest', async () => {
    const mockContext = dsMockUtils.getContextInstance();

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
    const authRequest = resolver(({
      filterRecords: filterRecords,
    } as unknown) as ISubmittableResult);
    expect(authRequest.authId).toEqual(new BigNumber(3));
  });

  test('should return a function that creates an AuthorizationRequest with a PostTransaction Authorization', async () => {
    const mockContext = dsMockUtils.getContextInstance();

    const authData: Authorization = {
      type: AuthorizationType.RotatePrimaryKey,
    };

    const postTransaction = new PostTransactionValue(() => authData);
    await postTransaction.run({} as ISubmittableResult);

    const resolver = createAuthorizationResolver(
      postTransaction,
      entityMockUtils.getIdentityInstance(),
      entityMockUtils.getIdentityInstance(),
      null,
      mockContext
    );

    const authRequest = resolver(({
      filterRecords: filterRecords,
    } as unknown) as ISubmittableResult);
    expect(authRequest.authId).toEqual(new BigNumber(3));
  });
});
