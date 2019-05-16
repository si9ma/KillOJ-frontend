import Vue from 'vue'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import LoginPage from '../components/signup/LoginPage'
import HomePage from '../components/home/HomePage'

Vue.use(Router)
Vue.use(Vuetify)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/login', name: 'LoginPage', component: LoginPage },
    { path: '/', name: 'HomePage', component: HomePage },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
})
