import {
  Asset,
  Context,
  Identity,
  modifyCaDefaultConfig,
  Namespace,
  removeCorporateAction,
} from '~/internal';
import { ModifyCaDefaultConfigParams, ProcedureMethod, RemoveCorporateActionParams } from '~/types';
import {
  identityIdToString,
  permillToBigNumber,
  stringToTicker,
  targetIdentitiesToCorporateActionTargets,
} from '~/utils/conversion';
import { createProcedureMethod, requestMulti } from '~/utils/internal';

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
      },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    const [targets, defaultTaxWithholding, taxWithholdings] = await requestMulti<
      [
        typeof corporateAction.defaultTargetIdentities,
        typeof corporateAction.defaultWithholdingTax,
        typeof corporateAction.didWithholdingTax
      ]
    >(context, [
      [corporateAction.defaultTargetIdentities, rawTicker],
      [corporateAction.defaultWithholdingTax, rawTicker],
      [corporateAction.didWithholdingTax, rawTicker],
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
