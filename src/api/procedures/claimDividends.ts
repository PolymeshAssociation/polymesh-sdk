import { DividendDistribution, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TargetTreatment, TxTags } from '~/types';
import {
  boolToBoolean,
  corporateActionIdentifierToCaId,
  stringToIdentityId,
} from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  distribution: DividendDistribution;
}

/**
 * @hidden
 */
export async function prepareClaimDividends(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;
  const {
    distribution: {
      targets: { identities, treatment },
      id: localId,
      ticker,
      paymentDate,
      expiryDate,
    },
  } = args;

  const now = new Date();

  if (paymentDate > now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "The Distribution's payment date hasn't been reached",
      data: { paymentDate },
    });
  }

  if (expiryDate && expiryDate < now) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The Distribution has already expired',
      data: {
        expiryDate,
      },
    });
  }
  const { did: currentDid } = await context.getCurrentIdentity();

  const found = !!identities.find(({ did }) => did === currentDid);

  // NOTE @monitz87: this is an XOR
  if (found !== (treatment === TargetTreatment.Exclude)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The current Identity is not included in this Distribution',
    });
  }

  const rawDid = stringToIdentityId(currentDid, context);
  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId }, context);
  const alreadyClaimed = await query.capitalDistribution.holderPaid([rawCaId, rawDid]);

  if (boolToBoolean(alreadyClaimed)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'The current Identity is not included in this Distribution',
    });
  }

  this.addTransaction(tx.capitalDistribution.claim, {}, rawCaId);
}

/**
 * @hidden
 */
export const claimDividends = new Procedure(prepareClaimDividends, {
  signerPermissions: {
    transactions: [TxTags.capitalDistribution.Claim],
    tokens: [],
    portfolios: [],
  },
});
