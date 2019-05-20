import axios from 'axios'
import _ from 'lodash'
import { AuthHeader } from './auth'
import store from '../store'
import Vue from 'vue'

export function GetUserInfo () {
  // if user info exist, return directly
  let user = store.state.userInfo

  if (!_.isEmpty(user)) {
    return user
  }

  // get profile
  // import , this axios instance not the global instance
  axios({
    method: 'get',
    url: Vue.prototype.$gbl.apiURL + '/profile',
    headers: AuthHeader()
  })
    .then(response => {
      store.commit('updateUserInfo', response.data)
      return response.data
    })
    .catch(function (error) {
      console.log('get user profile fail', error.response, error)
    })
}
