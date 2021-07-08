/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    computeFee: {
      description: 'Gets the fee of a chargeable extrinsic operation',
      params: [
        {
          name: 'op',
          type: 'ProtocolOp',
          isOptional: false
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'CappedFee'
    }
  },
  types: {}
}