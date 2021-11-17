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
  /** A location in a connection that can be used for resuming pagination. */
  Cursor: any;
  /**
   * A point in time as described by the [ISO
   * 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. May or may not include a timezone.
   */
  Datetime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** A floating point number that requires more precision than IEEE 754 binary 64 */
  BigFloat: any;
};

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
};

/** A `AgentGroupMembership` edge in the connection. */
export type AgentGroupMembershipsEdge = {
  __typename?: 'AgentGroupMembershipsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AgentGroupMembership` at the end of the edge. */
  node?: Maybe<AgentGroupMembership>;
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
};

/** A `AgentGroup` edge in the connection. */
export type AgentGroupsEdge = {
  __typename?: 'AgentGroupsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `AgentGroup` at the end of the edge. */
  node?: Maybe<AgentGroup>;
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
};

/** A `Authorization` edge in the connection. */
export type AuthorizationsEdge = {
  __typename?: 'AuthorizationsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Authorization` at the end of the edge. */
  node?: Maybe<Authorization>;
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
  eventsByParentBlockId: EventsConnection;
};

export type BlockEventsByParentBlockIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<EventsOrderBy>>;
  filter?: Maybe<EventFilter>;
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
};

/** A `Block` edge in the connection. */
export type BlocksEdge = {
  __typename?: 'BlocksEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
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

export type Claim = Node & {
  __typename?: 'Claim';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  targetDidId: Scalars['String'];
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
  /** Reads a single `IdentityWithClaim` that is related to this `Claim`. */
  targetDid?: Maybe<IdentityWithClaim>;
  /** Reads a single `IssuerIdentityWithClaim` that is related to this `Claim`. */
  issuer?: Maybe<IssuerIdentityWithClaim>;
};

/** A filter to be used against `Claim` object types. All fields are combined with a logical ‘and.’ */
export type ClaimFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `targetDidId` field. */
  targetDidId?: Maybe<StringFilter>;
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
};

export type ClaimScope = Node & {
  __typename?: 'ClaimScope';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  targetDid: Scalars['String'];
  ticker?: Maybe<Scalars['String']>;
  scope?: Maybe<Scalars['JSON']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `ClaimScope` object types. All fields are combined with a logical ‘and.’ */
export type ClaimScopeFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `targetDid` field. */
  targetDid?: Maybe<StringFilter>;
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
};

/** A `ClaimScope` edge in the connection. */
export type ClaimScopesEdge = {
  __typename?: 'ClaimScopesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ClaimScope` at the end of the edge. */
  node?: Maybe<ClaimScope>;
};

/** Methods to use when ordering `ClaimScope`. */
export enum ClaimScopesOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TargetDidAsc = 'TARGET_DID_ASC',
  TargetDidDesc = 'TARGET_DID_DESC',
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

/** A `Claim` edge in the connection. */
export type ClaimsEdge = {
  __typename?: 'ClaimsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Claim` at the end of the edge. */
  node?: Maybe<Claim>;
};

/** Methods to use when ordering `Claim`. */
export enum ClaimsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  TargetDidIdAsc = 'TARGET_DID_ID_ASC',
  TargetDidIdDesc = 'TARGET_DID_ID_DESC',
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

export type DataBlock = {
  __typename?: 'DataBlock';
  id?: Maybe<Scalars['Int']>;
  parentId?: Maybe<Scalars['Int']>;
  hash?: Maybe<Scalars['String']>;
  parentHash?: Maybe<Scalars['String']>;
  stateRoot?: Maybe<Scalars['String']>;
  extrinsicsRoot?: Maybe<Scalars['String']>;
  countExtrinsics?: Maybe<Scalars['Int']>;
  countExtrinsicsUnsigned?: Maybe<Scalars['Int']>;
  countExtrinsicsSigned?: Maybe<Scalars['Int']>;
  countExtrinsicsError?: Maybe<Scalars['Int']>;
  countExtrinsicsSuccess?: Maybe<Scalars['Int']>;
  countEvents?: Maybe<Scalars['Int']>;
  datetime?: Maybe<Scalars['Datetime']>;
  specVersionId?: Maybe<Scalars['String']>;
};

