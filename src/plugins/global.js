// global variable
export default {
  install(Vue) {
    let global = new Vue({
      data() {
        return {
          apiURL: 'http://127.0.0.1/api',
          mdtoolbars: {
            bold: true,
            italic: true,
            underline: true,
            strikethrough: true,
            mark: true,
            quote: true,
            ol: true,
            ul: true,
            code: true,

            trash: true,

            subfield: true,
          }
        }
      },
      methods: {
        // alert at top right
        alert(type,msg) {
          this.$notify({
            message: msg,
            icon: 'tim-icons icon-bell-55',
            horizontalAlign: 'right',
            verticalAlign: 'top',
            type: type,
            timeout: 10000 // 10s
          })
        }
      }
    })

    Vue.prototype.$gbl = global
  }
}
