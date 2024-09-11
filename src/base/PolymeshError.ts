import { ErrorCode } from '~/types';

const defaultMessages: {
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

  public data?: Record<string, unknown>;

  /**
   * @hidden
   */
  constructor({
    message,
    code,
    data,
  }: {
    message?: string;
    code: ErrorCode;
    data?: Record<string, unknown>;
  }) {
    super(message || defaultMessages[code] || `Unknown error, code: ${code}`);

    this.code = code;
    this.data = data;
  }
}
