import { action, state, createStore, computed } from 'usm-mobx'

const userKey = 'authenticated-user'
const tokenKey = 'access-token'

class UserStore {

  @state
  user = JSON.parse(localStorage.getItem(userKey)) ?? {}

  @action
  setUser(user: {}, accessToken = '') {
    this.user = user
    localStorage.setItem(userKey, JSON.stringify(user))
    localStorage.setItem(tokenKey, accessToken)
  }

  @action
  removeUser() {
    this.user = {}
    localStorage.removeItem(userKey)
    localStorage.removeItem(tokenKey)
  }

  @computed
  get isAuthenticated() {
    return Object.keys(this.user).length !== 0
  }

  @computed
  get isAdmin() {
    return this.user?.role === 'ROLE_ADMIN'
  }

  @computed
  get isDriver() {
    return this.user?.role === 'ROLE_DRIVER'
  }

  @computed
  get isRider() {
    return this.user?.role === 'ROLE_RIDER'
  }

  accessToken() {
    return localStorage.getItem(tokenKey)
  }

}

const userStore = new UserStore()

createStore({
  modules: [userStore]
})

export { userStore }
