<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text"
               v-model="username"
               name="username"
               class="form-control"
               :class="{ 'is-invalid': submitted && !username }" />
        <div v-show="submitted && !username"
             class="invalid-feedback">Username is required</div>
      </div>
      <div class="form-group">
        <label htmlFor="password">Password</label>
        <input type="password"
               v-model="password"
               name="password"
               class="form-control"
               :class="{ 'is-invalid': submitted && !password }" />
        <div v-show="submitted && !password"
             class="invalid-feedback">Password is required</div>
      </div>
      <div class="form-group">
        <button class="btn btn-primary"
                :disabled="loggingIn">Login</button>
        <img v-show="loggingIn"
             src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
      </div>
    </form>
  </div>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
import {getUserInfo} from '../../service'

export default {
  data () {
    return {
      username: '',
      password: '',
      submitted: false
    }
  },
  computed: {
    loggingIn () {
      return !_.isEmpty(this.$store.state.userInfo)
    }
  },
  methods: {
    login (e) {
      this.submitted = true
      const { username, password } = this
      axios({
        url: process.env.API_URL + '/login',
        method: 'post',
        data: {
          username,
          password
        }
      })
        .then((response) => {
          // save token
          console.log('login successful!')
          localStorage.setItem('jwt', JSON.stringify(response.data))
          getUserInfo(this)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>
