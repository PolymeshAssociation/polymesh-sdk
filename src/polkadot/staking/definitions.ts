/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getCurve: {
      description: 'Retrieves curves parameters',
      params: [
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'Vec<(Perbill, Perbill)>'
    }
  },
  types: {}
}