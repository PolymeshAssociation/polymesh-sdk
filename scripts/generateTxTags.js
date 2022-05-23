/* eslint-disable */
const { Metadata } = require('@polkadot/types');
const { TypeRegistry } = require('@polkadot/types/create');
const { stringCamelCase, stringUpperFirst } = require('@polkadot/util');
const { forEach } = require('lodash');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const metadataFile = fs.readFileSync('metadata.json').toString('utf8');

let namespaces = '';
let moduleNameEnum = 'export enum ModuleName {';
let modulePermissions = 'export type ModulePermissions =';
let txTag = 'export type TxTag =';
let txTags = 'export const TxTags = {\n';

const jsonPath = path.resolve('scripts', 'transactions.json');

const transactionData = JSON.parse(fs.readFileSync(jsonPath));

const registry = new TypeRegistry();

const metadata = new Metadata(registry, JSON.parse(metadataFile).result).asLatest;
const modules = metadata.pallets;
const lookup = metadata.lookup;

// add new calls to historic ones
modules.forEach(({ name, calls }) => {
  const allCalls = calls.unwrapOr(null);
  const moduleName = name.toString();

  if (allCalls) {
    const moduleCalls = (transactionData[moduleName] = transactionData[moduleName] || {});

    const items = lookup.getSiType(allCalls.type).def.asVariant.variants;

    items.forEach(({ name: cName }) => {
      const callName = cName.toString();
      moduleCalls[callName] = callName;
    });
  }
});

forEach(transactionData, (calls, moduleName) => {
  const moduleNameCamelCase = stringCamelCase(moduleName);
  const moduleNamePascal = stringUpperFirst(moduleNameCamelCase);

  moduleNameEnum = moduleNameEnum.concat(`\n  ${moduleNamePascal} = '${moduleNameCamelCase}',`);
  modulePermissions = modulePermissions.concat(
    `\n  | { moduleName: ModuleName.${moduleNamePascal}; permissions: SectionPermissions<${moduleNamePascal}Tx> }`
  );
  txTag = txTag.concat(`\n  | ${moduleNamePascal}Tx`);
  txTags = txTags.concat(`  ${stringCamelCase(moduleName)}: ${moduleNamePascal}Tx,\n`);

  namespaces = namespaces.concat(`export enum ${moduleNamePascal}Tx {\n`);

  forEach(calls, callName => {
    const nameCamelCase = stringCamelCase(callName);
    const namePascal = stringUpperFirst(nameCamelCase);

    namespaces = namespaces.concat(
      `  ${namePascal} = '${moduleNameCamelCase}.${nameCamelCase}',\n`
    );
  });

  namespaces = namespaces.concat('}\n\n');
});

moduleNameEnum = moduleNameEnum.concat('\n}');
modulePermissions = modulePermissions.concat(';');
txTag = txTag.concat(';');
txTags = txTags.concat('};');

fs.appendFileSync(
  path.resolve('src', 'polkadot', 'types.ts'),
  '\n'.concat(namespaces).concat(`${moduleNameEnum}\n\n${txTag}\n\n${txTags}\n`)
);
rimraf.sync(jsonPath);
fs.writeFileSync(jsonPath, `${JSON.stringify(transactionData, null, 2)}\n`);