/** A filter to be used against `DataBlock` object types. All fields are combined with a logical ‘and.’ */
export type DataBlockFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<IntFilter>;
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
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<DataBlockFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<DataBlockFilter>>;
  /** Negates the expression. */
  not?: Maybe<DataBlockFilter>;
};

/** A connection to a list of `DataBlock` values. */
export type DataBlocksConnection = {
  __typename?: 'DataBlocksConnection';
  /** A list of `DataBlock` objects. */
  nodes: Array<Maybe<DataBlock>>;
  /** A list of edges which contains the `DataBlock` and cursor to aid in pagination. */
  edges: Array<DataBlocksEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DataBlock` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DataBlock` edge in the connection. */
export type DataBlocksEdge = {
  __typename?: 'DataBlocksEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DataBlock` at the end of the edge. */
  node?: Maybe<DataBlock>;
};

/** Methods to use when ordering `DataBlock`. */
export enum DataBlocksOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
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
}

export type DataEvent = {
  __typename?: 'DataEvent';
  blockId?: Maybe<Scalars['Int']>;
  eventIdx?: Maybe<Scalars['Int']>;
  extrinsicIdx?: Maybe<Scalars['Int']>;
  specVersionId?: Maybe<Scalars['Int']>;
  moduleId?: Maybe<Scalars['String']>;
  eventId?: Maybe<Scalars['String']>;
  attributes?: Maybe<Scalars['JSON']>;
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
};

/** A filter to be used against `DataEvent` object types. All fields are combined with a logical ‘and.’ */
export type DataEventFilter = {
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
  /** Filter by the object’s `attributes` field. */
  attributes?: Maybe<JsonFilter>;
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
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<DataEventFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<DataEventFilter>>;
  /** Negates the expression. */
  not?: Maybe<DataEventFilter>;
};

