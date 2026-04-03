/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-console */
/* eslint-disable require-jsdoc */

import * as fs from 'fs';
import * as ts from 'typescript';

// path to middleware types file
const inputFile = 'src/middleware/types.ts';

/**
 * The schema contains lot of types to support query formation.
 * SDK does not use these types explicitly and directly creates string query
 *
 * This script removes types that are not used by SDK.
 *
 * @note here the `OrderBy` enums are not removed since we use them to have type safety
 */
const excludedSuffixes = [
  'Args',
  'Edge',
  'Input',
  'GroupBy',
  'Aggregates',
  'AggregatesFilter',
  'AggregateFilter',
  '_Distinct_Enum',
];

/**
 * SDK only uses basic order by values.
 * Following list of enum values in all the `OrderBy` enums should be removed
 */
const excludedOrderByEnumValues = [
  'Average',
  'Max',
  'Min',
  'StddevSample',
  'StddevPopulation',
  'Sum',
  'VariancePopulation',
  'VarianceSample',
  'DistinctCount',
  'Count',
  'By',
];

/**
 * Populate the list of connection types which should not be altered.
 *
 * Other connection types are replaced with generic Connection<T> type.
 */
const excludedConnectionTypes = ['ClaimsConnection'];

/**
 * Claims related queries use grouped aggregates.
 * We need to keep that.
 */
const isClaimAggregate = (typeName: string): boolean =>
  typeName.startsWith('Claim') &&
  !typeName.includes('ClaimScope') &&
  typeName.endsWith('Aggregates');

// Function to check if a type name ends with any of the specified suffixes
function shouldRemoveType(typeName: string): boolean {
  return !isClaimAggregate(typeName) && excludedSuffixes.some(suffix => typeName.endsWith(suffix));
}

// Function to check if a type name ends with 'Connection'
function isConnectionType(typeName: string): boolean {
  return typeName.endsWith('Connection') && !excludedConnectionTypes.includes(typeName);
}

function isOneToManyConnectionFilter(typeName: string): boolean {
  const regex = /^[A-Z][a-zA-Z]*ToMany[A-Z][a-zA-Z]*Filter$/;
  return regex.test(typeName);
}

function isUnwantedOrderByEnum(name: string): boolean {
  const regexString = `[A-z][a-zA-Z]*(${excludedOrderByEnumValues.join('|')})(.*)?(Asc|Desc)$`;

  const regex = new RegExp(regexString);
  return regex.test(name);
}

/**
 * We remove 'aggregates', 'edges', 'groupedAggregates' properties from all connection types
 */
function shouldRemoveProperty(typeName: string, propertyName: string): boolean {
  const propertiesToRemove = ['aggregates', 'edges', 'groupedAggregates'];
  const isClaims = typeName.startsWith('Claims');
  if (propertyName === 'groupedAggregates' && isClaims) {
    return false;
  }
  return propertiesToRemove.includes(propertyName) || propertyName.endsWith('Exist');
}

// Helper to handle Array<Maybe<T>> pattern
function extractFromMaybeArray(typeNode: ts.TypeNode): string | null {
  if (
    ts.isTypeReferenceNode(typeNode) &&
    ts.isIdentifier(typeNode.typeName) &&
    typeNode.typeName.text === 'Array' &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length === 1
  ) {
    const arrayElementType = typeNode.typeArguments[0];

    // Check if it's Maybe<T>
    if (
      arrayElementType &&
      ts.isTypeReferenceNode(arrayElementType) &&
      ts.isIdentifier(arrayElementType.typeName) &&
      arrayElementType.typeName.text === 'Maybe' &&
      arrayElementType.typeArguments &&
      arrayElementType.typeArguments.length === 1
    ) {
      const maybeElementType = arrayElementType.typeArguments[0];

      // Get the actual type T
      if (
        maybeElementType &&
        ts.isTypeReferenceNode(maybeElementType) &&
        ts.isIdentifier(maybeElementType.typeName)
      ) {
        return maybeElementType.typeName.text;
      }
    }
  }
  return null;
}

// Helper to handle InputMaybe<T> pattern
function extractFromInputMaybe(typeNode: ts.TypeNode): string | null {
  if (
    ts.isTypeReferenceNode(typeNode) &&
    ts.isIdentifier(typeNode.typeName) &&
    typeNode.typeName.text === 'InputMaybe' &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length === 1
  ) {
    const maybeElementType = typeNode.typeArguments[0];
    // Get the actual type T
    if (
      maybeElementType &&
      ts.isTypeReferenceNode(maybeElementType) &&
      ts.isIdentifier(maybeElementType.typeName)
    ) {
      return maybeElementType.typeName.text;
    }
  }
  return null;
}

