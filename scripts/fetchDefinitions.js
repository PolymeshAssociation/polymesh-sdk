/* eslint-disable */
const http = require('http');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');
const { forEach, camelCase, mapKeys } = require('lodash');
const { NODE_URL, SCHEMA_PORT } = require('./consts');

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
    types: { ComplianceRequirementResult, Condition, TrustedIssuer },
    rpc: { identity, compliance, asset },
  } = schemaObj;
  identity.getFilteredAuthorizations.params = identity.getFilteredAuthorizations.params.map(p => ({
    ...p,
    name: camelCase(p.name),
  }));
  identity.getFilteredAuthorizations.type = 'Vec<PolymeshPrimitivesAuthorization>';

  compliance.canTransfer.params = compliance.canTransfer.params.map(p => ({
    ...p,
    name: camelCase(p.name),
  }));
  const newCompliance = mapKeys(ComplianceRequirementResult, (v, k) => camelCase(k));
  schemaObj.types.ComplianceRequirementResult = newCompliance;

  const newCondition = mapKeys(Condition, (v, k) => camelCase(k));
  newCondition.issuers = 'Vec<PolymeshPrimitivesConditionTrustedIssuer>';
  schemaObj.types.Condition = newCondition;

  const newTrustedIssuer = mapKeys(TrustedIssuer, (v, k) => camelCase(k));
  schemaObj.types.TrustedIssuer = newTrustedIssuer;

  asset.canTransferGranular.params = asset.canTransferGranular.params.map(p => ({
    ...p,
    name: camelCase(p.name),
  }));

  asset.canTransferGranular.params[0].type = 'Option<PolymeshPrimitivesIdentityId>';
  asset.canTransferGranular.params[2].type = 'Option<PolymeshPrimitivesIdentityId>';

  asset.canTransfer.params = asset.canTransfer.params.map(p => ({
    ...p,
    name: camelCase(p.name),
  }));

  asset.canTransfer.params[1].type = 'Option<PolymeshPrimitivesIdentityId>';
  asset.canTransfer.params[3].type = 'Option<PolymeshPrimitivesIdentityId>';
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

http.get(`http://${NODE_URL}:${SCHEMA_PORT}/polymesh_schema.json`, res => {
  const chunks = [];
  res.on('data', chunk => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const schema = Buffer.concat(chunks);
    const schemaObj = JSON.parse(schema);
    transformSchema(schemaObj);

    writeDefinitions(schemaObj);
  });
});