/** A connection to a list of `DataEvent` values. */
export type DataEventsConnection = {
  __typename?: 'DataEventsConnection';
  /** A list of `DataEvent` objects. */
  nodes: Array<Maybe<DataEvent>>;
  /** A list of edges which contains the `DataEvent` and cursor to aid in pagination. */
  edges: Array<DataEventsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DataEvent` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DataEvent` edge in the connection. */
export type DataEventsEdge = {
  __typename?: 'DataEventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DataEvent` at the end of the edge. */
  node?: Maybe<DataEvent>;
};

/** Methods to use when ordering `DataEvent`. */
export enum DataEventsOrderBy {
  Natural = 'NATURAL',
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
  AttributesAsc = 'ATTRIBUTES_ASC',
  AttributesDesc = 'ATTRIBUTES_DESC',
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
}

export type DataExtrinsic = {
  __typename?: 'DataExtrinsic';
  blockId?: Maybe<Scalars['Int']>;
  extrinsicIdx?: Maybe<Scalars['Int']>;
  signed?: Maybe<Scalars['Int']>;
  callId?: Maybe<Scalars['String']>;
  moduleId?: Maybe<Scalars['String']>;
  nonce?: Maybe<Scalars['Int']>;
  extrinsicHash?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  signedbyAddress?: Maybe<Scalars['Int']>;
  params?: Maybe<Scalars['JSON']>;
  success?: Maybe<Scalars['Int']>;
  specVersionId?: Maybe<Scalars['Int']>;
};

/** A filter to be used against `DataExtrinsic` object types. All fields are combined with a logical ‘and.’ */
export type DataExtrinsicFilter = {
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
  /** Filter by the object’s `extrinsicIdx` field. */
  extrinsicIdx?: Maybe<IntFilter>;
  /** Filter by the object’s `signed` field. */
  signed?: Maybe<IntFilter>;
  /** Filter by the object’s `callId` field. */
  callId?: Maybe<StringFilter>;
  /** Filter by the object’s `moduleId` field. */
  moduleId?: Maybe<StringFilter>;
  /** Filter by the object’s `nonce` field. */
  nonce?: Maybe<IntFilter>;
  /** Filter by the object’s `extrinsicHash` field. */
  extrinsicHash?: Maybe<StringFilter>;
  /** Filter by the object’s `address` field. */
  address?: Maybe<StringFilter>;
  /** Filter by the object’s `signedbyAddress` field. */
  signedbyAddress?: Maybe<IntFilter>;
  /** Filter by the object’s `params` field. */
  params?: Maybe<JsonFilter>;
  /** Filter by the object’s `success` field. */
  success?: Maybe<IntFilter>;
  /** Filter by the object’s `specVersionId` field. */
  specVersionId?: Maybe<IntFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<DataExtrinsicFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<DataExtrinsicFilter>>;
  /** Negates the expression. */
  not?: Maybe<DataExtrinsicFilter>;
};

/** A connection to a list of `DataExtrinsic` values. */
export type DataExtrinsicsConnection = {
  __typename?: 'DataExtrinsicsConnection';
  /** A list of `DataExtrinsic` objects. */
  nodes: Array<Maybe<DataExtrinsic>>;
  /** A list of edges which contains the `DataExtrinsic` and cursor to aid in pagination. */
  edges: Array<DataExtrinsicsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `DataExtrinsic` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `DataExtrinsic` edge in the connection. */
export type DataExtrinsicsEdge = {
  __typename?: 'DataExtrinsicsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `DataExtrinsic` at the end of the edge. */
  node?: Maybe<DataExtrinsic>;
};

/** Methods to use when ordering `DataExtrinsic`. */
export enum DataExtrinsicsOrderBy {
  Natural = 'NATURAL',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  SignedAsc = 'SIGNED_ASC',
  SignedDesc = 'SIGNED_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  NonceAsc = 'NONCE_ASC',
  NonceDesc = 'NONCE_DESC',
  ExtrinsicHashAsc = 'EXTRINSIC_HASH_ASC',
  ExtrinsicHashDesc = 'EXTRINSIC_HASH_DESC',
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  SignedbyAddressAsc = 'SIGNEDBY_ADDRESS_ASC',
  SignedbyAddressDesc = 'SIGNEDBY_ADDRESS_DESC',
  ParamsAsc = 'PARAMS_ASC',
  ParamsDesc = 'PARAMS_DESC',
  SuccessAsc = 'SUCCESS_ASC',
  SuccessDesc = 'SUCCESS_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
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
};

/** A `Debug` edge in the connection. */
export type DebugsEdge = {
  __typename?: 'DebugsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Debug` at the end of the edge. */
  node?: Maybe<Debug>;
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
  blockId: Scalars['Int'];
  parentBlockId: Scalars['String'];
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
  parentBlock?: Maybe<Block>;
};

/** A filter to be used against `Event` object types. All fields are combined with a logical ‘and.’ */
export type EventFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
  /** Filter by the object’s `parentBlockId` field. */
  parentBlockId?: Maybe<StringFilter>;
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
};

/** A `Event` edge in the connection. */
export type EventsEdge = {
  __typename?: 'EventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Event` at the end of the edge. */
  node?: Maybe<Event>;
};

/** Methods to use when ordering `Event`. */
export enum EventsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ParentBlockIdAsc = 'PARENT_BLOCK_ID_ASC',
  ParentBlockIdDesc = 'PARENT_BLOCK_ID_DESC',
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
  blockId: Scalars['Int'];
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
};

/** A filter to be used against `Extrinsic` object types. All fields are combined with a logical ‘and.’ */
export type ExtrinsicFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Extrinsic` edge in the connection. */
export type ExtrinsicsEdge = {
  __typename?: 'ExtrinsicsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Extrinsic` at the end of the edge. */
  node?: Maybe<Extrinsic>;
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
};