// Function to extract the element type from a nodes property
function extractTypeFromSpecificProperty(typeNode: ts.TypeNode): string | null {
  return extractFromMaybeArray(typeNode) || extractFromInputMaybe(typeNode);
}

// Function to extract the element type from a connection type
function extractElementType(
  node: ts.TypeAliasDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration,
  stringToCheck: string
): string | null {
  if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
    // Handle type aliases with type literals
    for (const member of node.type.members) {
      if (
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.name.text === stringToCheck &&
        member.type
      ) {
        return extractTypeFromSpecificProperty(member.type);
      }
    }
  } else if (ts.isInterfaceDeclaration(node)) {
    // Handle interface declarations
    for (const member of node.members) {
      if (
        ts.isPropertySignature(member) &&
        member.name &&
        ts.isIdentifier(member.name) &&
        member.name.text === stringToCheck &&
        member.type
      ) {
        return extractTypeFromSpecificProperty(member.type);
      }
    }
  }
  return null;
}

// Read the source file
const sourceText = fs.readFileSync(inputFile, 'utf-8');
const sourceFile = ts.createSourceFile(inputFile, sourceText, ts.ScriptTarget.Latest, true);

// Find all type names that we want to keep (not ending with unwanted suffixes)
const typesToKeep = new Set<string>();
const typesToRemove = new Set<string>();
const connectionTypes = new Map<string, string>(); // Map of connection type name to element type
const oneToManyConnectionFilters = new Map<string, string>(); // Map of one to many connection filter type name to element type
// First pass: Identify types to keep and remove
ts.forEachChild(sourceFile, node => {
  if (
    ts.isTypeAliasDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isEnumDeclaration(node)
  ) {
    const typeName = node.name.text;
    if (shouldRemoveType(typeName)) {
      typesToRemove.add(typeName);
    } else if (isConnectionType(typeName)) {
      // Extract the element type for connection types
      const elementType = extractElementType(node, 'nodes');

      if (elementType) {
        connectionTypes.set(typeName, elementType);
        typesToRemove.add(typeName); // We'll remove original connection types
      } else {
        typesToKeep.add(typeName);
      }
    } else if (isOneToManyConnectionFilter(typeName)) {
      const elementType = extractElementType(node, 'every');
      if (elementType) {
        oneToManyConnectionFilters.set(typeName, elementType);
        typesToRemove.add(typeName); // We'll remove original one to many filter types
      } else {
        typesToKeep.add(typeName);
      }
    } else {
      typesToKeep.add(typeName);
    }
  }
});

// Create a printer to generate the output
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

// Track referenced types to identify potentially dangling types
const referencedTypes = new Set<string>();

const handleTypeReference = (
  node: ts.TypeReferenceNode,
  connections: Map<string, string>,
  oneToManyFilters: Map<string, string>
): ts.Node => {
  if (ts.isIdentifier(node.typeName)) {
    if (connections.has(node.typeName.text)) {
      const elementType = connections.get(node.typeName.text)!;
      return ts.factory.createTypeReferenceNode('Connection', [
        ts.factory.createTypeReferenceNode(elementType, undefined),
      ]);
    } else if (oneToManyFilters.has(node.typeName.text)) {
      const elementType = oneToManyFilters.get(node.typeName.text)!;
      return ts.factory.createTypeReferenceNode('OneToManyFilter', [
        ts.factory.createTypeReferenceNode(elementType, undefined),
      ]);
    }
  }
  return node;
};

const shouldNotEmit = (
  node: ts.Node,
  connections: Map<string, string>,
  oneToManyFilters: Map<string, string>
): boolean => {
  return (
    (ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isEnumDeclaration(node)) &&
    (shouldRemoveType(node.name.text) ||
      connections.has(node.name.text) ||
      oneToManyFilters.has(node.name.text))
  );
};

const handleInterfaceDeclaration = (
  node: ts.InterfaceDeclaration,
  visit: (node: ts.Node) => ts.Node,
  context: ts.TransformationContext
): ts.Node => {
  if (node.name.text === 'ClaimsConnection') {
    return ts.visitEachChild(node, visit, context);
  }
  const filteredMembers = node.members.filter(member => {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      return !shouldRemoveProperty(node.name.text, member.name.text);
    }
    return true;
  });

  return ts.factory.updateInterfaceDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    filteredMembers.map(member => ts.visitNode(member, visit) as ts.TypeElement)
  );
};

