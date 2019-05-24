<template>
  <div class="row">
    <div class="col-md-8">
      <edit-profile-form :user="user">
      </edit-profile-form>
    </div>
    <div class="col-md-4">
      <user-card :user="user"></user-card>
    </div>
  </div>
</template>
<script>
  import EditProfileForm from './Profile/EditProfileForm';
  import UserCard from './Profile/UserCard'
  import {GetUserInfo} from '@/service/user'

  export default {
    components: {
      EditProfileForm,
      UserCard
    },
    data() {
      return {
        user: {}
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
    }
  }
</script>
<style>
</style>
