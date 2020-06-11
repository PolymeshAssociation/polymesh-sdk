export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Object: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1.  */
  BigInt: any;
};

export type Query = {
  __typename?: 'Query';
  /** Get the chain  information */
  chainInfo?: Maybe<ChainInfo>;
  latestBlock?: Maybe<Block>;
  /** Get all blocks */
  blocks?: Maybe<Array<Maybe<Block>>>;
  /** Get a block by block number */
  blockById?: Maybe<Block>;
  /** Get a block by hash */
  blockByHash?: Maybe<Block>;
  /** Get events by moduleId and eventId */
  events?: Maybe<Array<Maybe<Event>>>;
  /** Get a single event by any of its indexed arguments */
  eventByIndexedArgs?: Maybe<Event>;
  /** Get events by any of its indexed arguments */
  eventsByIndexedArgs?: Maybe<Array<Maybe<Event>>>;
  /** Get non-system transactions */
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
  /** Get transaction by hash */
  transactionByHash?: Maybe<Extrinsic>;
  /** Get transaction by number */
  transactionById?: Maybe<Extrinsic>;
  /** Get account by address */
  accountByAddress?: Maybe<Account>;
  /** Get Bridged event by Ethereum transaction hash */
  bridgedEventByTxHash?: Maybe<Event>;
  /** Get all dids with at least one claim for a given scope and from one the given trustedClaimIssuers */
  didsWithClaims: Array<IdentityWithClaims>;
};

export type QueryBlocksArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryBlockByIdArgs = {
  blockId?: Maybe<Scalars['Int']>;
};

export type QueryBlockByHashArgs = {
  blockHash?: Maybe<Scalars['String']>;
};

export type QueryEventsArgs = {
  moduleId: Scalars['String'];
  eventId: Scalars['String'];
  fromBlock?: Maybe<Scalars['Int']>;
  toBlock?: Maybe<Scalars['Int']>;
};

export type QueryEventByIndexedArgsArgs = {
  moduleId: Scalars['String'];
  eventId: Scalars['String'];
  eventArg0?: Maybe<Scalars['String']>;
  eventArg1?: Maybe<Scalars['String']>;
  eventArg2?: Maybe<Scalars['String']>;
};

