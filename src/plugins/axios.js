import axios from 'axios'
import router from '../router/index'
import Vue from 'vue'
import {ExtractJson} from '@/service/util'

const http = axios.create()

// http response intercept
http.interceptors.response.use(
  response => {
    return response
  },
  error => {
    let resp = error.response

    // we should filter profile get request,
    // because we get profile when create login component,
    // if we don't filter this request, i will lead to recursion
    let filterProfileRequest =
      resp.config.method === 'get' &&
      resp.config.url === Vue.prototype.$gbl.apiURL + '/profile'

    if (resp.status === 401 && !filterProfileRequest) {
      let json = ExtractJson(error.response)
      // just filter 40100
      if (json && json.error.code == 40100) {
        console.log(Vue.prototype.$gbl.apiURL)
        Vue.prototype.$gbl.alert('danger', '你还未登录，请登录')
        return router.push({
          path: '/login',
          query: {redirect: router.currentRoute.fullPath,nocheck: '1'}
        })
      }
    }
    return Promise.reject(error)
  }
)

export default {
  install(Vue) {
    Vue.prototype.$axios = http
  }
}
