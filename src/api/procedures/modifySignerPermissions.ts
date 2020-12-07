import P from 'bluebird';

import { assertSecondaryKeys } from '~/api/procedures/utils';
import { DefaultPortfolio, NumberedPortfolio, Procedure, SecurityToken } from '~/internal';
import { TxTag } from '~/polkadot/types';
import { SecondaryKey } from '~/types';
import { tuple } from '~/types/utils';
import {
  permissionsToMeshPermissions,
  portfolioLikeToPortfolio,
  signerToSignerValue,
  signerValueToSignatory,
} from '~/utils/conversion';

export interface ModifySignerPermissionsParams {
  secondaryKeys: SecondaryKey[];
}

/**
 * @hidden
 */
export async function prepareModifySignerPermissions(
  this: Procedure<ModifySignerPermissionsParams>,
  args: ModifySignerPermissionsParams
): Promise<void> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
  } = this;

  const { secondaryKeys: signers } = args;

  const secondaryKeys = await context.getSecondaryKeys();
  const signerValues = signers.map(({ signer, permissions }) => {
    return {
      signer: signerToSignerValue(signer),
      permissions,
    };
  });

  assertSecondaryKeys(
    signerValues.map(({ signer }) => signer),
    secondaryKeys
  );

  const signersList = await P.map(signerValues, async ({ signer, permissions }) => {
    const { tokens, transactions, portfolios } = permissions;

    let tokenPermissions: SecurityToken[] | null = [];
    let transactionPermissions: TxTag[] | null = [];
    let portfolioPermissions: (DefaultPortfolio | NumberedPortfolio)[] | null = [];

    if (tokens === null) {
      tokenPermissions = null;
    } else {
      tokenPermissions = tokens;
    }

    if (transactions === null) {
      transactionPermissions = null;
    } else {
      transactionPermissions = transactions;
    }

    if (portfolios === null) {
      portfolioPermissions = null;
    } else {
      portfolioPermissions = await P.map(portfolios, portfolio =>
        portfolioLikeToPortfolio(portfolio, context)
      );
    }

    const rawPermissionToSigner = permissionsToMeshPermissions(
      {
        tokens: tokenPermissions,
        transactions: transactionPermissions,
        portfolios: portfolioPermissions,
      },
      context
    );

    return tuple(signerValueToSignatory(signer, context), rawPermissionToSigner);
  });

  this.addBatchTransaction(tx.identity.setPermissionToSigner, {}, signersList);
}

/**
 * @hidden
 */
export const modifySignerPermissions = new Procedure(prepareModifySignerPermissions);
