import BigNumber from 'bignumber.js';
import { isEqual, remove } from 'lodash';
import { DocumentId, TxTags } from 'polymesh-types/types';

import { PolymeshError, Procedure, SecurityToken } from '~/internal';
import { ErrorCode, TokenDocument } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  corporateActionIdentifierToCaId,
  documentToTokenDocument,
  stringToTicker,
} from '~/utils/conversion';

export interface LinkCaDocsParams {
  /**
   * list of documents
   */
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
  const documentsCopy = [...documents]; // avoid mutation

  rawAssetDocuments.forEach(([key, doc]) => {
    const [, id] = key.args;
    const removedList = remove(documentsCopy, document =>
      isEqual(document, documentToTokenDocument(doc))
    );
    if (removedList.length) {
      docIdsToLink.push(id);
    }
  });

  if (documentsCopy.length) {
    throw new PolymeshError({
      code: ErrorCode.ValidationError,
      message: 'Some of the provided documents are not associated with the Security Token',
      data: {
        documents: documentsCopy,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const rawCAId = corporateActionIdentifierToCaId({ ticker, localId: caId }, context);

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
    permissions: {
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
