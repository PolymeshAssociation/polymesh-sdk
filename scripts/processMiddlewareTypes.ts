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

// Function to extract the element type from a nodes property
function extractTypeFromSpecificProperty(typeNode: ts.TypeNode): string | null {
  // Handle Array<Maybe<T>> pattern
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
      ts.isTypeReferenceNode(arrayElementType) &&
      ts.isIdentifier(arrayElementType.typeName) &&
      arrayElementType.typeName.text === 'Maybe' &&
      arrayElementType.typeArguments &&
      arrayElementType.typeArguments.length === 1
    ) {
      const maybeElementType = arrayElementType.typeArguments[0];

      // Get the actual type T
      if (ts.isTypeReferenceNode(maybeElementType) && ts.isIdentifier(maybeElementType.typeName)) {
        return maybeElementType.typeName.text;
      }
    }
  }

  // Check if it's InputMaybe<T>
  if (
    ts.isTypeReferenceNode(typeNode) &&
    ts.isIdentifier(typeNode.typeName) &&
    typeNode.typeName.text === 'InputMaybe' &&
    typeNode.typeArguments &&
    typeNode.typeArguments.length === 1
  ) {
    const maybeElementType = typeNode.typeArguments[0];
    // Get the actual type T
    if (ts.isTypeReferenceNode(maybeElementType) && ts.isIdentifier(maybeElementType.typeName)) {
      return maybeElementType.typeName.text;
    }
  }
  return null;
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

// Create a transformer factory
const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
  const visit = (node: ts.Node): ts.Node => {
    // Replace type references that are connection types or one to many connection filters
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      if (connectionTypes.has(node.typeName.text)) {
        const elementType = connectionTypes.get(node.typeName.text)!;
        return ts.factory.createTypeReferenceNode('Connection', [
          ts.factory.createTypeReferenceNode(elementType, undefined),
        ]);
      } else if (oneToManyConnectionFilters.has(node.typeName.text)) {
        const elementType = oneToManyConnectionFilters.get(node.typeName.text)!;
        return ts.factory.createTypeReferenceNode('OneToManyFilter', [
          ts.factory.createTypeReferenceNode(elementType, undefined),
        ]);
      }
    }

    // Remove types with unwanted suffixes and connection types
    if (
      (ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isEnumDeclaration(node)) &&
      (shouldRemoveType(node.name.text) ||
        connectionTypes.has(node.name.text) ||
        oneToManyConnectionFilters.has(node.name.text))
    ) {
      return ts.factory.createNotEmittedStatement(node);
    }

    // Process interface declarations to remove unwanted properties
    if (ts.isInterfaceDeclaration(node) && node.name.text !== 'ClaimsConnection') {
      const filteredMembers = node.members.filter(member => {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          return !shouldRemoveProperty(node.name.text, member.name.text);
        }
        return true;
      });

      return ts.factory.updateInterfaceDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        filteredMembers.map(member => ts.visitEachChild(member, visit, context))
      );
    }

    // Process interface declarations to remove unwanted properties
    if (ts.isEnumDeclaration(node) && node.name.text.endsWith('OrderBy')) {
      const filteredMembers = node.members.filter(member => {
        if (ts.isEnumMember(member) && member.name && ts.isIdentifier(member.name)) {
          return !isUnwantedOrderByEnum(member.name.text);
        }
        return true;
      });

      // Add createdAt ordering options to all OrderBy enums for backward compatibility
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

      return ts.factory.updateEnumDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        filteredMembers
      );
    }

    // Process type alias declarations with type literals
    if (ts.isTypeAliasDeclaration(node) && node.type && ts.isTypeLiteralNode(node.type)) {
      const filteredMembers = node.type.members.filter(member => {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          return !shouldRemoveProperty(node.name.text, member.name.text);
        }
        return true;
      });

      const newTypeLiteral = ts.factory.createTypeLiteralNode(
        filteredMembers.map(member => ts.visitEachChild(member, visit, context))
      );

      return ts.factory.updateTypeAliasDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        newTypeLiteral
      );
    }

    // Process property signatures to track referenced types
    if (ts.isPropertySignature(node) && node.type) {
      if (ts.isTypeReferenceNode(node.type) && ts.isIdentifier(node.type.typeName)) {
        referencedTypes.add(node.type.typeName.text);
      }

      return ts.factory.updatePropertySignature(
        node,
        node.modifiers,
        node.name,
        node.questionToken,
        ts.visitNode(node.type, visit)
      );
    }

    return ts.visitEachChild(node, visit, context);
  };

  return (node: T) => ts.visitNode(node, visit);
};

// Apply transformation
const result = ts.transform(sourceFile, [transformer]);
const transformedSourceFile = result.transformed[0];

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