const handleEnumDeclaration = (node: ts.EnumDeclaration): ts.Node => {
  if (!node.name.text.endsWith('OrderBy')) {
    return node;
  }
  const filteredMembers = node.members.filter(member => {
    if (ts.isEnumMember(member) && member.name && ts.isIdentifier(member.name)) {
      return !isUnwantedOrderByEnum(member.name.text);
    }
    return true;
  });

  filteredMembers.push(
    ts.factory.createEnumMember(
      ts.factory.createIdentifier('CreatedAtAsc'),
      ts.factory.createStringLiteral('CREATED_AT_ASC')
    ),
    ts.factory.createEnumMember(
      ts.factory.createIdentifier('CreatedAtDesc'),
      ts.factory.createStringLiteral('CREATED_AT_DESC')
    )
  );

  return ts.factory.updateEnumDeclaration(node, node.modifiers, node.name, filteredMembers);
};

const handleTypeAliasDeclaration = (
  node: ts.TypeAliasDeclaration,
  visit: (node: ts.Node) => ts.Node,
  context: ts.TransformationContext
): ts.Node => {
  if (!node.type || !ts.isTypeLiteralNode(node.type)) {
    return ts.visitEachChild(node, visit, context);
  }
  const filteredMembers = node.type.members.filter(member => {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      return !shouldRemoveProperty(node.name.text, member.name.text);
    }
    return true;
  });

  const newTypeLiteral = ts.factory.createTypeLiteralNode(
    filteredMembers.map(member => ts.visitNode(member, visit) as ts.TypeElement)
  );

  return ts.factory.updateTypeAliasDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    newTypeLiteral
  );
};

const handlePropertySignature = (
  node: ts.PropertySignature,
  visit: (node: ts.Node) => ts.Node,
  refs: Set<string>
): ts.Node => {
  if (node.type && ts.isTypeReferenceNode(node.type) && ts.isIdentifier(node.type.typeName)) {
    refs.add(node.type.typeName.text);
  }

  return ts.factory.updatePropertySignature(
    node,
    node.modifiers,
    node.name,
    node.questionToken,
    ts.visitNode(node.type, visit) as ts.TypeNode
  );
};

// Create a transformer factory
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
  const visit = (node: ts.Node): ts.Node => {
    let result: ts.Node = node;

    if (ts.isTypeReferenceNode(node)) {
      result = handleTypeReference(node, connectionTypes, oneToManyConnectionFilters);
    } else if (shouldNotEmit(node, connectionTypes, oneToManyConnectionFilters)) {
      return ts.factory.createNotEmittedStatement(node);
    } else if (ts.isInterfaceDeclaration(node)) {
      result = handleInterfaceDeclaration(node, visit, context);
    } else if (ts.isEnumDeclaration(node)) {
      result = handleEnumDeclaration(node);
    } else if (ts.isTypeAliasDeclaration(node)) {
      result = handleTypeAliasDeclaration(node, visit, context);
    } else if (ts.isPropertySignature(node)) {
      result = handlePropertySignature(node, visit, referencedTypes);
    }

    if (result !== node) {
      return result;
    }

    return ts.visitEachChild(node, visit, context);
  };

  return (node: T) => ts.visitNode(node, visit);
};

// Apply transformation
const result = ts.transform(sourceFile, [transformer]);
const transformedSourceFile = result.transformed[0]!;

// Generate the output
let outputText = printer.printNode(ts.EmitHint.SourceFile, transformedSourceFile, sourceFile);

// Filter out removed type declarations (NotEmittedStatement)
outputText = outputText.replace(/;\s*;/g, ';');

// Add the Connection<T> type declaration to the beginning of the file
const connectionTypeDeclaration = `export type Connection<T> = {
  nodes: Array<Maybe<T>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};
`;

const oneToManyFilterTypeDeclaration = `export type OneToManyFilter<T> = {
  every?: InputMaybe<T>;
  some?: InputMaybe<T>;
  none?: InputMaybe<T>;
};
`;

outputText = connectionTypeDeclaration + oneToManyFilterTypeDeclaration + outputText;

// Write the result to the output file
fs.writeFileSync(inputFile, outputText);

console.log(`Types cleaned and saved to ${inputFile}`);
console.log(`Removed ${typesToRemove.size} types`);
console.log(`Found and replaced ${connectionTypes.size} connection types`);
console.log(`Found and replaced ${oneToManyConnectionFilters.size} one to many connection filters`);

// Optional: Identify potentially dangling types
const potentiallyDanglingTypes = [...referencedTypes].filter(
  typeName =>
    !typesToKeep.has(typeName) && !typesToRemove.has(typeName) && typeName !== 'Connection'
);

if (potentiallyDanglingTypes.length > 0) {
  console.log('\nPotentially dangling types that may need review:');
  potentiallyDanglingTypes.forEach(type => console.log(`- ${type}`));
}
