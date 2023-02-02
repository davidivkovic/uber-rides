import auth from '@app/api/auth'

describe('signup', () => {
  const requestData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password',
    phoneNumber: '123456789',
    city: 'New York',
    role: 'ROLE_RIDER'
  }

  it("should return user's id", async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(
      (input: RequestInfo | URL, init?: RequestInit) => {
        return Promise.resolve(
          new Response(JSON.stringify('id'), {
            status: 200,
            headers: {
              'Content-type': 'application/json'
            }
          })
        )
      }
    )

    const id = await auth.signUp(requestData)

    expect(fetchSpy).toHaveBeenCalled()
    expect(id).toEqual('id')
  })

  it('should fail and throw error', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callFake(
      (input: RequestInfo | URL, init?: RequestInit) => {
        throw new Error('Email taken')
      }
    )

    try {
      await auth.signUp(requestData)
    } catch (error) {
      expect(fetchSpy).toHaveBeenCalled()
      expect(error).toEqual(new Error('Email taken'))
    }
  })
})
