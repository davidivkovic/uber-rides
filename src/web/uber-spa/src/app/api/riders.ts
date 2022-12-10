import { fetch } from '.'

const basePath = '/riders'

const search = async (query: string, page: number = 0) => {
  const response = await fetch(
    basePath + '?' + new URLSearchParams({ query, page: page.toString() }).toString(),
    {
      method: 'GET'
    }
  )
  if (!response.ok) return []
  return await response.json()
}

export default { search }