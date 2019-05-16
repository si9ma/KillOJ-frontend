import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userInfo: {}
  },
  mutations: {
    // update user info
    updateUserInfo (state, newUserInfo) {
      state.userInfo = newUserInfo
    }
  }
})
