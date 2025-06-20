export type Connection<T> = {
  nodes: Array<Maybe<T>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
export type OneToManyFilter<T> = {
  every?: InputMaybe<T>;
  some?: InputMaybe<T>;
  none?: InputMaybe<T>;
};
export type Maybe<T> = T;
export type InputMaybe<T> = T;
export type Exact<
  T extends {
    [key: string]: unknown;
  }
> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends {
    [key: string]: unknown;
  },
  K extends keyof T
> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: {
    input: string;
    output: string;
  };
  String: {
    input: string;
    output: string;
  };
  Boolean: {
    input: boolean;
    output: boolean;
  };
  Int: {
    input: number;
    output: number;
  };
  Float: {
    input: number;
    output: number;
  };
  BigFloat: {
    input: any;
    output: any;
  };
  BigInt: {
    input: any;
    output: any;
  };
  Cursor: {
    input: any;
    output: any;
  };
  Date: {
    input: any;
    output: any;
  };
  Datetime: {
    input: any;
    output: any;
  };
  JSON: {
    input: any;
    output: any;
  };
};
export type Account = Node & {
  address: Scalars['String']['output'];
  blocksByMultiSigCreatorAccountIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigCreatorAccountIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  identitiesByMultiSigCreatorAccountIdAndCreatorId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  multiSigsByCreatorAccountId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  permissions?: Maybe<Permission>;
  permissionsId?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AccountFilter = {
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<AccountFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  multiSigsByCreatorAccountId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  not?: InputMaybe<AccountFilter>;
  or?: InputMaybe<Array<AccountFilter>>;
  permissions?: InputMaybe<PermissionFilter>;
  permissionsExists?: InputMaybe<Scalars['Boolean']['input']>;
  permissionsId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AccountHistoriesOrderBy {
  AccountAsc = 'ACCOUNT_ASC',
  AccountDesc = 'ACCOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdentityAsc = 'IDENTITY_ASC',
  IdentityDesc = 'IDENTITY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AccountHistory = Node & {
  account: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  identity: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  permissions?: Maybe<Scalars['JSON']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AccountHistoryFilter = {
  account?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<AccountHistoryFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<StringFilter>;
  not?: InputMaybe<AccountHistoryFilter>;
  or?: InputMaybe<Array<AccountHistoryFilter>>;
  permissions?: InputMaybe<JsonFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AccountsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsIdAsc = 'PERMISSIONS_ID_ASC',
  PermissionsIdDesc = 'PERMISSIONS_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AffirmStatusEnum {
  Affirmed = 'Affirmed',
  Rejected = 'Rejected',
}
export type AffirmStatusEnumFilter = {
  distinctFrom?: InputMaybe<AffirmStatusEnum>;
  equalTo?: InputMaybe<AffirmStatusEnum>;
  greaterThan?: InputMaybe<AffirmStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<AffirmStatusEnum>;
  in?: InputMaybe<Array<AffirmStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AffirmStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<AffirmStatusEnum>;
  notDistinctFrom?: InputMaybe<AffirmStatusEnum>;
  notEqualTo?: InputMaybe<AffirmStatusEnum>;
  notIn?: InputMaybe<Array<AffirmStatusEnum>>;
};
export enum AffirmingPartyEnum {
  Mediator = 'Mediator',
  Receiver = 'Receiver',
  Sender = 'Sender',
}
export type AffirmingPartyEnumFilter = {
  distinctFrom?: InputMaybe<AffirmingPartyEnum>;
  equalTo?: InputMaybe<AffirmingPartyEnum>;
  greaterThan?: InputMaybe<AffirmingPartyEnum>;
  greaterThanOrEqualTo?: InputMaybe<AffirmingPartyEnum>;
  in?: InputMaybe<Array<AffirmingPartyEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AffirmingPartyEnum>;
  lessThanOrEqualTo?: InputMaybe<AffirmingPartyEnum>;
  notDistinctFrom?: InputMaybe<AffirmingPartyEnum>;
  notEqualTo?: InputMaybe<AffirmingPartyEnum>;
  notIn?: InputMaybe<Array<AffirmingPartyEnum>>;
};
export type AgentGroup = Node & {
  blocksByAgentGroupMembershipGroupIdAndCreatedBlockId: Connection<Block>;
  blocksByAgentGroupMembershipGroupIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  members: Connection<AgentGroupMembership>;
  nodeId: Scalars['ID']['output'];
  permissions: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AgentGroupFilter = {
  and?: InputMaybe<Array<AgentGroupFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  members?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  not?: InputMaybe<AgentGroupFilter>;
  or?: InputMaybe<Array<AgentGroupFilter>>;
  permissions?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type AgentGroupMembership = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  group?: Maybe<AgentGroup>;
  groupId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  member: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AgentGroupMembershipFilter = {
  and?: InputMaybe<Array<AgentGroupMembershipFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  group?: InputMaybe<AgentGroupFilter>;
  groupId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  member?: InputMaybe<StringFilter>;
  not?: InputMaybe<AgentGroupMembershipFilter>;
  or?: InputMaybe<Array<AgentGroupMembershipFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AgentGroupMembershipsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  GroupIdAsc = 'GROUP_ID_ASC',
  GroupIdDesc = 'GROUP_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemberAsc = 'MEMBER_ASC',
  MemberDesc = 'MEMBER_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AgentGroupsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Asset = Node & {
  assetPreApprovals: Connection<AssetPreApproval>;
  assetTransactions: Connection<AssetTransaction>;
  assetsByDistributionAssetIdAndCurrencyId: Connection<Asset>;
  assetsByDistributionCurrencyIdAndAssetId: Connection<Asset>;
  blocksByAssetDocumentAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetDocumentAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetHolderAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetHolderAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetTransactionAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimScopeAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimScopeAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByComplianceAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByComplianceAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionCurrencyIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionCurrencyIdAndUpdatedBlockId: Connection<Block>;
  blocksByFundingAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByFundingAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByNftHolderAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByNftHolderAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioMovementAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioMovementAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByStatTypeAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByStatTypeAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoOfferingAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByStoOfferingAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferComplianceAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferComplianceExemptionAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceExemptionAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferManagerAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferManagerAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerAssetIdAndUpdatedBlockId: Connection<Block>;
  claimScopes: Connection<ClaimScope>;
  compliance: Connection<Compliance>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  customClaimTypesByStatTypeAssetIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  distributions: Connection<Distribution>;
  distributionsByCurrencyId: Connection<Distribution>;
  documents: Connection<AssetDocument>;
  eventIdx: Scalars['Int']['output'];
  eventsByAssetTransactionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByFundingAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentActionAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentHistoryAssetIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerAssetIdAndCreatedEventId: Connection<Event>;
  fundingRound?: Maybe<Scalars['String']['output']>;
  fundings: Connection<Funding>;
  holders: Connection<AssetHolder>;
  id: Scalars['String']['output'];
  identifiers: Scalars['JSON']['output'];
  identitiesByAssetHolderAssetIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorAssetIdAndAddedById: Connection<Identity>;
  identitiesByAssetPreApprovalAssetIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionAssetIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionCurrencyIdAndIdentityId: Connection<Identity>;
  identitiesByNftHolderAssetIdAndIdentityId: Connection<Identity>;
  identitiesByStatTypeAssetIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStoOfferingAssetIdAndCreatorId: Connection<Identity>;
  identitiesByTickerExternalAgentActionAssetIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentAssetIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentHistoryAssetIdAndIdentityId: Connection<Identity>;
  identitiesByTransferComplianceAssetIdAndClaimIssuerId: Connection<Identity>;
  instructionsByAssetTransactionAssetIdAndInstructionId: Connection<Instruction>;
  isCompliancePaused: Scalars['Boolean']['output'];
  isDivisible: Scalars['Boolean']['output'];
  isFrozen: Scalars['Boolean']['output'];
  isNftCollection: Scalars['Boolean']['output'];
  isUniquenessRequired: Scalars['Boolean']['output'];
  mandatoryMediators: Connection<AssetMandatoryMediator>;
  name?: Maybe<Scalars['String']['output']>;
  nftHolders: Connection<NftHolder>;
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Identity>;
  ownerId: Scalars['String']['output'];
  portfolioMovements: Connection<PortfolioMovement>;
  portfoliosByAssetTransactionAssetIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionAssetIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionAssetIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionCurrencyIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByPortfolioMovementAssetIdAndFromId: Connection<Portfolio>;
  portfoliosByPortfolioMovementAssetIdAndToId: Connection<Portfolio>;
  portfoliosByStoOfferingAssetIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoOfferingAssetIdAndRaisingPortfolioId: Connection<Portfolio>;
  statTypes: Connection<StatType>;
  statTypesByTransferComplianceAssetIdAndStatTypeId: Connection<StatType>;
  stosByOfferingAssetId: Connection<Sto>;
  ticker?: Maybe<Scalars['String']['output']>;
  tickerExternalAgentActions: Connection<TickerExternalAgentAction>;
  tickerExternalAgentHistories: Connection<TickerExternalAgentHistory>;
  tickerExternalAgents: Connection<TickerExternalAgent>;
  totalSupply: Scalars['BigFloat']['output'];
  totalTransfers: Scalars['BigFloat']['output'];
  transferComplianceExemptions: Connection<TransferComplianceExemption>;
  transferCompliances: Connection<TransferCompliance>;
  transferManagers: Connection<TransferManager>;
  trustedClaimIssuers: Connection<TrustedClaimIssuer>;
  type?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venuesByStoOfferingAssetIdAndVenueId: Connection<Venue>;
};
export type AssetDocument = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  contentHash?: Maybe<Scalars['JSON']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  documentId: Scalars['Int']['output'];
  filedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  type?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AssetDocumentFilter = {
  and?: InputMaybe<Array<AssetDocumentFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  contentHash?: InputMaybe<JsonFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  documentId?: InputMaybe<IntFilter>;
  filedAt?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  link?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetDocumentFilter>;
  or?: InputMaybe<Array<AssetDocumentFilter>>;
  type?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AssetDocumentsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ContentHashAsc = 'CONTENT_HASH_ASC',
  ContentHashDesc = 'CONTENT_HASH_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DocumentIdAsc = 'DOCUMENT_ID_ASC',
  DocumentIdDesc = 'DOCUMENT_ID_DESC',
  FiledAtAsc = 'FILED_AT_ASC',
  FiledAtDesc = 'FILED_AT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LinkAsc = 'LINK_ASC',
  LinkDesc = 'LINK_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetFilter = {
  and?: InputMaybe<Array<AssetFilter>>;
  assetPreApprovals?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetTransactions?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  claimScopes?: InputMaybe<OneToManyFilter<ClaimScopeFilter>>;
  compliance?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  distributionsByCurrencyId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  documents?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  eventIdx?: InputMaybe<IntFilter>;
  fundingRound?: InputMaybe<StringFilter>;
  fundings?: InputMaybe<OneToManyFilter<FundingFilter>>;
  holders?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  id?: InputMaybe<StringFilter>;
  identifiers?: InputMaybe<JsonFilter>;
  isCompliancePaused?: InputMaybe<BooleanFilter>;
  isDivisible?: InputMaybe<BooleanFilter>;
  isFrozen?: InputMaybe<BooleanFilter>;
  isNftCollection?: InputMaybe<BooleanFilter>;
  isUniquenessRequired?: InputMaybe<BooleanFilter>;
  mandatoryMediators?: InputMaybe<OneToManyFilter<AssetMandatoryMediatorFilter>>;
  name?: InputMaybe<StringFilter>;
  nftHolders?: InputMaybe<OneToManyFilter<NftHolderFilter>>;
  not?: InputMaybe<AssetFilter>;
  or?: InputMaybe<Array<AssetFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerId?: InputMaybe<StringFilter>;
  portfolioMovements?: InputMaybe<OneToManyFilter<PortfolioMovementFilter>>;
  statTypes?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  stosByOfferingAssetId?: InputMaybe<OneToManyFilter<StoFilter>>;
  ticker?: InputMaybe<StringFilter>;
  tickerExternalAgentActions?: InputMaybe<OneToManyFilter<TickerExternalAgentActionFilter>>;
  tickerExternalAgentHistories?: InputMaybe<OneToManyFilter<TickerExternalAgentHistoryFilter>>;
  tickerExternalAgents?: InputMaybe<OneToManyFilter<TickerExternalAgentFilter>>;
  totalSupply?: InputMaybe<BigFloatFilter>;
  totalTransfers?: InputMaybe<BigFloatFilter>;
  transferComplianceExemptions?: InputMaybe<OneToManyFilter<TransferComplianceExemptionFilter>>;
  transferCompliances?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  transferManagers?: InputMaybe<OneToManyFilter<TransferManagerFilter>>;
  trustedClaimIssuers?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  type?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type AssetHolder = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AssetHolderFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<AssetHolderFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetHolderFilter>;
  or?: InputMaybe<Array<AssetHolderFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AssetHoldersOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetMandatoryMediator = Node & {
  addedBy?: Maybe<Identity>;
  addedById: Scalars['String']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AssetMandatoryMediatorFilter = {
  addedBy?: InputMaybe<IdentityFilter>;
  addedById?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<AssetMandatoryMediatorFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetMandatoryMediatorFilter>;
  or?: InputMaybe<Array<AssetMandatoryMediatorFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AssetMandatoryMediatorsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetPreApproval = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AssetPreApprovalFilter = {
  and?: InputMaybe<Array<AssetPreApprovalFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<AssetPreApprovalFilter>;
  or?: InputMaybe<Array<AssetPreApprovalFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AssetPreApprovalsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type AssetTransaction = Node & {
  amount?: Maybe<Scalars['BigFloat']['output']>;
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId: EventIdEnum;
  eventIdx: Scalars['Int']['output'];
  extrinsicIdx?: Maybe<Scalars['Int']['output']>;
  fromPortfolio?: Maybe<Portfolio>;
  fromPortfolioId?: Maybe<Scalars['String']['output']>;
  fundingRound?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId?: Maybe<Scalars['String']['output']>;
  instructionMemo?: Maybe<Scalars['String']['output']>;
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  toPortfolio?: Maybe<Portfolio>;
  toPortfolioId?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AssetTransactionFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<AssetTransactionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  fromPortfolio?: InputMaybe<PortfolioFilter>;
  fromPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromPortfolioId?: InputMaybe<StringFilter>;
  fundingRound?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionExists?: InputMaybe<Scalars['Boolean']['input']>;
  instructionId?: InputMaybe<StringFilter>;
  instructionMemo?: InputMaybe<StringFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<AssetTransactionFilter>;
  or?: InputMaybe<Array<AssetTransactionFilter>>;
  toPortfolio?: InputMaybe<PortfolioFilter>;
  toPortfolioExists?: InputMaybe<Scalars['Boolean']['input']>;
  toPortfolioId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AssetTransactionsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  FromPortfolioIdAsc = 'FROM_PORTFOLIO_ID_ASC',
  FromPortfolioIdDesc = 'FROM_PORTFOLIO_ID_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  InstructionMemoAsc = 'INSTRUCTION_MEMO_ASC',
  InstructionMemoDesc = 'INSTRUCTION_MEMO_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ToPortfolioIdAsc = 'TO_PORTFOLIO_ID_ASC',
  ToPortfolioIdDesc = 'TO_PORTFOLIO_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AssetsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdentifiersAsc = 'IDENTIFIERS_ASC',
  IdentifiersDesc = 'IDENTIFIERS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsCompliancePausedAsc = 'IS_COMPLIANCE_PAUSED_ASC',
  IsCompliancePausedDesc = 'IS_COMPLIANCE_PAUSED_DESC',
  IsDivisibleAsc = 'IS_DIVISIBLE_ASC',
  IsDivisibleDesc = 'IS_DIVISIBLE_DESC',
  IsFrozenAsc = 'IS_FROZEN_ASC',
  IsFrozenDesc = 'IS_FROZEN_DESC',
  IsNftCollectionAsc = 'IS_NFT_COLLECTION_ASC',
  IsNftCollectionDesc = 'IS_NFT_COLLECTION_DESC',
  IsUniquenessRequiredAsc = 'IS_UNIQUENESS_REQUIRED_ASC',
  IsUniquenessRequiredDesc = 'IS_UNIQUENESS_REQUIRED_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  TotalTransfersAsc = 'TOTAL_TRANSFERS_ASC',
  TotalTransfersDesc = 'TOTAL_TRANSFERS_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum AuthTypeEnum {
  AddMultiSigSigner = 'AddMultiSigSigner',
  AddRelayerPayingKey = 'AddRelayerPayingKey',
  AttestPrimaryKeyRotation = 'AttestPrimaryKeyRotation',
  BecomeAgent = 'BecomeAgent',
  Custom = 'Custom',
  JoinIdentity = 'JoinIdentity',
  NoData = 'NoData',
  PortfolioCustody = 'PortfolioCustody',
  RotatePrimaryKey = 'RotatePrimaryKey',
  RotatePrimaryKeyToSecondary = 'RotatePrimaryKeyToSecondary',
  TransferAssetOwnership = 'TransferAssetOwnership',
  TransferPrimaryIssuanceAgent = 'TransferPrimaryIssuanceAgent',
  TransferTicker = 'TransferTicker',
}
export type AuthTypeEnumFilter = {
  distinctFrom?: InputMaybe<AuthTypeEnum>;
  equalTo?: InputMaybe<AuthTypeEnum>;
  greaterThan?: InputMaybe<AuthTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<AuthTypeEnum>;
  in?: InputMaybe<Array<AuthTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AuthTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<AuthTypeEnum>;
  notDistinctFrom?: InputMaybe<AuthTypeEnum>;
  notEqualTo?: InputMaybe<AuthTypeEnum>;
  notIn?: InputMaybe<Array<AuthTypeEnum>>;
};
export type Authorization = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  data?: Maybe<Scalars['String']['output']>;
  expiry?: Maybe<Scalars['Datetime']['output']>;
  from?: Maybe<Identity>;
  fromId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  status: AuthorizationStatusEnum;
  toId?: Maybe<Scalars['String']['output']>;
  toKey?: Maybe<Scalars['String']['output']>;
  type: AuthTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type AuthorizationFilter = {
  and?: InputMaybe<Array<AuthorizationFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  from?: InputMaybe<IdentityFilter>;
  fromId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<AuthorizationFilter>;
  or?: InputMaybe<Array<AuthorizationFilter>>;
  status?: InputMaybe<AuthorizationStatusEnumFilter>;
  toId?: InputMaybe<StringFilter>;
  toKey?: InputMaybe<StringFilter>;
  type?: InputMaybe<AuthTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum AuthorizationStatusEnum {
  Consumed = 'Consumed',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Revoked = 'Revoked',
}
export type AuthorizationStatusEnumFilter = {
  distinctFrom?: InputMaybe<AuthorizationStatusEnum>;
  equalTo?: InputMaybe<AuthorizationStatusEnum>;
  greaterThan?: InputMaybe<AuthorizationStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  in?: InputMaybe<Array<AuthorizationStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<AuthorizationStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  notDistinctFrom?: InputMaybe<AuthorizationStatusEnum>;
  notEqualTo?: InputMaybe<AuthorizationStatusEnum>;
  notIn?: InputMaybe<Array<AuthorizationStatusEnum>>;
};
export enum AuthorizationsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  ToKeyAsc = 'TO_KEY_ASC',
  ToKeyDesc = 'TO_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum BalanceTypeEnum {
  Bonded = 'Bonded',
  Free = 'Free',
  Locked = 'Locked',
  Reserved = 'Reserved',
  Unbonded = 'Unbonded',
}
export type BalanceTypeEnumFilter = {
  distinctFrom?: InputMaybe<BalanceTypeEnum>;
  equalTo?: InputMaybe<BalanceTypeEnum>;
  greaterThan?: InputMaybe<BalanceTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<BalanceTypeEnum>;
  in?: InputMaybe<Array<BalanceTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<BalanceTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<BalanceTypeEnum>;
  notDistinctFrom?: InputMaybe<BalanceTypeEnum>;
  notEqualTo?: InputMaybe<BalanceTypeEnum>;
  notIn?: InputMaybe<Array<BalanceTypeEnum>>;
};
export type BigFloatFilter = {
  distinctFrom?: InputMaybe<Scalars['BigFloat']['input']>;
  equalTo?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThan?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['BigFloat']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notIn?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};
export type BigIntFilter = {
  distinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  equalTo?: InputMaybe<Scalars['BigInt']['input']>;
  greaterThan?: InputMaybe<Scalars['BigInt']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['BigInt']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['BigInt']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigInt']['input']>;
  notIn?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};
export type Block = Node & {
  accountHistoriesByCreatedBlockId: Connection<AccountHistory>;
  accountHistoriesByUpdatedBlockId: Connection<AccountHistory>;
  accountsByCreatedBlockId: Connection<Account>;
  accountsByMultiSigCreatedBlockIdAndCreatorAccountId: Connection<Account>;
  accountsByMultiSigUpdatedBlockIdAndCreatorAccountId: Connection<Account>;
  accountsByUpdatedBlockId: Connection<Account>;
  agentGroupMembershipsByCreatedBlockId: Connection<AgentGroupMembership>;
  agentGroupMembershipsByUpdatedBlockId: Connection<AgentGroupMembership>;
  agentGroupsByAgentGroupMembershipCreatedBlockIdAndGroupId: Connection<AgentGroup>;
  agentGroupsByAgentGroupMembershipUpdatedBlockIdAndGroupId: Connection<AgentGroup>;
  agentGroupsByCreatedBlockId: Connection<AgentGroup>;
  agentGroupsByUpdatedBlockId: Connection<AgentGroup>;
  assetDocumentsByCreatedBlockId: Connection<AssetDocument>;
  assetDocumentsByUpdatedBlockId: Connection<AssetDocument>;
  assetHoldersByCreatedBlockId: Connection<AssetHolder>;
  assetHoldersByUpdatedBlockId: Connection<AssetHolder>;
  assetMandatoryMediatorsByCreatedBlockId: Connection<AssetMandatoryMediator>;
  assetMandatoryMediatorsByUpdatedBlockId: Connection<AssetMandatoryMediator>;
  assetPreApprovalsByCreatedBlockId: Connection<AssetPreApproval>;
  assetPreApprovalsByUpdatedBlockId: Connection<AssetPreApproval>;
  assetTransactionsByCreatedBlockId: Connection<AssetTransaction>;
  assetTransactionsByUpdatedBlockId: Connection<AssetTransaction>;
  assetsByAssetDocumentCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetDocumentUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetHolderCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetHolderUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByClaimScopeCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByClaimScopeUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByComplianceCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByComplianceUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByCreatedBlockId: Connection<Asset>;
  assetsByDistributionCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByDistributionCreatedBlockIdAndCurrencyId: Connection<Asset>;
  assetsByDistributionUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByDistributionUpdatedBlockIdAndCurrencyId: Connection<Asset>;
  assetsByFundingCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByFundingUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByNftHolderCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByNftHolderUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByPortfolioMovementCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByPortfolioMovementUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByStatTypeCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByStatTypeUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByStoCreatedBlockIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoUpdatedBlockIdAndOfferingAssetId: Connection<Asset>;
  assetsByTickerExternalAgentActionCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentActionUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentHistoryCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentHistoryUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceExemptionCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceExemptionUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferManagerCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTransferManagerUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerCreatedBlockIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerUpdatedBlockIdAndAssetId: Connection<Asset>;
  assetsByUpdatedBlockId: Connection<Asset>;
  authorizationsByCreatedBlockId: Connection<Authorization>;
  authorizationsByUpdatedBlockId: Connection<Authorization>;
  blockId: Scalars['Int']['output'];
  blocksByAccountCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAccountHistoryCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAccountHistoryUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAccountUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAgentGroupCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAgentGroupMembershipCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAgentGroupMembershipUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAgentGroupUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetDocumentCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetDocumentUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetHolderCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetHolderUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetTransactionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByAuthorizationCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByAuthorizationUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByBridgeEventCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByBridgeEventUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByChildIdentityCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByChildIdentityUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimScopeCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimScopeUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByComplianceCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByComplianceUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAccountCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAccountUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialLegCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialLegUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialVenueCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialVenueUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByCustomClaimTypeCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByCustomClaimTypeUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionPaymentCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionPaymentUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByFundingCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByFundingUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByIdentityCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByIdentityUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionEventCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionEventUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionPartyCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionPartyUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByInvestmentCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByInvestmentUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByLegCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByLegUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigAdminCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigAdminUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigSignerCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigSignerUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByNftHolderCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByNftHolderUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByOffChainReceiptCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByOffChainReceiptUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByPermissionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByPermissionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByPolyxTransactionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByPolyxTransactionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioMovementCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioMovementUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByProposalCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByProposalUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByProposalVoteCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByProposalVoteUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByStakingEventCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByStakingEventUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByStatTypeCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByStatTypeUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByStoCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferComplianceExemptionCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferComplianceExemptionUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferManagerCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferManagerUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  blocksByVenueCreatedBlockIdAndUpdatedBlockId: Connection<Block>;
  blocksByVenueUpdatedBlockIdAndCreatedBlockId: Connection<Block>;
  bridgeEventsByCreatedBlockId: Connection<BridgeEvent>;
  bridgeEventsByUpdatedBlockId: Connection<BridgeEvent>;
  childIdentitiesByCreatedBlockId: Connection<ChildIdentity>;
  childIdentitiesByUpdatedBlockId: Connection<ChildIdentity>;
  claimScopesByCreatedBlockId: Connection<ClaimScope>;
  claimScopesByUpdatedBlockId: Connection<ClaimScope>;
  claimsByCreatedBlockId: ClaimsConnection;
  claimsByUpdatedBlockId: ClaimsConnection;
  compliancesByCreatedBlockId: Connection<Compliance>;
  compliancesByUpdatedBlockId: Connection<Compliance>;
  confidentialAccountsByConfidentialAssetHistoryCreatedBlockIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryCreatedBlockIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryUpdatedBlockIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryUpdatedBlockIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHolderCreatedBlockIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHolderUpdatedBlockIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementCreatedBlockIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementCreatedBlockIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementUpdatedBlockIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementUpdatedBlockIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegCreatedBlockIdAndReceiverId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegCreatedBlockIdAndSenderId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegUpdatedBlockIdAndReceiverId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegUpdatedBlockIdAndSenderId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialTransactionAffirmationCreatedBlockIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialTransactionAffirmationUpdatedBlockIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByCreatedBlockId: Connection<ConfidentialAccount>;
  confidentialAccountsByUpdatedBlockId: Connection<ConfidentialAccount>;
  confidentialAssetHistoriesByCreatedBlockId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHistoriesByUpdatedBlockId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHoldersByCreatedBlockId: Connection<ConfidentialAssetHolder>;
  confidentialAssetHoldersByUpdatedBlockId: Connection<ConfidentialAssetHolder>;
  confidentialAssetMovementsByCreatedBlockId: Connection<ConfidentialAssetMovement>;
  confidentialAssetMovementsByUpdatedBlockId: Connection<ConfidentialAssetMovement>;
  confidentialAssetsByConfidentialAssetHistoryCreatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHistoryUpdatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHolderCreatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHolderUpdatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetMovementCreatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetMovementUpdatedBlockIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByCreatedBlockId: Connection<ConfidentialAsset>;
  confidentialAssetsByUpdatedBlockId: Connection<ConfidentialAsset>;
  confidentialLegsByCreatedBlockId: Connection<ConfidentialLeg>;
  confidentialLegsByUpdatedBlockId: Connection<ConfidentialLeg>;
  confidentialTransactionAffirmationsByCreatedBlockId: Connection<ConfidentialTransactionAffirmation>;
  confidentialTransactionAffirmationsByUpdatedBlockId: Connection<ConfidentialTransactionAffirmation>;
  confidentialTransactionsByConfidentialAssetHistoryCreatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialAssetHistoryUpdatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialLegCreatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialLegUpdatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialTransactionAffirmationCreatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialTransactionAffirmationUpdatedBlockIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByCreatedBlockId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByUpdatedBlockId: Connection<ConfidentialTransaction>;
  confidentialVenuesByConfidentialTransactionCreatedBlockIdAndVenueId: Connection<ConfidentialVenue>;
  confidentialVenuesByConfidentialTransactionUpdatedBlockIdAndVenueId: Connection<ConfidentialVenue>;
  confidentialVenuesByCreatedBlockId: Connection<ConfidentialVenue>;
  confidentialVenuesByUpdatedBlockId: Connection<ConfidentialVenue>;
  countEvents: Scalars['Int']['output'];
  countExtrinsics: Scalars['Int']['output'];
  countExtrinsicsError: Scalars['Int']['output'];
  countExtrinsicsSigned: Scalars['Int']['output'];
  countExtrinsicsSuccess: Scalars['Int']['output'];
  countExtrinsicsUnsigned: Scalars['Int']['output'];
  customClaimTypesByClaimCreatedBlockIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByClaimUpdatedBlockIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByCreatedBlockId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeCreatedBlockIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeUpdatedBlockIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByUpdatedBlockId: Connection<CustomClaimType>;
  datetime: Scalars['Datetime']['output'];
  distributionPaymentsByCreatedBlockId: Connection<DistributionPayment>;
  distributionPaymentsByUpdatedBlockId: Connection<DistributionPayment>;
  distributionsByCreatedBlockId: Connection<Distribution>;
  distributionsByDistributionPaymentCreatedBlockIdAndDistributionId: Connection<Distribution>;
  distributionsByDistributionPaymentUpdatedBlockIdAndDistributionId: Connection<Distribution>;
  distributionsByUpdatedBlockId: Connection<Distribution>;
  events: Connection<Event>;
  eventsByAssetCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByAssetUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByBridgeEventCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByBridgeEventUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByClaimCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByClaimUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHistoryCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHistoryUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHolderCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHolderUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetMovementCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetMovementUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionAffirmationCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionAffirmationUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialVenueCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialVenueUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionPaymentCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionPaymentUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByFundingCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByFundingUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionEventCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionEventUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalVoteUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentActionCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentActionUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentHistoryCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentHistoryUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerCreatedBlockIdAndCreatedEventId: Connection<Event>;
  eventsByTrustedClaimIssuerUpdatedBlockIdAndCreatedEventId: Connection<Event>;
  extrinsics: Connection<Extrinsic>;
  extrinsicsByEventBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByMultiSigProposalCreatedBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByMultiSigProposalUpdatedBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxTransactionCreatedBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsByPolyxTransactionUpdatedBlockIdAndExtrinsicId: Connection<Extrinsic>;
  extrinsicsRoot: Scalars['String']['output'];
  fundingsByCreatedBlockId: Connection<Funding>;
  fundingsByUpdatedBlockId: Connection<Funding>;
  hash: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identitiesByAccountCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAccountUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAssetCreatedBlockIdAndOwnerId: Connection<Identity>;
  identitiesByAssetHolderCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAssetHolderUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAssetMandatoryMediatorCreatedBlockIdAndAddedById: Connection<Identity>;
  identitiesByAssetMandatoryMediatorUpdatedBlockIdAndAddedById: Connection<Identity>;
  identitiesByAssetPreApprovalCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAssetPreApprovalUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByAssetUpdatedBlockIdAndOwnerId: Connection<Identity>;
  identitiesByAuthorizationCreatedBlockIdAndFromId: Connection<Identity>;
  identitiesByAuthorizationUpdatedBlockIdAndFromId: Connection<Identity>;
  identitiesByBridgeEventCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByBridgeEventUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByChildIdentityCreatedBlockIdAndChildId: Connection<Identity>;
  identitiesByChildIdentityCreatedBlockIdAndParentId: Connection<Identity>;
  identitiesByChildIdentityUpdatedBlockIdAndChildId: Connection<Identity>;
  identitiesByChildIdentityUpdatedBlockIdAndParentId: Connection<Identity>;
  identitiesByClaimCreatedBlockIdAndIssuerId: Connection<Identity>;
  identitiesByClaimCreatedBlockIdAndTargetId: Connection<Identity>;
  identitiesByClaimUpdatedBlockIdAndIssuerId: Connection<Identity>;
  identitiesByClaimUpdatedBlockIdAndTargetId: Connection<Identity>;
  identitiesByConfidentialAccountCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAccountUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAssetCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAssetUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialTransactionAffirmationCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByConfidentialTransactionAffirmationUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByConfidentialVenueCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialVenueUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByCreatedBlockId: Connection<Identity>;
  identitiesByCustomClaimTypeCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByCustomClaimTypeUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByDistributionPaymentCreatedBlockIdAndTargetId: Connection<Identity>;
  identitiesByDistributionPaymentUpdatedBlockIdAndTargetId: Connection<Identity>;
  identitiesByDistributionUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByInvestmentCreatedBlockIdAndInvestorId: Connection<Identity>;
  identitiesByInvestmentUpdatedBlockIdAndInvestorId: Connection<Identity>;
  identitiesByMultiSigCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigProposalCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigProposalUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByMultiSigUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByNftHolderCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByNftHolderUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioCreatedBlockIdAndCustodianId: Connection<Identity>;
  identitiesByPortfolioCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioUpdatedBlockIdAndCustodianId: Connection<Identity>;
  identitiesByPortfolioUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByProposalCreatedBlockIdAndOwnerId: Connection<Identity>;
  identitiesByProposalUpdatedBlockIdAndOwnerId: Connection<Identity>;
  identitiesByStakingEventCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByStakingEventUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByStatTypeCreatedBlockIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStatTypeUpdatedBlockIdAndClaimIssuerId: Connection<Identity>;
  identitiesByStoCreatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByStoUpdatedBlockIdAndCreatorId: Connection<Identity>;
  identitiesByTickerExternalAgentActionCreatedBlockIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentActionUpdatedBlockIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentCreatedBlockIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentHistoryCreatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByTickerExternalAgentHistoryUpdatedBlockIdAndIdentityId: Connection<Identity>;
  identitiesByTickerExternalAgentUpdatedBlockIdAndCallerId: Connection<Identity>;
  identitiesByTransferComplianceCreatedBlockIdAndClaimIssuerId: Connection<Identity>;
  identitiesByTransferComplianceUpdatedBlockIdAndClaimIssuerId: Connection<Identity>;
  identitiesByUpdatedBlockId: Connection<Identity>;
  identitiesByVenueCreatedBlockIdAndOwnerId: Connection<Identity>;
  identitiesByVenueUpdatedBlockIdAndOwnerId: Connection<Identity>;
  instructionAffirmationsByCreatedBlockId: Connection<InstructionAffirmation>;
  instructionAffirmationsByUpdatedBlockId: Connection<InstructionAffirmation>;
  instructionEventsByCreatedBlockId: Connection<InstructionEvent>;
  instructionEventsByUpdatedBlockId: Connection<InstructionEvent>;
  instructionPartiesByCreatedBlockId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationCreatedBlockIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByInstructionAffirmationUpdatedBlockIdAndPartyId: Connection<InstructionParty>;
  instructionPartiesByUpdatedBlockId: Connection<InstructionParty>;
  instructionsByAssetTransactionCreatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByAssetTransactionUpdatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByCreatedBlockId: Connection<Instruction>;
  instructionsByInstructionAffirmationCreatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionAffirmationUpdatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventCreatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventUpdatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionPartyCreatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionPartyUpdatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByLegCreatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByLegUpdatedBlockIdAndInstructionId: Connection<Instruction>;
  instructionsByUpdatedBlockId: Connection<Instruction>;
  investmentsByCreatedBlockId: Connection<Investment>;
  investmentsByUpdatedBlockId: Connection<Investment>;
  legsByCreatedBlockId: Connection<Leg>;
  legsByOffChainReceiptCreatedBlockIdAndLegId: Connection<Leg>;
  legsByOffChainReceiptUpdatedBlockIdAndLegId: Connection<Leg>;
  legsByUpdatedBlockId: Connection<Leg>;
  multiSigAdminsByCreatedBlockId: Connection<MultiSigAdmin>;
  multiSigAdminsByUpdatedBlockId: Connection<MultiSigAdmin>;
  multiSigProposalVotesByCreatedBlockId: Connection<MultiSigProposalVote>;
  multiSigProposalVotesByUpdatedBlockId: Connection<MultiSigProposalVote>;
  multiSigProposalsByCreatedBlockId: Connection<MultiSigProposal>;
  multiSigProposalsByMultiSigProposalVoteCreatedBlockIdAndProposalId: Connection<MultiSigProposal>;
  multiSigProposalsByMultiSigProposalVoteUpdatedBlockIdAndProposalId: Connection<MultiSigProposal>;
  multiSigProposalsByUpdatedBlockId: Connection<MultiSigProposal>;
  multiSigSignersByCreatedBlockId: Connection<MultiSigSigner>;
  multiSigSignersByMultiSigProposalVoteCreatedBlockIdAndSignerId: Connection<MultiSigSigner>;
  multiSigSignersByMultiSigProposalVoteUpdatedBlockIdAndSignerId: Connection<MultiSigSigner>;
  multiSigSignersByUpdatedBlockId: Connection<MultiSigSigner>;
  multiSigsByCreatedBlockId: Connection<MultiSig>;
  multiSigsByMultiSigAdminCreatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigAdminUpdatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigProposalCreatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigProposalUpdatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigSignerCreatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByMultiSigSignerUpdatedBlockIdAndMultisigId: Connection<MultiSig>;
  multiSigsByUpdatedBlockId: Connection<MultiSig>;
  nftHoldersByCreatedBlockId: Connection<NftHolder>;
  nftHoldersByUpdatedBlockId: Connection<NftHolder>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByCreatedBlockId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationCreatedBlockIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionAffirmationUpdatedBlockIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventCreatedBlockIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventUpdatedBlockIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByUpdatedBlockId: Connection<OffChainReceipt>;
  parentHash: Scalars['String']['output'];
  parentId: Scalars['Int']['output'];
  permissionsByAccountCreatedBlockIdAndPermissionsId: Connection<Permission>;
  permissionsByAccountUpdatedBlockIdAndPermissionsId: Connection<Permission>;
  permissionsByCreatedBlockId: Connection<Permission>;
  permissionsByUpdatedBlockId: Connection<Permission>;
  polyxTransactionsByCreatedBlockId: Connection<PolyxTransaction>;
  polyxTransactionsByUpdatedBlockId: Connection<PolyxTransaction>;
  portfolioMovementsByCreatedBlockId: Connection<PortfolioMovement>;
  portfolioMovementsByUpdatedBlockId: Connection<PortfolioMovement>;
  portfoliosByAssetTransactionCreatedBlockIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionCreatedBlockIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionUpdatedBlockIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionUpdatedBlockIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByCreatedBlockId: Connection<Portfolio>;
  portfoliosByDistributionCreatedBlockIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByDistributionUpdatedBlockIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByPortfolioMovementCreatedBlockIdAndFromId: Connection<Portfolio>;
  portfoliosByPortfolioMovementCreatedBlockIdAndToId: Connection<Portfolio>;
  portfoliosByPortfolioMovementUpdatedBlockIdAndFromId: Connection<Portfolio>;
  portfoliosByPortfolioMovementUpdatedBlockIdAndToId: Connection<Portfolio>;
  portfoliosByStoCreatedBlockIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatedBlockIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByStoUpdatedBlockIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoUpdatedBlockIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByUpdatedBlockId: Connection<Portfolio>;
  proposalVotesByCreatedBlockId: Connection<ProposalVote>;
  proposalVotesByUpdatedBlockId: Connection<ProposalVote>;
  proposalsByCreatedBlockId: Connection<Proposal>;
  proposalsByProposalVoteCreatedBlockIdAndProposalId: Connection<Proposal>;
  proposalsByProposalVoteUpdatedBlockIdAndProposalId: Connection<Proposal>;
  proposalsByUpdatedBlockId: Connection<Proposal>;
  specVersionId: Scalars['Int']['output'];
  stakingEventsByCreatedBlockId: Connection<StakingEvent>;
  stakingEventsByUpdatedBlockId: Connection<StakingEvent>;
  statTypesByCreatedBlockId: Connection<StatType>;
  statTypesByTransferComplianceCreatedBlockIdAndStatTypeId: Connection<StatType>;
  statTypesByTransferComplianceUpdatedBlockIdAndStatTypeId: Connection<StatType>;
  statTypesByUpdatedBlockId: Connection<StatType>;
  stateRoot: Scalars['String']['output'];
  stosByCreatedBlockId: Connection<Sto>;
  stosByUpdatedBlockId: Connection<Sto>;
  tickerExternalAgentActionsByCreatedBlockId: Connection<TickerExternalAgentAction>;
  tickerExternalAgentActionsByUpdatedBlockId: Connection<TickerExternalAgentAction>;
  tickerExternalAgentHistoriesByCreatedBlockId: Connection<TickerExternalAgentHistory>;
  tickerExternalAgentHistoriesByUpdatedBlockId: Connection<TickerExternalAgentHistory>;
  tickerExternalAgentsByCreatedBlockId: Connection<TickerExternalAgent>;
  tickerExternalAgentsByUpdatedBlockId: Connection<TickerExternalAgent>;
  transferComplianceExemptionsByCreatedBlockId: Connection<TransferComplianceExemption>;
  transferComplianceExemptionsByUpdatedBlockId: Connection<TransferComplianceExemption>;
  transferCompliancesByCreatedBlockId: Connection<TransferCompliance>;
  transferCompliancesByUpdatedBlockId: Connection<TransferCompliance>;
  transferManagersByCreatedBlockId: Connection<TransferManager>;
  transferManagersByUpdatedBlockId: Connection<TransferManager>;
  trustedClaimIssuersByCreatedBlockId: Connection<TrustedClaimIssuer>;
  trustedClaimIssuersByUpdatedBlockId: Connection<TrustedClaimIssuer>;
  venuesByCreatedBlockId: Connection<Venue>;
  venuesByInstructionCreatedBlockIdAndVenueId: Connection<Venue>;
  venuesByInstructionUpdatedBlockIdAndVenueId: Connection<Venue>;
  venuesByStoCreatedBlockIdAndVenueId: Connection<Venue>;
  venuesByStoUpdatedBlockIdAndVenueId: Connection<Venue>;
  venuesByUpdatedBlockId: Connection<Venue>;
};
export type BlockFilter = {
  accountHistoriesByCreatedBlockId?: InputMaybe<OneToManyFilter<AccountHistoryFilter>>;
  accountHistoriesByUpdatedBlockId?: InputMaybe<OneToManyFilter<AccountHistoryFilter>>;
  accountsByCreatedBlockId?: InputMaybe<OneToManyFilter<AccountFilter>>;
  accountsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AccountFilter>>;
  agentGroupMembershipsByCreatedBlockId?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  agentGroupMembershipsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AgentGroupMembershipFilter>>;
  agentGroupsByCreatedBlockId?: InputMaybe<OneToManyFilter<AgentGroupFilter>>;
  agentGroupsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AgentGroupFilter>>;
  and?: InputMaybe<Array<BlockFilter>>;
  assetDocumentsByCreatedBlockId?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  assetDocumentsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AssetDocumentFilter>>;
  assetHoldersByCreatedBlockId?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  assetHoldersByUpdatedBlockId?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  assetMandatoryMediatorsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<AssetMandatoryMediatorFilter>
  >;
  assetMandatoryMediatorsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<AssetMandatoryMediatorFilter>
  >;
  assetPreApprovalsByCreatedBlockId?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetPreApprovalsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetTransactionsByCreatedBlockId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  assetTransactionsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  assetsByCreatedBlockId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  assetsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  authorizationsByCreatedBlockId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  authorizationsByUpdatedBlockId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  blockId?: InputMaybe<IntFilter>;
  bridgeEventsByCreatedBlockId?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  bridgeEventsByUpdatedBlockId?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  childIdentitiesByCreatedBlockId?: InputMaybe<OneToManyFilter<ChildIdentityFilter>>;
  childIdentitiesByUpdatedBlockId?: InputMaybe<OneToManyFilter<ChildIdentityFilter>>;
  claimScopesByCreatedBlockId?: InputMaybe<OneToManyFilter<ClaimScopeFilter>>;
  claimScopesByUpdatedBlockId?: InputMaybe<OneToManyFilter<ClaimScopeFilter>>;
  claimsByCreatedBlockId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  claimsByUpdatedBlockId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  compliancesByCreatedBlockId?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  compliancesByUpdatedBlockId?: InputMaybe<OneToManyFilter<ComplianceFilter>>;
  confidentialAccountsByCreatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAccountsByUpdatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAssetHistoriesByCreatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHistoryFilter>
  >;
  confidentialAssetHistoriesByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHistoryFilter>
  >;
  confidentialAssetHoldersByCreatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHolderFilter>
  >;
  confidentialAssetHoldersByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHolderFilter>
  >;
  confidentialAssetMovementsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetMovementFilter>
  >;
  confidentialAssetMovementsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetMovementFilter>
  >;
  confidentialAssetsByCreatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialAssetsByUpdatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialLegsByCreatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialLegsByUpdatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialTransactionAffirmationsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionAffirmationFilter>
  >;
  confidentialTransactionAffirmationsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionAffirmationFilter>
  >;
  confidentialTransactionsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionFilter>
  >;
  confidentialTransactionsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionFilter>
  >;
  confidentialVenuesByCreatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialVenueFilter>>;
  confidentialVenuesByUpdatedBlockId?: InputMaybe<OneToManyFilter<ConfidentialVenueFilter>>;
  countEvents?: InputMaybe<IntFilter>;
  countExtrinsics?: InputMaybe<IntFilter>;
  countExtrinsicsError?: InputMaybe<IntFilter>;
  countExtrinsicsSigned?: InputMaybe<IntFilter>;
  countExtrinsicsSuccess?: InputMaybe<IntFilter>;
  countExtrinsicsUnsigned?: InputMaybe<IntFilter>;
  customClaimTypesByCreatedBlockId?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  customClaimTypesByUpdatedBlockId?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  datetime?: InputMaybe<DatetimeFilter>;
  distributionPaymentsByCreatedBlockId?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  distributionPaymentsByUpdatedBlockId?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  distributionsByCreatedBlockId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  distributionsByUpdatedBlockId?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  events?: InputMaybe<OneToManyFilter<EventFilter>>;
  extrinsics?: InputMaybe<OneToManyFilter<ExtrinsicFilter>>;
  extrinsicsRoot?: InputMaybe<StringFilter>;
  fundingsByCreatedBlockId?: InputMaybe<OneToManyFilter<FundingFilter>>;
  fundingsByUpdatedBlockId?: InputMaybe<OneToManyFilter<FundingFilter>>;
  hash?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identitiesByCreatedBlockId?: InputMaybe<OneToManyFilter<IdentityFilter>>;
  identitiesByUpdatedBlockId?: InputMaybe<OneToManyFilter<IdentityFilter>>;
  instructionAffirmationsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<InstructionAffirmationFilter>
  >;
  instructionAffirmationsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<InstructionAffirmationFilter>
  >;
  instructionEventsByCreatedBlockId?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionEventsByUpdatedBlockId?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionPartiesByCreatedBlockId?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  instructionPartiesByUpdatedBlockId?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  instructionsByCreatedBlockId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  instructionsByUpdatedBlockId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  investmentsByCreatedBlockId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  investmentsByUpdatedBlockId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  legsByCreatedBlockId?: InputMaybe<OneToManyFilter<LegFilter>>;
  legsByUpdatedBlockId?: InputMaybe<OneToManyFilter<LegFilter>>;
  multiSigAdminsByCreatedBlockId?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  multiSigAdminsByUpdatedBlockId?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  multiSigProposalVotesByCreatedBlockId?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
  multiSigProposalVotesByUpdatedBlockId?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
  multiSigProposalsByCreatedBlockId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigProposalsByUpdatedBlockId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigSignersByCreatedBlockId?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  multiSigSignersByUpdatedBlockId?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  multiSigsByCreatedBlockId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  multiSigsByUpdatedBlockId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  nftHoldersByCreatedBlockId?: InputMaybe<OneToManyFilter<NftHolderFilter>>;
  nftHoldersByUpdatedBlockId?: InputMaybe<OneToManyFilter<NftHolderFilter>>;
  not?: InputMaybe<BlockFilter>;
  offChainReceiptsByCreatedBlockId?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  offChainReceiptsByUpdatedBlockId?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  or?: InputMaybe<Array<BlockFilter>>;
  parentHash?: InputMaybe<StringFilter>;
  parentId?: InputMaybe<IntFilter>;
  permissionsByCreatedBlockId?: InputMaybe<OneToManyFilter<PermissionFilter>>;
  permissionsByUpdatedBlockId?: InputMaybe<OneToManyFilter<PermissionFilter>>;
  polyxTransactionsByCreatedBlockId?: InputMaybe<OneToManyFilter<PolyxTransactionFilter>>;
  polyxTransactionsByUpdatedBlockId?: InputMaybe<OneToManyFilter<PolyxTransactionFilter>>;
  portfolioMovementsByCreatedBlockId?: InputMaybe<OneToManyFilter<PortfolioMovementFilter>>;
  portfolioMovementsByUpdatedBlockId?: InputMaybe<OneToManyFilter<PortfolioMovementFilter>>;
  portfoliosByCreatedBlockId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  portfoliosByUpdatedBlockId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  proposalVotesByCreatedBlockId?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
  proposalVotesByUpdatedBlockId?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
  proposalsByCreatedBlockId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  proposalsByUpdatedBlockId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  specVersionId?: InputMaybe<IntFilter>;
  stakingEventsByCreatedBlockId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  stakingEventsByUpdatedBlockId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  statTypesByCreatedBlockId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  statTypesByUpdatedBlockId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  stateRoot?: InputMaybe<StringFilter>;
  stosByCreatedBlockId?: InputMaybe<OneToManyFilter<StoFilter>>;
  stosByUpdatedBlockId?: InputMaybe<OneToManyFilter<StoFilter>>;
  tickerExternalAgentActionsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentActionFilter>
  >;
  tickerExternalAgentActionsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentActionFilter>
  >;
  tickerExternalAgentHistoriesByCreatedBlockId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentHistoryFilter>
  >;
  tickerExternalAgentHistoriesByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentHistoryFilter>
  >;
  tickerExternalAgentsByCreatedBlockId?: InputMaybe<OneToManyFilter<TickerExternalAgentFilter>>;
  tickerExternalAgentsByUpdatedBlockId?: InputMaybe<OneToManyFilter<TickerExternalAgentFilter>>;
  transferComplianceExemptionsByCreatedBlockId?: InputMaybe<
    OneToManyFilter<TransferComplianceExemptionFilter>
  >;
  transferComplianceExemptionsByUpdatedBlockId?: InputMaybe<
    OneToManyFilter<TransferComplianceExemptionFilter>
  >;
  transferCompliancesByCreatedBlockId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  transferCompliancesByUpdatedBlockId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  transferManagersByCreatedBlockId?: InputMaybe<OneToManyFilter<TransferManagerFilter>>;
  transferManagersByUpdatedBlockId?: InputMaybe<OneToManyFilter<TransferManagerFilter>>;
  trustedClaimIssuersByCreatedBlockId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  trustedClaimIssuersByUpdatedBlockId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
  venuesByCreatedBlockId?: InputMaybe<OneToManyFilter<VenueFilter>>;
  venuesByUpdatedBlockId?: InputMaybe<OneToManyFilter<VenueFilter>>;
};
export enum BlocksOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CountEventsAsc = 'COUNT_EVENTS_ASC',
  CountEventsDesc = 'COUNT_EVENTS_DESC',
  CountExtrinsicsAsc = 'COUNT_EXTRINSICS_ASC',
  CountExtrinsicsDesc = 'COUNT_EXTRINSICS_DESC',
  CountExtrinsicsErrorAsc = 'COUNT_EXTRINSICS_ERROR_ASC',
  CountExtrinsicsErrorDesc = 'COUNT_EXTRINSICS_ERROR_DESC',
  CountExtrinsicsSignedAsc = 'COUNT_EXTRINSICS_SIGNED_ASC',
  CountExtrinsicsSignedDesc = 'COUNT_EXTRINSICS_SIGNED_DESC',
  CountExtrinsicsSuccessAsc = 'COUNT_EXTRINSICS_SUCCESS_ASC',
  CountExtrinsicsSuccessDesc = 'COUNT_EXTRINSICS_SUCCESS_DESC',
  CountExtrinsicsUnsignedAsc = 'COUNT_EXTRINSICS_UNSIGNED_ASC',
  CountExtrinsicsUnsignedDesc = 'COUNT_EXTRINSICS_UNSIGNED_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  ExtrinsicsRootAsc = 'EXTRINSICS_ROOT_ASC',
  ExtrinsicsRootDesc = 'EXTRINSICS_ROOT_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  ParentHashAsc = 'PARENT_HASH_ASC',
  ParentHashDesc = 'PARENT_HASH_DESC',
  ParentIdAsc = 'PARENT_ID_ASC',
  ParentIdDesc = 'PARENT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  StateRootAsc = 'STATE_ROOT_ASC',
  StateRootDesc = 'STATE_ROOT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type BooleanFilter = {
  distinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  equalTo?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThan?: InputMaybe<Scalars['Boolean']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Boolean']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Boolean']['input']>;
  notEqualTo?: InputMaybe<Scalars['Boolean']['input']>;
  notIn?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};
export type BridgeEvent = Node & {
  amount: Scalars['BigFloat']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  recipient: Scalars['String']['output'];
  txHash: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type BridgeEventFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<BridgeEventFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<BridgeEventFilter>;
  or?: InputMaybe<Array<BridgeEventFilter>>;
  recipient?: InputMaybe<StringFilter>;
  txHash?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum BridgeEventsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RecipientAsc = 'RECIPIENT_ASC',
  RecipientDesc = 'RECIPIENT_DESC',
  TxHashAsc = 'TX_HASH_ASC',
  TxHashDesc = 'TX_HASH_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum CallIdEnum {
  Abdicate = 'abdicate',
  AbdicateMembership = 'abdicate_membership',
  AcceptAssetOwnershipTransfer = 'accept_asset_ownership_transfer',
  AcceptAuthorization = 'accept_authorization',
  AcceptBecomeAgent = 'accept_become_agent',
  AcceptMasterKey = 'accept_master_key',
  AcceptMultisigSigner = 'accept_multisig_signer',
  AcceptMultisigSignerAsIdentity = 'accept_multisig_signer_as_identity',
  AcceptMultisigSignerAsKey = 'accept_multisig_signer_as_key',
  AcceptPayingKey = 'accept_paying_key',
  AcceptPortfolioCustody = 'accept_portfolio_custody',
  AcceptPrimaryIssuanceAgentTransfer = 'accept_primary_issuance_agent_transfer',
  AcceptPrimaryKey = 'accept_primary_key',
  AcceptTickerTransfer = 'accept_ticker_transfer',
  AddActiveRule = 'add_active_rule',
  AddAdmin = 'add_admin',
  AddAndAffirmInstruction = 'add_and_affirm_instruction',
  AddAndAffirmInstructionWithMemo = 'add_and_affirm_instruction_with_memo',
  AddAndAffirmInstructionWithMemoV2 = 'add_and_affirm_instruction_with_memo_v2',
  AddAndAffirmWithMediators = 'add_and_affirm_with_mediators',
  AddAndAuthorizeInstruction = 'add_and_authorize_instruction',
  AddAuthorization = 'add_authorization',
  AddBallot = 'add_ballot',
  AddClaim = 'add_claim',
  AddComplianceRequirement = 'add_compliance_requirement',
  AddDefaultTrustedClaimIssuer = 'add_default_trusted_claim_issuer',
  AddDocuments = 'add_documents',
  AddExemptedEntities = 'add_exempted_entities',
  AddExtension = 'add_extension',
  AddFreezeAdmin = 'add_freeze_admin',
  AddInstruction = 'add_instruction',
  AddInstructionWithMediators = 'add_instruction_with_mediators',
  AddInstructionWithMemo = 'add_instruction_with_memo',
  AddInstructionWithMemoV2 = 'add_instruction_with_memo_v2',
  AddInvestorUniquenessClaim = 'add_investor_uniqueness_claim',
  AddInvestorUniquenessClaimV2 = 'add_investor_uniqueness_claim_v2',
  AddMandatoryMediators = 'add_mandatory_mediators',
  AddMediatorAccount = 'add_mediator_account',
  AddMember = 'add_member',
  AddMultisigSigner = 'add_multisig_signer',
  AddMultisigSigners = 'add_multisig_signers',
  AddMultisigSignersViaAdmin = 'add_multisig_signers_via_admin',
  AddMultisigSignersViaCreator = 'add_multisig_signers_via_creator',
  AddPermissionedValidator = 'add_permissioned_validator',
  AddRangeProof = 'add_range_proof',
  AddSecondaryKeysWithAuthorization = 'add_secondary_keys_with_authorization',
  AddSecondaryKeysWithAuthorizationOld = 'add_secondary_keys_with_authorization_old',
  AddTransaction = 'add_transaction',
  AddTransferManager = 'add_transfer_manager',
  AddVerifyRangeProof = 'add_verify_range_proof',
  AffirmInstruction = 'affirm_instruction',
  AffirmInstructionAsMediator = 'affirm_instruction_as_mediator',
  AffirmInstructionV2 = 'affirm_instruction_v2',
  AffirmInstructionWithCount = 'affirm_instruction_with_count',
  AffirmTransactions = 'affirm_transactions',
  AffirmWithReceipts = 'affirm_with_receipts',
  AffirmWithReceiptsWithCount = 'affirm_with_receipts_with_count',
  AllowIdentityToCreatePortfolios = 'allow_identity_to_create_portfolios',
  AllowVenues = 'allow_venues',
  AmendProposal = 'amend_proposal',
  ApplyIncomingBalance = 'apply_incoming_balance',
  ApplyIncomingBalances = 'apply_incoming_balances',
  Approve = 'approve',
  ApproveAsIdentity = 'approve_as_identity',
  ApproveAsKey = 'approve_as_key',
  ApproveCommitteeProposal = 'approve_committee_proposal',
  ApproveJoinIdentity = 'approve_join_identity',
  ArchiveExtension = 'archive_extension',
  AsDerivative = 'as_derivative',
  AttachBallot = 'attach_ballot',
  AuthorizeInstruction = 'authorize_instruction',
  AuthorizeWithReceipts = 'authorize_with_receipts',
  Batch = 'batch',
  BatchAcceptAuthorization = 'batch_accept_authorization',
  BatchAddAuthorization = 'batch_add_authorization',
  BatchAddClaim = 'batch_add_claim',
  BatchAddDefaultTrustedClaimIssuer = 'batch_add_default_trusted_claim_issuer',
  BatchAddDocument = 'batch_add_document',
  BatchAddSecondaryKeyWithAuthorization = 'batch_add_secondary_key_with_authorization',
  BatchAddSigningKeyWithAuthorization = 'batch_add_signing_key_with_authorization',
  BatchAll = 'batch_all',
  BatchAtomic = 'batch_atomic',
  BatchChangeAssetRule = 'batch_change_asset_rule',
  BatchChangeComplianceRequirement = 'batch_change_compliance_requirement',
  BatchForceHandleBridgeTx = 'batch_force_handle_bridge_tx',
  BatchFreezeTx = 'batch_freeze_tx',
  BatchHandleBridgeTx = 'batch_handle_bridge_tx',
  BatchIssue = 'batch_issue',
  BatchOld = 'batch_old',
  BatchOptimistic = 'batch_optimistic',
  BatchProposeBridgeTx = 'batch_propose_bridge_tx',
  BatchRemoveAuthorization = 'batch_remove_authorization',
  BatchRemoveDefaultTrustedClaimIssuer = 'batch_remove_default_trusted_claim_issuer',
  BatchRemoveDocument = 'batch_remove_document',
  BatchRevokeClaim = 'batch_revoke_claim',
  BatchUnfreezeTx = 'batch_unfreeze_tx',
  BatchUpdateAssetStats = 'batch_update_asset_stats',
  Bond = 'bond',
  BondAdditionalDeposit = 'bond_additional_deposit',
  BondExtra = 'bond_extra',
  Burn = 'burn',
  BurnAccountBalance = 'burn_account_balance',
  BuyTokens = 'buy_tokens',
  Call = 'call',
  CallOldWeight = 'call_old_weight',
  Cancel = 'cancel',
  CancelBallot = 'cancel_ballot',
  CancelDeferredSlash = 'cancel_deferred_slash',
  CancelNamed = 'cancel_named',
  CancelProposal = 'cancel_proposal',
  CddRegisterDid = 'cdd_register_did',
  CddRegisterDidWithCdd = 'cdd_register_did_with_cdd',
  ChangeAdmin = 'change_admin',
  ChangeAllSignersAndSigsRequired = 'change_all_signers_and_sigs_required',
  ChangeAssetRule = 'change_asset_rule',
  ChangeBaseFee = 'change_base_fee',
  ChangeBridgeExempted = 'change_bridge_exempted',
  ChangeBridgeLimit = 'change_bridge_limit',
  ChangeCddRequirementForMkRotation = 'change_cdd_requirement_for_mk_rotation',
  ChangeCoefficient = 'change_coefficient',
  ChangeComplianceRequirement = 'change_compliance_requirement',
  ChangeController = 'change_controller',
  ChangeEnd = 'change_end',
  ChangeGroup = 'change_group',
  ChangeMeta = 'change_meta',
  ChangeRcv = 'change_rcv',
  ChangeReceiptValidity = 'change_receipt_validity',
  ChangeRecordDate = 'change_record_date',
  ChangeSigsRequired = 'change_sigs_required',
  ChangeSigsRequiredViaAdmin = 'change_sigs_required_via_admin',
  ChangeSigsRequiredViaCreator = 'change_sigs_required_via_creator',
  ChangeSlashingAllowedFor = 'change_slashing_allowed_for',
  ChangeTemplateFees = 'change_template_fees',
  ChangeTemplateMetaUrl = 'change_template_meta_url',
  ChangeTimelock = 'change_timelock',
  Chill = 'chill',
  ChillFromGovernance = 'chill_from_governance',
  ChillOther = 'chill_other',
  Claim = 'claim',
  ClaimClassicTicker = 'claim_classic_ticker',
  ClaimItnReward = 'claim_itn_reward',
  ClaimReceipt = 'claim_receipt',
  ClaimSurcharge = 'claim_surcharge',
  ClaimUnclaimed = 'claim_unclaimed',
  ClearSnapshot = 'clear_snapshot',
  Close = 'close',
  ContinueMigrate = 'continue_migrate',
  ControlAutoMigration = 'control_auto_migration',
  ControllerRedeem = 'controller_redeem',
  ControllerTransfer = 'controller_transfer',
  CreateAccount = 'create_account',
  CreateAndChangeCustomGroup = 'create_and_change_custom_group',
  CreateAsset = 'create_asset',
  CreateAssetAndMint = 'create_asset_and_mint',
  CreateAssetWithCustomType = 'create_asset_with_custom_type',
  CreateCheckpoint = 'create_checkpoint',
  CreateChildIdentities = 'create_child_identities',
  CreateChildIdentity = 'create_child_identity',
  CreateCustodyPortfolio = 'create_custody_portfolio',
  CreateFundraiser = 'create_fundraiser',
  CreateGroup = 'create_group',
  CreateGroupAndAddAuth = 'create_group_and_add_auth',
  CreateMultisig = 'create_multisig',
  CreateNftCollection = 'create_nft_collection',
  CreateOrApproveProposalAsIdentity = 'create_or_approve_proposal_as_identity',
  CreateOrApproveProposalAsKey = 'create_or_approve_proposal_as_key',
  CreatePortfolio = 'create_portfolio',
  CreateProposal = 'create_proposal',
  CreateProposalAsIdentity = 'create_proposal_as_identity',
  CreateProposalAsKey = 'create_proposal_as_key',
  CreateSchedule = 'create_schedule',
  CreateVenue = 'create_venue',
  DecreasePolyxLimit = 'decrease_polyx_limit',
  DeletePortfolio = 'delete_portfolio',
  DepositBlockRewardReserveBalance = 'deposit_block_reward_reserve_balance',
  DisableMember = 'disable_member',
  DisallowVenues = 'disallow_venues',
  Disbursement = 'disbursement',
  DispatchAs = 'dispatch_as',
  Distribute = 'distribute',
  EmergencyReferendum = 'emergency_referendum',
  EnableIndividualCommissions = 'enable_individual_commissions',
  EnableOffchainFunding = 'enable_offchain_funding',
  EnactReferendum = 'enact_referendum',
  EnactSnapshotResults = 'enact_snapshot_results',
  ExecuteManualInstruction = 'execute_manual_instruction',
  ExecuteScheduledInstruction = 'execute_scheduled_instruction',
  ExecuteScheduledInstructionV2 = 'execute_scheduled_instruction_v2',
  ExecuteScheduledInstructionV3 = 'execute_scheduled_instruction_v3',
  ExecuteScheduledPip = 'execute_scheduled_pip',
  ExecuteScheduledProposal = 'execute_scheduled_proposal',
  ExecuteTransaction = 'execute_transaction',
  ExemptAssetAffirmation = 'exempt_asset_affirmation',
  ExemptTickerAffirmation = 'exempt_ticker_affirmation',
  ExpireScheduledPip = 'expire_scheduled_pip',
  FastTrackProposal = 'fast_track_proposal',
  FillBlock = 'fill_block',
  FinalHint = 'final_hint',
  ForceApplyMinCommission = 'force_apply_min_commission',
  ForceBatch = 'force_batch',
  ForceHandleBridgeTx = 'force_handle_bridge_tx',
  ForceNewEra = 'force_new_era',
  ForceNewEraAlways = 'force_new_era_always',
  ForceNoEras = 'force_no_eras',
  ForceSetProgress = 'force_set_progress',
  ForceTransfer = 'force_transfer',
  ForceUnstake = 'force_unstake',
  ForwardedCall = 'forwarded_call',
  Free = 'free',
  Freeze = 'freeze',
  FreezeFundraiser = 'freeze_fundraiser',
  FreezeInstantiation = 'freeze_instantiation',
  FreezeSecondaryKeys = 'freeze_secondary_keys',
  FreezeSigningKeys = 'freeze_signing_keys',
  FreezeTxs = 'freeze_txs',
  GcAddCddClaim = 'gc_add_cdd_claim',
  GcRevokeCddClaim = 'gc_revoke_cdd_claim',
  GetCddOf = 'get_cdd_of',
  GetMyDid = 'get_my_did',
  GovernanceFallback = 'governance_fallback',
  HandleBridgeTx = 'handle_bridge_tx',
  HandleScheduledBridgeTx = 'handle_scheduled_bridge_tx',
  Heartbeat = 'heartbeat',
  IncreaseCustodyAllowance = 'increase_custody_allowance',
  IncreaseCustodyAllowanceOf = 'increase_custody_allowance_of',
  IncreasePolyxLimit = 'increase_polyx_limit',
  IncreaseValidatorCount = 'increase_validator_count',
  InitiateCorporateAction = 'initiate_corporate_action',
  InitiateCorporateActionAndBallot = 'initiate_corporate_action_and_ballot',
  InitiateCorporateActionAndDistribute = 'initiate_corporate_action_and_distribute',
  Instantiate = 'instantiate',
  InstantiateOldWeight = 'instantiate_old_weight',
  InstantiateWithCode = 'instantiate_with_code',
  InstantiateWithCodeAsPrimaryKey = 'instantiate_with_code_as_primary_key',
  InstantiateWithCodeOldWeight = 'instantiate_with_code_old_weight',
  InstantiateWithCodePerms = 'instantiate_with_code_perms',
  InstantiateWithHashAsPrimaryKey = 'instantiate_with_hash_as_primary_key',
  InstantiateWithHashPerms = 'instantiate_with_hash_perms',
  InvalidateCddClaims = 'invalidate_cdd_claims',
  Invest = 'invest',
  IsIssuable = 'is_issuable',
  Issue = 'issue',
  IssueNft = 'issue_nft',
  JoinIdentity = 'join_identity',
  JoinIdentityAsIdentity = 'join_identity_as_identity',
  JoinIdentityAsKey = 'join_identity_as_key',
  Kick = 'kick',
  KillPrefix = 'kill_prefix',
  KillProposal = 'kill_proposal',
  KillStorage = 'kill_storage',
  LaunchSto = 'launch_sto',
  LeaveIdentityAsIdentity = 'leave_identity_as_identity',
  LeaveIdentityAsKey = 'leave_identity_as_key',
  LegacySetPermissionToSigner = 'legacy_set_permission_to_signer',
  LinkCaDoc = 'link_ca_doc',
  LinkTickerToAssetId = 'link_ticker_to_asset_id',
  LockInstruction = 'lock_instruction',
  MakeDivisible = 'make_divisible',
  MakeMultisigPrimary = 'make_multisig_primary',
  MakeMultisigSecondary = 'make_multisig_secondary',
  MakeMultisigSigner = 'make_multisig_signer',
  MediatorAffirmTransaction = 'mediator_affirm_transaction',
  MediatorUnaffirmTransaction = 'mediator_unaffirm_transaction',
  MigrateCustomChild = 'migrate_custom_child',
  MigrateCustomTop = 'migrate_custom_top',
  Mint = 'mint',
  MockCddRegisterDid = 'mock_cdd_register_did',
  ModifyExemptionList = 'modify_exemption_list',
  ModifyFundraiserWindow = 'modify_fundraiser_window',
  MoveAssets = 'move_assets',
  MovePortfolioFunds = 'move_portfolio_funds',
  MovePortfolioFundsV2 = 'move_portfolio_funds_v2',
  New = 'new',
  Nominate = 'nominate',
  NotePreimage = 'note_preimage',
  NoteStalled = 'note_stalled',
  OverrideReferendumEnactmentPeriod = 'override_referendum_enactment_period',
  PauseAssetCompliance = 'pause_asset_compliance',
  PauseAssetRules = 'pause_asset_rules',
  PauseSto = 'pause_sto',
  PayoutStakers = 'payout_stakers',
  PayoutStakersBySystem = 'payout_stakers_by_system',
  PlaceholderAddAndAffirmInstruction = 'placeholder_add_and_affirm_instruction',
  PlaceholderAddAndAffirmInstructionWithMemo = 'placeholder_add_and_affirm_instruction_with_memo',
  PlaceholderAddInstruction = 'placeholder_add_instruction',
  PlaceholderAddInstructionWithMemo = 'placeholder_add_instruction_with_memo',
  PlaceholderAffirmInstruction = 'placeholder_affirm_instruction',
  PlaceholderClaimReceipt = 'placeholder_claim_receipt',
  PlaceholderFillBlock = 'placeholder_fill_block',
  PlaceholderLegacySetPermissionToSigner = 'placeholder_legacy_set_permission_to_signer',
  PlaceholderRejectInstruction = 'placeholder_reject_instruction',
  PlaceholderUnclaimReceipt = 'placeholder_unclaim_receipt',
  PlaceholderWithdrawAffirmation = 'placeholder_withdraw_affirmation',
  PlanConfigChange = 'plan_config_change',
  PreApproveAsset = 'pre_approve_asset',
  PreApprovePortfolio = 'pre_approve_portfolio',
  PreApproveTicker = 'pre_approve_ticker',
  Propose = 'propose',
  ProposeBridgeTx = 'propose_bridge_tx',
  PruneProposal = 'prune_proposal',
  PurgeKeys = 'purge_keys',
  PushBenefit = 'push_benefit',
  PutCode = 'put_code',
  QuitPortfolioCustody = 'quit_portfolio_custody',
  ReapStash = 'reap_stash',
  Rebond = 'rebond',
  ReceiverAffirmTransaction = 'receiver_affirm_transaction',
  ReceiverUnaffirmTransaction = 'receiver_unaffirm_transaction',
  Reclaim = 'reclaim',
  Redeem = 'redeem',
  RedeemFrom = 'redeem_from',
  RedeemFromPortfolio = 'redeem_from_portfolio',
  RedeemNft = 'redeem_nft',
  RegisterAndSetLocalAssetMetadata = 'register_and_set_local_asset_metadata',
  RegisterAssetMetadataGlobalType = 'register_asset_metadata_global_type',
  RegisterAssetMetadataLocalType = 'register_asset_metadata_local_type',
  RegisterCustomAssetType = 'register_custom_asset_type',
  RegisterCustomClaimType = 'register_custom_claim_type',
  RegisterDid = 'register_did',
  RegisterTicker = 'register_ticker',
  RegisterUniqueTicker = 'register_unique_ticker',
  Reimbursement = 'reimbursement',
  Reject = 'reject',
  RejectAsIdentity = 'reject_as_identity',
  RejectAsKey = 'reject_as_key',
  RejectInstruction = 'reject_instruction',
  RejectInstructionAsMediator = 'reject_instruction_as_mediator',
  RejectInstructionV2 = 'reject_instruction_v2',
  RejectInstructionWithCount = 'reject_instruction_with_count',
  RejectProposal = 'reject_proposal',
  RejectReferendum = 'reject_referendum',
  RejectTransaction = 'reject_transaction',
  RelayTx = 'relay_tx',
  Remark = 'remark',
  RemarkWithEvent = 'remark_with_event',
  RemoveActiveRule = 'remove_active_rule',
  RemoveAdmin = 'remove_admin',
  RemoveAdminViaAdmin = 'remove_admin_via_admin',
  RemoveAgent = 'remove_agent',
  RemoveAssetAffirmationExemption = 'remove_asset_affirmation_exemption',
  RemoveAssetPreApproval = 'remove_asset_pre_approval',
  RemoveAuthorization = 'remove_authorization',
  RemoveBallot = 'remove_ballot',
  RemoveCa = 'remove_ca',
  RemoveCode = 'remove_code',
  RemoveComplianceRequirement = 'remove_compliance_requirement',
  RemoveCreatorControls = 'remove_creator_controls',
  RemoveDefaultTrustedClaimIssuer = 'remove_default_trusted_claim_issuer',
  RemoveDistribution = 'remove_distribution',
  RemoveDocuments = 'remove_documents',
  RemoveExemptedEntities = 'remove_exempted_entities',
  RemoveFreezeAdmin = 'remove_freeze_admin',
  RemoveLocalMetadataKey = 'remove_local_metadata_key',
  RemoveMandatoryMediators = 'remove_mandatory_mediators',
  RemoveMember = 'remove_member',
  RemoveMetadataValue = 'remove_metadata_value',
  RemoveMultisigSigner = 'remove_multisig_signer',
  RemoveMultisigSigners = 'remove_multisig_signers',
  RemoveMultisigSignersViaAdmin = 'remove_multisig_signers_via_admin',
  RemoveMultisigSignersViaCreator = 'remove_multisig_signers_via_creator',
  RemovePayer = 'remove_payer',
  RemovePayerViaPayer = 'remove_payer_via_payer',
  RemovePayingKey = 'remove_paying_key',
  RemovePermissionedValidator = 'remove_permissioned_validator',
  RemovePortfolioPreApproval = 'remove_portfolio_pre_approval',
  RemovePrimaryIssuanceAgent = 'remove_primary_issuance_agent',
  RemoveSchedule = 'remove_schedule',
  RemoveSecondaryKeys = 'remove_secondary_keys',
  RemoveSecondaryKeysOld = 'remove_secondary_keys_old',
  RemoveSigningKeys = 'remove_signing_keys',
  RemoveSmartExtension = 'remove_smart_extension',
  RemoveTickerAffirmationExemption = 'remove_ticker_affirmation_exemption',
  RemoveTickerPreApproval = 'remove_ticker_pre_approval',
  RemoveTransferManager = 'remove_transfer_manager',
  RemoveTxs = 'remove_txs',
  RenameAsset = 'rename_asset',
  RenamePortfolio = 'rename_portfolio',
  ReplaceAssetCompliance = 'replace_asset_compliance',
  ReplaceAssetRules = 'replace_asset_rules',
  ReportEquivocation = 'report_equivocation',
  ReportEquivocationUnsigned = 'report_equivocation_unsigned',
  RequestPreimage = 'request_preimage',
  RescheduleExecution = 'reschedule_execution',
  RescheduleInstruction = 'reschedule_instruction',
  ReserveClassicTicker = 'reserve_classic_ticker',
  ResetActiveRules = 'reset_active_rules',
  ResetAssetCompliance = 'reset_asset_compliance',
  ResetCaa = 'reset_caa',
  ResetMembers = 'reset_members',
  ResumeAssetCompliance = 'resume_asset_compliance',
  ResumeAssetRules = 'resume_asset_rules',
  RevokeClaim = 'revoke_claim',
  RevokeClaimByIndex = 'revoke_claim_by_index',
  RevokeCreatePortfoliosPermission = 'revoke_create_portfolios_permission',
  RevokeOffchainAuthorization = 'revoke_offchain_authorization',
  RotatePrimaryKeyToSecondary = 'rotate_primary_key_to_secondary',
  ScaleValidatorCount = 'scale_validator_count',
  Schedule = 'schedule',
  ScheduleAfter = 'schedule_after',
  ScheduleNamed = 'schedule_named',
  ScheduleNamedAfter = 'schedule_named_after',
  SenderAffirmTransaction = 'sender_affirm_transaction',
  SenderUnaffirmTransaction = 'sender_unaffirm_transaction',
  Set = 'set',
  SetAccountAssetFrozen = 'set_account_asset_frozen',
  SetActiveAssetStats = 'set_active_asset_stats',
  SetActiveMembersLimit = 'set_active_members_limit',
  SetActivePipLimit = 'set_active_pip_limit',
  SetAssetFrozen = 'set_asset_frozen',
  SetAssetMetadata = 'set_asset_metadata',
  SetAssetMetadataDetails = 'set_asset_metadata_details',
  SetAssetTransferCompliance = 'set_asset_transfer_compliance',
  SetBalance = 'set_balance',
  SetChangesTrieConfig = 'set_changes_trie_config',
  SetCode = 'set_code',
  SetCodeWithoutChecks = 'set_code_without_checks',
  SetCommissionCap = 'set_commission_cap',
  SetController = 'set_controller',
  SetDefaultEnactmentPeriod = 'set_default_enactment_period',
  SetDefaultTargets = 'set_default_targets',
  SetDefaultWithholdingTax = 'set_default_withholding_tax',
  SetDidWithholdingTax = 'set_did_withholding_tax',
  SetDisableFees = 'set_disable_fees',
  SetEmergencyElectionResult = 'set_emergency_election_result',
  SetEntitiesExempt = 'set_entities_exempt',
  SetExpiresAfter = 'set_expires_after',
  SetFundingRound = 'set_funding_round',
  SetGlobalCommission = 'set_global_commission',
  SetGroupPermissions = 'set_group_permissions',
  SetHeapPages = 'set_heap_pages',
  SetHistoryDepth = 'set_history_depth',
  SetInvulnerables = 'set_invulnerables',
  SetItnRewardStatus = 'set_itn_reward_status',
  SetKey = 'set_key',
  SetKeys = 'set_keys',
  SetMasterKey = 'set_master_key',
  SetMaxDetailsLength = 'set_max_details_length',
  SetMaxPipSkipCount = 'set_max_pip_skip_count',
  SetMinBondThreshold = 'set_min_bond_threshold',
  SetMinCommission = 'set_min_commission',
  SetMinProposalDeposit = 'set_min_proposal_deposit',
  SetMinimumUntrustedScore = 'set_minimum_untrusted_score',
  SetPayee = 'set_payee',
  SetPayingKey = 'set_paying_key',
  SetPendingPipExpiry = 'set_pending_pip_expiry',
  SetPermissionToSigner = 'set_permission_to_signer',
  SetPrimaryKey = 'set_primary_key',
  SetProposalCoolOffPeriod = 'set_proposal_cool_off_period',
  SetProposalDuration = 'set_proposal_duration',
  SetPruneHistoricalPips = 'set_prune_historical_pips',
  SetReleaseCoordinator = 'set_release_coordinator',
  SetSchedulesMaxComplexity = 'set_schedules_max_complexity',
  SetSecondaryKeyPermissions = 'set_secondary_key_permissions',
  SetSignedMaxLimits = 'set_signed_max_limits',
  SetStakingConfigs = 'set_staking_configs',
  SetStorage = 'set_storage',
  SetUncles = 'set_uncles',
  SetValidatorCount = 'set_validator_count',
  SetVenueFiltering = 'set_venue_filtering',
  SetVoteThreshold = 'set_vote_threshold',
  Snapshot = 'snapshot',
  Stop = 'stop',
  Submit = 'submit',
  SubmitElectionSolution = 'submit_election_solution',
  SubmitElectionSolutionUnsigned = 'submit_election_solution_unsigned',
  Sudo = 'sudo',
  SudoAs = 'sudo_as',
  SudoUncheckedWeight = 'sudo_unchecked_weight',
  SumbitUnsigned = 'sumbit_unsigned',
  SwapMember = 'swap_member',
  Transfer = 'transfer',
  TransferWithMemo = 'transfer_with_memo',
  Unbond = 'unbond',
  UnclaimReceipt = 'unclaim_receipt',
  Unfreeze = 'unfreeze',
  UnfreezeFundraiser = 'unfreeze_fundraiser',
  UnfreezeSecondaryKeys = 'unfreeze_secondary_keys',
  UnfreezeTxs = 'unfreeze_txs',
  Unknown = 'unknown',
  UnlinkChildIdentity = 'unlink_child_identity',
  UnlinkTickerFromAssetId = 'unlink_ticker_from_asset_id',
  UnnotePreimage = 'unnote_preimage',
  UnrequestPreimage = 'unrequest_preimage',
  UpdateAssetType = 'update_asset_type',
  UpdateCallRuntimeWhitelist = 'update_call_runtime_whitelist',
  UpdateGlobalMetadataSpec = 'update_global_metadata_spec',
  UpdateIdentifiers = 'update_identifiers',
  UpdatePermissionedValidatorIntendedCount = 'update_permissioned_validator_intended_count',
  UpdatePolyxLimit = 'update_polyx_limit',
  UpdateVenueDetails = 'update_venue_details',
  UpdateVenueSigners = 'update_venue_signers',
  UpdateVenueType = 'update_venue_type',
  UpgradeApi = 'upgrade_api',
  UploadCode = 'upload_code',
  Validate = 'validate',
  ValidateCddExpiryNominators = 'validate_cdd_expiry_nominators',
  Vote = 'vote',
  VoteOrPropose = 'vote_or_propose',
  WithWeight = 'with_weight',
  WithdrawAffirmation = 'withdraw_affirmation',
  WithdrawAffirmationAsMediator = 'withdraw_affirmation_as_mediator',
  WithdrawAffirmationV2 = 'withdraw_affirmation_v2',
  WithdrawAffirmationWithCount = 'withdraw_affirmation_with_count',
  WithdrawUnbonded = 'withdraw_unbonded',
}
export type CallIdEnumFilter = {
  distinctFrom?: InputMaybe<CallIdEnum>;
  equalTo?: InputMaybe<CallIdEnum>;
  greaterThan?: InputMaybe<CallIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<CallIdEnum>;
  in?: InputMaybe<Array<CallIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<CallIdEnum>;
  lessThanOrEqualTo?: InputMaybe<CallIdEnum>;
  notDistinctFrom?: InputMaybe<CallIdEnum>;
  notEqualTo?: InputMaybe<CallIdEnum>;
  notIn?: InputMaybe<Array<CallIdEnum>>;
};
export enum ChildIdentitiesOrderBy {
  ChildIdAsc = 'CHILD_ID_ASC',
  ChildIdDesc = 'CHILD_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  ParentIdAsc = 'PARENT_ID_ASC',
  ParentIdDesc = 'PARENT_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ChildIdentity = Node & {
  child?: Maybe<Identity>;
  childId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  parent?: Maybe<Identity>;
  parentId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ChildIdentityFilter = {
  and?: InputMaybe<Array<ChildIdentityFilter>>;
  child?: InputMaybe<IdentityFilter>;
  childId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ChildIdentityFilter>;
  or?: InputMaybe<Array<ChildIdentityFilter>>;
  parent?: InputMaybe<IdentityFilter>;
  parentId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type Claim = Node & {
  cddId?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeId?: Maybe<Scalars['String']['output']>;
  eventIdx: Scalars['Int']['output'];
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry: Scalars['BigFloat']['output'];
  id: Scalars['String']['output'];
  issuanceDate: Scalars['BigFloat']['output'];
  issuer?: Maybe<Identity>;
  issuerId: Scalars['String']['output'];
  jurisdiction?: Maybe<Scalars['String']['output']>;
  lastUpdateDate: Scalars['BigFloat']['output'];
  nodeId: Scalars['ID']['output'];
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
  scope?: Maybe<Scalars['JSON']['output']>;
  target?: Maybe<Identity>;
  targetId: Scalars['String']['output'];
  type: ClaimTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ClaimAggregates = {
  average?: Maybe<ClaimAverageAggregates>;
  distinctCount?: Maybe<ClaimDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']['output']>>;
  max?: Maybe<ClaimMaxAggregates>;
  min?: Maybe<ClaimMinAggregates>;
  stddevPopulation?: Maybe<ClaimStddevPopulationAggregates>;
  stddevSample?: Maybe<ClaimStddevSampleAggregates>;
  sum?: Maybe<ClaimSumAggregates>;
  variancePopulation?: Maybe<ClaimVariancePopulationAggregates>;
  varianceSample?: Maybe<ClaimVarianceSampleAggregates>;
};
export type ClaimAverageAggregates = {
  eventIdx?: Maybe<Scalars['BigFloat']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimDistinctCountAggregates = {
  _blockRange?: Maybe<Scalars['BigInt']['output']>;
  _id?: Maybe<Scalars['BigInt']['output']>;
  cddId?: Maybe<Scalars['BigInt']['output']>;
  createdBlockId?: Maybe<Scalars['BigInt']['output']>;
  createdEventId?: Maybe<Scalars['BigInt']['output']>;
  customClaimTypeId?: Maybe<Scalars['BigInt']['output']>;
  eventIdx?: Maybe<Scalars['BigInt']['output']>;
  expiry?: Maybe<Scalars['BigInt']['output']>;
  filterExpiry?: Maybe<Scalars['BigInt']['output']>;
  id?: Maybe<Scalars['BigInt']['output']>;
  issuanceDate?: Maybe<Scalars['BigInt']['output']>;
  issuerId?: Maybe<Scalars['BigInt']['output']>;
  jurisdiction?: Maybe<Scalars['BigInt']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigInt']['output']>;
  revokeDate?: Maybe<Scalars['BigInt']['output']>;
  scope?: Maybe<Scalars['BigInt']['output']>;
  targetId?: Maybe<Scalars['BigInt']['output']>;
  type?: Maybe<Scalars['BigInt']['output']>;
  updatedBlockId?: Maybe<Scalars['BigInt']['output']>;
};
export type ClaimFilter = {
  and?: InputMaybe<Array<ClaimFilter>>;
  cddId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  customClaimType?: InputMaybe<CustomClaimTypeFilter>;
  customClaimTypeExists?: InputMaybe<Scalars['Boolean']['input']>;
  customClaimTypeId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  expiry?: InputMaybe<BigFloatFilter>;
  filterExpiry?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<StringFilter>;
  issuanceDate?: InputMaybe<BigFloatFilter>;
  issuer?: InputMaybe<IdentityFilter>;
  issuerId?: InputMaybe<StringFilter>;
  jurisdiction?: InputMaybe<StringFilter>;
  lastUpdateDate?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<ClaimFilter>;
  or?: InputMaybe<Array<ClaimFilter>>;
  revokeDate?: InputMaybe<BigFloatFilter>;
  scope?: InputMaybe<JsonFilter>;
  target?: InputMaybe<IdentityFilter>;
  targetId?: InputMaybe<StringFilter>;
  type?: InputMaybe<ClaimTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type ClaimMaxAggregates = {
  eventIdx?: Maybe<Scalars['Int']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimMinAggregates = {
  eventIdx?: Maybe<Scalars['Int']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimScope = Node & {
  asset?: Maybe<Asset>;
  assetId?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  scope?: Maybe<Scalars['JSON']['output']>;
  target: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ClaimScopeFilter = {
  and?: InputMaybe<Array<ClaimScopeFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetExists?: InputMaybe<Scalars['Boolean']['input']>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ClaimScopeFilter>;
  or?: InputMaybe<Array<ClaimScopeFilter>>;
  scope?: InputMaybe<JsonFilter>;
  target?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ClaimScopesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  TargetAsc = 'TARGET_ASC',
  TargetDesc = 'TARGET_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ClaimStddevPopulationAggregates = {
  eventIdx?: Maybe<Scalars['BigFloat']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimStddevSampleAggregates = {
  eventIdx?: Maybe<Scalars['BigFloat']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimSumAggregates = {
  eventIdx: Scalars['BigInt']['output'];
  expiry: Scalars['BigFloat']['output'];
  filterExpiry: Scalars['BigFloat']['output'];
  issuanceDate: Scalars['BigFloat']['output'];
  lastUpdateDate: Scalars['BigFloat']['output'];
  revokeDate: Scalars['BigFloat']['output'];
};
export enum ClaimTypeEnum {
  Accredited = 'Accredited',
  Affiliate = 'Affiliate',
  Blocked = 'Blocked',
  BuyLockup = 'BuyLockup',
  Custom = 'Custom',
  CustomerDueDiligence = 'CustomerDueDiligence',
  Exempted = 'Exempted',
  InvestorUniqueness = 'InvestorUniqueness',
  InvestorUniquenessV2 = 'InvestorUniquenessV2',
  Jurisdiction = 'Jurisdiction',
  KnowYourCustomer = 'KnowYourCustomer',
  NoData = 'NoData',
  NoType = 'NoType',
  SellLockup = 'SellLockup',
}
export type ClaimTypeEnumFilter = {
  distinctFrom?: InputMaybe<ClaimTypeEnum>;
  equalTo?: InputMaybe<ClaimTypeEnum>;
  greaterThan?: InputMaybe<ClaimTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<ClaimTypeEnum>;
  in?: InputMaybe<Array<ClaimTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ClaimTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<ClaimTypeEnum>;
  notDistinctFrom?: InputMaybe<ClaimTypeEnum>;
  notEqualTo?: InputMaybe<ClaimTypeEnum>;
  notIn?: InputMaybe<Array<ClaimTypeEnum>>;
};
export type ClaimVariancePopulationAggregates = {
  eventIdx?: Maybe<Scalars['BigFloat']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimVarianceSampleAggregates = {
  eventIdx?: Maybe<Scalars['BigFloat']['output']>;
  expiry?: Maybe<Scalars['BigFloat']['output']>;
  filterExpiry?: Maybe<Scalars['BigFloat']['output']>;
  issuanceDate?: Maybe<Scalars['BigFloat']['output']>;
  lastUpdateDate?: Maybe<Scalars['BigFloat']['output']>;
  revokeDate?: Maybe<Scalars['BigFloat']['output']>;
};
export type ClaimsConnection = {
  groupedAggregates?: Maybe<Array<ClaimAggregates>>;
  nodes: Array<Maybe<Claim>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
export enum ClaimsOrderBy {
  CddIdAsc = 'CDD_ID_ASC',
  CddIdDesc = 'CDD_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CustomClaimTypeIdAsc = 'CUSTOM_CLAIM_TYPE_ID_ASC',
  CustomClaimTypeIdDesc = 'CUSTOM_CLAIM_TYPE_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  FilterExpiryAsc = 'FILTER_EXPIRY_ASC',
  FilterExpiryDesc = 'FILTER_EXPIRY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IssuanceDateAsc = 'ISSUANCE_DATE_ASC',
  IssuanceDateDesc = 'ISSUANCE_DATE_DESC',
  IssuerIdAsc = 'ISSUER_ID_ASC',
  IssuerIdDesc = 'ISSUER_ID_DESC',
  JurisdictionAsc = 'JURISDICTION_ASC',
  JurisdictionDesc = 'JURISDICTION_DESC',
  LastUpdateDateAsc = 'LAST_UPDATE_DATE_ASC',
  LastUpdateDateDesc = 'LAST_UPDATE_DATE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RevokeDateAsc = 'REVOKE_DATE_ASC',
  RevokeDateDesc = 'REVOKE_DATE_DESC',
  ScopeAsc = 'SCOPE_ASC',
  ScopeDesc = 'SCOPE_DESC',
  TargetIdAsc = 'TARGET_ID_ASC',
  TargetIdDesc = 'TARGET_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Compliance = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  complianceId: Scalars['Int']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  data: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ComplianceFilter = {
  and?: InputMaybe<Array<ComplianceFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  complianceId?: InputMaybe<IntFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ComplianceFilter>;
  or?: InputMaybe<Array<ComplianceFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum CompliancesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ComplianceIdAsc = 'COMPLIANCE_ID_ASC',
  ComplianceIdDesc = 'COMPLIANCE_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAccount = Node & {
  account: Scalars['String']['output'];
  blocksByConfidentialAssetHistoryFromIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryFromIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryToIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryToIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderAccountIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderAccountIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementFromIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementFromIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementToIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementToIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialLegReceiverIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialLegReceiverIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialLegSenderIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialLegSenderIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationAccountIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationAccountIdAndUpdatedBlockId: Connection<Block>;
  confidentialAccountsByConfidentialAssetHistoryFromIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryToIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementFromIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementToIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegReceiverIdAndSenderId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegSenderIdAndReceiverId: Connection<ConfidentialAccount>;
  confidentialAssetHistoriesByFromId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHistoriesByToId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHoldersByAccountId: Connection<ConfidentialAssetHolder>;
  confidentialAssetMovementsByFromId: Connection<ConfidentialAssetMovement>;
  confidentialAssetMovementsByToId: Connection<ConfidentialAssetMovement>;
  confidentialAssetsByConfidentialAssetHistoryFromIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHistoryToIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHolderAccountIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetMovementFromIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetMovementToIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialLegsByReceiverId: Connection<ConfidentialLeg>;
  confidentialLegsBySenderId: Connection<ConfidentialLeg>;
  confidentialTransactionAffirmationsByAccountId: Connection<ConfidentialTransactionAffirmation>;
  confidentialTransactionsByConfidentialAssetHistoryFromIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialAssetHistoryToIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialLegReceiverIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialLegSenderIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialTransactionAffirmationAccountIdAndTransactionId: Connection<ConfidentialTransaction>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  eventsByConfidentialAssetHistoryFromIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHistoryToIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHolderAccountIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetMovementFromIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetMovementToIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionAffirmationAccountIdAndCreatedEventId: Connection<Event>;
  frozenForAsset: Scalars['JSON']['output'];
  id: Scalars['String']['output'];
  identitiesByConfidentialTransactionAffirmationAccountIdAndIdentityId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialAccountFilter = {
  account?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialAccountFilter>>;
  confidentialAssetHistoriesByFromId?: InputMaybe<OneToManyFilter<ConfidentialAssetHistoryFilter>>;
  confidentialAssetHistoriesByToId?: InputMaybe<OneToManyFilter<ConfidentialAssetHistoryFilter>>;
  confidentialAssetHoldersByAccountId?: InputMaybe<OneToManyFilter<ConfidentialAssetHolderFilter>>;
  confidentialAssetMovementsByFromId?: InputMaybe<OneToManyFilter<ConfidentialAssetMovementFilter>>;
  confidentialAssetMovementsByToId?: InputMaybe<OneToManyFilter<ConfidentialAssetMovementFilter>>;
  confidentialLegsByReceiverId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialLegsBySenderId?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  confidentialTransactionAffirmationsByAccountId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionAffirmationFilter>
  >;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  frozenForAsset?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAccountFilter>;
  or?: InputMaybe<Array<ConfidentialAccountFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ConfidentialAccountsOrderBy {
  AccountAsc = 'ACCOUNT_ASC',
  AccountDesc = 'ACCOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  FrozenForAssetAsc = 'FROZEN_FOR_ASSET_ASC',
  FrozenForAssetDesc = 'FROZEN_FOR_ASSET_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAsset = Node & {
  allowedVenues?: Maybe<Scalars['JSON']['output']>;
  assetId: Scalars['String']['output'];
  auditors?: Maybe<Scalars['JSON']['output']>;
  blocksByConfidentialAssetHistoryAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderAssetIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementAssetIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementAssetIdAndUpdatedBlockId: Connection<Block>;
  confidentialAccountsByConfidentialAssetHistoryAssetIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryAssetIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHolderAssetIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementAssetIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementAssetIdAndToId: Connection<ConfidentialAccount>;
  confidentialAssetHistoriesByAssetId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHoldersByAssetId: Connection<ConfidentialAssetHolder>;
  confidentialAssetMovementsByAssetId: Connection<ConfidentialAssetMovement>;
  confidentialTransactionsByConfidentialAssetHistoryAssetIdAndTransactionId: Connection<ConfidentialTransaction>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  data?: Maybe<Scalars['String']['output']>;
  eventIdx: Scalars['Int']['output'];
  eventsByConfidentialAssetHistoryAssetIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetHolderAssetIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetMovementAssetIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  isFrozen: Scalars['Boolean']['output'];
  mediators?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  ticker?: Maybe<Scalars['String']['output']>;
  totalSupply: Scalars['BigFloat']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venueFiltering: Scalars['Boolean']['output'];
};
export type ConfidentialAssetFilter = {
  allowedVenues?: InputMaybe<JsonFilter>;
  and?: InputMaybe<Array<ConfidentialAssetFilter>>;
  assetId?: InputMaybe<StringFilter>;
  auditors?: InputMaybe<JsonFilter>;
  confidentialAssetHistoriesByAssetId?: InputMaybe<OneToManyFilter<ConfidentialAssetHistoryFilter>>;
  confidentialAssetHoldersByAssetId?: InputMaybe<OneToManyFilter<ConfidentialAssetHolderFilter>>;
  confidentialAssetMovementsByAssetId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetMovementFilter>
  >;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  data?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  isFrozen?: InputMaybe<BooleanFilter>;
  mediators?: InputMaybe<JsonFilter>;
  not?: InputMaybe<ConfidentialAssetFilter>;
  or?: InputMaybe<Array<ConfidentialAssetFilter>>;
  ticker?: InputMaybe<StringFilter>;
  totalSupply?: InputMaybe<BigFloatFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  venueFiltering?: InputMaybe<BooleanFilter>;
};
export enum ConfidentialAssetHistoriesOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAssetHistory = Node & {
  amount: Scalars['String']['output'];
  asset?: Maybe<ConfidentialAsset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId: EventIdEnum;
  eventIdx: Scalars['Int']['output'];
  extrinsicIdx?: Maybe<Scalars['Int']['output']>;
  from?: Maybe<ConfidentialAccount>;
  fromId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  memo?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  to?: Maybe<ConfidentialAccount>;
  toId?: Maybe<Scalars['String']['output']>;
  transaction?: Maybe<ConfidentialTransaction>;
  transactionId?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialAssetHistoryFilter = {
  amount?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialAssetHistoryFilter>>;
  asset?: InputMaybe<ConfidentialAssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  from?: InputMaybe<ConfidentialAccountFilter>;
  fromExists?: InputMaybe<Scalars['Boolean']['input']>;
  fromId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  memo?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAssetHistoryFilter>;
  or?: InputMaybe<Array<ConfidentialAssetHistoryFilter>>;
  to?: InputMaybe<ConfidentialAccountFilter>;
  toExists?: InputMaybe<Scalars['Boolean']['input']>;
  toId?: InputMaybe<StringFilter>;
  transaction?: InputMaybe<ConfidentialTransactionFilter>;
  transactionExists?: InputMaybe<Scalars['Boolean']['input']>;
  transactionId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type ConfidentialAssetHolder = Node & {
  account?: Maybe<ConfidentialAccount>;
  accountId: Scalars['String']['output'];
  amount?: Maybe<Scalars['String']['output']>;
  asset?: Maybe<ConfidentialAsset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialAssetHolderFilter = {
  account?: InputMaybe<ConfidentialAccountFilter>;
  accountId?: InputMaybe<StringFilter>;
  amount?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialAssetHolderFilter>>;
  asset?: InputMaybe<ConfidentialAssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAssetHolderFilter>;
  or?: InputMaybe<Array<ConfidentialAssetHolderFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ConfidentialAssetHoldersOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialAssetMovement = Node & {
  asset?: Maybe<ConfidentialAsset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  from?: Maybe<ConfidentialAccount>;
  fromId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  proof: Scalars['String']['output'];
  to?: Maybe<ConfidentialAccount>;
  toId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialAssetMovementFilter = {
  and?: InputMaybe<Array<ConfidentialAssetMovementFilter>>;
  asset?: InputMaybe<ConfidentialAssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  from?: InputMaybe<ConfidentialAccountFilter>;
  fromId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialAssetMovementFilter>;
  or?: InputMaybe<Array<ConfidentialAssetMovementFilter>>;
  proof?: InputMaybe<StringFilter>;
  to?: InputMaybe<ConfidentialAccountFilter>;
  toId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ConfidentialAssetMovementsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProofAsc = 'PROOF_ASC',
  ProofDesc = 'PROOF_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ConfidentialAssetsOrderBy {
  AllowedVenuesAsc = 'ALLOWED_VENUES_ASC',
  AllowedVenuesDesc = 'ALLOWED_VENUES_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  AuditorsAsc = 'AUDITORS_ASC',
  AuditorsDesc = 'AUDITORS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsFrozenAsc = 'IS_FROZEN_ASC',
  IsFrozenDesc = 'IS_FROZEN_DESC',
  MediatorsAsc = 'MEDIATORS_ASC',
  MediatorsDesc = 'MEDIATORS_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  TotalSupplyAsc = 'TOTAL_SUPPLY_ASC',
  TotalSupplyDesc = 'TOTAL_SUPPLY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  VenueFilteringAsc = 'VENUE_FILTERING_ASC',
  VenueFilteringDesc = 'VENUE_FILTERING_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialLeg = Node & {
  assetAuditors: Scalars['JSON']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mediators: Scalars['JSON']['output'];
  nodeId: Scalars['ID']['output'];
  receiver?: Maybe<ConfidentialAccount>;
  receiverId: Scalars['String']['output'];
  sender?: Maybe<ConfidentialAccount>;
  senderId: Scalars['String']['output'];
  transaction?: Maybe<ConfidentialTransaction>;
  transactionId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialLegFilter = {
  and?: InputMaybe<Array<ConfidentialLegFilter>>;
  assetAuditors?: InputMaybe<JsonFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  mediators?: InputMaybe<JsonFilter>;
  not?: InputMaybe<ConfidentialLegFilter>;
  or?: InputMaybe<Array<ConfidentialLegFilter>>;
  receiver?: InputMaybe<ConfidentialAccountFilter>;
  receiverId?: InputMaybe<StringFilter>;
  sender?: InputMaybe<ConfidentialAccountFilter>;
  senderId?: InputMaybe<StringFilter>;
  transaction?: InputMaybe<ConfidentialTransactionFilter>;
  transactionId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ConfidentialLegsOrderBy {
  AssetAuditorsAsc = 'ASSET_AUDITORS_ASC',
  AssetAuditorsDesc = 'ASSET_AUDITORS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MediatorsAsc = 'MEDIATORS_ASC',
  MediatorsDesc = 'MEDIATORS_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReceiverIdAsc = 'RECEIVER_ID_ASC',
  ReceiverIdDesc = 'RECEIVER_ID_DESC',
  SenderIdAsc = 'SENDER_ID_ASC',
  SenderIdDesc = 'SENDER_ID_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialTransaction = Node & {
  affirmations: Connection<ConfidentialTransactionAffirmation>;
  blocksByConfidentialAssetHistoryTransactionIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryTransactionIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialLegTransactionIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialLegTransactionIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationTransactionIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationTransactionIdAndUpdatedBlockId: Connection<Block>;
  confidentialAccountsByConfidentialAssetHistoryTransactionIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryTransactionIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegTransactionIdAndReceiverId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialLegTransactionIdAndSenderId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialTransactionAffirmationTransactionIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAssetHistoriesByTransactionId: Connection<ConfidentialAssetHistory>;
  confidentialAssetsByConfidentialAssetHistoryTransactionIdAndAssetId: Connection<ConfidentialAsset>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventId: EventIdEnum;
  eventIdx: Scalars['Int']['output'];
  eventsByConfidentialAssetHistoryTransactionIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionAffirmationTransactionIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByConfidentialTransactionAffirmationTransactionIdAndIdentityId: Connection<Identity>;
  legs: Connection<ConfidentialLeg>;
  memo?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  pendingAffirmations: Scalars['Int']['output'];
  status: ConfidentialTransactionStatusEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venue?: Maybe<ConfidentialVenue>;
  venueId: Scalars['String']['output'];
};
export type ConfidentialTransactionAffirmation = Node & {
  account?: Maybe<ConfidentialAccount>;
  accountId?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  legId: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  party: AffirmingPartyEnum;
  proofs?: Maybe<Scalars['JSON']['output']>;
  status: AffirmStatusEnum;
  transaction?: Maybe<ConfidentialTransaction>;
  transactionId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type ConfidentialTransactionAffirmationFilter = {
  account?: InputMaybe<ConfidentialAccountFilter>;
  accountExists?: InputMaybe<Scalars['Boolean']['input']>;
  accountId?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ConfidentialTransactionAffirmationFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  legId?: InputMaybe<IntFilter>;
  not?: InputMaybe<ConfidentialTransactionAffirmationFilter>;
  or?: InputMaybe<Array<ConfidentialTransactionAffirmationFilter>>;
  party?: InputMaybe<AffirmingPartyEnumFilter>;
  proofs?: InputMaybe<JsonFilter>;
  status?: InputMaybe<AffirmStatusEnumFilter>;
  transaction?: InputMaybe<ConfidentialTransactionFilter>;
  transactionId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum ConfidentialTransactionAffirmationsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LegIdAsc = 'LEG_ID_ASC',
  LegIdDesc = 'LEG_ID_DESC',
  Natural = 'NATURAL',
  PartyAsc = 'PARTY_ASC',
  PartyDesc = 'PARTY_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProofsAsc = 'PROOFS_ASC',
  ProofsDesc = 'PROOFS_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialTransactionFilter = {
  affirmations?: InputMaybe<OneToManyFilter<ConfidentialTransactionAffirmationFilter>>;
  and?: InputMaybe<Array<ConfidentialTransactionFilter>>;
  confidentialAssetHistoriesByTransactionId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHistoryFilter>
  >;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  legs?: InputMaybe<OneToManyFilter<ConfidentialLegFilter>>;
  memo?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialTransactionFilter>;
  or?: InputMaybe<Array<ConfidentialTransactionFilter>>;
  pendingAffirmations?: InputMaybe<IntFilter>;
  status?: InputMaybe<ConfidentialTransactionStatusEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  venue?: InputMaybe<ConfidentialVenueFilter>;
  venueId?: InputMaybe<StringFilter>;
};
export enum ConfidentialTransactionStatusEnum {
  Created = 'Created',
  Executed = 'Executed',
  Rejected = 'Rejected',
}
export type ConfidentialTransactionStatusEnumFilter = {
  distinctFrom?: InputMaybe<ConfidentialTransactionStatusEnum>;
  equalTo?: InputMaybe<ConfidentialTransactionStatusEnum>;
  greaterThan?: InputMaybe<ConfidentialTransactionStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<ConfidentialTransactionStatusEnum>;
  in?: InputMaybe<Array<ConfidentialTransactionStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ConfidentialTransactionStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<ConfidentialTransactionStatusEnum>;
  notDistinctFrom?: InputMaybe<ConfidentialTransactionStatusEnum>;
  notEqualTo?: InputMaybe<ConfidentialTransactionStatusEnum>;
  notIn?: InputMaybe<Array<ConfidentialTransactionStatusEnum>>;
};
export enum ConfidentialTransactionsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  PendingAffirmationsAsc = 'PENDING_AFFIRMATIONS_ASC',
  PendingAffirmationsDesc = 'PENDING_AFFIRMATIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type ConfidentialVenue = Node & {
  blocksByConfidentialTransactionVenueIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionVenueIdAndUpdatedBlockId: Connection<Block>;
  confidentialTransactionsByVenueId: Connection<ConfidentialTransaction>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  eventsByConfidentialTransactionVenueIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venueId: Scalars['Int']['output'];
};
export type ConfidentialVenueFilter = {
  and?: InputMaybe<Array<ConfidentialVenueFilter>>;
  confidentialTransactionsByVenueId?: InputMaybe<OneToManyFilter<ConfidentialTransactionFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ConfidentialVenueFilter>;
  or?: InputMaybe<Array<ConfidentialVenueFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  venueId?: InputMaybe<IntFilter>;
};
export enum ConfidentialVenuesOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type CustomClaimType = Node & {
  assetsByStatTypeCustomClaimTypeIdAndAssetId: Connection<Asset>;
  blocksByClaimCustomClaimTypeIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimCustomClaimTypeIdAndUpdatedBlockId: Connection<Block>;
  blocksByStatTypeCustomClaimTypeIdAndCreatedBlockId: Connection<Block>;
  blocksByStatTypeCustomClaimTypeIdAndUpdatedBlockId: Connection<Block>;
  claims: ClaimsConnection;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  eventsByClaimCustomClaimTypeIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByClaimCustomClaimTypeIdAndIssuerId: Connection<Identity>;
  identitiesByClaimCustomClaimTypeIdAndTargetId: Connection<Identity>;
  identitiesByStatTypeCustomClaimTypeIdAndClaimIssuerId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  statTypes: Connection<StatType>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type CustomClaimTypeFilter = {
  and?: InputMaybe<Array<CustomClaimTypeFilter>>;
  claims?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<CustomClaimTypeFilter>;
  or?: InputMaybe<Array<CustomClaimTypeFilter>>;
  statTypes?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum CustomClaimTypesOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type DatetimeFilter = {
  distinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  equalTo?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThan?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Datetime']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Datetime']['input']>;
  notEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notIn?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};
export type Debug = Node & {
  context?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  line?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
};
export type DebugFilter = {
  and?: InputMaybe<Array<DebugFilter>>;
  context?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  line?: InputMaybe<StringFilter>;
  not?: InputMaybe<DebugFilter>;
  or?: InputMaybe<Array<DebugFilter>>;
};
export enum DebugsOrderBy {
  ContextAsc = 'CONTEXT_ASC',
  ContextDesc = 'CONTEXT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LineAsc = 'LINE_ASC',
  LineDesc = 'LINE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Distribution = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  blocksByDistributionPaymentDistributionIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionPaymentDistributionIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  currency?: Maybe<Asset>;
  currencyId: Scalars['String']['output'];
  distributionPayments: Connection<DistributionPayment>;
  eventsByDistributionPaymentDistributionIdAndCreatedEventId: Connection<Event>;
  expiresAt?: Maybe<Scalars['BigFloat']['output']>;
  id: Scalars['String']['output'];
  identitiesByDistributionPaymentDistributionIdAndTargetId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  localId: Scalars['Int']['output'];
  nodeId: Scalars['ID']['output'];
  paymentAt: Scalars['BigFloat']['output'];
  perShare: Scalars['BigFloat']['output'];
  portfolio?: Maybe<Portfolio>;
  portfolioId: Scalars['String']['output'];
  remaining: Scalars['BigFloat']['output'];
  taxes: Scalars['BigFloat']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type DistributionFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<DistributionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  currency?: InputMaybe<AssetFilter>;
  currencyId?: InputMaybe<StringFilter>;
  distributionPayments?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  expiresAt?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  localId?: InputMaybe<IntFilter>;
  not?: InputMaybe<DistributionFilter>;
  or?: InputMaybe<Array<DistributionFilter>>;
  paymentAt?: InputMaybe<BigFloatFilter>;
  perShare?: InputMaybe<BigFloatFilter>;
  portfolio?: InputMaybe<PortfolioFilter>;
  portfolioId?: InputMaybe<StringFilter>;
  remaining?: InputMaybe<BigFloatFilter>;
  taxes?: InputMaybe<BigFloatFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type DistributionPayment = Node & {
  amount: Scalars['BigFloat']['output'];
  amountAfterTax: Scalars['BigFloat']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  distribution?: Maybe<Distribution>;
  distributionId: Scalars['String']['output'];
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  reclaimed: Scalars['Boolean']['output'];
  target?: Maybe<Identity>;
  targetId: Scalars['String']['output'];
  tax: Scalars['BigFloat']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type DistributionPaymentFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  amountAfterTax?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<DistributionPaymentFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  distribution?: InputMaybe<DistributionFilter>;
  distributionId?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<DistributionPaymentFilter>;
  or?: InputMaybe<Array<DistributionPaymentFilter>>;
  reclaimed?: InputMaybe<BooleanFilter>;
  target?: InputMaybe<IdentityFilter>;
  targetId?: InputMaybe<StringFilter>;
  tax?: InputMaybe<BigFloatFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum DistributionPaymentsOrderBy {
  AmountAfterTaxAsc = 'AMOUNT_AFTER_TAX_ASC',
  AmountAfterTaxDesc = 'AMOUNT_AFTER_TAX_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  DistributionIdAsc = 'DISTRIBUTION_ID_ASC',
  DistributionIdDesc = 'DISTRIBUTION_ID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReclaimedAsc = 'RECLAIMED_ASC',
  ReclaimedDesc = 'RECLAIMED_DESC',
  TargetIdAsc = 'TARGET_ID_ASC',
  TargetIdDesc = 'TARGET_ID_DESC',
  TaxAsc = 'TAX_ASC',
  TaxDesc = 'TAX_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum DistributionsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CurrencyIdAsc = 'CURRENCY_ID_ASC',
  CurrencyIdDesc = 'CURRENCY_ID_DESC',
  ExpiresAtAsc = 'EXPIRES_AT_ASC',
  ExpiresAtDesc = 'EXPIRES_AT_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LocalIdAsc = 'LOCAL_ID_ASC',
  LocalIdDesc = 'LOCAL_ID_DESC',
  Natural = 'NATURAL',
  PaymentAtAsc = 'PAYMENT_AT_ASC',
  PaymentAtDesc = 'PAYMENT_AT_DESC',
  PerShareAsc = 'PER_SHARE_ASC',
  PerShareDesc = 'PER_SHARE_DESC',
  PortfolioIdAsc = 'PORTFOLIO_ID_ASC',
  PortfolioIdDesc = 'PORTFOLIO_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemainingAsc = 'REMAINING_ASC',
  RemainingDesc = 'REMAINING_DESC',
  TaxesAsc = 'TAXES_ASC',
  TaxesDesc = 'TAXES_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Event = Node & {
  assetTransactionsByCreatedEventId: Connection<AssetTransaction>;
  assetsByAssetTransactionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByCreatedEventId: Connection<Asset>;
  assetsByFundingCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentActionCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentHistoryCreatedEventIdAndAssetId: Connection<Asset>;
  assetsByTrustedClaimIssuerCreatedEventIdAndAssetId: Connection<Asset>;
  attributes?: Maybe<Scalars['JSON']['output']>;
  attributesTxt: Scalars['String']['output'];
  authorizationsByCreatedEventId: Connection<Authorization>;
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  blocksByAssetCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetTransactionCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByAuthorizationCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByAuthorizationCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByBridgeEventCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByBridgeEventCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAccountCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAccountCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHistoryCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetHolderCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetMovementCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialVenueCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialVenueCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionPaymentCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionPaymentCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByFundingCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByFundingCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionEventCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionEventCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByStakingEventCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByStakingEventCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerCreatedEventIdAndCreatedBlockId: Connection<Block>;
  blocksByTrustedClaimIssuerCreatedEventIdAndUpdatedBlockId: Connection<Block>;
  bridgeEventsByCreatedEventId: Connection<BridgeEvent>;
  claimExpiry?: Maybe<Scalars['String']['output']>;
  claimIssuer?: Maybe<Scalars['String']['output']>;
  claimScope?: Maybe<Scalars['String']['output']>;
  claimType?: Maybe<Scalars['String']['output']>;
  claimsByCreatedEventId: ClaimsConnection;
  confidentialAccountsByConfidentialAssetHistoryCreatedEventIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHistoryCreatedEventIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetHolderCreatedEventIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementCreatedEventIdAndFromId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialAssetMovementCreatedEventIdAndToId: Connection<ConfidentialAccount>;
  confidentialAccountsByConfidentialTransactionAffirmationCreatedEventIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByCreatedEventId: Connection<ConfidentialAccount>;
  confidentialAssetHistoriesByCreatedEventId: Connection<ConfidentialAssetHistory>;
  confidentialAssetHoldersByCreatedEventId: Connection<ConfidentialAssetHolder>;
  confidentialAssetMovementsByCreatedEventId: Connection<ConfidentialAssetMovement>;
  confidentialAssetsByConfidentialAssetHistoryCreatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetHolderCreatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByConfidentialAssetMovementCreatedEventIdAndAssetId: Connection<ConfidentialAsset>;
  confidentialAssetsByCreatedEventId: Connection<ConfidentialAsset>;
  confidentialTransactionAffirmationsByCreatedEventId: Connection<ConfidentialTransactionAffirmation>;
  confidentialTransactionsByConfidentialAssetHistoryCreatedEventIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByConfidentialTransactionAffirmationCreatedEventIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialTransactionsByCreatedEventId: Connection<ConfidentialTransaction>;
  confidentialVenuesByConfidentialTransactionCreatedEventIdAndVenueId: Connection<ConfidentialVenue>;
  confidentialVenuesByCreatedEventId: Connection<ConfidentialVenue>;
  corporateActionTicker?: Maybe<Scalars['String']['output']>;
  customClaimTypesByClaimCreatedEventIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  distributionPaymentsByCreatedEventId: Connection<DistributionPayment>;
  distributionsByDistributionPaymentCreatedEventIdAndDistributionId: Connection<Distribution>;
  eventArg0?: Maybe<Scalars['String']['output']>;
  eventArg1?: Maybe<Scalars['String']['output']>;
  eventArg2?: Maybe<Scalars['String']['output']>;
  eventArg3?: Maybe<Scalars['String']['output']>;
  eventId: EventIdEnum;
  eventIdText: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  extrinsicIdx?: Maybe<Scalars['Int']['output']>;
  extrinsicsByMultiSigProposalCreatedEventIdAndExtrinsicId: Connection<Extrinsic>;
  fundingsByCreatedEventId: Connection<Funding>;
  fundraiserOfferingAsset?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identitiesByAssetCreatedEventIdAndOwnerId: Connection<Identity>;
  identitiesByAuthorizationCreatedEventIdAndFromId: Connection<Identity>;
  identitiesByBridgeEventCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByClaimCreatedEventIdAndIssuerId: Connection<Identity>;
  identitiesByClaimCreatedEventIdAndTargetId: Connection<Identity>;
  identitiesByConfidentialAccountCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialAssetCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByConfidentialTransactionAffirmationCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByConfidentialVenueCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByDistributionPaymentCreatedEventIdAndTargetId: Connection<Identity>;
  identitiesByMultiSigProposalCreatedEventIdAndCreatorId: Connection<Identity>;
  identitiesByPortfolioCreatedEventIdAndCustodianId: Connection<Identity>;
  identitiesByPortfolioCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByStakingEventCreatedEventIdAndIdentityId: Connection<Identity>;
  identitiesByTickerExternalAgentActionCreatedEventIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentCreatedEventIdAndCallerId: Connection<Identity>;
  identitiesByTickerExternalAgentHistoryCreatedEventIdAndIdentityId: Connection<Identity>;
  instructionEventsByCreatedEventId: Connection<InstructionEvent>;
  instructionsByAssetTransactionCreatedEventIdAndInstructionId: Connection<Instruction>;
  instructionsByCreatedEventId: Connection<Instruction>;
  instructionsByInstructionEventCreatedEventIdAndInstructionId: Connection<Instruction>;
  moduleId: ModuleIdEnum;
  moduleIdText: Scalars['String']['output'];
  multiSigProposalVotesByCreatedEventId: Connection<MultiSigProposalVote>;
  multiSigProposalsByCreatedEventId: Connection<MultiSigProposal>;
  multiSigProposalsByMultiSigProposalVoteCreatedEventIdAndProposalId: Connection<MultiSigProposal>;
  multiSigSignersByMultiSigProposalVoteCreatedEventIdAndSignerId: Connection<MultiSigSigner>;
  multiSigsByMultiSigProposalCreatedEventIdAndMultisigId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionEventCreatedEventIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  portfoliosByAssetTransactionCreatedEventIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionCreatedEventIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByCreatedEventId: Connection<Portfolio>;
  specVersionId: Scalars['Int']['output'];
  stakingEventsByCreatedEventId: Connection<StakingEvent>;
  tickerExternalAgentActionsByCreatedEventId: Connection<TickerExternalAgentAction>;
  tickerExternalAgentHistoriesByCreatedEventId: Connection<TickerExternalAgentHistory>;
  tickerExternalAgentsByCreatedEventId: Connection<TickerExternalAgent>;
  transferTo?: Maybe<Scalars['String']['output']>;
  trustedClaimIssuersByCreatedEventId: Connection<TrustedClaimIssuer>;
  venuesByInstructionCreatedEventIdAndVenueId: Connection<Venue>;
};
export type EventFilter = {
  and?: InputMaybe<Array<EventFilter>>;
  assetTransactionsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  assetsByCreatedEventId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  attributes?: InputMaybe<JsonFilter>;
  attributesTxt?: InputMaybe<StringFilter>;
  authorizationsByCreatedEventId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  bridgeEventsByCreatedEventId?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  claimExpiry?: InputMaybe<StringFilter>;
  claimIssuer?: InputMaybe<StringFilter>;
  claimScope?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<StringFilter>;
  claimsByCreatedEventId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  confidentialAccountsByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAssetHistoriesByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHistoryFilter>
  >;
  confidentialAssetHoldersByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetHolderFilter>
  >;
  confidentialAssetMovementsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialAssetMovementFilter>
  >;
  confidentialAssetsByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialTransactionAffirmationsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionAffirmationFilter>
  >;
  confidentialTransactionsByCreatedEventId?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionFilter>
  >;
  confidentialVenuesByCreatedEventId?: InputMaybe<OneToManyFilter<ConfidentialVenueFilter>>;
  corporateActionTicker?: InputMaybe<StringFilter>;
  distributionPaymentsByCreatedEventId?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  eventArg0?: InputMaybe<StringFilter>;
  eventArg1?: InputMaybe<StringFilter>;
  eventArg2?: InputMaybe<StringFilter>;
  eventArg3?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdText?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  fundingsByCreatedEventId?: InputMaybe<OneToManyFilter<FundingFilter>>;
  fundraiserOfferingAsset?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instructionEventsByCreatedEventId?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  instructionsByCreatedEventId?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  moduleIdText?: InputMaybe<StringFilter>;
  multiSigProposalVotesByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
  multiSigProposalsByCreatedEventId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  not?: InputMaybe<EventFilter>;
  or?: InputMaybe<Array<EventFilter>>;
  portfoliosByCreatedEventId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  specVersionId?: InputMaybe<IntFilter>;
  stakingEventsByCreatedEventId?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  tickerExternalAgentActionsByCreatedEventId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentActionFilter>
  >;
  tickerExternalAgentHistoriesByCreatedEventId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentHistoryFilter>
  >;
  tickerExternalAgentsByCreatedEventId?: InputMaybe<OneToManyFilter<TickerExternalAgentFilter>>;
  transferTo?: InputMaybe<StringFilter>;
  trustedClaimIssuersByCreatedEventId?: InputMaybe<OneToManyFilter<TrustedClaimIssuerFilter>>;
};
export enum EventIdEnum {
  AcceptedPayingKey = 'AcceptedPayingKey',
  AccountAssetFrozen = 'AccountAssetFrozen',
  AccountAssetUnfrozen = 'AccountAssetUnfrozen',
  AccountBalanceBurned = 'AccountBalanceBurned',
  AccountCreated = 'AccountCreated',
  AccountDeposit = 'AccountDeposit',
  AccountDepositIncoming = 'AccountDepositIncoming',
  AccountWithdraw = 'AccountWithdraw',
  ActiveLimitChanged = 'ActiveLimitChanged',
  ActivePipLimitChanged = 'ActivePipLimitChanged',
  AdminChanged = 'AdminChanged',
  AffirmationWithdrawn = 'AffirmationWithdrawn',
  AgentAdded = 'AgentAdded',
  AgentRemoved = 'AgentRemoved',
  AllGood = 'AllGood',
  AllowIdentityToCreatePortfolios = 'AllowIdentityToCreatePortfolios',
  ApiHashUpdated = 'ApiHashUpdated',
  Approval = 'Approval',
  Approved = 'Approved',
  AssetAffirmationExemption = 'AssetAffirmationExemption',
  AssetBalanceUpdated = 'AssetBalanceUpdated',
  AssetCompliancePaused = 'AssetCompliancePaused',
  AssetComplianceReplaced = 'AssetComplianceReplaced',
  AssetComplianceReset = 'AssetComplianceReset',
  AssetComplianceResumed = 'AssetComplianceResumed',
  AssetCreated = 'AssetCreated',
  AssetDidRegistered = 'AssetDidRegistered',
  AssetFrozen = 'AssetFrozen',
  AssetMediatorsAdded = 'AssetMediatorsAdded',
  AssetMediatorsRemoved = 'AssetMediatorsRemoved',
  AssetOwnershipTransferred = 'AssetOwnershipTransferred',
  AssetPurchased = 'AssetPurchased',
  AssetRenamed = 'AssetRenamed',
  AssetRuleChanged = 'AssetRuleChanged',
  AssetRuleRemoved = 'AssetRuleRemoved',
  AssetRulesPaused = 'AssetRulesPaused',
  AssetRulesReplaced = 'AssetRulesReplaced',
  AssetRulesReset = 'AssetRulesReset',
  AssetRulesResumed = 'AssetRulesResumed',
  AssetStatsUpdated = 'AssetStatsUpdated',
  AssetTypeChanged = 'AssetTypeChanged',
  AssetUnfrozen = 'AssetUnfrozen',
  AuthorizationAdded = 'AuthorizationAdded',
  AuthorizationConsumed = 'AuthorizationConsumed',
  AuthorizationRejected = 'AuthorizationRejected',
  AuthorizationRetryLimitReached = 'AuthorizationRetryLimitReached',
  AuthorizationRevoked = 'AuthorizationRevoked',
  AuthorizedPayingKey = 'AuthorizedPayingKey',
  BalanceSet = 'BalanceSet',
  BallotCancelled = 'BallotCancelled',
  BallotCreated = 'BallotCreated',
  BatchCompleted = 'BatchCompleted',
  BatchCompletedOld = 'BatchCompletedOld',
  BatchCompletedWithErrors = 'BatchCompletedWithErrors',
  BatchInterrupted = 'BatchInterrupted',
  BatchInterruptedOld = 'BatchInterruptedOld',
  BatchOptimisticFailed = 'BatchOptimisticFailed',
  BenefitClaimed = 'BenefitClaimed',
  Bonded = 'Bonded',
  BridgeLimitUpdated = 'BridgeLimitUpdated',
  BridgeTxFailed = 'BridgeTxFailed',
  BridgeTxScheduleFailed = 'BridgeTxScheduleFailed',
  BridgeTxScheduled = 'BridgeTxScheduled',
  Bridged = 'Bridged',
  Burned = 'Burned',
  CaaTransferred = 'CAATransferred',
  CaInitiated = 'CAInitiated',
  CaLinkedToDoc = 'CALinkedToDoc',
  CaRemoved = 'CARemoved',
  CallLookupFailed = 'CallLookupFailed',
  CallUnavailable = 'CallUnavailable',
  Called = 'Called',
  Canceled = 'Canceled',
  CddClaimsInvalidated = 'CddClaimsInvalidated',
  CddRequirementForMasterKeyUpdated = 'CddRequirementForMasterKeyUpdated',
  CddRequirementForPrimaryKeyUpdated = 'CddRequirementForPrimaryKeyUpdated',
  CddStatus = 'CddStatus',
  CheckpointCreated = 'CheckpointCreated',
  ChildDidCreated = 'ChildDidCreated',
  ChildDidUnlinked = 'ChildDidUnlinked',
  Chilled = 'Chilled',
  ClaimAdded = 'ClaimAdded',
  ClaimRevoked = 'ClaimRevoked',
  ClassicTickerClaimed = 'ClassicTickerClaimed',
  Cleared = 'Cleared',
  Closed = 'Closed',
  CodeRemoved = 'CodeRemoved',
  CodeStored = 'CodeStored',
  CodeUpdated = 'CodeUpdated',
  CoefficientSet = 'CoefficientSet',
  CommissionCapUpdated = 'CommissionCapUpdated',
  ComplianceRequirementChanged = 'ComplianceRequirementChanged',
  ComplianceRequirementCreated = 'ComplianceRequirementCreated',
  ComplianceRequirementRemoved = 'ComplianceRequirementRemoved',
  ContractCodeUpdated = 'ContractCodeUpdated',
  ContractEmitted = 'ContractEmitted',
  ContractExecution = 'ContractExecution',
  ControllerChanged = 'ControllerChanged',
  ControllerRedemption = 'ControllerRedemption',
  ControllerTransfer = 'ControllerTransfer',
  Created = 'Created',
  CustodyAllowanceChanged = 'CustodyAllowanceChanged',
  CustodyTransfer = 'CustodyTransfer',
  CustomAssetTypeExists = 'CustomAssetTypeExists',
  CustomAssetTypeRegistered = 'CustomAssetTypeRegistered',
  CustomClaimTypeAdded = 'CustomClaimTypeAdded',
  DefaultEnactmentPeriodChanged = 'DefaultEnactmentPeriodChanged',
  DefaultTargetIdentitiesChanged = 'DefaultTargetIdentitiesChanged',
  DefaultWithholdingTaxChanged = 'DefaultWithholdingTaxChanged',
  DelegateCalled = 'DelegateCalled',
  DidCreated = 'DidCreated',
  DidStatus = 'DidStatus',
  DidWithholdingTaxChanged = 'DidWithholdingTaxChanged',
  Dispatched = 'Dispatched',
  DispatchedAs = 'DispatchedAs',
  DividendCanceled = 'DividendCanceled',
  DividendCreated = 'DividendCreated',
  DividendPaidOutToUser = 'DividendPaidOutToUser',
  DividendRemainingClaimed = 'DividendRemainingClaimed',
  DivisibilityChanged = 'DivisibilityChanged',
  DocumentAdded = 'DocumentAdded',
  DocumentRemoved = 'DocumentRemoved',
  Dummy = 'Dummy',
  ElectionFailed = 'ElectionFailed',
  ElectionFinalized = 'ElectionFinalized',
  Endowed = 'Endowed',
  EraPaid = 'EraPaid',
  EraPayout = 'EraPayout',
  Evicted = 'Evicted',
  Executed = 'Executed',
  ExecutionCancellingFailed = 'ExecutionCancellingFailed',
  ExecutionScheduled = 'ExecutionScheduled',
  ExecutionSchedulingFailed = 'ExecutionSchedulingFailed',
  ExemptedUpdated = 'ExemptedUpdated',
  ExemptionListModified = 'ExemptionListModified',
  ExemptionsAdded = 'ExemptionsAdded',
  ExemptionsRemoved = 'ExemptionsRemoved',
  ExpiresAfterUpdated = 'ExpiresAfterUpdated',
  ExpiryScheduled = 'ExpiryScheduled',
  ExpirySchedulingFailed = 'ExpirySchedulingFailed',
  ExtensionAdded = 'ExtensionAdded',
  ExtensionArchived = 'ExtensionArchived',
  ExtensionRemoved = 'ExtensionRemoved',
  ExtensionUnArchive = 'ExtensionUnArchive',
  ExtrinsicFailed = 'ExtrinsicFailed',
  ExtrinsicSuccess = 'ExtrinsicSuccess',
  FailedToExecuteInstruction = 'FailedToExecuteInstruction',
  FeeCharged = 'FeeCharged',
  FeeSet = 'FeeSet',
  FinalVotes = 'FinalVotes',
  ForceEra = 'ForceEra',
  FreezeAdminAdded = 'FreezeAdminAdded',
  FreezeAdminRemoved = 'FreezeAdminRemoved',
  Frozen = 'Frozen',
  FrozenTx = 'FrozenTx',
  FundingRoundSet = 'FundingRoundSet',
  FundraiserClosed = 'FundraiserClosed',
  FundraiserCreated = 'FundraiserCreated',
  FundraiserFrozen = 'FundraiserFrozen',
  FundraiserOffchainFundingEnabled = 'FundraiserOffchainFundingEnabled',
  FundraiserUnfrozen = 'FundraiserUnfrozen',
  FundraiserWindowModifed = 'FundraiserWindowModifed',
  FundraiserWindowModified = 'FundraiserWindowModified',
  FundsMoved = 'FundsMoved',
  FundsMovedBetweenPortfolios = 'FundsMovedBetweenPortfolios',
  FundsRaised = 'FundsRaised',
  FungibleTokensMovedBetweenPortfolios = 'FungibleTokensMovedBetweenPortfolios',
  GlobalCommissionUpdated = 'GlobalCommissionUpdated',
  GlobalMetadataSpecUpdated = 'GlobalMetadataSpecUpdated',
  GroupChanged = 'GroupChanged',
  GroupCreated = 'GroupCreated',
  GroupPermissionsUpdated = 'GroupPermissionsUpdated',
  HeartbeatReceived = 'HeartbeatReceived',
  HistoricalPipsPruned = 'HistoricalPipsPruned',
  IdentifiersUpdated = 'IdentifiersUpdated',
  IndexAssigned = 'IndexAssigned',
  IndexFreed = 'IndexFreed',
  IndexFrozen = 'IndexFrozen',
  IndividualCommissionEnabled = 'IndividualCommissionEnabled',
  Instantiated = 'Instantiated',
  InstantiationFeeChanged = 'InstantiationFeeChanged',
  InstantiationFreezed = 'InstantiationFreezed',
  InstantiationUnFreezed = 'InstantiationUnFreezed',
  InstructionAffirmed = 'InstructionAffirmed',
  InstructionAuthorized = 'InstructionAuthorized',
  InstructionAutomaticallyAffirmed = 'InstructionAutomaticallyAffirmed',
  InstructionCreated = 'InstructionCreated',
  InstructionExecuted = 'InstructionExecuted',
  InstructionFailed = 'InstructionFailed',
  InstructionLocked = 'InstructionLocked',
  InstructionMediators = 'InstructionMediators',
  InstructionRejected = 'InstructionRejected',
  InstructionRescheduled = 'InstructionRescheduled',
  InstructionUnauthorized = 'InstructionUnauthorized',
  InstructionV2Created = 'InstructionV2Created',
  InvalidatedNominators = 'InvalidatedNominators',
  Invested = 'Invested',
  InvestorUniquenessClaimNotAllowed = 'InvestorUniquenessClaimNotAllowed',
  IsIssuable = 'IsIssuable',
  Issued = 'Issued',
  IssuedNft = 'IssuedNFT',
  ItemCompleted = 'ItemCompleted',
  ItemFailed = 'ItemFailed',
  ItnRewardClaimed = 'ItnRewardClaimed',
  KeyChanged = 'KeyChanged',
  Kicked = 'Kicked',
  KilledAccount = 'KilledAccount',
  LegFailedExecution = 'LegFailedExecution',
  LocalMetadataKeyDeleted = 'LocalMetadataKeyDeleted',
  MasterKeyUpdated = 'MasterKeyUpdated',
  MaxDetailsLengthChanged = 'MaxDetailsLengthChanged',
  MaxPipSkipCountChanged = 'MaxPipSkipCountChanged',
  MaximumSchedulesComplexityChanged = 'MaximumSchedulesComplexityChanged',
  MediatorAffirmationReceived = 'MediatorAffirmationReceived',
  MediatorAffirmationWithdrawn = 'MediatorAffirmationWithdrawn',
  MemberAdded = 'MemberAdded',
  MemberRemoved = 'MemberRemoved',
  MemberRevoked = 'MemberRevoked',
  MembersReset = 'MembersReset',
  MembersSwapped = 'MembersSwapped',
  MetaChanged = 'MetaChanged',
  MetadataValueDeleted = 'MetadataValueDeleted',
  MinimumBondThresholdUpdated = 'MinimumBondThresholdUpdated',
  MinimumProposalDepositChanged = 'MinimumProposalDepositChanged',
  MockInvestorUidCreated = 'MockInvestorUIDCreated',
  MovedBetweenPortfolios = 'MovedBetweenPortfolios',
  MultiSigAddedAdmin = 'MultiSigAddedAdmin',
  MultiSigCreated = 'MultiSigCreated',
  MultiSigRemovedAdmin = 'MultiSigRemovedAdmin',
  MultiSigRemovedPayingDid = 'MultiSigRemovedPayingDid',
  MultiSigSignaturesRequiredChanged = 'MultiSigSignaturesRequiredChanged',
  MultiSigSignerAdded = 'MultiSigSignerAdded',
  MultiSigSignerAuthorized = 'MultiSigSignerAuthorized',
  MultiSigSignerRemoved = 'MultiSigSignerRemoved',
  MultiSigSignersAuthorized = 'MultiSigSignersAuthorized',
  MultiSigSignersRemoved = 'MultiSigSignersRemoved',
  MultiSigSignersRequiredChanged = 'MultiSigSignersRequiredChanged',
  NftPortfolioUpdated = 'NFTPortfolioUpdated',
  NfTsMovedBetweenPortfolios = 'NFTsMovedBetweenPortfolios',
  NewAccount = 'NewAccount',
  NewAssetRuleCreated = 'NewAssetRuleCreated',
  NewAuthorities = 'NewAuthorities',
  NewSession = 'NewSession',
  NftCollectionCreated = 'NftCollectionCreated',
  Nominated = 'Nominated',
  Noted = 'Noted',
  OffChainAuthorizationRevoked = 'OffChainAuthorizationRevoked',
  Offence = 'Offence',
  OldSlashingReportDiscarded = 'OldSlashingReportDiscarded',
  Paused = 'Paused',
  PayoutStarted = 'PayoutStarted',
  PendingPipExpiryChanged = 'PendingPipExpiryChanged',
  PeriodicFailed = 'PeriodicFailed',
  PermanentlyOverweight = 'PermanentlyOverweight',
  PermissionedIdentityAdded = 'PermissionedIdentityAdded',
  PermissionedIdentityRemoved = 'PermissionedIdentityRemoved',
  PermissionedValidatorAdded = 'PermissionedValidatorAdded',
  PermissionedValidatorRemoved = 'PermissionedValidatorRemoved',
  PermissionedValidatorStatusChanged = 'PermissionedValidatorStatusChanged',
  PhaseTransitioned = 'PhaseTransitioned',
  PipClosed = 'PipClosed',
  PipSkipped = 'PipSkipped',
  PlaceholderFillBlock = 'PlaceholderFillBlock',
  PortfolioCreated = 'PortfolioCreated',
  PortfolioCustodianChanged = 'PortfolioCustodianChanged',
  PortfolioDeleted = 'PortfolioDeleted',
  PortfolioRenamed = 'PortfolioRenamed',
  PreApprovedAsset = 'PreApprovedAsset',
  PreApprovedPortfolio = 'PreApprovedPortfolio',
  PrimaryIssuanceAgentTransfered = 'PrimaryIssuanceAgentTransfered',
  PrimaryIssuanceAgentTransferred = 'PrimaryIssuanceAgentTransferred',
  PrimaryKeyUpdated = 'PrimaryKeyUpdated',
  ProposalAdded = 'ProposalAdded',
  ProposalApprovalVote = 'ProposalApprovalVote',
  ProposalApproved = 'ProposalApproved',
  ProposalBondAdjusted = 'ProposalBondAdjusted',
  ProposalCoolOffPeriodChanged = 'ProposalCoolOffPeriodChanged',
  ProposalCreated = 'ProposalCreated',
  ProposalDetailsAmended = 'ProposalDetailsAmended',
  ProposalDurationChanged = 'ProposalDurationChanged',
  ProposalExecuted = 'ProposalExecuted',
  ProposalExecutionFailed = 'ProposalExecutionFailed',
  ProposalFailedToExecute = 'ProposalFailedToExecute',
  ProposalRefund = 'ProposalRefund',
  ProposalRejected = 'ProposalRejected',
  ProposalRejectionVote = 'ProposalRejectionVote',
  ProposalStateUpdated = 'ProposalStateUpdated',
  Proposed = 'Proposed',
  PutCodeFlagChanged = 'PutCodeFlagChanged',
  QuorumThresholdChanged = 'QuorumThresholdChanged',
  RcvChanged = 'RCVChanged',
  RangeChanged = 'RangeChanged',
  RangeProofAdded = 'RangeProofAdded',
  RangeProofVerified = 'RangeProofVerified',
  ReceiptClaimed = 'ReceiptClaimed',
  ReceiptUnclaimed = 'ReceiptUnclaimed',
  ReceiptValidityChanged = 'ReceiptValidityChanged',
  Reclaimed = 'Reclaimed',
  RecordDateChanged = 'RecordDateChanged',
  Redeemed = 'Redeemed',
  RedeemedNft = 'RedeemedNFT',
  ReferendumCreated = 'ReferendumCreated',
  ReferendumScheduled = 'ReferendumScheduled',
  ReferendumStateUpdated = 'ReferendumStateUpdated',
  RegisterAssetMetadataGlobalType = 'RegisterAssetMetadataGlobalType',
  RegisterAssetMetadataLocalType = 'RegisterAssetMetadataLocalType',
  Rejected = 'Rejected',
  RelayedTx = 'RelayedTx',
  ReleaseCoordinatorUpdated = 'ReleaseCoordinatorUpdated',
  Remarked = 'Remarked',
  RemoveAssetAffirmationExemption = 'RemoveAssetAffirmationExemption',
  RemovePreApprovedAsset = 'RemovePreApprovedAsset',
  Removed = 'Removed',
  RemovedPayingKey = 'RemovedPayingKey',
  Requested = 'Requested',
  ReserveRepatriated = 'ReserveRepatriated',
  Reserved = 'Reserved',
  Restored = 'Restored',
  Resumed = 'Resumed',
  RevokeCreatePortfoliosPermission = 'RevokeCreatePortfoliosPermission',
  RevokePreApprovedPortfolio = 'RevokePreApprovedPortfolio',
  Reward = 'Reward',
  RewardPaymentSchedulingInterrupted = 'RewardPaymentSchedulingInterrupted',
  Rewarded = 'Rewarded',
  ScRuntimeCall = 'SCRuntimeCall',
  ScheduleCreated = 'ScheduleCreated',
  ScheduleRemoved = 'ScheduleRemoved',
  ScheduleUpdated = 'ScheduleUpdated',
  Scheduled = 'Scheduled',
  SchedulingFailed = 'SchedulingFailed',
  SecondaryKeyLeftIdentity = 'SecondaryKeyLeftIdentity',
  SecondaryKeyPermissionsUpdated = 'SecondaryKeyPermissionsUpdated',
  SecondaryKeysAdded = 'SecondaryKeysAdded',
  SecondaryKeysFrozen = 'SecondaryKeysFrozen',
  SecondaryKeysRemoved = 'SecondaryKeysRemoved',
  SecondaryKeysUnfrozen = 'SecondaryKeysUnfrozen',
  SecondaryPermissionsUpdated = 'SecondaryPermissionsUpdated',
  SetAssetMediators = 'SetAssetMediators',
  SetAssetMetadataValue = 'SetAssetMetadataValue',
  SetAssetMetadataValueDetails = 'SetAssetMetadataValueDetails',
  SetAssetTransferCompliance = 'SetAssetTransferCompliance',
  SettlementManuallyExecuted = 'SettlementManuallyExecuted',
  SignerLeft = 'SignerLeft',
  SigningKeysAdded = 'SigningKeysAdded',
  SigningKeysFrozen = 'SigningKeysFrozen',
  SigningKeysRemoved = 'SigningKeysRemoved',
  SigningKeysUnfrozen = 'SigningKeysUnfrozen',
  SigningPermissionsUpdated = 'SigningPermissionsUpdated',
  Slash = 'Slash',
  SlashReported = 'SlashReported',
  Slashed = 'Slashed',
  SlashingAllowedForChanged = 'SlashingAllowedForChanged',
  SlashingParamsUpdated = 'SlashingParamsUpdated',
  SnapshotCleared = 'SnapshotCleared',
  SnapshotResultsEnacted = 'SnapshotResultsEnacted',
  SnapshotTaken = 'SnapshotTaken',
  SolutionStored = 'SolutionStored',
  SomeOffline = 'SomeOffline',
  StakersElected = 'StakersElected',
  StakingElection = 'StakingElection',
  StakingElectionFailed = 'StakingElectionFailed',
  StatTypesAdded = 'StatTypesAdded',
  StatTypesRemoved = 'StatTypesRemoved',
  Sudid = 'Sudid',
  SudoAsDone = 'SudoAsDone',
  TemplateInstantiationFeeChanged = 'TemplateInstantiationFeeChanged',
  TemplateMetaUrlChanged = 'TemplateMetaUrlChanged',
  TemplateOwnershipTransferred = 'TemplateOwnershipTransferred',
  TemplateUsageFeeChanged = 'TemplateUsageFeeChanged',
  Terminated = 'Terminated',
  TickerLinkedToAsset = 'TickerLinkedToAsset',
  TickerRegistered = 'TickerRegistered',
  TickerTransferred = 'TickerTransferred',
  TickerUnlinkedFromAsset = 'TickerUnlinkedFromAsset',
  TimelockChanged = 'TimelockChanged',
  TransactionAffirmed = 'TransactionAffirmed',
  TransactionCreated = 'TransactionCreated',
  TransactionExecuted = 'TransactionExecuted',
  TransactionFeePaid = 'TransactionFeePaid',
  TransactionRejected = 'TransactionRejected',
  Transfer = 'Transfer',
  TransferConditionExemptionsAdded = 'TransferConditionExemptionsAdded',
  TransferConditionExemptionsRemoved = 'TransferConditionExemptionsRemoved',
  TransferManagerAdded = 'TransferManagerAdded',
  TransferManagerRemoved = 'TransferManagerRemoved',
  TransferWithData = 'TransferWithData',
  TreasuryDidSet = 'TreasuryDidSet',
  TreasuryDisbursement = 'TreasuryDisbursement',
  TreasuryDisbursementFailed = 'TreasuryDisbursementFailed',
  TreasuryReimbursement = 'TreasuryReimbursement',
  TrustedDefaultClaimIssuerAdded = 'TrustedDefaultClaimIssuerAdded',
  TrustedDefaultClaimIssuerRemoved = 'TrustedDefaultClaimIssuerRemoved',
  TxRemoved = 'TxRemoved',
  TxsHandled = 'TxsHandled',
  Unbonded = 'Unbonded',
  UnexpectedError = 'UnexpectedError',
  Unfrozen = 'Unfrozen',
  UnfrozenTx = 'UnfrozenTx',
  Unknown = 'Unknown',
  Unreserved = 'Unreserved',
  UpdatedPolyxLimit = 'UpdatedPolyxLimit',
  UserPortfolios = 'UserPortfolios',
  ValidatorPrefsSet = 'ValidatorPrefsSet',
  VenueCreated = 'VenueCreated',
  VenueDetailsUpdated = 'VenueDetailsUpdated',
  VenueFiltering = 'VenueFiltering',
  VenueSignersUpdated = 'VenueSignersUpdated',
  VenueTypeUpdated = 'VenueTypeUpdated',
  VenueUnauthorized = 'VenueUnauthorized',
  VenueUpdated = 'VenueUpdated',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
  VoteCast = 'VoteCast',
  VoteEnactReferendum = 'VoteEnactReferendum',
  VoteRejectReferendum = 'VoteRejectReferendum',
  VoteRetracted = 'VoteRetracted',
  VoteThresholdUpdated = 'VoteThresholdUpdated',
  Voted = 'Voted',
  Withdrawn = 'Withdrawn',
}
export type EventIdEnumFilter = {
  distinctFrom?: InputMaybe<EventIdEnum>;
  equalTo?: InputMaybe<EventIdEnum>;
  greaterThan?: InputMaybe<EventIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<EventIdEnum>;
  in?: InputMaybe<Array<EventIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<EventIdEnum>;
  lessThanOrEqualTo?: InputMaybe<EventIdEnum>;
  notDistinctFrom?: InputMaybe<EventIdEnum>;
  notEqualTo?: InputMaybe<EventIdEnum>;
  notIn?: InputMaybe<Array<EventIdEnum>>;
};
export enum EventsOrderBy {
  AttributesAsc = 'ATTRIBUTES_ASC',
  AttributesDesc = 'ATTRIBUTES_DESC',
  AttributesTxtAsc = 'ATTRIBUTES_TXT_ASC',
  AttributesTxtDesc = 'ATTRIBUTES_TXT_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  ClaimExpiryAsc = 'CLAIM_EXPIRY_ASC',
  ClaimExpiryDesc = 'CLAIM_EXPIRY_DESC',
  ClaimIssuerAsc = 'CLAIM_ISSUER_ASC',
  ClaimIssuerDesc = 'CLAIM_ISSUER_DESC',
  ClaimScopeAsc = 'CLAIM_SCOPE_ASC',
  ClaimScopeDesc = 'CLAIM_SCOPE_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  CorporateActionTickerAsc = 'CORPORATE_ACTION_TICKER_ASC',
  CorporateActionTickerDesc = 'CORPORATE_ACTION_TICKER_DESC',
  EventArg_0Asc = 'EVENT_ARG_0_ASC',
  EventArg_0Desc = 'EVENT_ARG_0_DESC',
  EventArg_1Asc = 'EVENT_ARG_1_ASC',
  EventArg_1Desc = 'EVENT_ARG_1_DESC',
  EventArg_2Asc = 'EVENT_ARG_2_ASC',
  EventArg_2Desc = 'EVENT_ARG_2_DESC',
  EventArg_3Asc = 'EVENT_ARG_3_ASC',
  EventArg_3Desc = 'EVENT_ARG_3_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  EventIdTextAsc = 'EVENT_ID_TEXT_ASC',
  EventIdTextDesc = 'EVENT_ID_TEXT_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  FundraiserOfferingAssetAsc = 'FUNDRAISER_OFFERING_ASSET_ASC',
  FundraiserOfferingAssetDesc = 'FUNDRAISER_OFFERING_ASSET_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  ModuleIdTextAsc = 'MODULE_ID_TEXT_ASC',
  ModuleIdTextDesc = 'MODULE_ID_TEXT_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  TransferToAsc = 'TRANSFER_TO_ASC',
  TransferToDesc = 'TRANSFER_TO_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Extrinsic = Node & {
  address?: Maybe<Scalars['String']['output']>;
  block?: Maybe<Block>;
  blockId: Scalars['String']['output'];
  blocksByEventExtrinsicIdAndBlockId: Connection<Block>;
  blocksByMultiSigProposalExtrinsicIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalExtrinsicIdAndUpdatedBlockId: Connection<Block>;
  blocksByPolyxTransactionExtrinsicIdAndCreatedBlockId: Connection<Block>;
  blocksByPolyxTransactionExtrinsicIdAndUpdatedBlockId: Connection<Block>;
  callId: CallIdEnum;
  callIdText: Scalars['String']['output'];
  events: Connection<Event>;
  eventsByMultiSigProposalExtrinsicIdAndCreatedEventId: Connection<Event>;
  extrinsicHash?: Maybe<Scalars['String']['output']>;
  extrinsicIdx: Scalars['Int']['output'];
  extrinsicLength: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identitiesByMultiSigProposalExtrinsicIdAndCreatorId: Connection<Identity>;
  moduleId: ModuleIdEnum;
  moduleIdText: Scalars['String']['output'];
  multiSigProposals: Connection<MultiSigProposal>;
  multiSigsByMultiSigProposalExtrinsicIdAndMultisigId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  nonce?: Maybe<Scalars['Int']['output']>;
  params?: Maybe<Scalars['JSON']['output']>;
  paramsTxt: Scalars['String']['output'];
  polyxTransactions: Connection<PolyxTransaction>;
  signed: Scalars['Int']['output'];
  signedbyAddress: Scalars['Int']['output'];
  specVersionId: Scalars['Int']['output'];
  success: Scalars['Int']['output'];
};
export type ExtrinsicFilter = {
  address?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ExtrinsicFilter>>;
  block?: InputMaybe<BlockFilter>;
  blockId?: InputMaybe<StringFilter>;
  callId?: InputMaybe<CallIdEnumFilter>;
  callIdText?: InputMaybe<StringFilter>;
  events?: InputMaybe<OneToManyFilter<EventFilter>>;
  extrinsicHash?: InputMaybe<StringFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  extrinsicLength?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  moduleIdText?: InputMaybe<StringFilter>;
  multiSigProposals?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  nonce?: InputMaybe<IntFilter>;
  not?: InputMaybe<ExtrinsicFilter>;
  or?: InputMaybe<Array<ExtrinsicFilter>>;
  params?: InputMaybe<JsonFilter>;
  paramsTxt?: InputMaybe<StringFilter>;
  polyxTransactions?: InputMaybe<OneToManyFilter<PolyxTransactionFilter>>;
  signed?: InputMaybe<IntFilter>;
  signedbyAddress?: InputMaybe<IntFilter>;
  specVersionId?: InputMaybe<IntFilter>;
  success?: InputMaybe<IntFilter>;
};
export enum ExtrinsicsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  CallIdTextAsc = 'CALL_ID_TEXT_ASC',
  CallIdTextDesc = 'CALL_ID_TEXT_DESC',
  ExtrinsicHashAsc = 'EXTRINSIC_HASH_ASC',
  ExtrinsicHashDesc = 'EXTRINSIC_HASH_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicLengthAsc = 'EXTRINSIC_LENGTH_ASC',
  ExtrinsicLengthDesc = 'EXTRINSIC_LENGTH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  ModuleIdTextAsc = 'MODULE_ID_TEXT_ASC',
  ModuleIdTextDesc = 'MODULE_ID_TEXT_DESC',
  Natural = 'NATURAL',
  NonceAsc = 'NONCE_ASC',
  NonceDesc = 'NONCE_DESC',
  ParamsAsc = 'PARAMS_ASC',
  ParamsDesc = 'PARAMS_DESC',
  ParamsTxtAsc = 'PARAMS_TXT_ASC',
  ParamsTxtDesc = 'PARAMS_TXT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignedbyAddressAsc = 'SIGNEDBY_ADDRESS_ASC',
  SignedbyAddressDesc = 'SIGNEDBY_ADDRESS_DESC',
  SignedAsc = 'SIGNED_ASC',
  SignedDesc = 'SIGNED_DESC',
  SpecVersionIdAsc = 'SPEC_VERSION_ID_ASC',
  SpecVersionIdDesc = 'SPEC_VERSION_ID_DESC',
  SuccessAsc = 'SUCCESS_ASC',
  SuccessDesc = 'SUCCESS_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type FoundType = Node & {
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  rawType: Scalars['String']['output'];
};
export type FoundTypeFilter = {
  and?: InputMaybe<Array<FoundTypeFilter>>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<FoundTypeFilter>;
  or?: InputMaybe<Array<FoundTypeFilter>>;
  rawType?: InputMaybe<StringFilter>;
};
export enum FoundTypesOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RawTypeAsc = 'RAW_TYPE_ASC',
  RawTypeDesc = 'RAW_TYPE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Funding = Node & {
  amount: Scalars['BigFloat']['output'];
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  fundingRound: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  totalFundingAmount: Scalars['BigFloat']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type FundingFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<FundingFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  fundingRound?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<FundingFilter>;
  or?: InputMaybe<Array<FundingFilter>>;
  totalFundingAmount?: InputMaybe<BigFloatFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum FundingsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  FundingRoundAsc = 'FUNDING_ROUND_ASC',
  FundingRoundDesc = 'FUNDING_ROUND_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TotalFundingAmountAsc = 'TOTAL_FUNDING_AMOUNT_ASC',
  TotalFundingAmountDesc = 'TOTAL_FUNDING_AMOUNT_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type HavingBigfloatFilter = {
  equalTo?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThan?: InputMaybe<Scalars['BigFloat']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThan?: InputMaybe<Scalars['BigFloat']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
  notEqualTo?: InputMaybe<Scalars['BigFloat']['input']>;
};
export type HavingDatetimeFilter = {
  equalTo?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThan?: InputMaybe<Scalars['Datetime']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  lessThan?: InputMaybe<Scalars['Datetime']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
  notEqualTo?: InputMaybe<Scalars['Datetime']['input']>;
};
export type HavingIntFilter = {
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
};
export enum IdentitiesOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  DidAsc = 'DID_ASC',
  DidDesc = 'DID_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryAccountAsc = 'PRIMARY_ACCOUNT_ASC',
  PrimaryAccountDesc = 'PRIMARY_ACCOUNT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SecondaryKeysFrozenAsc = 'SECONDARY_KEYS_FROZEN_ASC',
  SecondaryKeysFrozenDesc = 'SECONDARY_KEYS_FROZEN_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Identity = Node & {
  accountsByMultiSigCreatorIdAndCreatorAccountId: Connection<Account>;
  assetMandatoryMediatorsByAddedById: Connection<AssetMandatoryMediator>;
  assetPreApprovals: Connection<AssetPreApproval>;
  assetsByAssetHolderIdentityIdAndAssetId: Connection<Asset>;
  assetsByAssetMandatoryMediatorAddedByIdAndAssetId: Connection<Asset>;
  assetsByAssetPreApprovalIdentityIdAndAssetId: Connection<Asset>;
  assetsByDistributionIdentityIdAndAssetId: Connection<Asset>;
  assetsByDistributionIdentityIdAndCurrencyId: Connection<Asset>;
  assetsByNftHolderIdentityIdAndAssetId: Connection<Asset>;
  assetsByOwnerId: Connection<Asset>;
  assetsByStatTypeClaimIssuerIdAndAssetId: Connection<Asset>;
  assetsByStoCreatorIdAndOfferingAssetId: Connection<Asset>;
  assetsByTickerExternalAgentActionCallerIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentCallerIdAndAssetId: Connection<Asset>;
  assetsByTickerExternalAgentHistoryIdentityIdAndAssetId: Connection<Asset>;
  assetsByTransferComplianceClaimIssuerIdAndAssetId: Connection<Asset>;
  authorizationsByFromId: Connection<Authorization>;
  blocksByAccountIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByAccountIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetHolderIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetHolderIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorAddedByIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetMandatoryMediatorAddedByIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetOwnerIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetOwnerIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetPreApprovalIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByAuthorizationFromIdAndCreatedBlockId: Connection<Block>;
  blocksByAuthorizationFromIdAndUpdatedBlockId: Connection<Block>;
  blocksByBridgeEventIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByBridgeEventIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByChildIdentityChildIdAndCreatedBlockId: Connection<Block>;
  blocksByChildIdentityChildIdAndUpdatedBlockId: Connection<Block>;
  blocksByChildIdentityParentIdAndCreatedBlockId: Connection<Block>;
  blocksByChildIdentityParentIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimIssuerIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimIssuerIdAndUpdatedBlockId: Connection<Block>;
  blocksByClaimTargetIdAndCreatedBlockId: Connection<Block>;
  blocksByClaimTargetIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAccountCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAccountCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialAssetCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialAssetCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialTransactionAffirmationIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByConfidentialVenueCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByConfidentialVenueCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByCustomClaimTypeIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByCustomClaimTypeIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionPaymentTargetIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionPaymentTargetIdAndUpdatedBlockId: Connection<Block>;
  blocksByInvestmentInvestorIdAndCreatedBlockId: Connection<Block>;
  blocksByInvestmentInvestorIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByNftHolderIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByNftHolderIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioCustodianIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioCustodianIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByProposalOwnerIdAndCreatedBlockId: Connection<Block>;
  blocksByProposalOwnerIdAndUpdatedBlockId: Connection<Block>;
  blocksByStakingEventIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByStakingEventIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByStatTypeClaimIssuerIdAndCreatedBlockId: Connection<Block>;
  blocksByStatTypeClaimIssuerIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoCreatorIdAndCreatedBlockId: Connection<Block>;
  blocksByStoCreatorIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionCallerIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentActionCallerIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentCallerIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentCallerIdAndUpdatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryIdentityIdAndCreatedBlockId: Connection<Block>;
  blocksByTickerExternalAgentHistoryIdentityIdAndUpdatedBlockId: Connection<Block>;
  blocksByTransferComplianceClaimIssuerIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceClaimIssuerIdAndUpdatedBlockId: Connection<Block>;
  blocksByVenueOwnerIdAndCreatedBlockId: Connection<Block>;
  blocksByVenueOwnerIdAndUpdatedBlockId: Connection<Block>;
  bridgeEvents: Connection<BridgeEvent>;
  children: Connection<ChildIdentity>;
  claimsByIssuerId: ClaimsConnection;
  claimsByTargetId: ClaimsConnection;
  confidentialAccountsByConfidentialTransactionAffirmationIdentityIdAndAccountId: Connection<ConfidentialAccount>;
  confidentialAccountsByCreatorId: Connection<ConfidentialAccount>;
  confidentialAssetsByCreatorId: Connection<ConfidentialAsset>;
  confidentialTransactionAffirmations: Connection<ConfidentialTransactionAffirmation>;
  confidentialTransactionsByConfidentialTransactionAffirmationIdentityIdAndTransactionId: Connection<ConfidentialTransaction>;
  confidentialVenuesByCreatorId: Connection<ConfidentialVenue>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  customClaimTypes: Connection<CustomClaimType>;
  customClaimTypesByClaimIssuerIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByClaimTargetIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  customClaimTypesByStatTypeClaimIssuerIdAndCustomClaimTypeId: Connection<CustomClaimType>;
  datetime: Scalars['Datetime']['output'];
  did: Scalars['String']['output'];
  distributionPaymentsByTargetId: Connection<DistributionPayment>;
  distributions: Connection<Distribution>;
  distributionsByDistributionPaymentTargetIdAndDistributionId: Connection<Distribution>;
  eventId: EventIdEnum;
  eventsByAssetOwnerIdAndCreatedEventId: Connection<Event>;
  eventsByAuthorizationFromIdAndCreatedEventId: Connection<Event>;
  eventsByBridgeEventIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByClaimIssuerIdAndCreatedEventId: Connection<Event>;
  eventsByClaimTargetIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAccountCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialAssetCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialTransactionAffirmationIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByConfidentialVenueCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByDistributionPaymentTargetIdAndCreatedEventId: Connection<Event>;
  eventsByMultiSigProposalCreatorIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioCustodianIdAndCreatedEventId: Connection<Event>;
  eventsByPortfolioIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByStakingEventIdentityIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentActionCallerIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentCallerIdAndCreatedEventId: Connection<Event>;
  eventsByTickerExternalAgentHistoryIdentityIdAndCreatedEventId: Connection<Event>;
  extrinsicsByMultiSigProposalCreatorIdAndExtrinsicId: Connection<Extrinsic>;
  heldAssets: Connection<AssetHolder>;
  heldNfts: Connection<NftHolder>;
  id: Scalars['String']['output'];
  identitiesByChildIdentityChildIdAndParentId: Connection<Identity>;
  identitiesByChildIdentityParentIdAndChildId: Connection<Identity>;
  identitiesByClaimIssuerIdAndTargetId: Connection<Identity>;
  identitiesByClaimTargetIdAndIssuerId: Connection<Identity>;
  identitiesByPortfolioCustodianIdAndIdentityId: Connection<Identity>;
  identitiesByPortfolioIdentityIdAndCustodianId: Connection<Identity>;
  investmentsByInvestorId: Connection<Investment>;
  multiSigProposalsByCreatorId: Connection<MultiSigProposal>;
  multiSigsByCreatorId: Connection<MultiSig>;
  multiSigsByMultiSigProposalCreatorIdAndMultisigId: Connection<MultiSig>;
  nodeId: Scalars['ID']['output'];
  parentChildIdentities: Connection<ChildIdentity>;
  permissionsByAccountIdentityIdAndPermissionsId: Connection<Permission>;
  portfolios: Connection<Portfolio>;
  portfoliosByCustodianId: Connection<Portfolio>;
  portfoliosByDistributionIdentityIdAndPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatorIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoCreatorIdAndRaisingPortfolioId: Connection<Portfolio>;
  primaryAccount: Scalars['String']['output'];
  proposalsByOwnerId: Connection<Proposal>;
  secondaryAccounts: Connection<Account>;
  secondaryKeysFrozen: Scalars['Boolean']['output'];
  stakingEvents: Connection<StakingEvent>;
  statTypesByClaimIssuerId: Connection<StatType>;
  statTypesByTransferComplianceClaimIssuerIdAndStatTypeId: Connection<StatType>;
  stosByCreatorId: Connection<Sto>;
  tickerExternalAgentActionsByCallerId: Connection<TickerExternalAgentAction>;
  tickerExternalAgentHistories: Connection<TickerExternalAgentHistory>;
  tickerExternalAgentsByCallerId: Connection<TickerExternalAgent>;
  transferCompliancesByClaimIssuerId: Connection<TransferCompliance>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venuesByOwnerId: Connection<Venue>;
  venuesByStoCreatorIdAndVenueId: Connection<Venue>;
};
export type IdentityFilter = {
  and?: InputMaybe<Array<IdentityFilter>>;
  assetMandatoryMediatorsByAddedById?: InputMaybe<OneToManyFilter<AssetMandatoryMediatorFilter>>;
  assetPreApprovals?: InputMaybe<OneToManyFilter<AssetPreApprovalFilter>>;
  assetsByOwnerId?: InputMaybe<OneToManyFilter<AssetFilter>>;
  authorizationsByFromId?: InputMaybe<OneToManyFilter<AuthorizationFilter>>;
  bridgeEvents?: InputMaybe<OneToManyFilter<BridgeEventFilter>>;
  children?: InputMaybe<OneToManyFilter<ChildIdentityFilter>>;
  claimsByIssuerId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  claimsByTargetId?: InputMaybe<OneToManyFilter<ClaimFilter>>;
  confidentialAccountsByCreatorId?: InputMaybe<OneToManyFilter<ConfidentialAccountFilter>>;
  confidentialAssetsByCreatorId?: InputMaybe<OneToManyFilter<ConfidentialAssetFilter>>;
  confidentialTransactionAffirmations?: InputMaybe<
    OneToManyFilter<ConfidentialTransactionAffirmationFilter>
  >;
  confidentialVenuesByCreatorId?: InputMaybe<OneToManyFilter<ConfidentialVenueFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  customClaimTypes?: InputMaybe<OneToManyFilter<CustomClaimTypeFilter>>;
  datetime?: InputMaybe<DatetimeFilter>;
  did?: InputMaybe<StringFilter>;
  distributionPaymentsByTargetId?: InputMaybe<OneToManyFilter<DistributionPaymentFilter>>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  heldAssets?: InputMaybe<OneToManyFilter<AssetHolderFilter>>;
  heldNfts?: InputMaybe<OneToManyFilter<NftHolderFilter>>;
  id?: InputMaybe<StringFilter>;
  investmentsByInvestorId?: InputMaybe<OneToManyFilter<InvestmentFilter>>;
  multiSigProposalsByCreatorId?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  multiSigsByCreatorId?: InputMaybe<OneToManyFilter<MultiSigFilter>>;
  not?: InputMaybe<IdentityFilter>;
  or?: InputMaybe<Array<IdentityFilter>>;
  parentChildIdentities?: InputMaybe<OneToManyFilter<ChildIdentityFilter>>;
  portfolios?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  portfoliosByCustodianId?: InputMaybe<OneToManyFilter<PortfolioFilter>>;
  primaryAccount?: InputMaybe<StringFilter>;
  proposalsByOwnerId?: InputMaybe<OneToManyFilter<ProposalFilter>>;
  secondaryAccounts?: InputMaybe<OneToManyFilter<AccountFilter>>;
  secondaryKeysFrozen?: InputMaybe<BooleanFilter>;
  stakingEvents?: InputMaybe<OneToManyFilter<StakingEventFilter>>;
  statTypesByClaimIssuerId?: InputMaybe<OneToManyFilter<StatTypeFilter>>;
  stosByCreatorId?: InputMaybe<OneToManyFilter<StoFilter>>;
  tickerExternalAgentActionsByCallerId?: InputMaybe<
    OneToManyFilter<TickerExternalAgentActionFilter>
  >;
  tickerExternalAgentHistories?: InputMaybe<OneToManyFilter<TickerExternalAgentHistoryFilter>>;
  tickerExternalAgentsByCallerId?: InputMaybe<OneToManyFilter<TickerExternalAgentFilter>>;
  transferCompliancesByClaimIssuerId?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  venuesByOwnerId?: InputMaybe<OneToManyFilter<VenueFilter>>;
};
export type Instruction = Node & {
  affirmations: Connection<InstructionAffirmation>;
  assetTransactions: Connection<AssetTransaction>;
  assetsByAssetTransactionInstructionIdAndAssetId: Connection<Asset>;
  blocksByAssetTransactionInstructionIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionInstructionIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationInstructionIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationInstructionIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionEventInstructionIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionEventInstructionIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionPartyInstructionIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionPartyInstructionIdAndUpdatedBlockId: Connection<Block>;
  blocksByLegInstructionIdAndCreatedBlockId: Connection<Block>;
  blocksByLegInstructionIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  endAfterBlock?: Maybe<Scalars['Int']['output']>;
  endBlock?: Maybe<Scalars['Int']['output']>;
  events: Connection<InstructionEvent>;
  eventsByAssetTransactionInstructionIdAndCreatedEventId: Connection<Event>;
  eventsByInstructionEventInstructionIdAndCreatedEventId: Connection<Event>;
  failureReason?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  instructionPartiesByInstructionAffirmationInstructionIdAndPartyId: Connection<InstructionParty>;
  legs: Connection<Leg>;
  mediators: Scalars['JSON']['output'];
  memo?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationInstructionIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  offChainReceiptsByInstructionEventInstructionIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  parties: Connection<InstructionParty>;
  portfoliosByAssetTransactionInstructionIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionInstructionIdAndToPortfolioId: Connection<Portfolio>;
  status: InstructionStatusEnum;
  tradeDate?: Maybe<Scalars['Datetime']['output']>;
  type: InstructionTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  valueDate?: Maybe<Scalars['Datetime']['output']>;
  venue?: Maybe<Venue>;
  venueId?: Maybe<Scalars['String']['output']>;
};
export type InstructionAffirmation = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  expiry?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  identity: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  isAutomaticallyAffirmed: Scalars['Boolean']['output'];
  isMediator: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptId?: Maybe<Scalars['String']['output']>;
  party?: Maybe<InstructionParty>;
  partyId: Scalars['String']['output'];
  portfolios?: Maybe<Scalars['JSON']['output']>;
  status: AffirmStatusEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type InstructionAffirmationFilter = {
  and?: InputMaybe<Array<InstructionAffirmationFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  expiry?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  isAutomaticallyAffirmed?: InputMaybe<BooleanFilter>;
  isMediator?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<InstructionAffirmationFilter>;
  offChainReceipt?: InputMaybe<OffChainReceiptFilter>;
  offChainReceiptExists?: InputMaybe<Scalars['Boolean']['input']>;
  offChainReceiptId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InstructionAffirmationFilter>>;
  party?: InputMaybe<InstructionPartyFilter>;
  partyId?: InputMaybe<StringFilter>;
  portfolios?: InputMaybe<JsonFilter>;
  status?: InputMaybe<AffirmStatusEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum InstructionAffirmationsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  ExpiryAsc = 'EXPIRY_ASC',
  ExpiryDesc = 'EXPIRY_DESC',
  IdentityAsc = 'IDENTITY_ASC',
  IdentityDesc = 'IDENTITY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  IsAutomaticallyAffirmedAsc = 'IS_AUTOMATICALLY_AFFIRMED_ASC',
  IsAutomaticallyAffirmedDesc = 'IS_AUTOMATICALLY_AFFIRMED_DESC',
  IsMediatorAsc = 'IS_MEDIATOR_ASC',
  IsMediatorDesc = 'IS_MEDIATOR_DESC',
  Natural = 'NATURAL',
  OffChainReceiptIdAsc = 'OFF_CHAIN_RECEIPT_ID_ASC',
  OffChainReceiptIdDesc = 'OFF_CHAIN_RECEIPT_ID_DESC',
  PartyIdAsc = 'PARTY_ID_ASC',
  PartyIdDesc = 'PARTY_ID_DESC',
  PortfoliosAsc = 'PORTFOLIOS_ASC',
  PortfoliosDesc = 'PORTFOLIOS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionEvent = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  event: InstructionEventEnum;
  eventIdx: Scalars['Int']['output'];
  failureReason?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  identity?: Maybe<Scalars['String']['output']>;
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptId?: Maybe<Scalars['String']['output']>;
  portfolio?: Maybe<Scalars['Int']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export enum InstructionEventEnum {
  AffirmationWithdrawn = 'AffirmationWithdrawn',
  FailedToExecuteInstruction = 'FailedToExecuteInstruction',
  InstructionAffirmed = 'InstructionAffirmed',
  InstructionAutomaticallyAffirmed = 'InstructionAutomaticallyAffirmed',
  InstructionCreated = 'InstructionCreated',
  InstructionExecuted = 'InstructionExecuted',
  InstructionFailed = 'InstructionFailed',
  InstructionLocked = 'InstructionLocked',
  InstructionMediators = 'InstructionMediators',
  InstructionRejected = 'InstructionRejected',
  InstructionRescheduled = 'InstructionRescheduled',
  LegFailedExecution = 'LegFailedExecution',
  MediatorAffirmationReceived = 'MediatorAffirmationReceived',
  MediatorAffirmationWithdrawn = 'MediatorAffirmationWithdrawn',
  ReceiptClaimed = 'ReceiptClaimed',
  SchedulingFailed = 'SchedulingFailed',
  SettlementManuallyExecuted = 'SettlementManuallyExecuted',
  VenueCreated = 'VenueCreated',
  VenueDetailsUpdated = 'VenueDetailsUpdated',
  VenueFiltering = 'VenueFiltering',
  VenueSignersUpdated = 'VenueSignersUpdated',
  VenueTypeUpdated = 'VenueTypeUpdated',
  VenueUnauthorized = 'VenueUnauthorized',
  VenuesAllowed = 'VenuesAllowed',
  VenuesBlocked = 'VenuesBlocked',
}
export type InstructionEventEnumFilter = {
  distinctFrom?: InputMaybe<InstructionEventEnum>;
  equalTo?: InputMaybe<InstructionEventEnum>;
  greaterThan?: InputMaybe<InstructionEventEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionEventEnum>;
  in?: InputMaybe<Array<InstructionEventEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionEventEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionEventEnum>;
  notDistinctFrom?: InputMaybe<InstructionEventEnum>;
  notEqualTo?: InputMaybe<InstructionEventEnum>;
  notIn?: InputMaybe<Array<InstructionEventEnum>>;
};
export type InstructionEventFilter = {
  and?: InputMaybe<Array<InstructionEventFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  event?: InputMaybe<InstructionEventEnumFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  failureReason?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  not?: InputMaybe<InstructionEventFilter>;
  offChainReceipt?: InputMaybe<OffChainReceiptFilter>;
  offChainReceiptExists?: InputMaybe<Scalars['Boolean']['input']>;
  offChainReceiptId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<InstructionEventFilter>>;
  portfolio?: InputMaybe<IntFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum InstructionEventsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventAsc = 'EVENT_ASC',
  EventDesc = 'EVENT_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  FailureReasonAsc = 'FAILURE_REASON_ASC',
  FailureReasonDesc = 'FAILURE_REASON_DESC',
  IdentityAsc = 'IDENTITY_ASC',
  IdentityDesc = 'IDENTITY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  Natural = 'NATURAL',
  OffChainReceiptIdAsc = 'OFF_CHAIN_RECEIPT_ID_ASC',
  OffChainReceiptIdDesc = 'OFF_CHAIN_RECEIPT_ID_DESC',
  PortfolioAsc = 'PORTFOLIO_ASC',
  PortfolioDesc = 'PORTFOLIO_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionFilter = {
  affirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  and?: InputMaybe<Array<InstructionFilter>>;
  assetTransactions?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  endAfterBlock?: InputMaybe<IntFilter>;
  endBlock?: InputMaybe<IntFilter>;
  events?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  failureReason?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  legs?: InputMaybe<OneToManyFilter<LegFilter>>;
  mediators?: InputMaybe<JsonFilter>;
  memo?: InputMaybe<StringFilter>;
  not?: InputMaybe<InstructionFilter>;
  or?: InputMaybe<Array<InstructionFilter>>;
  parties?: InputMaybe<OneToManyFilter<InstructionPartyFilter>>;
  status?: InputMaybe<InstructionStatusEnumFilter>;
  tradeDate?: InputMaybe<DatetimeFilter>;
  type?: InputMaybe<InstructionTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  valueDate?: InputMaybe<DatetimeFilter>;
  venue?: InputMaybe<VenueFilter>;
  venueExists?: InputMaybe<Scalars['Boolean']['input']>;
  venueId?: InputMaybe<StringFilter>;
};
export enum InstructionPartiesOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityAsc = 'IDENTITY_ASC',
  IdentityDesc = 'IDENTITY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  IsMediatorAsc = 'IS_MEDIATOR_ASC',
  IsMediatorDesc = 'IS_MEDIATOR_DESC',
  Natural = 'NATURAL',
  PortfoliosAsc = 'PORTFOLIOS_ASC',
  PortfoliosDesc = 'PORTFOLIOS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type InstructionParty = Node & {
  affirmations: Connection<InstructionAffirmation>;
  blocksByInstructionAffirmationPartyIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationPartyIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  instructionsByInstructionAffirmationPartyIdAndInstructionId: Connection<Instruction>;
  isMediator: Scalars['Boolean']['output'];
  nodeId: Scalars['ID']['output'];
  offChainReceiptsByInstructionAffirmationPartyIdAndOffChainReceiptId: Connection<OffChainReceipt>;
  portfolios?: Maybe<Scalars['JSON']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type InstructionPartyFilter = {
  affirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  and?: InputMaybe<Array<InstructionPartyFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  isMediator?: InputMaybe<BooleanFilter>;
  not?: InputMaybe<InstructionPartyFilter>;
  or?: InputMaybe<Array<InstructionPartyFilter>>;
  portfolios?: InputMaybe<JsonFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum InstructionStatusEnum {
  Created = 'Created',
  Executed = 'Executed',
  Failed = 'Failed',
  Locked = 'Locked',
  Rejected = 'Rejected',
}
export type InstructionStatusEnumFilter = {
  distinctFrom?: InputMaybe<InstructionStatusEnum>;
  equalTo?: InputMaybe<InstructionStatusEnum>;
  greaterThan?: InputMaybe<InstructionStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionStatusEnum>;
  in?: InputMaybe<Array<InstructionStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionStatusEnum>;
  notDistinctFrom?: InputMaybe<InstructionStatusEnum>;
  notEqualTo?: InputMaybe<InstructionStatusEnum>;
  notIn?: InputMaybe<Array<InstructionStatusEnum>>;
};
export enum InstructionTypeEnum {
  SettleAfterLock = 'SettleAfterLock',
  SettleManual = 'SettleManual',
  SettleOnAffirmation = 'SettleOnAffirmation',
  SettleOnBlock = 'SettleOnBlock',
}
export type InstructionTypeEnumFilter = {
  distinctFrom?: InputMaybe<InstructionTypeEnum>;
  equalTo?: InputMaybe<InstructionTypeEnum>;
  greaterThan?: InputMaybe<InstructionTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<InstructionTypeEnum>;
  in?: InputMaybe<Array<InstructionTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<InstructionTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<InstructionTypeEnum>;
  notDistinctFrom?: InputMaybe<InstructionTypeEnum>;
  notEqualTo?: InputMaybe<InstructionTypeEnum>;
  notIn?: InputMaybe<Array<InstructionTypeEnum>>;
};
export enum InstructionsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EndAfterBlockAsc = 'END_AFTER_BLOCK_ASC',
  EndAfterBlockDesc = 'END_AFTER_BLOCK_DESC',
  EndBlockAsc = 'END_BLOCK_ASC',
  EndBlockDesc = 'END_BLOCK_DESC',
  FailureReasonAsc = 'FAILURE_REASON_ASC',
  FailureReasonDesc = 'FAILURE_REASON_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MediatorsAsc = 'MEDIATORS_ASC',
  MediatorsDesc = 'MEDIATORS_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  TradeDateAsc = 'TRADE_DATE_ASC',
  TradeDateDesc = 'TRADE_DATE_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  ValueDateAsc = 'VALUE_DATE_ASC',
  ValueDateDesc = 'VALUE_DATE_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type IntFilter = {
  distinctFrom?: InputMaybe<Scalars['Int']['input']>;
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  greaterThan?: InputMaybe<Scalars['Int']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['Int']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
  notIn?: InputMaybe<Array<Scalars['Int']['input']>>;
};
export type Investment = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  id: Scalars['String']['output'];
  investor?: Maybe<Identity>;
  investorId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offeringAssetId: Scalars['String']['output'];
  offeringToken: Scalars['String']['output'];
  offeringTokenAmount: Scalars['BigFloat']['output'];
  raiseToken: Scalars['String']['output'];
  raiseTokenAmount: Scalars['BigFloat']['output'];
  raisingAssetId: Scalars['String']['output'];
  raisingAssetType: RaisingAssetTypeEnum;
  stoId: Scalars['Int']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type InvestmentFilter = {
  and?: InputMaybe<Array<InvestmentFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  investor?: InputMaybe<IdentityFilter>;
  investorId?: InputMaybe<StringFilter>;
  not?: InputMaybe<InvestmentFilter>;
  offeringAssetId?: InputMaybe<StringFilter>;
  offeringToken?: InputMaybe<StringFilter>;
  offeringTokenAmount?: InputMaybe<BigFloatFilter>;
  or?: InputMaybe<Array<InvestmentFilter>>;
  raiseToken?: InputMaybe<StringFilter>;
  raiseTokenAmount?: InputMaybe<BigFloatFilter>;
  raisingAssetId?: InputMaybe<StringFilter>;
  raisingAssetType?: InputMaybe<RaisingAssetTypeEnumFilter>;
  stoId?: InputMaybe<IntFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum InvestmentsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InvestorIdAsc = 'INVESTOR_ID_ASC',
  InvestorIdDesc = 'INVESTOR_ID_DESC',
  Natural = 'NATURAL',
  OfferingAssetIdAsc = 'OFFERING_ASSET_ID_ASC',
  OfferingAssetIdDesc = 'OFFERING_ASSET_ID_DESC',
  OfferingTokenAmountAsc = 'OFFERING_TOKEN_AMOUNT_ASC',
  OfferingTokenAmountDesc = 'OFFERING_TOKEN_AMOUNT_DESC',
  OfferingTokenAsc = 'OFFERING_TOKEN_ASC',
  OfferingTokenDesc = 'OFFERING_TOKEN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RaiseTokenAmountAsc = 'RAISE_TOKEN_AMOUNT_ASC',
  RaiseTokenAmountDesc = 'RAISE_TOKEN_AMOUNT_DESC',
  RaiseTokenAsc = 'RAISE_TOKEN_ASC',
  RaiseTokenDesc = 'RAISE_TOKEN_DESC',
  RaisingAssetIdAsc = 'RAISING_ASSET_ID_ASC',
  RaisingAssetIdDesc = 'RAISING_ASSET_ID_DESC',
  RaisingAssetTypeAsc = 'RAISING_ASSET_TYPE_ASC',
  RaisingAssetTypeDesc = 'RAISING_ASSET_TYPE_DESC',
  StoIdAsc = 'STO_ID_ASC',
  StoIdDesc = 'STO_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type JsonFilter = {
  containedBy?: InputMaybe<Scalars['JSON']['input']>;
  contains?: InputMaybe<Scalars['JSON']['input']>;
  containsAllKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  containsAnyKeys?: InputMaybe<Array<Scalars['String']['input']>>;
  containsKey?: InputMaybe<Scalars['String']['input']>;
  distinctFrom?: InputMaybe<Scalars['JSON']['input']>;
  equalTo?: InputMaybe<Scalars['JSON']['input']>;
  greaterThan?: InputMaybe<Scalars['JSON']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<Scalars['JSON']['input']>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['JSON']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['JSON']['input']>;
  notEqualTo?: InputMaybe<Scalars['JSON']['input']>;
  notIn?: InputMaybe<Array<Scalars['JSON']['input']>>;
};
export type Leg = Node & {
  addresses: Scalars['JSON']['output'];
  amount?: Maybe<Scalars['BigFloat']['output']>;
  assetId: Scalars['String']['output'];
  blocksByOffChainReceiptLegIdAndCreatedBlockId: Connection<Block>;
  blocksByOffChainReceiptLegIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  from: Scalars['String']['output'];
  fromPortfolio?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  instruction?: Maybe<Instruction>;
  instructionId: Scalars['String']['output'];
  legIndex: Scalars['Int']['output'];
  legType: LegTypeEnum;
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  offChainReceipts: Connection<OffChainReceipt>;
  ticker?: Maybe<Scalars['String']['output']>;
  to: Scalars['String']['output'];
  toPortfolio?: Maybe<Scalars['Int']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type LegFilter = {
  addresses?: InputMaybe<JsonFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<LegFilter>>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  from?: InputMaybe<StringFilter>;
  fromPortfolio?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  instruction?: InputMaybe<InstructionFilter>;
  instructionId?: InputMaybe<StringFilter>;
  legIndex?: InputMaybe<IntFilter>;
  legType?: InputMaybe<LegTypeEnumFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<LegFilter>;
  offChainReceipts?: InputMaybe<OneToManyFilter<OffChainReceiptFilter>>;
  or?: InputMaybe<Array<LegFilter>>;
  ticker?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  toPortfolio?: InputMaybe<IntFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum LegTypeEnum {
  Fungible = 'Fungible',
  NonFungible = 'NonFungible',
  OffChain = 'OffChain',
}
export type LegTypeEnumFilter = {
  distinctFrom?: InputMaybe<LegTypeEnum>;
  equalTo?: InputMaybe<LegTypeEnum>;
  greaterThan?: InputMaybe<LegTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<LegTypeEnum>;
  in?: InputMaybe<Array<LegTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<LegTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<LegTypeEnum>;
  notDistinctFrom?: InputMaybe<LegTypeEnum>;
  notEqualTo?: InputMaybe<LegTypeEnum>;
  notIn?: InputMaybe<Array<LegTypeEnum>>;
};
export enum LegsOrderBy {
  AddressesAsc = 'ADDRESSES_ASC',
  AddressesDesc = 'ADDRESSES_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  FromAsc = 'FROM_ASC',
  FromDesc = 'FROM_DESC',
  FromPortfolioAsc = 'FROM_PORTFOLIO_ASC',
  FromPortfolioDesc = 'FROM_PORTFOLIO_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  InstructionIdAsc = 'INSTRUCTION_ID_ASC',
  InstructionIdDesc = 'INSTRUCTION_ID_DESC',
  LegIndexAsc = 'LEG_INDEX_ASC',
  LegIndexDesc = 'LEG_INDEX_DESC',
  LegTypeAsc = 'LEG_TYPE_ASC',
  LegTypeDesc = 'LEG_TYPE_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TickerAsc = 'TICKER_ASC',
  TickerDesc = 'TICKER_DESC',
  ToAsc = 'TO_ASC',
  ToDesc = 'TO_DESC',
  ToPortfolioAsc = 'TO_PORTFOLIO_ASC',
  ToPortfolioDesc = 'TO_PORTFOLIO_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Migration = Node & {
  executed: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  processedBlock: Scalars['Int']['output'];
  version: Scalars['String']['output'];
};
export type MigrationFilter = {
  and?: InputMaybe<Array<MigrationFilter>>;
  executed?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MigrationFilter>;
  number?: InputMaybe<IntFilter>;
  or?: InputMaybe<Array<MigrationFilter>>;
  processedBlock?: InputMaybe<IntFilter>;
  version?: InputMaybe<StringFilter>;
};
export enum MigrationsOrderBy {
  ExecutedAsc = 'EXECUTED_ASC',
  ExecutedDesc = 'EXECUTED_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NumberAsc = 'NUMBER_ASC',
  NumberDesc = 'NUMBER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProcessedBlockAsc = 'PROCESSED_BLOCK_ASC',
  ProcessedBlockDesc = 'PROCESSED_BLOCK_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ModuleIdEnum {
  Asset = 'asset',
  Authoritydiscovery = 'authoritydiscovery',
  Authorship = 'authorship',
  Babe = 'babe',
  Balances = 'balances',
  Base = 'base',
  Bridge = 'bridge',
  Capitaldistribution = 'capitaldistribution',
  Cddserviceproviders = 'cddserviceproviders',
  Checkpoint = 'checkpoint',
  Committeemembership = 'committeemembership',
  Compliancemanager = 'compliancemanager',
  Confidential = 'confidential',
  Confidentialasset = 'confidentialasset',
  Contracts = 'contracts',
  Corporateaction = 'corporateaction',
  Corporateballot = 'corporateballot',
  Dividend = 'dividend',
  Electionprovidermultiphase = 'electionprovidermultiphase',
  Exemption = 'exemption',
  Externalagents = 'externalagents',
  Finalitytracker = 'finalitytracker',
  Grandpa = 'grandpa',
  Historical = 'historical',
  Identity = 'identity',
  Imonline = 'imonline',
  Indices = 'indices',
  Multisig = 'multisig',
  Nft = 'nft',
  Offences = 'offences',
  Permissions = 'permissions',
  Pips = 'pips',
  Polymeshcommittee = 'polymeshcommittee',
  Polymeshcontracts = 'polymeshcontracts',
  Portfolio = 'portfolio',
  Preimage = 'preimage',
  Protocolfee = 'protocolfee',
  Randomnesscollectiveflip = 'randomnesscollectiveflip',
  Relayer = 'relayer',
  Rewards = 'rewards',
  Scheduler = 'scheduler',
  Session = 'session',
  Settlement = 'settlement',
  Staking = 'staking',
  Statetriemigration = 'statetriemigration',
  Statistics = 'statistics',
  Sto = 'sto',
  Stocapped = 'stocapped',
  Sudo = 'sudo',
  System = 'system',
  Technicalcommittee = 'technicalcommittee',
  Technicalcommitteemembership = 'technicalcommitteemembership',
  Testutils = 'testutils',
  Timestamp = 'timestamp',
  Transactionpayment = 'transactionpayment',
  Treasury = 'treasury',
  Unknown = 'unknown',
  Upgradecommittee = 'upgradecommittee',
  Upgradecommitteemembership = 'upgradecommitteemembership',
  Utility = 'utility',
}
export type ModuleIdEnumFilter = {
  distinctFrom?: InputMaybe<ModuleIdEnum>;
  equalTo?: InputMaybe<ModuleIdEnum>;
  greaterThan?: InputMaybe<ModuleIdEnum>;
  greaterThanOrEqualTo?: InputMaybe<ModuleIdEnum>;
  in?: InputMaybe<Array<ModuleIdEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ModuleIdEnum>;
  lessThanOrEqualTo?: InputMaybe<ModuleIdEnum>;
  notDistinctFrom?: InputMaybe<ModuleIdEnum>;
  notEqualTo?: InputMaybe<ModuleIdEnum>;
  notIn?: InputMaybe<Array<ModuleIdEnum>>;
};
export type MultiSig = Node & {
  address: Scalars['String']['output'];
  admins: Connection<MultiSigAdmin>;
  blocksByMultiSigAdminMultisigIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigAdminMultisigIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigProposalMultisigIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalMultisigIdAndUpdatedBlockId: Connection<Block>;
  blocksByMultiSigSignerMultisigIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigSignerMultisigIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorAccount?: Maybe<Account>;
  creatorAccountId: Scalars['String']['output'];
  creatorId: Scalars['String']['output'];
  eventsByMultiSigProposalMultisigIdAndCreatedEventId: Connection<Event>;
  extrinsicsByMultiSigProposalMultisigIdAndExtrinsicId: Connection<Extrinsic>;
  id: Scalars['String']['output'];
  identitiesByMultiSigProposalMultisigIdAndCreatorId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  proposals: Connection<MultiSigProposal>;
  signaturesRequired: Scalars['Int']['output'];
  signers: Connection<MultiSigSigner>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type MultiSigAdmin = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identityId: Scalars['String']['output'];
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  status: MultiSigAdminStatusEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type MultiSigAdminFilter = {
  and?: InputMaybe<Array<MultiSigAdminFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identityId?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigAdminFilter>;
  or?: InputMaybe<Array<MultiSigAdminFilter>>;
  status?: InputMaybe<MultiSigAdminStatusEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum MultiSigAdminStatusEnum {
  Authorized = 'Authorized',
  Removed = 'Removed',
}
export type MultiSigAdminStatusEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigAdminStatusEnum>;
  equalTo?: InputMaybe<MultiSigAdminStatusEnum>;
  greaterThan?: InputMaybe<MultiSigAdminStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  in?: InputMaybe<Array<MultiSigAdminStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigAdminStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  notDistinctFrom?: InputMaybe<MultiSigAdminStatusEnum>;
  notEqualTo?: InputMaybe<MultiSigAdminStatusEnum>;
  notIn?: InputMaybe<Array<MultiSigAdminStatusEnum>>;
};
export enum MultiSigAdminsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type MultiSigFilter = {
  address?: InputMaybe<StringFilter>;
  admins?: InputMaybe<OneToManyFilter<MultiSigAdminFilter>>;
  and?: InputMaybe<Array<MultiSigFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorAccount?: InputMaybe<AccountFilter>;
  creatorAccountId?: InputMaybe<StringFilter>;
  creatorId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigFilter>;
  or?: InputMaybe<Array<MultiSigFilter>>;
  proposals?: InputMaybe<OneToManyFilter<MultiSigProposalFilter>>;
  signaturesRequired?: InputMaybe<IntFilter>;
  signers?: InputMaybe<OneToManyFilter<MultiSigSignerFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type MultiSigProposal = Node & {
  approvalCount: Scalars['Int']['output'];
  blocksByMultiSigProposalVoteProposalIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteProposalIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorAccount?: Maybe<Scalars['String']['output']>;
  creatorId?: Maybe<Scalars['String']['output']>;
  datetime: Scalars['Datetime']['output'];
  eventIdx: Scalars['Int']['output'];
  eventsByMultiSigProposalVoteProposalIdAndCreatedEventId: Connection<Event>;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  extrinsicIdx?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  multiSigSignersByMultiSigProposalVoteProposalIdAndSignerId: Connection<MultiSigSigner>;
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  params: Scalars['JSON']['output'];
  proposalId: Scalars['Int']['output'];
  rejectionCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  votes: Connection<MultiSigProposalVote>;
};
export type MultiSigProposalFilter = {
  and?: InputMaybe<Array<MultiSigProposalFilter>>;
  approvalCount?: InputMaybe<IntFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorAccount?: InputMaybe<StringFilter>;
  creatorExists?: InputMaybe<Scalars['Boolean']['input']>;
  creatorId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigProposalFilter>;
  or?: InputMaybe<Array<MultiSigProposalFilter>>;
  params?: InputMaybe<JsonFilter>;
  proposalId?: InputMaybe<IntFilter>;
  rejectionCount?: InputMaybe<IntFilter>;
  status?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
};
export type MultiSigProposalVote = Node & {
  action?: Maybe<MultiSigProposalVoteActionEnum>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventIdx: Scalars['Int']['output'];
  extrinsicIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  proposal?: Maybe<MultiSigProposal>;
  proposalId: Scalars['String']['output'];
  signer?: Maybe<MultiSigSigner>;
  signerId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export enum MultiSigProposalVoteActionEnum {
  Approved = 'Approved',
  Rejected = 'Rejected',
}
export type MultiSigProposalVoteActionEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigProposalVoteActionEnum>;
  equalTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  greaterThan?: InputMaybe<MultiSigProposalVoteActionEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  in?: InputMaybe<Array<MultiSigProposalVoteActionEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigProposalVoteActionEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notDistinctFrom?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notEqualTo?: InputMaybe<MultiSigProposalVoteActionEnum>;
  notIn?: InputMaybe<Array<MultiSigProposalVoteActionEnum>>;
};
export type MultiSigProposalVoteFilter = {
  action?: InputMaybe<MultiSigProposalVoteActionEnumFilter>;
  and?: InputMaybe<Array<MultiSigProposalVoteFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsicIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigProposalVoteFilter>;
  or?: InputMaybe<Array<MultiSigProposalVoteFilter>>;
  proposal?: InputMaybe<MultiSigProposalFilter>;
  proposalId?: InputMaybe<StringFilter>;
  signer?: InputMaybe<MultiSigSignerFilter>;
  signerId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum MultiSigProposalVotesOrderBy {
  ActionAsc = 'ACTION_ASC',
  ActionDesc = 'ACTION_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum MultiSigProposalsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CreatorAccountAsc = 'CREATOR_ACCOUNT_ASC',
  CreatorAccountDesc = 'CREATOR_ACCOUNT_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  ExtrinsicIdxAsc = 'EXTRINSIC_IDX_ASC',
  ExtrinsicIdxDesc = 'EXTRINSIC_IDX_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  ParamsAsc = 'PARAMS_ASC',
  ParamsDesc = 'PARAMS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type MultiSigSigner = Node & {
  blocksByMultiSigProposalVoteSignerIdAndCreatedBlockId: Connection<Block>;
  blocksByMultiSigProposalVoteSignerIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  eventsByMultiSigProposalVoteSignerIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  multiSigProposalsByMultiSigProposalVoteSignerIdAndProposalId: Connection<MultiSigProposal>;
  multisig?: Maybe<MultiSig>;
  multisigId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  signerType: SignerTypeEnum;
  signerValue: Scalars['String']['output'];
  status: MultiSigSignerStatusEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  votes: Connection<MultiSigProposalVote>;
};
export type MultiSigSignerFilter = {
  and?: InputMaybe<Array<MultiSigSignerFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  multisig?: InputMaybe<MultiSigFilter>;
  multisigId?: InputMaybe<StringFilter>;
  not?: InputMaybe<MultiSigSignerFilter>;
  or?: InputMaybe<Array<MultiSigSignerFilter>>;
  signerType?: InputMaybe<SignerTypeEnumFilter>;
  signerValue?: InputMaybe<StringFilter>;
  status?: InputMaybe<MultiSigSignerStatusEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<MultiSigProposalVoteFilter>>;
};
export enum MultiSigSignerStatusEnum {
  Approved = 'Approved',
  Authorized = 'Authorized',
  Removed = 'Removed',
}
export type MultiSigSignerStatusEnumFilter = {
  distinctFrom?: InputMaybe<MultiSigSignerStatusEnum>;
  equalTo?: InputMaybe<MultiSigSignerStatusEnum>;
  greaterThan?: InputMaybe<MultiSigSignerStatusEnum>;
  greaterThanOrEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  in?: InputMaybe<Array<MultiSigSignerStatusEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<MultiSigSignerStatusEnum>;
  lessThanOrEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  notDistinctFrom?: InputMaybe<MultiSigSignerStatusEnum>;
  notEqualTo?: InputMaybe<MultiSigSignerStatusEnum>;
  notIn?: InputMaybe<Array<MultiSigSignerStatusEnum>>;
};
export enum MultiSigSignersOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MultisigIdAsc = 'MULTISIG_ID_ASC',
  MultisigIdDesc = 'MULTISIG_ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerTypeAsc = 'SIGNER_TYPE_ASC',
  SignerTypeDesc = 'SIGNER_TYPE_DESC',
  SignerValueAsc = 'SIGNER_VALUE_ASC',
  SignerValueDesc = 'SIGNER_VALUE_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum MultiSigsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatorAccountIdAsc = 'CREATOR_ACCOUNT_ID_ASC',
  CreatorAccountIdDesc = 'CREATOR_ACCOUNT_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignaturesRequiredAsc = 'SIGNATURES_REQUIRED_ASC',
  SignaturesRequiredDesc = 'SIGNATURES_REQUIRED_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type NftHolder = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type NftHolderFilter = {
  and?: InputMaybe<Array<NftHolderFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<NftHolderFilter>;
  or?: InputMaybe<Array<NftHolderFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum NftHoldersOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Node = {
  nodeId: Scalars['ID']['output'];
};
export enum NullOrder {
  NullsFirst = 'NULLS_FIRST',
  NullsLast = 'NULLS_LAST',
}
export type OffChainReceipt = Node & {
  blocksByInstructionAffirmationOffChainReceiptIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionAffirmationOffChainReceiptIdAndUpdatedBlockId: Connection<Block>;
  blocksByInstructionEventOffChainReceiptIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionEventOffChainReceiptIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  eventsByInstructionEventOffChainReceiptIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  instructionAffirmations: Connection<InstructionAffirmation>;
  instructionEvents: Connection<InstructionEvent>;
  instructionPartiesByInstructionAffirmationOffChainReceiptIdAndPartyId: Connection<InstructionParty>;
  instructionsByInstructionAffirmationOffChainReceiptIdAndInstructionId: Connection<Instruction>;
  instructionsByInstructionEventOffChainReceiptIdAndInstructionId: Connection<Instruction>;
  leg?: Maybe<Leg>;
  legId?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  signer: Scalars['String']['output'];
  uid: Scalars['Int']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type OffChainReceiptFilter = {
  and?: InputMaybe<Array<OffChainReceiptFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instructionAffirmations?: InputMaybe<OneToManyFilter<InstructionAffirmationFilter>>;
  instructionEvents?: InputMaybe<OneToManyFilter<InstructionEventFilter>>;
  leg?: InputMaybe<LegFilter>;
  legExists?: InputMaybe<Scalars['Boolean']['input']>;
  legId?: InputMaybe<StringFilter>;
  metadata?: InputMaybe<StringFilter>;
  not?: InputMaybe<OffChainReceiptFilter>;
  or?: InputMaybe<Array<OffChainReceiptFilter>>;
  signer?: InputMaybe<StringFilter>;
  uid?: InputMaybe<IntFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum OffChainReceiptsOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  LegIdAsc = 'LEG_ID_ASC',
  LegIdDesc = 'LEG_ID_DESC',
  MetadataAsc = 'METADATA_ASC',
  MetadataDesc = 'METADATA_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerAsc = 'SIGNER_ASC',
  SignerDesc = 'SIGNER_DESC',
  UidAsc = 'UID_ASC',
  UidDesc = 'UID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type PageInfo = {
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};
export type Permission = Node & {
  accountsByPermissionsId: Connection<Account>;
  assets?: Maybe<Scalars['JSON']['output']>;
  blocksByAccountPermissionsIdAndCreatedBlockId: Connection<Block>;
  blocksByAccountPermissionsIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  id: Scalars['String']['output'];
  identitiesByAccountPermissionsIdAndIdentityId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  portfolios?: Maybe<Scalars['JSON']['output']>;
  transactionGroups: Scalars['JSON']['output'];
  transactions?: Maybe<Scalars['JSON']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type PermissionFilter = {
  accountsByPermissionsId?: InputMaybe<OneToManyFilter<AccountFilter>>;
  and?: InputMaybe<Array<PermissionFilter>>;
  assets?: InputMaybe<JsonFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<PermissionFilter>;
  or?: InputMaybe<Array<PermissionFilter>>;
  portfolios?: InputMaybe<JsonFilter>;
  transactionGroups?: InputMaybe<JsonFilter>;
  transactions?: InputMaybe<JsonFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum PermissionsOrderBy {
  AssetsAsc = 'ASSETS_ASC',
  AssetsDesc = 'ASSETS_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PortfoliosAsc = 'PORTFOLIOS_ASC',
  PortfoliosDesc = 'PORTFOLIOS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TransactionsAsc = 'TRANSACTIONS_ASC',
  TransactionsDesc = 'TRANSACTIONS_DESC',
  TransactionGroupsAsc = 'TRANSACTION_GROUPS_ASC',
  TransactionGroupsDesc = 'TRANSACTION_GROUPS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type PolyxTransaction = Node & {
  address?: Maybe<Scalars['String']['output']>;
  amount: Scalars['BigFloat']['output'];
  callId?: Maybe<CallIdEnum>;
  callIdText?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId?: Maybe<EventIdEnum>;
  eventIdText?: Maybe<Scalars['String']['output']>;
  eventIdx: Scalars['Int']['output'];
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identityId?: Maybe<Scalars['String']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  moduleId?: Maybe<ModuleIdEnum>;
  moduleIdText?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  toAddress?: Maybe<Scalars['String']['output']>;
  toId?: Maybe<Scalars['String']['output']>;
  type: BalanceTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type PolyxTransactionFilter = {
  address?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<PolyxTransactionFilter>>;
  callId?: InputMaybe<CallIdEnumFilter>;
  callIdText?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdText?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  extrinsic?: InputMaybe<ExtrinsicFilter>;
  extrinsicExists?: InputMaybe<Scalars['Boolean']['input']>;
  extrinsicId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  identityId?: InputMaybe<StringFilter>;
  memo?: InputMaybe<StringFilter>;
  moduleId?: InputMaybe<ModuleIdEnumFilter>;
  moduleIdText?: InputMaybe<StringFilter>;
  not?: InputMaybe<PolyxTransactionFilter>;
  or?: InputMaybe<Array<PolyxTransactionFilter>>;
  toAddress?: InputMaybe<StringFilter>;
  toId?: InputMaybe<StringFilter>;
  type?: InputMaybe<BalanceTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum PolyxTransactionsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CallIdAsc = 'CALL_ID_ASC',
  CallIdDesc = 'CALL_ID_DESC',
  CallIdTextAsc = 'CALL_ID_TEXT_ASC',
  CallIdTextDesc = 'CALL_ID_TEXT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  EventIdTextAsc = 'EVENT_ID_TEXT_ASC',
  EventIdTextDesc = 'EVENT_ID_TEXT_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  ModuleIdAsc = 'MODULE_ID_ASC',
  ModuleIdDesc = 'MODULE_ID_DESC',
  ModuleIdTextAsc = 'MODULE_ID_TEXT_ASC',
  ModuleIdTextDesc = 'MODULE_ID_TEXT_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ToAddressAsc = 'TO_ADDRESS_ASC',
  ToAddressDesc = 'TO_ADDRESS_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Portfolio = Node & {
  assetTransactionsByFromPortfolioId: Connection<AssetTransaction>;
  assetTransactionsByToPortfolioId: Connection<AssetTransaction>;
  assetsByAssetTransactionFromPortfolioIdAndAssetId: Connection<Asset>;
  assetsByAssetTransactionToPortfolioIdAndAssetId: Connection<Asset>;
  assetsByDistributionPortfolioIdAndAssetId: Connection<Asset>;
  assetsByDistributionPortfolioIdAndCurrencyId: Connection<Asset>;
  assetsByPortfolioMovementFromIdAndAssetId: Connection<Asset>;
  assetsByPortfolioMovementToIdAndAssetId: Connection<Asset>;
  assetsByStoOfferingPortfolioIdAndOfferingAssetId: Connection<Asset>;
  assetsByStoRaisingPortfolioIdAndOfferingAssetId: Connection<Asset>;
  blocksByAssetTransactionFromPortfolioIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionFromPortfolioIdAndUpdatedBlockId: Connection<Block>;
  blocksByAssetTransactionToPortfolioIdAndCreatedBlockId: Connection<Block>;
  blocksByAssetTransactionToPortfolioIdAndUpdatedBlockId: Connection<Block>;
  blocksByDistributionPortfolioIdAndCreatedBlockId: Connection<Block>;
  blocksByDistributionPortfolioIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioMovementFromIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioMovementFromIdAndUpdatedBlockId: Connection<Block>;
  blocksByPortfolioMovementToIdAndCreatedBlockId: Connection<Block>;
  blocksByPortfolioMovementToIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoOfferingPortfolioIdAndCreatedBlockId: Connection<Block>;
  blocksByStoOfferingPortfolioIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoRaisingPortfolioIdAndCreatedBlockId: Connection<Block>;
  blocksByStoRaisingPortfolioIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  custodian?: Maybe<Identity>;
  custodianId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['Datetime']['output']>;
  distributions: Connection<Distribution>;
  eventIdx: Scalars['Int']['output'];
  eventsByAssetTransactionFromPortfolioIdAndCreatedEventId: Connection<Event>;
  eventsByAssetTransactionToPortfolioIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByDistributionPortfolioIdAndIdentityId: Connection<Identity>;
  identitiesByStoOfferingPortfolioIdAndCreatorId: Connection<Identity>;
  identitiesByStoRaisingPortfolioIdAndCreatorId: Connection<Identity>;
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  instructionsByAssetTransactionFromPortfolioIdAndInstructionId: Connection<Instruction>;
  instructionsByAssetTransactionToPortfolioIdAndInstructionId: Connection<Instruction>;
  name?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  number: Scalars['Int']['output'];
  portfolioMovementsByFromId: Connection<PortfolioMovement>;
  portfolioMovementsByToId: Connection<PortfolioMovement>;
  portfoliosByAssetTransactionFromPortfolioIdAndToPortfolioId: Connection<Portfolio>;
  portfoliosByAssetTransactionToPortfolioIdAndFromPortfolioId: Connection<Portfolio>;
  portfoliosByPortfolioMovementFromIdAndToId: Connection<Portfolio>;
  portfoliosByPortfolioMovementToIdAndFromId: Connection<Portfolio>;
  portfoliosByStoOfferingPortfolioIdAndRaisingPortfolioId: Connection<Portfolio>;
  portfoliosByStoRaisingPortfolioIdAndOfferingPortfolioId: Connection<Portfolio>;
  stosByOfferingPortfolioId: Connection<Sto>;
  stosByRaisingPortfolioId: Connection<Sto>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venuesByStoOfferingPortfolioIdAndVenueId: Connection<Venue>;
  venuesByStoRaisingPortfolioIdAndVenueId: Connection<Venue>;
};
export type PortfolioFilter = {
  and?: InputMaybe<Array<PortfolioFilter>>;
  assetTransactionsByFromPortfolioId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  assetTransactionsByToPortfolioId?: InputMaybe<OneToManyFilter<AssetTransactionFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  custodian?: InputMaybe<IdentityFilter>;
  custodianExists?: InputMaybe<Scalars['Boolean']['input']>;
  custodianId?: InputMaybe<StringFilter>;
  deletedAt?: InputMaybe<DatetimeFilter>;
  distributions?: InputMaybe<OneToManyFilter<DistributionFilter>>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<PortfolioFilter>;
  number?: InputMaybe<IntFilter>;
  or?: InputMaybe<Array<PortfolioFilter>>;
  portfolioMovementsByFromId?: InputMaybe<OneToManyFilter<PortfolioMovementFilter>>;
  portfolioMovementsByToId?: InputMaybe<OneToManyFilter<PortfolioMovementFilter>>;
  stosByOfferingPortfolioId?: InputMaybe<OneToManyFilter<StoFilter>>;
  stosByRaisingPortfolioId?: InputMaybe<OneToManyFilter<StoFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export type PortfolioMovement = Node & {
  address: Scalars['String']['output'];
  amount?: Maybe<Scalars['BigFloat']['output']>;
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  from?: Maybe<Portfolio>;
  fromId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  memo?: Maybe<Scalars['String']['output']>;
  nftIds?: Maybe<Scalars['JSON']['output']>;
  nodeId: Scalars['ID']['output'];
  to?: Maybe<Portfolio>;
  toId: Scalars['String']['output'];
  type: PortfolioMovementTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type PortfolioMovementFilter = {
  address?: InputMaybe<StringFilter>;
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<PortfolioMovementFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  from?: InputMaybe<PortfolioFilter>;
  fromId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  memo?: InputMaybe<StringFilter>;
  nftIds?: InputMaybe<JsonFilter>;
  not?: InputMaybe<PortfolioMovementFilter>;
  or?: InputMaybe<Array<PortfolioMovementFilter>>;
  to?: InputMaybe<PortfolioFilter>;
  toId?: InputMaybe<StringFilter>;
  type?: InputMaybe<PortfolioMovementTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum PortfolioMovementTypeEnum {
  Fungible = 'Fungible',
  NonFungible = 'NonFungible',
}
export type PortfolioMovementTypeEnumFilter = {
  distinctFrom?: InputMaybe<PortfolioMovementTypeEnum>;
  equalTo?: InputMaybe<PortfolioMovementTypeEnum>;
  greaterThan?: InputMaybe<PortfolioMovementTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<PortfolioMovementTypeEnum>;
  in?: InputMaybe<Array<PortfolioMovementTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<PortfolioMovementTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<PortfolioMovementTypeEnum>;
  notDistinctFrom?: InputMaybe<PortfolioMovementTypeEnum>;
  notEqualTo?: InputMaybe<PortfolioMovementTypeEnum>;
  notIn?: InputMaybe<Array<PortfolioMovementTypeEnum>>;
};
export enum PortfolioMovementsOrderBy {
  AddressAsc = 'ADDRESS_ASC',
  AddressDesc = 'ADDRESS_DESC',
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  FromIdAsc = 'FROM_ID_ASC',
  FromIdDesc = 'FROM_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MemoAsc = 'MEMO_ASC',
  MemoDesc = 'MEMO_DESC',
  Natural = 'NATURAL',
  NftIdsAsc = 'NFT_IDS_ASC',
  NftIdsDesc = 'NFT_IDS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ToIdAsc = 'TO_ID_ASC',
  ToIdDesc = 'TO_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum PortfoliosOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  CustodianIdAsc = 'CUSTODIAN_ID_ASC',
  CustodianIdDesc = 'CUSTODIAN_ID_DESC',
  DeletedAtAsc = 'DELETED_AT_ASC',
  DeletedAtDesc = 'DELETED_AT_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  NumberAsc = 'NUMBER_ASC',
  NumberDesc = 'NUMBER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Proposal = Node & {
  balance: Scalars['BigFloat']['output'];
  blocksByProposalVoteProposalIdAndCreatedBlockId: Connection<Block>;
  blocksByProposalVoteProposalIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Identity>;
  ownerId: Scalars['String']['output'];
  proposer: Scalars['JSON']['output'];
  snapshotted: Scalars['Boolean']['output'];
  state: ProposalStateEnum;
  totalAyeWeight: Scalars['BigFloat']['output'];
  totalNayWeight: Scalars['BigFloat']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
  votes: Connection<ProposalVote>;
};
export type ProposalFilter = {
  and?: InputMaybe<Array<ProposalFilter>>;
  balance?: InputMaybe<BigFloatFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ProposalFilter>;
  or?: InputMaybe<Array<ProposalFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerId?: InputMaybe<StringFilter>;
  proposer?: InputMaybe<JsonFilter>;
  snapshotted?: InputMaybe<BooleanFilter>;
  state?: InputMaybe<ProposalStateEnumFilter>;
  totalAyeWeight?: InputMaybe<BigFloatFilter>;
  totalNayWeight?: InputMaybe<BigFloatFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  url?: InputMaybe<StringFilter>;
  votes?: InputMaybe<OneToManyFilter<ProposalVoteFilter>>;
};
export enum ProposalStateEnum {
  All = 'All',
  Executed = 'Executed',
  Expired = 'Expired',
  Failed = 'Failed',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Scheduled = 'Scheduled',
}
export type ProposalStateEnumFilter = {
  distinctFrom?: InputMaybe<ProposalStateEnum>;
  equalTo?: InputMaybe<ProposalStateEnum>;
  greaterThan?: InputMaybe<ProposalStateEnum>;
  greaterThanOrEqualTo?: InputMaybe<ProposalStateEnum>;
  in?: InputMaybe<Array<ProposalStateEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<ProposalStateEnum>;
  lessThanOrEqualTo?: InputMaybe<ProposalStateEnum>;
  notDistinctFrom?: InputMaybe<ProposalStateEnum>;
  notEqualTo?: InputMaybe<ProposalStateEnum>;
  notIn?: InputMaybe<Array<ProposalStateEnum>>;
};
export type ProposalVote = Node & {
  account: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  proposal?: Maybe<Proposal>;
  proposalId: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  vote: Scalars['Boolean']['output'];
  weight: Scalars['BigFloat']['output'];
};
export type ProposalVoteFilter = {
  account?: InputMaybe<StringFilter>;
  and?: InputMaybe<Array<ProposalVoteFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<ProposalVoteFilter>;
  or?: InputMaybe<Array<ProposalVoteFilter>>;
  proposal?: InputMaybe<ProposalFilter>;
  proposalId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  vote?: InputMaybe<BooleanFilter>;
  weight?: InputMaybe<BigFloatFilter>;
};
export enum ProposalVotesOrderBy {
  AccountAsc = 'ACCOUNT_ASC',
  AccountDesc = 'ACCOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  VoteAsc = 'VOTE_ASC',
  VoteDesc = 'VOTE_DESC',
  WeightAsc = 'WEIGHT_ASC',
  WeightDesc = 'WEIGHT_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum ProposalsOrderBy {
  BalanceAsc = 'BALANCE_ASC',
  BalanceDesc = 'BALANCE_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DescriptionAsc = 'DESCRIPTION_ASC',
  DescriptionDesc = 'DESCRIPTION_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposerAsc = 'PROPOSER_ASC',
  ProposerDesc = 'PROPOSER_DESC',
  SnapshottedAsc = 'SNAPSHOTTED_ASC',
  SnapshottedDesc = 'SNAPSHOTTED_DESC',
  StateAsc = 'STATE_ASC',
  StateDesc = 'STATE_DESC',
  TotalAyeWeightAsc = 'TOTAL_AYE_WEIGHT_ASC',
  TotalAyeWeightDesc = 'TOTAL_AYE_WEIGHT_DESC',
  TotalNayWeightAsc = 'TOTAL_NAY_WEIGHT_ASC',
  TotalNayWeightDesc = 'TOTAL_NAY_WEIGHT_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  UrlAsc = 'URL_ASC',
  UrlDesc = 'URL_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Query = Node & {
  _metadata?: Maybe<_Metadata>;
  _metadatas?: Maybe<_Metadatas>;
  account?: Maybe<Account>;
  accountByNodeId?: Maybe<Account>;
  accountHistories?: Maybe<Connection<AccountHistory>>;
  accountHistory?: Maybe<AccountHistory>;
  accountHistoryByNodeId?: Maybe<AccountHistory>;
  accounts?: Maybe<Connection<Account>>;
  agentGroup?: Maybe<AgentGroup>;
  agentGroupByNodeId?: Maybe<AgentGroup>;
  agentGroupMembership?: Maybe<AgentGroupMembership>;
  agentGroupMembershipByNodeId?: Maybe<AgentGroupMembership>;
  agentGroupMemberships?: Maybe<Connection<AgentGroupMembership>>;
  agentGroups?: Maybe<Connection<AgentGroup>>;
  asset?: Maybe<Asset>;
  assetByNodeId?: Maybe<Asset>;
  assetDocument?: Maybe<AssetDocument>;
  assetDocumentByNodeId?: Maybe<AssetDocument>;
  assetDocuments?: Maybe<Connection<AssetDocument>>;
  assetHolder?: Maybe<AssetHolder>;
  assetHolderByNodeId?: Maybe<AssetHolder>;
  assetHolders?: Maybe<Connection<AssetHolder>>;
  assetMandatoryMediator?: Maybe<AssetMandatoryMediator>;
  assetMandatoryMediatorByNodeId?: Maybe<AssetMandatoryMediator>;
  assetMandatoryMediators?: Maybe<Connection<AssetMandatoryMediator>>;
  assetPreApproval?: Maybe<AssetPreApproval>;
  assetPreApprovalByNodeId?: Maybe<AssetPreApproval>;
  assetPreApprovals?: Maybe<Connection<AssetPreApproval>>;
  assetTransaction?: Maybe<AssetTransaction>;
  assetTransactionByNodeId?: Maybe<AssetTransaction>;
  assetTransactions?: Maybe<Connection<AssetTransaction>>;
  assets?: Maybe<Connection<Asset>>;
  authorization?: Maybe<Authorization>;
  authorizationByNodeId?: Maybe<Authorization>;
  authorizations?: Maybe<Connection<Authorization>>;
  block?: Maybe<Block>;
  blockByNodeId?: Maybe<Block>;
  blocks?: Maybe<Connection<Block>>;
  bridgeEvent?: Maybe<BridgeEvent>;
  bridgeEventByNodeId?: Maybe<BridgeEvent>;
  bridgeEvents?: Maybe<Connection<BridgeEvent>>;
  childIdentities?: Maybe<Connection<ChildIdentity>>;
  childIdentity?: Maybe<ChildIdentity>;
  childIdentityByNodeId?: Maybe<ChildIdentity>;
  claim?: Maybe<Claim>;
  claimByNodeId?: Maybe<Claim>;
  claimScope?: Maybe<ClaimScope>;
  claimScopeByNodeId?: Maybe<ClaimScope>;
  claimScopes?: Maybe<Connection<ClaimScope>>;
  claims?: Maybe<ClaimsConnection>;
  compliance?: Maybe<Compliance>;
  complianceByNodeId?: Maybe<Compliance>;
  compliances?: Maybe<Connection<Compliance>>;
  confidentialAccount?: Maybe<ConfidentialAccount>;
  confidentialAccountByNodeId?: Maybe<ConfidentialAccount>;
  confidentialAccounts?: Maybe<Connection<ConfidentialAccount>>;
  confidentialAsset?: Maybe<ConfidentialAsset>;
  confidentialAssetByNodeId?: Maybe<ConfidentialAsset>;
  confidentialAssetHistories?: Maybe<Connection<ConfidentialAssetHistory>>;
  confidentialAssetHistory?: Maybe<ConfidentialAssetHistory>;
  confidentialAssetHistoryByNodeId?: Maybe<ConfidentialAssetHistory>;
  confidentialAssetHolder?: Maybe<ConfidentialAssetHolder>;
  confidentialAssetHolderByNodeId?: Maybe<ConfidentialAssetHolder>;
  confidentialAssetHolders?: Maybe<Connection<ConfidentialAssetHolder>>;
  confidentialAssetMovement?: Maybe<ConfidentialAssetMovement>;
  confidentialAssetMovementByNodeId?: Maybe<ConfidentialAssetMovement>;
  confidentialAssetMovements?: Maybe<Connection<ConfidentialAssetMovement>>;
  confidentialAssets?: Maybe<Connection<ConfidentialAsset>>;
  confidentialLeg?: Maybe<ConfidentialLeg>;
  confidentialLegByNodeId?: Maybe<ConfidentialLeg>;
  confidentialLegs?: Maybe<Connection<ConfidentialLeg>>;
  confidentialTransaction?: Maybe<ConfidentialTransaction>;
  confidentialTransactionAffirmation?: Maybe<ConfidentialTransactionAffirmation>;
  confidentialTransactionAffirmationByNodeId?: Maybe<ConfidentialTransactionAffirmation>;
  confidentialTransactionAffirmations?: Maybe<Connection<ConfidentialTransactionAffirmation>>;
  confidentialTransactionByNodeId?: Maybe<ConfidentialTransaction>;
  confidentialTransactions?: Maybe<Connection<ConfidentialTransaction>>;
  confidentialVenue?: Maybe<ConfidentialVenue>;
  confidentialVenueByNodeId?: Maybe<ConfidentialVenue>;
  confidentialVenues?: Maybe<Connection<ConfidentialVenue>>;
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeByNodeId?: Maybe<CustomClaimType>;
  customClaimTypes?: Maybe<Connection<CustomClaimType>>;
  debug?: Maybe<Debug>;
  debugByNodeId?: Maybe<Debug>;
  debugs?: Maybe<Connection<Debug>>;
  distribution?: Maybe<Distribution>;
  distributionByNodeId?: Maybe<Distribution>;
  distributionPayment?: Maybe<DistributionPayment>;
  distributionPaymentByNodeId?: Maybe<DistributionPayment>;
  distributionPayments?: Maybe<Connection<DistributionPayment>>;
  distributions?: Maybe<Connection<Distribution>>;
  event?: Maybe<Event>;
  eventByNodeId?: Maybe<Event>;
  events?: Maybe<Connection<Event>>;
  extrinsic?: Maybe<Extrinsic>;
  extrinsicByNodeId?: Maybe<Extrinsic>;
  extrinsics?: Maybe<Connection<Extrinsic>>;
  foundType?: Maybe<FoundType>;
  foundTypeByNodeId?: Maybe<FoundType>;
  foundTypes?: Maybe<Connection<FoundType>>;
  funding?: Maybe<Funding>;
  fundingByNodeId?: Maybe<Funding>;
  fundings?: Maybe<Connection<Funding>>;
  identities?: Maybe<Connection<Identity>>;
  identity?: Maybe<Identity>;
  identityByNodeId?: Maybe<Identity>;
  instruction?: Maybe<Instruction>;
  instructionAffirmation?: Maybe<InstructionAffirmation>;
  instructionAffirmationByNodeId?: Maybe<InstructionAffirmation>;
  instructionAffirmations?: Maybe<Connection<InstructionAffirmation>>;
  instructionByNodeId?: Maybe<Instruction>;
  instructionEvent?: Maybe<InstructionEvent>;
  instructionEventByNodeId?: Maybe<InstructionEvent>;
  instructionEvents?: Maybe<Connection<InstructionEvent>>;
  instructionParties?: Maybe<Connection<InstructionParty>>;
  instructionParty?: Maybe<InstructionParty>;
  instructionPartyByNodeId?: Maybe<InstructionParty>;
  instructions?: Maybe<Connection<Instruction>>;
  investment?: Maybe<Investment>;
  investmentByNodeId?: Maybe<Investment>;
  investments?: Maybe<Connection<Investment>>;
  leg?: Maybe<Leg>;
  legByNodeId?: Maybe<Leg>;
  legs?: Maybe<Connection<Leg>>;
  migration?: Maybe<Migration>;
  migrationByNodeId?: Maybe<Migration>;
  migrations?: Maybe<Connection<Migration>>;
  multiSig?: Maybe<MultiSig>;
  multiSigAdmin?: Maybe<MultiSigAdmin>;
  multiSigAdminByNodeId?: Maybe<MultiSigAdmin>;
  multiSigAdmins?: Maybe<Connection<MultiSigAdmin>>;
  multiSigByNodeId?: Maybe<MultiSig>;
  multiSigProposal?: Maybe<MultiSigProposal>;
  multiSigProposalByNodeId?: Maybe<MultiSigProposal>;
  multiSigProposalVote?: Maybe<MultiSigProposalVote>;
  multiSigProposalVoteByNodeId?: Maybe<MultiSigProposalVote>;
  multiSigProposalVotes?: Maybe<Connection<MultiSigProposalVote>>;
  multiSigProposals?: Maybe<Connection<MultiSigProposal>>;
  multiSigSigner?: Maybe<MultiSigSigner>;
  multiSigSignerByNodeId?: Maybe<MultiSigSigner>;
  multiSigSigners?: Maybe<Connection<MultiSigSigner>>;
  multiSigs?: Maybe<Connection<MultiSig>>;
  nftHolder?: Maybe<NftHolder>;
  nftHolderByNodeId?: Maybe<NftHolder>;
  nftHolders?: Maybe<Connection<NftHolder>>;
  node?: Maybe<
    | Account
    | AccountHistory
    | AgentGroup
    | AgentGroupMembership
    | Asset
    | AssetDocument
    | AssetHolder
    | AssetMandatoryMediator
    | AssetPreApproval
    | AssetTransaction
    | Authorization
    | Block
    | BridgeEvent
    | ChildIdentity
    | Claim
    | ClaimScope
    | Compliance
    | ConfidentialAccount
    | ConfidentialAsset
    | ConfidentialAssetHistory
    | ConfidentialAssetHolder
    | ConfidentialAssetMovement
    | ConfidentialLeg
    | ConfidentialTransaction
    | ConfidentialTransactionAffirmation
    | ConfidentialVenue
    | CustomClaimType
    | Debug
    | Distribution
    | DistributionPayment
    | Event
    | Extrinsic
    | FoundType
    | Funding
    | Identity
    | Instruction
    | InstructionAffirmation
    | InstructionEvent
    | InstructionParty
    | Investment
    | Leg
    | Migration
    | MultiSig
    | MultiSigAdmin
    | MultiSigProposal
    | MultiSigProposalVote
    | MultiSigSigner
    | NftHolder
    | OffChainReceipt
    | Permission
    | PolyxTransaction
    | Portfolio
    | PortfolioMovement
    | Proposal
    | ProposalVote
    | Query
    | StakingEvent
    | StatType
    | Sto
    | SubqueryVersion
    | TickerExternalAgent
    | TickerExternalAgentAction
    | TickerExternalAgentHistory
    | TransferCompliance
    | TransferComplianceExemption
    | TransferManager
    | TrustedClaimIssuer
    | Venue
  >;
  nodeId: Scalars['ID']['output'];
  offChainReceipt?: Maybe<OffChainReceipt>;
  offChainReceiptByNodeId?: Maybe<OffChainReceipt>;
  offChainReceipts?: Maybe<Connection<OffChainReceipt>>;
  permission?: Maybe<Permission>;
  permissionByNodeId?: Maybe<Permission>;
  permissions?: Maybe<Connection<Permission>>;
  polyxTransaction?: Maybe<PolyxTransaction>;
  polyxTransactionByNodeId?: Maybe<PolyxTransaction>;
  polyxTransactions?: Maybe<Connection<PolyxTransaction>>;
  portfolio?: Maybe<Portfolio>;
  portfolioByNodeId?: Maybe<Portfolio>;
  portfolioMovement?: Maybe<PortfolioMovement>;
  portfolioMovementByNodeId?: Maybe<PortfolioMovement>;
  portfolioMovements?: Maybe<Connection<PortfolioMovement>>;
  portfolios?: Maybe<Connection<Portfolio>>;
  proposal?: Maybe<Proposal>;
  proposalByNodeId?: Maybe<Proposal>;
  proposalVote?: Maybe<ProposalVote>;
  proposalVoteByNodeId?: Maybe<ProposalVote>;
  proposalVotes?: Maybe<Connection<ProposalVote>>;
  proposals?: Maybe<Connection<Proposal>>;
  query: Query;
  stakingEvent?: Maybe<StakingEvent>;
  stakingEventByNodeId?: Maybe<StakingEvent>;
  stakingEvents?: Maybe<Connection<StakingEvent>>;
  statType?: Maybe<StatType>;
  statTypeByNodeId?: Maybe<StatType>;
  statTypes?: Maybe<Connection<StatType>>;
  sto?: Maybe<Sto>;
  stoByNodeId?: Maybe<Sto>;
  stos?: Maybe<Connection<Sto>>;
  subqueryVersion?: Maybe<SubqueryVersion>;
  subqueryVersionByNodeId?: Maybe<SubqueryVersion>;
  subqueryVersions?: Maybe<Connection<SubqueryVersion>>;
  tickerExternalAgent?: Maybe<TickerExternalAgent>;
  tickerExternalAgentAction?: Maybe<TickerExternalAgentAction>;
  tickerExternalAgentActionByNodeId?: Maybe<TickerExternalAgentAction>;
  tickerExternalAgentActions?: Maybe<Connection<TickerExternalAgentAction>>;
  tickerExternalAgentByNodeId?: Maybe<TickerExternalAgent>;
  tickerExternalAgentHistories?: Maybe<Connection<TickerExternalAgentHistory>>;
  tickerExternalAgentHistory?: Maybe<TickerExternalAgentHistory>;
  tickerExternalAgentHistoryByNodeId?: Maybe<TickerExternalAgentHistory>;
  tickerExternalAgents?: Maybe<Connection<TickerExternalAgent>>;
  transferCompliance?: Maybe<TransferCompliance>;
  transferComplianceByNodeId?: Maybe<TransferCompliance>;
  transferComplianceExemption?: Maybe<TransferComplianceExemption>;
  transferComplianceExemptionByNodeId?: Maybe<TransferComplianceExemption>;
  transferComplianceExemptions?: Maybe<Connection<TransferComplianceExemption>>;
  transferCompliances?: Maybe<Connection<TransferCompliance>>;
  transferManager?: Maybe<TransferManager>;
  transferManagerByNodeId?: Maybe<TransferManager>;
  transferManagers?: Maybe<Connection<TransferManager>>;
  trustedClaimIssuer?: Maybe<TrustedClaimIssuer>;
  trustedClaimIssuerByNodeId?: Maybe<TrustedClaimIssuer>;
  trustedClaimIssuers?: Maybe<Connection<TrustedClaimIssuer>>;
  venue?: Maybe<Venue>;
  venueByNodeId?: Maybe<Venue>;
  venues?: Maybe<Connection<Venue>>;
};
export enum RaisingAssetTypeEnum {
  OffChain = 'OffChain',
  OnChain = 'OnChain',
}
export type RaisingAssetTypeEnumFilter = {
  distinctFrom?: InputMaybe<RaisingAssetTypeEnum>;
  equalTo?: InputMaybe<RaisingAssetTypeEnum>;
  greaterThan?: InputMaybe<RaisingAssetTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  in?: InputMaybe<Array<RaisingAssetTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<RaisingAssetTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  notDistinctFrom?: InputMaybe<RaisingAssetTypeEnum>;
  notEqualTo?: InputMaybe<RaisingAssetTypeEnum>;
  notIn?: InputMaybe<Array<RaisingAssetTypeEnum>>;
};
export enum SignerTypeEnum {
  Account = 'Account',
  Identity = 'Identity',
}
export type SignerTypeEnumFilter = {
  distinctFrom?: InputMaybe<SignerTypeEnum>;
  equalTo?: InputMaybe<SignerTypeEnum>;
  greaterThan?: InputMaybe<SignerTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<SignerTypeEnum>;
  in?: InputMaybe<Array<SignerTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<SignerTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<SignerTypeEnum>;
  notDistinctFrom?: InputMaybe<SignerTypeEnum>;
  notEqualTo?: InputMaybe<SignerTypeEnum>;
  notIn?: InputMaybe<Array<SignerTypeEnum>>;
};
export type StakingEvent = Node & {
  amount?: Maybe<Scalars['BigFloat']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventId: EventIdEnum;
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId?: Maybe<Scalars['String']['output']>;
  nodeId: Scalars['ID']['output'];
  nominatedValidators?: Maybe<Scalars['JSON']['output']>;
  stashAccount?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type StakingEventFilter = {
  amount?: InputMaybe<BigFloatFilter>;
  and?: InputMaybe<Array<StakingEventFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityExists?: InputMaybe<Scalars['Boolean']['input']>;
  identityId?: InputMaybe<StringFilter>;
  nominatedValidators?: InputMaybe<JsonFilter>;
  not?: InputMaybe<StakingEventFilter>;
  or?: InputMaybe<Array<StakingEventFilter>>;
  stashAccount?: InputMaybe<StringFilter>;
  transactionId?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum StakingEventsOrderBy {
  AmountAsc = 'AMOUNT_ASC',
  AmountDesc = 'AMOUNT_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NominatedValidatorsAsc = 'NOMINATED_VALIDATORS_ASC',
  NominatedValidatorsDesc = 'NOMINATED_VALIDATORS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StashAccountAsc = 'STASH_ACCOUNT_ASC',
  StashAccountDesc = 'STASH_ACCOUNT_DESC',
  TransactionIdAsc = 'TRANSACTION_ID_ASC',
  TransactionIdDesc = 'TRANSACTION_ID_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum StatOpTypeEnum {
  Balance = 'Balance',
  Count = 'Count',
}
export type StatOpTypeEnumFilter = {
  distinctFrom?: InputMaybe<StatOpTypeEnum>;
  equalTo?: InputMaybe<StatOpTypeEnum>;
  greaterThan?: InputMaybe<StatOpTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<StatOpTypeEnum>;
  in?: InputMaybe<Array<StatOpTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<StatOpTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<StatOpTypeEnum>;
  notDistinctFrom?: InputMaybe<StatOpTypeEnum>;
  notEqualTo?: InputMaybe<StatOpTypeEnum>;
  notIn?: InputMaybe<Array<StatOpTypeEnum>>;
};
export type StatType = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  assetsByTransferComplianceStatTypeIdAndAssetId: Connection<Asset>;
  blocksByTransferComplianceStatTypeIdAndCreatedBlockId: Connection<Block>;
  blocksByTransferComplianceStatTypeIdAndUpdatedBlockId: Connection<Block>;
  claimIssuer?: Maybe<Identity>;
  claimIssuerId?: Maybe<Scalars['String']['output']>;
  claimType?: Maybe<ClaimTypeEnum>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  customClaimType?: Maybe<CustomClaimType>;
  customClaimTypeId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  identitiesByTransferComplianceStatTypeIdAndClaimIssuerId: Connection<Identity>;
  nodeId: Scalars['ID']['output'];
  opType: StatOpTypeEnum;
  transferCompliances: Connection<TransferCompliance>;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type StatTypeFilter = {
  and?: InputMaybe<Array<StatTypeFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimIssuer?: InputMaybe<IdentityFilter>;
  claimIssuerExists?: InputMaybe<Scalars['Boolean']['input']>;
  claimIssuerId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  customClaimType?: InputMaybe<CustomClaimTypeFilter>;
  customClaimTypeExists?: InputMaybe<Scalars['Boolean']['input']>;
  customClaimTypeId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<StatTypeFilter>;
  opType?: InputMaybe<StatOpTypeEnumFilter>;
  or?: InputMaybe<Array<StatTypeFilter>>;
  transferCompliances?: InputMaybe<OneToManyFilter<TransferComplianceFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum StatTypesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimIssuerIdAsc = 'CLAIM_ISSUER_ID_ASC',
  ClaimIssuerIdDesc = 'CLAIM_ISSUER_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CustomClaimTypeIdAsc = 'CUSTOM_CLAIM_TYPE_ID_ASC',
  CustomClaimTypeIdDesc = 'CUSTOM_CLAIM_TYPE_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OpTypeAsc = 'OP_TYPE_ASC',
  OpTypeDesc = 'OP_TYPE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Sto = Node & {
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  creator?: Maybe<Identity>;
  creatorId: Scalars['String']['output'];
  end?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['String']['output'];
  minimumInvestment: Scalars['BigFloat']['output'];
  name: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  offChainFundingEnabled: Scalars['Boolean']['output'];
  offChainFundingToken?: Maybe<Scalars['String']['output']>;
  offeringAsset?: Maybe<Asset>;
  offeringAssetId: Scalars['String']['output'];
  offeringPortfolio?: Maybe<Portfolio>;
  offeringPortfolioId: Scalars['String']['output'];
  raisingAssetId: Scalars['String']['output'];
  raisingPortfolio?: Maybe<Portfolio>;
  raisingPortfolioId: Scalars['String']['output'];
  raisingTicker: Scalars['String']['output'];
  start?: Maybe<Scalars['Datetime']['output']>;
  status: StoStatus;
  stoId: Scalars['Int']['output'];
  tiers: Scalars['JSON']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  venue?: Maybe<Venue>;
  venueId: Scalars['String']['output'];
};
export type StoFilter = {
  and?: InputMaybe<Array<StoFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  creator?: InputMaybe<IdentityFilter>;
  creatorId?: InputMaybe<StringFilter>;
  end?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<StringFilter>;
  minimumInvestment?: InputMaybe<BigFloatFilter>;
  name?: InputMaybe<StringFilter>;
  not?: InputMaybe<StoFilter>;
  offChainFundingEnabled?: InputMaybe<BooleanFilter>;
  offChainFundingToken?: InputMaybe<StringFilter>;
  offeringAsset?: InputMaybe<AssetFilter>;
  offeringAssetId?: InputMaybe<StringFilter>;
  offeringPortfolio?: InputMaybe<PortfolioFilter>;
  offeringPortfolioId?: InputMaybe<StringFilter>;
  or?: InputMaybe<Array<StoFilter>>;
  raisingAssetId?: InputMaybe<StringFilter>;
  raisingPortfolio?: InputMaybe<PortfolioFilter>;
  raisingPortfolioId?: InputMaybe<StringFilter>;
  raisingTicker?: InputMaybe<StringFilter>;
  start?: InputMaybe<DatetimeFilter>;
  status?: InputMaybe<StoStatusFilter>;
  stoId?: InputMaybe<IntFilter>;
  tiers?: InputMaybe<JsonFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  venue?: InputMaybe<VenueFilter>;
  venueId?: InputMaybe<StringFilter>;
};
export enum StoStatus {
  Closed = 'Closed',
  ClosedEarly = 'ClosedEarly',
  Frozen = 'Frozen',
  Live = 'Live',
}
export type StoStatusFilter = {
  distinctFrom?: InputMaybe<StoStatus>;
  equalTo?: InputMaybe<StoStatus>;
  greaterThan?: InputMaybe<StoStatus>;
  greaterThanOrEqualTo?: InputMaybe<StoStatus>;
  in?: InputMaybe<Array<StoStatus>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<StoStatus>;
  lessThanOrEqualTo?: InputMaybe<StoStatus>;
  notDistinctFrom?: InputMaybe<StoStatus>;
  notEqualTo?: InputMaybe<StoStatus>;
  notIn?: InputMaybe<Array<StoStatus>>;
};
export enum StosOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  EndAsc = 'END_ASC',
  EndDesc = 'END_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MinimumInvestmentAsc = 'MINIMUM_INVESTMENT_ASC',
  MinimumInvestmentDesc = 'MINIMUM_INVESTMENT_DESC',
  NameAsc = 'NAME_ASC',
  NameDesc = 'NAME_DESC',
  Natural = 'NATURAL',
  OfferingAssetIdAsc = 'OFFERING_ASSET_ID_ASC',
  OfferingAssetIdDesc = 'OFFERING_ASSET_ID_DESC',
  OfferingPortfolioIdAsc = 'OFFERING_PORTFOLIO_ID_ASC',
  OfferingPortfolioIdDesc = 'OFFERING_PORTFOLIO_ID_DESC',
  OffChainFundingEnabledAsc = 'OFF_CHAIN_FUNDING_ENABLED_ASC',
  OffChainFundingEnabledDesc = 'OFF_CHAIN_FUNDING_ENABLED_DESC',
  OffChainFundingTokenAsc = 'OFF_CHAIN_FUNDING_TOKEN_ASC',
  OffChainFundingTokenDesc = 'OFF_CHAIN_FUNDING_TOKEN_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RaisingAssetIdAsc = 'RAISING_ASSET_ID_ASC',
  RaisingAssetIdDesc = 'RAISING_ASSET_ID_DESC',
  RaisingPortfolioIdAsc = 'RAISING_PORTFOLIO_ID_ASC',
  RaisingPortfolioIdDesc = 'RAISING_PORTFOLIO_ID_DESC',
  RaisingTickerAsc = 'RAISING_TICKER_ASC',
  RaisingTickerDesc = 'RAISING_TICKER_DESC',
  StartAsc = 'START_ASC',
  StartDesc = 'START_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  StoIdAsc = 'STO_ID_ASC',
  StoIdDesc = 'STO_ID_DESC',
  TiersAsc = 'TIERS_ASC',
  TiersDesc = 'TIERS_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  VenueIdAsc = 'VENUE_ID_ASC',
  VenueIdDesc = 'VENUE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type StringFilter = {
  distinctFrom?: InputMaybe<Scalars['String']['input']>;
  distinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  endsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  equalTo?: InputMaybe<Scalars['String']['input']>;
  equalToInsensitive?: InputMaybe<Scalars['String']['input']>;
  greaterThan?: InputMaybe<Scalars['String']['input']>;
  greaterThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  inInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  includes?: InputMaybe<Scalars['String']['input']>;
  includesInsensitive?: InputMaybe<Scalars['String']['input']>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<Scalars['String']['input']>;
  lessThanInsensitive?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['String']['input']>;
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  like?: InputMaybe<Scalars['String']['input']>;
  likeInsensitive?: InputMaybe<Scalars['String']['input']>;
  notDistinctFrom?: InputMaybe<Scalars['String']['input']>;
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEndsWith?: InputMaybe<Scalars['String']['input']>;
  notEndsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  notEqualTo?: InputMaybe<Scalars['String']['input']>;
  notEqualToInsensitive?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<Scalars['String']['input']>>;
  notInInsensitive?: InputMaybe<Array<Scalars['String']['input']>>;
  notIncludes?: InputMaybe<Scalars['String']['input']>;
  notIncludesInsensitive?: InputMaybe<Scalars['String']['input']>;
  notLike?: InputMaybe<Scalars['String']['input']>;
  notLikeInsensitive?: InputMaybe<Scalars['String']['input']>;
  notStartsWith?: InputMaybe<Scalars['String']['input']>;
  notStartsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
  startsWithInsensitive?: InputMaybe<Scalars['String']['input']>;
};
export type SubqueryVersion = Node & {
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  version: Scalars['String']['output'];
};
export type SubqueryVersionFilter = {
  and?: InputMaybe<Array<SubqueryVersionFilter>>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<SubqueryVersionFilter>;
  or?: InputMaybe<Array<SubqueryVersionFilter>>;
  version?: InputMaybe<StringFilter>;
};
export enum SubqueryVersionsOrderBy {
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  VersionAsc = 'VERSION_ASC',
  VersionDesc = 'VERSION_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TableEstimate = {
  estimate?: Maybe<Scalars['Int']['output']>;
  table?: Maybe<Scalars['String']['output']>;
};
export type TickerExternalAgent = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  caller?: Maybe<Identity>;
  callerId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type TickerExternalAgentAction = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  caller?: Maybe<Identity>;
  callerId?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventId: EventIdEnum;
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  palletName: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type TickerExternalAgentActionFilter = {
  and?: InputMaybe<Array<TickerExternalAgentActionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  caller?: InputMaybe<IdentityFilter>;
  callerExists?: InputMaybe<Scalars['Boolean']['input']>;
  callerId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventId?: InputMaybe<EventIdEnumFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<TickerExternalAgentActionFilter>;
  or?: InputMaybe<Array<TickerExternalAgentActionFilter>>;
  palletName?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum TickerExternalAgentActionsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CallerIdAsc = 'CALLER_ID_ASC',
  CallerIdDesc = 'CALLER_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  EventIdAsc = 'EVENT_ID_ASC',
  EventIdDesc = 'EVENT_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PalletNameAsc = 'PALLET_NAME_ASC',
  PalletNameDesc = 'PALLET_NAME_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TickerExternalAgentFilter = {
  and?: InputMaybe<Array<TickerExternalAgentFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  caller?: InputMaybe<IdentityFilter>;
  callerId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<TickerExternalAgentFilter>;
  or?: InputMaybe<Array<TickerExternalAgentFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum TickerExternalAgentHistoriesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdentityIdAsc = 'IDENTITY_ID_ASC',
  IdentityIdDesc = 'IDENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PermissionsAsc = 'PERMISSIONS_ASC',
  PermissionsDesc = 'PERMISSIONS_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TickerExternalAgentHistory = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  datetime: Scalars['Datetime']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  identity?: Maybe<Identity>;
  identityId: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  permissions?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type TickerExternalAgentHistoryFilter = {
  and?: InputMaybe<Array<TickerExternalAgentHistoryFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  datetime?: InputMaybe<DatetimeFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  identity?: InputMaybe<IdentityFilter>;
  identityId?: InputMaybe<StringFilter>;
  not?: InputMaybe<TickerExternalAgentHistoryFilter>;
  or?: InputMaybe<Array<TickerExternalAgentHistoryFilter>>;
  permissions?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum TickerExternalAgentsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CallerIdAsc = 'CALLER_ID_ASC',
  CallerIdDesc = 'CALLER_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  DatetimeAsc = 'DATETIME_ASC',
  DatetimeDesc = 'DATETIME_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TransferCompliance = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  claimIssuer?: Maybe<Identity>;
  claimIssuerId?: Maybe<Scalars['String']['output']>;
  claimType?: Maybe<ClaimTypeEnum>;
  claimValue?: Maybe<Scalars['String']['output']>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  max?: Maybe<Scalars['BigFloat']['output']>;
  min?: Maybe<Scalars['BigFloat']['output']>;
  nodeId: Scalars['ID']['output'];
  statType?: Maybe<StatType>;
  statTypeId: Scalars['String']['output'];
  type: TransferComplianceTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  value?: Maybe<Scalars['BigFloat']['output']>;
};
export type TransferComplianceExemption = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  claimType?: Maybe<ClaimTypeEnum>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  exemptedEntityId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  opType: StatOpTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type TransferComplianceExemptionFilter = {
  and?: InputMaybe<Array<TransferComplianceExemptionFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  exemptedEntityId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<TransferComplianceExemptionFilter>;
  opType?: InputMaybe<StatOpTypeEnumFilter>;
  or?: InputMaybe<Array<TransferComplianceExemptionFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum TransferComplianceExemptionsOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  ExemptedEntityIdAsc = 'EXEMPTED_ENTITY_ID_ASC',
  ExemptedEntityIdDesc = 'EXEMPTED_ENTITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OpTypeAsc = 'OP_TYPE_ASC',
  OpTypeDesc = 'OP_TYPE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TransferComplianceFilter = {
  and?: InputMaybe<Array<TransferComplianceFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  claimIssuer?: InputMaybe<IdentityFilter>;
  claimIssuerExists?: InputMaybe<Scalars['Boolean']['input']>;
  claimIssuerId?: InputMaybe<StringFilter>;
  claimType?: InputMaybe<ClaimTypeEnumFilter>;
  claimValue?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  max?: InputMaybe<BigFloatFilter>;
  min?: InputMaybe<BigFloatFilter>;
  not?: InputMaybe<TransferComplianceFilter>;
  or?: InputMaybe<Array<TransferComplianceFilter>>;
  statType?: InputMaybe<StatTypeFilter>;
  statTypeId?: InputMaybe<StringFilter>;
  type?: InputMaybe<TransferComplianceTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  value?: InputMaybe<BigFloatFilter>;
};
export enum TransferComplianceTypeEnum {
  ClaimCount = 'ClaimCount',
  ClaimOwnership = 'ClaimOwnership',
  MaxInvestorCount = 'MaxInvestorCount',
  MaxInvestorOwnership = 'MaxInvestorOwnership',
}
export type TransferComplianceTypeEnumFilter = {
  distinctFrom?: InputMaybe<TransferComplianceTypeEnum>;
  equalTo?: InputMaybe<TransferComplianceTypeEnum>;
  greaterThan?: InputMaybe<TransferComplianceTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  in?: InputMaybe<Array<TransferComplianceTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<TransferComplianceTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  notDistinctFrom?: InputMaybe<TransferComplianceTypeEnum>;
  notEqualTo?: InputMaybe<TransferComplianceTypeEnum>;
  notIn?: InputMaybe<Array<TransferComplianceTypeEnum>>;
};
export enum TransferCompliancesOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  ClaimIssuerIdAsc = 'CLAIM_ISSUER_ID_ASC',
  ClaimIssuerIdDesc = 'CLAIM_ISSUER_ID_DESC',
  ClaimTypeAsc = 'CLAIM_TYPE_ASC',
  ClaimTypeDesc = 'CLAIM_TYPE_DESC',
  ClaimValueAsc = 'CLAIM_VALUE_ASC',
  ClaimValueDesc = 'CLAIM_VALUE_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  MaxAsc = 'MAX_ASC',
  MaxDesc = 'MAX_DESC',
  MinAsc = 'MIN_ASC',
  MinDesc = 'MIN_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  StatTypeIdAsc = 'STAT_TYPE_ID_ASC',
  StatTypeIdDesc = 'STAT_TYPE_ID_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type TransferManager = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  exemptedEntities: Scalars['JSON']['output'];
  id: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  type: TransferRestrictionTypeEnum;
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};
export type TransferManagerFilter = {
  and?: InputMaybe<Array<TransferManagerFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  exemptedEntities?: InputMaybe<JsonFilter>;
  id?: InputMaybe<StringFilter>;
  not?: InputMaybe<TransferManagerFilter>;
  or?: InputMaybe<Array<TransferManagerFilter>>;
  type?: InputMaybe<TransferRestrictionTypeEnumFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
  value?: InputMaybe<IntFilter>;
};
export enum TransferManagersOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  ExemptedEntitiesAsc = 'EXEMPTED_ENTITIES_ASC',
  ExemptedEntitiesDesc = 'EXEMPTED_ENTITIES_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export enum TransferRestrictionTypeEnum {
  Count = 'Count',
  Percentage = 'Percentage',
}
export type TransferRestrictionTypeEnumFilter = {
  distinctFrom?: InputMaybe<TransferRestrictionTypeEnum>;
  equalTo?: InputMaybe<TransferRestrictionTypeEnum>;
  greaterThan?: InputMaybe<TransferRestrictionTypeEnum>;
  greaterThanOrEqualTo?: InputMaybe<TransferRestrictionTypeEnum>;
  in?: InputMaybe<Array<TransferRestrictionTypeEnum>>;
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  lessThan?: InputMaybe<TransferRestrictionTypeEnum>;
  lessThanOrEqualTo?: InputMaybe<TransferRestrictionTypeEnum>;
  notDistinctFrom?: InputMaybe<TransferRestrictionTypeEnum>;
  notEqualTo?: InputMaybe<TransferRestrictionTypeEnum>;
  notIn?: InputMaybe<Array<TransferRestrictionTypeEnum>>;
};
export type TrustedClaimIssuer = Node & {
  asset?: Maybe<Asset>;
  assetId: Scalars['String']['output'];
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  createdEvent?: Maybe<Event>;
  createdEventId: Scalars['String']['output'];
  eventIdx: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  nodeId: Scalars['ID']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type TrustedClaimIssuerFilter = {
  and?: InputMaybe<Array<TrustedClaimIssuerFilter>>;
  asset?: InputMaybe<AssetFilter>;
  assetId?: InputMaybe<StringFilter>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  createdEvent?: InputMaybe<EventFilter>;
  createdEventId?: InputMaybe<StringFilter>;
  eventIdx?: InputMaybe<IntFilter>;
  id?: InputMaybe<StringFilter>;
  issuer?: InputMaybe<StringFilter>;
  not?: InputMaybe<TrustedClaimIssuerFilter>;
  or?: InputMaybe<Array<TrustedClaimIssuerFilter>>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum TrustedClaimIssuersOrderBy {
  AssetIdAsc = 'ASSET_ID_ASC',
  AssetIdDesc = 'ASSET_ID_DESC',
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  CreatedEventIdAsc = 'CREATED_EVENT_ID_ASC',
  CreatedEventIdDesc = 'CREATED_EVENT_ID_DESC',
  EventIdxAsc = 'EVENT_IDX_ASC',
  EventIdxDesc = 'EVENT_IDX_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IssuerAsc = 'ISSUER_ASC',
  IssuerDesc = 'ISSUER_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type Venue = Node & {
  assetsByStoVenueIdAndOfferingAssetId: Connection<Asset>;
  blocksByInstructionVenueIdAndCreatedBlockId: Connection<Block>;
  blocksByInstructionVenueIdAndUpdatedBlockId: Connection<Block>;
  blocksByStoVenueIdAndCreatedBlockId: Connection<Block>;
  blocksByStoVenueIdAndUpdatedBlockId: Connection<Block>;
  createdBlock?: Maybe<Block>;
  createdBlockId: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  eventsByInstructionVenueIdAndCreatedEventId: Connection<Event>;
  id: Scalars['String']['output'];
  identitiesByStoVenueIdAndCreatorId: Connection<Identity>;
  instructions: Connection<Instruction>;
  nodeId: Scalars['ID']['output'];
  owner?: Maybe<Identity>;
  ownerId: Scalars['String']['output'];
  portfoliosByStoVenueIdAndOfferingPortfolioId: Connection<Portfolio>;
  portfoliosByStoVenueIdAndRaisingPortfolioId: Connection<Portfolio>;
  signers: Scalars['JSON']['output'];
  stos: Connection<Sto>;
  type: Scalars['String']['output'];
  updatedBlock?: Maybe<Block>;
  updatedBlockId: Scalars['String']['output'];
};
export type VenueFilter = {
  and?: InputMaybe<Array<VenueFilter>>;
  createdBlock?: InputMaybe<BlockFilter>;
  createdBlockId?: InputMaybe<StringFilter>;
  details?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  instructions?: InputMaybe<OneToManyFilter<InstructionFilter>>;
  not?: InputMaybe<VenueFilter>;
  or?: InputMaybe<Array<VenueFilter>>;
  owner?: InputMaybe<IdentityFilter>;
  ownerId?: InputMaybe<StringFilter>;
  signers?: InputMaybe<JsonFilter>;
  stos?: InputMaybe<OneToManyFilter<StoFilter>>;
  type?: InputMaybe<StringFilter>;
  updatedBlock?: InputMaybe<BlockFilter>;
  updatedBlockId?: InputMaybe<StringFilter>;
};
export enum VenuesOrderBy {
  CreatedBlockIdAsc = 'CREATED_BLOCK_ID_ASC',
  CreatedBlockIdDesc = 'CREATED_BLOCK_ID_DESC',
  DetailsAsc = 'DETAILS_ASC',
  DetailsDesc = 'DETAILS_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  OwnerIdAsc = 'OWNER_ID_ASC',
  OwnerIdDesc = 'OWNER_ID_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignersAsc = 'SIGNERS_ASC',
  SignersDesc = 'SIGNERS_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UpdatedBlockIdAsc = 'UPDATED_BLOCK_ID_ASC',
  UpdatedBlockIdDesc = 'UPDATED_BLOCK_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
}
export type _Metadata = {
  chain?: Maybe<Scalars['String']['output']>;
  dbSize?: Maybe<Scalars['BigInt']['output']>;
  deployments?: Maybe<Scalars['JSON']['output']>;
  dynamicDatasources?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  evmChainId?: Maybe<Scalars['String']['output']>;
  genesisHash?: Maybe<Scalars['String']['output']>;
  indexerHealthy?: Maybe<Scalars['Boolean']['output']>;
  indexerNodeVersion?: Maybe<Scalars['String']['output']>;
  lastCreatedPoiHeight?: Maybe<Scalars['Int']['output']>;
  lastFinalizedVerifiedHeight?: Maybe<Scalars['Int']['output']>;
  lastProcessedHeight?: Maybe<Scalars['Int']['output']>;
  lastProcessedTimestamp?: Maybe<Scalars['Date']['output']>;
  latestSyncedPoiHeight?: Maybe<Scalars['Int']['output']>;
  queryNodeVersion?: Maybe<Scalars['String']['output']>;
  rowCountEstimate?: Maybe<Array<Maybe<TableEstimate>>>;
  specName?: Maybe<Scalars['String']['output']>;
  startHeight?: Maybe<Scalars['Int']['output']>;
  targetHeight?: Maybe<Scalars['Int']['output']>;
  unfinalizedBlocks?: Maybe<Scalars['String']['output']>;
};
export type _Metadatas = {
  nodes: Array<Maybe<_Metadata>>;
  totalCount: Scalars['Int']['output'];
};
