import { action, state, createStore, computed } from 'usm-mobx'

class UserStore {
  @state
  authenticatedUser: object = {}

  @action
  setUser(newUser: object) {
    console.log(newUser)
    Object.assign(this.authenticatedUser, newUser)
    localStorage.setItem('authenticated-user', JSON.stringify(newUser))
  }

  @action
  removeUser() {
    localStorage.removeItem('authenticated-user')
    this.authenticatedUser = {}
  }

  @computed
  get isAuthenticated() {
    return Object.keys(this.authenticatedUser).length !== 0
  }
}

const userStore = new UserStore()

createStore({
  modules: [userStore]
})

export { userStore }
