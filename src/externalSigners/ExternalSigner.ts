import { Registry } from '@polkadot/types/types';

import { PolkadotSigner } from '~/types';

export interface ExternalSigner extends PolkadotSigner {
  addKey?(key: string): Promise<string>;
  configure?(registry: Registry, ss58Format?: number): void;
}
