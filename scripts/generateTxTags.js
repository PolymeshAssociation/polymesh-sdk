/* eslint-disable */
const Metadata = require('@polkadot/metadata/Metadata').default;
const { w3cwebsocket } = require('websocket');
const { TypeRegistry } = require('@polkadot/types/create');
const { stringCamelCase, stringLowerFirst, stringUpperFirst } = require('@polkadot/util');
const fs = require('fs');
const path = require('path');

const websocket = new w3cwebsocket('wss://pme.polymath.network');
websocket.onopen = () => {
  websocket.send('{"id":"1","jsonrpc":"2.0","method":"state_getMetadata","params":[]}');
};
websocket.onmessage = message => {
  let namespaces = '';
  let txTag = 'export type TxTag =';
  let txTags = 'export const TxTags = {\n';

  const registry = new TypeRegistry();

  const metadata = new Metadata(registry, JSON.parse(message.data).result);
  const modules = metadata.asLatest.modules;

  modules.forEach(({ name, calls }, index) => {
    const allCalls = calls.unwrapOr(null);
    const moduleName = name.toString();

    if (allCalls && allCalls.length) {
      const moduleNameCamelCase = stringCamelCase(moduleName);
      const moduleNamePascal = stringUpperFirst(moduleNameCamelCase);
      txTag = txTag.concat(`\n  | ${moduleNamePascal}Tx`);
      txTags = txTags.concat(`  ${stringCamelCase(moduleName)}: ${moduleNamePascal}Tx,\n`);

      namespaces = namespaces.concat(`export enum ${moduleNamePascal}Tx {\n`);
      allCalls.forEach(({ name: callName }) => {
        const nameCamelCase = stringCamelCase(callName.toString());
        const namePascal = stringUpperFirst(nameCamelCase);
        namespaces = namespaces.concat(
          `  ${namePascal} = '${moduleNameCamelCase}.${nameCamelCase}',\n`
        );
      });
      namespaces = namespaces.concat('}\n\n');
    }
  });

  txTag = txTag.concat(';');
  txTags = txTags.concat('};');

  fs.appendFileSync(
    path.resolve('src', 'polkadot', 'types.ts'),
    '\n'.concat(namespaces).concat(`${txTag}\n\n${txTags}\n`)
  );

  websocket.close();
};
