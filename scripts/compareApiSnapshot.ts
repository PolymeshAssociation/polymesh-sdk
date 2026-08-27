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

/**
 * Split an object literal type's body on its top-level member separators, so that members
 * holding a nested object, a function type or a generic stay in one piece
 */
function splitMembers(body: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of body) {
    if ('{(['.includes(char)) depth++;
    else if ('})]'.includes(char)) depth--;

    if (char === ';' && depth === 0) {
      members.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  members.push(current);

  return members.map(member => member.trim()).filter(member => member.length > 0);
}

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
 * Whether a parameter's type only got wider — everything it used to accept, it still accepts.
 *
 * A caller passes a parameter in, so taking more than before cannot break a call already written:
 * `orderBy?: X` becoming `orderBy?: X | X[]` is not a change a caller has to make. This holds for a
 * parameter only. A *return* type that gains a member breaks the caller reading it, which is why
 * return types are compared as plain text
 */
function isWidenedParameterType(baseType: string, currentType: string): boolean {
  const accepted = new Set(splitTopLevelUnion(currentType));

  return splitTopLevelUnion(baseType).every(member => accepted.has(member));
}

type ObjectMember = { optional: boolean; type: string };

const MEMBER_REGEX =
  /^(?:readonly\s+)?([A-Za-z_$][\w$]*|'[^']*'|"[^"]*"|\[[^\]]*\])(\?)?\s*:\s*([\s\S]+)$/;

/**
 * Parse an object literal type's text into its members, or return `null` if the type is
 * anything else — a named type, a union, an intersection — or holds a member we can't read
 */
function parseObjectType(type: string): Map<string, ObjectMember> | null {
  // an optional parameter prints as `T | undefined`; the `optional` flag already records that
  const trimmed = type.trim().replace(/\s*\|\s*undefined$/, '');

  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;

  // reject `{ a: string; } | { b: string; }`, where the leading brace closes before the end
  let depth = 0;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '{') depth++;
    else if (trimmed[i] === '}') depth--;
    if (depth === 0 && i < trimmed.length - 1) return null;
  }

  const members = new Map<string, ObjectMember>();

  for (const member of splitMembers(trimmed.slice(1, -1))) {
    const match = MEMBER_REGEX.exec(member);

    if (!match) return null;

    const [, name, optional, memberType] = match;
    members.set(name!, {
      optional: !!optional,
      // an optional member may or may not be printed with `| undefined`; ignore the difference
      type: memberType!.trim().replace(/\s*\|\s*undefined$/, ''),
    });
  }

  return members;
}

/**
 * Compare two object literal parameter types, returning the ways the current one breaks
 * callers of the base one — an empty array meaning it doesn't, and `null` meaning the types
 * aren't both object literals so we can't tell.
 *
 * A parameter object can gain optional members without breaking anyone, which is the case
 * this exists for. Losing a member, retyping one, making one required, or gaining a required
 * one all break callers.
 */
function compareObjectTypes(baseType: string, currentType: string): string[] | null {
  const baseMembers = parseObjectType(baseType);
  const currentMembers = parseObjectType(currentType);

  if (!baseMembers || !currentMembers) return null;

  const breaks: string[] = [];

  baseMembers.forEach((baseMember, name) => {
    const currentMember = currentMembers.get(name);

    if (!currentMember) {
      breaks.push(`property '${name}' removed`);
      return;
    }

    if (baseMember.optional && !currentMember.optional) {
      breaks.push(`property '${name}' is now required`);
    }

    if (
      baseMember.type !== currentMember.type &&
      !isWidenedParameterType(baseMember.type, currentMember.type)
    ) {
      breaks.push(
        `property '${name}' changed type from '${baseMember.type}' to '${currentMember.type}'`
      );
    }
  });

  currentMembers.forEach((currentMember, name) => {
    if (!baseMembers.has(name) && !currentMember.optional) {
      breaks.push(`required property '${name}' added`);
    }
  });

  return breaks;
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

    if (currSig.parameters.length < baseSig.parameters.length) {
      logBreak(`${filePath} > ${parentName}.${methodName}: Params removed in overload #${i + 1}`);
      return;
    }

    // adding trailing optional params is backwards compatible, adding required ones is not
    const addedRequired = currSig.parameters
      .slice(baseSig.parameters.length)
      .filter(p => !p.optional);

    if (addedRequired.length) {
      logBreak(
        `${filePath} > ${parentName}.${methodName}: Required param(s) added in overload #${
          i + 1
        }: ${addedRequired.map(p => p.name).join(', ')}`
      );
      return;
    }

    for (let j = 0; j < baseSig.parameters.length; j++) {
      const bp = baseSig.parameters[j]!;
      const cp = currSig.parameters[j]!;

      const location = `${filePath} > ${parentName}.${methodName}: Param ${j + 1}`;

      if (bp?.name !== cp?.name || bp?.optional !== cp?.optional) {
        logBreak(
          `${location} mismatch in overload #${i + 1}: was '${bp.name}${
            bp.optional ? '?' : ''
          }', is now '${cp.name}${cp.optional ? '?' : ''}'`
        );
        continue;
      }

      if (bp?.type !== cp?.type && !isWidenedParameterType(bp!.type, cp!.type)) {
        const objectBreaks = compareObjectTypes(bp!.type, cp!.type);

        if (!objectBreaks) {
          // say what moved: a type the members can't be read from is the hardest one to place
          logBreak(
            `${location} in overload #${i + 1}: type changed from '${bp!.type}' to '${cp!.type}'`
          );
        } else {
          objectBreaks.forEach(reason => logBreak(`${location} in overload #${i + 1}: ${reason}`));
        }
      }
    }

    if (baseSig.returnType !== currSig.returnType) {
      logBreak(
        `${filePath} > ${parentName}.${methodName}: Return type changed in overload #${
          i + 1
        }: from '${baseSig.returnType}' to '${currSig.returnType}'`
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
