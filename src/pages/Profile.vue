<template>
  <div>
    <div class="row">
      <contribute-board :submits="submits"/>
    </div>
    <div class="row">
      <div class="col-md-8">
        <edit-profile-form :user="user">
        </edit-profile-form>
      </div>
      <div class="col-md-4">
        <user-card :user="user"></user-card>
        <card>
          <submit-statistic :submits="submits"/>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
  import EditProfileForm from './Profile/EditProfileForm';
  import UserCard from './Profile/UserCard'
  import {GetUserInfo} from '@/service/user'
  import SubmitStatistic from "../components/SubmitStatistic";
  import {GetAllSubmit} from "../service";
  import ContributeBoard from "../components/ContributeBoard";

  export default {
    components: {
      ContributeBoard,
      SubmitStatistic,
      EditProfileForm,
      UserCard
    },
    data() {
      return {
        user: {},
        submits:[],
      }
    },
    created() {
      GetUserInfo().then((response) => {
        this.user = response
        console.log('get user info successful')
      }).catch(() => {
        this.$gbl.alert('warning', '你还未登录，请登录')
        this.$router.push({path: '/login', query: {nocheck: '1'}})
      })

      GetAllSubmit('me',1,false).then(submits => {
        this.submits = submits
      })
    }
  }
</script>
<style>
</style>
