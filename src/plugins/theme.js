import store from '../store'
import isEmpty from 'lodash/isEmpty'
import {AuthHeader, ExtractJson} from "../service";

export default {
  install(Vue) {
    let theme = new Vue({
      data: {
        isDark: true,
        sidebarBG: 'blue',
        isRTL: false
      },
      computed: {
        userConfig() {
          if (store.state.userInfo.theme) {
            return store.state.userInfo.theme
          }

          return null
        }
      },
      watch: {
        userConfig(newVal, oldVal) {
          if (newVal && newVal.theme) {
            this.isDark = newVal.theme === 0
            this.sidebarBG = newVal.sidebar_bg
            this.isRTL = newVal.direction === 1
          }

          // when user login
          if (!oldVal && newVal) {
            this.modifyBodyStyle()
            if (this.isRTL && !this.$rtl.isRTL) {
              this.$rtl.enableRTL()
            }else if (!this.isRTL && this.$rtl.isRTL) {
              this.$rtl.disableRTL()
            }
          }
        }
      },
      methods: {
        changeTheme() {
          this.isDark = !this.isDark
          this.modifyBodyStyle()
          this.submit()
        },
        changeRTL(val) {
          // update only when change
          if (this.isRTL !== val) {
            this.isRTL = val
            this.submit()
          }
        },
        modifyBodyStyle() {
          const el = document.body
          const className = 'white-content'
          if (this.isDark) {
            el.classList.remove(className)
          } else {
            el.classList.add(className)
          }
        },
        changeSidebar(bg) {
          this.sidebarBG = bg
          this.submit()
        },
        submit() {
          if (isEmpty(store.state.userInfo)) {
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
              direction: this.isRTL ? 1 : 0
            }
          }).then(response => {
            this.$gbl.alert('success', '修改主题成功')
            store.commit('updateTheme', response.data)
          }).catch(error => {
            let json = ExtractJson(error.response)
            if (json) {
              this.$gbl.alert('danger', json.error.msg)
            } else {
              this.$gbl.alert('danger', '修改主题出错')
            }
          })
        },
        tableTheme({row, column, rowIndex, columnIndex}) {
          if (this.isDark) {
            return {
              backgroundColor: '#27293d',
              width: '100%',
              color: 'rgba(255, 255, 255, 0.8)',
              'border-color': 'rgba(255,255,255,0.05)',
              'padding-top': '6px',
              'padding-bottom': '6px'
            }
          } else {
            return {
              backgroundColor: 'white', width: '100%', color: '#1d253b',
              'padding-top': '6px',
              'padding-bottom': '6px'
            }
          }
        }
      }
    })

    Vue.prototype.$theme = theme
  }
}
