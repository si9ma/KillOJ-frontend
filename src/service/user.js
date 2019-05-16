import axios from 'axios'
import { authHeader } from './auth'

export function getUserInfo () {
  // get profile
  axios({
    method: 'get',
    url: process.env.API_URL + '/profile',
    headers: authHeader()
  })
    .then(response => {
      this.$store.commit('updateUserInfo', response.data)
      return response.data
    })
    .catch(function (error) {
      // handle error
      console.log('get user profile fail', error)
    })
}
