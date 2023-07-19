import BigNumber from 'bignumber.js';

import { NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, RenamePortfolioParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64, stringToBytes, stringToIdentityId } from '~/utils/conversion';
import { getPortfolioIdsByName } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = { did: string; id: BigNumber } & RenamePortfolioParams;

/**
 * @hidden
 */
export async function prepareRenamePortfolio(
  this: Procedure<Params, NumberedPortfolio>,
  args: Params
): Promise<TransactionSpec<NumberedPortfolio, ExtrinsicParams<'portfolio', 'renamePortfolio'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { portfolio },
      },
    },
    context,
  } = this;

  const { did, id, name: newName } = args;

  const identityId = stringToIdentityId(did, context);

  const rawNewName = stringToBytes(newName, context);

  const [existingPortfolioNumber] = await getPortfolioIdsByName(identityId, [rawNewName], context);

  if (existingPortfolioNumber) {
    if (id.eq(existingPortfolioNumber)) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'New name is the same as current name',
      });
    } else {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'A Portfolio with that name already exists',
      });
    }
  }
  return {
    transaction: portfolio.renamePortfolio,
    args: [bigNumberToU64(id, context), rawNewName],
    resolver: new NumberedPortfolio({ did, id }, context),
  };
}

/**
 * @hidden
 */
export async function getAuthorization(
  this: Procedure<Params, NumberedPortfolio>,
  { did, id }: Params
): Promise<ProcedureAuthorization> {
  const { context } = this;

  const { did: signingDid } = await context.getSigningIdentity();

  const hasRoles = signingDid === did;

  return {
    roles: hasRoles || 'Only the owner is allowed to modify the name of a Portfolio',
    permissions: {
      transactions: [TxTags.portfolio.RenamePortfolio],
      portfolios: [new NumberedPortfolio({ did, id }, this.context)],
      assets: [],
    },
  };
}

/**
 * @hidden
 */
export const renamePortfolio = (): Procedure<Params, NumberedPortfolio> =>
  new Procedure(prepareRenamePortfolio, getAuthorization);
