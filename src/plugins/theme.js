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
        },
        tableTheme({ row, column, rowIndex, columnIndex }) {
          if (this.isDark) {
            return {
              backgroundColor: '#27293d',
              width: '100%',
              color: 'rgba(255, 255, 255, 0.8)',
              'border-color': 'rgba(255,255,255,0.05)'
            }
          } else {
            return { backgroundColor: 'white', width: '100%', color: '#1d253b' }
          }
        }
      }
    })

    Vue.prototype.$theme = theme
  }
}
