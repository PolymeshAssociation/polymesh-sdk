export type Mocked<T> = T & {
  [K in keyof T]: T[K] extends (...args: infer Args) => unknown
    ? T[K] & jest.Mock<ReturnType<T[K]>, Args>
    : T[K];
};
