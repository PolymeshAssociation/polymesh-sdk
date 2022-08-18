import { SinonStub } from 'sinon';

export type Mocked<T> = T & {
  [K in keyof T]: T[K] extends (...args: infer Args) => unknown ? T[K] & SinonStub<Args> : T[K];
};
