/*
 * This script is part of a workaround to be able to make ProcedureMethods be correctly
 *  recognized as functions by typedoc. Since how to create a typedoc plugin is not documented
 *  (and we're using an older version), the way we're handling it is:
 *
 *   1. copy and rename the `src` directory
 *   2. replace all `ProcedureMethod`, `OptionalArgsProcedureMethod` and `NoArgsProcedureMethod` declarations in the code to resemble a method signature
 *   3. add a `@note` tag explaining the special functionality of procedure methods
 *   4. add necessary imports to modified files
 *   5. run typedoc targeting the modified source code
 *   6. restore the original `src` directory
 *
 * Steps 1, 5 and 6 are handled outside this script
 */
/* eslint-disable */
const ts = require('typescript');
const replace = require('replace-in-file');
const path = require('path');

const methodRegex =
  /\*\/\n\s+?public ((?:abstract )?\w+?)!?: ((?:(:?NoArgs|OptionalArgs)|(?:CreateTransactionBatch))?ProcedureMethod(?:<[\w\W]+?>)?);/gs;
const importRegex = /(import .+? from '.+?';\n)\n/s;

/**
 * Get type arguments from a `ProcedureMethod`, `OptionalArgsProcedureMethod`, `NoArgsProcedureMethod` or `CreateTransactionBatchProcedureMethod`  type declaration
 *
 * - calling the function with `ProcedureMethod<Foo, Bar, Baz>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: 'Baz', kind: 'ProcedureMethod' }`
 * - calling the function with `ProcedureMethod<Foo, Bar>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: undefined, kind: 'ProcedureMethod' }`
 * - calling the function with `OptionalArgsProcedureMethod<Foo, Bar, Baz>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: 'Baz', kind: 'ProcedureMethod' }`
 * - calling the function with `OptionalArgsProcedureMethod<Foo, Bar>` will return `{ methodArgs: 'Foo', procedureReturnValue: 'Bar', returnValue: undefined, kind: 'ProcedureMethod' }`
 * - calling the function with `NoArgsProcedureMethod<Foo, Bar>` will return `{ procedureReturnValue: 'Foo', returnValue: 'Bar', kind: 'NoArgsProcedureMethod' }`
 * - calling the function with `NoArgsProcedureMethod<Foo>` will return `{ procedureReturnValue: 'Foo', returnValue: undefined, kind: 'NoArgsProcedureMethod' }`
 * - calling the function with `CreateTransactionBatchProcedureMethod` will return  `{ methodArgs: 'CreateTransactionBatchParams<ReturnValues>', procedureReturnValue: 'ReturnValues', returnValue: undefined, kind: 'CreateTransactionBatchProcedureMethod' }`
 */
const getTypeArgumentsFromProcedureMethod = typeString => {
  const source = ts.createSourceFile('temp', typeString);

  // NOTE @monitz87: this is very ugly but it's the quickest way I found of getting the type arguments
  const signature = source.getChildren(source)[0].getChildren(source)[0].getChildren(source)[0];
  let kind = signature.getText(source);

  // this is the case where the type has generic arguments (e.g. `ProcedureMethod<Foo, Bar>`, as opposed to `CreateTransactionMethodProcedureArgs`)
  if (signature.getChildren(source).length > 0) {
    kind = signature.getChildren(source)[0].getText(source);
  }

  if (kind === 'CreateTransactionBatchProcedureMethod') {
    return {
      methodArgs: 'CreateTransactionBatchParams<ReturnValues>',
      procedureReturnValue: 'ReturnValues',
      kind,
    };
  }

  const [first, , second, , third] = signature
    .getChildren(source)[2]
    .getChildren(source)
    .map(child => child.getText(source));

  if (kind === 'ProcedureMethod' || kind === 'OptionalArgsProcedureMethod') {
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
  const returnValueString = `, ${returnValue || procedureReturnValue}`;
  const returnType = `Promise<GenericPolymeshTransaction<${procedureReturnValue}${returnValueString}>>`;

  const args =
    kind === 'OptionalArgsProcedureMethod' ? `args?: ${methodArgs}, ` : `args: ${methodArgs}, `;
  const funcArgs = `(${
    [
      'ProcedureMethod',
      'OptionalArgsProcedureMethod',
      'CreateTransactionBatchProcedureMethod',
    ].includes(kind)
      ? args
      : ''
  }opts?: ProcedureOpts)`;
  const name = funcName.replace('abstract ', '');
  const isAbstract = name !== funcName;
  const genericParams =
    kind === 'CreateTransactionBatchProcedureMethod'
      ? '<ReturnValues extends readonly [...unknown[]]>'
      : '';

  // NOTE @monitz87: we make the function return a type asserted value to avoid compilation errors
  const implementation = ` {
    return {} as ${returnType};
  }`;

  return `*
   * @note this method is of type {@link types!${kind} | ${kind}}, which means you can call {@link types!${kind}.checkAuthorization | ${name}.checkAuthorization}
   *   on it to see whether the signing Account and Identity have the required roles and permissions to run it
   */
  public ${funcName}${genericParams}${funcArgs}: ${returnType}${isAbstract ? ';' : implementation}`;
};

const createReplacementImport = (_, importStatement) =>
  `${importStatement}import { CreateTransactionBatchParams, GenericPolymeshTransaction, ProcedureOpts } from '~/types';\n\n`;

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
