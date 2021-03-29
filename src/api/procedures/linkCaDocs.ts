import BigNumber from 'bignumber.js';
import { differenceWith } from 'lodash';
import { DocumentId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TokenDocument } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { documentToTokenDocument, stringToTicker } from '~/utils/conversion';
import { documentComparator } from '~/utils/internal';

export interface LinkCaDocsParams {
  documents: TokenDocument[];
}

/**
 * @hidden
 */
export type Params = LinkCaDocsParams & {
  id: BigNumber;
  ticker: string;
};

/**
 * @hidden
 */
export async function prepareLinkCaDocs(
  this: Procedure<Params, void>,
  args: Params
): Promise<void> {
  const {
    context: {
      polymeshApi: {
        tx: { corporateAction },
        query: {
          asset: { assetDocuments },
        },
      },
    },
    context,
  } = this;
  const { id: caId, ticker, documents } = args;

  const rawAssetDocuments = await assetDocuments.entries(stringToTicker(ticker, context));

  const currentAssetDocIds: DocumentId[] = [];
  const currentAssetDocs: TokenDocument[] = [];

  rawAssetDocuments.forEach(([key, doc]) => {
    const [, id] = key.args;
    currentAssetDocIds.push(id);
    currentAssetDocs.push(documentToTokenDocument(doc));
  });

  if (differenceWith(documents, currentAssetDocs, documentComparator).length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the provided documents are not from the same asset',
    });
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  const rawCAId = { ticker, local_id: caId };

  this.addTransaction(corporateAction.linkCaDoc, {}, rawCAId, currentAssetDocIds);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.CorporateActionsAgent, ticker }],
    signerPermissions: {
      tokens: [new SecurityToken({ ticker }, this.context)],
      transactions: [TxTags.corporateAction.LinkCaDoc],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const linkCaDocs = new Procedure(prepareLinkCaDocs, getAuthorization);
