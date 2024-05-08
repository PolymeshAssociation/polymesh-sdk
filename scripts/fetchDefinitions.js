/* eslint-disable */
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');
const { forEach, camelCase, mapKeys } = require('lodash');

const { typesBundle } = require('@polymeshassociation/polymesh-types');
const types = require('@polymeshassociation/polymesh-types/types/6.1.x.json');

const definitionsDir = path.resolve('src', 'polkadot');
const typesDir = path.resolve(definitionsDir, 'polymesh');
const generatedDir = path.resolve('src', 'generated');

rimraf.sync(typesDir);
fs.mkdirSync(typesDir);

rimraf.sync(generatedDir);
fs.mkdirSync(generatedDir);

/**
 * @hidden
 * transforms the schema so RPC types are compatible with other methods from the polkadot api.
 * @note imports are added into the generated files in the postProcessTypes script
 */
function transformSchema(schemaObj) {
  let {
    rpc: { identity, asset, settlement },
    runtime,
  } = schemaObj;

  camelCaseParamNames(identity.getFilteredAuthorizations);
  identity.getFilteredAuthorizations.type = 'Vec<PolymeshPrimitivesAuthorization>';
  runtime.IdentityApi[0].methods.get_filtered_authorizations.params[0].type =
    'PolymeshPrimitivesSecondaryKeySignatory';
  runtime.IdentityApi[0].methods.get_filtered_authorizations.type =
    'Vec<PolymeshPrimitivesAuthorization>';

  camelCaseKeys(schemaObj, 'types', 'ComplianceRequirementResult');

  camelCaseKeys(schemaObj, 'types', 'Condition');
  schemaObj.types.Condition.issuers = 'Vec<PolymeshPrimitivesConditionTrustedIssuer>';

  camelCaseKeys(schemaObj, 'types', 'TrustedIssuer');

  camelCaseParamNames(asset.canTransferGranular);
  asset.canTransferGranular.params[0].type = 'Option<PolymeshPrimitivesIdentityId>';
  asset.canTransferGranular.params[2].type = 'Option<PolymeshPrimitivesIdentityId>';

  runtime.AssetApi[0].methods.can_transfer_granular.params[0].type =
    'Option<PolymeshPrimitivesIdentityId>';
  runtime.AssetApi[0].methods.can_transfer_granular.params[2].type =
    'Option<PolymeshPrimitivesIdentityId>';

  camelCaseParamNames(settlement.getExecuteInstructionInfo);
  camelCaseKeys(schemaObj, 'types', 'ExecuteInstructionInfo');
}

function camelCaseKeys(schemaObj, section, field) {
  const newField = mapKeys(schemaObj[section][field], (v, k) => camelCase(k));
  schemaObj[section][field] = newField;
}

function camelCaseParamNames(field) {
  field.params = field.params.map(p => ({
    ...p,
    name: camelCase(p.name),
  }));
}

function writeDefinitions(schemaObj) {
  const { types, rpc: rpcModules } = schemaObj;

  fs.writeFileSync(
    path.resolve(typesDir, 'definitions.ts'),
    `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
      { rpc: {}, types },
      {
        compact: false,
        depth: null,
        maxArrayLength: null,
      }
    )}`
  );

  fs.writeFileSync(
    path.resolve(definitionsDir, 'schema.ts'),
    `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
      schemaObj,
      {
        compact: false,
        depth: null,
        maxArrayLength: null,
      }
    )}`
  );

  let defExports =
    "/* istanbul ignore file */\n\nexport { default as polymesh } from './polymesh/definitions';\n";

  forEach(rpcModules, (rpc, moduleName) => {
    const moduleDir = path.resolve(definitionsDir, moduleName);

    rimraf.sync(moduleDir);
    fs.mkdirSync(moduleDir);

    fs.writeFileSync(
      path.resolve(moduleDir, 'definitions.ts'),
      `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
        { rpc, types: {} },
        {
          compact: false,
          depth: null,
          maxArrayLength: null,
        }
      )}`
    );

    defExports = `${defExports}export { default as ${moduleName} } from './${moduleName}/definitions';\n`;
  });

  fs.writeFileSync(path.resolve(definitionsDir, 'definitions.ts'), defExports);
}

(() => {
  const { rpc, runtime, signedExtensions } = typesBundle.spec.polymesh_dev;
  const schema = {
    types,
    rpc,
    runtime,
    signedExtensions,
  };

  transformSchema(schema);
  writeDefinitions(schema);
})();
