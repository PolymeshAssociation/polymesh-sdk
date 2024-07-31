/* eslint-disable */
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');
const { forEach, camelCase, mapKeys } = require('lodash');

const { typesBundle } = require('@polymeshassociation/polymesh-types');
const types = require('@polymeshassociation/polymesh-types/types/6.3.x.json');

const definitionsDir = path.resolve('src', 'polkadot');
const typesDir = path.resolve(definitionsDir, 'polymesh');
const generatedDir = path.resolve('src', 'generated');

rimraf.sync(definitionsDir);
fs.mkdirSync(definitionsDir);

rimraf.sync(typesDir);
fs.mkdirSync(typesDir);

rimraf.sync(generatedDir);
fs.mkdirSync(generatedDir);

/**
 * @hidden
 * transforms the schema so RPC types are compatible with other methods from the polkadot api.
 */
function transformSchema(schemaObj) {
  let {
    rpc: { identity, asset, settlement },
    runtime,
  } = schemaObj;

  // Convert type keys to camelCase (excluding "_enum")
  schemaObj.types.Condition.issuers = 'Vec<PolymeshPrimitivesConditionTrustedIssuer>';
  Object.entries(types).forEach(([key, value]) => {
    if (typeof value === 'object' && !value._enum) {
      camelCaseKeys(schemaObj, 'types', key);
    }
    camelCaseParamNames(asset.canTransferGranular);
  });

  Object.values(runtime).forEach(apiMethodsArray =>
    apiMethodsArray.forEach(apiMethodsObj =>
      Object.values(apiMethodsObj.methods).forEach(camelCaseParamNames)
    )
  );
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
  const { types, rpc: rpcModules, runtime } = schemaObj;

  fs.writeFileSync(
    path.resolve(typesDir, 'definitions.ts'),
    `/* eslint-disable @typescript-eslint/naming-convention */\nexport default ${util.inspect(
      { rpc: {}, runtime, types },
      {
        compact: false,
        depth: null,
        maxArrayLength: null,
      }
    )};`
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
    "/* istanbul ignore file */\n\nexport { default as polymesh } from './polymesh/definitions';\n";

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
      )};`
    );

    defExports = `${defExports}export { default as ${moduleName} } from './${moduleName}/definitions';\n`;
  });

  fs.writeFileSync(path.resolve(definitionsDir, 'definitions.ts'), defExports);
}

(() => {
  const { runtime, signedExtensions } = typesBundle.spec.polymesh_dev;
  const schema = {
    types,
    rpc: versionedRpc,
    runtime,
    signedExtensions,
  };

  transformSchema(schema);
  writeDefinitions(schema);
})();