export type QueryEventsByIndexedArgsArgs = {
  moduleId: Scalars['String'];
  eventId: Scalars['String'];
  eventArg0?: Maybe<Scalars['String']>;
  eventArg1?: Maybe<Scalars['String']>;
  eventArg2?: Maybe<Scalars['String']>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTransactionsArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type QueryTransactionByHashArgs = {
  transactionHash?: Maybe<Scalars['String']>;
};

export type QueryTransactionByIdArgs = {
  blockId?: Maybe<Scalars['Int']>;
  transactionIdx?: Maybe<Scalars['Int']>;
};

export type QueryAccountByAddressArgs = {
  address?: Maybe<Scalars['String']>;
};

export type QueryBridgedEventByTxHashArgs = {
  ethTransactionHash: Scalars['String'];
};

export type QueryDidsWithClaimsArgs = {
  dids?: Maybe<Array<Scalars['String']>>;
  scope?: Maybe<Scalars['String']>;
  trustedClaimIssuers?: Maybe<Array<Scalars['String']>>;
  claimTypes?: Maybe<Array<Scalars['String']>>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type ChainInfo = {
  __typename?: 'ChainInfo';
  /** Chain information */
  implementationName?: Maybe<Scalars['String']>;
  specName?: Maybe<Scalars['String']>;
  implementationVersion?: Maybe<Scalars['Int']>;
  specVersion?: Maybe<Scalars['Int']>;
  epochDuration?: Maybe<Scalars['Int']>;
  expectedBlockTime?: Maybe<Scalars['Int']>;
  minimumPeriod?: Maybe<Scalars['Int']>;
  existentialDeposit?: Maybe<Scalars['Int']>;
  transferFee?: Maybe<Scalars['Int']>;
  creationFee?: Maybe<Scalars['Int']>;
  transactionBaseFee?: Maybe<Scalars['Int']>;
  transactionByteFee?: Maybe<Scalars['Int']>;
  sessionsPerEra?: Maybe<Scalars['Int']>;
};

export type Block = {
  __typename?: 'Block';
  /** Block details */
  id?: Maybe<Scalars['Int']>;
  parent_id?: Maybe<Scalars['Int']>;
  hash?: Maybe<Scalars['String']>;
  parent_hash?: Maybe<Scalars['String']>;
  state_root?: Maybe<Scalars['String']>;
  extrinsics_root?: Maybe<Scalars['String']>;
  count_extrinsics?: Maybe<Scalars['Int']>;
  count_events?: Maybe<Scalars['Int']>;
  spec_version_id?: Maybe<Scalars['String']>;
  debug_info?: Maybe<Scalars['Object']>;
  count_accounts_new?: Maybe<Scalars['Int']>;
  count_events_extrinsic?: Maybe<Scalars['Int']>;
  count_events_finalization?: Maybe<Scalars['Int']>;
  count_events_module?: Maybe<Scalars['Int']>;
  count_events_system?: Maybe<Scalars['Int']>;
  count_extrinsics_error?: Maybe<Scalars['Int']>;
  count_extrinsics_signed?: Maybe<Scalars['Int']>;
  count_extrinsics_signedby_address?: Maybe<Scalars['Int']>;
  count_extrinsics_signedby_index?: Maybe<Scalars['Int']>;
  count_extrinsics_success?: Maybe<Scalars['Int']>;
  count_extrinsics_unsigned?: Maybe<Scalars['Int']>;
  datetime?: Maybe<Scalars['DateTime']>;
  day?: Maybe<Scalars['Int']>;
  hour?: Maybe<Scalars['Int']>;
  month?: Maybe<Scalars['Int']>;
  range10000?: Maybe<Scalars['Int']>;
  range100000?: Maybe<Scalars['Int']>;
  range1000000?: Maybe<Scalars['Int']>;
  week?: Maybe<Scalars['Int']>;
  year?: Maybe<Scalars['Int']>;
  logs?: Maybe<Scalars['Object']>;
  full_day?: Maybe<Scalars['Int']>;
  full_hour?: Maybe<Scalars['Int']>;
  full_month?: Maybe<Scalars['Int']>;
  full_week?: Maybe<Scalars['Int']>;
  count_accounts?: Maybe<Scalars['Int']>;
  count_accounts_reaped?: Maybe<Scalars['Int']>;
  count_contracts_new?: Maybe<Scalars['Int']>;
  count_log?: Maybe<Scalars['Int']>;
  count_sessions_new?: Maybe<Scalars['Int']>;
  parentBlock?: Maybe<Block>;
  events?: Maybe<Array<Maybe<Event>>>;
  extrinsics?: Maybe<Array<Maybe<Extrinsic>>>;
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
  inherents?: Maybe<Array<Maybe<Extrinsic>>>;
};

export type Event = {
  __typename?: 'Event';
  /** Blockchain event */
  block_id?: Maybe<Scalars['Int']>;
  event_idx?: Maybe<Scalars['Int']>;
  extrinsic_idx?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
  spec_version_id?: Maybe<Scalars['Int']>;
  module_id?: Maybe<Scalars['String']>;
  event_id?: Maybe<Scalars['String']>;
  system?: Maybe<Scalars['Int']>;
  module?: Maybe<Scalars['Int']>;
  phase?: Maybe<Scalars['Int']>;
  attributes?: Maybe<Scalars['Object']>;
  event_arg_0?: Maybe<Scalars['String']>;
  event_arg_1?: Maybe<Scalars['String']>;
  event_arg_2?: Maybe<Scalars['String']>;
  claim_type?: Maybe<Scalars['String']>;
  claim_scope?: Maybe<Scalars['String']>;
  claim_issuer?: Maybe<Scalars['String']>;
  claim_expiry?: Maybe<Scalars['String']>;
  codec_error?: Maybe<Scalars['Int']>;
  block?: Maybe<Block>;
  extrinsic?: Maybe<Extrinsic>;
};

export type Extrinsic = {
  __typename?: 'Extrinsic';
  /** Extrinsic details */
  block_id?: Maybe<Scalars['Int']>;
  extrinsic_idx?: Maybe<Scalars['Int']>;
  extrinsic_length?: Maybe<Scalars['String']>;
  extrinsic_version?: Maybe<Scalars['String']>;
  signed?: Maybe<Scalars['Int']>;
  unsigned?: Maybe<Scalars['Int']>;
  address_length?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  account_index?: Maybe<Scalars['String']>;
  signature?: Maybe<Scalars['String']>;
  nonce?: Maybe<Scalars['Int']>;
  era?: Maybe<Scalars['String']>;
  call?: Maybe<Scalars['String']>;
  module_id?: Maybe<Scalars['String']>;
  call_id?: Maybe<Scalars['String']>;
  params?: Maybe<Scalars['Object']>;
  success?: Maybe<Scalars['Int']>;
  error?: Maybe<Scalars['Int']>;
  spec_version_id?: Maybe<Scalars['Int']>;
  codec_error?: Maybe<Scalars['Int']>;
  extrinsic_hash?: Maybe<Scalars['String']>;
  account_idx?: Maybe<Scalars['Int']>;
  signedby_address?: Maybe<Scalars['Int']>;
  signedby_index?: Maybe<Scalars['Int']>;
  block?: Maybe<Block>;
  addressAccount?: Maybe<Account>;
};

export type Account = {
  __typename?: 'Account';
  id?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  created_at_block?: Maybe<Scalars['Int']>;
  balance?: Maybe<Scalars['Float']>;
  count_reaped?: Maybe<Scalars['Int']>;
  is_contract?: Maybe<Scalars['Boolean']>;
  is_nominator?: Maybe<Scalars['Boolean']>;
  is_reaped?: Maybe<Scalars['Boolean']>;
  is_validator?: Maybe<Scalars['Boolean']>;
  updated_at_block?: Maybe<Scalars['Int']>;
  transactions?: Maybe<Array<Maybe<Extrinsic>>>;
};

export type AccountTransactionsArgs = {
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type IdentityWithClaims = {
  __typename?: 'IdentityWithClaims';
  did: Scalars['String'];
  claims: Array<Claim>;
};

export type Claim = {
  __typename?: 'Claim';
  targetDID: Scalars['String'];
  issuer: Scalars['String'];
  issuance_date: Scalars['BigInt'];
  last_update_date: Scalars['BigInt'];
  expiry?: Maybe<Scalars['BigInt']>;
  type: Scalars['String'];
  jurisdiction?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['String']>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE',
}
