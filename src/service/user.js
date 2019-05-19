import axios from 'axios'
import _ from 'lodash'
import { AuthHeader } from './auth'

export function GetUserInfo (t) {
  // if user info exist, return directly
  let user = t.$store.state.userInfo

  if (!_.isEmpty(user)) {
    return user
  }

  // get profile
  axios({
    method: 'get',
    url: process.env.API_URL + '/profile',
    headers: AuthHeader()
  })
    .then(response => {
      t.$store.commit('updateUserInfo', response.data)
      return response.data
    })
    .catch(function (error) {
      console.log('get user profile fail', error.response, error)
    })
}
