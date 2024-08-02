/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    transferReport: {
      description:
        "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
      params: [
        {
          name: 'senderPortfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'receiverPortfolio',
          type: 'PortfolioId',
          isOptional: false,
        },
        {
          name: 'assetId',
          type: 'AssetID',
          isOptional: false,
        },
        {
          name: 'transferValue',
          type: 'Balance',
          isOptional: false,
        },
        {
          name: 'skipLockedCheck',
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
