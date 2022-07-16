/* eslint-disable */
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const configFile = path.resolve(__dirname, '../tsconfig.json');
const configDevFile = path.resolve(__dirname, '../tsconfig.dev.json');

rimraf.sync(configDevFile);

let rawData = fs.readFileSync(configFile);
let tsConfigJson = JSON.parse(rawData);

tsConfigJson.compilerOptions.rootDir = '.';
tsConfigJson.compilerOptions.skipLibCheck = true;

let tsConfigDev = JSON.stringify({
  compilerOptions: tsConfigJson.compilerOptions,
  exclude: tsConfigJson.exclude,
});

fs.writeFileSync(configDevFile, tsConfigDev);
