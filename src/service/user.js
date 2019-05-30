import axios from 'axios'
import isEmpty from 'lodash/isEmpty'
import {AuthHeader} from './auth'
import store from '../store'
import Vue from 'vue'

export function GetUserInfo() {
  return new Promise((resolve, reject) => {
    // if user info exist, return directly
    let user = store.state.userInfo

    if (!isEmpty(user)) {
      resolve(user)
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
        resolve(response.data)
      })
      .catch(error => {
        console.log('get user profile fail', error.response, error)
        reject(error)
      })
  });
}
