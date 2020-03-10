/* eslint-disable */
const https = require('https');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');

const dirName = path.resolve('src', 'polkadot', 'polymesh');
rimraf.sync(dirName);
fs.mkdirSync(dirName);

https.get('https://pme.polymath.network/code/polymesh_schema.json', res => {
  const chunks = [];
  res.on('data', chunk => {
    chunks.push(chunk);
  });

  res.on('end', () => {
    const schema = Buffer.concat(chunks).toString();
    const content = JSON.parse(`{ "types": ${schema} }`);
    fs.writeFileSync(
      path.resolve(dirName, 'definitions.ts'),
      `/* eslint-disable @typescript-eslint/camelcase */\nexport default ${util.inspect(content, {
        compact: false,
        depth: null,
      })}`
    );
  });
});
