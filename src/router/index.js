import VueRouter from 'vue-router'
import routes from './routes'
import store from '../store'
import _ from 'lodash'
import { GetUserInfo } from '@/service/user'

// configure router
const router = new VueRouter({
  mode: 'hash',
  routes, // short for routes: routes
  linkExactActiveClass: 'active',
  scrollBehavior: to => {
    if (to.hash) {
      return { selector: to.hash }
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  var jwt = localStorage.getItem('jwt')
  if (_.isEmpty(store.state.userInfo && _.isEmpty(jwt))) {
    // if user info is empty and jwt exist, get user info
    GetUserInfo()
  }
  next()
})

export default router
