import Vue from 'vue'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import SignupAndLoginPage from '../components/signup/SignupAndLoginPage'
import HomePage from '../components/home/HomePage'

Vue.use(Router)
Vue.use(Vuetify)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      component: SignupAndLoginPage,
      props: { HandleType: 'login' }
    },
    {
      path: '/signup',
      component: SignupAndLoginPage,
      props: { HandleType: 'signup' }
    },
    {
      path: '/auth3rd/:provider/callback',
      component: SignupAndLoginPage,
      props: { HandleType: 'auth' }
    },
    { path: '/', component: HomePage },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
})
