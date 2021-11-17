/* eslint-disable no-useless-constructor */
import { Registry, SignerPayloadJSON, SignerResult } from '@polkadot/types/types';
import { encodeAddress } from '@polkadot/util-crypto';
import fetch from 'cross-fetch';

import { PolymeshError } from '~/internal';
import { ErrorCode } from '~/types';

import { ExternalSigner } from './ExternalSigner';

interface SignRequestPayload {
  input: string; // base64 encoded data to sign
}

interface SignResponse {
  data: {
    signature: string;
  };
}

/* eslint-disable @typescript-eslint/naming-convention */
interface VaultKey {
  public_key: string;
}

interface FetchKeyResponse {
  statusCode: number;
  data: {
    keys: VaultKey[];
    latest_version: number;
    type: string;
  };
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Implements ExternalSigner using Hashicorp's Vault to generate signatures
 */
export class VaultSigner implements ExternalSigner {
  private id = 0;
  private ss58Format: number | undefined;
  private addressToKeyMap: Record<string, string> = {};
  private registry: Registry | undefined; // maybe a generic instance is good enough
  /**
   *
   * @param link URL to vault transit engine
   * @param token the vault token
   */
  constructor(private readonly link: string, private readonly token: string) {}

  /**
   *  A method to set needed config params that can be inferred from the SDK context
   * @param registry The Polkadot SDK type registry
   * @param ss58Format The ss58 format of the chain
   */
  public configure(registry: Registry, ss58Format: number): void {
    this.registry = registry;
    this.ss58Format = ss58Format;
  }

  /**
   * Signs a payload in accordance with the PolkadotSigner interface
   * @param payload
   * @returns
   */
  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    if (!this.registry) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: 'VaultSigner has not been configured',
      });
    }
    const address = payload.address;
    const keyName = this.addressToKeyMap[address];

    const apiPayload = this.registry.createType('ExtrinsicPayload', payload, {
      version: payload.version,
    });

    const body = {
      input: Buffer.from(apiPayload.toU8a(true)).toString('base64'),
    };
    const response = await this.sendSignRequest(body, keyName);

    const rawSignature = response.data.signature;
    if (!rawSignature) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: `Could not get signature from Vault for key: "${keyName}"`,
      });
    }
    // strip vault prefix
    const noPrefix = rawSignature.replace(/vault:v\d+:/, '');
    // convert to hex and prepend 00 to indicate this is a ed25519 signature
    const buffer = Buffer.from(noPrefix, 'base64');
    const signature = `0x00${buffer.toString('hex')}`;

    return { signature, id: ++this.id };
  }

  /**
   * Enables a key stored in Vault to begin signing requests
   * @param keyName the name of the key in Vault
   * @throws if Vault returns a non 200 response, or if key is not ed25519 type
   * @returns The keyring pair for the added key
   */
  public async addKey(keyName: string): Promise<string> {
    const fetchResponse = await this.fetchKeyAddress(keyName);
    if (fetchResponse.statusCode !== 200) {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: `Could not add key: "${keyName}". Vault returned status code: ${fetchResponse.statusCode}`,
      });
    }

    const keyType = fetchResponse.data.type;
    if (keyType !== 'ed25519') {
      throw new PolymeshError({
        code: ErrorCode.General,
        message: `Only ed25519 type keys can sign extrinsics. Key: "${keyName}" was: ${keyType}`,
      });
    }
    const latestVersion = fetchResponse.data.latest_version;
    const latestKey = fetchResponse.data.keys[latestVersion];

    // encode key into SS58 format
    const rawKey = Buffer.from(latestKey.public_key, 'base64');
    const address = encodeAddress(rawKey, this.ss58Format);

    this.addressToKeyMap[address] = keyName;
    return address;
  }

  /**
   * Makes a request to Vault to sign
   * @param body Payload to obtain a signature for
   * @param key The key to sign with
   * @returns SignResponse
   */
  private async sendSignRequest(body: SignRequestPayload, key: string): Promise<SignResponse> {
    return (
      await fetch(`${this.link}/sign/${key}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'X-Vault-Token': this.token },
      })
    ).json();
  }

  /**
   * Given a key name fetches the public key from Vault and returns it in SS58 format
   * @param name the name of the key in vault
   * @returns FetchKeyResponse
   */
  private async fetchKeyAddress(name: string): Promise<FetchKeyResponse> {
    const res = await fetch(`${this.link}/keys/${name}`, {
      headers: { 'X-Vault-Token': this.token },
    });
    const data = await res.json();
    return { ...data, statusCode: res.status };
  }
}
