import { u32 } from '@polkadot/types';
import BigNumber from 'bignumber.js';
import { isEqual, remove } from 'lodash';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, LinkCaDocsParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  corporateActionIdentifierToCaId,
  documentToAssetDocument,
} from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = LinkCaDocsParams & {
  id: BigNumber;
  asset: FungibleAsset;
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
  const { id: caId, asset, documents } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawAssetDocuments = await assetDocuments.entries(rawAssetId);

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

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId: caId }, context);

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
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [asset],
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
