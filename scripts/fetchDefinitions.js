/* eslint-disable */
const https = require('https');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');

const dirName = path.resolve('src', 'polkadot', 'polymesh');
const urlPath = 'https://pmd.polymath.network/code';

rimraf.sync(dirName);
fs.mkdirSync(dirName);

function request(endpoint) {
  return new Promise(function(resolve, reject) {
    https.get(endpoint, res => {
      const chunks = [];
      res.on('data', chunk => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
    });
  });
}

const requests = [
  request(`${urlPath}/polymesh_schema.json`),
  request(`${urlPath}/custom_rpc.json`),
];

Promise.all(requests).then(function(schema) {
  fs.writeFileSync(
    path.resolve(dirName, 'definitions.ts'),
    `/* eslint-disable @typescript-eslint/camelcase */\nexport default ${util.inspect(
      JSON.parse(`{ "types": ${schema[0]}, "rpc": ${schema[1]} }`),
      {
        compact: false,
        depth: null,
      }
    )}`
  );
});
