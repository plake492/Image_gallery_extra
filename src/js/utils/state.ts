declare global {
  interface ProxyConstructor {
    new <TSource extends object, TTarget extends object>(
      target: TSource,
      handler: ProxyHandler<TSource>,
    ): TTarget
  }
}

/**
 * Create a proxy object that will trigger a callback function when state props are updated
 * @param stateInitial Initial state Object
 * @param cb
 * @returns {T} Proxy object
 */
export const setState = <T extends object>(
  stateInitial: T,
  cb?: (a: T, b: string, c: any) => void,
): T => {
  return new Proxy(stateInitial as object, {
    set: (target: T, key: string, value) => {
      target[key as keyof T] = value
      if (cb) cb(target, key, value)
      return true
    },
  })
}
