import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Identity, ReceiverAffirmationRequirement, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { affirmationRequirementToMesh, stringToIdentityId } from '~/utils/conversion';

/**
 * @hidden
 */
export interface Params {
  did: string;
  requirement: ReceiverAffirmationRequirement;
}

/**
 * @hidden
 */
export interface Storage {
  identity: Identity;
}

/**
 * @hidden
 */
export async function prepareSetMandatoryReceiverAffirmation(
  this: Procedure<Params, void, Storage>,
  args: Params
): Promise<
  TransactionSpec<void, ExtrinsicParams<'settlement', 'setMandatoryReceiverAffirmation'>>
> {
  const {
    context: {
      polymeshApi: { tx, query },
    },
    context,
  } = this;
  const { did, requirement } = args;

  if (context.isV7) {
    throw new PolymeshError({
      code: ErrorCode.NotSupported,
      message: 'setMandatoryReceiverAffirmation is not supported on v7 chains',
    });
  }

  const rawDid = stringToIdentityId(did, context);

  const rawCurrentValue = await query.settlement.mandatoryReceiverAffirmation(rawDid);
  const currentRequirement = rawCurrentValue.isTrue
    ? ReceiverAffirmationRequirement.Required
    : ReceiverAffirmationRequirement.Automatic;

  if (requirement === currentRequirement) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message:
        requirement === ReceiverAffirmationRequirement.Required
          ? 'The signing identity already requires mandatory receiver affirmation'
          : 'The signing identity already has automatic receiver affirmation',
      data: { identity: did },
    });
  }

  const rawRequirement = affirmationRequirementToMesh(requirement, context);

  return {
    transaction: tx.settlement.setMandatoryReceiverAffirmation,
    args: [rawRequirement],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void, Storage>,
  { did }: Params
): ProcedureAuthorization {
  const {
    storage: { identity },
  } = this;

  if (identity.did !== did) {
    return {
      signerPermissions:
        'Only a signing key linked to the Identity can set its mandatory receiver affirmation',
    };
  }

  return {
    permissions: {
      transactions: [TxTags.settlement.SetMandatoryReceiverAffirmation],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export async function prepareStorage(this: Procedure<Params, void, Storage>): Promise<Storage> {
  const { context } = this;

  const identity = await context.getSigningIdentity();

  return { identity };
}

/**
 * @hidden
 */
export const setMandatoryReceiverAffirmation = (): Procedure<Params, void, Storage> =>
  new Procedure(prepareSetMandatoryReceiverAffirmation, getAuthorization, prepareStorage);
