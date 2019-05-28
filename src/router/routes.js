import DashboardLayout from '@/layout/dashboard/DashboardLayout.vue'
// GeneralViews
import NotFound from '@/pages/NotFoundPage.vue'

// Admin pages
const Dashboard = () =>
  import(/* webpackChunkName: "dashboard" */ '@/pages/Dashboard.vue')
const Profile = () =>
  import(/* webpackChunkName: "common" */ '@/pages/Profile.vue')
const Notifications = () =>
  import(/* webpackChunkName: "common" */ '@/pages/Notifications.vue')
const Icons = () => import(/* webpackChunkName: "common" */ '@/pages/Icons.vue')
const Typography = () =>
  import(/* webpackChunkName: "common" */ '@/pages/Typography.vue')
const TableList = () =>
  import(/* webpackChunkName: "common" */ '@/pages/TableList.vue')
const Auth = () => import(/* webpackChunkName: "common" */ '@/pages/Auth.vue')
const UserDetail = () => import(/* webpackChunkName: "common" */ '@/pages/UserDetail.vue')
const Group = () => import(/* webpackChunkName: "common" */ '@/pages/Group.vue')
const User = () => import(/* webpackChunkName: "common" */ '@/pages/User.vue')
const Catalog = () => import(/* webpackChunkName: "common" */ '@/pages/Catalog.vue')
const Contest = () => import(/* webpackChunkName: "common" */ '@/pages/Contest.vue')
const Problems = () => import(/* webpackChunkName: "common" */ '@/pages/Problems.vue')
const Problem = () => import(/* webpackChunkName: "common" */ '@/pages/Problem.vue')
const JoinGroup = () => import(/* webpackChunkName: "common" */ '@/pages/JoinGroup.vue')
const JoinContest = () => import(/* webpackChunkName: "common" */ '@/pages/JoinContest.vue')
const Submits = () => import(/* webpackChunkName: "common" */ '@/pages/Submits.vue')

import _ from 'lodash'
import Vue from 'vue'
import {GetUserInfo} from '../service/user'

function needLogin(to, from, next) {
  GetUserInfo().then(() => {
    next()
  }).catch(() => {
    Vue.prototype.$gbl.alert('warning', '你还未登录，请登录')
    return next({
      path: '/login',
      query: {redirect: to.fullPath, nocheck: '1'}
    })
  })
}

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        beforeEnter: needLogin,
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile,
        beforeEnter: needLogin
      },
      {
        path: '/user/:userid',
        name: 'user Info',
        component: UserDetail,
        beforeEnter: needLogin,
        props: (route) => {
          const userid = Number.parseInt(route.params.userid, 10)
          if (Number.isNaN(userid)) {
            return 0
          }
          return { userid }
        }
      },
      {
        path: '/login',
        name: 'login',
        component: Auth,
        props: {HandleType: 'login'}
      },
      {
        path: '/signup',
        name: 'signup',
        component: Auth,
        props: {HandleType: 'signup'}
      },
      {
        path: '/auth3rd/:provider/callback',
        name: 'auth',
        component: Auth,
        props: {HandleType: 'auth'}
      },
      {
        path: '/groups/join/:uuid',
        name: 'join group',
        component: JoinGroup,
        beforeEnter: needLogin,
      },
      {
        path: '/groups',
        name: 'groups',
        component: Group,
        beforeEnter: needLogin,
      },
      {
        path: '/contests',
        name: 'contests',
        component: Contest,
        beforeEnter: needLogin,
      },
      {
        path: '/users',
        name: 'users',
        component: User,
        beforeEnter: needLogin,
      },
      {
        path: '/submits',
        name: 'submits',
        component: Submits,
        beforeEnter: needLogin,
      },
      {
        path: '/catalogs',
        name: 'catalogs',
        component: Catalog,
        beforeEnter: needLogin,
      },
      {
        path: '/problems',
        name: 'problems',
        component: Problems,
        beforeEnter: needLogin,
      },
      {
        path: '/problems/:problemID',
        name: 'problem',
        component: Problem,
        beforeEnter: needLogin,
        props: function (route) {
          return {
            problemID: Number(route.params.problemID),
          };
        }
      },
      {
        path: '/contests/join/:uuid',
        name: 'join contest',
        component: JoinContest,
        beforeEnter: needLogin,
      },
    ]
  },
  {path: '*', component: NotFound}
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
 function view(name) {
  var res= require('../components/Dashboard/Views/' + name + '.vue');
  return res;
};**/

export default routes
