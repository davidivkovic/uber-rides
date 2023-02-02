import auth from '@app/api/auth'
import { userStore } from '@app/stores'

describe('login', () => {
  const requestData ={ email: 'string', password: 'string' }
  const responseData = { user: {}, accessToken: 'token' }

  beforeEach(() => {
    spyOn(userStore, 'setUser').and.callThrough()
  })

  it('should set user in user store', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(
      (input: RequestInfo | URL, init?: RequestInit) => {
        return Promise.resolve(
          new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
              'Content-type': 'application/json'
            }
          })
        )
      }
    )

    await auth.login(requestData)

    expect(fetchSpy).toHaveBeenCalled()
    expect(userStore.setUser).toHaveBeenCalledOnceWith(responseData.user, responseData.accessToken)
  })

  it('should fail and throw error', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(
      (input: RequestInfo | URL, init?: RequestInit) => {
        throw new Error('Bad credentials')
      }
    )

    try {
      await auth.login(requestData)
    } catch (error) {
      expect(fetchSpy).toHaveBeenCalled()
      expect(userStore.setUser).not.toHaveBeenCalled()
      expect(error).toEqual(new Error('Bad credentials'))
    }
  })
})
