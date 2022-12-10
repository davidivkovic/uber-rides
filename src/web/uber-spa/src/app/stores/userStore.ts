import { action, state, createStore, computed, watch } from 'usm-mobx'
import { connect, disconnect } from '@app/api/ws'

const userKey = 'authenticated-user'
const tokenKey = 'access-token'

class UserStore {

  @state
  user = JSON.parse(localStorage.getItem(userKey)) ?? {}

  constructor() {
    this.user?.id && connect(this.accessToken())
    watch(this, () => this.user, (curr, prev) => {
      if (curr?.id) connect(this.accessToken())
      else disconnect()
    })
  }

  @action
  setUser(user: {}, accessToken = '') {
    localStorage.setItem(userKey, JSON.stringify(user))
    localStorage.setItem(tokenKey, accessToken)
    this.user = user
  }

  @action
  removeUser() {
    localStorage.removeItem(userKey)
    localStorage.removeItem(tokenKey)
    this.user = {}
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
