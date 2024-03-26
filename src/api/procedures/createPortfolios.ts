import { ISubmittableResult } from '@polkadot/types/types';

import { Context, NumberedPortfolio, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization } from '~/types/internal';
import {
  identityIdToString,
  stringToBytes,
  stringToIdentityId,
  u64ToBigNumber,
} from '~/utils/conversion';
import { checkTxType, filterEventRecords, getPortfolioIdsByName } from '~/utils/internal';
type PortfolioParams = {
  name: string;
  ownerDid?: string;
};
/**
 * @hidden
 */
export interface Params {
  portfolios: PortfolioParams[];
}
/**
 * @hidden
 */
export const createPortfoliosResolver =
  (context: Context) =>
  (receipt: ISubmittableResult): NumberedPortfolio[] => {
    const records = filterEventRecords(receipt, 'portfolio', 'PortfolioCreated');
    return records.map(({ data }) => {
      const did = identityIdToString(data[0]);
      const id = u64ToBigNumber(data[1]);
      return new NumberedPortfolio({ did, id }, context);
    });
  };
/**
 * @hidden
 */
export async function prepareCreatePortfolios(
  this: Procedure<Params, NumberedPortfolio[]>,
  args: Params
): Promise<BatchTransactionSpec<NumberedPortfolio[], unknown[][]>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;
  const { portfolios: portfoliosToCreate } = args;
  const { did } = await context.getSigningIdentity();
  const groupedPortfolioNamesByIdentity = portfoliosToCreate.reduce(
    (acc: Record<string, string[]>, { name, ownerDid }) => {
      const owner = ownerDid ?? did;
      if (!acc[owner]) {
        acc[owner] = [];
      }
      acc[owner].push(name);
      return acc;
    },
    {}
  );
  const portfolioIdCalls = Object.keys(groupedPortfolioNamesByIdentity).map(identityId => {
    const rawNames = groupedPortfolioNamesByIdentity[identityId].map(name =>
      stringToBytes(name, context)
    );
    const rawIdentityId = stringToIdentityId(identityId, context);
    return getPortfolioIdsByName(rawIdentityId, rawNames, context);
  });
  const dids = Object.keys(groupedPortfolioNamesByIdentity);
  const foundPortfoliosByDid = await Promise.all(portfolioIdCalls);
  const existingNames: string[] = [];
  foundPortfoliosByDid.forEach((portfolios, index) => {
    portfolios.forEach(id => {
      if (id) {
        existingNames.push(groupedPortfolioNamesByIdentity[dids[index]][id.toNumber()]);
      }
    });
  });
  if (existingNames.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'There already exist Portfolios with some of the given names',
      data: {
        existingNames,
      },
    });
  }
  const transactions: BatchTransactionSpec<NumberedPortfolio[], unknown[][]>['transactions'] = [];
  portfoliosToCreate.forEach(({ name, ownerDid }) => {
    if (ownerDid) {
      transactions.push(
        checkTxType({
          transaction: tx.portfolio.createCustodyPortfolio,
          args: [stringToIdentityId(ownerDid, context), stringToBytes(name, context)],
        })
      );
    } else {
      transactions.push(
        checkTxType({
          transaction: tx.portfolio.createPortfolio,
          args: [stringToBytes(name, context)],
        })
      );
    }
  });
  return {
    transactions,
    resolver: createPortfoliosResolver(context),
  };
}
/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, NumberedPortfolio[]>,
  { portfolios }: Params
): ProcedureAuthorization {
  const transactions = [];
  if (portfolios.some(({ ownerDid }) => ownerDid)) {
    transactions.push(TxTags.portfolio.CreateCustodyPortfolio);
  }
  if (portfolios.some(({ ownerDid }) => !ownerDid)) {
    transactions.push(TxTags.portfolio.CreatePortfolio);
  }
  return {
    permissions: {
      transactions,
      assets: [],
      portfolios: [],
    },
  };
}
/**
 * @hidden
 */
export const createPortfolios = (): Procedure<Params, NumberedPortfolio[]> =>
  new Procedure(prepareCreatePortfolios, getAuthorization);
