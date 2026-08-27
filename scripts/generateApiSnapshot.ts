/* eslint-disable */

import {
  Project,
  SyntaxKind,
  Node,
  MethodDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  Type,
  SymbolFlags,
} from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const distDir = path.resolve(__dirname, '../dist');
const snapshotPath = path.resolve(__dirname, '../api-snapshot.json');

// Set up project with all .d.ts files in dist, respecting exclusions
const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
  skipFileDependencyResolution: true,
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(`${distDir}/**/*.d.ts`);

const EXCLUDED_PATTERNS = [
  'internal',
  'procedures',
  'middleware',
  'polkadot',
  'testUtils',
  'sandbox',
  'utils/conversion',
];

// Custom inclusion filter
const files = project.getSourceFiles().filter(file => {
  const filePath = file.getFilePath();

  return !EXCLUDED_PATTERNS.some(
    pattern => filePath.includes(pattern) && !filePath.endsWith('procedures/types.d.ts')
  );
});

/**
 * Split a type's text on its top-level union bars, so that a bar inside an object, a generic or a
 * parameter list stays where it is
 */
function splitTopLevelUnion(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;

    if ('{([<'.includes(char)) depth++;
    // the `>` of an arrow closes nothing
    else if (')]}'.includes(char) || (char === '>' && text[i - 1] !== '=')) depth--;

    if (char === '|' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  parts.push(current);

  return parts.map(part => part.trim()).filter(part => part.length > 0);
}

/**
 * Put a type's text in a canonical form, so that the same type records the same text however the
 * compiler happened to print it.
 *
 * A symbol the compiler can't reach from the node it is printing at comes out as
 * `import("/abs/path").Name`, which makes the text depend on where the build ran. And the order of
 * a union's members is the compiler's, not the source's, so it moves when an unrelated type
 * changes.
 *
 * `dropUndefined` drops an `undefined` union member, for a position where the `optional` flag
 * already records it. A return type keeps its own, where gaining `undefined` is a change callers
 * feel
 */
function normalizeTypeText(text: string, { dropUndefined = false } = {}): string {
  const withoutPaths = text.replace(/import\("[^"]*"\)\./g, '');
  const members = splitTopLevelUnion(withoutPaths).filter(
    member => !dropUndefined || member !== 'undefined'
  );

  if (members.length <= 1) {
    return members[0] ?? withoutPaths.trim();
  }

  return members.sort().join(' | ');
}

/**
 * Whether a type is an options bag — an object whose members a caller writes out one by one,
 * however the type is spelled: an object literal, a named interface, or an intersection of both.
 *
 * Anything else records the name a caller knows it by, rather than being pulled apart: a class
 * (`Identity`, `BigNumber`) or an interface with methods carries members no caller passes, and an
 * array, a function or a primitive has no members to read
 */
function isOptionsBag(type: Type): boolean {
  if (!type.isObject() && !type.isIntersection()) return false;

  if (type.isArray() || type.isTuple()) return false;

  if (type.getCallSignatures().length || type.getConstructSignatures().length) return false;

  // a dependency's shape is not ours to describe, and the name is what a caller writes anyway
  const declaredInDependency = type
    .getSymbol()
    ?.getDeclarations()
    .some(declaration => declaration.getSourceFile().getFilePath().includes('/node_modules/'));

  if (declaredInDependency) return false;

  const properties = type.getProperties();

  if (!properties.length) return false;

  return properties.every(property =>
    property.getDeclarations().every(declaration => Node.isPropertySignature(declaration))
  );
}

/**
 * Describe a parameter's type as the shape a caller sees, so that two spellings of the same shape
 * record the same text and the comparison can read them member by member.
 *
 * Every options bag is read the same way, whether it is spelled out, named
 * (`MiddlewarePaginationOptions`) or part-named (`MiddlewarePaginationOptions & { orderBy?: X }`),
 * so that moving members behind a name records what spelling them out records. Reading them all
 * the same way matters as much as flattening does: a member's own type is printed as the compiler
 * resolves it, so a bag read one way and a bag read the other disagree over an alias
 * (`ClaimTypeInput` for `TrustedFor`) that means nothing to a caller
 */
function describeType(type: Type, node: Node): string {
  let described = type;

  if (described.isUnion()) {
    const defined = described.getUnionTypes().filter(member => !member.isUndefined());

    if (defined.length !== 1) {
      return normalizeTypeText(described.getText(node), { dropUndefined: true });
    }

    described = defined[0]!;
  }

  if (!isOptionsBag(described)) {
    return normalizeTypeText(described.getText(node), { dropUndefined: true });
  }

  const members = described.getProperties().map(property => {
    const optional = property.hasFlags(SymbolFlags.Optional) ? '?' : '';
    const memberType = normalizeTypeText(property.getTypeAtLocation(node).getText(node), {
      dropUndefined: optional === '?',
    });

    return `${property.getName()}${optional}: ${memberType};`;
  });

  // the compiler's member order is not the source's, so sort to keep an unrelated edit out of here
  return `{ ${members.sort().join(' ')} }`;
}

function extractMethodOverloads(decl: ClassDeclaration | InterfaceDeclaration) {
  const methodsByName = new Map<string, MethodDeclaration[]>();

  for (const member of decl.getMembers()) {
    if (Node.isMethodDeclaration(member)) {
      const name = member.getName();
      if (!methodsByName.has(name)) methodsByName.set(name, []);
      methodsByName.get(name)!.push(member);
    }
  }

  return Array.from(methodsByName.entries()).map(([name, overloads]) => {
    const signatures = overloads.map(method => {
      const params = method.getParameters().map(param => {
        const type = describeType(param.getType(), param);
        return {
          name: param.getName(),
          type,
          optional: param.isOptional(),
        };
      });

      const returnType = normalizeTypeText(method.getReturnType().getText(method));
      return { parameters: params, returnType };
    });

    return {
      name,
      overloads: signatures,
    };
  });
}

const snapshot: Record<string, any> = {};

for (const file of files) {
  const exports: any = {};

  file.getClasses().forEach(cls => {
    exports[cls.getName() || 'UnnamedClass'] = extractMethodOverloads(cls);
  });

  file.getInterfaces().forEach(iface => {
    exports[iface.getName() || 'UnnamedInterface'] = extractMethodOverloads(iface);
  });

  if (Object.keys(exports).length > 0) {
    snapshot[path.relative(distDir, file.getFilePath())] = exports;
  }
}

fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
console.log(`✅ API snapshot saved to: ${snapshotPath}`);
