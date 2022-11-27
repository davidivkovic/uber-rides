type Primitive = number | boolean | string
type Reference = object | []
type ShallowSource = () => Primitive | Reference

function computed<T>(source: ShallowSource, getter: (previous?: T) => T): () => T
function computed<T>(sources: ShallowSource[], getter: (previous?: T) => T): () => T
function computed<T>(sources: any, getter: (previous?: T) => T): () => T {
  if (sources instanceof Function) sources = [sources]
  let cache: T
  if ((sources as ShallowSource[]).some(s => s() !== undefined)) {
    cache = getter()
  }
  let sourcesMemo = (sources as ShallowSource[]).map(s => s())
  const update = () => {
    let dirty = false
    for (let i = 0; i < sources.length; i++) {
      const current = sources[i]()
      if (current !== sourcesMemo[i]) {
        sourcesMemo[i] = current
        dirty = true
      }
    }
    if (dirty) cache = getter(cache)
    return cache
  }
  return update
}

type WatchCallback<T> = (previous: T, current: T) => void
type StopHandle = (stopFn: () => void) => void
type WatchOptions = { immediate?: boolean }

function watchEffect<T>(
  source: ShallowSource,
  callback: WatchCallback<T>,
  options?: WatchOptions,
  stopHandle?: StopHandle
): () => void
function watchEffect<T>(
  sources: ShallowSource[],
  callback: WatchCallback<T[]>,
  options?: WatchOptions,
  stopHandle?: StopHandle
): () => void
function watchEffect(
  sources: any,
  callback: any,
  options?: WatchOptions,
  stopHandle?: StopHandle
): () => void {
  const sourcesIsFunction = sources instanceof Function
  let sourcesMemo: (Primitive | Reference)[]

  if (sourcesIsFunction) sources = [sources]
  sourcesMemo = (sources as ShallowSource[]).map(s => s())

  if (options?.immediate) {
    if (sourcesIsFunction) callback(undefined, sourcesMemo[0])
    else callback([], sourcesMemo)
  }

  let stopped = false
  stopHandle && stopHandle(() => stopped = true)

  const update = () => {
    if (stopped) return
    let prevSourcesMemo = sourcesMemo
    for (let i = 0; i < sources.length; i++) {
      const previous = sourcesMemo[i]
      const current = sources[i]()
      if (previous !== current) {
        if (sourcesIsFunction) {
          callback(previous, current)
        } else {
          prevSourcesMemo = [...sourcesMemo]
        }
        sourcesMemo[i] = current
        if (!sourcesIsFunction) {
          callback(prevSourcesMemo, sourcesMemo)
        }
      }
    }
  }
  return update
}

export { watchEffect, computed }