import { PolymeshError } from '~/base/PolymeshError';
import { Procedure } from '~/internal';
import { ClaimType, ErrorCode } from '~/types';
import {
  claimToMeshClaim,
  dateToMoment,
  stringToIdentityId,
  stringToInvestorZKProofData,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface AddInvestorUniquenessClaimParams {
  ticker: string;
  cddId: string;
  proof: string;
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
  const { ticker, cddId, scopeId, proof, expiry } = args;

  const { did } = await context.getCurrentIdentity();

  if (expiry && expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Expiry date must be in the future',
    });
  }

  this.addTransaction(
    tx.identity.addInvestorUniquenessClaim,
    {},
    stringToIdentityId(did, context),
    claimToMeshClaim({ type: ClaimType.InvestorUniqueness, ticker, cddId, scopeId }, context),
    stringToInvestorZKProofData(proof, context),
    expiry ? dateToMoment(expiry, context) : null
  );
}

/**
 * @hidden
 */
export const addInvestorUniquenessClaim = new Procedure(prepareAddInvestorUniquenessClaim);
