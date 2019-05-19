export default {
  install(Vue) {
    let theme = new Vue({
      data() {
        return {
          isDark: true,
          sidebarBG: 'blue'
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
        },
        changeSidebar(bg) {
          this.sidebarBG = bg
        }
      }
    })

    Vue.prototype.$theme = theme
  }
}
