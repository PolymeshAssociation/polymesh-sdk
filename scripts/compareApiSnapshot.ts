/* eslint-disable */

import * as fs from 'fs';

const base = JSON.parse(fs.readFileSync('base-api-snapshot.json', 'utf-8'));
const current = JSON.parse(fs.readFileSync('current-api-snapshot.json', 'utf-8'));

let breaking = false;

function logBreak(msg: string) {
  console.error(`❌ ${msg}`);
  breaking = true;
}

function compareMethods(baseMethods: any[], currentMethods: any[], exportName: string) {
  const methodMap = new Map(currentMethods.map((m: any) => [m.name, m]));

  for (const baseMethod of baseMethods) {
    const currMethod = methodMap.get(baseMethod.name);
    if (!currMethod) {
      logBreak(`${exportName}: Removed method '${baseMethod.name}'`);
      continue;
    }

    // Compare parameters
    if (baseMethod.parameters.length !== currMethod.parameters.length) {
      logBreak(`${exportName}: Parameter count changed for method '${baseMethod.name}'`);
      continue;
    }

    for (let i = 0; i < baseMethod.parameters.length; i++) {
      const baseParam = baseMethod.parameters[i];
      const currParam = currMethod.parameters[i];

      if (baseParam.name !== currParam.name) {
        logBreak(
          `${exportName}: Param ${i} in '${baseMethod.name}' renamed from '${baseParam.name}' to '${currParam.name}'`
        );
      }
      if (baseParam.type !== currParam.type) {
        logBreak(
          `${exportName}: Param '${baseParam.name}' in '${baseMethod.name}' type changed: ${baseParam.type} → ${currParam.type}`
        );
      }
      if (baseParam.optional !== currParam.optional) {
        logBreak(
          `${exportName}: Param '${baseParam.name}' in '${baseMethod.name}' optionality changed`
        );
      }
    }

    // Compare return types
    if (baseMethod.returnType !== currMethod.returnType) {
      logBreak(
        `${exportName}: Return type of '${baseMethod.name}' changed: ${baseMethod.returnType} → ${currMethod.returnType}`
      );
    }
  }
}

for (const name in base) {
  const baseExport = base[name];
  const currExport = current[name];

  if (!currExport) {
    logBreak(`Removed export: ${name}`);
    continue;
  }

  // Class or Interface comparison
  if (
    (baseExport.kind === 'ClassDeclaration' || baseExport.kind === 'InterfaceDeclaration') &&
    (currExport.kind === 'ClassDeclaration' || currExport.kind === 'InterfaceDeclaration')
  ) {
    compareMethods(baseExport.methods || [], currExport.methods || [], name);
    continue;
  }

  // Basic type diff (e.g. enum, function, type alias)
  if (baseExport.type !== currExport.type) {
    logBreak(
      `Changed type: ${name}\n  - Before: ${baseExport.type}\n  - After:  ${currExport.type}`
    );
  }
}

// Detect new exports (non-breaking)
for (const name in current) {
  if (!(name in base)) {
    console.log(`➕ New export: ${name}`);
  }
}

if (breaking) {
  console.error('🚨 Breaking API changes detected.');
  process.exit(1);
} else {
  console.log('✅ No breaking API changes.');
}
