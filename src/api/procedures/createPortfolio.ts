import { ISubmittableResult } from '@polkadot/types/types';

import { Context, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, TransactionSpec } from '~/types/internal';
import {
  identityIdToString,
  stringToBytes,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { filterEventRecords, getPortfolioIdByName } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  name: string;
}

/**
 * @hidden
 */
export const createPortfolioResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): NumberedPortfolio => {
    const [{ data }] = filterEventRecords(receipt, 'portfolio', 'PortfolioCreated');
    const did = identityIdToString(data[0]);
    const id = u64ToBigNumber(data[1]);

    return new NumberedPortfolio({ did, id }, context);
  };

/**
 * @hidden
 */
export async function prepareCreatePortfolio(
  this: Procedure<Params, NumberedPortfolio>,
  args: Params
): Promise<TransactionSpec<NumberedPortfolio, ExtrinsicParams<'portfolio', 'createPortfolio'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { name: portfolioName } = args;

  const { did } = await context.getSigningIdentity();

  const rawIdentityId = stringToIdentityId(did, context);

  const rawName = stringToBytes(portfolioName, context);

  const existingPortfolioNumber = await getPortfolioIdByName(rawIdentityId, rawName, context);

  if (existingPortfolioNumber) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'A Portfolio with that name already exists',
    });
  }

  return {
    transaction: tx.portfolio.createPortfolio,
    args: [rawName],
    resolver: createPortfolioResolver(context),
  };
}

/**
 * @hidden
 */
export const createPortfolio = (): Procedure<Params, NumberedPortfolio> =>
  new Procedure(prepareCreatePortfolio, {
    permissions: {
      transactions: [TxTags.portfolio.CreatePortfolio],
      assets: [],
      portfolios: [],
    },
  });
