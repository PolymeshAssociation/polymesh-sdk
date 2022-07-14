import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';
import P from 'bluebird';
import { isEqual } from 'lodash';

import {
  Account,
  Asset,
  AuthorizationRequest,
  Checkpoint,
  CheckpointSchedule,
  Context,
  CustomPermissionGroup,
  Identity,
  Instruction,
  KnownPermissionGroup,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  TickerReservation,
  Venue,
} from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  Authorization,
  AuthorizationType,
  Condition,
  ConditionTarget,
  ConditionType,
  ErrorCode,
  GenericAuthorizationData,
  InputCondition,
  InputTaxWithholding,
  InstructionStatus,
  InstructionType,
  PermissionedAccount,
  PermissionGroupType,
  PortfolioId,
  Signer,
  TickerReservationStatus,
  TransactionPermissions,
} from '~/types';
import { MaybePostTransactionValue } from '~/types/internal';
import { tickerToString, u32ToBigNumber, u64ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export async function assertInstructionValid(
  instruction: Instruction,
  context: Context
): Promise<void> {
  const details = await instruction.details();
  const { status, type } = details;

  if (status !== InstructionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Instruction must be in pending state',
    });
  }

  if (type === InstructionType.SettleOnBlock) {
    const latestBlock = await context.getLatestBlock();
    const { endBlock } = details;

    if (latestBlock.gte(endBlock)) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'The Instruction cannot be modified; it has already reached its end block',
        data: {
          currentBlock: latestBlock,
          endBlock,
        },
      });
    }
  }
}

/**
 * @hidden
 */
export async function assertPortfolioExists(
  portfolioId: PortfolioId,
  context: Context
): Promise<void> {
  const { did, number } = portfolioId;

  if (number) {
    const numberedPortfolio = new NumberedPortfolio({ did, id: number }, context);
    const exists = await numberedPortfolio.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: "The Portfolio doesn't exist",
        data: {
          did,
          portfolioId: number,
        },
      });
    }
  }
}

/**
 * @hidden
 */
export async function assertVenueExists(venueId: BigNumber, context: Context): Promise<void> {
  const venue = new Venue({ id: venueId }, context);
  const exists = await venue.exists();

  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: "The Venue doesn't exist",
      data: {
        venueId,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertSecondaryAccounts(
  accounts: Account[],
  secondaryAccounts: PermissionedAccount[]
): void {
  const notInTheList: string[] = [];
  accounts.forEach(account => {
    const isPresent = secondaryAccounts.find(({ account: existingAccount }) =>
      account.isEqual(existingAccount)
    );
    if (!isPresent) {
      notInTheList.push(account.address);
    }
  });

  if (notInTheList.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One of the Accounts is not a secondary Account for the Identity',
      data: {
        missing: notInTheList,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertDistributionOpen(paymentDate: Date, expiryDate: Date | null): void {
  const now = new Date();

  if (paymentDate > now) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: "The Distribution's payment date hasn't been reached",
      data: { paymentDate },
    });
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }
}

/**
 * @hidden
 */
export function assertCaTaxWithholdingsValid(
  taxWithholdings: InputTaxWithholding[],
  context: Context
): void {
  const { maxDidWhts } = context.polymeshApi.consts.corporateAction;

  const maxWithholdingEntries = u32ToBigNumber(maxDidWhts);

  if (maxWithholdingEntries.lt(taxWithholdings.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many tax withholding entries',
      data: {
        maxWithholdingEntries,
      },
    });
  }
}

/**
 * @hidden
 */
export async function assertCaCheckpointValid(
  checkpoint: Checkpoint | CheckpointSchedule | Date
): Promise<void> {
  if (checkpoint instanceof Date) {
    if (checkpoint <= new Date()) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'Checkpoint date must be in the future',
      });
    }
  } else {
    const exists = await checkpoint.exists();

    if (!exists) {
      throw new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message:
          checkpoint instanceof Checkpoint
            ? "Checkpoint doesn't exist"
            : "Checkpoint Schedule doesn't exist",
      });
    }
  }
}

/**
 * @hidden
 */
export async function assertDistributionDatesValid(
  checkpoint: CheckpointSchedule | Date,
  paymentDate: Date,
  expiryDate: Date | null
): Promise<void> {
  let checkpointDate: Date;

  await assertCaCheckpointValid(checkpoint);

  if (checkpoint instanceof Date) {
    checkpointDate = checkpoint;
  } else {
    ({ nextCheckpointDate: checkpointDate } = await checkpoint.details());
  }

  if (paymentDate <= checkpointDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Payment date must be after the Checkpoint date',
    });
  }

  if (expiryDate && expiryDate < checkpointDate) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be after the Checkpoint date',
    });
  }
}

/**
 * @hidden
 */
export function isFullGroupType(group: KnownPermissionGroup | CustomPermissionGroup): boolean {
  return group instanceof KnownPermissionGroup && group.type === PermissionGroupType.Full;
}

