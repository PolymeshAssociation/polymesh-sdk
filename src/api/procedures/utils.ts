import {
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
  SecurityToken,
  TickerReservation,
} from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  AuthorizationType,
  Condition,
  ConditionTarget,
  ConditionType,
  ErrorCode,
  GenericAuthorizationData,
  InputCondition,
  InputTargets,
  InputTaxWithholding,
  InstructionStatus,
  InstructionType,
  PermissionGroupType,
  SecondaryKey,
  SignerValue,
  TickerReservationStatus,
} from '~/types';
import { PortfolioId } from '~/types/internal';
import { signerToSignerValue, u32ToBigNumber, u64ToBigNumber } from '~/utils/conversion';

// import { Proposal } from '~/internal';
// import { ProposalStage, ProposalState } from '~/api/entities/Proposal/types';
// import { Context, PolymeshError } from '~/internal';
// import { ErrorCode } from '~/types';

// /**
//  * @hidden
//  */
// export async function assertProposalUnlocked(pipId: BigNumber, context: Context): Promise<void> {
//   const proposal = new Proposal({ pipId }, context);

//   const [details, stage] = await Promise.all([proposal.getDetails(), proposal.getStage()]);

//   const { lastState } = details;

//   if (lastState !== ProposalState.Pending) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must be in pending state',
//     });
//   }

//   if (stage !== ProposalStage.CoolOff) {
//     throw new PolymeshError({
//       code: ErrorCode.ValidationError,
//       message: 'The proposal must be in its cool-off period',
//     });
//   }
// }

/**
 * @hidden
 */
export async function assertInstructionValid(
  instruction: Instruction,
  context: Context
): Promise<void> {
  const details = await instruction.details();
  const { status } = await instruction.details();

  if (status !== InstructionStatus.Pending) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Instruction must be in pending state',
    });
  }

  if (details.type === InstructionType.SettleOnBlock) {
    const latestBlock = await context.getLatestBlock();
    const { endBlock } = details;

    if (latestBlock >= endBlock) {
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
export function assertSecondaryKeys(
  signerValues: SignerValue[],
  secondaryKeys: SecondaryKey[]
): void {
  const notInTheList: string[] = [];
  signerValues.forEach(({ value: itemValue }) => {
    const isPresent = secondaryKeys
      .map(({ signer }) => signerToSignerValue(signer))
      .find(({ value }) => value === itemValue);
    if (!isPresent) {
      notInTheList.push(itemValue);
    }
  });

  if (notInTheList.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'One of the Signers is not a Secondary Key for the Identity',
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
export function assertCaTargetsValid(targets: InputTargets, context: Context): void {
  const { maxTargetIds } = context.polymeshApi.consts.corporateAction;

  const maxTargets = u64ToBigNumber(maxTargetIds);

  if (maxTargets.lt(targets.identities.length)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Too many target Identities',
      data: {
        maxTargets,
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

  const maxWithholdingEntries = u64ToBigNumber(maxDidWhts);

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
  context: Context,
  conditions: (Condition | InputCondition)[],
  defaultClaimIssuerLength: number
): void {
  const { maxConditionComplexity: maxComplexity } = context.polymeshApi.consts.complianceManager;
  let complexitySum = 0;

  conditions.forEach(condition => {
    const { target, trustedClaimIssuers = [] } = condition;
    switch (condition.type) {
      case ConditionType.IsPresent:
      case ConditionType.IsIdentity:
      case ConditionType.IsAbsent:
        // single claim conditions add one to the complexity
        complexitySum += 1;
        break;
      case ConditionType.IsAnyOf:
      case ConditionType.IsNoneOf:
        // multi claim conditions add one to the complexity per each claim
        complexitySum += condition.claims.length;
        break;
    }

    // if the condition affects both, it actually represents two conditions on chain
    if (target === ConditionTarget.Both) {
      complexitySum = complexitySum * 2;
    }

    const claimIssuerLength = trustedClaimIssuers.length || defaultClaimIssuerLength;
    complexitySum = complexitySum * claimIssuerLength;
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
 */
export async function assertAuthorizationRequestValid(
  context: Context,
  authRequest: AuthorizationRequest
): Promise<void> {
  if (authRequest.isExpired()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Authorization Request has expired',
      data: {
        expiry: authRequest.expiry,
      },
    });
  }
  switch (authRequest.data.type) {
    case AuthorizationType.RotatePrimaryKey:
      return assertPrimaryKeyRotationAuthorizationValid(authRequest);
    case AuthorizationType.AttestPrimaryKeyRotation:
      return assertAttestPrimaryKeyAuthorizationValid(authRequest);
    case AuthorizationType.TransferTicker:
      return assertTransferTickerAuthorizationValid(context, authRequest.data);
    case AuthorizationType.TransferAssetOwnership:
      return assertTransferAssetOwnershipAuthorizationValid(context, authRequest.data);
    case AuthorizationType.BecomeAgent:
      // no additional checks
      return;
    case AuthorizationType.AddMultiSigSigner:
      // no additional checks
      return;
    case AuthorizationType.PortfolioCustody:
      // no additional checks
      return;
    case AuthorizationType.JoinIdentity:
      return assertJoinIdentityAuthorizationValid(authRequest);
    case AuthorizationType.AddRelayerPayingKey:
      return assertAddRelayerPayingKeyAuthorizationValid(authRequest.data);
    default:
      throw new UnreachableCaseError(authRequest.data); // ensures switch statement covers all values
  }
}

/**
 * asserts valid  primary key rotation authorization
 */
export async function assertPrimaryKeyRotationAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  if (authRequest.target instanceof Identity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'An Identity can not join another Identity',
    });
  }
}

/**
 * asserts valid attest primary key authorization
 */
export async function assertAttestPrimaryKeyAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  if (!(await authRequest.issuer.isCddProvider())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuer must be a CDD provider',
    });
  }
}

/** asserts transfer ticker authorization is valid */
export async function assertTransferTickerAuthorizationValid(
  context: Context,
  data: GenericAuthorizationData
): Promise<void> {
  const reservation = new TickerReservation({ ticker: data.value }, context);
  const { status } = await reservation.details();
  if (status === TickerReservationStatus.Free) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Ticker is not reserved',
    });
  }
  if (status === TickerReservationStatus.TokenCreated) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The ticker has already been used to create an Asset',
    });
  }
}

