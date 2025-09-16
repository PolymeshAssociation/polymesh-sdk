/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';

// --- Type Definitions ---
type Parameter = {
  name: string;
  type: string;
  optional: boolean;
};

type Overload = {
  parameters: Parameter[];
  returnType: string;
};

type MethodSignature = {
  name: string;
  overloads: Overload[];
};

type ExportedAPI = {
  [exportName: string]: MethodSignature[];
};

type APISnapshot = {
  [filePath: string]: ExportedAPI;
};

// --- Load Snapshots ---
const basePath = path.resolve(__dirname, '../base-api-snapshot.json');
const currentPath = path.resolve(__dirname, '../current-api-snapshot.json');

const baseSnapshot = JSON.parse(fs.readFileSync(basePath, 'utf-8')) as APISnapshot;
const currentSnapshot = JSON.parse(fs.readFileSync(currentPath, 'utf-8')) as APISnapshot;

// --- Comparison Logic ---
let hasBreakingChange = false;

function logBreak(message: string) {
  hasBreakingChange = true;
  console.log('❌', message);
}

function compareOverloads(
  baseOverloads: Overload[],
  currentOverloads: Overload[],
  methodName: string,
  parentName: string,
  filePath: string
) {
  baseOverloads.forEach((baseSig, i) => {
    const currSig = currentOverloads[i];
    if (!currSig) {
      logBreak(`${filePath} > ${parentName}.${methodName}: Overload #${i + 1} removed`);
      return;
    }

    if (baseSig.parameters.length !== currSig.parameters.length) {
      logBreak(
        `${filePath} > ${parentName}.${methodName}: Param count mismatch in overload #${i + 1}`
      );
      return;
    }

    for (let j = 0; j < baseSig.parameters.length; j++) {
      const bp = baseSig.parameters[j]!;
      const cp = currSig.parameters[j]!;

      if (bp?.name !== cp?.name || bp?.type !== cp?.type || bp?.optional !== cp?.optional) {
        logBreak(
          `${filePath} > ${parentName}.${methodName}: Param ${j + 1} mismatch in overload #${i + 1}`
        );
      }
    }

    if (baseSig.returnType !== currSig.returnType) {
      logBreak(
        `${filePath} > ${parentName}.${methodName}: Return type changed in overload #${i + 1}`
      );
    }
  });
}

function compareSnapshots(base: APISnapshot, current: APISnapshot) {
  for (const filePath of Object.keys(base)) {
    const baseFile = base[filePath]!;
    const currFile = current[filePath];

    if (!currFile) {
      logBreak(`${filePath} removed`);
      continue;
    }

    for (const exportName of Object.keys(baseFile)) {
      const baseExport = baseFile[exportName]!;
      const currExport = currFile[exportName];

      if (!currExport) {
        logBreak(`${filePath} > ${exportName} removed`);
        continue;
      }

      const currMethods = new Map<string, MethodSignature>(currExport.map(m => [m.name, m]));

      for (const baseMethod of baseExport || []) {
        const currMethod = currMethods.get(baseMethod.name);

        if (!currMethod) {
          logBreak(`${filePath} > ${exportName}.${baseMethod.name} removed`);
          continue;
        }

        if (!Array.isArray(currMethod.overloads)) {
          logBreak(`${filePath} > ${exportName}.${baseMethod.name} is malformed (no overloads)`);
          continue;
        }

        compareOverloads(
          baseMethod.overloads,
          currMethod.overloads,
          baseMethod.name,
          exportName,
          filePath
        );
      }
    }
  }
}

// --- Run ---
compareSnapshots(baseSnapshot, currentSnapshot);

if (hasBreakingChange) {
  console.error('❌ Breaking API changes detected!');
  process.exit(1);
} else {
  console.log('✅ No breaking API changes detected.');
}
