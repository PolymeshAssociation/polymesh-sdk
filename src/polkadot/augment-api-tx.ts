// Auto-generated via `yarn polkadot-types-from-chain`, do not edit
/* eslint-disable */

import { AnyNumber, ITuple } from '@polkadot/types/types';
import { Compact, Option, Vec } from '@polkadot/types/codec';
import { Bytes, bool, u128, u16, u32, u64 } from '@polkadot/types/primitive';
import { ProposalIndex } from '@polkadot/types/interfaces/collective';
import { CodeHash, Gas, Schedule } from '@polkadot/types/interfaces/contracts';
import { Proposal } from '@polkadot/types/interfaces/democracy';
import { Extrinsic, Signature } from '@polkadot/types/interfaces/extrinsics';
import { GrandpaEquivocationProof, KeyOwnerProof } from '@polkadot/types/interfaces/grandpa';
import { Heartbeat } from '@polkadot/types/interfaces/imOnline';
import {
  AccountId,
  AccountIndex,
  Address,
  Balance,
  BalanceOf,
  BlockNumber,
  Call,
  ChangesTrieConfiguration,
  Hash,
  Header,
  KeyValue,
  LookupSource,
  Moment,
  Perbill,
  Percent,
  Weight,
} from '@polkadot/types/interfaces/runtime';
import { Keys } from '@polkadot/types/interfaces/session';
import {
  CompactAssignments,
  ElectionScore,
  ElectionSize,
  EraIndex,
  RewardDestination,
  ValidatorIndex,
  ValidatorPrefs,
} from '@polkadot/types/interfaces/staking';
import { Key } from '@polkadot/types/interfaces/system';
import {
  AssetIdentifier,
  AssetName,
  AssetTransferRule,
  AssetType,
  AuthIdentifier,
  AuthorizationData,
  Ballot,
  BatchAddClaimItem,
  BatchRevokeClaimItem,
  Beneficiary,
  BridgeTx,
  Claim,
  Document,
  DocumentName,
  FundingRoundName,
  IdentifierType,
  IdentityId,
  IssueAssetItem,
  Leg,
  Memo,
  MovePortfolioItem,
  OffChainSignature,
  OfflineSlashingParams,
  Permission,
  PipDescription,
  PipId,
  PortfolioName,
  PortfolioNumber,
  PosRatio,
  ProtocolOp,
  ReceiptDetails,
  Rule,
  SettlementType,
  Signatory,
  SigningKey,
  SigningKeyWithAuth,
  SmartExtension,
  TargetIdAuthorization,
  Ticker,
  UniqueCall,
  Url,
  VenueDetails,
} from 'polymesh-types/polymesh';
import { ApiTypes, SubmittableExtrinsic } from '@polkadot/api/types';