/** asserts valid transfer asset ownership authorization */
export async function assertTransferAssetOwnershipAuthorizationValid(
  context: Context,
  data: GenericAuthorizationData
): Promise<void> {
  const token = new SecurityToken({ ticker: data.value }, context);
  if (!(await token.exists()))
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The Asset does not exist',
    });
}

/**
 * asserts valid join identity authorization request
 */
export async function assertJoinIdentityAuthorizationValid(
  authRequest: AuthorizationRequest
): Promise<void> {
  // https://github.com/PolymathNetwork/Polymesh/blob/5fec16fdfb05dc9022508880503e835ae9c1776c/pallets/identity/src/keys.rs#L470
  const identity = authRequest.issuer;
  if (!(await identity.hasValidCdd())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuing Identity does not have a valid CDD claim',
    });
  }
}

/** asserts valid add relayer paying key authorization */
export async function assertAddRelayerPayingKeyAuthorizationValid(
  data: AddRelayerPayingKeyAuthorizationData
): Promise<void> {
  const subsidy = data.value;
  const beneficiaryIdentity = await subsidy.beneficiary.getIdentity();
  if (!beneficiaryIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have an Identity',
    });
  }
  if (!(await beneficiaryIdentity.hasValidCdd())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have a valid CDD Claim',
    });
  }

  const subsidizerIdentity = await subsidy.subsidizer.getIdentity();
  if (!subsidizerIdentity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Subsidizer Account does not have an Identity',
    });
  }
  if (!(await subsidizerIdentity.hasValidCdd())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Subsidizer Account does not have a valid CDD Claim',
    });
  }
}

/** A helper class to ensure a code path is unreachable. For example this can be used for ensuring switch statements are exhaustive */
export class UnreachableCaseError extends Error {
  /** This should never be called */
  constructor(val: never) {
    super(`Unreachable case: ${JSON.stringify(val)}`);
  }
}
