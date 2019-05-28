import {AuthHeader} from "./auth";
import {ExtractJson} from "./util";
import Vue from 'vue'

export function GetAllProblems() {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/problems',
      headers: AuthHeader(),
      params: {
        page: 1,
        page_size: 3000
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error)
          Vue.prototype.$gbl.alert('danger', '获取试题出错')
        }
        reject(error)
      })
  })
}

export function GetAllTags() {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/tags',
      params: {
        page: 1,
        page_size: 3000
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error.response)
          Vue.prototype.$gbl.alert('danger', '获取tag出错')
        }
        reject(error)
      })
  })
}

export function GetAllCatalogs() {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/catalogs',
      params: {
        page: 1,
        page_size: 3000
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error.response)
          Vue.prototype.$gbl.alert('danger', '获取分类出错')
        }
        reject(error)
      })
  })
}

export function GetAllGroups() {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/groups',
      headers: AuthHeader(),
      params: {
        page: 1,
        page_size: 3000
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error.response)
          Vue.prototype.$gbl.alert('danger', '获取分组出错')
        }
        reject(error)
      })
  })
}

export function GetAllContests() {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/contests',
      headers: AuthHeader(),
      params: {
        page: 1,
        page_size: 3000
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {

        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error.response)
          Vue.prototype.$gbl.alert('danger', '获取比赛出错')
        }
        reject(error)
      })
  })
}

export function GetAllSubmit(of,id,onlyDuringContest) {
  return new Promise((resolve,reject) => {
    Vue.prototype.$axios({
      method: 'get',
      url: Vue.prototype.$gbl.apiURL + '/submits',
      headers: AuthHeader(),
      params: {
        page: 1,
        page_size: 3000,
        of:of,
        id:id,
        only_during_contest: onlyDuringContest
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {

        // handle json response
        let json = ExtractJson(error.response)
        if (json) {
          console.log(json)
          Vue.prototype.$gbl.alert('danger', json.error.message)
          return
        } else {
          console.log(error.response)
          Vue.prototype.$gbl.alert('danger', '获取提交出错')
        }
        reject(error)
      })
  })
}
