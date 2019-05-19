<template>
  <v-app dense>
    <v-card color="#eceff1"
            flat
            height='100%'
            :style="{'overflow-y':'hidden'}"
            tile>
      <v-toolbar dense
                 flat
                 color="white">
        <img :src="require('@/assets/logo.png')"
             @click="goto('/')"
             class="logo-xs"
             style="cursor: pointer" />

        <v-spacer></v-spacer>

        <el-dropdown v-if="isLogin"
                     size="medium"
                     type="primary">
          <v-avatar size="50"
                    color="white">
            <font-awesome-icon :icon="['fa','user-md']"
                               size="lg"/>
          </v-avatar>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>Profile</el-dropdown-item>
            <el-dropdown-item>设置</el-dropdown-item>
            <el-dropdown-item @click.native="logout()">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button v-else
                   type="primary"
                   size="mini"
                   @click="goto('/login')"
                   plain>登录</el-button>

      </v-toolbar>
      <router-view></router-view>
    </v-card>
    <v-footer app
              color="grey lighten-3"
              class="justify-center">si9ma &copy; {{ new Date().getFullYear() }}
      <v-btn v-for="(icon,key) in icons"
             :key="key"
             class="mx-3"
             dark
             :href="icon.link"
             icon>
        <v-icon color="black"
                size="20px">{{ icon.icon }}</v-icon>
      </v-btn>
    </v-footer>
  </v-app>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
import { AuthHeader } from './service/auth'
import { GetUserInfo } from './service/user'

export default {
  name: 'App',
  data: () => ({
    appName: process.env.APP_NAME,
    icons: [
      { icon: 'fab fa-github', link: 'https://github.com/si9ma' }
    ]
  }),
  computed: {
    isLogin: function () {
      console.log('change')
      return !_.isEmpty(this.$store.state.userInfo)
    }
  },
  created () {
    var currentUrl = window.location.pathname
    // skip auth3rd page
    if (!_.includes(currentUrl, '/auth3rd/')) {
      var user = GetUserInfo(this)
      if (_.isEmpty(user)) {
        this.$router.push('/login') // if user info not exist , login
      }
    }
  },
  methods: {
    goto (target) {
      this.$router.push(target)
    },
    logout () {
      // logout api
      axios({
        url: process.env.API_URL + '/logout',
        method: 'get',
        headers: AuthHeader()
      })
        .then((response) => {
          // save token
          console.log('logout successful!')
        })
        .catch((error) => {
          console.log('logout successful!')
          console.log(error)
        })
      this.$store.commit('updateUserInfo', {})
      localStorage.setItem('jwt', '{}') // clear jwt
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="css">
@import 'assets/css/css.css';
</style>
