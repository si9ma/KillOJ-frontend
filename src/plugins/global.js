import _ from 'lodash'

// global variable
export default {
  install(Vue) {
    let global = new Vue({
      data() {
        return {
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
      computed: {
        apiURL() {
          if (_.includes('$BACKEND_URL','BACKEND_URL')) { // env variable not be replaced
            return  'http://127.0.0.1/api'
          }else {
            return '$BACKEND_URL'
          }
        },
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
