/* eslint-disable */
const https = require('https');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');

const dirName = path.resolve('src', 'polkadot', 'polymesh');
const urlPath = 'https://pmf.polymath.network/code';

rimraf.sync(dirName);
fs.mkdirSync(dirName);

https.get(`${urlPath}/polymesh_schema.json`, res => {
  const chunks = [];
  res.on('data', chunk => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const schema = Buffer.concat(chunks);
    fs.writeFileSync(
      path.resolve(dirName, 'definitions.ts'),
      `/* eslint-disable @typescript-eslint/camelcase */\nexport default ${util.inspect(
        JSON.parse(schema),
        {
          compact: false,
          depth: null,
        }
      )}`
    );
  });
});
