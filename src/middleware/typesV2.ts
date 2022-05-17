export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A floating point number that requires more precision than IEEE 754 binary 64 */
  BigFloat: any;
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /** The day, does not include a time. */
  Date: any;
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
};

export type Account = Node & {
  __typename?: 'Account';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  address: Scalars['String'];
  identityId: Scalars['String'];
  eventId: Scalars['String'];
  permissionsId: Scalars['String'];
  blockId: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Identity` that is related to this `Account`. */
  identity?: Maybe<Identity>;
  /** Reads a single `Permission` that is related to this `Account`. */
  permissions?: Maybe<Permission>;
  /** Reads a single `Block` that is related to this `Account`. */
  block?: Maybe<Block>;
};

export type AccountAggregates = {
  __typename?: 'AccountAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Account` object types. All fields are combined with a logical ‘and.’ */
export type AccountFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `address` field. */
  address?: Maybe<StringFilter>;
  /** Filter by the object’s `identityId` field. */
  identityId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `permissionsId` field. */
  permissionsId?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AccountFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AccountFilter>>;
  /** Negates the expression. */
  not?: Maybe<AccountFilter>;
};

/** A connection to a list of `Account` values. */
export type AccountsConnection = {
  __typename?: 'AccountsConnection';
  /** A list of `Account` objects. */
  nodes: Array<Maybe<Account>>;
  /** A list of edges which contains the `Account` and cursor to aid in pagination. */
  edges: Array<AccountsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Account` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AccountAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AccountAggregates>>;
};

/** A connection to a list of `Account` values. */
export type AccountsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AccountsGroupBy>;
  having?: Maybe<AccountsHavingInput>;
};

/** A `Account` edge in the connection. */
export type AccountsEdge = {
  __typename?: 'AccountsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Account` at the end of the edge. */
  node?: Maybe<Account>;
};

/** Grouping methods for `Account` for usage during aggregation. */
export enum AccountsGroupBy {
  IdentityId = 'IDENTITY_ID',
  EventId = 'EVENT_ID',
  PermissionsId = 'PERMISSIONS_ID',
  BlockId = 'BLOCK_ID',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Account` aggregates. */
export type AccountsHavingInput = {
  AND?: Maybe<Array<AccountsHavingInput>>;
  OR?: Maybe<Array<AccountsHavingInput>>;
};

/** Methods to use when ordering `Account`. */
export enum AccountsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  PermissionsIdAsc = 'PERMISSIONS_ID_ASC',
  PermissionsIdDesc = 'PERMISSIONS_ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type AgentGroup = Node & {
  __typename?: 'AgentGroup';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  permissions: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads and enables pagination through a set of `AgentGroupMembership`. */
  members: AgentGroupMembershipsConnection;
};

export type AgentGroupMembersArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AgentGroupMembershipsOrderBy>>;
  filter?: Maybe<AgentGroupMembershipFilter>;
};

export type AgentGroupAggregates = {
  __typename?: 'AgentGroupAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `AgentGroup` object types. All fields are combined with a logical ‘and.’ */
export type AgentGroupFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `permissions` field. */
  permissions?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AgentGroupFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AgentGroupFilter>>;
  /** Negates the expression. */
  not?: Maybe<AgentGroupFilter>;
};

export type AgentGroupMembership = Node & {
  __typename?: 'AgentGroupMembership';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  member: Scalars['String'];
  groupId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `AgentGroup` that is related to this `AgentGroupMembership`. */
  group?: Maybe<AgentGroup>;
};

export type AgentGroupMembershipAggregates = {
  __typename?: 'AgentGroupMembershipAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `AgentGroupMembership` object types. All fields are combined with a logical ‘and.’ */
export type AgentGroupMembershipFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `member` field. */
  member?: Maybe<StringFilter>;
  /** Filter by the object’s `groupId` field. */
  groupId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AgentGroupMembershipFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AgentGroupMembershipFilter>>;
  /** Negates the expression. */
  not?: Maybe<AgentGroupMembershipFilter>;
};

/** A connection to a list of `AgentGroupMembership` values. */
export type AgentGroupMembershipsConnection = {
  __typename?: 'AgentGroupMembershipsConnection';
  /** A list of `AgentGroupMembership` objects. */
  nodes: Array<Maybe<AgentGroupMembership>>;
  /** A list of edges which contains the `AgentGroupMembership` and cursor to aid in pagination. */
  edges: Array<AgentGroupMembershipsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `AgentGroupMembership` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AgentGroupMembershipAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AgentGroupMembershipAggregates>>;
};

/** A connection to a list of `AgentGroupMembership` values. */
export type AgentGroupMembershipsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AgentGroupMembershipsGroupBy>;
  having?: Maybe<AgentGroupMembershipsHavingInput>;
};

/** A `AgentGroupMembership` edge in the connection. */
export type AgentGroupMembershipsEdge = {
  __typename?: 'AgentGroupMembershipsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AgentGroupMembership` at the end of the edge. */
  node?: Maybe<AgentGroupMembership>;
};

/** Grouping methods for `AgentGroupMembership` for usage during aggregation. */
export enum AgentGroupMembershipsGroupBy {
  Member = 'MEMBER',
  GroupId = 'GROUP_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `AgentGroupMembership` aggregates. */
export type AgentGroupMembershipsHavingInput = {
  AND?: Maybe<Array<AgentGroupMembershipsHavingInput>>;
  OR?: Maybe<Array<AgentGroupMembershipsHavingInput>>;
};

/** Methods to use when ordering `AgentGroupMembership`. */
export enum AgentGroupMembershipsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemberAsc = 'MEMBER_ASC',
  MemberDesc = 'MEMBER_DESC',
  GroupIdAsc = 'GROUP_ID_ASC',
  GroupIdDesc = 'GROUP_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `AgentGroup` values. */
export type AgentGroupsConnection = {
  __typename?: 'AgentGroupsConnection';
  /** A list of `AgentGroup` objects. */
  nodes: Array<Maybe<AgentGroup>>;
  /** A list of edges which contains the `AgentGroup` and cursor to aid in pagination. */
  edges: Array<AgentGroupsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `AgentGroup` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AgentGroupAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AgentGroupAggregates>>;
};

/** A connection to a list of `AgentGroup` values. */
export type AgentGroupsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AgentGroupsGroupBy>;
  having?: Maybe<AgentGroupsHavingInput>;
};

/** A `AgentGroup` edge in the connection. */
export type AgentGroupsEdge = {
  __typename?: 'AgentGroupsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AgentGroup` at the end of the edge. */
  node?: Maybe<AgentGroup>;
};

/** Grouping methods for `AgentGroup` for usage during aggregation. */
export enum AgentGroupsGroupBy {
  Permissions = 'PERMISSIONS',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `AgentGroup` aggregates. */
export type AgentGroupsHavingInput = {
  AND?: Maybe<Array<AgentGroupsHavingInput>>;
  OR?: Maybe<Array<AgentGroupsHavingInput>>;
};

/** Methods to use when ordering `AgentGroup`. */
export enum AgentGroupsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  MembersCountAsc = 'MEMBERS_COUNT_ASC',
  MembersCountDesc = 'MEMBERS_COUNT_DESC',
}

export type Asset = Node & {
  __typename?: 'Asset';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
  fundingRound?: Maybe<Scalars['String']>;
  isDivisible: Scalars['Boolean'];
  isFrozen: Scalars['Boolean'];
  isUniquenessRequired: Scalars['Boolean'];
  documents: Scalars['JSON'];
  identifiers: Scalars['JSON'];
  ownerDid: Scalars['String'];
  totalSupply: Scalars['String'];
  totalTransfers: Scalars['String'];
  compliance: Scalars['JSON'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads and enables pagination through a set of `AssetHolder`. */
  holders: AssetHoldersConnection;
};

export type AssetHoldersArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AssetHoldersOrderBy>>;
  filter?: Maybe<AssetHolderFilter>;
};

export type AssetAggregates = {
  __typename?: 'AssetAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Asset` object types. All fields are combined with a logical ‘and.’ */
export type AssetFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `name` field. */
  name?: Maybe<StringFilter>;
  /** Filter by the object’s `type` field. */
  type?: Maybe<StringFilter>;
  /** Filter by the object’s `fundingRound` field. */
  fundingRound?: Maybe<StringFilter>;
  /** Filter by the object’s `isDivisible` field. */
  isDivisible?: Maybe<BooleanFilter>;
  /** Filter by the object’s `isFrozen` field. */
  isFrozen?: Maybe<BooleanFilter>;
  /** Filter by the object’s `isUniquenessRequired` field. */
  isUniquenessRequired?: Maybe<BooleanFilter>;
  /** Filter by the object’s `documents` field. */
  documents?: Maybe<JsonFilter>;
  /** Filter by the object’s `identifiers` field. */
  identifiers?: Maybe<JsonFilter>;
  /** Filter by the object’s `ownerDid` field. */
  ownerDid?: Maybe<StringFilter>;
  /** Filter by the object’s `totalSupply` field. */
  totalSupply?: Maybe<StringFilter>;
  /** Filter by the object’s `totalTransfers` field. */
  totalTransfers?: Maybe<StringFilter>;
  /** Filter by the object’s `compliance` field. */
  compliance?: Maybe<JsonFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AssetFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AssetFilter>>;
  /** Negates the expression. */
  not?: Maybe<AssetFilter>;
};

export type AssetHolder = Node & {
  __typename?: 'AssetHolder';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  did: Scalars['String'];
  ticker: Scalars['String'];
  amount: Scalars['String'];
  assetId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Asset` that is related to this `AssetHolder`. */
  asset?: Maybe<Asset>;
};

export type AssetHolderAggregates = {
  __typename?: 'AssetHolderAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `AssetHolder` object types. All fields are combined with a logical ‘and.’ */
export type AssetHolderFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `did` field. */
  did?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `amount` field. */
  amount?: Maybe<StringFilter>;
  /** Filter by the object’s `assetId` field. */
  assetId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AssetHolderFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AssetHolderFilter>>;
  /** Negates the expression. */
  not?: Maybe<AssetHolderFilter>;
};

/** A connection to a list of `AssetHolder` values. */
export type AssetHoldersConnection = {
  __typename?: 'AssetHoldersConnection';
  /** A list of `AssetHolder` objects. */
  nodes: Array<Maybe<AssetHolder>>;
  /** A list of edges which contains the `AssetHolder` and cursor to aid in pagination. */
  edges: Array<AssetHoldersEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `AssetHolder` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AssetHolderAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AssetHolderAggregates>>;
};

/** A connection to a list of `AssetHolder` values. */
export type AssetHoldersConnectionGroupedAggregatesArgs = {
  groupBy: Array<AssetHoldersGroupBy>;
  having?: Maybe<AssetHoldersHavingInput>;
};

/** A `AssetHolder` edge in the connection. */
export type AssetHoldersEdge = {
  __typename?: 'AssetHoldersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AssetHolder` at the end of the edge. */
  node?: Maybe<AssetHolder>;
};

/** Grouping methods for `AssetHolder` for usage during aggregation. */
export enum AssetHoldersGroupBy {
  Did = 'DID',
  Ticker = 'TICKER',
  Amount = 'AMOUNT',
  AssetId = 'ASSET_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `AssetHolder` aggregates. */
export type AssetHoldersHavingInput = {
  AND?: Maybe<Array<AssetHoldersHavingInput>>;
  OR?: Maybe<Array<AssetHoldersHavingInput>>;
};

/** Methods to use when ordering `AssetHolder`. */
export enum AssetHoldersOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type AssetPendingOwnershipTransfer = Node & {
  __typename?: 'AssetPendingOwnershipTransfer';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  from: Scalars['String'];
  to: Scalars['String'];
  type: Scalars['String'];
  data?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type AssetPendingOwnershipTransferAggregates = {
  __typename?: 'AssetPendingOwnershipTransferAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `AssetPendingOwnershipTransfer` object types. All fields are combined with a logical ‘and.’ */
export type AssetPendingOwnershipTransferFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `from` field. */
  from?: Maybe<StringFilter>;
  /** Filter by the object’s `to` field. */
  to?: Maybe<StringFilter>;
  /** Filter by the object’s `type` field. */
  type?: Maybe<StringFilter>;
  /** Filter by the object’s `data` field. */
  data?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AssetPendingOwnershipTransferFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AssetPendingOwnershipTransferFilter>>;
  /** Negates the expression. */
  not?: Maybe<AssetPendingOwnershipTransferFilter>;
};

/** A connection to a list of `AssetPendingOwnershipTransfer` values. */
export type AssetPendingOwnershipTransfersConnection = {
  __typename?: 'AssetPendingOwnershipTransfersConnection';
  /** A list of `AssetPendingOwnershipTransfer` objects. */
  nodes: Array<Maybe<AssetPendingOwnershipTransfer>>;
  /** A list of edges which contains the `AssetPendingOwnershipTransfer` and cursor to aid in pagination. */
  edges: Array<AssetPendingOwnershipTransfersEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `AssetPendingOwnershipTransfer` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AssetPendingOwnershipTransferAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AssetPendingOwnershipTransferAggregates>>;
};

/** A connection to a list of `AssetPendingOwnershipTransfer` values. */
export type AssetPendingOwnershipTransfersConnectionGroupedAggregatesArgs = {
  groupBy: Array<AssetPendingOwnershipTransfersGroupBy>;
  having?: Maybe<AssetPendingOwnershipTransfersHavingInput>;
};

/** A `AssetPendingOwnershipTransfer` edge in the connection. */
export type AssetPendingOwnershipTransfersEdge = {
  __typename?: 'AssetPendingOwnershipTransfersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AssetPendingOwnershipTransfer` at the end of the edge. */
  node?: Maybe<AssetPendingOwnershipTransfer>;
};

/** Grouping methods for `AssetPendingOwnershipTransfer` for usage during aggregation. */
export enum AssetPendingOwnershipTransfersGroupBy {
  Ticker = 'TICKER',
  From = 'FROM',
  To = 'TO',
  Type = 'TYPE',
  Data = 'DATA',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `AssetPendingOwnershipTransfer` aggregates. */
export type AssetPendingOwnershipTransfersHavingInput = {
  AND?: Maybe<Array<AssetPendingOwnershipTransfersHavingInput>>;
  OR?: Maybe<Array<AssetPendingOwnershipTransfersHavingInput>>;
};

/** Methods to use when ordering `AssetPendingOwnershipTransfer`. */
export enum AssetPendingOwnershipTransfersOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  FromAsc = 'FROM_ASC',
  FromDesc = 'FROM_DESC',
  ToAsc = 'TO_ASC',
  ToDesc = 'TO_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `Asset` values. */
export type AssetsConnection = {
  __typename?: 'AssetsConnection';
  /** A list of `Asset` objects. */
  nodes: Array<Maybe<Asset>>;
  /** A list of edges which contains the `Asset` and cursor to aid in pagination. */
  edges: Array<AssetsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Asset` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AssetAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AssetAggregates>>;
};

/** A connection to a list of `Asset` values. */
export type AssetsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AssetsGroupBy>;
  having?: Maybe<AssetsHavingInput>;
};

/** A `Asset` edge in the connection. */
export type AssetsEdge = {
  __typename?: 'AssetsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Asset` at the end of the edge. */
  node?: Maybe<Asset>;
};

/** Grouping methods for `Asset` for usage during aggregation. */
export enum AssetsGroupBy {
  Name = 'NAME',
  Type = 'TYPE',
  FundingRound = 'FUNDING_ROUND',
  IsDivisible = 'IS_DIVISIBLE',
  IsFrozen = 'IS_FROZEN',
  IsUniquenessRequired = 'IS_UNIQUENESS_REQUIRED',
  Documents = 'DOCUMENTS',
  Identifiers = 'IDENTIFIERS',
  OwnerDid = 'OWNER_DID',
  TotalSupply = 'TOTAL_SUPPLY',
  TotalTransfers = 'TOTAL_TRANSFERS',
  Compliance = 'COMPLIANCE',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Asset` aggregates. */
export type AssetsHavingInput = {
  AND?: Maybe<Array<AssetsHavingInput>>;
  OR?: Maybe<Array<AssetsHavingInput>>;
};

/** Methods to use when ordering `Asset`. */
export enum AssetsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IsDivisibleAsc = 'IS_DIVISIBLE_ASC',
  IsDivisibleDesc = 'IS_DIVISIBLE_DESC',
  IsFrozenAsc = 'IS_FROZEN_ASC',
  IsFrozenDesc = 'IS_FROZEN_DESC',
  IsUniquenessRequiredAsc = 'IS_UNIQUENESS_REQUIRED_ASC',
  IsUniquenessRequiredDesc = 'IS_UNIQUENESS_REQUIRED_DESC',
  DocumentsAsc = 'DOCUMENTS_ASC',
  DocumentsDesc = 'DOCUMENTS_DESC',
  IdentifiersAsc = 'IDENTIFIERS_ASC',
  IdentifiersDesc = 'IDENTIFIERS_DESC',
  OwnerDidAsc = 'OWNER_DID_ASC',
  OwnerDidDesc = 'OWNER_DID_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  TotalTransfersAsc = 'TOTAL_TRANSFERS_ASC',
  TotalTransfersDesc = 'TOTAL_TRANSFERS_DESC',
  ComplianceAsc = 'COMPLIANCE_ASC',
  ComplianceDesc = 'COMPLIANCE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  HoldersCountAsc = 'HOLDERS_COUNT_ASC',
  HoldersCountDesc = 'HOLDERS_COUNT_DESC',
}

export type Authorization = Node & {
  __typename?: 'Authorization';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  createdBlock: Scalars['Int'];
  authId: Scalars['Int'];
  type: Scalars['String'];
  fromDid: Scalars['String'];
  toDid?: Maybe<Scalars['String']>;
  toKey?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['String']>;
  expiry?: Maybe<Scalars['Datetime']>;
  status: Scalars['String'];
  updatedBlock: Scalars['Int'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type AuthorizationAggregates = {
  __typename?: 'AuthorizationAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Authorization` object types. All fields are combined with a logical ‘and.’ */
export type AuthorizationFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `createdBlock` field. */
  createdBlock?: Maybe<IntFilter>;
  /** Filter by the object’s `authId` field. */
  authId?: Maybe<IntFilter>;
  /** Filter by the object’s `type` field. */
  type?: Maybe<StringFilter>;
  /** Filter by the object’s `fromDid` field. */
  fromDid?: Maybe<StringFilter>;
  /** Filter by the object’s `toDid` field. */
  toDid?: Maybe<StringFilter>;
  /** Filter by the object’s `toKey` field. */
  toKey?: Maybe<StringFilter>;
  /** Filter by the object’s `data` field. */
  data?: Maybe<StringFilter>;
  /** Filter by the object’s `expiry` field. */
  expiry?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `status` field. */
  status?: Maybe<StringFilter>;
  /** Filter by the object’s `updatedBlock` field. */
  updatedBlock?: Maybe<IntFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<AuthorizationFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<AuthorizationFilter>>;
  /** Negates the expression. */
  not?: Maybe<AuthorizationFilter>;
};

/** A connection to a list of `Authorization` values. */
export type AuthorizationsConnection = {
  __typename?: 'AuthorizationsConnection';
  /** A list of `Authorization` objects. */
  nodes: Array<Maybe<Authorization>>;
  /** A list of edges which contains the `Authorization` and cursor to aid in pagination. */
  edges: Array<AuthorizationsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Authorization` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AuthorizationAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AuthorizationAggregates>>;
};

/** A connection to a list of `Authorization` values. */
export type AuthorizationsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AuthorizationsGroupBy>;
  having?: Maybe<AuthorizationsHavingInput>;
};

/** A `Authorization` edge in the connection. */
export type AuthorizationsEdge = {
  __typename?: 'AuthorizationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Authorization` at the end of the edge. */
  node?: Maybe<Authorization>;
};

/** Grouping methods for `Authorization` for usage during aggregation. */
export enum AuthorizationsGroupBy {
  CreatedBlock = 'CREATED_BLOCK',
  AuthId = 'AUTH_ID',
  Type = 'TYPE',
  FromDid = 'FROM_DID',
  ToDid = 'TO_DID',
  ToKey = 'TO_KEY',
  Data = 'DATA',
  Expiry = 'EXPIRY',
  Status = 'STATUS',
  UpdatedBlock = 'UPDATED_BLOCK',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Authorization` aggregates. */
export type AuthorizationsHavingInput = {
  AND?: Maybe<Array<AuthorizationsHavingInput>>;
  OR?: Maybe<Array<AuthorizationsHavingInput>>;
};

/** Methods to use when ordering `Authorization`. */
export enum AuthorizationsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  CreatedBlockAsc = 'CREATED_BLOCK_ASC',
  CreatedBlockDesc = 'CREATED_BLOCK_DESC',
  AuthIdAsc = 'AUTH_ID_ASC',
  AuthIdDesc = 'AUTH_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  FromDidAsc = 'FROM_DID_ASC',
  FromDidDesc = 'FROM_DID_DESC',
  ToDidAsc = 'TO_DID_ASC',
  ToDidDesc = 'TO_DID_DESC',
  ToKeyAsc = 'TO_KEY_ASC',
  ToKeyDesc = 'TO_KEY_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockAsc = 'UPDATED_BLOCK_ASC',
  UpdatedBlockDesc = 'UPDATED_BLOCK_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against BigFloat fields. All fields are combined with a logical ‘and.’ */
export type BigFloatFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['BigFloat']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['BigFloat']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['BigFloat']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['BigFloat']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['BigFloat']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['BigFloat']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['BigFloat']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['BigFloat']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['BigFloat']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['BigFloat']>;
};

export type Block = Node & {
  __typename?: 'Block';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['Int'];
  parentId: Scalars['Int'];
  hash: Scalars['String'];
  parentHash: Scalars['String'];
  stateRoot: Scalars['String'];
  extrinsicsRoot: Scalars['String'];
  countExtrinsics: Scalars['Int'];
  countExtrinsicsUnsigned: Scalars['Int'];
  countExtrinsicsSigned: Scalars['Int'];
  countExtrinsicsError: Scalars['Int'];
  countExtrinsicsSuccess: Scalars['Int'];
  countEvents: Scalars['Int'];
  datetime: Scalars['Datetime'];
  specVersionId: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads and enables pagination through a set of `Event`. */
  events: EventsConnection;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsics: ExtrinsicsConnection;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByCreatedBlockId: PermissionsConnection;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByUpdatedBlockId: PermissionsConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByCreatedBlockId: IdentitiesConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByUpdatedBlockId: IdentitiesConnection;
  /** Reads and enables pagination through a set of `Account`. */
  accounts: AccountsConnection;
  /** Reads and enables pagination through a set of `BridgeEvent`. */
  bridgeEvents: BridgeEventsConnection;
  /** Reads and enables pagination through a set of `StakingEvent`. */
  stakingEvents: StakingEventsConnection;
  /** Reads and enables pagination through a set of `TickerExternalAgentAction`. */
  tickerExternalAgentActions: TickerExternalAgentActionsConnection;
  /** Reads and enables pagination through a set of `Funding`. */
  fundings: FundingsConnection;
  /** Reads and enables pagination through a set of `Investment`. */
  investments: InvestmentsConnection;
  /** Reads and enables pagination through a set of `TickerExternalAgentAdded`. */
  tickerExternalAgentAddeds: TickerExternalAgentAddedsConnection;
  /** Reads and enables pagination through a set of `TickerExternalAgentHistory`. */
  tickerExternalAgentHistories: TickerExternalAgentHistoriesConnection;
  /** Reads and enables pagination through a set of `Settlement`. */
  settlements: SettlementsConnection;
  /** Reads and enables pagination through a set of `Instruction`. */
  instructions: InstructionsConnection;
  /** Reads and enables pagination through a set of `HistoryOfPaymentEventsForCa`. */
  historyOfPaymentEventsForCas: HistoryOfPaymentEventsForCasConnection;
  /** Reads and enables pagination through a set of `Proposal`. */
  proposals: ProposalsConnection;
  /** Reads and enables pagination through a set of `ProposalVote`. */
  proposalVotes: ProposalVotesConnection;
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByPermissionCreatedBlockIdAndUpdatedBlockId: BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByPermissionUpdatedBlockIdAndCreatedBlockId: BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByIdentityCreatedBlockIdAndUpdatedBlockId: BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByIdentityUpdatedBlockIdAndCreatedBlockId: BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByAccountBlockIdAndIdentityId: BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByAccountBlockIdAndPermissionsId: BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Proposal`. */
  proposalsByProposalVoteBlockIdAndProposalId: BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByClaimBlockIdAndTargetId: BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByClaimBlockIdAndIssuerId: BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyConnection;
};

export type BlockEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<EventsOrderBy>>;
  filter?: Maybe<EventFilter>;
};

export type BlockExtrinsicsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ExtrinsicsOrderBy>>;
  filter?: Maybe<ExtrinsicFilter>;
};

export type BlockPermissionsByCreatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<PermissionsOrderBy>>;
  filter?: Maybe<PermissionFilter>;
};

export type BlockPermissionsByUpdatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<PermissionsOrderBy>>;
  filter?: Maybe<PermissionFilter>;
};

export type BlockIdentitiesByCreatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type BlockIdentitiesByUpdatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type BlockAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

export type BlockBridgeEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BridgeEventsOrderBy>>;
  filter?: Maybe<BridgeEventFilter>;
};

export type BlockStakingEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<StakingEventsOrderBy>>;
  filter?: Maybe<StakingEventFilter>;
};

export type BlockTickerExternalAgentActionsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentActionsOrderBy>>;
  filter?: Maybe<TickerExternalAgentActionFilter>;
};

export type BlockFundingsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<FundingsOrderBy>>;
  filter?: Maybe<FundingFilter>;
};

export type BlockInvestmentsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<InvestmentsOrderBy>>;
  filter?: Maybe<InvestmentFilter>;
};

export type BlockTickerExternalAgentAddedsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentAddedsOrderBy>>;
  filter?: Maybe<TickerExternalAgentAddedFilter>;
};

export type BlockTickerExternalAgentHistoriesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentHistoriesOrderBy>>;
  filter?: Maybe<TickerExternalAgentHistoryFilter>;
};

export type BlockSettlementsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<SettlementsOrderBy>>;
  filter?: Maybe<SettlementFilter>;
};

export type BlockInstructionsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<InstructionsOrderBy>>;
  filter?: Maybe<InstructionFilter>;
};

export type BlockHistoryOfPaymentEventsForCasArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<HistoryOfPaymentEventsForCasOrderBy>>;
  filter?: Maybe<HistoryOfPaymentEventsForCaFilter>;
};

export type BlockProposalsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalsOrderBy>>;
  filter?: Maybe<ProposalFilter>;
};

export type BlockProposalVotesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalVotesOrderBy>>;
  filter?: Maybe<ProposalVoteFilter>;
};

export type BlockClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

export type BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type BlockIdentitiesByAccountBlockIdAndIdentityIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type BlockPermissionsByAccountBlockIdAndPermissionsIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<PermissionsOrderBy>>;
  filter?: Maybe<PermissionFilter>;
};

export type BlockProposalsByProposalVoteBlockIdAndProposalIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalsOrderBy>>;
  filter?: Maybe<ProposalFilter>;
};

