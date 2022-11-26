import { userStore } from '@app/stores'

const baseUrl = 'http://localhost:8000'

const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (typeof input === 'string' && !input.startsWith('http') && input.startsWith('/')) {
    input = baseUrl + input
  }

  if (init?.body && typeof init.body === 'string') {
    init.headers = {
      'Content-Type': 'application/json',
      ...init.headers
    }
  }

  return window.fetch(input, {
    headers: {
      Authorization: `Bearer ${userStore.accessToken()}`,
      ...init?.headers
    },
    ...init
  })
}

export { fetch }