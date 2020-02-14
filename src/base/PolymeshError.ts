import { ErrorCode } from '~/types';

export const ErrorMessagesPerCode: {
  [errorCode: string]: string;
} = {
  [ErrorCode.TransactionReverted]: 'The transaction execution reverted due to an error',
  [ErrorCode.TransactionAborted]:
    'The transaction was removed from the transaction pool. This might mean that it was malformed (nonce too large/nonce too small/duplicated or invalid transaction)',
  [ErrorCode.TransactionRejectedByUser]: 'The user canceled the transaction signature',
};

/**
 * Wraps an error to give more information about its type
 */
export class PolymeshError extends Error {
  public code: ErrorCode;

  /**
   * @hidden
   */
  constructor({ message, code }: { message?: string; code: ErrorCode }) {
    super(message || ErrorMessagesPerCode[code] || `Unknown error, code: ${code}`);

    this.code = code;
  }
}
