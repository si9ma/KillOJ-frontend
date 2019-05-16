import _ from 'lodash'

export function authHeader () {
  // return authorization header with jwt token
  let jwt = JSON.parse(localStorage.getItem('jwt'))

  console.log(jwt)
  if (jwt && jwt.token) {
    return { 'Authorization': 'Bearer ' + jwt.token }
  } else {
    return {}
  }
}

export function checkLogin (t) {
  // get user info from store
  let user = t.$store.state.userInfo

  if (_.isEmpty(user)) {
    t.$router.push('/login')
  }
}
