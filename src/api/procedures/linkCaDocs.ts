import BigNumber from 'bignumber.js';
import { isEqual, remove } from 'lodash';
import { DocumentId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, RoleType, TokenDocument } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import { documentToTokenDocument, stringToTicker } from '~/utils/conversion';

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

  const docIdsToLink: DocumentId[] = [];

  rawAssetDocuments.forEach(([key, doc]) => {
    const [, id] = key.args;
    const removedList = remove(documents, document =>
      isEqual(document, documentToTokenDocument(doc))
    );
    if (removedList.length) {
      docIdsToLink.push(id);
    }
  });

  if (documents.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the provided documents are not associated with the Security Token',
      data: {
        documents,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rawCAId = { ticker, local_id: caId };

  this.addTransaction(corporateAction.linkCaDoc, {}, rawCAId, docIdsToLink);
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { ticker }: Params
): ProcedureAuthorization {
  return {
    identityRoles: [{ type: RoleType.TokenCaa, ticker }],
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
export const linkCaDocs = (): Procedure<Params, void> =>
  new Procedure(prepareLinkCaDocs, getAuthorization);
