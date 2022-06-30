import { QueryableStorageEntry } from '@polkadot/api/types';

import {
  Asset,
  Context,
  Identity,
  modifyCaDefaultConfig,
  modifyCorporateActionsAgent,
  Namespace,
  removeCorporateAction,
  removeCorporateActionsAgent,
} from '~/internal';
import {
  ModifyCaDefaultConfigParams,
  ModifyCorporateActionsAgentParams,
  NoArgsProcedureMethod,
  ProcedureMethod,
  RemoveCorporateActionParams,
} from '~/types';
import { QueryReturnType } from '~/types/utils';
import {
  identityIdToString,
  permillToBigNumber,
  stringToTicker,
  targetIdentitiesToCorporateActionTargets,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { Distributions } from './Distributions';
import { CorporateActionDefaultConfig } from './types';

/**
 * Handles all Asset Corporate Actions related functionality
 */
export class CorporateActions extends Namespace<Asset> {
  public distributions: Distributions;

  /**
   * @hidden
   */
  constructor(parent: Asset, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.distributions = new Distributions(parent, context);

    this.setDefaultConfig = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyCaDefaultConfig, { ticker, ...args }] },
      context
    );

    this.setAgent = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyCorporateActionsAgent, { ticker, ...args }] },
      context
    );

    this.removeAgent = createProcedureMethod(
      { getProcedureAndArgs: () => [removeCorporateActionsAgent, { ticker }], voidArgs: true },
      context
    );

    this.remove = createProcedureMethod(
      { getProcedureAndArgs: args => [removeCorporateAction, { ticker, ...args }] },
      context
    );
  }

  /**
   * Assign default config values(targets, global tax withholding percentage and per-Identity tax withholding percentages)
   *
   * @note These config values are applied to every Corporate Action that is created until they are modified. Modifying these values
   *   does not impact existing Corporate Actions.
   *   When creating a Corporate Action, values passed explicitly will override these default config values
   */
  public setDefaultConfig: ProcedureMethod<ModifyCaDefaultConfigParams, void>;

  /**
   * Assign a new Corporate Actions Agent for the Asset
   *
   * @note this may create {@link AuthorizationRequest | Authorization Requests} which have to be accepted by the `target` Identity.
   *   An {@link Account} or {@link Identity} can fetch its pending Authorization Requests by calling {@link Authorizations.getReceived | authorizations.getReceived}.
   *   Also, an Account or Identity can directly fetch the details of an Authorization Request by calling {@link Authorizations.getOne | authorizations.getOne}
   *
   * @deprecated in favor of `inviteAgent`
   */
  public setAgent: ProcedureMethod<ModifyCorporateActionsAgentParams, void>;

  /**
   * Remove the Corporate Actions Agent of the Asset
   *
   * @note this action will leave the Asset owner as the Corporate Actions Agent
   *
   * @deprecated
   */
  public removeAgent: NoArgsProcedureMethod<void>;

  /**
   * Remove a Corporate Action
   */
  public remove: ProcedureMethod<RemoveCorporateActionParams, void>;

  /**
   * Retrieve a list of agent Identities
   */
  public async getAgents(): Promise<Identity[]> {
    const {
      context: {
        polymeshApi: {
          query: { externalAgents },
        },
      },
      parent: { ticker },
      context,
    } = this;

    const groupOfAgent = await externalAgents.groupOfAgent.entries(stringToTicker(ticker, context));

    const agentIdentities: Identity[] = [];

    groupOfAgent.forEach(([storageKey, agentGroup]) => {
      const rawAgentGroup = agentGroup.unwrap();
      if (rawAgentGroup.isPolymeshV1CAA) {
        agentIdentities.push(
          new Identity({ did: identityIdToString(storageKey.args[1]) }, context)
        );
      }
    });

    return agentIdentities;
  }

  /**
   * Retrieve default config comprising of targets, global tax withholding percentage and per-Identity tax withholding percentages.
   *
   *
   * @note This config is applied to every Corporate Action that is created until they are modified. Modifying the default config
   *   does not impact existing Corporate Actions.
   *   When creating a Corporate Action, values passed explicitly will override this default config
   */
  public async getDefaultConfig(): Promise<CorporateActionDefaultConfig> {
    const {
      parent: { ticker },
      context: {
        polymeshApi: {
          query: { corporateAction },
        },
        polymeshApi,
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const [targets, defaultTaxWithholding, taxWithholdings] = await polymeshApi.queryMulti<
      [
        QueryReturnType<typeof corporateAction.defaultTargetIdentities>,
        QueryReturnType<typeof corporateAction.defaultWithholdingTax>,
        QueryReturnType<typeof corporateAction.didWithholdingTax>
      ]
    >([
      [
        corporateAction.defaultTargetIdentities as unknown as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [
        corporateAction.defaultWithholdingTax as unknown as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [corporateAction.didWithholdingTax as unknown as QueryableStorageEntry<'promise'>, rawTicker],
    ]);

    return {
      targets: targetIdentitiesToCorporateActionTargets(targets, context),
      defaultTaxWithholding: permillToBigNumber(defaultTaxWithholding),
      taxWithholdings: taxWithholdings.map(([identity, tax]) => ({
        identity: new Identity({ did: identityIdToString(identity) }, context),
        percentage: permillToBigNumber(tax),
      })),
    };
  }
}
