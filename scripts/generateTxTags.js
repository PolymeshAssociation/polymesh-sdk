/* eslint-disable */
const { Metadata } = require('@polkadot/metadata/Metadata');
const { w3cwebsocket } = require('websocket');
const { TypeRegistry } = require('@polkadot/types/create');
const { stringCamelCase, stringUpperFirst } = require('@polkadot/util');
const { forEach } = require('lodash');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const websocket = new w3cwebsocket('wss://dev.polymesh.live');
websocket.onopen = () => {
  websocket.send('{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[]}');
};
websocket.onmessage = message => {
  let namespaces = '';
  let txTag = 'export type TxTag =';
  let txTags = 'export const TxTags = {\n';

  const jsonPath = path.resolve('scripts', 'transactions.json');

  const transactionData = JSON.parse(fs.readFileSync(jsonPath));

  const registry = new TypeRegistry();

  const metadata = new Metadata(registry, JSON.parse(message.data).result);
  const modules = metadata.asLatest.modules;

  // add new calls to historic ones
  modules.forEach(({ name, calls }) => {
    const allCalls = calls.unwrapOr(null);
    const moduleName = name.toString();

    if (allCalls && allCalls.length) {
      const moduleCalls = (transactionData[moduleName] = transactionData[moduleName] || {});

      allCalls.forEach(({ name: cName }) => {
        const callName = cName.toString();
        moduleCalls[callName] = callName;
      });
    }
  });

  forEach(transactionData, (calls, moduleName) => {
    const moduleNameCamelCase = stringCamelCase(moduleName);
    const moduleNamePascal = stringUpperFirst(moduleNameCamelCase);

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

  txTag = txTag.concat(';');
  txTags = txTags.concat('};');

  fs.appendFileSync(
    path.resolve('src', 'polkadot', 'types.ts'),
    '\n'.concat(namespaces).concat(`${txTag}\n\n${txTags}\n`)
  );

  rimraf.sync(jsonPath);
  fs.writeFileSync(jsonPath, `${JSON.stringify(transactionData, null, 2)}\n`);

  websocket.close();
};
