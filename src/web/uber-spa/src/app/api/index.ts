import { userStore } from '@app/stores'

const scheme = 'http://'
const baseUrl = 'localhost:8000'
// const baseUrl = '192.168.0.12:8000'

let fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (typeof input === 'string' && !input.startsWith('http') && input.startsWith('/')) {
    input = scheme + baseUrl + input
  }

  if (init?.body && typeof init.body === 'string') {
    init.headers = {
      'Content-Type': 'application/json',
      ...init.headers
    }
  }

  if (userStore.isAuthenticated) {
    init.headers = { ...init?.headers, Authorization: `Bearer ${userStore.accessToken()}` }
  }

  const result = await window.fetch(input, {
    headers: {
      ...init?.headers,
    },
    ...init
  })
  if (!result.ok && result.status === 401) {
    await window.router.navigate(['/auth/login'])
    localStorage.clear()
    location.reload()
  }
  return result
}

export { fetch, scheme, baseUrl }