import { QueryOptions } from '@apollo/client/core';
import BigNumber from 'bignumber.js';
import gql from 'graphql-tag';

import {
  MultiSigProposal,
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
          votes(orderBy: [${MultiSigProposalVotesOrderBy.CreatedAtAsc}, ${MultiSigProposalVotesOrderBy.CreatedBlockIdAsc}, ${MultiSigProposalVotesOrderBy.EventIdxAsc}]) {
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
  const query = gql`
    query MultiSigProposalVotesQuery($proposalId: String!) {
      multiSigProposalVotes(
        filter: { proposalId: { equalTo: $proposalId } }
        orderBy: [${MultiSigProposalVotesOrderBy.CreatedAtAsc}, ${MultiSigProposalVotesOrderBy.CreatedBlockIdAsc}, ${MultiSigProposalVotesOrderBy.EventIdxAsc}]
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

type MultiSigProposalQueryParameters = {
  multisigId: string;
};

/**
 * @hidden
 *
 * Get MultiSig Proposals history for a given MultiSig address
 */
export function multiSigProposalsQuery(
  multisigId: string,
  size?: BigNumber,
  start?: BigNumber
): QueryOptions<PaginatedQueryArgs<MultiSigProposalQueryParameters>> {
  const query = gql`
    query MultiSigProposalsQuery($size: Int, $start: Int, $multisigId: String!) {
      multiSigProposals(
        filter: { multisigId: { equalTo: $multisigId } }
        first: $size
        offset: $start
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
    variables: { size: size?.toNumber(), start: start?.toNumber(), multisigId },
  };
}
