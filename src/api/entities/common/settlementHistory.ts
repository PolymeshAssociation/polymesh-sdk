import { OperationVariables, QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';

import { Context } from '~/internal';
import { withAllLegs } from '~/middleware/queries/settlements';
import {
  AssetTransaction as MiddlewareAssetTransaction,
  Event as MiddlewareEvent,
  Instruction as MiddlewareInstruction,
  Query,
} from '~/middleware/types';
import { HistoricSettlement, MiddlewarePaginationOptions, ResultSet } from '~/types';
import { DEFAULT_GQL_PAGE_SIZE } from '~/utils/constants';
import {
  HistoryPerspective,
  middlewareInstructionToHistoricSettlement,
  middlewareTransferToHistoricSettlement,
} from '~/utils/conversion';
import { calculateNextKey, queryMiddlewarePages } from '~/utils/internal';

type PagedQuery = (
  size: BigNumber,
  start: BigNumber
) => QueryOptions<OperationVariables, Partial<Query>>;

type HistoryRow =
  | { instruction: MiddlewareInstruction; transfer?: undefined }
  | { instruction?: undefined; transfer: MiddlewareAssetTransaction };

/**
 * @hidden
 *
 * Whether event `a` came before event `b` on chain
 */
function isBefore(a: MiddlewareEvent, b: MiddlewareEvent): boolean {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const blockA = a.block!.blockId;
  const blockB = b.block!.blockId;
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  return blockA === blockB ? a.eventIdx < b.eventIdx : blockA < blockB;
}

/**
 * @hidden
 *
 * Read one page of a holder's settlement history: the instructions with a leg that moves the
 *   holder's assets, and the transfers no instruction made, oldest first. They are two middleware
 *   connections, so a page of the two together is found by reading each one up to the end of the
 *   page and merging them in chain order. A later page therefore costs more requests than an
 *   earlier one
 */
export async function getSettlementHistory(
  context: Context,
  queries: { instructions: PagedQuery; transfers: PagedQuery },
  perspective: HistoryPerspective,
  opts: MiddlewarePaginationOptions = {}
): Promise<ResultSet<HistoricSettlement>> {
  const { size = new BigNumber(DEFAULT_GQL_PAGE_SIZE), start = new BigNumber(0) } = opts;
  const end = start.plus(size);

  const [instructions, transfers] = await Promise.all([
    queryMiddlewarePages(context, queries.instructions, 'instructions', end),
    queryMiddlewarePages(context, queries.transfers, 'assetTransactions', end),
  ]);

  // both connections are oldest first, so merging them keeps chain order
  const rows: HistoryRow[] = [];
  let i = 0;
  let t = 0;
  while (
    rows.length < end.toNumber() &&
    (i < instructions.nodes.length || t < transfers.nodes.length)
  ) {
    const instruction = instructions.nodes[i];
    const transfer = transfers.nodes[t];

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (!transfer || (instruction && isBefore(instruction.createdEvent!, transfer.createdEvent!))) {
      rows.push({ instruction: instruction! });
      i++;
    } else {
      rows.push({ transfer });
      t++;
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }

  const page = rows.slice(start.toNumber());

  const pageInstructions = await withAllLegs(
    page.flatMap(({ instruction }) => (instruction ? [instruction] : [])),
    context
  );

  let nextInstruction = 0;
  const data = page.map(({ instruction, transfer }) => {
    if (instruction) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const withLegs = pageInstructions[nextInstruction++]!;

      return middlewareInstructionToHistoricSettlement(withLegs, perspective, context);
    }

    return middlewareTransferToHistoricSettlement(transfer, perspective, context);
  });

  const count = new BigNumber(instructions.totalCount + transfers.totalCount);

  return {
    data,
    next: calculateNextKey(count, data.length, start),
    count,
  };
}
