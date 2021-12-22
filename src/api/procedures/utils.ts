/* eslint-disable no-case-declarations */

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
} from '~/internal';
import {
  AddRelayerPayingKeyAuthorizationData,
  AuthorizationType,
  BecomeAgentAuthorizationData,
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
  JoinIdentityAuthorizationData,
  PermissionGroupType,
  PortfolioCustodyAuthorizationData,
  SecondaryKey,
  SignerValue,
} from '~/types';
import { PortfolioId } from '~/types/internal';
import {
  signerToSignerValue,
  stringToTicker,
  u32ToBigNumber,
  u64ToBigNumber,
} from '~/utils/conversion';

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
  switch (authRequest.data.type) {
    case AuthorizationType.RotatePrimaryKey:
      return assertValidPrimaryKeyRotationAuthorization(authRequest, context);
    case AuthorizationType.AttestPrimaryKeyRotation:
      return assertValidAttestPrimaryKeyAuthorization(authRequest, authRequest.data, context);
    case AuthorizationType.TransferTicker:
      return assertTransferTickerAuthorizationValid(authRequest.data, context);
    case AuthorizationType.TransferAssetOwnership:
      return assertValidTransferAssetOwnershipAuthorization(authRequest, authRequest.data, context);
    case AuthorizationType.BecomeAgent:
      return assertValidBecomeAgentAuthorization(authRequest, authRequest.data, context);
    case AuthorizationType.AddMultiSigSigner:
      return assertMultisigAuthorizationValid(authRequest, authRequest.data, context);
    case AuthorizationType.PortfolioCustody:
      return assertValidPortfolioCustodyAuthorization(authRequest, authRequest.data, context);
    case AuthorizationType.JoinIdentity:
      return assertValidJoinIdentityAuthorization(authRequest, authRequest.data, context);
    case AuthorizationType.AddRelayerPayingKey:
      return assertValidAddRelayerPayingKeyAuthorization(authRequest, authRequest.data, context);
    default:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const assertExhaustiveSwitch: never = authRequest.data;
  }
}

/**
 * Asserts the PrimaryKeyRotationAuthorization is valid
 */
export async function assertValidPrimaryKeyRotationAuthorization(
  authRequest: AuthorizationRequest,
  context: Context
): Promise<void> {
  // https://github.com/PolymathNetwork/Polymesh/blob/01793d1094a2f76b95db42d390b0296cbe75826b/pallets/identity/src/lib.rs#L1425
  const account = authRequest.issuer;
  if (!(await account.exists())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Account does not exist',
    });
  }
  if (authRequest.target instanceof Identity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'An Identity can not join another Identity',
    });
  }

  const identity = await authRequest.target.getIdentity();
  if (identity) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Account already has an associated Identity',
    });
  }
}

/**
 * asserts valid attest primary key authorization
 */
export async function assertValidAttestPrimaryKeyAuthorization(
  authRequest: AuthorizationRequest,
  data: GenericAuthorizationData,
  context: Context
): Promise<void> {
  // Should double check about this....
  if (!(await authRequest.issuer.isCddProvider())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuer must be a CDD provider',
    });
  }
}

/** asserts transfer ticker authorization is valid */
export async function assertTransferTickerAuthorizationValid(
  authRequest: GenericAuthorizationData,
  context: Context
): Promise<void> {
  const ticker = authRequest.value;
  const {
    polymeshApi: {
      query: { asset },
    },
  } = context;
  // eslint-disable-next-line no-case-declarations
  const { owner, expiry } = await asset.tickers(stringToTicker(authRequest.value, context));

  if (!owner.isEmpty && expiry.isNone) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: `${ticker} token has been created`,
    });
  }

  throw new PolymeshError({
    code: ErrorCode.UnmetPrerequisite,
    message: `There is no reservation for ${ticker} ticker`,
  });
}

/** asserts valid transfer asset ownership authorization */
export async function assertValidTransferAssetOwnershipAuthorization(
  authRequest: AuthorizationRequest,
  data: GenericAuthorizationData,
  context: Context
): Promise<void> {
  const token = new SecurityToken({ ticker: data.value }, context);
  if (!(await token.exists())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'The asset does not exist',
    });
  }
  const { owner, fullAgents } = await token.details();
  const hasPermission = authRequest.issuer === owner || fullAgents.includes(authRequest.issuer);
  if (!hasPermission) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only the owner or full agents of the asset can transfer ownership',
    });
  }
}

/** asserts valid become agent authorization */
export async function assertValidBecomeAgentAuthorization(
  authRequest: AuthorizationRequest,
  data: BecomeAgentAuthorizationData,
  context: Context
): Promise<void> {
  // no checks currently
}

/** asserts multisig authorization is valid */
export async function assertMultisigAuthorizationValid(
  authRequest: AuthorizationRequest,
  data: GenericAuthorizationData,
  context: Context
): Promise<void> {
  const target = authRequest.target;
  if (!(target instanceof Identity)) {
    if (await target.getIdentity()) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Account is already associated with an Identity',
      });
    }
  }
}

/** asserts valid portfolio custody authorization */
export async function assertValidPortfolioCustodyAuthorization(
  authRequest: AuthorizationRequest,
  data: PortfolioCustodyAuthorizationData,
  context: Context
): Promise<void> {
  // no checks currently
}

/**
 * asserts valid join identity authorization request
 */
export async function assertValidJoinIdentityAuthorization(
  authRequest: AuthorizationRequest,
  data: JoinIdentityAuthorizationData,
  context: Context
): Promise<void> {
  // https://github.com/PolymathNetwork/Polymesh/blob/5fec16fdfb05dc9022508880503e835ae9c1776c/pallets/identity/src/keys.rs#L470
  const identity = authRequest.issuer;
  if (!identity.hasValidCdd()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Issuing Identity does not have a valid CDD claim',
    });
  }

  const target = authRequest.target;
  if (target instanceof Identity) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Only an Account can join an Identity',
    });
  }

  if (await target.getIdentity()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Target account is already associated with an Identity',
    });
  }
}

/** asserts valid add relayer paying key authorization */
export async function assertValidAddRelayerPayingKeyAuthorization(
  authRequest: AuthorizationRequest,
  data: AddRelayerPayingKeyAuthorizationData,
  context: Context
): Promise<void> {
  const subsidy = data.value;
  const beneficiaryIdentity = await subsidy.beneficiary.getIdentity();
  if (!(await beneficiaryIdentity?.hasValidCdd())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Beneficiary Account does not have a valid CDD Claim',
    });
  }

  const subsidizerIdentity = await subsidy.subsidizer.getIdentity();
  if (!(await subsidizerIdentity?.hasValidCdd())) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Subsidizer Account does not have a Valid CDD Claim',
    });
  }
}
