import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import { createArgsAndFilters, getSizeAndOffset, orderByClause } from '~/middleware/queries/common';
import {
  MultiSigProposal,
  MultiSigProposalsOrderBy,
  MultiSigProposalVote,
  MultiSigProposalVotesOrderBy,
} from '~/middleware/types';
import { PaginatedQueryArgs, QueryArgs } from '~/types/utils';

/**
 * @hidden
 *
 * Get MultiSig proposal details for a given MultiSig address and portfolio ID
 */
export function multiSigProposalQuery(
  variables: QueryArgs<MultiSigProposal, 'multisigId' | 'proposalId'>
): QueryOptions<QueryArgs<MultiSigProposal, 'multisigId' | 'proposalId'>> {
  const orderBy = `${MultiSigProposalVotesOrderBy.CreatedBlockIdAsc}, ${MultiSigProposalVotesOrderBy.EventIdxAsc}`;

  const query = gql`
    query MultiSigProposalQuery($multisigId: String!, $proposalId: Int!) {
      multiSigProposals(
        filter: { multisigId: { equalTo: $multisigId }, proposalId: { equalTo: $proposalId } }
      ) {
        nodes {
          eventIdx
          creatorId
          creatorAccount
          createdBlock {
            blockId
            hash
            datetime
          }
          votes(orderBy: [${orderBy}]) {
            nodes {
              action
              signer {
                signerType
                signerValue
              }
            }
          }
          updatedBlock {
            blockId
            hash
            datetime
          }
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get MultiSig proposal votes for a given proposalId ({multiSigAddress}/{proposalId})
 */
export function multiSigProposalVotesQuery(
  variables: QueryArgs<MultiSigProposalVote, 'proposalId'>
): QueryOptions<QueryArgs<MultiSigProposalVote, 'proposalId'>> {
  const orderBy = `${MultiSigProposalVotesOrderBy.CreatedBlockIdAsc}, ${MultiSigProposalVotesOrderBy.EventIdxAsc}`;

  const query = gql`
    query MultiSigProposalVotesQuery($proposalId: String!) {
      multiSigProposalVotes(
        filter: { proposalId: { equalTo: $proposalId } }
        orderBy: [${orderBy}]
      ) {
        nodes {
          signer {
            signerType
            signerValue
          }
          action
          eventIdx
          createdBlockId
          createdBlock {
            blockId
            datetime
            hash
          }
        }
      }
    }
  `;

  return {
    query,
    variables,
  };
}

/**
 * @hidden
 *
 * Get MultiSig Proposals history for a given MultiSig address
 */
export function multiSigProposalsQuery(
  filters: QueryArgs<MultiSigProposal, 'multisigId' | 'status'>,
  size?: BigNumber,
  start?: BigNumber,
  orderBy?: MultiSigProposalsOrderBy | MultiSigProposalsOrderBy[]
): QueryOptions<PaginatedQueryArgs<QueryArgs<MultiSigProposal, 'multisigId' | 'status'>>> {
  const { args, filter } = createArgsAndFilters(filters, {});

  // `id` embeds an unpadded proposal number; `proposalId` is an Int, and unique per multisig
  const ordering = orderByClause(orderBy, [MultiSigProposalsOrderBy.ProposalIdDesc]);

  const query = gql`
    query MultiSigProposalsQuery
      ${args}
     {
      multiSigProposals(
        ${filter}
        first: $size
        offset: $start
        orderBy: [${ordering}]
      ) {
        nodes {
          id
          proposalId
          multisigId
          status
          approvalCount
          rejectionCount
          params
        }
        totalCount
      }
    }
  `;

  return {
    query,
    variables: { ...filters, ...getSizeAndOffset(size, start) },
  };
}
