import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Object: any;
  DateTime: any;
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

export type Claim = {
  __typename?: 'Claim';
  targetDID?: Maybe<Scalars['String']>;
  issuer?: Maybe<Scalars['String']>;
  issuance_date?: Maybe<Scalars['Int']>;
  last_update_date?: Maybe<Scalars['Int']>;
  expiry?: Maybe<Scalars['Int']>;
  type?: Maybe<Scalars['String']>;
  jurisdiction?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['String']>;
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

export type IdentityWithClaims = {
  __typename?: 'IdentityWithClaims';
  did?: Maybe<Scalars['String']>;
  claims?: Maybe<Array<Maybe<Claim>>>;
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
  didsWithClaims?: Maybe<Array<Maybe<IdentityWithClaims>>>;
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
  dids?: Maybe<Array<Maybe<Scalars['String']>>>;
  scope?: Maybe<Scalars['String']>;
  trustedClaimIssuers?: Maybe<Array<Maybe<Scalars['String']>>>;
  claimTypes?: Maybe<Array<Maybe<Scalars['String']>>>;
  count?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type isTypeOfResolverFn<T = {}> = (
  obj: T,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  ChainInfo: ResolverTypeWrapper<any>;
  String: ResolverTypeWrapper<any>;
  Int: ResolverTypeWrapper<any>;
  Block: ResolverTypeWrapper<any>;
  Object: ResolverTypeWrapper<any>;
  DateTime: ResolverTypeWrapper<any>;
  Event: ResolverTypeWrapper<any>;
  Extrinsic: ResolverTypeWrapper<any>;
  Account: ResolverTypeWrapper<any>;
  Float: ResolverTypeWrapper<any>;
  Boolean: ResolverTypeWrapper<any>;
  IdentityWithClaims: ResolverTypeWrapper<any>;
  Claim: ResolverTypeWrapper<any>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  ChainInfo: any;
  String: any;
  Int: any;
  Block: any;
  Object: any;
  DateTime: any;
  Event: any;
  Extrinsic: any;
  Account: any;
  Float: any;
  Boolean: any;
  IdentityWithClaims: any;
  Claim: any;
};

export type AccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']
> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at_block?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  balance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  count_reaped?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  is_contract?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_nominator?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_reaped?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  is_validator?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updated_at_block?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  transactions?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Extrinsic']>>>,
    ParentType,
    ContextType,
    RequireFields<AccountTransactionsArgs, never>
  >;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export type BlockResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Block'] = ResolversParentTypes['Block']
> = {
  id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parent_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parent_hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state_root?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  extrinsics_root?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  count_extrinsics?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_events?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  spec_version_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  debug_info?: Resolver<Maybe<ResolversTypes['Object']>, ParentType, ContextType>;
  count_accounts_new?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_events_extrinsic?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_events_finalization?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_events_module?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_events_system?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_extrinsics_error?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_extrinsics_signed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_extrinsics_signedby_address?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  count_extrinsics_signedby_index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_extrinsics_success?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_extrinsics_unsigned?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  datetime?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hour?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  range10000?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  range100000?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  range1000000?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  week?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  logs?: Resolver<Maybe<ResolversTypes['Object']>, ParentType, ContextType>;
  full_day?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  full_hour?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  full_month?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  full_week?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_accounts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_accounts_reaped?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_contracts_new?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_log?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  count_sessions_new?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentBlock?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType>;
  extrinsics?: Resolver<Maybe<Array<Maybe<ResolversTypes['Extrinsic']>>>, ParentType, ContextType>;
  transactions?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Extrinsic']>>>,
    ParentType,
    ContextType
  >;
  inherents?: Resolver<Maybe<Array<Maybe<ResolversTypes['Extrinsic']>>>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export type ChainInfoResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['ChainInfo'] = ResolversParentTypes['ChainInfo']
> = {
  implementationName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  specName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  implementationVersion?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  specVersion?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  epochDuration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expectedBlockTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minimumPeriod?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  existentialDeposit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  transferFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  creationFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  transactionBaseFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  transactionByteFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sessionsPerEra?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export type ClaimResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Claim'] = ResolversParentTypes['Claim']
> = {
  targetDID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuance_date?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  last_update_date?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expiry?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  jurisdiction?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  scope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']
> = {
  block_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  event_idx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  extrinsic_idx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  spec_version_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  module_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  system?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  module?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  phase?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attributes?: Resolver<Maybe<ResolversTypes['Object']>, ParentType, ContextType>;
  event_arg_0?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event_arg_1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event_arg_2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claim_type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claim_scope?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claim_issuer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claim_expiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codec_error?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  extrinsic?: Resolver<Maybe<ResolversTypes['Extrinsic']>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export type ExtrinsicResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Extrinsic'] = ResolversParentTypes['Extrinsic']
> = {
  block_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  extrinsic_idx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  extrinsic_length?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  extrinsic_version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  signed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  unsigned?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  address_length?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  account_index?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  signature?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nonce?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  era?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  call?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  module_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  call_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  params?: Resolver<Maybe<ResolversTypes['Object']>, ParentType, ContextType>;
  success?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  spec_version_id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  codec_error?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  extrinsic_hash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  account_idx?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signedby_address?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  signedby_index?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  block?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  addressAccount?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export type IdentityWithClaimsResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['IdentityWithClaims'] = ResolversParentTypes['IdentityWithClaims']
> = {
  did?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  claims?: Resolver<Maybe<Array<Maybe<ResolversTypes['Claim']>>>, ParentType, ContextType>;
  __isTypeOf?: isTypeOfResolverFn<ParentType>;
};

export interface ObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Object'], any> {
  name: 'Object';
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  chainInfo?: Resolver<Maybe<ResolversTypes['ChainInfo']>, ParentType, ContextType>;
  latestBlock?: Resolver<Maybe<ResolversTypes['Block']>, ParentType, ContextType>;
  blocks?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Block']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryBlocksArgs, never>
  >;
  blockById?: Resolver<
    Maybe<ResolversTypes['Block']>,
    ParentType,
    ContextType,
    RequireFields<QueryBlockByIdArgs, never>
  >;
  blockByHash?: Resolver<
    Maybe<ResolversTypes['Block']>,
    ParentType,
    ContextType,
    RequireFields<QueryBlockByHashArgs, never>
  >;
  events?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Event']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryEventsArgs, 'moduleId' | 'eventId'>
  >;
  eventByIndexedArgs?: Resolver<
    Maybe<ResolversTypes['Event']>,
    ParentType,
    ContextType,
    RequireFields<QueryEventByIndexedArgsArgs, 'moduleId' | 'eventId'>
  >;
  eventsByIndexedArgs?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Event']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryEventsByIndexedArgsArgs, 'moduleId' | 'eventId'>
  >;
  transactions?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Extrinsic']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryTransactionsArgs, never>
  >;
  transactionByHash?: Resolver<
    Maybe<ResolversTypes['Extrinsic']>,
    ParentType,
    ContextType,
    RequireFields<QueryTransactionByHashArgs, never>
  >;
  transactionById?: Resolver<
    Maybe<ResolversTypes['Extrinsic']>,
    ParentType,
    ContextType,
    RequireFields<QueryTransactionByIdArgs, never>
  >;
  accountByAddress?: Resolver<
    Maybe<ResolversTypes['Account']>,
    ParentType,
    ContextType,
    RequireFields<QueryAccountByAddressArgs, never>
  >;
  bridgedEventByTxHash?: Resolver<
    Maybe<ResolversTypes['Event']>,
    ParentType,
    ContextType,
    RequireFields<QueryBridgedEventByTxHashArgs, 'ethTransactionHash'>
  >;
  didsWithClaims?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['IdentityWithClaims']>>>,
    ParentType,
    ContextType,
    RequireFields<QueryDidsWithClaimsArgs, never>
  >;
};

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>;
  Block?: BlockResolvers<ContextType>;
  ChainInfo?: ChainInfoResolvers<ContextType>;
  Claim?: ClaimResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Extrinsic?: ExtrinsicResolvers<ContextType>;
  IdentityWithClaims?: IdentityWithClaimsResolvers<ContextType>;
  Object?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
