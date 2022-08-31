import BigNumber from 'bignumber.js';
import { isEqual, remove } from 'lodash';

import { Asset, PolymeshError, Procedure } from '~/internal';
import { DocumentId } from '~/polkadot/polymesh';
import { ErrorCode, LinkCaDocsParams, TxTags } from '~/types';
import { ProcedureAuthorization } from '~/types/internal';
import {
  corporateActionIdentifierToCaId,
  documentToAssetDocument,
  stringToTicker,
} from '~/utils/conversion';

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
      isEqual(document, documentToAssetDocument(doc))
    );
    if (removedList.length) {
      docIdsToLink.push(id);
    }
  });

  if (documentsCopy.length) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Some of the provided documents are not associated with the Asset',
      data: {
        documents: documentsCopy,
      },
    });
  }

  const rawCaId = corporateActionIdentifierToCaId({ ticker, localId: caId }, context);

  this.addTransaction({
    transaction: corporateAction.linkCaDoc,
    args: [rawCaId, docIdsToLink],
  });
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
      assets: [new Asset({ ticker }, this.context)],
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
