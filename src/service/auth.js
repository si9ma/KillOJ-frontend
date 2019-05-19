import axios from 'axios'

export function AuthHeader () {
  // return authorization header with jwt token
  let jwt = JSON.parse(localStorage.getItem('jwt'))

  if (jwt && jwt.token) {
    return { Authorization: 'Bearer ' + jwt.token }
  } else {
    return {}
  }
}

export function IsTokenEmpty () {
  let jwt = JSON.parse(localStorage.getItem('jwt'))

  if (jwt && jwt.token) {
    return false
  }

  return true
}

export function RefreshToken (t) {
  if (IsTokenEmpty()) {
    t.$router.push('/login')
  }

  axios({
    url: process.env.API_URL + '/auth/refresh_token',
    method: 'get',
    headers: AuthHeader()
  })
    .then(response => {
      // save token
      console.log('refresh token success')
      localStorage.setItem('jwt', JSON.stringify(response.data))
      return true // refresh token success
    })
    .catch(error => {
      // handle json response
      console.log('refresh token fail', error.response)
      t.$router.push('/') // should login
    })
}
