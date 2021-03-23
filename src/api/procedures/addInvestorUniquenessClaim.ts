import { PolymeshError } from '~/base/PolymeshError';
import { Procedure } from '~/internal';
import { ClaimType, ErrorCode, Scope, TxTag, TxTags } from '~/types';
import { ProcedureAuthorization, ScopeClaimProof } from '~/types/internal';
import {
  claimToMeshClaim,
  dateToMoment,
  scopeClaimProofToMeshScopeClaimProof,
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
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { scope, cddId, scopeId, proof, expiry } = args;

  const { did } = await context.getCurrentIdentity();

  if (expiry && expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be in the future',
    });
  }

  if (typeof proof === 'string') {
    this.addTransaction(
      tx.identity.addInvestorUniquenessClaim,
      {},
      stringToIdentityId(did, context),
      claimToMeshClaim({ type: ClaimType.InvestorUniqueness, scope, cddId, scopeId }, context),
      stringToInvestorZKProofData(proof, context),
      expiry ? dateToMoment(expiry, context) : null
    );
  } else {
    this.addTransaction(
      tx.identity.addInvestorUniquenessClaimV2,
      {},
      stringToIdentityId(did, context),
      claimToMeshClaim({ type: ClaimType.InvestorUniqueness, scope, cddId, scopeId }, context),
      scopeClaimProofToMeshScopeClaimProof(proof, scopeId, context),
      expiry ? dateToMoment(expiry, context) : null
    );
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
    signerPermissions: {
      tokens: [],
      portfolios: [],
      transactions,
    },
  };
}

/**
 * @hidden
 */
export const addInvestorUniquenessClaim = new Procedure(
  prepareAddInvestorUniquenessClaim,
  getAuthorization
);
