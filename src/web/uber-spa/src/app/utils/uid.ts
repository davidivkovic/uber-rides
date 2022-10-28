const uid = () =>
  'a' + String(
    Math.random().toString(16)
  ).replace(/\./g, '')

export { uid }