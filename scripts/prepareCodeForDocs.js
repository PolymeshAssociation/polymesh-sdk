/*
 * Author: Jeremías Díaz (monitz87)
 *
 * This script is part of a workaround to be able to make ProcedureMethods be correctly
 *  recognized as functions by typedoc. Since how to create a typedoc plugin is not documented
 *  (and we're using an older version), the way we're handling it is:
 *
 *   1. copy and rename the `src` directory
 *   2. replace all `ProcedureMethod` declarations in the code to resemble a method signature
 *   3. add a `@note` tag explaining the special functionality of procedure methods
 *   4. add necessary imports to modified files
 *   5. run typedoc targeting the modified source code
 *   6. restore the original `src` directory
 *
 * Steps 1, 5 and 6 are handled outside this script
 */
const ts = require('typescript');
const replace = require('replace-in-file');
const path = require('path');

const methodRegex = /\*\/\n\s+?public (\w+?)!?: (ProcedureMethod<[\w\W]+?>);/gs;
const importRegex = /(import .+? from '.+?';\n)\n/s;

/**
 * Get type arguments from a ProcedureMethod type declaration
 *
 * - calling the function with `ProcedureMethod<Foo, Bar, Baz>` will yield `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: 'Baz' }`
 * - calling the function with `ProcedureMethod<Foo, Bar>` will yield `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: undefined }`
 */
const getTypeArgumentsFromProcedureMethod = typeString => {
  const source = ts.createSourceFile('temp', typeString);

  // NOTE @monitz87: this is very ugly but it's the quickest way I found of getting the type arguments
  const [methodArgs, , procedureReturnValue, , returnValue] = source
    .getChildren(source)[0]
    .getChildren(source)[0]
    .getChildren(source)[0]
    .getChildren(source)[2]
    .getChildren(source)
    .map(child => child.getText(source));

  return {
    methodArgs,
    procedureReturnValue,
    returnValue,
  };
};

/**
 * Assemble a method signature according to the Procedure Method that is being replaced
 */
const createReplacementSignature = (_, funcName, type) => {
  const { methodArgs, returnValue, procedureReturnValue } = getTypeArgumentsFromProcedureMethod(
    type
  );
  const returnValueString = returnValue ? `, ${returnValue}` : '';
  const returnType = `Promise<TransactionQueue<${procedureReturnValue}${returnValueString}>>`;

  // NOTE @monitz87: we make the function return a type asserted value to avoid compilation errors
  return `*
   * @note this method is of type [[ProcedureMethod]], which means you can call \`${funcName}.checkAuthorization\`
   *   on it to see whether the Current Account has the required permissions to run it
   */
  public ${funcName}(args: ${methodArgs}): ${returnType} {
    return {} as ${returnType};
  }`;
};

const createReplacementImport = (_, importStatement) =>
  `${importStatement}import { TransactionQueue } from '~/internal';\n\n`;

const results = replace.sync({
  files: 'src/**/*.ts',
  from: methodRegex,
  to: createReplacementSignature,
});

const changedFiles = results
  .filter(result => result.hasChanged)
  .map(result => path.resolve(result.file));

replace.sync({
  files: changedFiles,
  from: importRegex,
  to: createReplacementImport,
});
