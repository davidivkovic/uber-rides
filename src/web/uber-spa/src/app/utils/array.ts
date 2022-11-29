function swap<T>(array: T[] | T[][], indexA: number, indexB: number) {
  const b = array[indexA]
  array[indexA] = array[indexB]
  array[indexB] = b
}

export { swap }