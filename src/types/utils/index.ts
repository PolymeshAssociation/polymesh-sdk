import { SinonStub } from 'sinon';

export type Mutable<Immutable> = {
  -readonly [K in keyof Immutable]: Immutable[K];
};

export type Mocked<T> = T &
  {
    [K in keyof T]: T[K] extends (...args: infer Args) => unknown ? T[K] & SinonStub<Args> : T[K];
  };