declare module '@polkadot/api/types/submittable' {
  export interface AugmentedSubmittables<ApiType> {
    asset: {
      /**
       * This function is used to accept a token ownership transfer.
       * NB: To reject the transfer, call remove auth function in identity module.
       *
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function).
       * * `auth_id` Authorization ID of the token ownership transfer authorization.
       **/
      acceptAssetOwnershipTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * This function is used to accept a ticker transfer.
       * NB: To reject the transfer, call remove auth function in identity module.
       *
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function).
       * * `auth_id` Authorization ID of ticker transfer authorization.
       **/
      acceptTickerTransfer: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Permissioning the Smart-Extension address for a given ticker.
       *
       * # Arguments
       * * `origin` - Signatory who owns to ticker/asset.
       * * `ticker` - ticker for whom extension get added.
       * * `extension_details` - Details of the smart extension.
       **/
      addExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionDetails:
            | SmartExtension
            | { extension_type?: any; extension_name?: any; extension_id?: any; is_archive?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approve token transfer from one DID to another.
       * once this is done, transfer_from can be called with corresponding values.
       *
       * # Arguments
       * * `origin` Signing key of the token owner (i.e sender).
       * * `spender_did` DID of the spender.
       * * `value` Amount of the tokens approved.
       **/
      approve: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          spenderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Archived the extension. Extension is use to verify the compliance or any smart logic it posses.
       *
       * # Arguments
       * * `origin` - Signatory who owns the ticker/asset.
       * * `ticker` - Ticker symbol of the asset.
       * * `extension_id` - AccountId of the extension that need to be archived.
       **/
      archiveExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionId: AccountId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add documents for a given token. To be called only by the token owner.
       *
       * # Arguments
       * * `origin` Signing key of the token owner.
       * * `ticker` Ticker of the token.
       * * `documents` Documents to be attached to `ticker`.
       *
       * # Weight
       * `200_000 + 60_000 * documents.len()`
       **/
      batchAddDocument: AugmentedSubmittable<
        (
          documents:
            | Vec<ITuple<[DocumentName, Document]>>
            | [
                DocumentName | string,
                Document | { uri?: any; content_hash?: any } | string | Uint8Array
              ][],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function is used issue(or mint) new tokens for the given DIDs
       * can only be executed by the token owner.
       *
       * # Arguments
       * * `origin` Signing key of token owner.
       * * `ticker` Ticker of the token.
       * * `investor_dids` Array of the DID of the token holders to whom new tokens get issued.
       * * `values` Array of the Amount of tokens that get issued.
       *
       * # Weight
       * `300_000 + 400_000 * issue_asset_items.len().max(values.len())`
       **/
      batchIssue: AugmentedSubmittable<
        (
          issueAssetItems:
            | Vec<IssueAssetItem>
            | (IssueAssetItem | { identity_did?: any; value?: any } | string | Uint8Array)[],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove documents for a given token. To be called only by the token owner.
       *
       * # Arguments
       * * `origin` Signing key of the token owner.
       * * `ticker` Ticker of the token.
       * * `doc_names` Documents to be removed from `ticker`.
       *
       * # Weight
       * `200_000 + 60_000 * do_ids.len()`
       **/
      batchRemoveDocument: AugmentedSubmittable<
        (
          docNames: Vec<DocumentName> | (DocumentName | string)[],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Forces a redemption of an DID's tokens. Can only be called by token owner.
       *
       * # Arguments
       * * `origin` Signing key of the token owner.
       * * `ticker` Ticker of the token.
       * * `token_holder_did` DID from whom balance get reduced.
       * * `value` Amount of the tokens needs to redeem.
       * * `data` An off chain data blob used to validate the redeem functionality.
       * * `operator_data` Any data blob that defines the reason behind the force redeem.
       **/
      controllerRedeem: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          tokenHolderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          operatorData: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Forces a transfer between two DIDs & This can only be called by security token owner.
       * This function doesn't validate any type of restriction beside a valid CDD check.
       *
       * # Arguments
       * * `origin` signing key of the token owner DID.
       * * `ticker` symbol of the token.
       * * `from_did` DID of the token holder from whom balance token will be transferred.
       * * `to_did` DID of token holder to whom token balance will be transferred.
       * * `value` Amount of tokens.
       * * `data` Some off chain data to validate the restriction.
       * * `operator_data` It is a string which describes the reason of this control transfer call.
       **/
      controllerTransfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array,
          operatorData: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Initializes a new security token
       * makes the initiating account the owner of the security token
       * & the balance of the owner is set to total supply.
       *
       * # Arguments
       * * `origin` - contains the signing key of the caller (i.e who signed the transaction to execute this function).
       * * `name` - the name of the token.
       * * `ticker` - the ticker symbol of the token.
       * * `total_supply` - the total supply of the token.
       * * `divisible` - a boolean to identify the divisibility status of the token.
       * * `asset_type` - the asset type.
       * * `identifiers` - a vector of asset identifiers.
       * * `funding_round` - name of the funding round.
       *
       * # Weight
       * `400_000 + 20_000 * identifiers.len()`
       **/
      createAsset: AugmentedSubmittable<
        (
          name: AssetName | string,
          ticker: Ticker | string | Uint8Array,
          totalSupply: Balance | AnyNumber | Uint8Array,
          divisible: bool | boolean | Uint8Array,
          assetType:
            | AssetType
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
            | string
            | Uint8Array,
          identifiers:
            | Vec<ITuple<[IdentifierType, AssetIdentifier]>>
            | [
                IdentifierType | 'Cins' | 'Cusip' | 'Isin' | number | Uint8Array,
                AssetIdentifier | string
              ][],
          fundingRound: Option<FundingRoundName> | null | object | string | Uint8Array,
          treasuryDid: Option<IdentityId> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function used to create the checkpoint.
       * NB: Only called by the owner of the security token i.e owner DID.
       *
       * # Arguments
       * * `origin` Signing key of the token owner. (Only token owner can call this function).
       * * `ticker` Ticker of the token.
       **/
      createCheckpoint: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes transfers and minting of a given token.
       *
       * # Arguments
       * * `origin` - the signing key of the sender.
       * * `ticker` - the ticker of the token.
       **/
      freeze: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * ERC-2258 Implementation
       * Used to increase the allowance for a given custodian
       * Any investor/token holder can add a custodian and transfer the token transfer ownership to the custodian
       * Through that investor balance will remain the same but the given token are only transfer by the custodian.
       * This implementation make sure to have an accurate investor count from omnibus wallets.
       *
       * # Arguments
       * * `origin` Signing key of the token holder.
       * * `ticker` Ticker of the token.
       * * `custodian_did` DID of the custodian (i.e whom allowance provided).
       * * `value` Allowance amount.
       **/
      increaseCustodyAllowance: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          custodianDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to increase the allowance for a given custodian by providing the off chain signature.
       *
       * # Arguments
       * * `origin` Signing key of a DID who posses off chain signature.
       * * `ticker` Ticker of the token.
       * * `holder_did` DID of the token holder (i.e who wants to increase the custody allowance).
       * * `holder_account_id` Signing key which signs the off chain data blob.
       * * `custodian_did` DID of the custodian (i.e whom allowance provided).
       * * `value` Allowance amount.
       * * `nonce` A u16 number which avoid the replay attack.
       * * `signature` Signature provided by the holder_did.
       **/
      increaseCustodyAllowanceOf: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          holderDid: IdentityId | string | Uint8Array,
          holderAccountId: AccountId | string | Uint8Array,
          custodianDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          nonce: u16 | AnyNumber | Uint8Array,
          signature:
            | OffChainSignature
            | { Ed25519: any }
            | { Sr25519: any }
            | { Ecdsa: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to know whether the given token will issue new tokens or not.
       *
       * # Arguments
       * * `_origin` Signing key.
       * * `ticker` Ticker of the token whose issuance status need to know.
       **/
      isIssuable: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Function is used to issue(or mint) new tokens for the given DID
       * can only be executed by the token owner.
       *
       * # Arguments
       * * `origin` Signing key of token owner.
       * * `ticker` Ticker of the token.
       * * `to_did` DID of the token holder to whom new tokens get issued.
       * * `value` Amount of tokens that get issued.
       **/
      issue: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Makes an indivisible token divisible. Only called by the token owner.
       *
       * # Arguments
       * * `origin` Signing key of the token owner.
       * * `ticker` Ticker of the token.
       **/
      makeDivisible: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to redeem the security tokens.
       *
       * # Arguments
       * * `origin` Signing key of the token holder who wants to redeem the tokens.
       * * `ticker` Ticker of the token.
       * * `value` Amount of the tokens needs to redeem.
       * * `_data` An off chain data blob used to validate the redeem functionality.
       **/
      redeem: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to redeem the security tokens by some other DID who has approval.
       *
       * # Arguments
       * * `origin` Signing key of the spender who has valid approval to redeem the tokens.
       * * `ticker` Ticker of the token.
       * * `from_did` DID from whom balance get reduced.
       * * `value` Amount of the tokens needs to redeem.
       * * `_data` An off chain data blob used to validate the redeem functionality.
       **/
      redeemFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * This function is used to either register a new ticker or extend validity of an existing ticker.
       * NB: Ticker validity does not get carry forward when renewing ticker.
       *
       * # Arguments
       * * `origin` It contains the signing key of the caller (i.e who signed the transaction to execute this function).
       * * `ticker` ticker to register.
       **/
      registerTicker: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Renames a given token.
       *
       * # Arguments
       * * `origin` - the signing key of the sender.
       * * `ticker` - the ticker of the token.
       * * `name` - the new name of the token.
       **/
      renameAsset: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          name: AssetName | string
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets the name of the current funding round.
       *
       * # Arguments
       * * `origin` - the signing key of the token owner DID.
       * * `ticker` - the ticker of the token.
       * * `name` - the desired name of the current funding round.
       **/
      setFundingRound: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          name: FundingRoundName | string
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets the treasury DID to a given value. The caller must be the asset issuer. The asset
       * issuer can always update the treasury DID, including setting it to `None`. If the issuer
       * modifies their treasury DID to `None` then it will be immovable until either they change
       * the treasury DID to `Some` DID, or they add a claim to allow that DID to move the
       * asset.
       *
       * # Arguments
       * * `origin` - The asset issuer.
       * * `ticker` - Ticker symbol of the asset.
       * * `treasury_did` - The treasury DID wrapped in a value of type [`Option`].
       **/
      setTreasuryDid: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          treasuryDid: Option<IdentityId> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens from one DID to another DID as tokens are stored/managed on the DID level.
       *
       * # Arguments
       * * `origin` signing key of the sender.
       * * `ticker` Ticker of the token.
       * * `to_did` DID of the `to` token holder, to whom token needs to transferred.
       * * `value` Value that needs to transferred.
       **/
      transfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to transfer the tokens by the approved custodian.
       *
       * # Arguments
       * * `origin` Signing key of the custodian.
       * * `ticker` Ticker of the token.
       * * `holder_did` DID of the token holder (i.e whom balance get reduced).
       * * `receiver_did` DID of the receiver.
       * * `value` Amount of tokens need to transfer.
       **/
      transferByCustodian: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          holderDid: IdentityId | string | Uint8Array,
          receiverDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * If sufficient allowance provided, transfer from a DID to another DID without token owner's signature.
       *
       * # Arguments
       * * `origin` Signing key of spender.
       * * `ticker` Ticker of the token.
       * * `from_did` DID from whom token is being transferred.
       * * `to_did` DID to whom token is being transferred.
       * * `value` Amount of the token for transfer.
       **/
      transferFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An ERC1594 transfer_from with data
       * This function can be used by the exchanges or other third parties to dynamically validate the transaction
       * by passing the data blob.
       *
       * # Arguments
       * * `origin` Signing key of the spender.
       * * `ticker` Ticker of the token.
       * * `from_did` DID from whom tokens will be transferred.
       * * `to_did` DID to whom tokens will be transferred.
       * * `value` Amount of the tokens.
       * * `data` Off chain data blob to validate the transfer.
       **/
      transferFromWithData: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An ERC1594 transfer with data
       * This function can be used by the exchanges or other third parties to dynamically validate the transaction
       * by passing the data blob.
       *
       * # Arguments
       * * `origin` Signing key of the sender.
       * * `ticker` Ticker of the token.
       * * `to_did` DID to whom tokens will be transferred.
       * * `value` Amount of the tokens.
       * * `data` Off chain data blob to validate the transfer.
       **/
      transferWithData: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Un-archived the extension. Extension is use to verify the compliance or any smart logic it posses.
       *
       * # Arguments
       * * `origin` - Signatory who owns the ticker/asset.
       * * `ticker` - Ticker symbol of the asset.
       * * `extension_id` - AccountId of the extension that need to be un-archived.
       **/
      unarchiveExtension: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          extensionId: AccountId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unfreezes transfers and minting of a given token.
       *
       * # Arguments
       * * `origin` - the signing key of the sender.
       * * `ticker` - the ticker of the frozen token.
       **/
      unfreeze: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Updates the asset identifiers. Can only be called by the token owner.
       *
       * # Arguments
       * * `origin` - the signing key of the token owner.
       * * `ticker` - the ticker of the token.
       * * `identifiers` - the asset identifiers to be updated in the form of a vector of pairs
       * of `IdentifierType` and `AssetIdentifier` value.
       *
       * # Weight
       * `150_000 + 20_000 * identifiers.len()`
       **/
      updateIdentifiers: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          identifiers:
            | Vec<ITuple<[IdentifierType, AssetIdentifier]>>
            | [
                IdentifierType | 'Cins' | 'Cusip' | 'Isin' | number | Uint8Array,
                AssetIdentifier | string
              ][]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    authorship: {
      /**
       * Provide a set of uncles.
       **/
      setUncles: AugmentedSubmittable<
        (
          newUncles:
            | Vec<Header>
            | (
                | Header
                | {
                    parentHash?: any;
                    number?: any;
                    stateRoot?: any;
                    extrinsicsRoot?: any;
                    digest?: any;
                  }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    balances: {
      /**
       * Burns the given amount of tokens from the caller's free, unlocked balance.
       **/
      burnAccountBalance: AugmentedSubmittable<
        (amount: Balance | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change setting that governs if user pays fee via their own balance or identity's balance.
       **/
      changeChargeDidFlag: AugmentedSubmittable<
        (chargeDid: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          source: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Claim back POLYX from an identity. Can only be called by master key of the identity.
       * no-op when,
       * - value is zero
       * # <weight>
       * - Base Weight : 1_000_000
       * - DB Weight: 1 Read and 1 Write to the destination identityId.
       * - Origin account is already in memory, so no DB operations for them.
       * #</weight>
       **/
      reclaimIdentityBalance: AugmentedSubmittable<
        (
          did: IdentityId | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the balances of a given account.
       *
       * This will alter `FreeBalance` and `ReservedBalance` in storage. it will
       * also decrease the total issuance of the system (`TotalIssuance`).
       *
       * The dispatch origin for this call is `root`.
       *
       * # <weight>
       * - Independent of the arguments.
       * - Contains a limited number of reads and writes.
       * ---------------------
       * - Base Weight:
       * - Creating: 27.56 µs
       * - Killing: 35.11 µs
       * - DB Weight: 1 Read, 1 Write to `who`
       * # </weight>
       **/
      setBalance: AugmentedSubmittable<
        (
          who: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          newFree: Compact<Balance> | AnyNumber | Uint8Array,
          newReserved: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Move some POLYX from balance of self to balance of BRR.
       **/
      topUpBrrBalance: AugmentedSubmittable<
        (value: Compact<Balance> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Move some POLYX from balance of self to balance of an identity.
       * no-op when,
       * - value is zero
       * # <weight>
       * - Base Weight : 1_000_000
       * - DB Weight: 1 Read and 1 Write to the destination identityId,
       * - Origin account is already in memory, so no DB operations for them.
       * #</weight>
       **/
      topUpIdentityBalance: AugmentedSubmittable<
        (
          did: IdentityId | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<Balance> | AnyNumber | Uint8Array,
          memo: Option<Memo> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    bridge: {
      /**
       * Forces handling a vector of transactions by bypassing the bridge limit and timelock.
       * It collects results of processing every transaction in the given vector and outputs
       * the vector of results (In event) which has the same length as the `bridge_txs` have
       *
       * # Weight
       * `50_000 + 200_000 * bridge_txs.len()`
       **/
      batchForceHandleBridgeTx: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes given bridge transactions.
       * If any bridge txn is already handled then this function will just ignore it and process next one.
       *
       * # Weight
       * `50_000 + 200_000 * bridge_txs.len()`
       **/
      batchFreezeTx: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Handles a vector of approved bridge transaction proposals.
       * It deposits an event (i.e TxsHandled) which consist the result of every BridgeTx.
       *
       * # Weight
       * `50_000 + 200_000 * bridge_txs.len()`
       **/
      batchHandleBridgeTx: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Proposes a vector of bridge transactions. The vector is processed until the first
       * proposal which causes an error, in which case the error is returned and the rest of
       * proposals are not processed.
       *
       * # Weight
       * `100_000 + 700_000 * bridge_txs.len()`
       **/
      batchProposeBridgeTx: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unfreezes given bridge transactions.
       * If any bridge txn is already handled then this function will just ignore it and process next one.
       *
       * # Weight
       * `50_000 + 700_000 * bridge_txs.len()`
       **/
      batchUnfreezeTx: AugmentedSubmittable<
        (
          bridgeTxs:
            | Vec<BridgeTx>
            | (
                | BridgeTx
                | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the bridge admin key.
       **/
      changeAdmin: AugmentedSubmittable<
        (admin: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the bridge limit exempted list.
       **/
      changeBridgeExempted: AugmentedSubmittable<
        (
          exempted:
            | Vec<ITuple<[IdentityId, bool]>>
            | [IdentityId | string | Uint8Array, bool | boolean | Uint8Array][]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the bridge limits.
       **/
      changeBridgeLimit: AugmentedSubmittable<
        (
          amount: Balance | AnyNumber | Uint8Array,
          duration: BlockNumber | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the controller account as admin.
       **/
      changeController: AugmentedSubmittable<
        (controller: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the timelock period.
       **/
      changeTimelock: AugmentedSubmittable<
        (timelock: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Forces handling a transaction by bypassing the bridge limit and timelock.
       **/
      forceHandleBridgeTx: AugmentedSubmittable<
        (
          bridgeTx:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freezes transaction handling in the bridge module if it is not already frozen. When the
       * bridge is frozen, attempted transactions get postponed instead of getting handled.
       **/
      freeze: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Handles an approved bridge transaction proposal.
       **/
      handleBridgeTx: AugmentedSubmittable<
        (
          bridgeTx:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Proposes a bridge transaction, which amounts to making a multisig proposal for the
       * bridge transaction if the transaction is new or approving an existing proposal if the
       * transaction has already been proposed.
       **/
      proposeBridgeTx: AugmentedSubmittable<
        (
          bridgeTx:
            | BridgeTx
            | { nonce?: any; recipient?: any; value?: any; tx_hash?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unfreezes transaction handling in the bridge module if it is frozen.
       **/
      unfreeze: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
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
       * * Only master key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          who: IdentityId | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          at: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          members: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
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
          remove: IdentityId | string | Uint8Array,
          add: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       * * Only master key can abdicate.
       * * Last member of a group cannot abdicate.
       **/
      abdicateMembership: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Adds a member `who` to the group. May only be called from `AddOrigin` or root.
       *
       * # Arguments
       * * `origin` - Origin representing `AddOrigin` or root
       * * `who` - IdentityId to be added to the group.
       **/
      addMember: AugmentedSubmittable<
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          who: IdentityId | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          at: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
        (who: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          members: Vec<IdentityId> | (IdentityId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
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
          remove: IdentityId | string | Uint8Array,
          add: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    complianceManager: {
      /**
       * Adds an asset rule to active rules for a ticker.
       * If rules are duplicated, it does nothing.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * sender_rules - Sender transfer rule.
       * * receiver_rules - Receiver transfer rule.
       **/
      addActiveRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          senderRules:
            | Vec<Rule>
            | (Rule | { rule_type?: any; issuers?: any } | string | Uint8Array)[],
          receiverRules:
            | Vec<Rule>
            | (Rule | { rule_type?: any; issuers?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To add the default trusted claim issuer for a given asset
       * Addition - When the given element is not exist
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuer - IdentityId of the trusted claim issuer.
       **/
      addDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuer: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To add a list of default trusted claim issuers for a given asset
       * Addition - When the given element is not exist
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuers - Vector of IdentityId of the trusted claim issuers.
       *
       * # Weight
       * `50_000 + 250_000 * trusted_issuers.len().max(values.len())`
       **/
      batchAddDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          trustedIssuers: Vec<IdentityId> | (IdentityId | string | Uint8Array)[],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change/Modify the existing asset rule of a given ticker in batch
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * asset_rules - Vector of asset rule.
       * * ticker - Symbol of the asset.
       *
       * # Weight
       * `100_000 + 100_000 * asset_rules.len().max(values.len())`
       **/
      batchChangeAssetRule: AugmentedSubmittable<
        (
          newAssetRules:
            | Vec<AssetTransferRule>
            | (
                | AssetTransferRule
                | { sender_rules?: any; receiver_rules?: any; rule_id?: any }
                | string
                | Uint8Array
              )[],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To remove the default trusted claim issuer for a given asset
       * Removal - When the given element is already present
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuers - Vector of IdentityId of the trusted claim issuers.
       *
       * # Weight
       * `50_000 + 250_000 * trusted_issuers.len().max(values.len())`
       **/
      batchRemoveDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          trustedIssuers: Vec<IdentityId> | (IdentityId | string | Uint8Array)[],
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change/Modify the existing asset rule of a given ticker
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * asset_rule - Asset rule.
       **/
      changeAssetRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          newAssetRule:
            | AssetTransferRule
            | { sender_rules?: any; receiver_rules?: any; rule_id?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It pauses the verification of rules for `ticker` during transfers.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      pauseAssetRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes a rule from asset rules.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       * * asset_rule_id - Rule id which is need to be removed
       **/
      removeActiveRule: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          assetRuleId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * To remove the default trusted claim issuer for a given asset
       * Removal - When the given element is already present
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker.
       * * ticker - Symbol of the asset.
       * * trusted_issuer - IdentityId of the trusted claim issuer.
       **/
      removeDefaultTrustedClaimIssuer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          trustedIssuer: IdentityId | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Replaces asset rules of a ticker with new rules.
       *
       * # Arguments
       * * `ticker` - the asset ticker,
       * * `asset_rules - the new asset rules.
       *
       * # Errors
       * * `Unauthorized` if `origin` is not the owner of the ticker.
       * * `DuplicateAssetRules` if `asset_rules` contains multiple entries with the same `rule_id`.
       *
       * # Weight
       * `150_000 + 50_000 * asset_rules.len()`
       **/
      replaceAssetRules: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          assetRules:
            | Vec<AssetTransferRule>
            | (
                | AssetTransferRule
                | { sender_rules?: any; receiver_rules?: any; rule_id?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes all active rules of a given ticker
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      resetActiveRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It resumes the verification of rules for `ticker` during transfers.
       *
       * # Arguments
       * * origin - Signer of the dispatchable. It should be the owner of the ticker
       * * ticker - Symbol of the asset
       **/
      resumeAssetRules: AugmentedSubmittable<
        (ticker: Ticker | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    confidential: {
      addRangeProof: AugmentedSubmittable<
        (
          targetId: IdentityId | string | Uint8Array,
          ticker: Ticker | string | Uint8Array,
          secretValue: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      addVerifyRangeProof: AugmentedSubmittable<
        (
          target: IdentityId | string | Uint8Array,
          prover: IdentityId | string | Uint8Array,
          ticker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    contracts: {
      /**
       * Makes a call to an account, optionally transferring some balance.
       *
       * * If the account is a smart-contract account, the associated code will be
       * executed and any value will be transferred.
       * * If the account is a regular account, any value will be transferred.
       * * If no account exists and the call value is not less than `existential_deposit`,
       * a regular account will be created and any value will be transferred.
       **/
      call: AugmentedSubmittable<
        (
          dest: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<BalanceOf> | AnyNumber | Uint8Array,
          gasLimit: Compact<Gas> | AnyNumber | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Allows block producers to claim a small reward for evicting a contract. If a block producer
       * fails to do so, a regular users will be allowed to claim the reward.
       *
       * If contract is not evicted as a result of this call, no actions are taken and
       * the sender is not eligible for the reward.
       **/
      claimSurcharge: AugmentedSubmittable<
        (
          dest: AccountId | string | Uint8Array,
          auxSender: Option<AccountId> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Instantiates a new contract from the `codehash` generated by `put_code`, optionally transferring some balance.
       *
       * Instantiation is executed as follows:
       *
       * - The destination address is computed based on the sender and hash of the code.
       * - The smart-contract account is created at the computed address.
       * - The `ctor_code` is executed in the context of the newly-created account. Buffer returned
       * after the execution is saved as the `code` of the account. That code will be invoked
       * upon any call received by this account.
       * - The contract is initialized.
       **/
      instantiate: AugmentedSubmittable<
        (
          endowment: Compact<BalanceOf> | AnyNumber | Uint8Array,
          gasLimit: Compact<Gas> | AnyNumber | Uint8Array,
          codeHash: CodeHash | string | Uint8Array,
          data: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Stores the given binary Wasm code into the chain's storage and returns its `codehash`.
       * You can instantiate contracts only with stored code.
       **/
      putCode: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Updates the schedule for metering contracts.
       *
       * The schedule must have a greater version than the stored schedule.
       **/
      updateSchedule: AugmentedSubmittable<
        (
          schedule:
            | Schedule
            | {
                version?: any;
                putCodePerByteCost?: any;
                growMemCost?: any;
                regularOpCost?: any;
                returnDataPerByteCost?: any;
                eventDataPerByteCost?: any;
                eventPerTopicCost?: any;
                eventBaseCost?: any;
                sandboxDataReadCost?: any;
                sandboxDataWriteCost?: any;
                transferCost?: any;
                maxEventTopics?: any;
                maxStackHeight?: any;
                maxMemoryPages?: any;
                enablePrintln?: any;
                maxSubjectLen?: any;
              }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    dividend: {
      /**
       * Lets the owner cancel a dividend before start/maturity date
       **/
      cancel: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Withdraws from a dividend the adequate share of the `amount` field. All dividend shares
       * are rounded by truncation (down to first integer below)
       **/
      claim: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * After a dividend had expired, collect the remaining amount to owner address
       **/
      claimUnclaimed: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          dividendId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a new dividend entry without payout. Token must have at least one checkpoint.
       **/
      new: AugmentedSubmittable<
        (
          amount: Balance | AnyNumber | Uint8Array,
          ticker: Ticker | string | Uint8Array,
          maturesAt: Moment | AnyNumber | Uint8Array,
          expiresAt: Moment | AnyNumber | Uint8Array,
          payoutTicker: Ticker | string | Uint8Array,
          checkpointId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    exemption: {
      modifyExemptionList: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          tm: u16 | AnyNumber | Uint8Array,
          assetHolderDid: IdentityId | string | Uint8Array,
          exempted: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    finalityTracker: {
      /**
       * Hint that the author of this block thinks the best finalized
       * block is the given number.
       **/
      finalHint: AugmentedSubmittable<
        (hint: Compact<BlockNumber> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    grandpa: {
      /**
       * Report voter equivocation/misbehavior. This method will verify the
       * equivocation proof and validate the given key ownership proof
       * against the extracted offender. If both are valid, the offence
       * will be reported.
       *
       * Since the weight of the extrinsic is 0, in order to avoid DoS by
       * submission of invalid equivocation reports, a mandatory pre-validation of
       * the extrinsic is implemented in a `SignedExtension`.
       **/
      reportEquivocation: AugmentedSubmittable<
        (
          equivocationProof:
            | GrandpaEquivocationProof
            | { setId?: any; equivocation?: any }
            | string
            | Uint8Array,
          keyOwnerProof:
            | KeyOwnerProof
            | { session?: any; trieNodes?: any; validatorCount?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    identity: {
      /**
       * Accepts an authorization.
       **/
      acceptAuthorization: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Call this with the new master key. By invoking this method, caller accepts authorization
       * with the new master key. If a CDD service provider approved this change, master key of
       * the DID is updated.
       *
       * # Arguments
       * * `owner_auth_id` Authorization from the owner who initiated the change
       * * `cdd_auth_id` Authorization from a CDD service provider
       **/
      acceptMasterKey: AugmentedSubmittable<
        (
          rotationAuthId: u64 | AnyNumber | Uint8Array,
          optionalCddAuthId: Option<u64> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds an authorization.
       **/
      addAuthorization: AugmentedSubmittable<
        (
          target: Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
          authorizationData:
            | AuthorizationData
            | { AttestMasterKeyRotation: any }
            | { RotateMasterKey: any }
            | { TransferTicker: any }
            | { AddMultiSigSigner: any }
            | { TransferAssetOwnership: any }
            | { JoinIdentity: any }
            | { Custom: any }
            | { NoData: any }
            | string
            | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a new claim record or edits an existing one. Only called by did_issuer's signing key.
       **/
      addClaim: AugmentedSubmittable<
        (
          target: IdentityId | string | Uint8Array,
          claim:
            | Claim
            | { Accredited: any }
            | { Affiliate: any }
            | { BuyLockup: any }
            | { SellLockup: any }
            | { CustomerDueDiligence: any }
            | { KnowYourCustomer: any }
            | { Jurisdiction: any }
            | { Exempted: any }
            | { Blocked: any }
            | { NoData: any }
            | string
            | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accepts an array of authorizations.
       * NB: Even if an auth is invalid (due to any reason), this batch function does NOT return an error.
       * It will just skip that particular authorization.
       *
       * # Weight
       * `100_000 + 500_000 * auth_ids.len()`
       **/
      batchAcceptAuthorization: AugmentedSubmittable<
        (authIds: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds an array of authorizations.
       *
       * # Weight
       * `150_000 + 50_000 * auths.len()`
       **/
      batchAddAuthorization: AugmentedSubmittable<
        (
          auths:
            | Vec<ITuple<[Signatory, AuthorizationData, Option<Moment>]>>
            | [
                Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
                (
                  | AuthorizationData
                  | { AttestMasterKeyRotation: any }
                  | { RotateMasterKey: any }
                  | { TransferTicker: any }
                  | { AddMultiSigSigner: any }
                  | { TransferAssetOwnership: any }
                  | { JoinIdentity: any }
                  | { Custom: any }
                  | { NoData: any }
                  | string
                  | Uint8Array
                ),
                Option<Moment> | null | object | string | Uint8Array
              ][]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a new batch of claim records or edits an existing one. Only called by
       * `did_issuer`'s signing key.
       *
       * # Weight
       * `300_000 + 100_000 * claims.len()`
       **/
      batchAddClaim: AugmentedSubmittable<
        (
          claims:
            | Vec<BatchAddClaimItem>
            | (
                | BatchAddClaimItem
                | { target?: any; claim?: any; expiry?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It adds signing keys to target identity `id`.
       * Keys are directly added to identity because each of them has an authorization.
       *
       * Arguments:
       * - `origin` Master key of `id` identity.
       * - `id` Identity where new signing keys will be added.
       * - `additional_keys` New signing items (and their authorization data) to add to target
       * identity.
       *
       * Failure
       * - It can only called by master key owner.
       * - Keys should be able to linked to any identity.
       *
       * # Weight
       * `400_000 + 200_000 * auths.len()`
       **/
      batchAddSigningKeyWithAuthorization: AugmentedSubmittable<
        (
          additionalKeys:
            | Vec<SigningKeyWithAuth>
            | (
                | SigningKeyWithAuth
                | { signing_key?: any; auth_signature?: any }
                | string
                | Uint8Array
              )[],
          expiresAt: Moment | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes an array of authorizations.
       *
       * # Weight
       * `150_000 + 50_000 * auths.len()`
       **/
      batchRemoveAuthorization: AugmentedSubmittable<
        (
          authIdentifiers:
            | Vec<AuthIdentifier>
            | (AuthIdentifier | { signatory?: any; auth_id?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Revoke multiple claims in a batch.
       *
       * # Arguments
       * * origin - did issuer
       * * did_and_claim_data - Vector of the identities & the corresponding claim data whom claim needs to be revoked
       *
       * # Weight
       * `100_000 + 150_000 * claims.len()`
       **/
      batchRevokeClaim: AugmentedSubmittable<
        (
          claims:
            | Vec<BatchRevokeClaimItem>
            | (BatchRevokeClaimItem | { target?: any; claim?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Register `target_account` with a new Identity.
       *
       * # Failure
       * - `origin` has to be a active CDD provider. Inactive CDD providers cannot add new
       * claims.
       * - `target_account` (master key of the new Identity) can be linked to just one and only
       * one identity.
       * - External signing keys can be linked to just one identity.
       *
       * # Weight
       * `400_000 + 60_000 * signing_keys.len()`
       **/
      cddRegisterDid: AugmentedSubmittable<
        (
          targetAccount: AccountId | string | Uint8Array,
          cddClaimExpiry: Option<Moment> | null | object | string | Uint8Array,
          signingKeys:
            | Vec<SigningKey>
            | (SigningKey | { signer?: any; permissions?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set if CDD authorization is required for updating master key of an identity.
       * Callable via root (governance)
       *
       * # Arguments
       * * `auth_required` CDD Authorization required or not
       **/
      changeCddRequirementForMkRotation: AugmentedSubmittable<
        (authRequired: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Creates a call on behalf of another DID.
       **/
      forwardedCall: AugmentedSubmittable<
        (
          targetDid: IdentityId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It disables all signing keys at `did` identity.
       *
       * # Errors
       *
       **/
      freezeSigningKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Emits an event with caller's identity and CDD status.
       **/
      getCddOf: AugmentedSubmittable<
        (of: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Emits an event with caller's identity.
       **/
      getMyDid: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * It invalidates any claim generated by `cdd` from `disable_from` timestamps.
       * You can also define an expiration time, which will invalidate all claims generated by
       * that `cdd` and remove it as CDD member group.
       **/
      invalidateCddClaims: AugmentedSubmittable<
        (
          cdd: IdentityId | string | Uint8Array,
          disableFrom: Moment | AnyNumber | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Join an identity as a signing identity.
       **/
      joinIdentityAsIdentity: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Join an identity as a signing key.
       **/
      joinIdentityAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Leave an identity as a signing identity.
       **/
      leaveIdentityAsIdentity: AugmentedSubmittable<
        (did: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Leave the signing key's identity.
       **/
      leaveIdentityAsKey: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Register a new did with a CDD claim for the caller.
       **/
      registerDid: AugmentedSubmittable<
        (
          signingKeys:
            | Vec<SigningKey>
            | (SigningKey | { signer?: any; permissions?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes an authorization.
       **/
      removeAuthorization: AugmentedSubmittable<
        (
          target: Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
          authId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes specified signing keys of a DID if present.
       *
       * # Failure
       * It can only called by master key owner.
       *
       * # Weight
       * `400_000 + 60_000 * signers_to_remove.len()`
       **/
      removeSigningKeys: AugmentedSubmittable<
        (
          signersToRemove:
            | Vec<Signatory>
            | (Signatory | { Identity: any } | { Account: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Marks the specified claim as revoked.
       **/
      revokeClaim: AugmentedSubmittable<
        (
          target: IdentityId | string | Uint8Array,
          claim:
            | Claim
            | { Accredited: any }
            | { Affiliate: any }
            | { BuyLockup: any }
            | { SellLockup: any }
            | { CustomerDueDiligence: any }
            | { KnowYourCustomer: any }
            | { Jurisdiction: any }
            | { Exempted: any }
            | { Blocked: any }
            | { NoData: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It revokes the `auth` off-chain authorization of `signer`. It only takes effect if
       * the authorized transaction is not yet executed.
       **/
      revokeOffchainAuthorization: AugmentedSubmittable<
        (
          signer: Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
          auth:
            | TargetIdAuthorization
            | { target_id?: any; nonce?: any; expires_at?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets a new master key for a DID.
       *
       * # Failure
       * Only called by master key owner.
       **/
      setMasterKey: AugmentedSubmittable<
        (newKey: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It sets permissions for an specific `target_key` key.
       * Only the master key of an identity is able to set signing key permissions.
       *
       * # Weight
       * `400_000 + 30_000 * permissions.len()`
       **/
      setPermissionToSigner: AugmentedSubmittable<
        (
          signer: Signatory | { Identity: any } | { Account: any } | string | Uint8Array,
          permissions:
            | Vec<Permission>
            | (Permission | 'Full' | 'Admin' | 'Operator' | 'SpendFunds' | number | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Re-enables all signing keys of the caller's identity.
       **/
      unfreezeSigningKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
    };
    imOnline: {
      /**
       * # <weight>
       * - Complexity: `O(K + E)` where K is length of `Keys` and E is length of
       * `Heartbeat.network_state.external_address`
       *
       * - `O(K)`: decoding of length `K`
       * - `O(E)`: decoding/encoding of length `E`
       * - DbReads: pallet_session `Validators`, pallet_session `CurrentIndex`, `Keys`,
       * `ReceivedHeartbeats`
       * - DbWrites: `ReceivedHeartbeats`
       * # </weight>
       **/
      heartbeat: AugmentedSubmittable<
        (
          heartbeat:
            | Heartbeat
            | {
                blockNumber?: any;
                networkState?: any;
                sessionIndex?: any;
                authorityIndex?: any;
                validatorsLen?: any;
              }
            | string
            | Uint8Array,
          signature: Signature | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set slashing params to be used in calculating `slash_fraction`
       * Only Governance committee is allowed to set these params.
       **/
      setSlashingParams: AugmentedSubmittable<
        (
          params:
            | OfflineSlashingParams
            | { max_offline_percent?: any; constant?: any; max_slash_percent?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       * # <weight>
       * - `O(1)`.
       * - One storage mutation (codec `O(1)`).
       * - One reserve operation.
       * - One event.
       * -------------------
       * - Base Weight: 28.69 µs
       * - DB Weight: 1 Read/Write (Accounts)
       * # </weight>
       **/
      claim: AugmentedSubmittable<
        (index: AccountIndex | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
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
       * # <weight>
       * - `O(1)`.
       * - One storage mutation (codec `O(1)`).
       * - Up to one reserve operation.
       * - One event.
       * -------------------
       * - Base Weight: 26.83 µs
       * - DB Weight:
       * - Reads: Indices Accounts, System Account (original owner)
       * - Writes: Indices Accounts, System Account (original owner)
       * # </weight>
       **/
      forceTransfer: AugmentedSubmittable<
        (
          updated: AccountId | string | Uint8Array,
          index: AccountIndex | AnyNumber | Uint8Array,
          freeze: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       * # <weight>
       * - `O(1)`.
       * - One storage mutation (codec `O(1)`).
       * - One reserve operation.
       * - One event.
       * -------------------
       * - Base Weight: 25.53 µs
       * - DB Weight: 1 Read/Write (Accounts)
       * # </weight>
       **/
      free: AugmentedSubmittable<
        (index: AccountIndex | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Freeze an index so it will always point to the sender account. This consumes the deposit.
       *
       * The dispatch origin for this call must be _Signed_ and the signing account must have a
       * non-frozen account `index`.
       *
       * - `index`: the index to be frozen in place.
       *
       * Emits `IndexFrozen` if successful.
       *
       * # <weight>
       * - `O(1)`.
       * - One storage mutation (codec `O(1)`).
       * - Up to one slash operation.
       * - One event.
       * -------------------
       * - Base Weight: 30.86 µs
       * - DB Weight: 1 Read/Write (Accounts)
       * # </weight>
       **/
      freeze: AugmentedSubmittable<
        (index: AccountIndex | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
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
       * # <weight>
       * - `O(1)`.
       * - One storage mutation (codec `O(1)`).
       * - One transfer operation.
       * - One event.
       * -------------------
       * - Base Weight: 33.74 µs
       * - DB Weight:
       * - Reads: Indices Accounts, System Account (recipient)
       * - Writes: Indices Accounts, System Account (recipient)
       * # </weight>
       **/
      transfer: AugmentedSubmittable<
        (
          updated: AccountId | string | Uint8Array,
          index: AccountIndex | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    multiSig: {
      /**
       * Accepts a multisig signer authorization given to signer's identity.
       *
       * # Arguments
       * * `proposal_id` - Auth id of the authorization.
       **/
      acceptMultisigSignerAsIdentity: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accepts a multisig signer authorization given to signer's key (AccountId).
       *
       * # Arguments
       * * `proposal_id` - Auth id of the authorization.
       **/
      acceptMultisigSignerAsKey: AugmentedSubmittable<
        (authId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a signer to the multisig. This must be called by the multisig itself.
       *
       * # Arguments
       * * `signer` - Signatory to add.
       **/
      addMultisigSigner: AugmentedSubmittable<
        (
          signer: Signatory | { Identity: any } | { Account: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       * `100_000 + 300_000 * signers.len()`
       **/
      addMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          signers:
            | Vec<Signatory>
            | (Signatory | { Identity: any } | { Account: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
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
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Approves a multisig proposal using the caller's signing key (`AccountId`).
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to approve.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      approveAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Replaces all existing signers of the given multisig and changes the number of required
       * signatures.
       *
       * NOTE: Once this function get executed no other function of the multisig is allowed to
       * execute until unless enough potential signers accept the authorization whose count is
       * greater than or equal to the number of required signatures.
       *
       * # Arguments
       * * signers - Vector of signers for a given multisig.
       * * sigs_required - Number of signature required for a given multisig.
       *
       * # Weight
       * `200_000 + 300_000 * signers.len()`
       **/
      changeAllSignersAndSigsRequired: AugmentedSubmittable<
        (
          signers:
            | Vec<Signatory>
            | (Signatory | { Identity: any } | { Account: any } | string | Uint8Array)[],
          sigsRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the number of signatures required by a multisig. This must be called by the
       * multisig itself.
       *
       * # Arguments
       * * `sigs_required` - New number of required signatures.
       **/
      changeSigsRequired: AugmentedSubmittable<
        (sigsRequired: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
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
            | Vec<Signatory>
            | (Signatory | { Identity: any } | { Account: any } | string | Uint8Array)[],
          sigsRequired: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       **/
      createOrApproveProposalAsIdentity: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       **/
      createOrApproveProposalAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          multisig: AccountId | string | Uint8Array,
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          expiry: Option<Moment> | null | object | string | Uint8Array,
          autoClose: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a multisig as the master key of the current did if the current did is the creator
       * of the multisig.
       *
       * # Arguments
       * * `multi_sig` - multi sig address
       **/
      makeMultisigMaster: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          optionalCddAuthId: Option<u64> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Adds a multisig as a signer of current did if the current did is the creator of the
       * multisig.
       *
       * # Arguments
       * * `multi_sig` - multi sig address
       **/
      makeMultisigSigner: AugmentedSubmittable<
        (multisig: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
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
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Rejects a multisig proposal using the caller's signing key (`AccountId`).
       *
       * # Arguments
       * * `multisig` - MultiSig address.
       * * `proposal_id` - Proposal id to reject.
       * If quorum is reached, the proposal will be immediately executed.
       **/
      rejectAsKey: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          proposalId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Removes a signer from the multisig. This must be called by the multisig itself.
       *
       * # Arguments
       * * `signer` - Signatory to remove.
       **/
      removeMultisigSigner: AugmentedSubmittable<
        (
          signer: Signatory | { Identity: any } | { Account: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
       * `150_000 + 150_000 * signers.len()`
       **/
      removeMultisigSignersViaCreator: AugmentedSubmittable<
        (
          multisig: AccountId | string | Uint8Array,
          signers:
            | Vec<Signatory>
            | (Signatory | { Identity: any } | { Account: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    pips: {
      /**
       * It amends the `url` and the `description` of the proposal with `id`.
       *
       * # Errors
       * * `BadOrigin`: Only the owner of the proposal can amend it.
       * * `ProposalIsImmutable`: A proposals is mutable only during its cool off period.
       *
       **/
      amendProposal: AugmentedSubmittable<
        (
          id: PipId | AnyNumber | Uint8Array,
          url: Option<Url> | null | object | string | Uint8Array,
          description: Option<PipDescription> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Id bonds an additional deposit to proposal with id `id`.
       * That amount is added to the current deposit.
       *
       * # Errors
       * * `BadOrigin`: Only the owner of the proposal can bond an additional deposit.
       * * `ProposalIsImmutable`: A Proposal is mutable only during its cool off period.
       **/
      bondAdditionalDeposit: AugmentedSubmittable<
        (
          id: PipId | AnyNumber | Uint8Array,
          additionalDeposit: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It cancels the proposal of the id `id`.
       *
       * Proposals can be cancelled only during its _cool-off period.
       *
       * # Errors
       * * `BadOrigin`: Only the owner of the proposal can amend it.
       * * `ProposalIsImmutable`: A Proposal is mutable only during its cool off period.
       **/
      cancelProposal: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Governance committee can make a proposal that automatically becomes a referendum on
       * which the committee can vote on.
       **/
      emergencyReferendum: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          url: Option<Url> | null | object | string | Uint8Array,
          description: Option<PipDescription> | null | object | string | Uint8Array,
          beneficiaries: Option<Vec<Beneficiary>> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Moves a referendum instance into dispatch queue.
       **/
      enactReferendum: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Any governance committee member can fast track a proposal and turn it into a referendum
       * that will be voted on by the committee.
       **/
      fastTrackProposal: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An emergency stop measure to kill a proposal. Governance committee can kill
       * a proposal at any time.
       **/
      killProposal: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It updates the enactment period of a specific referendum.
       *
       * # Arguments
       * * `until`, It defines the future block where the enactment period will finished.  A
       * `None` value means that enactment period is going to finish in the next block.
       *
       * # Errors
       * * `BadOrigin`, Only the release coordinator can update the enactment period.
       * * ``,
       **/
      overrideReferendumEnactmentPeriod: AugmentedSubmittable<
        (
          id: PipId | AnyNumber | Uint8Array,
          until: Option<BlockNumber> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * A network member creates a PIP by submitting a dispatchable which
       * changes the network in someway. A minimum deposit is required to open a new proposal.
       *
       * # Arguments
       * * `proposal` a dispatchable call
       * * `deposit` minimum deposit value
       * * `url` a link to a website for proposal discussion
       **/
      propose: AugmentedSubmittable<
        (
          proposal: Proposal | { callIndex?: any; args?: any } | string | Uint8Array,
          deposit: BalanceOf | AnyNumber | Uint8Array,
          url: Option<Url> | null | object | string | Uint8Array,
          description: Option<PipDescription> | null | object | string | Uint8Array,
          beneficiaries: Option<Vec<Beneficiary>> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * An emergency stop measure to kill a proposal. Governance committee can kill
       * a proposal at any time.
       **/
      pruneProposal: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Moves a referendum instance into rejected state.
       **/
      rejectReferendum: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the default enact period.
       **/
      setDefaultEnactmentPeriod: AugmentedSubmittable<
        (duration: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the minimum proposal deposit amount required to start a proposal. Only Governance
       * committee is allowed to change this value.
       *
       * # Arguments
       * * `deposit` the new min deposit required to start a proposal
       **/
      setMinProposalDeposit: AugmentedSubmittable<
        (deposit: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the proposal cool off period value. This is the number of blocks after which the proposer of a pip
       * can modify or cancel their proposal, and other voting is prohibited
       *
       * # Arguments
       * * `duration` proposal cool off period duration in blocks
       **/
      setProposalCoolOffPeriod: AugmentedSubmittable<
        (duration: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the proposal duration value. This is the number of blocks for which votes are
       * accepted on a proposal. Only Governance committee is allowed to change this value.
       *
       * # Arguments
       * * `duration` proposal duration in blocks
       **/
      setProposalDuration: AugmentedSubmittable<
        (duration: BlockNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change whether completed PIPs are pruned. Can only be called by governance council
       *
       * # Arguments
       * * `deposit` the new min deposit required to start a proposal
       **/
      setPruneHistoricalPips: AugmentedSubmittable<
        (newValue: bool | boolean | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the quorum threshold amount. This is the amount which a proposal must gather so
       * as to be considered by a committee. Only Governance committee is allowed to change
       * this value.
       *
       * # Arguments
       * * `threshold` the new quorum threshold amount value
       **/
      setQuorumThreshold: AugmentedSubmittable<
        (threshold: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It unbonds any amount from the deposit of the proposal with id `id`.
       *
       * # Errors
       * * `BadOrigin`: Only the owner of the proposal can release part of the deposit.
       * * `ProposalIsImmutable`: A Proposal is mutable only during its cool off period.
       * * `InsufficientDeposit`: If the final deposit will be less that the minimum deposit for
       * a proposal.
       **/
      unbondDeposit: AugmentedSubmittable<
        (
          id: PipId | AnyNumber | Uint8Array,
          amount: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * A network member can vote on any PIP by selecting the id that
       * corresponds ot the dispatchable action and vote with some balance.
       *
       * # Arguments
       * * `proposal` a dispatchable call
       * * `id` proposal id
       * * `aye_or_nay` a bool representing for or against vote
       * * `deposit` minimum deposit value
       **/
      vote: AugmentedSubmittable<
        (
          id: PipId | AnyNumber | Uint8Array,
          ayeOrNay: bool | boolean | Uint8Array,
          deposit: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    polymeshCommittee: {
      /**
       * May be called by any signed account after the voting duration has ended in order to
       * finish voting and close the proposal.
       *
       * Abstentions are counted as rejections.
       *
       * # Arguments
       * * `proposal` - A hash of the proposal to be closed.
       * * `index` - The proposal index.
       *
       * # Complexity
       * - the weight of `proposal` preimage.
       * - up to three events deposited.
       * - one read, two removals, one mutation. (plus three static reads.)
       * - computation and i/o `O(P + L + M)` where:
       * - `M` is number of members,
       * - `P` is number of active proposals,
       * - `L` is the encoded length of `proposal` preimage.
       **/
      close: AugmentedSubmittable<
        (
          proposal: Hash | string | Uint8Array,
          index: Compact<ProposalIndex> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the release coordinator.
       *
       * # Arguments
       * * `id` - The DID of the new release coordinator.
       *
       * # Errors
       * * `MemberNotFound`, If the new coordinator `id` is not part of the committee.
       **/
      setReleaseCoordinator: AugmentedSubmittable<
        (id: IdentityId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Change the vote threshold the determines the winning proposal. For e.g., for a simple
       * majority use (1, 2) which represents the in-equation ">= 1/2"
       *
       * # Arguments
       * * `match_criteria` - One of {AtLeast, MoreThan}.
       * * `n` - Numerator of the fraction representing vote threshold.
       * * `d` - Denominator of the fraction representing vote threshold.
       **/
      setVoteThreshold: AugmentedSubmittable<
        (
          n: u32 | AnyNumber | Uint8Array,
          d: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      voteEnactReferendum: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      voteRejectReferendum: AugmentedSubmittable<
        (id: PipId | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    portfolio: {
      /**
       * Creates a portfolio with the given `name`.
       **/
      createPortfolio: AugmentedSubmittable<
        (name: PortfolioName | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Deletes a user portfolio and moves all its assets to the default portfolio.
       **/
      deletePortfolio: AugmentedSubmittable<
        (num: PortfolioNumber | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Moves a token amount from one portfolio of an identity to another portfolio of the same
       * identity.
       **/
      movePortfolio: AugmentedSubmittable<
        (
          fromNum: Option<PortfolioNumber> | null | object | string | Uint8Array,
          toNum: Option<PortfolioNumber> | null | object | string | Uint8Array,
          items:
            | Vec<MovePortfolioItem>
            | (MovePortfolioItem | { ticker?: any; amount?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Renames a non-default portfolio.
       **/
      renamePortfolio: AugmentedSubmittable<
        (
          num: PortfolioNumber | AnyNumber | Uint8Array,
          toName: PortfolioName | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
            | ProtocolOp
            | 'AssetRegisterTicker'
            | 'AssetIssue'
            | 'AssetAddDocument'
            | 'AssetCreateAsset'
            | 'DividendNew'
            | 'ComplianceManagerAddActiveRule'
            | 'IdentityRegisterDid'
            | 'IdentityCddRegisterDid'
            | 'IdentityAddClaim'
            | 'IdentitySetMasterKey'
            | 'IdentityAddSigningKeysWithAuthorization'
            | 'PipsPropose'
            | 'VotingAddBallot'
            | number
            | Uint8Array,
          baseFee: BalanceOf | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes the fee coefficient for the root origin.
       *
       * # Errors
       * * `BadOrigin` - Only root allowed.
       **/
      changeCoefficient: AugmentedSubmittable<
        (coefficient: PosRatio) => SubmittableExtrinsic<ApiType>
      >;
    };
    session: {
      /**
       * Removes any session key(s) of the function caller.
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be signed.
       *
       * # <weight>
       * - Complexity: `O(1)` in number of key types.
       * Actual cost depends on the number of length of `T::Keys::key_ids()` which is fixed.
       * - DbReads: `T::ValidatorIdOf`, `NextKeys`, `origin account`
       * - DbWrites: `NextKeys`, `origin account`
       * - DbWrites per key id: `KeyOwnder`
       * # </weight>
       **/
      purgeKeys: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Sets the session key(s) of the function caller to `keys`.
       * Allows an account to set its session key prior to becoming a validator.
       * This doesn't take effect until the next session.
       *
       * The dispatch origin of this function must be signed.
       *
       * # <weight>
       * - Complexity: `O(1)`
       * Actual cost depends on the number of length of `T::Keys::key_ids()` which is fixed.
       * - DbReads: `origin account`, `T::ValidatorIdOf`, `NextKeys`
       * - DbWrites: `origin account`, `NextKeys`
       * - DbReads per key id: `KeyOwner`
       * - DbWrites per key id: `KeyOwner`
       * # </weight>
       **/
      setKeys: AugmentedSubmittable<
        (keys: Keys, proof: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    settlement: {
      /**
       * Adds a new instruction.
       *
       * # Arguments
       * * `venue_id` - ID of the venue this instruction belongs to.
       * * `settlement_type` - Defines if the instruction should be settled
       * immediately after receiving all auths or waiting till a specific block.
       * * `valid_from` - Optional date from which people can interact with this instruction.
       * * `legs` - Legs included in this instruction.
       *
       * # Weight
       * `200_000 + 100_000 * legs.len()`
       **/
      addInstruction: AugmentedSubmittable<
        (
          venueId: u64 | AnyNumber | Uint8Array,
          settlementType:
            | SettlementType
            | { SettleOnAuthorization: any }
            | { SettleOnBlock: any }
            | string
            | Uint8Array,
          validFrom: Option<Moment> | null | object | string | Uint8Array,
          legs:
            | Vec<Leg>
            | (Leg | { from?: any; to?: any; asset?: any; amount?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Allows additional venues to create instructions involving an asset.
       *
       * * `ticker` - Ticker of the token in question.
       * * `venues` - Array of venues that are allowed to create instructions for the token in question.
       *
       * # Weight
       * `200_000 + 50_000 * venues.len()`
       **/
      allowVenues: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Authorizes an existing instruction.
       *
       * # Arguments
       * * `instruction_id` - Instruction id to authorize.
       **/
      authorizeInstruction: AugmentedSubmittable<
        (instructionId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Accepts an instruction and claims a signed receipt.
       *
       * # Arguments
       * * `instruction_id` - Target instruction id.
       * * `leg_id` - Target leg id for the receipt
       * * `receipt_uid` - Receipt ID generated by the signer.
       * * `signer` - Signer of the receipt.
       * * `signed_data` - Signed receipt.
       **/
      authorizeWithReceipts: AugmentedSubmittable<
        (
          instructionId: u64 | AnyNumber | Uint8Array,
          receiptDetails:
            | Vec<ReceiptDetails>
            | (
                | ReceiptDetails
                | { receipt_uid?: any; leg_id?: any; signer?: any; signature?: any }
                | string
                | Uint8Array
              )[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Claims a signed receipt.
       *
       * # Arguments
       * * `instruction_id` - Target instruction id for the receipt.
       * * `leg_id` - Target leg id for the receipt
       * * `receipt_uid` - Receipt ID generated by the signer.
       * * `signer` - Signer of the receipt.
       * * `signed_data` - Signed receipt.
       **/
      claimReceipt: AugmentedSubmittable<
        (
          instructionId: u64 | AnyNumber | Uint8Array,
          receiptDetails:
            | ReceiptDetails
            | { receipt_uid?: any; leg_id?: any; signer?: any; signature?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Registers a new venue.
       *
       * * `details` - Extra details about a venue
       * * `signers` - Array of signers that are allowed to sign receipts for this venue
       *
       * # Weight
       * `200_000 + 50_000 * signers.len()`
       **/
      createVenue: AugmentedSubmittable<
        (
          details: VenueDetails | string,
          signers: Vec<AccountId> | (AccountId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Revokes permission given to venues for creating instructions involving a particular asset.
       *
       * * `ticker` - Ticker of the token in question.
       * * `venues` - Array of venues that are no longer allowed to create instructions for the token in question.
       *
       * # Weight
       * `200_000 + 50_000 * venues.len()`
       **/
      disallowVenues: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          venues: Vec<u64> | (u64 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Rejects an existing instruction.
       *
       * # Arguments
       * * `instruction_id` - Instruction id to reject.
       **/
      rejectInstruction: AugmentedSubmittable<
        (instructionId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Enables or disabled venue filtering for a token.
       *
       * # Arguments
       * * `ticker` - Ticker of the token in question.
       * * `enabled` - Boolean that decides if the filtering should be enabled.
       **/
      setVenueFiltering: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          enabled: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unauthorizes an existing instruction.
       *
       * # Arguments
       * * `instruction_id` - Instruction id to unauthorize.
       **/
      unauthorizeInstruction: AugmentedSubmittable<
        (instructionId: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unclaims a previously claimed receipt.
       *
       * # Arguments
       * * `instruction_id` - Target instruction id for the receipt.
       * * `leg_id` - Target leg id for the receipt
       **/
      unclaimReceipt: AugmentedSubmittable<
        (
          instructionId: u64 | AnyNumber | Uint8Array,
          legId: u64 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    simpleToken: {
      /**
       * Approve another identity to transfer tokens on behalf of the caller
       **/
      approve: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          spenderDid: IdentityId | string | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Create a new token and mint a balance to the issuing identity
       **/
      createToken: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          totalSupply: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens to another identity
       **/
      transfer: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          amount: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Transfer tokens to another identity using the approval mechanic
       **/
      transferFrom: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          fromDid: IdentityId | string | Uint8Array,
          toDid: IdentityId | string | Uint8Array,
          amount: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    staking: {
      /**
       * Governance committee on 2/3 rds majority can introduce a new potential validator
       * to the pool of validators. Staking module uses `PermissionedValidators` to ensure
       * validators have completed KYB compliance and considers them for validation.
       *
       * # Arguments
       * * origin Required origin for adding a potential validator.
       * * validator Stash AccountId of the validator.
       **/
      addPermissionedValidator: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Take the origin account as a stash and lock up `value` of its balance. `controller` will
       * be the account that controls it.
       *
       * `value` must be more than the `minimum_balance` specified by `T::Currency`.
       *
       * The dispatch origin for this call must be _Signed_ by the stash account.
       *
       * Emits `Bonded`.
       *
       * # <weight>
       * - Independent of the arguments. Moderate complexity.
       * - O(1).
       * - Three extra DB entries.
       *
       * NOTE: Two of the storage writes (`Self::bonded`, `Self::payee`) are _never_ cleaned
       * unless the `origin` falls below _existential deposit_ and gets removed as dust.
       * ------------------
       * Base Weight: 67.87 µs
       * DB Weight:
       * - Read: Bonded, Ledger, [Origin Account], Current Era, History Depth, Locks
       * - Write: Bonded, Payee, [Origin Account], Locks, Ledger
       * # </weight>
       * # Arguments
       * * origin Stash account (signer of the extrinsic).
       * * controller Account that controls the operation of stash.
       * * payee Destination where reward can be transferred.
       **/
      bond: AugmentedSubmittable<
        (
          controller: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          value: Compact<BalanceOf> | AnyNumber | Uint8Array,
          payee: RewardDestination | 'Staked' | 'Stash' | 'Controller' | number | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Add some extra amount that have appeared in the stash `free_balance` into the balance up
       * for staking.
       *
       * Use this if there are additional funds in your stash account that you wish to bond.
       * Unlike [`bond`] or [`unbond`] this function does not impose any limitation on the amount
       * that can be added.
       *
       * The dispatch origin for this call must be _Signed_ by the stash, not the controller and
       * it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * Emits `Bonded`.
       *
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - O(1).
       * - One DB entry.
       * ------------
       * Base Weight: 54.88 µs
       * DB Weight:
       * - Read: Era Election Status, Bonded, Ledger, [Origin Account], Locks
       * - Write: [Origin Account], Locks, Ledger
       * # </weight>
       *
       * # Arguments
       * * origin Stash account (signer of the extrinsic).
       * * max_additional Extra amount that need to be bonded.
       **/
      bondExtra: AugmentedSubmittable<
        (
          maxAdditional: Compact<BalanceOf> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Cancel enactment of a deferred slash.
       *
       * Can be called by either the root origin or the `T::SlashCancelOrigin`.
       *
       * Parameters: era and indices of the slashes for that era to kill.
       *
       * # <weight>
       * Complexity: O(U + S)
       * with U unapplied slashes weighted with U=1000
       * and S is the number of slash indices to be canceled.
       * - Base: 5870 + 34.61 * S µs
       * - Read: Unapplied Slashes
       * - Write: Unapplied Slashes
       * # </weight>
       **/
      cancelDeferredSlash: AugmentedSubmittable<
        (
          era: EraIndex | AnyNumber | Uint8Array,
          slashIndices: Vec<u32> | (u32 | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Declare no desire to either validate or nominate.
       *
       * Effects will be felt at the beginning of the next era.
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * And, it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains one read.
       * - Writes are limited to the `origin` account key.
       * --------
       * Base Weight: 16.53 µs
       * DB Weight:
       * - Read: EraElectionStatus, Ledger
       * - Write: Validators, Nominators
       * # </weight>
       **/
      chill: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Enables individual commissions. This can be set only once. Once individual commission
       * rates are enabled, there's no going back.  Only Governance committee is allowed to
       * change this value.
       **/
      enableIndividualCommissions: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Force there to be a new era at the end of the next session. After this, it will be
       * reset to normal (non-forced) behaviour.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * - No arguments.
       * - Base Weight: 1.959 µs
       * - Write ForceEra
       * # </weight>
       **/
      forceNewEra: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Force there to be a new era at the end of sessions indefinitely.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * - Base Weight: 2.05 µs
       * - Write: ForceEra
       * # </weight>
       **/
      forceNewEraAlways: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Force there to be no new eras indefinitely.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * - No arguments.
       * - Base Weight: 1.857 µs
       * - Write: ForceEra
       * # </weight>
       **/
      forceNoEras: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
      /**
       * Force a current staker to become completely unstaked, immediately.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * O(S) where S is the number of slashing spans to be removed
       * Base Weight: 53.07 + 2.365 * S µs
       * Reads: Bonded, Slashing Spans, Account, Locks
       * Writes: Bonded, Slashing Spans (if S > 0), Ledger, Payee, Validators, Nominators, Account, Locks
       * Writes Each: SpanSlash * S
       * # </weight>
       **/
      forceUnstake: AugmentedSubmittable<
        (
          stash: AccountId | string | Uint8Array,
          numSlashingSpans: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Increments the ideal number of validators.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * Base Weight: 1.717 µs
       * Read/Write: Validator Count
       * # </weight>
       **/
      increaseValidatorCount: AugmentedSubmittable<
        (additional: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Declare the desire to nominate `targets` for the origin controller.
       *
       * Effects will be felt at the beginning of the next era. This can only be called when
       * [`EraElectionStatus`] is `Closed`.
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * And, it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * # <weight>
       * - The transaction's complexity is proportional to the size of `targets` (N)
       * which is capped at CompactAssignments::LIMIT (MAX_NOMINATIONS).
       * - Both the reads and writes follow a similar pattern.
       * ---------
       * Base Weight: 22.34 + .36 * N µs
       * where N is the number of targets
       * DB Weight:
       * - Reads: Era Election Status, Ledger, Current Era
       * - Writes: Validators, Nominators
       * # </weight>
       **/
      nominate: AugmentedSubmittable<
        (
          targets:
            | Vec<LookupSource>
            | (LookupSource | Address | AccountId | AccountIndex | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Pay out all the stakers behind a single validator for a single era.
       *
       * - `validator_stash` is the stash account of the validator. Their nominators, up to
       * `T::MaxNominatorRewardedPerValidator`, will also receive their rewards.
       * - `era` may be any era between `[current_era - history_depth; current_era]`.
       *
       * The origin of this call must be _Signed_. Any account can call this function, even if
       * it is not one of the stakers.
       *
       * This can only be called when [`EraElectionStatus`] is `Closed`.
       *
       * # <weight>
       * - Time complexity: at most O(MaxNominatorRewardedPerValidator).
       * - Contains a limited number of reads and writes.
       * -----------
       * N is the Number of payouts for the validator (including the validator)
       * Base Weight:
       * - Reward Destination Staked: 110 + 54.2 * N µs (Median Slopes)
       * - Reward Destination Controller (Creating): 120 + 41.95 * N µs (Median Slopes)
       * DB Weight:
       * - Read: EraElectionStatus, CurrentEra, HistoryDepth, ErasValidatorReward,
       * ErasStakersClipped, ErasRewardPoints, ErasValidatorPrefs (8 items)
       * - Read Each: Bonded, Ledger, Payee, Locks, System Account (5 items)
       * - Write Each: System Account, Locks, Ledger (3 items)
       * # </weight>
       **/
      payoutStakers: AugmentedSubmittable<
        (
          validatorStash: AccountId | string | Uint8Array,
          era: EraIndex | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove all data structure concerning a staker/stash once its balance is zero.
       * This is essentially equivalent to `withdraw_unbonded` except it can be called by anyone
       * and the target `stash` must have no funds left.
       *
       * This can be called from any origin.
       *
       * - `stash`: The stash account to reap. Its balance must be zero.
       *
       * # <weight>
       * Complexity: O(S) where S is the number of slashing spans on the account.
       * Base Weight: 75.94 + 2.396 * S µs
       * DB Weight:
       * - Reads: Stash Account, Bonded, Slashing Spans, Locks
       * - Writes: Bonded, Slashing Spans (if S > 0), Ledger, Payee, Validators, Nominators, Stash Account, Locks
       * - Writes Each: SpanSlash * S
       * # </weight>
       **/
      reapStash: AugmentedSubmittable<
        (
          stash: AccountId | string | Uint8Array,
          numSlashingSpans: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Rebond a portion of the stash scheduled to be unlocked.
       *
       * The dispatch origin must be signed by the controller, and it can be only called when
       * [`EraElectionStatus`] is `Closed`.
       *
       * # <weight>
       * - Time complexity: O(L), where L is unlocking chunks
       * - Bounded by `MAX_UNLOCKING_CHUNKS`.
       * - Storage changes: Can't increase storage, only decrease it.
       * ---------------
       * - Base Weight: 34.51 µs * .048 L µs
       * - DB Weight:
       * - Reads: EraElectionStatus, Ledger, Locks, [Origin Account]
       * - Writes: [Origin Account], Locks, Ledger
       * # </weight>
       **/
      rebond: AugmentedSubmittable<
        (value: Compact<BalanceOf> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove a validator from the pool of validators. Effects are known in the next session.
       * Staking module checks `PermissionedValidators` to ensure validators have
       * completed KYB compliance
       *
       * # Arguments
       * * origin Required origin for removing a potential validator.
       * * validator Stash AccountId of the validator.
       **/
      removePermissionedValidator: AugmentedSubmittable<
        (validator: AccountId | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Scale up the ideal number of validators by a factor.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * Base Weight: 1.717 µs
       * Read/Write: Validator Count
       * # </weight>
       **/
      scaleValidatorCount: AugmentedSubmittable<
        (factor: Percent | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * (Re-)set the controller of a stash.
       *
       * Effects will be felt at the beginning of the next era.
       *
       * The dispatch origin for this call must be _Signed_ by the stash, not the controller.
       *
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * ----------
       * Base Weight: 25.22 µs
       * DB Weight:
       * - Read: Bonded, Ledger New Controller, Ledger Old Controller
       * - Write: Bonded, Ledger New Controller, Ledger Old Controller
       * # </weight>
       **/
      setController: AugmentedSubmittable<
        (
          controller: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes commission rate which applies to all validators. Only Governance
       * committee is allowed to change this value.
       *
       * # Arguments
       * * `new_value` the new commission to be used for reward calculations
       **/
      setGlobalCommission: AugmentedSubmittable<
        (newValue: Perbill | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set `HistoryDepth` value. This function will delete any history information
       * when `HistoryDepth` is reduced.
       *
       * Parameters:
       * - `new_history_depth`: The new history depth you would like to set.
       * - `era_items_deleted`: The number of items that will be deleted by this dispatch.
       * This should report all the storage items that will be deleted by clearing old
       * era history. Needed to report an accurate weight for the dispatch. Trusted by
       * `Root` to report an accurate number.
       *
       * Origin must be root.
       *
       * # <weight>
       * - E: Number of history depths removed, i.e. 10 -> 7 = 3
       * - Base Weight: 29.13 * E µs
       * - DB Weight:
       * - Reads: Current Era, History Depth
       * - Writes: History Depth
       * - Clear Prefix Each: Era Stakers, EraStakersClipped, ErasValidatorPrefs
       * - Writes Each: ErasValidatorReward, ErasRewardPoints, ErasTotalStake, ErasStartSessionIndex
       * # </weight>
       **/
      setHistoryDepth: AugmentedSubmittable<
        (
          newHistoryDepth: Compact<EraIndex> | AnyNumber | Uint8Array,
          eraItemsDeleted: Compact<u32> | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the validators who cannot be slashed (if any).
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * - O(V)
       * - Base Weight: 2.208 + .006 * V µs
       * - Write: Invulnerables
       * # </weight>
       **/
      setInvulnerables: AugmentedSubmittable<
        (
          validators: Vec<AccountId> | (AccountId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Changes min bond value to be used in bond(). Only Governance
       * committee is allowed to change this value.
       *
       * # Arguments
       * * `new_value` the new minimum
       **/
      setMinBondThreshold: AugmentedSubmittable<
        (newValue: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * (Re-)set the payment target for a controller.
       *
       * Effects will be felt at the beginning of the next era.
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       *
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * ---------
       * - Base Weight: 11.33 µs
       * - DB Weight:
       * - Read: Ledger
       * - Write: Payee
       * # </weight>
       **/
      setPayee: AugmentedSubmittable<
        (
          payee: RewardDestination | 'Staked' | 'Stash' | 'Controller' | number | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Sets the ideal number of validators.
       *
       * The dispatch origin must be Root.
       *
       * # <weight>
       * Base Weight: 1.717 µs
       * Write: Validator Count
       * # </weight>
       **/
      setValidatorCount: AugmentedSubmittable<
        (updated: Compact<u32> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Submit an election result to the chain. If the solution:
       *
       * 1. is valid.
       * 2. has a better score than a potentially existing solution on chain.
       *
       * then, it will be _put_ on chain.
       *
       * A solution consists of two pieces of data:
       *
       * 1. `winners`: a flat vector of all the winners of the round.
       * 2. `assignments`: the compact version of an assignment vector that encodes the edge
       * weights.
       *
       * Both of which may be computed using _phragmen_, or any other algorithm.
       *
       * Additionally, the submitter must provide:
       *
       * - The `score` that they claim their solution has.
       *
       * Both validators and nominators will be represented by indices in the solution. The
       * indices should respect the corresponding types ([`ValidatorIndex`] and
       * [`NominatorIndex`]). Moreover, they should be valid when used to index into
       * [`SnapshotValidators`] and [`SnapshotNominators`]. Any invalid index will cause the
       * solution to be rejected. These two storage items are set during the election window and
       * may be used to determine the indices.
       *
       * A solution is valid if:
       *
       * 0. It is submitted when [`EraElectionStatus`] is `Open`.
       * 1. Its claimed score is equal to the score computed on-chain.
       * 2. Presents the correct number of winners.
       * 3. All indexes must be value according to the snapshot vectors. All edge values must
       * also be correct and should not overflow the granularity of the ratio type (i.e. 256
       * or billion).
       * 4. For each edge, all targets are actually nominated by the voter.
       * 5. Has correct self-votes.
       *
       * A solutions score is consisted of 3 parameters:
       *
       * 1. `min { support.total }` for each support of a winner. This value should be maximized.
       * 2. `sum { support.total }` for each support of a winner. This value should be minimized.
       * 3. `sum { support.total^2 }` for each support of a winner. This value should be
       * minimized (to ensure less variance)
       *
       * # <weight>
       * See `crate::weight` module.
       * # </weight>
       **/
      submitElectionSolution: AugmentedSubmittable<
        (
          winners: Vec<ValidatorIndex> | (ValidatorIndex | AnyNumber | Uint8Array)[],
          compact:
            | CompactAssignments
            | {
                votes1?: any;
                votes2?: any;
                votes3?: any;
                votes4?: any;
                votes5?: any;
                votes6?: any;
                votes7?: any;
                votes8?: any;
                votes9?: any;
                votes10?: any;
                votes11?: any;
                votes12?: any;
                votes13?: any;
                votes14?: any;
                votes15?: any;
                votes16?: any;
              }
            | string
            | Uint8Array,
          score: ElectionScore,
          era: EraIndex | AnyNumber | Uint8Array,
          size: ElectionSize | { validators?: any; nominators?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Unsigned version of `submit_election_solution`.
       *
       * Note that this must pass the [`ValidateUnsigned`] check which only allows transactions
       * from the local node to be included. In other words, only the block author can include a
       * transaction in the block.
       *
       * # <weight>
       * See `crate::weight` module.
       * # </weight>
       **/
      submitElectionSolutionUnsigned: AugmentedSubmittable<
        (
          winners: Vec<ValidatorIndex> | (ValidatorIndex | AnyNumber | Uint8Array)[],
          compact:
            | CompactAssignments
            | {
                votes1?: any;
                votes2?: any;
                votes3?: any;
                votes4?: any;
                votes5?: any;
                votes6?: any;
                votes7?: any;
                votes8?: any;
                votes9?: any;
                votes10?: any;
                votes11?: any;
                votes12?: any;
                votes13?: any;
                votes14?: any;
                votes15?: any;
                votes16?: any;
              }
            | string
            | Uint8Array,
          score: ElectionScore,
          era: EraIndex | AnyNumber | Uint8Array,
          size: ElectionSize | { validators?: any; nominators?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Schedule a portion of the stash to be unlocked ready for transfer out after the bond
       * period ends. If this leaves an amount actively bonded less than
       * T::Currency::minimum_balance(), then it is increased to the full amount.
       *
       * Once the unlock period is done, you can call `withdraw_unbonded` to actually move
       * the funds out of management ready for transfer.
       *
       * No more than a limited number of unlocking chunks (see `MAX_UNLOCKING_CHUNKS`)
       * can co-exists at the same time. In that case, [`Call::withdraw_unbonded`] need
       * to be called first to remove some of the chunks (if possible).
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * And, it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * Emits `Unbonded`.
       *
       * See also [`Call::withdraw_unbonded`].
       *
       * # <weight>
       * - Independent of the arguments. Limited but potentially exploitable complexity.
       * - Contains a limited number of reads.
       * - Each call (requires the remainder of the bonded balance to be above `minimum_balance`)
       * will cause a new entry to be inserted into a vector (`Ledger.unlocking`) kept in storage.
       * The only way to clean the aforementioned storage item is also user-controlled via
       * `withdraw_unbonded`.
       * - One DB entry.
       * ----------
       * Base Weight: 50.34 µs
       * DB Weight:
       * - Read: Era Election Status, Ledger, Current Era, Locks, [Origin Account]
       * - Write: [Origin Account], Locks, Ledger
       * </weight>
       *
       * # Arguments
       * * origin Controller (Signer of the extrinsic).
       * * value Balance needs to be unbonded.
       **/
      unbond: AugmentedSubmittable<
        (value: Compact<BalanceOf> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Declare the desire to validate for the origin controller.
       *
       * Effects will be felt at the beginning of the next era.
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * And, it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * # <weight>
       * - Independent of the arguments. Insignificant complexity.
       * - Contains a limited number of reads.
       * - Writes are limited to the `origin` account key.
       * -----------
       * Base Weight: 17.13 µs
       * DB Weight:
       * - Read: Era Election Status, Ledger
       * - Write: Nominators, Validators
       * # </weight>
       **/
      validate: AugmentedSubmittable<
        (
          prefs: ValidatorPrefs | { commission?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Validate the nominators CDD expiry time.
       *
       * If an account from a given set of address is nominating then
       * check the CDD expiry time of it and if it is expired
       * then the account should be unbonded and removed from the nominating process.
       *
       * #<weight>
       * - Depends on passed list of AccountId.
       * - Depends on the no. of claim issuers an accountId has for the CDD expiry.
       * #</weight>
       **/
      validateCddExpiryNominators: AugmentedSubmittable<
        (
          targets: Vec<AccountId> | (AccountId | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Remove any unlocked chunks from the `unlocking` queue from our management.
       *
       * This essentially frees up that balance to be used by the stash account to do
       * whatever it wants.
       *
       * The dispatch origin for this call must be _Signed_ by the controller, not the stash.
       * And, it can be only called when [`EraElectionStatus`] is `Closed`.
       *
       * Emits `Withdrawn`.
       *
       * See also [`Call::unbond`].
       *
       * # <weight>
       * - Could be dependent on the `origin` argument and how much `unlocking` chunks exist.
       * It implies `consolidate_unlocked` which loops over `Ledger.unlocking`, which is
       * indirectly user-controlled. See [`unbond`] for more detail.
       * - Contains a limited number of reads, yet the size of which could be large based on `ledger`.
       * - Writes are limited to the `origin` account key.
       * ---------------
       * Complexity O(S) where S is the number of slashing spans to remove
       * Base Weight:
       * Update: 50.52 + .028 * S µs
       * - Reads: EraElectionStatus, Ledger, Current Era, Locks, [Origin Account]
       * - Writes: [Origin Account], Locks, Ledger
       * Kill: 79.41 + 2.366 * S µs
       * - Reads: EraElectionStatus, Ledger, Current Era, Bonded, Slashing Spans, [Origin Account], Locks
       * - Writes: Bonded, Slashing Spans (if S > 0), Ledger, Payee, Validators, Nominators, [Origin Account], Locks
       * - Writes Each: SpanSlash * S
       * NOTE: Weight annotation is the kill scenario, we refund otherwise.
       * # </weight>
       **/
      withdrawUnbonded: AugmentedSubmittable<
        (numSlashingSpans: u32 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    stoCapped: {
      /**
       * Used to buy tokens
       *
       * # Arguments
       * * `origin` Signing key of the investor
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in
       * * `value` Amount of POLYX wants to invest in
       **/
      buyTokens: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          value: Balance | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to buy tokens using stable coins
       *
       * # Arguments
       * * `origin` Signing key of the investor
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in
       * * `value` Amount of POLYX wants to invest in
       * * `simple_token_ticker` Ticker of the simple token
       **/
      buyTokensBySimpleToken: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          value: Balance | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Used to initialize the STO for a given asset
       *
       * # Arguments
       * * `origin` Signing key of the token owner who wants to initialize the sto
       * * `ticker` Ticker of the token
       * * `beneficiary_did` DID which holds all the funds collected
       * * `cap` Total amount of tokens allowed for sale
       * * `rate` Rate of asset in terms of native currency
       * * `start_date` Unix timestamp at when STO starts
       * * `end_date` Unix timestamp at when STO ends
       * * `simple_token_ticker` Ticker of the simple token
       **/
      launchSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          beneficiaryDid: IdentityId | string | Uint8Array,
          cap: Balance | AnyNumber | Uint8Array,
          rate: u128 | AnyNumber | Uint8Array,
          startDate: Moment | AnyNumber | Uint8Array,
          endDate: Moment | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Modify the list of allowed tokens (stable coins) corresponds to given token/asset
       *
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO investor wants to invest in.
       * * `simple_token_ticker` Ticker of the stable coin
       * * `modify_status` Boolean to know whether the provided simple token ticker will be used or not.
       **/
      modifyAllowedTokens: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array,
          simpleTokenTicker: Ticker | string | Uint8Array,
          modifyStatus: bool | boolean | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Pause the STO, Can only be called by the token owner
       * By doing this every operations on given sto_id would get freezed like buy_tokens
       *
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO needs to paused
       **/
      pauseSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Un-pause the STO, Can only be called by the token owner
       * By doing this every operations on given sto_id would get un freezed.
       *
       * # Arguments
       * * `origin` Signing key of the token owner
       * * `ticker` Ticker of the token
       * * `sto_id` A unique identifier to know which STO needs to un paused
       **/
      unpauseSto: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          stoId: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          updated: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
        (
          call: Call | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          who: LookupSource | Address | AccountId | AccountIndex | string | Uint8Array,
          call: Call | { callIndex?: any; args?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
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
          call: Call | { callIndex?: any; args?: any } | string | Uint8Array,
          weight: Weight | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    system: {
      /**
       * A dispatch that will fill the block weight up to the given ratio.
       **/
      fillBlock: AugmentedSubmittable<
        (ratio: Perbill | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Kill all storage items with a key that starts with the given prefix.
       *
       * **NOTE:** We rely on the Root origin to provide us the number of subkeys under
       * the prefix we are removing to accurately calculate the weight of this function.
       *
       * # <weight>
       * - `O(P)` where `P` amount of keys with prefix `prefix`
       * - `P` storage deletions.
       * - Base Weight: 0.834 * P µs
       * - Writes: Number of subkeys + 1
       * # </weight>
       **/
      killPrefix: AugmentedSubmittable<
        (
          prefix: Key | string | Uint8Array,
          subkeys: u32 | AnyNumber | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Kill some items from storage.
       *
       * # <weight>
       * - `O(IK)` where `I` length of `keys` and `K` length of one key
       * - `I` storage deletions.
       * - Base Weight: .378 * i µs
       * - Writes: Number of items
       * # </weight>
       **/
      killStorage: AugmentedSubmittable<
        (keys: Vec<Key> | (Key | string | Uint8Array)[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Make some on-chain remark.
       *
       * # <weight>
       * - `O(1)`
       * - Base Weight: 0.665 µs, independent of remark length.
       * - No DB operations.
       * # </weight>
       **/
      remark: AugmentedSubmittable<
        (remark: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the new changes trie configuration.
       *
       * # <weight>
       * - `O(1)`
       * - 1 storage write or delete (codec `O(1)`).
       * - 1 call to `deposit_log`: Uses `append` API, so O(1)
       * - Base Weight: 7.218 µs
       * - DB Weight:
       * - Writes: Changes Trie, System Digest
       * # </weight>
       **/
      setChangesTrieConfig: AugmentedSubmittable<
        (
          changesTrieConfig: Option<ChangesTrieConfiguration> | null | object | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the new runtime code.
       *
       * # <weight>
       * - `O(C + S)` where `C` length of `code` and `S` complexity of `can_set_code`
       * - 1 storage write (codec `O(C)`).
       * - 1 call to `can_set_code`: `O(S)` (calls `sp_io::misc::runtime_version` which is expensive).
       * - 1 event.
       * The weight of this function is dependent on the runtime, but generally this is very expensive.
       * We will treat this as a full block.
       * # </weight>
       **/
      setCode: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the new runtime code without doing any checks of the given `code`.
       *
       * # <weight>
       * - `O(C)` where `C` length of `code`
       * - 1 storage write (codec `O(C)`).
       * - 1 event.
       * The weight of this function is dependent on the runtime. We will treat this as a full block.
       * # </weight>
       **/
      setCodeWithoutChecks: AugmentedSubmittable<
        (code: Bytes | string | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set the number of pages in the WebAssembly environment's heap.
       *
       * # <weight>
       * - `O(1)`
       * - 1 storage write.
       * - Base Weight: 1.405 µs
       * - 1 write to HEAP_PAGES
       * # </weight>
       **/
      setHeapPages: AugmentedSubmittable<
        (pages: u64 | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Set some items of storage.
       *
       * # <weight>
       * - `O(I)` where `I` length of `items`
       * - `I` storage writes (`O(1)`).
       * - Base Weight: 0.568 * i µs
       * - Writes: Number of items
       * # </weight>
       **/
      setStorage: AugmentedSubmittable<
        (items: Vec<KeyValue> | KeyValue[]) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Kill the sending account, assuming there are no references outstanding and the composite
       * data is equal to its default value.
       *
       * # <weight>
       * - `O(1)`
       * - 1 storage read and deletion.
       * --------------------
       * Base Weight: 8.626 µs
       * No DB Read or Write operations because caller is already in overlay
       * # </weight>
       **/
      suicide: AugmentedSubmittable<() => SubmittableExtrinsic<ApiType>>;
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
       * # <weight>
       * - `O(T)` where `T` complexity of `on_timestamp_set`
       * - 1 storage read and 1 storage mutation (codec `O(1)`). (because of `DidUpdate::take` in `on_finalize`)
       * - 1 event handler `on_timestamp_set` `O(T)`.
       * - Benchmark: 7.678 (min squares analysis)
       * - NOTE: This benchmark was done for a runtime with insignificant `on_timestamp_set` handlers.
       * New benchmarking is needed when adding new handlers.
       * # </weight>
       **/
      set: AugmentedSubmittable<
        (now: Compact<Moment> | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
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
       **/
      disbursement: AugmentedSubmittable<
        (
          beneficiaries:
            | Vec<Beneficiary>
            | (Beneficiary | { id?: any; amount?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * It transfers the specific `amount` from `origin` account into treasury.
       *
       * Only accounts which are associated to an identity can make a donation to treasury.
       **/
      reimbursement: AugmentedSubmittable<
        (amount: BalanceOf | AnyNumber | Uint8Array) => SubmittableExtrinsic<ApiType>
      >;
    };
    utility: {
      /**
       * Dispatch multiple calls from the sender's origin.
       *
       * This will execute until the first one fails and then stop.
       *
       * May be called from any origin.
       *
       * # Parameters
       * - `calls`: The calls to be dispatched from the same origin.
       *
       * # Weight
       * - The sum of the weights of the `calls`.
       * - One event.
       *
       * This will return `Ok` in all circumstances. To determine the success of the batch, an
       * event is deposited. If a call failed and the batch was interrupted, then the
       * `BatchInterrupted` event is deposited, along with the number of successful calls made
       * and the error of the failed call. If all were successful, then the `BatchCompleted`
       * event is deposited.
       **/
      batch: AugmentedSubmittable<
        (
          calls: Vec<Call> | (Call | { callIndex?: any; args?: any } | string | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
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
       * # Weight
       * - The weight of the call to be relayed plus a static 250_000.
       **/
      relayTx: AugmentedSubmittable<
        (
          target: AccountId | string | Uint8Array,
          signature:
            | OffChainSignature
            | { Ed25519: any }
            | { Sr25519: any }
            | { Ecdsa: any }
            | string
            | Uint8Array,
          call: UniqueCall | { nonce?: any; call?: any } | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
    voting: {
      /**
       * Adds a ballot
       *
       * # Arguments
       * * `ticker` - Ticker of the token for which ballot is to be created
       * * `ballot_name` - Name of the ballot
       * * `ballot_details` - Other details of the ballot
       **/
      addBallot: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array,
          ballotDetails:
            | Ballot
            | { checkpoint_id?: any; voting_start?: any; voting_end?: any; motions?: any }
            | string
            | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Cancels a vote by setting it as expired
       *
       * # Arguments
       * * `ticker` - Ticker of the token for which ballot is to be cancelled
       * * `ballot_name` - Name of the ballot
       **/
      cancelBallot: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array
        ) => SubmittableExtrinsic<ApiType>
      >;
      /**
       * Casts a vote
       *
       * # Arguments
       * * `ticker` - Ticker of the token for which vote is to be cast
       * * `ballot_name` - Name of the ballot
       * * `votes` - The actual vote to be cast
       **/
      vote: AugmentedSubmittable<
        (
          ticker: Ticker | string | Uint8Array,
          ballotName: Bytes | string | Uint8Array,
          votes: Vec<Balance> | (Balance | AnyNumber | Uint8Array)[]
        ) => SubmittableExtrinsic<ApiType>
      >;
    };
  }

  export interface SubmittableExtrinsics<ApiType extends ApiTypes>
    extends AugmentedSubmittables<ApiType> {
    (extrinsic: Call | Extrinsic | Uint8Array | string): SubmittableExtrinsic<ApiType>;
  }
}
