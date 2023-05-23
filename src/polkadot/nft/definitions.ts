/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    validateNFTTransfer: {
      description:
        'Verifies if and the sender and receiver are not the same, if both have valid balances, if the sender owns the nft, and if all compliance rules are being respected.',
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
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'DispatchResult',
    },
  },
  types: {},
};
