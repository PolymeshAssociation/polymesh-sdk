import { getTypeDef } from '@polkadot/types';
import { TypeDef, TypeDefInfo } from '@polkadot/types/types';
import { polymesh } from 'polymesh-types/definitions';

import {
  ArrayTransactionArgument,
  ComplexTransactionArgument,
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
