/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    canTransferGranular: {
      description:
        'Checks whether a transaction with given parameters can take place or not. The result is granular meaning each check is run and returned regardless of outcome.',
      params: [
        {
          name: 'fromCustodian',
          type: 'Option<PolymeshPrimitivesIdentityId>',
          isOptional: false,
        },
        {
          name: 'fromPortfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'toCustodian',
          type: 'Option<PolymeshPrimitivesIdentityId>',
          isOptional: false,
        },
        {
          name: 'toPortfolio',
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
      type: 'CanTransferGranularReturn',
    },
  },
  types: {},
};