/**
 * @hidden
 *
 * @note based on the complexity calculation done by the chain
 * @note conditions have already been "injected" with the default trusted claim issuers when they reach this point
 */
export function assertRequirementsNotTooComplex(
  conditions: (Condition | InputCondition)[],
  defaultClaimIssuerLength: BigNumber,
  context: Context
): void {
  const { maxConditionComplexity: maxComplexity } = context.polymeshApi.consts.complianceManager;
  let complexitySum = new BigNumber(0);

  conditions.forEach(condition => {
    const { target, trustedClaimIssuers = [] } = condition;
    switch (condition.type) {
      case ConditionType.IsPresent:
      case ConditionType.IsIdentity:
      case ConditionType.IsAbsent:
        // single claim conditions add one to the complexity
        complexitySum = complexitySum.plus(1);
        break;
      case ConditionType.IsAnyOf:
      case ConditionType.IsNoneOf:
        // multi claim conditions add one to the complexity per each claim
        complexitySum = complexitySum.plus(condition.claims.length);
        break;
    }

    // if the condition affects both, it actually represents two conditions on chain
    if (target === ConditionTarget.Both) {
      complexitySum = complexitySum.multipliedBy(2);
    }

    const claimIssuerLength = trustedClaimIssuers.length || defaultClaimIssuerLength;
    complexitySum = complexitySum.multipliedBy(claimIssuerLength);
  });

  if (u32ToBigNumber(maxComplexity).lt(complexitySum)) {
    throw new PolymeshError({
      code: ErrorCode.LimitExceeded,
      message: 'Compliance Requirement complexity limit exceeded',
      data: { limit: maxComplexity },
    });
  }
}

/**
 * @hidden
 *
 * Asserts valid primary key rotation authorization
 */
export async function assertPrimaryKeyRotationAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  if (authRequest.target instanceof Identity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'An Identity can not become the primary Account of another Identity',
    });
  }
}

/**
 * @hidden
 *
 * Asserts valid attest primary key authorization
 */
export async function assertAttestPrimaryKeyAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  const isCddProvider = await authRequest.issuer.isCddProvider();
  if (!isCddProvider) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuer must be a CDD provider',
    });
  }
}

/**
 * @hidden
 *
 * Asserts transfer ticker authorization is valid
 */
export async function assertTransferTickerAuthorizationValid(
  data: GenericAuthorizationData,
  context: Context
): Promise<void> {
  const reservation = new TickerReservation({ ticker: data.value }, context);
  const { status } = await reservation.details();
  if (status === TickerReservationStatus.Free) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Ticker is not reserved',
    });
  }
  if (status === TickerReservationStatus.AssetCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Ticker has already been used to create an Asset',
    });
  }
}

/**
 * @hidden
 *
 * Asserts valid transfer asset ownership authorization
 */
export async function assertTransferAssetOwnershipAuthorizationValid(
  data: GenericAuthorizationData,
  context: Context
): Promise<void> {
  const asset = new Asset({ ticker: data.value }, context);
  const exists = await asset.exists();
  if (!exists)
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Asset does not exist',
    });
}

/**
 * @hidden
 *
 * Asserts valid add multisig signer authorization
 */
export async function assertMultiSigSignerAuthorizationValid(
  data: GenericAuthorizationData,
  target: Signer,
  context: Context
): Promise<void> {
  if (target instanceof Account) {
    const { address } = target;
    if (address === data.value) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'A multisig cannot be its own signer',
      });
    }

    const identityRecord = await context.polymeshApi.query.identity.keyRecords(address);

    if (identityRecord.isSome) {
      const record = identityRecord.unwrap();
      if (record.isPrimaryKey || record.isSecondaryKey) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'The target Account is already part of an Identity',
        });
      }

      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The target Account is already associated to a multisig address',
      });
    }
  }
}

/**
 * @hidden
 *
 * Asserts valid add relayer paying key authorization
 */
export async function assertAddRelayerPayingKeyAuthorizationValid(
  data: AddRelayerPayingKeyAuthorizationData
): Promise<void> {
  const subsidy = data.value;

  const [beneficiaryIdentity, subsidizerIdentity] = await Promise.all([
    subsidy.beneficiary.getIdentity(),
    subsidy.subsidizer.getIdentity(),
  ]);

  if (!beneficiaryIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have an Identity',
    });
  }

  if (!subsidizerIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Subsidizer Account does not have an Identity',
    });
  }
  const [isBeneficiaryCddValid, isSubsidizerCddValid] = await Promise.all([
    beneficiaryIdentity.hasValidCdd(),
    subsidizerIdentity.hasValidCdd(),
  ]);

  if (!isBeneficiaryCddValid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have a valid CDD Claim',
    });
  }

  if (!isSubsidizerCddValid) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Subsidizer Account does not have a valid CDD Claim',
    });
  }
}

/**
 * @hidden
 *
 * Assert the target is an Account
 */
