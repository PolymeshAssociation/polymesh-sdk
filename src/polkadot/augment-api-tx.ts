// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

// import type lookup before we augment - in some environments
// this is required to allow for ambient/previous definitions
import '@polkadot/api-base/types/submittable';

import type {
  ApiTypes,
  AugmentedSubmittable,
  SubmittableExtrinsic,
  SubmittableExtrinsicFunction,
} from '@polkadot/api-base/types';
import type {
  BTreeSet,
  Bytes,
  Compact,
  Option,
  U8aFixed,
  Vec,
  bool,
  u128,
  u16,
  u32,
  u64,
  u8,
} from '@polkadot/types-codec';
import type { AnyNumber, IMethod, ITuple } from '@polkadot/types-codec/types';
import type {
  AccountId32,
  Call,
  H256,
  MultiAddress,
  Permill,
} from '@polkadot/types/interfaces/runtime';
import type {
  ConfidentialAssetsBurnConfidentialBurnProof,
  PalletConfidentialAssetAffirmTransactions,
  PalletConfidentialAssetConfidentialAccount,
  PalletConfidentialAssetConfidentialAuditors,
  PalletConfidentialAssetConfidentialMoveFunds,
  PalletConfidentialAssetTransactionId,
  PalletConfidentialAssetTransactionLeg,
  PalletContractsWasmDeterminism,
  PalletCorporateActionsBallotBallotMeta,
  PalletCorporateActionsBallotBallotTimeRange,
  PalletCorporateActionsBallotBallotVote,
  PalletCorporateActionsCaId,
  PalletCorporateActionsCaKind,
  PalletCorporateActionsInitiateCorporateActionArgs,
  PalletCorporateActionsRecordDateSpec,
  PalletCorporateActionsTargetIdentities,
  PalletImOnlineHeartbeat,
  PalletImOnlineSr25519AppSr25519Signature,
  PalletPipsSnapshotResult,
  PalletStoPriceTier,
  PalletUtilityUniqueCall,
  PolymeshCommonUtilitiesCheckpointScheduleCheckpoints,
  PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth,
  PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth,
  PolymeshCommonUtilitiesMaybeBlock,
  PolymeshCommonUtilitiesProtocolFeeProtocolOp,
  PolymeshContractsApi,
  PolymeshContractsChainExtensionExtrinsicId,
  PolymeshContractsNextUpgrade,
  PolymeshPrimitivesAgentAgentGroup,
  PolymeshPrimitivesAssetAssetType,
  PolymeshPrimitivesAssetIdentifier,
  PolymeshPrimitivesAssetMetadataAssetMetadataKey,
  PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
  PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail,
  PolymeshPrimitivesAssetNonFungibleType,
  PolymeshPrimitivesAuthorizationAuthorizationData,
  PolymeshPrimitivesBeneficiary,
  PolymeshPrimitivesComplianceManagerComplianceRequirement,
  PolymeshPrimitivesCondition,
  PolymeshPrimitivesConditionTrustedIssuer,
  PolymeshPrimitivesDocument,
  PolymeshPrimitivesIdentityClaimClaim,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityClaimScope,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesIdentityIdPortfolioId,
  PolymeshPrimitivesIdentityIdPortfolioKind,
  PolymeshPrimitivesMemo,
  PolymeshPrimitivesNftNfTs,
  PolymeshPrimitivesNftNftCollectionKeys,
  PolymeshPrimitivesNftNftMetadataAttribute,
  PolymeshPrimitivesPortfolioFund,
  PolymeshPrimitivesPosRatio,
  PolymeshPrimitivesSecondaryKey,
  PolymeshPrimitivesSecondaryKeyPermissions,
  PolymeshPrimitivesSecondaryKeySignatory,
  PolymeshPrimitivesSettlementAffirmationCount,
  PolymeshPrimitivesSettlementAssetCount,
  PolymeshPrimitivesSettlementLeg,
  PolymeshPrimitivesSettlementReceiptDetails,
  PolymeshPrimitivesSettlementSettlementType,
  PolymeshPrimitivesSettlementVenueType,
  PolymeshPrimitivesStatisticsAssetScope,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
  PolymeshPrimitivesTicker,
  PolymeshPrimitivesTransferComplianceTransferCondition,
  PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
  PolymeshPrivateRuntimeDevelopRuntimeOriginCaller,
  PolymeshPrivateRuntimeDevelopRuntimeSessionKeys,
  SpConsensusBabeDigestsNextConfigDescriptor,
  SpConsensusGrandpaEquivocationProof,
  SpConsensusSlotsEquivocationProof,
  SpRuntimeMultiSignature,
  SpSessionMembershipProof,
  SpWeightsWeightV2Weight,
} from '@polkadot/types/lookup';

export type __AugmentedSubmittable = AugmentedSubmittable<() => unknown>;
export type __SubmittableExtrinsic<ApiType extends ApiTypes> = SubmittableExtrinsic<ApiType>;
export type __SubmittableExtrinsicFunction<ApiType extends ApiTypes> =
  SubmittableExtrinsicFunction<ApiType>;