export type BlockIdentitiesByClaimBlockIdAndTargetIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type BlockIdentitiesByClaimBlockIdAndIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type BlockAggregates = {
  __typename?: 'BlockAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `Identity`. */
export type BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyConnection = {
  __typename?: 'BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Identity`, and the cursor to aid in pagination. */
  edges: Array<BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Identity`. */
export type BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `Identity`. */
export type BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyEdge = {
  __typename?: 'BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByUpdatedBlockId: IdentitiesConnection;
};

/** A `Block` edge in the connection, with data from `Identity`. */
export type BlockBlocksByIdentityCreatedBlockIdAndUpdatedBlockIdManyToManyEdgeIdentitiesByUpdatedBlockIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<IdentitiesOrderBy>>;
    filter?: Maybe<IdentityFilter>;
  };

/** A connection to a list of `Block` values, with data from `Identity`. */
export type BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyConnection = {
  __typename?: 'BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Identity`, and the cursor to aid in pagination. */
  edges: Array<BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Identity`. */
export type BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `Identity`. */
export type BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyEdge = {
  __typename?: 'BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByCreatedBlockId: IdentitiesConnection;
};

/** A `Block` edge in the connection, with data from `Identity`. */
export type BlockBlocksByIdentityUpdatedBlockIdAndCreatedBlockIdManyToManyEdgeIdentitiesByCreatedBlockIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<IdentitiesOrderBy>>;
    filter?: Maybe<IdentityFilter>;
  };

/** A connection to a list of `Block` values, with data from `Permission`. */
export type BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyConnection = {
  __typename?: 'BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Permission`, and the cursor to aid in pagination. */
  edges: Array<BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Permission`. */
export type BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `Permission`. */
export type BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyEdge = {
  __typename?: 'BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByUpdatedBlockId: PermissionsConnection;
};

/** A `Block` edge in the connection, with data from `Permission`. */
export type BlockBlocksByPermissionCreatedBlockIdAndUpdatedBlockIdManyToManyEdgePermissionsByUpdatedBlockIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<PermissionsOrderBy>>;
    filter?: Maybe<PermissionFilter>;
  };

/** A connection to a list of `Block` values, with data from `Permission`. */
export type BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyConnection = {
  __typename?: 'BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Permission`, and the cursor to aid in pagination. */
  edges: Array<BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Permission`. */
export type BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `Permission`. */
export type BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyEdge = {
  __typename?: 'BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByCreatedBlockId: PermissionsConnection;
};

/** A `Block` edge in the connection, with data from `Permission`. */
export type BlockBlocksByPermissionUpdatedBlockIdAndCreatedBlockIdManyToManyEdgePermissionsByCreatedBlockIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<PermissionsOrderBy>>;
    filter?: Maybe<PermissionFilter>;
  };

/** A filter to be used against `Block` object types. All fields are combined with a logical ‘and.’ */
export type BlockFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
  /** Filter by the object’s `parentId` field. */
  parentId?: Maybe<IntFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: Maybe<StringFilter>;
  /** Filter by the object’s `parentHash` field. */
  parentHash?: Maybe<StringFilter>;
  /** Filter by the object’s `stateRoot` field. */
  stateRoot?: Maybe<StringFilter>;
  /** Filter by the object’s `extrinsicsRoot` field. */
  extrinsicsRoot?: Maybe<StringFilter>;
  /** Filter by the object’s `countExtrinsics` field. */
  countExtrinsics?: Maybe<IntFilter>;
  /** Filter by the object’s `countExtrinsicsUnsigned` field. */
  countExtrinsicsUnsigned?: Maybe<IntFilter>;
  /** Filter by the object’s `countExtrinsicsSigned` field. */
  countExtrinsicsSigned?: Maybe<IntFilter>;
  /** Filter by the object’s `countExtrinsicsError` field. */
  countExtrinsicsError?: Maybe<IntFilter>;
  /** Filter by the object’s `countExtrinsicsSuccess` field. */
  countExtrinsicsSuccess?: Maybe<IntFilter>;
  /** Filter by the object’s `countEvents` field. */
  countEvents?: Maybe<IntFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `specVersionId` field. */
  specVersionId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<BlockFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<BlockFilter>>;
  /** Negates the expression. */
  not?: Maybe<BlockFilter>;
};

/** A connection to a list of `Identity` values, with data from `Account`. */
export type BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyConnection = {
  __typename?: 'BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Account`. */
export type BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<IdentitiesGroupBy>;
    having?: Maybe<IdentitiesHavingInput>;
  };

/** A `Identity` edge in the connection, with data from `Account`. */
export type BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyEdge = {
  __typename?: 'BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Account`. */
  secondaryAccounts: AccountsConnection;
};

/** A `Identity` edge in the connection, with data from `Account`. */
export type BlockIdentitiesByAccountBlockIdAndIdentityIdManyToManyEdgeSecondaryAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyConnection = {
  __typename?: 'BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<IdentitiesGroupBy>;
  having?: Maybe<IdentitiesHavingInput>;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyEdge = {
  __typename?: 'BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByIssuerId: ClaimsConnection;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndIssuerIdManyToManyEdgeClaimsByIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyConnection = {
  __typename?: 'BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<IdentitiesGroupBy>;
  having?: Maybe<IdentitiesHavingInput>;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyEdge = {
  __typename?: 'BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByTargetId: ClaimsConnection;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type BlockIdentitiesByClaimBlockIdAndTargetIdManyToManyEdgeClaimsByTargetIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `Permission` values, with data from `Account`. */
export type BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyConnection = {
  __typename?: 'BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyConnection';
  /** A list of `Permission` objects. */
  nodes: Array<Maybe<Permission>>;
  /** A list of edges which contains the `Permission`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Permission` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<PermissionAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<PermissionAggregates>>;
};

/** A connection to a list of `Permission` values, with data from `Account`. */
export type BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<PermissionsGroupBy>;
    having?: Maybe<PermissionsHavingInput>;
  };

/** A `Permission` edge in the connection, with data from `Account`. */
export type BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyEdge = {
  __typename?: 'BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Permission` at the end of the edge. */
  node?: Maybe<Permission>;
  /** Reads and enables pagination through a set of `Account`. */
  accountsByPermissionsId: AccountsConnection;
};

/** A `Permission` edge in the connection, with data from `Account`. */
export type BlockPermissionsByAccountBlockIdAndPermissionsIdManyToManyEdgeAccountsByPermissionsIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<AccountsOrderBy>>;
    filter?: Maybe<AccountFilter>;
  };

/** A connection to a list of `Proposal` values, with data from `ProposalVote`. */
export type BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyConnection = {
  __typename?: 'BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyConnection';
  /** A list of `Proposal` objects. */
  nodes: Array<Maybe<Proposal>>;
  /** A list of edges which contains the `Proposal`, info from the `ProposalVote`, and the cursor to aid in pagination. */
  edges: Array<BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Proposal` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalAggregates>>;
};

/** A connection to a list of `Proposal` values, with data from `ProposalVote`. */
export type BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<ProposalsGroupBy>;
    having?: Maybe<ProposalsHavingInput>;
  };

/** A `Proposal` edge in the connection, with data from `ProposalVote`. */
export type BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyEdge = {
  __typename?: 'BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Proposal` at the end of the edge. */
  node?: Maybe<Proposal>;
  /** Reads and enables pagination through a set of `ProposalVote`. */
  votes: ProposalVotesConnection;
};

/** A `Proposal` edge in the connection, with data from `ProposalVote`. */
export type BlockProposalsByProposalVoteBlockIdAndProposalIdManyToManyEdgeVotesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalVotesOrderBy>>;
  filter?: Maybe<ProposalVoteFilter>;
};

/** A connection to a list of `Block` values. */
export type BlocksConnection = {
  __typename?: 'BlocksConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block` and cursor to aid in pagination. */
  edges: Array<BlocksEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values. */
export type BlocksConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: Maybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection. */
export type BlocksEdge = {
  __typename?: 'BlocksEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
};

/** Grouping methods for `Block` for usage during aggregation. */
export enum BlocksGroupBy {
  ParentId = 'PARENT_ID',
  ParentHash = 'PARENT_HASH',
  StateRoot = 'STATE_ROOT',
  ExtrinsicsRoot = 'EXTRINSICS_ROOT',
  CountExtrinsics = 'COUNT_EXTRINSICS',
  CountExtrinsicsUnsigned = 'COUNT_EXTRINSICS_UNSIGNED',
  CountExtrinsicsSigned = 'COUNT_EXTRINSICS_SIGNED',
  CountExtrinsicsError = 'COUNT_EXTRINSICS_ERROR',
  CountExtrinsicsSuccess = 'COUNT_EXTRINSICS_SUCCESS',
  CountEvents = 'COUNT_EVENTS',
  Datetime = 'DATETIME',
  SpecVersionId = 'SPEC_VERSION_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Block` aggregates. */
export type BlocksHavingInput = {
  AND?: Maybe<Array<BlocksHavingInput>>;
  OR?: Maybe<Array<BlocksHavingInput>>;
};

/** Methods to use when ordering `Block`. */
export enum BlocksOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ParentIdAsc = 'PARENT_ID_ASC',
  ParentIdDesc = 'PARENT_ID_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  ParentHashAsc = 'PARENT_HASH_ASC',
  ParentHashDesc = 'PARENT_HASH_DESC',
  StateRootAsc = 'STATE_ROOT_ASC',
  StateRootDesc = 'STATE_ROOT_DESC',
  ExtrinsicsRootAsc = 'EXTRINSICS_ROOT_ASC',
  ExtrinsicsRootDesc = 'EXTRINSICS_ROOT_DESC',
  CountExtrinsicsAsc = 'COUNT_EXTRINSICS_ASC',
  CountExtrinsicsDesc = 'COUNT_EXTRINSICS_DESC',
  CountExtrinsicsUnsignedAsc = 'COUNT_EXTRINSICS_UNSIGNED_ASC',
  CountExtrinsicsUnsignedDesc = 'COUNT_EXTRINSICS_UNSIGNED_DESC',
  CountExtrinsicsSignedAsc = 'COUNT_EXTRINSICS_SIGNED_ASC',
  CountExtrinsicsSignedDesc = 'COUNT_EXTRINSICS_SIGNED_DESC',
  CountExtrinsicsErrorAsc = 'COUNT_EXTRINSICS_ERROR_ASC',
  CountExtrinsicsErrorDesc = 'COUNT_EXTRINSICS_ERROR_DESC',
  CountExtrinsicsSuccessAsc = 'COUNT_EXTRINSICS_SUCCESS_ASC',
  CountExtrinsicsSuccessDesc = 'COUNT_EXTRINSICS_SUCCESS_DESC',
  CountEventsAsc = 'COUNT_EVENTS_ASC',
  CountEventsDesc = 'COUNT_EVENTS_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  EventsCountAsc = 'EVENTS_COUNT_ASC',
  EventsCountDesc = 'EVENTS_COUNT_DESC',
  ExtrinsicsCountAsc = 'EXTRINSICS_COUNT_ASC',
  ExtrinsicsCountDesc = 'EXTRINSICS_COUNT_DESC',
  PermissionsByCreatedBlockIdCountAsc = 'PERMISSIONS_BY_CREATED_BLOCK_ID_COUNT_ASC',
  PermissionsByCreatedBlockIdCountDesc = 'PERMISSIONS_BY_CREATED_BLOCK_ID_COUNT_DESC',
  PermissionsByUpdatedBlockIdCountAsc = 'PERMISSIONS_BY_UPDATED_BLOCK_ID_COUNT_ASC',
  PermissionsByUpdatedBlockIdCountDesc = 'PERMISSIONS_BY_UPDATED_BLOCK_ID_COUNT_DESC',
  IdentitiesByCreatedBlockIdCountAsc = 'IDENTITIES_BY_CREATED_BLOCK_ID_COUNT_ASC',
  IdentitiesByCreatedBlockIdCountDesc = 'IDENTITIES_BY_CREATED_BLOCK_ID_COUNT_DESC',
  IdentitiesByUpdatedBlockIdCountAsc = 'IDENTITIES_BY_UPDATED_BLOCK_ID_COUNT_ASC',
  IdentitiesByUpdatedBlockIdCountDesc = 'IDENTITIES_BY_UPDATED_BLOCK_ID_COUNT_DESC',
  AccountsCountAsc = 'ACCOUNTS_COUNT_ASC',
  AccountsCountDesc = 'ACCOUNTS_COUNT_DESC',
  BridgeEventsCountAsc = 'BRIDGE_EVENTS_COUNT_ASC',
  BridgeEventsCountDesc = 'BRIDGE_EVENTS_COUNT_DESC',
  StakingEventsCountAsc = 'STAKING_EVENTS_COUNT_ASC',
  StakingEventsCountDesc = 'STAKING_EVENTS_COUNT_DESC',
  TickerExternalAgentActionsCountAsc = 'TICKER_EXTERNAL_AGENT_ACTIONS_COUNT_ASC',
  TickerExternalAgentActionsCountDesc = 'TICKER_EXTERNAL_AGENT_ACTIONS_COUNT_DESC',
  FundingsCountAsc = 'FUNDINGS_COUNT_ASC',
  FundingsCountDesc = 'FUNDINGS_COUNT_DESC',
  InvestmentsCountAsc = 'INVESTMENTS_COUNT_ASC',
  InvestmentsCountDesc = 'INVESTMENTS_COUNT_DESC',
  TickerExternalAgentAddedsCountAsc = 'TICKER_EXTERNAL_AGENT_ADDEDS_COUNT_ASC',
  TickerExternalAgentAddedsCountDesc = 'TICKER_EXTERNAL_AGENT_ADDEDS_COUNT_DESC',
  TickerExternalAgentHistoriesCountAsc = 'TICKER_EXTERNAL_AGENT_HISTORIES_COUNT_ASC',
  TickerExternalAgentHistoriesCountDesc = 'TICKER_EXTERNAL_AGENT_HISTORIES_COUNT_DESC',
  SettlementsCountAsc = 'SETTLEMENTS_COUNT_ASC',
  SettlementsCountDesc = 'SETTLEMENTS_COUNT_DESC',
  InstructionsCountAsc = 'INSTRUCTIONS_COUNT_ASC',
  InstructionsCountDesc = 'INSTRUCTIONS_COUNT_DESC',
  HistoryOfPaymentEventsForCasCountAsc = 'HISTORY_OF_PAYMENT_EVENTS_FOR_CAS_COUNT_ASC',
  HistoryOfPaymentEventsForCasCountDesc = 'HISTORY_OF_PAYMENT_EVENTS_FOR_CAS_COUNT_DESC',
  ProposalsCountAsc = 'PROPOSALS_COUNT_ASC',
  ProposalsCountDesc = 'PROPOSALS_COUNT_DESC',
  ProposalVotesCountAsc = 'PROPOSAL_VOTES_COUNT_ASC',
  ProposalVotesCountDesc = 'PROPOSAL_VOTES_COUNT_DESC',
  ClaimsCountAsc = 'CLAIMS_COUNT_ASC',
  ClaimsCountDesc = 'CLAIMS_COUNT_DESC',
}

/** A filter to be used against Boolean fields. All fields are combined with a logical ‘and.’ */
export type BooleanFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['Boolean']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['Boolean']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['Boolean']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['Boolean']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['Boolean']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['Boolean']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['Boolean']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['Boolean']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['Boolean']>;
};

export type BridgeEvent = Node & {
  __typename?: 'BridgeEvent';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  identityId: Scalars['String'];
  recipient: Scalars['String'];
  amount: Scalars['BigFloat'];
  txHash: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `BridgeEvent`. */
  block?: Maybe<Block>;
};

export type BridgeEventAggregates = {
  __typename?: 'BridgeEventAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `BridgeEvent` object types. All fields are combined with a logical ‘and.’ */
export type BridgeEventFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `identityId` field. */
  identityId?: Maybe<StringFilter>;
  /** Filter by the object’s `recipient` field. */
  recipient?: Maybe<StringFilter>;
  /** Filter by the object’s `amount` field. */
  amount?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `txHash` field. */
  txHash?: Maybe<StringFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<BridgeEventFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<BridgeEventFilter>>;
  /** Negates the expression. */
  not?: Maybe<BridgeEventFilter>;
};

/** A connection to a list of `BridgeEvent` values. */
export type BridgeEventsConnection = {
  __typename?: 'BridgeEventsConnection';
  /** A list of `BridgeEvent` objects. */
  nodes: Array<Maybe<BridgeEvent>>;
  /** A list of edges which contains the `BridgeEvent` and cursor to aid in pagination. */
  edges: Array<BridgeEventsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `BridgeEvent` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BridgeEventAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BridgeEventAggregates>>;
};

/** A connection to a list of `BridgeEvent` values. */
export type BridgeEventsConnectionGroupedAggregatesArgs = {
  groupBy: Array<BridgeEventsGroupBy>;
  having?: Maybe<BridgeEventsHavingInput>;
};

/** A `BridgeEvent` edge in the connection. */
export type BridgeEventsEdge = {
  __typename?: 'BridgeEventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `BridgeEvent` at the end of the edge. */
  node?: Maybe<BridgeEvent>;
};

/** Grouping methods for `BridgeEvent` for usage during aggregation. */
export enum BridgeEventsGroupBy {
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  IdentityId = 'IDENTITY_ID',
  Recipient = 'RECIPIENT',
  Amount = 'AMOUNT',
  TxHash = 'TX_HASH',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `BridgeEvent` aggregates. */
export type BridgeEventsHavingInput = {
  AND?: Maybe<Array<BridgeEventsHavingInput>>;
  OR?: Maybe<Array<BridgeEventsHavingInput>>;
};

/** Methods to use when ordering `BridgeEvent`. */
export enum BridgeEventsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  RecipientAsc = 'RECIPIENT_ASC',
  RecipientDesc = 'RECIPIENT_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  TxHashAsc = 'TX_HASH_ASC',
  TxHashDesc = 'TX_HASH_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Claim = Node & {
  __typename?: 'Claim';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  targetId: Scalars['String'];
  issuerId: Scalars['String'];
  issuanceDate: Scalars['BigFloat'];
  lastUpdateDate: Scalars['BigFloat'];
  expiry?: Maybe<Scalars['BigFloat']>;
  filterExpiry: Scalars['BigFloat'];
  type: Scalars['String'];
  jurisdiction?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['JSON']>;
  cddId?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Claim`. */
  block?: Maybe<Block>;
  /** Reads a single `Identity` that is related to this `Claim`. */
  target?: Maybe<Identity>;
  /** Reads a single `Identity` that is related to this `Claim`. */
  issuer?: Maybe<Identity>;
};

export type ClaimAggregates = {
  __typename?: 'ClaimAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Claim` object types. All fields are combined with a logical ‘and.’ */
export type ClaimFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `targetId` field. */
  targetId?: Maybe<StringFilter>;
  /** Filter by the object’s `issuerId` field. */
  issuerId?: Maybe<StringFilter>;
  /** Filter by the object’s `issuanceDate` field. */
  issuanceDate?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `lastUpdateDate` field. */
  lastUpdateDate?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `expiry` field. */
  expiry?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `filterExpiry` field. */
  filterExpiry?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `type` field. */
  type?: Maybe<StringFilter>;
  /** Filter by the object’s `jurisdiction` field. */
  jurisdiction?: Maybe<StringFilter>;
  /** Filter by the object’s `scope` field. */
  scope?: Maybe<JsonFilter>;
  /** Filter by the object’s `cddId` field. */
  cddId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<ClaimFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<ClaimFilter>>;
  /** Negates the expression. */
  not?: Maybe<ClaimFilter>;
};

export type ClaimScope = Node & {
  __typename?: 'ClaimScope';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  target: Scalars['String'];
  ticker?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['JSON']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type ClaimScopeAggregates = {
  __typename?: 'ClaimScopeAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `ClaimScope` object types. All fields are combined with a logical ‘and.’ */
export type ClaimScopeFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `target` field. */
  target?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `scope` field. */
  scope?: Maybe<JsonFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<ClaimScopeFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<ClaimScopeFilter>>;
  /** Negates the expression. */
  not?: Maybe<ClaimScopeFilter>;
};

/** A connection to a list of `ClaimScope` values. */
export type ClaimScopesConnection = {
  __typename?: 'ClaimScopesConnection';
  /** A list of `ClaimScope` objects. */
  nodes: Array<Maybe<ClaimScope>>;
  /** A list of edges which contains the `ClaimScope` and cursor to aid in pagination. */
  edges: Array<ClaimScopesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ClaimScope` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ClaimScopeAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ClaimScopeAggregates>>;
};

/** A connection to a list of `ClaimScope` values. */
export type ClaimScopesConnectionGroupedAggregatesArgs = {
  groupBy: Array<ClaimScopesGroupBy>;
  having?: Maybe<ClaimScopesHavingInput>;
};

/** A `ClaimScope` edge in the connection. */
export type ClaimScopesEdge = {
  __typename?: 'ClaimScopesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ClaimScope` at the end of the edge. */
  node?: Maybe<ClaimScope>;
};

/** Grouping methods for `ClaimScope` for usage during aggregation. */
export enum ClaimScopesGroupBy {
  Target = 'TARGET',
  Ticker = 'TICKER',
  Scope = 'SCOPE',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `ClaimScope` aggregates. */
export type ClaimScopesHavingInput = {
  AND?: Maybe<Array<ClaimScopesHavingInput>>;
  OR?: Maybe<Array<ClaimScopesHavingInput>>;
};

/** Methods to use when ordering `ClaimScope`. */
export enum ClaimScopesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TargetAsc = 'TARGET_ASC',
  TargetDesc = 'TARGET_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `Claim` values. */
export type ClaimsConnection = {
  __typename?: 'ClaimsConnection';
  /** A list of `Claim` objects. */
  nodes: Array<Maybe<Claim>>;
  /** A list of edges which contains the `Claim` and cursor to aid in pagination. */
  edges: Array<ClaimsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Claim` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ClaimAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ClaimAggregates>>;
};

/** A connection to a list of `Claim` values. */
export type ClaimsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ClaimsGroupBy>;
  having?: Maybe<ClaimsHavingInput>;
};

/** A `Claim` edge in the connection. */
export type ClaimsEdge = {
  __typename?: 'ClaimsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Claim` at the end of the edge. */
  node?: Maybe<Claim>;
};

/** Grouping methods for `Claim` for usage during aggregation. */
export enum ClaimsGroupBy {
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  TargetId = 'TARGET_ID',
  IssuerId = 'ISSUER_ID',
  IssuanceDate = 'ISSUANCE_DATE',
  LastUpdateDate = 'LAST_UPDATE_DATE',
  Expiry = 'EXPIRY',
  FilterExpiry = 'FILTER_EXPIRY',
  Type = 'TYPE',
  Jurisdiction = 'JURISDICTION',
  Scope = 'SCOPE',
  CddId = 'CDD_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Claim` aggregates. */
export type ClaimsHavingInput = {
  AND?: Maybe<Array<ClaimsHavingInput>>;
  OR?: Maybe<Array<ClaimsHavingInput>>;
};

/** Methods to use when ordering `Claim`. */
export enum ClaimsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  TargetIdAsc = 'TARGET_ID_ASC',
  TargetIdDesc = 'TARGET_ID_DESC',
  IssuerIdAsc = 'ISSUER_ID_ASC',
  IssuerIdDesc = 'ISSUER_ID_DESC',
  IssuanceDateAsc = 'ISSUANCE_DATE_ASC',
  IssuanceDateDesc = 'ISSUANCE_DATE_DESC',
  LastUpdateDateAsc = 'LAST_UPDATE_DATE_ASC',
  LastUpdateDateDesc = 'LAST_UPDATE_DATE_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  FilterExpiryAsc = 'FILTER_EXPIRY_ASC',
  FilterExpiryDesc = 'FILTER_EXPIRY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  JurisdictionAsc = 'JURISDICTION_ASC',
  JurisdictionDesc = 'JURISDICTION_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  CddIdAsc = 'CDD_ID_ASC',
  CddIdDesc = 'CDD_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’ */
export type DatetimeFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['Datetime']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['Datetime']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['Datetime']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['Datetime']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['Datetime']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['Datetime']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['Datetime']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['Datetime']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['Datetime']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['Datetime']>;
};

export type Debug = Node & {
  __typename?: 'Debug';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  line?: Maybe<Scalars['String']>;
  context?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type DebugAggregates = {
  __typename?: 'DebugAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Debug` object types. All fields are combined with a logical ‘and.’ */
export type DebugFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `line` field. */
  line?: Maybe<StringFilter>;
  /** Filter by the object’s `context` field. */
  context?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<DebugFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<DebugFilter>>;
  /** Negates the expression. */
  not?: Maybe<DebugFilter>;
};

/** A connection to a list of `Debug` values. */
export type DebugsConnection = {
  __typename?: 'DebugsConnection';
  /** A list of `Debug` objects. */
  nodes: Array<Maybe<Debug>>;
  /** A list of edges which contains the `Debug` and cursor to aid in pagination. */
  edges: Array<DebugsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Debug` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<DebugAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<DebugAggregates>>;
};

/** A connection to a list of `Debug` values. */
export type DebugsConnectionGroupedAggregatesArgs = {
  groupBy: Array<DebugsGroupBy>;
  having?: Maybe<DebugsHavingInput>;
};

/** A `Debug` edge in the connection. */
export type DebugsEdge = {
  __typename?: 'DebugsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Debug` at the end of the edge. */
  node?: Maybe<Debug>;
};

/** Grouping methods for `Debug` for usage during aggregation. */
export enum DebugsGroupBy {
  Line = 'LINE',
  Context = 'CONTEXT',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Debug` aggregates. */
export type DebugsHavingInput = {
  AND?: Maybe<Array<DebugsHavingInput>>;
  OR?: Maybe<Array<DebugsHavingInput>>;
};

/** Methods to use when ordering `Debug`. */
export enum DebugsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LineAsc = 'LINE_ASC',
  LineDesc = 'LINE_DESC',
  ContextAsc = 'CONTEXT_ASC',
  ContextDesc = 'CONTEXT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Event = Node & {
  __typename?: 'Event';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  extrinsicIdx?: Maybe<Scalars['Int']>;
  specVersionId: Scalars['Int'];
  moduleId: Scalars['String'];
  eventId: Scalars['String'];
  attributesTxt: Scalars['String'];
  eventArg0?: Maybe<Scalars['String']>;
  eventArg1?: Maybe<Scalars['String']>;
  eventArg2?: Maybe<Scalars['String']>;
  eventArg3?: Maybe<Scalars['String']>;
  claimType?: Maybe<Scalars['String']>;
  claimScope?: Maybe<Scalars['String']>;
  claimIssuer?: Maybe<Scalars['String']>;
  claimExpiry?: Maybe<Scalars['String']>;
  corporateActionTicker?: Maybe<Scalars['String']>;
  fundraiserOfferingAsset?: Maybe<Scalars['String']>;
  transferTo?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  attributes?: Maybe<Scalars['JSON']>;
  /** Reads a single `Block` that is related to this `Event`. */
  block?: Maybe<Block>;
};

export type EventAggregates = {
  __typename?: 'EventAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Event` object types. All fields are combined with a logical ‘and.’ */
export type EventFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `extrinsicIdx` field. */
  extrinsicIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `specVersionId` field. */
  specVersionId?: Maybe<IntFilter>;
  /** Filter by the object’s `moduleId` field. */
  moduleId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `attributesTxt` field. */
  attributesTxt?: Maybe<StringFilter>;
  /** Filter by the object’s `eventArg0` field. */
  eventArg0?: Maybe<StringFilter>;
  /** Filter by the object’s `eventArg1` field. */
  eventArg1?: Maybe<StringFilter>;
  /** Filter by the object’s `eventArg2` field. */
  eventArg2?: Maybe<StringFilter>;
  /** Filter by the object’s `eventArg3` field. */
  eventArg3?: Maybe<StringFilter>;
  /** Filter by the object’s `claimType` field. */
  claimType?: Maybe<StringFilter>;
  /** Filter by the object’s `claimScope` field. */
  claimScope?: Maybe<StringFilter>;
  /** Filter by the object’s `claimIssuer` field. */
  claimIssuer?: Maybe<StringFilter>;
  /** Filter by the object’s `claimExpiry` field. */
  claimExpiry?: Maybe<StringFilter>;
  /** Filter by the object’s `corporateActionTicker` field. */
  corporateActionTicker?: Maybe<StringFilter>;
  /** Filter by the object’s `fundraiserOfferingAsset` field. */
  fundraiserOfferingAsset?: Maybe<StringFilter>;
  /** Filter by the object’s `transferTo` field. */
  transferTo?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `attributes` field. */
  attributes?: Maybe<JsonFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<EventFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<EventFilter>>;
  /** Negates the expression. */
  not?: Maybe<EventFilter>;
};

/** A connection to a list of `Event` values. */
export type EventsConnection = {
  __typename?: 'EventsConnection';
  /** A list of `Event` objects. */
  nodes: Array<Maybe<Event>>;
  /** A list of edges which contains the `Event` and cursor to aid in pagination. */
  edges: Array<EventsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Event` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<EventAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<EventAggregates>>;
};

/** A connection to a list of `Event` values. */
export type EventsConnectionGroupedAggregatesArgs = {
  groupBy: Array<EventsGroupBy>;
  having?: Maybe<EventsHavingInput>;
};

/** A `Event` edge in the connection. */
export type EventsEdge = {
  __typename?: 'EventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Event` at the end of the edge. */
  node?: Maybe<Event>;
};

/** Grouping methods for `Event` for usage during aggregation. */
export enum EventsGroupBy {
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  ExtrinsicIdx = 'EXTRINSIC_IDX',
  SpecVersionId = 'SPEC_VERSION_ID',
  ModuleId = 'MODULE_ID',
  EventId = 'EVENT_ID',
  AttributesTxt = 'ATTRIBUTES_TXT',
  EventArg_0 = 'EVENT_ARG_0',
  EventArg_1 = 'EVENT_ARG_1',
  EventArg_2 = 'EVENT_ARG_2',
  EventArg_3 = 'EVENT_ARG_3',
  ClaimType = 'CLAIM_TYPE',
  ClaimScope = 'CLAIM_SCOPE',
  ClaimIssuer = 'CLAIM_ISSUER',
  ClaimExpiry = 'CLAIM_EXPIRY',
  CorporateActionTicker = 'CORPORATE_ACTION_TICKER',
  FundraiserOfferingAsset = 'FUNDRAISER_OFFERING_ASSET',
  TransferTo = 'TRANSFER_TO',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  Attributes = 'ATTRIBUTES',
}

/** Conditions for `Event` aggregates. */
export type EventsHavingInput = {
  AND?: Maybe<Array<EventsHavingInput>>;
  OR?: Maybe<Array<EventsHavingInput>>;
};

/** Methods to use when ordering `Event`. */
export enum EventsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  AttributesTxtAsc = 'ATTRIBUTES_TXT_ASC',
  AttributesTxtDesc = 'ATTRIBUTES_TXT_DESC',
  EventArg_0Asc = 'EVENT_ARG_0_ASC',
  EventArg_0Desc = 'EVENT_ARG_0_DESC',
  EventArg_1Asc = 'EVENT_ARG_1_ASC',
  EventArg_1Desc = 'EVENT_ARG_1_DESC',
  EventArg_2Asc = 'EVENT_ARG_2_ASC',
  EventArg_2Desc = 'EVENT_ARG_2_DESC',
  EventArg_3Asc = 'EVENT_ARG_3_ASC',
  EventArg_3Desc = 'EVENT_ARG_3_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  ClaimScopeAsc = 'CLAIM_SCOPE_ASC',
  ClaimScopeDesc = 'CLAIM_SCOPE_DESC',
  ClaimIssuerAsc = 'CLAIM_ISSUER_ASC',
  ClaimIssuerDesc = 'CLAIM_ISSUER_DESC',
  ClaimExpiryAsc = 'CLAIM_EXPIRY_ASC',
  ClaimExpiryDesc = 'CLAIM_EXPIRY_DESC',
  CorporateActionTickerAsc = 'CORPORATE_ACTION_TICKER_ASC',
  CorporateActionTickerDesc = 'CORPORATE_ACTION_TICKER_DESC',
  FundraiserOfferingAssetAsc = 'FUNDRAISER_OFFERING_ASSET_ASC',
  FundraiserOfferingAssetDesc = 'FUNDRAISER_OFFERING_ASSET_DESC',
  TransferToAsc = 'TRANSFER_TO_ASC',
  TransferToDesc = 'TRANSFER_TO_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  AttributesAsc = 'ATTRIBUTES_ASC',
  AttributesDesc = 'ATTRIBUTES_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Extrinsic = Node & {
  __typename?: 'Extrinsic';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  extrinsicIdx: Scalars['Int'];
  extrinsicLength: Scalars['String'];
  signed: Scalars['Int'];
  signedbyAddress: Scalars['Int'];
  address?: Maybe<Scalars['String']>;
  moduleId: Scalars['String'];
  callId: Scalars['String'];
  paramsTxt: Scalars['String'];
  success: Scalars['Int'];
  nonce?: Maybe<Scalars['Int']>;
  extrinsicHash?: Maybe<Scalars['String']>;
  specVersionId: Scalars['Int'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  params?: Maybe<Scalars['JSON']>;
  /** Reads a single `Block` that is related to this `Extrinsic`. */
  block?: Maybe<Block>;
};

export type ExtrinsicAggregates = {
  __typename?: 'ExtrinsicAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Extrinsic` object types. All fields are combined with a logical ‘and.’ */
export type ExtrinsicFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `extrinsicIdx` field. */
  extrinsicIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `extrinsicLength` field. */
  extrinsicLength?: Maybe<StringFilter>;
  /** Filter by the object’s `signed` field. */
  signed?: Maybe<IntFilter>;
  /** Filter by the object’s `signedbyAddress` field. */
  signedbyAddress?: Maybe<IntFilter>;
  /** Filter by the object’s `address` field. */
  address?: Maybe<StringFilter>;
  /** Filter by the object’s `moduleId` field. */
  moduleId?: Maybe<StringFilter>;
  /** Filter by the object’s `callId` field. */
  callId?: Maybe<StringFilter>;
  /** Filter by the object’s `paramsTxt` field. */
  paramsTxt?: Maybe<StringFilter>;
  /** Filter by the object’s `success` field. */
  success?: Maybe<IntFilter>;
  /** Filter by the object’s `nonce` field. */
  nonce?: Maybe<IntFilter>;
  /** Filter by the object’s `extrinsicHash` field. */
  extrinsicHash?: Maybe<StringFilter>;
  /** Filter by the object’s `specVersionId` field. */
  specVersionId?: Maybe<IntFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `params` field. */
  params?: Maybe<JsonFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<ExtrinsicFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<ExtrinsicFilter>>;
  /** Negates the expression. */
  not?: Maybe<ExtrinsicFilter>;
};

/** A connection to a list of `Extrinsic` values. */
export type ExtrinsicsConnection = {
  __typename?: 'ExtrinsicsConnection';
  /** A list of `Extrinsic` objects. */
  nodes: Array<Maybe<Extrinsic>>;
  /** A list of edges which contains the `Extrinsic` and cursor to aid in pagination. */
  edges: Array<ExtrinsicsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Extrinsic` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ExtrinsicAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ExtrinsicAggregates>>;
};

/** A connection to a list of `Extrinsic` values. */
export type ExtrinsicsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ExtrinsicsGroupBy>;
  having?: Maybe<ExtrinsicsHavingInput>;
};

/** A `Extrinsic` edge in the connection. */
export type ExtrinsicsEdge = {
  __typename?: 'ExtrinsicsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Extrinsic` at the end of the edge. */
  node?: Maybe<Extrinsic>;
};

/** Grouping methods for `Extrinsic` for usage during aggregation. */
export enum ExtrinsicsGroupBy {
  BlockId = 'BLOCK_ID',
  ExtrinsicIdx = 'EXTRINSIC_IDX',
  ExtrinsicLength = 'EXTRINSIC_LENGTH',
  Signed = 'SIGNED',
  SignedbyAddress = 'SIGNEDBY_ADDRESS',
  Address = 'ADDRESS',
  ModuleId = 'MODULE_ID',
  CallId = 'CALL_ID',
  ParamsTxt = 'PARAMS_TXT',
  Success = 'SUCCESS',
  Nonce = 'NONCE',
  ExtrinsicHash = 'EXTRINSIC_HASH',
  SpecVersionId = 'SPEC_VERSION_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
  Params = 'PARAMS',
}

/** Conditions for `Extrinsic` aggregates. */
export type ExtrinsicsHavingInput = {
  AND?: Maybe<Array<ExtrinsicsHavingInput>>;
  OR?: Maybe<Array<ExtrinsicsHavingInput>>;
};

/** Methods to use when ordering `Extrinsic`. */
export enum ExtrinsicsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicLengthAsc = 'EXTRINSIC_LENGTH_ASC',
  ExtrinsicLengthDesc = 'EXTRINSIC_LENGTH_DESC',
  SignedAsc = 'SIGNED_ASC',
  SignedDesc = 'SIGNED_DESC',
  SignedbyAddressAsc = 'SIGNEDBY_ADDRESS_ASC',
  SignedbyAddressDesc = 'SIGNEDBY_ADDRESS_DESC',
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  ParamsTxtAsc = 'PARAMS_TXT_ASC',
  ParamsTxtDesc = 'PARAMS_TXT_DESC',
  SuccessAsc = 'SUCCESS_ASC',
  SuccessDesc = 'SUCCESS_DESC',
  NonceAsc = 'NONCE_ASC',
  NonceDesc = 'NONCE_DESC',
  ExtrinsicHashAsc = 'EXTRINSIC_HASH_ASC',
  ExtrinsicHashDesc = 'EXTRINSIC_HASH_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  ParamsAsc = 'PARAMS_ASC',
  ParamsDesc = 'PARAMS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type FoundType = Node & {
  __typename?: 'FoundType';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  rawType: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type FoundTypeAggregates = {
  __typename?: 'FoundTypeAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `FoundType` object types. All fields are combined with a logical ‘and.’ */
export type FoundTypeFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `rawType` field. */
  rawType?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<FoundTypeFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<FoundTypeFilter>>;
  /** Negates the expression. */
  not?: Maybe<FoundTypeFilter>;
};

/** A connection to a list of `FoundType` values. */
export type FoundTypesConnection = {
  __typename?: 'FoundTypesConnection';
  /** A list of `FoundType` objects. */
  nodes: Array<Maybe<FoundType>>;
  /** A list of edges which contains the `FoundType` and cursor to aid in pagination. */
  edges: Array<FoundTypesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `FoundType` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<FoundTypeAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<FoundTypeAggregates>>;
};

/** A connection to a list of `FoundType` values. */
export type FoundTypesConnectionGroupedAggregatesArgs = {
  groupBy: Array<FoundTypesGroupBy>;
  having?: Maybe<FoundTypesHavingInput>;
};

/** A `FoundType` edge in the connection. */
export type FoundTypesEdge = {
  __typename?: 'FoundTypesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `FoundType` at the end of the edge. */
  node?: Maybe<FoundType>;
};

/** Grouping methods for `FoundType` for usage during aggregation. */
export enum FoundTypesGroupBy {
  RawType = 'RAW_TYPE',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `FoundType` aggregates. */
export type FoundTypesHavingInput = {
  AND?: Maybe<Array<FoundTypesHavingInput>>;
  OR?: Maybe<Array<FoundTypesHavingInput>>;
};

/** Methods to use when ordering `FoundType`. */
export enum FoundTypesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  RawTypeAsc = 'RAW_TYPE_ASC',
  RawTypeDesc = 'RAW_TYPE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Funding = Node & {
  __typename?: 'Funding';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  ticker: Scalars['String'];
  fundingName: Scalars['String'];
  value: Scalars['String'];
  totalIssuedInFundingRound: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Funding`. */
  block?: Maybe<Block>;
};

export type FundingAggregates = {
  __typename?: 'FundingAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Funding` object types. All fields are combined with a logical ‘and.’ */
export type FundingFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `fundingName` field. */
  fundingName?: Maybe<StringFilter>;
  /** Filter by the object’s `value` field. */
  value?: Maybe<StringFilter>;
  /** Filter by the object’s `totalIssuedInFundingRound` field. */
  totalIssuedInFundingRound?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<FundingFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<FundingFilter>>;
  /** Negates the expression. */
  not?: Maybe<FundingFilter>;
};

/** A connection to a list of `Funding` values. */
export type FundingsConnection = {
  __typename?: 'FundingsConnection';
  /** A list of `Funding` objects. */
  nodes: Array<Maybe<Funding>>;
  /** A list of edges which contains the `Funding` and cursor to aid in pagination. */
  edges: Array<FundingsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Funding` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<FundingAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<FundingAggregates>>;
};

/** A connection to a list of `Funding` values. */
export type FundingsConnectionGroupedAggregatesArgs = {
  groupBy: Array<FundingsGroupBy>;
  having?: Maybe<FundingsHavingInput>;
};

/** A `Funding` edge in the connection. */
export type FundingsEdge = {
  __typename?: 'FundingsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Funding` at the end of the edge. */
  node?: Maybe<Funding>;
};

/** Grouping methods for `Funding` for usage during aggregation. */
export enum FundingsGroupBy {
  BlockId = 'BLOCK_ID',
  Ticker = 'TICKER',
  FundingName = 'FUNDING_NAME',
  Value = 'VALUE',
  TotalIssuedInFundingRound = 'TOTAL_ISSUED_IN_FUNDING_ROUND',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Funding` aggregates. */
export type FundingsHavingInput = {
  AND?: Maybe<Array<FundingsHavingInput>>;
  OR?: Maybe<Array<FundingsHavingInput>>;
};

/** Methods to use when ordering `Funding`. */
export enum FundingsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  FundingNameAsc = 'FUNDING_NAME_ASC',
  FundingNameDesc = 'FUNDING_NAME_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  TotalIssuedInFundingRoundAsc = 'TOTAL_ISSUED_IN_FUNDING_ROUND_ASC',
  TotalIssuedInFundingRoundDesc = 'TOTAL_ISSUED_IN_FUNDING_ROUND_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type HeldToken = Node & {
  __typename?: 'HeldToken';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  did: Scalars['String'];
  token: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type HeldTokenAggregates = {
  __typename?: 'HeldTokenAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `HeldToken` object types. All fields are combined with a logical ‘and.’ */
export type HeldTokenFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `did` field. */
  did?: Maybe<StringFilter>;
  /** Filter by the object’s `token` field. */
  token?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<HeldTokenFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<HeldTokenFilter>>;
  /** Negates the expression. */
  not?: Maybe<HeldTokenFilter>;
};

/** A connection to a list of `HeldToken` values. */
export type HeldTokensConnection = {
  __typename?: 'HeldTokensConnection';
  /** A list of `HeldToken` objects. */
  nodes: Array<Maybe<HeldToken>>;
  /** A list of edges which contains the `HeldToken` and cursor to aid in pagination. */
  edges: Array<HeldTokensEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `HeldToken` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<HeldTokenAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<HeldTokenAggregates>>;
};

/** A connection to a list of `HeldToken` values. */
export type HeldTokensConnectionGroupedAggregatesArgs = {
  groupBy: Array<HeldTokensGroupBy>;
  having?: Maybe<HeldTokensHavingInput>;
};

/** A `HeldToken` edge in the connection. */
export type HeldTokensEdge = {
  __typename?: 'HeldTokensEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `HeldToken` at the end of the edge. */
  node?: Maybe<HeldToken>;
};

/** Grouping methods for `HeldToken` for usage during aggregation. */
export enum HeldTokensGroupBy {
  Did = 'DID',
  Token = 'TOKEN',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `HeldToken` aggregates. */
export type HeldTokensHavingInput = {
  AND?: Maybe<Array<HeldTokensHavingInput>>;
  OR?: Maybe<Array<HeldTokensHavingInput>>;
};

/** Methods to use when ordering `HeldToken`. */
export enum HeldTokensOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  TokenAsc = 'TOKEN_ASC',
  TokenDesc = 'TOKEN_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type HistoryOfPaymentEventsForCa = Node & {
  __typename?: 'HistoryOfPaymentEventsForCa';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventId: Scalars['String'];
  eventIdx: Scalars['Int'];
  eventDid: Scalars['String'];
  ticker: Scalars['String'];
  localId: Scalars['Int'];
  balance: Scalars['BigFloat'];
  tax: Scalars['BigFloat'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `HistoryOfPaymentEventsForCa`. */
  block?: Maybe<Block>;
};

export type HistoryOfPaymentEventsForCaAggregates = {
  __typename?: 'HistoryOfPaymentEventsForCaAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `HistoryOfPaymentEventsForCa` object types. All fields are combined with a logical ‘and.’ */
export type HistoryOfPaymentEventsForCaFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `eventDid` field. */
  eventDid?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `localId` field. */
  localId?: Maybe<IntFilter>;
  /** Filter by the object’s `balance` field. */
  balance?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `tax` field. */
  tax?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<HistoryOfPaymentEventsForCaFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<HistoryOfPaymentEventsForCaFilter>>;
  /** Negates the expression. */
  not?: Maybe<HistoryOfPaymentEventsForCaFilter>;
};

/** A connection to a list of `HistoryOfPaymentEventsForCa` values. */
export type HistoryOfPaymentEventsForCasConnection = {
  __typename?: 'HistoryOfPaymentEventsForCasConnection';
  /** A list of `HistoryOfPaymentEventsForCa` objects. */
  nodes: Array<Maybe<HistoryOfPaymentEventsForCa>>;
  /** A list of edges which contains the `HistoryOfPaymentEventsForCa` and cursor to aid in pagination. */
  edges: Array<HistoryOfPaymentEventsForCasEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `HistoryOfPaymentEventsForCa` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<HistoryOfPaymentEventsForCaAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<HistoryOfPaymentEventsForCaAggregates>>;
};

/** A connection to a list of `HistoryOfPaymentEventsForCa` values. */
export type HistoryOfPaymentEventsForCasConnectionGroupedAggregatesArgs = {
  groupBy: Array<HistoryOfPaymentEventsForCasGroupBy>;
  having?: Maybe<HistoryOfPaymentEventsForCasHavingInput>;
};

/** A `HistoryOfPaymentEventsForCa` edge in the connection. */
export type HistoryOfPaymentEventsForCasEdge = {
  __typename?: 'HistoryOfPaymentEventsForCasEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `HistoryOfPaymentEventsForCa` at the end of the edge. */
  node?: Maybe<HistoryOfPaymentEventsForCa>;
};

/** Grouping methods for `HistoryOfPaymentEventsForCa` for usage during aggregation. */
export enum HistoryOfPaymentEventsForCasGroupBy {
  BlockId = 'BLOCK_ID',
  EventId = 'EVENT_ID',
  EventIdx = 'EVENT_IDX',
  EventDid = 'EVENT_DID',
  Ticker = 'TICKER',
  LocalId = 'LOCAL_ID',
  Balance = 'BALANCE',
  Tax = 'TAX',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `HistoryOfPaymentEventsForCa` aggregates. */
export type HistoryOfPaymentEventsForCasHavingInput = {
  AND?: Maybe<Array<HistoryOfPaymentEventsForCasHavingInput>>;
  OR?: Maybe<Array<HistoryOfPaymentEventsForCasHavingInput>>;
};

/** Methods to use when ordering `HistoryOfPaymentEventsForCa`. */
export enum HistoryOfPaymentEventsForCasOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventDidAsc = 'EVENT_DID_ASC',
  EventDidDesc = 'EVENT_DID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  LocalIdAsc = 'LOCAL_ID_ASC',
  LocalIdDesc = 'LOCAL_ID_DESC',
  BalanceAsc = 'BALANCE_ASC',
  BalanceDesc = 'BALANCE_DESC',
  TaxAsc = 'TAX_ASC',
  TaxDesc = 'TAX_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `Identity` values. */
export type IdentitiesConnection = {
  __typename?: 'IdentitiesConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity` and cursor to aid in pagination. */
  edges: Array<IdentitiesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values. */
export type IdentitiesConnectionGroupedAggregatesArgs = {
  groupBy: Array<IdentitiesGroupBy>;
  having?: Maybe<IdentitiesHavingInput>;
};

/** A `Identity` edge in the connection. */
export type IdentitiesEdge = {
  __typename?: 'IdentitiesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
};

/** Grouping methods for `Identity` for usage during aggregation. */
export enum IdentitiesGroupBy {
  PrimaryAccount = 'PRIMARY_ACCOUNT',
  SecondaryKeysFrozen = 'SECONDARY_KEYS_FROZEN',
  EventId = 'EVENT_ID',
  CreatedBlockId = 'CREATED_BLOCK_ID',
  UpdatedBlockId = 'UPDATED_BLOCK_ID',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Identity` aggregates. */
export type IdentitiesHavingInput = {
  AND?: Maybe<Array<IdentitiesHavingInput>>;
  OR?: Maybe<Array<IdentitiesHavingInput>>;
};

/** Methods to use when ordering `Identity`. */
export enum IdentitiesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  PrimaryAccountAsc = 'PRIMARY_ACCOUNT_ASC',
  PrimaryAccountDesc = 'PRIMARY_ACCOUNT_DESC',
  SecondaryKeysFrozenAsc = 'SECONDARY_KEYS_FROZEN_ASC',
  SecondaryKeysFrozenDesc = 'SECONDARY_KEYS_FROZEN_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SecondaryAccountsCountAsc = 'SECONDARY_ACCOUNTS_COUNT_ASC',
  SecondaryAccountsCountDesc = 'SECONDARY_ACCOUNTS_COUNT_DESC',
  ClaimsByTargetIdCountAsc = 'CLAIMS_BY_TARGET_ID_COUNT_ASC',
  ClaimsByTargetIdCountDesc = 'CLAIMS_BY_TARGET_ID_COUNT_DESC',
  ClaimsByIssuerIdCountAsc = 'CLAIMS_BY_ISSUER_ID_COUNT_ASC',
  ClaimsByIssuerIdCountDesc = 'CLAIMS_BY_ISSUER_ID_COUNT_DESC',
}

export type Identity = Node & {
  __typename?: 'Identity';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  did: Scalars['String'];
  primaryAccount: Scalars['String'];
  secondaryKeysFrozen: Scalars['Boolean'];
  eventId: Scalars['String'];
  createdBlockId: Scalars['String'];
  updatedBlockId: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Identity`. */
  createdBlock?: Maybe<Block>;
  /** Reads a single `Block` that is related to this `Identity`. */
  updatedBlock?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Account`. */
  secondaryAccounts: AccountsConnection;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByTargetId: ClaimsConnection;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByIssuerId: ClaimsConnection;
  /** Reads and enables pagination through a set of `Permission`. */
  permissionsByAccountIdentityIdAndPermissionsId: IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByAccountIdentityIdAndBlockId: IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByClaimTargetIdAndBlockId: IdentityBlocksByClaimTargetIdAndBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByClaimTargetIdAndIssuerId: IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByClaimIssuerIdAndBlockId: IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByClaimIssuerIdAndTargetId: IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyConnection;
};

export type IdentitySecondaryAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

export type IdentityClaimsByTargetIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

export type IdentityClaimsByIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

export type IdentityPermissionsByAccountIdentityIdAndPermissionsIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<PermissionsOrderBy>>;
  filter?: Maybe<PermissionFilter>;
};

export type IdentityBlocksByAccountIdentityIdAndBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type IdentityBlocksByClaimTargetIdAndBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type IdentityIdentitiesByClaimTargetIdAndIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type IdentityBlocksByClaimIssuerIdAndBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type IdentityIdentitiesByClaimIssuerIdAndTargetIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type IdentityAggregates = {
  __typename?: 'IdentityAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyConnection = {
  __typename?: 'IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: Maybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Account`. */
export type IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyEdge = {
  __typename?: 'IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Account`. */
  accounts: AccountsConnection;
};

/** A `Block` edge in the connection, with data from `Account`. */
export type IdentityBlocksByAccountIdentityIdAndBlockIdManyToManyEdgeAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

/** A connection to a list of `Block` values, with data from `Claim`. */
export type IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyConnection = {
  __typename?: 'IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Claim`. */
export type IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: Maybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Claim`. */
export type IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyEdge = {
  __typename?: 'IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
};

/** A `Block` edge in the connection, with data from `Claim`. */
export type IdentityBlocksByClaimIssuerIdAndBlockIdManyToManyEdgeClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `Block` values, with data from `Claim`. */
export type IdentityBlocksByClaimTargetIdAndBlockIdManyToManyConnection = {
  __typename?: 'IdentityBlocksByClaimTargetIdAndBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IdentityBlocksByClaimTargetIdAndBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Claim`. */
export type IdentityBlocksByClaimTargetIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: Maybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Claim`. */
export type IdentityBlocksByClaimTargetIdAndBlockIdManyToManyEdge = {
  __typename?: 'IdentityBlocksByClaimTargetIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
};

/** A `Block` edge in the connection, with data from `Claim`. */
export type IdentityBlocksByClaimTargetIdAndBlockIdManyToManyEdgeClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A filter to be used against `Identity` object types. All fields are combined with a logical ‘and.’ */
export type IdentityFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `did` field. */
  did?: Maybe<StringFilter>;
  /** Filter by the object’s `primaryAccount` field. */
  primaryAccount?: Maybe<StringFilter>;
  /** Filter by the object’s `secondaryKeysFrozen` field. */
  secondaryKeysFrozen?: Maybe<BooleanFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdBlockId` field. */
  createdBlockId?: Maybe<StringFilter>;
  /** Filter by the object’s `updatedBlockId` field. */
  updatedBlockId?: Maybe<StringFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<IdentityFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<IdentityFilter>>;
  /** Negates the expression. */
  not?: Maybe<IdentityFilter>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyConnection = {
  __typename?: 'IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<IdentitiesGroupBy>;
    having?: Maybe<IdentitiesHavingInput>;
  };

/** A `Identity` edge in the connection, with data from `Claim`. */
export type IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyEdge = {
  __typename?: 'IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByTargetId: ClaimsConnection;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type IdentityIdentitiesByClaimIssuerIdAndTargetIdManyToManyEdgeClaimsByTargetIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyConnection = {
  __typename?: 'IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Claim`. */
export type IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<IdentitiesGroupBy>;
    having?: Maybe<IdentitiesHavingInput>;
  };

/** A `Identity` edge in the connection, with data from `Claim`. */
export type IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyEdge = {
  __typename?: 'IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Claim`. */
  claimsByIssuerId: ClaimsConnection;
};

/** A `Identity` edge in the connection, with data from `Claim`. */
export type IdentityIdentitiesByClaimTargetIdAndIssuerIdManyToManyEdgeClaimsByIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `Permission` values, with data from `Account`. */
export type IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyConnection = {
  __typename?: 'IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyConnection';
  /** A list of `Permission` objects. */
  nodes: Array<Maybe<Permission>>;
  /** A list of edges which contains the `Permission`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Permission` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<PermissionAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<PermissionAggregates>>;
};

/** A connection to a list of `Permission` values, with data from `Account`. */
export type IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<PermissionsGroupBy>;
    having?: Maybe<PermissionsHavingInput>;
  };

/** A `Permission` edge in the connection, with data from `Account`. */
export type IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyEdge = {
  __typename?: 'IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Permission` at the end of the edge. */
  node?: Maybe<Permission>;
  /** Reads and enables pagination through a set of `Account`. */
  accountsByPermissionsId: AccountsConnection;
};

/** A `Permission` edge in the connection, with data from `Account`. */
export type IdentityPermissionsByAccountIdentityIdAndPermissionsIdManyToManyEdgeAccountsByPermissionsIdArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<AccountsOrderBy>>;
    filter?: Maybe<AccountFilter>;
  };

export type Instruction = Node & {
  __typename?: 'Instruction';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventId: Scalars['String'];
  status: Scalars['String'];
  venueId: Scalars['String'];
  settlementType: Scalars['String'];
  legs: Scalars['JSON'];
  addresses: Scalars['JSON'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Instruction`. */
  block?: Maybe<Block>;
};

export type InstructionAggregates = {
  __typename?: 'InstructionAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Instruction` object types. All fields are combined with a logical ‘and.’ */
export type InstructionFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `status` field. */
  status?: Maybe<StringFilter>;
  /** Filter by the object’s `venueId` field. */
  venueId?: Maybe<StringFilter>;
  /** Filter by the object’s `settlementType` field. */
  settlementType?: Maybe<StringFilter>;
  /** Filter by the object’s `legs` field. */
  legs?: Maybe<JsonFilter>;
  /** Filter by the object’s `addresses` field. */
  addresses?: Maybe<JsonFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<InstructionFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<InstructionFilter>>;
  /** Negates the expression. */
  not?: Maybe<InstructionFilter>;
};

/** A connection to a list of `Instruction` values. */
export type InstructionsConnection = {
  __typename?: 'InstructionsConnection';
  /** A list of `Instruction` objects. */
  nodes: Array<Maybe<Instruction>>;
  /** A list of edges which contains the `Instruction` and cursor to aid in pagination. */
  edges: Array<InstructionsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Instruction` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<InstructionAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<InstructionAggregates>>;
};

/** A connection to a list of `Instruction` values. */
export type InstructionsConnectionGroupedAggregatesArgs = {
  groupBy: Array<InstructionsGroupBy>;
  having?: Maybe<InstructionsHavingInput>;
};

/** A `Instruction` edge in the connection. */
export type InstructionsEdge = {
  __typename?: 'InstructionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Instruction` at the end of the edge. */
  node?: Maybe<Instruction>;
};

/** Grouping methods for `Instruction` for usage during aggregation. */
export enum InstructionsGroupBy {
  BlockId = 'BLOCK_ID',
  EventId = 'EVENT_ID',
  Status = 'STATUS',
  VenueId = 'VENUE_ID',
  SettlementType = 'SETTLEMENT_TYPE',
  Legs = 'LEGS',
  Addresses = 'ADDRESSES',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Instruction` aggregates. */
export type InstructionsHavingInput = {
  AND?: Maybe<Array<InstructionsHavingInput>>;
  OR?: Maybe<Array<InstructionsHavingInput>>;
};

/** Methods to use when ordering `Instruction`. */
export enum InstructionsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  SettlementTypeAsc = 'SETTLEMENT_TYPE_ASC',
  SettlementTypeDesc = 'SETTLEMENT_TYPE_DESC',
  LegsAsc = 'LEGS_ASC',
  LegsDesc = 'LEGS_DESC',
  AddressesAsc = 'ADDRESSES_ASC',
  AddressesDesc = 'ADDRESSES_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against Int fields. All fields are combined with a logical ‘and.’ */
export type IntFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['Int']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['Int']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['Int']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['Int']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['Int']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['Int']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['Int']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['Int']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['Int']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['Int']>;
};

export type Investment = Node & {
  __typename?: 'Investment';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  investor: Scalars['String'];
  stoId: Scalars['Int'];
  offeringToken: Scalars['String'];
  raiseToken: Scalars['String'];
  offeringTokenAmount: Scalars['BigFloat'];
  raiseTokenAmount: Scalars['BigFloat'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Investment`. */
  block?: Maybe<Block>;
};

export type InvestmentAggregates = {
  __typename?: 'InvestmentAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Investment` object types. All fields are combined with a logical ‘and.’ */
export type InvestmentFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `investor` field. */
  investor?: Maybe<StringFilter>;
  /** Filter by the object’s `stoId` field. */
  stoId?: Maybe<IntFilter>;
  /** Filter by the object’s `offeringToken` field. */
  offeringToken?: Maybe<StringFilter>;
  /** Filter by the object’s `raiseToken` field. */
  raiseToken?: Maybe<StringFilter>;
  /** Filter by the object’s `offeringTokenAmount` field. */
  offeringTokenAmount?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `raiseTokenAmount` field. */
  raiseTokenAmount?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<InvestmentFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<InvestmentFilter>>;
  /** Negates the expression. */
  not?: Maybe<InvestmentFilter>;
};

/** A connection to a list of `Investment` values. */
export type InvestmentsConnection = {
  __typename?: 'InvestmentsConnection';
  /** A list of `Investment` objects. */
  nodes: Array<Maybe<Investment>>;
  /** A list of edges which contains the `Investment` and cursor to aid in pagination. */
  edges: Array<InvestmentsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Investment` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<InvestmentAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<InvestmentAggregates>>;
};

/** A connection to a list of `Investment` values. */
export type InvestmentsConnectionGroupedAggregatesArgs = {
  groupBy: Array<InvestmentsGroupBy>;
  having?: Maybe<InvestmentsHavingInput>;
};

/** A `Investment` edge in the connection. */
export type InvestmentsEdge = {
  __typename?: 'InvestmentsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Investment` at the end of the edge. */
  node?: Maybe<Investment>;
};

/** Grouping methods for `Investment` for usage during aggregation. */
export enum InvestmentsGroupBy {
  BlockId = 'BLOCK_ID',
  Investor = 'INVESTOR',
  StoId = 'STO_ID',
  OfferingToken = 'OFFERING_TOKEN',
  RaiseToken = 'RAISE_TOKEN',
  OfferingTokenAmount = 'OFFERING_TOKEN_AMOUNT',
  RaiseTokenAmount = 'RAISE_TOKEN_AMOUNT',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Investment` aggregates. */
export type InvestmentsHavingInput = {
  AND?: Maybe<Array<InvestmentsHavingInput>>;
  OR?: Maybe<Array<InvestmentsHavingInput>>;
};

/** Methods to use when ordering `Investment`. */
export enum InvestmentsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  InvestorAsc = 'INVESTOR_ASC',
  InvestorDesc = 'INVESTOR_DESC',
  StoIdAsc = 'STO_ID_ASC',
  StoIdDesc = 'STO_ID_DESC',
  OfferingTokenAsc = 'OFFERING_TOKEN_ASC',
  OfferingTokenDesc = 'OFFERING_TOKEN_DESC',
  RaiseTokenAsc = 'RAISE_TOKEN_ASC',
  RaiseTokenDesc = 'RAISE_TOKEN_DESC',
  OfferingTokenAmountAsc = 'OFFERING_TOKEN_AMOUNT_ASC',
  OfferingTokenAmountDesc = 'OFFERING_TOKEN_AMOUNT_DESC',
  RaiseTokenAmountAsc = 'RAISE_TOKEN_AMOUNT_ASC',
  RaiseTokenAmountDesc = 'RAISE_TOKEN_AMOUNT_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against JSON fields. All fields are combined with a logical ‘and.’ */
export type JsonFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['JSON']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['JSON']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['JSON']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['JSON']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['JSON']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['JSON']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['JSON']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['JSON']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['JSON']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['JSON']>;
  /** Contains the specified JSON. */
  contains?: Maybe<Scalars['JSON']>;
  /** Contains the specified key. */
  containsKey?: Maybe<Scalars['String']>;
  /** Contains all of the specified keys. */
  containsAllKeys?: Maybe<Array<Scalars['String']>>;
  /** Contains any of the specified keys. */
  containsAnyKeys?: Maybe<Array<Scalars['String']>>;
  /** Contained by the specified JSON. */
  containedBy?: Maybe<Scalars['JSON']>;
};

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']>;
};

export type Permission = Node & {
  __typename?: 'Permission';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  assets?: Maybe<Scalars['JSON']>;
  portfolios?: Maybe<Scalars['JSON']>;
  transactions?: Maybe<Scalars['JSON']>;
  transactionGroups: Scalars['JSON'];
  createdBlockId: Scalars['String'];
  updatedBlockId: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Permission`. */
  createdBlock?: Maybe<Block>;
  /** Reads a single `Block` that is related to this `Permission`. */
  updatedBlock?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Account`. */
  accountsByPermissionsId: AccountsConnection;
  /** Reads and enables pagination through a set of `Identity`. */
  identitiesByAccountPermissionsIdAndIdentityId: PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByAccountPermissionsIdAndBlockId: PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyConnection;
};

export type PermissionAccountsByPermissionsIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

export type PermissionIdentitiesByAccountPermissionsIdAndIdentityIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

export type PermissionBlocksByAccountPermissionsIdAndBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type PermissionAggregates = {
  __typename?: 'PermissionAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyConnection = {
  __typename?: 'PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `Account`. */
export type PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyEdge = {
  __typename?: 'PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Account`. */
  accounts: AccountsConnection;
};

/** A `Block` edge in the connection, with data from `Account`. */
export type PermissionBlocksByAccountPermissionsIdAndBlockIdManyToManyEdgeAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

/** A filter to be used against `Permission` object types. All fields are combined with a logical ‘and.’ */
export type PermissionFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `assets` field. */
  assets?: Maybe<JsonFilter>;
  /** Filter by the object’s `portfolios` field. */
  portfolios?: Maybe<JsonFilter>;
  /** Filter by the object’s `transactions` field. */
  transactions?: Maybe<JsonFilter>;
  /** Filter by the object’s `transactionGroups` field. */
  transactionGroups?: Maybe<JsonFilter>;
  /** Filter by the object’s `createdBlockId` field. */
  createdBlockId?: Maybe<StringFilter>;
  /** Filter by the object’s `updatedBlockId` field. */
  updatedBlockId?: Maybe<StringFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<PermissionFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<PermissionFilter>>;
  /** Negates the expression. */
  not?: Maybe<PermissionFilter>;
};

/** A connection to a list of `Identity` values, with data from `Account`. */
export type PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyConnection = {
  __typename?: 'PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyConnection';
  /** A list of `Identity` objects. */
  nodes: Array<Maybe<Identity>>;
  /** A list of edges which contains the `Identity`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Identity` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<IdentityAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<IdentityAggregates>>;
};

/** A connection to a list of `Identity` values, with data from `Account`. */
export type PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<IdentitiesGroupBy>;
    having?: Maybe<IdentitiesHavingInput>;
  };

/** A `Identity` edge in the connection, with data from `Account`. */
export type PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyEdge = {
  __typename?: 'PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Identity` at the end of the edge. */
  node?: Maybe<Identity>;
  /** Reads and enables pagination through a set of `Account`. */
  secondaryAccounts: AccountsConnection;
};

/** A `Identity` edge in the connection, with data from `Account`. */
export type PermissionIdentitiesByAccountPermissionsIdAndIdentityIdManyToManyEdgeSecondaryAccountsArgs =
  {
    first?: Maybe<Scalars['Int']>;
    last?: Maybe<Scalars['Int']>;
    offset?: Maybe<Scalars['Int']>;
    before?: Maybe<Scalars['Cursor']>;
    after?: Maybe<Scalars['Cursor']>;
    orderBy?: Maybe<Array<AccountsOrderBy>>;
    filter?: Maybe<AccountFilter>;
  };

/** A connection to a list of `Permission` values. */
export type PermissionsConnection = {
  __typename?: 'PermissionsConnection';
  /** A list of `Permission` objects. */
  nodes: Array<Maybe<Permission>>;
  /** A list of edges which contains the `Permission` and cursor to aid in pagination. */
  edges: Array<PermissionsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Permission` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<PermissionAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<PermissionAggregates>>;
};

/** A connection to a list of `Permission` values. */
export type PermissionsConnectionGroupedAggregatesArgs = {
  groupBy: Array<PermissionsGroupBy>;
  having?: Maybe<PermissionsHavingInput>;
};

/** A `Permission` edge in the connection. */
export type PermissionsEdge = {
  __typename?: 'PermissionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Permission` at the end of the edge. */
  node?: Maybe<Permission>;
};

/** Grouping methods for `Permission` for usage during aggregation. */
export enum PermissionsGroupBy {
  Assets = 'ASSETS',
  Portfolios = 'PORTFOLIOS',
  Transactions = 'TRANSACTIONS',
  TransactionGroups = 'TRANSACTION_GROUPS',
  CreatedBlockId = 'CREATED_BLOCK_ID',
  UpdatedBlockId = 'UPDATED_BLOCK_ID',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Permission` aggregates. */
export type PermissionsHavingInput = {
  AND?: Maybe<Array<PermissionsHavingInput>>;
  OR?: Maybe<Array<PermissionsHavingInput>>;
};

/** Methods to use when ordering `Permission`. */
export enum PermissionsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  AssetsAsc = 'ASSETS_ASC',
  AssetsDesc = 'ASSETS_DESC',
  PortfoliosAsc = 'PORTFOLIOS_ASC',
  PortfoliosDesc = 'PORTFOLIOS_DESC',
  TransactionsAsc = 'TRANSACTIONS_ASC',
  TransactionsDesc = 'TRANSACTIONS_DESC',
  TransactionGroupsAsc = 'TRANSACTION_GROUPS_ASC',
  TransactionGroupsDesc = 'TRANSACTION_GROUPS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  AccountsByPermissionsIdCountAsc = 'ACCOUNTS_BY_PERMISSIONS_ID_COUNT_ASC',
  AccountsByPermissionsIdCountDesc = 'ACCOUNTS_BY_PERMISSIONS_ID_COUNT_DESC',
}

export type Proposal = Node & {
  __typename?: 'Proposal';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  proposer: Scalars['String'];
  state: Scalars['String'];
  identityId: Scalars['String'];
  balance: Scalars['BigFloat'];
  url?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  lastStateUpdatedAt: Scalars['Int'];
  snapshotted: Scalars['Boolean'];
  totalAyeWeight: Scalars['BigFloat'];
  totalNayWeight: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Proposal`. */
  block?: Maybe<Block>;
  /** Reads and enables pagination through a set of `ProposalVote`. */
  votes: ProposalVotesConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByProposalVoteProposalIdAndBlockId: ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyConnection;
};

export type ProposalVotesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalVotesOrderBy>>;
  filter?: Maybe<ProposalVoteFilter>;
};

export type ProposalBlocksByProposalVoteProposalIdAndBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

export type ProposalAggregates = {
  __typename?: 'ProposalAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `ProposalVote`. */
export type ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyConnection = {
  __typename?: 'ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyConnection';
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** A list of edges which contains the `Block`, info from the `ProposalVote`, and the cursor to aid in pagination. */
  edges: Array<ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
};

/** A connection to a list of `Block` values, with data from `ProposalVote`. */
export type ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<BlocksGroupBy>;
    having?: Maybe<BlocksHavingInput>;
  };

/** A `Block` edge in the connection, with data from `ProposalVote`. */
export type ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyEdge = {
  __typename?: 'ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `ProposalVote`. */
  proposalVotes: ProposalVotesConnection;
};

/** A `Block` edge in the connection, with data from `ProposalVote`. */
export type ProposalBlocksByProposalVoteProposalIdAndBlockIdManyToManyEdgeProposalVotesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalVotesOrderBy>>;
  filter?: Maybe<ProposalVoteFilter>;
};

/** A filter to be used against `Proposal` object types. All fields are combined with a logical ‘and.’ */
export type ProposalFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `proposer` field. */
  proposer?: Maybe<StringFilter>;
  /** Filter by the object’s `state` field. */
  state?: Maybe<StringFilter>;
  /** Filter by the object’s `identityId` field. */
  identityId?: Maybe<StringFilter>;
  /** Filter by the object’s `balance` field. */
  balance?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `url` field. */
  url?: Maybe<StringFilter>;
  /** Filter by the object’s `description` field. */
  description?: Maybe<StringFilter>;
  /** Filter by the object’s `lastStateUpdatedAt` field. */
  lastStateUpdatedAt?: Maybe<IntFilter>;
  /** Filter by the object’s `snapshotted` field. */
  snapshotted?: Maybe<BooleanFilter>;
  /** Filter by the object’s `totalAyeWeight` field. */
  totalAyeWeight?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `totalNayWeight` field. */
  totalNayWeight?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<ProposalFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<ProposalFilter>>;
  /** Negates the expression. */
  not?: Maybe<ProposalFilter>;
};

export type ProposalVote = Node & {
  __typename?: 'ProposalVote';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  proposalId: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  account: Scalars['String'];
  vote: Scalars['Boolean'];
  weight: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Proposal` that is related to this `ProposalVote`. */
  proposal?: Maybe<Proposal>;
  /** Reads a single `Block` that is related to this `ProposalVote`. */
  block?: Maybe<Block>;
};

export type ProposalVoteAggregates = {
  __typename?: 'ProposalVoteAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `ProposalVote` object types. All fields are combined with a logical ‘and.’ */
export type ProposalVoteFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `proposalId` field. */
  proposalId?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `account` field. */
  account?: Maybe<StringFilter>;
  /** Filter by the object’s `vote` field. */
  vote?: Maybe<BooleanFilter>;
  /** Filter by the object’s `weight` field. */
  weight?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<ProposalVoteFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<ProposalVoteFilter>>;
  /** Negates the expression. */
  not?: Maybe<ProposalVoteFilter>;
};

/** A connection to a list of `ProposalVote` values. */
export type ProposalVotesConnection = {
  __typename?: 'ProposalVotesConnection';
  /** A list of `ProposalVote` objects. */
  nodes: Array<Maybe<ProposalVote>>;
  /** A list of edges which contains the `ProposalVote` and cursor to aid in pagination. */
  edges: Array<ProposalVotesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ProposalVote` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalVoteAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalVoteAggregates>>;
};

/** A connection to a list of `ProposalVote` values. */
export type ProposalVotesConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposalVotesGroupBy>;
  having?: Maybe<ProposalVotesHavingInput>;
};

/** A `ProposalVote` edge in the connection. */
export type ProposalVotesEdge = {
  __typename?: 'ProposalVotesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposalVote` at the end of the edge. */
  node?: Maybe<ProposalVote>;
};

/** Grouping methods for `ProposalVote` for usage during aggregation. */
export enum ProposalVotesGroupBy {
  ProposalId = 'PROPOSAL_ID',
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  Account = 'ACCOUNT',
  Vote = 'VOTE',
  Weight = 'WEIGHT',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `ProposalVote` aggregates. */
export type ProposalVotesHavingInput = {
  AND?: Maybe<Array<ProposalVotesHavingInput>>;
  OR?: Maybe<Array<ProposalVotesHavingInput>>;
};

/** Methods to use when ordering `ProposalVote`. */
export enum ProposalVotesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  AccountAsc = 'ACCOUNT_ASC',
  AccountDesc = 'ACCOUNT_DESC',
  VoteAsc = 'VOTE_ASC',
  VoteDesc = 'VOTE_DESC',
  WeightAsc = 'WEIGHT_ASC',
  WeightDesc = 'WEIGHT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `Proposal` values. */
export type ProposalsConnection = {
  __typename?: 'ProposalsConnection';
  /** A list of `Proposal` objects. */
  nodes: Array<Maybe<Proposal>>;
  /** A list of edges which contains the `Proposal` and cursor to aid in pagination. */
  edges: Array<ProposalsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Proposal` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalAggregates>>;
};

/** A connection to a list of `Proposal` values. */
export type ProposalsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposalsGroupBy>;
  having?: Maybe<ProposalsHavingInput>;
};

/** A `Proposal` edge in the connection. */
export type ProposalsEdge = {
  __typename?: 'ProposalsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Proposal` at the end of the edge. */
  node?: Maybe<Proposal>;
};

/** Grouping methods for `Proposal` for usage during aggregation. */
export enum ProposalsGroupBy {
  BlockId = 'BLOCK_ID',
  Proposer = 'PROPOSER',
  State = 'STATE',
  IdentityId = 'IDENTITY_ID',
  Balance = 'BALANCE',
  Url = 'URL',
  Description = 'DESCRIPTION',
  LastStateUpdatedAt = 'LAST_STATE_UPDATED_AT',
  Snapshotted = 'SNAPSHOTTED',
  TotalAyeWeight = 'TOTAL_AYE_WEIGHT',
  TotalNayWeight = 'TOTAL_NAY_WEIGHT',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Proposal` aggregates. */
export type ProposalsHavingInput = {
  AND?: Maybe<Array<ProposalsHavingInput>>;
  OR?: Maybe<Array<ProposalsHavingInput>>;
};

/** Methods to use when ordering `Proposal`. */
export enum ProposalsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ProposerAsc = 'PROPOSER_ASC',
  ProposerDesc = 'PROPOSER_DESC',
  StateAsc = 'STATE_ASC',
  StateDesc = 'STATE_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  BalanceAsc = 'BALANCE_ASC',
  BalanceDesc = 'BALANCE_DESC',
  UrlAsc = 'URL_ASC',
  UrlDesc = 'URL_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  LastStateUpdatedAtAsc = 'LAST_STATE_UPDATED_AT_ASC',
  LastStateUpdatedAtDesc = 'LAST_STATE_UPDATED_AT_DESC',
  SnapshottedAsc = 'SNAPSHOTTED_ASC',
  SnapshottedDesc = 'SNAPSHOTTED_DESC',
  TotalAyeWeightAsc = 'TOTAL_AYE_WEIGHT_ASC',
  TotalAyeWeightDesc = 'TOTAL_AYE_WEIGHT_DESC',
  TotalNayWeightAsc = 'TOTAL_NAY_WEIGHT_ASC',
  TotalNayWeightDesc = 'TOTAL_NAY_WEIGHT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  VotesCountAsc = 'VOTES_COUNT_ASC',
  VotesCountDesc = 'VOTES_COUNT_DESC',
}

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID'];
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** Reads and enables pagination through a set of `Account`. */
  accounts?: Maybe<AccountsConnection>;
  /** Reads and enables pagination through a set of `AgentGroupMembership`. */
  agentGroupMemberships?: Maybe<AgentGroupMembershipsConnection>;
  /** Reads and enables pagination through a set of `AgentGroup`. */
  agentGroups?: Maybe<AgentGroupsConnection>;
  /** Reads and enables pagination through a set of `AssetHolder`. */
  assetHolders?: Maybe<AssetHoldersConnection>;
  /** Reads and enables pagination through a set of `AssetPendingOwnershipTransfer`. */
  assetPendingOwnershipTransfers?: Maybe<AssetPendingOwnershipTransfersConnection>;
  /** Reads and enables pagination through a set of `Asset`. */
  assets?: Maybe<AssetsConnection>;
  /** Reads and enables pagination through a set of `Authorization`. */
  authorizations?: Maybe<AuthorizationsConnection>;
  /** Reads and enables pagination through a set of `Block`. */
  blocks?: Maybe<BlocksConnection>;
  /** Reads and enables pagination through a set of `BridgeEvent`. */
  bridgeEvents?: Maybe<BridgeEventsConnection>;
  /** Reads and enables pagination through a set of `ClaimScope`. */
  claimScopes?: Maybe<ClaimScopesConnection>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims?: Maybe<ClaimsConnection>;
  /** Reads and enables pagination through a set of `Debug`. */
  debugs?: Maybe<DebugsConnection>;
  /** Reads and enables pagination through a set of `Event`. */
  events?: Maybe<EventsConnection>;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsics?: Maybe<ExtrinsicsConnection>;
  /** Reads and enables pagination through a set of `FoundType`. */
  foundTypes?: Maybe<FoundTypesConnection>;
  /** Reads and enables pagination through a set of `Funding`. */
  fundings?: Maybe<FundingsConnection>;
  /** Reads and enables pagination through a set of `HeldToken`. */
  heldTokens?: Maybe<HeldTokensConnection>;
  /** Reads and enables pagination through a set of `HistoryOfPaymentEventsForCa`. */
  historyOfPaymentEventsForCas?: Maybe<HistoryOfPaymentEventsForCasConnection>;
  /** Reads and enables pagination through a set of `Identity`. */
  identities?: Maybe<IdentitiesConnection>;
  /** Reads and enables pagination through a set of `Instruction`. */
  instructions?: Maybe<InstructionsConnection>;
  /** Reads and enables pagination through a set of `Investment`. */
  investments?: Maybe<InvestmentsConnection>;
  /** Reads and enables pagination through a set of `Permission`. */
  permissions?: Maybe<PermissionsConnection>;
  /** Reads and enables pagination through a set of `ProposalVote`. */
  proposalVotes?: Maybe<ProposalVotesConnection>;
  /** Reads and enables pagination through a set of `Proposal`. */
  proposals?: Maybe<ProposalsConnection>;
  /** Reads and enables pagination through a set of `Settlement`. */
  settlements?: Maybe<SettlementsConnection>;
  /** Reads and enables pagination through a set of `StakingEvent`. */
  stakingEvents?: Maybe<StakingEventsConnection>;
  /** Reads and enables pagination through a set of `Sto`. */
  stos?: Maybe<StosConnection>;
  /** Reads and enables pagination through a set of `Subquery`. */
  subqueries?: Maybe<SubqueriesConnection>;
  /** Reads and enables pagination through a set of `TickerExternalAgentAction`. */
  tickerExternalAgentActions?: Maybe<TickerExternalAgentActionsConnection>;
  /** Reads and enables pagination through a set of `TickerExternalAgentAdded`. */
  tickerExternalAgentAddeds?: Maybe<TickerExternalAgentAddedsConnection>;
  /** Reads and enables pagination through a set of `TickerExternalAgentHistory`. */
  tickerExternalAgentHistories?: Maybe<TickerExternalAgentHistoriesConnection>;
  /** Reads and enables pagination through a set of `TrustedClaimIssuerTicker`. */
  trustedClaimIssuerTickers?: Maybe<TrustedClaimIssuerTickersConnection>;
  /** Reads and enables pagination through a set of `WithholdingTaxesOfCa`. */
  withholdingTaxesOfCas?: Maybe<WithholdingTaxesOfCasConnection>;
  account?: Maybe<Account>;
  agentGroupMembership?: Maybe<AgentGroupMembership>;
  agentGroup?: Maybe<AgentGroup>;
  assetHolder?: Maybe<AssetHolder>;
  assetPendingOwnershipTransfer?: Maybe<AssetPendingOwnershipTransfer>;
  asset?: Maybe<Asset>;
  authorization?: Maybe<Authorization>;
  block?: Maybe<Block>;
  bridgeEvent?: Maybe<BridgeEvent>;
  claimScope?: Maybe<ClaimScope>;
  claim?: Maybe<Claim>;
  debug?: Maybe<Debug>;
  event?: Maybe<Event>;
  extrinsic?: Maybe<Extrinsic>;
  foundType?: Maybe<FoundType>;
  funding?: Maybe<Funding>;
  heldToken?: Maybe<HeldToken>;
  historyOfPaymentEventsForCa?: Maybe<HistoryOfPaymentEventsForCa>;
  identity?: Maybe<Identity>;
  instruction?: Maybe<Instruction>;
  investment?: Maybe<Investment>;
  permission?: Maybe<Permission>;
  proposalVote?: Maybe<ProposalVote>;
  proposal?: Maybe<Proposal>;
  settlement?: Maybe<Settlement>;
  stakingEvent?: Maybe<StakingEvent>;
  sto?: Maybe<Sto>;
  subquery?: Maybe<Subquery>;
  subqueryByName?: Maybe<Subquery>;
  tickerExternalAgentAction?: Maybe<TickerExternalAgentAction>;
  tickerExternalAgentAdded?: Maybe<TickerExternalAgentAdded>;
  tickerExternalAgentHistory?: Maybe<TickerExternalAgentHistory>;
  trustedClaimIssuerTicker?: Maybe<TrustedClaimIssuerTicker>;
  withholdingTaxesOfCa?: Maybe<WithholdingTaxesOfCa>;
  /** Reads a single `Account` using its globally unique `ID`. */
  accountByNodeId?: Maybe<Account>;
  /** Reads a single `AgentGroupMembership` using its globally unique `ID`. */
  agentGroupMembershipByNodeId?: Maybe<AgentGroupMembership>;
  /** Reads a single `AgentGroup` using its globally unique `ID`. */
  agentGroupByNodeId?: Maybe<AgentGroup>;
  /** Reads a single `AssetHolder` using its globally unique `ID`. */
  assetHolderByNodeId?: Maybe<AssetHolder>;
  /** Reads a single `AssetPendingOwnershipTransfer` using its globally unique `ID`. */
  assetPendingOwnershipTransferByNodeId?: Maybe<AssetPendingOwnershipTransfer>;
  /** Reads a single `Asset` using its globally unique `ID`. */
  assetByNodeId?: Maybe<Asset>;
  /** Reads a single `Authorization` using its globally unique `ID`. */
  authorizationByNodeId?: Maybe<Authorization>;
  /** Reads a single `Block` using its globally unique `ID`. */
  blockByNodeId?: Maybe<Block>;
  /** Reads a single `BridgeEvent` using its globally unique `ID`. */
  bridgeEventByNodeId?: Maybe<BridgeEvent>;
  /** Reads a single `ClaimScope` using its globally unique `ID`. */
  claimScopeByNodeId?: Maybe<ClaimScope>;
  /** Reads a single `Claim` using its globally unique `ID`. */
  claimByNodeId?: Maybe<Claim>;
  /** Reads a single `Debug` using its globally unique `ID`. */
  debugByNodeId?: Maybe<Debug>;
  /** Reads a single `Event` using its globally unique `ID`. */
  eventByNodeId?: Maybe<Event>;
  /** Reads a single `Extrinsic` using its globally unique `ID`. */
  extrinsicByNodeId?: Maybe<Extrinsic>;
  /** Reads a single `FoundType` using its globally unique `ID`. */
  foundTypeByNodeId?: Maybe<FoundType>;
  /** Reads a single `Funding` using its globally unique `ID`. */
  fundingByNodeId?: Maybe<Funding>;
  /** Reads a single `HeldToken` using its globally unique `ID`. */
  heldTokenByNodeId?: Maybe<HeldToken>;
  /** Reads a single `HistoryOfPaymentEventsForCa` using its globally unique `ID`. */
  historyOfPaymentEventsForCaByNodeId?: Maybe<HistoryOfPaymentEventsForCa>;
  /** Reads a single `Identity` using its globally unique `ID`. */
  identityByNodeId?: Maybe<Identity>;
  /** Reads a single `Instruction` using its globally unique `ID`. */
  instructionByNodeId?: Maybe<Instruction>;
  /** Reads a single `Investment` using its globally unique `ID`. */
  investmentByNodeId?: Maybe<Investment>;
  /** Reads a single `Permission` using its globally unique `ID`. */
  permissionByNodeId?: Maybe<Permission>;
  /** Reads a single `ProposalVote` using its globally unique `ID`. */
  proposalVoteByNodeId?: Maybe<ProposalVote>;
  /** Reads a single `Proposal` using its globally unique `ID`. */
  proposalByNodeId?: Maybe<Proposal>;
  /** Reads a single `Settlement` using its globally unique `ID`. */
  settlementByNodeId?: Maybe<Settlement>;
  /** Reads a single `StakingEvent` using its globally unique `ID`. */
  stakingEventByNodeId?: Maybe<StakingEvent>;
  /** Reads a single `Sto` using its globally unique `ID`. */
  stoByNodeId?: Maybe<Sto>;
  /** Reads a single `Subquery` using its globally unique `ID`. */
  subqueryByNodeId?: Maybe<Subquery>;
  /** Reads a single `TickerExternalAgentAction` using its globally unique `ID`. */
  tickerExternalAgentActionByNodeId?: Maybe<TickerExternalAgentAction>;
  /** Reads a single `TickerExternalAgentAdded` using its globally unique `ID`. */
  tickerExternalAgentAddedByNodeId?: Maybe<TickerExternalAgentAdded>;
  /** Reads a single `TickerExternalAgentHistory` using its globally unique `ID`. */
  tickerExternalAgentHistoryByNodeId?: Maybe<TickerExternalAgentHistory>;
  /** Reads a single `TrustedClaimIssuerTicker` using its globally unique `ID`. */
  trustedClaimIssuerTickerByNodeId?: Maybe<TrustedClaimIssuerTicker>;
  /** Reads a single `WithholdingTaxesOfCa` using its globally unique `ID`. */
  withholdingTaxesOfCaByNodeId?: Maybe<WithholdingTaxesOfCa>;
  _metadata?: Maybe<_Metadata>;
};

/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AccountsOrderBy>>;
  filter?: Maybe<AccountFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupMembershipsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AgentGroupMembershipsOrderBy>>;
  filter?: Maybe<AgentGroupMembershipFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AgentGroupsOrderBy>>;
  filter?: Maybe<AgentGroupFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetHoldersArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AssetHoldersOrderBy>>;
  filter?: Maybe<AssetHolderFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetPendingOwnershipTransfersArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AssetPendingOwnershipTransfersOrderBy>>;
  filter?: Maybe<AssetPendingOwnershipTransferFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AssetsOrderBy>>;
  filter?: Maybe<AssetFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthorizationsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<AuthorizationsOrderBy>>;
  filter?: Maybe<AuthorizationFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryBlocksArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BlocksOrderBy>>;
  filter?: Maybe<BlockFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryBridgeEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<BridgeEventsOrderBy>>;
  filter?: Maybe<BridgeEventFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimScopesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimScopesOrderBy>>;
  filter?: Maybe<ClaimScopeFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryDebugsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<DebugsOrderBy>>;
  filter?: Maybe<DebugFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<EventsOrderBy>>;
  filter?: Maybe<EventFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ExtrinsicsOrderBy>>;
  filter?: Maybe<ExtrinsicFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryFoundTypesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<FoundTypesOrderBy>>;
  filter?: Maybe<FoundTypeFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryFundingsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<FundingsOrderBy>>;
  filter?: Maybe<FundingFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryHeldTokensArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<HeldTokensOrderBy>>;
  filter?: Maybe<HeldTokenFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryHistoryOfPaymentEventsForCasArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<HistoryOfPaymentEventsForCasOrderBy>>;
  filter?: Maybe<HistoryOfPaymentEventsForCaFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryIdentitiesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentitiesOrderBy>>;
  filter?: Maybe<IdentityFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryInstructionsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<InstructionsOrderBy>>;
  filter?: Maybe<InstructionFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryInvestmentsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<InvestmentsOrderBy>>;
  filter?: Maybe<InvestmentFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryPermissionsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<PermissionsOrderBy>>;
  filter?: Maybe<PermissionFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalVotesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalVotesOrderBy>>;
  filter?: Maybe<ProposalVoteFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ProposalsOrderBy>>;
  filter?: Maybe<ProposalFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QuerySettlementsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<SettlementsOrderBy>>;
  filter?: Maybe<SettlementFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryStakingEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<StakingEventsOrderBy>>;
  filter?: Maybe<StakingEventFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryStosArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<StosOrderBy>>;
  filter?: Maybe<StoFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QuerySubqueriesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<SubqueriesOrderBy>>;
  filter?: Maybe<SubqueryFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentActionsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentActionsOrderBy>>;
  filter?: Maybe<TickerExternalAgentActionFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentAddedsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentAddedsOrderBy>>;
  filter?: Maybe<TickerExternalAgentAddedFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentHistoriesArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TickerExternalAgentHistoriesOrderBy>>;
  filter?: Maybe<TickerExternalAgentHistoryFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryTrustedClaimIssuerTickersArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<TrustedClaimIssuerTickersOrderBy>>;
  filter?: Maybe<TrustedClaimIssuerTickerFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryWithholdingTaxesOfCasArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<WithholdingTaxesOfCasOrderBy>>;
  filter?: Maybe<WithholdingTaxesOfCaFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupMembershipArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetHolderArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetPendingOwnershipTransferArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthorizationArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBlockArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBridgeEventArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimScopeArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryDebugArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryEventArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryFoundTypeArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryFundingArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryHeldTokenArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryHistoryOfPaymentEventsForCaArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryIdentityArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryInstructionArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryInvestmentArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPermissionArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalVoteArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySettlementArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryStakingEventArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryStoArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySubqueryArgs = {
  id: Scalars['Int'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySubqueryByNameArgs = {
  name: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentActionArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentAddedArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentHistoryArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTrustedClaimIssuerTickerArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryWithholdingTaxesOfCaArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupMembershipByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetHolderByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetPendingOwnershipTransferByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAssetByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthorizationByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBlockByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBridgeEventByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimScopeByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryClaimByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryDebugByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryEventByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryFoundTypeByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryFundingByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryHeldTokenByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryHistoryOfPaymentEventsForCaByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryIdentityByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryInstructionByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryInvestmentByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPermissionByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalVoteByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySettlementByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryStakingEventByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryStoByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySubqueryByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentActionByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentAddedByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTickerExternalAgentHistoryByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryTrustedClaimIssuerTickerByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryWithholdingTaxesOfCaByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

export type Settlement = Node & {
  __typename?: 'Settlement';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  addresses: Scalars['JSON'];
  result: Scalars['String'];
  legs: Scalars['JSON'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `Settlement`. */
  block?: Maybe<Block>;
};

export type SettlementAggregates = {
  __typename?: 'SettlementAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Settlement` object types. All fields are combined with a logical ‘and.’ */
export type SettlementFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `addresses` field. */
  addresses?: Maybe<JsonFilter>;
  /** Filter by the object’s `result` field. */
  result?: Maybe<StringFilter>;
  /** Filter by the object’s `legs` field. */
  legs?: Maybe<JsonFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<SettlementFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<SettlementFilter>>;
  /** Negates the expression. */
  not?: Maybe<SettlementFilter>;
};

/** A connection to a list of `Settlement` values. */
export type SettlementsConnection = {
  __typename?: 'SettlementsConnection';
  /** A list of `Settlement` objects. */
  nodes: Array<Maybe<Settlement>>;
  /** A list of edges which contains the `Settlement` and cursor to aid in pagination. */
  edges: Array<SettlementsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Settlement` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SettlementAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SettlementAggregates>>;
};

/** A connection to a list of `Settlement` values. */
export type SettlementsConnectionGroupedAggregatesArgs = {
  groupBy: Array<SettlementsGroupBy>;
  having?: Maybe<SettlementsHavingInput>;
};

/** A `Settlement` edge in the connection. */
export type SettlementsEdge = {
  __typename?: 'SettlementsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Settlement` at the end of the edge. */
  node?: Maybe<Settlement>;
};

/** Grouping methods for `Settlement` for usage during aggregation. */
export enum SettlementsGroupBy {
  BlockId = 'BLOCK_ID',
  Addresses = 'ADDRESSES',
  Result = 'RESULT',
  Legs = 'LEGS',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Settlement` aggregates. */
export type SettlementsHavingInput = {
  AND?: Maybe<Array<SettlementsHavingInput>>;
  OR?: Maybe<Array<SettlementsHavingInput>>;
};

/** Methods to use when ordering `Settlement`. */
export enum SettlementsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  AddressesAsc = 'ADDRESSES_ASC',
  AddressesDesc = 'ADDRESSES_DESC',
  ResultAsc = 'RESULT_ASC',
  ResultDesc = 'RESULT_DESC',
  LegsAsc = 'LEGS_ASC',
  LegsDesc = 'LEGS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type StakingEvent = Node & {
  __typename?: 'StakingEvent';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  stakingEventId: Scalars['String'];
  date: Scalars['Datetime'];
  identityId?: Maybe<Scalars['String']>;
  stashAccount?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['BigFloat']>;
  nominatedValidators?: Maybe<Scalars['JSON']>;
  transactionId?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `StakingEvent`. */
  block?: Maybe<Block>;
};

export type StakingEventAggregates = {
  __typename?: 'StakingEventAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `StakingEvent` object types. All fields are combined with a logical ‘and.’ */
export type StakingEventFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `stakingEventId` field. */
  stakingEventId?: Maybe<StringFilter>;
  /** Filter by the object’s `date` field. */
  date?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `identityId` field. */
  identityId?: Maybe<StringFilter>;
  /** Filter by the object’s `stashAccount` field. */
  stashAccount?: Maybe<StringFilter>;
  /** Filter by the object’s `amount` field. */
  amount?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `nominatedValidators` field. */
  nominatedValidators?: Maybe<JsonFilter>;
  /** Filter by the object’s `transactionId` field. */
  transactionId?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<StakingEventFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<StakingEventFilter>>;
  /** Negates the expression. */
  not?: Maybe<StakingEventFilter>;
};

/** A connection to a list of `StakingEvent` values. */
export type StakingEventsConnection = {
  __typename?: 'StakingEventsConnection';
  /** A list of `StakingEvent` objects. */
  nodes: Array<Maybe<StakingEvent>>;
  /** A list of edges which contains the `StakingEvent` and cursor to aid in pagination. */
  edges: Array<StakingEventsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `StakingEvent` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<StakingEventAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<StakingEventAggregates>>;
};

/** A connection to a list of `StakingEvent` values. */
export type StakingEventsConnectionGroupedAggregatesArgs = {
  groupBy: Array<StakingEventsGroupBy>;
  having?: Maybe<StakingEventsHavingInput>;
};

/** A `StakingEvent` edge in the connection. */
export type StakingEventsEdge = {
  __typename?: 'StakingEventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `StakingEvent` at the end of the edge. */
  node?: Maybe<StakingEvent>;
};

/** Grouping methods for `StakingEvent` for usage during aggregation. */
export enum StakingEventsGroupBy {
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  StakingEventId = 'STAKING_EVENT_ID',
  Date = 'DATE',
  IdentityId = 'IDENTITY_ID',
  StashAccount = 'STASH_ACCOUNT',
  Amount = 'AMOUNT',
  NominatedValidators = 'NOMINATED_VALIDATORS',
  TransactionId = 'TRANSACTION_ID',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `StakingEvent` aggregates. */
export type StakingEventsHavingInput = {
  AND?: Maybe<Array<StakingEventsHavingInput>>;
  OR?: Maybe<Array<StakingEventsHavingInput>>;
};

/** Methods to use when ordering `StakingEvent`. */
export enum StakingEventsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  StakingEventIdAsc = 'STAKING_EVENT_ID_ASC',
  StakingEventIdDesc = 'STAKING_EVENT_ID_DESC',
  DateAsc = 'DATE_ASC',
  DateDesc = 'DATE_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  StashAccountAsc = 'STASH_ACCOUNT_ASC',
  StashAccountDesc = 'STASH_ACCOUNT_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  NominatedValidatorsAsc = 'NOMINATED_VALIDATORS_ASC',
  NominatedValidatorsDesc = 'NOMINATED_VALIDATORS_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Sto = Node & {
  __typename?: 'Sto';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  offeringAsset: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type StoAggregates = {
  __typename?: 'StoAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Sto` object types. All fields are combined with a logical ‘and.’ */
export type StoFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `offeringAsset` field. */
  offeringAsset?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<StoFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<StoFilter>>;
  /** Negates the expression. */
  not?: Maybe<StoFilter>;
};

/** A connection to a list of `Sto` values. */
export type StosConnection = {
  __typename?: 'StosConnection';
  /** A list of `Sto` objects. */
  nodes: Array<Maybe<Sto>>;
  /** A list of edges which contains the `Sto` and cursor to aid in pagination. */
  edges: Array<StosEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Sto` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<StoAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<StoAggregates>>;
};

/** A connection to a list of `Sto` values. */
export type StosConnectionGroupedAggregatesArgs = {
  groupBy: Array<StosGroupBy>;
  having?: Maybe<StosHavingInput>;
};

/** A `Sto` edge in the connection. */
export type StosEdge = {
  __typename?: 'StosEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Sto` at the end of the edge. */
  node?: Maybe<Sto>;
};

/** Grouping methods for `Sto` for usage during aggregation. */
export enum StosGroupBy {
  OfferingAsset = 'OFFERING_ASSET',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Sto` aggregates. */
export type StosHavingInput = {
  AND?: Maybe<Array<StosHavingInput>>;
  OR?: Maybe<Array<StosHavingInput>>;
};

/** Methods to use when ordering `Sto`. */
export enum StosOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  OfferingAssetAsc = 'OFFERING_ASSET_ASC',
  OfferingAssetDesc = 'OFFERING_ASSET_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against String fields. All fields are combined with a logical ‘and.’ */
export type StringFilter = {
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: Maybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: Maybe<Scalars['String']>;
  /** Not equal to the specified value. */
  notEqualTo?: Maybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: Maybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: Maybe<Scalars['String']>;
  /** Included in the specified list. */
  in?: Maybe<Array<Scalars['String']>>;
  /** Not included in the specified list. */
  notIn?: Maybe<Array<Scalars['String']>>;
  /** Less than the specified value. */
  lessThan?: Maybe<Scalars['String']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: Maybe<Scalars['String']>;
  /** Greater than the specified value. */
  greaterThan?: Maybe<Scalars['String']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: Maybe<Scalars['String']>;
  /** Contains the specified string (case-sensitive). */
  includes?: Maybe<Scalars['String']>;
  /** Does not contain the specified string (case-sensitive). */
  notIncludes?: Maybe<Scalars['String']>;
  /** Contains the specified string (case-insensitive). */
  includesInsensitive?: Maybe<Scalars['String']>;
  /** Does not contain the specified string (case-insensitive). */
  notIncludesInsensitive?: Maybe<Scalars['String']>;
  /** Starts with the specified string (case-sensitive). */
  startsWith?: Maybe<Scalars['String']>;
  /** Does not start with the specified string (case-sensitive). */
  notStartsWith?: Maybe<Scalars['String']>;
  /** Starts with the specified string (case-insensitive). */
  startsWithInsensitive?: Maybe<Scalars['String']>;
  /** Does not start with the specified string (case-insensitive). */
  notStartsWithInsensitive?: Maybe<Scalars['String']>;
  /** Ends with the specified string (case-sensitive). */
  endsWith?: Maybe<Scalars['String']>;
  /** Does not end with the specified string (case-sensitive). */
  notEndsWith?: Maybe<Scalars['String']>;
  /** Ends with the specified string (case-insensitive). */
  endsWithInsensitive?: Maybe<Scalars['String']>;
  /** Does not end with the specified string (case-insensitive). */
  notEndsWithInsensitive?: Maybe<Scalars['String']>;
  /** Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  like?: Maybe<Scalars['String']>;
  /** Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLike?: Maybe<Scalars['String']>;
  /** Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  likeInsensitive?: Maybe<Scalars['String']>;
  /** Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLikeInsensitive?: Maybe<Scalars['String']>;
  /** Equal to the specified value (case-insensitive). */
  equalToInsensitive?: Maybe<Scalars['String']>;
  /** Not equal to the specified value (case-insensitive). */
  notEqualToInsensitive?: Maybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value (case-insensitive). */
  distinctFromInsensitive?: Maybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value (case-insensitive). */
  notDistinctFromInsensitive?: Maybe<Scalars['String']>;
  /** Included in the specified list (case-insensitive). */
  inInsensitive?: Maybe<Array<Scalars['String']>>;
  /** Not included in the specified list (case-insensitive). */
  notInInsensitive?: Maybe<Array<Scalars['String']>>;
  /** Less than the specified value (case-insensitive). */
  lessThanInsensitive?: Maybe<Scalars['String']>;
  /** Less than or equal to the specified value (case-insensitive). */
  lessThanOrEqualToInsensitive?: Maybe<Scalars['String']>;
  /** Greater than the specified value (case-insensitive). */
  greaterThanInsensitive?: Maybe<Scalars['String']>;
  /** Greater than or equal to the specified value (case-insensitive). */
  greaterThanOrEqualToInsensitive?: Maybe<Scalars['String']>;
};

/** A connection to a list of `Subquery` values. */
export type SubqueriesConnection = {
  __typename?: 'SubqueriesConnection';
  /** A list of `Subquery` objects. */
  nodes: Array<Maybe<Subquery>>;
  /** A list of edges which contains the `Subquery` and cursor to aid in pagination. */
  edges: Array<SubqueriesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Subquery` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SubqueryAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SubqueryAggregates>>;
};

/** A connection to a list of `Subquery` values. */
export type SubqueriesConnectionGroupedAggregatesArgs = {
  groupBy: Array<SubqueriesGroupBy>;
  having?: Maybe<SubqueriesHavingInput>;
};

/** A `Subquery` edge in the connection. */
export type SubqueriesEdge = {
  __typename?: 'SubqueriesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Subquery` at the end of the edge. */
  node?: Maybe<Subquery>;
};

/** Grouping methods for `Subquery` for usage during aggregation. */
export enum SubqueriesGroupBy {
  DbSchema = 'DB_SCHEMA',
  Version = 'VERSION',
  Hash = 'HASH',
  NextBlockHeight = 'NEXT_BLOCK_HEIGHT',
  Network = 'NETWORK',
  NetworkGenesis = 'NETWORK_GENESIS',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `Subquery` aggregates. */
export type SubqueriesHavingInput = {
  AND?: Maybe<Array<SubqueriesHavingInput>>;
  OR?: Maybe<Array<SubqueriesHavingInput>>;
};

/** Methods to use when ordering `Subquery`. */
export enum SubqueriesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  DbSchemaAsc = 'DB_SCHEMA_ASC',
  DbSchemaDesc = 'DB_SCHEMA_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  NextBlockHeightAsc = 'NEXT_BLOCK_HEIGHT_ASC',
  NextBlockHeightDesc = 'NEXT_BLOCK_HEIGHT_DESC',
  NetworkAsc = 'NETWORK_ASC',
  NetworkDesc = 'NETWORK_DESC',
  NetworkGenesisAsc = 'NETWORK_GENESIS_ASC',
  NetworkGenesisDesc = 'NETWORK_GENESIS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Subquery = Node & {
  __typename?: 'Subquery';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['Int'];
  name: Scalars['String'];
  dbSchema: Scalars['String'];
  version: Scalars['Int'];
  hash: Scalars['String'];
  nextBlockHeight: Scalars['Int'];
  network?: Maybe<Scalars['String']>;
  networkGenesis?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type SubqueryAggregates = {
  __typename?: 'SubqueryAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `Subquery` object types. All fields are combined with a logical ‘and.’ */
export type SubqueryFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<IntFilter>;
  /** Filter by the object’s `name` field. */
  name?: Maybe<StringFilter>;
  /** Filter by the object’s `dbSchema` field. */
  dbSchema?: Maybe<StringFilter>;
  /** Filter by the object’s `version` field. */
  version?: Maybe<IntFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: Maybe<StringFilter>;
  /** Filter by the object’s `nextBlockHeight` field. */
  nextBlockHeight?: Maybe<IntFilter>;
  /** Filter by the object’s `network` field. */
  network?: Maybe<StringFilter>;
  /** Filter by the object’s `networkGenesis` field. */
  networkGenesis?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<SubqueryFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<SubqueryFilter>>;
  /** Negates the expression. */
  not?: Maybe<SubqueryFilter>;
};

export type TableEstimate = {
  __typename?: 'TableEstimate';
  table?: Maybe<Scalars['String']>;
  estimate?: Maybe<Scalars['Int']>;
};

export type TickerExternalAgentAction = Node & {
  __typename?: 'TickerExternalAgentAction';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  ticker: Scalars['String'];
  palletName: Scalars['String'];
  eventId: Scalars['String'];
  callerDid: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `TickerExternalAgentAction`. */
  block?: Maybe<Block>;
};

export type TickerExternalAgentActionAggregates = {
  __typename?: 'TickerExternalAgentActionAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `TickerExternalAgentAction` object types. All fields are combined with a logical ‘and.’ */
export type TickerExternalAgentActionFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `palletName` field. */
  palletName?: Maybe<StringFilter>;
  /** Filter by the object’s `eventId` field. */
  eventId?: Maybe<StringFilter>;
  /** Filter by the object’s `callerDid` field. */
  callerDid?: Maybe<StringFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<TickerExternalAgentActionFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<TickerExternalAgentActionFilter>>;
  /** Negates the expression. */
  not?: Maybe<TickerExternalAgentActionFilter>;
};

/** A connection to a list of `TickerExternalAgentAction` values. */
export type TickerExternalAgentActionsConnection = {
  __typename?: 'TickerExternalAgentActionsConnection';
  /** A list of `TickerExternalAgentAction` objects. */
  nodes: Array<Maybe<TickerExternalAgentAction>>;
  /** A list of edges which contains the `TickerExternalAgentAction` and cursor to aid in pagination. */
  edges: Array<TickerExternalAgentActionsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TickerExternalAgentAction` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<TickerExternalAgentActionAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<TickerExternalAgentActionAggregates>>;
};

/** A connection to a list of `TickerExternalAgentAction` values. */
export type TickerExternalAgentActionsConnectionGroupedAggregatesArgs = {
  groupBy: Array<TickerExternalAgentActionsGroupBy>;
  having?: Maybe<TickerExternalAgentActionsHavingInput>;
};

/** A `TickerExternalAgentAction` edge in the connection. */
export type TickerExternalAgentActionsEdge = {
  __typename?: 'TickerExternalAgentActionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentAction` at the end of the edge. */
  node?: Maybe<TickerExternalAgentAction>;
};

/** Grouping methods for `TickerExternalAgentAction` for usage during aggregation. */
export enum TickerExternalAgentActionsGroupBy {
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  Ticker = 'TICKER',
  PalletName = 'PALLET_NAME',
  EventId = 'EVENT_ID',
  CallerDid = 'CALLER_DID',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `TickerExternalAgentAction` aggregates. */
export type TickerExternalAgentActionsHavingInput = {
  AND?: Maybe<Array<TickerExternalAgentActionsHavingInput>>;
  OR?: Maybe<Array<TickerExternalAgentActionsHavingInput>>;
};

/** Methods to use when ordering `TickerExternalAgentAction`. */
export enum TickerExternalAgentActionsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  PalletNameAsc = 'PALLET_NAME_ASC',
  PalletNameDesc = 'PALLET_NAME_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  CallerDidAsc = 'CALLER_DID_ASC',
  CallerDidDesc = 'CALLER_DID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type TickerExternalAgentAdded = Node & {
  __typename?: 'TickerExternalAgentAdded';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  callerDid: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `TickerExternalAgentAdded`. */
  block?: Maybe<Block>;
};

export type TickerExternalAgentAddedAggregates = {
  __typename?: 'TickerExternalAgentAddedAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `TickerExternalAgentAdded` object types. All fields are combined with a logical ‘and.’ */
export type TickerExternalAgentAddedFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `callerDid` field. */
  callerDid?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<TickerExternalAgentAddedFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<TickerExternalAgentAddedFilter>>;
  /** Negates the expression. */
  not?: Maybe<TickerExternalAgentAddedFilter>;
};

/** A connection to a list of `TickerExternalAgentAdded` values. */
export type TickerExternalAgentAddedsConnection = {
  __typename?: 'TickerExternalAgentAddedsConnection';
  /** A list of `TickerExternalAgentAdded` objects. */
  nodes: Array<Maybe<TickerExternalAgentAdded>>;
  /** A list of edges which contains the `TickerExternalAgentAdded` and cursor to aid in pagination. */
  edges: Array<TickerExternalAgentAddedsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TickerExternalAgentAdded` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<TickerExternalAgentAddedAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<TickerExternalAgentAddedAggregates>>;
};

/** A connection to a list of `TickerExternalAgentAdded` values. */
export type TickerExternalAgentAddedsConnectionGroupedAggregatesArgs = {
  groupBy: Array<TickerExternalAgentAddedsGroupBy>;
  having?: Maybe<TickerExternalAgentAddedsHavingInput>;
};

/** A `TickerExternalAgentAdded` edge in the connection. */
export type TickerExternalAgentAddedsEdge = {
  __typename?: 'TickerExternalAgentAddedsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentAdded` at the end of the edge. */
  node?: Maybe<TickerExternalAgentAdded>;
};

/** Grouping methods for `TickerExternalAgentAdded` for usage during aggregation. */
export enum TickerExternalAgentAddedsGroupBy {
  Ticker = 'TICKER',
  CallerDid = 'CALLER_DID',
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  Datetime = 'DATETIME',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `TickerExternalAgentAdded` aggregates. */
export type TickerExternalAgentAddedsHavingInput = {
  AND?: Maybe<Array<TickerExternalAgentAddedsHavingInput>>;
  OR?: Maybe<Array<TickerExternalAgentAddedsHavingInput>>;
};

/** Methods to use when ordering `TickerExternalAgentAdded`. */
export enum TickerExternalAgentAddedsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  CallerDidAsc = 'CALLER_DID_ASC',
  CallerDidDesc = 'CALLER_DID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `TickerExternalAgentHistory` values. */
export type TickerExternalAgentHistoriesConnection = {
  __typename?: 'TickerExternalAgentHistoriesConnection';
  /** A list of `TickerExternalAgentHistory` objects. */
  nodes: Array<Maybe<TickerExternalAgentHistory>>;
  /** A list of edges which contains the `TickerExternalAgentHistory` and cursor to aid in pagination. */
  edges: Array<TickerExternalAgentHistoriesEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TickerExternalAgentHistory` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<TickerExternalAgentHistoryAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<TickerExternalAgentHistoryAggregates>>;
};

/** A connection to a list of `TickerExternalAgentHistory` values. */
export type TickerExternalAgentHistoriesConnectionGroupedAggregatesArgs = {
  groupBy: Array<TickerExternalAgentHistoriesGroupBy>;
  having?: Maybe<TickerExternalAgentHistoriesHavingInput>;
};

/** A `TickerExternalAgentHistory` edge in the connection. */
export type TickerExternalAgentHistoriesEdge = {
  __typename?: 'TickerExternalAgentHistoriesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentHistory` at the end of the edge. */
  node?: Maybe<TickerExternalAgentHistory>;
};

/** Grouping methods for `TickerExternalAgentHistory` for usage during aggregation. */
export enum TickerExternalAgentHistoriesGroupBy {
  Ticker = 'TICKER',
  Did = 'DID',
  BlockId = 'BLOCK_ID',
  EventIdx = 'EVENT_IDX',
  Datetime = 'DATETIME',
  Type = 'TYPE',
  Permissions = 'PERMISSIONS',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `TickerExternalAgentHistory` aggregates. */
export type TickerExternalAgentHistoriesHavingInput = {
  AND?: Maybe<Array<TickerExternalAgentHistoriesHavingInput>>;
  OR?: Maybe<Array<TickerExternalAgentHistoriesHavingInput>>;
};

/** Methods to use when ordering `TickerExternalAgentHistory`. */
export enum TickerExternalAgentHistoriesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type TickerExternalAgentHistory = Node & {
  __typename?: 'TickerExternalAgentHistory';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  did: Scalars['String'];
  blockId: Scalars['String'];
  eventIdx: Scalars['Int'];
  datetime: Scalars['Datetime'];
  type: Scalars['String'];
  permissions?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Block` that is related to this `TickerExternalAgentHistory`. */
  block?: Maybe<Block>;
};

export type TickerExternalAgentHistoryAggregates = {
  __typename?: 'TickerExternalAgentHistoryAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `TickerExternalAgentHistory` object types. All fields are combined with a logical ‘and.’ */
export type TickerExternalAgentHistoryFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `did` field. */
  did?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<StringFilter>;
  /** Filter by the object’s `eventIdx` field. */
  eventIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `type` field. */
  type?: Maybe<StringFilter>;
  /** Filter by the object’s `permissions` field. */
  permissions?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<TickerExternalAgentHistoryFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<TickerExternalAgentHistoryFilter>>;
  /** Negates the expression. */
  not?: Maybe<TickerExternalAgentHistoryFilter>;
};

export type TrustedClaimIssuerTicker = Node & {
  __typename?: 'TrustedClaimIssuerTicker';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  issuer: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type TrustedClaimIssuerTickerAggregates = {
  __typename?: 'TrustedClaimIssuerTickerAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `TrustedClaimIssuerTicker` object types. All fields are combined with a logical ‘and.’ */
export type TrustedClaimIssuerTickerFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `issuer` field. */
  issuer?: Maybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<TrustedClaimIssuerTickerFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<TrustedClaimIssuerTickerFilter>>;
  /** Negates the expression. */
  not?: Maybe<TrustedClaimIssuerTickerFilter>;
};

/** A connection to a list of `TrustedClaimIssuerTicker` values. */
export type TrustedClaimIssuerTickersConnection = {
  __typename?: 'TrustedClaimIssuerTickersConnection';
  /** A list of `TrustedClaimIssuerTicker` objects. */
  nodes: Array<Maybe<TrustedClaimIssuerTicker>>;
  /** A list of edges which contains the `TrustedClaimIssuerTicker` and cursor to aid in pagination. */
  edges: Array<TrustedClaimIssuerTickersEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `TrustedClaimIssuerTicker` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<TrustedClaimIssuerTickerAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<TrustedClaimIssuerTickerAggregates>>;
};

/** A connection to a list of `TrustedClaimIssuerTicker` values. */
export type TrustedClaimIssuerTickersConnectionGroupedAggregatesArgs = {
  groupBy: Array<TrustedClaimIssuerTickersGroupBy>;
  having?: Maybe<TrustedClaimIssuerTickersHavingInput>;
};

/** A `TrustedClaimIssuerTicker` edge in the connection. */
export type TrustedClaimIssuerTickersEdge = {
  __typename?: 'TrustedClaimIssuerTickersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TrustedClaimIssuerTicker` at the end of the edge. */
  node?: Maybe<TrustedClaimIssuerTicker>;
};

/** Grouping methods for `TrustedClaimIssuerTicker` for usage during aggregation. */
export enum TrustedClaimIssuerTickersGroupBy {
  Ticker = 'TICKER',
  Issuer = 'ISSUER',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `TrustedClaimIssuerTicker` aggregates. */
export type TrustedClaimIssuerTickersHavingInput = {
  AND?: Maybe<Array<TrustedClaimIssuerTickersHavingInput>>;
  OR?: Maybe<Array<TrustedClaimIssuerTickersHavingInput>>;
};

/** Methods to use when ordering `TrustedClaimIssuerTicker`. */
export enum TrustedClaimIssuerTickersOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  IssuerAsc = 'ISSUER_ASC',
  IssuerDesc = 'ISSUER_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type WithholdingTaxesOfCa = Node & {
  __typename?: 'WithholdingTaxesOfCa';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  ticker: Scalars['String'];
  localId: Scalars['Int'];
  datetime: Scalars['Datetime'];
  taxes: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

export type WithholdingTaxesOfCaAggregates = {
  __typename?: 'WithholdingTaxesOfCaAggregates';
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A filter to be used against `WithholdingTaxesOfCa` object types. All fields are combined with a logical ‘and.’ */
export type WithholdingTaxesOfCaFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `ticker` field. */
  ticker?: Maybe<StringFilter>;
  /** Filter by the object’s `localId` field. */
  localId?: Maybe<IntFilter>;
  /** Filter by the object’s `datetime` field. */
  datetime?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `taxes` field. */
  taxes?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<WithholdingTaxesOfCaFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<WithholdingTaxesOfCaFilter>>;
  /** Negates the expression. */
  not?: Maybe<WithholdingTaxesOfCaFilter>;
};

/** A connection to a list of `WithholdingTaxesOfCa` values. */
export type WithholdingTaxesOfCasConnection = {
  __typename?: 'WithholdingTaxesOfCasConnection';
  /** A list of `WithholdingTaxesOfCa` objects. */
  nodes: Array<Maybe<WithholdingTaxesOfCa>>;
  /** A list of edges which contains the `WithholdingTaxesOfCa` and cursor to aid in pagination. */
  edges: Array<WithholdingTaxesOfCasEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `WithholdingTaxesOfCa` you could get from the connection. */
  totalCount: Scalars['Int'];
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<WithholdingTaxesOfCaAggregates>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<WithholdingTaxesOfCaAggregates>>;
};

/** A connection to a list of `WithholdingTaxesOfCa` values. */
export type WithholdingTaxesOfCasConnectionGroupedAggregatesArgs = {
  groupBy: Array<WithholdingTaxesOfCasGroupBy>;
  having?: Maybe<WithholdingTaxesOfCasHavingInput>;
};

/** A `WithholdingTaxesOfCa` edge in the connection. */
export type WithholdingTaxesOfCasEdge = {
  __typename?: 'WithholdingTaxesOfCasEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `WithholdingTaxesOfCa` at the end of the edge. */
  node?: Maybe<WithholdingTaxesOfCa>;
};

/** Grouping methods for `WithholdingTaxesOfCa` for usage during aggregation. */
export enum WithholdingTaxesOfCasGroupBy {
  Ticker = 'TICKER',
  LocalId = 'LOCAL_ID',
  Datetime = 'DATETIME',
  Taxes = 'TAXES',
  CreatedAt = 'CREATED_AT',
  UpdatedAt = 'UPDATED_AT',
}

/** Conditions for `WithholdingTaxesOfCa` aggregates. */
export type WithholdingTaxesOfCasHavingInput = {
  AND?: Maybe<Array<WithholdingTaxesOfCasHavingInput>>;
  OR?: Maybe<Array<WithholdingTaxesOfCasHavingInput>>;
};

/** Methods to use when ordering `WithholdingTaxesOfCa`. */
export enum WithholdingTaxesOfCasOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  LocalIdAsc = 'LOCAL_ID_ASC',
  LocalIdDesc = 'LOCAL_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  TaxesAsc = 'TAXES_ASC',
  TaxesDesc = 'TAXES_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type _Metadata = {
  __typename?: '_Metadata';
  lastProcessedHeight?: Maybe<Scalars['Int']>;
  lastProcessedTimestamp?: Maybe<Scalars['Date']>;
  targetHeight?: Maybe<Scalars['Int']>;
  chain?: Maybe<Scalars['String']>;
  specName?: Maybe<Scalars['String']>;
  genesisHash?: Maybe<Scalars['String']>;
  indexerHealthy?: Maybe<Scalars['Boolean']>;
  indexerNodeVersion?: Maybe<Scalars['String']>;
  queryNodeVersion?: Maybe<Scalars['String']>;
  rowCountEstimate?: Maybe<Array<Maybe<TableEstimate>>>;
  dynamicDatasources?: Maybe<Scalars['String']>;
};
