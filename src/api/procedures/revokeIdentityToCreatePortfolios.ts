import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode, Identity } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToIdentityId } from '~/utils/conversion';
import { asIdentity, assertIdentityExists } from '~/utils/internal';

/**
 * @hidden
 */
export type RevokeIdentityToCreatePortfoliosParams = {
  did: Identity | string;
};

/**
 * @hidden
 */
export async function prepareRevokeIdentityToCreatePortfolios(
  this: Procedure<RevokeIdentityToCreatePortfoliosParams, void>,
  args: RevokeIdentityToCreatePortfoliosParams
): Promise<TransactionSpec<void, ExtrinsicParams<'portfolio', 'allowIdentityToCreatePortfolios'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          portfolio: { revokeCreatePortfoliosPermission },
        },
        query,
      },
    },
    context,
  } = this;
  const { did } = args;

  const identity = asIdentity(did, this.context);

  await assertIdentityExists(identity);

  const rawDidToRevoke = stringToIdentityId(identity.did, context);

  const signingIdentity = await this.context.getSigningIdentity();

  const isInAllowedCustodians = await query.portfolio.allowedCustodians(
    signingIdentity.did,
    identity.did
  );

  if (isInAllowedCustodians.isFalse) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The provided Identity is not in the list of allowed custodians',
    });
  }

  return {
    transaction: revokeCreatePortfoliosPermission,
    args: [rawDidToRevoke],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const revokeIdentityToCreatePortfolios = (): Procedure<
  RevokeIdentityToCreatePortfoliosParams,
  void
> =>
  new Procedure(prepareRevokeIdentityToCreatePortfolios, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [],
    },
  });
