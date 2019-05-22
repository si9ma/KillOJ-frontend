import store from '../store'
import _ from 'lodash'
import {AuthHeader, ExtractJson} from "../service";

export default {
  install(Vue) {
    let theme = new Vue({
      data: {
        isDarkLocal: true,
        sidebarBGLocal: 'blue'
      },
      computed: {
        isDark: {
          get() {
            if (!_.isEmpty(store.state.userInfo)) {
              return store.state.userInfo.theme.theme === 0
            }

            return this.isDarkLocal // if user no login, use local variable
          },
          set(value) {
            if (!_.isEmpty(store.state.userInfo)) {
              store.commit('updateTheme', value ? 0 : 1)
            }

            this.isDarkLocal = !this.isDarkLocal // if user no login, use local variable
          }
        },
        sidebarBG: {
          get() {
            if (!_.isEmpty(store.state.userInfo)) {
              return store.state.userInfo.theme.sidebar_bg
            }

            return this.sidebarBGLocal // if user no login, use local variable
          },
          set(value) {
            if (!_.isEmpty(store.state.userInfo)) {
              store.commit('updateSidebarBG', value)
            }

            this.sidebarBGLocal = value // if user no login, use local variable
          }
        }
      },
      methods: {
        changeTheme() {
          this.isDark = !this.isDark
          const el = document.body
          const className = 'white-content'
          if (this.isDark) {
            el.classList.remove(className)
          } else {
            el.classList.add(className)
          }
          this.submit()
        }
        ,
        changeSidebar(bg) {
          this.sidebarBG = bg
          this.submit()
        }
        ,
        submit() {
          if (_.isEmpty(store.state.userInfo)) {
            return // if user no login, don't submit
          }

          // change theme
          this.$axios({
            url: this.$gbl.apiURL + '/theme',
            method: 'post',
            headers: AuthHeader(),
            data: {
              theme: this.isDark ? 0 : 1,
              sidebar_bg: this.sidebarBG,
            }
          }).then(response => {
            this.$gbl.alert('success', '修改主题成功')
          }).catch(error => {
            let json = ExtractJson(error.response)
            if (json) {
              this.$gbl.alert('danger', json.error.msg)
            } else {
              this.$gbl.alert('danger', '修改主题出错')
            }
          })
        }
        ,
        tableTheme({row, column, rowIndex, columnIndex}) {
          if (this.isDark) {
            return {
              backgroundColor: '#27293d',
              width: '100%',
              color: 'rgba(255, 255, 255, 0.8)',
              'border-color': 'rgba(255,255,255,0.05)'
            }
          } else {
            return {backgroundColor: 'white', width: '100%', color: '#1d253b'}
          }
        }
      }
    })

    Vue.prototype.$theme = theme
  }
}
