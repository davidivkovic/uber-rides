const resource = (fetcher: () => any) => {
  const ref = {
    value: null,
    error: null as Error,
    refetch: null as () => {},
    loading: true
  }
  const fetchData = async () => {
    ref.loading = true
    ref.error = null
    try {
      ref.value = await fetcher()
      ref.error = null
    }
    catch (error) {
      ref.value = null
      ref.error = error
    }
    ref.loading = false
  }
  ref.refetch = fetchData
  fetchData()

  return ref
}

export { resource }