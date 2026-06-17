export type TranslationDict = Record<string, string | Record<string, string | Record<string, string>>>

export type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${NestedKeyOf<T[K]>}`
      : never
}[keyof T & string]
