/*
 * Author: Jeremías Díaz (monitz87)
 *
 * This script is part of a workaround to be able to make ProcedureMethods be correctly
 *  recognized as functions by typedoc. Since how to create a typedoc plugin is not documented
 *  (and we're using an older version), the way we're handling it is:
 *
 *   1. copy and rename the `src` directory
 *   2. replace all `ProcedureMethod` and `NoArgsProcedureMethod` declarations in the code to resemble a method signature
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

const methodRegex =
  /\*\/\n\s+?public ((?:abstract )?\w+?)!?: ((?:NoArgs)?ProcedureMethod<[\w\W]+?>);/gs;
const importRegex = /(import .+? from '.+?';\n)\n/s;

/**
 * Get type arguments from a `ProcedureMethod` or `NoArgsProcedureMethod`  type declaration
 *
 * - calling the function with `ProcedureMethod<Foo, Bar, Baz>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: 'Baz', kind: 'ProcedureMethod' }`
 * - calling the function with `ProcedureMethod<Foo, Bar>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: undefined, kind: 'ProcedureMethod' }`
 * - calling the function with `NoArgsProcedureMethod<Foo, Bar>` will return `{ procedureReturnValue: 'Foo', returnValue: 'Bar', kind: 'NoArgsProcedureMethod' }`
 * - calling the function with `NoArgsProcedureMethod<Foo>` will returns `{ procedureReturnValue: 'Foo', returnValue: undefined, kind: 'NoArgsProcedureMethod' }`
 */
const getTypeArgumentsFromProcedureMethod = typeString => {
  const source = ts.createSourceFile('temp', typeString);

  // NOTE @monitz87: this is very ugly but it's the quickest way I found of getting the type arguments
  const signature = source.getChildren(source)[0].getChildren(source)[0].getChildren(source)[0];
  const kind = signature.getChildren(source)[0].getText(source);
  const [first, , second, , third] = signature
    .getChildren(source)[2]
    .getChildren(source)
    .map(child => child.getText(source));

  if (kind === 'ProcedureMethod') {
    return {
      methodArgs: first,
      procedureReturnValue: second,
      returnValue: third,
      kind,
    };
  }

  return {
    procedureReturnValue: first,
    returnValue: second,
    kind,
  };
};

/**
 * Assemble a method signature according to the Procedure Method that is being replaced
 */
const createReplacementSignature = (_, funcName, type) => {
  const { methodArgs, returnValue, procedureReturnValue, kind } =
    getTypeArgumentsFromProcedureMethod(type);
  const returnValueString = returnValue ? `, ${returnValue}` : '';
  const returnType = `Promise<TransactionQueue<${procedureReturnValue}${returnValueString}>>`;

  const args = `args: ${methodArgs}, `;
  const funcArgs = `(${kind === 'ProcedureMethod' ? args : ''}opts?: ProcedureOpts)`;
  const name = funcName.replace('abstract ', '');
  const isAbstract = name !== funcName;

  // NOTE @monitz87: we make the function return a type asserted value to avoid compilation errors
  const implementation = ` {
    return {} as ${returnType};
  }`;

  return `*
   * @note this method is of type {@link ${kind}}, which means you can call {@link ${kind}.checkAuthorization | ${name}.checkAuthorization}
   *   on it to see whether the signing Account and Identity have the required roles and permissions to run it
   */
  public ${funcName}${funcArgs}: ${returnType}${isAbstract ? ';' : implementation}`;
};

const createReplacementImport = (_, importStatement) =>
  `${importStatement}import { ProcedureOpts } from '~/types';\nimport { TransactionQueue } from '~/internal';\n\n`;

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
