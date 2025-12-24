/**
 * Utility types for dot-notation paths
 * heavily inspired by react-hook-form and generic type manipulations
 */

// Primitive types that should not be traversed
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

// Helper to check if T is a tuple
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;

// Helper to get array keys: "0", "1", "2"...
type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

// PathImpl: Recursive type to generate paths
type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}` | `${K}.${Path<V>}`;

/**
 * Path<T>: Generates all valid dot-notation paths for type T
 */
export type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathImpl<K & string, T[K]>;
      }[TupleKeys<T>]
    : PathImpl<number, V>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T];

/**
 * PathValue<T, P>: Infers the value type at a specific path P of type T
 */
export type PathValue<T, P extends Path<T>> = T extends any
  ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : K extends `${number}`
      ? T extends ReadonlyArray<infer V>
        ? R extends Path<V>
          ? PathValue<V, R>
          : never
        : never
      : never
    : P extends keyof T
    ? T[P]
    : P extends `${number}`
    ? T extends ReadonlyArray<infer V>
      ? V
      : never
    : never
  : never;
