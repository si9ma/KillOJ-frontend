import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {}
  },
  // Persist and rehydrate your Vuex state between page reloads.
  // plugins: [createPersistedState()],
  mutations: {
    // update user info
    updateUserInfo(state, newUserInfo) {
      state.userInfo = newUserInfo
    },
    updateTheme(state, newTheme) {
      if (state.userInfo) {
        state.userInfo.theme = newTheme
      }
    }
  }
})
