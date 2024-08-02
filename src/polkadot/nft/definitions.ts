/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    transferReport: {
      description:
        "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
      params: [
        {
          name: 'sender_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'receiver_portfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'nfts',
          type: 'NFTs',
          isOptional: false,
        },
        {
          name: 'skip_locked_check',
          type: 'bool',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<DispatchError>',
    },
  },
  types: {},
};
