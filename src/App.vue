<template>
  <v-app dense>
    <v-card color="#eceff1"
            flat
            :style="{'overflow-y': 'hidden'}"
            height='100%'
            tile>
      <v-toolbar dense
                 flat
                 color="white">
        <v-toolbar-title @click="goHome"
                         :style="{cursor: 'pointer'}">{{appName}}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>search</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>favorite</v-icon>
        </v-btn>

      </v-toolbar>
      <main>
        <v-content>
          <v-container fluid>
            <router-view></router-view>
          </v-container>
        </v-content>
      </main>
    </v-card>
    <v-footer app
              color="grey lighten-3"
              class="justify-center">si9ma &copy; {{ new Date().getFullYear() }}
      <v-btn v-for="icon in icons"
             :key="icon"
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
import { checkLogin, getUserInfo } from './service'

export default {
  name: 'App',
  data: () => ({
    appName: process.env.APP_NAME,
    icons: [
      { icon: 'fab fa-github', link: 'https://github.com/si9ma' }
    ]
  }),
  created () {
    checkLogin(this)
    getUserInfo(this)
  },
  methods: {
    goHome () {
      this.$router.push('/')
    }
  }
}
</script>
