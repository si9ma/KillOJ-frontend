<template>
  <div>
    <div class="row">
      <contribute-board :submits="submits"/>
    </div>
    <div class="row">
      <div class="col-6">
        <user-card :user="user"/>
      </div>
      <div class="col-6">
        <submit-statistic :submits="submits"/>
      </div>
    </div>
  </div>
</template>

<script>
  import UserCard from "./Profile/UserCard";
  import SubmitStatistic from "../components/SubmitStatistic";
  import {AuthHeader, ExtractJson, GetAllSubmit} from "../service";
  import ContributeBoard from "../components/ContributeBoard";
  export default {
    name: "UserDetail",
    components: {ContributeBoard, SubmitStatistic, UserCard},
    props: {
      userid: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        user: {},
        submits: []
      }
    },
    created() {
      this.$axios({
        url: this.$gbl.apiURL + '/user/' + this.userid,
        method: 'get',
        headers: AuthHeader(),
      }).then(response => {
        this.user = response.data
      }).catch(error => {
        let json = ExtractJson(error.response)
        if (json) {
          this.$gbl.alert('danger',json.error.message)
          console.log(json)
        }else {
          this.$gbl.alert('danger','获取用户信息出错')
          console.log(error)
        }
        this.$router.push('/')
      })

      GetAllSubmit('user',this.userid,false).then(submits => {
        this.submits = submits
      })
    }
  }
</script>

<style scoped>

</style>
