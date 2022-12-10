import { userStore } from '@app/stores'

const scheme = 'http://'
const baseUrl = 'localhost:8000'

const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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

  return window.fetch(input, {
    headers: {
      ...init?.headers,
    },
    ...init
  })
}

export { fetch, baseUrl }