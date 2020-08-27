import P from 'bluebird';
import { chunk } from 'lodash';
import { IssueAssetItem, TxTags } from 'polymesh-types/types';

import { SecurityToken } from '~/api/entities';
import { PolymeshError, Procedure } from '~/base';
import { ErrorCode, IssuanceData, Role, RoleType, TransferStatus } from '~/types';
import { batchArguments, issuanceDataToIssueAssetItem, stringToTicker, valueToDid } from '~/utils';
import { MAX_CONCURRENT_REQUESTS, MAX_DECIMALS, MAX_TOKEN_AMOUNT } from '~/utils/constants';

export interface IssueTokensParams {
  issuanceData: IssuanceData[];
}

/**
 * @hidden
 */
export type Params = IssueTokensParams & {
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareIssueTokens(
  this: Procedure<Params, SecurityToken>,
  args: Params
): Promise<SecurityToken> {
  const {
    context: {
      polymeshApi: {
        tx: { asset },
      },
    },
    context,
  } = this;
  const { ticker, issuanceData } = args;

  const securityToken = new SecurityToken({ ticker }, context);

  const { isDivisible, totalSupply } = await securityToken.details();
  const values = issuanceData.map(({ amount }) => amount);

  values.forEach(value => {
    if (isDivisible) {
      if (value.decimalPlaces() > MAX_DECIMALS) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: `Issuance amounts cannot have more than ${MAX_DECIMALS} decimals`,
        });
      }
    } else {
      if (value.decimalPlaces()) {
        throw new PolymeshError({
          code: ErrorCode.ValidationError,
          message: 'Cannot issue decimal amounts of an indivisible token',
        });
      }
    }
  });

  const supplyAfterMint = values.reduce((acc, next) => {
    return acc.plus(next);
  }, totalSupply);

  if (supplyAfterMint.isGreaterThan(MAX_TOKEN_AMOUNT)) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: `This issuance operation will cause the total supply of "${ticker}" to exceed the supply limit`,
      data: {
        currentSupply: totalSupply,
        supplyLimit: MAX_TOKEN_AMOUNT,
      },
    });
  }

  const rawTicker = stringToTicker(ticker, context);

  const issueAssetItems: IssueAssetItem[] = [];
  const failed: Array<{ did: string; transferStatus: TransferStatus }> = [];

  const issuanceDataChunks = chunk(issuanceData, MAX_CONCURRENT_REQUESTS);

  await P.each(issuanceDataChunks, async issuanceDataChunk => {
    const transferStatuses = await Promise.all(
      issuanceDataChunk.map(({ identity, amount }) =>
        securityToken.transfers.canMint({ to: identity, amount })
      )
    );

    transferStatuses.forEach((canTransfer, index) => {
      const { identity } = issuanceDataChunk[index];
      const did = valueToDid(identity);

      issueAssetItems.push(issuanceDataToIssueAssetItem(issuanceDataChunk[index], context));

      if (canTransfer !== TransferStatus.Success) {
        failed.push({ did, transferStatus: canTransfer });
      }
    });
  });

  if (failed.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: "You can't issue tokens to some of the supplied identities",
      data: {
        failed,
      },
    });
  }

  batchArguments(issueAssetItems, TxTags.asset.BatchIssue).forEach(itemBatch => {
    this.addTransaction(asset.batchIssue, { batchSize: issuanceData.length }, itemBatch, rawTicker);
  });

  return securityToken;
}

/**
 * @hidden
 */
export function getRequiredRoles({ ticker }: Params): Role[] {
  return [{ type: RoleType.TokenOwner, ticker }];
}

/**
 * @hidden
 */
export const issueTokens = new Procedure(prepareIssueTokens, getRequiredRoles);
