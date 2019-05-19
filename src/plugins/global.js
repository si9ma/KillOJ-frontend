// global variable
export default {
  install(Vue) {
    let global = new Vue({
      data() {
        return {
          apiURL: 'http://127.0.0.1/api'
        }
      }
    })

    Vue.prototype.$gbl = global
  }
}
