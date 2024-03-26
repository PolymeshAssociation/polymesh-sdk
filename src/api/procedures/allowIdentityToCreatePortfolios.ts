import { PolymeshError, Procedure } from '~/internal';
import { ErrorCode } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import { stringToIdentityId } from '~/utils/conversion';

/**
 * @hidden
 */
export type AllowIdentityToCreatePortfoliosParams = {
  did: string;
};

/**
 * @hidden
 */
export async function prepareAllowIdentityToCreatePortfolios(
  this: Procedure<AllowIdentityToCreatePortfoliosParams, void>,
  args: AllowIdentityToCreatePortfoliosParams
): Promise<TransactionSpec<void, ExtrinsicParams<'portfolio', 'allowIdentityToCreatePortfolios'>>> {
  const {
    context: {
      polymeshApi: {
        tx: {
          portfolio: { allowIdentityToCreatePortfolios },
        },
        query,
      },
    },
    context,
  } = this;
  const { did } = args;

  const signingIdentity = await this.context.getSigningIdentity();

  const isInAllowedCustodians = await query.portfolio.allowedCustodians(signingIdentity.did, did);

  if (isInAllowedCustodians.isTrue) {
    throw new PolymeshError({
      code: ErrorCode.NoDataChange,
      message: 'The provided Identity is already in the list of allowed custodians',
    });
  }

  const rawTrustedDid = stringToIdentityId(did, context);

  return {
    transaction: allowIdentityToCreatePortfolios,
    args: [rawTrustedDid],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export const allowIdentityToCreatePortfolios = (): Procedure<
  AllowIdentityToCreatePortfoliosParams,
  void
> =>
  new Procedure(prepareAllowIdentityToCreatePortfolios, {
    permissions: {
      assets: [],
      portfolios: [],
      transactions: [],
    },
  });
