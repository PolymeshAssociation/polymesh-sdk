/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getVotes: {
      description: 'Summary of votes of a proposal given by index',
      params: [
        {
          name: 'index',
          type: 'PipId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'VoteCount',
    },
    proposedBy: {
      description: 'Retrieves proposal indices started by address',
      params: [
        {
          name: 'address',
          type: 'AccountId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<PipId>',
    },
    votedOn: {
      description: 'Retrieves proposal address indices voted on',
      params: [
        {
          name: 'address',
          type: 'AccountId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<PipId>',
    },
  },
  types: {},
};
