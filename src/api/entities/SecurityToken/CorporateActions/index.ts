import { QueryableStorageEntry } from '@polkadot/api/types';
import { Vec } from '@polkadot/types/codec';
import type { ITuple } from '@polkadot/types/types';
import { IdentityId, TargetIdentities, Tax } from 'polymesh-types/types';

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
import { ProcedureMethod } from '~/types';
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
      { getProcedureAndArgs: () => [removeCorporateActionsAgent, { ticker }] },
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
   * @note required role:
   *   - Security Token Owner
   */
  public setAgent: ProcedureMethod<ModifyCorporateActionsAgentParams, void>;

  /**
   * Remove the Corporate Actions Agent of the Security Token
   *
   * @note this action will leave the Security Token owner as the Corporate Actions Agent
   *
   * @note required role:
   *   - Security Token Owner
   */
  public removeAgent: ProcedureMethod<void, void>;

  /**
   * Remove a Corporate Action
   *
   * @note required role:
   *   - Corporate Actions Agent
   */
  public remove: ProcedureMethod<RemoveCorporateActionParams, void>;

  // TODO @shuffledex
  /**
   * Retrieve the Security Token's Corporate Actions agent
   */
  public async getAgent(): Promise<Identity> {
    const {
      context: {
        polymeshApi: {
          query: { corporateAction },
        },
      },
      parent: { ticker },
      context,
    } = this;

    const rawTicker = stringToTicker(ticker, context);

    // const agent = await corporateAction.agent(rawTicker);

    // if (agent.isNone) {
    const token = new SecurityToken({ ticker }, context);
    const { owner } = await token.details();
    return owner;
    // }

    // return new Identity({ did: identityIdToString(agent.unwrap()) }, context);
  }

  /**
   * Retrieve default values for targets, global tax withholding percentage and per-identity tax withholding perecentages.
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
      [TargetIdentities, Tax, Vec<ITuple<[IdentityId, Tax]>>]
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
