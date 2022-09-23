export type Result<T, S> =
  | {
      kind: "ok";
      value: T;
    }
  | {
      kind: "err";
      value: S;
    };
