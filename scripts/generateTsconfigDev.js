/* eslint-disable */
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const configFile = path.resolve(__dirname, '../tsconfig.json');
const configDevFile = path.resolve(__dirname, '../tsconfig.dev.json');

rimraf.sync(configDevFile);

let rawdata = fs.readFileSync(configFile);
let student = JSON.parse(rawdata);

student.compilerOptions.rootDir = '.';

let tsConfigDev = JSON.stringify({
  compilerOptions: student.compilerOptions,
});

fs.writeFileSync(configDevFile, tsConfigDev);