function assertIsAccount(target: Signer): asserts target is Account {
  if (target instanceof Identity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target cannot be an Identity',
    });
  }
}

/**
 * @hidden
 *
 * Asserts valid authorization for JoinIdentity and RotatePrimaryKeyToSecondary types
 */
async function assertJoinOrRotateAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  const { issuer, target } = authRequest;
  const hasValidCdd = await issuer.hasValidCdd();
  if (!hasValidCdd) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuing Identity does not have a valid CDD claim',
    });
  }

  assertIsAccount(target);

  const targetIdentity = await target.getIdentity();
  if (targetIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The target Account already has an associated Identity',
    });
  }
}

/**
 * @hidden
 *
 * Helper class to ensure a code path is unreachable. For example this can be used for ensuring switch statements are exhaustive
 */
export class UnreachableCaseError extends Error {
  /** This should never be called */
  constructor(val: never) {
    super(`Unreachable case: ${JSON.stringify(val)}`);
  }
}

/**
 * @hidden
 */
export async function assertAuthorizationRequestValid(
  authRequest: AuthorizationRequest,
  context: Context
): Promise<void> {
  const exists = await authRequest.exists();
  if (!exists) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Authorization Request no longer exists',
    });
  }
  if (authRequest.isExpired()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Authorization Request has expired',
      data: {
        expiry: authRequest.expiry,
      },
    });
  }
  const { data, target } = authRequest;
  switch (data.type) {
    case AuthorizationType.RotatePrimaryKey:
      return assertPrimaryKeyRotationAuthorizationValid(authRequest);
    case AuthorizationType.AttestPrimaryKeyRotation:
      return assertAttestPrimaryKeyAuthorizationValid(authRequest);
    case AuthorizationType.TransferTicker:
      return assertTransferTickerAuthorizationValid(data, context);
    case AuthorizationType.TransferAssetOwnership:
      return assertTransferAssetOwnershipAuthorizationValid(data, context);
    case AuthorizationType.BecomeAgent:
      // no additional checks
      return;
    case AuthorizationType.AddMultiSigSigner:
      return assertMultiSigSignerAuthorizationValid(data, target, context);
    case AuthorizationType.PortfolioCustody:
      // no additional checks
      return;
    case AuthorizationType.JoinIdentity:
      return assertJoinOrRotateAuthorizationValid(authRequest);
    case AuthorizationType.AddRelayerPayingKey:
      return assertAddRelayerPayingKeyAuthorizationValid(data);
    case AuthorizationType.RotatePrimaryKeyToSecondary:
      return assertJoinOrRotateAuthorizationValid(authRequest);
    default:
      throw new UnreachableCaseError(data); // ensures switch statement covers all values
  }
}

/**
 * @hidden
 *
 * Retrieve the Permission Group that has the same permissions as the ones passed as input, or undefined if
 *   there is no matching group
 */
export async function getGroupFromPermissions(
  asset: Asset,
  permissions: TransactionPermissions | null
): Promise<(CustomPermissionGroup | KnownPermissionGroup) | undefined> {
  const { custom, known } = await asset.permissions.getGroups();
  const allGroups = [...custom, ...known];

  const currentGroupPermissions = await P.map(allGroups, group => group.getPermissions());

  const duplicatedGroupIndex = currentGroupPermissions.findIndex(
    ({ transactions: transactionPermissions }) => isEqual(transactionPermissions, permissions)
  );

  return allGroups[duplicatedGroupIndex];
}

/**
 * @hidden
 */
export async function assertGroupDoesNotExist(
  asset: Asset,
  permissions: TransactionPermissions | null
): Promise<void> {
  const matchingGroup = await getGroupFromPermissions(asset, permissions);

  if (matchingGroup) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'There already exists a group with the exact same permissions',
      data: {
        groupId:
          matchingGroup instanceof CustomPermissionGroup ? matchingGroup.id : matchingGroup.type,
      },
    });
  }
}

/**
 * @hidden
 */
export const createAuthorizationResolver =
  (
    auth: MaybePostTransactionValue<Authorization>,
    issuer: Identity,
    target: Identity | Account,
    expiry: Date | null,
    context: Context
  ) =>
  (receipt: ISubmittableResult): AuthorizationRequest => {
    const [{ data }] = filterEventRecords(receipt, 'identity', 'AuthorizationAdded');
    let rawAuth;
    if (auth instanceof PostTransactionValue) {
      rawAuth = auth.value;
    } else {
      rawAuth = auth;
    }

    const authId = u64ToBigNumber(data[3]);
    return new AuthorizationRequest({ authId, expiry, issuer, target, data: rawAuth }, context);
  };

/**
 * @hidden
 */
export const createCreateGroupResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): CustomPermissionGroup => {
    const [{ data }] = filterEventRecords(receipt, 'externalAgents', 'GroupCreated');

    return new CustomPermissionGroup(
      { id: u32ToBigNumber(data[2]), ticker: tickerToString(data[1]) },
      context
    );
  };
