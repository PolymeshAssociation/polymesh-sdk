/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getVotes: {
      description: 'Summary of votes of a proposal given by index',
      params: [
        {
          name: 'index',
          type: 'u32',
          isOptional: false
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'VoteCount'
    },
    proposedBy: {
      description: 'Retrieves proposal indices started by address',
      params: [
        {
          name: 'address',
          type: 'AccountId',
          isOptional: false
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Vec<u32>'
    },
    votedOn: {
      description: 'Retrieves proposal address indices voted on',
      params: [
        {
          name: 'address',
          type: 'AccountId',
          isOptional: false
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Vec<u32>'
    }
  },
  types: {}
}