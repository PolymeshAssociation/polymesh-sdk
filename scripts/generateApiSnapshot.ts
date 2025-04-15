/* eslint-disable */

import * as fs from 'fs';
import * as path from 'path';
import { ClassDeclaration, InterfaceDeclaration, Project } from 'ts-morph';

const project = new Project({
  compilerOptions: {
    allowJs: false,
    declaration: true,
    emitDeclarationOnly: true,
  },
});

// Add all .d.ts files under dist/, then filter out unwanted paths
const sourceFiles = project.addSourceFilesAtPaths('dist/**/*.d.ts');

const EXCLUDED_PATTERNS = [
  'internal',
  'procedures',
  'middleware',
  'polkadot',
  'testUtils',
  'sandbox',
  'utils/conversion',
];

const isExcluded = (filePath: string): boolean =>
  EXCLUDED_PATTERNS.some(
    pattern => filePath.includes(pattern) && !filePath.endsWith('procedures/types.d.ts')
  );

const snapshot: Record<string, any> = {};

sourceFiles.forEach(sourceFile => {
  const filePath = path.relative(process.cwd(), sourceFile.getFilePath());
  if (isExcluded(filePath)) return;

  sourceFile.getExportSymbols().forEach(symbol => {
    const name = symbol.getName();
    const decl = symbol.getDeclarations()[0];
    if (!decl) return;

    const kind = decl.getKindName();
    const key = `${name} (${filePath})`;

    // For class or interface: extract methods
    if (decl instanceof ClassDeclaration || decl instanceof InterfaceDeclaration) {
      const structure = decl.getStructure();
      const methods = (structure.methods || []).map((method: any) => ({
        name: method.name,
        parameters: method.parameters.map((p: any) => ({
          name: p.name,
          type: p.type,
          optional: p.hasQuestionToken,
        })),
        returnType: method.returnType,
      }));

      snapshot[key] = {
        kind,
        methods,
      };
    } else {
      const typeText = decl.getType().getText(decl);
      snapshot[key] = { kind, type: typeText };
    }
  });
});

const outPath = path.resolve(__dirname, '../api-snapshot.json');
fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
console.log(`✅ API snapshot with method prototypes written to ${outPath}`);
