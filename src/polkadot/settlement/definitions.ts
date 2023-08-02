/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getExecuteInstructionInfo: {
      description:
        'Returns an ExecuteInstructionInfo instance, containing the consumed weight and the number of tokens in the instruction.',
      params: [
        {
          name: 'instructionId',
          type: 'InstructionId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'ExecuteInstructionInfo',
    },
  },
  types: {},
};