declare module '@polkadot/api-base/types/submittable' {
  interface AugmentedSubmittables<ApiType extends ApiTypes> {
    asset: {
      /**
       * This function is used to accept a token ownership transfer.
       * NB: To reject the transfer, call remove auth function in identity module.
       *
       * # Arguments
       * * `origin` It contains the secondary key of the caller (i.e. who signed the transaction to execute this function).
       * * `auth_id` Authorization ID of the token ownership transfer authorization.
       **/
      acceptAssetOwnershipTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Accepts a ticker transfer.
       *
       * Consumes the authorization `auth_id` (see `pallet_identity::consume_auth`).
       * NB: To reject the transfer, call remove auth function in identity module.
       *
       * # Arguments
       * * `origin` It contains the secondary key of the caller (i.e. who signed the transaction to execute this function).
       * * `auth_id` Authorization ID of ticker transfer authorization.
       *
       * ## Errors
       * - `AuthorizationError::BadType` if `auth_id` is not a valid ticket transfer authorization.
       *
       **/
      acceptTickerTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Add documents for a given token.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `docs` Documents to be attached to `ticker`.
       *
       * # Permissions
       * * Asset
       **/
      addDocuments: AugmentedSubmittable<
        (
          docs:
            | Vec<PolymeshPrimitivesDocument>
            | (
                | PolymeshPrimitivesDocument
                | { uri?: any; contentHash?: any; name?: any; docType?: any; filingDate?: any }
                | string
                | Uint8Array
              )[],
          ticker: PolymeshPrimitivesTicker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesDocument>, PolymeshPrimitivesTicker]
      >;
      /**
       * Sets all identities in the `mediators` set as mandatory mediators for any instruction transfering `ticker`.
       *
       * # Arguments
       * * `origin`: The secondary key of the sender.
       * * `ticker`: The [`Ticker`] of the asset that will require the mediators.
       * * `mediators`: A set of [`IdentityId`] of all the mandatory mediators for the given ticker.
       *
       * # Permissions
       * * Asset
       **/
      addMandatoryMediators: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          mediators: BTreeSet<PolymeshPrimitivesIdentityId>
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, BTreeSet<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Forces a transfer of token from `from_portfolio` to the caller's default portfolio.
       *
       * # Arguments
       * * `origin` Must be an external agent with appropriate permissions for a given ticker.
       * * `ticker` Ticker symbol of the asset.
       * * `value`  Amount of tokens need to force transfer.
       * * `from_portfolio` From whom portfolio tokens gets transferred.
       **/
      controllerTransfer: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          value: u128 | AnyNumber | Uint8Array,
          fromPortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u128, PolymeshPrimitivesIdentityIdPortfolioId]
      >;
      /**
       * Initializes a new security token, with the initiating account as its owner.
       * The total supply will initially be zero. To mint tokens, use `issue`.
       *
       * # Arguments
       * * `origin` - contains the secondary key of the caller (i.e. who signed the transaction to execute this function).
       * * `name` - the name of the token.
       * * `ticker` - the ticker symbol of the token.
       * * `divisible` - a boolean to identify the divisibility status of the token.
       * * `asset_type` - the asset type.
       * * `identifiers` - a vector of asset identifiers.
       * * `funding_round` - name of the funding round.
       *
       * ## Errors
       * - `InvalidAssetIdentifier` if any of `identifiers` are invalid.
       * - `MaxLengthOfAssetNameExceeded` if `name`'s length exceeds `T::AssetNameMaxLength`.
       * - `FundingRoundNameMaxLengthExceeded` if the name of the funding round is longer that
       * `T::FundingRoundNameMaxLength`.
       * - `AssetAlreadyCreated` if asset was already created.
       * - `TickerTooLong` if `ticker`'s length is greater than `config.max_ticker_length` chain
       * parameter.
       * - `TickerNotAlphanumeric` if `ticker` is not yet registered, and contains non-alphanumeric characters or any character after first occurrence of `\0`.
       *
       * ## Permissions
       * * Portfolio
       **/
      createAsset: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          divisible: bool | boolean | Uint8Array,
          assetType:
            | PolymeshPrimitivesAssetAssetType
            | { EquityCommon: any }
            | { EquityPreferred: any }
            | { Commodity: any }
            | { FixedIncome: any }
            | { REIT: any }
            | { Fund: any }
            | { RevenueShareAgreement: any }
            | { StructuredProduct: any }
            | { Derivative: any }
            | { Custom: any }
            | { StableCoin: any }
            | { NonFungible: any }
            | string
            | Uint8Array,
          identifiers:
            | Vec<PolymeshPrimitivesAssetIdentifier>
            | (
                | PolymeshPrimitivesAssetIdentifier
                | { CUSIP: any }
                | { CINS: any }
                | { ISIN: any }
                | { LEI: any }
                | { FIGI: any }
                | string
                | Uint8Array
              )[],
          fundingRound: Option<Bytes> | null | Uint8Array | Bytes | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          PolymeshPrimitivesTicker,
          bool,
          PolymeshPrimitivesAssetAssetType,
          Vec<PolymeshPrimitivesAssetIdentifier>,
          Option<Bytes>
        ]
      >;
      /**
       * Utility extrinsic to batch `create_asset` and `register_custom_asset_type`.
       **/
      createAssetWithCustomType: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          divisible: bool | boolean | Uint8Array,
          customAssetType: Bytes | string | Uint8Array,
          identifiers:
            | Vec<PolymeshPrimitivesAssetIdentifier>
            | (
                | PolymeshPrimitivesAssetIdentifier
                | { CUSIP: any }
                | { CINS: any }
                | { ISIN: any }
                | { LEI: any }
                | { FIGI: any }
                | string
                | Uint8Array
              )[],
          fundingRound: Option<Bytes> | null | Uint8Array | Bytes | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          Bytes,
          PolymeshPrimitivesTicker,
          bool,
          Bytes,
          Vec<PolymeshPrimitivesAssetIdentifier>,
          Option<Bytes>
        ]
      >;
      /**
       * Pre-approves the receivement of the asset for all identities.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will be exempt from affirmation.
       *
       * # Permissions
       * * Root
       **/
      exemptTickerAffirmation: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Freezes transfers of a given token.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the token.
       *
       * ## Errors
       * - `AlreadyFrozen` if `ticker` is already frozen.
       *
       * # Permissions
       * * Asset
       **/
      freeze: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Issue, or mint, new tokens to the caller, which must be an authorized external agent.
       *
       * # Arguments
       * * `origin` - A signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - The [`Ticker`] of the token.
       * * `amount` - The amount of tokens that will be issued.
       * * `portfolio_kind` - The [`PortfolioKind`] of the portfolio that will receive the minted tokens.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      issue: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          portfolioKind:
            | PolymeshPrimitivesIdentityIdPortfolioKind
            | { Default: any }
            | { User: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u128, PolymeshPrimitivesIdentityIdPortfolioKind]
      >;
      /**
       * Makes an indivisible token divisible.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       *
       * ## Errors
       * - `AssetAlreadyDivisible` if `ticker` is already divisible.
       *
       * # Permissions
       * * Asset
       **/
      makeDivisible: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Pre-approves the receivement of an asset.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will be exempt from affirmation.
       *
       * # Permissions
       * * Asset
       **/
      preApproveTicker: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Redeems existing tokens by reducing the balance of the caller's default portfolio and the total supply of the token
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `value` Amount of tokens to redeem.
       *
       * # Errors
       * - `Unauthorized` If called by someone without the appropriate external agent permissions
       * - `InvalidGranularity` If the amount is not divisible by 10^6 for non-divisible tokens
       * - `InsufficientPortfolioBalance` If the caller's default portfolio doesn't have enough free balance
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      redeem: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          value: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u128]
      >;
      /**
       * Redeems existing tokens by reducing the balance of the caller's portfolio and the total supply of the token
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `value` Amount of tokens to redeem.
       * * `portfolio` From whom portfolio tokens gets transferred.
       *
       * # Errors
       * - `Unauthorized` If called by someone without the appropriate external agent permissions
       * - `InvalidGranularity` If the amount is not divisible by 10^6 for non-divisible tokens
       * - `InsufficientPortfolioBalance` If the caller's `portfolio` doesn't have enough free balance
       * - `PortfolioDoesNotExist` If the portfolio doesn't exist.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      redeemFromPortfolio: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          value: u128 | AnyNumber | Uint8Array,
          portfolio:
            | PolymeshPrimitivesIdentityIdPortfolioKind
            | { Default: any }
            | { User: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u128, PolymeshPrimitivesIdentityIdPortfolioKind]
      >;
      /**
       * Registers and set local asset metadata.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `name` Metadata name.
       * * `spec` Metadata type definition.
       * * `value` Metadata value.
       * * `details` Optional Metadata value details (expire, lock status).
       *
       * # Errors
       * * `AssetMetadataLocalKeyAlreadyExists` if a local metadata type with `name` already exists for `ticker`.
       * * `AssetMetadataNameMaxLengthExceeded` if the metadata `name` exceeds the maximum length.
       * * `AssetMetadataTypeDefMaxLengthExceeded` if the metadata `spec` type definition exceeds the maximum length.
       * * `AssetMetadataValueMaxLengthExceeded` if the metadata value exceeds the maximum length.
       *
       * # Permissions
       * * Agent
       * * Asset
       **/
      registerAndSetLocalAssetMetadata: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          name: Bytes | string | Uint8Array,
          spec:
            | PolymeshPrimitivesAssetMetadataAssetMetadataSpec
            | { url?: any; description?: any; typeDef?: any }
            | string
            | Uint8Array,
          value: Bytes | string | Uint8Array,
          detail:
            | Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
            | null
            | Uint8Array
            | PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
            | { expire?: any; lockStatus?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          Bytes,
          PolymeshPrimitivesAssetMetadataAssetMetadataSpec,
          Bytes,
          Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
        ]
      >;
      /**
       * Registers asset metadata global type.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `name` Metadata name.
       * * `spec` Metadata type definition.
       *
       * # Errors
       * * `AssetMetadataGlobalKeyAlreadyExists` if a globa metadata type with `name` already exists.
       * * `AssetMetadataNameMaxLengthExceeded` if the metadata `name` exceeds the maximum length.
       * * `AssetMetadataTypeDefMaxLengthExceeded` if the metadata `spec` type definition exceeds the maximum length.
       **/
      registerAssetMetadataGlobalType: AugmentedSubmittable<
        (
          name: Bytes | string | Uint8Array,
          spec:
            | PolymeshPrimitivesAssetMetadataAssetMetadataSpec
            | { url?: any; description?: any; typeDef?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, PolymeshPrimitivesAssetMetadataAssetMetadataSpec]
      >;
      /**
       * Registers asset metadata local type.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `name` Metadata name.
       * * `spec` Metadata type definition.
       *
       * # Errors
       * * `AssetMetadataLocalKeyAlreadyExists` if a local metadata type with `name` already exists for `ticker`.
       * * `AssetMetadataNameMaxLengthExceeded` if the metadata `name` exceeds the maximum length.
       * * `AssetMetadataTypeDefMaxLengthExceeded` if the metadata `spec` type definition exceeds the maximum length.
       *
       * # Permissions
       * * Agent
       * * Asset
       **/
      registerAssetMetadataLocalType: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          name: Bytes | string | Uint8Array,
          spec:
            | PolymeshPrimitivesAssetMetadataAssetMetadataSpec
            | { url?: any; description?: any; typeDef?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Bytes, PolymeshPrimitivesAssetMetadataAssetMetadataSpec]
      >;
      /**
       * Registers a custom asset type.
       *
       * The provided `ty` will be bound to an ID in storage.
       * The ID can then be used in `AssetType::Custom`.
       * Should the `ty` already exist in storage, no second ID is assigned to it.
       *
       * # Arguments
       * * `origin` who called the extrinsic.
       * * `ty` contains the string representation of the asset type.
       **/
      registerCustomAssetType: AugmentedSubmittable<
        (ty: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Registers a new ticker or extends validity of an existing ticker.
       * NB: Ticker validity does not get carry forward when renewing ticker.
       *
       * # Arguments
       * * `origin` It contains the secondary key of the caller (i.e. who signed the transaction to execute this function).
       * * `ticker` ticker to register.
       *
       * # Permissions
       * * Asset
       **/
      registerTicker: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Remove documents for a given token.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `ids` Documents ids to be removed from `ticker`.
       *
       * # Permissions
       * * Asset
       **/
      removeDocuments: AugmentedSubmittable<
        (
          ids: Vec<u32> | (u32 | AnyNumber | Uint8Array)[],
          ticker: PolymeshPrimitivesTicker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<u32>, PolymeshPrimitivesTicker]
      >;
      /**
       * Removes the asset metadata key and value of a local key.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the local metadata key.
       * * `local_key` - the local metadata key.
       *
       * # Errors
       * - `SecondaryKeyNotAuthorizedForAsset` - if called by someone without the appropriate external agent permissions.
       * - `UnauthorizedAgent` - if called by someone without the appropriate external agent permissions.
       * - `AssetMetadataKeyIsMissing` - if the key doens't exist.
       * - `AssetMetadataValueIsLocked` - if the value of the key is locked.
       * - AssetMetadataKeyBelongsToNFTCollection - if the key is a mandatory key in an NFT collection.
       *
       * # Permissions
       * * Asset
       **/
      removeLocalMetadataKey: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          localKey: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64]
      >;
      /**
       * Removes all identities in the `mediators` set from the mandatory mediators list for the given `ticker`.
       *
       * # Arguments
       * * `origin`: The secondary key of the sender.
       * * `ticker`: The [`Ticker`] of the asset that will have mediators removed.
       * * `mediators`: A set of [`IdentityId`] of all the mediators that will be removed from the mandatory mediators list.
       *
       * # Permissions
       * * Asset
       **/
      removeMandatoryMediators: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          mediators: BTreeSet<PolymeshPrimitivesIdentityId>
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, BTreeSet<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Removes the asset metadata value of a metadata key.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the local metadata key.
       * * `metadata_key` - the metadata key that will have its value deleted.
       *
       * # Errors
       * - `SecondaryKeyNotAuthorizedForAsset` - if called by someone without the appropriate external agent permissions.
       * - `UnauthorizedAgent` - if called by someone without the appropriate external agent permissions.
       * - `AssetMetadataKeyIsMissing` - if the key doens't exist.
       * - `AssetMetadataValueIsLocked` - if the value of the key is locked.
       *
       * # Permissions
       * * Asset
       **/
      removeMetadataValue: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          metadataKey:
            | PolymeshPrimitivesAssetMetadataAssetMetadataKey
            | { Global: any }
            | { Local: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesAssetMetadataAssetMetadataKey]
      >;
      /**
       * Removes the pre-approval of the asset for all identities.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will have its exemption removed.
       *
       * # Permissions
       * * Root
       **/
      removeTickerAffirmationExemption: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Removes the pre approval of an asset.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will have its exemption removed.
       *
       * # Permissions
       * * Asset
       **/
      removeTickerPreApproval: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Renames a given token.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the token.
       * * `name` - the new name of the token.
       *
       * ## Errors
       * - `MaxLengthOfAssetNameExceeded` if length of `name` is greater than
       * `T::AssetNameMaxLength`.
       *
       * # Permissions
       * * Asset
       **/
      renameAsset: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          name: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Bytes]
      >;
      /**
       * Set asset metadata value.
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `key` Metadata key.
       * * `value` Metadata value.
       * * `details` Optional Metadata value details (expire, lock status).
       *
       * # Errors
       * * `AssetMetadataKeyIsMissing` if the metadata type key doesn't exist.
       * * `AssetMetadataValueIsLocked` if the metadata value for `key` is locked.
       * * `AssetMetadataValueMaxLengthExceeded` if the metadata value exceeds the maximum length.
       *
       * # Permissions
       * * Agent
       * * Asset
       **/
      setAssetMetadata: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          key:
            | PolymeshPrimitivesAssetMetadataAssetMetadataKey
            | { Global: any }
            | { Local: any }
            | string
            | Uint8Array,
          value: Bytes | string | Uint8Array,
          detail:
            | Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
            | null
            | Uint8Array
            | PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
            | { expire?: any; lockStatus?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesAssetMetadataAssetMetadataKey,
          Bytes,
          Option<PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail>
        ]
      >;
      /**
       * Set asset metadata value details (expire, lock status).
       *
       * # Arguments
       * * `origin` is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` Ticker of the token.
       * * `key` Metadata key.
       * * `details` Metadata value details (expire, lock status).
       *
       * # Errors
       * * `AssetMetadataKeyIsMissing` if the metadata type key doesn't exist.
       * * `AssetMetadataValueIsLocked` if the metadata value for `key` is locked.
       *
       * # Permissions
       * * Agent
       * * Asset
       **/
      setAssetMetadataDetails: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          key:
            | PolymeshPrimitivesAssetMetadataAssetMetadataKey
            | { Global: any }
            | { Local: any }
            | string
            | Uint8Array,
          detail:
            | PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
            | { expire?: any; lockStatus?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesAssetMetadataAssetMetadataKey,
          PolymeshPrimitivesAssetMetadataAssetMetadataValueDetail
        ]
      >;
      /**
       * Sets the name of the current funding round.
       *
       * # Arguments
       * * `origin` - a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - the ticker of the token.
       * * `name` - the desired name of the current funding round.
       *
       * ## Errors
       * - `FundingRoundNameMaxLengthExceeded` if length of `name` is greater than
       * `T::FundingRoundNameMaxLength`.
       *
       * # Permissions
       * * Asset
       **/
      setFundingRound: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          name: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Bytes]
      >;
      /**
       * Unfreezes transfers of a given token.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the frozen token.
       *
       * ## Errors
       * - `NotFrozen` if `ticker` is not frozen yet.
       *
       * # Permissions
       * * Asset
       **/
      unfreeze: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Updates the type of an asset.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the ticker of the token.
       * * `asset_type` - the new type of the token.
       *
       * ## Errors
       * - `InvalidCustomAssetTypeId` if `asset_type` is of type custom and has an invalid type id.
       *
       * # Permissions
       * * Asset
       **/
      updateAssetType: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          assetType:
            | PolymeshPrimitivesAssetAssetType
            | { EquityCommon: any }
            | { EquityPreferred: any }
            | { Commodity: any }
            | { FixedIncome: any }
            | { REIT: any }
            | { Fund: any }
            | { RevenueShareAgreement: any }
            | { StructuredProduct: any }
            | { Derivative: any }
            | { Custom: any }
            | { StableCoin: any }
            | { NonFungible: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesAssetAssetType]
      >;
      /**
       * Updates the asset identifiers.
       *
       * # Arguments
       * * `origin` - a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - the ticker of the token.
       * * `asset_identifiers` - the asset identifiers to be updated in the form of a vector of pairs of `IdentifierType` and `AssetIdentifier` value.
       *
       * ## Errors
       * - `InvalidAssetIdentifier` if `identifiers` contains any invalid identifier.
       *
       * # Permissions
       * * Asset
       **/
      updateIdentifiers: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          assetIdentifiers:
            | Vec<PolymeshPrimitivesAssetIdentifier>
            | (
                | PolymeshPrimitivesAssetIdentifier
                | { CUSIP: any }
                | { CINS: any }
                | { ISIN: any }
                | { LEI: any }
                | { FIGI: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Vec<PolymeshPrimitivesAssetIdentifier>]
      >;
    };
    babe: {
      /**
       * Plan an epoch config change. The epoch config change is recorded and will be enacted on
       * the next call to `enact_epoch_change`. The config will be activated one epoch after.
       * Multiple calls to this method will replace any existing planned config change that had
       * not been enacted yet.
       **/
      planConfigChange: AugmentedSubmittable<
        (
          config: SpConsensusBabeDigestsNextConfigDescriptor | { V1: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusBabeDigestsNextConfigDescriptor]
      >;
      /**
       * Report authority equivocation/misbehavior. This method will verify
       * the equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence will
       * be reported.
       **/
      reportEquivocation: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusSlotsEquivocationProof
            | { offender?: any; slot?: any; firstHeader?: any; secondHeader?: any }
            | string
            | Uint8Array,
          keyOwnerProof:
            | SpSessionMembershipProof
            | { session?: any; trieNodes?: any; validatorCount?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusSlotsEquivocationProof, SpSessionMembershipProof]
      >;
      /**
       * Report authority equivocation/misbehavior. This method will verify
       * the equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence will
       * be reported.
       * This extrinsic must be called unsigned and it is expected that only
       * block authors will call it (validated in `ValidateUnsigned`), as such
       * if the block author is defined it will be defined as the equivocation
       * reporter.
       **/
      reportEquivocationUnsigned: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusSlotsEquivocationProof
            | { offender?: any; slot?: any; firstHeader?: any; secondHeader?: any }
            | string
            | Uint8Array,
          keyOwnerProof:
            | SpSessionMembershipProof
            | { session?: any; trieNodes?: any; validatorCount?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusSlotsEquivocationProof, SpSessionMembershipProof]
      >;
    };
    balances: {
      /**
       * Burns the given amount of tokens from the caller's free, unlocked balance.
       **/
      burnAccountBalance: AugmentedSubmittable<
        (amount: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u128]
      >;
      /**
       * Move some POLYX from balance of self to balance of BRR.
       **/
      depositBlockRewardReserveBalance: AugmentedSubmittable<
        (value: Compact<u128> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>]
      >;
      /**
       * Exactly as `transfer`, except the origin must be root and the source account may be
       * specified.
       *
       * # <weight>
       * - Same as transfer, but additional read and write because the source account is
       * not assumed to be in the overlay.
       * # </weight>
       **/
      forceTransfer: AugmentedSubmittable<
        (
          source:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, MultiAddress, Compact<u128>]
      >;
      /**
       * Set the balances of a given account.
       *
       * This will alter `FreeBalance` and `ReservedBalance` in storage. it will
       * also decrease the total issuance of the system (`TotalIssuance`).
       *
       * The dispatch origin for this call is `root`.
       **/
      setBalance: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          newFree: Compact<u128> | AnyNumber | Uint8Array,
          newReserved: Compact<u128> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>, Compact<u128>]
      >;
      /**
       * Transfer some liquid free balance to another account.
       *
       * `transfer` will set the `FreeBalance` of the sender and receiver.
       * It will decrease the total issuance of the system by the `TransferFee`.
       *
       * The dispatch origin for this call must be `Signed` by the transactor.
       *
       * # <weight>
       * - Dependent on arguments but not critical, given proper implementations for
       * input config types. See related functions below.
       * - It contains a limited number of reads and writes internally and no complex computation.
       *
       * Related functions:
       *
       * - `ensure_can_withdraw` is always called internally but has a bounded complexity.
       * - Transferring balances to accounts that did not exist before will cause
       * `T::OnNewAccount::on_new_account` to be called.
       * ---------------------------------
       * - Base Weight: 73.64 µs, worst case scenario (account created, account removed)
       * - DB Weight: 1 Read and 1 Write to destination account.
       * - Origin account is already in memory, so no DB operations for them.
       * # </weight>
       **/
      transfer: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>]
      >;
      /**
       * Transfer the native currency with the help of identifier string
       * this functionality can help to differentiate the transfers.
       *
       * # <weight>
       * - Base Weight: 73.64 µs, worst case scenario (account created, account removed)
       * - DB Weight: 1 Read and 1 Write to destination account.
       * - Origin account is already in memory, so no DB operations for them.
       * # </weight>
       **/
      transferWithMemo: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
          memo: Option<PolymeshPrimitivesMemo> | null | Uint8Array | PolymeshPrimitivesMemo | string
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>, Option<PolymeshPrimitivesMemo>]
      >;
    };
    base: {};
    capitalDistribution: {
      /**
       * Claim a benefit of the capital distribution attached to `ca_id`.
       *
       * Taxes are withheld as specified by the CA.
       * Post-tax earnings are then transferred to the default portfolio of the `origin`'s DID.
       *
       * All benefits are rounded by truncation, down to first integer below.
       * Moreover, before post-tax earnings, in indivisible currencies are transferred,
       * they are rounded down to a whole unit.
       *
       * ## Arguments
       * - `origin` which must be a holder of the asset and eligible for the distribution.
       * - `ca_id` identifies the CA to start a capital distribution for.
       *
       * # Errors
       * - `HolderAlreadyPaid` if `origin`'s DID has already received its benefit.
       * - `NoSuchDistribution` if there's no capital distribution for `ca_id`.
       * - `CannotClaimBeforeStart` if `now < payment_at`.
       * - `CannotClaimAfterExpiry` if `now > expiry_at.unwrap()`.
       * - `NoSuchCA` if `ca_id` does not identify an existing CA.
       * - `NotTargetedByCA` if the CA does not target `origin`'s DID.
       * - `BalanceAmountProductOverflowed` if `ba = balance * amount` would overflow.
       * - `BalanceAmountProductSupplyDivisionFailed` if `ba * supply` would overflow.
       * - Other errors can occur if the compliance manager rejects the transfer.
       **/
      claim: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId]
      >;
      /**
       * Start and attach a capital distribution, to the CA identified by `ca_id`,
       * with `amount` funds in `currency` withdrawn from `portfolio` belonging to `origin`'s DID.
       *
       * The distribution will commence at `payment_at` and expire at `expires_at`,
       * if provided, or if `None`, then there's no expiry.
       *
       * The funds will be locked in `portfolio` from when `distribute` is called.
       * When there's no expiry, some funds may be locked indefinitely in `portfolio`,
       * due to claimants not withdrawing or no benefits being pushed to them.
       * For indivisible currencies, unlocked amounts, of less than one whole unit,
       * will not be transferable from `portfolio`.
       * However, if we imagine that users `Alice` and `Bob` both are entitled to 1.5 units,
       * and only receive `1` units each, then `0.5 + 0.5 = 1` units are left in `portfolio`,
       * which is now transferrable.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the CA to start a capital distribution for.
       * - `portfolio` specifies the portfolio number of the agent to distribute `amount` from.
       * - `currency` to withdraw and distribute from the `portfolio`.
       * - `per_share` amount of `currency` to withdraw and distribute.
       * Specified as a per-million, i.e. `1 / 10^6`th of one `currency` token.
       * - `amount` of `currency` to withdraw and distribute at most.
       * - `payment_at` specifies when benefits may first be pushed or claimed.
       * - `expires_at` specifies, if provided, when remaining benefits are forfeit
       * and may be reclaimed by `origin`.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `ExpiryBeforePayment` if `expires_at.unwrap() <= payment_at`.
       * - `NoSuchCA` if `ca_id` does not identify an existing CA.
       * - `NoRecordDate` if CA has no record date.
       * - `RecordDateAfterStart` if CA's record date > payment_at.
       * - `UnauthorizedCustodian` if the caller is not the custodian of `portfolio`.
       * - `InsufficientPortfolioBalance` if `portfolio` has less than `amount` of `currency`.
       * - `InsufficientBalance` if the protocol fee couldn't be charged.
       * - `CANotBenefit` if the CA is not of kind PredictableBenefit/UnpredictableBenefit
       * - `DistributionAmountIsZero` if the `amount` is zero.
       * - `DistributionPerShareIsZero` if the `per_share` is zero.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      distribute: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          portfolio: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          currency: PolymeshPrimitivesTicker | string | Uint8Array,
          perShare: u128 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          paymentAt: u64 | AnyNumber | Uint8Array,
          expiresAt: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [
          PalletCorporateActionsCaId,
          Option<u64>,
          PolymeshPrimitivesTicker,
          u128,
          u128,
          u64,
          Option<u64>
        ]
      >;
      /**
       * Push benefit of an ongoing distribution to the given `holder`.
       *
       * Taxes are withheld as specified by the CA.
       * Post-tax earnings are then transferred to the default portfolio of the `origin`'s DID.
       *
       * All benefits are rounded by truncation, down to first integer below.
       * Moreover, before post-tax earnings, in indivisible currencies are transferred,
       * they are rounded down to a whole unit.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the CA with a capital distributions to push benefits for.
       * - `holder` to push benefits to.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchDistribution` if there's no capital distribution for `ca_id`.
       * - `CannotClaimBeforeStart` if `now < payment_at`.
       * - `CannotClaimAfterExpiry` if `now > expiry_at.unwrap()`.
       * - `NoSuchCA` if `ca_id` does not identify an existing CA.
       * - `NotTargetedByCA` if the CA does not target `holder`.
       * - `BalanceAmountProductOverflowed` if `ba = balance * amount` would overflow.
       * - `BalanceAmountProductSupplyDivisionFailed` if `ba * supply` would overflow.
       * - Other errors can occur if the compliance manager rejects the transfer.
       **/
      pushBenefit: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          holder: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, PolymeshPrimitivesIdentityId]
      >;
      /**
       * Assuming a distribution has expired,
       * unlock the remaining amount in the distributor portfolio.
       *
       * ## Arguments
       * - `origin` which must be the creator of the capital distribution tied to `ca_id`.
       * - `ca_id` identifies the CA with a capital distribution to reclaim for.
       *
       * # Errors
       * - `NoSuchDistribution` if there's no capital distribution for `ca_id`.
       * - `AlreadyReclaimed` if this function has already been called successfully.
       * - `NotExpired` if `now < expiry`.
       **/
      reclaim: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId]
      >;
      /**
       * Removes a distribution that hasn't started yet,
       * unlocking the full amount in the distributor portfolio.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the CA with a not-yet-started capital distribution to remove.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchDistribution` if there's no capital distribution for `ca_id`.
       * - `DistributionStarted` if `payment_at <= now`.
       **/
      removeDistribution: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId]
      >;
    };
    cddServiceProviders: {
      /**
       * Allows the calling member to *unilaterally quit* without this being subject to a GC
       * vote.
       *
       * # Arguments
       * * `origin` - Member of committee who wants to quit.
       *
       * # Error
       *
       * * Only primary key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Disables a member at specific moment.
       *
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       *
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       *
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       *
       * # Arguments
       * * `at` - Revocation time-stamp.
       * * `who` - Target member of the group.
       * * `expiry` - Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: PolymeshPrimitivesIdentityId | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          at: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, Option<u64>, Option<u64>]
      >;
      /**
       * Removes a member `who` from the set. May only be called from `RemoveOrigin` or root.
       *
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.  In case you want to keep the validity of generated
       * claims, you have to use `Self::disable_member` function
       *
       * # Arguments
       * * `origin` - Origin representing `RemoveOrigin` or root
       * * `who` - IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Changes the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `ResetOrigin` or root
       * * `members` - New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members:
            | Vec<PolymeshPrimitivesIdentityId>
            | (PolymeshPrimitivesIdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Change this group's limit for how many concurrent active members they may be.
       *
       * # Arguments
       * * `limit` - the number of active members there may be concurrently.
       **/
      setActiveMembersLimit: AugmentedSubmittable<
        (limit: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Swaps out one member `remove` for another member `add`.
       *
       * May only be called from `SwapOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `SwapOrigin` or root
       * * `remove` - IdentityId to be removed from the group.
       * * `add` - IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: PolymeshPrimitivesIdentityId | string | Uint8Array,
          add: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityId]
      >;
    };
    checkpoint: {
      /**
       * Creates a single checkpoint at the current time.
       *
       * # Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ticker`.
       * - `ticker` to create the checkpoint for.
       *
       * # Errors
       * - `UnauthorizedAgent` if the DID of `origin` isn't a permissioned agent for `ticker`.
       * - `CounterOverflow` if the total checkpoint counter would overflow.
       **/
      createCheckpoint: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Creates a schedule generating checkpoints
       * in the future at either a fixed time or at intervals.
       *
       * The schedule starts out with `strong_ref_count(schedule_id) <- 0`.
       *
       * # Arguments
       * - `origin` is a signer that has permissions to act as owner of `ticker`.
       * - `ticker` to create the schedule for.
       * - `schedule` that will generate checkpoints.
       *
       * # Errors
       * - `UnauthorizedAgent` if the DID of `origin` isn't a permissioned agent for `ticker`.
       * - `InsufficientAccountBalance` if the protocol fee could not be charged.
       * - `CounterOverflow` if the schedule ID or total checkpoint counters would overflow.
       *
       * # Permissions
       * * Asset
       **/
      createSchedule: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          schedule:
            | PolymeshCommonUtilitiesCheckpointScheduleCheckpoints
            | { pending?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshCommonUtilitiesCheckpointScheduleCheckpoints]
      >;
      /**
       * Removes the checkpoint schedule of an asset identified by `id`.
       *
       * # Arguments
       * - `origin` is a signer that has permissions to act as owner of `ticker`.
       * - `ticker` to remove the schedule from.
       * - `id` of the schedule, when it was created by `created_schedule`.
       *
       * # Errors
       * - `UnauthorizedAgent` if the DID of `origin` isn't a permissioned agent for `ticker`.
       * - `NoCheckpointSchedule` if `id` does not identify a schedule for this `ticker`.
       * - `ScheduleNotRemovable` if `id` exists but is not removable.
       *
       * # Permissions
       * * Asset
       **/
      removeSchedule: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64]
      >;
      /**
       * Sets the max complexity of a schedule set for an arbitrary ticker to `max_complexity`.
       * The new maximum is not enforced retroactively,
       * and only applies once new schedules are made.
       *
       * Must be called as a PIP (requires "root").
       *
       * # Arguments
       * - `origin` is the root origin.
       * - `max_complexity` allowed for an arbitrary ticker's schedule set.
       **/
      setSchedulesMaxComplexity: AugmentedSubmittable<
        (maxComplexity: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
    };
    committeeMembership: {
      /**
       * Allows the calling member to *unilaterally quit* without this being subject to a GC
       * vote.
       *
       * # Arguments
       * * `origin` - Member of committee who wants to quit.
       *
       * # Error
       *
       * * Only primary key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Disables a member at specific moment.
       *
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       *
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       *
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       *
       * # Arguments
       * * `at` - Revocation time-stamp.
       * * `who` - Target member of the group.
       * * `expiry` - Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: PolymeshPrimitivesIdentityId | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          at: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, Option<u64>, Option<u64>]
      >;
      /**
       * Removes a member `who` from the set. May only be called from `RemoveOrigin` or root.
       *
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.  In case you want to keep the validity of generated
       * claims, you have to use `Self::disable_member` function
       *
       * # Arguments
       * * `origin` - Origin representing `RemoveOrigin` or root
       * * `who` - IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Changes the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `ResetOrigin` or root
       * * `members` - New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members:
            | Vec<PolymeshPrimitivesIdentityId>
            | (PolymeshPrimitivesIdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Change this group's limit for how many concurrent active members they may be.
       *
       * # Arguments
       * * `limit` - the number of active members there may be concurrently.
       **/
      setActiveMembersLimit: AugmentedSubmittable<
        (limit: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Swaps out one member `remove` for another member `add`.
       *
       * May only be called from `SwapOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `SwapOrigin` or root
       * * `remove` - IdentityId to be removed from the group.
       * * `add` - IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: PolymeshPrimitivesIdentityId | string | Uint8Array,
          add: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityId]
      >;
    };
    complianceManager: {
      /**
       * Adds a compliance requirement to an asset's compliance by ticker.
       * If there are duplicate ClaimTypes for a particular trusted issuer, duplicates are removed.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * sender_conditions - Sender transfer conditions.
       * * receiver_conditions - Receiver transfer conditions.
       *
       * # Permissions
       * * Asset
       **/
      addComplianceRequirement: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          senderConditions:
            | Vec<PolymeshPrimitivesCondition>
            | (
                | PolymeshPrimitivesCondition
                | { conditionType?: any; issuers?: any }
                | string
                | Uint8Array
              )[],
          receiverConditions:
            | Vec<PolymeshPrimitivesCondition>
            | (
                | PolymeshPrimitivesCondition
                | { conditionType?: any; issuers?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          Vec<PolymeshPrimitivesCondition>,
          Vec<PolymeshPrimitivesCondition>
        ]
      >;
      /**
       * Adds another default trusted claim issuer at the ticker level.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * issuer - IdentityId of the trusted claim issuer.
       *
       * # Permissions
       * * Asset
       **/
      addDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          issuer:
            | PolymeshPrimitivesConditionTrustedIssuer
            | { issuer?: any; trustedFor?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesConditionTrustedIssuer]
      >;
      /**
       * Modify an existing compliance requirement of a given ticker.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * new_req - Compliance requirement.
       *
       * # Permissions
       * * Asset
       **/
      changeComplianceRequirement: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          newReq:
            | PolymeshPrimitivesComplianceManagerComplianceRequirement
            | { senderConditions?: any; receiverConditions?: any; id?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesComplianceManagerComplianceRequirement]
      >;
      /**
       * Pauses the verification of conditions for `ticker` during transfers.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       *
       * # Permissions
       * * Asset
       **/
      pauseAssetCompliance: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Removes a compliance requirement from an asset's compliance.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * id - Compliance requirement id which is need to be removed
       *
       * # Permissions
       * * Asset
       **/
      removeComplianceRequirement: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u32]
      >;
      /**
       * Removes the given `issuer` from the set of default trusted claim issuers at the ticker level.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * issuer - IdentityId of the trusted claim issuer.
       *
       * # Permissions
       * * Asset
       **/
      removeDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          issuer: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]
      >;
      /**
       * Replaces an asset's compliance by ticker with a new compliance.
       *
       * Compliance requirements will be sorted (ascending by id) before
       * replacing the current requirements.
       *
       * # Arguments
       * * `ticker` - the asset ticker,
       * * `asset_compliance - the new asset compliance.
       *
       * # Errors
       * * `Unauthorized` if `origin` is not the owner of the ticker.
       * * `DuplicateAssetCompliance` if `asset_compliance` contains multiple entries with the same `requirement_id`.
       *
       * # Permissions
       * * Asset
       **/
      replaceAssetCompliance: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          assetCompliance:
            | Vec<PolymeshPrimitivesComplianceManagerComplianceRequirement>
            | (
                | PolymeshPrimitivesComplianceManagerComplianceRequirement
                | { senderConditions?: any; receiverConditions?: any; id?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Vec<PolymeshPrimitivesComplianceManagerComplianceRequirement>]
      >;
      /**
       * Removes an asset's compliance
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       *
       * # Permissions
       * * Asset
       **/
      resetAssetCompliance: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Resumes the verification of conditions for `ticker` during transfers.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       *
       * # Permissions
       * * Asset
       **/
      resumeAssetCompliance: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
    };
    confidentialAsset: {
      /**
       * Adds a new transaction.
       **/
      addTransaction: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          legs:
            | Vec<PalletConfidentialAssetTransactionLeg>
            | (
                | PalletConfidentialAssetTransactionLeg
                | { assets?: any; sender?: any; receiver?: any; auditors?: any; mediators?: any }
                | string
                | Uint8Array
              )[],
          memo: Option<PolymeshPrimitivesMemo> | null | Uint8Array | PolymeshPrimitivesMemo | string
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Vec<PalletConfidentialAssetTransactionLeg>, Option<PolymeshPrimitivesMemo>]
      >;
      /**
       * Affirm transactions.
       **/
      affirmTransactions: AugmentedSubmittable<
        (transactions: PalletConfidentialAssetAffirmTransactions) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetAffirmTransactions]
      >;
      /**
       * Allows additional venues to create instructions involving an asset.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `asset_id` - AssetId of the token in question.
       * * `venues` - Array of venues that are allowed to create instructions for the token in question.
       **/
      allowVenues: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, Vec<u64>]
      >;
      /**
       * Applies any incoming balance to the confidential account balance.
       *
       * # Arguments
       * * `account` - the confidential account (Elgamal public key) of the `origin`.
       * * `asset_id` - AssetId of confidential account.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       **/
      applyIncomingBalance: AugmentedSubmittable<
        (
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array,
          assetId: U8aFixed | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetConfidentialAccount, U8aFixed]
      >;
      /**
       * Applies any incoming balance to the confidential account balance.
       *
       * # Arguments
       * * `origin` - contains the secondary key of the caller (i.e who signed the transaction to execute this function).
       * * `account` - the confidential account (Elgamal public key) of the `origin`.
       * * `max_updates` - The maximum number of incoming balances to apply.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       **/
      applyIncomingBalances: AugmentedSubmittable<
        (
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array,
          maxUpdates: u16 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetConfidentialAccount, u16]
      >;
      /**
       * Burn assets from the issuer's `account`.
       *
       * # Arguments
       * * `origin` - contains the secondary key of the caller (i.e who signed the transaction to execute this function).
       * * `asset_id` - the asset_id symbol of the token.
       * * `amount` - amount of tokens to mint.
       * * `account` - the asset isser's confidential account to receive the minted assets.
       * * `burn_proof` - The burn proof.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       * - `NotAccountOwner` if origin is not the owner of the `account`.
       * - `NotAssetOwner` if origin is not the owner of the asset.
       * - `AmountMustBeNonZero` if `amount` is zero.
       * - `UnknownConfidentialAsset` The asset_id is not a confidential asset.
       **/
      burn: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array,
          proof:
            | ConfidentialAssetsBurnConfidentialBurnProof
            | { encodedInnerProof?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          U8aFixed,
          u128,
          PalletConfidentialAssetConfidentialAccount,
          ConfidentialAssetsBurnConfidentialBurnProof
        ]
      >;
      /**
       * Register a confidential account.
       *
       * # Arguments
       * * `account` the confidential account to register.
       *
       * # Errors
       * * `BadOrigin` if `origin` isn't signed.
       **/
      createAccount: AugmentedSubmittable<
        (
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetConfidentialAccount]
      >;
      /**
       * Creates a new confidential asset.
       * The caller's identity is the issuer of the new confidential asset.
       *
       * It is recommended to set at least one asset auditor.
       *
       * # Arguments
       * * `origin` - The asset issuer.
       * * `data` - On-chain definition of the asset.
       * * `auditors` - The asset auditors that will have access to transfer amounts of this asset.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       **/
      createAsset: AugmentedSubmittable<
        (
          data: Bytes | string | Uint8Array,
          auditors:
            | PalletConfidentialAssetConfidentialAuditors
            | { auditors?: any; mediators?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, PalletConfidentialAssetConfidentialAuditors]
      >;
      /**
       * Registers a new venue.
       *
       **/
      createVenue: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Revokes permission given to venues for creating instructions involving a particular asset.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `asset_id` - AssetId of the token in question.
       * * `venues` - Array of venues that are no longer allowed to create instructions for the token in question.
       **/
      disallowVenues: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, Vec<u64>]
      >;
      /**
       * Execute transaction.
       **/
      executeTransaction: AugmentedSubmittable<
        (
          transactionId: PalletConfidentialAssetTransactionId | AnyNumber | Uint8Array,
          legCount: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetTransactionId, u32]
      >;
      /**
       * Mint more assets into the asset issuer's `account`.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `asset_id` - the asset_id symbol of the token.
       * * `amount` - amount of tokens to mint.
       * * `account` - the asset isser's confidential account to receive the minted assets.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       * - `NotAccountOwner` if origin is not the owner of the `account`.
       * - `NotAssetOwner` if origin is not the owner of the asset.
       * - `AmountMustBeNonZero` if `amount` is zero.
       * - `TotalSupplyAboveConfidentialBalanceLimit` if `total_supply` exceeds the confidential balance limit.
       * - `UnknownConfidentialAsset` The asset_id is not a confidential asset.
       **/
      mint: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, u128, PalletConfidentialAssetConfidentialAccount]
      >;
      /**
       * Move assets between confidential accounts of the same identity.
       *
       **/
      moveAssets: AugmentedSubmittable<
        (
          moves:
            | Vec<PalletConfidentialAssetConfidentialMoveFunds>
            | (
                | PalletConfidentialAssetConfidentialMoveFunds
                | { from?: any; to?: any; proofs?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PalletConfidentialAssetConfidentialMoveFunds>]
      >;
      /**
       * Reject pending transaction.
       **/
      rejectTransaction: AugmentedSubmittable<
        (
          transactionId: PalletConfidentialAssetTransactionId | AnyNumber | Uint8Array,
          legCount: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetTransactionId, u32]
      >;
      /**
       * The confidential asset issuer can freeze/unfreeze accounts.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `account` - the confidential account to lock/unlock.
       * * `asset_id` - AssetId of confidential account.
       * * `freeze` - freeze/unfreeze.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       **/
      setAccountAssetFrozen: AugmentedSubmittable<
        (
          account: PalletConfidentialAssetConfidentialAccount | string | Uint8Array,
          assetId: U8aFixed | string | Uint8Array,
          freeze: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletConfidentialAssetConfidentialAccount, U8aFixed, bool]
      >;
      /**
       * Freeze/unfreeze a confidential asset.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `asset_id` - confidential asset to freeze/unfreeze.
       * * `freeze` - freeze/unfreeze.
       *
       * # Errors
       * - `BadOrigin` if not signed.
       **/
      setAssetFrozen: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          freeze: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, bool]
      >;
      /**
       * Enables or disabled venue filtering for a token.
       *
       * # Arguments
       * * `origin` - Must be the asset issuer.
       * * `asset_id` - AssetId of the token in question.
       * * `enabled` - Boolean that decides if the filtering should be enabled.
       **/
      setVenueFiltering: AugmentedSubmittable<
        (
          assetId: U8aFixed | string | Uint8Array,
          enabled: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, bool]
      >;
    };
    contracts: {
      /**
       * Makes a call to an account, optionally transferring some balance.
       *
       * # Parameters
       *
       * * `dest`: Address of the contract to call.
       * * `value`: The balance to transfer from the `origin` to `dest`.
       * * `gas_limit`: The gas limit enforced when executing the constructor.
       * * `storage_deposit_limit`: The maximum amount of balance that can be charged from the
       * caller to pay for the storage consumed.
       * * `data`: The input data to pass to the contract.
       *
       * * If the account is a smart-contract account, the associated code will be
       * executed and any value will be transferred.
       * * If the account is a regular account, any value will be transferred.
       * * If no account exists and the call value is not less than `existential_deposit`,
       * a regular account will be created and any value will be transferred.
       **/
      call: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>, SpWeightsWeightV2Weight, Option<Compact<u128>>, Bytes]
      >;
      /**
       * Deprecated version if [`Self::call`] for use in an in-storage `Call`.
       **/
      callOldWeight: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit: Compact<u64> | AnyNumber | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Compact<u128>, Compact<u64>, Option<Compact<u128>>, Bytes]
      >;
      /**
       * Instantiates a contract from a previously deployed wasm binary.
       *
       * This function is identical to [`Self::instantiate_with_code`] but without the
       * code deployment step. Instead, the `code_hash` of an on-chain deployed wasm binary
       * must be supplied.
       **/
      instantiate: AugmentedSubmittable<
        (
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          codeHash: H256 | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, SpWeightsWeightV2Weight, Option<Compact<u128>>, H256, Bytes, Bytes]
      >;
      /**
       * Deprecated version if [`Self::instantiate`] for use in an in-storage `Call`.
       **/
      instantiateOldWeight: AugmentedSubmittable<
        (
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit: Compact<u64> | AnyNumber | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          codeHash: H256 | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u64>, Option<Compact<u128>>, H256, Bytes, Bytes]
      >;
      /**
       * Instantiates a new contract from the supplied `code` optionally transferring
       * some balance.
       *
       * This dispatchable has the same effect as calling [`Self::upload_code`] +
       * [`Self::instantiate`]. Bundling them together provides efficiency gains. Please
       * also check the documentation of [`Self::upload_code`].
       *
       * # Parameters
       *
       * * `value`: The balance to transfer from the `origin` to the newly created contract.
       * * `gas_limit`: The gas limit enforced when executing the constructor.
       * * `storage_deposit_limit`: The maximum amount of balance that can be charged/reserved
       * from the caller to pay for the storage consumed.
       * * `code`: The contract code to deploy in raw bytes.
       * * `data`: The input data to pass to the contract constructor.
       * * `salt`: Used for the address derivation. See [`Pallet::contract_address`].
       *
       * Instantiation is executed as follows:
       *
       * - The supplied `code` is instrumented, deployed, and a `code_hash` is created for that
       * code.
       * - If the `code_hash` already exists on the chain the underlying `code` will be shared.
       * - The destination address is computed based on the sender, code_hash and the salt.
       * - The smart-contract account is created at the computed address.
       * - The `value` is transferred to the new account.
       * - The `deploy` function is executed in the context of the newly-created account.
       **/
      instantiateWithCode: AugmentedSubmittable<
        (
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          code: Bytes | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, SpWeightsWeightV2Weight, Option<Compact<u128>>, Bytes, Bytes, Bytes]
      >;
      /**
       * Deprecated version if [`Self::instantiate_with_code`] for use in an in-storage `Call`.
       **/
      instantiateWithCodeOldWeight: AugmentedSubmittable<
        (
          value: Compact<u128> | AnyNumber | Uint8Array,
          gasLimit: Compact<u64> | AnyNumber | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          code: Bytes | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Compact<u128>, Compact<u64>, Option<Compact<u128>>, Bytes, Bytes, Bytes]
      >;
      /**
       * Remove the code stored under `code_hash` and refund the deposit to its owner.
       *
       * A code can only be removed by its original uploader (its owner) and only if it is
       * not used by any contract.
       **/
      removeCode: AugmentedSubmittable<
        (codeHash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
      /**
       * Privileged function that changes the code of an existing contract.
       *
       * This takes care of updating refcounts and all other necessary operations. Returns
       * an error if either the `code_hash` or `dest` do not exist.
       *
       * # Note
       *
       * This does **not** change the address of the contract in question. This means
       * that the contract address is no longer derived from its code hash after calling
       * this dispatchable.
       **/
      setCode: AugmentedSubmittable<
        (
          dest:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          codeHash: H256 | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, H256]
      >;
      /**
       * Upload new `code` without instantiating a contract from it.
       *
       * If the code does not already exist a deposit is reserved from the caller
       * and unreserved only when [`Self::remove_code`] is called. The size of the reserve
       * depends on the instrumented size of the the supplied `code`.
       *
       * If the code already exists in storage it will still return `Ok` and upgrades
       * the in storage version to the current
       * [`InstructionWeights::version`](InstructionWeights).
       *
       * - `determinism`: If this is set to any other value but [`Determinism::Deterministic`]
       * then the only way to use this code is to delegate call into it from an offchain
       * execution. Set to [`Determinism::Deterministic`] if in doubt.
       *
       * # Note
       *
       * Anyone can instantiate a contract from any uploaded code and thus prevent its removal.
       * To avoid this situation a constructor could employ access control so that it can
       * only be instantiated by permissioned entities. The same is true when uploading
       * through [`Self::instantiate_with_code`].
       **/
      uploadCode: AugmentedSubmittable<
        (
          code: Bytes | string | Uint8Array,
          storageDepositLimit:
            | Option<Compact<u128>>
            | null
            | Uint8Array
            | Compact<u128>
            | AnyNumber,
          determinism:
            | PalletContractsWasmDeterminism
            | 'Deterministic'
            | 'AllowIndeterminism'
            | number
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Option<Compact<u128>>, PalletContractsWasmDeterminism]
      >;
    };
    corporateAction: {
      /**
       * Changes the record date of the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ca_id.ticker` with relevant permissions.
       * - `ca_id` of the CA to alter.
       * - `record_date`, if any, to calculate the impact of the CA.
       * If provided, this results in a scheduled balance snapshot ("checkpoint") at the date.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchCA` if `id` does not identify an existing CA.
       * - When `record_date.is_some()`, other errors due to checkpoint scheduling may occur.
       *
       * # Permissions
       * * Asset
       **/
      changeRecordDate: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          recordDate:
            | Option<PalletCorporateActionsRecordDateSpec>
            | null
            | Uint8Array
            | PalletCorporateActionsRecordDateSpec
            | { Scheduled: any }
            | { ExistingSchedule: any }
            | { Existing: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, Option<PalletCorporateActionsRecordDateSpec>]
      >;
      /**
       * Initiates a CA for `ticker` of `kind` with `details` and other provided arguments.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ticker` with relevant permissions.
       * - `ticker` that the CA is made for.
       * - `kind` of CA being initiated.
       * - `decl_date` of CA bring initialized.
       * - `record_date`, if any, to calculate the impact of this CA.
       * If provided, this results in a scheduled balance snapshot ("checkpoint") at the date.
       * - `details` of the CA in free-text form, up to a certain number of bytes in length.
       * - `targets`, if any, which this CA is relevant/irrelevant to.
       * Overrides, if provided, the default at the asset level (`set_default_targets`).
       * - `default_withholding_tax`, if any, is the default withholding tax to use for this CA.
       * Overrides, if provided, the default at the asset level (`set_default_withholding_tax`).
       * - `withholding_tax`, if any, provides per-DID withholding tax overrides.
       * Overrides, if provided, the default at the asset level (`set_did_withholding_tax`).
       *
       * # Errors
       * - `DetailsTooLong` if `details.len()` goes beyond `max_details_length`.
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `CounterOverflow` in the unlikely event that so many CAs were created for this `ticker`,
       * that integer overflow would have occured if instead allowed.
       * - `TooManyDidTaxes` if `withholding_tax.unwrap().len()` would go over the limit `MaxDidWhts`.
       * - `DuplicateDidTax` if a DID is included more than once in `wt`.
       * - `TooManyTargetIds` if `targets.unwrap().identities.len() > T::MaxTargetIds::get()`.
       * - `DeclDateInFuture` if the declaration date is not in the past.
       * - When `record_date.is_some()`, other errors due to checkpoint scheduling may occur.
       *
       * # Permissions
       * * Asset
       **/
      initiateCorporateAction: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          kind:
            | PalletCorporateActionsCaKind
            | 'PredictableBenefit'
            | 'UnpredictableBenefit'
            | 'IssuerNotice'
            | 'Reorganization'
            | 'Other'
            | number
            | Uint8Array,
          declDate: u64 | AnyNumber | Uint8Array,
          recordDate:
            | Option<PalletCorporateActionsRecordDateSpec>
            | null
            | Uint8Array
            | PalletCorporateActionsRecordDateSpec
            | { Scheduled: any }
            | { ExistingSchedule: any }
            | { Existing: any }
            | string,
          details: Bytes | string | Uint8Array,
          targets:
            | Option<PalletCorporateActionsTargetIdentities>
            | null
            | Uint8Array
            | PalletCorporateActionsTargetIdentities
            | { identities?: any; treatment?: any }
            | string,
          defaultWithholdingTax: Option<Permill> | null | Uint8Array | Permill | AnyNumber,
          withholdingTax:
            | Option<Vec<ITuple<[PolymeshPrimitivesIdentityId, Permill]>>>
            | null
            | Uint8Array
            | Vec<ITuple<[PolymeshPrimitivesIdentityId, Permill]>>
            | [
                PolymeshPrimitivesIdentityId | string | Uint8Array,
                Permill | AnyNumber | Uint8Array
              ][]
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PalletCorporateActionsCaKind,
          u64,
          Option<PalletCorporateActionsRecordDateSpec>,
          Bytes,
          Option<PalletCorporateActionsTargetIdentities>,
          Option<Permill>,
          Option<Vec<ITuple<[PolymeshPrimitivesIdentityId, Permill]>>>
        ]
      >;
      /**
       * Utility extrinsic to batch `initiate_corporate_action` and `distribute`
       **/
      initiateCorporateActionAndDistribute: AugmentedSubmittable<
        (
          caArgs:
            | PalletCorporateActionsInitiateCorporateActionArgs
            | {
                ticker?: any;
                kind?: any;
                declDate?: any;
                recordDate?: any;
                details?: any;
                targets?: any;
                defaultWithholdingTax?: any;
                withholdingTax?: any;
              }
            | string
            | Uint8Array,
          portfolio: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          currency: PolymeshPrimitivesTicker | string | Uint8Array,
          perShare: u128 | AnyNumber | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array,
          paymentAt: u64 | AnyNumber | Uint8Array,
          expiresAt: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [
          PalletCorporateActionsInitiateCorporateActionArgs,
          Option<u64>,
          PolymeshPrimitivesTicker,
          u128,
          u128,
          u64,
          Option<u64>
        ]
      >;
      /**
       * Link the given CA `id` to the given `docs`.
       * Any previous links for the CA are removed in favor of `docs`.
       *
       * The workflow here is to add the documents and initiating the CA in any order desired.
       * Once both exist, they can now be linked together.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `id.ticker` with relevant permissions.
       * - `id` of the CA to associate with `docs`.
       * - `docs` to associate with the CA with `id`.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchCA` if `id` does not identify an existing CA.
       * - `NoSuchDoc` if any of `docs` does not identify an existing document.
       *
       * # Permissions
       * * Asset
       **/
      linkCaDoc: AugmentedSubmittable<
        (
          id: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          docs: Vec<u32> | (u32 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, Vec<u32>]
      >;
      /**
       * Removes the CA identified by `ca_id`.
       *
       * Associated data, such as document links, ballots,
       * and capital distributions are also removed.
       *
       * Any schedule associated with the record date will see
       * `strong_ref_count(schedule_id)` decremented.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ca_id.ticker` with relevant permissions.
       * - `ca_id` of the CA to remove.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchCA` if `id` does not identify an existing CA.
       *
       * # Permissions
       * * Asset
       **/
      removeCa: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId]
      >;
      /**
       * Set the default CA `TargetIdentities` to `targets`.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ticker` with relevant permissions.
       * - `ticker` for which the default identities are changing.
       * - `targets` the default target identities for a CA.
       *
       * ## Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `TooManyTargetIds` if `targets.identities.len() > T::MaxTargetIds::get()`.
       *
       * # Permissions
       * * Asset
       **/
      setDefaultTargets: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          targets:
            | PalletCorporateActionsTargetIdentities
            | { identities?: any; treatment?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PalletCorporateActionsTargetIdentities]
      >;
      /**
       * Set the default withholding tax for all DIDs and CAs relevant to this `ticker`.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ticker` with relevant permissions.
       * - `ticker` that the withholding tax will apply to.
       * - `tax` that should be withheld when distributing dividends, etc.
       *
       * ## Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       *
       * # Permissions
       * * Asset
       **/
      setDefaultWithholdingTax: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          tax: Permill | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Permill]
      >;
      /**
       * Set the withholding tax of `ticker` for `taxed_did` to `tax`.
       * If `Some(tax)`, this overrides the default withholding tax of `ticker` to `tax` for `taxed_did`.
       * Otherwise, if `None`, the default withholding tax will be used.
       *
       * ## Arguments
       * - `origin` which must be an external agent of `ticker` with relevant permissions.
       * - `ticker` that the withholding tax will apply to.
       * - `taxed_did` that will have its withholding tax updated.
       * - `tax` that should be withheld when distributing dividends, etc.
       *
       * ## Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `TooManyDidTaxes` if `Some(tax)` and adding the override would go over the limit `MaxDidWhts`.
       *
       * # Permissions
       * * Asset
       **/
      setDidWithholdingTax: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          taxedDid: PolymeshPrimitivesIdentityId | string | Uint8Array,
          tax: Option<Permill> | null | Uint8Array | Permill | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId, Option<Permill>]
      >;
      /**
       * Set the max `length` of `details` in terms of bytes.
       * May only be called via a PIP.
       **/
      setMaxDetailsLength: AugmentedSubmittable<
        (length: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
    };
    corporateBallot: {
      /**
       * Attach a corporate ballot to the CA identified by `ca_id`.
       *
       * The ballot will admit votes within `range`.
       * The ballot's metadata is provided by `meta`,
       * which includes the ballot title, the motions, their choices, etc.
       * See the `BallotMeta` for more.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the CA to attach the ballot to.
       * - `range` specifies when voting starts and ends.
       * - `meta` specifies the ballot's metadata as aforementioned.
       * - `rcv` specifies whether RCV is enabled for this ballot.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchCA` if `ca_id` does not identify an existing CA.
       * - `CANotNotice` if the CA is not of the `IssuerNotice` kind.
       * - `StartAfterEnd` if `range.start > range.end`.
       * - `NowAfterEnd` if `now > range.end` where `now` is the current timestamp.
       * - `NoRecordDate` if CA has no record date.
       * - `RecordDateAfterStart` if `date > range.start` where `date` is the CA's record date.
       * - `AlreadyExists` if there's a ballot already.
       * - `NumberOfChoicesOverflow` if the total choice in `meta` overflows `usize`.
       * - `TooLong` if any of the embedded strings in `meta` are too long.
       * - `InsufficientBalance` if the protocol fee couldn't be charged.
       **/
      attachBallot: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          range:
            | PalletCorporateActionsBallotBallotTimeRange
            | { start?: any; end?: any }
            | string
            | Uint8Array,
          meta:
            | PalletCorporateActionsBallotBallotMeta
            | { title?: any; motions?: any }
            | string
            | Uint8Array,
          rcv: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PalletCorporateActionsCaId,
          PalletCorporateActionsBallotBallotTimeRange,
          PalletCorporateActionsBallotBallotMeta,
          bool
        ]
      >;
      /**
       * Amend the end date of the ballot of the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the attached ballot's CA.
       * - `end` specifies the new end date of the ballot.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchBallot` if `ca_id` does not identify a ballot.
       * - `VotingAlreadyStarted` if `start >= now`, where `now` is the current time.
       * - `StartAfterEnd` if `start > end`.
       **/
      changeEnd: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          end: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, u64]
      >;
      /**
       * Amend the metadata (title, motions, etc.) of the ballot of the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the attached ballot's CA.
       * - `meta` specifies the new metadata.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchBallot` if `ca_id` does not identify a ballot.
       * - `VotingAlreadyStarted` if `start >= now`, where `now` is the current time.
       * - `NumberOfChoicesOverflow` if the total choice in `meta` overflows `usize`.
       * - `TooLong` if any of the embedded strings in `meta` are too long.
       **/
      changeMeta: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          meta:
            | PalletCorporateActionsBallotBallotMeta
            | { title?: any; motions?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, PalletCorporateActionsBallotBallotMeta]
      >;
      /**
       * Amend RCV support for the ballot of the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the attached ballot's CA.
       * - `rcv` specifies if RCV is to be supported or not.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchBallot` if `ca_id` does not identify a ballot.
       * - `VotingAlreadyStarted` if `start >= now`, where `now` is the current time.
       **/
      changeRcv: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          rcv: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, bool]
      >;
      /**
       * Remove the ballot of the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` is a signer that has permissions to act as an agent of `ca_id.ticker`.
       * - `ca_id` identifies the attached ballot's CA.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `ticker`.
       * - `NoSuchBallot` if `ca_id` does not identify a ballot.
       * - `VotingAlreadyStarted` if `start >= now`, where `now` is the current time.
       **/
      removeBallot: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId]
      >;
      /**
       * Cast `votes` in the ballot attached to the CA identified by `ca_id`.
       *
       * ## Arguments
       * - `origin` which must be a permissioned signer targeted by the CA.
       * - `ca_id` identifies the attached ballot's CA.
       * - `votes` specifies the balances to assign to each choice in the ballot.
       * The full voting power of `origin`'s DID may be used for each motion in the ballot.
       *
       * # Errors
       * - `NoSuchBallot` if `ca_id` does not identify a ballot.
       * - `VotingNotStarted` if the voting period hasn't commenced yet.
       * - `VotingAlreadyEnded` if the voting period has ended.
       * - `WrongVoteCount` if the number of choices in the ballot does not match `votes.len()`.
       * - `NoSuchCA` if `ca_id` does not identify an existing CA.
       * - `NotTargetedByCA` if the CA does not target `origin`'s DID.
       * - `InsufficientVotes` if the voting power used for any motion in `votes`
       * exceeds `origin`'s DID's voting power.
       **/
      vote: AugmentedSubmittable<
        (
          caId: PalletCorporateActionsCaId | { ticker?: any; localId?: any } | string | Uint8Array,
          votes:
            | Vec<PalletCorporateActionsBallotBallotVote>
            | (
                | PalletCorporateActionsBallotBallotVote
                | { power?: any; fallback?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [PalletCorporateActionsCaId, Vec<PalletCorporateActionsBallotBallotVote>]
      >;
    };
    externalAgents: {
      /**
       * Abdicate agentship for `ticker`.
       *
       * # Arguments
       * - `ticker` of which the caller is an agent.
       *
       * # Errors
       * - `NotAnAgent` if the caller is not an agent of `ticker`.
       * - `RemovingLastFullAgent` if the caller is the last full agent.
       *
       * # Permissions
       * * Asset
       **/
      abdicate: AugmentedSubmittable<
        (ticker: PolymeshPrimitivesTicker | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker]
      >;
      /**
       * Accept an authorization by an agent "Alice" who issued `auth_id`
       * to also become an agent of the ticker Alice specified.
       *
       * # Arguments
       * - `auth_id` identifying the authorization to accept.
       *
       * # Errors
       * - `AuthorizationError::Invalid` if `auth_id` does not exist for the given caller.
       * - `AuthorizationError::Expired` if `auth_id` is for an auth that has expired.
       * - `AuthorizationError::BadType` if `auth_id` was not for a `BecomeAgent` auth type.
       * - `UnauthorizedAgent` if "Alice" is not permissioned to provide the auth.
       * - `NoSuchAG` if the group referred to a custom that does not exist.
       * - `AlreadyAnAgent` if the caller is already an agent of the ticker.
       *
       * # Permissions
       * * Agent
       **/
      acceptBecomeAgent: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Change the agent group that `agent` belongs to in `ticker`.
       *
       * # Arguments
       * - `ticker` that has the `agent`.
       * - `agent` of `ticker` to change the group for.
       * - `group` that `agent` will belong to in `ticker`.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` was not authorized as an agent to call this.
       * - `NoSuchAG` if `id` does not identify a custom AG.
       * - `NotAnAgent` if `agent` is not an agent of `ticker`.
       * - `RemovingLastFullAgent` if `agent` was a `Full` one and is being demoted.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      changeGroup: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          agent: PolymeshPrimitivesIdentityId | string | Uint8Array,
          group:
            | PolymeshPrimitivesAgentAgentGroup
            | { Full: any }
            | { Custom: any }
            | { ExceptMeta: any }
            | { PolymeshV1CAA: any }
            | { PolymeshV1PIA: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId, PolymeshPrimitivesAgentAgentGroup]
      >;
      /**
       * Utility extrinsic to batch `create_group` and  `change_group` for custom groups only.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      createAndChangeCustomGroup: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
            | { Whole: any }
            | { These: any }
            | { Except: any }
            | string
            | Uint8Array,
          agent: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
          PolymeshPrimitivesIdentityId
        ]
      >;
      /**
       * Creates a custom agent group (AG) for the given `ticker`.
       *
       * The AG will have the permissions as given by `perms`.
       * This new AG is then assigned `id = AGIdSequence::get() + 1` as its `AGId`,
       * which you can use as `AgentGroup::Custom(id)` when adding agents for `ticker`.
       *
       * # Arguments
       * - `ticker` to add the custom group for.
       * - `perms` that the new AG will have.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` was not authorized as an agent to call this.
       * - `TooLong` if `perms` had some string or list length that was too long.
       * - `CounterOverflow` if `AGIdSequence::get() + 1` would exceed `u32::MAX`.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      createGroup: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
            | { Whole: any }
            | { These: any }
            | { Except: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions]
      >;
      /**
       * Utility extrinsic to batch `create_group` and  `add_auth`.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      createGroupAndAddAuth: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
            | { Whole: any }
            | { These: any }
            | { Except: any }
            | string
            | Uint8Array,
          target: PolymeshPrimitivesIdentityId | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions,
          PolymeshPrimitivesIdentityId,
          Option<u64>
        ]
      >;
      /**
       * Remove the given `agent` from `ticker`.
       *
       * # Arguments
       * - `ticker` that has the `agent` to remove.
       * - `agent` of `ticker` to remove.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` was not authorized as an agent to call this.
       * - `NotAnAgent` if `agent` is not an agent of `ticker`.
       * - `RemovingLastFullAgent` if `agent` is the last full one.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      removeAgent: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          agent: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityId]
      >;
      /**
       * Updates the permissions of the custom AG identified by `id`, for the given `ticker`.
       *
       * # Arguments
       * - `ticker` the custom AG belongs to.
       * - `id` for the custom AG within `ticker`.
       * - `perms` to update the custom AG to.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` was not authorized as an agent to call this.
       * - `TooLong` if `perms` had some string or list length that was too long.
       * - `NoSuchAG` if `id` does not identify a custom AG.
       *
       * # Permissions
       * * Asset
       * * Agent
       **/
      setGroupPermissions: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u32 | AnyNumber | Uint8Array,
          perms:
            | PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions
            | { Whole: any }
            | { These: any }
            | { Except: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u32, PolymeshPrimitivesSubsetSubsetRestrictionPalletPermissions]
      >;
    };
    grandpa: {
      /**
       * Note that the current authority set of the GRANDPA finality gadget has stalled.
       *
       * This will trigger a forced authority set change at the beginning of the next session, to
       * be enacted `delay` blocks after that. The `delay` should be high enough to safely assume
       * that the block signalling the forced change will not be re-orged e.g. 1000 blocks.
       * The block production rate (which may be slowed down because of finality lagging) should
       * be taken into account when choosing the `delay`. The GRANDPA voters based on the new
       * authority will start voting on top of `best_finalized_block_number` for new finalized
       * blocks. `best_finalized_block_number` should be the highest of the latest finalized
       * block of all validators of the new authority set.
       *
       * Only callable by root.
       **/
      noteStalled: AugmentedSubmittable<
        (
          delay: u32 | AnyNumber | Uint8Array,
          bestFinalizedBlockNumber: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Report voter equivocation/misbehavior. This method will verify the
       * equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence
       * will be reported.
       **/
      reportEquivocation: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof:
            | SpSessionMembershipProof
            | { session?: any; trieNodes?: any; validatorCount?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpSessionMembershipProof]
      >;
      /**
       * Report voter equivocation/misbehavior. This method will verify the
       * equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence
       * will be reported.
       *
       * This extrinsic must be called unsigned and it is expected that only
       * block authors will call it (validated in `ValidateUnsigned`), as such
       * if the block author is defined it will be defined as the equivocation
       * reporter.
       **/
      reportEquivocationUnsigned: AugmentedSubmittable<
        (
          equivocationProof:
            | SpConsensusGrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof:
            | SpSessionMembershipProof
            | { session?: any; trieNodes?: any; validatorCount?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [SpConsensusGrandpaEquivocationProof, SpSessionMembershipProof]
      >;
    };
    identity: {
      /**
       * Call this with the new primary key. By invoking this method, caller accepts authorization
       * to become the new primary key of the issuing identity. If a CDD service provider approved
       * this change (or this is not required), primary key of the DID is updated.
       *
       * The caller (new primary key) must be either a secondary key of the issuing identity, or
       * unlinked to any identity.
       *
       * Differs from rotate_primary_key_to_secondary in that it will unlink the old primary key
       * instead of leaving it as a secondary key.
       *
       * # Arguments
       * * `owner_auth_id` Authorization from the owner who initiated the change
       * * `cdd_auth_id` Authorization from a CDD service provider
       **/
      acceptPrimaryKey: AugmentedSubmittable<
        (
          rotationAuthId: u64 | AnyNumber | Uint8Array,
          optionalCddAuthId: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Option<u64>]
      >;
      /**
       * Adds an authorization.
       **/
      addAuthorization: AugmentedSubmittable<
        (
          target:
            | PolymeshPrimitivesSecondaryKeySignatory
            | { Identity: any }
            | { Account: any }
            | string
            | Uint8Array,
          data:
            | PolymeshPrimitivesAuthorizationAuthorizationData
            | { AttestPrimaryKeyRotation: any }
            | { RotatePrimaryKey: any }
            | { TransferTicker: any }
            | { AddMultiSigSigner: any }
            | { TransferAssetOwnership: any }
            | { JoinIdentity: any }
            | { PortfolioCustody: any }
            | { BecomeAgent: any }
            | { AddRelayerPayingKey: any }
            | { RotatePrimaryKeyToSecondary: any }
            | string
            | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesSecondaryKeySignatory,
          PolymeshPrimitivesAuthorizationAuthorizationData,
          Option<u64>
        ]
      >;
      /**
       * Adds a new claim record or edits an existing one.
       *
       * Only called by did_issuer's secondary key.
       **/
      addClaim: AugmentedSubmittable<
        (
          target: PolymeshPrimitivesIdentityId | string | Uint8Array,
          claim:
            | PolymeshPrimitivesIdentityClaimClaim
            | { Accredited: any }
            | { Affiliate: any }
            | { BuyLockup: any }
            | { SellLockup: any }
            | { CustomerDueDiligence: any }
            | { KnowYourCustomer: any }
            | { Jurisdiction: any }
            | { Exempted: any }
            | { Blocked: any }
            | { Custom: any }
            | string
            | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityClaimClaim, Option<u64>]
      >;
      /**
       * Adds secondary keys to target identity `id`.
       *
       * Keys are directly added to identity because each of them has an authorization.
       *
       * # Arguments:
       * - `origin` which must be the primary key of the identity `id`.
       * - `id` to which new secondary keys will be added.
       * - `additional_keys` which includes secondary keys,
       * coupled with authorization data, to add to target identity.
       *
       * # Errors
       * - Can only called by primary key owner.
       * - Keys should be able to linked to any identity.
       **/
      addSecondaryKeysWithAuthorization: AugmentedSubmittable<
        (
          additionalKeys:
            | Vec<PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth>
            | (
                | PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth
                | { secondaryKey?: any; authSignature?: any }
                | string
                | Uint8Array
              )[],
          expiresAt: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshCommonUtilitiesIdentitySecondaryKeyWithAuth>, u64]
      >;
      /**
       * Register `target_account` with a new Identity.
       *
       * # Failure
       * - `origin` has to be a active CDD provider. Inactive CDD providers cannot add new
       * claims.
       * - `target_account` (primary key of the new Identity) can be linked to just one and only
       * one identity.
       * - External secondary keys can be linked to just one identity.
       **/
      cddRegisterDid: AugmentedSubmittable<
        (
          targetAccount: AccountId32 | string | Uint8Array,
          secondaryKeys:
            | Vec<PolymeshPrimitivesSecondaryKey>
            | (
                | PolymeshPrimitivesSecondaryKey
                | { key?: any; permissions?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Vec<PolymeshPrimitivesSecondaryKey>]
      >;
      /**
       * Register `target_account` with a new Identity and issue a CDD claim with a blank CddId
       *
       * # Failure
       * - `origin` has to be a active CDD provider. Inactive CDD providers cannot add new
       * claims.
       * - `target_account` (primary key of the new Identity) can be linked to just one and only
       * one identity.
       * - External secondary keys can be linked to just one identity.
       **/
      cddRegisterDidWithCdd: AugmentedSubmittable<
        (
          targetAccount: AccountId32 | string | Uint8Array,
          secondaryKeys:
            | Vec<PolymeshPrimitivesSecondaryKey>
            | (
                | PolymeshPrimitivesSecondaryKey
                | { key?: any; permissions?: any }
                | string
                | Uint8Array
              )[],
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Vec<PolymeshPrimitivesSecondaryKey>, Option<u64>]
      >;
      /**
       * Set if CDD authorization is required for updating primary key of an identity.
       * Callable via root (governance)
       *
       * # Arguments
       * * `auth_required` CDD Authorization required or not
       **/
      changeCddRequirementForMkRotation: AugmentedSubmittable<
        (authRequired: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [bool]
      >;
      /**
       * Create a child identities.
       *
       * The new primary key for each child identity will need to sign (off-chain)
       * an authorization.
       *
       * Only the primary key can create child identities.
       *
       * # Arguments
       * - `child_keys` the keys that will become primary keys of their own child identity.
       *
       * # Errors
       * - `KeyNotAllowed` only the primary key can create a new identity.
       * - `AlreadyLinked` one of the keys is already linked to an identity.
       * - `DuplicateKey` one of the keys is included multiple times.
       * - `IsChildIdentity` the caller's identity is already a child identity and can't create child identities.
       **/
      createChildIdentities: AugmentedSubmittable<
        (
          childKeys:
            | Vec<PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth>
            | (
                | PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth
                | { key?: any; authSignature?: any }
                | string
                | Uint8Array
              )[],
          expiresAt: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshCommonUtilitiesIdentityCreateChildIdentityWithAuth>, u64]
      >;
      /**
       * Create a child identity and make the `secondary_key` it's primary key.
       *
       * Only the primary key can create child identities.
       *
       * # Arguments
       * - `secondary_key` the secondary key that will become the primary key of the new identity.
       *
       * # Errors
       * - `KeyNotAllowed` only the primary key can create a new identity.
       * - `NotASigner` the `secondary_key` is not a secondary key of the caller's identity.
       * - `AccountKeyIsBeingUsed` the `secondary_key` can't be unlinked from it's current identity.
       * - `IsChildIdentity` the caller's identity is already a child identity and can't create child identities.
       **/
      createChildIdentity: AugmentedSubmittable<
        (secondaryKey: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * It disables all secondary keys at `did` identity.
       *
       * # Errors
       *
       **/
      freezeSecondaryKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Assuming this is executed by the GC voting majority, adds a new cdd claim record.
       **/
      gcAddCddClaim: AugmentedSubmittable<
        (
          target: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Assuming this is executed by the GC voting majority, removes an existing cdd claim record.
       **/
      gcRevokeCddClaim: AugmentedSubmittable<
        (
          target: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Invalidates any claim generated by `cdd` from `disable_from` timestamps.
       *
       * You can also define an expiration time,
       * which will invalidate all claims generated by that `cdd` and remove it as CDD member group.
       **/
      invalidateCddClaims: AugmentedSubmittable<
        (
          cdd: PolymeshPrimitivesIdentityId | string | Uint8Array,
          disableFrom: u64 | AnyNumber | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, u64, Option<u64>]
      >;
      /**
       * Join an identity as a secondary key.
       **/
      joinIdentityAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Leave the secondary key's identity.
       **/
      leaveIdentityAsKey: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Register custom claim type.
       *
       * # Errors
       * * `CustomClaimTypeAlreadyExists` The type that is being registered already exists.
       * * `CounterOverflow` CustomClaimTypeId has overflowed.
       * * `TooLong` The type being registered is too lang.
       **/
      registerCustomClaimType: AugmentedSubmittable<
        (ty: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Removes an authorization.
       * _auth_issuer_pays determines whether the issuer of the authorisation pays the transaction fee
       **/
      removeAuthorization: AugmentedSubmittable<
        (
          target:
            | PolymeshPrimitivesSecondaryKeySignatory
            | { Identity: any }
            | { Account: any }
            | string
            | Uint8Array,
          authId: u64 | AnyNumber | Uint8Array,
          authIssuerPays: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesSecondaryKeySignatory, u64, bool]
      >;
      /**
       * Removes specified secondary keys of a DID if present.
       *
       * # Errors
       *
       * The extrinsic can only called by primary key owner.
       **/
      removeSecondaryKeys: AugmentedSubmittable<
        (
          keysToRemove: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<AccountId32>]
      >;
      /**
       * Marks the specified claim as revoked.
       **/
      revokeClaim: AugmentedSubmittable<
        (
          target: PolymeshPrimitivesIdentityId | string | Uint8Array,
          claim:
            | PolymeshPrimitivesIdentityClaimClaim
            | { Accredited: any }
            | { Affiliate: any }
            | { BuyLockup: any }
            | { SellLockup: any }
            | { CustomerDueDiligence: any }
            | { KnowYourCustomer: any }
            | { Jurisdiction: any }
            | { Exempted: any }
            | { Blocked: any }
            | { Custom: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityClaimClaim]
      >;
      /**
       * Revokes a specific claim using its [Claim Unique Index](/pallet_identity/index.html#claim-unique-index) composed by `target`,
       * `claim_type`, and `scope`.
       *
       * Please note that `origin` must be the issuer of the target claim.
       **/
      revokeClaimByIndex: AugmentedSubmittable<
        (
          target: PolymeshPrimitivesIdentityId | string | Uint8Array,
          claimType:
            | PolymeshPrimitivesIdentityClaimClaimType
            | { Accredited: any }
            | { Affiliate: any }
            | { BuyLockup: any }
            | { SellLockup: any }
            | { CustomerDueDiligence: any }
            | { KnowYourCustomer: any }
            | { Jurisdiction: any }
            | { Exempted: any }
            | { Blocked: any }
            | { Custom: any }
            | string
            | Uint8Array,
          scope:
            | Option<PolymeshPrimitivesIdentityClaimScope>
            | null
            | Uint8Array
            | PolymeshPrimitivesIdentityClaimScope
            | { Identity: any }
            | { Ticker: any }
            | { Custom: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesIdentityId,
          PolymeshPrimitivesIdentityClaimClaimType,
          Option<PolymeshPrimitivesIdentityClaimScope>
        ]
      >;
      /**
       * Call this with the new primary key. By invoking this method, caller accepts authorization
       * to become the new primary key of the issuing identity. If a CDD service provider approved
       * this change, (or this is not required), primary key of the DID is updated.
       *
       * The caller (new primary key) must be either a secondary key of the issuing identity, or
       * unlinked to any identity.
       *
       * Differs from accept_primary_key in that it will leave the old primary key as a secondary
       * key with the permissions specified in the corresponding RotatePrimaryKeyToSecondary authorization
       * instead of unlinking the old primary key.
       *
       * # Arguments
       * * `owner_auth_id` Authorization from the owner who initiated the change
       * * `cdd_auth_id` Authorization from a CDD service provider
       **/
      rotatePrimaryKeyToSecondary: AugmentedSubmittable<
        (
          authId: u64 | AnyNumber | Uint8Array,
          optionalCddAuthId: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Option<u64>]
      >;
      /**
       * Sets permissions for an specific `target_key` key.
       *
       * Only the primary key of an identity is able to set secondary key permissions.
       **/
      setSecondaryKeyPermissions: AugmentedSubmittable<
        (
          key: AccountId32 | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSecondaryKeyPermissions
            | { asset?: any; extrinsic?: any; portfolio?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, PolymeshPrimitivesSecondaryKeyPermissions]
      >;
      /**
       * Re-enables all secondary keys of the caller's identity.
       **/
      unfreezeSecondaryKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Unlink a child identity from it's parent identity.
       *
       * Only the primary key of the parent or child identities can unlink the identities.
       *
       * # Arguments
       * - `child_did` the child identity to unlink from its parent identity.
       *
       * # Errors
       * - `KeyNotAllowed` only the primary key of either the parent or child identity can unlink the identities.
       * - `NoParentIdentity` the identity `child_did` doesn't have a parent identity.
       * - `NotParentOrChildIdentity` the caller's identity isn't the parent or child identity.
       **/
      unlinkChildIdentity: AugmentedSubmittable<
        (
          childDid: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
    };
    imOnline: {
      /**
       * ## Complexity:
       * - `O(K + E)` where K is length of `Keys` (heartbeat.validators_len) and E is length of
       * `heartbeat.network_state.external_address`
       * - `O(K)`: decoding of length `K`
       * - `O(E)`: decoding/encoding of length `E`
       **/
      heartbeat: AugmentedSubmittable<
        (
          heartbeat:
            | PalletImOnlineHeartbeat
            | {
                blockNumber?: any;
                networkState?: any;
                sessionIndex?: any;
                authorityIndex?: any;
                validatorsLen?: any;
              }
            | string
            | Uint8Array,
          signature: PalletImOnlineSr25519AppSr25519Signature | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PalletImOnlineHeartbeat, PalletImOnlineSr25519AppSr25519Signature]
      >;
    };
    indices: {
      /**
       * Assign an previously unassigned index.
       *
       * Payment: `Deposit` is reserved from the sender account.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `index`: the index to be claimed. This must not be in use.
       *
       * Emits `IndexAssigned` if successful.
       *
       * ## Complexity
       * - `O(1)`.
       **/
      claim: AugmentedSubmittable<
        (index: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Force an index to an account. This doesn't require a deposit. If the index is already
       * held, then any deposit is reimbursed to its current owner.
       *
       * The dispatch origin for this call must be _Root_.
       *
       * - `index`: the index to be (re-)assigned.
       * - `new`: the new owner of the index. This function is a no-op if it is equal to sender.
       * - `freeze`: if set to `true`, will freeze the index so it cannot be transferred.
       *
       * Emits `IndexAssigned` if successful.
       *
       * ## Complexity
       * - `O(1)`.
       **/
      forceTransfer: AugmentedSubmittable<
        (
          updated:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
          freeze: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, u32, bool]
      >;
      /**
       * Free up an index owned by the sender.
       *
       * Payment: Any previous deposit placed for the index is unreserved in the sender account.
       *
       * The dispatch origin for this call must be _Signed_ and the sender must own the index.
       *
       * - `index`: the index to be freed. This must be owned by the sender.
       *
       * Emits `IndexFreed` if successful.
       *
       * ## Complexity
       * - `O(1)`.
       **/
      free: AugmentedSubmittable<
        (index: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Freeze an index so it will always point to the sender account. This consumes the
       * deposit.
       *
       * The dispatch origin for this call must be _Signed_ and the signing account must have a
       * non-frozen account `index`.
       *
       * - `index`: the index to be frozen in place.
       *
       * Emits `IndexFrozen` if successful.
       *
       * ## Complexity
       * - `O(1)`.
       **/
      freeze: AugmentedSubmittable<
        (index: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Assign an index already owned by the sender to another account. The balance reservation
       * is effectively transferred to the new account.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * - `index`: the index to be re-assigned. This must be owned by the sender.
       * - `new`: the new owner of the index. This function is a no-op if it is equal to sender.
       *
       * Emits `IndexAssigned` if successful.
       *
       * ## Complexity
       * - `O(1)`.
       **/
      transfer: AugmentedSubmittable<
        (
          updated:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          index: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, u32]
      >;
    };
    multiSig: {
      /**
       * Accepts a multisig signer authorization given to signer's identity.
       *
       * # Arguments
       * * `auth_id` - Auth id of the authorization.
       * #[deprecated(since = "6.1.0", note = "Identity based signers not supported")]
       **/
      acceptMultisigSignerAsIdentity: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Accepts a multisig signer authorization given to signer's key (AccountId).
       *
       * # Arguments
       * * `auth_id` - Auth id of the authorization.
       **/
      acceptMultisigSignerAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Adds a signer to the multisig. This must be called by the multisig itself.
       *
       * # Arguments
       * * `signer` - Signatory to add.
       **/
      addMultisigSigner: AugmentedSubmittable<
        (
          signer:
            | PolymeshPrimitivesSecondaryKeySignatory
            | { Identity: any }
            | { Account: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesSecondaryKeySignatory]
      >;
      /**
       * Adds a signer to the multisig. This must be called by the creator identity of the
       * multisig.
       *
       * # Arguments
       * * `multisig` - Address of the multi sig
       * * `signers` - Signatories to add.
       *
       * # Weight
       * `900_000_000 + 3_000_000 * signers.len()`
       **/
      addMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          signers:
            | Vec<PolymeshPrimitivesSecondaryKeySignatory>
            | (
                | PolymeshPrimitivesSecondaryKeySignatory
                | { Identity: any }
                | { Account: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Vec<PolymeshPrimitivesSecondaryKeySignatory>]
      >;
      /**
       * Approves a multisig proposal using the caller's identity.
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to approve.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      approveAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64]
      >;
      /**
       * Approves a multisig proposal using the caller's secondary key (`AccountId`).
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to approve.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      approveAsKey: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64]
      >;
      /**
       * Changes the number of signatures required by a multisig. This must be called by the
       * multisig itself.
       *
       * # Arguments
       * * `sigs_required` - New number of required signatures.
       **/
      changeSigsRequired: AugmentedSubmittable<
        (sigsRequired: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Changes the number of signatures required by a multisig. This must be called by the creator of the multisig.
       *
       * # Arguments
       * * `multisig_account` - The account identifier ([`AccountId`]) for the multi signature account.
       * * `signatures_required` - The number of required signatures.
       **/
      changeSigsRequiredViaCreator: AugmentedSubmittable<
        (
          multisigAccount: AccountId32 | string | Uint8Array,
          signaturesRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64]
      >;
      /**
       * Creates a multisig
       *
       * # Arguments
       * * `signers` - Signers of the multisig (They need to accept authorization before they are actually added).
       * * `sigs_required` - Number of sigs required to process a multi-sig tx.
       **/
      createMultisig: AugmentedSubmittable<
        (
          signers:
            | Vec<PolymeshPrimitivesSecondaryKeySignatory>
            | (
                | PolymeshPrimitivesSecondaryKeySignatory
                | { Identity: any }
                | { Account: any }
                | string
                | Uint8Array
              )[],
          sigsRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesSecondaryKeySignatory>, u64]
      >;
      /**
       * Creates a multisig proposal if it hasn't been created or approves it if it has.
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * * `expiry` - Optional proposal expiry time.
       * * `auto_close` - Close proposal on receiving enough reject votes.
       * If this is 1 out of `m` multisig, the proposal will be immediately executed.
       * #[deprecated(since = "6.0.0", note = "Please use the `create_proposal_as_identity` and `approve_as_identity` instead")]
       **/
      createOrApproveProposalAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Call, Option<u64>, bool]
      >;
      /**
       * Creates a multisig proposal if it hasn't been created or approves it if it has.
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * * `expiry` - Optional proposal expiry time.
       * * `auto_close` - Close proposal on receiving enough reject votes.
       * If this is 1 out of `m` multisig, the proposal will be immediately executed.
       * #[deprecated(since = "6.0.0", note = "Please use the `create_proposal_as_key` and `approve_as_key` instead")]
       **/
      createOrApproveProposalAsKey: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Call, Option<u64>, bool]
      >;
      /**
       * Creates a multisig proposal
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * * `expiry` - Optional proposal expiry time.
       * * `auto_close` - Close proposal on receiving enough reject votes.
       * If this is 1 out of `m` multisig, the proposal will be immediately executed.
       **/
      createProposalAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Call, Option<u64>, bool]
      >;
      /**
       * Creates a multisig proposal
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal` - Proposal to be voted on.
       * * `expiry` - Optional proposal expiry time.
       * * `auto_close` - Close proposal on receiving enough reject votes.
       * If this is 1 out of `m` multisig, the proposal will be immediately executed.
       **/
      createProposalAsKey: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposal: Call | IMethod | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Call, Option<u64>, bool]
      >;
      /**
       * Root callable extrinsic, used as an internal call for executing scheduled multisig proposal.
       **/
      executeScheduledProposal: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array,
          multisigDid: PolymeshPrimitivesIdentityId | string | Uint8Array,
          proposalWeight:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64, PolymeshPrimitivesIdentityId, SpWeightsWeightV2Weight]
      >;
      /**
       * Adds a multisig as the primary key of the current did if the current DID is the creator
       * of the multisig.
       *
       * # Arguments
       * * `multi_sig` - multi sig address
       **/
      makeMultisigPrimary: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          optionalCddAuthId: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Option<u64>]
      >;
      /**
       * Adds a multisig as a secondary key of current did if the current did is the creator of the
       * multisig.
       *
       * # Arguments
       * * `multisig` - multi sig address
       **/
      makeMultisigSecondary: AugmentedSubmittable<
        (multisig: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Rejects a multisig proposal using the caller's identity.
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to reject.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      rejectAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64]
      >;
      /**
       * Rejects a multisig proposal using the caller's secondary key (`AccountId`).
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to reject.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      rejectAsKey: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u64]
      >;
      /**
       * Removes the creator ability to call `add_multisig_signers_via_creator`, `remove_multisig_signers_via_creator`
       * and `change_sigs_required_via_creator`.
       **/
      removeCreatorControls: AugmentedSubmittable<
        (multisigAccount: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Removes a signer from the multisig. This must be called by the multisig itself.
       *
       * # Arguments
       * * `signer` - Signatory to remove.
       **/
      removeMultisigSigner: AugmentedSubmittable<
        (
          signer:
            | PolymeshPrimitivesSecondaryKeySignatory
            | { Identity: any }
            | { Account: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesSecondaryKeySignatory]
      >;
      /**
       * Removes a signer from the multisig.
       * This must be called by the creator identity of the multisig.
       *
       * # Arguments
       * * `multisig` - Address of the multisig.
       * * `signers` - Signatories to remove.
       *
       * # Weight
       * `900_000_000 + 3_000_000 * signers.len()`
       **/
      removeMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId32 | string | Uint8Array,
          signers:
            | Vec<PolymeshPrimitivesSecondaryKeySignatory>
            | (
                | PolymeshPrimitivesSecondaryKeySignatory
                | { Identity: any }
                | { Account: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, Vec<PolymeshPrimitivesSecondaryKeySignatory>]
      >;
    };
    nft: {
      /**
       * Forces the transfer of NFTs from a given portfolio to the caller's portfolio.
       *
       * # Arguments
       * * `origin` - is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - the [`Ticker`] of the NFT collection.
       * * `nft_id` - the [`NFTId`] of the NFT to be transferred.
       * * `source_portfolio` - the [`PortfolioId`] that currently holds the NFT.
       * * `callers_portfolio_kind` - the [`PortfolioKind`] of the caller's portfolio.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      controllerTransfer: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          nfts: PolymeshPrimitivesNftNfTs | { ticker?: any; ids?: any } | string | Uint8Array,
          sourcePortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          callersPortfolioKind:
            | PolymeshPrimitivesIdentityIdPortfolioKind
            | { Default: any }
            | { User: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesNftNfTs,
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesIdentityIdPortfolioKind
        ]
      >;
      /**
       * Cretes a new `NFTCollection`.
       *
       * # Arguments
       * * `origin` - contains the secondary key of the caller (i.e. who signed the transaction to execute this function).
       * * `ticker` - the ticker associated to the new collection.
       * * `nft_type` - in case the asset hasn't been created yet, one will be created with the given type.
       * * `collection_keys` - all mandatory metadata keys that the tokens in the collection must have.
       *
       * ## Errors
       * - `CollectionAlredyRegistered` - if the ticker is already associated to an NFT collection.
       * - `InvalidAssetType` - if the associated asset is not of type NFT.
       * - `MaxNumberOfKeysExceeded` - if the number of metadata keys for the collection is greater than the maximum allowed.
       * - `UnregisteredMetadataKey` - if any of the metadata keys needed for the collection has not been registered.
       * - `DuplicateMetadataKey` - if a duplicate metadata keys has been passed as input.
       *
       * # Permissions
       * * Asset
       **/
      createNftCollection: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          nftType:
            | Option<PolymeshPrimitivesAssetNonFungibleType>
            | null
            | Uint8Array
            | PolymeshPrimitivesAssetNonFungibleType
            | { Derivative: any }
            | { FixedIncome: any }
            | { Invoice: any }
            | { Custom: any }
            | string,
          collectionKeys: PolymeshPrimitivesNftNftCollectionKeys
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          Option<PolymeshPrimitivesAssetNonFungibleType>,
          PolymeshPrimitivesNftNftCollectionKeys
        ]
      >;
      /**
       * Issues an NFT to the caller.
       *
       * # Arguments
       * * `origin` - is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - the ticker of the NFT collection.
       * * `nft_metadata_attributes` - all mandatory metadata keys and values for the NFT.
       * - `portfolio_kind` - the portfolio that will receive the minted nft.
       *
       * ## Errors
       * - `CollectionNotFound` - if the collection associated to the given ticker has not been created.
       * - `InvalidMetadataAttribute` - if the number of attributes is not equal to the number set in the collection or attempting to set a value for a key not definied in the collection.
       * - `DuplicateMetadataKey` - if a duplicate metadata keys has been passed as input.
       *
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      issueNft: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          nftMetadataAttributes:
            | Vec<PolymeshPrimitivesNftNftMetadataAttribute>
            | (
                | PolymeshPrimitivesNftNftMetadataAttribute
                | { key?: any; value?: any }
                | string
                | Uint8Array
              )[],
          portfolioKind:
            | PolymeshPrimitivesIdentityIdPortfolioKind
            | { Default: any }
            | { User: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesTicker,
          Vec<PolymeshPrimitivesNftNftMetadataAttribute>,
          PolymeshPrimitivesIdentityIdPortfolioKind
        ]
      >;
      /**
       * Redeems the given NFT from the caller's portfolio.
       *
       * # Arguments
       * * `origin` - is a signer that has permissions to act as an agent of `ticker`.
       * * `ticker` - the ticker of the NFT collection.
       * * `nft_id` - the id of the NFT to be burned.
       * * `portfolio_kind` - the portfolio that contains the nft.
       *
       * ## Errors
       * - `CollectionNotFound` - if the collection associated to the given ticker has not been created.
       * - `NFTNotFound` - if the given NFT does not exist in the portfolio.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      redeemNft: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          nftId: u64 | AnyNumber | Uint8Array,
          portfolioKind:
            | PolymeshPrimitivesIdentityIdPortfolioKind
            | { Default: any }
            | { User: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64, PolymeshPrimitivesIdentityIdPortfolioKind]
      >;
    };
    pips: {
      /**
       * Approves the pending committee PIP given by the `id`.
       *
       * # Errors
       * * `BadOrigin` unless a GC voting majority executes this function.
       * * `NoSuchProposal` if the PIP with `id` doesn't exist.
       * * `IncorrectProposalState` if the proposal isn't pending.
       * * `NotByCommittee` if the proposal isn't by a committee.
       **/
      approveCommitteeProposal: AugmentedSubmittable<
        (id: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Clears the snapshot and emits the event `SnapshotCleared`.
       *
       * # Errors
       * * `NotACommitteeMember` - triggered when a non-GC-member executes the function.
       **/
      clearSnapshot: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Enacts `results` for the PIPs in the snapshot queue.
       * The snapshot will be available for further enactments until it is cleared.
       *
       * The `results` are encoded a list of `(id, result)` where `result` is applied to `id`.
       * Note that the snapshot priority queue is encoded with the *lowest priority first*.
       * so `results = [(id, Approve)]` will approve `SnapshotQueue[SnapshotQueue.len() - 1]`.
       *
       * # Errors
       * * `BadOrigin` - unless a GC voting majority executes this function.
       * * `CannotSkipPip` - a given PIP has already been skipped too many times.
       * * `SnapshotResultTooLarge` - on len(results) > len(snapshot_queue).
       * * `SnapshotIdMismatch` - if:
       * ```text
       * ∃ (i ∈ 0..SnapshotQueue.len()).
       * results[i].0 ≠ SnapshotQueue[SnapshotQueue.len() - i].id
       * ```
       * This is protects against clearing queue while GC is voting.
       **/
      enactSnapshotResults: AugmentedSubmittable<
        (
          results:
            | Vec<ITuple<[u32, PalletPipsSnapshotResult]>>
            | [
                u32 | AnyNumber | Uint8Array,
                PalletPipsSnapshotResult | 'Approve' | 'Reject' | 'Skip' | number | Uint8Array
              ][]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[u32, PalletPipsSnapshotResult]>>]
      >;
      /**
       * Internal dispatchable that handles execution of a PIP.
       **/
      executeScheduledPip: AugmentedSubmittable<
        (id: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Internal dispatchable that handles expiration of a PIP.
       **/
      expireScheduledPip: AugmentedSubmittable<
        (
          did: PolymeshPrimitivesIdentityId | string | Uint8Array,
          id: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, u32]
      >;
      /**
       * A network member creates a PIP by submitting a dispatchable which
       * changes the network in someway. A minimum deposit is required to open a new proposal.
       *
       * # Arguments
       * * `proposer` is either a signing key or committee.
       * Used to understand whether this is a committee proposal and verified against `origin`.
       * * `proposal` a dispatchable call
       * * `deposit` minimum deposit value, which is ignored if `proposer` is a committee.
       * * `url` a link to a website for proposal discussion
       **/
      propose: AugmentedSubmittable<
        (
          proposal: Call | IMethod | string | Uint8Array,
          deposit: u128 | AnyNumber | Uint8Array,
          url: Option<Bytes> | null | Uint8Array | Bytes | string,
          description: Option<Bytes> | null | Uint8Array | Bytes | string
        ) => SubmittableExtrinsic<ApiType>,
        [Call, u128, Option<Bytes>, Option<Bytes>]
      >;
      /**
       * Prune the PIP given by the `id`, refunding any funds not already refunded.
       * The PIP may not be active
       *
       * This function is intended for storage garbage collection purposes.
       *
       * # Errors
       * * `BadOrigin` unless a GC voting majority executes this function.
       * * `NoSuchProposal` if the PIP with `id` doesn't exist.
       * * `IncorrectProposalState` if the proposal is active.
       **/
      pruneProposal: AugmentedSubmittable<
        (id: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Rejects the PIP given by the `id`, refunding any bonded funds,
       * assuming it hasn't been cancelled or executed.
       * Note that proposals scheduled-for-execution can also be rejected.
       *
       * # Errors
       * * `BadOrigin` unless a GC voting majority executes this function.
       * * `NoSuchProposal` if the PIP with `id` doesn't exist.
       * * `IncorrectProposalState` if the proposal was cancelled or executed.
       **/
      rejectProposal: AugmentedSubmittable<
        (id: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Updates the execution schedule of the PIP given by `id`.
       *
       * # Arguments
       * * `until` defines the future block where the enactment period will finished.
       * `None` value means that enactment period is going to finish in the next block.
       *
       * # Errors
       * * `RescheduleNotByReleaseCoordinator` unless triggered by release coordinator.
       * * `IncorrectProposalState` unless the proposal was in a scheduled state.
       **/
      rescheduleExecution: AugmentedSubmittable<
        (
          id: u32 | AnyNumber | Uint8Array,
          until: Option<u32> | null | Uint8Array | u32 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<u32>]
      >;
      /**
       * Change the maximum number of active PIPs before community members cannot propose anything.
       * Can only be called by root.
       *
       * # Arguments
       * * `limit` of concurrent active PIPs.
       **/
      setActivePipLimit: AugmentedSubmittable<
        (limit: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Change the default enactment period.
       * Can only be called by root.
       *
       * # Arguments
       * * `duration` the new default enactment period it takes for a scheduled PIP to be executed.
       **/
      setDefaultEnactmentPeriod: AugmentedSubmittable<
        (duration: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Change the maximum skip count (`max_pip_skip_count`).
       * Can only be called by root.
       *
       * # Arguments
       * * `max` skips before a PIP cannot be skipped by GC anymore.
       **/
      setMaxPipSkipCount: AugmentedSubmittable<
        (max: u8 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u8]
      >;
      /**
       * Change the minimum proposal deposit amount required to start a proposal.
       * Can only be called by root.
       *
       * # Arguments
       * * `deposit` the new min deposit required to start a proposal
       **/
      setMinProposalDeposit: AugmentedSubmittable<
        (deposit: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u128]
      >;
      /**
       * Change the amount of blocks after which a pending PIP is expired.
       * If `expiry` is `None` then PIPs never expire.
       * Can only be called by root.
       *
       * # Arguments
       * * `expiry` the block-time it takes for a still-`Pending` PIP to expire.
       **/
      setPendingPipExpiry: AugmentedSubmittable<
        (
          expiry:
            | PolymeshCommonUtilitiesMaybeBlock
            | { Some: any }
            | { None: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshCommonUtilitiesMaybeBlock]
      >;
      /**
       * Change whether completed PIPs are pruned.
       * Can only be called by root.
       *
       * # Arguments
       * * `prune` specifies whether completed PIPs should be pruned.
       **/
      setPruneHistoricalPips: AugmentedSubmittable<
        (prune: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [bool]
      >;
      /**
       * Takes a new snapshot of the current list of active && pending PIPs.
       * The PIPs are then sorted into a priority queue based on each PIP's weight.
       *
       * # Errors
       * * `NotACommitteeMember` - triggered when a non-GC-member executes the function.
       **/
      snapshot: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Vote either in favor (`aye_or_nay` == true) or against a PIP with `id`.
       * The "convinction" or strength of the vote is given by `deposit`, which is reserved.
       *
       * Note that `vote` is *not* additive.
       * That is, `vote(id, true, 50)` followed by `vote(id, true, 40)`
       * will first reserve `50` and then refund `50 - 10`, ending up with `40` in deposit.
       * To add atop of existing votes, you'll need `existing_deposit + addition`.
       *
       * # Arguments
       * * `id`, proposal id
       * * `aye_or_nay`, a bool representing for or against vote
       * * `deposit`, the "conviction" with which the vote is made.
       *
       * # Errors
       * * `NoSuchProposal` if `id` doesn't reference a valid PIP.
       * * `NotFromCommunity` if proposal was made by a committee.
       * * `IncorrectProposalState` if PIP isn't pending.
       * * `InsufficientDeposit` if `origin` cannot reserve `deposit - old_deposit`.
       **/
      vote: AugmentedSubmittable<
        (
          id: u32 | AnyNumber | Uint8Array,
          ayeOrNay: bool | boolean | Uint8Array,
          deposit: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, bool, u128]
      >;
    };
    polymeshCommittee: {
      /**
       * Changes the time after which a proposal expires.
       *
       * # Arguments
       * * `expiry` - The new expiry time.
       **/
      setExpiresAfter: AugmentedSubmittable<
        (
          expiry:
            | PolymeshCommonUtilitiesMaybeBlock
            | { Some: any }
            | { None: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshCommonUtilitiesMaybeBlock]
      >;
      /**
       * Changes the release coordinator.
       *
       * # Arguments
       * * `id` - The DID of the new release coordinator.
       *
       * # Errors
       * * `NotAMember`, If the new coordinator `id` is not part of the committee.
       **/
      setReleaseCoordinator: AugmentedSubmittable<
        (id: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Change the vote threshold the determines the winning proposal.
       * For e.g., for a simple majority use (1, 2) which represents the in-equation ">= 1/2".
       *
       * # Arguments
       * * `n` - Numerator of the fraction representing vote threshold.
       * * `d` - Denominator of the fraction representing vote threshold.
       **/
      setVoteThreshold: AugmentedSubmittable<
        (
          n: u32 | AnyNumber | Uint8Array,
          d: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Votes `approve`ingly (or not, if `false`)
       * on an existing `proposal` given by its hash, `index`.
       *
       * # Arguments
       * * `proposal` - A hash of the proposal to be voted on.
       * * `index` - The proposal index.
       * * `approve` - If `true` than this is a `for` vote, and `against` otherwise.
       *
       * # Errors
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [H256, u32, bool]
      >;
      /**
       * Proposes to the committee that `call` should be executed in its name.
       * Alternatively, if the hash of `call` has already been recorded, i.e., already proposed,
       * then this call counts as a vote, i.e., as if `vote_by_hash` was called.
       *
       * # Weight
       *
       * The weight of this dispatchable is that of `call` as well as the complexity
       * for recording the vote itself.
       *
       * # Arguments
       * * `approve` - is this an approving vote?
       * If the proposal doesn't exist, passing `false` will result in error `FirstVoteReject`.
       * * `call` - the call to propose for execution.
       *
       * # Errors
       * * `FirstVoteReject`, if `call` hasn't been proposed and `approve == false`.
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      voteOrPropose: AugmentedSubmittable<
        (
          approve: bool | boolean | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [bool, Call]
      >;
    };
    polymeshContracts: {
      /**
       * Instantiates a smart contract defining it with the given `code` and `salt`.
       *
       * The contract will be attached as a primary key of a newly created child identity of the caller.
       *
       * # Arguments
       * - `endowment`: Amount of POLYX to transfer to the contract.
       * - `gas_limit`: For how much gas the `deploy` code in the contract may at most consume.
       * - `storage_deposit_limit`: The maximum amount of balance that can be charged/reserved from the caller to pay for the storage consumed.
       * - `code`: The WASM binary defining the smart contract.
       * - `data`: The input data to pass to the contract constructor.
       * - `salt`: Used for contract address derivation. By varying this, the same `code` can be used under the same identity.
       *
       **/
      instantiateWithCodeAsPrimaryKey: AugmentedSubmittable<
        (
          endowment: u128 | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          code: Bytes | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u128, SpWeightsWeightV2Weight, Option<u128>, Bytes, Bytes, Bytes]
      >;
      /**
       * Instantiates a smart contract defining it with the given `code` and `salt`.
       *
       * The contract will be attached as a secondary key,
       * with `perms` as its permissions, to `origin`'s identity.
       *
       * The contract is transferred `endowment` amount of POLYX.
       * This is distinct from the `gas_limit`,
       * which controls how much gas the deployment code may at most consume.
       *
       * # Arguments
       * - `endowment` amount of POLYX to transfer to the contract.
       * - `gas_limit` for how much gas the `deploy` code in the contract may at most consume.
       * - `storage_deposit_limit` The maximum amount of balance that can be charged/reserved
       * from the caller to pay for the storage consumed.
       * - `code` with the WASM binary defining the smart contract.
       * - `data` The input data to pass to the contract constructor.
       * - `salt` used for contract address derivation.
       * By varying this, the same `code` can be used under the same identity.
       * - `perms` that the new secondary key will have.
       *
       * # Errors
       * - All the errors in `pallet_contracts::Call::instantiate_with_code` can also happen here.
       * - CDD/Permissions are checked, unlike in `pallet_contracts`.
       * - Errors that arise when adding a new secondary key can also occur here.
       **/
      instantiateWithCodePerms: AugmentedSubmittable<
        (
          endowment: u128 | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          code: Bytes | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSecondaryKeyPermissions
            | { asset?: any; extrinsic?: any; portfolio?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          u128,
          SpWeightsWeightV2Weight,
          Option<u128>,
          Bytes,
          Bytes,
          Bytes,
          PolymeshPrimitivesSecondaryKeyPermissions
        ]
      >;
      /**
       * Instantiates a smart contract defining using the given `code_hash` and `salt`.
       *
       * Unlike `instantiate_with_code`, this assumes that at least one contract with the same WASM code has already been uploaded.
       *
       * The contract will be attached as a primary key of a newly created child identity of the caller.
       *
       * # Arguments
       * - `endowment`: amount of POLYX to transfer to the contract.
       * - `gas_limit`: for how much gas the `deploy` code in the contract may at most consume.
       * - `storage_deposit_limit`: The maximum amount of balance that can be charged/reserved from the caller to pay for the storage consumed.
       * - `code_hash`: of an already uploaded WASM binary.
       * - `data`: The input data to pass to the contract constructor.
       * - `salt`: used for contract address derivation. By varying this, the same `code` can be used under the same identity.
       *
       **/
      instantiateWithHashAsPrimaryKey: AugmentedSubmittable<
        (
          endowment: u128 | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          codeHash: H256 | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u128, SpWeightsWeightV2Weight, Option<u128>, H256, Bytes, Bytes]
      >;
      /**
       * Instantiates a smart contract defining using the given `code_hash` and `salt`.
       *
       * Unlike `instantiate_with_code`,
       * this assumes that at least one contract with the same WASM code has already been uploaded.
       *
       * The contract will be attached as a secondary key,
       * with `perms` as its permissions, to `origin`'s identity.
       *
       * The contract is transferred `endowment` amount of POLYX.
       * This is distinct from the `gas_limit`,
       * which controls how much gas the deployment code may at most consume.
       *
       * # Arguments
       * - `endowment` amount of POLYX to transfer to the contract.
       * - `gas_limit` for how much gas the `deploy` code in the contract may at most consume.
       * - `storage_deposit_limit` The maximum amount of balance that can be charged/reserved
       * from the caller to pay for the storage consumed.
       * - `code_hash` of an already uploaded WASM binary.
       * - `data` The input data to pass to the contract constructor.
       * - `salt` used for contract address derivation.
       * By varying this, the same `code` can be used under the same identity.
       * - `perms` that the new secondary key will have.
       *
       * # Errors
       * - All the errors in `pallet_contracts::Call::instantiate` can also happen here.
       * - CDD/Permissions are checked, unlike in `pallet_contracts`.
       * - Errors that arise when adding a new secondary key can also occur here.
       **/
      instantiateWithHashPerms: AugmentedSubmittable<
        (
          endowment: u128 | AnyNumber | Uint8Array,
          gasLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array,
          storageDepositLimit: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          codeHash: H256 | string | Uint8Array,
          data: Bytes | string | Uint8Array,
          salt: Bytes | string | Uint8Array,
          perms:
            | PolymeshPrimitivesSecondaryKeyPermissions
            | { asset?: any; extrinsic?: any; portfolio?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          u128,
          SpWeightsWeightV2Weight,
          Option<u128>,
          H256,
          Bytes,
          Bytes,
          PolymeshPrimitivesSecondaryKeyPermissions
        ]
      >;
      /**
       * Update CallRuntime whitelist.
       *
       * # Arguments
       *
       * # Errors
       **/
      updateCallRuntimeWhitelist: AugmentedSubmittable<
        (
          updates:
            | Vec<ITuple<[PolymeshContractsChainExtensionExtrinsicId, bool]>>
            | [PolymeshContractsChainExtensionExtrinsicId, bool | boolean | Uint8Array][]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[PolymeshContractsChainExtensionExtrinsicId, bool]>>]
      >;
      upgradeApi: AugmentedSubmittable<
        (
          api: PolymeshContractsApi | { desc?: any; major?: any } | string | Uint8Array,
          nextUpgrade:
            | PolymeshContractsNextUpgrade
            | { chainVersion?: any; apiHash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshContractsApi, PolymeshContractsNextUpgrade]
      >;
    };
    portfolio: {
      acceptPortfolioCustody: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Adds an identity that will be allowed to create and take custody of a portfolio under the caller's identity.
       *
       * # Arguments
       * * `trusted_identity` - the [`IdentityId`] that will be allowed to call `create_custody_portfolio`.
       *
       **/
      allowIdentityToCreatePortfolios: AugmentedSubmittable<
        (
          trustedIdentity: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Creates a portfolio under the `portfolio_owner_id` identity and transfers its custody to the caller's identity.
       *
       * # Arguments
       * * `portfolio_owner_id` - the [`IdentityId`] that will own the new portfolio.
       * * `portfolio_name` - the [`PortfolioName`] of the new portfolio.
       *
       **/
      createCustodyPortfolio: AugmentedSubmittable<
        (
          portfolioOwnerId: PolymeshPrimitivesIdentityId | string | Uint8Array,
          portfolioName: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, Bytes]
      >;
      /**
       * Creates a portfolio with the given `name`.
       **/
      createPortfolio: AugmentedSubmittable<
        (name: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Deletes a user portfolio. A portfolio can be deleted only if it has no funds.
       *
       * # Errors
       * * `PortfolioDoesNotExist` if `num` doesn't reference a valid portfolio.
       * * `PortfolioNotEmpty` if the portfolio still holds any asset
       *
       * # Permissions
       * * Portfolio
       **/
      deletePortfolio: AugmentedSubmittable<
        (num: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Moves fungigle an non-fungible tokens from one portfolio of an identity to another portfolio of the same
       * identity. Must be called by the custodian of the sender.
       * Funds from deleted portfolios can also be recovered via this method.
       *
       * A short memo can be added to to each token amount moved.
       *
       * # Errors
       * * `PortfolioDoesNotExist` if one or both of the portfolios reference an invalid portfolio.
       * * `destination_is_same_portfolio` if both sender and receiver portfolio are the same
       * * `DifferentIdentityPortfolios` if the sender and receiver portfolios belong to different identities
       * * `UnauthorizedCustodian` if the caller is not the custodian of the from portfolio
       * * `InsufficientPortfolioBalance` if the sender does not have enough free balance
       * * `NoDuplicateAssetsAllowed` the same ticker can't be repeated in the items vector.
       * * `InvalidTransferNFTNotOwned` if the caller is trying to move an NFT he doesn't own.
       * * `InvalidTransferNFTIsLocked` if the caller is trying to move a locked NFT.
       *
       * # Permissions
       * * Portfolio
       **/
      movePortfolioFunds: AugmentedSubmittable<
        (
          from:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          to:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          funds:
            | Vec<PolymeshPrimitivesPortfolioFund>
            | (
                | PolymeshPrimitivesPortfolioFund
                | { description?: any; memo?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesIdentityIdPortfolioId,
          Vec<PolymeshPrimitivesPortfolioFund>
        ]
      >;
      /**
       * Pre-approves the receivement of an asset to a portfolio.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will be exempt from affirmation.
       * * `portfolio_id` - the [`PortfolioId`] that can receive `ticker` without affirmation.
       *
       * # Permissions
       * * Portfolio
       **/
      preApprovePortfolio: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          portfolioId:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityIdPortfolioId]
      >;
      /**
       * When called by the custodian of `portfolio_id`,
       * allows returning the custody of the portfolio to the portfolio owner unilaterally.
       *
       * # Errors
       * * `UnauthorizedCustodian` if the caller is not the current custodian of `portfolio_id`.
       *
       * # Permissions
       * * Portfolio
       **/
      quitPortfolioCustody: AugmentedSubmittable<
        (
          pid:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityIdPortfolioId]
      >;
      /**
       * Removes the pre approval of an asset to a portfolio.
       *
       * # Arguments
       * * `origin` - the secondary key of the sender.
       * * `ticker` - the [`Ticker`] that will be exempt from affirmation.
       * * `portfolio_id` - the [`PortfolioId`] that can receive `ticker` without affirmation.
       *
       * # Permissions
       * * Portfolio
       **/
      removePortfolioPreApproval: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          portfolioId:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, PolymeshPrimitivesIdentityIdPortfolioId]
      >;
      /**
       * Renames a non-default portfolio.
       *
       * # Errors
       * * `PortfolioDoesNotExist` if `num` doesn't reference a valid portfolio.
       *
       * # Permissions
       * * Portfolio
       **/
      renamePortfolio: AugmentedSubmittable<
        (
          num: u64 | AnyNumber | Uint8Array,
          toName: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Bytes]
      >;
      /**
       * Removes permission of an identity to create and take custody of a portfolio under the caller's identity.
       *
       * # Arguments
       * * `identity` - the [`IdentityId`] that will have the permissions to call `create_custody_portfolio` revoked.
       *
       **/
      revokeCreatePortfoliosPermission: AugmentedSubmittable<
        (
          identity: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
    };
    preimage: {
      /**
       * Register a preimage on-chain.
       *
       * If the preimage was previously requested, no fees or deposits are taken for providing
       * the preimage. Otherwise, a deposit is taken proportional to the size of the preimage.
       **/
      notePreimage: AugmentedSubmittable<
        (bytes: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Request a preimage be uploaded to the chain without paying any fees or deposits.
       *
       * If the preimage requests has already been provided on-chain, we unreserve any deposit
       * a user may have paid, and take the control of the preimage out of their hands.
       **/
      requestPreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
      /**
       * Clear an unrequested preimage from the runtime storage.
       *
       * If `len` is provided, then it will be a much cheaper operation.
       *
       * - `hash`: The hash of the preimage to be removed from the store.
       * - `len`: The length of the preimage of `hash`.
       **/
      unnotePreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
      /**
       * Clear a previously made request for a preimage.
       *
       * NOTE: THIS MUST NOT BE CALLED ON `hash` MORE TIMES THAN `request_preimage`.
       **/
      unrequestPreimage: AugmentedSubmittable<
        (hash: H256 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [H256]
      >;
    };
    protocolFee: {
      /**
       * Changes the a base fee for the root origin.
       *
       * # Errors
       * * `BadOrigin` - Only root allowed.
       **/
      changeBaseFee: AugmentedSubmittable<
        (
          op:
            | PolymeshCommonUtilitiesProtocolFeeProtocolOp
            | 'AssetRegisterTicker'
            | 'AssetIssue'
            | 'AssetAddDocuments'
            | 'AssetCreateAsset'
            | 'CheckpointCreateSchedule'
            | 'ComplianceManagerAddComplianceRequirement'
            | 'IdentityCddRegisterDid'
            | 'IdentityAddClaim'
            | 'IdentityAddSecondaryKeysWithAuthorization'
            | 'PipsPropose'
            | 'ContractsPutCode'
            | 'CorporateBallotAttachBallot'
            | 'CapitalDistributionDistribute'
            | 'NFTCreateCollection'
            | 'NFTMint'
            | 'IdentityCreateChildIdentity'
            | number
            | Uint8Array,
          baseFee: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshCommonUtilitiesProtocolFeeProtocolOp, u128]
      >;
      /**
       * Changes the fee coefficient for the root origin.
       *
       * # Errors
       * * `BadOrigin` - Only root allowed.
       **/
      changeCoefficient: AugmentedSubmittable<
        (coefficient: PolymeshPrimitivesPosRatio) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesPosRatio]
      >;
    };
    relayer: {
      /**
       * Accepts a `paying_key` authorization.
       *
       * # Arguments
       * - `auth_id` the authorization id to accept a `paying_key`.
       *
       * # Errors
       * - `AuthorizationError::Invalid` if `auth_id` does not exist for the given caller.
       * - `AuthorizationError::Expired` if `auth_id` the authorization has expired.
       * - `AuthorizationError::BadType` if `auth_id` was not a `AddRelayerPayingKey` authorization.
       * - `NotAuthorizedForUserKey` if `origin` is not authorized to accept the authorization for the `user_key`.
       * - `NotAuthorizedForPayingKey` if the authorization was created an identity different from the `paying_key`'s identity.
       * - `UserKeyCddMissing` if the `user_key` is not attached to a CDD'd identity.
       * - `PayingKeyCddMissing` if the `paying_key` is not attached to a CDD'd identity.
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       **/
      acceptPayingKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Decrease the available POLYX for a `user_key`.
       *
       * # Arguments
       * - `user_key` the user key of the subsidy to update the available POLYX.
       * - `amount` the amount of POLYX to remove from the subsidy of `user_key`.
       *
       * # Errors
       * - `NoPayingKey` if the `user_key` doesn't have a `paying_key`.
       * - `NotPayingKey` if `origin` doesn't match the current `paying_key`.
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       * - `Overlow` if the subsidy has less then `amount` POLYX remaining.
       **/
      decreasePolyxLimit: AugmentedSubmittable<
        (
          userKey: AccountId32 | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u128]
      >;
      /**
       * Increase the available POLYX for a `user_key`.
       *
       * # Arguments
       * - `user_key` the user key of the subsidy to update the available POLYX.
       * - `amount` the amount of POLYX to add to the subsidy of `user_key`.
       *
       * # Errors
       * - `NoPayingKey` if the `user_key` doesn't have a `paying_key`.
       * - `NotPayingKey` if `origin` doesn't match the current `paying_key`.
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       * - `Overlow` if the subsidy's remaining POLYX would have overflowed `u128::MAX`.
       **/
      increasePolyxLimit: AugmentedSubmittable<
        (
          userKey: AccountId32 | string | Uint8Array,
          amount: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u128]
      >;
      /**
       * Removes the `paying_key` from a `user_key`.
       *
       * # Arguments
       * - `user_key` the user key to remove the subsidy from.
       * - `paying_key` the paying key that was subsidising the `user_key`.
       *
       * # Errors
       * - `NotAuthorizedForUserKey` if `origin` is not authorized to remove the subsidy for the `user_key`.
       * - `NoPayingKey` if the `user_key` doesn't have a `paying_key`.
       * - `NotPayingKey` if the `paying_key` doesn't match the current `paying_key`.
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       **/
      removePayingKey: AugmentedSubmittable<
        (
          userKey: AccountId32 | string | Uint8Array,
          payingKey: AccountId32 | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, AccountId32]
      >;
      /**
       * Creates an authorization to allow `user_key` to accept the caller (`origin == paying_key`) as their subsidiser.
       *
       * # Arguments
       * - `user_key` the user key to subsidise.
       * - `polyx_limit` the initial POLYX limit for this subsidy.
       *
       * # Errors
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       **/
      setPayingKey: AugmentedSubmittable<
        (
          userKey: AccountId32 | string | Uint8Array,
          polyxLimit: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u128]
      >;
      /**
       * Updates the available POLYX for a `user_key`.
       *
       * # Arguments
       * - `user_key` the user key of the subsidy to update the available POLYX.
       * - `polyx_limit` the amount of POLYX available for subsidising the `user_key`.
       *
       * # Errors
       * - `NoPayingKey` if the `user_key` doesn't have a `paying_key`.
       * - `NotPayingKey` if `origin` doesn't match the current `paying_key`.
       * - `UnauthorizedCaller` if `origin` is not authorized to call this extrinsic.
       **/
      updatePolyxLimit: AugmentedSubmittable<
        (
          userKey: AccountId32 | string | Uint8Array,
          polyxLimit: u128 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, u128]
      >;
    };
    scheduler: {
      /**
       * Cancel an anonymously scheduled task.
       **/
      cancel: AugmentedSubmittable<
        (
          when: u32 | AnyNumber | Uint8Array,
          index: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Cancel a named scheduled task.
       **/
      cancelNamed: AugmentedSubmittable<
        (id: U8aFixed | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [U8aFixed]
      >;
      /**
       * Anonymously schedule a task.
       **/
      schedule: AugmentedSubmittable<
        (
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * Anonymously schedule a task after a delay.
       **/
      scheduleAfter: AugmentedSubmittable<
        (
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * Schedule a named task.
       **/
      scheduleNamed: AugmentedSubmittable<
        (
          id: U8aFixed | string | Uint8Array,
          when: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
      /**
       * Schedule a named task after a delay.
       **/
      scheduleNamedAfter: AugmentedSubmittable<
        (
          id: U8aFixed | string | Uint8Array,
          after: u32 | AnyNumber | Uint8Array,
          maybePeriodic:
            | Option<ITuple<[u32, u32]>>
            | null
            | Uint8Array
            | ITuple<[u32, u32]>
            | [u32 | AnyNumber | Uint8Array, u32 | AnyNumber | Uint8Array],
          priority: u8 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [U8aFixed, u32, Option<ITuple<[u32, u32]>>, u8, Call]
      >;
    };
    session: {
      /**
       * Removes any session key(s) of the function caller.
       *
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be Signed and the account must be either be
       * convertible to a validator ID using the chain's typical addressing system (this usually
       * means being a controller account) or directly convertible into a validator ID (which
       * usually means being a stash account).
       *
       * ## Complexity
       * - `O(1)` in number of key types. Actual cost depends on the number of length of
       * `T::Keys::key_ids()` which is fixed.
       **/
      purgeKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Sets the session key(s) of the function caller to `keys`.
       * Allows an account to set its session key prior to becoming a validator.
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be signed.
       *
       * ## Complexity
       * - `O(1)`. Actual cost depends on the number of length of `T::Keys::key_ids()` which is
       * fixed.
       **/
      setKeys: AugmentedSubmittable<
        (
          keys:
            | PolymeshPrivateRuntimeDevelopRuntimeSessionKeys
            | { grandpa?: any; babe?: any; imOnline?: any; authorityDiscovery?: any }
            | string
            | Uint8Array,
          proof: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrivateRuntimeDevelopRuntimeSessionKeys, Bytes]
      >;
    };
    settlement: {
      /**
       * Adds and affirms a new instruction.
       *
       * # Arguments
       * * `venue_id`: The [`VenueId`] of the venue this instruction belongs to.
       * * `settlement_type`: The [`SettlementType`] specifying when the instruction should be settled.
       * * `trade_date`: Optional date from which people can interact with this instruction.
       * * `value_date`: Optional date after which the instruction should be settled (not enforced).
       * * `legs`: A vector of all [`Leg`] included in this instruction.
       * * `portfolios`: A vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       * * `memo`: An optional [`Memo`] field for this instruction.
       *
       * # Permissions
       * * Portfolio
       **/
      addAndAffirmInstruction: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          settlementType:
            | PolymeshPrimitivesSettlementSettlementType
            | { SettleOnAffirmation: any }
            | { SettleOnBlock: any }
            | { SettleManual: any }
            | string
            | Uint8Array,
          tradeDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          valueDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          legs:
            | Vec<PolymeshPrimitivesSettlementLeg>
            | (
                | PolymeshPrimitivesSettlementLeg
                | { Fungible: any }
                | { NonFungible: any }
                | { OffChain: any }
                | string
                | Uint8Array
              )[],
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[],
          instructionMemo:
            | Option<PolymeshPrimitivesMemo>
            | null
            | Uint8Array
            | PolymeshPrimitivesMemo
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          PolymeshPrimitivesSettlementSettlementType,
          Option<u64>,
          Option<u64>,
          Vec<PolymeshPrimitivesSettlementLeg>,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesMemo>
        ]
      >;
      /**
       * Adds and affirms a new instruction with mediators.
       *
       * # Arguments
       * * `venue_id`: The [`VenueId`] of the venue this instruction belongs to.
       * * `settlement_type`: The [`SettlementType`] specifying when the instruction should be settled.
       * * `trade_date`: Optional date from which people can interact with this instruction.
       * * `value_date`: Optional date after which the instruction should be settled (not enforced).
       * * `legs`: A vector of all [`Leg`] included in this instruction.
       * * `portfolios`: A vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       * * `instruction_memo`: An optional [`Memo`] field for this instruction.
       * * `mediators`: A set of [`IdentityId`] of all the mandatory mediators for the instruction.
       *
       * # Permissions
       * * Portfolio
       **/
      addAndAffirmWithMediators: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          settlementType:
            | PolymeshPrimitivesSettlementSettlementType
            | { SettleOnAffirmation: any }
            | { SettleOnBlock: any }
            | { SettleManual: any }
            | string
            | Uint8Array,
          tradeDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          valueDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          legs:
            | Vec<PolymeshPrimitivesSettlementLeg>
            | (
                | PolymeshPrimitivesSettlementLeg
                | { Fungible: any }
                | { NonFungible: any }
                | { OffChain: any }
                | string
                | Uint8Array
              )[],
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[],
          instructionMemo:
            | Option<PolymeshPrimitivesMemo>
            | null
            | Uint8Array
            | PolymeshPrimitivesMemo
            | string,
          mediators: BTreeSet<PolymeshPrimitivesIdentityId>
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          PolymeshPrimitivesSettlementSettlementType,
          Option<u64>,
          Option<u64>,
          Vec<PolymeshPrimitivesSettlementLeg>,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesMemo>,
          BTreeSet<PolymeshPrimitivesIdentityId>
        ]
      >;
      /**
       * Adds a new instruction.
       *
       * # Arguments
       * * `venue_id`: The [`VenueId`] of the venue this instruction belongs to.
       * * `settlement_type`: The [`SettlementType`] specifying when the instruction should be settled.
       * * `trade_date`: Optional date from which people can interact with this instruction.
       * * `value_date`: Optional date after which the instruction should be settled (not enforced).
       * * `legs`: A vector of all [`Leg`] included in this instruction.
       * * `memo`: An optional [`Memo`] field for this instruction.
       **/
      addInstruction: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          settlementType:
            | PolymeshPrimitivesSettlementSettlementType
            | { SettleOnAffirmation: any }
            | { SettleOnBlock: any }
            | { SettleManual: any }
            | string
            | Uint8Array,
          tradeDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          valueDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          legs:
            | Vec<PolymeshPrimitivesSettlementLeg>
            | (
                | PolymeshPrimitivesSettlementLeg
                | { Fungible: any }
                | { NonFungible: any }
                | { OffChain: any }
                | string
                | Uint8Array
              )[],
          instructionMemo:
            | Option<PolymeshPrimitivesMemo>
            | null
            | Uint8Array
            | PolymeshPrimitivesMemo
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          PolymeshPrimitivesSettlementSettlementType,
          Option<u64>,
          Option<u64>,
          Vec<PolymeshPrimitivesSettlementLeg>,
          Option<PolymeshPrimitivesMemo>
        ]
      >;
      /**
       * Adds a new instruction with mediators.
       *
       * # Arguments
       * * `venue_id`: The [`VenueId`] of the venue this instruction belongs to.
       * * `settlement_type`: The [`SettlementType`] specifying when the instruction should be settled.
       * * `trade_date`: Optional date from which people can interact with this instruction.
       * * `value_date`: Optional date after which the instruction should be settled (not enforced).
       * * `legs`: A vector of all [`Leg`] included in this instruction.
       * * `instruction_memo`: An optional [`Memo`] field for this instruction.
       * * `mediators`: A set of [`IdentityId`] of all the mandatory mediators for the instruction.
       **/
      addInstructionWithMediators: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          settlementType:
            | PolymeshPrimitivesSettlementSettlementType
            | { SettleOnAffirmation: any }
            | { SettleOnBlock: any }
            | { SettleManual: any }
            | string
            | Uint8Array,
          tradeDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          valueDate: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          legs:
            | Vec<PolymeshPrimitivesSettlementLeg>
            | (
                | PolymeshPrimitivesSettlementLeg
                | { Fungible: any }
                | { NonFungible: any }
                | { OffChain: any }
                | string
                | Uint8Array
              )[],
          instructionMemo:
            | Option<PolymeshPrimitivesMemo>
            | null
            | Uint8Array
            | PolymeshPrimitivesMemo
            | string,
          mediators: BTreeSet<PolymeshPrimitivesIdentityId>
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          PolymeshPrimitivesSettlementSettlementType,
          Option<u64>,
          Option<u64>,
          Vec<PolymeshPrimitivesSettlementLeg>,
          Option<PolymeshPrimitivesMemo>,
          BTreeSet<PolymeshPrimitivesIdentityId>
        ]
      >;
      /**
       * Provide affirmation to an existing instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being affirmed.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       *
       * # Permissions
       * * Portfolio
       **/
      affirmInstruction: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Vec<PolymeshPrimitivesIdentityIdPortfolioId>]
      >;
      /**
       * Affirms the instruction as a mediator - should only be called by mediators, otherwise it will fail.
       *
       * # Arguments
       * * `origin`: The secondary key of the sender.
       * * `instruction_id`: The [`InstructionId`] that will be affirmed by the mediator.
       * * `expiry`: An Optional value for defining when the affirmation will expire (None means it will always be valid).
       **/
      affirmInstructionAsMediator: AugmentedSubmittable<
        (
          instructionId: u64 | AnyNumber | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Option<u64>]
      >;
      /**
       * Provide affirmation to an existing instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being affirmed.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       * * `number_of_assets` - an optional [`AffirmationCount`] that will be used for a precise fee estimation before executing the extrinsic.
       *
       * Note: calling the rpc method `get_affirmation_count` returns an instance of [`AffirmationCount`].
       *
       * # Permissions
       * * Portfolio
       **/
      affirmInstructionWithCount: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[],
          numberOfAssets:
            | Option<PolymeshPrimitivesSettlementAffirmationCount>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementAffirmationCount
            | { senderAssetCount?: any; receiverAssetCount?: any; offchainCount?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesSettlementAffirmationCount>
        ]
      >;
      /**
       * Affirms an instruction using receipts for offchain transfers.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being affirmed.
       * * `receipt_details` - a vector of [`ReceiptDetails`], which contain the details about the offchain transfer.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       *
       * # Permissions
       * * Portfolio
       **/
      affirmWithReceipts: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          receiptDetails:
            | Vec<PolymeshPrimitivesSettlementReceiptDetails>
            | (
                | PolymeshPrimitivesSettlementReceiptDetails
                | {
                    uid?: any;
                    instructionId?: any;
                    legId?: any;
                    signer?: any;
                    signature?: any;
                    metadata?: any;
                  }
                | string
                | Uint8Array
              )[],
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          Vec<PolymeshPrimitivesSettlementReceiptDetails>,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>
        ]
      >;
      /**
       * Affirms an instruction using receipts for offchain transfers.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being affirmed.
       * * `receipt_details` - a vector of [`ReceiptDetails`], which contain the details about the offchain transfer.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation.
       * * `number_of_assets` - an optional [`AffirmationCount`] that will be used for a precise fee estimation before executing the extrinsic.
       *
       * Note: calling the rpc method `get_affirmation_count` returns an instance of [`AffirmationCount`].
       *
       * # Permissions
       * * Portfolio
       **/
      affirmWithReceiptsWithCount: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          receiptDetails:
            | Vec<PolymeshPrimitivesSettlementReceiptDetails>
            | (
                | PolymeshPrimitivesSettlementReceiptDetails
                | {
                    uid?: any;
                    instructionId?: any;
                    legId?: any;
                    signer?: any;
                    signature?: any;
                    metadata?: any;
                  }
                | string
                | Uint8Array
              )[],
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[],
          numberOfAssets:
            | Option<PolymeshPrimitivesSettlementAffirmationCount>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementAffirmationCount
            | { senderAssetCount?: any; receiverAssetCount?: any; offchainCount?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          Vec<PolymeshPrimitivesSettlementReceiptDetails>,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesSettlementAffirmationCount>
        ]
      >;
      /**
       * Allows additional venues to create instructions involving an asset.
       *
       * * `ticker` - Ticker of the token in question.
       * * `venues` - Array of venues that are allowed to create instructions for the token in question.
       *
       * # Permissions
       * * Asset
       **/
      allowVenues: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Vec<u64>]
      >;
      /**
       * Registers a new venue.
       *
       * * `details` - Extra details about a venue
       * * `signers` - Array of signers that are allowed to sign receipts for this venue
       * * `typ` - Type of venue being created
       **/
      createVenue: AugmentedSubmittable<
        (
          details: Bytes | string | Uint8Array,
          signers: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          typ:
            | PolymeshPrimitivesSettlementVenueType
            | 'Other'
            | 'Distribution'
            | 'Sto'
            | 'Exchange'
            | number
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, Vec<AccountId32>, PolymeshPrimitivesSettlementVenueType]
      >;
      /**
       * Revokes permission given to venues for creating instructions involving a particular asset.
       *
       * * `ticker` - Ticker of the token in question.
       * * `venues` - Array of venues that are no longer allowed to create instructions for the token in question.
       *
       * # Permissions
       * * Asset
       **/
      disallowVenues: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, Vec<u64>]
      >;
      /**
       * Manually executes an instruction.
       *
       * # Arguments
       * * `id`: The [`InstructionId`] of the instruction to be executed.
       * * `portfolio`:  One of the caller's [`PortfolioId`] which is also a counter patry in the instruction.
       * If None, the caller must be the venue creator or a counter party in a [`Leg::OffChain`].
       * * `fungible_transfers`: The number of fungible legs in the instruction.
       * * `nfts_transfers`: The number of nfts being transferred in the instruction.
       * * `offchain_transfers`: The number of offchain legs in the instruction.
       * * `weight_limit`: An optional maximum [`Weight`] value to be charged for executing the instruction.
       * If the `weight_limit` is less than the required amount, the instruction will fail execution.
       *
       * Note: calling the rpc method `get_execute_instruction_info` returns an instance of [`ExecuteInstructionInfo`], which contains the count parameters.
       **/
      executeManualInstruction: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolio:
            | Option<PolymeshPrimitivesIdentityIdPortfolioId>
            | null
            | Uint8Array
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string,
          fungibleTransfers: u32 | AnyNumber | Uint8Array,
          nftsTransfers: u32 | AnyNumber | Uint8Array,
          offchainTransfers: u32 | AnyNumber | Uint8Array,
          weightLimit:
            | Option<SpWeightsWeightV2Weight>
            | null
            | Uint8Array
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          Option<PolymeshPrimitivesIdentityIdPortfolioId>,
          u32,
          u32,
          u32,
          Option<SpWeightsWeightV2Weight>
        ]
      >;
      //Removed in 6.0
      rescheduleInstruction: AugmentedSubmittable<
        (id: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;

      /**
       * Root callable extrinsic, used as an internal call to execute a scheduled settlement instruction.
       **/
      executeScheduledInstruction: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          weightLimit:
            | SpWeightsWeightV2Weight
            | { refTime?: any; proofSize?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, SpWeightsWeightV2Weight]
      >;
      /**
       * Rejects an existing instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being rejected.
       * * `portfolio` - the [`PortfolioId`] that belongs to the instruction and is rejecting it.
       *
       * # Permissions
       * * Portfolio
       **/
      rejectInstruction: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, PolymeshPrimitivesIdentityIdPortfolioId]
      >;
      /**
       * Rejects an existing instruction - should only be called by mediators, otherwise it will fail.
       *
       * # Arguments
       * * `instruction_id` - the [`InstructionId`] of the instruction being rejected.
       * * `number_of_assets` - an optional [`AssetCount`] that will be used for a precise fee estimation before executing the extrinsic.
       *
       * Note: calling the rpc method `get_execute_instruction_info` returns an instance of [`ExecuteInstructionInfo`], which contain the asset count.
       **/
      rejectInstructionAsMediator: AugmentedSubmittable<
        (
          instructionId: u64 | AnyNumber | Uint8Array,
          numberOfAssets:
            | Option<PolymeshPrimitivesSettlementAssetCount>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementAssetCount
            | { fungible?: any; nonFungible?: any; offChain?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Option<PolymeshPrimitivesSettlementAssetCount>]
      >;
      /**
       * Rejects an existing instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction being rejected.
       * * `portfolio` - the [`PortfolioId`] that belongs to the instruction and is rejecting it.
       * * `number_of_assets` - an optional [`AssetCount`] that will be used for a precise fee estimation before executing the extrinsic.
       *
       * Note: calling the rpc method `get_execute_instruction_info` returns an instance of [`ExecuteInstructionInfo`], which contain the asset count.
       *
       * # Permissions
       * * Portfolio
       **/
      rejectInstructionWithCount: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          numberOfAssets:
            | Option<PolymeshPrimitivesSettlementAssetCount>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementAssetCount
            | { fungible?: any; nonFungible?: any; offChain?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          PolymeshPrimitivesIdentityIdPortfolioId,
          Option<PolymeshPrimitivesSettlementAssetCount>
        ]
      >;
      /**
       * Enables or disabled venue filtering for a token.
       *
       * # Arguments
       * * `ticker` - Ticker of the token in question.
       * * `enabled` - Boolean that decides if the filtering should be enabled.
       *
       * # Permissions
       * * Asset
       **/
      setVenueFiltering: AugmentedSubmittable<
        (
          ticker: PolymeshPrimitivesTicker | string | Uint8Array,
          enabled: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, bool]
      >;
      /**
       * Edit a venue's details.
       *
       * * `id` specifies the ID of the venue to edit.
       * * `details` specifies the updated venue details.
       **/
      updateVenueDetails: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          details: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Bytes]
      >;
      /**
       * Edit a venue's signers.
       * * `id` specifies the ID of the venue to edit.
       * * `signers` specifies the signers to add/remove.
       * * `add_signers` specifies the update type add/remove of venue where add is true and remove is false.
       **/
      updateVenueSigners: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          signers: Vec<AccountId32> | (AccountId32 | string | Uint8Array)[],
          addSigners: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Vec<AccountId32>, bool]
      >;
      /**
       * Edit a venue's type.
       *
       * * `id` specifies the ID of the venue to edit.
       * * `type` specifies the new type of the venue.
       **/
      updateVenueType: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          typ:
            | PolymeshPrimitivesSettlementVenueType
            | 'Other'
            | 'Distribution'
            | 'Sto'
            | 'Exchange'
            | number
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u64, PolymeshPrimitivesSettlementVenueType]
      >;
      /**
       * Withdraw an affirmation for a given instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction getting an affirmation withdrawn.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation withdrawal.
       *
       * # Permissions
       * * Portfolio
       **/
      withdrawAffirmation: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [u64, Vec<PolymeshPrimitivesIdentityIdPortfolioId>]
      >;
      /**
       * Removes the mediator's affirmation for the instruction - should only be called by mediators, otherwise it will fail.
       *
       * # Arguments
       * * `origin`: The secondary key of the sender.
       * * `instruction_id`: The [`InstructionId`] that will have the affirmation removed.
       **/
      withdrawAffirmationAsMediator: AugmentedSubmittable<
        (instructionId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Withdraw an affirmation for a given instruction.
       *
       * # Arguments
       * * `id` - the [`InstructionId`] of the instruction getting an affirmation withdrawn.
       * * `portfolios` - a vector of [`PortfolioId`] under the caller's control and intended for affirmation withdrawal.
       * * `number_of_assets` - an optional [`AffirmationCount`] that will be used for a precise fee estimation before executing the extrinsic.
       *
       * Note: calling the rpc method `get_affirmation_count` returns an instance of [`AffirmationCount`].
       *
       * # Permissions
       * * Portfolio
       **/
      withdrawAffirmationWithCount: AugmentedSubmittable<
        (
          id: u64 | AnyNumber | Uint8Array,
          portfolios:
            | Vec<PolymeshPrimitivesIdentityIdPortfolioId>
            | (
                | PolymeshPrimitivesIdentityIdPortfolioId
                | { did?: any; kind?: any }
                | string
                | Uint8Array
              )[],
          numberOfAssets:
            | Option<PolymeshPrimitivesSettlementAffirmationCount>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementAffirmationCount
            | { senderAssetCount?: any; receiverAssetCount?: any; offchainCount?: any }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          u64,
          Vec<PolymeshPrimitivesIdentityIdPortfolioId>,
          Option<PolymeshPrimitivesSettlementAffirmationCount>
        ]
      >;
    };
    statistics: {
      /**
       * Allow a trusted issuer to init/resync ticker/company stats.
       *
       * # Arguments
       * - `origin` - a signer that has permissions to act as an agent of `asset`.
       * - `asset` - the asset to change the active stats on.
       * - `stat_type` - stat type to update.
       * - `values` - Updated values for `stat_type`.
       *
       * # Errors
       * - `StatTypeMissing` - `stat_type` is not enabled for the `asset`.
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `asset`.
       *
       * # Permissions
       * - Agent
       * - Asset
       **/
      batchUpdateAssetStats: AugmentedSubmittable<
        (
          asset: PolymeshPrimitivesStatisticsAssetScope | { Ticker: any } | string | Uint8Array,
          statType:
            | PolymeshPrimitivesStatisticsStatType
            | { op?: any; claimIssuer?: any }
            | string
            | Uint8Array,
          values: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesStatisticsAssetScope,
          PolymeshPrimitivesStatisticsStatType,
          BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
        ]
      >;
      /**
       * Set the active asset stat_types.
       *
       * # Arguments
       * - `origin` - a signer that has permissions to act as an agent of `asset`.
       * - `asset` - the asset to change the active stats on.
       * - `stat_types` - the new stat types to replace any existing types.
       *
       * # Errors
       * - `StatTypeLimitReached` - too many stat types enabled for the `asset`.
       * - `CannotRemoveStatTypeInUse` - can not remove a stat type that is in use by transfer conditions.
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `asset`.
       *
       * # Permissions
       * - Agent
       * - Asset
       **/
      setActiveAssetStats: AugmentedSubmittable<
        (
          asset: PolymeshPrimitivesStatisticsAssetScope | { Ticker: any } | string | Uint8Array,
          statTypes: BTreeSet<PolymeshPrimitivesStatisticsStatType>
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesStatisticsAssetScope, BTreeSet<PolymeshPrimitivesStatisticsStatType>]
      >;
      /**
       * Set asset transfer compliance rules.
       *
       * # Arguments
       * - `origin` - a signer that has permissions to act as an agent of `asset`.
       * - `asset` - the asset to change the active stats on.
       * - `transfer_conditions` - the new transfer condition to replace any existing conditions.
       *
       * # Errors
       * - `TransferConditionLimitReached` - too many transfer condititon enabled for `asset`.
       * - `StatTypeMissing` - a transfer condition requires a stat type that is not enabled for the `asset`.
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `asset`.
       *
       * # Permissions
       * - Agent
       * - Asset
       **/
      setAssetTransferCompliance: AugmentedSubmittable<
        (
          asset: PolymeshPrimitivesStatisticsAssetScope | { Ticker: any } | string | Uint8Array,
          transferConditions: BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesStatisticsAssetScope,
          BTreeSet<PolymeshPrimitivesTransferComplianceTransferCondition>
        ]
      >;
      /**
       * Set/unset entities exempt from an asset's transfer compliance rules.
       *
       * # Arguments
       * - `origin` - a signer that has permissions to act as an agent of `exempt_key.asset`.
       * - `is_exempt` - enable/disable exemption for `entities`.
       * - `exempt_key` - the asset and stat type to exempt the `entities` from.
       * - `entities` - the entities to set/unset the exemption for.
       *
       * # Errors
       * - `UnauthorizedAgent` if `origin` is not agent-permissioned for `asset`.
       *
       * # Permissions
       * - Agent
       * - Asset
       **/
      setEntitiesExempt: AugmentedSubmittable<
        (
          isExempt: bool | boolean | Uint8Array,
          exemptKey:
            | PolymeshPrimitivesTransferComplianceTransferConditionExemptKey
            | { asset?: any; op?: any; claimType?: any }
            | string
            | Uint8Array,
          entities: BTreeSet<PolymeshPrimitivesIdentityId>
        ) => SubmittableExtrinsic<ApiType>,
        [
          bool,
          PolymeshPrimitivesTransferComplianceTransferConditionExemptKey,
          BTreeSet<PolymeshPrimitivesIdentityId>
        ]
      >;
    };
    sto: {
      /**
       * Create a new fundraiser.
       *
       * * `offering_portfolio` - Portfolio containing the `offering_asset`.
       * * `offering_asset` - Asset being offered.
       * * `raising_portfolio` - Portfolio containing the `raising_asset`.
       * * `raising_asset` - Asset being exchanged for `offering_asset` on investment.
       * * `tiers` - Price tiers to charge investors on investment.
       * * `venue_id` - Venue to handle settlement.
       * * `start` - Fundraiser start time, if `None` the fundraiser will start immediately.
       * * `end` - Fundraiser end time, if `None` the fundraiser will never expire.
       * * `minimum_investment` - Minimum amount of `raising_asset` that an investor needs to spend to invest in this raise.
       * * `fundraiser_name` - Fundraiser name, only used in the UIs.
       *
       * # Permissions
       * * Asset
       * * Portfolio
       **/
      createFundraiser: AugmentedSubmittable<
        (
          offeringPortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          raisingPortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          raisingAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          tiers:
            | Vec<PalletStoPriceTier>
            | (PalletStoPriceTier | { total?: any; price?: any } | string | Uint8Array)[],
          venueId: u64 | AnyNumber | Uint8Array,
          start: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          end: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          minimumInvestment: u128 | AnyNumber | Uint8Array,
          fundraiserName: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesTicker,
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesTicker,
          Vec<PalletStoPriceTier>,
          u64,
          Option<u64>,
          Option<u64>,
          u128,
          Bytes
        ]
      >;
      /**
       * Freeze a fundraiser.
       *
       * * `offering_asset` - Asset to freeze.
       * * `id` - ID of the fundraiser to freeze.
       *
       * # Permissions
       * * Asset
       **/
      freezeFundraiser: AugmentedSubmittable<
        (
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64]
      >;
      /**
       * Invest in a fundraiser.
       *
       * * `investment_portfolio` - Portfolio that `offering_asset` will be deposited in.
       * * `funding_portfolio` - Portfolio that will fund the investment.
       * * `offering_asset` - Asset to invest in.
       * * `id` - ID of the fundraiser to invest in.
       * * `purchase_amount` - Amount of `offering_asset` to purchase.
       * * `max_price` - Maximum price to pay per unit of `offering_asset`, If `None`there are no constraints on price.
       * * `receipt` - Off-chain receipt to use instead of on-chain balance in `funding_portfolio`.
       *
       * # Permissions
       * * Portfolio
       **/
      invest: AugmentedSubmittable<
        (
          investmentPortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          fundingPortfolio:
            | PolymeshPrimitivesIdentityIdPortfolioId
            | { did?: any; kind?: any }
            | string
            | Uint8Array,
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array,
          purchaseAmount: u128 | AnyNumber | Uint8Array,
          maxPrice: Option<u128> | null | Uint8Array | u128 | AnyNumber,
          receipt:
            | Option<PolymeshPrimitivesSettlementReceiptDetails>
            | null
            | Uint8Array
            | PolymeshPrimitivesSettlementReceiptDetails
            | {
                uid?: any;
                instructionId?: any;
                legId?: any;
                signer?: any;
                signature?: any;
                metadata?: any;
              }
            | string
        ) => SubmittableExtrinsic<ApiType>,
        [
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesIdentityIdPortfolioId,
          PolymeshPrimitivesTicker,
          u64,
          u128,
          Option<u128>,
          Option<PolymeshPrimitivesSettlementReceiptDetails>
        ]
      >;
      /**
       * Modify the time window a fundraiser is active
       *
       * * `offering_asset` - Asset to modify.
       * * `id` - ID of the fundraiser to modify.
       * * `start` - New start of the fundraiser.
       * * `end` - New end of the fundraiser to modify.
       *
       * # Permissions
       * * Asset
       **/
      modifyFundraiserWindow: AugmentedSubmittable<
        (
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array,
          start: u64 | AnyNumber | Uint8Array,
          end: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64, u64, Option<u64>]
      >;
      /**
       * Stop a fundraiser.
       *
       * * `offering_asset` - Asset to stop.
       * * `id` - ID of the fundraiser to stop.
       *
       * # Permissions
       * * Asset
       **/
      stop: AugmentedSubmittable<
        (
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64]
      >;
      /**
       * Unfreeze a fundraiser.
       *
       * * `offering_asset` - Asset to unfreeze.
       * * `id` - ID of the fundraiser to unfreeze.
       *
       * # Permissions
       * * Asset
       **/
      unfreezeFundraiser: AugmentedSubmittable<
        (
          offeringAsset: PolymeshPrimitivesTicker | string | Uint8Array,
          id: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesTicker, u64]
      >;
    };
    sudo: {
      /**
       * Authenticates the current sudo key and sets the given AccountId (`new`) as the new sudo key.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB change.
       * # </weight>
       **/
      setKey: AugmentedSubmittable<
        (
          updated:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB write (event).
       * - Weight of derivative `call` execution + 10,000.
       * # </weight>
       **/
      sudo: AugmentedSubmittable<
        (call: Call | IMethod | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Call]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Signed` origin from
       * a given account.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * # <weight>
       * - O(1).
       * - Limited storage reads.
       * - One DB write (event).
       * - Weight of derivative `call` execution + 10,000.
       * # </weight>
       **/
      sudoAs: AugmentedSubmittable<
        (
          who:
            | MultiAddress
            | { Id: any }
            | { Index: any }
            | { Raw: any }
            | { Address32: any }
            | { Address20: any }
            | string
            | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [MultiAddress, Call]
      >;
      /**
       * Authenticates the sudo key and dispatches a function call with `Root` origin.
       * This function does not check the weight of the call, and instead allows the
       * Sudo user to specify the weight of the call.
       *
       * The dispatch origin for this call must be _Signed_.
       *
       * # <weight>
       * - O(1).
       * - The weight of this call is defined by the caller.
       * # </weight>
       **/
      sudoUncheckedWeight: AugmentedSubmittable<
        (
          call: Call | IMethod | string | Uint8Array,
          weight: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Call, SpWeightsWeightV2Weight]
      >;
    };
    system: {
      /**
       * Kill all storage items with a key that starts with the given prefix.
       *
       * **NOTE:** We rely on the Root origin to provide us the number of subkeys under
       * the prefix we are removing to accurately calculate the weight of this function.
       **/
      killPrefix: AugmentedSubmittable<
        (
          prefix: Bytes | string | Uint8Array,
          subkeys: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Bytes, u32]
      >;
      /**
       * Kill some items from storage.
       **/
      killStorage: AugmentedSubmittable<
        (keys: Vec<Bytes> | (Bytes | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>,
        [Vec<Bytes>]
      >;
      /**
       * Make some on-chain remark.
       *
       * ## Complexity
       * - `O(1)`
       **/
      remark: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Make some on-chain remark and emit event.
       **/
      remarkWithEvent: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the new runtime code.
       *
       * ## Complexity
       * - `O(C + S)` where `C` length of `code` and `S` complexity of `can_set_code`
       **/
      setCode: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the new runtime code without doing any checks of the given `code`.
       *
       * ## Complexity
       * - `O(C)` where `C` length of `code`
       **/
      setCodeWithoutChecks: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Bytes]
      >;
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       **/
      setHeapPages: AugmentedSubmittable<
        (pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u64]
      >;
      /**
       * Set some items of storage.
       **/
      setStorage: AugmentedSubmittable<
        (
          items:
            | Vec<ITuple<[Bytes, Bytes]>>
            | [Bytes | string | Uint8Array, Bytes | string | Uint8Array][]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<ITuple<[Bytes, Bytes]>>]
      >;
    };
    technicalCommittee: {
      /**
       * Changes the time after which a proposal expires.
       *
       * # Arguments
       * * `expiry` - The new expiry time.
       **/
      setExpiresAfter: AugmentedSubmittable<
        (
          expiry:
            | PolymeshCommonUtilitiesMaybeBlock
            | { Some: any }
            | { None: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshCommonUtilitiesMaybeBlock]
      >;
      /**
       * Changes the release coordinator.
       *
       * # Arguments
       * * `id` - The DID of the new release coordinator.
       *
       * # Errors
       * * `NotAMember`, If the new coordinator `id` is not part of the committee.
       **/
      setReleaseCoordinator: AugmentedSubmittable<
        (id: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Change the vote threshold the determines the winning proposal.
       * For e.g., for a simple majority use (1, 2) which represents the in-equation ">= 1/2".
       *
       * # Arguments
       * * `n` - Numerator of the fraction representing vote threshold.
       * * `d` - Denominator of the fraction representing vote threshold.
       **/
      setVoteThreshold: AugmentedSubmittable<
        (
          n: u32 | AnyNumber | Uint8Array,
          d: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Votes `approve`ingly (or not, if `false`)
       * on an existing `proposal` given by its hash, `index`.
       *
       * # Arguments
       * * `proposal` - A hash of the proposal to be voted on.
       * * `index` - The proposal index.
       * * `approve` - If `true` than this is a `for` vote, and `against` otherwise.
       *
       * # Errors
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [H256, u32, bool]
      >;
      /**
       * Proposes to the committee that `call` should be executed in its name.
       * Alternatively, if the hash of `call` has already been recorded, i.e., already proposed,
       * then this call counts as a vote, i.e., as if `vote_by_hash` was called.
       *
       * # Weight
       *
       * The weight of this dispatchable is that of `call` as well as the complexity
       * for recording the vote itself.
       *
       * # Arguments
       * * `approve` - is this an approving vote?
       * If the proposal doesn't exist, passing `false` will result in error `FirstVoteReject`.
       * * `call` - the call to propose for execution.
       *
       * # Errors
       * * `FirstVoteReject`, if `call` hasn't been proposed and `approve == false`.
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      voteOrPropose: AugmentedSubmittable<
        (
          approve: bool | boolean | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [bool, Call]
      >;
    };
    technicalCommitteeMembership: {
      /**
       * Allows the calling member to *unilaterally quit* without this being subject to a GC
       * vote.
       *
       * # Arguments
       * * `origin` - Member of committee who wants to quit.
       *
       * # Error
       *
       * * Only primary key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Disables a member at specific moment.
       *
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       *
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       *
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       *
       * # Arguments
       * * `at` - Revocation time-stamp.
       * * `who` - Target member of the group.
       * * `expiry` - Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: PolymeshPrimitivesIdentityId | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          at: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, Option<u64>, Option<u64>]
      >;
      /**
       * Removes a member `who` from the set. May only be called from `RemoveOrigin` or root.
       *
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.  In case you want to keep the validity of generated
       * claims, you have to use `Self::disable_member` function
       *
       * # Arguments
       * * `origin` - Origin representing `RemoveOrigin` or root
       * * `who` - IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Changes the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `ResetOrigin` or root
       * * `members` - New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members:
            | Vec<PolymeshPrimitivesIdentityId>
            | (PolymeshPrimitivesIdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Change this group's limit for how many concurrent active members they may be.
       *
       * # Arguments
       * * `limit` - the number of active members there may be concurrently.
       **/
      setActiveMembersLimit: AugmentedSubmittable<
        (limit: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Swaps out one member `remove` for another member `add`.
       *
       * May only be called from `SwapOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `SwapOrigin` or root
       * * `remove` - IdentityId to be removed from the group.
       * * `add` - IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: PolymeshPrimitivesIdentityId | string | Uint8Array,
          add: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityId]
      >;
    };
    testUtils: {
      /**
       * Emits an event with caller's identity and CDD status.
       **/
      getCddOf: AugmentedSubmittable<
        (of: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Emits an event with caller's identity.
       **/
      getMyDid: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Registers a new Identity for the `target_account` and issues a CDD claim to it.
       *
       * # Failure
       * - `origin` has to be an active CDD provider. Inactive CDD providers cannot add new
       * claims.
       * - `target_account` (primary key of the new Identity) can be linked to just one and only
       * one identity.
       **/
      mockCddRegisterDid: AugmentedSubmittable<
        (targetAccount: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Generates a new `IdentityID` for the caller, and issues a self-generated CDD claim.
       *
       * The caller account will be the primary key of that identity.
       * For each account of `secondary_keys`, a new `JoinIdentity` authorization is created, so
       * each of them will need to accept it before become part of this new `IdentityID`.
       *
       * # Errors
       * - `AlreadyLinked` if the caller account or if any of the given `secondary_keys` has already linked to an `IdentityID`
       * - `SecondaryKeysContainPrimaryKey` if `secondary_keys` contains the caller account.
       * - `DidAlreadyExists` if auto-generated DID already exists.
       **/
      registerDid: AugmentedSubmittable<
        (
          secondaryKeys:
            | Vec<PolymeshPrimitivesSecondaryKey>
            | (
                | PolymeshPrimitivesSecondaryKey
                | { key?: any; permissions?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesSecondaryKey>]
      >;
    };
    timestamp: {
      /**
       * Set the current time.
       *
       * This call should be invoked exactly once per block. It will panic at the finalization
       * phase, if this call hasn't been invoked by that time.
       *
       * The timestamp should be greater than the previous one by the amount specified by
       * `MinimumPeriod`.
       *
       * The dispatch origin for this call must be `Inherent`.
       *
       * ## Complexity
       * - `O(1)` (Note that implementations of `OnTimestampSet` must also be `O(1)`)
       * - 1 storage read and 1 storage mutation (codec `O(1)`). (because of `DidUpdate::take` in
       * `on_finalize`)
       * - 1 event handler `on_timestamp_set`. Must be `O(1)`.
       **/
      set: AugmentedSubmittable<
        (now: Compact<u64> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [Compact<u64>]
      >;
    };
    treasury: {
      /**
       * It transfers balances from treasury to each of beneficiaries and the specific amount
       * for each of them.
       *
       * # Error
       * * `BadOrigin`: Only root can execute transaction.
       * * `InsufficientBalance`: If treasury balances is not enough to cover all beneficiaries.
       * * `InvalidIdentity`: If one of the beneficiaries has an invalid identity.
       **/
      disbursement: AugmentedSubmittable<
        (
          beneficiaries:
            | Vec<PolymeshPrimitivesBeneficiary>
            | (PolymeshPrimitivesBeneficiary | { id?: any; amount?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesBeneficiary>]
      >;
      /**
       * It transfers the specific `amount` from `origin` account into treasury.
       *
       * Only accounts which are associated to an identity can make a donation to treasury.
       **/
      reimbursement: AugmentedSubmittable<
        (amount: u128 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u128]
      >;
    };
    upgradeCommittee: {
      /**
       * Changes the time after which a proposal expires.
       *
       * # Arguments
       * * `expiry` - The new expiry time.
       **/
      setExpiresAfter: AugmentedSubmittable<
        (
          expiry:
            | PolymeshCommonUtilitiesMaybeBlock
            | { Some: any }
            | { None: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshCommonUtilitiesMaybeBlock]
      >;
      /**
       * Changes the release coordinator.
       *
       * # Arguments
       * * `id` - The DID of the new release coordinator.
       *
       * # Errors
       * * `NotAMember`, If the new coordinator `id` is not part of the committee.
       **/
      setReleaseCoordinator: AugmentedSubmittable<
        (id: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Change the vote threshold the determines the winning proposal.
       * For e.g., for a simple majority use (1, 2) which represents the in-equation ">= 1/2".
       *
       * # Arguments
       * * `n` - Numerator of the fraction representing vote threshold.
       * * `d` - Denominator of the fraction representing vote threshold.
       **/
      setVoteThreshold: AugmentedSubmittable<
        (
          n: u32 | AnyNumber | Uint8Array,
          d: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u32, u32]
      >;
      /**
       * Votes `approve`ingly (or not, if `false`)
       * on an existing `proposal` given by its hash, `index`.
       *
       * # Arguments
       * * `proposal` - A hash of the proposal to be voted on.
       * * `index` - The proposal index.
       * * `approve` - If `true` than this is a `for` vote, and `against` otherwise.
       *
       * # Errors
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      vote: AugmentedSubmittable<
        (
          proposal: H256 | string | Uint8Array,
          index: u32 | AnyNumber | Uint8Array,
          approve: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [H256, u32, bool]
      >;
      /**
       * Proposes to the committee that `call` should be executed in its name.
       * Alternatively, if the hash of `call` has already been recorded, i.e., already proposed,
       * then this call counts as a vote, i.e., as if `vote_by_hash` was called.
       *
       * # Weight
       *
       * The weight of this dispatchable is that of `call` as well as the complexity
       * for recording the vote itself.
       *
       * # Arguments
       * * `approve` - is this an approving vote?
       * If the proposal doesn't exist, passing `false` will result in error `FirstVoteReject`.
       * * `call` - the call to propose for execution.
       *
       * # Errors
       * * `FirstVoteReject`, if `call` hasn't been proposed and `approve == false`.
       * * `NotAMember`, if the `origin` is not a member of this committee.
       **/
      voteOrPropose: AugmentedSubmittable<
        (
          approve: bool | boolean | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [bool, Call]
      >;
    };
    upgradeCommitteeMembership: {
      /**
       * Allows the calling member to *unilaterally quit* without this being subject to a GC
       * vote.
       *
       * # Arguments
       * * `origin` - Member of committee who wants to quit.
       *
       * # Error
       *
       * * Only primary key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>, []>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Disables a member at specific moment.
       *
       * Please note that if member is already revoked (a "valid member"), its revocation
       * time-stamp will be updated.
       *
       * Any disabled member should NOT allow to act like an active member of the group. For
       * instance, a disabled CDD member should NOT be able to generate a CDD claim. However any
       * generated claim issued before `at` would be considered as a valid one.
       *
       * If you want to invalidate any generated claim, you should use `Self::remove_member`.
       *
       * # Arguments
       * * `at` - Revocation time-stamp.
       * * `who` - Target member of the group.
       * * `expiry` - Time-stamp when `who` is removed from CDD. As soon as it is expired, the
       * generated claims will be "invalid" as `who` is not considered a member of the group.
       **/
      disableMember: AugmentedSubmittable<
        (
          who: PolymeshPrimitivesIdentityId | string | Uint8Array,
          expiry: Option<u64> | null | Uint8Array | u64 | AnyNumber,
          at: Option<u64> | null | Uint8Array | u64 | AnyNumber
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, Option<u64>, Option<u64>]
      >;
      /**
       * Removes a member `who` from the set. May only be called from `RemoveOrigin` or root.
       *
       * Any claim previously generated by this member is not valid as a group claim. For
       * instance, if a CDD member group generated a claim for a target identity and then it is
       * removed, that claim will be invalid.  In case you want to keep the validity of generated
       * claims, you have to use `Self::disable_member` function
       *
       * # Arguments
       * * `origin` - Origin representing `RemoveOrigin` or root
       * * `who` - IdentityId to be removed from the group.
       **/
      removeMember: AugmentedSubmittable<
        (who: PolymeshPrimitivesIdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId]
      >;
      /**
       * Changes the membership to a new set, disregarding the existing membership.
       * May only be called from `ResetOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `ResetOrigin` or root
       * * `members` - New set of identities
       **/
      resetMembers: AugmentedSubmittable<
        (
          members:
            | Vec<PolymeshPrimitivesIdentityId>
            | (PolymeshPrimitivesIdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<PolymeshPrimitivesIdentityId>]
      >;
      /**
       * Change this group's limit for how many concurrent active members they may be.
       *
       * # Arguments
       * * `limit` - the number of active members there may be concurrently.
       **/
      setActiveMembersLimit: AugmentedSubmittable<
        (limit: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [u32]
      >;
      /**
       * Swaps out one member `remove` for another member `add`.
       *
       * May only be called from `SwapOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `SwapOrigin` or root
       * * `remove` - IdentityId to be removed from the group.
       * * `add` - IdentityId to be added in place of `remove`.
       **/
      swapMember: AugmentedSubmittable<
        (
          remove: PolymeshPrimitivesIdentityId | string | Uint8Array,
          add: PolymeshPrimitivesIdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrimitivesIdentityId, PolymeshPrimitivesIdentityId]
      >;
    };
    utility: {
      /**
       * Send a call through an indexed pseudonym of the sender.
       *
       * Filter from origin are passed along. The call will be dispatched with an origin which
       * use the same filter as the origin of this call.
       *
       * The dispatch origin for this call must be _Signed_.
       **/
      asDerivative: AugmentedSubmittable<
        (
          index: u16 | AnyNumber | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [u16, Call]
      >;
      /**
       * Send a batch of dispatch calls.
       *
       * May be called from any origin except `None`.
       *
       * - `calls`: The calls to be dispatched from the same origin. The number of call must not
       * exceed the constant: `batched_calls_limit` (available in constant metadata).
       *
       * If origin is root then the calls are dispatched without checking origin filter. (This
       * includes bypassing `frame_system::Config::BaseCallFilter`).
       *
       * ## Complexity
       * - O(C) where C is the number of calls to be batched.
       *
       * This will return `Ok` in all circumstances. To determine the success of the batch, an
       * event is deposited. If a call failed and the batch was interrupted, then the
       * `BatchInterrupted` event is deposited, along with the number of successful calls made
       * and the error of the failed call. If all were successful, then the `BatchCompleted`
       * event is deposited.
       **/
      batch: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Send a batch of dispatch calls and atomically execute them.
       * The whole transaction will rollback and fail if any of the calls failed.
       *
       * May be called from any origin except `None`.
       *
       * - `calls`: The calls to be dispatched from the same origin. The number of call must not
       * exceed the constant: `batched_calls_limit` (available in constant metadata).
       *
       * If origin is root then the calls are dispatched without checking origin filter. (This
       * includes bypassing `frame_system::Config::BaseCallFilter`).
       *
       * ## Complexity
       * - O(C) where C is the number of calls to be batched.
       **/
      batchAll: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Dispatch multiple calls from the sender's origin.
       *
       * This will execute all calls, in order, stopping at the first failure,
       * in which case the state changes are rolled back.
       * On failure, an event `BatchInterruptedOld(failure_idx, error)` is deposited.
       *
       * May be called from root or a signed origin.
       *
       * # Parameters
       * - `calls`: The calls to be dispatched from the same origin.
       *
       * # Weight
       * - The sum of the weights of the `calls`.
       * - One event.
       *
       * This will return `Ok` in all circumstances except an unsigned origin.
       * To determine the success of the batch, an event is deposited.
       * If any call failed, then `BatchInterruptedOld` is deposited.
       * If all were successful, then the `BatchCompletedOld` event is deposited.
       *
       * POLYMESH: deprecated.
       **/
      batchAtomic: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Dispatch multiple calls from the sender's origin.
       *
       * This will execute until the first one fails and then stop.
       *
       * May be called from root or a signed origin.
       *
       * # Parameters
       * - `calls`: The calls to be dispatched from the same origin.
       *
       * # Weight
       * - The sum of the weights of the `calls`.
       * - One event.
       *
       * This will return `Ok` in all circumstances except an unsigned origin. To determine the success of the batch, an
       * event is deposited. If a call failed and the batch was interrupted, then the
       * `BatchInterruptedOld` event is deposited, along with the number of successful calls made
       * and the error of the failed call. If all were successful, then the `BatchCompletedOld`
       * event is deposited.
       *
       * POLYMESH: Renamed from `batch` and deprecated.
       **/
      batchOld: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Dispatch multiple calls from the sender's origin.
       *
       * This will execute all calls, in order, irrespective of failures.
       * Any failures will be available in a `BatchOptimisticFailed` event.
       *
       * May be called from root or a signed origin.
       *
       * # Parameters
       * - `calls`: The calls to be dispatched from the same origin.
       *
       *
       * # Weight
       * - The sum of the weights of the `calls`.
       * - One event.
       *
       * This will return `Ok` in all circumstances except an unsigned origin.
       * To determine the success of the batch, an event is deposited.
       * If any call failed, then `BatchOptimisticFailed` is deposited,
       * with a vector of event counts for each call as well as a vector
       * of errors.
       * If all were successful, then the `BatchCompletedOld` event is deposited.
       *
       * POLYMESH: deprecated.
       **/
      batchOptimistic: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Dispatches a function call with a provided origin.
       *
       * The dispatch origin for this call must be _Root_.
       *
       * ## Complexity
       * - O(1).
       **/
      dispatchAs: AugmentedSubmittable<
        (
          asOrigin:
            | PolymeshPrivateRuntimeDevelopRuntimeOriginCaller
            | { system: any }
            | { Void: any }
            | { PolymeshCommittee: any }
            | { TechnicalCommittee: any }
            | { UpgradeCommittee: any }
            | string
            | Uint8Array,
          call: Call | IMethod | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [PolymeshPrivateRuntimeDevelopRuntimeOriginCaller, Call]
      >;
      /**
       * Send a batch of dispatch calls.
       * Unlike `batch`, it allows errors and won't interrupt.
       *
       * May be called from any origin except `None`.
       *
       * - `calls`: The calls to be dispatched from the same origin. The number of call must not
       * exceed the constant: `batched_calls_limit` (available in constant metadata).
       *
       * If origin is root then the calls are dispatch without checking origin filter. (This
       * includes bypassing `frame_system::Config::BaseCallFilter`).
       *
       * ## Complexity
       * - O(C) where C is the number of calls to be batched.
       **/
      forceBatch: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | IMethod | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>,
        [Vec<Call>]
      >;
      /**
       * Relay a call for a target from an origin
       *
       * Relaying in this context refers to the ability of origin to make a call on behalf of
       * target.
       *
       * Fees are charged to origin
       *
       * # Parameters
       * - `target`: Account to be relayed
       * - `signature`: Signature from target authorizing the relay
       * - `call`: Call to be relayed on behalf of target
       *
       * POLYMESH: added.
       **/
      relayTx: AugmentedSubmittable<
        (
          target: AccountId32 | string | Uint8Array,
          signature:
            | SpRuntimeMultiSignature
            | { Ed25519: any }
            | { Sr25519: any }
            | { Ecdsa: any }
            | string
            | Uint8Array,
          call: PalletUtilityUniqueCall | { nonce?: any; call?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [AccountId32, SpRuntimeMultiSignature, PalletUtilityUniqueCall]
      >;
      /**
       * Dispatch a function call with a specified weight.
       *
       * This function does not check the weight of the call, and instead allows the
       * Root origin to specify the weight of the call.
       *
       * The dispatch origin for this call must be _Root_.
       **/
      withWeight: AugmentedSubmittable<
        (
          call: Call | IMethod | string | Uint8Array,
          weight: SpWeightsWeightV2Weight | { refTime?: any; proofSize?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>,
        [Call, SpWeightsWeightV2Weight]
      >;
    };
    validatorSet: {
      /**
       * Add a new validator.
       *
       * New validator's session keys should be set in Session pallet before
       * calling this.
       *
       * The origin can be configured using the `AddRemoveOrigin` type in the
       * host runtime. Can also be set to sudo/root.
       **/
      addValidator: AugmentedSubmittable<
        (validatorId: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
      /**
       * Remove a validator.
       *
       * The origin can be configured using the `AddRemoveOrigin` type in the
       * host runtime. Can also be set to sudo/root.
       **/
      removeValidator: AugmentedSubmittable<
        (validatorId: AccountId32 | string | Uint8Array) => SubmittableExtrinsic<ApiType>,
        [AccountId32]
      >;
    };
  } // AugmentedSubmittables
} // declare module
