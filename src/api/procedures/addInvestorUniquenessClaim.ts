import { PolymeshError, Procedure } from '~/internal';
import { ClaimType, ErrorCode, Scope, TxTag, TxTags } from '~/types';
import {
  ExtrinsicParams,
  ProcedureAuthorization,
  ScopeClaimProof,
  TransactionSpec,
} from '~/types/internal';
import {
  claimToMeshClaim,
  dateToMoment,
  scopeClaimProofToConfidentialIdentityClaimProof,
  scopeToMeshScope,
  stringToIdentityId,
  stringToInvestorZKProofData,
} from '~/utils/conversion';

export interface AddInvestorUniquenessClaimParams {
  scope: Scope;
  cddId: string;
  proof: string | ScopeClaimProof;
  scopeId: string;
  expiry?: Date;
}

/**
 * @hidden
 */
export async function prepareAddInvestorUniquenessClaim(
  this: Procedure<AddInvestorUniquenessClaimParams, void>,
  args: AddInvestorUniquenessClaimParams
): Promise<
  | TransactionSpec<void, ExtrinsicParams<'identity', 'addInvestorUniquenessClaim'>>
  | TransactionSpec<void, ExtrinsicParams<'identity', 'addInvestorUniquenessClaimV2'>>
> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { scope, cddId, scopeId, proof, expiry } = args;

  const { did } = await context.getSigningIdentity();

  if (expiry && expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be in the future',
    });
  }

  const meshIdentityId = stringToIdentityId(did, context);
  const meshExpiry = expiry ? dateToMoment(expiry, context) : null;
  if (typeof proof === 'string') {
    const meshClaim = claimToMeshClaim(
      { type: ClaimType.InvestorUniqueness, scope, cddId, scopeId },
      context
    );
    return {
      transaction: tx.identity.addInvestorUniquenessClaim,
      args: [meshIdentityId, meshClaim, stringToInvestorZKProofData(proof, context), meshExpiry],
      resolver: undefined,
    };
  } else {
    const meshClaim = claimToMeshClaim({ type: ClaimType.InvestorUniquenessV2, cddId }, context);
    return {
      transaction: tx.identity.addInvestorUniquenessClaimV2,
      args: [
        meshIdentityId,
        scopeToMeshScope(scope, context),
        meshClaim,
        scopeClaimProofToConfidentialIdentityClaimProof(proof, scopeId, context),
        meshExpiry,
      ],
      resolver: undefined,
    };
  }
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<AddInvestorUniquenessClaimParams>,
  { proof }: AddInvestorUniquenessClaimParams
): ProcedureAuthorization {
  let transactions: TxTag[];

  if (typeof proof === 'string') {
    transactions = [TxTags.identity.AddInvestorUniquenessClaim];
  } else {
    transactions = [TxTags.identity.AddInvestorUniquenessClaimV2];
  }

  return {
    permissions: {
      assets: [],
      portfolios: [],
      transactions,
    },
  };
}

/**
 * @hidden
 */
export const addInvestorUniquenessClaim = (): Procedure<AddInvestorUniquenessClaimParams, void> =>
  new Procedure(prepareAddInvestorUniquenessClaim, getAuthorization);
