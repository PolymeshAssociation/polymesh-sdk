import { u64 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { IdentityId } from 'polymesh-types/types';

import { NumberedPortfolio } from '~/api/entities';
import { Context, PolymeshError, PostTransactionValue, Procedure } from '~/base';
import { ErrorCode } from '~/types';
import {
  bytesToString,
  findEventRecord,
  identityIdToString,
  stringToBytes,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils';

/**
 * @hidden
 */
export type Params = {
  name: string;
};

/**
 * @hidden
 */
export const createPortfolioResolver = (context: Context) => (
  receipt: ISubmittableResult
): NumberedPortfolio => {
  const eventRecord = findEventRecord(receipt, 'portfolio', 'PortfolioCreated');
  const data = eventRecord.event.data;
  const did = identityIdToString(data[0] as IdentityId);
  const id = u64ToBigNumber(data[1] as u64);

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

  const portfoliosNames: string[] = [];
  rawPortfolios.forEach(([, name]) => portfoliosNames.push(bytesToString(name)));

  if (portfoliosNames.includes(portfolioName)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Already exists a portfolio with the same name',
    });
  }

  const rawName = stringToBytes(portfolioName, context);

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
export const createPortfolio = new Procedure(prepareCreatePortfolio);
