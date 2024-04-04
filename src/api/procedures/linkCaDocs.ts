import { u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { isEqual, remove } from 'lodash';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, LinkCaDocsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
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
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateAction', 'linkCaDoc'>>> {
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

  const docIdsToLink: u32[] = [];
  const documentsCopy = [...documents]; // avoid mutation

  rawAssetDocuments.forEach(([key, doc]) => {
    const [, id] = key.args;
    if (doc.isSome) {
      const removedList = remove(documentsCopy, document =>
        isEqual(document, documentToAssetDocument(doc.unwrap()))
      );
      if (removedList.length) {
        docIdsToLink.push(id);
      }
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

  return {
    transaction: corporateAction.linkCaDoc,
    args: [rawCaId, docIdsToLink],
    resolver: undefined,
  };
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
      assets: [new FungibleAsset({ ticker }, this.context)],
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
