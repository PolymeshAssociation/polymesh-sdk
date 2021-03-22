/* eslint-disable @typescript-eslint/camelcase */
export default {
  rpc: {
    canTransfer: {
      description: 'Checks whether a transaction with given parameters can take place or not',
      params: [
        {
          name: 'sender',
          type: 'AccountId',
          isOptional: false,
        },
        {
          name: 'from_custodian',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'from_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'to_custodian',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'to_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'ticker',
          type: 'Ticker',
          isOptional: false,
        },
        {
          name: 'value',
          type: 'Balance',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'CanTransferResult',
    },
    canTransferGranular: {
      description:
        'Checks whether a transaction with given parameters can take place or not. The result is granular meaning each check is run and returned regardless of outcome.',
      params: [
        {
          name: 'from_custodian',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'from_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'to_custodian',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'to_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'ticker',
          type: 'Ticker',
          isOptional: false,
        },
        {
          name: 'value',
          type: 'Balance',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'GranularCanTransferResult',
    },
    balanceAt: {
      description: 'Returns the ticker balances of identities at a checkpoint.',
      params: [
        {
          name: 'ticker',
          type: 'Ticker',
          isOptional: false,
        },
        {
          name: 'checkpoint',
          type: 'CheckpointId',
          isOptional: false,
        },
        {
          name: 'dids',
          type: 'Vec<IdentityId>',
          isOptional: false,
        },
      ],
      type: 'BalanceAtResult',
    },
  },
  types: {},
};
