import { QueryableStorageEntry } from '@polkadot/api/types';

import {
  Context,
  Identity,
  modifyCaDefaults,
  ModifyCaDefaultsParams,
  modifyCorporateActionsAgent,
  ModifyCorporateActionsAgentParams,
  Namespace,
  removeCorporateAction,
  RemoveCorporateActionParams,
  removeCorporateActionsAgent,
  SecurityToken,
} from '~/internal';
import { NoArgsProcedureMethod, ProcedureMethod } from '~/types';
import { ProcedureMethod } from '~/types';
import { QueryReturnType } from '~/types/utils';
import {
  identityIdToString,
  permillToBigNumber,
  stringToTicker,
  targetIdentitiesToCorporateActionTargets,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

import { Distributions } from './Distributions';
import { CorporateActionDefaults } from './types';

/**
 * Handles all Security Token Corporate Actions related functionality
 */
export class CorporateActions extends Namespace<SecurityToken> {
  public distributions: Distributions;

  /**
   * @hidden
   */
  constructor(parent: SecurityToken, context: Context) {
    super(parent, context);

    const { ticker } = parent;

    this.distributions = new Distributions(parent, context);

    this.setDefaults = createProcedureMethod(
      { getProcedureAndArgs: args => [modifyCaDefaults, { ticker, ...args }] },
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
   * Assign default values for targets, global tax withholding percentage and per-identity tax withholding perecentages.
   *
   * @note These values are applied to every Corporate Action that is created until they are modified. Modifying these values
   *   does not impact existing Corporate Actions.
   *   When creating a Corporate Action, values passed explicitly will override these defaults
   */
  public setDefaults: ProcedureMethod<ModifyCaDefaultsParams, void>;

  /**
   * Assign a new Corporate Actions Agent for the Security Token
   *
   * @note this may create AuthorizationRequests which have to be accepted by
   *   the corresponding Account. An Account or Identity can
   *   fetch its pending Authorization Requests by calling `authorizations.getReceived`
   *
   * @deprecated in favor of `inviteAgent`
   */
  public setAgent: ProcedureMethod<ModifyCorporateActionsAgentParams, void>;

  /**
   * Remove the Corporate Actions Agent of the Security Token
   *
   * @note this action will leave the Security Token owner as the Corporate Actions Agent
   *
   * @deprecated
   */
  public removeAgent: NoArgsProcedureMethod<void>;

  /**
   * Remove a Corporate Action
   */
  public remove: ProcedureMethod<RemoveCorporateActionParams, void>;

  /**
   * Retrieve a list of agent identities
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
      if (rawAgentGroup.isPolymeshV1Caa) {
        agentIdentities.push(
          new Identity({ did: identityIdToString(storageKey.args[1]) }, context)
        );
      }
    });

    return agentIdentities;
  }

  /**
   * Retrieve default values for targets, global tax withholding percentage and per-identity tax withholding percentages.
   *
   *
   * @note These values are applied to every Corporate Action that is created until they are modified. Modifying these values
   *   does not impact existing Corporate Actions.
   *   When creating a Corporate Action, values passed explicitly will override these defaults
   */
  public async getDefaults(): Promise<CorporateActionDefaults> {
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
        (corporateAction.defaultTargetIdentities as unknown) as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [
        (corporateAction.defaultWithholdingTax as unknown) as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
      [
        (corporateAction.didWithholdingTax as unknown) as QueryableStorageEntry<'promise'>,
        rawTicker,
      ],
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