/** A `FoundType` edge in the connection. */
export type FoundTypesEdge = {
  __typename?: 'FoundTypesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `FoundType` at the end of the edge. */
  node?: Maybe<FoundType>;
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
  blockId: Scalars['Int'];
  ticker: Scalars['String'];
  fundingName: Scalars['String'];
  value: Scalars['String'];
  totalIssuedInFundingRound: Scalars['String'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `Funding` object types. All fields are combined with a logical ‘and.’ */
export type FundingFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Funding` edge in the connection. */
export type FundingsEdge = {
  __typename?: 'FundingsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Funding` at the end of the edge. */
  node?: Maybe<Funding>;
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
};

/** A `HeldToken` edge in the connection. */
export type HeldTokensEdge = {
  __typename?: 'HeldTokensEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `HeldToken` at the end of the edge. */
  node?: Maybe<HeldToken>;
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
  blockId: Scalars['Int'];
  eventId: Scalars['String'];
  eventIdx: Scalars['Int'];
  eventDid: Scalars['String'];
  ticker: Scalars['String'];
  localId: Scalars['Int'];
  balance: Scalars['Int'];
  tax: Scalars['Int'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `HistoryOfPaymentEventsForCa` object types. All fields are combined with a logical ‘and.’ */
export type HistoryOfPaymentEventsForCaFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
  balance?: Maybe<IntFilter>;
  /** Filter by the object’s `tax` field. */
  tax?: Maybe<IntFilter>;
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
};

/** A `HistoryOfPaymentEventsForCa` edge in the connection. */
export type HistoryOfPaymentEventsForCasEdge = {
  __typename?: 'HistoryOfPaymentEventsForCasEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `HistoryOfPaymentEventsForCa` at the end of the edge. */
  node?: Maybe<HistoryOfPaymentEventsForCa>;
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

export type IdentityWithClaim = Node & {
  __typename?: 'IdentityWithClaim';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  scopeIndex: Scalars['JSON'];
  issuerIndex: Scalars['JSON'];
  typeIndex: Scalars['JSON'];
  maxExpiry: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
  /** Reads and enables pagination through a set of `IssuerIdentityWithClaim`. */
  issuerIdentityWithClaimsByClaimTargetDidIdAndIssuerId: IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyConnection;
};

export type IdentityWithClaimClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

export type IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IssuerIdentityWithClaimsOrderBy>>;
  filter?: Maybe<IssuerIdentityWithClaimFilter>;
};

/** A filter to be used against `IdentityWithClaim` object types. All fields are combined with a logical ‘and.’ */
export type IdentityWithClaimFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `scopeIndex` field. */
  scopeIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `issuerIndex` field. */
  issuerIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `typeIndex` field. */
  typeIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `maxExpiry` field. */
  maxExpiry?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<IdentityWithClaimFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<IdentityWithClaimFilter>>;
  /** Negates the expression. */
  not?: Maybe<IdentityWithClaimFilter>;
};

/** A connection to a list of `IssuerIdentityWithClaim` values, with data from `Claim`. */
export type IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyConnection = {
  __typename?: 'IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyConnection';
  /** A list of `IssuerIdentityWithClaim` objects. */
  nodes: Array<Maybe<IssuerIdentityWithClaim>>;
  /** A list of edges which contains the `IssuerIdentityWithClaim`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `IssuerIdentityWithClaim` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `IssuerIdentityWithClaim` edge in the connection, with data from `Claim`. */
export type IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyEdge = {
  __typename?: 'IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `IssuerIdentityWithClaim` at the end of the edge. */
  node?: Maybe<IssuerIdentityWithClaim>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
};

/** A `IssuerIdentityWithClaim` edge in the connection, with data from `Claim`. */
export type IdentityWithClaimIssuerIdentityWithClaimsByClaimTargetDidIdAndIssuerIdManyToManyEdgeClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `IdentityWithClaim` values. */
export type IdentityWithClaimsConnection = {
  __typename?: 'IdentityWithClaimsConnection';
  /** A list of `IdentityWithClaim` objects. */
  nodes: Array<Maybe<IdentityWithClaim>>;
  /** A list of edges which contains the `IdentityWithClaim` and cursor to aid in pagination. */
  edges: Array<IdentityWithClaimsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `IdentityWithClaim` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `IdentityWithClaim` edge in the connection. */
export type IdentityWithClaimsEdge = {
  __typename?: 'IdentityWithClaimsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `IdentityWithClaim` at the end of the edge. */
  node?: Maybe<IdentityWithClaim>;
};

/** Methods to use when ordering `IdentityWithClaim`. */
export enum IdentityWithClaimsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ScopeIndexAsc = 'SCOPE_INDEX_ASC',
  ScopeIndexDesc = 'SCOPE_INDEX_DESC',
  IssuerIndexAsc = 'ISSUER_INDEX_ASC',
  IssuerIndexDesc = 'ISSUER_INDEX_DESC',
  TypeIndexAsc = 'TYPE_INDEX_ASC',
  TypeIndexDesc = 'TYPE_INDEX_DESC',
  MaxExpiryAsc = 'MAX_EXPIRY_ASC',
  MaxExpiryDesc = 'MAX_EXPIRY_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Instruction = Node & {
  __typename?: 'Instruction';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['Int'];
  eventId: Scalars['String'];
  status: Scalars['String'];
  venueId: Scalars['String'];
  settlementType: Scalars['String'];
  legs: Scalars['JSON'];
  addresses: Scalars['JSON'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `Instruction` object types. All fields are combined with a logical ‘and.’ */
export type InstructionFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Instruction` edge in the connection. */
export type InstructionsEdge = {
  __typename?: 'InstructionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Instruction` at the end of the edge. */
  node?: Maybe<Instruction>;
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
  blockId: Scalars['Int'];
  investor: Scalars['String'];
  stoId: Scalars['Int'];
  offeringToken: Scalars['String'];
  raiseToken: Scalars['String'];
  offeringTokenAmount: Scalars['BigFloat'];
  raiseTokenAmount: Scalars['BigFloat'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `Investment` object types. All fields are combined with a logical ‘and.’ */
export type InvestmentFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Investment` edge in the connection. */
export type InvestmentsEdge = {
  __typename?: 'InvestmentsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Investment` at the end of the edge. */
  node?: Maybe<Investment>;
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

export type IssuerIdentityWithClaim = Node & {
  __typename?: 'IssuerIdentityWithClaim';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  scopeIndex: Scalars['JSON'];
  targetIndex: Scalars['JSON'];
  typeIndex: Scalars['JSON'];
  maxExpiry: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
  /** Reads and enables pagination through a set of `IdentityWithClaim`. */
  identityWithClaimsByClaimIssuerIdAndTargetDidId: IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyConnection;
};

export type IssuerIdentityWithClaimClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

export type IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentityWithClaimsOrderBy>>;
  filter?: Maybe<IdentityWithClaimFilter>;
};

/** A filter to be used against `IssuerIdentityWithClaim` object types. All fields are combined with a logical ‘and.’ */
export type IssuerIdentityWithClaimFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `scopeIndex` field. */
  scopeIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `targetIndex` field. */
  targetIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `typeIndex` field. */
  typeIndex?: Maybe<JsonFilter>;
  /** Filter by the object’s `maxExpiry` field. */
  maxExpiry?: Maybe<BigFloatFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: Maybe<DatetimeFilter>;
  /** Filter by the object’s `updatedAt` field. */
  updatedAt?: Maybe<DatetimeFilter>;
  /** Checks for all expressions in this list. */
  and?: Maybe<Array<IssuerIdentityWithClaimFilter>>;
  /** Checks for any expressions in this list. */
  or?: Maybe<Array<IssuerIdentityWithClaimFilter>>;
  /** Negates the expression. */
  not?: Maybe<IssuerIdentityWithClaimFilter>;
};

/** A connection to a list of `IdentityWithClaim` values, with data from `Claim`. */
export type IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyConnection = {
  __typename?: 'IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyConnection';
  /** A list of `IdentityWithClaim` objects. */
  nodes: Array<Maybe<IdentityWithClaim>>;
  /** A list of edges which contains the `IdentityWithClaim`, info from the `Claim`, and the cursor to aid in pagination. */
  edges: Array<IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `IdentityWithClaim` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `IdentityWithClaim` edge in the connection, with data from `Claim`. */
export type IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyEdge = {
  __typename?: 'IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `IdentityWithClaim` at the end of the edge. */
  node?: Maybe<IdentityWithClaim>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims: ClaimsConnection;
};

/** A `IdentityWithClaim` edge in the connection, with data from `Claim`. */
export type IssuerIdentityWithClaimIdentityWithClaimsByClaimIssuerIdAndTargetDidIdManyToManyEdgeClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<ClaimsOrderBy>>;
  filter?: Maybe<ClaimFilter>;
};

/** A connection to a list of `IssuerIdentityWithClaim` values. */
export type IssuerIdentityWithClaimsConnection = {
  __typename?: 'IssuerIdentityWithClaimsConnection';
  /** A list of `IssuerIdentityWithClaim` objects. */
  nodes: Array<Maybe<IssuerIdentityWithClaim>>;
  /** A list of edges which contains the `IssuerIdentityWithClaim` and cursor to aid in pagination. */
  edges: Array<IssuerIdentityWithClaimsEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `IssuerIdentityWithClaim` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `IssuerIdentityWithClaim` edge in the connection. */
export type IssuerIdentityWithClaimsEdge = {
  __typename?: 'IssuerIdentityWithClaimsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `IssuerIdentityWithClaim` at the end of the edge. */
  node?: Maybe<IssuerIdentityWithClaim>;
};

/** Methods to use when ordering `IssuerIdentityWithClaim`. */
export enum IssuerIdentityWithClaimsOrderBy {
  Natural = 'NATURAL',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ScopeIndexAsc = 'SCOPE_INDEX_ASC',
  ScopeIndexDesc = 'SCOPE_INDEX_DESC',
  TargetIndexAsc = 'TARGET_INDEX_ASC',
  TargetIndexDesc = 'TARGET_INDEX_DESC',
  TypeIndexAsc = 'TYPE_INDEX_ASC',
  TypeIndexDesc = 'TYPE_INDEX_DESC',
  MaxExpiryAsc = 'MAX_EXPIRY_ASC',
  MaxExpiryDesc = 'MAX_EXPIRY_DESC',
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

export type Proposal = Node & {
  __typename?: 'Proposal';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['Int'];
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
  /** Reads and enables pagination through a set of `ProposalVote`. */
  votes: ProposalVotesConnection;
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

/** A filter to be used against `Proposal` object types. All fields are combined with a logical ‘and.’ */
export type ProposalFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Proposal` edge in the connection. */
export type ProposalsEdge = {
  __typename?: 'ProposalsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Proposal` at the end of the edge. */
  node?: Maybe<Proposal>;
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
}

export type ProposalVote = Node & {
  __typename?: 'ProposalVote';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  proposalId: Scalars['String'];
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  account: Scalars['String'];
  vote: Scalars['Boolean'];
  weight: Scalars['BigFloat'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
  /** Reads a single `Proposal` that is related to this `ProposalVote`. */
  proposal?: Maybe<Proposal>;
};

/** A filter to be used against `ProposalVote` object types. All fields are combined with a logical ‘and.’ */
export type ProposalVoteFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `proposalId` field. */
  proposalId?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `ProposalVote` edge in the connection. */
export type ProposalVotesEdge = {
  __typename?: 'ProposalVotesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposalVote` at the end of the edge. */
  node?: Maybe<ProposalVote>;
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
  /** Reads and enables pagination through a set of `AgentGroupMembership`. */
  agentGroupMemberships?: Maybe<AgentGroupMembershipsConnection>;
  /** Reads and enables pagination through a set of `AgentGroup`. */
  agentGroups?: Maybe<AgentGroupsConnection>;
  /** Reads and enables pagination through a set of `Authorization`. */
  authorizations?: Maybe<AuthorizationsConnection>;
  /** Reads and enables pagination through a set of `Block`. */
  blocks?: Maybe<BlocksConnection>;
  /** Reads and enables pagination through a set of `ClaimScope`. */
  claimScopes?: Maybe<ClaimScopesConnection>;
  /** Reads and enables pagination through a set of `Claim`. */
  claims?: Maybe<ClaimsConnection>;
  /** Reads and enables pagination through a set of `DataBlock`. */
  dataBlocks?: Maybe<DataBlocksConnection>;
  /** Reads and enables pagination through a set of `DataEvent`. */
  dataEvents?: Maybe<DataEventsConnection>;
  /** Reads and enables pagination through a set of `DataExtrinsic`. */
  dataExtrinsics?: Maybe<DataExtrinsicsConnection>;
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
  /** Reads and enables pagination through a set of `IdentityWithClaim`. */
  identityWithClaims?: Maybe<IdentityWithClaimsConnection>;
  /** Reads and enables pagination through a set of `Instruction`. */
  instructions?: Maybe<InstructionsConnection>;
  /** Reads and enables pagination through a set of `Investment`. */
  investments?: Maybe<InvestmentsConnection>;
  /** Reads and enables pagination through a set of `IssuerIdentityWithClaim`. */
  issuerIdentityWithClaims?: Maybe<IssuerIdentityWithClaimsConnection>;
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
  agentGroupMembership?: Maybe<AgentGroupMembership>;
  agentGroup?: Maybe<AgentGroup>;
  authorization?: Maybe<Authorization>;
  block?: Maybe<Block>;
  claimScope?: Maybe<ClaimScope>;
  claim?: Maybe<Claim>;
  debug?: Maybe<Debug>;
  event?: Maybe<Event>;
  extrinsic?: Maybe<Extrinsic>;
  foundType?: Maybe<FoundType>;
  funding?: Maybe<Funding>;
  heldToken?: Maybe<HeldToken>;
  historyOfPaymentEventsForCa?: Maybe<HistoryOfPaymentEventsForCa>;
  identityWithClaim?: Maybe<IdentityWithClaim>;
  instruction?: Maybe<Instruction>;
  investment?: Maybe<Investment>;
  issuerIdentityWithClaim?: Maybe<IssuerIdentityWithClaim>;
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
  /** Reads a single `AgentGroupMembership` using its globally unique `ID`. */
  agentGroupMembershipByNodeId?: Maybe<AgentGroupMembership>;
  /** Reads a single `AgentGroup` using its globally unique `ID`. */
  agentGroupByNodeId?: Maybe<AgentGroup>;
  /** Reads a single `Authorization` using its globally unique `ID`. */
  authorizationByNodeId?: Maybe<Authorization>;
  /** Reads a single `Block` using its globally unique `ID`. */
  blockByNodeId?: Maybe<Block>;
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
  /** Reads a single `IdentityWithClaim` using its globally unique `ID`. */
  identityWithClaimByNodeId?: Maybe<IdentityWithClaim>;
  /** Reads a single `Instruction` using its globally unique `ID`. */
  instructionByNodeId?: Maybe<Instruction>;
  /** Reads a single `Investment` using its globally unique `ID`. */
  investmentByNodeId?: Maybe<Investment>;
  /** Reads a single `IssuerIdentityWithClaim` using its globally unique `ID`. */
  issuerIdentityWithClaimByNodeId?: Maybe<IssuerIdentityWithClaim>;
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
};

/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
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
export type QueryDataBlocksArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<DataBlocksOrderBy>>;
  filter?: Maybe<DataBlockFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryDataEventsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<DataEventsOrderBy>>;
  filter?: Maybe<DataEventFilter>;
};

/** The root query type which gives access points into the data universe. */
export type QueryDataExtrinsicsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<DataExtrinsicsOrderBy>>;
  filter?: Maybe<DataExtrinsicFilter>;
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
export type QueryIdentityWithClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IdentityWithClaimsOrderBy>>;
  filter?: Maybe<IdentityWithClaimFilter>;
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
export type QueryIssuerIdentityWithClaimsArgs = {
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  before?: Maybe<Scalars['Cursor']>;
  after?: Maybe<Scalars['Cursor']>;
  orderBy?: Maybe<Array<IssuerIdentityWithClaimsOrderBy>>;
  filter?: Maybe<IssuerIdentityWithClaimFilter>;
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
export type QueryAgentGroupMembershipArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupArgs = {
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
export type QueryIdentityWithClaimArgs = {
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
export type QueryIssuerIdentityWithClaimArgs = {
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
export type QueryAgentGroupMembershipByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAgentGroupByNodeIdArgs = {
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
export type QueryIdentityWithClaimByNodeIdArgs = {
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
export type QueryIssuerIdentityWithClaimByNodeIdArgs = {
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
  blockId: Scalars['Int'];
  addresses: Scalars['JSON'];
  result: Scalars['String'];
  legs: Scalars['JSON'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `Settlement` object types. All fields are combined with a logical ‘and.’ */
export type SettlementFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `Settlement` edge in the connection. */
export type SettlementsEdge = {
  __typename?: 'SettlementsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Settlement` at the end of the edge. */
  node?: Maybe<Settlement>;
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
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  stakingEventId: Scalars['String'];
  date: Scalars['Datetime'];
  identityId?: Maybe<Scalars['String']>;
  stashAccount?: Maybe<Scalars['String']>;
  amount?: Maybe<Scalars['BigFloat']>;
  nominatedValidators?: Maybe<Scalars['JSON']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `StakingEvent` object types. All fields are combined with a logical ‘and.’ */
export type StakingEventFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `StakingEvent` edge in the connection. */
export type StakingEventsEdge = {
  __typename?: 'StakingEventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `StakingEvent` at the end of the edge. */
  node?: Maybe<StakingEvent>;
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
};

/** A `Sto` edge in the connection. */
export type StosEdge = {
  __typename?: 'StosEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Sto` at the end of the edge. */
  node?: Maybe<Sto>;
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
  /**
   * Matches the specified pattern (case-sensitive). An underscore (_) matches any
   * single character; a percent sign (%) matches any sequence of zero or more characters.
   */
  like?: Maybe<Scalars['String']>;
  /**
   * Does not match the specified pattern (case-sensitive). An underscore (_)
   * matches any single character; a percent sign (%) matches any sequence of zero
   * or more characters.
   */
  notLike?: Maybe<Scalars['String']>;
  /**
   * Matches the specified pattern (case-insensitive). An underscore (_) matches
   * any single character; a percent sign (%) matches any sequence of zero or more characters.
   */
  likeInsensitive?: Maybe<Scalars['String']>;
  /**
   * Does not match the specified pattern (case-insensitive). An underscore (_)
   * matches any single character; a percent sign (%) matches any sequence of zero
   * or more characters.
   */
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
};

/** A `Subquery` edge in the connection. */
export type SubqueriesEdge = {
  __typename?: 'SubqueriesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Subquery` at the end of the edge. */
  node?: Maybe<Subquery>;
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

export type TickerExternalAgentAction = Node & {
  __typename?: 'TickerExternalAgentAction';
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  id: Scalars['String'];
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  ticker: Scalars['String'];
  palletName: Scalars['String'];
  eventId: Scalars['String'];
  callerDid: Scalars['String'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
};

/** A filter to be used against `TickerExternalAgentAction` object types. All fields are combined with a logical ‘and.’ */
export type TickerExternalAgentActionFilter = {
  /** Filter by the object’s `id` field. */
  id?: Maybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: Maybe<IntFilter>;
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
};

/** A `TickerExternalAgentAction` edge in the connection. */
export type TickerExternalAgentActionsEdge = {
  __typename?: 'TickerExternalAgentActionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentAction` at the end of the edge. */
  node?: Maybe<TickerExternalAgentAction>;
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
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  datetime: Scalars['Datetime'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
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
  blockId?: Maybe<IntFilter>;
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
};

/** A `TickerExternalAgentAdded` edge in the connection. */
export type TickerExternalAgentAddedsEdge = {
  __typename?: 'TickerExternalAgentAddedsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentAdded` at the end of the edge. */
  node?: Maybe<TickerExternalAgentAdded>;
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
};

/** A `TickerExternalAgentHistory` edge in the connection. */
export type TickerExternalAgentHistoriesEdge = {
  __typename?: 'TickerExternalAgentHistoriesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TickerExternalAgentHistory` at the end of the edge. */
  node?: Maybe<TickerExternalAgentHistory>;
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
  blockId: Scalars['Int'];
  eventIdx: Scalars['Int'];
  datetime: Scalars['Datetime'];
  type: Scalars['String'];
  permissions?: Maybe<Scalars['String']>;
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
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
  blockId?: Maybe<IntFilter>;
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
};

/** A `TrustedClaimIssuerTicker` edge in the connection. */
export type TrustedClaimIssuerTickersEdge = {
  __typename?: 'TrustedClaimIssuerTickersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `TrustedClaimIssuerTicker` at the end of the edge. */
  node?: Maybe<TrustedClaimIssuerTicker>;
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
  taxes: Scalars['Int'];
  createdAt: Scalars['Datetime'];
  updatedAt: Scalars['Datetime'];
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
  taxes?: Maybe<IntFilter>;
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
};

/** A `WithholdingTaxesOfCa` edge in the connection. */
export type WithholdingTaxesOfCasEdge = {
  __typename?: 'WithholdingTaxesOfCasEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `WithholdingTaxesOfCa` at the end of the edge. */
  node?: Maybe<WithholdingTaxesOfCa>;
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
