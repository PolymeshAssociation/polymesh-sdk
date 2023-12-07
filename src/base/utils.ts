import { getTypeDef } from '@polkadot/types';
import { SpRuntimeDispatchError } from '@polkadot/types/lookup';
import { RegistryError, TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { polymesh } from 'polymesh-types/definitions';

import { PolymeshError } from '~/internal';
import {
  ArrayTransactionArgument,
  ComplexTransactionArgument,
  ErrorCode,
  PlainTransactionArgument,
  SimpleEnumTransactionArgument,
  TransactionArgument,
  TransactionArgumentType,
} from '~/types';
import { ROOT_TYPES } from '~/utils/constants';

const { types } = polymesh;

const getRootType = (
  type: string
):
  | PlainTransactionArgument
  | ArrayTransactionArgument
  | SimpleEnumTransactionArgument
  | ComplexTransactionArgument => {
  const rootType = ROOT_TYPES[type];

  if (rootType) {
    return {
      type: rootType,
    };
  }
  if (type === 'Null') {
    return {
      type: TransactionArgumentType.Null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const definition = (types as any)[type];

  if (!definition) {
    return {
      type: TransactionArgumentType.Unknown,
    };
  }

  const typeDef = getTypeDef(JSON.stringify(definition));

  if (typeDef.info === TypeDefInfo.Plain) {
    return getRootType(definition);
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return processType(typeDef, '');
};

export const processType = (rawType: TypeDef, name: string): TransactionArgument => {
  const { type, info, sub } = rawType;

  const arg = {
    name,
    optional: false,
    _rawType: rawType,
  };

  switch (info) {
    case TypeDefInfo.Plain: {
      return {
        ...getRootType(type),
        ...arg,
      };
    }
    case TypeDefInfo.Compact: {
      return {
        ...processType(sub as TypeDef, name),
        ...arg,
      };
    }
    case TypeDefInfo.Option: {
      return {
        ...processType(sub as TypeDef, name),
        ...arg,
        optional: true,
      };
    }
    case TypeDefInfo.Tuple: {
      return {
        type: TransactionArgumentType.Tuple,
        ...arg,
        internal: (sub as TypeDef[]).map((def, index) => processType(def, `${index}`)),
      };
    }
    case TypeDefInfo.Vec: {
      return {
        type: TransactionArgumentType.Array,
        ...arg,
        internal: processType(sub as TypeDef, ''),
      };
    }
    case TypeDefInfo.VecFixed: {
      return {
        type: TransactionArgumentType.Text,
        ...arg,
      };
    }
    case TypeDefInfo.Enum: {
      const subTypes = sub as TypeDef[];

      const isSimple = subTypes.every(({ type: subType }) => subType === 'Null');

      if (isSimple) {
        return {
          type: TransactionArgumentType.SimpleEnum,
          ...arg,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          internal: subTypes.map(({ name: subName }) => subName!),
        };
      }

      return {
        type: TransactionArgumentType.RichEnum,
        ...arg,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        internal: subTypes.map(def => processType(def, def.name!)),
      };
    }
    case TypeDefInfo.Struct: {
      return {
        type: TransactionArgumentType.Object,
        ...arg,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        internal: (sub as TypeDef[]).map(def => processType(def, def.name!)),
      };
    }
    default: {
      return {
        type: TransactionArgumentType.Unknown,
        ...arg,
      };
    }
  }
};

/**
 * @hidden
 */
export const handleExtrinsicFailure = (
  reject: (reason?: unknown) => void,
  error: SpRuntimeDispatchError,
  data?: Record<string, unknown>
): void => {
  // get revert message from event
  let message: string;

  if (error.isModule) {
    // known error
    const mod = error.asModule;

    const { section, name, docs }: RegistryError = mod.registry.findMetaError(mod);
    message = `${section}.${name}: ${docs.join(' ')}`;
  } else if (error.isBadOrigin) {
    message = 'Bad origin';
  } else if (error.isCannotLookup) {
    message = 'Could not lookup information required to validate the transaction';
  } else {
    message = 'Unknown error';
  }

  reject(new PolymeshError({ code: ErrorCode.TransactionReverted, message, data }));
};
