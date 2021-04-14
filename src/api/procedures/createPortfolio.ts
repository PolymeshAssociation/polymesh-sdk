import { ISubmittableResult } from '@polkadot/types/types';
import { TxTags } from 'polymesh-types/types';

import {
  Context,
  NumberedPortfolio,
  PolymeshError,
  PostTransactionValue,
  Procedure,
} from '~/internal';
import { ErrorCode } from '~/types';
import {
  identityIdToString,
  stringToIdentityId,
  stringToText,
  textToString,
  u64ToBigNumber,
} from '~/utils/conversion';
import { findEventRecord } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  name: string;
}

/**
 * @hidden
 */
export const createPortfolioResolver = (context: Context) => (
  receipt: ISubmittableResult
): NumberedPortfolio => {
  const { data } = findEventRecord(receipt, 'portfolio', 'PortfolioCreated');
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
): Promise<PostTransactionValue<NumberedPortfolio>> {
  const {
    context: {
      polymeshApi: {
        tx,
        query: { portfolio },
      },
    },
    context,
  } = this;
  const { name: portfolioName } = args;

  const { did } = await context.getCurrentIdentity();

  const rawPortfolios = await portfolio.portfolios.entries(stringToIdentityId(did, context));

  const portfolioNames = rawPortfolios.map(([, name]) => textToString(name));

  if (portfolioNames.includes(portfolioName)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'A portfolio with that name already exists',
    });
  }

  const rawName = stringToText(portfolioName, context);

  const [newNumberedPortfolio] = this.addTransaction(
    tx.portfolio.createPortfolio,
    {
      resolvers: [createPortfolioResolver(context)],
    },
    rawName
  );

  return newNumberedPortfolio;
}

/**
 * @hidden
 */
export const createPortfolio = (): Procedure<Params, NumberedPortfolio> =>
  new Procedure(prepareCreatePortfolio, {
    signerPermissions: {
      transactions: [TxTags.portfolio.CreatePortfolio],
      tokens: [],
      portfolios: [],
    },
  });
